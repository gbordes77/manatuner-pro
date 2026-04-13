/**
 * Simple Storage for ManatunerPro
 *
 * Lightweight local storage - simple and efficient.
 */

import { nanoid } from 'nanoid'
import { z } from 'zod'

/**
 * Analysis record interface
 */
export interface AnalysisRecord {
  id: string
  deckName: string
  deckList: string
  analysis: any
  timestamp: number
  shareId?: string
  date?: string
  consistency?: number
}

const analysisRecordSchema = z.object({
  id: z.string(),
  deckName: z.string(),
  deckList: z.string(),
  analysis: z.unknown(),
  timestamp: z.number(),
  shareId: z.string().optional(),
  date: z.string().optional(),
  consistency: z.number().optional(),
})

const importSchema = z.array(analysisRecordSchema)

/**
 * Simple Storage Management
 *
 * Stores analyses directly in localStorage.
 *
 * NOTE (2026-04-12): the legacy hyphen-separated key `manatuner-analyses`
 * (used by an old hook) is migrated into the canonical `manatuner_analyses`
 * key on read, so users with split history don't lose data.
 */
export class PrivacyStorage {
  private static readonly ANALYSES_KEY = 'manatuner_analyses'
  private static readonly LEGACY_KEY = 'manatuner-analyses'
  private static readonly MAX_RECORDS = 50

  /**
   * Persists an analyses array with a quota-exceeded fallback: if
   * localStorage is full, drop the oldest records and retry once.
   */
  private static persist(records: AnalysisRecord[]): void {
    const serialize = (items: AnalysisRecord[]) =>
      localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(items))
    try {
      serialize(records)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        // Aggressively trim until it fits, keep at least the newest 10.
        let attempt = records.slice(0, Math.max(10, Math.floor(records.length / 2)))
        while (attempt.length > 0) {
          try {
            serialize(attempt)
            return
          } catch {
            attempt = attempt.slice(0, Math.floor(attempt.length / 2))
          }
        }
      }
      throw err
    }
  }

  /**
   * Saves an analysis
   */
  static saveAnalysis(analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>): string {
    const analyses = this.getMyAnalyses()
    const record: AnalysisRecord = {
      ...analysis,
      id: nanoid(),
      timestamp: Date.now(),
      date: new Date().toISOString(),
    }

    analyses.unshift(record) // Add to beginning
    const trimmed = analyses.slice(0, this.MAX_RECORDS)
    this.persist(trimmed)
    return record.id
  }

  /**
   * Retrieves all analyses, merging legacy `manatuner-analyses` (hyphen) data
   * on first read and then removing the legacy key. This prevents the data
   * duplication the 2026-04-12 audit flagged.
   */
  static getMyAnalyses(): AnalysisRecord[] {
    if (typeof window === 'undefined') return []

    const readKey = (key: string): AnalysisRecord[] => {
      const raw = localStorage.getItem(key)
      if (!raw) return []
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? (parsed as AnalysisRecord[]) : []
      } catch {
        return []
      }
    }

    const current = readKey(this.ANALYSES_KEY)
    const legacy = readKey(this.LEGACY_KEY)

    if (legacy.length === 0) return current

    // One-time migration: merge legacy into canonical store (deduplicate by id)
    const seen = new Set<string>(current.map((r) => r.id))
    const merged = [...current]
    for (const record of legacy) {
      if (record?.id && !seen.has(record.id)) {
        merged.push(record)
        seen.add(record.id)
      }
    }
    merged.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    const trimmed = merged.slice(0, this.MAX_RECORDS)

    try {
      this.persist(trimmed)
      localStorage.removeItem(this.LEGACY_KEY)
    } catch {
      // If persist fails (quota), still return merged view in-memory
    }
    return trimmed
  }

  /**
   * Async version for compatibility
   */
  static async getMyAnalysesAsync(): Promise<AnalysisRecord[]> {
    return this.getMyAnalyses()
  }

  /**
   * Async save for compatibility
   */
  static async saveAnalysisAsync(
    analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>
  ): Promise<string> {
    return this.saveAnalysis(analysis)
  }

  /**
   * Deletes an analysis.
   * Audit fix M2 (2026-04-13): use `persist()` instead of raw `setItem` so the
   * QuotaExceededError fallback is honored even on iOS Safari private mode
   * where the quota can be revoked between tabs.
   */
  static deleteAnalysis(id: string): void {
    if (typeof window === 'undefined') return

    const analyses = this.getMyAnalyses()
    const filtered = analyses.filter((a) => a.id !== id)
    this.persist(filtered)
  }

  /**
   * Async delete for compatibility
   */
  static async deleteAnalysisAsync(id: string): Promise<void> {
    this.deleteAnalysis(id)
  }

  /**
   * Clears all local data
   */
  static clearAllLocalData(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.ANALYSES_KEY)
    localStorage.removeItem(this.LEGACY_KEY)
    // Clean up legacy keys
    localStorage.removeItem('manatuner_user_code')
    localStorage.removeItem('manatuner_privacy_mode')
    localStorage.removeItem('userCode')
  }

  /**
   * Exports analyses
   */
  static exportAnalyses(): string {
    const analyses = this.getMyAnalyses()
    return JSON.stringify(analyses, null, 2)
  }

  /**
   * Async export for compatibility
   */
  static async exportAnalysesAsync(): Promise<string> {
    return this.exportAnalyses()
  }

  /**
   * Imports analyses
   */
  static importAnalyses(data: string): void {
    if (typeof window === 'undefined') return

    let parsed: unknown
    try {
      parsed = JSON.parse(data)
    } catch {
      throw new Error('Invalid JSON data')
    }

    const result = importSchema.safeParse(parsed)
    if (!result.success) {
      throw new Error('Invalid analysis data format')
    }

    // Audit fix M2 (2026-04-13): route through persist() for quota fallback.
    // Cast is safe — Zod has just validated the shape; `analysis: z.unknown()`
    // narrows to `unknown | undefined` in TS inference, but the runtime data
    // matches `AnalysisRecord` by construction.
    this.persist(result.data as AnalysisRecord[])
  }

  /**
   * Async import for compatibility
   */
  static async importAnalysesAsync(data: string): Promise<void> {
    this.importAnalyses(data)
  }

  /**
   * Always returns true (for compatibility)
   */
  static async verifyUserCode(): Promise<boolean> {
    return true
  }
}

// Export convenience functions
export const getMyAnalyses = () => PrivacyStorage.getMyAnalyses()
export const getMyAnalysesAsync = () => PrivacyStorage.getMyAnalysesAsync()
export const exportAnalyses = () => PrivacyStorage.exportAnalyses()
export const exportAnalysesAsync = () => PrivacyStorage.exportAnalysesAsync()
export const clearAllLocalData = () => PrivacyStorage.clearAllLocalData()
export const saveAnalysisLocal = (analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>) =>
  PrivacyStorage.saveAnalysis(analysis)
export const saveAnalysisLocalAsync = (analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>) =>
  PrivacyStorage.saveAnalysisAsync(analysis)
export const deleteLocalAnalysis = (id: string) => PrivacyStorage.deleteAnalysis(id)
export const deleteLocalAnalysisAsync = (id: string) => PrivacyStorage.deleteAnalysisAsync(id)

// Legacy support for file import
export const importAnalyses = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        PrivacyStorage.importAnalyses(data)
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
