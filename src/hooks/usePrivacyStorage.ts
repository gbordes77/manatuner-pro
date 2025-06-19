import { useState, useCallback, useEffect } from 'react'
import { PrivacyStorage } from '../lib/privacy'

interface SavedAnalysis {
  shareId: string
  name: string
  createdAt: string
  isPrivate: boolean
}

interface UsePrivacyStorageReturn {
  // Core privacy storage
  privacyStorage: PrivacyStorage
  userCode: string
  
  // Analysis management
  saveAnalysis: (
    deckList: string, 
    analysisResult: any, 
    options?: {
      name?: string
      isPrivate?: boolean
      shareWithDeck?: boolean
    }
  ) => Promise<{ shareId: string; success: boolean }>
  
  getAnalysis: (shareId: string) => Promise<{
    analysisResult: any
    deckList: string | null
    name: string | null
    createdAt: string
    isPrivate: boolean
  } | null>
  
  getUserAnalyses: () => Promise<SavedAnalysis[]>
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Privacy controls
  isPrivateMode: boolean
  setPrivateMode: (isPrivate: boolean) => void
  
  // Utility functions
  shareAnalysisLink: (shareId: string) => Promise<void>
  resetAllData: () => void
  exportUserData: () => string
  importUserData: (jsonData: string) => boolean
}

export const usePrivacyStorage = (): UsePrivacyStorageReturn => {
  const [privacyStorage] = useState(() => new PrivacyStorage())
  const [userCode, setUserCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPrivateMode, setIsPrivateMode] = useState(true)

  // Initialize user code
  useEffect(() => {
    setUserCode(privacyStorage.getUserCode())
  }, [privacyStorage])

  const saveAnalysis = useCallback(async (
    deckList: string, 
    analysisResult: any, 
    options: {
      name?: string
      isPrivate?: boolean
      shareWithDeck?: boolean
    } = {}
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await privacyStorage.saveAnalysis(
        deckList, 
        analysisResult, 
        {
          name: options.name,
          isPrivate: options.isPrivate ?? isPrivateMode,
          shareWithDeck: options.shareWithDeck ?? false
        }
      )
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      setError(errorMessage)
      return { shareId: '', success: false }
    } finally {
      setIsLoading(false)
    }
  }, [privacyStorage, isPrivateMode])

  const getAnalysis = useCallback(async (shareId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await privacyStorage.getAnalysis(shareId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [privacyStorage])

  const getUserAnalyses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const analyses = await privacyStorage.getUserAnalyses()
      return analyses
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des analyses'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [privacyStorage])

  const shareAnalysisLink = useCallback(async (shareId: string) => {
    const url = `${window.location.origin}/analysis/${shareId}`
    
    try {
      await navigator.clipboard.writeText(url)
      // Could trigger a toast notification here
      console.log('Lien copié dans le presse-papiers')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      console.log('Lien copié (fallback)')
    }
  }, [])

  const resetAllData = useCallback(() => {
    privacyStorage.resetUserData()
  }, [privacyStorage])

  const exportUserData = useCallback(() => {
    return privacyStorage.exportUserData()
  }, [privacyStorage])

  const importUserData = useCallback((jsonData: string) => {
    return privacyStorage.importUserData(jsonData)
  }, [privacyStorage])

  const setPrivateMode = useCallback((isPrivate: boolean) => {
    setIsPrivateMode(isPrivate)
  }, [])

  return {
    privacyStorage,
    userCode,
    saveAnalysis,
    getAnalysis,
    getUserAnalyses,
    isLoading,
    error,
    isPrivateMode,
    setPrivateMode,
    shareAnalysisLink,
    resetAllData,
    exportUserData,
    importUserData
  }
} 