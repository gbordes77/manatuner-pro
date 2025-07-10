// Advanced Mathematical Engine for ManaTuner Pro
// Based on Frank Karsten's research and hypergeometric distribution theory

import {
  type HypergeometricParams,
  type ProbabilityResult,
  type KarstenRecommendation,
  type TurnAnalysis,
  type MonteCarloParams,
  type MonteCarloResult,
  type DeckConfiguration,
  type ColorRequirement,
  type ManaColor,
  MAGIC_CONSTANTS,
  KARSTEN_TABLES,
  type MultivariateAnalysis,
  type ColorCombinationAnalysis,
  type SimulationState,
  type MulliganDecision,
  type CalculationMetrics,
  type MemoizationCache
} from '../types/maths'

/**
 * Advanced Mathematical Engine for MTG Manabase Analysis
 * Implements Frank Karsten's methodology with performance optimizations
 */
export class AdvancedMathEngine {
  private cache: MemoizationCache
  private metrics: CalculationMetrics

  constructor() {
    this.cache = {
      hypergeometric: new Map(),
      binomial: new Map(),
      factorial: new Map(),
      combinations: new Map(),
      maxSize: 10000,
      hitRate: 0
    }
    
    this.metrics = {
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      iterationsCompleted: 0,
      cacheHits: 0,
      cacheMisses: 0,
      calculationsPerformed: 0,
      averageCalculationTime: 0
    }
  }

  /**
   * Calculate binomial coefficient C(n,k) with memoization
   */
  private binomial(n: number, k: number): number {
    if (k > n || k < 0) return 0
    if (k === 0 || k === n) return 1
    if (k === 1) return n

    const key = `${n},${k}`
    if (this.cache.binomial.has(key)) {
      this.metrics.cacheHits++
      return this.cache.binomial.get(key)!
    }

    this.metrics.cacheMisses++
    
    // Use symmetry property: C(n,k) = C(n,n-k)
    const actualK = Math.min(k, n - k)
    
    let result = 1
    for (let i = 0; i < actualK; i++) {
      result = result * (n - i) / (i + 1)
    }

    // Cache the result if cache isn't full
    if (this.cache.binomial.size < this.cache.maxSize) {
      this.cache.binomial.set(key, result)
    }

    return result
  }

  /**
   * Hypergeometric distribution - exact probability
   * P(X = k) = C(K,k) * C(N-K,n-k) / C(N,n)
   */
  hypergeometric(params: HypergeometricParams): number {
    const { populationSize: N, successStates: K, sampleSize: n, successesWanted: k } = params
    
    // Validation
    if (k > n || k > K || n > N || k < 0) return 0
    if (K === 0) return k === 0 ? 1 : 0

    const key = `${N},${K},${n},${k}`
    if (this.cache.hypergeometric.has(key)) {
      this.metrics.cacheHits++
      return this.cache.hypergeometric.get(key)!
    }

    this.metrics.cacheMisses++

    const numerator = this.binomial(K, k) * this.binomial(N - K, n - k)
    const denominator = this.binomial(N, n)
    
    const result = denominator > 0 ? numerator / denominator : 0

    // Cache the result
    if (this.cache.hypergeometric.size < this.cache.maxSize) {
      this.cache.hypergeometric.set(key, result)
    }

    return result
  }

  /**
   * Cumulative hypergeometric distribution - probability of at least k successes
   * P(X >= k) = sum(P(X = i)) for i = k to min(n, K)
   */
  cumulativeHypergeometric(params: HypergeometricParams): ProbabilityResult {
    const { populationSize: N, successStates: K, sampleSize: n, successesWanted: k } = params
    
    let probability = 0
    const maxK = Math.min(n, K)
    
    for (let i = k; i <= maxK; i++) {
      probability += this.hypergeometric({
        populationSize: N,
        successStates: K,
        sampleSize: n,
        successesWanted: i
      })
    }

    // Ensure probability is within bounds
    probability = Math.min(1, Math.max(0, probability))
    
    return {
      probability,
      percentage: probability * 100,
      meetsThreshold: probability >= 0.90,
      confidence: this.getConfidenceLevel(probability)
    }
  }

  /**
   * Frank Karsten probability calculation for specific mana requirements
   */
  calculateKarstenProbability(
    deckSize: number,
    sourcesInDeck: number,
    turn: number,
    symbolsNeeded: number,
    onThePlay: boolean = true,
    handSize: number = 7
  ): TurnAnalysis {
    // CRITICAL: Frank Karsten formula for cards seen
    // On the play: handSize + turn - 1
    // On the draw: handSize + turn (extra card on first turn)
    const cardsDrawn = onThePlay ? handSize + turn - 1 : handSize + turn

    const probabilityResult = this.cumulativeHypergeometric({
      populationSize: deckSize,
      successStates: sourcesInDeck,
      sampleSize: cardsDrawn,
      successesWanted: symbolsNeeded
    })

    // Get Karsten recommendation from lookup tables
    const karstenSources = KARSTEN_TABLES[symbolsNeeded]?.[turn] || 0
    const deficit = karstenSources - sourcesInDeck

    const recommendation: KarstenRecommendation = {
      sourcesNeeded: karstenSources,
      sourcesAvailable: sourcesInDeck,
      deficit,
      rating: this.getKarstenRating(probabilityResult.probability, deficit),
      recommendation: this.generateRecommendation(probabilityResult.probability, deficit, symbolsNeeded, turn)
    }

    return {
      turn,
      cardsDrawn,
      landProbability: probabilityResult.probability,
      colorProbability: probabilityResult.probability, // Same for single color
      castProbability: probabilityResult.probability,
      karstenRating: recommendation
    }
  }

  /**
   * Monte Carlo simulation for complex scenarios
   */
  async runMonteCarloSimulation(params: MonteCarloParams): Promise<MonteCarloResult> {
    this.metrics.startTime = performance.now()
    
    // Validation des paramètres
    if (params.iterations <= 0 || params.deckSize <= 0 || params.landCount < 0) {
      throw new Error('Invalid Monte Carlo parameters')
    }
    
    const { iterations, deckSize, landCount, targetTurn, mulliganStrategy, playFirst, maxMulligans } = params
    
    let successfulRuns = 0
    let totalTurns = 0
    const turnDistribution: number[] = new Array(11).fill(0) // Turns 0-10
    
    // Use Web Worker for heavy computation if available
    if (typeof Worker !== 'undefined') {
      return this.runMonteCarloWithWorker(params)
    }
    
    // Fallback to main thread
    for (let i = 0; i < iterations; i++) {
      const simulation = this.simulateSingleGame(params)
      
      if (simulation.success) {
        successfulRuns++
        totalTurns += simulation.turnAchieved
        if (simulation.turnAchieved <= 10) {
          turnDistribution[simulation.turnAchieved]++
        }
      }
      
      this.metrics.iterationsCompleted++
    }

    const successRate = (successfulRuns / iterations) * 100
    const averageTurn = successfulRuns > 0 ? totalTurns / successfulRuns : 0
    
    // Calculate standard deviation
    let variance = 0
    for (let i = 0; i < iterations; i++) {
      const simulation = this.simulateSingleGame(params)
      if (simulation.success) {
        variance += Math.pow(simulation.turnAchieved - averageTurn, 2)
      }
    }
    const standardDeviation = Math.sqrt(variance / Math.max(1, successfulRuns))
    
    // 95% confidence interval
    const margin = 1.96 * (standardDeviation / Math.sqrt(successfulRuns))
    
    this.metrics.endTime = performance.now()
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime

    return {
      iterations,
      successfulRuns,
      successRate,
      averageTurn,
      standardDeviation,
      confidence: {
        lower: Math.max(0, successRate - margin),
        upper: Math.min(100, successRate + margin)
      },
      distribution: turnDistribution
    }
  }

  /**
   * Simulate a single game for Monte Carlo analysis
   */
  private simulateSingleGame(params: MonteCarloParams): { success: boolean; turnAchieved: number } {
    const { deckSize, landCount, targetTurn, mulliganStrategy, playFirst, maxMulligans } = params
    
    // Create deck
    const deck = this.createSimulationDeck(deckSize, landCount)
    
    // Simulate mulligans
    let hand = this.drawHand(deck, 7)
    let mulligans = 0
    
    while (mulligans < maxMulligans) {
      const decision = this.shouldMulligan(hand, mulliganStrategy)
      if (!decision.shouldMulligan) break
      
      mulligans++
      hand = this.drawHand(deck, 7 - mulligans)
    }
    
    // Simulate turns
    let landsInPlay = 0
    let currentTurn = 1
    
    // Count lands in opening hand
    landsInPlay = hand.filter(card => card === 'land').length
    
    while (currentTurn <= targetTurn) {
      // Draw for turn (except turn 1 if on the play)
      if (currentTurn > 1 || !playFirst) {
        const drawnCard = this.drawCard(deck)
        if (drawnCard === 'land') {
          landsInPlay++
        }
      }
      
      // Check if we have enough lands for target turn
      if (landsInPlay >= currentTurn) {
        return { success: true, turnAchieved: currentTurn }
      }
      
      currentTurn++
    }
    
    return { success: false, turnAchieved: targetTurn + 1 }
  }

  /**
   * Create a simulation deck
   */
  private createSimulationDeck(deckSize: number, landCount: number): string[] {
    const deck: string[] = []
    
    // Add lands
    for (let i = 0; i < landCount; i++) {
      deck.push('land')
    }
    
    // Add spells
    for (let i = 0; i < deckSize - landCount; i++) {
      deck.push('spell')
    }
    
    // Shuffle deck
    return this.shuffleDeck(deck)
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleDeck(deck: string[]): string[] {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Draw a hand from the deck
   */
  private drawHand(deck: string[], handSize: number): string[] {
    return deck.slice(0, handSize)
  }

  /**
   * Draw a single card from the deck
   */
  private drawCard(deck: string[]): string {
    return deck[Math.floor(Math.random() * deck.length)]
  }

  /**
   * Mulligan decision logic
   */
  private shouldMulligan(hand: string[], strategy: string): MulliganDecision {
    const landCount = hand.filter(card => card === 'land').length
    const handSize = hand.length
    
    let shouldMulligan = false
    let reason = ''
    let handRating = 5 // 0-10 scale
    
    switch (strategy) {
      case 'aggressive':
        shouldMulligan = landCount < 2 || landCount > 5
        reason = landCount < 2 ? 'Too few lands' : landCount > 5 ? 'Too many lands' : 'Good land count'
        handRating = Math.max(0, Math.min(10, 5 + (3 - Math.abs(landCount - 3))))
        break
        
      case 'conservative':
        shouldMulligan = landCount < 1 || landCount > 6
        reason = landCount < 1 ? 'No lands' : landCount > 6 ? 'All lands' : 'Acceptable'
        handRating = Math.max(0, Math.min(10, 5 + (2 - Math.abs(landCount - 3))))
        break
        
      case 'optimal':
        // More sophisticated logic based on curve
        const optimalLands = Math.floor(handSize * 0.4) // ~40% lands
        const deviation = Math.abs(landCount - optimalLands)
        shouldMulligan = deviation > 2
        reason = `Deviation from optimal: ${deviation}`
        handRating = Math.max(0, Math.min(10, 8 - deviation * 2))
        break
        
      default: // 'none'
        shouldMulligan = false
        reason = 'No mulligan strategy'
        handRating = 5
    }
    
    return {
      shouldMulligan,
      reason,
      handRating,
      keepProbability: handRating / 10
    }
  }

  /**
   * Run Monte Carlo simulation with Web Worker for performance
   */
  private async runMonteCarloWithWorker(params: MonteCarloParams): Promise<MonteCarloResult> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('/workers/monteCarlo.worker.js', import.meta.url))
      
      worker.postMessage(params)
      
      worker.onmessage = (event) => {
        const result = event.data
        worker.terminate()
        resolve(result)
      }
      
      worker.onerror = (error) => {
        worker.terminate()
        reject(error)
      }
      
      // Timeout after 30 seconds
      setTimeout(() => {
        worker.terminate()
        reject(new Error('Monte Carlo simulation timeout'))
      }, 30000)
    })
  }

  /**
   * Analyze multivariate color requirements
   */
  analyzeMultivariateRequirements(
    deckConfig: DeckConfiguration,
    colorRequirements: ColorRequirement[]
  ): MultivariateAnalysis {
    const colorCombinations: ColorCombinationAnalysis[] = []
    let overallConsistency = 1
    const bottleneckColors: ManaColor[] = []
    const recommendations: string[] = []
    
    // Analyze each color requirement
    for (const requirement of colorRequirements) {
      const analysis = this.calculateKarstenProbability(
        deckConfig.totalCards,
        requirement.sources,
        requirement.criticalTurn,
        requirement.intensity
      )
      
      colorCombinations.push({
        colors: [requirement.color],
        probability: analysis.castProbability,
        sources: requirement.sources,
        deficit: analysis.karstenRating.deficit,
        criticalTurn: requirement.criticalTurn
      })
      
      // Update overall consistency (product of probabilities)
      overallConsistency *= analysis.castProbability
      
      // Identify bottlenecks
      if (analysis.castProbability < 0.80) {
        bottleneckColors.push(requirement.color)
        recommendations.push(
          `${requirement.color}: Add ${Math.abs(analysis.karstenRating.deficit)} more sources`
        )
      }
    }
    
    // Generate optimal manabase
    const optimalManabase = this.generateOptimalManabase(deckConfig, colorRequirements)
    
    return {
      colorCombinations,
      overallConsistency,
      bottleneckColors,
      recommendations,
      optimalManabase
    }
  }

  /**
   * Generate optimal manabase recommendations
   */
  private generateOptimalManabase(
    deckConfig: DeckConfiguration,
    colorRequirements: ColorRequirement[]
  ): any {
    const totalLands = Math.max(
      MAGIC_CONSTANTS.MIN_LANDS_AGGRESSIVE,
      Math.min(MAGIC_CONSTANTS.MAX_LANDS_CONTROL, deckConfig.landCount)
    )
    
    const colorSources: Record<ManaColor, number> = {} as Record<ManaColor, number>
    
    // Calculate optimal sources for each color
    for (const requirement of colorRequirements) {
      const optimalSources = KARSTEN_TABLES[requirement.intensity]?.[requirement.criticalTurn] || 14
      colorSources[requirement.color] = optimalSources
    }
    
    return {
      totalLands,
      colorSources,
      fetchlands: Math.floor(totalLands * 0.2), // ~20% fetchlands
      duallands: Math.floor(totalLands * 0.4),  // ~40% dual lands
      basics: Math.floor(totalLands * 0.3),     // ~30% basics
      utility: Math.floor(totalLands * 0.1),    // ~10% utility
      confidence: 0.85
    }
  }

  /**
   * Get confidence level based on probability
   */
  private getConfidenceLevel(probability: number): 'low' | 'medium' | 'high' | 'excellent' {
    if (probability >= MAGIC_CONSTANTS.EXCELLENT_THRESHOLD) return 'excellent'
    if (probability >= MAGIC_CONSTANTS.GOOD_THRESHOLD) return 'high'
    if (probability >= MAGIC_CONSTANTS.ACCEPTABLE_THRESHOLD) return 'medium'
    return 'low'
  }

  /**
   * Get Karsten rating based on probability and deficit
   */
  private getKarstenRating(probability: number, deficit: number): 'excellent' | 'good' | 'acceptable' | 'poor' | 'unplayable' {
    if (probability >= 0.95) return 'excellent'
    if (probability >= 0.90) return 'good'
    if (probability >= 0.80) return 'acceptable'
    if (probability >= 0.60) return 'poor'
    return 'unplayable'
  }

  /**
   * Generate human-readable recommendation
   */
  private generateRecommendation(
    probability: number,
    deficit: number,
    symbolsNeeded: number,
    turn: number
  ): string {
    if (deficit <= 0) {
      return `Excellent! You have sufficient sources for ${symbolsNeeded} symbols by turn ${turn}.`
    }
    
    if (deficit <= 2) {
      return `Consider adding ${deficit} more source${deficit > 1 ? 's' : ''} for better consistency.`
    }
    
    return `Add ${deficit} more sources - currently only ${(probability * 100).toFixed(1)}% reliable.`
  }

  /**
   * Clear calculation cache
   */
  clearCache(): void {
    this.cache.hypergeometric.clear()
    this.cache.binomial.clear()
    this.cache.factorial.clear()
    this.cache.combinations.clear()
    this.metrics.cacheHits = 0
    this.metrics.cacheMisses = 0
  }

  /**
   * Get performance metrics
   */
  getMetrics(): CalculationMetrics {
    this.metrics.endTime = performance.now()
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime
    this.metrics.calculationsPerformed = this.metrics.cacheHits + this.metrics.cacheMisses
    this.metrics.averageCalculationTime = this.metrics.calculationsPerformed > 0 
      ? this.metrics.duration / this.metrics.calculationsPerformed 
      : 0
    this.cache.hitRate = this.metrics.calculationsPerformed > 0 
      ? this.metrics.cacheHits / this.metrics.calculationsPerformed 
      : 0
    
    return { ...this.metrics }
  }
}

// Export default instance for compatibility
export const advancedMathEngine = new AdvancedMathEngine()

// Add missing methods to instance for test compatibility
;(advancedMathEngine as any).calculateHypergeometric = advancedMathEngine.cumulativeHypergeometric.bind(advancedMathEngine)

// Export compatibility methods for existing tests
export const calculateHypergeometric = (params: HypergeometricParams) => 
  advancedMathEngine.cumulativeHypergeometric(params)

export const calculateKarstenProbability = (
  deckSize: number,
  sourcesInDeck: number,
  turn: number,
  symbolsNeeded: number,
  onThePlay: boolean = true,
  handSize: number = 7
) => advancedMathEngine.calculateKarstenProbability(deckSize, sourcesInDeck, turn, symbolsNeeded, onThePlay, handSize)

export const runMonteCarloSimulation = (params: MonteCarloParams) => 
  advancedMathEngine.runMonteCarloSimulation(params)

export const analyzeMultivariateRequirements = (
  deckConfig: DeckConfiguration,
  colorRequirements: ColorRequirement[]
) => advancedMathEngine.analyzeMultivariateRequirements(deckConfig, colorRequirements)

// Export the class as default for new implementations
export default AdvancedMathEngine 