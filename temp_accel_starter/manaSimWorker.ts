// src/worker/manaSimWorker.ts
// Minimal "mana-only" simulation worker (Smart Monte Carlo).
/*
Usage:
  const worker = new Worker(new URL("./manaSimWorker.ts", import.meta.url), { type: "module" });
  worker.postMessage({ type: "RUN", payload: ... });
  worker.onmessage = (ev) => { ... }
*/

import { COLOR, type ColorLetter, type ColorMask, type ManaCost, type ManaProducerDef } from "../castability/types";

export type SimCard =
  | { kind: "LAND"; producesMask: ColorMask; entersTapped?: boolean }
  | { kind: "PRODUCER"; producer: ManaProducerDef }
  | { kind: "SPELL"; id: string; cost: ManaCost };

export interface SimRequest {
  type: "RUN";
  payload: {
    deck: SimCard[];           // deck list as flat array
    spells: { id: string; cost: ManaCost }[]; // spells to track (you can pass all non-lands)
    maxTurn: number;           // how far to simulate
    iterations: number;        // 1000..2500 typical
    playDraw: "PLAY" | "DRAW";
    removalRate: number;       // attrition per exposed turn for creatures
  };
}

export interface SimResponse {
  type: "RESULT";
  payload: {
    iterations: number;
    maxTurn: number;
    // castableByTurn[spellId][t] = P(castable by turn t+1)
    castableByTurn: Record<string, number[]>;
    avgCastTurn: Record<string, number>; // expected turn of first cast (capped at maxTurn+1)
    durationMs: number;
  };
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function countPips(cost: ManaCost): number {
  return Object.values(cost.pips).reduce((a, v) => a + (v ?? 0), 0);
}

// Very simplified mana payment check: colored pips must be met by *sources that can produce that color*.
// For speed and simplicity, we ignore "activation tax" in payment (use producer netPerTurn in ramp decisions instead).
function canPay(cost: ManaCost, available: { totalMana: number; colorSources: Record<ColorLetter, number> }): boolean {
  if (available.totalMana < cost.mv) return false;
  for (const c of Object.keys(cost.pips) as ColorLetter[]) {
    const need = cost.pips[c] ?? 0;
    if ((available.colorSources[c] ?? 0) < need) return false;
  }
  return true;
}

function landChoiceScore(producesMask: ColorMask, haveMask: ColorMask): number {
  // prefer lands that add new colors to the board early
  const newColors = producesMask & ~haveMask;
  return popcount(newColors);
}

function popcount(x: number): number {
  x >>>= 0;
  let c = 0;
  while (x) { x &= (x - 1) >>> 0; c++; }
  return c;
}

function maskToColorCounts(mask: ColorMask): Record<ColorLetter, number> {
  return {
    W: (mask & COLOR.W) ? 1 : 0,
    U: (mask & COLOR.U) ? 1 : 0,
    B: (mask & COLOR.B) ? 1 : 0,
    R: (mask & COLOR.R) ? 1 : 0,
    G: (mask & COLOR.G) ? 1 : 0,
    C: (mask & COLOR.C) ? 1 : 0,
  };
}

function producerNetPerTurn(p: ManaProducerDef): number {
  return Math.max(0, (p.producesAmount ?? 0) - (p.activationTax ?? 0));
}

function producerProducesMask(p: ManaProducerDef): ColorMask {
  return p.producesAny ? (COLOR.W|COLOR.U|COLOR.B|COLOR.R|COLOR.G|COLOR.C) : p.producesMask;
}

type OnlineProducerState = {
  p: ManaProducerDef;
  onlineAt: number; // turn when it can start producing
  isCreature: boolean;
};

function drawHand(deck: SimCard[], size: number): SimCard[] {
  return deck.slice(0, size);
}

// TODO: Replace with London Mulligan heuristic (deck-aware).
function keepHandSimple(hand: SimCard[]): boolean {
  const lands = hand.filter((c) => c.kind === "LAND").length;
  return lands >= 2 && lands <= 5;
}

function mulliganSimple(deck: SimCard[]): { hand: SimCard[]; bottomed: SimCard[] } {
  // simplistic: mulligan down to 6 once if hand unkeepable; keep 7 otherwise
  const h7 = drawHand(deck, 7);
  if (keepHandSimple(h7)) return { hand: h7, bottomed: [] };
  const h6 = drawHand(deck, 7); // London: draw 7 again, bottom 1
  // bottom the most expensive spell (rough heuristic)
  let idx = -1;
  let bestMv = -1;
  for (let i = 0; i < h6.length; i++) {
    const c = h6[i];
    if (c.kind === "SPELL") {
      if (c.cost.mv > bestMv) { bestMv = c.cost.mv; idx = i; }
    }
  }
  if (idx < 0) idx = h6.length - 1;
  const bottomed = [h6[idx]];
  const hand = h6.filter((_, i) => i !== idx);
  return { hand, bottomed };
}

function computeAvailableMana(
  turn: number,
  landsInPlay: SimCard[],
  producersInPlay: OnlineProducerState[],
  removalRate: number
): { totalMana: number; colorSources: Record<ColorLetter, number>; producersInPlay: OnlineProducerState[] } {
  // apply removal to creatures (attrition per turn)
  const survivors: OnlineProducerState[] = [];
  for (const s of producersInPlay) {
    if (s.isCreature && turn > 1) {
      if (Math.random() < removalRate) continue;
    }
    survivors.push(s);
  }

  let total = landsInPlay.length;
  let haveMask: ColorMask = 0;
  let colorCounts: Record<ColorLetter, number> = { W:0,U:0,B:0,R:0,G:0,C:0 };

  for (const l of landsInPlay) {
    if (l.kind !== "LAND") continue;
    const m = l.producesMask;
    haveMask |= m;
    const cc = maskToColorCounts(m);
    for (const k in cc) colorCounts[k as ColorLetter] += cc[k as ColorLetter];
  }

  for (const s of survivors) {
    if (turn >= s.onlineAt) {
      const net = producerNetPerTurn(s.p);
      total += net;
      const m = producerProducesMask(s.p);
      const cc = maskToColorCounts(m);
      for (const k in cc) colorCounts[k as ColorLetter] += cc[k as ColorLetter];
    }
  }

  return { totalMana: total, colorSources: colorCounts, producersInPlay: survivors };
}

function canCastProducerNow(p: ManaProducerDef, availableTotal: number, availableColors: Record<ColorLetter, number>): boolean {
  const needTotal = p.castCostGeneric + Object.values(p.castCostColors ?? {}).reduce((a, v) => a + (v ?? 0), 0);
  if (availableTotal < needTotal) return false;
  for (const c of Object.keys(p.castCostColors ?? {}) as ColorLetter[]) {
    const need = p.castCostColors[c] ?? 0;
    if ((availableColors[c] ?? 0) < need) return false;
  }
  return true;
}

function playLandGreedy(hand: SimCard[], landsInPlay: SimCard[], haveMask: ColorMask): boolean {
  let bestIdx = -1;
  let bestScore = -1;
  for (let i = 0; i < hand.length; i++) {
    const c = hand[i];
    if (c.kind !== "LAND") continue;
    const score = landChoiceScore(c.producesMask, haveMask);
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  if (bestIdx >= 0) {
    landsInPlay.push(hand[bestIdx]);
    hand.splice(bestIdx, 1);
    return true;
  }
  return false;
}

function playRampGreedy(
  turn: number,
  hand: SimCard[],
  landsInPlay: SimCard[],
  producersInPlay: OnlineProducerState[],
  availableTotal: number,
  availableColors: Record<ColorLetter, number>
): boolean {
  // choose best castable producer by net-per-turn, tie-break by fixing breadth
  let bestIdx = -1;
  let bestScore = -1;

  for (let i = 0; i < hand.length; i++) {
    const c = hand[i];
    if (c.kind !== "PRODUCER") continue;
    const p = c.producer;
    if (!canCastProducerNow(p, availableTotal, availableColors)) continue;

    const net = producerNetPerTurn(p);
    const breadth = popcount(producerProducesMask(p));
    const score = net * 10 + breadth;

    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }

  if (bestIdx >= 0) {
    const card = hand[bestIdx] as any;
    const p: ManaProducerDef = card.producer;
    producersInPlay.push({ p, onlineAt: turn + (p.delay ?? 0), isCreature: !!p.isCreature });
    hand.splice(bestIdx, 1);
    return true;
  }
  return false;
}

function initOutcome(spells: { id: string; cost: ManaCost }[], maxTurn: number) {
  const castableByTurn: Record<string, number[]> = {};
  const firstCastTurnSum: Record<string, number> = {};
  for (const s of spells) {
    castableByTurn[s.id] = new Array(maxTurn).fill(0);
    firstCastTurnSum[s.id] = 0;
  }
  return { castableByTurn, firstCastTurnSum };
}

function runSimulation(req: SimRequest["payload"]): SimResponse["payload"] {
  const t0 = performance.now();
  const { deck, spells, maxTurn, iterations, playDraw, removalRate } = req;

  const { castableByTurn, firstCastTurnSum } = initOutcome(spells, maxTurn);

  for (let it = 0; it < iterations; it++) {
    const d = shuffle(deck.slice());

    // draw/mulligan
    const { hand } = mulliganSimple(d);
    let libraryIndex = 7; // after drawing 7
    const handCards = hand.slice();

    const landsInPlay: SimCard[] = [];
    const producersInPlay: OnlineProducerState[] = [];
    let haveMask: ColorMask = 0;

    // track first cast per spell
    const firstCast: Record<string, number> = {};
    for (const s of spells) firstCast[s.id] = maxTurn + 1;

    for (let turn = 1; turn <= maxTurn; turn++) {
      // draw step (except T1 on PLAY)
      const doDraw = !(turn === 1 && playDraw === "PLAY");
      if (doDraw && libraryIndex < d.length) {
        handCards.push(d[libraryIndex++]);
      }

      // update available mana (also applies removal)
      const avail0 = computeAvailableMana(turn, landsInPlay, producersInPlay, removalRate);
      // main phase: play land then ramp (simple greedy)
      playLandGreedy(handCards, landsInPlay, haveMask);
      // recompute haveMask after land play
      for (const l of landsInPlay) if (l.kind === "LAND") haveMask |= l.producesMask;

      const avail1 = computeAvailableMana(turn, landsInPlay, avail0.producersInPlay, removalRate);
      playRampGreedy(turn, handCards, landsInPlay, avail1.producersInPlay, avail1.totalMana, avail1.colorSources);

      const avail2 = computeAvailableMana(turn, landsInPlay, avail1.producersInPlay, removalRate);

      // check castability for all tracked spells
      for (const s of spells) {
        if (firstCast[s.id] <= maxTurn) continue;
        if (canPay(s.cost, { totalMana: avail2.totalMana, colorSources: avail2.colorSources })) {
          firstCast[s.id] = turn;
        }
      }
    }

    for (const s of spells) {
      const fc = firstCast[s.id];
      firstCastTurnSum[s.id] += fc;
      for (let t = 1; t <= maxTurn; t++) {
        if (fc <= t) castableByTurn[s.id][t - 1] += 1;
      }
    }
  }

  for (const s of spells) {
    for (let t = 0; t < maxTurn; t++) castableByTurn[s.id][t] /= iterations;
  }
  const avgCastTurn: Record<string, number> = {};
  for (const s of spells) avgCastTurn[s.id] = firstCastTurnSum[s.id] / iterations;

  const durationMs = performance.now() - t0;
  return { iterations, maxTurn, castableByTurn, avgCastTurn, durationMs };
}

self.onmessage = (ev: MessageEvent<SimRequest>) => {
  if (!ev.data || ev.data.type !== "RUN") return;
  const result = runSimulation(ev.data.payload);
  const msg: SimResponse = { type: "RESULT", payload: result };
  // @ts-ignore
  self.postMessage(msg);
};
