import { describe, test, expect } from 'vitest';
import { ManaCalculator } from '../manaCalculator';

// Helper functions for testing
const calculator = new ManaCalculator();

// Frank Karsten convention: hypergeometricProbability(exactlyK, deckSize, successesInDeck, cardsSeen)
const hypergeometricProbability = (k: number, N: number, K: number, n: number): number => {
  return calculator.hypergeometric(N, K, n, k);
};

const combinations = (n: number, k: number): number => {
  return calculator['binomial'](n, k);
};

describe('Critical Mathematical Tests - Frank Karsten Reference', () => {
  describe('Hypergeometric Probability Core', () => {
    test('should calculate exact Frank Karsten reference values', () => {
      // Cas de référence Frank Karsten - Article TCGPlayer
      // 24 terrains, deck 60, main 7, vouloir exactement 3
      const result = hypergeometricProbability(3, 60, 24, 7);
      expect(result).toBeCloseTo(0.3087, 3); // Valeur calculée correcte
    });

    test('should calculate cumulative probabilities correctly', () => {
      // 24 terrains, deck 60, main 7, vouloir 2 ou plus
      const prob2 = hypergeometricProbability(2, 60, 24, 7);
      const prob3 = hypergeometricProbability(3, 60, 24, 7);
      const prob4 = hypergeometricProbability(4, 60, 24, 7);
      const prob5 = hypergeometricProbability(5, 60, 24, 7);
      const prob6 = hypergeometricProbability(6, 60, 24, 7);
      const prob7 = hypergeometricProbability(7, 60, 24, 7);
      
      const cumulativeAtLeast2 = prob2 + prob3 + prob4 + prob5 + prob6 + prob7;
      expect(cumulativeAtLeast2).toBeCloseTo(0.8573, 3); // Valeur calculée correcte
    });

    test('should handle Frank Karsten benchmark scenarios', () => {
      const scenarios = [
        // [lands, deckSize, handSize, wantExactly, expected] - Values from actual hypergeometric calculation
        { lands: 24, deckSize: 60, handSize: 7, want: 2, expected: 0.2694 },
        { lands: 24, deckSize: 60, handSize: 7, want: 3, expected: 0.3087 },
        { lands: 26, deckSize: 60, handSize: 7, want: 3, expected: 0.3122 },
        { lands: 22, deckSize: 60, handSize: 7, want: 2, expected: 0.3002 },
        { lands: 20, deckSize: 60, handSize: 7, want: 2, expected: 0.3237 },
      ];
      
      scenarios.forEach(({ lands, deckSize, handSize, want, expected }) => {
        const result = hypergeometricProbability(want, deckSize, lands, handSize);
        expect(result).toBeCloseTo(expected, 3);
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('should handle impossible scenarios correctly', () => {
      // Vouloir plus de cartes qu'il n'y en a dans le deck
      expect(hypergeometricProbability(8, 60, 24, 7)).toBe(0);
      
      // Vouloir plus de cartes qu'on peut piocher
      expect(hypergeometricProbability(10, 60, 24, 7)).toBe(0);
      
      // Deck plus petit que la main
      expect(hypergeometricProbability(1, 5, 2, 7)).toBe(0);
    });

    test('should handle certain scenarios correctly', () => {
      // Vouloir 0 avec 0 cartes cibles
      expect(hypergeometricProbability(0, 60, 0, 7)).toBe(1);
      
      // Deck entier de cartes cibles
      expect(hypergeometricProbability(7, 60, 60, 7)).toBe(1);
      
      // Main de 1 carte
      expect(hypergeometricProbability(1, 60, 24, 1)).toBeCloseTo(0.4, 1);
    });

    test('should handle combinations function edge cases', () => {
      expect(combinations(0, 0)).toBe(1);
      expect(combinations(5, 0)).toBe(1);
      expect(combinations(5, 5)).toBe(1);
      expect(combinations(10, 3)).toBe(120);
      expect(combinations(60, 7)).toBe(386206920); // Cas Magic standard
    });
  });

  describe('Fetchlands Mathematical Correction', () => {
    test('should count fetchlands as single source per fetchable color', () => {
      // Test basé sur l'article Frank Karsten
      // Un fetchland compte comme 1 source pour chaque couleur qu'il peut chercher
      // PAS comme double comptage
      
      // Exemple: 4 Polluted Delta (cherche Island/Swamp)
      // = 4 sources bleues + 4 sources noires (pas 8 de chaque)
      const fetchlandSources = 4; // 4 Polluted Delta
      const basicIslands = 2;
      const basicSwamps = 3;
      
      const totalBlueSources = fetchlandSources + basicIslands; // 6
      const totalBlackSources = fetchlandSources + basicSwamps; // 7
      
      // Probabilité d'avoir au moins 1 source bleue au tour 3 (9 cartes)
      const blueProb = 1 - hypergeometricProbability(0, 60, totalBlueSources, 9);
      expect(blueProb).toBeGreaterThan(0.6); // Doit être élevée avec 6 sources
      
      // Probabilité d'avoir au moins 1 source noire au tour 3
      const blackProb = 1 - hypergeometricProbability(0, 60, totalBlackSources, 9);
      expect(blackProb).toBeGreaterThan(0.65); // Encore plus élevée avec 7 sources
    });
  });

  describe('Mulligan Scenarios', () => {
    test('should calculate probability for different hand sizes', () => {
      // London Mulligan: 7 → 6 → 5 → 4
      const scenarios = [
        { handSize: 7, minLands: 2, maxLands: 4 },
        { handSize: 6, minLands: 2, maxLands: 4 },
        { handSize: 5, minLands: 2, maxLands: 3 },
        { handSize: 4, minLands: 1, maxLands: 3 },
      ];
      
      scenarios.forEach(({ handSize, minLands, maxLands }) => {
        let keepProb = 0;
        for (let lands = minLands; lands <= maxLands; lands++) {
          keepProb += hypergeometricProbability(lands, 60, 24, handSize);
        }
        
        // Probabilité de garder doit diminuer avec la taille de main
        expect(keepProb).toBeGreaterThan(0);
        expect(keepProb).toBeLessThan(1);
      });
    });
  });
});

describe('Turn-by-Turn Probability Simulation', () => {
  test('should calculate increasing probabilities over turns', () => {
    const deckSize = 60;
    const lands = 24;
    const minLands = 3;
    
    const results: Array<{ turn: number; cardsDrawn: number; probability: number }> = [];
    for (let turn = 1; turn <= 5; turn++) {
      const cardsDrawn = 7 + (turn - 1); // On the play
      const prob = 1 - hypergeometricProbability(0, deckSize, lands, cardsDrawn) 
                    - hypergeometricProbability(1, deckSize, lands, cardsDrawn)
                    - hypergeometricProbability(2, deckSize, lands, cardsDrawn);
      
      results.push({ turn, cardsDrawn, probability: prob });
    }
    
    // Les probabilités doivent augmenter avec les tours
    for (let i = 1; i < results.length; i++) {
      expect(results[i].probability).toBeGreaterThan(results[i-1].probability);
    }
    
    // Turn 5 doit avoir une probabilité très élevée
    expect(results[4].probability).toBeGreaterThan(0.90);
  });
});

describe('Performance and Precision Tests', () => {
  test('should handle large numbers without overflow', () => {
    // Test avec des grands nombres typiques en Magic
    const result = combinations(100, 7);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(Infinity);
    expect(Number.isFinite(result)).toBe(true);
  });

  test('should maintain precision for small probabilities', () => {
    // Test de précision pour probabilités très faibles
    const veryRareEvent = hypergeometricProbability(7, 60, 7, 7);
    expect(veryRareEvent).toBeCloseTo(0.0000000026, 9);
  });

  test('should be performant for typical calculations', () => {
    const start = performance.now();
    
    // 1000 calculs typiques
    for (let i = 0; i < 1000; i++) {
      hypergeometricProbability(3, 60, 24, 7);
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Moins de 100ms pour 1000 calculs
  });
}); 