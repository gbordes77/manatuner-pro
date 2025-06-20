// 🏆 Decklists Compétitives pour Tests de Validation

export const COMPETITIVE_DECKLISTS = {
  // Modern - Deck 3 couleurs complexe
  jeskai_control: {
    name: "Jeskai Control (Modern)",
    format: "modern",
    colors: ["W", "U", "R"],
    expectedLands: 26,
    decklist: `
      // Créatures
      2 Snapcaster Mage
      1 Vendilion Clique
      
      // Sorts
      4 Lightning Bolt
      4 Counterspell
      3 Cryptic Command
      2 Supreme Verdict
      1 Wrath of God
      4 Opt
      3 Teferi, Hero of Dominaria
      
      // Terrains
      4 Flooded Strand
      4 Scalding Tarn
      2 Arid Mesa
      2 Steam Vents
      2 Hallowed Fountain
      1 Sacred Foundry
      3 Celestial Colonnade
      2 Island
      1 Mountain
      1 Plains
      4 Mystic Gate
      
      // Autres
      4 Path to Exile
      3 Lightning Helix
      2 Electrolyze
      1 Sphinx's Revelation
      
      Sideboard:
      3 Rest in Peace
      2 Stony Silence
      2 Dispel
      2 Negate
      1 Baneslayer Angel
      2 Wear // Tear
      1 Elspeth, Knight-Errant
      2 Surgical Extraction
    `,
    expectedAnalysis: {
      averageCMC: 2.1,
      colorDistribution: {
        W: 14, U: 18, R: 15
      },
      landRatio: 0.43,
      manaCurve: {
        1: 8, 2: 12, 3: 8, 4: 4, 5: 1, 6: 1
      }
    }
  },

  // Standard - Deck Aggro rapide
  mono_red_aggro: {
    name: "Mono Red Aggro (Standard)",
    format: "standard",
    colors: ["R"],
    expectedLands: 20,
    decklist: `
      // Créatures
      4 Monastery Swiftspear
      4 Goblin Guide
      4 Eidolon of the Great Revel
      4 Lightning Berserker
      3 Abbot of Keral Keep
      
      // Sorts
      4 Lightning Bolt
      4 Lava Spike
      4 Rift Bolt
      3 Searing Blaze
      2 Skullcrack
      
      // Terrains
      4 Wooded Foothills
      16 Mountain
      
      Sideboard:
      3 Smash to Smithereens
      3 Searing Blood
      2 Relic of Progenitus
      2 Destructive Revelry
      2 Pyroclasm
      1 Grim Lavamancer
      2 Molten Rain
    `,
    expectedAnalysis: {
      averageCMC: 1.6,
      colorDistribution: {
        R: 20
      },
      landRatio: 0.33,
      manaCurve: {
        1: 16, 2: 14, 3: 6, 4: 0, 5: 0, 6: 0
      }
    }
  },

  // Commander - Deck 4 couleurs
  atraxa_superfriends: {
    name: "Atraxa Superfriends (Commander)",
    format: "commander",
    colors: ["W", "U", "B", "G"],
    expectedLands: 37,
    decklist: `
      // Commandant
      1 Atraxa, Praetors' Voice
      
      // Planeswalkers
      1 Jace, the Mind Sculptor
      1 Elspeth, Knight-Errant
      1 Garruk Wildspeaker
      1 Liliana of the Veil
      1 Teferi, Time Raveler
      1 Vraska, Golgari Queen
      1 Tamiyo, the Moon Sage
      
      // Créatures
      1 Deepglow Skate
      1 Doubling Season
      1 Inexorable Tide
      1 Contagion Engine
      
      // Terrains
      1 Command Tower
      1 Exotic Orchard
      1 City of Brass
      1 Mana Confluence
      4 Breeding Pool
      4 Overgrown Tomb
      4 Temple Garden
      4 Hallowed Fountain
      4 Watery Grave
      4 Godless Shrine
      4 Windswept Heath
      4 Polluted Delta
      4 Misty Rainforest
      2 Forest
      2 Island
      2 Plains
      2 Swamp
      
      // Sorts
      1 Sol Ring
      1 Arcane Signet
      1 Chromatic Lantern
      1 Kodama's Reach
      1 Cultivate
      1 Farseek
      1 Nature's Lore
      1 Rampant Growth
      50 Other Cards
    `,
    expectedAnalysis: {
      averageCMC: 3.2,
      colorDistribution: {
        W: 12, U: 15, B: 13, G: 16
      },
      landRatio: 0.37,
      manaCurve: {
        1: 8, 2: 12, 3: 15, 4: 18, 5: 12, 6: 8
      }
    }
  },

  // Limited - Draft typique
  limited_draft: {
    name: "Limited Draft Deck",
    format: "limited",
    colors: ["W", "U"],
    expectedLands: 17,
    decklist: `
      // Créatures
      2 Serra Angel
      3 Wind Drake
      2 Benalish Knight
      1 Prodigal Sorcerer
      2 Merfolk Looter
      1 Counterspell
      
      // Sorts
      2 Pacifism
      1 Unsummon
      2 Divine Favor
      1 Inspiration
      3 Cancel
      
      // Terrains
      9 Plains
      8 Island
      
      // Autres
      2 Healing Salve
      1 Divination
    `,
    expectedAnalysis: {
      averageCMC: 2.8,
      colorDistribution: {
        W: 11, U: 9
      },
      landRatio: 0.425,
      manaCurve: {
        1: 2, 2: 8, 3: 6, 4: 4, 5: 2, 6: 1
      }
    }
  }
};

// Cas de test spéciaux
export const EDGE_CASE_DECKLISTS = {
  // Deck avec beaucoup de mana hybride
  hybrid_heavy: {
    name: "Hybrid Mana Heavy",
    decklist: `
      4 Kitchen Finks
      4 Murderous Redcap
      4 Boggart Ram-Gang
      4 Flame Javelin
      4 Boros Reckoner
      4 Dryad Militant
      32 Other Cards
    `,
    expectedHybridHandling: true
  },

  // Deck avec coûts Phyrexian
  phyrexian_mana: {
    name: "Phyrexian Mana Deck",
    decklist: `
      4 Gitaxian Probe
      4 Mutagenic Growth
      4 Mental Misstep
      4 Dismember
      4 Surgical Extraction
      4 Noxious Revival
      36 Other Cards
    `,
    expectedPhyrexianCosts: 6
  },

  // Deck avec beaucoup de cartes X
  x_cost_heavy: {
    name: "X-Cost Heavy Deck",
    decklist: `
      4 Fireball
      4 Hydroid Krasis
      4 Walking Ballista
      4 Hangarback Walker
      4 Chalice of the Void
      4 Sunburst cards
      36 Other Cards
    `,
    expectedVariableCosts: 6
  },

  // Deck avec MDFC
  mdfc_lands: {
    name: "MDFC Lands Deck",
    decklist: `
      4 Needleverge Pathway // Pillarverge Pathway
      4 Riverglide Pathway // Lavaglide Pathway
      4 Brightclimb Pathway // Grimclimb Pathway
      4 Clearwater Pathway // Murkwater Pathway
      4 Cragcrown Pathway // Timbercrown Pathway
      4 Blightstep Pathway // Searstep Pathway
      36 Other Cards
    `,
    expectedMDFCLands: 6
  }
};

// Decklists pour tests de performance
export const PERFORMANCE_TEST_DECKS = {
  // Deck Commander complexe (100 cartes)
  complex_commander: {
    name: "Complex Commander (Performance Test)",
    size: 100,
    colors: 5,
    expectedAnalysisTime: 500, // ms
    decklist: generateComplexCommanderDeck()
  },

  // Deck avec beaucoup de cartes différentes
  high_variety: {
    name: "High Variety Deck",
    size: 60,
    uniqueCards: 55, // Presque toutes différentes
    expectedAnalysisTime: 200, // ms
    decklist: generateHighVarietyDeck()
  }
};

// Fonctions utilitaires pour générer des decks de test
function generateComplexCommanderDeck() {
  // Génère un deck Commander avec 100 cartes uniques
  // pour tester les performances sur de gros decks
  let deck = "1 Atraxa, Praetors' Voice // Commander\n";
  
  // 37 terrains variés
  const lands = [
    "Command Tower", "Exotic Orchard", "City of Brass", "Mana Confluence",
    "Breeding Pool", "Overgrown Tomb", "Temple Garden", "Hallowed Fountain",
    "Watery Grave", "Godless Shrine", "Steam Vents", "Sacred Foundry",
    "Stomping Ground", "Windswept Heath", "Polluted Delta", "Misty Rainforest"
  ];
  
  lands.forEach((land, i) => {
    if (i < 37) deck += `1 ${land}\n`;
  });
  
  // 62 sorts variés
  for (let i = 1; i <= 62; i++) {
    deck += `1 Test Card ${i}\n`;
  }
  
  return deck;
}

function generateHighVarietyDeck() {
  // Génère un deck avec presque toutes cartes uniques
  let deck = "";
  
  // 20 terrains
  for (let i = 1; i <= 20; i++) {
    deck += `1 Mountain\n`;
  }
  
  // 40 sorts différents
  for (let i = 1; i <= 40; i++) {
    deck += `1 Unique Spell ${i}\n`;
  }
  
  return deck;
}

// Validation des decklists compétitives
export function validateCompetitiveDeck(deckName, analysisResult) {
  const expected = COMPETITIVE_DECKLISTS[deckName];
  if (!expected) return false;
  
  const checks = {
    landCount: Math.abs(analysisResult.totalLands - expected.expectedLands) <= 2,
    avgCMC: Math.abs(analysisResult.averageCMC - expected.expectedAnalysis.averageCMC) <= 0.3,
    landRatio: Math.abs(analysisResult.landRatio - expected.expectedAnalysis.landRatio) <= 0.05
  };
  
  return Object.values(checks).every(check => check);
} 