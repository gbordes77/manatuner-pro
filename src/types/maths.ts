// Types avancés pour l'analyse mathématique ManaTuner Pro

export interface DeckConfiguration {
  totalCards: number;
  totalLands: number;
  minLands: number;
  maxLands: number;
  colorRequirements: ColorRequirement[];
  fetchlands: FetchlandConfiguration[];
  hybridMana: HybridManaConfiguration[];
}

export interface ColorRequirement {
  color: string;
  symbolsNeeded: number;
  turn: number;
  priority: 'critical' | 'important' | 'flexible';
}

export interface FetchlandConfiguration {
  name: string;
  quantity: number;
  fetchableColors: string[];
  etbTapped: boolean;
  conditions?: string[];
}

export interface HybridManaConfiguration {
  colors: [string, string];
  quantity: number;
  flexibility: number; // 0-1, où 1 = totalement flexible
}

export interface MulliganCriteria {
  minLands: number;
  maxLands: number;
  requiredSpells?: number;
  requiredColors?: string[];
  keepProbability: number;
  aggressiveness: 'conservative' | 'normal' | 'aggressive';
}

export interface MulliganResult {
  finalKeepProbability: number;
  averageMulligans: number;
  scenarioBreakdown: MulliganScenario[];
  recommendation: string;
}

export interface MulliganScenario {
  handSize: number;
  keepProbability: number;
  reasons: string[];
  landCount: number;
  spellCount: number;
}

export interface MultiConstraint {
  cardType: string;
  minCount: number;
  maxCount?: number;
  cardsInDeck: number;
  priority: number; // 1-10
}

export interface TurnByTurnAnalysis {
  turn: number;
  cardsDrawn: number;
  onThePlay: boolean;
  probabilities: {
    exactlyNLands: number[];
    atLeastNLands: number[];
    castableSpells: CastableSpellProbability[];
  };
  recommendations: string[];
}

export interface CastableSpellProbability {
  spellName: string;
  manaCost: ManaCost;
  probability: number;
  bottlenecks: ManaBottleneck[];
}

export interface ManaCost {
  generic: number;
  specific: { [color: string]: number };
  hybrid?: Array<[string, string]>;
  phyrexian?: { [color: string]: number };
  total: number;
}

export interface ManaSource {
  name: string;
  colors: string[];
  etb: 'tapped' | 'untapped' | 'conditional';
  conditions?: string[];
  quantity: number;
}

export interface AvailableMana {
  [color: string]: number;
  generic: number;
  total: number;
}

export interface ManaBottleneck {
  color: string;
  shortfall: number;
  suggestions: string[];
  severity: 'minor' | 'moderate' | 'critical';
}

export interface CastingAnalysis {
  probability: number;
  confidence: [number, number]; // Confidence interval
  bottlenecks: ManaBottleneck[];
  recommendations: ManabaseRecommendation[];
  alternativeLines: AlternativeLine[];
}

export interface ManabaseRecommendation {
  type: 'add_source' | 'remove_source' | 'replace_source' | 'adjust_curve';
  description: string;
  impact: number; // Expected probability improvement
  cost: number; // Deck slots or other resources
  priority: 'high' | 'medium' | 'low';
}

export interface AlternativeLine {
  description: string;
  probability: number;
  requirements: string[];
  viability: number; // 0-1
}

export interface MonteCarloSimulation {
  iterations: number;
  results: SimulationResult[];
  statistics: SimulationStatistics;
}

export interface SimulationResult {
  hand: Card[];
  turnResults: TurnResult[];
  finalOutcome: 'success' | 'failure';
  criticalTurn: number;
}

export interface TurnResult {
  turn: number;
  landsInPlay: ManaSource[];
  availableMana: AvailableMana;
  castableSpells: string[];
  landDrop: ManaSource | null;
}

export interface SimulationStatistics {
  successRate: number;
  averageCriticalTurn: number;
  bottleneckFrequency: { [color: string]: number };
  mulliganRate: number;
  confidenceInterval: [number, number];
}

export interface Card {
  name: string;
  manaCost?: ManaCost;
  types: string[];
  isLand: boolean;
  quantity: number;
  rarity?: string;
}

export interface OptimizationResult {
  currentScore: number;
  optimizedScore: number;
  changes: ManabaseChange[];
  tradeoffs: Tradeoff[];
  confidence: number;
}

export interface ManabaseChange {
  action: 'add' | 'remove' | 'replace';
  card: string;
  quantity: number;
  reasoning: string;
  impact: number;
}

export interface Tradeoff {
  description: string;
  positives: string[];
  negatives: string[];
  netValue: number;
}

// Fonctions utilitaires de type
export type ProbabilityFunction = (
  k: number,
  N: number,
  K: number,
  n: number
) => number;

export type CumulativeProbabilityFunction = (
  minK: number,
  N: number,
  K: number,
  n: number
) => number;

export type MultivariateFunction = (
  deckSize: number,
  handSize: number,
  constraints: MultiConstraint[]
) => number;

// Constantes mathématiques
export const MAGIC_CONSTANTS = {
  STANDARD_DECK_SIZE: 60,
  COMMANDER_DECK_SIZE: 100,
  STARTING_HAND_SIZE: 7,
  MAX_MULLIGANS: 3,
  LONDON_MULLIGAN_BOTTOM: 1,
  KARSTEN_90_PERCENT_THRESHOLD: 0.9,
  KARSTEN_85_PERCENT_THRESHOLD: 0.85,
  MIN_PLAYABLE_PROBABILITY: 0.7,
} as const;

// Validation des types
export const isDeckConfiguration = (obj: any): obj is DeckConfiguration => {
  return (
    typeof obj === 'object' &&
    typeof obj.totalCards === 'number' &&
    typeof obj.totalLands === 'number' &&
    typeof obj.minLands === 'number' &&
    typeof obj.maxLands === 'number' &&
    Array.isArray(obj.colorRequirements) &&
    Array.isArray(obj.fetchlands) &&
    Array.isArray(obj.hybridMana)
  );
};

export const isManaCost = (obj: any): obj is ManaCost => {
  return (
    typeof obj === 'object' &&
    typeof obj.generic === 'number' &&
    typeof obj.specific === 'object' &&
    typeof obj.total === 'number'
  );
}; 