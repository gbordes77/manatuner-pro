// Mathematical types for Frank Karsten methodology and advanced manabase analysis

export interface HypergeometricParams {
  populationSize: number     // N - Total deck size (usually 60)
  successStates: number      // K - Number of "success" cards in deck (lands of specific color)
  sampleSize: number         // n - Number of cards drawn (hand + draws)
  successesWanted: number    // k - Minimum successes needed
}

export interface ProbabilityResult {
  probability: number        // Decimal probability (0-1)
  percentage: number        // Percentage (0-100)
  meetsThreshold: boolean   // Whether it meets 90% threshold
  confidence: 'low' | 'medium' | 'high' | 'excellent'
}

export interface KarstenRecommendation {
  sourcesNeeded: number     // Recommended sources for 90% probability
  sourcesAvailable: number  // Current sources in deck
  deficit: number          // How many sources short/over
  rating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unplayable'
  recommendation: string   // Human-readable advice
}

export interface TurnAnalysis {
  turn: number
  cardsDrawn: number       // Hand size + draws (7 + turn - 1)
  landProbability: number  // Probability of having enough lands
  colorProbability: number // Probability of having right colors
  castProbability: number  // Overall probability of casting spell
  karstenRating: KarstenRecommendation
}

export interface MonteCarloParams {
  iterations: number       // Number of simulations (default 10,000)
  deckSize: number
  landCount: number
  targetTurn: number
  mulliganStrategy: 'none' | 'aggressive' | 'conservative' | 'optimal'
  playFirst: boolean       // True if on the play, false if on the draw
  maxMulligans: number     // Maximum mulligans allowed (usually 2)
}

export interface MonteCarloResult {
  iterations: number
  successfulRuns: number
  successRate: number      // Percentage of successful simulations
  averageTurn: number      // Average turn when condition met
  standardDeviation: number
  confidence: {
    lower: number         // 95% confidence interval lower bound
    upper: number         // 95% confidence interval upper bound
  }
  distribution: number[]   // Success count per turn
}

export interface DeckConfiguration {
  totalCards: number
  landCount: number
  colorRequirements: ColorRequirement[]
  averageCMC: number
  format: MTGFormat
  fetchlands: number       // Special handling for fetchlands
  duallands: number        // Dual lands count
  basics: number          // Basic lands count
}

export interface ColorRequirement {
  color: ManaColor
  sources: number         // Current sources in deck
  intensity: number       // How many symbols needed (1 for R, 2 for RR, etc.)
  criticalTurn: number    // Turn when this color is most needed
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'
export type MTGFormat = 'standard' | 'modern' | 'legacy' | 'vintage' | 'commander' | 'pioneer' | 'historic'

// Frank Karsten's magic constants
export const MAGIC_CONSTANTS = {
  // Probability thresholds
  EXCELLENT_THRESHOLD: 0.95,    // 95%+ probability
  GOOD_THRESHOLD: 0.90,         // 90%+ probability (Karsten standard)
  ACCEPTABLE_THRESHOLD: 0.80,   // 80%+ probability
  POOR_THRESHOLD: 0.60,         // 60%+ probability
  
  // Deck composition constants
  STANDARD_DECK_SIZE: 60,
  COMMANDER_DECK_SIZE: 100,
  LIMITED_DECK_SIZE: 40,
  
  // Hand and draw constants
  OPENING_HAND_SIZE: 7,
  MULLIGAN_HAND_SIZE: 6,
  MIN_MULLIGAN_HAND: 4,
  
  // Turn constants
  MAX_ANALYSIS_TURN: 10,        // Don't analyze beyond turn 10
  CRITICAL_EARLY_TURNS: [1, 2, 3, 4], // Most important turns
  
  // Mana curve constants
  AGGRESSIVE_MAX_CMC: 4,        // Aggressive decks rarely go above 4 CMC
  MIDRANGE_MAX_CMC: 6,         // Midrange decks top out around 6
  CONTROL_MAX_CMC: 8,          // Control decks can go higher
  
  // Land count guidelines (Frank Karsten recommendations)
  MIN_LANDS_AGGRESSIVE: 20,     // Minimum for aggressive decks
  OPTIMAL_LANDS_MIDRANGE: 24,   // Optimal for midrange
  MAX_LANDS_CONTROL: 28,        // Maximum for most control decks
  
  // Color intensity thresholds
  SINGLE_COLOR_THRESHOLD: 14,   // Sources needed for single colored symbol
  DOUBLE_COLOR_THRESHOLD: 20,   // Sources needed for double colored (CC)
  TRIPLE_COLOR_THRESHOLD: 23,   // Sources needed for triple colored (CCC)
  
  // Fetchland multipliers (per Frank Karsten research)
  FETCHLAND_MULTIPLIER: 1.5,    // Fetchlands count as 1.5x their targets
  DUAL_LAND_EFFICIENCY: 1.8,    // Dual lands are highly efficient
  
  // Monte Carlo constants
  DEFAULT_ITERATIONS: 10000,
  MIN_ITERATIONS: 1000,
  MAX_ITERATIONS: 100000,
  CONFIDENCE_LEVEL: 0.95        // 95% confidence intervals
} as const

// Karsten's lookup tables for optimal sources (2022 Update)
// Source: https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/
export const KARSTEN_TABLES: Record<number, Record<number, number>> = {
  // Sources needed for X colored symbols by turn Y (90% probability)
  1: { // Single colored symbol (e.g., R, 1B, 2W)
    1: 14, 2: 13, 3: 12, 4: 11, 5: 10, 6: 9, 7: 8, 8: 8, 9: 7, 10: 7
  },
  2: { // Double colored symbols (e.g., RR, 1BB, WW)
    2: 20, 3: 18, 4: 16, 5: 15, 6: 14, 7: 13, 8: 12, 9: 11, 10: 11
  },
  3: { // Triple colored symbols (e.g., RRR, BBB)
    3: 23, 4: 20, 5: 19, 6: 18, 7: 17, 8: 16, 9: 15, 10: 14
  },
  4: { // Quadruple colored symbols (rare)
    4: 25, 5: 22, 6: 21, 7: 20, 8: 19, 9: 18, 10: 17
  }
} as const

// Advanced analysis interfaces
export interface MultivariateAnalysis {
  colorCombinations: ColorCombinationAnalysis[]
  overallConsistency: number
  bottleneckColors: ManaColor[]
  recommendations: string[]
  optimalManabase: OptimalManabase
}

export interface ColorCombinationAnalysis {
  colors: ManaColor[]
  probability: number
  sources: number
  deficit: number
  criticalTurn: number
}

export interface OptimalManabase {
  totalLands: number
  colorSources: Record<ManaColor, number>
  fetchlands: number
  duallands: number
  basics: number
  utility: number
  confidence: number
}

// Simulation interfaces
export interface SimulationState {
  hand: string[]           // Cards in hand
  library: string[]        // Cards in library
  turn: number
  landsPlayed: number
  manaAvailable: Record<ManaColor, number>
  spellsCastable: string[]
}

export interface MulliganDecision {
  shouldMulligan: boolean
  reason: string
  handRating: number       // 0-10 scale
  keepProbability: number  // Probability this hand leads to success
}

// Performance tracking
export interface CalculationMetrics {
  startTime: number
  endTime: number
  duration: number
  iterationsCompleted: number
  cacheHits: number
  cacheMisses: number
  memoryUsage?: number
}

// Error handling
export interface MathematicalError {
  type: 'overflow' | 'underflow' | 'invalid_input' | 'convergence_failure'
  message: string
  context: Record<string, any>
  suggestions: string[]
}

// Cache interfaces for performance
export interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  hitCount: number
  computationTime: number
}

export interface MemoizationCache {
  hypergeometric: Map<string, number>
  binomial: Map<string, number>
  factorial: Map<number, number>
  combinations: Map<string, number>
  maxSize: number
  hitRate: number
} 