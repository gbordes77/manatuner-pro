import { test, expect, describe } from 'vitest';
import { calculateHypergeometric, manaCalculator } from '../../../src/services/manaCalculator';

describe('🔢 Tests de Validation Mathématique - Frank Karsten', () => {
  
  describe('Formules de Base Validées', () => {
    test('14 sources pour 1 mana coloré turn 1 (90%)', () => {
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        14,  // sourcesInDeck
        1,   // turn
        1,   // symbolsNeeded
        true // onThePlay
      );
      
      // Frank Karsten : 14 sources = ~90% pour 1 mana turn 1
      expect(result.probability).toBeCloseTo(0.90, 1);
      expect(result.meetsThreshold).toBe(true);
    });

    test('18 sources pour 2 manas colorés turn 2 (90%)', () => {
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        18,  // sourcesInDeck
        2,   // turn
        2,   // symbolsNeeded
        true // onThePlay
      );
      
      // Frank Karsten : 18 sources = ~90% pour 2 manas turn 2
      expect(result.probability).toBeCloseTo(0.90, 1);
    });

    test('20 sources pour CC (double mana) turn 2', () => {
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        20,  // sourcesInDeck
        2,   // turn
        2,   // symbolsNeeded (CC = 2 du même type)
        true // onThePlay
      );
      
      // CC est plus difficile que 2 manas différents
      expect(result.probability).toBeGreaterThan(0.85);
    });

    test('23 sources pour 1CCC turn 4', () => {
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        23,  // sourcesInDeck
        4,   // turn
        3,   // symbolsNeeded (CCC)
        true // onThePlay
      );
      
      expect(result.probability).toBeCloseTo(0.90, 1);
    });
  });

  describe('Cas Limites et Edge Cases', () => {
    test('Deck 40 cartes (Limited)', () => {
      const result = manaCalculator.calculateManaProbability(
        40,  // deckSize Limited
        9,   // sourcesInDeck (proportionnel)
        1,   // turn
        1,   // symbolsNeeded
        true // onThePlay
      );
      
      expect(result.probability).toBeGreaterThan(0.85);
    });

    test('Commander 100 cartes', () => {
      const result = manaCalculator.calculateManaProbability(
        100, // deckSize Commander
        23,  // sourcesInDeck
        1,   // turn
        1,   // symbolsNeeded
        true // onThePlay
      );
      
      // Plus difficile avec 100 cartes
      expect(result.probability).toBeLessThan(0.90);
    });

    test('Mulligan - main de 6', () => {
      // Simuler un mulligan (main de 6 au lieu de 7)
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        14,  // sourcesInDeck
        1,   // turn
        1,   // symbolsNeeded
        true, // onThePlay
        6    // handSize après mulligan
      );
      
      expect(result.probability).toBeLessThan(0.90);
    });
  });

  describe('Validation contre Données Publiées', () => {
    test('Table de Frank Karsten - Turn 3 avec 1CC', () => {
      const scenarios = [
        { sources: 15, turn: 3, symbols: 1, expectedMin: 0.95 },
        { sources: 19, turn: 3, symbols: 2, expectedMin: 0.90 },
        { sources: 22, turn: 3, symbols: 3, expectedMin: 0.85 }
      ];

      scenarios.forEach(({ sources, turn, symbols, expectedMin }) => {
        const result = manaCalculator.calculateManaProbability(
          60, sources, turn, symbols, true
        );
        expect(result.probability).toBeGreaterThan(expectedMin);
      });
    });
  });

  describe('Performance des Calculs', () => {
    test('Calcul complexe en moins de 100ms', () => {
      const start = performance.now();
      
      // Calcul complexe : 4 couleurs, multiples symboles
      for (let i = 0; i < 100; i++) {
        manaCalculator.calculateManaProbability(60, 20, 4, 2, true);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // 100ms pour 100 calculs
    });
  });
}); 