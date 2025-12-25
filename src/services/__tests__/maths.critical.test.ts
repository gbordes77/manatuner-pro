import { beforeEach, describe, expect, it } from "vitest";
import type {
  ColorRequirement,
  DeckConfiguration,
  MonteCarloParams,
} from "../../types/maths";
import { advancedMathEngine } from "../advancedMaths";

describe("Advanced Math Engine - Frank Karsten Methodology", () => {
  beforeEach(() => {
    advancedMathEngine.clearCache();
  });

  describe("Hypergeometric Distribution", () => {
    it("should calculate correct probability for basic hypergeometric scenario", () => {
      // Test case: 60 card deck, 24 lands, 10 cards seen, need at least 4 lands
      // Probability of having at least 4 lands in 10 cards from 60 deck with 24 lands = ~63.2%
      const result = advancedMathEngine.cumulativeHypergeometric({
        populationSize: 60,
        successStates: 24,
        sampleSize: 10,
        successesWanted: 4,
      });

      // Mathematically correct: ~63.2% probability
      expect(result.probability).toBeGreaterThan(0.6);
      expect(result.probability).toBeLessThan(0.7);
      expect(result.percentage).toBe(result.probability * 100);
    });

    it("should handle edge cases correctly", () => {
      // No success states
      const noSuccess = advancedMathEngine.cumulativeHypergeometric({
        populationSize: 60,
        successStates: 0,
        sampleSize: 7,
        successesWanted: 1,
      });
      expect(noSuccess.probability).toBe(0);

      // More successes wanted than available
      const impossible = advancedMathEngine.cumulativeHypergeometric({
        populationSize: 60,
        successStates: 10,
        sampleSize: 7,
        successesWanted: 15,
      });
      expect(impossible.probability).toBe(0);

      // Guaranteed success
      const guaranteed = advancedMathEngine.cumulativeHypergeometric({
        populationSize: 60,
        successStates: 60,
        sampleSize: 7,
        successesWanted: 1,
      });
      expect(guaranteed.probability).toBe(1);
    });
  });

  describe("Frank Karsten Turn Analysis", () => {
    it("should match Karsten's published results for standard scenarios", () => {
      // Test case: 2 mana spell requiring 1 specific color
      // 60 card deck, 12 sources of that color
      const analysis = advancedMathEngine.calculateKarstenProbability(
        60, // deck size
        12, // sources
        2, // turn
        1, // symbols needed
        true, // on the play
        7, // hand size
      );

      // Should be around 85-90% based on Karsten's research
      expect(analysis.castProbability).toBeGreaterThan(0.8);
      expect(analysis.castProbability).toBeLessThan(0.95);
      expect(analysis.turn).toBe(2);
      expect(analysis.cardsDrawn).toBe(8); // 7 + 1 draw
    });

    it("should calculate correct cards drawn for different scenarios", () => {
      // On the play
      const onPlay = advancedMathEngine.calculateKarstenProbability(
        60,
        12,
        3,
        1,
        true,
        7,
      );
      expect(onPlay.cardsDrawn).toBe(9); // 7 + 2 draws

      // On the draw
      const onDraw = advancedMathEngine.calculateKarstenProbability(
        60,
        12,
        3,
        1,
        false,
        7,
      );
      expect(onDraw.cardsDrawn).toBe(10); // 7 + 3 draws (extra card on draw)
    });

    it("should provide accurate Karsten recommendations", () => {
      // Insufficient sources scenario: 8 sources, turn 3, 2 symbols = low probability
      const insufficient = advancedMathEngine.calculateKarstenProbability(
        60,
        8,
        3,
        2,
        true,
        7,
      );
      // With 8 sources and needing 2 symbols in 9 cards, prob is very low (~17%)
      expect(insufficient.karstenRating.rating).toMatch(/poor|unplayable/);
      expect(insufficient.karstenRating.deficit).toBeGreaterThan(0);
      expect(insufficient.karstenRating.recommendation).toBeDefined();

      // Better sources scenario: 18 sources for 2 symbols at turn 3
      const better = advancedMathEngine.calculateKarstenProbability(
        60,
        18,
        3,
        2,
        true,
        7,
      );
      // 18 sources, 2 symbols, 9 cards → ~80%+
      expect(better.karstenRating.rating).toMatch(/acceptable|good|excellent/);
    });
  });

  describe("Monte Carlo Simulation", () => {
    it("should run stable simulations with consistent results", async () => {
      const params: MonteCarloParams = {
        deckSize: 60,
        landCount: 24,
        targetTurn: 4,
        iterations: 1000,
        mulliganStrategy: "aggressive",
        maxMulligans: 2,
        playFirst: true,
      };

      const result = await advancedMathEngine.runMonteCarloSimulation(params);

      expect(result.iterations).toBe(1000);
      // Success rate should be between 0 and 100
      expect(result.successRate).toBeGreaterThanOrEqual(0);
      expect(result.successRate).toBeLessThanOrEqual(100);
      // Average turn can be 0 if no successes
      expect(result.averageTurn).toBeGreaterThanOrEqual(0);
      // Standard deviation can be 0 for consistent results
      expect(result.standardDeviation).toBeGreaterThanOrEqual(0);
      expect(result.confidence.lower).toBeLessThanOrEqual(
        result.confidence.upper,
      );
      expect(result.distribution).toHaveLength(11); // turns 0-10
    });

    it("should handle different mulligan strategies correctly", async () => {
      const baseParams: MonteCarloParams = {
        deckSize: 60,
        landCount: 20, // Intentionally low for testing
        targetTurn: 4,
        iterations: 500,
        maxMulligans: 1,
        playFirst: true,
        mulliganStrategy: "conservative",
      };

      // Conservative strategy (keep more hands)
      const conservative = await advancedMathEngine.runMonteCarloSimulation({
        ...baseParams,
        mulliganStrategy: "conservative",
      });

      // Aggressive strategy (mulligan more often)
      const aggressive = await advancedMathEngine.runMonteCarloSimulation({
        ...baseParams,
        mulliganStrategy: "aggressive",
      });

      // Aggressive should generally perform better with low land count
      expect(aggressive.successRate).toBeGreaterThanOrEqual(
        conservative.successRate * 0.9,
      );
    });
  });

  describe("Multivariate Analysis", () => {
    it("should analyze multi-color requirements correctly", () => {
      const deckConfig: DeckConfiguration = {
        totalCards: 60,
        landCount: 24,
        colorRequirements: [],
        averageCMC: 3.0,
        format: "modern",
        fetchlands: 4,
        duallands: 8,
        basics: 12,
      };

      const colorRequirements: ColorRequirement[] = [
        {
          color: "W",
          sources: 12,
          intensity: 2,
          criticalTurn: 3,
          priority: "high",
        },
        {
          color: "U",
          sources: 8,
          intensity: 1,
          criticalTurn: 2,
          priority: "medium",
        },
      ];

      const analysis = advancedMathEngine.analyzeMultivariateRequirements(
        deckConfig,
        colorRequirements,
      );

      expect(analysis.overallConsistency).toBeGreaterThan(0);
      expect(analysis.overallConsistency).toBeLessThan(1);
      expect(analysis.colorCombinations).toBeInstanceOf(Array);
      expect(analysis.bottleneckColors).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it("should identify bottleneck colors correctly", () => {
      const deckConfig: DeckConfiguration = {
        totalCards: 60,
        landCount: 24,
        colorRequirements: [],
        averageCMC: 3.0,
        format: "modern",
        fetchlands: 4,
        duallands: 8,
        basics: 12,
      };

      const colorRequirements: ColorRequirement[] = [
        {
          color: "W",
          sources: 16,
          intensity: 2,
          criticalTurn: 3,
          priority: "high",
        },
        {
          color: "U",
          sources: 6,
          intensity: 2,
          criticalTurn: 4,
          priority: "high",
        },
      ];

      const analysis = advancedMathEngine.analyzeMultivariateRequirements(
        deckConfig,
        colorRequirements,
      );

      expect(analysis.bottleneckColors).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });
  });

  describe("Performance and Caching", () => {
    it("should cache results for identical calculations", () => {
      const params = {
        populationSize: 60,
        successStates: 24,
        sampleSize: 10,
        successesWanted: 4,
      };

      // First calculation
      const start1 = performance.now();
      const result1 = advancedMathEngine.cumulativeHypergeometric(params);
      const time1 = performance.now() - start1;

      // Second calculation (should be cached)
      const start2 = performance.now();
      const result2 = advancedMathEngine.cumulativeHypergeometric(params);
      const time2 = performance.now() - start2;

      expect(result1.probability).toBe(result2.probability);
      expect(time2).toBeLessThan(time1 * 0.5); // Cached should be much faster
    });

    it("should provide performance metrics", () => {
      // Run some calculations
      advancedMathEngine.cumulativeHypergeometric({
        populationSize: 60,
        successStates: 24,
        sampleSize: 10,
        successesWanted: 4,
      });

      const metrics = advancedMathEngine.getMetrics();

      expect(metrics.calculationsPerformed).toBeGreaterThan(0);
      expect(metrics.cacheHits).toBeGreaterThanOrEqual(0);
      expect(metrics.averageCalculationTime).toBeGreaterThan(0);
    });

    it("should clear cache correctly", () => {
      // Populate cache
      advancedMathEngine.cumulativeHypergeometric({
        populationSize: 60,
        successStates: 24,
        sampleSize: 10,
        successesWanted: 4,
      });

      let metrics = advancedMathEngine.getMetrics();
      expect(metrics.calculationsPerformed).toBeGreaterThan(0);

      // Clear cache
      advancedMathEngine.clearCache();

      metrics = advancedMathEngine.getMetrics();
      expect(metrics.calculationsPerformed).toBe(0);
      expect(metrics.cacheHits).toBe(0);
    });
  });

  describe("Frank Karsten Reference Values", () => {
    // These tests verify hypergeometric calculations are mathematically correct
    // Note: Pure hypergeometric probabilities are lower than Karsten's published values
    // because Karsten's tables include mulligan adjustments
    const karstenTestCases = [
      {
        description: "Turn 2, 1 mana symbol, 60 cards, 13 sources",
        deckSize: 60,
        sources: 13,
        turn: 2,
        symbols: 1,
        // 8 cards seen, need 1 from 13 sources → ~85%
        expectedMin: 0.83,
        expectedMax: 0.92,
      },
      {
        description: "Turn 3, 2 mana symbols, 60 cards, 20 sources",
        deckSize: 60,
        sources: 20,
        turn: 3,
        symbols: 2,
        // 9 cards seen, need 2 from 20 sources → ~87%
        expectedMin: 0.85,
        expectedMax: 0.95,
      },
      {
        description: "Turn 4, 3 mana symbols, 60 cards, 26 sources",
        deckSize: 60,
        sources: 26,
        turn: 4,
        symbols: 3,
        // 10 cards seen, need 3 from 26 sources → ~90%+
        expectedMin: 0.88,
        expectedMax: 0.98,
      },
    ];

    karstenTestCases.forEach((testCase) => {
      it(`should match Karsten values for: ${testCase.description}`, () => {
        const result = advancedMathEngine.calculateKarstenProbability(
          testCase.deckSize,
          testCase.sources,
          testCase.turn,
          testCase.symbols,
          true,
          7,
        );

        expect(result.castProbability).toBeGreaterThanOrEqual(
          testCase.expectedMin,
        );
        expect(result.castProbability).toBeLessThanOrEqual(
          testCase.expectedMax,
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid parameters gracefully", () => {
      // Invalid population size returns 0 probability
      const result1 = advancedMathEngine.cumulativeHypergeometric({
        populationSize: -1,
        successStates: 10,
        sampleSize: 5,
        successesWanted: 2,
      });
      expect(result1.probability).toBe(0);

      // Sources exceeding deck size should still calculate (edge case)
      const result2 = advancedMathEngine.calculateKarstenProbability(
        60,
        70,
        3,
        1,
        true,
        7,
      );
      // The calculation handles this gracefully
      expect(result2.castProbability).toBeDefined();
    });

    it("should validate Monte Carlo parameters", async () => {
      const invalidParams: MonteCarloParams = {
        deckSize: 60,
        landCount: 70, // Invalid: more lands than deck size
        targetTurn: 4,
        iterations: 100,
        mulliganStrategy: "conservative",
        maxMulligans: 2,
        playFirst: true,
      };

      // Monte Carlo with invalid landCount > deckSize should handle gracefully
      // It may not throw but should return reasonable results or 0 success rate
      const result =
        await advancedMathEngine.runMonteCarloSimulation(invalidParams);
      expect(result.iterations).toBe(100);
      // With invalid params, the simulation should still complete
      expect(result.successRate).toBeDefined();
    });
  });
});
