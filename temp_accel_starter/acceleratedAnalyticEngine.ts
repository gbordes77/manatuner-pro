// src/castability/acceleratedAnalyticEngine.ts
import { Hypergeom, cardsSeenByTurn } from "./hypergeom";
import { COLOR, ColorLetter, ColorMask, ManaCost, DeckManaProfile, ProducerInDeck, AccelContext, CastabilityResult, AcceleratedCastabilityResult } from "./types";

function colorMaskFromLetters(letters: ColorLetter[]): ColorMask {
  return letters.reduce((m, c) => m | COLOR[c], 0);
}

export function parseProducerJsonEntry(name: string, raw: any): ProducerInDeck {
  const producesMask = raw.producesAny ? (COLOR.W|COLOR.U|COLOR.B|COLOR.R|COLOR.G|COLOR.C) : colorMaskFromLetters(raw.produces ?? []);
  return {
    def: {
      name,
      type: raw.type,
      castCostGeneric: raw.castCostGeneric ?? 0,
      castCostColors: raw.castCostColors ?? {},
      delay: raw.delay ?? 0,
      isCreature: !!raw.isCreature,
      producesAmount: raw.producesAmount ?? 1,
      activationTax: raw.activationTax ?? 0,
      producesMask,
      producesAny: !!raw.producesAny,
      oneShot: !!raw.oneShot,
      survivalBase: raw.survivalBase,
    },
    copies: raw.copies ?? 0,
  };
}

function sumPips(pips: ManaCost["pips"]): number {
  let s = 0;
  for (const k of Object.keys(pips) as ColorLetter[]) s += pips[k] ?? 0;
  return s;
}

function popcountMask(mask: number): number {
  let x = mask >>> 0, c = 0;
  while (x) { x &= (x - 1) >>> 0; c++; }
  return c;
}

function producerOptionsForCost(producesAny: boolean, producesMask: ColorMask, neededColors: ColorLetter[]): ColorLetter[] {
  if (producesAny) return neededColors;
  const opts: ColorLetter[] = [];
  for (const c of neededColors) {
    if ((producesMask & COLOR[c]) !== 0) opts.push(c);
  }
  return opts;
}

// Conservative "can cast this cost by turn" estimate using only lands.
// This matches ManaTuner's general approach: hypergeom on sources in seen cards.
function estimateCanCastCostByTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  costGeneric: number,
  costColors: Partial<Record<ColorLetter, number>>,
  turn: number,
  ctx: AccelContext
): number {
  const seen = cardsSeenByTurn(turn, ctx.playDraw);

  const colorLetters = Object.keys(costColors) as ColorLetter[];
  const pColor = colorLetters.map((cl) => {
    const need = costColors[cl] ?? 0;
    if (need <= 0) return 1;
    const K = deck.landColorSources[cl] ?? 0;
    return hg.atLeast(deck.deckSize, K, seen, need);
  });

  const totalNeededMana = costGeneric + colorLetters.reduce((a, cl) => a + (costColors[cl] ?? 0), 0);
  const pLands = hg.atLeast(deck.deckSize, deck.totalLands, seen, totalNeededMana);

  const pMin = Math.min(pLands, ...pColor);
  return Math.max(0, Math.min(1, pMin));
}

export function producerOnlineProbByTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  producer: ProducerInDeck,
  turnTarget: number,
  ctx: AccelContext
): number {
  const def = producer.def;
  const tLatest = turnTarget - def.delay - 1;
  if (tLatest < 1) return 0;
  const seenLatest = cardsSeenByTurn(tLatest, ctx.playDraw);

  const pDraw = hg.atLeastOneCopy(deck.deckSize, producer.copies, seenLatest);

  const pCastable = estimateCanCastCostByTurn(hg, deck, def.castCostGeneric, def.castCostColors, tLatest, ctx);

  const exposure = Math.max(0, turnTarget - tLatest);
  const pSurvive = def.isCreature
    ? Math.pow(1 - ctx.removalRate, exposure)
    : (def.survivalBase ?? ctx.defaultRockSurvival);

  const p = pDraw * pCastable * pSurvive;
  return Math.max(0, Math.min(1, p));
}

function computeBaseCastability(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext
): CastabilityResult {
  const seen = cardsSeenByTurn(turn, ctx.playDraw);

  // P1: for each required color, have at least that many sources among seen cards
  const colors = Object.keys(spell.pips) as ColorLetter[];
  const pColors = colors.map((cl) => {
    const need = spell.pips[cl] ?? 0;
    if (need <= 0) return 1;
    const K = deck.landColorSources[cl] ?? 0;
    return hg.atLeast(deck.deckSize, K, seen, need);
  });
  const p1 = Math.min(...pColors, 1);

  // P2: multiply by probability to have enough lands to make land drops (>= turn)
  const pLandsEnough = hg.atLeast(deck.deckSize, deck.totalLands, seen, turn);
  const p2 = p1 * pLandsEnough;

  return { p1, p2 };
}

// Best allocation of <=2 online producers to cover colored pips.
// We brute-force assignment because k<=2 -> tiny search.
function bestP1GivenOnlineProducers(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext,
  onlineProducers: ProducerInDeck[]
): number {
  const seen = cardsSeenByTurn(turn, ctx.playDraw);

  const neededColors = (Object.keys(spell.pips) as ColorLetter[]).filter((c) => (spell.pips[c] ?? 0) > 0);
  if (neededColors.length === 0) return 1;

  const baseRemaining: Record<ColorLetter, number> = { W:0, U:0, B:0, R:0, G:0, C:0 };
  for (const c of neededColors) baseRemaining[c] = spell.pips[c] ?? 0;

  // each producer can cover at most 1 pip per turn (safe assumption for castability)
  const prodOptions: Array<(ColorLetter | null)[]> = onlineProducers.map((p) => {
    const opts = producerOptionsForCost(p.def.producesAny, p.def.producesMask, neededColors);
    // null = do not allocate (maybe only provides C or irrelevant colors)
    return [null, ...opts];
  });

  let best = 0;

  function evalAssignment(assignment: Array<ColorLetter | null>) {
    const rem: Record<ColorLetter, number> = { ...baseRemaining };
    for (const a of assignment) {
      if (a && rem[a] > 0) rem[a] -= 1;
    }

    let minP = 1;
    for (const c of neededColors) {
      const need = rem[c];
      if (need <= 0) continue;
      const K = deck.landColorSources[c] ?? 0;
      const p = hg.atLeast(deck.deckSize, K, seen, need);
      minP = Math.min(minP, p);
      if (minP === 0) break;
    }
    best = Math.max(best, minP);
  }

  function dfs(i: number, assignment: Array<ColorLetter | null>) {
    if (i === onlineProducers.length) {
      evalAssignment(assignment);
      return;
    }
    for (const opt of prodOptions[i]) {
      assignment.push(opt);
      dfs(i + 1, assignment);
      assignment.pop();
    }
  }

  dfs(0, []);
  return best;
}

function netPerTurn(p: ProducerInDeck): number {
  return Math.max(0, (p.def.producesAmount ?? 0) - (p.def.activationTax ?? 0));
}

function castabilityGivenOnlineSet(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext,
  onlineSet: ProducerInDeck[]
): CastabilityResult {
  const extraMana = onlineSet.reduce((s, p) => s + netPerTurn(p), 0);

  // mana constraint: need total mana >= MV by turn, so lands needed can drop by extraMana
  const landsNeeded = Math.max(0, spell.mv - extraMana);
  if (landsNeeded > turn) return { p1: 0, p2: 0 };

  const seen = cardsSeenByTurn(turn, ctx.playDraw);

  const p1 = bestP1GivenOnlineProducers(hg, deck, spell, turn, ctx, onlineSet);

  // P(like P2) = p1 * P(lands >= landsNeeded)
  const pLandsEnough = hg.atLeast(deck.deckSize, deck.totalLands, seen, landsNeeded);
  const p2 = p1 * pLandsEnough;

  return { p1, p2 };
}

// Approx. disjoint scenario calculation for K=0,1,2 online useful producers.
// Independence approximation: online events independent across producers.
export function computeAcceleratedCastabilityAtTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  kMax: 0 | 1 | 2 = 2
): CastabilityResult {
  // compute online probabilities for all producers that could matter by explained window
  const p = producers
    .filter((pd) => pd.copies > 0)
    .map((pd) => ({ pd, pOnline: producerOnlineProbByTurn(hg, deck, pd, turn, ctx) }))
    .filter((x) => x.pOnline > 0);

  if (p.length === 0 || kMax === 0) return computeBaseCastability(hg, deck, spell, turn, ctx);

  // For speed, keep only the most relevant producers (highest pOnline * netPerTurn)
  p.sort((a, b) => (b.pOnline * netPerTurn(b.pd)) - (a.pOnline * netPerTurn(a.pd)));
  const candidates = p.slice(0, 18); // safe cap

  const probs = candidates.map((x) => x.pOnline);
  const list = candidates.map((x) => x.pd);

  // p0 = Π(1-pi)
  let p0 = 1;
  for (const pi of probs) p0 *= (1 - pi);
  p0 = Math.max(0, Math.min(1, p0));

  // weights for exactly-1: wi = pi * Π(1-pj for j!=i) = pi * p0 / (1-pi)
  const w1: number[] = [];
  let p1 = 0;
  for (let i = 0; i < probs.length; i++) {
    const pi = probs[i];
    const wi = (pi >= 1) ? 0 : (pi * p0) / (1 - pi);
    w1.push(wi);
    p1 += wi;
  }
  p1 = Math.max(0, Math.min(1, p1));

  let p2 = 0;
  if (kMax >= 2) {
    // approximate remainder as >=2
    p2 = Math.max(0, Math.min(1, 1 - p0 - p1));
  }

  // base (k=0): BUT base here means "no online producers", not the global base.
  const k0 = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, []);

  let outP1 = p0 * k0.p1;
  let outP2 = p0 * k0.p2;

  if (kMax >= 1 && p1 > 0) {
    let accP1 = 0, accP2 = 0;
    for (let i = 0; i < list.length; i++) {
      const wi = w1[i] / p1;
      const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [list[i]]);
      accP1 += wi * res.p1;
      accP2 += wi * res.p2;
    }
    outP1 += p1 * accP1;
    outP2 += p1 * accP2;
  }

  if (kMax >= 2 && p2 > 0 && list.length >= 2) {
    // pair weights (unnormalized): wij = pi*pj*Π(1-pk for k!=i,j) = pi*pj*p0/((1-pi)(1-pj))
    // then renormalize over all pairs for conditional distribution; scale by p2 (approx).
    let sumPairs = 0;
    const pairWeights: Array<{ i: number; j: number; w: number }> = [];

    for (let i = 0; i < probs.length; i++) {
      const pi = probs[i];
      if (pi <= 0 || pi >= 1) continue;
      for (let j = i + 1; j < probs.length; j++) {
        const pj = probs[j];
        if (pj <= 0 || pj >= 1) continue;
        const w = (pi * pj * p0) / ((1 - pi) * (1 - pj));
        if (w > 0) {
          pairWeights.push({ i, j, w });
          sumPairs += w;
        }
      }
    }

    if (sumPairs > 0) {
      let accP1 = 0, accP2 = 0;
      for (const pw of pairWeights) {
        const wNorm = pw.w / sumPairs;
        const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [list[pw.i], list[pw.j]]);
        accP1 += wNorm * res.p1;
        accP2 += wNorm * res.p2;
      }
      outP1 += p2 * accP1;
      outP2 += p2 * accP2;
    }
  }

  return { p1: Math.max(0, Math.min(1, outP1)), p2: Math.max(0, Math.min(1, outP2)) };
}

export function findAcceleratedTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  minProb: number = 0.05
): { acceleratedTurn: number | null; withAccelAtTurn?: CastabilityResult } {
  const naturalTurn = spell.mv; // "on curve" baseline (your current convention)
  for (let t = 1; t < naturalTurn; t++) {
    const res = computeAcceleratedCastabilityAtTurn(hg, deck, spell, t, producers, ctx, 2);
    if (res.p2 >= minProb) return { acceleratedTurn: t, withAccelAtTurn: res };
  }
  return { acceleratedTurn: null };
}

export function computeAcceleratedCastability(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext
): AcceleratedCastabilityResult {
  const hg = new Hypergeom(Math.max(200, deck.deckSize + 20));

  const naturalTurn = spell.mv;
  const base = computeBaseCastability(hg, deck, spell, naturalTurn, ctx);
  const withAcceleration = computeAcceleratedCastabilityAtTurn(hg, deck, spell, naturalTurn, producers, ctx, 2);

  const accel = findAcceleratedTurn(hg, deck, spell, producers, ctx, 0.05);

  // Key accelerators: top marginal pi*net
  const scored = producers.map((pd) => {
    const pOnline = producerOnlineProbByTurn(hg, deck, pd, naturalTurn, ctx);
    return { name: pd.def.name, score: pOnline * netPerTurn(pd) };
  }).sort((a, b) => b.score - a.score);

  return {
    base,
    withAcceleration,
    accelerationImpact: withAcceleration.p2 - base.p2,
    acceleratedTurn: accel.acceleratedTurn,
    keyAccelerators: scored.slice(0, 3).map((x) => x.name),
  };
}
