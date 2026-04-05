/**
 * Mulligan Simulator — Re-export layer
 *
 * All simulation logic lives in mulliganSimulatorAdvanced.ts.
 * This file provides backward-compatible exports for existing consumers.
 */

import type { DeckCard } from './deckAnalyzer'
import { analyzeWithArchetype, type AdvancedMulliganResult } from './mulliganSimulatorAdvanced'

// Re-export shared types and utilities
export {
  type SimulatedCard,
  type SimulatedHand,
  prepareDeckForSimulation,
  chooseBottom,
  simulateSingleGameAdvanced as simulateSingleGame,
} from './mulliganSimulatorAdvanced'

// =============================================================================
// BACKWARD-COMPATIBLE TYPES
// =============================================================================

export interface MulliganValue {
  handSize: number
  expectedValue: number
  threshold: number
  sampleSize: number
  distribution: number[]
}

export interface MulliganAnalysisResult {
  values: MulliganValue[]
  optimalStrategy: {
    keep7Threshold: number
    keep6Threshold: number
    keep5Threshold: number
  }
  distributions: {
    hand7: { score: number; frequency: number }[]
    hand6: { score: number; frequency: number }[]
    hand5: { score: number; frequency: number }[]
  }
  recommendations: string[]
  deckQuality: 'excellent' | 'good' | 'average' | 'poor'
  iterations: number
}

// =============================================================================
// BACKWARD-COMPATIBLE FUNCTIONS
// =============================================================================

/**
 * Convert AdvancedMulliganResult to legacy MulliganAnalysisResult format.
 */
function toMulliganAnalysisResult(result: AdvancedMulliganResult): MulliganAnalysisResult {
  return {
    values: [
      {
        handSize: 4,
        expectedValue: result.expectedScores.hand4,
        threshold: 0,
        sampleSize: result.iterations,
        distribution: [],
      },
      {
        handSize: 5,
        expectedValue: result.expectedScores.hand5,
        threshold: result.thresholds.keep5,
        sampleSize: result.iterations,
        distribution: result.distributions.hand5.map((d) => d.frequency),
      },
      {
        handSize: 6,
        expectedValue: result.expectedScores.hand6,
        threshold: result.thresholds.keep6,
        sampleSize: result.iterations,
        distribution: result.distributions.hand6.map((d) => d.frequency),
      },
      {
        handSize: 7,
        expectedValue: result.expectedScores.hand7,
        threshold: result.thresholds.keep7,
        sampleSize: result.iterations,
        distribution: result.distributions.hand7.map((d) => d.frequency),
      },
    ],
    optimalStrategy: {
      keep7Threshold: result.thresholds.keep7,
      keep6Threshold: result.thresholds.keep6,
      keep5Threshold: result.thresholds.keep5,
    },
    distributions: result.distributions,
    recommendations: result.recommendations,
    deckQuality: result.deckQuality,
    iterations: result.iterations,
  }
}

/**
 * Run complete mulligan analysis using midrange archetype as default.
 * For archetype-specific analysis, use analyzeWithArchetype directly.
 */
export function analyzeMulliganStrategy(
  cards: DeckCard[],
  iterations: number = 10000
): MulliganAnalysisResult {
  return toMulliganAnalysisResult(analyzeWithArchetype(cards, 'midrange', iterations))
}

/**
 * Quick analysis with fewer iterations (for UI responsiveness)
 */
export function quickMulliganAnalysis(
  cards: DeckCard[],
  iterations: number = 2000
): MulliganAnalysisResult {
  return analyzeMulliganStrategy(cards, iterations)
}
