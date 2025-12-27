/**
 * Mana Producer Seed Data for ManaTuner Pro
 *
 * This file contains commonly played mana-producing cards with their
 * metadata pre-defined. This serves as an initial cache to avoid
 * Scryfall API calls for the most common producers.
 *
 * Categories included:
 * - Mana Dorks (creatures that tap for mana)
 * - Mana Rocks (artifacts that tap for mana)
 * - Rituals (one-shot mana spells)
 * - One-Shots (single-use artifacts)
 *
 * @version 1.0
 * @see docs/EXPERT_ANALYSES.md
 */

import type { ManaProducerDef } from '../types/manaProducers'
import { COLOR_MASK } from '../types/manaProducers'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Create a color mask from color letters */
function mask(...colors: Array<'W' | 'U' | 'B' | 'R' | 'G' | 'C'>): number {
  return colors.reduce((m, c) => m | COLOR_MASK[c], 0)
}

/** All colors mask */
const ANY_COLOR = mask('W', 'U', 'B', 'R', 'G')

/** All colors including colorless */
const ANY_COLOR_C = mask('W', 'U', 'B', 'R', 'G', 'C')

// =============================================================================
// SEED DATA
// =============================================================================

/**
 * Seed data for commonly played mana producers.
 * Organized by category for maintainability.
 */
const SEED_DATA: Record<string, Omit<ManaProducerDef, 'name'>> = {
  // ===========================================================================
  // MANA DORKS - Green 1-drops
  // ===========================================================================

  'Llanowar Elves': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.75
  },

  'Elvish Mystic': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.75
  },

  // ===========================================================================
  // MANA ENHANCERS - Cards that boost other dorks
  // ===========================================================================

  'Badgermole Cub': {
    type: 'ENHANCER',
    castCostGeneric: 1,
    castCostColors: { G: 1 },
    delay: 1, // Summoning sickness (creature)
    isCreature: true,
    producesAmount: 0, // Doesn't produce mana itself
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.70, // High-value target
    // ENHANCER-specific: adds +1G when any creature taps for mana
    enhancerBonus: 1,
    enhancerBonusMask: mask('G'),
    enhancesTypes: ['DORK']
  },

  // 2-CMC Dorks

  'Fyndhorn Elves': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.75
  },

  'Elves of Deep Shadow': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('B'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.75
  },

  'Arbor Elf': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1, // Untaps forest, effectively 1 mana
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.75
  },

  'Boreal Druid': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.75
  },

  // ===========================================================================
  // MANA DORKS - Premium 1-drops
  // ===========================================================================

  'Birds of Paradise': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.80
  },

  'Noble Hierarch': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('W', 'U', 'G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.78
  },

  'Ignoble Hierarch': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('B', 'R', 'G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.78
  },

  'Deathrite Shaman': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { B: 1 }, // Can be cast with G too, simplified
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('B', 'G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.78
  },

  'Delighted Halfling': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR_C,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.80
  },

  'Avacyn\'s Pilgrim': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('W'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.75
  },

  // ===========================================================================
  // MANA DORKS - 2-drops
  // ===========================================================================

  'Bloom Tender': {
    type: 'DORK',
    castCostGeneric: 1,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 2, // Average in multicolor decks
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.70
  },

  'Priest of Titania': {
    type: 'DORK',
    castCostGeneric: 1,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 2, // Scales with elves
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.70
  },

  'Sylvan Caryatid': {
    type: 'DORK',
    castCostGeneric: 1,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.95 // Hexproof
  },

  'Paradise Druid': {
    type: 'DORK',
    castCostGeneric: 1,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.90 // Hexproof while untapped
  },

  'Incubation Druid': {
    type: 'DORK',
    castCostGeneric: 1,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.70
  },

  'Wall of Roots': {
    type: 'DORK',
    castCostGeneric: 1,
    castCostColors: { G: 1 },
    delay: 0, // No summoning sickness (uses counters)
    isCreature: true,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.85 // Defender, less targeted
  },

  // ===========================================================================
  // MANA DORKS - 3+ drops
  // ===========================================================================

  'Selvala, Heart of the Wilds': {
    type: 'DORK',
    castCostGeneric: 1,
    castCostColors: { G: 2 },
    delay: 1,
    isCreature: true,
    producesAmount: 3, // Variable, assume medium
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.60
  },

  'Joraga Treespeaker': {
    type: 'DORK',
    castCostGeneric: 0,
    castCostColors: { G: 1 },
    delay: 1,
    isCreature: true,
    producesAmount: 2, // After level up
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.75
  },

  // ===========================================================================
  // MANA ROCKS - 0-cost (Power)
  // ===========================================================================

  'Mox Diamond': {
    type: 'ROCK',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Chrome Mox': {
    type: 'ROCK',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Mox Opal': {
    type: 'ROCK',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Mox Amber': {
    type: 'ROCK',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Mana Crypt': {
    type: 'ROCK',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.99
  },

  'Jeweled Lotus': {
    type: 'ONE_SHOT',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 3, // Commander only
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: true,
    survivalBase: 1.0
  },

  // ===========================================================================
  // MANA ROCKS - 1-cost
  // ===========================================================================

  'Sol Ring': {
    type: 'ROCK',
    castCostGeneric: 1,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.99
  },

  'Mana Vault': {
    type: 'ROCK',
    castCostGeneric: 1,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 3,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false, // Doesn't untap normally, but reusable
    survivalBase: 0.99
  },

  // ===========================================================================
  // MANA ROCKS - 2-cost
  // ===========================================================================

  'Arcane Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Fellwar Stone': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Mind Stone': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Thought Vessel': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Grim Monolith': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 3,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.99
  },

  'Liquimetal Torque': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Prismatic Lens': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR_C,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  // ===========================================================================
  // SIGNETS (2-cost, activation tax)
  // ===========================================================================

  'Azorius Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('W', 'U'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Dimir Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('U', 'B'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Rakdos Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('B', 'R'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Gruul Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('R', 'G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Selesnya Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('G', 'W'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Orzhov Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('W', 'B'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Izzet Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('U', 'R'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Golgari Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('B', 'G'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Boros Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('R', 'W'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Simic Signet': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 2,
    activationTax: 1,
    producesMask: mask('G', 'U'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  // ===========================================================================
  // TALISMANS (2-cost, pain for colored)
  // ===========================================================================

  'Talisman of Progress': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('W', 'U', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Dominance': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('U', 'B', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Indulgence': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('B', 'R', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Impulse': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('R', 'G', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Unity': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('G', 'W', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Hierarchy': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('W', 'B', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Creativity': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('U', 'R', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Resilience': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('B', 'G', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Conviction': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('R', 'W', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Talisman of Curiosity': {
    type: 'ROCK',
    castCostGeneric: 2,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('G', 'U', 'C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  // ===========================================================================
  // MANA ROCKS - 3-cost
  // ===========================================================================

  'Coalition Relic': {
    type: 'ROCK',
    castCostGeneric: 3,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1, // Or 2 with charge
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Chromatic Lantern': {
    type: 'ROCK',
    castCostGeneric: 3,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Commander\'s Sphere': {
    type: 'ROCK',
    castCostGeneric: 3,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: false,
    survivalBase: 0.98
  },

  'Worn Powerstone': {
    type: 'ROCK',
    castCostGeneric: 3,
    castCostColors: {},
    delay: 1, // ETB tapped
    isCreature: false,
    producesAmount: 2,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  'Basalt Monolith': {
    type: 'ROCK',
    castCostGeneric: 3,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 3,
    activationTax: 0,
    producesMask: mask('C'),
    producesAny: false,
    oneShot: false,
    survivalBase: 0.98
  },

  // ===========================================================================
  // ONE-SHOT ARTIFACTS
  // ===========================================================================

  'Lotus Petal': {
    type: 'ONE_SHOT',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 1,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: true,
    survivalBase: 1.0
  },

  'Lion\'s Eye Diamond': {
    type: 'ONE_SHOT',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false,
    producesAmount: 3,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: true,
    survivalBase: 1.0
  },

  'Lotus Bloom': {
    type: 'ONE_SHOT',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 3, // Suspend 3
    isCreature: false,
    producesAmount: 3,
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: true,
    survivalBase: 1.0
  },

  // ===========================================================================
  // RITUALS
  // ===========================================================================

  'Dark Ritual': {
    type: 'RITUAL',
    castCostGeneric: 0,
    castCostColors: { B: 1 },
    delay: 0,
    isCreature: false,
    producesAmount: 3,
    activationTax: 0,
    producesMask: mask('B'),
    producesAny: false,
    oneShot: true,
    survivalBase: 1.0
  },

  'Cabal Ritual': {
    type: 'RITUAL',
    castCostGeneric: 1,
    castCostColors: { B: 1 },
    delay: 0,
    isCreature: false,
    producesAmount: 3, // 5 with threshold
    activationTax: 0,
    producesMask: mask('B'),
    producesAny: false,
    oneShot: true,
    survivalBase: 1.0
  },

  'Rite of Flame': {
    type: 'RITUAL',
    castCostGeneric: 0,
    castCostColors: { R: 1 },
    delay: 0,
    isCreature: false,
    producesAmount: 2, // Scales with copies
    activationTax: 0,
    producesMask: mask('R'),
    producesAny: false,
    oneShot: true,
    survivalBase: 1.0
  },

  'Pyretic Ritual': {
    type: 'RITUAL',
    castCostGeneric: 1,
    castCostColors: { R: 1 },
    delay: 0,
    isCreature: false,
    producesAmount: 3,
    activationTax: 0,
    producesMask: mask('R'),
    producesAny: false,
    oneShot: true,
    survivalBase: 1.0
  },

  'Desperate Ritual': {
    type: 'RITUAL',
    castCostGeneric: 1,
    castCostColors: { R: 1 },
    delay: 0,
    isCreature: false,
    producesAmount: 3,
    activationTax: 0,
    producesMask: mask('R'),
    producesAny: false,
    oneShot: true,
    survivalBase: 1.0
  },

  'Seething Song': {
    type: 'RITUAL',
    castCostGeneric: 2,
    castCostColors: { R: 1 },
    delay: 0,
    isCreature: false,
    producesAmount: 5,
    activationTax: 0,
    producesMask: mask('R'),
    producesAny: false,
    oneShot: true,
    survivalBase: 1.0
  },

  'Simian Spirit Guide': {
    type: 'RITUAL',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false, // Exiled, not cast
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('R'),
    producesAny: false,
    oneShot: true,
    survivalBase: 1.0
  },

  'Elvish Spirit Guide': {
    type: 'RITUAL',
    castCostGeneric: 0,
    castCostColors: {},
    delay: 0,
    isCreature: false, // Exiled, not cast
    producesAmount: 1,
    activationTax: 0,
    producesMask: mask('G'),
    producesAny: false,
    oneShot: true,
    survivalBase: 1.0
  },

  // ===========================================================================
  // TREASURE PRODUCERS (simplified)
  // ===========================================================================

  'Dockside Extortionist': {
    type: 'TREASURE',
    castCostGeneric: 1,
    castCostColors: { R: 1 },
    delay: 0, // ETB creates treasures
    isCreature: true,
    producesAmount: 3, // Average in Commander
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: true, // Treasures are one-shot
    survivalBase: 0.70
  },

  'Smothering Tithe': {
    type: 'TREASURE',
    castCostGeneric: 3,
    castCostColors: { W: 1 },
    delay: 1, // Need opponents to draw
    isCreature: false,
    producesAmount: 2, // Average per turn
    activationTax: 0,
    producesMask: ANY_COLOR,
    producesAny: true,
    oneShot: true,
    survivalBase: 0.85
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Complete seed data with name filled in.
 * Ready to be loaded into the cache.
 */
export const MANA_PRODUCER_SEED: Record<string, ManaProducerDef> = Object.fromEntries(
  Object.entries(SEED_DATA).map(([name, data]) => [
    name,
    {
      ...data,
      name
    } as ManaProducerDef
  ])
)

/**
 * Get the count of producers in the seed
 */
export const MANA_PRODUCER_SEED_COUNT = Object.keys(MANA_PRODUCER_SEED).length

/**
 * Quick lookup to check if a card name is in the seed
 */
export function isInProducerSeed(cardName: string): boolean {
  return cardName in MANA_PRODUCER_SEED
}

/**
 * Get a producer from the seed by name
 */
export function getProducerFromSeed(cardName: string): ManaProducerDef | null {
  return MANA_PRODUCER_SEED[cardName] ?? null
}
