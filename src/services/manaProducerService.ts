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
    ManaProducerDef,
    ProducerCacheStorage,
    ProducerInDeck
} from '../types/manaProducers'
import { FORMAT_REMOVAL_RATES, colorMaskFromLetters } from '../types/manaProducers'
import { computeAcceleratedCastability, computeCastabilityByTurn } from './castability'

// =============================================================================
// CONSTANTS
// =============================================================================

const CACHE_KEY = 'manatuner_producer_cache'
const CACHE_VERSION = '1.0'
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
  set(cardName: string, def: ManaProducerDef, source: 'seed' | 'scryfall' | 'user' = 'scryfall'): void {
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
  private persistToStorage(cardName: string, def: ManaProducerDef, source: 'scryfall' | 'user'): void {
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      const cache: ProducerCacheStorage = stored
        ? JSON.parse(stored)
        : { version: CACHE_VERSION, lastCleanup: new Date().toISOString(), producers: {} }

      const entry: CachedProducerEntry = {
        def,
        fetchedAt: new Date().toISOString(),
        source,
        expiresAt: new Date(Date.now() + CACHE_TTL_MS).toISOString()
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
      fromScryfall: this.memoryCache.size - seedCount
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
 * Heuristic patterns for detecting mana producers from oracle text
 */
const MANA_PRODUCER_PATTERNS = [
  // Dorks
  { pattern: /\{T\}:\s*Add\s+\{([WUBRGC])\}/i, type: 'DORK' as const },
  { pattern: /\{T\}:\s*Add\s+one\s+mana\s+of\s+any\s+color/i, type: 'DORK' as const, producesAny: true },

  // Rocks
  { pattern: /\{T\}:\s*Add\s+\{C\}\{C\}/i, type: 'ROCK' as const, amount: 2 },
  { pattern: /\{T\}:\s*Add\s+\{C\}/i, type: 'ROCK' as const },

  // Rituals
  { pattern: /Add\s+\{([WUBRGC])\}\{([WUBRGC])\}\{([WUBRGC])\}/i, type: 'RITUAL' as const, amount: 3 },

  // Treasures
  { pattern: /create.*treasure/i, type: 'TREASURE' as const }
]

/**
 * Attempt to detect a mana producer from Scryfall data
 */
async function detectProducerFromScryfall(cardName: string): Promise<ManaProducerDef | null> {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`
    )

    if (!response.ok) return null

    const data = await response.json()
    const oracleText = data.oracle_text || ''
    const typeLine = data.type_line || ''
    const manaCost = data.mana_cost || ''

    // Check if it's a creature
    const isCreature = typeLine.toLowerCase().includes('creature')

    // Try to match patterns
    for (const p of MANA_PRODUCER_PATTERNS) {
      const match = oracleText.match(p.pattern)
      if (match) {
        // Parse mana cost
        const { generic, colors } = parseManaCost(manaCost)

        return {
          name: data.name,
          type: isCreature && p.type === 'ROCK' ? 'DORK' : p.type,
          castCostGeneric: generic,
          castCostColors: colors,
          delay: isCreature ? 1 : 0,
          isCreature,
          producesAmount: p.amount ?? 1,
          activationTax: 0,
          producesMask: p.producesAny ? 0b111111 : (match[1] ? colorMaskFromLetters([match[1] as any]) : 0b100000),
          producesAny: p.producesAny ?? false,
          oneShot: p.type === 'RITUAL',
          survivalBase: isCreature ? 0.75 : 0.98
        }
      }
    }

    return null
  } catch (e) {
    console.warn('Scryfall lookup failed:', e)
    return null
  }
}

/**
 * Parse a mana cost string into components
 */
function parseManaCost(cost: string): { generic: number; colors: Partial<Record<'W' | 'U' | 'B' | 'R' | 'G' | 'C', number>> } {
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
      defaultRockSurvival: 0.98
    }
  }

  /**
   * Calculate accelerated castability
   */
  calculateAcceleratedCastability(
    deck: DeckManaProfile,
    spell: ManaCost,
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
    spell: ManaCost,
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
export type { AccelContext, DeckManaProfile, FormatPreset, ManaCost, ProducerInDeck }

