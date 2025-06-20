// Decklists de test pour les tests automatiques
export const SAMPLE_DECKLISTS = {
  // Decklist simple pour tests rapides
  simple: `4 Lightning Bolt
4 Counterspell
8 Island
8 Mountain`,

  // Decklist complexe multi-couleurs
  complex: `4 Lightning Bolt
4 Counterspell
4 Tarmogoyf
4 Dark Confidant
2 Jace, the Mind Sculptor
3 Liliana of the Veil
4 Scalding Tarn
4 Polluted Delta
2 Steam Vents
2 Watery Grave
2 Blood Crypt
3 Island
2 Mountain
2 Swamp
1 Forest`,

  // Decklist aggro mono-rouge
  aggro: `4 Goblin Guide
4 Monastery Swiftspear
4 Lightning Bolt
4 Lava Spike
4 Rift Bolt
4 Searing Blaze
4 Skullcrack
4 Atarka's Command
4 Boros Charm
20 Mountain`,

  // Decklist contrôle
  control: `4 Counterspell
4 Brainstorm
3 Force of Will
2 Jace, the Mind Sculptor
4 Swords to Plowshares
3 Wrath of God
2 Elspeth, Knight-Errant
4 Flooded Strand
4 Tundra
4 Island
4 Plains
2 Mystic Gate`,

  // Decklist avec terrains spéciaux
  specialLands: `4 Lightning Bolt
4 Counterspell
4 Scalding Tarn
4 Steam Vents
4 Spirebluff Canal
4 Shivan Reef
2 Sulfur Falls
2 Island
2 Mountain`,

  // Decklist invalide pour tests d'erreur
  invalid: `Lightning Bolt
4 Carte Inexistante
0 Island`,

  // Decklist vide
  empty: '',
};

// Résultats attendus pour les tests
export const EXPECTED_RESULTS = {
  simple: {
    totalCards: 24,
    lands: 16,
    avgCMC: 1.5,
    colors: ['blue', 'red'],
  },
  complex: {
    totalCards: 43,
    lands: 20,
    colors: ['blue', 'red', 'black', 'green'],
  },
  aggro: {
    totalCards: 56,
    lands: 20,
    avgCMC: 1.2,
    colors: ['red'],
  },
};

// Sélecteurs mis à jour pour correspondre à l'interface réelle
export const SELECTORS = {
  // Placeholders corrects
  DECKLIST_TEXTAREA: /paste your decklist here/i,  // Au lieu de /collez votre decklist/i
  ANALYZE_BUTTON: /analyze|analyser/i,  // Support anglais et français
  
  // Titres corrects  
  MAIN_HEADING: /perfect your manabase/i,  // Au lieu de /manatuner/i
  
  // Navigation
  ANALYZER_LINK: /start analyzing|analyzer/i,  // Support du texte réel
  
  // Résultats
  ANALYSIS_RESULTS: '[data-testid="analysis-results"]',
  TAB_STATISTICS: /statistics|statistiques/i,
  TAB_PROBABILITIES: /probabilities|probabilités/i,
  TAB_RECOMMENDATIONS: /recommendations|recommandations/i,
  TAB_CARDS: /cards|cartes/i
}; 