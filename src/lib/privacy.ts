/**
 * Simple Storage for ManatunerPro
 *
 * Lightweight local storage without encryption overhead.
 * Data stays in localStorage - simple and efficient.
 */

import { nanoid } from 'nanoid'

/**
 * Generates memorable user codes in format: ADJECTIVE-NOUN-NN
 */
export class UserCodeGenerator {
  private static adjectives = [
    'STORM', 'FIRE', 'BLUE', 'SAGE', 'SWIFT',
    'BOLD', 'WISE', 'PURE', 'DARK', 'LIGHT',
    'GRAND', 'WILD', 'CALM', 'SHARP', 'BRIGHT'
  ]

  private static nouns = [
    'MAGE', 'DECK', 'SPELL', 'MANA', 'LAND',
    'WIZARD', 'KNIGHT', 'DRAGON', 'PHOENIX', 'WOLF',
    'RAVEN', 'EAGLE', 'TIGER', 'BEAR', 'LION'
  ]

  static generate(): string {
    const adj = this.adjectives[Math.floor(Math.random() * this.adjectives.length)]
    const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)]
    const num = Math.floor(Math.random() * 99) + 1
    return `${adj}-${noun}-${num.toString().padStart(2, '0')}`
  }

  static validate(code: string): boolean {
    const pattern = /^[A-Z]{3,6}-[A-Z]{3,7}-\d{2}$/
    return pattern.test(code.toUpperCase())
  }
}

/**
 * Analysis record interface
 */
export interface AnalysisRecord {
  id: string
  deckName: string
  deckList: string
  analysis: any
  timestamp: number
  userCode?: string
  shareId?: string
  date?: string
  consistency?: number
}

/**
 * Simple Privacy Storage Management
 *
 * Stores analyses directly in localStorage without encryption.
 */
export class PrivacyStorage {
  private static readonly USER_CODE_KEY = 'manatuner_user_code'
  private static readonly ANALYSES_KEY = 'manatuner_analyses'

  /**
   * Generate or get user code
   */
  static getUserCode(): string {
    if (typeof window === 'undefined') return ''

    let userCode = localStorage.getItem(this.USER_CODE_KEY)
    if (!userCode) {
      userCode = UserCodeGenerator.generate()
      localStorage.setItem(this.USER_CODE_KEY, userCode)
    }
    return userCode
  }

  /**
   * Sets a custom user code (for import/restore functionality)
   */
  static setUserCode(code: string): void {
    if (typeof window === 'undefined') return
    if (!UserCodeGenerator.validate(code)) {
      throw new Error('Invalid user code format')
    }
    localStorage.setItem(this.USER_CODE_KEY, code.toUpperCase())
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
      userCode: this.getUserCode(),
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
      // Handle both legacy encrypted format and direct array
      if (Array.isArray(parsed)) {
        return parsed
      }
      // If it's a wrapper object (from old encrypted format), try to extract data
      if (parsed.data && !parsed.encrypted) {
        return JSON.parse(parsed.data)
      }
      // If encrypted, we can't read it - return empty (data loss but honest)
      if (parsed.encrypted) {
        console.warn('Found encrypted data - clearing legacy encrypted storage')
        localStorage.removeItem(this.ANALYSES_KEY)
        return []
      }
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
    localStorage.removeItem(this.USER_CODE_KEY)
    localStorage.removeItem(this.ANALYSES_KEY)
    localStorage.removeItem('manatuner_privacy_mode') // Clean up old key
    localStorage.removeItem('userCode') // Legacy cleanup
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
   * Always returns true (no encryption to verify)
   */
  static async verifyUserCode(): Promise<boolean> {
    return true
  }
}

// Export convenience functions
export const getUserCode = () => PrivacyStorage.getUserCode()
export const getMyAnalyses = () => PrivacyStorage.getMyAnalyses()
export const getMyAnalysesAsync = () => PrivacyStorage.getMyAnalysesAsync()
export const exportAnalyses = () => PrivacyStorage.exportAnalyses()
export const exportAnalysesAsync = () => PrivacyStorage.exportAnalysesAsync()
export const clearAllLocalData = () => PrivacyStorage.clearAllLocalData()
export const saveAnalysisLocal = (analysis: Partial<AnalysisRecord>) => PrivacyStorage.saveAnalysis(analysis as any)
export const saveAnalysisLocalAsync = (analysis: Partial<AnalysisRecord>) => PrivacyStorage.saveAnalysisAsync(analysis as any)
export const deleteLocalAnalysis = (id: string) => PrivacyStorage.deleteAnalysis(id)
export const deleteLocalAnalysisAsync = (id: string) => PrivacyStorage.deleteAnalysisAsync(id)

// Legacy support
export const generateUserCode = () => UserCodeGenerator.generate()
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
