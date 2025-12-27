/**
 * Mana Producer Types for ManaTuner Pro
 *
 * This module defines all types related to mana-producing non-land cards:
 * dorks (creatures), rocks (artifacts), rituals, and treasures.
 *
 * @version 1.0
 * @see docs/EXPERT_ANALYSES.md
 */

// =============================================================================
// COLOR TYPES (shared with lands)
// =============================================================================

import type { LandManaColor } from './lands'

export { LandManaColor }

/** Color bitmask for efficient multi-color checks */
export const COLOR_MASK = {
  W: 1,
  U: 2,
  B: 4,
  R: 8,
  G: 16,
  C: 32
} as const

export type ColorMask = number

// =============================================================================
// PRODUCER TYPES
// =============================================================================

/**
 * Type of mana-producing source
 */
export type ManaProducerType =
  | 'DORK'       // Creature that taps for mana (Llanowar Elves, Birds of Paradise)
  | 'ROCK'       // Artifact that taps for mana (Sol Ring, Arcane Signet)
  | 'RITUAL'     // One-shot spell that produces mana (Dark Ritual, Rite of Flame)
  | 'ONE_SHOT'   // One-use artifact (Lotus Petal, Lion's Eye Diamond)
  | 'TREASURE'   // Token-based mana (Dockside Extortionist creates treasures)
  | 'CONDITIONAL' // Conditional producers (Nykthos, Urborg+Coffers)
  | 'ENHANCER'   // Multiplies/enhances other dorks (Badgermole Cub)

/**
 * Human-readable names for producer types
 */
export const PRODUCER_TYPE_NAMES: Record<ManaProducerType, string> = {
  DORK: 'Mana Dork',
  ROCK: 'Mana Rock',
  RITUAL: 'Ritual',
  ONE_SHOT: 'One-Shot',
  TREASURE: 'Treasure Producer',
  CONDITIONAL: 'Conditional',
  ENHANCER: 'Mana Enhancer'
}

// =============================================================================
// MANA COST TYPES
// =============================================================================

/**
 * Represents a mana cost for calculation purposes
 */
export interface ManaCost {
  /** Total mana value (converted mana cost) */
  mv: number
  /** Generic mana component */
  generic: number
  /** Colored pips required */
  pips: Partial<Record<LandManaColor, number>>
}

// =============================================================================
// PRODUCER DEFINITION
// =============================================================================

/**
 * Complete definition of a mana-producing card
 */
export interface ManaProducerDef {
  /** Card name (exact Scryfall name) */
  name: string

  /** Type of producer */
  type: ManaProducerType

  /** Generic mana in casting cost */
  castCostGeneric: number

  /** Colored mana in casting cost */
  castCostColors: Partial<Record<LandManaColor, number>>

  /**
   * Delay before producing mana (turns)
   * - 0 for rocks/rituals (immediate)
   * - 1 for dorks (summoning sickness)
   * - 1 for ETB-tapped rocks
   */
  delay: number

  /** Is this a creature? (vulnerable to creature removal) */
  isCreature: boolean

  /** Raw mana amount produced per activation */
  producesAmount: number

  /**
   * Mana cost to activate the ability
   * e.g., Signets cost 1 to activate
   */
  activationTax: number

  /** Bitmask of colors this can produce */
  producesMask: ColorMask

  /** Can produce any color? (Birds, Command Tower) */
  producesAny: boolean

  /** Is this a one-shot effect? (Lotus Petal, Dark Ritual) */
  oneShot: boolean

  /**
   * Base survival rate (0-1)
   * - Dorks: affected by removal rate
   * - Rocks: typically 0.98+
   * - Rituals/One-shots: 1.0
   */
  survivalBase?: number

  // ============ ENHANCER-specific fields ============

  /**
   * For ENHANCER type: bonus mana added when other dorks tap
   * e.g., Badgermole Cub adds +1G per dork tap
   */
  enhancerBonus?: number

  /**
   * For ENHANCER type: color mask of bonus mana produced
   * e.g., Badgermole Cub adds G (mask = 16)
   */
  enhancerBonusMask?: ColorMask

  /**
   * For ENHANCER type: what types of producers it enhances
   * Default: ['DORK'] for cards like Badgermole Cub
   */
  enhancesTypes?: ManaProducerType[]
}

/**
 * A producer in a deck with copy count
 */
export interface ProducerInDeck {
  def: ManaProducerDef
  copies: number
}

// =============================================================================
// DECK PROFILE
// =============================================================================

/**
 * Unconditional multi-mana land group
 * Used for lands that always produce more than 1 mana (no board state dependency)
 */
export interface UnconditionalMultiManaGroup {
  /** Number of copies of this type in deck */
  count: number
  /** Bonus mana per land (e.g., Ancient Tomb produces 2, so delta=1) */
  delta: number
  /** Color mask of produced mana (for color fixing calculations) */
  producesMask?: number
}

/**
 * Mana profile of a deck for castability calculations
 */
export interface DeckManaProfile {
  /** Deck size (60 for constructed, 99 for Commander) */
  deckSize: number

  /** Total land count */
  totalLands: number

  /** Color sources from lands only */
  landColorSources: Partial<Record<LandManaColor, number>>

  /**
   * Unconditional multi-mana lands (v1.1)
   * Modeled as random variable - we don't assume all copies are in play
   *
   * Example: 4x Ancient Tomb = { count: 4, delta: 1 }
   *
   * Note: For v1.1, we support a single group for simplicity.
   * Multiple groups (Ancient Tomb + Bounce lands) would require
   * combinatorial sum which is expensive. Use simulation for complex cases.
   */
  unconditionalMultiMana?: UnconditionalMultiManaGroup

  /**
   * @deprecated v1.0 - Removed in v1.1
   * Was: deterministic bonus assuming all copies in play
   * Use unconditionalMultiMana instead for proper probabilistic model
   */
  bonusManaFromLands?: number

  /**
   * @deprecated v1.0 - Removed in v1.1
   * Was: deterministic colored bonus assuming all copies in play
   * Use unconditionalMultiMana.producesMask instead
   */
  bonusColoredMana?: Partial<Record<LandManaColor, number>>
}

// =============================================================================
// CONTEXT & CONFIGURATION
// =============================================================================

/**
 * Format presets for removal rates
 */
export type FormatPreset =
  | 'goldfish'    // 0% removal (testing only)
  | 'casual_edh'  // ~10% removal
  | 'standard'    // ~20% removal
  | 'modern'      // ~35% removal (Bolt the Bird)
  | 'legacy'      // ~40% removal
  | 'cedh'        // ~15% removal (less creature interaction)

/**
 * Removal rate presets by format
 */
export const FORMAT_REMOVAL_RATES: Record<FormatPreset, number> = {
  goldfish: 0.00,
  casual_edh: 0.10,
  standard: 0.20,
  modern: 0.35,
  legacy: 0.40,
  cedh: 0.15
}

/**
 * Context for accelerated castability calculation
 */
export interface AccelContext {
  /** On the play or draw */
  playDraw: 'PLAY' | 'DRAW'

  /**
   * Removal attrition rate per exposed turn (0-1)
   * Used for creature survival calculation: P_survive(n) = (1-r)^n
   */
  removalRate: number

  /**
   * Factor applied to removalRate for artifacts (default: 0.3)
   * Rocks are ~30% as likely to be removed as creatures
   * r_rock = removalRate * rockRemovalFactor
   */
  rockRemovalFactor?: number

  /**
   * @deprecated Use rockRemovalFactor instead
   * Default survival rate for non-creatures
   * Used when survivalBase not set on producer
   */
  defaultRockSurvival: number
}

// =============================================================================
// RESULT TYPES
// =============================================================================

/**
 * Basic castability result (P1/P2)
 */
export interface CastabilityResult {
  /** P1: Probability of having required color sources */
  p1: number

  /** P2: P1 weighted by probability of having enough lands */
  p2: number
}

/**
 * Extended result with acceleration data
 */
export interface AcceleratedCastabilityResult {
  /** Base castability (lands only) */
  base: CastabilityResult

  /** Castability with accelerators considered */
  withAcceleration: CastabilityResult

  /** Impact of acceleration (withAccel.p2 - base.p2) */
  accelerationImpact: number

  /** Earliest turn where cast becomes viable with acceleration */
  acceleratedTurn: number | null

  /** Names of key accelerators contributing to the improvement */
  keyAccelerators: string[]
}

// =============================================================================
// CACHE TYPES
// =============================================================================

/**
 * Cached producer entry for localStorage
 */
export interface CachedProducerEntry {
  /** The producer definition */
  def: ManaProducerDef

  /** ISO date when this entry was fetched */
  fetchedAt: string

  /** Source of the data */
  source: 'seed' | 'scryfall' | 'user'

  /** ISO date when this entry expires */
  expiresAt: string
}

/**
 * Complete localStorage cache structure for producers
 */
export interface ProducerCacheStorage {
  /** Cache version for migrations */
  version: string

  /** ISO date of last cleanup */
  lastCleanup: string

  /** Map of card names to cached entries */
  producers: Record<string, CachedProducerEntry>
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

/**
 * Interface for the mana producer service
 */
export interface IManaProducerService {
  /** Get a producer by name (from seed, cache, or Scryfall) */
  getProducer(cardName: string): Promise<ManaProducerDef | null>

  /** Check if a card is a known mana producer */
  isProducer(cardName: string): boolean

  /** Get all producers from a deck list */
  getProducersFromDeckList(deckList: Array<{ name: string; quantity: number }>): Promise<ProducerInDeck[]>

  /** Calculate accelerated castability for a spell */
  calculateAcceleratedCastability(
    deck: DeckManaProfile,
    spell: ManaCost,
    producers: ProducerInDeck[],
    ctx: AccelContext
  ): AcceleratedCastabilityResult
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert color letters to bitmask
 */
export function colorMaskFromLetters(letters: LandManaColor[]): ColorMask {
  return letters.reduce((m, c) => m | COLOR_MASK[c], 0)
}

/**
 * Check if a mask contains a specific color
 */
export function maskHasColor(mask: ColorMask, color: LandManaColor): boolean {
  return (mask & COLOR_MASK[color]) !== 0
}

/**
 * Get all colors in a mask
 */
export function colorsFromMask(mask: ColorMask): LandManaColor[] {
  const colors: LandManaColor[] = []
  for (const [color, bit] of Object.entries(COLOR_MASK)) {
    if ((mask & bit) !== 0) {
      colors.push(color as LandManaColor)
    }
  }
  return colors
}

/**
 * Calculate net mana per turn from a producer
 */
export function netManaPerTurn(producer: ManaProducerDef): number {
  return Math.max(0, producer.producesAmount - producer.activationTax)
}
