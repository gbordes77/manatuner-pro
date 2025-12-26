import { describe, expect, test } from 'vitest';
import {
    categorizeLandComplete,
    isLandCardComplete,
} from '../landUtils';

describe('landUtils - isLandCardComplete', () => {
  test('détecte les basic lands', () => {
    expect(isLandCardComplete('Plains')).toBe(true);
    expect(isLandCardComplete('Island')).toBe(true);
    expect(isLandCardComplete('Swamp')).toBe(true);
    expect(isLandCardComplete('Mountain')).toBe(true);
    expect(isLandCardComplete('Forest')).toBe(true);
    expect(isLandCardComplete('Wastes')).toBe(true);
  });

  test('détecte les fetchlands', () => {
    expect(isLandCardComplete('Flooded Strand')).toBe(true);
    expect(isLandCardComplete('Polluted Delta')).toBe(true);
    expect(isLandCardComplete('Scalding Tarn')).toBe(true);
    expect(isLandCardComplete('Verdant Catacombs')).toBe(true);
    expect(isLandCardComplete('Prismatic Vista')).toBe(true);
    expect(isLandCardComplete('Fabled Passage')).toBe(true);
  });

  test('détecte les shocklands', () => {
    expect(isLandCardComplete('Hallowed Fountain')).toBe(true);
    expect(isLandCardComplete('Blood Crypt')).toBe(true);
    expect(isLandCardComplete('Sacred Foundry')).toBe(true);
    expect(isLandCardComplete('Breeding Pool')).toBe(true);
  });

  test('détecte les fastlands', () => {
    expect(isLandCardComplete('Inspiring Vantage')).toBe(true);
    expect(isLandCardComplete('Blooming Marsh')).toBe(true);
    expect(isLandCardComplete('Spirebluff Canal')).toBe(true);
  });

  test('détecte les checklands', () => {
    expect(isLandCardComplete('Glacial Fortress')).toBe(true);
    expect(isLandCardComplete('Dragonskull Summit')).toBe(true);
    expect(isLandCardComplete('Sunpetal Grove')).toBe(true);
  });

  test('détecte les horizon lands', () => {
    expect(isLandCardComplete('Sunbaked Canyon')).toBe(true);
    expect(isLandCardComplete('Horizon Canopy')).toBe(true);
    expect(isLandCardComplete('Fiery Islet')).toBe(true);
  });

  test('détecte les utility/rainbow lands', () => {
    expect(isLandCardComplete('Mana Confluence')).toBe(true);
    expect(isLandCardComplete('City of Brass')).toBe(true);
    expect(isLandCardComplete('Cavern of Souls')).toBe(true);
  });

  test('détecte les lands récents', () => {
    expect(isLandCardComplete('Starting Town')).toBe(true);
    expect(isLandCardComplete('Elegant Parlor')).toBe(true);
  });

  test('ne détecte pas les non-lands', () => {
    expect(isLandCardComplete('Lightning Bolt')).toBe(false);
    expect(isLandCardComplete('Counterspell')).toBe(false);
    expect(isLandCardComplete('Esper Sentinel')).toBe(false);
  });

  test('est case-insensitive', () => {
    expect(isLandCardComplete('PLAINS')).toBe(true);
    expect(isLandCardComplete('sacred foundry')).toBe(true);
    expect(isLandCardComplete('Scalding TARN')).toBe(true);
  });
});

describe('landUtils - categorizeLandComplete', () => {
  test('catégorise les basic lands', () => {
    expect(categorizeLandComplete('Plains')).toBe('Basic Land');
    expect(categorizeLandComplete('Island')).toBe('Basic Land');
    expect(categorizeLandComplete('Snow-Covered Mountain')).toBe('Basic Land');
  });

  test('catégorise les fetchlands', () => {
    expect(categorizeLandComplete('Flooded Strand')).toBe('Fetchland');
    expect(categorizeLandComplete('Scalding Tarn')).toBe('Fetchland');
    expect(categorizeLandComplete('Prismatic Vista')).toBe('Fetchland');
    expect(categorizeLandComplete('Fabled Passage')).toBe('Fetchland');
  });

  test('catégorise les shocklands', () => {
    expect(categorizeLandComplete('Hallowed Fountain')).toBe('Shockland');
    expect(categorizeLandComplete('Blood Crypt')).toBe('Shockland');
    expect(categorizeLandComplete('Sacred Foundry')).toBe('Shockland');
  });

  test('catégorise les fastlands', () => {
    expect(categorizeLandComplete('Inspiring Vantage')).toBe('Fastland');
    expect(categorizeLandComplete('Blooming Marsh')).toBe('Fastland');
  });

  test('catégorise les horizon lands', () => {
    expect(categorizeLandComplete('Sunbaked Canyon')).toBe('Horizon Land');
    expect(categorizeLandComplete('Horizon Canopy')).toBe('Horizon Land');
  });

  test('catégorise les rainbow lands', () => {
    expect(categorizeLandComplete('Mana Confluence')).toBe('Rainbow Land');
    expect(categorizeLandComplete('City of Brass')).toBe('Rainbow Land');
  });

  test('retourne une catégorie valide pour les lands non spécifiquement catégorisés', () => {
    const result = categorizeLandComplete('Some Unknown Land');
    // La fonction retourne toujours une catégorie valide
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('landUtils - Performance', () => {
  test('isLandCardComplete est rapide (<100ms pour 10000 appels)', () => {
    const lands = [
      'Plains', 'Island', 'Swamp', 'Mountain', 'Forest',
      'Sacred Foundry', 'Scalding Tarn', 'Mana Confluence',
      'Lightning Bolt', 'Counterspell'
    ];

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      lands.forEach(land => isLandCardComplete(land));
    }
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100); // 10000 appels en moins de 100ms
    console.log(`✅ Performance: 10000 isLandCardComplete en ${duration.toFixed(2)}ms`);
  });

  test('categorizeLandComplete est rapide (<100ms pour 6000 appels)', () => {
    const lands = [
      'Plains', 'Sacred Foundry', 'Scalding Tarn', 'Mana Confluence',
      'Inspiring Vantage', 'Glacial Fortress'
    ];

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      lands.forEach(land => categorizeLandComplete(land));
    }
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    console.log(`✅ Performance: 6000 categorizeLandComplete en ${duration.toFixed(2)}ms`);
  });
});
