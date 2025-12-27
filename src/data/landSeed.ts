/**
 * Land Seed Data for ManaTuner Pro
 *
 * This file contains ~200 of the most commonly played lands with their
 * metadata pre-defined. This serves as an initial cache to avoid
 * Scryfall API calls for the most common lands.
 *
 * Categories included:
 * - Basic lands (6)
 * - Fetchlands (10)
 * - Shocklands (10)
 * - Fastlands (10)
 * - Checklands (10)
 * - Painlands (10)
 * - Slowlands (10)
 * - Triomes (10)
 * - Pathways (10)
 * - Creature lands (10)
 * - Utility lands (50+)
 * - Channel lands (10)
 * - Horizon lands (6)
 * - Filter lands (10)
 * - Bounce lands (10)
 *
 * @version 2.0
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

  // Snow basics
  'Snow-Covered Plains': {
    category: 'basic',
    produces: ['W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Plains']
  },

  'Snow-Covered Island': {
    category: 'basic',
    produces: ['U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Island']
  },

  'Snow-Covered Swamp': {
    category: 'basic',
    produces: ['B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Swamp']
  },

  'Snow-Covered Mountain': {
    category: 'basic',
    produces: ['R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Mountain']
  },

  'Snow-Covered Forest': {
    category: 'basic',
    produces: ['G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Forest']
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

  // Budget fetchlands
  'Fabled Passage': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Prismatic Vista': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Terramorphic Expanse': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'],
    isCreatureLand: false,
    hasChannel: false
  },

  'Evolving Wilds': {
    category: 'fetch',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: true,
    fetchTargets: ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'],
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
  // CHECKLANDS (10)
  // ===========================================================================

  'Glacial Fortress': {
    category: 'check',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Plains', 'Island'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Drowned Catacomb': {
    category: 'check',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Island', 'Swamp'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Dragonskull Summit': {
    category: 'check',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Swamp', 'Mountain'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Rootbound Crag': {
    category: 'check',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Mountain', 'Forest'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Sunpetal Grove': {
    category: 'check',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Forest', 'Plains'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Isolated Chapel': {
    category: 'check',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Plains', 'Swamp'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Sulfur Falls': {
    category: 'check',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Island', 'Mountain'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Woodland Cemetery': {
    category: 'check',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Swamp', 'Forest'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Clifftop Retreat': {
    category: 'check',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Mountain', 'Plains'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Hinterland Harbor': {
    category: 'check',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Forest', 'Island'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // PAINLANDS (10)
  // ===========================================================================

  'Adarkar Wastes': {
    category: 'pain',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Underground River': {
    category: 'pain',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Sulfurous Springs': {
    category: 'pain',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Karplusan Forest': {
    category: 'pain',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Brushland': {
    category: 'pain',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Caves of Koilos': {
    category: 'pain',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Shivan Reef': {
    category: 'pain',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Llanowar Wastes': {
    category: 'pain',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Battlefield Forge': {
    category: 'pain',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Yavimaya Coast': {
    category: 'pain',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // SLOWLANDS (10) - Innistrad Midnight Hunt/Crimson Vow
  // ===========================================================================

  'Deserted Beach': {
    category: 'slow',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Shipwreck Marsh': {
    category: 'slow',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Haunted Ridge': {
    category: 'slow',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Rockfall Vale': {
    category: 'slow',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Overgrown Farmland': {
    category: 'slow',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Shattered Sanctum': {
    category: 'slow',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Stormcarved Coast': {
    category: 'slow',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Deathcap Glade': {
    category: 'slow',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Sundown Pass': {
    category: 'slow',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Dreamroot Cascade': {
    category: 'slow',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 2 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // TRIOMES (10) - Ikoria + Streets of New Capenna
  // ===========================================================================

  // Streets of New Capenna
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

  // Ikoria Triomes
  'Indatha Triome': {
    category: 'triome',
    produces: ['W', 'B', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Plains', 'Swamp', 'Forest']
  },

  'Ketria Triome': {
    category: 'triome',
    produces: ['G', 'U', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Forest', 'Island', 'Mountain']
  },

  'Raugrin Triome': {
    category: 'triome',
    produces: ['U', 'R', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Island', 'Mountain', 'Plains']
  },

  'Savai Triome': {
    category: 'triome',
    produces: ['R', 'W', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Mountain', 'Plains', 'Swamp']
  },

  'Zagoth Triome': {
    category: 'triome',
    produces: ['B', 'G', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Swamp', 'Forest', 'Island']
  },

  // ===========================================================================
  // PATHWAYS (10) - Zendikar Rising + Kaldheim
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
  },

  'Needleverge Pathway': {
    category: 'pathway',
    produces: ['R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Pillarverge Pathway'
  },

  'Pillarverge Pathway': {
    category: 'pathway',
    produces: ['W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Needleverge Pathway'
  },

  'Darkbore Pathway': {
    category: 'pathway',
    produces: ['B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Slitherbore Pathway'
  },

  'Slitherbore Pathway': {
    category: 'pathway',
    produces: ['G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Darkbore Pathway'
  },

  'Blightstep Pathway': {
    category: 'pathway',
    produces: ['B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Searstep Pathway'
  },

  'Searstep Pathway': {
    category: 'pathway',
    produces: ['R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Blightstep Pathway'
  },

  'Barkchannel Pathway': {
    category: 'pathway',
    produces: ['G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Tidechannel Pathway'
  },

  'Tidechannel Pathway': {
    category: 'pathway',
    produces: ['U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Barkchannel Pathway'
  },

  'Hengegate Pathway': {
    category: 'pathway',
    produces: ['W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Mistgate Pathway'
  },

  'Mistgate Pathway': {
    category: 'pathway',
    produces: ['U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    isMDFC: true,
    otherFace: 'Hengegate Pathway'
  },

  // ===========================================================================
  // CREATURE LANDS (12)
  // ===========================================================================

  'Celestial Colonnade': {
    category: 'creature',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Creeping Tar Pit': {
    category: 'creature',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Lavaclaw Reaches': {
    category: 'creature',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Raging Ravine': {
    category: 'creature',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Stirring Wildwood': {
    category: 'creature',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Shambling Vent': {
    category: 'creature',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Wandering Fumarole': {
    category: 'creature',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Hissing Quagmire': {
    category: 'creature',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Needle Spires': {
    category: 'creature',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Lumbering Falls': {
    category: 'creature',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  // Mono-color creature lands
  'Mutavault': {
    category: 'creature',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  'Faceless Haven': {
    category: 'creature',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: true,
    hasChannel: false
  },

  // ===========================================================================
  // HORIZON LANDS (6)
  // ===========================================================================

  'Horizon Canopy': {
    category: 'horizon',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Silent Clearing': {
    category: 'horizon',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Fiery Islet': {
    category: 'horizon',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Nurturing Peatland': {
    category: 'horizon',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Sunbaked Canyon': {
    category: 'horizon',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Waterlogged Grove': {
    category: 'horizon',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // CHANNEL LANDS - Kamigawa Neon Dynasty (10)
  // ===========================================================================

  'Eiganjo, Seat of the Empire': {
    category: 'channel',
    produces: ['W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: true
  },

  'Otawara, Soaring City': {
    category: 'channel',
    produces: ['U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: true
  },

  'Takenuma, Abandoned Mire': {
    category: 'channel',
    produces: ['B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: true
  },

  'Sokenzan, Crucible of Defiance': {
    category: 'channel',
    produces: ['R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: true
  },

  'Boseiju, Who Endures': {
    category: 'channel',
    produces: ['G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: true
  },

  // ===========================================================================
  // UTILITY LANDS (50+)
  // ===========================================================================

  // Any color producers
  'Command Tower': {
    category: 'utility',
    produces: ['W', 'U', 'B', 'R', 'G'],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'City of Brass': {
    category: 'utility',
    produces: ['W', 'U', 'B', 'R', 'G'],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Mana Confluence': {
    category: 'utility',
    produces: ['W', 'U', 'B', 'R', 'G'],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Reflecting Pool': {
    category: 'utility',
    produces: [],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Gemstone Caverns': {
    category: 'utility',
    produces: ['C'],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Exotic Orchard': {
    category: 'utility',
    produces: [],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Colorless utility
  'Ancient Tomb': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    producesAmount: 2, // Taps for 2 colorless
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Cavern of Souls': {
    category: 'utility',
    produces: ['C'],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Field of the Dead': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Urza\'s Saga': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'The One Ring': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Blast Zone': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Detection Tower': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Ghost Quarter': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Field of Ruin': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Inventors\' Fair': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Maze of Ith': {
    category: 'utility',
    produces: [],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Phyrexian Tower': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Reliquary Tower': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Strip Mine': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Wasteland': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Tectonic Edge': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Castle Ardenvale': {
    category: 'utility',
    produces: ['W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Plains'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Castle Vantress': {
    category: 'utility',
    produces: ['U'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Island'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Castle Locthwain': {
    category: 'utility',
    produces: ['B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Swamp'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Castle Embereth': {
    category: 'utility',
    produces: ['R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Mountain'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Castle Garenbrig': {
    category: 'utility',
    produces: ['G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Forest'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Lair lands (Planescape)
  'Plaza of Heroes': {
    category: 'utility',
    produces: ['C'],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Secluded Courtyard': {
    category: 'utility',
    produces: [],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Unclaimed Territory': {
    category: 'utility',
    produces: ['C'],
    producesAny: true,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Starting Town (special - conditional based on turn)
  'Starting Town': {
    category: 'utility',
    produces: ['W', 'U', 'B', 'R', 'G'],
    producesAny: true,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'turn_threshold', threshold: 3 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Thran Portal
  'Thran Portal': {
    category: 'utility',
    produces: [],
    producesAny: true,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // MULTI-MANA LANDS - Lands that produce 2+ mana
  // ===========================================================================

  // Temple of the False God - 2 colorless but requires 5+ lands
  'Temple of the False God': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_lands_min', threshold: 5 }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Nykthos - produces X based on devotion (estimated at 3 average)
  'Nykthos, Shrine to Nyx': {
    category: 'utility',
    produces: ['C'],
    producesAny: true, // Can produce any color based on devotion
    producesAmount: 3, // Conservative estimate for devotion decks
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Gaea's Cradle - produces X green based on creatures (estimated at 3)
  "Gaea's Cradle": {
    category: 'utility',
    produces: ['G'],
    producesAny: false,
    producesAmount: 3, // Conservative estimate for creature decks
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Serra's Sanctum - produces X white based on enchantments
  "Serra's Sanctum": {
    category: 'utility',
    produces: ['W'],
    producesAny: false,
    producesAmount: 3, // Conservative estimate for enchantment decks
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Tolarian Academy - produces X blue based on artifacts
  'Tolarian Academy': {
    category: 'utility',
    produces: ['U'],
    producesAny: false,
    producesAmount: 3, // Conservative estimate for artifact decks
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Cabal Coffers - produces X black based on swamps (needs Urborg usually)
  'Cabal Coffers': {
    category: 'utility',
    produces: ['B'],
    producesAny: false,
    producesAmount: 4, // Estimate with several swamps
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Itlimoc, Cradle of the Sun (flipped Growing Rites)
  'Itlimoc, Cradle of the Sun': {
    category: 'utility',
    produces: ['G'],
    producesAny: false,
    producesAmount: 3, // Based on creatures
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Lotus Field - 3 mana but sacrifices 2 lands on ETB
  'Lotus Field': {
    category: 'utility',
    produces: ['W', 'U', 'B', 'R', 'G'],
    producesAny: true,
    producesAmount: 3,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // Castle Garenbrig can produce 6 green for creatures
  // Already in seed but adding producesAmount for creature casting

  // Eldrazi Temple - 2 colorless for Eldrazi spells
  'Eldrazi Temple': {
    category: 'utility',
    produces: ['C'],
    producesAny: false,
    producesAmount: 2, // For Eldrazi spells
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // BOUNCE LANDS (10) - Ravnica
  // ===========================================================================

  'Azorius Chancery': {
    category: 'bounce',
    produces: ['W', 'U'],
    producesAny: false,
    producesAmount: 2, // Bounce lands produce 2 mana
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Dimir Aqueduct': {
    category: 'bounce',
    produces: ['U', 'B'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Rakdos Carnarium': {
    category: 'bounce',
    produces: ['B', 'R'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Gruul Turf': {
    category: 'bounce',
    produces: ['R', 'G'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Selesnya Sanctuary': {
    category: 'bounce',
    produces: ['G', 'W'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Orzhov Basilica': {
    category: 'bounce',
    produces: ['W', 'B'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Izzet Boilerworks': {
    category: 'bounce',
    produces: ['U', 'R'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Golgari Rot Farm': {
    category: 'bounce',
    produces: ['B', 'G'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Boros Garrison': {
    category: 'bounce',
    produces: ['R', 'W'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Simic Growth Chamber': {
    category: 'bounce',
    produces: ['G', 'U'],
    producesAny: false,
    producesAmount: 2,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // FILTER LANDS (10) - Shadowmoor/Eventide
  // ===========================================================================

  'Mystic Gate': {
    category: 'filter',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Sunken Ruins': {
    category: 'filter',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Graven Cairns': {
    category: 'filter',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Fire-Lit Thicket': {
    category: 'filter',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Wooded Bastion': {
    category: 'filter',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Fetid Heath': {
    category: 'filter',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Cascade Bluffs': {
    category: 'filter',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Twilight Mire': {
    category: 'filter',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Rugged Prairie': {
    category: 'filter',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Flooded Grove': {
    category: 'filter',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // SURVEIL LANDS - Duskmourn (10)
  // ===========================================================================

  'Gloomlake Verge': {
    category: 'utility',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Island', 'Swamp'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Blazemire Verge': {
    category: 'utility',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Swamp', 'Mountain'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Thornspire Verge': {
    category: 'utility',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Mountain', 'Forest'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Riftstone Verge': {
    category: 'utility',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: {
      type: 'conditional',
      condition: { type: 'control_basic', basicTypes: ['Forest', 'Plains'] }
    },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Shadowy Backstreet': {
    category: 'utility',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Undercity Sewers': {
    category: 'utility',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Raucous Theater': {
    category: 'utility',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Commercial District': {
    category: 'utility',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Lush Portico': {
    category: 'utility',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  'Meticulous Archive': {
    category: 'utility',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_tapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false
  },

  // ===========================================================================
  // ORIGINAL DUAL LANDS (10) - Reserved List
  // ===========================================================================

  'Tundra': {
    category: 'dual',
    produces: ['W', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Plains', 'Island']
  },

  'Underground Sea': {
    category: 'dual',
    produces: ['U', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Island', 'Swamp']
  },

  'Badlands': {
    category: 'dual',
    produces: ['B', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Swamp', 'Mountain']
  },

  'Taiga': {
    category: 'dual',
    produces: ['R', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Mountain', 'Forest']
  },

  'Savannah': {
    category: 'dual',
    produces: ['G', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Forest', 'Plains']
  },

  'Scrubland': {
    category: 'dual',
    produces: ['W', 'B'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Plains', 'Swamp']
  },

  'Volcanic Island': {
    category: 'dual',
    produces: ['U', 'R'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Island', 'Mountain']
  },

  'Bayou': {
    category: 'dual',
    produces: ['B', 'G'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Swamp', 'Forest']
  },

  'Plateau': {
    category: 'dual',
    produces: ['R', 'W'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Mountain', 'Plains']
  },

  'Tropical Island': {
    category: 'dual',
    produces: ['G', 'U'],
    producesAny: false,
    etbBehavior: { type: 'always_untapped' },
    isFetch: false,
    isCreatureLand: false,
    hasChannel: false,
    basicLandTypes: ['Forest', 'Island']
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
