import { test, expect, describe } from 'vitest';
import { calculateHypergeometric, manaCalculator } from '../../../src/services/manaCalculator';

describe('🔢 Tests de Validation Mathématique - Frank Karsten', () => {
  
  describe('Formules de Base Validées', () => {
    test('14 sources pour 1 mana coloré turn 1 (~86%)', () => {
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        14,  // sourcesInDeck
        1,   // turn
        1,   // symbolsNeeded
        true // onThePlay
      );
      
      // CORRECTION: Valeur hypergéométrique exacte, pas approximation Karsten
      // 14 sources dans 60 cartes, 7 cartes vues, au moins 1 source = ~86%
      expect(result.probability).toBeCloseTo(0.861, 2);
      expect(result.meetsThreshold).toBe(false); // < 90%
    });

    test('18 sources pour 2 manas colorés turn 2 (~76%)', () => {
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        18,  // sourcesInDeck
        2,   // turn
        2,   // symbolsNeeded
        true // onThePlay
      );
      
      // CORRECTION: 18 sources, 8 cartes vues, au moins 2 sources = ~76%
      expect(result.probability).toBeCloseTo(0.764, 2);
    });

    test('20 sources pour CC (double mana) turn 2 (~82%)', () => {
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        20,  // sourcesInDeck
        2,   // turn
        2,   // symbolsNeeded (CC = 2 du même type)
        true // onThePlay
      );
      
      // CORRECTION: 20 sources, 8 cartes vues, au moins 2 sources = ~82%
      expect(result.probability).toBeCloseTo(0.824, 2);
    });

    test('23 sources pour 1CCC turn 4 (~83%)', () => {
      const result = manaCalculator.calculateManaProbability(
        60,  // deckSize
        23,  // sourcesInDeck
        4,   // turn
        3,   // symbolsNeeded (CCC)
        true // onThePlay
      );
      
      // CORRECTION: 23 sources, 10 cartes vues, au moins 3 sources = ~83%
      expect(result.probability).toBeCloseTo(0.828, 2);
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
      
      expect(result.probability).toBeLessThan(0.86); // Moins que main de 7
    });
  });

  describe('Validation contre Données Publiées', () => {
    test('Valeurs hypergéométriques exactes - Turn 3', () => {
      const scenarios = [
        { sources: 15, turn: 3, symbols: 1, expectedMin: 0.90 },  // Ajusté
        { sources: 20, turn: 3, symbols: 2, expectedMin: 0.85 },  // Ajusté  
        { sources: 24, turn: 3, symbols: 3, expectedMin: 0.78 }   // Ajusté (78.8%)
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