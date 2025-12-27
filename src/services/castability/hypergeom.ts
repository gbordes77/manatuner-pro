/**
 * Hypergeometric Distribution Utilities
 *
 * Fast hypergeometric calculations for MTG deck analysis (N <= 100).
 * Uses log-factorials for numerical stability.
 *
 * @version 1.0
 * @see docs/EXPERT_ANALYSES.md
 */

export type PlayDraw = 'PLAY' | 'DRAW'

/**
 * Calculate cards seen by a specific turn
 *
 * @param turn - The turn number (1-indexed)
 * @param playDraw - Whether on the play or draw
 * @returns Number of cards seen by that turn
 *
 * Convention:
 * - Starting hand = 7 cards
 * - PLAY: no draw on turn 1 => seen = 7 + (turn - 1)
 * - DRAW: draw on turn 1 => seen = 7 + turn
 */
export function cardsSeenByTurn(turn: number, playDraw: PlayDraw): number {
  if (turn <= 0) return 0
  return playDraw === 'PLAY' ? 7 + Math.max(0, turn - 1) : 7 + turn
}

/**
 * Build log-factorial lookup table
 */
function buildLogFactorials(maxN: number): Float64Array {
  const lf = new Float64Array(maxN + 1)
  lf[0] = 0
  for (let i = 1; i <= maxN; i++) {
    lf[i] = lf[i - 1] + Math.log(i)
  }
  return lf
}

/**
 * Hypergeometric distribution calculator
 *
 * Uses log-factorials for numerical stability with large factorials.
 * Pre-computes factorials up to maxN for performance.
 */
export class Hypergeom {
  private lf: Float64Array
  private maxN: number

  constructor(maxN: number = 200) {
    this.maxN = maxN
    this.lf = buildLogFactorials(maxN)
  }

  /**
   * Log of binomial coefficient C(n, k)
   */
  private logChoose(n: number, k: number): number {
    if (k < 0 || k > n) return -Infinity
    return this.lf[n] - this.lf[k] - this.lf[n - k]
  }

  /**
   * Probability mass function: P(X = k)
   *
   * @param N - Population size (deck size)
   * @param K - Success states in population (e.g., lands)
   * @param n - Number of draws (cards seen)
   * @param k - Desired successes
   * @returns Probability of exactly k successes
   */
  pmf(N: number, K: number, n: number, k: number): number {
    // Validate inputs
    if (N < 0 || K < 0 || n < 0) return 0
    if (K > N || n > N) return 0

    // Calculate valid range for k
    const kMin = Math.max(0, n - (N - K))
    const kMax = Math.min(K, n)
    if (k < kMin || k > kMax) return 0

    // Calculate probability using log-space for numerical stability
    const logP =
      this.logChoose(K, k) +
      this.logChoose(N - K, n - k) -
      this.logChoose(N, n)

    return Math.exp(logP)
  }

  /**
   * Cumulative probability: P(X >= kMin)
   *
   * @param N - Population size
   * @param K - Success states in population
   * @param n - Number of draws
   * @param kMin - Minimum successes needed
   * @returns Probability of at least kMin successes
   */
  atLeast(N: number, K: number, n: number, kMin: number): number {
    const kMax = Math.min(K, n)
    if (kMin <= 0) return 1
    if (kMin > kMax) return 0

    let sum = 0
    for (let k = kMin; k <= kMax; k++) {
      sum += this.pmf(N, K, n, k)
    }

    return Math.min(1, Math.max(0, sum))
  }

  /**
   * Cumulative probability: P(X <= kMax)
   *
   * @param N - Population size
   * @param K - Success states in population
   * @param n - Number of draws
   * @param kMax - Maximum successes
   * @returns Probability of at most kMax successes
   */
  atMost(N: number, K: number, n: number, kMax: number): number {
    const kMin = Math.max(0, n - (N - K))
    if (kMax < kMin) return 0

    let sum = 0
    for (let k = kMin; k <= Math.min(kMax, K, n); k++) {
      sum += this.pmf(N, K, n, k)
    }

    return Math.min(1, Math.max(0, sum))
  }

  /**
   * Probability of drawing at least one copy of a card
   *
   * @param deckSize - Total deck size
   * @param copies - Number of copies in deck
   * @param cardsSeen - Cards seen so far
   * @returns Probability of seeing at least one copy
   */
  atLeastOneCopy(deckSize: number, copies: number, cardsSeen: number): number {
    if (copies <= 0) return 0

    // P(at least 1) = 1 - P(0 copies)
    const p0 = this.pmf(deckSize, copies, cardsSeen, 0)
    return Math.min(1, Math.max(0, 1 - p0))
  }

  /**
   * Probability of exactly k copies
   *
   * @param deckSize - Total deck size
   * @param copies - Number of copies in deck
   * @param cardsSeen - Cards seen so far
   * @param k - Exact number wanted
   * @returns Probability of exactly k copies
   */
  exactCopies(deckSize: number, copies: number, cardsSeen: number, k: number): number {
    return this.pmf(deckSize, copies, cardsSeen, k)
  }
}

/**
 * Singleton instance for general use
 */
export const hypergeom = new Hypergeom(200)
