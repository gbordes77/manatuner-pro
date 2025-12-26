/**
 * Advanced Mulligan Simulator with Archetype Support
 *
 * Extends base mulligan simulator with:
 * - Archetype-specific scoring (Aggro, Midrange, Control, Combo)
 * - Detailed score breakdown (Mana Efficiency, Curve, Colors)
 * - Sample hand generation with analysis
 * - Before/After comparison support
 */

import type { DeckCard } from './deckAnalyzer'
import { prepareDeckForSimulation, type SimulatedCard, type SimulatedHand } from './mulliganSimulator'

// =============================================================================
// TYPES
// =============================================================================

export type Archetype = 'aggro' | 'midrange' | 'control' | 'combo'

export interface ArchetypeConfig {
  name: string
  description: string
  icon: string
  weights: {
    manaEfficiency: number    // How important is spending mana each turn
    curvePlayability: number  // How important is playing on curve
    colorAccess: number       // How important is having right colors
    earlyGame: number         // How important is T1-T2 plays
    landCount: number         // Ideal land count preferences
  }
  idealLands: {
    min: number
    optimal: number
    max: number
  }
  priorities: string[]        // Key priorities for this archetype
}

export interface ScoreBreakdown {
  manaEfficiency: number      // 0-100: How well mana was spent
  curvePlayability: number    // 0-100: How well curve was followed
  colorAccess: number         // 0-100: Access to required colors
  earlyGame: number           // 0-100: T1-T2 play availability
  landBalance: number         // 0-100: Land count appropriateness
  total: number               // 0-100: Weighted total
}

export interface SampleHand {
  cards: SimulatedCard[]
  lands: SimulatedCard[]
  spells: SimulatedCard[]
  score: number
  breakdown: ScoreBreakdown
  recommendation: 'SNAP_KEEP' | 'KEEP' | 'MARGINAL' | 'MULLIGAN' | 'SNAP_MULL'
  reasoning: string[]
  turnByTurn: TurnPlan[]
}

export interface TurnPlan {
  turn: number
  landDrop: string | null
  plays: string[]
  manaUsed: number
  manaAvailable: number
}

export interface AdvancedMulliganResult {
  archetype: Archetype
  archetypeConfig: ArchetypeConfig
  expectedScores: {
    hand7: number
    hand6: number
    hand5: number
    hand4: number
  }
  thresholds: {
    keep7: number
    keep6: number
    keep5: number
  }
  distributions: {
    hand7: { score: number; frequency: number }[]
    hand6: { score: number; frequency: number }[]
    hand5: { score: number; frequency: number }[]
  }
  sampleHands: {
    excellent: SampleHand[]
    good: SampleHand[]
    marginal: SampleHand[]
    poor: SampleHand[]
  }
  deckQuality: 'excellent' | 'good' | 'average' | 'poor'
  qualityScore: number
  recommendations: string[]
  iterations: number
}

// =============================================================================
// ARCHETYPE CONFIGURATIONS
// =============================================================================

export const ARCHETYPE_CONFIGS: Record<Archetype, ArchetypeConfig> = {
  aggro: {
    name: 'Aggro',
    description: 'Fast, proactive decks that want to kill quickly',
    icon: '⚡',
    weights: {
      manaEfficiency: 0.20,
      curvePlayability: 0.30,
      colorAccess: 0.15,
      earlyGame: 0.25,
      landCount: 0.10
    },
    idealLands: { min: 1, optimal: 2, max: 3 },
    priorities: [
      '1-drop on T1 is critical',
      'Curve out T1-T2-T3',
      '2-3 lands is ideal, 4+ is flood',
      'Mulligan aggressively for action'
    ]
  },
  midrange: {
    name: 'Midrange',
    description: 'Balanced decks with threats and answers',
    icon: '⚖️',
    weights: {
      manaEfficiency: 0.25,
      curvePlayability: 0.25,
      colorAccess: 0.20,
      earlyGame: 0.15,
      landCount: 0.15
    },
    idealLands: { min: 2, optimal: 3, max: 4 },
    priorities: [
      'Smooth curve T2-T3-T4',
      '3-4 lands is ideal',
      'Balance threats and interaction',
      'Keep hands with good mana'
    ]
  },
  control: {
    name: 'Control',
    description: 'Reactive decks that want to go long',
    icon: '🛡️',
    weights: {
      manaEfficiency: 0.15,
      curvePlayability: 0.15,
      colorAccess: 0.30,
      earlyGame: 0.10,
      landCount: 0.30
    },
    idealLands: { min: 3, optimal: 4, max: 5 },
    priorities: [
      'Hit land drops every turn',
      'Have answers for early threats',
      '4+ lands is ideal',
      'Color access is critical'
    ]
  },
  combo: {
    name: 'Combo',
    description: 'Decks looking to assemble specific pieces',
    icon: '🔮',
    weights: {
      manaEfficiency: 0.15,
      curvePlayability: 0.10,
      colorAccess: 0.25,
      earlyGame: 0.20,
      landCount: 0.30
    },
    idealLands: { min: 2, optimal: 3, max: 4 },
    priorities: [
      'Find combo pieces',
      'Have mana to combo off',
      'Cantrips and draw are premium',
      'Can keep slower hands'
    ]
  }
}

// =============================================================================
// SCORE LEGEND
// =============================================================================

export const SCORE_LEGEND = {
  snapKeep: { min: 90, label: 'SNAP KEEP', description: 'Perfect hand - keep without thinking', color: '#4caf50' },
  keep: { min: 75, label: 'KEEP', description: 'Good hand - plays well on curve', color: '#8bc34a' },
  marginal: { min: 60, label: 'MARGINAL', description: 'Risky hand - depends on draws', color: '#ff9800' },
  mulligan: { min: 40, label: 'MULLIGAN', description: 'Weak hand - likely to struggle', color: '#f44336' },
  snapMull: { min: 0, label: 'SNAP MULL', description: 'Unplayable - mulligan immediately', color: '#b71c1c' }
}

export function getScoreCategory(score: number): keyof typeof SCORE_LEGEND {
  if (score >= SCORE_LEGEND.snapKeep.min) return 'snapKeep'
  if (score >= SCORE_LEGEND.keep.min) return 'keep'
  if (score >= SCORE_LEGEND.marginal.min) return 'marginal'
  if (score >= SCORE_LEGEND.mulligan.min) return 'mulligan'
  return 'snapMull'
}

// =============================================================================
// ADVANCED SCORING
// =============================================================================

function calculateScoreBreakdown(
  hand: SimulatedHand,
  archetype: Archetype,
  deck: SimulatedCard[]
): ScoreBreakdown {
  const config = ARCHETYPE_CONFIGS[archetype]

  // 1. Mana Efficiency (simulated T1-T4)
  const manaEfficiency = calculateManaEfficiency(hand, deck)

  // 2. Curve Playability
  const curvePlayability = calculateCurvePlayability(hand, archetype)

  // 3. Color Access
  const colorAccess = calculateColorAccess(hand)

  // 4. Early Game
  const earlyGame = calculateEarlyGame(hand, archetype)

  // 5. Land Balance
  const landBalance = calculateLandBalance(hand, config)

  // Weighted total
  const total = Math.round(
    manaEfficiency * config.weights.manaEfficiency +
    curvePlayability * config.weights.curvePlayability +
    colorAccess * config.weights.colorAccess +
    earlyGame * config.weights.earlyGame +
    landBalance * config.weights.landCount
  ) / (
    config.weights.manaEfficiency +
    config.weights.curvePlayability +
    config.weights.colorAccess +
    config.weights.earlyGame +
    config.weights.landCount
  )

  return {
    manaEfficiency: Math.round(manaEfficiency),
    curvePlayability: Math.round(curvePlayability),
    colorAccess: Math.round(colorAccess),
    earlyGame: Math.round(earlyGame),
    landBalance: Math.round(landBalance),
    total: Math.round(total)
  }
}

function calculateManaEfficiency(hand: SimulatedHand, deck: SimulatedCard[]): number {
  // Simulate T1-T4 goldfish
  let landsInPlay = 0
  let totalManaSpent = 0
  let totalManaAvailable = 0

  const landsInHand = [...hand.lands]
  const spellsInHand = [...hand.spells]
  let deckIndex = 0
  const remainingDeck = deck.slice(7)

  for (let turn = 1; turn <= 4; turn++) {
    // Draw (except T1)
    if (turn > 1 && deckIndex < remainingDeck.length) {
      const drawn = remainingDeck[deckIndex++]
      if (drawn.isLand) landsInHand.push(drawn)
      else spellsInHand.push(drawn)
    }

    // Play land
    if (landsInHand.length > 0) {
      landsInHand.shift()
      landsInPlay++
    }

    totalManaAvailable += landsInPlay

    // Cast spells (greedy)
    let manaLeft = landsInPlay
    spellsInHand.sort((a, b) => a.cmc - b.cmc)

    const toRemove: number[] = []
    for (let i = 0; i < spellsInHand.length; i++) {
      if (spellsInHand[i].cmc <= manaLeft && spellsInHand[i].cmc > 0) {
        manaLeft -= spellsInHand[i].cmc
        totalManaSpent += spellsInHand[i].cmc
        toRemove.push(i)
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) {
      spellsInHand.splice(toRemove[i], 1)
    }
  }

  return totalManaAvailable > 0 ? (totalManaSpent / totalManaAvailable) * 100 : 0
}

function calculateCurvePlayability(hand: SimulatedHand, archetype: Archetype): number {
  const cmcCounts = [0, 0, 0, 0, 0] // CMC 1, 2, 3, 4, 5+

  for (const spell of hand.spells) {
    const idx = Math.min(spell.cmc - 1, 4)
    if (idx >= 0) cmcCounts[idx]++
  }

  let score = 0

  if (archetype === 'aggro') {
    // Aggro wants 1s and 2s
    if (cmcCounts[0] >= 1) score += 40  // Has 1-drop
    if (cmcCounts[1] >= 1) score += 30  // Has 2-drop
    if (cmcCounts[0] >= 2) score += 15  // Multiple 1-drops
    if (cmcCounts[2] >= 1) score += 15  // Has 3-drop
  } else if (archetype === 'midrange') {
    // Midrange wants 2s and 3s
    if (cmcCounts[1] >= 1) score += 35  // Has 2-drop
    if (cmcCounts[2] >= 1) score += 35  // Has 3-drop
    if (cmcCounts[3] >= 1) score += 20  // Has 4-drop
    if (cmcCounts[0] >= 1) score += 10  // Has 1-drop
  } else if (archetype === 'control') {
    // Control wants interaction and late game
    if (cmcCounts[1] >= 1) score += 30  // Has 2-drop (removal)
    if (cmcCounts[2] >= 1) score += 25  // Has 3-drop
    if (cmcCounts[3] >= 1) score += 25  // Has 4-drop
    if (hand.spells.length >= 3) score += 20  // Multiple spells
  } else {
    // Combo - flexible
    if (hand.spells.length >= 2) score += 40
    if (cmcCounts[0] >= 1 || cmcCounts[1] >= 1) score += 30  // Early plays
    if (hand.spells.some(s => s.cmc <= 2)) score += 30
  }

  return Math.min(100, score)
}

function calculateColorAccess(hand: SimulatedHand): number {
  // Check if lands can cast spells
  const colorsProduced = new Set<string>()

  for (const land of hand.lands) {
    // Basic lands produce their color
    if (land.name.includes('Plains')) colorsProduced.add('W')
    else if (land.name.includes('Island')) colorsProduced.add('U')
    else if (land.name.includes('Swamp')) colorsProduced.add('B')
    else if (land.name.includes('Mountain')) colorsProduced.add('R')
    else if (land.name.includes('Forest')) colorsProduced.add('G')
    // Dual lands, shocks, etc. - simplified detection
    else {
      // Assume non-basic lands produce multiple colors
      colorsProduced.add('W')
      colorsProduced.add('U')
      colorsProduced.add('B')
      colorsProduced.add('R')
      colorsProduced.add('G')
    }
  }

  // Check spell requirements
  let totalRequired = 0
  let totalMet = 0

  for (const spell of hand.spells) {
    for (const [color, count] of Object.entries(spell.manaCost.symbols)) {
      totalRequired += count
      if (colorsProduced.has(color)) {
        totalMet += count
      }
    }
  }

  if (totalRequired === 0) return 100
  return (totalMet / totalRequired) * 100
}

function calculateEarlyGame(hand: SimulatedHand, archetype: Archetype): number {
  const has1Drop = hand.spells.some(s => s.cmc === 1)
  const has2Drop = hand.spells.some(s => s.cmc === 2)
  const hasEnoughLands = hand.landCount >= 2

  let score = 0

  if (archetype === 'aggro') {
    if (has1Drop && hand.landCount >= 1) score += 50
    if (has2Drop && hand.landCount >= 2) score += 30
    if (has1Drop && has2Drop) score += 20
  } else if (archetype === 'midrange') {
    if (has2Drop && hasEnoughLands) score += 50
    if (has1Drop) score += 20
    if (hand.landCount >= 3) score += 30
  } else if (archetype === 'control') {
    if (hasEnoughLands) score += 40
    if (has2Drop) score += 30  // Early interaction
    if (hand.landCount >= 3) score += 30
  } else {
    // Combo
    if (hasEnoughLands) score += 50
    if (has1Drop || has2Drop) score += 30
    if (hand.spells.length >= 3) score += 20
  }

  return Math.min(100, score)
}

function calculateLandBalance(hand: SimulatedHand, config: ArchetypeConfig): number {
  const { min, optimal, max } = config.idealLands
  const count = hand.landCount

  if (count === optimal) return 100
  if (count >= min && count <= max) {
    // Linear interpolation
    if (count < optimal) {
      return 70 + 30 * (count - min) / (optimal - min)
    } else {
      return 70 + 30 * (max - count) / (max - optimal)
    }
  }
  if (count === 0) return 0
  if (count > max) return Math.max(0, 50 - (count - max) * 15)
  return Math.max(0, 50 - (min - count) * 20)
}

// =============================================================================
// SAMPLE HAND GENERATION
// =============================================================================

function generateTurnPlan(hand: SimulatedHand, deck: SimulatedCard[]): TurnPlan[] {
  const plans: TurnPlan[] = []
  const landsInHand = [...hand.lands]
  const spellsInHand = [...hand.spells]
  let landsInPlay = 0
  let deckIndex = 0
  const remainingDeck = deck.slice(7)

  for (let turn = 1; turn <= 4; turn++) {
    // Draw
    if (turn > 1 && deckIndex < remainingDeck.length) {
      const drawn = remainingDeck[deckIndex++]
      if (drawn.isLand) landsInHand.push(drawn)
      else spellsInHand.push(drawn)
    }

    // Land drop
    let landDrop: string | null = null
    if (landsInHand.length > 0) {
      landDrop = landsInHand[0].name
      landsInHand.shift()
      landsInPlay++
    }

    // Cast spells
    const plays: string[] = []
    let manaLeft = landsInPlay
    spellsInHand.sort((a, b) => a.cmc - b.cmc)

    const toRemove: number[] = []
    for (let i = 0; i < spellsInHand.length; i++) {
      if (spellsInHand[i].cmc <= manaLeft && spellsInHand[i].cmc > 0) {
        manaLeft -= spellsInHand[i].cmc
        plays.push(spellsInHand[i].name)
        toRemove.push(i)
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) {
      spellsInHand.splice(toRemove[i], 1)
    }

    plans.push({
      turn,
      landDrop,
      plays,
      manaUsed: landsInPlay - manaLeft,
      manaAvailable: landsInPlay
    })
  }

  return plans
}

function generateReasoningForHand(
  hand: SimulatedHand,
  breakdown: ScoreBreakdown,
  archetype: Archetype
): string[] {
  const reasons: string[] = []
  const config = ARCHETYPE_CONFIGS[archetype]

  // Land assessment
  if (hand.landCount === config.idealLands.optimal) {
    reasons.push(`✅ Perfect land count (${hand.landCount}) for ${config.name}`)
  } else if (hand.landCount < config.idealLands.min) {
    reasons.push(`❌ Too few lands (${hand.landCount}) - risk of mana screw`)
  } else if (hand.landCount > config.idealLands.max) {
    reasons.push(`⚠️ High land count (${hand.landCount}) - risk of flooding`)
  } else {
    reasons.push(`👍 Acceptable land count (${hand.landCount})`)
  }

  // Early game
  const has1Drop = hand.spells.some(s => s.cmc === 1)
  const has2Drop = hand.spells.some(s => s.cmc === 2)

  if (archetype === 'aggro') {
    if (has1Drop) reasons.push('✅ Has T1 play - critical for aggro')
    else reasons.push('❌ No 1-drop - slow start for aggro')
  }

  if (has2Drop) reasons.push('✅ Has T2 play')
  else if (archetype !== 'control') reasons.push('⚠️ No 2-drop')

  // Breakdown insights
  if (breakdown.manaEfficiency >= 80) {
    reasons.push('✅ Excellent mana efficiency')
  } else if (breakdown.manaEfficiency < 50) {
    reasons.push('❌ Poor mana efficiency - wasted mana early')
  }

  if (breakdown.colorAccess >= 90) {
    reasons.push('✅ Good color access')
  } else if (breakdown.colorAccess < 70) {
    reasons.push('⚠️ Color access concerns')
  }

  return reasons
}

function createSampleHand(
  cards: SimulatedCard[],
  hand: SimulatedHand,
  archetype: Archetype,
  threshold: number
): SampleHand {
  const breakdown = calculateScoreBreakdown(hand, archetype, cards)
  const turnByTurn = generateTurnPlan(hand, cards)
  const reasoning = generateReasoningForHand(hand, breakdown, archetype)

  let recommendation: SampleHand['recommendation']
  if (breakdown.total >= 90) recommendation = 'SNAP_KEEP'
  else if (breakdown.total >= threshold + 10) recommendation = 'KEEP'
  else if (breakdown.total >= threshold - 5) recommendation = 'MARGINAL'
  else if (breakdown.total >= threshold - 20) recommendation = 'MULLIGAN'
  else recommendation = 'SNAP_MULL'

  return {
    cards: hand.cards,
    lands: hand.lands,
    spells: hand.spells,
    score: breakdown.total,
    breakdown,
    recommendation,
    reasoning,
    turnByTurn
  }
}

// =============================================================================
// MAIN ADVANCED ANALYSIS
// =============================================================================

function shuffleDeck(deck: SimulatedCard[]): SimulatedCard[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function drawHand(deck: SimulatedCard[], size: number = 7): SimulatedHand {
  const cards = deck.slice(0, size)
  const lands = cards.filter(c => c.isLand)
  const spells = cards.filter(c => !c.isLand)

  return {
    cards,
    lands,
    spells,
    landCount: lands.length,
    totalCMC: spells.reduce((sum, c) => sum + c.cmc, 0)
  }
}

function selectBestSubset(hand: SimulatedHand, targetSize: number, archetype: Archetype): SimulatedHand {
  if (hand.cards.length <= targetSize) return hand

  const config = ARCHETYPE_CONFIGS[archetype]
  const cards = [...hand.cards]

  // Score each card for this archetype
  const scoredCards = cards.map(card => {
    let priority = 0

    if (card.isLand) {
      const currentLands = cards.filter(c => c.isLand).length
      if (currentLands <= config.idealLands.max) priority = 70
      else priority = 20
    } else {
      // Archetype-specific spell priorities
      if (archetype === 'aggro') {
        if (card.cmc === 1) priority = 100
        else if (card.cmc === 2) priority = 85
        else if (card.cmc === 3) priority = 60
        else priority = 30
      } else if (archetype === 'midrange') {
        if (card.cmc === 2) priority = 90
        else if (card.cmc === 3) priority = 95
        else if (card.cmc === 4) priority = 80
        else if (card.cmc === 1) priority = 70
        else priority = 40
      } else if (archetype === 'control') {
        if (card.cmc === 2) priority = 85  // Interaction
        else if (card.cmc === 3) priority = 80
        else if (card.cmc === 4) priority = 85
        else if (card.cmc >= 5) priority = 70
        else priority = 60
      } else {
        // Combo - value low CMC
        if (card.cmc <= 2) priority = 90
        else if (card.cmc <= 3) priority = 75
        else priority = 50
      }
    }

    return { card, priority }
  })

  scoredCards.sort((a, b) => b.priority - a.priority)

  // Ensure good land/spell balance
  const selected: SimulatedCard[] = []
  let landCount = 0
  const targetLands = config.idealLands.optimal

  // First pass: ensure lands
  for (const { card } of scoredCards) {
    if (card.isLand && landCount < targetLands && selected.length < targetSize) {
      selected.push(card)
      landCount++
    }
  }

  // Fill remaining
  for (const { card } of scoredCards) {
    if (selected.length >= targetSize) break
    if (!selected.includes(card)) {
      selected.push(card)
      if (card.isLand) landCount++
    }
  }

  const lands = selected.filter(c => c.isLand)
  const spells = selected.filter(c => !c.isLand)

  return {
    cards: selected,
    lands,
    spells,
    landCount: lands.length,
    totalCMC: spells.reduce((sum, c) => sum + c.cmc, 0)
  }
}

export function analyzeWithArchetype(
  cards: DeckCard[],
  archetype: Archetype,
  iterations: number = 5000
): AdvancedMulliganResult {
  const deck = prepareDeckForSimulation(cards)

  if (deck.length < 40) {
    throw new Error('Deck must have at least 40 cards')
  }

  const config = ARCHETYPE_CONFIGS[archetype]

  // Run simulations for each hand size
  const results: Record<number, { scores: number[]; distribution: number[] }> = {}
  const sampleHandsCollected: { hand: SimulatedHand; score: number }[] = []

  for (const handSize of [4, 5, 6, 7]) {
    const scores: number[] = []
    const distribution = new Array(11).fill(0)

    for (let i = 0; i < iterations; i++) {
      const shuffled = shuffleDeck(deck)
      const fullHand = drawHand(shuffled, 7)
      const hand = selectBestSubset(fullHand, handSize, archetype)

      const breakdown = calculateScoreBreakdown(hand, archetype, shuffled)
      scores.push(breakdown.total)

      const bucket = Math.min(10, Math.floor(breakdown.total / 10))
      distribution[bucket]++

      // Collect sample hands (only for 7-card)
      if (handSize === 7 && sampleHandsCollected.length < 100) {
        sampleHandsCollected.push({ hand, score: breakdown.total })
      }
    }

    // Normalize distribution
    for (let i = 0; i < distribution.length; i++) {
      distribution[i] = distribution[i] / iterations
    }

    results[handSize] = { scores, distribution }
  }

  // Calculate expected values with Bellman equation
  const ev4 = results[4].scores.reduce((a, b) => a + b, 0) / iterations

  let ev5 = 0
  for (const score of results[5].scores) {
    ev5 += Math.max(score, ev4)
  }
  ev5 /= iterations

  let ev6 = 0
  for (const score of results[6].scores) {
    ev6 += Math.max(score, ev5)
  }
  ev6 /= iterations

  let ev7 = 0
  for (const score of results[7].scores) {
    ev7 += Math.max(score, ev6)
  }
  ev7 /= iterations

  // Categorize sample hands
  const sampleHands = {
    excellent: [] as SampleHand[],
    good: [] as SampleHand[],
    marginal: [] as SampleHand[],
    poor: [] as SampleHand[]
  }

  // Sort and pick diverse samples
  sampleHandsCollected.sort((a, b) => b.score - a.score)

  for (const { hand, score } of sampleHandsCollected) {
    const sample = createSampleHand(deck, hand, archetype, ev6)

    if (score >= 85 && sampleHands.excellent.length < 3) {
      sampleHands.excellent.push(sample)
    } else if (score >= 70 && score < 85 && sampleHands.good.length < 3) {
      sampleHands.good.push(sample)
    } else if (score >= 55 && score < 70 && sampleHands.marginal.length < 3) {
      sampleHands.marginal.push(sample)
    } else if (score < 55 && sampleHands.poor.length < 3) {
      sampleHands.poor.push(sample)
    }
  }

  // Deck quality
  let deckQuality: AdvancedMulliganResult['deckQuality']
  if (ev7 >= 80) deckQuality = 'excellent'
  else if (ev7 >= 65) deckQuality = 'good'
  else if (ev7 >= 50) deckQuality = 'average'
  else deckQuality = 'poor'

  // Generate recommendations
  const recommendations: string[] = []

  if (ev7 >= 80) {
    recommendations.push(`✅ Excellent ${config.name} manabase - most hands are keepable`)
  } else if (ev7 >= 65) {
    recommendations.push(`👍 Good ${config.name} consistency - be selective with marginal hands`)
  } else {
    recommendations.push(`⚠️ Consider tuning your manabase for ${config.name} strategy`)
  }

  // Archetype-specific advice
  recommendations.push(...config.priorities.slice(0, 2))

  const mulliganValue = ev6 - ev7 + (ev7 - ev6)
  if (mulliganValue > 5) {
    recommendations.push(`📊 Mulliganing bad 7s to 6 gains ~${Math.round(mulliganValue)} points on average`)
  }

  return {
    archetype,
    archetypeConfig: config,
    expectedScores: {
      hand7: Math.round(ev7),
      hand6: Math.round(ev6),
      hand5: Math.round(ev5),
      hand4: Math.round(ev4)
    },
    thresholds: {
      keep7: Math.round(ev6),
      keep6: Math.round(ev5),
      keep5: Math.round(ev4)
    },
    distributions: {
      hand7: results[7].distribution.map((freq, i) => ({ score: i * 10 + 5, frequency: freq })),
      hand6: results[6].distribution.map((freq, i) => ({ score: i * 10 + 5, frequency: freq })),
      hand5: results[5].distribution.map((freq, i) => ({ score: i * 10 + 5, frequency: freq }))
    },
    sampleHands,
    deckQuality,
    qualityScore: Math.round(ev7),
    recommendations,
    iterations
  }
}

/**
 * Quick analysis for responsive UI
 */
export function quickArchetypeAnalysis(
  cards: DeckCard[],
  archetype: Archetype
): AdvancedMulliganResult {
  return analyzeWithArchetype(cards, archetype, 2000)
}
