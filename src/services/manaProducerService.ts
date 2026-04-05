/**
 * Mana Producer Service
 *
 * Manages mana producer detection, caching, and castability calculations.
 * Follows the same pattern as landService.ts.
 *
 * @version 1.0
 * @see docs/EXPERT_ANALYSES.md
 */

import { MANA_PRODUCER_SEED, isInProducerSeed } from '../data/manaProducerSeed'
import type {
  AccelContext,
  AcceleratedCastabilityResult,
  CachedProducerEntry,
  DeckManaProfile,
  FormatPreset,
  ManaCost,
  ProducerManaCost,
  ManaProducerDef,
  ProducerCacheStorage,
  ProducerInDeck,
} from '../types/manaProducers'
import { FORMAT_REMOVAL_RATES, colorMaskFromLetters } from '../types/manaProducers'
import { computeAcceleratedCastability, computeCastabilityByTurn } from './castability'

// =============================================================================
// CONSTANTS
// =============================================================================

const CACHE_KEY = 'manatuner_producer_cache'
const CACHE_VERSION = '2.0' // Bumped: v2.0 uses Scryfall produced_mana + improved oracle analysis
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// =============================================================================
// CACHE SERVICE
// =============================================================================

class ProducerCacheService {
  private memoryCache: Map<string, ManaProducerDef> = new Map()
  private initialized = false

  /**
   * Initialize cache from localStorage and seed data
   */
  initialize(): void {
    if (this.initialized) return

    // Load seed data into memory cache
    for (const [name, def] of Object.entries(MANA_PRODUCER_SEED)) {
      this.memoryCache.set(name.toLowerCase(), def)
    }

    // Load persisted cache from localStorage
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) {
        const cache: ProducerCacheStorage = JSON.parse(stored)
        if (cache.version === CACHE_VERSION) {
          const now = Date.now()
          for (const [name, entry] of Object.entries(cache.producers)) {
            // Skip expired entries
            if (new Date(entry.expiresAt).getTime() < now) continue
            // Don't overwrite seed data
            if (!this.memoryCache.has(name.toLowerCase())) {
              this.memoryCache.set(name.toLowerCase(), entry.def)
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load producer cache:', e)
    }

    this.initialized = true
  }

  /**
   * Get a producer from cache
   */
  get(cardName: string): ManaProducerDef | null {
    this.initialize()
    return this.memoryCache.get(cardName.toLowerCase()) ?? null
  }

  /**
   * Check if a producer exists in cache
   */
  has(cardName: string): boolean {
    this.initialize()
    return this.memoryCache.has(cardName.toLowerCase())
  }

  /**
   * Add a producer to cache
   */
  set(
    cardName: string,
    def: ManaProducerDef,
    source: 'seed' | 'scryfall' | 'user' = 'scryfall'
  ): void {
    this.initialize()
    this.memoryCache.set(cardName.toLowerCase(), def)

    // Persist to localStorage (but not seed data, that's always in memory)
    if (source !== 'seed') {
      this.persistToStorage(cardName, def, source)
    }
  }

  /**
   * Persist a single entry to localStorage
   */
  private persistToStorage(
    cardName: string,
    def: ManaProducerDef,
    source: 'scryfall' | 'user'
  ): void {
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      const cache: ProducerCacheStorage = stored
        ? JSON.parse(stored)
        : { version: CACHE_VERSION, lastCleanup: new Date().toISOString(), producers: {} }

      const entry: CachedProducerEntry = {
        def,
        fetchedAt: new Date().toISOString(),
        source,
        expiresAt: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
      }

      cache.producers[cardName.toLowerCase()] = entry
      cache.version = CACHE_VERSION

      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch (e) {
      console.warn('Failed to persist producer cache:', e)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { total: number; fromSeed: number; fromScryfall: number } {
    this.initialize()
    const seedCount = Object.keys(MANA_PRODUCER_SEED).length
    return {
      total: this.memoryCache.size,
      fromSeed: seedCount,
      fromScryfall: this.memoryCache.size - seedCount,
    }
  }

  /**
   * Clear all non-seed cache entries
   */
  clearScryfall(): void {
    this.initialize()

    // Remove non-seed entries from memory
    for (const [name] of this.memoryCache) {
      if (!isInProducerSeed(name)) {
        this.memoryCache.delete(name)
      }
    }

    // Clear localStorage
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (e) {
      console.warn('Failed to clear producer cache:', e)
    }
  }
}

// Singleton instance
export const producerCacheService = new ProducerCacheService()

// =============================================================================
// SCRYFALL DETECTION
// =============================================================================

/**
 * Analyze oracle text to detect mana production capabilities.
 *
 * Covers all common mana producer patterns:
 * - {T}: Add {X}                    (dorks, rocks, basic mana)
 * - {T}: Add {X} or {Y}            (talismans, multi-color rocks)
 * - {T}: Add {C}{C}                 (Sol Ring, etc.)
 * - {T}, Pay {E}: Add ...           (energy-based: Solar Transformer)
 * - Remove a counter: Add ...       (charge counters: Pentad Prism)
 * - Add one mana of any color       (any-color producers)
 * - Add {X}{X}{X}                   (rituals: Dark Ritual, Irencrag Feat)
 * - Create ... Treasure             (treasure makers)
 * - Sacrifice: Add ...              (one-shot mana like Lotus Petal)
 */
function analyzeOracleForMana(oracleText: string): {
  type: 'DORK' | 'ROCK' | 'RITUAL' | 'TREASURE' | null
  producesAny: boolean
  colorLetters: string[]
  amount: number
  oneShot: boolean
} {
  const result = {
    type: null as 'DORK' | 'ROCK' | 'RITUAL' | 'TREASURE' | null,
    producesAny: false,
    colorLetters: [] as string[],
    amount: 1,
    oneShot: false,
  }

  if (!oracleText) return result

  const colors = new Set<string>()

  // 1. Detect "any color" production (highest priority)
  if (/add\s+one\s+mana\s+of\s+any\s+(?:color|type)/i.test(oracleText)) {
    result.producesAny = true
    result.type = 'ROCK'
  }

  // 2. Extract ALL "Add" clauses and find mana symbols in them
  const addClauses = oracleText.match(/add\b[^.]*?\./gi) || []
  for (const clause of addClauses) {
    // Count consecutive mana symbols for amount (e.g., Add {R}{R}{R} = 3)
    const consecutive = clause.match(/\{([WUBRGC])\}(?:\{([WUBRGC])\})?(?:\{([WUBRGC])\})?/i)
    if (consecutive) {
      const symbols = [consecutive[1], consecutive[2], consecutive[3]].filter(Boolean)
      if (symbols.length >= 3) {
        result.amount = Math.max(result.amount, symbols.length)
        result.type = 'RITUAL'
        result.oneShot = true
      }
    }

    // Extract all individual color symbols from the clause
    const symbolMatches = clause.matchAll(/\{([WUBRGC])\}/gi)
    for (const m of symbolMatches) {
      colors.add(m[1].toUpperCase())
    }
  }

  // 3. Detect producer type if not already set
  if (!result.type) {
    // {T}: Add ... (standard tap ability)
    if (/\{T\}[^.]*?:\s*add\b/i.test(oracleText)) {
      result.type = 'ROCK'
    }
    // Remove a counter: Add ... (Pentad Prism, Gemstone Mine)
    else if (/remove\s+a\s+.*?counter[^.]*?:\s*add\b/i.test(oracleText)) {
      result.type = 'ROCK'
      result.oneShot = true // charge-counter based = limited uses
    }
    // Sacrifice: Add ... (Lotus Petal, etc.)
    else if (/sacrifice[^.]*?:\s*add\b/i.test(oracleText)) {
      result.type = 'ROCK'
      result.oneShot = true
    }
    // Create Treasure tokens
    else if (/create.*treasure/i.test(oracleText)) {
      result.type = 'TREASURE'
      result.producesAny = true
    }
  }

  // 4. Check for {C}{C} production (Sol Ring type)
  if (/add\s+\{C\}\{C\}/i.test(oracleText)) {
    result.amount = 2
    colors.add('C')
  }

  result.colorLetters = Array.from(colors)
  return result
}

/**
 * Attempt to detect a mana producer from Scryfall data.
 *
 * Strategy:
 * 1. Oracle text analysis to detect producer TYPE (rock, dork, ritual, etc.)
 * 2. Scryfall `produced_mana` field as PRIMARY source for colors (authoritative)
 * 3. Oracle regex as FALLBACK for colors (if produced_mana is missing)
 */
async function detectProducerFromScryfall(cardName: string): Promise<ManaProducerDef | null> {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`
    )

    if (!response.ok) return null

    const data = await response.json()
    // For DFCs, use front face oracle text (the castable side)
    let oracleText = data.oracle_text || ''
    if (data.card_faces) {
      oracleText = data.card_faces[0]?.oracle_text || oracleText
    }
    const typeLine = data.type_line || ''
    const manaCost = data.mana_cost || data.card_faces?.[0]?.mana_cost || ''

    const isCreature = typeLine.toLowerCase().includes('creature')

    // Step 1: Analyze oracle text to detect producer type
    const analysis = analyzeOracleForMana(oracleText)

    if (!analysis.type) return null

    const { generic, colors } = parseManaCost(manaCost)

    // Step 2: Use Scryfall's produced_mana as primary color source
    // This is authoritative — Scryfall computes it from all card abilities
    const scryfallProducedMana: string[] | undefined = data.produced_mana
    let producesAny = analysis.producesAny
    let producesMask: number

    if (scryfallProducedMana && scryfallProducedMana.length > 0) {
      // Scryfall produced_mana is available — use it
      const validColors = scryfallProducedMana.filter((c): c is 'W' | 'U' | 'B' | 'R' | 'G' | 'C' =>
        ['W', 'U', 'B', 'R', 'G', 'C'].includes(c)
      )
      // If it produces all 5 colors, mark as "any color"
      const hasAllFive = (['W', 'U', 'B', 'R', 'G'] as const).every((c) => validColors.includes(c))
      if (hasAllFive) producesAny = true

      producesMask = producesAny
        ? 0b111111
        : validColors.length > 0
          ? colorMaskFromLetters(validColors as any)
          : 0b100000
    } else {
      // Fallback: use oracle text regex extraction
      const validColors = analysis.colorLetters.filter(
        (c): c is 'W' | 'U' | 'B' | 'R' | 'G' | 'C' => ['W', 'U', 'B', 'R', 'G', 'C'].includes(c)
      )
      producesMask = producesAny
        ? 0b111111
        : validColors.length > 0
          ? colorMaskFromLetters(validColors as any)
          : 0b100000
    }

    return {
      name: data.name,
      type: isCreature && analysis.type === 'ROCK' ? 'DORK' : analysis.type,
      castCostGeneric: generic,
      castCostColors: colors,
      delay: isCreature ? 1 : 0,
      isCreature,
      producesAmount: analysis.amount,
      activationTax: 0,
      producesMask,
      producesAny,
      oneShot: analysis.oneShot,
    }
  } catch (e) {
    console.warn('Scryfall lookup failed:', e)
    return null
  }
}

/**
 * Parse a mana cost string into components
 */
function parseManaCost(cost: string): {
  generic: number
  colors: Partial<Record<'W' | 'U' | 'B' | 'R' | 'G' | 'C', number>>
} {
  const colors: Partial<Record<'W' | 'U' | 'B' | 'R' | 'G' | 'C', number>> = {}
  let generic = 0

  const matches = cost.match(/\{([^}]+)\}/g) || []
  for (const m of matches) {
    const inner = m.slice(1, -1)
    if (/^\d+$/.test(inner)) {
      generic += parseInt(inner, 10)
    } else if (['W', 'U', 'B', 'R', 'G', 'C'].includes(inner)) {
      const c = inner as 'W' | 'U' | 'B' | 'R' | 'G' | 'C'
      colors[c] = (colors[c] ?? 0) + 1
    }
  }

  return { generic, colors }
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

class ManaProducerService {
  /**
   * Get a producer by name (from seed, cache, or Scryfall)
   */
  async getProducer(cardName: string): Promise<ManaProducerDef | null> {
    // Check cache first (includes seed)
    const cached = producerCacheService.get(cardName)
    if (cached) return cached

    // Try Scryfall detection
    const detected = await detectProducerFromScryfall(cardName)
    if (detected) {
      producerCacheService.set(cardName, detected, 'scryfall')
      return detected
    }

    return null
  }

  /**
   * Check if a card is a known mana producer (sync, cache only)
   */
  isProducer(cardName: string): boolean {
    return producerCacheService.has(cardName)
  }

  /**
   * Get all producers from a deck list
   */
  async getProducersFromDeckList(
    deckList: Array<{ name: string; quantity: number }>
  ): Promise<ProducerInDeck[]> {
    const producers: ProducerInDeck[] = []

    for (const card of deckList) {
      const def = await this.getProducer(card.name)
      if (def) {
        producers.push({ def, copies: card.quantity })
      }
    }

    return producers
  }

  /**
   * Quick sync check for producers from deck list
   */
  getProducersFromDeckListSync(
    deckList: Array<{ name: string; quantity: number }>
  ): ProducerInDeck[] {
    const producers: ProducerInDeck[] = []

    for (const card of deckList) {
      const def = producerCacheService.get(card.name)
      if (def) {
        producers.push({ def, copies: card.quantity })
      }
    }

    return producers
  }

  /**
   * Create default context for calculations
   */
  createDefaultContext(
    format: FormatPreset = 'modern',
    playDraw: 'PLAY' | 'DRAW' = 'PLAY'
  ): AccelContext {
    return {
      playDraw,
      removalRate: FORMAT_REMOVAL_RATES[format],
      defaultRockSurvival: 0.98,
    }
  }

  /**
   * Calculate accelerated castability
   */
  calculateAcceleratedCastability(
    deck: DeckManaProfile,
    spell: ProducerManaCost,
    producers: ProducerInDeck[],
    ctx: AccelContext
  ): AcceleratedCastabilityResult {
    return computeAcceleratedCastability(deck, spell, producers, ctx)
  }

  /**
   * Calculate castability across multiple turns
   */
  calculateCastabilityByTurn(
    deck: DeckManaProfile,
    spell: ProducerManaCost,
    producers: ProducerInDeck[],
    ctx: AccelContext,
    maxTurn: number = 7
  ) {
    return computeCastabilityByTurn(deck, spell, producers, ctx, maxTurn)
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return producerCacheService.getStats()
  }
}

// Singleton instance
export const manaProducerService = new ManaProducerService()

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export { FORMAT_REMOVAL_RATES }
export type {
  AccelContext,
  DeckManaProfile,
  FormatPreset,
  ProducerManaCost,
  ManaCost,
  ProducerInDeck,
}
