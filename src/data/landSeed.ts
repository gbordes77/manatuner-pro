/**
 * Land Seed Data for ManaTuner Pro
 *
 * This file contains ~50 of the most commonly played lands with their
 * metadata pre-defined. This serves as an initial cache to avoid
 * Scryfall API calls for the most common lands.
 *
 * NOTE: This is NOT the source of truth. Scryfall API is the source of truth.
 * This seed just accelerates first-time loading.
 *
 * @version 1.0
 * @see docs/LAND_SYSTEM_REDESIGN.md
 */

import type { LandMetadata } from '@/types/lands'

// =============================================================================
// HELPER TYPES
// =============================================================================

/** Partial land metadata for seed data (name and confidence are auto-filled) */
type SeedLandData = Omit<LandMetadata, 'name' | 'confidence'>

// =============================================================================
// SEED DATA
// =============================================================================

/**
 * Seed data for the most commonly played lands.
 * Organized by category for maintainability.
 */
const SEED_DATA: Record<string, SeedLandData> = {
  // ===========================================================================
  // BASIC LANDS (6)
  // ===========================================================================

  'Plains': {
    category: 'basic',
    produces: ['W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Plains']
  },

  'Island': {
    category: 'basic',
    produces: ['U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Island']
  },

  'Swamp': {
    category: 'basic',
    produces: ['B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Swamp']
  },

  'Mountain': {
    category: 'basic',
    produces: ['R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Mountain']
  },

  'Forest': {
    category: 'basic',
    produces: ['G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Forest']
  },

  'Wastes': {
    category: 'basic',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // FETCHLANDS (10)
  // ===========================================================================

  'Flooded Strand': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Plains', 'Island'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Polluted Delta': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Island', 'Swamp'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Bloodstained Mire': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Swamp', 'Mountain'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Wooded Foothills': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Mountain', 'Forest'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Windswept Heath': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Forest', 'Plains'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Marsh Flats': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Plains', 'Swamp'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Scalding Tarn': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Island', 'Mountain'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Verdant Catacombs': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Swamp', 'Forest'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Arid Mesa': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Mountain', 'Plains'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Misty Rainforest': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Forest', 'Island'],
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // SHOCKLANDS (10)
  // ===========================================================================

  'Hallowed Fountain': {
    category: 'shock',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Plains', 'Island']
  },

  'Watery Grave': {
    category: 'shock',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Island', 'Swamp']
  },

  'Blood Crypt': {
    category: 'shock',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Swamp', 'Mountain']
  },

  'Stomping Ground': {
    category: 'shock',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Mountain', 'Forest']
  },

  'Temple Garden': {
    category: 'shock',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Forest', 'Plains']
  },

  'Godless Shrine': {
    category: 'shock',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Plains', 'Swamp']
  },

  'Steam Vents': {
    category: 'shock',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Island', 'Mountain']
  },

  'Overgrown Tomb': {
    category: 'shock',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Swamp', 'Forest']
  },

  'Sacred Foundry': {
    category: 'shock',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Mountain', 'Plains']
  },

  'Breeding Pool': {
    category: 'shock',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'pay_life', amount: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Forest', 'Island']
  },

  // ===========================================================================
  // FASTLANDS (10)
  // ===========================================================================

  'Seachrome Coast': {
    category: 'fast',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Darkslick Shores': {
    category: 'fast',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Blackcleave Cliffs': {
    category: 'fast',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Copperline Gorge': {
    category: 'fast',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Razorverge Thicket': {
    category: 'fast',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Concealed Courtyard': {
    category: 'fast',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Spirebluff Canal': {
    category: 'fast',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Blooming Marsh': {
    category: 'fast',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Inspiring Vantage': {
    category: 'fast',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Botanical Sanctum': {
    category: 'fast',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_max', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // TRIOMES (5 most played)
  // ===========================================================================

  "Raffine's Tower": {
    category: 'triome',
    produces: ['W', 'U', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Plains', 'Island', 'Swamp']
  },

  "Spara's Headquarters": {
    category: 'triome',
    produces: ['G', 'W', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Forest', 'Plains', 'Island']
  },

  "Xander's Lounge": {
    category: 'triome',
    produces: ['U', 'B', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Island', 'Swamp', 'Mountain']
  },

  "Ziatora's Proving Ground": {
    category: 'triome',
    produces: ['B', 'R', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Swamp', 'Mountain', 'Forest']
  },

  "Jetmir's Garden": {
    category: 'triome',
    produces: ['R', 'G', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Mountain', 'Forest', 'Plains']
  },

  // ===========================================================================
  // PATHWAYS (10) - MDFC
  // ===========================================================================

  'Brightclimb Pathway': {
    category: 'pathway',
    produces: ['W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Grimclimb Pathway'
  },

  'Grimclimb Pathway': {
    category: 'pathway',
    produces: ['B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Brightclimb Pathway'
  },

  'Clearwater Pathway': {
    category: 'pathway',
    produces: ['U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Murkwater Pathway'
  },

  'Murkwater Pathway': {
    category: 'pathway',
    produces: ['B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Clearwater Pathway'
  },

  'Cragcrown Pathway': {
    category: 'pathway',
    produces: ['R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Timbercrown Pathway'
  },

  'Timbercrown Pathway': {
    category: 'pathway',
    produces: ['G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Cragcrown Pathway'
  },

  'Branchloft Pathway': {
    category: 'pathway',
    produces: ['G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Boulderloft Pathway'
  },

  'Boulderloft Pathway': {
    category: 'pathway',
    produces: ['W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Branchloft Pathway'
  },

  'Riverglide Pathway': {
    category: 'pathway',
    produces: ['U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Lavaglide Pathway'
  },

  'Lavaglide Pathway': {
    category: 'pathway',
    produces: ['R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Riverglide Pathway'
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Complete seed data with name and confidence filled in.
 * Ready to be loaded into the cache.
 */
export const LAND_SEED: Record<string, LandMetadata> = Object.fromEntries(
  Object.entries(SEED_DATA).map(([name, data]) => [
    name,
    {
      ...data,
      name,
      confidence: 100
    } as LandMetadata
  ])
)

/**
 * Get the count of lands in the seed
 */
export const LAND_SEED_COUNT = Object.keys(LAND_SEED).length
