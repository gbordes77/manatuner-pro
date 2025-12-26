import type {
    Card,
    ColorRequirement,
    DeckCard,
    SimulationParams,
    SimulationResult,
    TurnAnalysis,
} from "@/types";

// Constants basés sur les recherches de Frank Karsten
const KARSTEN_TABLE = {
  1: { single: 13, double: 20, triple: 27 },
  2: { single: 8, double: 13, triple: 18 },
  3: { single: 6, double: 9, triple: 12 },
  4: { single: 4, double: 7, triple: 9 },
  5: { single: 4, double: 6, triple: 8 },
  6: { single: 3, double: 5, triple: 7 },
};

// Couleurs MTG
export const COLORS = {
  W: "white",
  U: "blue",
  B: "black",
  R: "red",
  G: "green",
  C: "colorless",
} as const;

export type ManaColor = keyof typeof COLORS;

/**
 * Parse un coût de mana MTG en symboles individuels
 */
export const parseManaCost = (cost: string): string[] => {
  if (!cost) return [];

  // Regex pour capturer tous les symboles de mana
  const symbols = cost.match(/\{[^}]+\}/g) || [];
  return symbols.map((symbol) => symbol.slice(1, -1));
};

/**
 * Extrait les couleurs requises d'un coût de mana
 */
export const extractColors = (cost: string): ManaColor[] => {
  const symbols = parseManaCost(cost);
  const colors = new Set<ManaColor>();

  symbols.forEach((symbol) => {
    // Couleurs simples
    if (symbol in COLORS) {
      colors.add(symbol as ManaColor);
    }
    // Coûts hybrides (ex: W/U, 2/W)
    else if (symbol.includes("/")) {
      const parts = symbol.split("/");
      parts.forEach((part) => {
        if (part in COLORS) {
          colors.add(part as ManaColor);
        }
      });
    }
    // Coûts Phyrexian (ex: W/P)
    else if (symbol.includes("P")) {
      const color = symbol.replace("/P", "");
      if (color in COLORS) {
        colors.add(color as ManaColor);
      }
    }
  });

  return Array.from(colors);
};

/**
 * Calcule le nombre de sources requises pour un coût donné au tour T
 */
export const calculateRequiredSources = (
  cost: string,
  turn: number,
  _colorIntensity: number = 1,
): number => {
  const colors = extractColors(cost);
  if (colors.length === 0) return 0;

  const table = KARSTEN_TABLE[Math.min(turn, 6) as keyof typeof KARSTEN_TABLE];
  if (!table) return 0;

  // Détermine l'intensité basée sur le nombre de symboles
  const symbols = parseManaCost(cost);
  const colorCount = symbols.filter(
    (s) => s in COLORS || s.includes("/"),
  ).length;

  let intensity: "single" | "double" | "triple";
  if (colorCount >= 3) intensity = "triple";
  else if (colorCount >= 2) intensity = "double";
  else intensity = "single";

  return table[intensity];
};

/**
 * Distribution hypergéométrique - probabilité de tirer X succès
 */
export const hypergeometric = (
  population: number,
  successes: number,
  draws: number,
  target: number,
): number => {
  if (target > successes || target > draws) return 0;
  if (target < 0) return 0;

  const combinations = (n: number, k: number): number => {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;

    let result = 1;
    for (let i = 0; i < k; i++) {
      result = (result * (n - i)) / (i + 1);
    }
    return result;
  };

  const favorable =
    combinations(successes, target) *
    combinations(population - successes, draws - target);
  const total = combinations(population, draws);

  return total > 0 ? favorable / total : 0;
};

/**
 * Calcule la probabilité de cast au tour donné
 */
export const calculateCastProbability = (
  requiredSources: number,
  availableSources: number,
  deckSize: number,
  cardsDrawn: number,
): number => {
  // Probabilité d'avoir au moins X sources dans les Y cartes tirées
  let probability = 0;

  for (
    let i = requiredSources;
    i <= Math.min(availableSources, cardsDrawn);
    i++
  ) {
    probability += hypergeometric(deckSize, availableSources, cardsDrawn, i);
  }

  return Math.min(1, probability);
};

/**
 * Analyse une carte spécifique dans le contexte du deck
 */
export const analyzeCard = (
  card: Card,
  quantity: number,
  lands: DeckCard[],
  deckSize: number = 60,
): TurnAnalysis[] => {
  if (!card.mana_cost) return [];

  const colors = extractColors(card.mana_cost);
  const analysis: TurnAnalysis[] = [];

  // Compte les sources pour chaque couleur
  const colorSources = colors.reduce(
    (acc, color) => {
      const sources = lands.reduce((count, land) => {
        // Check color_identity as a fallback for produced mana
        if (land.card.color_identity?.includes(color)) {
          return count + land.quantity;
        }
        return count;
      }, 0);
      acc[color] = sources;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Analyse pour les tours 1-6
  for (let turn = 1; turn <= 6; turn++) {
    const cardsDrawn = 7 + turn - 1; // Main initiale + pioche
    const requirements: ColorRequirement[] = [];
    let worstProbability = 1;

    for (const color of colors) {
      const required = calculateRequiredSources(card.mana_cost!, turn);
      const available = colorSources[color] || 0;
      const probability = calculateCastProbability(
        required,
        available,
        deckSize,
        cardsDrawn,
      );

      // Only push if color is a valid ManaColor (not 'C')
      if (color !== "C") {
        requirements.push({
          color: color as "W" | "U" | "B" | "R" | "G",
          turn,
          sources: required,
          probability: probability,
          isOptimal: probability >= 0.9,
        });
      }

      worstProbability = Math.min(worstProbability, probability);
    }

    analysis.push({
      turn,
      castProbability: worstProbability,
      averageDelay: worstProbability < 0.9 ? (1 - worstProbability) * 2 : 0,
      sources: requirements,
    });
  }

  return analysis;
};

/**
 * Simule une main initiale avec stratégie de mulligan
 */
export const simulateHand = (
  deck: DeckCard[],
  strategy: "none" | "aggressive" | "conservative" = "conservative",
): { hand: Card[]; lands: number; spells: number; keepable: boolean } => {
  const cards = deck.flatMap((dc) => Array(dc.quantity).fill(dc.card));
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  const hand = shuffled.slice(0, 7);

  const lands = hand.filter((card) =>
    card.type_line?.toLowerCase().includes("land"),
  ).length;
  const spells = hand.length - lands;

  let keepable = false;

  switch (strategy) {
    case "none":
      keepable = true;
      break;
    case "aggressive":
      // Garde si 1-4 terrains et au moins 1 sort jouable
      keepable = lands >= 1 && lands <= 4 && spells >= 1;
      break;
    case "conservative":
      // Garde si 2-5 terrains et courbe convenable
      keepable = lands >= 2 && lands <= 5;
      break;
  }

  return { hand, lands, spells, keepable };
};

/**
 * Simule de multiples parties pour obtenir des statistiques
 */
export const runManabaseSimulation = (
  deck: DeckCard[],
  params: SimulationParams,
): SimulationResult => {
  const results: Array<{
    turn: number;
    castRate: number;
    averageDelay: number;
    keepRate: number;
  }> = [];
  let totalKeeps = 0;
  let _totalMulligans = 0;

  for (let turn = 1; turn <= 6; turn++) {
    let successfulCasts = 0;
    let totalDelay = 0;
    let validGames = 0;

    for (let game = 0; game < params.iterations; game++) {
      let hand = simulateHand(deck, params.mulliganStrategy);
      let mulligans = 0;

      // Mulligan jusqu'à avoir une main gardable
      while (!hand.keepable && mulligans < params.maxMulligans) {
        mulligans++;
        hand = simulateHand(deck, params.mulliganStrategy);
      }

      if (hand.keepable) {
        totalKeeps++;
        validGames++;

        // Simule la pioche jusqu'au tour T
        const _cardsDrawn = 7 - mulligans + (turn - 1);
        const landsInPlay = Math.min(
          hand.lands + Math.floor((turn - 1) * 0.4),
          turn,
        );

        // Vérifie si on peut jouer nos sorts
        // Simplifié : assume qu'on peut jouer si on a assez de mana
        if (landsInPlay >= turn) {
          successfulCasts++;
        } else {
          totalDelay += turn - landsInPlay;
        }
      }

      _totalMulligans += mulligans;
    }

    results.push({
      turn,
      castRate: validGames > 0 ? successfulCasts / validGames : 0,
      averageDelay: validGames > 0 ? totalDelay / validGames : 0,
      keepRate: totalKeeps / params.iterations,
    });
  }

  return {
    params,
    results,
    statistics: {
      totalGames: params.iterations,
      averageKeepRate: totalKeeps / (params.iterations * 6),
      averageFirstSpellTurn: results.find((r) => r.castRate > 0.8)?.turn || 6,
    },
  };
};

/**
 * Identifie les terrains qui produisent une couleur donnée
 */
export const getLandsProducingColor = (
  lands: DeckCard[],
  color: ManaColor,
): DeckCard[] => {
  return lands.filter(
    (land) =>
      land.card.color_identity?.includes(color) ||
      land.card.colors.includes(COLORS[color]),
  );
};

/**
 * Calcule la distribution de couleurs optimale
 */
export const calculateOptimalColorDistribution = (
  spells: DeckCard[],
  totalLands: number,
): Record<string, number> => {
  const colorDemand: Record<string, number> = {};

  // Compte la demande pour chaque couleur
  spells.forEach((spell) => {
    const colors = extractColors(spell.card.mana_cost || "");
    colors.forEach((color) => {
      const symbols = parseManaCost(spell.card.mana_cost || "").filter(
        (s) => s === color || s.includes(color),
      );
      colorDemand[color] =
        (colorDemand[color] || 0) + symbols.length * spell.quantity;
    });
  });

  const totalDemand = Object.values(colorDemand).reduce(
    (sum, demand) => sum + demand,
    0,
  );

  // Distribue les terrains proportionnellement
  const distribution: Record<string, number> = {};
  Object.entries(colorDemand).forEach(([color, demand]) => {
    distribution[color] = Math.round((demand / totalDemand) * totalLands);
  });

  return distribution;
};
