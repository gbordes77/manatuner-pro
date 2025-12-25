# ManaTuner Pro - Reference Mathematique Complete

> Document technique exhaustif des preceptes mathematiques, formules, algorithmes et constantes utilises dans ManaTuner Pro. Base sur les recherches de Frank Karsten et la theorie des distributions hypergeometriques.

---

## Table des Matieres

1. [Distribution Hypergeometrique](#1-distribution-hypergeometrique)
2. [Tables de Frank Karsten](#2-tables-de-frank-karsten)
3. [Algorithmes de Calcul de Mana](#3-algorithmes-de-calcul-de-mana)
4. [Simulation Monte Carlo](#4-simulation-monte-carlo)
5. [Constantes et Seuils](#5-constantes-et-seuils)
6. [Scores et Metriques](#6-scores-et-metriques)
7. [Formules de Recommandation de Lands](#7-formules-de-recommandation-de-lands)
8. [Algorithmes de Mulligan](#8-algorithmes-de-mulligan)
9. [Analyse Multivariee](#9-analyse-multivariee)
10. [Optimisation de Manabase](#10-optimisation-de-manabase)

---

## 1. Distribution Hypergeometrique

### 1.1 Definition Mathematique

La distribution hypergeometrique modelise la probabilite de tirer exactement `k` succes dans un echantillon de `n` elements, tire sans remise d'une population de `N` elements contenant `K` succes.

**Formule de probabilite exacte:**

```
P(X = k) = C(K,k) * C(N-K, n-k) / C(N,n)
```

Ou `C(n,k)` est le coefficient binomial:

```
C(n,k) = n! / (k! * (n-k)!)
```

**Implementation optimisee (evite les factorielles):**

```typescript
binomial(n: number, k: number): number {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  
  // Utilise la propriete de symetrie: C(n,k) = C(n,n-k)
  const actualK = Math.min(k, n - k);
  
  let result = 1;
  for (let i = 0; i < actualK; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}
```

### 1.2 Probabilite Cumulative

Pour calculer la probabilite d'avoir **au moins** `k` succes:

```
P(X >= k) = SUM[i=k to min(n,K)] P(X = i)
```

**Implementation:**

```typescript
cumulativeHypergeometric(N: number, K: number, n: number, minK: number): number {
  let probability = 0;
  const maxK = Math.min(n, K);
  
  for (let k = minK; k <= maxK; k++) {
    probability += this.hypergeometric(N, K, n, k);
  }
  
  return Math.min(1, Math.max(0, probability));
}
```

### 1.3 Application a MTG

| Parametre | Signification MTG | Valeur typique |
|-----------|-------------------|----------------|
| `N` | Taille du deck | 60 (Standard/Modern) |
| `K` | Sources de mana d'une couleur | 14-24 |
| `n` | Cartes vues (main + pioche) | 7 + tour - 1 |
| `k` | Symboles de mana requis | 1-3 |

**Exemple concret:**
- Deck de 60 cartes avec 14 sources rouges
- Main de 7 cartes + 2 pioches (tour 3) = 9 cartes vues
- Probabilite d'avoir au moins 1 source rouge

```
P(X >= 1) = 1 - P(X = 0)
P(X >= 1) = 1 - [C(14,0) * C(46,9) / C(60,9)]
P(X >= 1) = 1 - [1 * 231917400 / 8217822536] = ~97.2%
```

---

## 2. Tables de Frank Karsten

### 2.1 Principe

Frank Karsten, mathematicien et joueur professionnel de MTG, a calcule le nombre optimal de sources de mana necessaires pour atteindre une probabilite de **90%** de pouvoir lancer un sort a son tour prevu.

Source: [TCGPlayer - How Many Sources Do You Need (2022 Update)](https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/)

### 2.2 Table Complete des Sources Requises

**Legende:** Nombre de sources necessaires pour X symboles colores au tour Y avec 90% de probabilite.

```typescript
const KARSTEN_TABLES = {
  // 1 symbole colore (ex: R, 1B, 2W)
  1: { 
    1: 14,  // Tour 1: 14 sources
    2: 13,  // Tour 2: 13 sources
    3: 12,  // Tour 3: 12 sources
    4: 11,  // Tour 4: 11 sources
    5: 10,  // Tour 5: 10 sources
    6: 9,   // Tour 6: 9 sources
    7: 8,
    8: 8,
    9: 7,
    10: 7
  },
  
  // 2 symboles colores (ex: RR, 1BB, WW)
  2: { 
    2: 20,  // Tour 2: 20 sources
    3: 18,  // Tour 3: 18 sources
    4: 16,  // Tour 4: 16 sources
    5: 15,
    6: 14,
    7: 13,
    8: 12,
    9: 11,
    10: 11
  },
  
  // 3 symboles colores (ex: RRR, BBB)
  3: { 
    3: 23,  // Tour 3: 23 sources
    4: 20,
    5: 19,
    6: 18,
    7: 17,
    8: 16,
    9: 15,
    10: 14
  },
  
  // 4 symboles colores (rare)
  4: { 
    4: 25,
    5: 22,
    6: 21,
    7: 20,
    8: 19,
    9: 18,
    10: 17
  }
}
```

### 2.3 Table Alternative (manabase.ts)

Une version simplifiee pour les calculs rapides:

```typescript
const KARSTEN_TABLE = {
  1: { single: 13, double: 20, triple: 27 },  // Tour 1
  2: { single: 8,  double: 13, triple: 18 },  // Tour 2
  3: { single: 6,  double: 9,  triple: 12 },  // Tour 3
  4: { single: 4,  double: 7,  triple: 9 },   // Tour 4
  5: { single: 4,  double: 6,  triple: 8 },   // Tour 5
  6: { single: 3,  double: 5,  triple: 7 },   // Tour 6
};
```

### 2.4 Formule des Cartes Vues

**Critique:** La formule de Frank Karsten pour le nombre de cartes vues:

```
cardsDrawn = handSize + turn - 1
```

- `handSize`: Taille de la main de depart (7 par defaut, moins apres mulligan)
- `turn`: Numero du tour
- `-1`: Car on ne pioche pas au tour 1 quand on joue en premier

**Variante (a la pioche):**
```
cardsDrawn = handSize + turn  // +1 carte au tour 1
```

---

## 3. Algorithmes de Calcul de Mana

### 3.1 Calcul de Probabilite par Tour

```typescript
calculateManaProbability(
  deckSize: number,      // Taille du deck (60)
  sourcesInDeck: number, // Sources de mana disponibles
  turn: number,          // Tour cible
  symbolsNeeded: number, // Symboles requis (1, 2, ou 3)
  onThePlay: boolean = true,
  handSize: number = 7
): ProbabilityResult {
  // Cartes vues = main + pioches
  const cardsSeen = handSize + turn - 1;
  
  // Calcul hypergeometrique cumulatif
  const probability = this.cumulativeHypergeometric(
    deckSize,
    sourcesInDeck,
    cardsSeen,
    symbolsNeeded
  );
  
  // Comparaison avec la table Karsten
  const karstenRequirement = KARSTEN_TABLES[symbolsNeeded]?.[turn] || 0;
  
  return {
    probability,
    meetsThreshold: probability >= 0.90,
    sourcesNeeded: karstenRequirement,
    sourcesAvailable: sourcesInDeck,
    recommendation: this.getRecommendation(probability, sourcesInDeck, karstenRequirement)
  };
}
```

### 3.2 Comptage des Sources (Methode Karsten)

**Regle importante de Frank Karsten:**

> "I usually consider Verdant Catacombs, Flooded Strand and the like as a full mana source for any color they might be able to fetch"

```typescript
// Chaque terrain compte comme UNE source pour chaque couleur qu'il peut produire
for (const land of deck.lands) {
  for (const color of land.produces) {
    sources[color] = (sources[color] || 0) + land.quantity;
  }
}
```

**Exemple:**
- Steam Vents (U/R) compte comme 1 source bleue ET 1 source rouge
- Scalding Tarn compte comme 1 source pour chaque couleur qu'il peut fetcher

### 3.3 Analyse de Carte Individuelle

```typescript
analyzeCard(
  card: { name: string; manaCost: ManaCost; cmc: number },
  deck: { size: number; sources: { [color: string]: number } }
): { [color: string]: ProbabilityResult } {
  const results = {};
  
  // Analyser chaque couleur dans le cout
  for (const [color, count] of Object.entries(card.manaCost.symbols)) {
    if (count > 0) {
      const sourcesAvailable = deck.sources[color] || 0;
      results[color] = this.calculateManaProbability(
        deck.size,
        sourcesAvailable,
        card.cmc,  // On veut lancer la carte a son CMC
        count,
        true
      );
    }
  }
  
  return results;
}
```

---

## 4. Simulation Monte Carlo

### 4.1 Principe

La simulation Monte Carlo permet d'estimer des probabilites complexes en simulant des milliers de parties. Particulierement utile pour:
- Scenarios avec mulligan
- Interactions entre plusieurs couleurs
- Validation des calculs analytiques

### 4.2 Parametres de Simulation

```typescript
interface MonteCarloParams {
  iterations: number;       // Nombre de simulations (defaut: 10,000)
  deckSize: number;         // Taille du deck
  landCount: number;        // Nombre de terrains
  targetTurn: number;       // Tour cible
  mulliganStrategy: 'none' | 'aggressive' | 'conservative' | 'optimal';
  playFirst: boolean;       // True si on joue en premier
  maxMulligans: number;     // Maximum de mulligans (generalement 2)
}
```

### 4.3 Algorithme de Simulation

```typescript
simulateSingleGame(params: MonteCarloParams): { success: boolean; turnAchieved: number } {
  // 1. Creer et melanger le deck
  const deck = this.createSimulationDeck(deckSize, landCount);
  
  // 2. Simuler les mulligans
  let hand = this.drawHand(deck, 7);
  let mulligans = 0;
  
  while (mulligans < maxMulligans) {
    const decision = this.shouldMulligan(hand, mulliganStrategy);
    if (!decision.shouldMulligan) break;
    
    mulligans++;
    hand = this.drawHand(deck, 7 - mulligans);
  }
  
  // 3. Simuler les tours
  let landsInPlay = hand.filter(card => card === 'land').length;
  let currentTurn = 1;
  
  while (currentTurn <= targetTurn) {
    // Pioche (sauf tour 1 si on joue)
    if (currentTurn > 1 || !playFirst) {
      const drawnCard = this.drawCard(deck);
      if (drawnCard === 'land') landsInPlay++;
    }
    
    // Verification du succes
    if (landsInPlay >= currentTurn) {
      return { success: true, turnAchieved: currentTurn };
    }
    
    currentTurn++;
  }
  
  return { success: false, turnAchieved: targetTurn + 1 };
}
```

### 4.4 Melange Fisher-Yates

```typescript
shuffleDeck(deck: string[]): string[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### 4.5 Intervalle de Confiance (95%)

```typescript
// Ecart-type
const standardDeviation = Math.sqrt(variance / successfulRuns);

// Marge d'erreur a 95%
const margin = 1.96 * (standardDeviation / Math.sqrt(successfulRuns));

// Intervalle de confiance
confidence = {
  lower: Math.max(0, successRate - margin),
  upper: Math.min(100, successRate + margin)
};
```

---

## 5. Constantes et Seuils

### 5.1 Seuils de Probabilite

```typescript
const PROBABILITY_THRESHOLDS = {
  EXCELLENT_THRESHOLD: 0.95,    // 95%+ = Excellent
  GOOD_THRESHOLD: 0.90,         // 90%+ = Bon (Standard Karsten)
  ACCEPTABLE_THRESHOLD: 0.80,   // 80%+ = Acceptable
  POOR_THRESHOLD: 0.60,         // 60%+ = Faible
  // < 60% = Injouable
};
```

### 5.2 Tailles de Deck par Format

```typescript
const DECK_SIZES = {
  STANDARD_DECK_SIZE: 60,
  COMMANDER_DECK_SIZE: 100,
  LIMITED_DECK_SIZE: 40,
};
```

### 5.3 Constantes de Main et Pioche

```typescript
const HAND_CONSTANTS = {
  OPENING_HAND_SIZE: 7,
  MULLIGAN_HAND_SIZE: 6,
  MIN_MULLIGAN_HAND: 4,
  MAX_ANALYSIS_TURN: 10,
  CRITICAL_EARLY_TURNS: [1, 2, 3, 4],
};
```

### 5.4 Recommandations de Nombre de Terrains

```typescript
const LAND_COUNT_GUIDELINES = {
  MIN_LANDS_AGGRESSIVE: 20,     // Decks aggro rapides
  OPTIMAL_LANDS_MIDRANGE: 24,   // Decks midrange
  MAX_LANDS_CONTROL: 28,        // Decks control
};
```

### 5.5 Seuils d'Intensite de Couleur

```typescript
const COLOR_INTENSITY_THRESHOLDS = {
  SINGLE_COLOR_THRESHOLD: 14,   // Pour 1 symbole (ex: R)
  DOUBLE_COLOR_THRESHOLD: 20,   // Pour 2 symboles (ex: RR)
  TRIPLE_COLOR_THRESHOLD: 23,   // Pour 3 symboles (ex: RRR)
};
```

### 5.6 Multiplicateurs de Terrains Speciaux

```typescript
const LAND_MULTIPLIERS = {
  FETCHLAND_MULTIPLIER: 1.5,    // Fetchlands = 1.5x leurs cibles
  DUAL_LAND_EFFICIENCY: 1.8,    // Dual lands = haute efficacite
};
```

### 5.7 Constantes Monte Carlo

```typescript
const MONTE_CARLO_CONSTANTS = {
  DEFAULT_ITERATIONS: 10000,
  MIN_ITERATIONS: 1000,
  MAX_ITERATIONS: 100000,
  CONFIDENCE_LEVEL: 0.95,       // Intervalle de confiance 95%
};
```

---

## 6. Scores et Metriques

### 6.1 Calcul du Consistency Score

Le score de consistance est base sur le **ratio de terrains** et la **diversite des couleurs**:

```typescript
analyzeDeckConsistency(deck): { overallScore: number; ... } {
  const totalLands = deck.lands.reduce((sum, land) => sum + land.quantity, 0);
  const landRatio = totalLands / deck.totalCards;
  
  // Score de base selon le ratio de terrains
  let baseScore = 0.5;
  
  if (landRatio >= 0.38 && landRatio <= 0.45) {
    baseScore = 0.85;  // Excellent ratio
  } else if (landRatio >= 0.45 && landRatio <= 0.55) {
    baseScore = 0.75;  // Bon ratio (beaucoup de terrains)
  } else if (landRatio >= 0.35 && landRatio <= 0.38) {
    baseScore = 0.65;  // Ratio acceptable
  } else if (landRatio < 0.35) {
    baseScore = 0.25;  // Problematique (trop peu)
  } else {
    baseScore = 0.50;  // Trop de terrains
  }
  
  // Bonus multicolore
  const colorCount = countDistinctColors(deck.lands);
  if (colorCount >= 2) baseScore += 0.05;
  
  return Math.min(0.95, baseScore);
}
```

### 6.2 Echelle de Rating

```typescript
function getRating(consistency: number): string {
  if (consistency >= 0.90) return 'excellent';
  if (consistency >= 0.80) return 'good';
  if (consistency >= 0.70) return 'average';
  return 'poor';
}
```

### 6.3 Health Score Global

```typescript
function calculateOverallHealth(avgProbability: number): string {
  if (avgProbability >= 0.90) {
    return "Excellente - Manabase tres stable";
  } else if (avgProbability >= 0.85) {
    return "Bonne - Quelques ajustements mineurs recommandes";
  } else if (avgProbability >= 0.80) {
    return "Moyenne - Des ameliorations significatives sont necessaires";
  } else {
    return "Faible - Reconstruction majeure de la manabase requise";
  }
}
```

### 6.4 Karsten Rating

```typescript
function getKarstenRating(probability: number, deficit: number): string {
  if (probability >= 0.95) return 'excellent';
  if (probability >= 0.90) return 'good';
  if (probability >= 0.80) return 'acceptable';
  if (probability >= 0.60) return 'poor';
  return 'unplayable';
}
```

---

## 7. Formules de Recommandation de Lands

### 7.1 Formule de Base

```typescript
// Formule principale basee sur le CMC moyen
baseLands = 17 + Math.max(0, (averageCMC - 2) * 2);
```

**Explication:**
- Base de 17 terrains (minimum pour les decks tres aggro)
- +2 terrains par point de CMC au-dessus de 2

### 7.2 Ajustements par Format

```typescript
calculateOptimalLandCount(deck): { recommended: number; range: { min, max } } {
  let avgCMC = calculateAverageCMC(deck);
  let baseLands = 17 + Math.max(0, (avgCMC - 2) * 2);
  
  // Commander
  if (deck.format === 'Commander') {
    baseLands = Math.max(35, baseLands * 1.5);
    return { recommended: baseLands, range: { min: 35, max: 40 } };
  }
  
  // Limited (Draft/Sealed)
  if (deck.format === 'Limited') {
    baseLands = Math.max(17, baseLands);
    return { recommended: baseLands, range: { min: 17, max: 18 } };
  }
  
  // Standard/Modern - par archetype
  const isAggro = avgCMC <= 2.5;
  const isControl = avgCMC >= 3.5;
  
  let range;
  if (isAggro) {
    range = { min: 18, max: 22 };
  } else if (isControl) {
    range = { min: 24, max: 28 };
  } else { // Midrange
    range = { min: 20, max: 26 };
  }
  
  return {
    recommended: Math.round(Math.max(range.min, Math.min(range.max, baseLands))),
    range
  };
}
```

### 7.3 Ratio Ideal par CMC Moyen

```typescript
function calculateIdealLandRatio(averageCMC: number): number {
  if (averageCMC <= 1.5) return 0.33;  // 20/60 - Tres agressif
  if (averageCMC <= 2.0) return 0.35;  // 21/60 - Agressif
  if (averageCMC <= 2.5) return 0.37;  // 22/60 - Midrange-low
  if (averageCMC <= 3.0) return 0.40;  // 24/60 - Midrange
  if (averageCMC <= 3.5) return 0.42;  // 25/60 - Midrange-high
  if (averageCMC <= 4.0) return 0.43;  // 26/60 - Control-low
  return 0.45;                          // 27/60 - Control/Ramp
}
```

---

## 8. Algorithmes de Mulligan

### 8.1 Strategies de Mulligan

```typescript
shouldMulligan(hand: string[], strategy: string): MulliganDecision {
  const landCount = hand.filter(card => card === 'land').length;
  const handSize = hand.length;
  
  switch (strategy) {
    case 'aggressive':
      // Garde si 1-4 terrains et au moins 1 sort jouable
      shouldMulligan = landCount < 1 || landCount > 4;
      break;
      
    case 'conservative':
      // Garde si 2-5 terrains
      shouldMulligan = landCount < 2 || landCount > 5;
      break;
      
    case 'optimal':
      // Logique sophistiquee basee sur la courbe
      const optimalLands = Math.floor(handSize * 0.4); // ~40% terrains
      const deviation = Math.abs(landCount - optimalLands);
      shouldMulligan = deviation > 2;
      break;
      
    default: // 'none'
      shouldMulligan = false;
  }
  
  return { shouldMulligan, reason, handRating };
}
```

### 8.2 Notation de Main (0-10)

```typescript
function rateHand(landCount: number, handSize: number, strategy: string): number {
  switch (strategy) {
    case 'aggressive':
      // Optimal: 3 terrains, penalite pour deviation
      return Math.max(0, Math.min(10, 5 + (3 - Math.abs(landCount - 3))));
      
    case 'conservative':
      return Math.max(0, Math.min(10, 5 + (2 - Math.abs(landCount - 3))));
      
    case 'optimal':
      const deviation = Math.abs(landCount - Math.floor(handSize * 0.4));
      return Math.max(0, Math.min(10, 8 - deviation * 2));
  }
}
```

---

## 9. Analyse Multivariee

### 9.1 Analyse de Combinaisons de Couleurs

Pour les decks multicolores, on analyse la probabilite conjointe:

```typescript
analyzeMultivariateRequirements(
  deckConfig: DeckConfiguration,
  colorRequirements: ColorRequirement[]
): MultivariateAnalysis {
  let overallConsistency = 1;
  const bottleneckColors: ManaColor[] = [];
  
  // Analyser chaque exigence de couleur
  for (const requirement of colorRequirements) {
    const analysis = this.calculateKarstenProbability(
      deckConfig.totalCards,
      requirement.sources,
      requirement.criticalTurn,
      requirement.intensity
    );
    
    // Consistance globale = produit des probabilites
    overallConsistency *= analysis.castProbability;
    
    // Identifier les goulots d'etranglement
    if (analysis.castProbability < 0.80) {
      bottleneckColors.push(requirement.color);
    }
  }
  
  return { overallConsistency, bottleneckColors, ... };
}
```

### 9.2 Probabilite Conjointe

Pour avoir toutes les couleurs necessaires:

```
P(toutes couleurs) = P(couleur1) * P(couleur2) * ... * P(couleurN)
```

**Exemple:** Deck Jeskai (WUR)
- P(W) = 92%, P(U) = 94%, P(R) = 88%
- P(toutes) = 0.92 * 0.94 * 0.88 = **76.1%**

---

## 10. Optimisation de Manabase

### 10.1 Distribution Optimale des Terrains

```typescript
optimizeManabase(deck): { [color: string]: number } {
  // 1. Calculer les besoins pour chaque couleur
  const requirements: { [color: string]: number } = {};
  
  for (const card of deck.cards) {
    for (const [color, count] of Object.entries(card.manaCost.symbols)) {
      if (count > 0) {
        const needed = KARSTEN_TABLES[count]?.[card.cmc] || 0;
        requirements[color] = Math.max(requirements[color] || 0, needed);
      }
    }
  }
  
  // 2. Distribuer proportionnellement
  const totalRequired = Object.values(requirements).reduce((sum, r) => sum + r, 0);
  const distribution: { [color: string]: number } = {};
  
  for (const [color, required] of Object.entries(requirements)) {
    distribution[color] = Math.round((required / totalRequired) * deck.totalLands);
  }
  
  return distribution;
}
```

### 10.2 Repartition Recommandee

```typescript
const optimalManabase = {
  totalLands: 24,           // Exemple midrange
  colorSources: { W: 12, U: 14, R: 10 },
  fetchlands: Math.floor(24 * 0.2),   // ~20% = 5 fetchlands
  duallands: Math.floor(24 * 0.4),    // ~40% = 10 dual lands
  basics: Math.floor(24 * 0.3),       // ~30% = 7 basics
  utility: Math.floor(24 * 0.1),      // ~10% = 2 utility lands
};
```

### 10.3 Distribution de Couleurs Proportionnelle

```typescript
calculateOptimalColorDistribution(spells: DeckCard[], totalLands: number): Record<string, number> {
  const colorDemand: Record<string, number> = {};
  
  // Compter la demande pour chaque couleur
  spells.forEach(spell => {
    const colors = extractColors(spell.card.mana_cost);
    colors.forEach(color => {
      const symbols = parseManaCost(spell.card.mana_cost)
        .filter(s => s === color || s.includes(color));
      colorDemand[color] = (colorDemand[color] || 0) + symbols.length * spell.quantity;
    });
  });
  
  const totalDemand = Object.values(colorDemand).reduce((sum, d) => sum + d, 0);
  
  // Distribuer les terrains proportionnellement a la demande
  const distribution: Record<string, number> = {};
  Object.entries(colorDemand).forEach(([color, demand]) => {
    distribution[color] = Math.round((demand / totalDemand) * totalLands);
  });
  
  return distribution;
}
```

---

## Annexes

### A. Glossaire

| Terme | Definition |
|-------|------------|
| **CMC** | Converted Mana Cost - Cout total de mana d'une carte |
| **Source** | Terrain ou permanent qui produit du mana d'une couleur |
| **Fetchland** | Terrain qui se sacrifie pour chercher un autre terrain |
| **Shockland** | Terrain dual qui peut entrer degage en payant 2 PV |
| **Fastland** | Terrain qui entre degage si on controle 2 terrains ou moins |
| **Mulligan** | Action de remettre sa main dans le deck pour en tirer une nouvelle |

### B. References

1. **Frank Karsten** - "How Many Sources Do You Need to Consistently Cast Your Spells? A 2022 Update" - TCGPlayer
2. **Distribution Hypergeometrique** - Theorie des probabilites
3. **Simulation Monte Carlo** - Methodes numeriques stochastiques

### C. Fichiers Source

| Fichier | Contenu Principal |
|---------|-------------------|
| `manaCalculator.ts` | Classe ManaCalculator, tables Karsten, hypergeometrique |
| `advancedMaths.ts` | AdvancedMathEngine, Monte Carlo, analyse multivariee |
| `deckAnalyzer.ts` | Analyse de deck, detection de terrains, probabilites |
| `manabase.ts` | Utilitaires, parsing de couts, simulation de mains |
| `types/maths.ts` | Types TypeScript et constantes |

---

*Document genere pour ManaTuner Pro v1.0*
*Derniere mise a jour: 2025*
