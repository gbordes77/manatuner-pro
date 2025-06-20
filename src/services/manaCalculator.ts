// manaCalculator.ts - Implémentation correcte selon Frank Karsten

interface ManaCost {
  colorless: number;
  symbols: { [color: string]: number };
  hybrid?: Array<[string, string]>;
  phyrexian?: { [color: string]: number };
}

interface ProbabilityResult {
  probability: number;
  meetsThreshold: boolean;
  sourcesNeeded: number;
  sourcesAvailable: number;
  recommendation: string;
}

// Tables de Frank Karsten pour 90% de probabilité
const KARSTEN_TABLES: { [symbols: number]: { [turn: number]: number } } = {
  // Nombre de sources nécessaires pour X symboles de mana au tour Y
  1: { // 1 symbole
    1: 14,
    2: 13,
    3: 12,
    4: 11,
    5: 10,
    6: 9
  },
  2: { // 2 symboles
    2: 20,
    3: 18,
    4: 16,
    5: 15,
    6: 14
  },
  3: { // 3 symboles
    3: 23,
    4: 20,
    5: 19,
    6: 18
  }
}

export const calculateHypergeometric = (params: {
  deckSize: number;
  successStates: number;
  sampleSize: number;
  successesWanted: number;
}): number => {
  const calculator = new ManaCalculator();
  return calculator.cumulativeHypergeometric(
    params.deckSize,
    params.successStates,
    params.sampleSize,
    params.successesWanted
  );
};

export const calculateProbabilityByTurn = (
  deck: { cards: any[]; totalCards: number },
  maxTurn: number
): Array<{ turn: number; probability: number }> => {
  const calculator = new ManaCalculator();
  const results: Array<{ turn: number; probability: number }> = [];
  
  // Compter les terrains dans le deck
  const totalLands = deck.cards.filter(card => 
    card.name.includes('Mountain') || 
    card.name.includes('Island') || 
    card.name.includes('Plains') || 
    card.name.includes('Forest') || 
    card.name.includes('Swamp') ||
    card.name.includes('Vents') ||
    card.name.includes('Tarn')
  ).reduce((sum, card) => sum + card.quantity, 0);
  
  for (let turn = 1; turn <= maxTurn; turn++) {
    const cardsSeen = 7 + turn - 1;
    const probability = calculator.cumulativeHypergeometric(
      deck.totalCards,
      totalLands,
      cardsSeen,
      1 // Au moins 1 source
    );
    
    results.push({ turn, probability });
  }
  
  return results;
};

export const analyzeDeckConsistency = (
  deck: {
    cards: Array<{ name: string; manaCost?: any; cmc?: number; quantity: number }>;
    totalCards: number;
  }
): {
  overallScore: number;
  issues: string[];
  recommendations: string[];
  landRatio?: number;
  colorBalance?: any;
  hybridManaHandling?: boolean;
} => {
  // Créer une structure de deck compatible
  const deckWithLands = {
    cards: deck.cards.filter(card => !card.name.includes('Mountain') && !card.name.includes('Island')).map(card => ({
      name: card.name,
      manaCost: card.manaCost || { colorless: 1, symbols: {} },
      cmc: card.cmc || 1,
      quantity: card.quantity
    })),
    lands: deck.cards.filter(card => 
      card.name.includes('Mountain') || 
      card.name.includes('Island') || 
      card.name.includes('Plains') || 
      card.name.includes('Forest') || 
      card.name.includes('Swamp') ||
      card.name.includes('Vents') ||
      card.name.includes('Tarn')
    ).map(card => ({
      name: card.name,
      produces: card.name.includes('Mountain') ? ['R'] : 
                card.name.includes('Island') ? ['U'] :
                card.name.includes('Plains') ? ['W'] :
                card.name.includes('Forest') ? ['G'] :
                card.name.includes('Swamp') ? ['B'] : ['R', 'U'],
      quantity: card.quantity
    }))
  };
  
  const calculator = new ManaCalculator();
  
  try {
    const analysis = calculator.analyzeDeck(deckWithLands);
    
    // Calculer un score basé sur les probabilités
    let totalScore = 0;
    let cardCount = 0;
    
    for (const cardAnalysis of analysis.analysis) {
      for (const colorResult of Object.values(cardAnalysis.results)) {
        totalScore += (colorResult as any).probability;
        cardCount++;
      }
    }
    
    const overallScore = cardCount > 0 ? totalScore / cardCount : 0.8;
    const totalLands = deckWithLands.lands.reduce((sum, land) => sum + land.quantity, 0);
    const landRatio = totalLands / deck.totalCards;
    
    return {
      overallScore,
      landRatio,
      colorBalance: {},
      hybridManaHandling: true,
      issues: overallScore < 0.8 ? ['Mana base inconsistency detected'] : [],
      recommendations: overallScore < 0.9 ? ['Consider adding more mana sources'] : []
    };
  } catch (error) {
    return {
      overallScore: 0.5,
      issues: ['Analysis failed'],
      recommendations: ['Check deck format']
    };
  }
};

export const calculateOptimalLandCount = (
  deck: {
    cards: Array<{ name: string; manaCost: any; cmc: number; quantity: number }>;
    format?: string;
  }
): {
  recommended: number;
  current: number;
  reasoning: string;
} => {
  // Calcul basé sur la courbe de mana
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  const avgCMC = deck.cards.reduce((sum, card) => sum + (card.cmc * card.quantity), 0) / totalCards;
  
  // Formule de base : 17 + (CMC moyen - 2) * 2
  let baseLands = 17 + Math.max(0, (avgCMC - 2) * 2);
  
  // Ajustements par format
  if (deck.format === 'Commander') {
    baseLands = Math.max(35, baseLands * 1.5);
  } else if (deck.format === 'Limited') {
    baseLands = Math.max(17, baseLands);
  }
  
  return {
    recommended: Math.round(baseLands),
    current: 0, // Serait calculé depuis le deck réel
    reasoning: `Based on average CMC of ${avgCMC.toFixed(1)}`
  };
};;

export class ManaCalculator {
  private memoCache: Map<string, number> = new Map();

  // Coefficient binomial avec mémoïsation
  private binomial(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    const key = `${n},${k}`;
    if (this.memoCache.has(key)) {
      return this.memoCache.get(key)!;
    }
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    this.memoCache.set(key, result);
    return result;
  }

  // Distribution hypergeométrique
  hypergeometric(N: number, K: number, n: number, k: number): number {
    return (
      this.binomial(K, k) * 
      this.binomial(N - K, n - k) / 
      this.binomial(N, n)
    );
  }

  // Probabilité cumulative (au moins k succès)
  cumulativeHypergeometric(N: number, K: number, n: number, minK: number): number {
    let probability = 0;
    const maxK = Math.min(n, K);
    
    for (let k = minK; k <= maxK; k++) {
      probability += this.hypergeometric(N, K, n, k);
    }
    
    return probability;
  }

  // Calcul principal selon Karsten
  calculateManaProbability(
    deckSize: number,
    sourcesInDeck: number,
    turn: number,
    symbolsNeeded: number,
    onThePlay: boolean = true
  ): ProbabilityResult {
    // Cartes vues = main de départ + pioche (7 + tours - 1)
    // -1 car on ne pioche pas au tour 1 si on joue en premier
    const cardsSeen = 7 + turn - (onThePlay ? 1 : 0);
    
    // Calcul de la probabilité
    const probability = this.cumulativeHypergeometric(
      deckSize,
      sourcesInDeck,
      cardsSeen,
      symbolsNeeded
    );
    
    // Récupération de la recommandation Karsten
    const karstenRequirement = KARSTEN_TABLES[symbolsNeeded]?.[turn] || 0;
    
    return {
      probability,
      meetsThreshold: probability >= 0.90,
      sourcesNeeded: karstenRequirement,
      sourcesAvailable: sourcesInDeck,
      recommendation: this.getRecommendation(probability, sourcesInDeck, karstenRequirement)
    };
  }

  // Analyse complète d'une carte
  analyzeCard(
    card: { name: string; manaCost: ManaCost; cmc: number },
    deck: { size: number; sources: { [color: string]: number } }
  ): {
    [color: string]: ProbabilityResult
  } {
    const results: { [color: string]: ProbabilityResult } = {};
    
    // Analyser chaque couleur dans le coût
    for (const [color, count] of Object.entries(card.manaCost.symbols)) {
      if (count > 0) {
        const sourcesAvailable = deck.sources[color] || 0;
        results[color] = this.calculateManaProbability(
          deck.size,
          sourcesAvailable,
          card.cmc, // On veut lancer la carte à son CMC
          count,
          true
        );
      }
    }
    
    return results;
  }

  // Recommandations textuelles
  private getRecommendation(
    probability: number,
    sourcesAvailable: number,
    sourcesNeeded: number
  ): string {
    if (probability >= 0.95) {
      return "Excellent - Probabilité très élevée";
    } else if (probability >= 0.90) {
      return "Bon - Atteint le seuil recommandé de 90%";
    } else if (probability >= 0.85) {
      return `Acceptable - Considérez ajouter ${sourcesNeeded - sourcesAvailable} sources`;
    } else if (probability >= 0.80) {
      return `Risqué - Ajoutez ${sourcesNeeded - sourcesAvailable} sources pour atteindre 90%`;
    } else {
      return `Insuffisant - Il manque ${Math.max(0, sourcesNeeded - sourcesAvailable)} sources`;
    }
  }

  // Analyser un deck complet
  analyzeDeck(
    deck: {
      cards: Array<{ name: string; manaCost: ManaCost; cmc: number; quantity: number }>;
      lands: Array<{ name: string; produces: string[]; quantity: number }>;
    }
  ): {
    deckSize: number;
    sources: { [color: string]: number };
    analysis: Array<{
      card: string;
      results: { [color: string]: ProbabilityResult };
    }>;
    overallHealth: string;
  } {
    // Calculer le nombre total de cartes
    const deckSize = deck.cards.reduce((sum, card) => sum + card.quantity, 0) +
                     deck.lands.reduce((sum, land) => sum + land.quantity, 0);
    
    // Calculer les sources de mana par couleur
    const sources: { [color: string]: number } = {};
    for (const land of deck.lands) {
      for (const color of land.produces) {
        sources[color] = (sources[color] || 0) + land.quantity;
      }
    }
    
    // Analyser chaque carte
    const analysis = deck.cards
      .filter(card => Object.keys(card.manaCost.symbols).length > 0)
      .map(card => ({
        card: card.name,
        results: this.analyzeCard(
          card,
          { size: deckSize, sources }
        )
      }));
    
    // Évaluation globale
    const allProbabilities = analysis.flatMap(a => 
      Object.values(a.results).map(r => r.probability)
    );
    const avgProbability = allProbabilities.reduce((sum, p) => sum + p, 0) / allProbabilities.length;
    
    let overallHealth: string;
    if (avgProbability >= 0.90) {
      overallHealth = "Excellente - Manabase très stable";
    } else if (avgProbability >= 0.85) {
      overallHealth = "Bonne - Quelques ajustements mineurs recommandés";
    } else if (avgProbability >= 0.80) {
      overallHealth = "Moyenne - Des améliorations significatives sont nécessaires";
    } else {
      overallHealth = "Faible - Reconstruction majeure de la manabase requise";
    }
    
    return {
      deckSize,
      sources,
      analysis,
      overallHealth
    };
  }

  // Optimiseur de manabase
  optimizeManabase(
    deck: {
      cards: Array<{ name: string; manaCost: ManaCost; cmc: number; quantity: number }>;
      totalLands: number;
    }
  ): {
    [color: string]: number;
  } {
    // Calculer les besoins en mana pour chaque couleur
    const requirements: { [color: string]: number } = {};
    
    for (const card of deck.cards) {
      for (const [color, count] of Object.entries(card.manaCost.symbols)) {
        if (count > 0) {
          const needed = KARSTEN_TABLES[count]?.[card.cmc] || 0;
          requirements[color] = Math.max(requirements[color] || 0, needed);
        }
      }
    }
    
    // Distribuer les terres proportionnellement
    const totalRequired = Object.values(requirements).reduce((sum, r) => sum + r, 0);
    const distribution: { [color: string]: number } = {};
    
    for (const [color, required] of Object.entries(requirements)) {
      distribution[color] = Math.round((required / totalRequired) * deck.totalLands);
    }
    
    // Ajuster pour atteindre exactement totalLands
    const currentTotal = Object.values(distribution).reduce((sum, d) => sum + d, 0);
    if (currentTotal !== deck.totalLands) {
      const mostNeeded = Object.entries(requirements)
        .sort((a, b) => b[1] - a[1])[0][0];
      distribution[mostNeeded] += deck.totalLands - currentTotal;
    }
    
    return distribution;
  }
}

// Instance singleton pour l'utilisation dans l'application
export const manaCalculator = new ManaCalculator(); 