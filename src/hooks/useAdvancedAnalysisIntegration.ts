import { useState, useCallback } from 'react'

// Types pour l'intégration
interface AdvancedAnalysisState {
  isAnalyzing: boolean
  error: string | null
  turnByTurnResults: any[]
  mulliganResults: any | null
  monteCarloResults: any | null
  recommendations: string[]
}

interface DeckInput {
  deckList: string
  format?: string
  name?: string
}

interface ParsedDeck {
  totalCards: number
  landCount: number
  fetchlands: number
  duallands: number
  colors: string[]
  cards: Array<{ name: string; quantity: number }>
}

export const useAdvancedAnalysisIntegration = () => {
  const [state, setState] = useState<AdvancedAnalysisState>({
    isAnalyzing: false,
    error: null,
    turnByTurnResults: [],
    mulliganResults: null,
    monteCarloResults: null,
    recommendations: []
  })

  // Fonction de parsing du deck
  const parseDeckList = useCallback((deckList: string): ParsedDeck | null => {
    const lines = deckList.trim().split('\n').filter(line => line.trim())
    let totalCards = 0
    let landCount = 0
    let fetchlands = 0
    let duallands = 0
    const colors = new Set<string>()
    const cards: Array<{ name: string; quantity: number }> = []

    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(.+)$/)
      if (!match) continue

      const quantity = parseInt(match[1])
      const name = match[2].trim()
      const nameLower = name.toLowerCase()
      
      totalCards += quantity
      cards.push({ name, quantity })

      // Détection basique des types de cartes
      if (isLand(nameLower)) {
        landCount += quantity
        if (isFetchland(nameLower)) fetchlands += quantity
        if (isDualland(nameLower)) duallands += quantity
      }

      // Détection des couleurs (basique)
      detectColors(nameLower, colors)
    }

    if (totalCards < 40) return null

    return {
      totalCards,
      landCount,
      fetchlands,
      duallands,
      colors: Array.from(colors),
      cards
    }
  }, [])

  // Fonctions utilitaires de détection
  const isLand = (cardName: string): boolean => {
    const landKeywords = [
      'plains', 'island', 'swamp', 'mountain', 'forest',
      'wastes', 'gate', 'temple', 'sanctum', 'pathway',
      'fastland', 'shockland', 'fetchland', 'triome'
    ]
    return landKeywords.some(keyword => cardName.includes(keyword))
  }

  const isFetchland = (cardName: string): boolean => {
    const fetchlands = [
      'scalding tarn', 'arid mesa', 'marsh flats', 'verdant catacombs',
      'misty rainforest', 'bloodstained mire', 'wooded foothills',
      'polluted delta', 'flooded strand', 'windswept heath'
    ]
    return fetchlands.some(fetch => cardName.includes(fetch))
  }

  const isDualland = (cardName: string): boolean => {
    const dualKeywords = ['temple', 'pathway', 'shockland', 'fastland']
    return dualKeywords.some(keyword => cardName.includes(keyword))
  }

  const detectColors = (cardName: string, colors: Set<string>) => {
    // Détection basique des couleurs par nom de carte
    if (cardName.includes('white') || cardName.includes('plains')) colors.add('W')
    if (cardName.includes('blue') || cardName.includes('island')) colors.add('U')
    if (cardName.includes('black') || cardName.includes('swamp')) colors.add('B')
    if (cardName.includes('red') || cardName.includes('mountain')) colors.add('R')
    if (cardName.includes('green') || cardName.includes('forest')) colors.add('G')
  }

  // Génération des recommandations
  const generateRecommendations = (parsedDeck: ParsedDeck): string[] => {
    const recommendations: string[] = []

    // Recommandations basées sur le ratio de terrains
    const landRatio = parsedDeck.landCount / parsedDeck.totalCards
    if (landRatio < 0.35) {
      recommendations.push('🏔️ Consider adding more lands - current ratio is below optimal')
    } else if (landRatio > 0.45) {
      recommendations.push('⚡ You might have too many lands - consider more spells')
    }

    // Recommandations sur les couleurs
    if (parsedDeck.colors.length > 2 && parsedDeck.fetchlands < 4) {
      recommendations.push('🌈 Multi-color deck needs better mana fixing - add fetchlands or dual lands')
    }

    // Recommandations sur les fetchlands
    if (parsedDeck.colors.length >= 2 && parsedDeck.fetchlands === 0) {
      recommendations.push('🔍 Consider adding fetchlands for better color consistency')
    }

    return recommendations.length > 0 ? recommendations : [
      '✅ Your manabase looks well-optimized!',
      '🎯 Continue testing to validate performance in actual games'
    ]
  }

  // Fonction principale d'analyse complète
  const runCompleteAnalysis = useCallback(async (deckInput: DeckInput) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }))

    try {
      // 1. Parse du deck
      const parsedDeck = parseDeckList(deckInput.deckList)
      if (!parsedDeck) {
        throw new Error('Invalid deck list - minimum 40 cards required')
      }

      // Simulation d'un délai d'analyse
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Génération des recommandations
      const recommendations = generateRecommendations(parsedDeck)

      // Simulation de résultats d'analyse
      const landRatio = parsedDeck.landCount / parsedDeck.totalCards
      const turnByTurnResults = Array.from({ length: 6 }, (_, i) => ({
        turn: i + 1,
        probability: Math.min(0.95, landRatio * 2 + (i * 0.1)),
        exactProbability: landRatio * 0.8,
        cardsDrawn: 7 + i
      }))

      const mulliganResults = {
        expectedMulligans: landRatio < 0.35 ? 1.8 : landRatio > 0.45 ? 1.3 : 1.0,
        keepProbability: landRatio >= 0.35 && landRatio <= 0.45 ? 0.85 : 0.70
      }

      setState({
        isAnalyzing: false,
        error: null,
        turnByTurnResults,
        mulliganResults,
        monteCarloResults: null,
        recommendations
      })

    } catch (error) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }))
    }
  }, [parseDeckList])

  // Reset de l'analyse
  const resetAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      error: null,
      turnByTurnResults: [],
      mulliganResults: null,
      monteCarloResults: null,
      recommendations: []
    })
  }, [])

  return {
    // État
    ...state,
    isLoading: state.isAnalyzing,
    
    // Actions
    runCompleteAnalysis,
    resetAnalysis,
    
    // Utilitaires
    parseDeckList,
    
    // Indicateurs
    hasResults: state.turnByTurnResults.length > 0 || state.mulliganResults !== null,
    analysisProgress: state.isAnalyzing ? 'Analyzing...' : 'Ready'
  }
} 