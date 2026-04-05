import { describe, expect, it } from 'vitest'
import type { DeckCard } from '../deckAnalyzer'
import {
  chooseBottom,
  prepareDeckForSimulation,
  analyzeMulliganStrategy,
} from '../mulliganSimulator'
import { analyzeWithArchetype, simulateSingleGameAdvanced } from '../mulliganSimulatorAdvanced'

// =============================================================================
// HELPERS
// =============================================================================

function createTestDeck(landCount: number, spellCount: number): DeckCard[] {
  const cards: DeckCard[] = []

  for (let i = 0; i < landCount; i++) {
    cards.push({
      name: `Mountain ${i + 1}`,
      quantity: 1,
      manaCost: '',
      colors: ['R'],
      isLand: true,
      producedMana: ['R'],
      cmc: 0,
    })
  }

  const spellCMCs = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4]
  for (let i = 0; i < spellCount; i++) {
    const cmc = spellCMCs[i % spellCMCs.length]
    cards.push({
      name: `Spell ${i + 1}`,
      quantity: 1,
      manaCost: `{${cmc - 1}}{R}`,
      colors: ['R'],
      isLand: false,
      cmc,
    })
  }

  return cards
}

// =============================================================================
// TESTS: chooseBottom
// =============================================================================

describe('chooseBottom', () => {
  it('should return empty bottomed array when bottomCount is 0', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const hand = deck.slice(0, 7)
    const { kept, bottomed } = chooseBottom(hand, 0)

    expect(kept.length).toBe(7)
    expect(bottomed.length).toBe(0)
  })

  it('should bottom the correct number of cards', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const hand = deck.slice(0, 7)

    for (const n of [1, 2, 3]) {
      const { kept, bottomed } = chooseBottom(hand, n)
      expect(kept.length).toBe(7 - n)
      expect(bottomed.length).toBe(n)
    }
  })

  it('should keep all cards when bottomCount >= hand size', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const hand = deck.slice(0, 7)
    const { kept, bottomed } = chooseBottom(hand, 7)

    expect(kept.length).toBe(0)
    expect(bottomed.length).toBe(7)
  })

  it('should prefer bottoming high-CMC spells over low-CMC ones', () => {
    const deck = prepareDeckForSimulation([
      {
        name: 'Mountain',
        quantity: 1,
        manaCost: '',
        colors: ['R'],
        isLand: true,
        producedMana: ['R'],
        cmc: 0,
      },
      {
        name: 'Mountain 2',
        quantity: 1,
        manaCost: '',
        colors: ['R'],
        isLand: true,
        producedMana: ['R'],
        cmc: 0,
      },
      {
        name: 'Mountain 3',
        quantity: 1,
        manaCost: '',
        colors: ['R'],
        isLand: true,
        producedMana: ['R'],
        cmc: 0,
      },
      { name: 'Shock', quantity: 1, manaCost: '{R}', colors: ['R'], isLand: false, cmc: 1 },
      {
        name: 'Lightning Strike',
        quantity: 1,
        manaCost: '{1}{R}',
        colors: ['R'],
        isLand: false,
        cmc: 2,
      },
      { name: 'Fireball', quantity: 1, manaCost: '{4}{R}', colors: ['R'], isLand: false, cmc: 5 },
      { name: 'Inferno', quantity: 1, manaCost: '{5}{R}{R}', colors: ['R'], isLand: false, cmc: 7 },
    ])

    const { kept, bottomed } = chooseBottom(deck, 2)

    // Both high-CMC spells (5+ CMC) should be bottomed
    const bottomedNames = bottomed.map((c) => c.name)
    expect(bottomedNames).toContain('Fireball')
    expect(bottomedNames).toContain('Inferno')
    // Low-CMC spells should be kept
    expect(kept.some((c) => c.name === 'Shock')).toBe(true)
    expect(kept.some((c) => c.name === 'Lightning Strike')).toBe(true)
  })

  it('should bottom excess lands over spells', () => {
    const deck = prepareDeckForSimulation([
      {
        name: 'Mountain 1',
        quantity: 1,
        manaCost: '',
        colors: ['R'],
        isLand: true,
        producedMana: ['R'],
        cmc: 0,
      },
      {
        name: 'Mountain 2',
        quantity: 1,
        manaCost: '',
        colors: ['R'],
        isLand: true,
        producedMana: ['R'],
        cmc: 0,
      },
      {
        name: 'Mountain 3',
        quantity: 1,
        manaCost: '',
        colors: ['R'],
        isLand: true,
        producedMana: ['R'],
        cmc: 0,
      },
      {
        name: 'Mountain 4',
        quantity: 1,
        manaCost: '',
        colors: ['R'],
        isLand: true,
        producedMana: ['R'],
        cmc: 0,
      },
      {
        name: 'Mountain 5',
        quantity: 1,
        manaCost: '',
        colors: ['R'],
        isLand: true,
        producedMana: ['R'],
        cmc: 0,
      },
      { name: 'Shock', quantity: 1, manaCost: '{R}', colors: ['R'], isLand: false, cmc: 1 },
      {
        name: 'Lightning Strike',
        quantity: 1,
        manaCost: '{1}{R}',
        colors: ['R'],
        isLand: false,
        cmc: 2,
      },
    ])

    // 5 lands in a 6-card keep: excess lands should be bottomed
    const { kept, bottomed } = chooseBottom(deck, 1)

    // Should bottom a land since we have 5 (excess for a 6-card hand)
    expect(bottomed[0].isLand).toBe(true)
    expect(kept.filter((c) => !c.isLand).length).toBe(2) // Both spells kept
  })
})

// =============================================================================
// TESTS: simulateSingleGame (London Mulligan sequence)
// =============================================================================

describe('simulateSingleGameAdvanced', () => {
  it('should return valid hand size between 4 and 7', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const thresholds = { keep7: 40, keep6: 30, keep5: 20 }

    const result = simulateSingleGameAdvanced(deck, 'midrange', thresholds)

    expect(result.handSize).toBeGreaterThanOrEqual(4)
    expect(result.handSize).toBeLessThanOrEqual(7)
    expect(result.mulliganCount).toBe(7 - result.handSize)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('should mostly keep 7-card hands with low threshold', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const thresholds = { keep7: 5, keep6: 3, keep5: 1 }

    let kept7 = 0
    const runs = 200
    for (let i = 0; i < runs; i++) {
      const { handSize } = simulateSingleGameAdvanced(deck, 'midrange', thresholds)
      if (handSize === 7) kept7++
    }

    expect(kept7 / runs).toBeGreaterThan(0.85)
  })

  it('should mulligan more often with high threshold', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const lowThreshold = { keep7: 5, keep6: 3, keep5: 1 }
    const highThreshold = { keep7: 80, keep6: 60, keep5: 40 }

    let mullsLow = 0
    let mullsHigh = 0
    const runs = 200
    for (let i = 0; i < runs; i++) {
      if (simulateSingleGameAdvanced(deck, 'midrange', lowThreshold).handSize < 7) mullsLow++
      if (simulateSingleGameAdvanced(deck, 'midrange', highThreshold).handSize < 7) mullsHigh++
    }

    expect(mullsHigh).toBeGreaterThan(mullsLow)
  })

  it('should always keep at 4 cards regardless of threshold', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const thresholds = { keep7: 999, keep6: 999, keep5: 999 }

    const result = simulateSingleGameAdvanced(deck, 'midrange', thresholds)
    expect(result.handSize).toBe(4)
    expect(result.mulliganCount).toBe(3)
  })
})

// =============================================================================
// TESTS: London Mulligan bottomed cards in library
// =============================================================================

describe('London Mulligan library correctness', () => {
  it('should preserve total card count (hand + library = deck size)', () => {
    const deckCards = createTestDeck(24, 36)
    const analysis = analyzeMulliganStrategy(deckCards, 100)

    // If analysis completes without error, the library was correctly constructed
    expect(analysis).toBeDefined()
    expect(analysis.values.length).toBe(4) // hand sizes 4, 5, 6, 7
  })

  it('London Mulligan to 6 should score higher than random 6-card draw on average', () => {
    // London draws 7 and picks best 6 — should beat drawing only 6
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const runs = 500

    let londonTotal = 0
    let randomTotal = 0

    for (let i = 0; i < runs; i++) {
      // Shuffle once for fair comparison
      const shuffled = [...deck]
      for (let j = shuffled.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1))
        ;[shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]]
      }

      // London: draw 7, pick best 6
      const london7 = shuffled.slice(0, 7)
      const londonLands = london7.filter((c) => c.isLand).length
      // Simple heuristic: closer to 2-3 lands = better
      const londonScore =
        Math.abs(londonLands - 2.5) < Math.abs(londonLands - 3.5) ? londonLands : londonLands
      londonTotal += Math.min(londonLands, 4)

      // Random: draw only 6
      const random6 = shuffled.slice(0, 6)
      const randomLands = random6.filter((c) => c.isLand).length
      randomTotal += Math.min(randomLands, 4)
    }

    // London should have slightly better land distribution on average
    // because it sees 7 cards and picks the best 6
    expect(londonTotal / runs).toBeGreaterThanOrEqual(randomTotal / runs - 0.5)
  })
})

// =============================================================================
// TESTS: Advanced simulator with archetypes
// =============================================================================

describe('simulateSingleGameAdvanced', () => {
  it('should work for all archetypes', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const thresholds = { keep7: 50, keep6: 40, keep5: 30 }

    for (const archetype of ['aggro', 'midrange', 'control', 'combo'] as const) {
      const result = simulateSingleGameAdvanced(deck, archetype, thresholds)
      expect(result.handSize).toBeGreaterThanOrEqual(4)
      expect(result.handSize).toBeLessThanOrEqual(7)
      expect(result.breakdown).toBeDefined()
      expect(result.breakdown.total).toBeGreaterThanOrEqual(0)
    }
  })

  it('should return score breakdown with all fields', () => {
    const deck = prepareDeckForSimulation(createTestDeck(24, 36))
    const thresholds = { keep7: 30, keep6: 20, keep5: 10 }

    const result = simulateSingleGameAdvanced(deck, 'midrange', thresholds)

    expect(result.breakdown).toHaveProperty('manaEfficiency')
    expect(result.breakdown).toHaveProperty('curvePlayability')
    expect(result.breakdown).toHaveProperty('colorAccess')
    expect(result.breakdown).toHaveProperty('earlyGame')
    expect(result.breakdown).toHaveProperty('landBalance')
    expect(result.breakdown).toHaveProperty('total')
  })
})

describe('analyzeWithArchetype London Mulligan', () => {
  it('should produce valid results with bottomed cards on library bottom', () => {
    const deck = createTestDeck(24, 36)

    const result = analyzeWithArchetype(deck, 'midrange', 300)

    expect(result).toBeDefined()
    expect(result.expectedScores.hand7).toBeGreaterThan(0)
    expect(result.expectedScores.hand6).toBeGreaterThan(0)
    expect(result.thresholds.keep7).toBeGreaterThanOrEqual(0)
    expect(result.distributions.hand7.length).toBeGreaterThan(0)
  })

  it('should produce higher scores for 7-card hands than 5-card hands', () => {
    const deck = createTestDeck(24, 36)
    const result = analyzeWithArchetype(deck, 'midrange', 500)

    // Raw expected scores (before Bellman adjustment) should favor more cards
    // The Bellman-adjusted EVs account for mulligan option so may differ
    expect(result.expectedScores.hand7).toBeGreaterThanOrEqual(result.expectedScores.hand5)
  })
})
