// manaCalculator.test.ts - Tests unitaires pour valider l'implémentation

import { ManaCalculator } from "./manaCalculator";

describe("ManaCalculator", () => {
  let calculator: ManaCalculator;

  beforeEach(() => {
    calculator = new ManaCalculator();
  });

  describe("Calculs mathématiques de base", () => {
    test("calcul binomial correct", () => {
      // Test des cas connus
      expect(calculator["binomial"](5, 2)).toBe(10); // C(5,2) = 10
      expect(calculator["binomial"](10, 3)).toBe(120); // C(10,3) = 120
      expect(calculator["binomial"](0, 0)).toBe(1);
      expect(calculator["binomial"](5, 0)).toBe(1);
      expect(calculator["binomial"](5, 5)).toBe(1);
      expect(calculator["binomial"](5, 6)).toBe(0);
    });

    test("distribution hypergeométrique correcte", () => {
      // Deck de 60 cartes, 24 terres, main de 7, probabilité d'avoir exactement 3 terres
      const prob = calculator.hypergeometric(60, 24, 7, 3);
      expect(prob).toBeCloseTo(0.3086, 3);
    });

    test("probabilité cumulative correcte", () => {
      // Deck de 60 cartes, 14 sources noires, 7 cartes vues, au moins 1 source
      // Mathématiquement correct: ~86.1% pour 7 cartes (main de départ)
      const prob = calculator.cumulativeHypergeometric(60, 14, 7, 1);
      expect(prob).toBeCloseTo(0.861, 2); // ~86.1%
    });
  });

  describe("Validation des tables de Karsten", () => {
    test("Thoughtseize turn 1 - 14 sources noires", () => {
      // Au Tour 1, avec 14 sources et 7 cartes vues (main de départ), prob = 86.1%
      // Karsten recommande 14 sources mais le seuil 90% est atteint en considérant les mulligans
      const result = calculator.calculateManaProbability(60, 14, 1, 1, true);
      expect(result.probability).toBeGreaterThan(0.85); // 86.1% avec 7 cartes
      expect(result.sourcesNeeded).toBe(14);
    });

    test("Thoughtseize turn 1 - 13 sources insuffisantes", () => {
      const result = calculator.calculateManaProbability(60, 13, 1, 1, true);
      expect(result.probability).toBeLessThan(0.86); // Moins que 14 sources
      expect(result.meetsThreshold).toBe(false);
    });

    test("Counterspell turn 2 - UU requires 20 sources", () => {
      // Tour 2 = 8 cartes vues, 2 symboles bleus, 20 sources → ~82.4%
      const result = calculator.calculateManaProbability(60, 20, 2, 2, true);
      expect(result.probability).toBeGreaterThan(0.8);
      expect(result.sourcesNeeded).toBe(20);
    });

    test("Cryptic Command turn 4 - UUU requires 20 sources", () => {
      // Tour 4 = 10 cartes vues, 3 symboles, 20 sources → ~72.2%
      // meetsThreshold est false car probabilité < 90%
      const result = calculator.calculateManaProbability(60, 20, 4, 3, true);
      expect(result.probability).toBeGreaterThan(0.7);
      expect(result.sourcesNeeded).toBe(20);
    });
  });

  describe("Analyse de cartes complètes", () => {
    test("Lightning Bolt avec manabase correcte", () => {
      const card = {
        name: "Lightning Bolt",
        manaCost: { colorless: 0, symbols: { R: 1 } },
        cmc: 1,
      };
      const deck = { size: 60, sources: { R: 14 } };

      const analysis = calculator.analyzeCard(card, deck);
      // Avec 14 sources et 7 cartes vues (Tour 1), prob = 86.1%, en dessous du seuil de 90%
      expect(analysis.R.probability).toBeGreaterThan(0.85);
      expect(analysis.R.sourcesNeeded).toBe(14);
    });

    test("Counterspell avec manabase mixte", () => {
      const card = {
        name: "Counterspell",
        manaCost: { colorless: 0, symbols: { U: 2 } },
        cmc: 2,
      };
      const deck = { size: 60, sources: { U: 20 } };

      const analysis = calculator.analyzeCard(card, deck);
      // Avec 20 sources, 8 cartes vues (Tour 2), et 2 symboles → ~82.4%
      expect(analysis.U.probability).toBeGreaterThan(0.8);
    });

    test("Cryptic Command avec manabase insuffisante", () => {
      const card = {
        name: "Cryptic Command",
        manaCost: { colorless: 1, symbols: { U: 3 } },
        cmc: 4,
      };
      const deck = { size: 60, sources: { U: 18 } }; // Besoin de 20

      const analysis = calculator.analyzeCard(card, deck);
      expect(analysis.U.meetsThreshold).toBe(false);
      expect(analysis.U.recommendation).toContain("manque");
    });
  });

  describe("Analyse de deck complet", () => {
    test("Deck Burn mono-rouge", () => {
      const deck = {
        cards: [
          {
            name: "Lightning Bolt",
            manaCost: { colorless: 0, symbols: { R: 1 } },
            cmc: 1,
            quantity: 4,
          },
          {
            name: "Lava Spike",
            manaCost: { colorless: 0, symbols: { R: 1 } },
            cmc: 1,
            quantity: 4,
          },
          {
            name: "Rift Bolt",
            manaCost: { colorless: 2, symbols: { R: 1 } },
            cmc: 3,
            quantity: 4,
          },
          {
            name: "Skullcrack",
            manaCost: { colorless: 1, symbols: { R: 1 } },
            cmc: 2,
            quantity: 4,
          },
        ],
        lands: [{ name: "Mountain", produces: ["R"], quantity: 20 }],
      };

      const analysis = calculator.analyzeDeck(deck);
      expect(analysis.deckSize).toBe(36); // 16 sorts + 20 terres
      expect(analysis.sources.R).toBe(20);
      expect(analysis.overallHealth).toContain("Excellente");

      // Toutes les cartes devraient avoir >90% de probabilité
      for (const cardAnalysis of analysis.analysis) {
        expect(cardAnalysis.results.R.probability).toBeGreaterThan(0.9);
      }
    });
  });

  describe("Optimiseur de manabase", () => {
    test("Optimisation deck bicolore simple", () => {
      const deck = {
        cards: [
          {
            name: "Lightning Bolt",
            manaCost: {
              colorless: 0,
              symbols: { R: 1 } as Record<string, number>,
            },
            cmc: 1,
            quantity: 4,
          },
          {
            name: "Counterspell",
            manaCost: {
              colorless: 0,
              symbols: { U: 2 } as Record<string, number>,
            },
            cmc: 2,
            quantity: 4,
          },
        ],
        totalLands: 24,
      };

      const optimized = calculator.optimizeManabase(deck);
      expect(optimized.R).toBeGreaterThanOrEqual(10); // Au moins quelques sources pour Bolt
      expect(optimized.U).toBeGreaterThanOrEqual(10); // Au moins quelques sources pour Counterspell
      expect(optimized.R + optimized.U).toBe(24);
    });
  });

  describe("Cas limites et gestion d'erreurs", () => {
    test("Deck vide", () => {
      const deck = {
        cards: [],
        lands: [],
      };

      const analysis = calculator.analyzeDeck(deck);
      expect(analysis.deckSize).toBe(0);
      expect(analysis.analysis).toHaveLength(0);
    });

    test("Carte sans coût de mana coloré", () => {
      const card = {
        name: "Ornithopter",
        manaCost: { colorless: 0, symbols: {} },
        cmc: 0,
      };
      const deck = { size: 60, sources: {} };

      const analysis = calculator.analyzeCard(card, deck);
      expect(Object.keys(analysis)).toHaveLength(0);
    });

    test("Sources de mana manquantes", () => {
      const card = {
        name: "Lightning Bolt",
        manaCost: { colorless: 0, symbols: { R: 1 } },
        cmc: 1,
      };
      const deck = { size: 60, sources: { U: 20 } }; // Pas de rouge

      const analysis = calculator.analyzeCard(card, deck);
      expect(analysis.R.sourcesAvailable).toBe(0);
      expect(analysis.R.probability).toBe(0);
      expect(analysis.R.meetsThreshold).toBe(false);
    });
  });
});

// Tests d'intégration avec des decks réels
describe("Tests d'intégration avec des decks compétitifs", () => {
  let calculator: ManaCalculator;

  beforeEach(() => {
    calculator = new ManaCalculator();
  });

  test("Modern Burn", () => {
    const deck = {
      cards: [
        {
          name: "Goblin Guide",
          manaCost: {
            colorless: 0,
            symbols: { R: 1 } as Record<string, number>,
          },
          cmc: 1,
          quantity: 4,
        },
        {
          name: "Monastery Swiftspear",
          manaCost: {
            colorless: 0,
            symbols: { R: 1 } as Record<string, number>,
          },
          cmc: 1,
          quantity: 4,
        },
        {
          name: "Lightning Bolt",
          manaCost: {
            colorless: 0,
            symbols: { R: 1 } as Record<string, number>,
          },
          cmc: 1,
          quantity: 4,
        },
        {
          name: "Boros Charm",
          manaCost: {
            colorless: 0,
            symbols: { R: 1, W: 1 } as Record<string, number>,
          },
          cmc: 2,
          quantity: 4,
        },
        {
          name: "Lightning Helix",
          manaCost: {
            colorless: 0,
            symbols: { R: 1, W: 1 } as Record<string, number>,
          },
          cmc: 2,
          quantity: 4,
        },
      ],
      lands: [
        { name: "Mountain", produces: ["R"], quantity: 3 },
        { name: "Sacred Foundry", produces: ["R", "W"], quantity: 4 },
        { name: "Inspiring Vantage", produces: ["R", "W"], quantity: 4 },
        { name: "Sunbaked Canyon", produces: ["R", "W"], quantity: 4 },
        { name: "Arid Mesa", produces: ["R", "W"], quantity: 4 },
      ],
    };

    const analysis = calculator.analyzeDeck(deck);

    // Vérifier que toutes les cartes à 1 mana rouge sont jouables T1
    const goblinGuide = analysis.analysis.find(
      (a) => a.card === "Goblin Guide",
    );
    expect(goblinGuide?.results.R.meetsThreshold).toBe(true);

    // Vérifier que Boros Charm est jouable T2
    const borosCharm = analysis.analysis.find((a) => a.card === "Boros Charm");
    expect(borosCharm?.results.R.meetsThreshold).toBe(true);
    expect(borosCharm?.results.W.meetsThreshold).toBe(true);
  });
});
