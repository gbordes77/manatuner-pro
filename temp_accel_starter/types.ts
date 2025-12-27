// src/castability/types.ts
export const COLOR = { W: 1, U: 2, B: 4, R: 8, G: 16, C: 32 } as const;
export type ColorLetter = keyof typeof COLOR;
export type ColorMask = number;

export type SourceType = "LAND" | "DORK" | "ROCK" | "RITUAL" | "ONE_SHOT" | "TREASURE" | "CONDITIONAL";

export interface ManaCost {
  mv: number; // total mana value
  generic: number;
  pips: Partial<Record<ColorLetter, number>>;
}

export interface DeckManaProfile {
  deckSize: number; // 60 or 99
  totalLands: number;
  // how many cards in the deck can produce each color as a land source (count duals accordingly)
  landColorSources: Partial<Record<ColorLetter, number>>;
}

export interface ManaProducerDef {
  name: string;
  type: SourceType;

  castCostGeneric: number;
  castCostColors: Partial<Record<ColorLetter, number>>;

  delay: number; // 1 for dorks (summoning sickness) or ETB tapped
  isCreature: boolean;

  producesAmount: number; // raw amount produced
  activationTax: number;  // e.g. signets cost 1 to activate
  producesMask: ColorMask; // which colors it can produce (or C)
  producesAny: boolean;

  oneShot: boolean;
  survivalBase?: number;
}

export interface ProducerInDeck {
  def: ManaProducerDef;
  copies: number;
}

export interface AccelContext {
  playDraw: "PLAY" | "DRAW";
  // removal attrition rate per exposed turn for creatures (0..1)
  removalRate: number;
  // used when producer is not creature; if survivalBase not set
  defaultRockSurvival: number; // e.g. 0.98
}

export interface CastabilityResult {
  p1: number;
  p2: number;
}

export interface AcceleratedCastabilityResult {
  base: CastabilityResult;
  withAcceleration: CastabilityResult;
  accelerationImpact: number; // withAccel.p2 - base.p2
  acceleratedTurn: number | null; // earliest turn where cast becomes possible with decent probability
  keyAccelerators: string[];
}
