/**
 * Tests for generateTurnPlan logic
 *
 * Validates the 3 fixes from pro player Walaoumpa's feedback:
 * 1. Color checking (can't cast UU spell with only Forest)
 * 2. ETB tapped handling (taplands don't give mana the turn they enter)
 * 3. Curve-out preference (play 3-drop on T3 instead of 1+2)
 */
import { describe, it, expect } from 'vitest'
import type { SimulatedCard, SimulatedHand, TurnPlan } from '../mulliganSimulatorAdvanced'
import {
  prepareDeckForSimulation,
  _generateTurnPlanForTest as generateTurnPlan,
} from '../mulliganSimulatorAdvanced'

// Helper to create a SimulatedCard
function land(name: string, producedMana: string[] = [], etbTapped = false): SimulatedCard {
  return {
    name,
    cmc: 0,
    isLand: true,
    manaCost: { colorless: 0, symbols: {} },
    quantity: 1,
    producedMana,
    etbTapped,
  }
}

function spell(name: string, cmc: number, symbols: Record<string, number> = {}): SimulatedCard {
  const totalPips = Object.values(symbols).reduce((a, b) => a + b, 0)
  return {
    name,
    cmc,
    isLand: false,
    manaCost: { colorless: Math.max(0, cmc - totalPips), symbols },
    quantity: 1,
  }
}

function makeHand(lands: SimulatedCard[], spells: SimulatedCard[]): SimulatedHand {
  return {
    cards: [...lands, ...spells],
    lands,
    spells,
    landCount: lands.length,
    totalCMC: spells.reduce((s, c) => s + c.cmc, 0),
  }
}

describe('prepareDeckForSimulation - enriched data', () => {
  it('should pass producedMana from DeckCard to SimulatedCard', () => {
    const cards = [
      {
        name: 'Forest',
        quantity: 1,
        manaCost: '',
        colors: [],
        isLand: true,
        producedMana: ['G'],
        cmc: 0,
      },
      {
        name: 'Scalding Tarn',
        quantity: 1,
        manaCost: '',
        colors: [],
        isLand: true,
        producedMana: ['U', 'R'],
        cmc: 0,
      },
    ]

    const deck = prepareDeckForSimulation(cards as any)
    expect(deck[0].producedMana).toEqual(['G'])
    expect(deck[1].producedMana).toEqual(['U', 'R'])
  })

  it('should set etbTapped from landMetadata', () => {
    const cards = [
      {
        name: 'Wind-Scarred Crag',
        quantity: 1,
        manaCost: '',
        colors: [],
        isLand: true,
        producedMana: ['R', 'W'],
        cmc: 0,
        landMetadata: { etbBehavior: { type: 'always_tapped' } },
      },
      {
        name: 'Steam Vents',
        quantity: 1,
        manaCost: '',
        colors: [],
        isLand: true,
        producedMana: ['U', 'R'],
        cmc: 0,
        landMetadata: { etbBehavior: { type: 'conditional' } },
      },
    ]

    const deck = prepareDeckForSimulation(cards as any)
    expect(deck[0].etbTapped).toBe(true)
    expect(deck[1].etbTapped).toBeFalsy()
  })

  it('should not set producedMana on non-land cards', () => {
    const cards = [
      {
        name: 'Lightning Bolt',
        quantity: 1,
        manaCost: '{R}',
        colors: ['R'],
        isLand: false,
        cmc: 1,
      },
    ]

    const deck = prepareDeckForSimulation(cards as any)
    expect(deck[0].producedMana).toBeUndefined()
  })
})

describe('generateTurnPlan - color checking', () => {
  it('should NOT cast a blue spell with only green mana', () => {
    // Walaoumpa case: Forest + Glacial Dragonhunt ({1}{U})
    const h = makeHand(
      [land('Forest', ['G']), land('Forest', ['G'])],
      [spell('Glacial Dragonhunt', 2, { U: 1 })]
    )
    const plans = generateTurnPlan(h, [])

    // With only Forests, we never have U — spell should never be played
    for (const p of plans) {
      expect(p.plays).not.toContain('Glacial Dragonhunt')
    }
  })

  it('should cast a blue spell once blue source is available', () => {
    const h = makeHand(
      [land('Forest', ['G']), land('Island', ['U'])],
      [spell('Glacial Dragonhunt', 2, { U: 1 })]
    )
    const plans = generateTurnPlan(h, [])

    // T2: Forest + Island = 1G + 1U = can cast {1}{U}
    expect(plans[1].plays).toContain('Glacial Dragonhunt')
  })

  it('should not cast a RR spell with only 1 red source', () => {
    const h = makeHand(
      [land('Mountain', ['R']), land('Forest', ['G'])],
      [spell('Bonecrusher Giant', 2, { R: 2 })]
    )
    const plans = generateTurnPlan(h, [])

    // Only 1 R source, need RR — can't cast
    for (const p of plans) {
      expect(p.plays).not.toContain('Bonecrusher Giant')
    }
  })
})

describe('generateTurnPlan - ETB tapped', () => {
  it('should not count tapped land mana on the turn it enters', () => {
    const h = makeHand(
      [land('Wind-Scarred Crag', ['R', 'W'], true)],
      [spell('Lightning Bolt', 1, { R: 1 })]
    )
    const plans = generateTurnPlan(h, [])

    // T1: Crag enters tapped → 0 mana available → can't cast
    expect(plans[0].manaAvailable).toBe(0)
    expect(plans[0].plays).not.toContain('Lightning Bolt')
  })

  it('should count tapped land mana on the following turn', () => {
    const h = makeHand(
      [land('Wind-Scarred Crag', ['R', 'W'], true)],
      [spell('Lightning Bolt', 1, { R: 1 })]
    )
    const plans = generateTurnPlan(h, [])

    // T2: Crag untaps → 1 mana available, has R → can cast Bolt
    expect(plans[1].manaAvailable).toBe(1)
    expect(plans[1].plays).toContain('Lightning Bolt')
  })

  it('should prefer untapped land over tapped when both in hand', () => {
    const h = makeHand(
      [land('Wind-Scarred Crag', ['R', 'W'], true), land('Mountain', ['R'])],
      [spell('Lightning Bolt', 1, { R: 1 })]
    )
    const plans = generateTurnPlan(h, [])

    // T1: Should play Mountain (untapped) → 1 mana → cast Bolt
    expect(plans[0].landDrop).toBe('Mountain')
    expect(plans[0].manaAvailable).toBe(1)
    expect(plans[0].plays).toContain('Lightning Bolt')
  })
})

describe('generateTurnPlan - curve-out preference', () => {
  it('should prefer 3-drop on T3 over 1+2 packing', () => {
    // Walaoumpa case: 2-drop and 3-drop in hand
    // T2: play 2-drop (2/2 mana)
    // T3: play 3-drop (3/3 mana) — NOT 2-drop on T3 and delay 3-drop
    const h = makeHand(
      [land('Forest', ['G']), land('Forest', ['G']), land('Forest', ['G'])],
      [
        spell('Grizzly Bears', 2, { G: 1 }), // 2-drop
        spell('Nissa, Ascended', 3, { G: 1 }), // 3-drop
      ]
    )
    const plans = generateTurnPlan(h, [])

    // T2: play 2-drop
    expect(plans[1].plays).toContain('Grizzly Bears')
    // T3: play 3-drop (not the 2-drop again, it was already played T2)
    expect(plans[2].plays).toContain('Nissa, Ascended')
  })

  it('should still pack when it makes sense (1-drop + 2-drop on T3)', () => {
    // Hand has 1-drop, 2-drop, nothing else
    // T1: 1-drop, T2: 2-drop — both played before T3
    // This tests that the curve-out doesn't prevent efficient play
    const h = makeHand(
      [land('Mountain', ['R']), land('Mountain', ['R']), land('Mountain', ['R'])],
      [spell('Goblin Guide', 1, { R: 1 }), spell('Lightning Helix', 2, { R: 1 })]
    )
    const plans = generateTurnPlan(h, [])

    expect(plans[0].plays).toContain('Goblin Guide') // T1
    expect(plans[1].plays).toContain('Lightning Helix') // T2
  })

  it('should play biggest spell first when mana allows both', () => {
    // T3 with 3 mana: 3-drop + 1-drop in hand? Play 3-drop.
    // If mana remains, play 1-drop too.
    const h = makeHand(
      [land('Mountain', ['R']), land('Mountain', ['R']), land('Mountain', ['R'])],
      [spell('Shock', 1, { R: 1 }), spell('Ball Lightning', 3, { R: 2 })]
    )
    const plans = generateTurnPlan(h, [])

    // T1: play Shock (1 mana)
    expect(plans[0].plays).toContain('Shock')
    // T3: play Ball Lightning (3 mana, RR1)
    // Not played T2 because needs 3 mana
    expect(plans[2].plays).toContain('Ball Lightning')
  })
})

describe('generateTurnPlan - land with no producedMana info', () => {
  it('should treat lands with no producedMana as colorless sources', () => {
    // Fallback: land without producedMana should still count as 1 mana
    const h = makeHand(
      [land('Unknown Land'), land('Unknown Land')],
      [spell('Sol Ring', 1, {})] // colorless spell
    )
    const plans = generateTurnPlan(h, [])

    // Unknown land = no colors but still 1 mana for colorless spells
    // Actually with empty producedMana, colorPool stays empty
    // But generic mana check passes (cmc <= manaLeft, no symbols to check)
    expect(plans[0].manaAvailable).toBe(1)
    expect(plans[0].plays).toContain('Sol Ring')
  })
})
