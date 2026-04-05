import { useEffect, useState } from 'react'
import { AnalysisResult, DeckAnalyzer } from '../services/deckAnalyzer'

export interface DeckAnalysisState {
  deckList: string
  isAnalyzing: boolean
  analysisResult: AnalysisResult | null
  isDeckMinimized: boolean
}

export const useDeckAnalysis = () => {
  const [deckList, setDeckList] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isDeckMinimized, setIsDeckMinimized] = useState(false)

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    const savedDeckList = localStorage.getItem('manatuner-decklist')
    const savedAnalysis = localStorage.getItem('manatuner-analysis')
    const savedMinimized = localStorage.getItem('manatuner-minimized')

    if (savedDeckList) {
      setDeckList(savedDeckList)
    }
    if (savedAnalysis) {
      try {
        setAnalysisResult(JSON.parse(savedAnalysis))
      } catch {
        console.warn('Failed to parse saved analysis')
      }
    }
    if (savedMinimized) {
      setIsDeckMinimized(savedMinimized === 'true')
    }
  }, [])

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    localStorage.setItem('manatuner-decklist', deckList)
  }, [deckList])

  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem('manatuner-analysis', JSON.stringify(analysisResult))
    } else {
      localStorage.removeItem('manatuner-analysis')
    }
  }, [analysisResult])

  useEffect(() => {
    localStorage.setItem('manatuner-minimized', isDeckMinimized.toString())
  }, [isDeckMinimized])

  const analyzeDeck = async () => {
    if (!deckList.trim()) {
      return
    }

    setIsAnalyzing(true)

    try {
      const result = await DeckAnalyzer.analyzeDeck(deckList)
      setAnalysisResult(result)
      setIsDeckMinimized(true)
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error)
      setAnalysisResult(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearAnalysis = () => {
    setAnalysisResult(null)
    setIsDeckMinimized(false)
  }

  return {
    deckList,
    setDeckList,
    isAnalyzing,
    analysisResult,
    isDeckMinimized,
    setIsDeckMinimized,
    analyzeDeck,
    clearAnalysis,
  }
}
