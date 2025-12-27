/**
 * Accelerated Castability Engine
 *
 * Calculates castability probabilities with mana accelerators (dorks, rocks, rituals).
 * Uses disjoint scenarios approach (K=0,1,2 accelerators online) for O(1) performance.
 *
 * @version 1.0
 * @see docs/EXPERT_ANALYSES.md
 */

import type {
    AccelContext,
    AcceleratedCastabilityResult,
    CastabilityResult,
    DeckManaProfile,
    LandManaColor,
    ManaCost,
    ManaProducerType,
    ProducerInDeck
} from '../../types/manaProducers'
import { colorsFromMask, maskHasColor, netManaPerTurn } from '../../types/manaProducers'
import { Hypergeom, cardsSeenByTurn } from './hypergeom'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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
 * Estimate probability of casting a cost by a turn using only lands
 */
function estimateCanCastCostByTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  costGeneric: number,
  costColors: Partial<Record<LandManaColor, number>>,
  turn: number,
  ctx: AccelContext
): number {
  const seen = cardsSeenByTurn(turn, ctx.playDraw)

  // Check each colored requirement
  const colorLetters = Object.keys(costColors) as LandManaColor[]
  const pColor = colorLetters.map((cl) => {
    const need = costColors[cl] ?? 0
    if (need <= 0) return 1
    const K = deck.landColorSources[cl] ?? 0
    return hg.atLeast(deck.deckSize, K, seen, need)
  })

  // Check total mana requirement
  const totalNeededMana = costGeneric + colorLetters.reduce((a, cl) => a + (costColors[cl] ?? 0), 0)
  const pLands = hg.atLeast(deck.deckSize, deck.totalLands, seen, totalNeededMana)

  // Minimum of all constraints
  const pMin = Math.min(pLands, ...pColor)
  return Math.max(0, Math.min(1, pMin))
}

/**
 * Calculate probability of a producer being online by target turn
 *
 * P(online) = P(draw) × P(castable) × P(survive)
 */
export function producerOnlineProbByTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  producer: ProducerInDeck,
  turnTarget: number,
  ctx: AccelContext
): number {
  const def = producer.def

  // Latest turn we can cast to have it online by turnTarget
  // Must account for delay (summoning sickness for dorks)
  const tLatest = turnTarget - def.delay - 1
  if (tLatest < 1) return 0

  const seenLatest = cardsSeenByTurn(tLatest, ctx.playDraw)

  // P(draw at least one copy)
  const pDraw = hg.atLeastOneCopy(deck.deckSize, producer.copies, seenLatest)

  // P(can cast it by tLatest)
  const pCastable = estimateCanCastCostByTurn(
    hg,
    deck,
    def.castCostGeneric,
    def.castCostColors,
    tLatest,
    ctx
  )

  // P(survives until turnTarget)
  const exposure = Math.max(0, turnTarget - tLatest)
  const pSurvive = def.isCreature
    ? Math.pow(1 - ctx.removalRate, exposure)
    : (def.survivalBase ?? ctx.defaultRockSurvival)

  const p = pDraw * pCastable * pSurvive
  return Math.max(0, Math.min(1, p))
}

/**
 * Compute base castability (lands only)
 *
 * Takes into account multi-mana lands via bonusManaFromLands and bonusColoredMana.
 * For example, with 4x Ancient Tomb (each producing 2C), we have +4 bonus colorless mana,
 * meaning we need fewer land drops to reach the same total mana.
 */
function computeBaseCastability(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext
): CastabilityResult {
  const seen = cardsSeenByTurn(turn, ctx.playDraw)

  // Calculate effective mana available considering multi-mana lands
  // bonusManaFromLands represents EXTRA mana beyond 1-per-land
  const bonusMana = deck.bonusManaFromLands ?? 0
  const bonusColored = deck.bonusColoredMana ?? {}

  // P1: for each required color, have at least that many sources
  // Bonus colored mana reduces the number of sources needed from lands
  const colors = Object.keys(spell.pips) as LandManaColor[]
  const pColors = colors.map((cl) => {
    const need = spell.pips[cl] ?? 0
    if (need <= 0) return 1

    // Reduce requirement by bonus colored mana from multi-mana lands
    const bonusForColor = bonusColored[cl] ?? 0
    const effectiveNeed = Math.max(0, need - bonusForColor)

    if (effectiveNeed <= 0) return 1

    const K = deck.landColorSources[cl] ?? 0
    return hg.atLeast(deck.deckSize, K, seen, effectiveNeed)
  })
  const p1 = Math.min(...pColors, 1)

  // P2: multiply by probability to have enough lands for land drops
  // With bonus mana, we need fewer lands to reach spell.mv mana
  // Example: spell costs 4, we have +2 bonus mana → need only 2 land drops
  const effectiveLandsNeeded = Math.max(1, turn - Math.floor(bonusMana / 2))
  const pLandsEnough = hg.atLeast(deck.deckSize, deck.totalLands, seen, effectiveLandsNeeded)
  const p2 = p1 * pLandsEnough

  return { p1, p2 }
}

/**
 * Find best P1 given a set of online producers
 * Brute-force assignment since k <= 2 means tiny search space
 *
 * @param bonusColorSources - Extra color sources from ENHANCERs (e.g., Badgermole Cub)
 */
function bestP1GivenOnlineProducers(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext,
  onlineProducers: ProducerInDeck[],
  bonusColorSources: Partial<Record<LandManaColor, number>> = {}
): number {
  const seen = cardsSeenByTurn(turn, ctx.playDraw)

  const neededColors = (Object.keys(spell.pips) as LandManaColor[])
    .filter((c) => (spell.pips[c] ?? 0) > 0)

  if (neededColors.length === 0) return 1

  // Base remaining pips after producers contribute
  // First, subtract bonus color sources from enhancers
  const baseRemaining: Record<LandManaColor, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
  for (const c of neededColors) {
    const needed = spell.pips[c] ?? 0
    const bonusFromEnhancers = bonusColorSources[c] ?? 0
    baseRemaining[c] = Math.max(0, needed - bonusFromEnhancers)
  }

  // Filter to non-enhancer producers (enhancers don't produce mana directly)
  const manaProducers = onlineProducers.filter(p => p.def.type !== 'ENHANCER')

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
      const p = hg.atLeast(deck.deckSize, K, seen, need)
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
 * Calculate enhanced mana production considering ENHANCERs like Badgermole Cub
 *
 * ENHANCERs add bonus mana when other dorks tap for mana.
 * e.g., Badgermole Cub: "Whenever you tap a creature for mana, add an additional {G}"
 *
 * @param onlineSet - Set of producers that are online
 * @returns Object with total extra mana and bonus color sources
 */
function calculateEnhancedManaProduction(
  onlineSet: ProducerInDeck[]
): { extraMana: number; bonusColorSources: Partial<Record<LandManaColor, number>> } {
  // Separate enhancers from regular producers
  const enhancers = onlineSet.filter(p => p.def.type === 'ENHANCER')
  const regularProducers = onlineSet.filter(p => p.def.type !== 'ENHANCER')

  // Base mana from regular producers
  let extraMana = regularProducers.reduce((s, p) => s + netManaPerTurn(p.def), 0)

  // Bonus color sources from enhancers
  const bonusColorSources: Partial<Record<LandManaColor, number>> = {}

  // Count dorks that can be enhanced
  const enhanceableDorks = regularProducers.filter(p => {
    // Check if any enhancer can enhance this producer type
    return enhancers.some(e => {
      const enhancesTypes = e.def.enhancesTypes ?? ['DORK']
      return enhancesTypes.includes(p.def.type as ManaProducerType)
    })
  })

  // For each enhancer, calculate bonus mana
  for (const enhancer of enhancers) {
    const enhancesTypes = enhancer.def.enhancesTypes ?? ['DORK']
    const bonus = enhancer.def.enhancerBonus ?? 0
    const bonusMask = enhancer.def.enhancerBonusMask ?? 0

    if (bonus <= 0 || bonusMask === 0) continue

    // Count how many producers this enhancer boosts
    const boostedCount = regularProducers.filter(p =>
      enhancesTypes.includes(p.def.type as ManaProducerType)
    ).length

    // Add bonus mana (bonus per dork that taps)
    extraMana += bonus * boostedCount

    // Track bonus color sources for P1 calculation
    const bonusColors = colorsFromMask(bonusMask)
    for (const color of bonusColors) {
      bonusColorSources[color] = (bonusColorSources[color] ?? 0) + boostedCount
    }
  }

  return { extraMana, bonusColorSources }
}

/**
 * Calculate castability given a specific set of online producers
 */
function castabilityGivenOnlineSet(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext,
  onlineSet: ProducerInDeck[]
): CastabilityResult {
  // Calculate enhanced mana production (includes ENHANCER bonuses)
  const { extraMana, bonusColorSources } = calculateEnhancedManaProduction(onlineSet)
  const landsNeeded = Math.max(0, spell.mv - extraMana)

  if (landsNeeded > turn) return { p1: 0, p2: 0 }

  const seen = cardsSeenByTurn(turn, ctx.playDraw)

  // Best P1 considering producer color contributions (including enhancer bonuses)
  const p1 = bestP1GivenOnlineProducers(hg, deck, spell, turn, ctx, onlineSet, bonusColorSources)

  // P2 = P1 * P(enough lands)
  const pLandsEnough = hg.atLeast(deck.deckSize, deck.totalLands, seen, landsNeeded)
  const p2 = p1 * pLandsEnough

  return { p1, p2 }
}

/**
 * Compute accelerated castability using disjoint scenarios (K=0,1,2)
 *
 * This is the core algorithm that sums over scenarios where
 * exactly 0, 1, or 2 accelerators are online.
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
  // Filter to producers with copies and calculate online probabilities
  const p = producers
    .filter((pd) => pd.copies > 0)
    .map((pd) => ({
      pd,
      pOnline: producerOnlineProbByTurn(hg, deck, pd, turn, ctx)
    }))
    .filter((x) => x.pOnline > 0)

  // No producers or kMax=0: just return base
  if (p.length === 0 || kMax === 0) {
    return computeBaseCastability(hg, deck, spell, turn, ctx)
  }

  // Sort by impact (pOnline * net mana)
  p.sort((a, b) => (b.pOnline * netManaPerTurn(b.pd.def)) - (a.pOnline * netManaPerTurn(a.pd.def)))

  // Cap candidates for performance
  const candidates = p.slice(0, 18)
  const probs = candidates.map((x) => x.pOnline)
  const list = candidates.map((x) => x.pd)

  // P(0 online) = Π(1 - pi)
  let p0 = 1
  for (const pi of probs) p0 *= (1 - pi)
  p0 = Math.max(0, Math.min(1, p0))

  // P(exactly 1 online): sum of wi = pi * p0 / (1 - pi)
  const w1: number[] = []
  let p1Sum = 0
  for (let i = 0; i < probs.length; i++) {
    const pi = probs[i]
    const wi = pi >= 1 ? 0 : (pi * p0) / (1 - pi)
    w1.push(wi)
    p1Sum += wi
  }
  p1Sum = Math.max(0, Math.min(1, p1Sum))

  // P(2+ online) = 1 - p0 - p1
  let p2Sum = 0
  if (kMax >= 2) {
    p2Sum = Math.max(0, Math.min(1, 1 - p0 - p1Sum))
  }

  // Scenario K=0: no producers online
  const k0 = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [])
  let outP1 = p0 * k0.p1
  let outP2 = p0 * k0.p2

  // Scenario K=1: exactly one producer online
  if (kMax >= 1 && p1Sum > 0) {
    let accP1 = 0
    let accP2 = 0
    for (let i = 0; i < list.length; i++) {
      const wi = w1[i] / p1Sum
      const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [list[i]])
      accP1 += wi * res.p1
      accP2 += wi * res.p2
    }
    outP1 += p1Sum * accP1
    outP2 += p1Sum * accP2
  }

  // Scenario K=2: two producers online
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
    p1: Math.max(0, Math.min(1, outP1)),
    p2: Math.max(0, Math.min(1, outP2))
  }
}

/**
 * Find the earliest turn where accelerated casting becomes viable
 */
export function findAcceleratedTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  minProb: number = 0.05
): { acceleratedTurn: number | null; withAccelAtTurn?: CastabilityResult } {
  const naturalTurn = spell.mv

  for (let t = 1; t < naturalTurn; t++) {
    const res = computeAcceleratedCastabilityAtTurn(hg, deck, spell, t, producers, ctx, 2)
    if (res.p2 >= minProb) {
      return { acceleratedTurn: t, withAccelAtTurn: res }
    }
  }

  return { acceleratedTurn: null }
}

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

  const accel = findAcceleratedTurn(hg, deck, spell, producers, ctx, 0.05)

  // Key accelerators: top by marginal impact
  const scored = producers.map((pd) => {
    const pOnline = producerOnlineProbByTurn(hg, deck, pd, naturalTurn, ctx)
    return { name: pd.def.name, score: pOnline * netManaPerTurn(pd.def) }
  }).sort((a, b) => b.score - a.score)

  return {
    base,
    withAcceleration,
    accelerationImpact: withAcceleration.p2 - base.p2,
    acceleratedTurn: accel.acceleratedTurn,
    keyAccelerators: scored.slice(0, 3).map((x) => x.name)
  }
}

/**
 * Compute castability for multiple turns
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
