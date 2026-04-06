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
  ProducerManaCost,
  ProducerInDeck,
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
 * Calculate total bonus mana from ENHANCERs in an online set.
 *
 * Each ENHANCER adds enhancerBonus per compatible producer in the set.
 * ENHANCERs also enhance other ENHANCERs (their earthbent land-creatures
 * are creatures that tap for mana).
 *
 * Examples with Badgermole Cub (enhancerBonus=1, enhancesTypes=['DORK']):
 *   [Cub]              → 0 bonus (no other producers to enhance)
 *   [Cub, Elves]       → 1 bonus (Cub enhances Elves)
 *   [Cub, Cub]         → 2 bonus (each Cub enhances the other's earthbend)
 *   [Cub, Elves, Birds] → 2 bonus (Cub enhances both dorks)
 */
function enhancerBonusMana(onlineSet: ProducerInDeck[]): number {
  let bonus = 0
  for (const p of onlineSet) {
    if (p.def.type !== 'ENHANCER' || !p.def.enhancerBonus) continue
    const enhTypes = p.def.enhancesTypes ?? ['DORK']
    const compatibles = onlineSet.filter((other) => {
      if (other === p) return false
      // Direct type match (e.g., DORK)
      if (enhTypes.includes(other.def.type)) return true
      // Other ENHANCERs that are creatures count as creature producers
      // (their earthbent land-creature taps for mana)
      if (other.def.type === 'ENHANCER' && other.def.isCreature) return true
      return false
    })
    bonus += p.def.enhancerBonus * compatibles.length
  }
  return bonus
}

/**
 * Build virtual producer entries for ENHANCER bonus color coverage.
 *
 * For the P1 color-assignment DFS, each enhancer bonus adds a virtual
 * "producer slot" that can cover one pip of the bonus color.
 */
function buildEnhancerVirtualSlots(
  onlineSet: ProducerInDeck[]
): Array<{ producesAny: boolean; producesMask: number }> {
  const slots: Array<{ producesAny: boolean; producesMask: number }> = []
  for (const p of onlineSet) {
    if (p.def.type !== 'ENHANCER' || !p.def.enhancerBonus) continue
    const enhTypes = p.def.enhancesTypes ?? ['DORK']
    const bonusMask = p.def.enhancerBonusMask ?? p.def.producesMask
    const compatibles = onlineSet.filter((other) => {
      if (other === p) return false
      if (enhTypes.includes(other.def.type)) return true
      if (other.def.type === 'ENHANCER' && other.def.isCreature) return true
      return false
    })
    for (let i = 0; i < compatibles.length; i++) {
      slots.push({ producesAny: false, producesMask: bonusMask })
    }
  }
  return slots
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
  spell: ProducerManaCost,
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
  spell: ProducerManaCost,
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
  const mv =
    def.castCostGeneric + Object.values(def.castCostColors).reduce((a, b) => a + (b ?? 0), 0)

  const producerSpell: ProducerManaCost = {
    mv,
    generic: def.castCostGeneric,
    pips: def.castCostColors,
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

  // ENHANCERs are treated like creatures for draw/cast/survival probability.
  // Their synergistic mana contribution is calculated in castabilityGivenOnlineSet.

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
  spell: ProducerManaCost,
  turn: number,
  ctx: AccelContext,
  onlineProducers: ProducerInDeck[]
): number {
  const cardsSeen = cardsSeenByTurn(turn, ctx.playDraw)

  const neededColors = (Object.keys(spell.pips) as LandManaColor[]).filter(
    (c) => (spell.pips[c] ?? 0) > 0
  )

  if (neededColors.length === 0) return 1

  // Base remaining pips
  const baseRemaining: Record<LandManaColor, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
  for (const c of neededColors) {
    baseRemaining[c] = spell.pips[c] ?? 0
  }

  // All producers (including ENHANCERs) contribute base color coverage
  if (onlineProducers.length === 0) {
    return colorsOkGivenLands(hg, deck, spell, turn)
  }

  // Each producer can cover at most 1 pip per turn from its base production
  const prodOptions: Array<(LandManaColor | null)[]> = onlineProducers.map((p) => {
    const opts = producerOptionsForCost(p.def.producesAny, p.def.producesMask, neededColors)
    return [null, ...opts]
  })

  // Add virtual slots for ENHANCER bonus colors (one G pip per enhanced dork)
  const virtualSlots = buildEnhancerVirtualSlots(onlineProducers)
  for (const slot of virtualSlots) {
    const opts = producerOptionsForCost(slot.producesAny, slot.producesMask, neededColors)
    if (opts.length > 0) {
      prodOptions.push([null, ...opts])
    }
  }

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
    if (i === prodOptions.length) {
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
  spell: ProducerManaCost,
  turn: number,
  ctx: AccelContext,
  onlineSet: ProducerInDeck[]
): CastabilityResult {
  // Calculate extra mana: base production + ENHANCER synergy bonus
  const baseMana = onlineSet.reduce((s, p) => s + netManaPerTurn(p.def), 0)
  const bonusMana = enhancerBonusMana(onlineSet)
  const extraMana = baseMana + bonusMana
  const landsNeeded = Math.max(0, spell.mv - extraMana)

  if (landsNeeded > turn) return { p1: 0, p2: 0 }

  const cardsSeen = cardsSeenByTurn(turn, ctx.playDraw)

  // Create reduced spell for calculation
  const reducedSpell: ProducerManaCost = {
    mv: landsNeeded,
    generic: Math.max(0, spell.generic - extraMana),
    pips: { ...spell.pips },
  }

  // Allocate base producer colors to reduce pip requirements
  // (each producer can cover 1 pip of a color it produces)
  for (const producer of onlineSet) {
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

  // Allocate ENHANCER bonus colors (one per enhanced compatible producer)
  const virtualSlots = buildEnhancerVirtualSlots(onlineSet)
  for (const slot of virtualSlots) {
    const bonusColors = colorsFromMask(slot.producesMask)
    for (const color of bonusColors) {
      const current = reducedSpell.pips[color] ?? 0
      if (current > 0) {
        reducedSpell.pips[color] = current - 1
        break
      }
    }
  }

  // Best P1 considering producer color contributions (including enhancer synergies)
  const p1 = bestP1GivenOnlineProducers(hg, deck, spell, turn, ctx, onlineSet)

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
 * Compute accelerated castability using disjoint scenarios (K=0,1,2,3)
 *
 * P(cast at T) = Σₖ₌₀³ P(K=k) × P(cast at T | K=k)
 *
 * Where K = number of producers online and useful.
 * K=3 is critical for ENHANCER synergies (e.g., Badgermole Cub + 2 dorks = 5G).
 * With n distinct producer types, C(n,3) triples is typically < 100 — negligible cost.
 */
export function computeAcceleratedCastabilityAtTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ProducerManaCost,
  turn: number,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  kMax: 0 | 1 | 2 | 3 = 3
): CastabilityResult {
  // Filter to producers with copies and non-zero online probability
  // ENHANCERs are included: their base netMana > 0, and their synergy bonus
  // is calculated dynamically in castabilityGivenOnlineSet
  const candidatesRaw = producers
    .filter((pd) => pd.copies > 0)
    .map((pd) => ({
      pd,
      pOnline: producerOnlineProbByTurn(hg, deck, pd, turn, ctx),
      netMana: netManaPerTurn(pd.def),
    }))
    .filter((x) => x.pOnline > 0 && x.netMana > 0)

  // No producers or kMax=0: just return base
  if (candidatesRaw.length === 0 || kMax === 0) {
    return computeBaseCastability(hg, deck, spell, turn, ctx)
  }

  // Sort by impact (pOnline * net mana) and cap for performance
  candidatesRaw.sort((a, b) => b.pOnline * b.netMana - a.pOnline * a.netMana)
  const candidates = candidatesRaw.slice(0, MAX_PRODUCER_CANDIDATES)

  const probs = candidates.map((x) => x.pOnline)
  const list = candidates.map((x) => x.pd)

  // P(K=0) = Π(1 - pᵢ)
  let p0 = 1
  for (const pi of probs) {
    p0 *= 1 - pi
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

  // === Compute pair weights (needed for both K=2 and K=3) ===
  let sumPairsExact = 0
  const pairWeights: Array<{ i: number; j: number; w: number }> = []

  if (kMax >= 2 && list.length >= 2) {
    for (let i = 0; i < probs.length; i++) {
      const pi = probs[i]
      if (pi <= 0 || pi >= 1) continue
      for (let j = i + 1; j < probs.length; j++) {
        const pj = probs[j]
        if (pj <= 0 || pj >= 1) continue
        const w = (pi * pj * p0) / ((1 - pi) * (1 - pj))
        if (w > 0) {
          pairWeights.push({ i, j, w })
          sumPairsExact += w
        }
      }
    }
  }

  // === Compute triple weights (for K=3) ===
  let sumTriplesExact = 0
  const tripleWeights: Array<{ i: number; j: number; k: number; w: number }> = []

  if (kMax >= 3 && list.length >= 3) {
    for (let i = 0; i < probs.length; i++) {
      const pi = probs[i]
      if (pi <= 0 || pi >= 1) continue
      for (let j = i + 1; j < probs.length; j++) {
        const pj = probs[j]
        if (pj <= 0 || pj >= 1) continue
        for (let k = j + 1; k < probs.length; k++) {
          const pk = probs[k]
          if (pk <= 0 || pk >= 1) continue
          const w = (pi * pj * pk * p0) / ((1 - pi) * (1 - pj) * (1 - pk))
          if (w > 0) {
            tripleWeights.push({ i, j, k, w })
            sumTriplesExact += w
          }
        }
      }
    }
  }

  // === Assign probability mass to each K scenario ===
  // P(K≥2) = 1 - P(K=0) - P(K=1)
  const pKGe2 = clamp01(1 - p0 - p1Sum)

  let p2Weight: number
  let p3Weight: number

  if (kMax >= 3 && sumTriplesExact > 0) {
    // Split P(K≥2) into exact K=2 and K≥3
    // P(K=2 exact) = sumPairsExact, P(K≥3) = remainder
    p2Weight = clamp01(Math.min(sumPairsExact, pKGe2))
    p3Weight = clamp01(pKGe2 - p2Weight)
  } else {
    // Fallback: all P(K≥2) goes to K=2 (original behavior)
    p2Weight = pKGe2
    p3Weight = 0
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

  // === Scenario K=2: exactly two producers online ===
  if (kMax >= 2 && p2Weight > 0 && sumPairsExact > 0) {
    let accP1 = 0
    let accP2 = 0
    for (const pw of pairWeights) {
      const wNorm = pw.w / sumPairsExact
      const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [list[pw.i], list[pw.j]])
      accP1 += wNorm * res.p1
      accP2 += wNorm * res.p2
    }
    outP1 += p2Weight * accP1
    outP2 += p2Weight * accP2
  }

  // === Scenario K=3: three producers online ===
  if (kMax >= 3 && p3Weight > 0 && sumTriplesExact > 0) {
    let accP1 = 0
    let accP2 = 0
    for (const tw of tripleWeights) {
      const wNorm = tw.w / sumTriplesExact
      const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [
        list[tw.i],
        list[tw.j],
        list[tw.k],
      ])
      accP1 += wNorm * res.p1
      accP2 += wNorm * res.p2
    }
    outP1 += p3Weight * accP1
    outP2 += p3Weight * accP2
  }

  return {
    p1: clamp01(outP1),
    p2: clamp01(outP2),
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
  spell: ProducerManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  threshold: number = DEFAULT_ACCELERATION_THRESHOLD
): { acceleratedTurn: number | null; withAccelAtTurn?: CastabilityResult } {
  const naturalTurn = spell.mv

  for (let t = 1; t < naturalTurn; t++) {
    const res = computeAcceleratedCastabilityAtTurn(hg, deck, spell, t, producers, ctx, 3)
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
  spell: ProducerManaCost,
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
    3
  )

  const accel = findAcceleratedTurn(hg, deck, spell, producers, ctx, DEFAULT_ACCELERATION_THRESHOLD)

  // Key accelerators: top by marginal impact
  // For ENHANCERs, estimate effective mana = base + bonus * avg dork co-online probability
  const dorkPOnlineSum = producers
    .filter((pd) => pd.def.type === 'DORK' && pd.copies > 0)
    .reduce((s, pd) => s + producerOnlineProbByTurn(hg, deck, pd, naturalTurn, ctx), 0)

  const scored = producers
    .map((pd) => {
      const pOnline = producerOnlineProbByTurn(hg, deck, pd, naturalTurn, ctx)
      let effectiveMana = netManaPerTurn(pd.def)
      if (pd.def.type === 'ENHANCER' && pd.def.enhancerBonus) {
        // Expected bonus = enhancerBonus × expected number of co-online dorks
        effectiveMana += pd.def.enhancerBonus * dorkPOnlineSum
      }
      return { name: pd.def.name, score: pOnline * effectiveMana }
    })
    .sort((a, b) => b.score - a.score)

  return {
    base,
    withAcceleration,
    accelerationImpact: withAcceleration.p2 - base.p2,
    acceleratedTurn: accel.acceleratedTurn,
    keyAccelerators: scored.slice(0, 3).map((x) => x.name),
  }
}

/**
 * Compute base castability at a specific turn (lands only, no acceleration)
 * Exported for direct use in UI components
 */
export function computeBaseCastabilityAtTurn(
  deck: DeckManaProfile,
  spell: ProducerManaCost,
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
  spell: ProducerManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  maxTurn: number = 7
): Array<{ turn: number; base: CastabilityResult; withAcceleration: CastabilityResult }> {
  const hg = new Hypergeom(Math.max(200, deck.deckSize + 20))
  const results: Array<{
    turn: number
    base: CastabilityResult
    withAcceleration: CastabilityResult
  }> = []

  for (let turn = 1; turn <= maxTurn; turn++) {
    const base = computeBaseCastability(hg, deck, spell, turn, ctx)
    const withAcceleration = computeAcceleratedCastabilityAtTurn(
      hg,
      deck,
      spell,
      turn,
      producers,
      ctx,
      3
    )
    results.push({ turn, base, withAcceleration })
  }

  return results
}
