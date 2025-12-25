import { test, expect, describe } from "vitest";
import { parseDeckList } from "../../../src/services/deckAnalyzer";

describe("🎴 Cas Limites MTG - Cartes Problématiques", () => {
  describe("Fetchlands et Dual Lands", () => {
    test("Fetchlands comptées correctement", () => {
      const decklist = `
        4 Flooded Strand
        4 Polluted Delta
        4 Scalding Tarn
        4 Lightning Bolt
        44 Other Cards
      `;

      const parsed = parseDeckList(decklist);
      const fetchlands = parsed.lands.filter(
        (land) =>
          land.name.includes("Strand") ||
          land.name.includes("Delta") ||
          land.name.includes("Tarn"),
      );

      expect(fetchlands).toHaveLength(3);
      expect(fetchlands[0].produces).toEqual(["W", "U"]); // Flooded Strand
    });

    test("Shocklands avec types de base", () => {
      const decklist = `
        4 Steam Vents
        4 Hallowed Fountain
        4 Sacred Foundry
        48 Other Cards
      `;

      const parsed = parseDeckList(decklist);
      const shocklands = parsed.lands.filter(
        (land) =>
          land.name.includes("Vents") ||
          land.name.includes("Fountain") ||
          land.name.includes("Foundry"),
      );

      expect(shocklands).toHaveLength(3);
      expect(shocklands[0].produces).toEqual(["U", "R"]); // Steam Vents
    });
  });

  describe("Modal Double-Faced Cards (MDFC)", () => {
    test("MDFC lands comptées comme terres", () => {
      const decklist = `
        4 Needleverge Pathway // Pillarverge Pathway
        4 Riverglide Pathway // Lavaglide Pathway
        4 Brightclimb Pathway // Grimclimb Pathway
        48 Other Cards
      `;

      const parsed = parseDeckList(decklist);
      const mdfcLands = parsed.lands.filter((land) =>
        land.name.includes("Pathway"),
      );

      expect(mdfcLands).toHaveLength(3);
      // Needleverge = R/W, Riverglide = U/R, Brightclimb = W/B
      expect(mdfcLands[0].produces).toContain("R");
      expect(mdfcLands[0].produces).toContain("W");
    });

    test("MDFC spells non comptées comme terres", () => {
      const decklist = `
        4 Valakut Awakening // Valakut Stoneforge
        4 Shatterskull Smashing // Shatterskull, the Hammer Pass
        52 Other Cards
      `;

      const parsed = parseDeckList(decklist);
      const mdfcSpells = parsed.cards.filter(
        (card) =>
          card.name.includes("Awakening") || card.name.includes("Smashing"),
      );

      expect(mdfcSpells).toHaveLength(2);
      // Ne doivent PAS être dans les terres
      expect(
        parsed.lands.some(
          (land) =>
            land.name.includes("Awakening") || land.name.includes("Smashing"),
        ),
      ).toBe(false);
    });
  });

  describe("Cartes à Coût Spécial", () => {
    test("Mana Phyrexian correctement parsé", () => {
      const decklist = `
        4 Gitaxian Probe
        4 Mutagenic Growth
        4 Mental Misstep
        48 Other Cards
      `;

      const parsed = parseDeckList(decklist);
      const phyrexianCards = parsed.cards.filter((card) =>
        ["Gitaxian Probe", "Mutagenic Growth", "Mental Misstep"].includes(
          card.name,
        ),
      );

      expect(phyrexianCards).toHaveLength(3);

      // Gitaxian Probe = {U/P} (peut être payé avec U ou 2 vie)
      const probe = phyrexianCards.find((c) => c.name === "Gitaxian Probe");
      expect(probe.manaCost.phyrexian).toBeDefined();
      expect(probe.manaCost.phyrexian.U).toBe(1);
    });

    test("Cartes X correctement gérées", () => {
      const decklist = `
        4 Fireball
        4 Hydroid Krasis
        4 Walking Ballista
        48 Other Cards
      `;

      const parsed = parseDeckList(decklist);
      const xCards = parsed.cards.filter((card) =>
        ["Fireball", "Hydroid Krasis", "Walking Ballista"].includes(card.name),
      );

      expect(xCards).toHaveLength(3);

      // Les cartes X ont un CMC variable, souvent traité comme 0
      const fireball = xCards.find((c) => c.name === "Fireball");
      expect(fireball.manaCost.variable).toBe(true);
    });
  });

  describe("Terrains Spéciaux", () => {
    test("Terrains utilitaires sans mana", () => {
      const decklist = `
        4 Ghost Quarter
        4 Tectonic Edge
        4 Wasteland
        4 Strip Mine
        44 Other Cards
      `;

      const parsed = parseDeckList(decklist);
      const utilityLands = parsed.lands.filter((land) =>
        ["Ghost Quarter", "Tectonic Edge", "Wasteland", "Strip Mine"].includes(
          land.name,
        ),
      );

      expect(utilityLands).toHaveLength(4);

      // Ces terrains ne produisent pas de mana coloré
      utilityLands.forEach((land) => {
        expect(land.produces).toEqual([]);
      });
    });

    test("Terrains à activation", () => {
      const decklist = `
        4 Mishra's Factory
        4 Mutavault
        4 Inkmoth Nexus
        48 Other Cards
      `;

      const parsed = parseDeckList(decklist);
      const creatureLands = parsed.lands.filter((land) =>
        ["Mishra's Factory", "Mutavault", "Inkmoth Nexus"].includes(land.name),
      );

      expect(creatureLands).toHaveLength(3);

      // Mutavault produit n'importe quel mana
      const mutavault = creatureLands.find((l) => l.name === "Mutavault");
      expect(mutavault.produces).toEqual(["C"]); // Mana incolore
    });
  });

  describe("Formats Spéciaux", () => {
    test("Commander avec Commandant", () => {
      const decklist = `
        1 Atraxa, Praetors' Voice // Commander
        4 Command Tower
        4 Exotic Orchard
        91 Other Cards
      `;

      const parsed = parseDeckList(decklist);

      expect(parsed.totalCards).toBe(100);
      expect(parsed.format).toBe("commander");

      // Le commandant définit l'identité colorielle
      expect(parsed.colorIdentity).toEqual(["W", "U", "B", "G"]);
    });

    test("Deck Pauper (commons only)", () => {
      const decklist = `
        4 Lightning Bolt
        4 Counterspell
        4 Brainstorm
        48 Other Commons
      `;

      const parsed = parseDeckList(decklist);

      // Vérifier que toutes les cartes sont des communes
      const nonCommons = parsed.cards.filter(
        (card) => card.rarity && card.rarity !== "common",
      );

      expect(nonCommons).toHaveLength(0);
    });
  });

  describe("Validation des Imports", () => {
    test("Format Arena avec quantités", () => {
      const arenaList = `
        4 Lightning Bolt (M11) 146
        3 Counterspell (MH2) 267
        2 Brainstorm (MH2) 394
      `;

      const parsed = parseDeckList(arenaList);

      expect(parsed.cards).toHaveLength(3);
      expect(parsed.cards[0].quantity).toBe(4);
      expect(parsed.cards[0].setCode).toBe("M11");
      expect(parsed.cards[0].collectorNumber).toBe("146");
    });

    test("Format MTGO avec sideboard", () => {
      const mtgoList = `
        4 Lightning Bolt
        4 Counterspell

        Sideboard:
        3 Red Elemental Blast
        2 Pyroblast
      `;

      const parsed = parseDeckList(mtgoList);

      expect(parsed.mainboard.cards).toHaveLength(2);
      expect(parsed.sideboard.cards).toHaveLength(2);
      expect(parsed.sideboard.cards[0].name).toBe("Red Elemental Blast");
    });
  });
});
