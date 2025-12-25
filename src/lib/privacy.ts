/**
 * Simple Storage for ManatunerPro
 *
 * Lightweight local storage - simple and efficient.
 */

import { nanoid } from 'nanoid'

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

/**
 * Simple Storage Management
 *
 * Stores analyses directly in localStorage.
 */
export class PrivacyStorage {
  private static readonly ANALYSES_KEY = 'manatuner_analyses'

  /**
   * Saves an analysis
   */
  static saveAnalysis(analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>): string {
    const analyses = this.getMyAnalyses()
    const record: AnalysisRecord = {
      ...analysis,
      id: nanoid(),
      timestamp: Date.now(),
      date: new Date().toISOString()
    }

    analyses.unshift(record) // Add to beginning
    const trimmed = analyses.slice(0, 50) // Keep only last 50

    localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(trimmed))
    return record.id
  }

  /**
   * Retrieves all analyses
   */
  static getMyAnalyses(): AnalysisRecord[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.ANALYSES_KEY)
    if (!stored) return []

    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
      // Handle legacy formats - just clear them
      console.warn('Found legacy data format - clearing storage')
      localStorage.removeItem(this.ANALYSES_KEY)
      return []
    } catch {
      return []
    }
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
  static async saveAnalysisAsync(analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>): Promise<string> {
    return this.saveAnalysis(analysis)
  }

  /**
   * Deletes an analysis
   */
  static deleteAnalysis(id: string): void {
    if (typeof window === 'undefined') return

    const analyses = this.getMyAnalyses()
    const filtered = analyses.filter(a => a.id !== id)
    localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(filtered))
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

    const analyses = JSON.parse(data)
    if (!Array.isArray(analyses)) {
      throw new Error('Invalid analysis data format')
    }

    localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(analyses))
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
export const saveAnalysisLocal = (analysis: Partial<AnalysisRecord>) => PrivacyStorage.saveAnalysis(analysis as any)
export const saveAnalysisLocalAsync = (analysis: Partial<AnalysisRecord>) => PrivacyStorage.saveAnalysisAsync(analysis as any)
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
