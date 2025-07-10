import { describe, it, expect, beforeEach } from 'vitest'
import { advancedMathEngine } from '../advancedMaths'
import type { 
  HypergeometricParams,
  MonteCarloParams,
  DeckConfiguration,
  ColorRequirement
} from '../../types/maths'

describe('Advanced Math Engine - Frank Karsten Methodology', () => {
  beforeEach(() => {
    advancedMathEngine.clearCache()
  })

  describe('Hypergeometric Distribution', () => {
    it('should calculate correct probability for basic hypergeometric scenario', () => {
      // Test case from Frank Karsten's article: 
      // 60 card deck, 24 lands, turn 4 (10 cards seen), need 4 lands
      const result = advancedMathEngine.calculateHypergeometric({
        populationSize: 60,
        successStates: 24,
        sampleSize: 10,
        successesWanted: 4
      })

      // Expected probability should be around 90% based on Karsten's research
      expect(result.probability).toBeGreaterThan(0.85)
      expect(result.probability).toBeLessThan(0.95)
      expect(result.percentage).toBe(result.probability * 100)
    })

    it('should handle edge cases correctly', () => {
      // No success states
      const noSuccess = advancedMathEngine.calculateHypergeometric({
        populationSize: 60,
        successStates: 0,
        sampleSize: 7,
        successesWanted: 1
      })
      expect(noSuccess.probability).toBe(0)

      // More successes wanted than available
      const impossible = advancedMathEngine.calculateHypergeometric({
        populationSize: 60,
        successStates: 10,
        sampleSize: 7,
        successesWanted: 15
      })
      expect(impossible.probability).toBe(0)

      // Guaranteed success
      const guaranteed = advancedMathEngine.calculateHypergeometric({
        populationSize: 60,
        successStates: 60,
        sampleSize: 7,
        successesWanted: 1
      })
      expect(guaranteed.probability).toBe(1)
    })
  })

  describe('Frank Karsten Turn Analysis', () => {
    it('should match Karsten\'s published results for standard scenarios', () => {
      // Test case: 2 mana spell requiring 1 specific color
      // 60 card deck, 12 sources of that color
      const analysis = advancedMathEngine.calculateKarstenProbability(
        60,  // deck size
        12,  // sources
        2,   // turn
        1,   // symbols needed
        true, // on the play
        7    // hand size
      )

      // Should be around 85-90% based on Karsten's research
      expect(analysis.castProbability).toBeGreaterThan(0.80)
      expect(analysis.castProbability).toBeLessThan(0.95)
      expect(analysis.turn).toBe(2)
      expect(analysis.cardsDrawn).toBe(8) // 7 + 1 draw
    })

    it('should calculate correct cards drawn for different scenarios', () => {
      // On the play
      const onPlay = advancedMathEngine.calculateKarstenProbability(60, 12, 3, 1, true, 7)
      expect(onPlay.cardsDrawn).toBe(9) // 7 + 2 draws

      // On the draw
      const onDraw = advancedMathEngine.calculateKarstenProbability(60, 12, 3, 1, false, 7)
      expect(onDraw.cardsDrawn).toBe(10) // 7 + 3 draws (extra card on draw)
    })

    it('should provide accurate Karsten recommendations', () => {
      // Insufficient sources scenario
      const insufficient = advancedMathEngine.calculateKarstenProbability(60, 8, 3, 2, true, 7)
      expect(insufficient.karstenRating.rating).toBe('poor')
      expect(insufficient.karstenRating.deficit).toBeGreaterThan(0)
      expect(insufficient.karstenRating.recommendation).toContain('sources')

      // Optimal sources scenario
      const optimal = advancedMathEngine.calculateKarstenProbability(60, 14, 3, 2, true, 7)
      expect(optimal.karstenRating.rating).toMatch(/good|excellent/)
      expect(optimal.karstenRating.deficit).toBe(0)
    })
  })

  describe('Monte Carlo Simulation', () => {
    it('should run stable simulations with consistent results', async () => {
      const params: MonteCarloParams = {
        deckSize: 60,
        landCount: 24,
        targetTurn: 4,
        iterations: 1000,
        mulliganStrategy: 'aggressive',
        maxMulligans: 2,
        onThePlay: true,
        spellRequirements: [
          { turn: 2, manaCost: 2, colorRequirements: { W: 1 } },
          { turn: 3, manaCost: 3, colorRequirements: { W: 2 } },
          { turn: 4, manaCost: 4, colorRequirements: { W: 2 } }
        ]
      }

      const result = await advancedMathEngine.runMonteCarloSimulation(params)

      expect(result.iterations).toBe(1000)
      expect(result.successRate).toBeGreaterThan(0)
      expect(result.successRate).toBeLessThan(100)
      expect(result.averageTurn).toBeGreaterThan(0)
      expect(result.standardDeviation).toBeGreaterThan(0)
      expect(result.confidence.lower).toBeLessThan(result.confidence.upper)
      expect(result.distribution).toHaveLength(params.targetTurn + 1)
    })

    it('should handle different mulligan strategies correctly', async () => {
      const baseParams: MonteCarloParams = {
        deckSize: 60,
        landCount: 20, // Intentionally low for testing
        targetTurn: 4,
        iterations: 500,
        maxMulligans: 1,
        onThePlay: true,
        spellRequirements: [
          { turn: 2, manaCost: 2, colorRequirements: { R: 1 } }
        ]
      }

      // Conservative strategy (keep more hands)
      const conservative = await advancedMathEngine.runMonteCarloSimulation({
        ...baseParams,
        mulliganStrategy: 'conservative'
      })

      // Aggressive strategy (mulligan more often)
      const aggressive = await advancedMathEngine.runMonteCarloSimulation({
        ...baseParams,
        mulliganStrategy: 'aggressive'
      })

      // Aggressive should generally perform better with low land count
      expect(aggressive.successRate).toBeGreaterThanOrEqual(conservative.successRate * 0.9)
    })
  })

  describe('Multivariate Analysis', () => {
    it('should analyze multi-color requirements correctly', () => {
      const deckConfig: DeckConfiguration = {
        deckSize: 60,
        handSize: 7,
        onThePlay: true,
        sources: {
          W: 12,
          U: 8,
          B: 0,
          R: 0,
          G: 0,
          C: 4
        }
      }

      const colorRequirements: ColorRequirement[] = [
        { color: 'W', symbolsNeeded: 2, turn: 3 },
        { color: 'U', symbolsNeeded: 1, turn: 2 }
      ]

      const analysis = advancedMathEngine.analyzeMultivariateRequirements(
        deckConfig,
        colorRequirements
      )

      expect(analysis.overallConsistency).toBeGreaterThan(0)
      expect(analysis.overallConsistency).toBeLessThan(1)
      expect(analysis.colorAnalysis).toHaveProperty('W')
      expect(analysis.colorAnalysis).toHaveProperty('U')
      expect(analysis.bottleneckColors).toBeInstanceOf(Array)
      expect(analysis.recommendations).toBeInstanceOf(Array)
    })

    it('should identify bottleneck colors correctly', () => {
      const deckConfig: DeckConfiguration = {
        deckSize: 60,
        handSize: 7,
        onThePlay: true,
        sources: {
          W: 16, // Strong
          U: 6,  // Weak - should be bottleneck
          B: 0,
          R: 0,
          G: 0,
          C: 2
        }
      }

      const colorRequirements: ColorRequirement[] = [
        { color: 'W', symbolsNeeded: 2, turn: 3 },
        { color: 'U', symbolsNeeded: 2, turn: 4 }
      ]

      const analysis = advancedMathEngine.analyzeMultivariateRequirements(
        deckConfig,
        colorRequirements
      )

      expect(analysis.bottleneckColors).toContain('U')
      expect(analysis.bottleneckColors).not.toContain('W')
    })
  })

  describe('Performance and Caching', () => {
    it('should cache results for identical calculations', () => {
      const params = { populationSize: 60, successStates: 24, sampleSize: 10, successesWanted: 4 }
      
      // First calculation
      const start1 = performance.now()
      const result1 = advancedMathEngine.calculateHypergeometric(params)
      const time1 = performance.now() - start1

      // Second calculation (should be cached)
      const start2 = performance.now()
      const result2 = advancedMathEngine.calculateHypergeometric(params)
      const time2 = performance.now() - start2

      expect(result1.probability).toBe(result2.probability)
      expect(time2).toBeLessThan(time1 * 0.5) // Cached should be much faster
    })

    it('should provide performance metrics', () => {
      // Run some calculations
      advancedMathEngine.calculateHypergeometric({
        populationSize: 60,
        successStates: 24,
        sampleSize: 10,
        successesWanted: 4
      })

      const metrics = advancedMathEngine.getMetrics()
      
      expect(metrics.calculationsPerformed).toBeGreaterThan(0)
      expect(metrics.cacheHits).toBeGreaterThanOrEqual(0)
      expect(metrics.averageCalculationTime).toBeGreaterThan(0)
      expect(metrics.cacheEfficiency).toBeGreaterThanOrEqual(0)
    })

    it('should clear cache correctly', () => {
      // Populate cache
      advancedMathEngine.calculateHypergeometric({
        populationSize: 60,
        successStates: 24,
        sampleSize: 10,
        successesWanted: 4
      })

      let metrics = advancedMathEngine.getMetrics()
      expect(metrics.calculationsPerformed).toBeGreaterThan(0)

      // Clear cache
      advancedMathEngine.clearCache()
      
      metrics = advancedMathEngine.getMetrics()
      expect(metrics.calculationsPerformed).toBe(0)
      expect(metrics.cacheHits).toBe(0)
    })
  })

  describe('Frank Karsten Reference Values', () => {
    // These tests verify our implementation against known values from Karsten's research
    const karstenTestCases = [
      {
        description: 'Turn 2, 1 mana symbol, 60 cards',
        deckSize: 60,
        sources: 13,
        turn: 2,
        symbols: 1,
        expectedMin: 0.85,
        expectedMax: 0.92
      },
      {
        description: 'Turn 3, 2 mana symbols, 60 cards',
        deckSize: 60,
        sources: 20,
        turn: 3,
        symbols: 2,
        expectedMin: 0.88,
        expectedMax: 0.95
      },
      {
        description: 'Turn 4, 3 mana symbols, 60 cards',
        deckSize: 60,
        sources: 26,
        turn: 4,
        symbols: 3,
        expectedMin: 0.88,
        expectedMax: 0.95
      }
    ]

    karstenTestCases.forEach(testCase => {
      it(`should match Karsten values for: ${testCase.description}`, () => {
        const result = advancedMathEngine.calculateKarstenProbability(
          testCase.deckSize,
          testCase.sources,
          testCase.turn,
          testCase.symbols,
          true,
          7
        )

        expect(result.castProbability).toBeGreaterThanOrEqual(testCase.expectedMin)
        expect(result.castProbability).toBeLessThanOrEqual(testCase.expectedMax)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid parameters gracefully', () => {
      expect(() => {
        advancedMathEngine.calculateHypergeometric({
          populationSize: -1,
          successStates: 10,
          sampleSize: 5,
          successesWanted: 2
        })
      }).toThrow()

      expect(() => {
        advancedMathEngine.calculateKarstenProbability(60, 70, 3, 1, true, 7)
      }).toThrow('Sources cannot exceed deck size')
    })

    it('should validate Monte Carlo parameters', async () => {
      const invalidParams: MonteCarloParams = {
        deckSize: 60,
        landCount: 70, // Invalid: more lands than deck size
        targetTurn: 4,
        iterations: 100,
        mulliganStrategy: 'conservative',
        maxMulligans: 2,
        onThePlay: true,
        spellRequirements: []
      }

      await expect(
        advancedMathEngine.runMonteCarloSimulation(invalidParams)
      ).rejects.toThrow()
    })
  })
}) 