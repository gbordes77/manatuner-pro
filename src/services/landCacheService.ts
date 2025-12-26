/**
 * Land Cache Service for ManaTuner Pro
 *
 * Multi-level caching system for land metadata:
 * 1. Memory cache (Map) - instant access, session only
 * 2. localStorage - persistent across sessions, 30-day TTL
 *
 * @version 1.0
 * @see docs/LAND_SYSTEM_REDESIGN.md
 */

import type {
    CachedLandEntry,
    ILandCacheService,
    LandCacheStats,
    LandCacheStorage,
    LandMetadata
} from '@/types/lands'

// =============================================================================
// CONSTANTS
// =============================================================================

/** localStorage key for the land cache */
const CACHE_KEY = 'manatuner_lands_cache'

/** Cache Time-To-Live in days */
const CACHE_TTL_DAYS = 30

/** Current cache version (for migrations) */
const CACHE_VERSION = '1.0'

/** Maximum entries to keep during emergency cleanup */
const MAX_ENTRIES_EMERGENCY = 100

/** Maximum entries before triggering cleanup */
const MAX_ENTRIES_BEFORE_CLEANUP = 500

// =============================================================================
// LAND CACHE SERVICE
// =============================================================================

/**
 * Service for caching land metadata with multi-level storage.
 * Uses memory cache for instant access and localStorage for persistence.
 */
class LandCacheService implements ILandCacheService {
  /** In-memory cache for instant access */
  private memoryCache: Map<string, LandMetadata> = new Map()

  /** Flag to track if cleanup has been run this session */
  private cleanupRan: boolean = false

  constructor() {
    // Run cleanup on first access if needed
    this.lazyCleanup()
  }

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Get a land from cache (memory → localStorage → null)
   * @param cardName - The exact card name to look up
   * @returns The land metadata or null if not found/expired
   */
  get(cardName: string): LandMetadata | null {
    // Normalize the card name
    const normalizedName = this.normalizeName(cardName)

    // 1. Check memory cache (instant)
    if (this.memoryCache.has(normalizedName)) {
      return this.memoryCache.get(normalizedName)!
    }

    // 2. Check localStorage
    const storage = this.getStorage()
    const cached = storage.lands[normalizedName]

    if (cached && !this.isExpired(cached.expiresAt)) {
      // Populate memory cache for future instant access
      this.memoryCache.set(normalizedName, cached.metadata)
      return cached.metadata
    }

    // Not found or expired
    return null
  }

  /**
   * Store a land in both cache levels
   * @param cardName - The exact card name
   * @param metadata - The land metadata to store
   * @param source - Source of the data (scryfall, pattern, seed)
   */
  set(
    cardName: string,
    metadata: LandMetadata,
    source: 'scryfall' | 'pattern' | 'seed'
  ): void {
    const normalizedName = this.normalizeName(cardName)

    // 1. Memory cache
    this.memoryCache.set(normalizedName, metadata)

    // 2. localStorage
    const storage = this.getStorage()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000)

    const entry: CachedLandEntry = {
      metadata,
      fetchedAt: now.toISOString(),
      source,
      expiresAt: expiresAt.toISOString()
    }

    storage.lands[normalizedName] = entry

    // Check if we need to trigger cleanup
    const entryCount = Object.keys(storage.lands).length
    if (entryCount > MAX_ENTRIES_BEFORE_CLEANUP) {
      this.cleanup()
    }

    this.saveStorage(storage)
  }

  /**
   * Check if a land is in cache and not expired
   * @param cardName - The exact card name
   * @returns True if the land is cached and valid
   */
  has(cardName: string): boolean {
    return this.get(cardName) !== null
  }

  /**
   * Clean up expired entries from localStorage
   * Also removes entries beyond the age limit to prevent bloat
   */
  cleanup(): void {
    const storage = this.getStorage()
    const now = new Date()
    let removedCount = 0

    for (const [name, entry] of Object.entries(storage.lands)) {
      if (this.isExpired(entry.expiresAt)) {
        delete storage.lands[name]
        // Also remove from memory cache
        this.memoryCache.delete(name)
        removedCount++
      }
    }

    storage.lastCleanup = now.toISOString()
    this.saveStorage(storage)
    this.cleanupRan = true

    if (removedCount > 0) {
      console.debug(`[LandCacheService] Cleaned up ${removedCount} expired entries`)
    }
  }

  /**
   * Get cache statistics for debugging and monitoring
   * @returns Cache statistics object
   */
  getStats(): LandCacheStats {
    const storage = this.getStorage()
    const bySource: Record<string, number> = {}

    for (const entry of Object.values(storage.lands)) {
      bySource[entry.source] = (bySource[entry.source] || 0) + 1
    }

    // Estimate storage size
    let storageSizeBytes: number | undefined
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        storageSizeBytes = new Blob([raw]).size
      }
    } catch {
      // Ignore errors
    }

    return {
      total: Object.keys(storage.lands).length,
      bySource,
      memorySize: this.memoryCache.size,
      storageSizeBytes
    }
  }

  /**
   * Clear all cache (both memory and localStorage)
   */
  clear(): void {
    this.memoryCache.clear()

    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (e) {
      console.warn('[LandCacheService] Failed to clear localStorage:', e)
    }

    console.debug('[LandCacheService] Cache cleared')
  }

  /**
   * Preload multiple lands into cache from seed data
   * @param lands - Map of card names to metadata
   */
  preloadFromSeed(lands: Record<string, Partial<LandMetadata>>): void {
    let loadedCount = 0

    for (const [name, partialMetadata] of Object.entries(lands)) {
      // Skip if already in cache (don't overwrite fresher data)
      if (this.has(name)) {
        continue
      }

      // Complete the metadata with defaults
      const metadata: LandMetadata = {
        name,
        category: partialMetadata.category || 'unknown',
        produces: partialMetadata.produces || [],
        producesAny: partialMetadata.producesAny || false,
        etbBehavior: partialMetadata.etbBehavior || { type: 'always_untapped' },
        isFetch: partialMetadata.isFetch || false,
        fetchTargets: partialMetadata.fetchTargets,
        isCreatureLand: partialMetadata.isCreatureLand || false,
        hasChannel: partialMetadata.hasChannel || false,
        isMDFC: partialMetadata.isMDFC,
        otherFace: partialMetadata.otherFace,
        basicLandTypes: partialMetadata.basicLandTypes,
        confidence: partialMetadata.confidence || 100
      }

      this.set(name, metadata, 'seed')
      loadedCount++
    }

    if (loadedCount > 0) {
      console.debug(`[LandCacheService] Preloaded ${loadedCount} lands from seed`)
    }
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Normalize a card name for consistent lookup
   */
  private normalizeName(name: string): string {
    // Trim whitespace and normalize case
    return name.trim()
  }

  /**
   * Get the storage object from localStorage
   */
  private getStorage(): LandCacheStorage {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as LandCacheStorage

        // Check version for migrations
        if (parsed.version === CACHE_VERSION) {
          return parsed
        }

        // Version mismatch - clear and start fresh
        console.debug('[LandCacheService] Cache version mismatch, clearing')
        localStorage.removeItem(CACHE_KEY)
      }
    } catch (e) {
      console.warn('[LandCacheService] Failed to read localStorage:', e)
    }

    // Return empty storage
    return this.createEmptyStorage()
  }

  /**
   * Save the storage object to localStorage
   */
  private saveStorage(storage: LandCacheStorage): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(storage))
    } catch (e) {
      console.warn('[LandCacheService] Failed to save to localStorage:', e)

      // localStorage might be full - try emergency cleanup
      this.emergencyCleanup()

      // Try again
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(storage))
      } catch {
        console.error('[LandCacheService] Failed to save even after cleanup')
      }
    }
  }

  /**
   * Create an empty storage object
   */
  private createEmptyStorage(): LandCacheStorage {
    return {
      version: CACHE_VERSION,
      lastCleanup: new Date().toISOString(),
      lands: {}
    }
  }

  /**
   * Check if a date string represents an expired entry
   */
  private isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date()
  }

  /**
   * Run cleanup lazily on first access if needed
   */
  private lazyCleanup(): void {
    if (this.cleanupRan) return

    const storage = this.getStorage()
    const lastCleanup = new Date(storage.lastCleanup)
    const now = new Date()
    const daysSinceCleanup = (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60 * 24)

    // Run cleanup if more than 7 days since last cleanup
    if (daysSinceCleanup > 7) {
      this.cleanup()
    } else {
      this.cleanupRan = true
    }
  }

  /**
   * Emergency cleanup when localStorage is full
   * Keeps only the most recently fetched entries
   */
  private emergencyCleanup(): void {
    console.warn('[LandCacheService] Running emergency cleanup')

    const storage = this.getStorage()
    const entries = Object.entries(storage.lands)
      .map(([name, entry]) => ({ name, entry }))
      .sort((a, b) =>
        new Date(b.entry.fetchedAt).getTime() - new Date(a.entry.fetchedAt).getTime()
      )
      .slice(0, MAX_ENTRIES_EMERGENCY)

    // Rebuild the lands object
    storage.lands = {}
    for (const { name, entry } of entries) {
      storage.lands[name] = entry
    }

    storage.lastCleanup = new Date().toISOString()

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(storage))
      console.debug(`[LandCacheService] Emergency cleanup kept ${entries.length} entries`)
    } catch {
      // If still failing, just clear everything
      console.error('[LandCacheService] Emergency cleanup failed, clearing all')
      localStorage.removeItem(CACHE_KEY)
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

/** Singleton instance of the land cache service */
export const landCacheService = new LandCacheService()

/** Export the class for testing */
export { LandCacheService }
