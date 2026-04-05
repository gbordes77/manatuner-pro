/**
 * Unit tests for Hypergeometric Distribution module
 *
 * Tests the core probability engine that powers all castability calculations.
 * Validates against known mathematical values from hypergeometric tables.
 *
 * @see src/services/castability/hypergeom.ts
 */
import { describe, expect, it } from 'vitest'
import { Hypergeom, cardsSeenByTurn, hypergeom } from '../hypergeom'

// =============================================================================
// HELPERS
// =============================================================================

/** Tolerance for floating-point comparisons */
const EPSILON = 1e-9

/**
 * Known hypergeometric PMF value computed via log-factorial method:
 *   P(X=2) where N=60, K=24, n=7, k=2
 *   = C(24,2)*C(36,5) / C(60,7)
 *   ~ 0.2694
 */
const KNOWN_PMF_N60_K24_n7_k2 = 0.2694

/**
 * Known hypergeometric PMF value computed via log-factorial method:
 *   P(X=2) where N=60, K=14, n=7, k=2
 *   = C(14,2)*C(46,5) / C(60,7)
 *   ~ 0.3230
 */
const KNOWN_PMF_N60_K14_n7_k2 = 0.323

// =============================================================================
// cardsSeenByTurn
// =============================================================================

describe('cardsSeenByTurn', () => {
  it('should return 0 for turn <= 0', () => {
    expect(cardsSeenByTurn(0, 'PLAY')).toBe(0)
    expect(cardsSeenByTurn(-1, 'DRAW')).toBe(0)
  })

  it('should return 7 on the play, turn 1 (no draw step)', () => {
    expect(cardsSeenByTurn(1, 'PLAY')).toBe(7)
  })

  it('should return 8 on the draw, turn 1 (draw step on turn 1)', () => {
    expect(cardsSeenByTurn(1, 'DRAW')).toBe(8)
  })

  it('should increment correctly for PLAY: seen = 7 + (turn - 1)', () => {
    expect(cardsSeenByTurn(2, 'PLAY')).toBe(8)
    expect(cardsSeenByTurn(3, 'PLAY')).toBe(9)
    expect(cardsSeenByTurn(4, 'PLAY')).toBe(10)
    expect(cardsSeenByTurn(7, 'PLAY')).toBe(13)
  })

  it('should increment correctly for DRAW: seen = 7 + turn', () => {
    expect(cardsSeenByTurn(2, 'DRAW')).toBe(9)
    expect(cardsSeenByTurn(3, 'DRAW')).toBe(10)
    expect(cardsSeenByTurn(4, 'DRAW')).toBe(11)
    expect(cardsSeenByTurn(7, 'DRAW')).toBe(14)
  })

  it('DRAW always sees exactly 1 more card than PLAY at same turn', () => {
    for (let t = 1; t <= 10; t++) {
      expect(cardsSeenByTurn(t, 'DRAW') - cardsSeenByTurn(t, 'PLAY')).toBe(1)
    }
  })
})

// =============================================================================
// Hypergeom class - PMF
// =============================================================================

describe('Hypergeom', () => {
  const hg = new Hypergeom(200)

  describe('pmf (Probability Mass Function)', () => {
    it('should compute correct PMF for 24 lands in 60-card deck, drawing 7, exactly 2 lands', () => {
      const p = hg.pmf(60, 24, 7, 2)
      expect(p).toBeCloseTo(KNOWN_PMF_N60_K24_n7_k2, 3)
    })

    it('should compute correct PMF for 14 lands in 60-card deck, drawing 7, exactly 2 lands', () => {
      const p = hg.pmf(60, 14, 7, 2)
      expect(p).toBeCloseTo(KNOWN_PMF_N60_K14_n7_k2, 3)
    })

    it('should return 0 for impossible k (k > K)', () => {
      // Want 5 lands but only 3 in deck
      expect(hg.pmf(60, 3, 7, 5)).toBe(0)
    })

    it('should return 0 for impossible k (k > n)', () => {
      // Want 10 lands but only drew 7 cards
      expect(hg.pmf(60, 24, 7, 10)).toBe(0)
    })

    it('should return 0 when K > N', () => {
      expect(hg.pmf(60, 70, 7, 2)).toBe(0)
    })

    it('should return 0 when n > N', () => {
      expect(hg.pmf(60, 24, 70, 2)).toBe(0)
    })

    it('should return 0 for negative inputs', () => {
      expect(hg.pmf(-1, 24, 7, 2)).toBe(0)
      expect(hg.pmf(60, -1, 7, 2)).toBe(0)
      expect(hg.pmf(60, 24, -1, 2)).toBe(0)
    })

    it('should return 1 when deck is all lands and we draw k=n', () => {
      // N=60, K=60 (all lands), n=7, k=7
      const p = hg.pmf(60, 60, 7, 7)
      expect(p).toBeCloseTo(1, 10)
    })

    it('should return 1 when N=K=n=k (trivial case)', () => {
      const p = hg.pmf(10, 10, 10, 10)
      expect(p).toBeCloseTo(1, 10)
    })

    it('should return 0 when K=0 and k>0', () => {
      expect(hg.pmf(60, 0, 7, 1)).toBe(0)
    })

    it('should return 1 when K=0 and k=0', () => {
      // No lands in deck, drawing 7, getting exactly 0 lands = certain
      const p = hg.pmf(60, 0, 7, 0)
      expect(p).toBeCloseTo(1, 10)
    })

    it('all PMF values for a given (N,K,n) should sum to 1', () => {
      const N = 60,
        K = 24,
        n = 7
      let total = 0
      for (let k = 0; k <= n; k++) {
        total += hg.pmf(N, K, n, k)
      }
      expect(total).toBeCloseTo(1, 8)
    })

    it('should always return values between 0 and 1', () => {
      const testCases = [
        [60, 24, 7, 3],
        [60, 14, 7, 2],
        [40, 17, 7, 2],
        [100, 40, 7, 3],
        [60, 1, 7, 1],
        [60, 59, 7, 6],
      ] as const

      for (const [N, K, n, k] of testCases) {
        const p = hg.pmf(N, K, n, k)
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThanOrEqual(1)
      }
    })
  })

  // ===========================================================================
  // atLeast
  // ===========================================================================

  describe('atLeast (cumulative P(X >= kMin))', () => {
    it('should return 1 when kMin <= 0', () => {
      expect(hg.atLeast(60, 24, 7, 0)).toBe(1)
      expect(hg.atLeast(60, 24, 7, -5)).toBe(1)
    })

    it('should return 0 when kMin is impossibly high', () => {
      // Need 8 lands but only drew 7 cards
      expect(hg.atLeast(60, 24, 7, 8)).toBe(0)
      // Need 25 lands but only 24 in deck
      expect(hg.atLeast(60, 24, 30, 25)).toBe(0)
    })

    it('atLeast(N, K, n, 1) for 24 lands should be very high in opening hand', () => {
      // Probability of at least 1 land in 7 cards with 24 lands in 60
      const p = hg.atLeast(60, 24, 7, 1)
      // Should be > 97% (hypergeometric: ~97.8%)
      expect(p).toBeGreaterThan(0.97)
    })

    it('should match 1 - P(X < kMin) identity', () => {
      const N = 60,
        K = 24,
        n = 10,
        kMin = 3
      const pAtLeast = hg.atLeast(N, K, n, kMin)
      const pAtMost = hg.atMost(N, K, n, kMin - 1)
      expect(pAtLeast + pAtMost).toBeCloseTo(1, 8)
    })

    it('should decrease as kMin increases', () => {
      const results: number[] = []
      for (let k = 0; k <= 7; k++) {
        results.push(hg.atLeast(60, 24, 7, k))
      }
      // Each value should be >= the next
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i]).toBeGreaterThanOrEqual(results[i + 1] - EPSILON)
      }
    })

    it('should produce reasonable probability for 2+ lands in 7 draws with 24/60', () => {
      // Well-known: ~90% chance of 2+ lands with 24 in 60
      const p = hg.atLeast(60, 24, 7, 2)
      expect(p).toBeGreaterThan(0.85)
      expect(p).toBeLessThan(0.95)
    })
  })

  // ===========================================================================
  // atMost
  // ===========================================================================

  describe('atMost (cumulative P(X <= kMax))', () => {
    it('should return 0 when kMax is below the forced minimum', () => {
      // If we draw 7 cards from a deck of 7 cards that are ALL lands, we must get 7
      expect(hg.atMost(7, 7, 7, 6)).toBeCloseTo(0, 10)
    })

    it('should return 1 when kMax >= min(K, n)', () => {
      // kMax = 7 = n, so P(X <= 7) = 1
      const p = hg.atMost(60, 24, 7, 7)
      expect(p).toBeCloseTo(1, 8)
    })

    it('atMost + atLeast complement should equal 1 for adjacent k values', () => {
      const N = 60,
        K = 24,
        n = 10
      for (let k = 0; k <= 10; k++) {
        const pAtMost = hg.atMost(N, K, n, k)
        const pAtLeast = hg.atLeast(N, K, n, k + 1)
        expect(pAtMost + pAtLeast).toBeCloseTo(1, 8)
      }
    })

    it('should increase as kMax increases', () => {
      const results: number[] = []
      for (let k = 0; k <= 7; k++) {
        results.push(hg.atMost(60, 24, 7, k))
      }
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i]).toBeLessThanOrEqual(results[i + 1] + EPSILON)
      }
    })

    it('P(at most 5 lands) should be very high with 24 lands and 7 draws', () => {
      const p = hg.atMost(60, 24, 7, 5)
      expect(p).toBeGreaterThan(0.98)
    })
  })

  // ===========================================================================
  // atLeastOneCopy
  // ===========================================================================

  describe('atLeastOneCopy', () => {
    it('should return 0 when copies = 0', () => {
      expect(hg.atLeastOneCopy(60, 0, 7)).toBe(0)
    })

    it('should return 0 when copies is negative', () => {
      expect(hg.atLeastOneCopy(60, -1, 7)).toBe(0)
    })

    it('should equal 1 - pmf(N, copies, cardsSeen, 0)', () => {
      const deckSize = 60,
        copies = 4,
        cardsSeen = 10
      const p0 = hg.pmf(deckSize, copies, cardsSeen, 0)
      const pAtLeast = hg.atLeastOneCopy(deckSize, copies, cardsSeen)
      expect(pAtLeast).toBeCloseTo(1 - p0, 10)
    })

    it('4 copies in 60-card deck, 7 cards seen: should be ~40%', () => {
      // P(at least one) for 4 copies in 60, drawing 7
      const p = hg.atLeastOneCopy(60, 4, 7)
      expect(p).toBeGreaterThan(0.35)
      expect(p).toBeLessThan(0.45)
    })

    it('should approach 1 as cardsSeen increases', () => {
      const results: number[] = []
      for (let seen = 7; seen <= 30; seen++) {
        results.push(hg.atLeastOneCopy(60, 4, seen))
      }
      // Should be monotonically non-decreasing
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i]).toBeLessThanOrEqual(results[i + 1] + EPSILON)
      }
      // Should be very high at 30 cards seen (4 copies in 60, 30 drawn ~ 94%)
      expect(results[results.length - 1]).toBeGreaterThan(0.93)
    })

    it('should return 1 when cardsSeen >= deckSize (guaranteed)', () => {
      const p = hg.atLeastOneCopy(60, 1, 60)
      expect(p).toBeCloseTo(1, 10)
    })

    it('should increase with more copies', () => {
      const p1 = hg.atLeastOneCopy(60, 1, 7)
      const p2 = hg.atLeastOneCopy(60, 2, 7)
      const p3 = hg.atLeastOneCopy(60, 3, 7)
      const p4 = hg.atLeastOneCopy(60, 4, 7)
      expect(p1).toBeLessThan(p2)
      expect(p2).toBeLessThan(p3)
      expect(p3).toBeLessThan(p4)
    })
  })

  // ===========================================================================
  // exactCopies
  // ===========================================================================

  describe('exactCopies', () => {
    it('should be an alias for pmf', () => {
      const p1 = hg.exactCopies(60, 4, 7, 2)
      const p2 = hg.pmf(60, 4, 7, 2)
      expect(p1).toBe(p2)
    })
  })

  // ===========================================================================
  // DECK SIZE VARIANTS (40, 60, 100)
  // ===========================================================================

  describe('deck size variants', () => {
    it('40-card deck (Limited): PMF should sum to 1', () => {
      const N = 40,
        K = 17,
        n = 7
      let total = 0
      for (let k = 0; k <= n; k++) {
        total += hg.pmf(N, K, n, k)
      }
      expect(total).toBeCloseTo(1, 8)
    })

    it('40-card deck: higher land density means higher P(2+ lands)', () => {
      // 17/40 vs 24/60 = both ~40% land ratio
      const p40 = hg.atLeast(40, 17, 7, 2)
      const p60 = hg.atLeast(60, 24, 7, 2)
      // With the same ratio, probabilities should be similar but not identical
      // The 40-card deck is slightly different due to hypergeometric vs binomial effects
      expect(Math.abs(p40 - p60)).toBeLessThan(0.05)
    })

    it('100-card deck (Commander): PMF should sum to 1', () => {
      const N = 100,
        K = 38,
        n = 7
      let total = 0
      for (let k = 0; k <= n; k++) {
        total += hg.pmf(N, K, n, k)
      }
      expect(total).toBeCloseTo(1, 8)
    })

    it('100-card deck: 38/100 land ratio gives similar results to 24/60 ratio', () => {
      const p100 = hg.atLeast(100, 38, 7, 2)
      const p60 = hg.atLeast(60, 24, 7, 2)
      // ~40% land ratio in both cases, results should be within 5%
      expect(Math.abs(p100 - p60)).toBeLessThan(0.05)
    })
  })

  // ===========================================================================
  // SINGLETON INSTANCE
  // ===========================================================================

  describe('singleton hypergeom instance', () => {
    it('should be usable and produce correct results', () => {
      const p = hypergeom.pmf(60, 24, 7, 3)
      expect(p).toBeGreaterThan(0)
      expect(p).toBeLessThan(1)
    })

    it('should agree with a fresh instance', () => {
      const fresh = new Hypergeom(200)
      const p1 = hypergeom.pmf(60, 24, 7, 3)
      const p2 = fresh.pmf(60, 24, 7, 3)
      expect(p1).toBe(p2)
    })
  })

  // ===========================================================================
  // NUMERICAL STABILITY
  // ===========================================================================

  describe('numerical stability', () => {
    it('should handle large population sizes without NaN or Infinity', () => {
      const hgLarge = new Hypergeom(200)
      const p = hgLarge.pmf(200, 80, 30, 10)
      expect(Number.isFinite(p)).toBe(true)
      expect(p).toBeGreaterThan(0)
      expect(p).toBeLessThan(1)
    })

    it('PMF values should never be NaN for valid inputs', () => {
      const testCases: [number, number, number, number][] = [
        [60, 24, 7, 0],
        [60, 24, 7, 7],
        [60, 1, 60, 1],
        [100, 50, 50, 25],
        [40, 17, 7, 3],
      ]

      for (const [N, K, n, k] of testCases) {
        const p = hg.pmf(N, K, n, k)
        expect(Number.isNaN(p)).toBe(false)
        expect(Number.isFinite(p)).toBe(true)
      }
    })
  })
})
