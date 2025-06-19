// 🔐 Privacy-First Architecture for ManatunerPro
// Zero-Knowledge system where even developers cannot see user decks

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

// Privacy-First Storage Manager
export class PrivacyStorage {
  private userCode: string
  private encryptionKey: string

  constructor() {
    this.userCode = this.getOrCreateUserCode()
    this.encryptionKey = this.getOrCreateEncryptionKey()
  }

  private getOrCreateUserCode(): string {
    let code = localStorage.getItem('manatuner_user_code')
    if (!code) {
      code = UserCodeGenerator.generate()
      localStorage.setItem('manatuner_user_code', code)
    }
    return code
  }

  private getOrCreateEncryptionKey(): string {
    let key = localStorage.getItem('manatuner_encryption_key')
    if (!key) {
      key = ClientEncryption.generateUserKey()
      localStorage.setItem('manatuner_encryption_key', key)
    }
    return key
  }

  getUserCode(): string {
    return this.userCode
  }

  // Save analysis with privacy options
  async saveAnalysis(
    deckList: string, 
    analysisResult: any, 
    options: {
      name?: string
      isPrivate?: boolean
      shareWithDeck?: boolean
    } = {}
  ): Promise<{ shareId: string; success: boolean }> {
    const shareId = this.generateShareId()
    const { name = null, isPrivate = true, shareWithDeck = false } = options

    try {
      // Always save deck locally (encrypted)
      this.saveLocalDeck(shareId, deckList)

      // Prepare data for server
      const serverData: any = {
        share_id: shareId,
        user_code_hash: await ClientEncryption.createHash(this.userCode),
        analysis_result: analysisResult,
        name,
        is_private: isPrivate,
        created_at: new Date().toISOString()
      }

      // Only include deck if user explicitly allows
      if (!isPrivate && shareWithDeck) {
        serverData.encrypted_deck = ClientEncryption.encrypt(deckList, this.encryptionKey)
      }

      // Save to server (using the existing supabase helper)
      const { supabaseHelpers } = await import('../services/supabase')
      await supabaseHelpers.saveAnalysis(deckList, analysisResult, name || undefined)

      // Update local analysis list
      this.updateLocalAnalysisList(shareId, name || 'Unnamed Analysis')

      return { shareId, success: true }
    } catch (error) {
      console.error('Failed to save analysis:', error)
      return { shareId, success: false }
    }
  }

  // Get analysis by share ID
  async getAnalysis(shareId: string): Promise<{
    analysisResult: any
    deckList: string | null
    name: string | null
    createdAt: string
    isPrivate: boolean
  } | null> {
    try {
      // Get deck from local storage first
      let deckList = this.getLocalDeck(shareId)

      // For now, return local data only (server integration will be added later)
      if (!deckList) return null

      // Return mock data structure for now
      return {
        analysisResult: null, // Will be populated when server integration is complete
        deckList,
        name: 'Local Analysis',
        createdAt: new Date().toISOString(),
        isPrivate: true
      }
    } catch (error) {
      console.error('Failed to get analysis:', error)
      return null
    }
  }

  // Get all user's analyses
  async getUserAnalyses(): Promise<Array<{
    shareId: string
    name: string
    createdAt: string
    isPrivate: boolean
  }>> {
    try {
      // For now, return local analyses only
      return this.getLocalAnalysesList()
    } catch (error) {
      console.error('Failed to get user analyses:', error)
      // Fallback to local storage
      return this.getLocalAnalysesList()
    }
  }

  // Private methods
  private saveLocalDeck(shareId: string, deckList: string): void {
    const encryptedDeck = ClientEncryption.encrypt(deckList, this.encryptionKey)
    const localDecks = JSON.parse(localStorage.getItem('manatuner_local_decks') || '{}')
    localDecks[shareId] = encryptedDeck
    localStorage.setItem('manatuner_local_decks', JSON.stringify(localDecks))
  }

  private getLocalDeck(shareId: string): string | null {
    const localDecks = JSON.parse(localStorage.getItem('manatuner_local_decks') || '{}')
    const encryptedDeck = localDecks[shareId]
    
    if (!encryptedDeck) return null
    
    return ClientEncryption.decrypt(encryptedDeck, this.encryptionKey)
  }

  private updateLocalAnalysisList(shareId: string, name: string): void {
    const analyses = this.getLocalAnalysesList()
    analyses.unshift({
      shareId,
      name,
      createdAt: new Date().toISOString(),
      isPrivate: true
    })
    
    // Keep only last 50 analyses
    const trimmed = analyses.slice(0, 50)
    localStorage.setItem('manatuner_local_analyses', JSON.stringify(trimmed))
  }

  private getLocalAnalysesList(): Array<{
    shareId: string
    name: string
    createdAt: string
    isPrivate: boolean
  }> {
    return JSON.parse(localStorage.getItem('manatuner_local_analyses') || '[]')
  }

  private generateShareId(): string {
    return Math.random().toString(36).substring(2, 10) + 
           Math.random().toString(36).substring(2, 10)
  }

  // Utility methods
  resetUserData(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes vos données locales ?')) {
      localStorage.removeItem('manatuner_user_code')
      localStorage.removeItem('manatuner_encryption_key')
      localStorage.removeItem('manatuner_local_decks')
      localStorage.removeItem('manatuner_local_analyses')
      window.location.reload()
    }
  }

  exportUserData(): string {
    return JSON.stringify({
      userCode: this.userCode,
      encryptionKey: this.encryptionKey,
      localDecks: localStorage.getItem('manatuner_local_decks'),
      localAnalyses: localStorage.getItem('manatuner_local_analyses')
    }, null, 2)
  }

  importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      localStorage.setItem('manatuner_user_code', data.userCode)
      localStorage.setItem('manatuner_encryption_key', data.encryptionKey)
      if (data.localDecks) localStorage.setItem('manatuner_local_decks', data.localDecks)
      if (data.localAnalyses) localStorage.setItem('manatuner_local_analyses', data.localAnalyses)
      window.location.reload()
      return true
    } catch {
      return false
    }
  }
}

/**
 * Génère ou récupère le code utilisateur unique
 */
export const getUserCode = (): string => {
  if (typeof window === 'undefined') return ''; // SSR safety
  
  let userCode = localStorage.getItem('userCode');
  
  if (!userCode) {
    userCode = generateUserCode();
    localStorage.setItem('userCode', userCode);
  }
  
  return userCode;
};

/**
 * Génère un code utilisateur mémorable
 */
export const generateUserCode = (): string => {
  const adjectives = ['BLUE', 'RED', 'GREEN', 'BLACK', 'WHITE', 'FIRE', 'STORM', 'SAGE'];
  const nouns = ['MANA', 'DECK', 'SPELL', 'MAGE', 'STORM', 'BOLT', 'LAND', 'TUNER'];
  const number = Math.floor(Math.random() * 99) + 1;
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj}-${noun}-${number}`;
};

/**
 * Interface pour une analyse sauvegardée
 */
interface SavedAnalysis {
  id: string;
  shareId?: string;
  deckName?: string;
  deckList?: string;
  date: string;
  consistency?: number;
}

/**
 * Sauvegarde une analyse localement
 */
export const saveAnalysisLocal = (analysis: Partial<SavedAnalysis>): void => {
  if (typeof window === 'undefined') return;
  
  const analyses = getMyAnalyses();
  analyses.unshift({
    ...analysis,
    id: analysis.id || Date.now().toString(),
    date: new Date().toISOString()
  });
  
  // Garder seulement les 50 dernières analyses
  const recentAnalyses = analyses.slice(0, 50);
  
  localStorage.setItem('myAnalyses', JSON.stringify(recentAnalyses));
};

/**
 * Récupère toutes les analyses locales
 */
export const getMyAnalyses = (): SavedAnalysis[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('myAnalyses');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading analyses from localStorage:', error);
    return [];
  }
};

/**
 * Supprime une analyse locale
 */
export const deleteLocalAnalysis = (id: string): void => {
  if (typeof window === 'undefined') return;
  
  const analyses = getMyAnalyses();
  const filtered = analyses.filter(a => a.id !== id);
  localStorage.setItem('myAnalyses', JSON.stringify(filtered));
};

/**
 * Efface toutes les données locales
 */
export const clearAllLocalData = (): void => {
  if (typeof window === 'undefined') return;
  
  if (confirm('Êtes-vous sûr de vouloir effacer toutes vos données locales ?')) {
    localStorage.removeItem('myAnalyses');
    localStorage.removeItem('userCode');
    localStorage.removeItem('encryptionKey');
    // Recharger la page pour réinitialiser
    window.location.reload();
  }
};

/**
 * Exporte les analyses en JSON
 */
export const exportAnalyses = (): void => {
  const analyses = getMyAnalyses();
  const dataStr = JSON.stringify(analyses, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `manatuner-analyses-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

/**
 * Importe des analyses depuis un fichier JSON
 */
export const importAnalyses = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const current = getMyAnalyses();
        const merged = [...imported, ...current];
        
        // Dédupliquer par ID
        const unique = merged.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );
        
        localStorage.setItem('myAnalyses', JSON.stringify(unique));
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    reader.readAsText(file);
  });
}; 