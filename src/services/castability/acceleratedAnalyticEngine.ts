/**
 * Accelerated Castability Engine v1.1
 *
 * Calculates castability probabilities with mana accelerators (dorks, rocks, rituals).
 * Uses disjoint scenarios approach (K=0,1,2 accelerators online) for O(1) performance.
 *
 * v1.1 Changes:
 * - Proper conditioning: P(colors|l) summed over all possible land counts
 * - Unified survival model: P_survive(n) = (1-r)^n with rockRemovalFactor
 * - Multi-mana lands as random variable (unconditionalMultiManaGroups)
 * - No magic numbers or hardcoded deck sizes
 * - ENHANCERs disabled in instant mode (simulation only)
 *
 * @version 1.1
 * @see docs/MANA_ACCELERATION_SYSTEM.md
 */

import type {
    AccelContext,
    AcceleratedCastabilityResult,
    CastabilityResult,
    DeckManaProfile,
    LandManaColor,
    ManaCost,
    ProducerInDeck
} from '../../types/manaProducers'
import { colorsFromMask, maskHasColor, netManaPerTurn } from '../../types/manaProducers'
import { Hypergeom, cardsSeenByTurn } from './hypergeom'

// =============================================================================
// CONSTANTS (no magic numbers in calculations)
// =============================================================================

/** Maximum producers to consider for K-disjoint (performance cap) */
const MAX_PRODUCER_CANDIDATES = 18

/** Default rock removal factor (rocks are ~30% as likely to be removed as creatures) */
const DEFAULT_ROCK_REMOVAL_FACTOR = 0.3

/** Minimum probability threshold for acceleration detection */
const DEFAULT_ACCELERATION_THRESHOLD = 0.05

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Clamp a value between 0 and 1
 */
function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

/**
 * Get color options that a producer can contribute for a spell cost
 */
function producerOptionsForCost(
  producesAny: boolean,
  producesMask: number,
  neededColors: LandManaColor[]
): LandManaColor[] {
  if (producesAny) return neededColors

  const opts: LandManaColor[] = []
  for (const c of neededColors) {
    if (maskHasColor(producesMask, c)) {
      opts.push(c)
    }
  }
  return opts
}

/**
 * Calculate survival probability using unified model
 *
 * P_survive(n) = (1 - r_effective)^n
 *
 * Where r_effective = r for creatures, r * rockRemovalFactor for artifacts
 */
function calculateSurvivalProbability(
  isCreature: boolean,
  exposureTurns: number,
  ctx: AccelContext
): number {
  if (exposureTurns <= 0) return 1

  const rEffective = isCreature
    ? ctx.removalRate
    : ctx.removalRate * (ctx.rockRemovalFactor ?? DEFAULT_ROCK_REMOVAL_FACTOR)

  return Math.pow(1 - rEffective, exposureTurns)
}

// =============================================================================
// BASE CASTABILITY (v1.1 - Sum over l)
// =============================================================================

/**
 * Calculate P(colors OK | l lands in hand)
 *
 * For each color c with Sᶜ sources and needᶜ pips:
 * P(pipᶜ OK | l) = P(Xᶜ >= needᶜ), where Xᶜ ~ Hypergeom(L, Sᶜ, l)
 *
 * Conservative approximation: P(colors OK | l) ≈ min_c P(Xᶜ >= needᶜ)
 */
function colorsOkGivenLands(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  landsInHand: number
): number {
  if (landsInHand <= 0) return 0

  const colors = Object.keys(spell.pips) as LandManaColor[]
  if (colors.length === 0) return 1 // Colorless spell

  let minP = 1
  for (const color of colors) {
    const need = spell.pips[color] ?? 0
    if (need <= 0) continue

    const sources = deck.landColorSources[color] ?? 0
    if (sources <= 0) {
      minP = 0
      break
    }

    // P(at least 'need' sources of color 'c' among 'landsInHand' lands)
    // Population = total lands (L), successes = sources for this color (Sᶜ)
    // Draws = lands in hand (l), need = pips required
    const p = hg.atLeast(deck.totalLands, sources, landsInHand, need)
    minP = Math.min(minP, p)

    if (minP === 0) break
  }

  return minP
}

/**
 * Calculate P(mana OK | l lands in hand) for unconditional multi-mana lands
 *
 * Without multi-mana lands: simply l >= MV
 * With multi-mana lands: sum over possible m multi-mana lands among l
 *
 * mana(l, m) = l + m * delta
 * P(mana OK | l) = Σₘ P(M=m | l) × 𝟙[l + m×Δ >= MV]
 */
function manaOkGivenLands(
  hg: Hypergeom,
  deck: DeckManaProfile,
  mvNeeded: number,
  landsInHand: number
): number {
  // Simple case: enough lands without multi-mana
  if (landsInHand >= mvNeeded) return 1
  if (landsInHand <= 0) return 0

  // No multi-mana lands configured
  if (!deck.unconditionalMultiMana || deck.unconditionalMultiMana.count <= 0) {
    return landsInHand >= mvNeeded ? 1 : 0
  }

  const { count: U, delta } = deck.unconditionalMultiMana

  // Sum over possible number of multi-mana lands in hand
  let sum = 0
  const maxM = Math.min(U, landsInHand)

  for (let m = 0; m <= maxM; m++) {
    // P(M = m multi-mana lands among l lands in hand)
    const pM = hg.pmf(deck.totalLands, U, landsInHand, m)
    if (pM <= 0) continue

    // Total mana = lands + bonus from multi-mana
    const totalMana = landsInHand + m * delta

    if (totalMana >= mvNeeded) {
      sum += pM
    }
  }

  return clamp01(sum)
}

/**
 * Compute base castability (lands only) - v1.1 rigorous version
 *
 * Proper conditioning: sum over all possible values of lands drawn
 *
 * P(castable at T) = Σₗ P(lands=l) × P(colors OK | l) × P(mana OK | l)
 *
 * P1 (legacy): P(colors OK | l=T) assuming perfect land drops
 * P2 (realistic): full sum above
 */
function computeBaseCastability(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext
): CastabilityResult {
  const cardsSeen = cardsSeenByTurn(turn, ctx.playDraw)

  // P1 "legacy" (perfect drops): colors given l=turn
  // This maintains UX compatibility with the original P1/P2 display
  const p1 = colorsOkGivenLands(hg, deck, spell, turn)

  // P2: Sum over all possible land counts
  let p2 = 0

  const maxLands = Math.min(deck.totalLands, cardsSeen)
  for (let l = 0; l <= maxLands; l++) {
    // P(exactly l lands in hand by turn T)
    const pL = hg.pmf(deck.deckSize, deck.totalLands, cardsSeen, l)
    if (pL <= 0) continue

    // P(have required colors among those l lands)
    const pColors = colorsOkGivenLands(hg, deck, spell, l)
    if (pColors <= 0) continue

    // P(have enough total mana from l lands)
    const pMana = manaOkGivenLands(hg, deck, spell.mv, l)
    if (pMana <= 0) continue

    p2 += pL * pColors * pMana
  }

  return { p1: clamp01(p1), p2: clamp01(p2) }
}

/**
 * Compute base castability for a producer's casting cost
 * Used to determine P(can cast producer by T_latest)
 */
function computeProducerCastability(
  hg: Hypergeom,
  deck: DeckManaProfile,
  producer: ProducerInDeck,
  turn: number,
  ctx: AccelContext
): number {
  const def = producer.def
  const mv = def.castCostGeneric + Object.values(def.castCostColors).reduce((a, b) => a + (b ?? 0), 0)

  const producerSpell: ManaCost = {
    mv,
    generic: def.castCostGeneric,
    pips: def.castCostColors
  }

  return computeBaseCastability(hg, deck, producerSpell, turn, ctx).p2
}

// =============================================================================
// PRODUCER ONLINE PROBABILITY
// =============================================================================

/**
 * Calculate probability of a producer being online by target turn
 *
 * P(online at T) = P(draw by T_latest) × P(castable at T_latest) × P(survive until T)
 *
 * Where T_latest = T - delay - 1 (must be cast with time to remove summoning sickness)
 */
export function producerOnlineProbByTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  producer: ProducerInDeck,
  turnTarget: number,
  ctx: AccelContext
): number {
  const def = producer.def

  // Skip ENHANCERs in instant mode - they require simulation
  if (def.type === 'ENHANCER') {
    return 0
  }

  // Latest turn we can cast to have it online by turnTarget
  const tLatest = turnTarget - def.delay - 1
  if (tLatest < 1) return 0

  const seenLatest = cardsSeenByTurn(tLatest, ctx.playDraw)

  // P(draw at least one copy by T_latest)
  const pDraw = hg.atLeastOneCopy(deck.deckSize, producer.copies, seenLatest)
  if (pDraw <= 0) return 0

  // P(can cast producer by T_latest) - uses new rigorous baseCastability
  const pCastable = computeProducerCastability(hg, deck, producer, tLatest, ctx)
  if (pCastable <= 0) return 0

  // P(survives from T_latest until turnTarget) - unified model
  const exposureTurns = turnTarget - tLatest
  const pSurvive = calculateSurvivalProbability(def.isCreature, exposureTurns, ctx)

  return clamp01(pDraw * pCastable * pSurvive)
}

// =============================================================================
// CASTABILITY WITH PRODUCERS ONLINE
// =============================================================================

/**
 * Find best P1 given a set of online producers
 * Brute-force assignment since k <= 2 means tiny search space
 */
function bestP1GivenOnlineProducers(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext,
  onlineProducers: ProducerInDeck[]
): number {
  const cardsSeen = cardsSeenByTurn(turn, ctx.playDraw)

  const neededColors = (Object.keys(spell.pips) as LandManaColor[])
    .filter((c) => (spell.pips[c] ?? 0) > 0)

  if (neededColors.length === 0) return 1

  // Base remaining pips
  const baseRemaining: Record<LandManaColor, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
  for (const c of neededColors) {
    baseRemaining[c] = spell.pips[c] ?? 0
  }

  // Filter to non-ENHANCER producers (ENHANCERs don't produce mana in instant mode)
  const manaProducers = onlineProducers.filter(p => p.def.type !== 'ENHANCER')

  if (manaProducers.length === 0) {
    // No producers, just use base land probability
    return colorsOkGivenLands(hg, deck, spell, turn)
  }

  // Each producer can cover at most 1 pip per turn
  const prodOptions: Array<(LandManaColor | null)[]> = manaProducers.map((p) => {
    const opts = producerOptionsForCost(p.def.producesAny, p.def.producesMask, neededColors)
    return [null, ...opts]
  })

  let best = 0

  function evalAssignment(assignment: Array<LandManaColor | null>) {
    const rem = { ...baseRemaining }
    for (const a of assignment) {
      if (a && rem[a] > 0) rem[a] -= 1
    }

    let minP = 1
    for (const c of neededColors) {
      const need = rem[c]
      if (need <= 0) continue
      const K = deck.landColorSources[c] ?? 0
      // Use turn as proxy for lands (P1 assumption)
      const p = hg.atLeast(deck.totalLands, K, turn, need)
      minP = Math.min(minP, p)
      if (minP === 0) break
    }
    best = Math.max(best, minP)
  }

  function dfs(i: number, assignment: Array<LandManaColor | null>) {
    if (i === manaProducers.length) {
      evalAssignment(assignment)
      return
    }
    for (const opt of prodOptions[i]) {
      assignment.push(opt)
      dfs(i + 1, assignment)
      assignment.pop()
    }
  }

  dfs(0, [])
  return best
}

/**
 * Calculate castability given a specific set of online producers
 * Uses v1.1 rigorous base castability with reduced spell cost
 */
function castabilityGivenOnlineSet(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext,
  onlineSet: ProducerInDeck[]
): CastabilityResult {
  // Filter out ENHANCERs (disabled in instant mode)
  const activeProducers = onlineSet.filter(p => p.def.type !== 'ENHANCER')

  // Calculate extra mana from online producers
  const extraMana = activeProducers.reduce((s, p) => s + netManaPerTurn(p.def), 0)
  const landsNeeded = Math.max(0, spell.mv - extraMana)

  if (landsNeeded > turn) return { p1: 0, p2: 0 }

  const cardsSeen = cardsSeenByTurn(turn, ctx.playDraw)

  // Create reduced spell for calculation
  const reducedSpell: ManaCost = {
    mv: landsNeeded,
    generic: Math.max(0, spell.generic - extraMana),
    pips: { ...spell.pips }
  }

  // Allocate producer colors to reduce pip requirements
  // (each producer can cover 1 pip of a color it produces)
  for (const producer of activeProducers) {
    const colors = colorsFromMask(producer.def.producesMask)
    for (const color of colors) {
      if (producer.def.producesAny || colors.includes(color)) {
        const current = reducedSpell.pips[color] ?? 0
        if (current > 0) {
          reducedSpell.pips[color] = current - 1
          break // One pip per producer
        }
      }
    }
  }

  // Best P1 considering producer color contributions
  const p1 = bestP1GivenOnlineProducers(hg, deck, spell, turn, ctx, activeProducers)

  // P2 = sum over possible land counts with reduced requirements
  let p2 = 0
  const maxLands = Math.min(deck.totalLands, cardsSeen)

  for (let l = 0; l <= maxLands; l++) {
    const pL = hg.pmf(deck.deckSize, deck.totalLands, cardsSeen, l)
    if (pL <= 0) continue

    const pColors = colorsOkGivenLands(hg, deck, reducedSpell, l)
    if (pColors <= 0) continue

    const pMana = manaOkGivenLands(hg, deck, landsNeeded, l)
    if (pMana <= 0) continue

    p2 += pL * pColors * pMana
  }

  return { p1: clamp01(p1), p2: clamp01(p2) }
}

// =============================================================================
// DISJOINT K=0/1/2 SCENARIOS
// =============================================================================

/**
 * Compute accelerated castability using disjoint scenarios (K=0,1,2)
 *
 * P(cast at T) = Σₖ₌₀² P(K=k) × P(cast at T | K=k)
 *
 * Where K = number of producers online and useful (truncated to 2 for performance)
 */
export function computeAcceleratedCastabilityAtTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  kMax: 0 | 1 | 2 = 2
): CastabilityResult {
  // Filter to producers with copies and non-zero online probability
  const candidatesRaw = producers
    .filter((pd) => pd.copies > 0 && pd.def.type !== 'ENHANCER') // Skip ENHANCERs
    .map((pd) => ({
      pd,
      pOnline: producerOnlineProbByTurn(hg, deck, pd, turn, ctx),
      netMana: netManaPerTurn(pd.def)
    }))
    .filter((x) => x.pOnline > 0 && x.netMana > 0)

  // No producers or kMax=0: just return base
  if (candidatesRaw.length === 0 || kMax === 0) {
    return computeBaseCastability(hg, deck, spell, turn, ctx)
  }

  // Sort by impact (pOnline * net mana) and cap for performance
  candidatesRaw.sort((a, b) => (b.pOnline * b.netMana) - (a.pOnline * a.netMana))
  const candidates = candidatesRaw.slice(0, MAX_PRODUCER_CANDIDATES)

  const probs = candidates.map((x) => x.pOnline)
  const list = candidates.map((x) => x.pd)

  // P(K=0) = Π(1 - pᵢ)
  let p0 = 1
  for (const pi of probs) {
    p0 *= (1 - pi)
  }
  p0 = clamp01(p0)

  // P(K=1) = Σⱼ pⱼ × Π_{i≠j}(1 - pᵢ)
  // Simplified: wⱼ = pⱼ × p0 / (1 - pⱼ)
  const w1: number[] = []
  let p1Sum = 0
  for (let i = 0; i < probs.length; i++) {
    const pi = probs[i]
    const wi = pi >= 1 ? 0 : (pi * p0) / (1 - pi)
    w1.push(wi)
    p1Sum += wi
  }
  p1Sum = clamp01(p1Sum)

  // P(K≥2) = 1 - P(K=0) - P(K=1), truncated to P(K=2)
  let p2Sum = 0
  if (kMax >= 2) {
    p2Sum = clamp01(1 - p0 - p1Sum)
  }

  // === Scenario K=0: no producers online ===
  const k0 = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [])
  let outP1 = p0 * k0.p1
  let outP2 = p0 * k0.p2

  // === Scenario K=1: exactly one producer online ===
  if (kMax >= 1 && p1Sum > 0) {
    let accP1 = 0
    let accP2 = 0
    for (let i = 0; i < list.length; i++) {
      const wi = w1[i] / p1Sum
      if (wi <= 0) continue
      const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [list[i]])
      accP1 += wi * res.p1
      accP2 += wi * res.p2
    }
    outP1 += p1Sum * accP1
    outP2 += p1Sum * accP2
  }

  // === Scenario K=2: two producers online ===
  if (kMax >= 2 && p2Sum > 0 && list.length >= 2) {
    let sumPairs = 0
    const pairWeights: Array<{ i: number; j: number; w: number }> = []

    for (let i = 0; i < probs.length; i++) {
      const pi = probs[i]
      if (pi <= 0 || pi >= 1) continue
      for (let j = i + 1; j < probs.length; j++) {
        const pj = probs[j]
        if (pj <= 0 || pj >= 1) continue
        const w = (pi * pj * p0) / ((1 - pi) * (1 - pj))
        if (w > 0) {
          pairWeights.push({ i, j, w })
          sumPairs += w
        }
      }
    }

    if (sumPairs > 0) {
      let accP1 = 0
      let accP2 = 0
      for (const pw of pairWeights) {
        const wNorm = pw.w / sumPairs
        const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [list[pw.i], list[pw.j]])
        accP1 += wNorm * res.p1
        accP2 += wNorm * res.p2
      }
      outP1 += p2Sum * accP1
      outP2 += p2Sum * accP2
    }
  }

  return {
    p1: clamp01(outP1),
    p2: clamp01(outP2)
  }
}

// =============================================================================
// ACCELERATION DETECTION
// =============================================================================

/**
 * Find the earliest turn where accelerated casting becomes viable
 *
 * @param threshold - Minimum probability to consider viable (default 5%)
 */
export function findAcceleratedTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  threshold: number = DEFAULT_ACCELERATION_THRESHOLD
): { acceleratedTurn: number | null; withAccelAtTurn?: CastabilityResult } {
  const naturalTurn = spell.mv

  for (let t = 1; t < naturalTurn; t++) {
    const res = computeAcceleratedCastabilityAtTurn(hg, deck, spell, t, producers, ctx, 2)
    if (res.p2 >= threshold) {
      return { acceleratedTurn: t, withAccelAtTurn: res }
    }
  }

  return { acceleratedTurn: null }
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Main entry point: compute full accelerated castability result
 */
export function computeAcceleratedCastability(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext
): AcceleratedCastabilityResult {
  const hg = new Hypergeom(Math.max(200, deck.deckSize + 20))

  const naturalTurn = spell.mv
  const base = computeBaseCastability(hg, deck, spell, naturalTurn, ctx)
  const withAcceleration = computeAcceleratedCastabilityAtTurn(
    hg,
    deck,
    spell,
    naturalTurn,
    producers,
    ctx,
    2
  )

  const accel = findAcceleratedTurn(hg, deck, spell, producers, ctx, DEFAULT_ACCELERATION_THRESHOLD)

  // Key accelerators: top by marginal impact (excluding ENHANCERs)
  const scored = producers
    .filter(pd => pd.def.type !== 'ENHANCER')
    .map((pd) => {
      const pOnline = producerOnlineProbByTurn(hg, deck, pd, naturalTurn, ctx)
      return { name: pd.def.name, score: pOnline * netManaPerTurn(pd.def) }
    })
    .sort((a, b) => b.score - a.score)

  return {
    base,
    withAcceleration,
    accelerationImpact: withAcceleration.p2 - base.p2,
    acceleratedTurn: accel.acceleratedTurn,
    keyAccelerators: scored.slice(0, 3).map((x) => x.name)
  }
}

/**
 * Compute base castability at a specific turn (lands only, no acceleration)
 * Exported for direct use in UI components
 */
export function computeBaseCastabilityAtTurn(
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext
): CastabilityResult {
  const hg = new Hypergeom(Math.max(200, deck.deckSize + 20))
  return computeBaseCastability(hg, deck, spell, turn, ctx)
}

/**
 * Compute castability for multiple turns (for charts/visualization)
 */
export function computeCastabilityByTurn(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  maxTurn: number = 7
): Array<{ turn: number; base: CastabilityResult; withAcceleration: CastabilityResult }> {
  const hg = new Hypergeom(Math.max(200, deck.deckSize + 20))
  const results: Array<{ turn: number; base: CastabilityResult; withAcceleration: CastabilityResult }> = []

  for (let turn = 1; turn <= maxTurn; turn++) {
    const base = computeBaseCastability(hg, deck, spell, turn, ctx)
    const withAcceleration = computeAcceleratedCastabilityAtTurn(hg, deck, spell, turn, producers, ctx, 2)
    results.push({ turn, base, withAcceleration })
  }

  return results
}
