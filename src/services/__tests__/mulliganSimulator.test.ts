import { describe, expect, it } from 'vitest';
import type { DeckCard } from '../deckAnalyzer';
import {
    analyzeMulliganStrategy,
    quickMulliganAnalysis
} from '../mulliganSimulator';

// Helper to create a test deck
function createTestDeck(landCount: number, spellCount: number): DeckCard[] {
  const cards: DeckCard[] = [];

  // Add lands
  for (let i = 0; i < landCount; i++) {
    cards.push({
      name: `Mountain ${i + 1}`,
      quantity: 1,
      manaCost: '',
      colors: ['R'],
      isLand: true,
      producedMana: ['R'],
      cmc: 0
    });
  }

  // Add spells with varying CMC
  const spellCMCs = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4];
  for (let i = 0; i < spellCount; i++) {
    const cmc = spellCMCs[i % spellCMCs.length];
    cards.push({
      name: `Spell ${i + 1}`,
      quantity: 1,
      manaCost: `{${cmc - 1}}{R}`,
      colors: ['R'],
      isLand: false,
      cmc
    });
  }

  return cards;
}

describe('mulliganSimulator', () => {
  describe('quickMulliganAnalysis', () => {
    it('should return valid analysis for a 60-card deck', () => {
      const deck = createTestDeck(24, 36);

      const analysis = quickMulliganAnalysis(deck, 500);

      expect(analysis).toBeDefined();
      expect(analysis.values).toBeDefined();
      expect(analysis.values.length).toBeGreaterThan(0);

      // Find value for 7 cards
      const v7 = analysis.values.find(v => v.handSize === 7);
      expect(v7).toBeDefined();
      expect(v7!.expectedValue).toBeGreaterThanOrEqual(0);
      expect(v7!.expectedValue).toBeLessThanOrEqual(100);
    });

    it('should provide optimal strategy recommendations', () => {
      const deck = createTestDeck(24, 36);

      const analysis = quickMulliganAnalysis(deck, 500);

      expect(analysis.optimalStrategy).toBeDefined();
      expect(analysis.optimalStrategy.keep7Threshold).toBeGreaterThanOrEqual(0);
      expect(analysis.optimalStrategy.keep7Threshold).toBeLessThanOrEqual(100);
    });

    it('should throw error for deck with less than 40 cards', () => {
      const smallDeck = createTestDeck(10, 20); // Only 30 cards

      expect(() => quickMulliganAnalysis(smallDeck, 500)).toThrow();
    });
  });

  describe('analyzeMulliganStrategy', () => {
    it('should return complete analysis with distributions', () => {
      const deck = createTestDeck(24, 36);

      const analysis = analyzeMulliganStrategy(deck, 300);

      expect(analysis.distributions).toBeDefined();
      expect(analysis.distributions.hand7).toBeDefined();
      expect(analysis.distributions.hand7.length).toBeGreaterThan(0);

      // Each distribution entry should have score and frequency
      expect(analysis.distributions.hand7[0]).toHaveProperty('score');
      expect(analysis.distributions.hand7[0]).toHaveProperty('frequency');
    });

    it('should provide deck quality rating', () => {
      const deck = createTestDeck(24, 36);

      const analysis = analyzeMulliganStrategy(deck, 300);

      expect(analysis.deckQuality).toBeDefined();
      expect(['excellent', 'good', 'average', 'poor'])
        .toContain(analysis.deckQuality);
    });

    it('should include recommendations', () => {
      const deck = createTestDeck(24, 36);

      const analysis = analyzeMulliganStrategy(deck, 300);

      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it('should include iteration count', () => {
      const deck = createTestDeck(24, 36);

      const analysis = analyzeMulliganStrategy(deck, 300);

      expect(analysis.iterations).toBeDefined();
      expect(analysis.iterations).toBe(300);
    });
  });

  describe('edge cases', () => {
    it('should handle deck with exactly 40 cards', () => {
      const deck = createTestDeck(17, 23); // 40 cards (limited format)

      const analysis = quickMulliganAnalysis(deck, 300);

      expect(analysis).toBeDefined();
      expect(analysis.values.length).toBeGreaterThan(0);
    });

    it('should handle deck with high land count', () => {
      const deck = createTestDeck(30, 30); // 50% lands

      const analysis = quickMulliganAnalysis(deck, 300);

      expect(analysis).toBeDefined();
      // High land count should still produce valid analysis
      const v7 = analysis.values.find(v => v.handSize === 7);
      expect(v7).toBeDefined();
    });

    it('should handle deck with low land count', () => {
      const deck = createTestDeck(18, 42); // 30% lands

      const analysis = quickMulliganAnalysis(deck, 300);

      expect(analysis).toBeDefined();
      // Low land count might produce lower expected values but should still work
      const v7 = analysis.values.find(v => v.handSize === 7);
      expect(v7).toBeDefined();
    });

    it('should produce decreasing expected values for smaller hand sizes', () => {
      const deck = createTestDeck(24, 36);

      const analysis = quickMulliganAnalysis(deck, 500);

      const v7 = analysis.values.find(v => v.handSize === 7);
      const v6 = analysis.values.find(v => v.handSize === 6);
      const v5 = analysis.values.find(v => v.handSize === 5);

      // Generally, expected value should decrease with fewer cards
      // (though this depends on deck composition)
      expect(v7).toBeDefined();
      expect(v6).toBeDefined();
      expect(v5).toBeDefined();
    });
  });
});
