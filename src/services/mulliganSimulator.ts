/**
 * Advanced Mulligan Simulator using Monte Carlo + Dynamic Programming
 *
 * Based on Frank Karsten methodology and Bellman equation for optimal mulligan decisions.
 *
 * Key concepts:
 * - Goldfish Simulation: Simulates turns 1-4 in solitaire mode
 * - Mana Efficiency Score: Mana spent / Mana available
 * - Dynamic Programming: Backward induction from V(4) to V(7)
 * - London Mulligan: Best k cards from 7 drawn
 */

import type { DeckCard } from './deckAnalyzer'

// =============================================================================
// TYPES
// =============================================================================

export interface SimulatedCard {
  name: string
  cmc: number
  isLand: boolean
  manaCost: {
    colorless: number
    symbols: Record<string, number>
  }
  quantity: number
}

export interface SimulatedHand {
  cards: SimulatedCard[]
  lands: SimulatedCard[]
  spells: SimulatedCard[]
  landCount: number
  totalCMC: number
}

export interface TurnSimulation {
  turn: number
  manaAvailable: number
  manaSpent: number
  cardsPlayed: string[]
  landsInPlay: number
}

export interface GoldfishResult {
  turns: TurnSimulation[]
  manaEfficiency: number  // 0-1 score
  totalManaSpent: number
  totalManaAvailable: number
  curveScore: number      // How well we followed our curve
  keepable: boolean
}

export interface MulliganValue {
  handSize: number
  expectedValue: number   // E[S] for this hand size
  threshold: number       // Score below which we should mulligan
  sampleSize: number
  distribution: number[]  // Histogram of scores
}

export interface MulliganAnalysisResult {
  values: MulliganValue[]           // V(4), V(5), V(6), V(7)
  optimalStrategy: {
    keep7Threshold: number          // Keep 7 if score >= this
    keep6Threshold: number          // Keep 6 if score >= this
    keep5Threshold: number          // Keep 5 if score >= this
  }
  distributions: {
    hand7: { score: number; frequency: number }[]
    hand6: { score: number; frequency: number }[]
    hand5: { score: number; frequency: number }[]
  }
  recommendations: string[]
  deckQuality: 'excellent' | 'good' | 'average' | 'poor'
  iterations: number                 // Number of simulations run
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SIMULATION_ITERATIONS = 10000
const MAX_TURNS = 4
// Hand sizes for reference: 4, 5, 6, 7 cards after mulligans

// =============================================================================
// DECK PREPARATION
// =============================================================================

/**
 * Convert DeckCards to SimulatedCards for the simulation
 */
export function prepareDeckForSimulation(cards: DeckCard[]): SimulatedCard[] {
  const simulatedDeck: SimulatedCard[] = []

  for (const card of cards) {
    for (let i = 0; i < card.quantity; i++) {
      // Parse manaCost - it can be a string like "{2}{R}" or already an object
      let parsedManaCost: { colorless: number; symbols: Record<string, number> }

      if (typeof card.manaCost === 'string') {
        parsedManaCost = parseManaCostString(card.manaCost)
      } else if (card.manaCost && typeof card.manaCost === 'object') {
        parsedManaCost = card.manaCost as { colorless: number; symbols: Record<string, number> }
      } else {
        parsedManaCost = { colorless: 0, symbols: {} }
      }

      simulatedDeck.push({
        name: card.name,
        cmc: card.cmc,
        isLand: card.isLand,
        manaCost: parsedManaCost,
        quantity: 1
      })
    }
  }

  return simulatedDeck
}

/**
 * Parse a mana cost string like "{2}{R}{R}" into structured format
 */
function parseManaCostString(cost: string): { colorless: number; symbols: Record<string, number> } {
  const result = { colorless: 0, symbols: {} as Record<string, number> }

  if (!cost) return result

  const matches = cost.match(/\{([^}]+)\}/g) || []

  for (const match of matches) {
    const symbol = match.slice(1, -1) // Remove { }

    if (/^\d+$/.test(symbol)) {
      result.colorless += parseInt(symbol, 10)
    } else if (['W', 'U', 'B', 'R', 'G'].includes(symbol)) {
      result.symbols[symbol] = (result.symbols[symbol] || 0) + 1
    }
  }

  return result
}

/**
 * Fisher-Yates shuffle
 */
function shuffleDeck(deck: SimulatedCard[]): SimulatedCard[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Draw a hand of 7 cards
 */
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

// =============================================================================
// GOLDFISH SIMULATION
// =============================================================================

/**
 * Simulate turns 1-4 in Goldfish mode (solitaire)
 * Returns mana efficiency score
 */
function simulateGoldfish(
  hand: SimulatedHand,
  remainingDeck: SimulatedCard[],
  maxTurns: number = MAX_TURNS
): GoldfishResult {
  const turns: TurnSimulation[] = []
  let landsInPlay = 0
  let deckIndex = 0

  // Cards in hand (mutable copy)
  const cardsInHand = [...hand.cards]
  const landsInHand = cardsInHand.filter(c => c.isLand)
  const spellsInHand = cardsInHand.filter(c => !c.isLand)

  let totalManaAvailable = 0
  let totalManaSpent = 0

  for (let turn = 1; turn <= maxTurns; turn++) {
    // Draw a card (except turn 1 on the play)
    if (turn > 1 && deckIndex < remainingDeck.length) {
      const drawnCard = remainingDeck[deckIndex++]
      if (drawnCard.isLand) {
        landsInHand.push(drawnCard)
      } else {
        spellsInHand.push(drawnCard)
      }
    }

    // Play a land if possible
    if (landsInHand.length > 0) {
      landsInHand.shift() // Remove first land
      landsInPlay++
    }

    const manaAvailable = landsInPlay
    totalManaAvailable += manaAvailable

    // Cast spells greedily by CMC (prioritize curve)
    let manaSpent = 0
    const cardsPlayed: string[] = []

    // Sort spells by CMC descending to maximize mana usage
    spellsInHand.sort((a, b) => b.cmc - a.cmc)

    // Try to spend all mana
    let remainingMana = manaAvailable
    const spellsToRemove: number[] = []

    for (let i = 0; i < spellsInHand.length; i++) {
      const spell = spellsInHand[i]
      if (spell.cmc <= remainingMana && spell.cmc > 0) {
        remainingMana -= spell.cmc
        manaSpent += spell.cmc
        cardsPlayed.push(spell.name)
        spellsToRemove.push(i)
      }
    }

    // Remove played spells (reverse order to maintain indices)
    for (let i = spellsToRemove.length - 1; i >= 0; i--) {
      spellsInHand.splice(spellsToRemove[i], 1)
    }

    totalManaSpent += manaSpent

    turns.push({
      turn,
      manaAvailable,
      manaSpent,
      cardsPlayed,
      landsInPlay
    })
  }

  // Calculate mana efficiency (0-1)
  const manaEfficiency = totalManaAvailable > 0
    ? totalManaSpent / totalManaAvailable
    : 0

  // Curve score: bonus for playing on curve
  let curveScore = 0
  for (const t of turns) {
    if (t.manaSpent > 0) {
      // Bonus for using mana each turn
      curveScore += t.manaSpent / Math.max(1, t.manaAvailable)
    }
  }
  curveScore = curveScore / maxTurns

  // Hand is keepable if we have 2-5 lands and can play something
  const keepable = hand.landCount >= 2 && hand.landCount <= 5 &&
    hand.spells.some(s => s.cmc <= 3)

  return {
    turns,
    manaEfficiency,
    totalManaSpent,
    totalManaAvailable,
    curveScore,
    keepable
  }
}

/**
 * Calculate composite score for a hand (0-100)
 */
function calculateHandScore(goldfish: GoldfishResult, hand: SimulatedHand): number {
  // Base score from mana efficiency (0-60 points)
  const efficiencyScore = goldfish.manaEfficiency * 60

  // Curve score bonus (0-20 points)
  const curveBonus = goldfish.curveScore * 20

  // Land count penalty/bonus (0-20 points)
  let landScore = 0
  if (hand.landCount === 3) landScore = 20        // Optimal
  else if (hand.landCount === 2 || hand.landCount === 4) landScore = 15
  else if (hand.landCount === 5) landScore = 10
  else if (hand.landCount === 1) landScore = 5
  else landScore = 0                               // 0 or 6+ lands

  // Early play bonus (0-10 points)
  let earlyPlayBonus = 0
  if (hand.spells.some(s => s.cmc === 1)) earlyPlayBonus += 5
  if (hand.spells.some(s => s.cmc === 2)) earlyPlayBonus += 5

  // Penalty for no plays before turn 3
  if (!hand.spells.some(s => s.cmc <= 2)) {
    earlyPlayBonus -= 10
  }

  const totalScore = Math.max(0, Math.min(100,
    efficiencyScore + curveBonus + landScore + earlyPlayBonus
  ))

  return totalScore
}

// =============================================================================
// LONDON MULLIGAN: BEST SUBSET SELECTION
// =============================================================================

/**
 * For London Mulligan: select best k cards from 7
 * Uses greedy heuristic (optimal selection is NP-hard)
 */
function selectBestSubset(hand: SimulatedHand, targetSize: number): SimulatedHand {
  if (hand.cards.length <= targetSize) {
    return hand
  }

  const cards = [...hand.cards]

  // Priority scoring for each card
  const scoredCards = cards.map(card => {
    let priority = 0

    if (card.isLand) {
      // Keep 2-4 lands ideally
      const currentLands = cards.filter(c => c.isLand).length
      if (currentLands <= 4) priority = 80
      else priority = 30
    } else {
      // Prioritize low CMC spells
      if (card.cmc <= 2) priority = 90
      else if (card.cmc <= 3) priority = 70
      else if (card.cmc <= 4) priority = 50
      else priority = 30
    }

    return { card, priority }
  })

  // Sort by priority and take top targetSize
  scoredCards.sort((a, b) => b.priority - a.priority)

  // Ensure we have good land/spell balance
  const selectedCards: SimulatedCard[] = []
  let landCount = 0
  const targetLands = Math.min(Math.floor(targetSize * 0.4), 4) // ~40% lands, max 4

  // First pass: ensure minimum lands
  for (const { card } of scoredCards) {
    if (card.isLand && landCount < targetLands && selectedCards.length < targetSize) {
      selectedCards.push(card)
      landCount++
    }
  }

  // Second pass: fill with best remaining cards
  for (const { card } of scoredCards) {
    if (selectedCards.length >= targetSize) break
    if (!selectedCards.includes(card)) {
      selectedCards.push(card)
      if (card.isLand) landCount++
    }
  }

  const lands = selectedCards.filter(c => c.isLand)
  const spells = selectedCards.filter(c => !c.isLand)

  return {
    cards: selectedCards,
    lands,
    spells,
    landCount: lands.length,
    totalCMC: spells.reduce((sum, c) => sum + c.cmc, 0)
  }
}

// =============================================================================
// DYNAMIC PROGRAMMING SOLVER
// =============================================================================

/**
 * Calculate E[Score] for a given hand size using Monte Carlo
 */
function calculateExpectedValue(
  deck: SimulatedCard[],
  handSize: number,
  iterations: number = SIMULATION_ITERATIONS
): { expectedValue: number; distribution: number[]; scores: number[] } {
  const scores: number[] = []
  const distribution = new Array(11).fill(0) // 0-10, 10-20, ..., 90-100

  for (let i = 0; i < iterations; i++) {
    const shuffled = shuffleDeck(deck)

    // Draw 7 cards, then select best subset for London Mulligan
    const fullHand = drawHand(shuffled, 7)
    const hand = selectBestSubset(fullHand, handSize)
    const remainingDeck = shuffled.slice(7)

    // Simulate goldfish
    const goldfish = simulateGoldfish(hand, remainingDeck)
    const score = calculateHandScore(goldfish, hand)

    scores.push(score)

    // Update distribution histogram
    const bucket = Math.min(10, Math.floor(score / 10))
    distribution[bucket]++
  }

  // Normalize distribution
  for (let i = 0; i < distribution.length; i++) {
    distribution[i] = distribution[i] / iterations
  }

  const expectedValue = scores.reduce((sum, s) => sum + s, 0) / scores.length

  return { expectedValue, distribution, scores }
}

/**
 * Backward Induction: Calculate optimal mulligan thresholds
 * V(k) = E[max(Score(best k from 7), V(k-1))]
 */
function solveMulliganDP(
  deck: SimulatedCard[],
  iterations: number = SIMULATION_ITERATIONS
): MulliganValue[] {
  const values: MulliganValue[] = []

  // Base case: V(4) - always keep at 4 cards
  const v4Result = calculateExpectedValue(deck, 4, iterations)
  values.push({
    handSize: 4,
    expectedValue: v4Result.expectedValue,
    threshold: 0, // Always keep at 4
    sampleSize: iterations,
    distribution: v4Result.distribution
  })

  // Induction: V(5), V(6), V(7)
  for (const handSize of [5, 6, 7]) {
    const result = calculateExpectedValue(deck, handSize, iterations)

    // Threshold is V(k-1): mulligan if score < V(k-1)
    const previousV = values[values.length - 1].expectedValue

    // Calculate adjusted expected value considering mulligan option
    // V(k) = E[max(Score, V(k-1))]
    let adjustedEV = 0
    for (const score of result.scores || []) {
      adjustedEV += Math.max(score, previousV)
    }
    adjustedEV = adjustedEV / (result.scores?.length || iterations)

    values.push({
      handSize,
      expectedValue: adjustedEV,
      threshold: previousV,
      sampleSize: iterations,
      distribution: result.distribution
    })
  }

  return values
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Run complete mulligan analysis on a deck
 */
export function analyzeMulliganStrategy(
  cards: DeckCard[],
  iterations: number = SIMULATION_ITERATIONS
): MulliganAnalysisResult {
  const startTime = performance.now()

  // Prepare deck
  const deck = prepareDeckForSimulation(cards)

  if (deck.length < 40) {
    throw new Error('Deck must have at least 40 cards for mulligan analysis')
  }

  // Run DP solver
  const values = solveMulliganDP(deck, iterations)

  // Extract thresholds
  const v7 = values.find(v => v.handSize === 7)!
  const v6 = values.find(v => v.handSize === 6)!
  const v5 = values.find(v => v.handSize === 5)!

  // Build distributions for visualization
  const distributions = {
    hand7: v7.distribution.map((freq, i) => ({
      score: i * 10 + 5, // Center of bucket
      frequency: freq
    })),
    hand6: v6.distribution.map((freq, i) => ({
      score: i * 10 + 5,
      frequency: freq
    })),
    hand5: v5.distribution.map((freq, i) => ({
      score: i * 10 + 5,
      frequency: freq
    }))
  }

  // Generate recommendations
  const recommendations: string[] = []

  if (v7.expectedValue >= 70) {
    recommendations.push('✅ Excellent mana base - most 7-card hands are keepable')
  } else if (v7.expectedValue >= 55) {
    recommendations.push('👍 Good mana base - be selective with marginal hands')
  } else {
    recommendations.push('⚠️ Consider adjusting your mana base for better consistency')
  }

  const mulliganGap = v6.expectedValue - v7.threshold
  if (mulliganGap > 10) {
    recommendations.push(`📊 Mulligan to 6 gains ~${mulliganGap.toFixed(0)} points on average vs keeping bad 7s`)
  }

  // Deck quality assessment
  let deckQuality: 'excellent' | 'good' | 'average' | 'poor'
  if (v7.expectedValue >= 70) deckQuality = 'excellent'
  else if (v7.expectedValue >= 55) deckQuality = 'good'
  else if (v7.expectedValue >= 40) deckQuality = 'average'
  else deckQuality = 'poor'

  // Performance tracking (elapsed time available if needed)
  void (performance.now() - startTime)

  return {
    values,
    optimalStrategy: {
      keep7Threshold: v7.threshold,
      keep6Threshold: v6.threshold,
      keep5Threshold: v5.threshold
    },
    distributions,
    recommendations,
    deckQuality,
    iterations
  }
}

/**
 * Quick analysis with fewer iterations (for UI responsiveness)
 */
export function quickMulliganAnalysis(
  cards: DeckCard[],
  iterations: number = 2000
): MulliganAnalysisResult {
  return analyzeMulliganStrategy(cards, iterations)
}

/**
 * Evaluate a specific hand against the optimal strategy
 */
export function evaluateHand(
  hand: DeckCard[],
  remainingDeck: DeckCard[],
  optimalStrategy: MulliganAnalysisResult['optimalStrategy']
): {
  score: number
  recommendation: 'KEEP' | 'MULLIGAN'
  reasoning: string
} {
  // Helper to convert DeckCard manaCost to SimulatedCard manaCost
  const convertManaCost = (manaCost: string | undefined): { colorless: number; symbols: Record<string, number> } => {
    if (!manaCost) return { colorless: 0, symbols: {} }
    if (typeof manaCost === 'string') return parseManaCostString(manaCost)
    return { colorless: 0, symbols: {} }
  }

  const simulatedHand: SimulatedHand = {
    cards: hand.map(c => ({
      name: c.name,
      cmc: c.cmc,
      isLand: c.isLand,
      manaCost: convertManaCost(c.manaCost),
      quantity: 1
    })),
    lands: hand.filter(c => c.isLand).map(c => ({
      name: c.name,
      cmc: c.cmc,
      isLand: true,
      manaCost: convertManaCost(c.manaCost),
      quantity: 1
    })),
    spells: hand.filter(c => !c.isLand).map(c => ({
      name: c.name,
      cmc: c.cmc,
      isLand: false,
      manaCost: convertManaCost(c.manaCost),
      quantity: 1
    })),
    landCount: hand.filter(c => c.isLand).length,
    totalCMC: hand.filter(c => !c.isLand).reduce((sum, c) => sum + c.cmc, 0)
  }

  const deck = remainingDeck.map(c => ({
    name: c.name,
    cmc: c.cmc,
    isLand: c.isLand,
    manaCost: convertManaCost(c.manaCost),
    quantity: 1
  }))

  const goldfish = simulateGoldfish(simulatedHand, deck)
  const score = calculateHandScore(goldfish, simulatedHand)

  const threshold = hand.length === 7 ? optimalStrategy.keep7Threshold :
                    hand.length === 6 ? optimalStrategy.keep6Threshold :
                    optimalStrategy.keep5Threshold

  const recommendation = score >= threshold ? 'KEEP' : 'MULLIGAN'

  let reasoning = `Score: ${score.toFixed(0)}/100 | Threshold: ${threshold.toFixed(0)}`
  if (recommendation === 'KEEP') {
    reasoning += ` | Hand performs above average`
  } else {
    reasoning += ` | Mulligan improves expected outcome`
  }

  return { score, recommendation, reasoning }
}
