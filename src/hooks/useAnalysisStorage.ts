import { useState, useCallback, useEffect } from 'react'
import { supabaseHelpers, handleSupabaseError } from '../services/supabase'

interface SavedAnalysis {
  id: string
  name: string | null
  deck_list: string
  analysis_result: any
  created_at: string
  format: string | null
  is_public: boolean
}

interface UseAnalysisStorageReturn {
  // State
  savedAnalyses: SavedAnalysis[]
  isLoading: boolean
  error: string | null
  
  // Actions
  saveAnalysis: (deckList: string, analysisResult: any, name?: string, format?: string) => Promise<SavedAnalysis | null>
  loadAnalyses: () => Promise<void>
  deleteAnalysis: (id: string) => Promise<void>
  shareAnalysis: (deckList: string, analysisResult: any, name?: string) => Promise<string | null>
  loadSharedAnalysis: (id: string) => Promise<SavedAnalysis | null>
  clearError: () => void
  
  // Local storage fallback
  saveToLocal: (deckList: string, analysisResult: any, name?: string) => void
  loadFromLocal: () => SavedAnalysis[]
}

const LOCAL_STORAGE_KEY = 'manatuner-analyses'

export const useAnalysisStorage = (): UseAnalysisStorageReturn => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Local storage helpers
  const saveToLocal = useCallback((deckList: string, analysisResult: any, name?: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
      const newAnalysis: SavedAnalysis = {
        id: Date.now().toString(),
        name: name || null,
        deck_list: deckList,
        analysis_result: analysisResult,
        created_at: new Date().toISOString(),
        format: null,
        is_public: false
      }
      
      const updated = [newAnalysis, ...existing].slice(0, 50) // Keep only 50 most recent
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
      setSavedAnalyses(updated)
    } catch (err) {
      console.error('Failed to save to local storage:', err)
    }
  }, [])

  const loadFromLocal = useCallback((): SavedAnalysis[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      console.error('Failed to load from local storage:', err)
      return []
    }
  }, [])

  // Supabase operations
  const saveAnalysis = useCallback(async (
    deckList: string, 
    analysisResult: any, 
    name?: string, 
    format?: string
  ): Promise<SavedAnalysis | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try Supabase first
      if (supabaseHelpers.isConfigured()) {
        const saved = await supabaseHelpers.saveAnalysis(deckList, analysisResult, name, format)
        
        // Update local state
        setSavedAnalyses(prev => [saved, ...prev])
        return saved
      } else {
        // Fallback to local storage
        saveToLocal(deckList, analysisResult, name)
        return null
      }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      
      // Fallback to local storage on error
      saveToLocal(deckList, analysisResult, name)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [saveToLocal])

  const loadAnalyses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (supabaseHelpers.isConfigured()) {
        const analyses = await supabaseHelpers.getUserAnalyses()
        setSavedAnalyses(analyses)
      } else {
        // Load from local storage
        const localAnalyses = loadFromLocal()
        setSavedAnalyses(localAnalyses)
      }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      
      // Fallback to local storage
      const localAnalyses = loadFromLocal()
      setSavedAnalyses(localAnalyses)
    } finally {
      setIsLoading(false)
    }
  }, [loadFromLocal])

  const deleteAnalysis = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (supabaseHelpers.isConfigured()) {
        // Delete from Supabase (we need to add this function to supabaseHelpers)
        // For now, just remove from local state
        setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== id))
      } else {
        // Remove from local storage
        const localAnalyses = loadFromLocal().filter(analysis => analysis.id !== id)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localAnalyses))
        setSavedAnalyses(localAnalyses)
      }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [loadFromLocal])

  const shareAnalysis = useCallback(async (
    deckList: string, 
    analysisResult: any, 
    name?: string
  ): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (supabaseHelpers.isConfigured()) {
        const shared = await supabaseHelpers.createShareableAnalysis(deckList, analysisResult, name)
        return shared.id
      } else {
        setError('Sharing requires an internet connection')
        return null
      }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadSharedAnalysis = useCallback(async (id: string): Promise<SavedAnalysis | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (supabaseHelpers.isConfigured()) {
        const analysis = await supabaseHelpers.getSharedAnalysis(id)
        return analysis
      } else {
        setError('Loading shared analysis requires an internet connection')
        return null
      }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load analyses on mount
  useEffect(() => {
    loadAnalyses()
  }, [loadAnalyses])

  return {
    // State
    savedAnalyses,
    isLoading,
    error,
    
    // Actions
    saveAnalysis,
    loadAnalyses,
    deleteAnalysis,
    shareAnalysis,
    loadSharedAnalysis,
    clearError,
    
    // Local storage fallback
    saveToLocal,
    loadFromLocal
  }
}

export default useAnalysisStorage 