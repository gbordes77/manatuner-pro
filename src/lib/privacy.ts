/**
 * Privacy-First Architecture for ManatunerPro
 *
 * Zero-Knowledge system with AES-256-GCM encryption.
 * All deck data is encrypted client-side before storage.
 * Even developers cannot access user decks without the user's code.
 */

import { nanoid } from 'nanoid'
import {
    decryptObject,
    EncryptionService,
    encryptObject,
    hashData
} from './encryption'

// Re-export encryption utilities for convenience
export { hashData, isEncrypted } from './encryption'

/**
 * Legacy encryption class - kept for backward compatibility
 * @deprecated Use the new encryption module instead
 */
export class ClientEncryption {
  private static encoder = new TextEncoder()
  private static decoder = new TextDecoder()

  // Generate a unique user key
  static generateUserKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Legacy XOR encryption - only used for decrypting old data
  static encrypt(text: string, key: string): string {
    const textBytes = this.encoder.encode(text)
    const keyBytes = this.encoder.encode(key)
    const encrypted = new Uint8Array(textBytes.length)

    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length]
    }

    let binary = '';
    for (let i = 0; i < encrypted.length; i++) {
      binary += String.fromCharCode(encrypted[i]);
    }
    return btoa(binary)
  }

  // Legacy XOR decryption - only used for migrating old data
  static decrypt(encryptedText: string, key: string): string {
    try {
      const encrypted = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      )
      const keyBytes = this.encoder.encode(key)
      const decrypted = new Uint8Array(encrypted.length)

      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length]
      }

      return this.decoder.decode(decrypted)
    } catch {
      return ''
    }
  }

  // Create hash for server-side lookup (one-way)
  static async createHash(text: string): Promise<string> {
    return hashData(text)
  }
}

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
  isPrivate: boolean
  userCode?: string
  shareId?: string
  date?: string
  consistency?: number
}

/**
 * Encrypted storage wrapper for localStorage
 */
interface EncryptedStorageData {
  version: number
  encrypted: boolean
  data: string
}

/**
 * Privacy Storage Management with AES-256-GCM Encryption
 *
 * All sensitive data (deck lists, analyses) are encrypted before storage.
 * The user code serves as the encryption key derivation source.
 */
export class PrivacyStorage {
  private static readonly USER_CODE_KEY = 'manatuner_user_code'
  private static readonly ANALYSES_KEY = 'manatuner_analyses'
  private static readonly PRIVACY_MODE_KEY = 'manatuner_privacy_mode'
  private static readonly STORAGE_VERSION = 2 // Version 2 = AES-256-GCM encrypted

  private static encryptionService: EncryptionService | null = null

  /**
   * Gets or initializes the encryption service
   */
  private static getEncryptionService(): EncryptionService {
    if (!this.encryptionService) {
      const userCode = this.getUserCode()
      this.encryptionService = new EncryptionService(userCode)
    }
    return this.encryptionService
  }

  /**
   * Resets the encryption service (e.g., when user code changes)
   */
  private static resetEncryptionService(): void {
    this.encryptionService = null
  }

  /**
   * Generate or get user code
   * The user code is stored in plain text as it's needed for decryption
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
    this.resetEncryptionService()
  }

  // Privacy mode management
  static getPrivacyMode(): boolean {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(this.PRIVACY_MODE_KEY) === 'true'
  }

  static setPrivacyMode(enabled: boolean): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.PRIVACY_MODE_KEY, enabled.toString())
  }

  /**
   * Checks if stored data is in legacy (unencrypted) format
   */
  private static isLegacyFormat(stored: string): boolean {
    try {
      const parsed = JSON.parse(stored)
      // Legacy format is a direct array of analyses
      return Array.isArray(parsed)
    } catch {
      return false
    }
  }

  /**
   * Migrates legacy unencrypted data to encrypted format
   */
  private static async migrateLegacyData(legacyData: AnalysisRecord[]): Promise<void> {
    const userCode = this.getUserCode()

    // Encrypt the legacy data
    const encryptedData = await encryptObject(legacyData, userCode)

    const storageWrapper: EncryptedStorageData = {
      version: this.STORAGE_VERSION,
      encrypted: true,
      data: encryptedData
    }

    localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(storageWrapper))
  }

  /**
   * Saves an analysis with encryption
   */
  static async saveAnalysisAsync(analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>): Promise<string> {
    const analyses = await this.getMyAnalysesAsync()
    const record: AnalysisRecord = {
      ...analysis,
      id: nanoid(),
      timestamp: Date.now(),
      userCode: this.getUserCode(),
      date: new Date().toISOString()
    }

    analyses.unshift(record) // Add to beginning
    const trimmed = analyses.slice(0, 50) // Keep only last 50

    // Encrypt and store
    const userCode = this.getUserCode()
    const encryptedData = await encryptObject(trimmed, userCode)

    const storageWrapper: EncryptedStorageData = {
      version: this.STORAGE_VERSION,
      encrypted: true,
      data: encryptedData
    }

    localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(storageWrapper))
    return record.id
  }

  /**
   * Synchronous save for backward compatibility
   * Note: This queues the encryption operation
   */
  static saveAnalysis(analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>): string {
    const record: AnalysisRecord = {
      ...analysis,
      id: nanoid(),
      timestamp: Date.now(),
      userCode: this.getUserCode(),
      date: new Date().toISOString()
    }

    // Queue the async encryption
    this.getMyAnalysesAsync().then(analyses => {
      analyses.unshift(record)
      const trimmed = analyses.slice(0, 50)

      const userCode = this.getUserCode()
      encryptObject(trimmed, userCode).then(encryptedData => {
        const storageWrapper: EncryptedStorageData = {
          version: this.STORAGE_VERSION,
          encrypted: true,
          data: encryptedData
        }
        localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(storageWrapper))
      })
    })

    return record.id
  }

  /**
   * Retrieves analyses with automatic decryption
   */
  static async getMyAnalysesAsync(): Promise<AnalysisRecord[]> {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.ANALYSES_KEY)
    if (!stored) return []

    try {
      // Check for legacy format (unencrypted array)
      if (this.isLegacyFormat(stored)) {
        const legacyData = JSON.parse(stored) as AnalysisRecord[]
        // Migrate to encrypted format
        await this.migrateLegacyData(legacyData)
        return legacyData
      }

      // Parse the storage wrapper
      const wrapper = JSON.parse(stored) as EncryptedStorageData

      if (!wrapper.encrypted) {
        // Unencrypted wrapper format (shouldn't happen but handle it)
        return JSON.parse(wrapper.data) as AnalysisRecord[]
      }

      // Decrypt the data
      const userCode = this.getUserCode()
      const analyses = await decryptObject<AnalysisRecord[]>(wrapper.data, userCode)
      return analyses
    } catch (error) {
      console.error('Failed to decrypt analyses:', error)
      // If decryption fails, the data might be corrupted or the user code changed
      return []
    }
  }

  /**
   * Synchronous getter for backward compatibility
   * Returns cached data or empty array
   */
  static getMyAnalyses(): AnalysisRecord[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.ANALYSES_KEY)
    if (!stored) return []

    try {
      // Check for legacy format
      if (this.isLegacyFormat(stored)) {
        return JSON.parse(stored) as AnalysisRecord[]
      }

      // For encrypted data, we need async decryption
      // Return empty and trigger async load
      const wrapper = JSON.parse(stored) as EncryptedStorageData
      if (wrapper.encrypted) {
        // Can't decrypt synchronously, return empty
        // The caller should use getMyAnalysesAsync() instead
        console.warn('Synchronous access to encrypted data - use getMyAnalysesAsync() instead')
        return []
      }

      return JSON.parse(wrapper.data) as AnalysisRecord[]
    } catch {
      return []
    }
  }

  /**
   * Deletes an analysis
   */
  static async deleteAnalysisAsync(id: string): Promise<void> {
    if (typeof window === 'undefined') return

    const analyses = await this.getMyAnalysesAsync()
    const filtered = analyses.filter(a => a.id !== id)

    const userCode = this.getUserCode()
    const encryptedData = await encryptObject(filtered, userCode)

    const storageWrapper: EncryptedStorageData = {
      version: this.STORAGE_VERSION,
      encrypted: true,
      data: encryptedData
    }

    localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(storageWrapper))
  }

  /**
   * Synchronous delete for backward compatibility
   */
  static deleteAnalysis(id: string): void {
    this.deleteAnalysisAsync(id)
  }

  /**
   * Clears all local data
   */
  static clearAllLocalData(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.USER_CODE_KEY)
    localStorage.removeItem(this.ANALYSES_KEY)
    localStorage.removeItem(this.PRIVACY_MODE_KEY)
    localStorage.removeItem('userCode') // Legacy cleanup
    this.resetEncryptionService()
  }

  /**
   * Exports analyses (decrypted for the user)
   */
  static async exportAnalysesAsync(): Promise<string> {
    const analyses = await this.getMyAnalysesAsync()
    return JSON.stringify(analyses, null, 2)
  }

  /**
   * Synchronous export for backward compatibility
   */
  static exportAnalyses(): string {
    // For synchronous access, we can only export if data is not encrypted
    // or if we have cached decrypted data
    const stored = localStorage.getItem(this.ANALYSES_KEY)
    if (!stored) return '[]'

    if (this.isLegacyFormat(stored)) {
      return stored
    }

    // Return a placeholder message for encrypted data
    console.warn('Use exportAnalysesAsync() for encrypted data')
    return '[]'
  }

  /**
   * Imports analyses and encrypts them
   */
  static async importAnalysesAsync(data: string): Promise<void> {
    if (typeof window === 'undefined') return

    const analyses = JSON.parse(data)
    if (!Array.isArray(analyses)) {
      throw new Error('Invalid analysis data format')
    }

    // Encrypt and store
    const userCode = this.getUserCode()
    const encryptedData = await encryptObject(analyses, userCode)

    const storageWrapper: EncryptedStorageData = {
      version: this.STORAGE_VERSION,
      encrypted: true,
      data: encryptedData
    }

    localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(storageWrapper))
  }

  /**
   * Synchronous import for backward compatibility
   */
  static importAnalyses(data: string): void {
    this.importAnalysesAsync(data)
  }

  /**
   * Verifies if the current user code can decrypt the stored data
   */
  static async verifyUserCode(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    const stored = localStorage.getItem(this.ANALYSES_KEY)
    if (!stored) return true // No data to verify

    try {
      if (this.isLegacyFormat(stored)) {
        return true // Legacy data doesn't need verification
      }

      const wrapper = JSON.parse(stored) as EncryptedStorageData
      if (!wrapper.encrypted) {
        return true
      }

      // Try to decrypt
      const userCode = this.getUserCode()
      await decryptObject<AnalysisRecord[]>(wrapper.data, userCode)
      return true
    } catch {
      return false
    }
  }
}

// Export convenience functions (unified API)
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
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as string
        await PrivacyStorage.importAnalysesAsync(data)
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Export the EncryptionService for direct usage
export { EncryptionService }
