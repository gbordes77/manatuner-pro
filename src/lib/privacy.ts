// 🔐 Privacy-First Architecture for ManatunerPro
// Zero-Knowledge system where even developers cannot see user decks

import { nanoid } from 'nanoid'

// Simple encryption using Web Crypto API
export class ClientEncryption {
  private static encoder = new TextEncoder()
  private static decoder = new TextDecoder()

  // Generate a unique user key
  static generateUserKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Simple XOR encryption (production would use AES-GCM)
  static encrypt(text: string, key: string): string {
    const textBytes = this.encoder.encode(text)
    const keyBytes = this.encoder.encode(key)
    const encrypted = new Uint8Array(textBytes.length)
    
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length]
    }
    
    return btoa(String.fromCharCode(...encrypted))
  }

  // Decrypt the encrypted text
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
    const msgBuffer = this.encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

// Generate memorable user codes
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

// Analysis record interface
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

// Privacy Storage Management
export class PrivacyStorage {
  private static readonly USER_CODE_KEY = 'manatuner_user_code'
  private static readonly ANALYSES_KEY = 'manatuner_analyses'
  private static readonly PRIVACY_MODE_KEY = 'manatuner_privacy_mode'

  // Generate or get user code
  static getUserCode(): string {
    if (typeof window === 'undefined') return ''
    
    let userCode = localStorage.getItem(this.USER_CODE_KEY)
    if (!userCode) {
      userCode = UserCodeGenerator.generate()
      localStorage.setItem(this.USER_CODE_KEY, userCode)
    }
    return userCode
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

  // Analysis storage
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

  static getMyAnalyses(): AnalysisRecord[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.ANALYSES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static deleteAnalysis(id: string): void {
    if (typeof window === 'undefined') return
    const analyses = this.getMyAnalyses().filter(a => a.id !== id)
    localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(analyses))
  }

  static clearAllLocalData(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.USER_CODE_KEY)
    localStorage.removeItem(this.ANALYSES_KEY)
    localStorage.removeItem(this.PRIVACY_MODE_KEY)
    localStorage.removeItem('userCode') // Legacy cleanup
  }

  static exportAnalyses(): string {
    const analyses = this.getMyAnalyses()
    return JSON.stringify(analyses, null, 2)
  }

  static importAnalyses(data: string): void {
    if (typeof window === 'undefined') return
    try {
      const analyses = JSON.parse(data)
      if (Array.isArray(analyses)) {
        localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(analyses))
      }
    } catch (error) {
      throw new Error('Invalid analysis data format')
    }
  }
}

// Export convenience functions (unified API)
export const getUserCode = () => PrivacyStorage.getUserCode()
export const getMyAnalyses = () => PrivacyStorage.getMyAnalyses()
export const exportAnalyses = () => PrivacyStorage.exportAnalyses()
export const clearAllLocalData = () => PrivacyStorage.clearAllLocalData()
export const saveAnalysisLocal = (analysis: Partial<AnalysisRecord>) => PrivacyStorage.saveAnalysis(analysis as any)
export const deleteLocalAnalysis = (id: string) => PrivacyStorage.deleteAnalysis(id)

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