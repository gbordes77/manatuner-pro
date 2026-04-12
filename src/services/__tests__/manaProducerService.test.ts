/**
 * Ramp Taxonomy Detection Tests
 *
 * Covers `analyzeOracleForMana` — the priority-ordered regex matcher that
 * classifies each non-land card into a ManaProducerType. This is the core
 * of the K=3 acceleration engine; a regression here silently mis-counts
 * ramp in every user's castability analysis.
 *
 * Detection priority (documented in CLAUDE.md):
 *   LAND_RAMP → extra-land → LAND_FROM_HAND → LAND_AURA → LANDFALL_MANA
 *   → MANA_DOUBLER → SPAWN_SCION → ROCK → RITUAL → TREASURE
 */

import { describe, it, expect } from 'vitest'
import { analyzeOracleForMana } from '../manaProducerService'

describe('analyzeOracleForMana — taxonomy detection', () => {
  describe('LAND_RAMP (highest priority)', () => {
    it('detects Cultivate as LAND_RAMP', () => {
      const oracle =
        'Search your library for up to two basic land cards, reveal those cards, and put one onto the battlefield tapped and the other into your hand.'
      expect(analyzeOracleForMana(oracle).type).toBe('LAND_RAMP')
    })

    it('detects Rampant Growth as LAND_RAMP', () => {
      const oracle =
        'Search your library for a basic land card and put that card onto the battlefield tapped.'
      expect(analyzeOracleForMana(oracle).type).toBe('LAND_RAMP')
    })

    it('detects cross-sentence "search...land card...onto the battlefield"', () => {
      // Covers hypothetical modal spells that put a land card onto the
      // battlefield via a longer sentence chain.
      const oracle =
        'Choose one — Search your library for a creature or land card. Put the land card onto the battlefield tapped.'
      expect(analyzeOracleForMana(oracle).type).toBe('LAND_RAMP')
    })
  })

  describe('Extra land drop (additional land per turn)', () => {
    it('detects Exploration as ROCK with delay=0', () => {
      const oracle = 'You may play an additional land on each of your turns.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('ROCK')
      expect(res.delay).toBe(0)
      expect(res.amount).toBe(1)
    })

    it('detects Azusa (two additional lands)', () => {
      const oracle = 'You may play two additional lands on each of your turns.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('ROCK')
      expect(res.amount).toBe(2)
    })
  })

  describe('LAND_FROM_HAND', () => {
    it('detects Growth Spiral', () => {
      const oracle = 'Draw a card. You may put a land card from your hand onto the battlefield.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('LAND_FROM_HAND')
      expect(res.delay).toBe(0)
    })

    it('detects Arboreal Grazer', () => {
      const oracle =
        'When Arboreal Grazer enters the battlefield, you may put a land card from your hand onto the battlefield tapped.'
      expect(analyzeOracleForMana(oracle).type).toBe('LAND_FROM_HAND')
    })
  })

  describe('LAND_AURA', () => {
    it('detects Wild Growth', () => {
      const oracle =
        'Enchant land. Whenever enchanted land is tapped for mana, its controller adds an additional {G}.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('LAND_AURA')
      expect(res.delay).toBe(0)
      expect(res.amount).toBe(1)
    })

    it('detects Overgrowth (2 mana)', () => {
      const oracle =
        'Enchant land. Whenever enchanted land is tapped for mana, its controller adds {G}{G}.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('LAND_AURA')
      expect(res.amount).toBe(2)
    })
  })

  describe('LANDFALL_MANA', () => {
    it('detects Lotus Cobra', () => {
      const oracle =
        'Whenever a land enters the battlefield under your control, add one mana of any color.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('LANDFALL_MANA')
      expect(res.producesAny).toBe(true)
    })
  })

  describe('MANA_DOUBLER', () => {
    it("detects Mirari's Wake (2x)", () => {
      const oracle =
        "Creatures you control get +1/+1. Whenever you tap a land for mana, add one mana of that land's color."
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('MANA_DOUBLER')
      expect(res.doublerMultiplier).toBe(2)
    })

    it('detects Nyxbloom Ancient (3x)', () => {
      const oracle =
        'If you tap a permanent for mana, it produces three times as much of that mana instead.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('MANA_DOUBLER')
      expect(res.doublerMultiplier).toBe(3)
      expect(res.amount).toBe(2)
    })
  })

  describe('SPAWN_SCION (Eldrazi colorless tokens)', () => {
    it('detects Awakening Zone', () => {
      const oracle =
        "At the beginning of your upkeep, create a 0/1 colorless Eldrazi Spawn creature token with 'Sacrifice this creature: Add {C}.'"
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('SPAWN_SCION')
      expect(res.colorLetters).toEqual(['C'])
    })
  })

  describe('Standard producers (ROCK/DORK/RITUAL/TREASURE)', () => {
    it('detects Llanowar Elves as ROCK (tap ability)', () => {
      const oracle = '{T}: Add {G}.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('ROCK')
    })

    it('detects Dark Ritual as RITUAL (3+ mana burst)', () => {
      const oracle = 'Add {B}{B}{B}.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('RITUAL')
      expect(res.oneShot).toBe(true)
    })

    it('detects Lotus Petal as one-shot ROCK via sacrifice', () => {
      const oracle = '{T}, Sacrifice Lotus Petal: Add one mana of any color.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('ROCK')
      expect(res.producesAny).toBe(true)
    })

    it('detects Prosperous Pirates as TREASURE', () => {
      const oracle = 'When Prosperous Pirates enters the battlefield, create two Treasure tokens.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).toBe('TREASURE')
      expect(res.producesAny).toBe(true)
    })

    it('rejects Sticky Fingers (combat-conditional treasure = NOT ramp)', () => {
      const oracle =
        'Whenever enchanted creature deals combat damage to a player, create a Treasure token.'
      const res = analyzeOracleForMana(oracle)
      expect(res.type).not.toBe('TREASURE')
    })
  })

  describe('Non-producer cards (no mana generated)', () => {
    it('returns null for vanilla creatures', () => {
      const oracle = ''
      expect(analyzeOracleForMana(oracle).type).toBeNull()
    })

    it('returns null for burn spells', () => {
      const oracle = 'Lightning Bolt deals 3 damage to any target.'
      expect(analyzeOracleForMana(oracle).type).toBeNull()
    })

    it('returns null for removal spells', () => {
      const oracle = 'Destroy target creature.'
      expect(analyzeOracleForMana(oracle).type).toBeNull()
    })
  })

  describe('Detection priority ordering', () => {
    it('LAND_RAMP beats MANA_DOUBLER when both clauses exist', () => {
      // Hypothetical card that searches AND doubles
      const oracle =
        'Search your library for a basic land card and put it onto the battlefield. Whenever you tap a land for mana, add that mana.'
      expect(analyzeOracleForMana(oracle).type).toBe('LAND_RAMP')
    })
  })

  describe('Regression: empty / malformed input', () => {
    it('handles empty string', () => {
      expect(analyzeOracleForMana('').type).toBeNull()
    })

    it('handles whitespace-only string', () => {
      expect(analyzeOracleForMana('   ').type).toBeNull()
    })

    it('does not crash on suspicious input', () => {
      expect(() => analyzeOracleForMana('{{{{}}}}add')).not.toThrow()
    })
  })
})
