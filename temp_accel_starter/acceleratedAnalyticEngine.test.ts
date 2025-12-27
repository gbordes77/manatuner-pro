// src/castability/__tests__/acceleratedAnalyticEngine.test.ts
import { describe, it, expect } from "vitest";
import { Hypergeom } from "../hypergeom";
import { computeAcceleratedCastabilityAtTurn, producerOnlineProbByTurn } from "../acceleratedAnalyticEngine";
import type { DeckManaProfile, ManaCost, ProducerInDeck, AccelContext } from "../types";
import { COLOR } from "../types";

const ctx: AccelContext = { playDraw: "PLAY", removalRate: 0.25, defaultRockSurvival: 0.98 };

function mkDeck(): DeckManaProfile {
  return {
    deckSize: 60,
    totalLands: 24,
    landColorSources: { G: 14, U: 10, R: 10, B: 8, W: 8 }
  };
}

function mkElf(copies: number): ProducerInDeck {
  return {
    copies,
    def: {
      name: "Llanowar Elves",
      type: "DORK",
      castCostGeneric: 0,
      castCostColors: { G: 1 },
      delay: 1,
      isCreature: true,
      producesAmount: 1,
      activationTax: 0,
      producesMask: COLOR.G,
      producesAny: false,
      oneShot: false,
      survivalBase: 0.75,
    }
  };
}

function mkSignet(copies: number): ProducerInDeck {
  return {
    copies,
    def: {
      name: "Arcane Signet",
      type: "ROCK",
      castCostGeneric: 2,
      castCostColors: {},
      delay: 0,
      isCreature: false,
      producesAmount: 1,
      activationTax: 0,
      producesMask: COLOR.W|COLOR.U|COLOR.B|COLOR.R|COLOR.G,
      producesAny: true,
      oneShot: false,
      survivalBase: 0.98,
    }
  };
}

describe("producerOnlineProbByTurn", () => {
  it("returns 0 if cannot be online in time (tLatest<1)", () => {
    const hg = new Hypergeom(200);
    const deck = mkDeck();
    const elf = mkElf(4);
    const p = producerOnlineProbByTurn(hg, deck, elf, 2, ctx); // needs to be played T0 to be online T2 (delay=1)
    expect(p).toBe(0);
  });
});

describe("computeAcceleratedCastabilityAtTurn", () => {
  it("Elf package increases probability to cast MV3 on turn 2 (ramp)", () => {
    const hg = new Hypergeom(200);
    const deck = mkDeck();

    const spell: ManaCost = { mv: 3, generic: 2, pips: { G: 1 } }; // 2G
    const noProd = computeAcceleratedCastabilityAtTurn(hg, deck, spell, 2, [], ctx, 2);
    const withElf = computeAcceleratedCastabilityAtTurn(hg, deck, spell, 2, [mkElf(4)], ctx, 2);

    expect(withElf.p2).toBeGreaterThan(noProd.p2);
  });

  it("Arcane Signet does not meaningfully enable MV2 on turn 1 (obvious)", () => {
    const hg = new Hypergeom(200);
    const deck = mkDeck();
    const spell: ManaCost = { mv: 2, generic: 2, pips: {} }; // {2}
    const res = computeAcceleratedCastabilityAtTurn(hg, deck, spell, 1, [mkSignet(4)], ctx, 2);
    expect(res.p2).toBe(0);
  });
});
