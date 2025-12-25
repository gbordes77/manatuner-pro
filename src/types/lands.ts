/**
 * Land System Types for ManaTuner Pro
 *
 * This module defines all types related to land detection, ETB behavior,
 * and tempo-aware probability calculations.
 *
 * @version 1.0
 * @see docs/LAND_SYSTEM_REDESIGN.md
 */

// =============================================================================
// MANA & COLOR TYPES
// =============================================================================

/** Extended mana color type including colorless */
export type LandManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

/** All possible mana colors as array */
export const LAND_MANA_COLORS: LandManaColor[] = ['W', 'U', 'B', 'R', 'G', 'C']

// =============================================================================
// LAND CATEGORY TYPES
// =============================================================================

/**
 * Categories of lands based on their behavior and mechanics.
 * Used for quick classification and UI display.
 */
export type LandCategory =
  | 'basic'      // Plains, Island, Swamp, Mountain, Forest, Wastes
  | 'fetch'      // Flooded Strand, Polluted Delta, etc.
  | 'shock'      // Hallowed Fountain, Watery Grave, etc.
  | 'fast'       // Seachrome Coast, Darkslick Shores, etc. (Fastlands)
  | 'slow'       // Deserted Beach, Shipwreck Marsh, etc. (Slowlands)
  | 'check'      // Glacial Fortress, Drowned Catacomb, etc. (Checklands)
  | 'battle'     // Prairie Stream, Sunken Hollow, etc. (Battle lands/Tango lands)
  | 'pain'       // Adarkar Wastes, Underground River, etc. (Painlands)
  | 'filter'     // Mystic Gate, Sunken Ruins, etc. (Filter lands)
  | 'horizon'    // Horizon Canopy, Silent Clearing, etc. (Horizon lands)
  | 'triome'     // Raffine's Tower, Spara's Headquarters, etc. (Triomes)
  | 'pathway'    // Brightclimb Pathway, Clearwater Pathway, etc. (MDFC Pathways)
  | 'channel'    // Otawara, Boseiju, etc. (Channel lands)
  | 'creature'   // Celestial Colonnade, Creeping Tar Pit, etc. (Creature lands)
  | 'bounce'     // Azorius Chancery, Dimir Aqueduct, etc. (Bounce lands)
  | 'utility'    // Misc utility lands (Field of Ruin, etc.)
  | 'unknown'    // Unrecognized lands (fallback)

/** Human-readable names for land categories */
export const LAND_CATEGORY_NAMES: Record<LandCategory, string> = {
  basic: 'Basic Land',
  fetch: 'Fetchland',
  shock: 'Shockland',
  fast: 'Fastland',
  slow: 'Slowland',
  check: 'Checkland',
  battle: 'Battle Land',
  pain: 'Painland',
  filter: 'Filter Land',
  horizon: 'Horizon Land',
  triome: 'Triome',
  pathway: 'Pathway (MDFC)',
  channel: 'Channel Land',
  creature: 'Creature Land',
  bounce: 'Bounce Land',
  utility: 'Utility Land',
  unknown: 'Unknown Land'
}

// =============================================================================
// ETB (ENTERS THE BATTLEFIELD) TYPES
// =============================================================================

/**
 * Type of ETB behavior for a land.
 */
export type ETBType =
  | 'always_untapped'  // Basic lands, Painlands, Pathways, etc.
  | 'always_tapped'    // Triomes, Taplands, Bounce lands, etc.
  | 'conditional'      // Shocklands, Fastlands, Checklands, etc.

/**
 * Types of conditions that determine if a land enters tapped or untapped.
 */
export type ETBConditionType =
  | 'pay_life'           // Shocklands: "pay 2 life or enters tapped"
  | 'control_lands_max'  // Fastlands: "unless you control 2 or fewer other lands"
  | 'control_lands_min'  // Slowlands: "unless you control 2 or more other lands"
  | 'control_basic'      // Checklands: "unless you control a Plains or Island"
  | 'control_basics_min' // Battle lands: "unless you control 2 or more basic lands"
  | 'reveal_card'        // Reveal lands: "reveal an Island card or enters tapped"
  | 'turn_threshold'     // Starting Town: "unless it's your first, second, or third turn"

/**
 * Condition details for conditional ETB lands.
 */
export interface ETBCondition {
  /** Type of condition */
  type: ETBConditionType

  /** Life payment amount (for pay_life type) */
  amount?: number

  /** Threshold value (for control_lands, turn_threshold types) */
  threshold?: number

  /** Required basic land types (for control_basic type) */
  basicTypes?: string[]

  /** Required card type to reveal (for reveal_card type) */
  cardType?: string
}

/**
 * Complete ETB behavior specification for a land.
 */
export interface ETBBehavior {
  /** Type of ETB behavior */
  type: ETBType

  /** Condition details (only for conditional type) */
  condition?: ETBCondition
}

// =============================================================================
// LAND METADATA
// =============================================================================

/**
 * Complete metadata for a land card, including production, ETB behavior,
 * and special abilities.
 */
export interface LandMetadata {
  /** Card name (exact Scryfall name) */
  name: string

  /** Land category for classification */
  category: LandCategory

  /** Mana colors this land can produce */
  produces: LandManaColor[]

  /** Whether this land can produce any color of mana */
  producesAny: boolean

  /** ETB behavior specification */
  etbBehavior: ETBBehavior

  /** Is this a fetchland (searches for other lands)? */
  isFetch: boolean

  /** Target land types for fetchlands */
  fetchTargets?: string[]

  /** Does this land have a creature activation? */
  isCreatureLand: boolean

  /** Does this land have a channel ability? */
  hasChannel: boolean

  /** Is this a Modal Double-Faced Card? */
  isMDFC?: boolean

  /** Name of the other face (for MDFC) */
  otherFace?: string

  /** Basic land types (Plains, Island, Swamp, Mountain, Forest) */
  basicLandTypes?: string[]

  /** Confidence score for the detection (0-100) */
  confidence: number

  /** Scryfall data (if fetched from API) */
  scryfallData?: {
    oracleText?: string
    typeLine?: string
    layout?: string
  }
}

// =============================================================================
// CACHE STORAGE TYPES
// =============================================================================

/**
 * Individual cached land entry in localStorage.
 */
export interface CachedLandEntry {
  /** The land metadata */
  metadata: LandMetadata

  /** ISO date when this entry was fetched */
  fetchedAt: string

  /** Source of the data */
  source: 'scryfall' | 'pattern' | 'seed'

  /** ISO date when this entry expires */
  expiresAt: string
}

/**
 * Complete localStorage cache structure for lands.
 */
export interface LandCacheStorage {
  /** Cache version for migrations */
  version: string

  /** ISO date of last cleanup */
  lastCleanup: string

  /** Map of land names to cached entries */
  lands: Record<string, CachedLandEntry>
}

/**
 * Cache statistics for debugging and monitoring.
 */
export interface LandCacheStats {
  /** Total number of cached lands */
  total: number

  /** Count by source */
  bySource: Record<string, number>

  /** Number of entries in memory cache */
  memorySize: number

  /** Estimated localStorage size in bytes */
  storageSizeBytes?: number
}

// =============================================================================
// TEMPO-AWARE PROBABILITY TYPES
// =============================================================================

/**
 * Context about the deck for evaluating ETB conditions.
 */
export interface DeckContext {
  /** Total number of lands in the deck */
  totalLands: number

  /** Number of basic lands */
  basicCount: number

  /** Count of each basic land type */
  basicTypeCount: Record<string, number>

  /** Whether to assume paying life for shocklands, etc. */
  assumePayLife: boolean

  /** Get ratio of cards with a specific type */
  getCardTypeRatio: (cardType: string) => number
}

/**
 * Strategy for calculating probabilities.
 */
export type PlayStrategy = 'aggressive' | 'conservative' | 'balanced'

/**
 * Parameters for tempo-aware probability calculation.
 */
export interface TempoCalculationParams {
  /** Deck information */
  deck: {
    lands: LandMetadata[]
    totalCards: number
  }

  /** Target turn for casting */
  targetTurn: number

  /** Color needed */
  colorNeeded: LandManaColor

  /** Number of symbols of that color needed */
  symbolsNeeded: number

  /** Play strategy */
  strategy: PlayStrategy
}

/**
 * Result of tempo-aware probability calculation.
 */
export interface TempoAwareProbability {
  /** Raw probability (ignoring tempo) */
  raw: number

  /** Tempo-adjusted probability */
  tempoAdjusted: number

  /** Probabilities for different strategies */
  scenarios: {
    aggressive: number
    conservative: number
    balanced: number
  }

  /** Effective sources available at each turn (index = turn - 1) */
  effectiveSourcesByTurn: number[]

  /** Difference between raw and tempo-adjusted */
  tempoImpact: number
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

/**
 * Interface for the land cache service.
 */
export interface ILandCacheService {
  /** Get a land from cache (memory → localStorage → null) */
  get(cardName: string): LandMetadata | null

  /** Store a land in cache */
  set(cardName: string, metadata: LandMetadata, source: 'scryfall' | 'pattern' | 'seed'): void

  /** Check if a land is in cache and not expired */
  has(cardName: string): boolean

  /** Clean up expired entries */
  cleanup(): void

  /** Get cache statistics */
  getStats(): LandCacheStats

  /** Clear all cache */
  clear(): void
}

/**
 * Interface for the main land service.
 */
export interface ILandService {
  /** Detect and analyze a land by name */
  detectLand(cardName: string): Promise<LandMetadata | null>

  /** Get untapped probability for a land at a specific turn */
  getUntappedProbability(land: LandMetadata, turn: number, context: DeckContext): number

  /** Check if a card name is a land */
  isLand(cardName: string): Promise<boolean>

  /** Get all lands from a deck list */
  getLandsFromDeckList(deckList: string[]): Promise<LandMetadata[]>
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Result of parsing an oracle text for ETB behavior.
 */
export interface ETBParseResult {
  behavior: ETBBehavior
  confidence: number
  matchedPattern?: string
}

/**
 * Scryfall card data extended with fields we need.
 */
export interface ScryfallLandData {
  id: string
  name: string
  type_line: string
  oracle_text?: string
  produced_mana?: string[]
  layout: string
  keywords?: string[]
  card_faces?: Array<{
    name: string
    type_line: string
    oracle_text?: string
    mana_cost?: string
    colors?: string[]
  }>
}
