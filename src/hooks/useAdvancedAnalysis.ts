import { useCallback, useMemo, useState } from 'react'
import { validateKarstenParameters } from '../lib/validations'
import { advancedMathEngine } from '../services/advancedMaths'
import type {
    ColorRequirement,
    DeckConfiguration,
    ManaColor,
    MonteCarloParams,
    MonteCarloResult,
    MultivariateAnalysis,
    TurnAnalysis
} from '../types/maths'

interface AdvancedAnalysisState {
  isLoading: boolean
  error: string | null
  turnAnalysis: TurnAnalysis[]
  monteCarloResult: MonteCarloResult | null
  multivariateAnalysis: MultivariateAnalysis | null
  metrics: any
}

interface AdvancedAnalysisOptions {
  enableMonteCarlo?: boolean
  enableMultivariate?: boolean
  cacheResults?: boolean
}

export const useAdvancedAnalysis = (options: AdvancedAnalysisOptions = {}) => {
  const [state, setState] = useState<AdvancedAnalysisState>({
    isLoading: false,
    error: null,
    turnAnalysis: [],
    monteCarloResult: null,
    multivariateAnalysis: null,
    metrics: null
  })

  const { enableMonteCarlo = true, enableMultivariate = true } = options

  /**
   * Analyze mana requirements using Frank Karsten methodology
   */
  const analyzeKarstenProbabilities = useCallback(async (
    deckSize: number,
    sourcesInDeck: number,
    symbolsNeeded: number,
    maxTurn: number = 6,
    onThePlay: boolean = true,
    handSize: number = 7
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Validate parameters
      const validatedParams = validateKarstenParameters.parse({
        deckSize,
        sourcesInDeck,
        turn: maxTurn,
        symbolsNeeded,
        onThePlay,
        handSize
      })

      const turnAnalysis: TurnAnalysis[] = []

      // Calculate probabilities for each turn
      for (let turn = 1; turn <= maxTurn; turn++) {
        const analysis = advancedMathEngine.calculateKarstenProbability(
          validatedParams.deckSize,
          validatedParams.sourcesInDeck,
          turn,
          validatedParams.symbolsNeeded,
          validatedParams.onThePlay,
          validatedParams.handSize
        )
        turnAnalysis.push(analysis)
      }

      setState(prev => ({
        ...prev,
        turnAnalysis,
        isLoading: false
      }))

      return turnAnalysis
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      throw error
    }
  }, [])

  /**
   * Run Monte Carlo simulation for complex scenarios
   */
  const runMonteCarloSimulation = useCallback(async (params: MonteCarloParams) => {
    if (!enableMonteCarlo) {
      throw new Error('Monte Carlo analysis is disabled')
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await advancedMathEngine.runMonteCarloSimulation(params)

      setState(prev => ({
        ...prev,
        monteCarloResult: result,
        isLoading: false
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Monte Carlo simulation failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      throw error
    }
  }, [enableMonteCarlo])

  /**
   * Analyze multivariate color requirements
   */
  const analyzeMultivariateRequirements = useCallback(async (
    deckConfig: DeckConfiguration,
    colorRequirements: ColorRequirement[]
  ) => {
    if (!enableMultivariate) {
      throw new Error('Multivariate analysis is disabled')
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const analysis = advancedMathEngine.analyzeMultivariateRequirements(
        deckConfig,
        colorRequirements
      )

      setState(prev => ({
        ...prev,
        multivariateAnalysis: analysis,
        isLoading: false
      }))

      return analysis
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Multivariate analysis failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      throw error
    }
  }, [enableMultivariate])

  /**
   * Clear analysis cache and reset state
   */
  const clearAnalysis = useCallback(() => {
    advancedMathEngine.clearCache()
    setState({
      isLoading: false,
      error: null,
      turnAnalysis: [],
      monteCarloResult: null,
      multivariateAnalysis: null,
      metrics: null
    })
  }, [])

  /**
   * Get performance metrics
   */
  const getMetrics = useCallback(() => {
    const metrics = advancedMathEngine.getMetrics()
    setState(prev => ({ ...prev, metrics }))
    return metrics
  }, [])

  /**
   * Memoized analysis summary
   */
  const analysisSummary = useMemo(() => {
    const { turnAnalysis, monteCarloResult, multivariateAnalysis } = state

    if (turnAnalysis.length === 0) return null

    // Find critical turn (first turn with <90% probability)
    const criticalTurn = turnAnalysis.find(analysis =>
      analysis.castProbability < 0.90
    )?.turn || turnAnalysis.length

    // Overall rating based on worst turn
    const worstProbability = Math.min(
      ...turnAnalysis.map(analysis => analysis.castProbability)
    )

    const overallRating = worstProbability >= 0.95 ? 'excellent' :
                         worstProbability >= 0.90 ? 'good' :
                         worstProbability >= 0.80 ? 'acceptable' :
                         worstProbability >= 0.60 ? 'poor' : 'unplayable'

    return {
      criticalTurn,
      overallRating,
      worstProbability,
      averageProbability: turnAnalysis.reduce((sum, analysis) =>
        sum + analysis.castProbability, 0) / turnAnalysis.length,
      monteCarloSuccess: monteCarloResult?.successRate || null,
      multivariateConsistency: multivariateAnalysis?.overallConsistency || null,
      bottleneckColors: multivariateAnalysis?.bottleneckColors || []
    }
  }, [state.turnAnalysis, state.monteCarloResult, state.multivariateAnalysis])

  /**
   * Generate recommendations based on analysis
   */
  const recommendations = useMemo(() => {
    const { turnAnalysis, multivariateAnalysis } = state
    const recommendations: string[] = []

    if (turnAnalysis.length > 0) {
      // Check for early turn problems
      const earlyTurns = turnAnalysis.slice(0, 3) // Turns 1-3
      const problematicTurns = earlyTurns.filter(analysis =>
        analysis.castProbability < 0.90
      )

      if (problematicTurns.length > 0) {
        const worstTurn = problematicTurns.reduce((worst, current) =>
          current.castProbability < worst.castProbability ? current : worst
        )
        recommendations.push(
          `Critical: Turn ${worstTurn.turn} only ${(worstTurn.castProbability * 100).toFixed(1)}% reliable. ${worstTurn.karstenRating.recommendation}`
        )
      }

      // Check for late game consistency
      const lateTurns = turnAnalysis.slice(3) // Turns 4+
      const inconsistentLateTurns = lateTurns.filter(analysis =>
        analysis.castProbability < 0.95
      )

      if (inconsistentLateTurns.length > 0) {
        recommendations.push(
          'Consider adding more sources for late-game consistency'
        )
      }
    }

    // Add multivariate recommendations
    if (multivariateAnalysis?.recommendations) {
      recommendations.push(...multivariateAnalysis.recommendations)
    }

    return recommendations
  }, [state.turnAnalysis, state.multivariateAnalysis])

  return {
    // State
    ...state,
    analysisSummary,
    recommendations,

    // Actions
    analyzeKarstenProbabilities,
    runMonteCarloSimulation,
    analyzeMultivariateRequirements,
    clearAnalysis,
    getMetrics,

    // Utilities
    isAnalysisComplete: state.turnAnalysis.length > 0,
    hasError: !!state.error,
    canRunMonteCarlo: enableMonteCarlo,
    canRunMultivariate: enableMultivariate
  }
}

/**
 * Hook for quick Frank Karsten analysis of a single spell
 */
export const useKarstenQuickAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeSpell = useCallback(async (
    spellCMC: number,
    colorSymbols: Record<ManaColor, number>,
    deckSources: Record<ManaColor, number>,
    deckSize: number = 60
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const results: Record<ManaColor, TurnAnalysis> = {} as Record<ManaColor, TurnAnalysis>

      // Analyze each color requirement
      for (const [color, symbolCount] of Object.entries(colorSymbols)) {
        if (symbolCount > 0) {
          const sources = deckSources[color as ManaColor] || 0
          const analysis = advancedMathEngine.calculateKarstenProbability(
            deckSize,
            sources,
            spellCMC,
            symbolCount
          )
          results[color as ManaColor] = analysis
        }
      }

      setIsLoading(false)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      setIsLoading(false)
      throw err
    }
  }, [])

  return {
    analyzeSpell,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
