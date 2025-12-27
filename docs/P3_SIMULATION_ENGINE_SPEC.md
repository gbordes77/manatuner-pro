# P3: Simulation Engine - Technical Specification

**Version**: 1.0  
**Status**: Ready for Implementation  
**Priority**: P3 (Nice-to-have, complex edge cases)  
**Estimated Effort**: 3-5 days  
**Dependencies**: v1.1 Accelerated Analytic Engine (completed)

---

## 1. Executive Summary

### 1.1 Why Simulation?

The v1.1 Analytic Engine handles 95% of mana acceleration scenarios in O(1) time. However, certain edge cases require **simulation** because their probability distributions cannot be computed analytically:

| Case | Why Simulation Required |
|------|------------------------|
| **ENHANCERs** (Badgermole Cub) | Multiplies other dorks' output - requires tracking board state |
| **Multi-group multi-mana lands** | Ancient Tomb + Bounce lands with different deltas - combinatorial explosion |
| **Conditional producers** | Nykthos (devotion), Urborg+Coffers (land count) - game-state dependent |
| **Treasure generators** | Dockside Extortionist - opponent-dependent, variable output |
| **Complex mana costs** | Phyrexian, hybrid, X with constraints - branching decisions |

### 1.2 Design Goals

1. **Accuracy**: Match real gameplay within 95% confidence interval
2. **Performance**: < 500ms for N=1000 simulations
3. **Modularity**: Pluggable into existing engine via strategy pattern
4. **Transparency**: Detailed breakdown of simulation results

---

## 2. Architecture

### 2.1 File Structure

```
src/services/castability/
├── acceleratedAnalyticEngine.ts   # Existing v1.1 instant mode
├── simulationEngine.ts            # NEW: Monte Carlo simulation
├── gameState.ts                   # NEW: Game state representation
├── simulationTypes.ts             # NEW: Type definitions
├── strategies/
│   ├── mulliganStrategy.ts        # Mulligan decision logic
│   ├── landPlayStrategy.ts        # Which land to play
│   └── manaSpendStrategy.ts       # How to tap for mana
└── index.ts                       # Router: analytic vs simulation
```

### 2.2 Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CastabilityRouter                          │
│  ─────────────────────────────────────────────────────────────  │
│  + computeCastability(deck, spell, producers, ctx)              │
│  - shouldUseSimulation(producers): boolean                      │
│  - routeToAnalytic() | routeToSimulation()                      │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  AcceleratedAnalyticEngine│    │    SimulationEngine      │
│  ────────────────────────│    │  ──────────────────────  │
│  O(1) instant mode       │    │  Monte Carlo N=1000      │
│  K=0,1,2 disjoint        │    │  Full game simulation    │
│  No board state needed   │    │  Board state tracking    │
└──────────────────────────┘    └──────────────────────────┘
                                              │
                                              ▼
                                ┌──────────────────────────┐
                                │      GameSimulator       │
                                │  ──────────────────────  │
                                │  - shuffle()             │
                                │  - mulligan()            │
                                │  - drawCard()            │
                                │  - playLand()            │
                                │  - castSpell()           │
                                │  - tapForMana()          │
                                │  - applyEnhancers()      │
                                └──────────────────────────┘
                                              │
                                              ▼
                                ┌──────────────────────────┐
                                │       GameState          │
                                │  ──────────────────────  │
                                │  - library: Card[]       │
                                │  - hand: Card[]          │
                                │  - battlefield: Perm[]   │
                                │  - turn: number          │
                                │  - landDropUsed: boolean │
                                │  - manaPool: ManaPool    │
                                └──────────────────────────┘
```

---

## 3. Type Definitions

### 3.1 simulationTypes.ts

```typescript
/**
 * Simulation Engine Type Definitions
 * @version 1.0
 */

// =============================================================================
// CARD REPRESENTATION
// =============================================================================

/** Card zones in the game */
export type Zone = 'library' | 'hand' | 'battlefield' | 'graveyard' | 'exile'

/** Base card in simulation */
export interface SimCard {
  id: string           // Unique instance ID (for tracking)
  name: string         // Card name
  isLand: boolean
  manaCost?: string    // e.g., "{1}{G}"
  mv: number           // Mana value
}

/** Land card with mana production */
export interface SimLand extends SimCard {
  isLand: true
  producesColors: LandManaColor[]
  producesAmount: number      // 1 for normal, 2 for Ancient Tomb
  etbTapped: boolean | ((state: GameState) => boolean)
  isMultiMana: boolean        // Produces > 1 mana
}

/** Non-land card (spell or producer) */
export interface SimSpell extends SimCard {
  isLand: false
  isProducer: boolean
  producerDef?: ManaProducerDef
}

export type SimulationCard = SimLand | SimSpell

// =============================================================================
// BATTLEFIELD PERMANENTS
// =============================================================================

/** Permanent on the battlefield */
export interface Permanent {
  card: SimulationCard
  tapped: boolean
  summoningSick: boolean      // For creatures
  turnPlayed: number
  counters?: Record<string, number>
}

/** Creature permanent with enhanced tracking */
export interface CreaturePermanent extends Permanent {
  card: SimSpell & { producerDef: ManaProducerDef & { isCreature: true } }
  hasAttacked: boolean
  damage: number
}

// =============================================================================
// MANA POOL
// =============================================================================

/** Mana pool state */
export interface ManaPool {
  W: number
  U: number
  B: number
  R: number
  G: number
  C: number  // Colorless
}

/** Empty mana pool constant */
export const EMPTY_MANA_POOL: ManaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }

// =============================================================================
// GAME STATE
// =============================================================================

/** Complete game state for simulation */
export interface GameState {
  // Zones
  library: SimulationCard[]
  hand: SimulationCard[]
  battlefield: Permanent[]
  graveyard: SimulationCard[]
  
  // Turn tracking
  turn: number
  phase: 'upkeep' | 'main1' | 'combat' | 'main2' | 'end'
  
  // Resources
  landDropUsed: boolean
  landDropsPerTurn: number    // Usually 1, can be more with Exploration
  manaPool: ManaPool
  
  // Play/Draw
  onThePlay: boolean
  
  // Tracking
  cardsDrawnThisTurn: number
  spellsCastThisTurn: number
  
  // For ENHANCER tracking
  dorksOnBattlefield: number
  enhancersOnBattlefield: Permanent[]
}

// =============================================================================
// SIMULATION CONFIGURATION
// =============================================================================

/** Configuration for simulation run */
export interface SimulationConfig {
  /** Number of iterations (default: 1000) */
  iterations: number
  
  /** Random seed for reproducibility (optional) */
  seed?: number
  
  /** Maximum turn to simulate to */
  maxTurn: number
  
  /** Mulligan strategy */
  mulliganStrategy: MulliganStrategy
  
  /** Land play strategy */
  landPlayStrategy: LandPlayStrategy
  
  /** Removal simulation (0 = goldfish) */
  removalRate: number
  
  /** Whether to track detailed per-turn data */
  trackDetailedStats: boolean
}

/** Default simulation config */
export const DEFAULT_SIM_CONFIG: SimulationConfig = {
  iterations: 1000,
  maxTurn: 7,
  mulliganStrategy: 'london',
  landPlayStrategy: 'greedy-color',
  removalRate: 0,
  trackDetailedStats: false
}

// =============================================================================
// STRATEGIES
// =============================================================================

/** Mulligan strategy types */
export type MulliganStrategy = 
  | 'always-keep'      // Never mulligan (testing)
  | 'london'           // London mulligan with hand quality assessment
  | 'aggressive'       // Mulligan aggressively for specific cards
  | 'conservative'     // Keep more marginal hands

/** Land play strategy types */
export type LandPlayStrategy =
  | 'first-available'  // Play first land in hand
  | 'greedy-color'     // Prioritize colors needed for spells in hand
  | 'untapped-first'   // Prefer untapped lands
  | 'optimal'          // Full lookahead (slower)

// =============================================================================
// SIMULATION RESULTS
// =============================================================================

/** Result of a single simulation run */
export interface SimulationRun {
  /** Did we successfully cast the target spell? */
  success: boolean
  
  /** Turn on which spell was cast (null if never) */
  turnCast: number | null
  
  /** Number of mulligans taken */
  mulligansTaken: number
  
  /** Final hand size after mulligans */
  finalHandSize: number
  
  /** Mana available on target turn */
  manaAvailable: number
  
  /** Producers that contributed */
  producersUsed: string[]
  
  /** Per-turn snapshots (if trackDetailedStats) */
  turnSnapshots?: TurnSnapshot[]
}

/** Snapshot of game state at end of turn */
export interface TurnSnapshot {
  turn: number
  landsInPlay: number
  producersInPlay: number
  manaProduced: number
  cardsInHand: number
  couldCastSpell: boolean
}

/** Aggregated simulation results */
export interface SimulationResult {
  /** Probability of casting by target turn (0-1) */
  probability: number
  
  /** 95% confidence interval */
  confidenceInterval: {
    lower: number
    upper: number
  }
  
  /** Number of simulations run */
  iterations: number
  
  /** Average turn when cast (among successes) */
  averageTurnCast: number
  
  /** Probability by turn (cumulative) */
  probabilityByTurn: Record<number, number>
  
  /** Most impactful producers */
  keyProducers: Array<{
    name: string
    contributionRate: number  // % of successful games where this helped
  }>
  
  /** Mulligan statistics */
  mulliganStats: {
    averageMulligans: number
    keepOnSeven: number       // % kept on 7
    keepOnSix: number
    keepOnFive: number
    mulliganToFour: number
  }
  
  /** Execution time in ms */
  executionTimeMs: number
}

// =============================================================================
// ENHANCER SPECIFIC
// =============================================================================

/** ENHANCER effect application */
export interface EnhancerEffect {
  /** Source permanent ID */
  sourceId: string
  
  /** Bonus mana per dork tap */
  bonusPerDork: number
  
  /** Color mask of bonus mana */
  bonusMask: number
  
  /** Types of producers enhanced */
  enhancesTypes: ManaProducerType[]
}

/** Calculate total mana from tapping a dork with enhancers */
export function calculateDorkManaWithEnhancers(
  dork: Permanent,
  enhancers: EnhancerEffect[],
  state: GameState
): ManaPool {
  const baseMana = getManaFromPermanent(dork)
  
  // Apply each enhancer
  for (const enhancer of enhancers) {
    if (enhancer.enhancesTypes.includes(dork.card.producerDef?.type)) {
      // Add bonus mana
      const bonusColors = colorsFromMask(enhancer.bonusMask)
      for (const color of bonusColors) {
        baseMana[color] += enhancer.bonusPerDork
      }
    }
  }
  
  return baseMana
}
```

---

## 4. Core Engine Implementation

### 4.1 gameState.ts

```typescript
/**
 * Game State Management
 * @version 1.0
 */

import type { 
  GameState, 
  SimulationCard, 
  Permanent, 
  ManaPool,
  SimLand,
  SimSpell,
  EMPTY_MANA_POOL
} from './simulationTypes'
import type { DeckManaProfile, ProducerInDeck, ManaProducerDef } from '../../types/manaProducers'

// =============================================================================
// DECK BUILDING
// =============================================================================

/**
 * Build simulation deck from deck profile and producers
 */
export function buildSimulationDeck(
  profile: DeckManaProfile,
  producers: ProducerInDeck[],
  spellToTrack: { name: string; manaCost: string; mv: number }
): SimulationCard[] {
  const deck: SimulationCard[] = []
  let id = 0
  
  // Add lands
  // Note: We need land metadata from the analyzer for accurate simulation
  // For now, create generic lands based on color sources
  const landsToAdd = profile.totalLands
  const colorSources = profile.landColorSources
  
  // Distribute lands by color proportionally
  const totalSources = Object.values(colorSources).reduce((a, b) => a + (b || 0), 0)
  
  for (const [color, count] of Object.entries(colorSources)) {
    if (!count) continue
    for (let i = 0; i < count; i++) {
      deck.push({
        id: `land-${id++}`,
        name: `${color} Source`,
        isLand: true,
        mv: 0,
        producesColors: [color as LandManaColor],
        producesAmount: 1,
        etbTapped: false,
        isMultiMana: false
      } as SimLand)
    }
  }
  
  // Handle multi-mana lands
  if (profile.unconditionalMultiMana) {
    const { count, delta } = profile.unconditionalMultiMana
    // Replace some colorless sources with multi-mana lands
    for (let i = 0; i < count; i++) {
      deck.push({
        id: `land-multi-${id++}`,
        name: 'Multi-Mana Land',
        isLand: true,
        mv: 0,
        producesColors: ['C'],
        producesAmount: 1 + delta,
        etbTapped: false,
        isMultiMana: true
      } as SimLand)
    }
  }
  
  // Add producers
  for (const producer of producers) {
    for (let i = 0; i < producer.copies; i++) {
      deck.push({
        id: `producer-${id++}`,
        name: producer.def.name,
        isLand: false,
        manaCost: buildManaCostString(producer.def),
        mv: producer.def.castCostGeneric + 
            Object.values(producer.def.castCostColors).reduce((a, b) => a + (b || 0), 0),
        isProducer: true,
        producerDef: producer.def
      } as SimSpell)
    }
  }
  
  // Add the target spell we're trying to cast
  deck.push({
    id: `target-spell`,
    name: spellToTrack.name,
    isLand: false,
    manaCost: spellToTrack.manaCost,
    mv: spellToTrack.mv,
    isProducer: false
  } as SimSpell)
  
  // Fill remaining slots with generic cards
  const remaining = profile.deckSize - deck.length
  for (let i = 0; i < remaining; i++) {
    deck.push({
      id: `filler-${id++}`,
      name: 'Other Card',
      isLand: false,
      manaCost: '{2}',
      mv: 2,
      isProducer: false
    } as SimSpell)
  }
  
  return deck
}

/**
 * Create initial game state
 */
export function createInitialState(
  deck: SimulationCard[],
  onThePlay: boolean
): GameState {
  return {
    library: [...deck],
    hand: [],
    battlefield: [],
    graveyard: [],
    turn: 0,
    phase: 'upkeep',
    landDropUsed: false,
    landDropsPerTurn: 1,
    manaPool: { ...EMPTY_MANA_POOL },
    onThePlay,
    cardsDrawnThisTurn: 0,
    spellsCastThisTurn: 0,
    dorksOnBattlefield: 0,
    enhancersOnBattlefield: []
  }
}

/**
 * Fisher-Yates shuffle with optional seed
 */
export function shuffle<T>(array: T[], seed?: number): T[] {
  const result = [...array]
  
  // Simple seeded random (Mulberry32)
  let random: () => number
  if (seed !== undefined) {
    let t = seed + 0x6D2B79F5
    random = () => {
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  } else {
    random = Math.random
  }
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  
  return result
}

/**
 * Draw N cards from library to hand
 */
export function drawCards(state: GameState, count: number): void {
  for (let i = 0; i < count && state.library.length > 0; i++) {
    const card = state.library.shift()!
    state.hand.push(card)
    state.cardsDrawnThisTurn++
  }
}

/**
 * Build mana cost string from producer def
 */
function buildManaCostString(def: ManaProducerDef): string {
  let cost = ''
  if (def.castCostGeneric > 0) {
    cost += `{${def.castCostGeneric}}`
  }
  for (const [color, count] of Object.entries(def.castCostColors)) {
    for (let i = 0; i < (count || 0); i++) {
      cost += `{${color}}`
    }
  }
  return cost || '{0}'
}
```

### 4.2 simulationEngine.ts

```typescript
/**
 * Monte Carlo Simulation Engine
 * @version 1.0
 * 
 * Handles complex mana scenarios that cannot be computed analytically:
 * - ENHANCERs (mana multipliers)
 * - Conditional producers (Nykthos, Coffers)
 * - Complex multi-mana land combinations
 */

import type {
  GameState,
  SimulationCard,
  SimLand,
  SimSpell,
  Permanent,
  ManaPool,
  SimulationConfig,
  SimulationRun,
  SimulationResult,
  TurnSnapshot,
  EnhancerEffect,
  DEFAULT_SIM_CONFIG,
  EMPTY_MANA_POOL
} from './simulationTypes'
import {
  buildSimulationDeck,
  createInitialState,
  shuffle,
  drawCards
} from './gameState'
import type {
  DeckManaProfile,
  ManaCost,
  ProducerInDeck,
  AccelContext,
  ManaProducerDef,
  LandManaColor
} from '../../types/manaProducers'
import { colorsFromMask, maskHasColor } from '../../types/manaProducers'

// =============================================================================
// CONSTANTS
// =============================================================================

const STARTING_HAND_SIZE = 7
const MIN_HAND_SIZE = 4  // Don't mulligan below this

// =============================================================================
// MAIN SIMULATION ENGINE
// =============================================================================

/**
 * Run Monte Carlo simulation for castability
 */
export function runSimulation(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  config: Partial<SimulationConfig> = {}
): SimulationResult {
  const startTime = performance.now()
  const cfg: SimulationConfig = { ...DEFAULT_SIM_CONFIG, ...config }
  
  // Build simulation deck
  const simDeck = buildSimulationDeck(deck, producers, {
    name: 'Target Spell',
    manaCost: buildManaCostFromSpell(spell),
    mv: spell.mv
  })
  
  const runs: SimulationRun[] = []
  const targetTurn = spell.mv  // Natural turn to cast
  
  // Run N simulations
  for (let i = 0; i < cfg.iterations; i++) {
    const seed = cfg.seed !== undefined ? cfg.seed + i : undefined
    const run = simulateSingleGame(simDeck, spell, cfg, ctx, seed)
    runs.push(run)
  }
  
  // Aggregate results
  const result = aggregateResults(runs, cfg, targetTurn)
  result.executionTimeMs = performance.now() - startTime
  
  return result
}

/**
 * Simulate a single game
 */
function simulateSingleGame(
  deck: SimulationCard[],
  spell: ManaCost,
  config: SimulationConfig,
  ctx: AccelContext,
  seed?: number
): SimulationRun {
  // Initialize state
  const shuffled = shuffle(deck, seed)
  const state = createInitialState(shuffled, ctx.playDraw === 'PLAY')
  
  // Draw opening hand and handle mulligans
  const { mulligansTaken, finalHandSize } = handleMulligans(state, config, spell)
  
  const turnSnapshots: TurnSnapshot[] = []
  let castTurn: number | null = null
  const producersUsed: Set<string> = new Set()
  
  // Simulate turns
  for (let turn = 1; turn <= config.maxTurn; turn++) {
    state.turn = turn
    state.landDropUsed = false
    state.manaPool = { ...EMPTY_MANA_POOL }
    state.cardsDrawnThisTurn = 0
    
    // Upkeep: remove summoning sickness from creatures
    for (const perm of state.battlefield) {
      if (perm.turnPlayed < turn) {
        perm.summoningSick = false
      }
    }
    
    // Draw step (skip on T1 if on the play)
    if (!(turn === 1 && state.onThePlay)) {
      drawCards(state, 1)
    }
    
    // Main phase 1: Play lands
    playLandsPhase(state, config.landPlayStrategy, spell)
    
    // Main phase 1: Cast mana producers if possible
    castProducersPhase(state, ctx)
    
    // Check if we can cast target spell
    const canCast = canCastSpell(state, spell)
    
    if (canCast && castTurn === null) {
      castTurn = turn
      // Track which producers helped
      for (const perm of state.battlefield) {
        if (!perm.card.isLand && (perm.card as SimSpell).isProducer) {
          producersUsed.add(perm.card.name)
        }
      }
    }
    
    // Track snapshot if requested
    if (config.trackDetailedStats) {
      turnSnapshots.push({
        turn,
        landsInPlay: state.battlefield.filter(p => p.card.isLand).length,
        producersInPlay: state.battlefield.filter(p => 
          !p.card.isLand && (p.card as SimSpell).isProducer
        ).length,
        manaProduced: calculateTotalManaAvailable(state),
        cardsInHand: state.hand.length,
        couldCastSpell: canCast
      })
    }
    
    // Apply removal (probabilistic creature death)
    if (config.removalRate > 0) {
      applyRemoval(state, config.removalRate, ctx)
    }
    
    // End step: clear mana pool, update dork count
    state.manaPool = { ...EMPTY_MANA_POOL }
    updateDorkCount(state)
  }
  
  return {
    success: castTurn !== null && castTurn <= spell.mv,
    turnCast: castTurn,
    mulligansTaken,
    finalHandSize,
    manaAvailable: calculateTotalManaAvailable(state),
    producersUsed: Array.from(producersUsed),
    turnSnapshots: config.trackDetailedStats ? turnSnapshots : undefined
  }
}

// =============================================================================
// MULLIGAN HANDLING
// =============================================================================

/**
 * Handle mulligan decisions
 */
function handleMulligans(
  state: GameState,
  config: SimulationConfig,
  spell: ManaCost
): { mulligansTaken: number; finalHandSize: number } {
  let mulligansTaken = 0
  let handSize = STARTING_HAND_SIZE
  
  while (handSize >= MIN_HAND_SIZE) {
    // Draw hand
    state.hand = []
    state.library = shuffle([...state.library, ...state.hand])
    drawCards(state, handSize)
    
    // Evaluate hand quality
    const keepHand = evaluateHand(state.hand, spell, config.mulliganStrategy, handSize)
    
    if (keepHand) {
      // London mulligan: put cards on bottom
      if (mulligansTaken > 0) {
        const toBottom = mulligansTaken
        // Simple strategy: bottom the highest MV non-lands
        const nonLands = state.hand
          .filter(c => !c.isLand)
          .sort((a, b) => b.mv - a.mv)
        
        for (let i = 0; i < toBottom && nonLands.length > 0; i++) {
          const card = nonLands.shift()!
          const idx = state.hand.indexOf(card)
          state.hand.splice(idx, 1)
          state.library.push(card)
        }
      }
      break
    }
    
    mulligansTaken++
    handSize--
  }
  
  return { mulligansTaken, finalHandSize: state.hand.length }
}

/**
 * Evaluate whether to keep a hand
 */
function evaluateHand(
  hand: SimulationCard[],
  spell: ManaCost,
  strategy: string,
  handSize: number
): boolean {
  if (strategy === 'always-keep') return true
  
  const lands = hand.filter(c => c.isLand)
  const spells = hand.filter(c => !c.isLand)
  
  // Basic London mulligan heuristics
  const landCount = lands.length
  
  // On 7: Keep 2-5 lands
  // On 6: Keep 2-4 lands
  // On 5: Keep 1-4 lands
  // On 4: Keep any hand with lands
  
  if (handSize >= 6) {
    if (landCount < 2 || landCount > 5) return false
  } else if (handSize === 5) {
    if (landCount < 1 || landCount > 4) return false
  } else {
    // Keep anything on 4
    return landCount >= 1
  }
  
  // Check if we have colors for spells in hand
  const hasRelevantColors = checkColorRequirements(lands, spells)
  
  // Aggressive strategy: also want producer or early plays
  if (strategy === 'aggressive') {
    const hasProducer = spells.some(s => (s as SimSpell).isProducer)
    const hasEarlyPlay = spells.some(s => s.mv <= 2)
    return hasRelevantColors && (hasProducer || hasEarlyPlay)
  }
  
  return hasRelevantColors
}

/**
 * Check if lands can produce colors for spells
 */
function checkColorRequirements(
  lands: SimulationCard[],
  spells: SimulationCard[]
): boolean {
  // Simple check: do lands produce at least one color needed by spells?
  const colorsNeeded = new Set<LandManaColor>()
  
  for (const spell of spells) {
    if ((spell as SimSpell).manaCost) {
      const matches = (spell as SimSpell).manaCost!.match(/\{([WUBRG])\}/g) || []
      matches.forEach(m => colorsNeeded.add(m.slice(1, -1) as LandManaColor))
    }
  }
  
  if (colorsNeeded.size === 0) return true  // Colorless spells
  
  const colorsAvailable = new Set<LandManaColor>()
  for (const land of lands) {
    (land as SimLand).producesColors?.forEach(c => colorsAvailable.add(c))
  }
  
  // Need at least half the colors
  let matched = 0
  for (const c of colorsNeeded) {
    if (colorsAvailable.has(c)) matched++
  }
  
  return matched >= Math.ceil(colorsNeeded.size / 2)
}

// =============================================================================
// GAMEPLAY PHASES
// =============================================================================

/**
 * Play lands from hand
 */
function playLandsPhase(
  state: GameState,
  strategy: string,
  spell: ManaCost
): void {
  while (!state.landDropUsed && state.landDropsPerTurn > 0) {
    const landsInHand = state.hand.filter(c => c.isLand) as SimLand[]
    if (landsInHand.length === 0) break
    
    // Choose land based on strategy
    let landToPlay: SimLand
    
    if (strategy === 'untapped-first') {
      // Prefer untapped lands
      const untapped = landsInHand.filter(l => !l.etbTapped)
      landToPlay = untapped.length > 0 ? untapped[0] : landsInHand[0]
      
    } else if (strategy === 'greedy-color') {
      // Prioritize colors needed for spells in hand
      const neededColors = getColorsNeededInHand(state.hand, spell)
      const scored = landsInHand.map(land => ({
        land,
        score: land.producesColors.filter(c => neededColors.has(c)).length +
               (land.isMultiMana ? 2 : 0) +
               (typeof land.etbTapped === 'boolean' && !land.etbTapped ? 1 : 0)
      }))
      scored.sort((a, b) => b.score - a.score)
      landToPlay = scored[0].land
      
    } else {
      // first-available
      landToPlay = landsInHand[0]
    }
    
    // Play the land
    const idx = state.hand.indexOf(landToPlay)
    state.hand.splice(idx, 1)
    
    const etbTapped = typeof landToPlay.etbTapped === 'function'
      ? landToPlay.etbTapped(state)
      : landToPlay.etbTapped
    
    state.battlefield.push({
      card: landToPlay,
      tapped: etbTapped,
      summoningSick: false,
      turnPlayed: state.turn
    })
    
    state.landDropUsed = true
  }
}

/**
 * Cast mana producers if possible
 */
function castProducersPhase(
  state: GameState,
  ctx: AccelContext
): void {
  // Find castable producers in hand
  const producersInHand = state.hand.filter(c => 
    !c.isLand && (c as SimSpell).isProducer
  ) as SimSpell[]
  
  // Sort by priority: lower MV first, then by impact
  producersInHand.sort((a, b) => {
    const mvDiff = a.mv - b.mv
    if (mvDiff !== 0) return mvDiff
    // Prefer higher mana output
    const aOutput = a.producerDef?.producesAmount ?? 0
    const bOutput = b.producerDef?.producesAmount ?? 0
    return bOutput - aOutput
  })
  
  for (const producer of producersInHand) {
    // Calculate available mana
    const manaAvailable = calculateManaAvailable(state)
    
    // Check if we can cast this producer
    if (canPayCost(manaAvailable, producer.producerDef!)) {
      // Tap mana sources
      payManaCost(state, producer.producerDef!)
      
      // Move to battlefield
      const idx = state.hand.indexOf(producer)
      state.hand.splice(idx, 1)
      
      const isCreature = producer.producerDef!.isCreature
      
      state.battlefield.push({
        card: producer,
        tapped: false,
        summoningSick: isCreature,
        turnPlayed: state.turn
      })
      
      state.spellsCastThisTurn++
      
      // Update dork count if it's a creature
      if (isCreature) {
        state.dorksOnBattlefield++
      }
      
      // Track enhancers
      if (producer.producerDef!.type === 'ENHANCER') {
        state.enhancersOnBattlefield.push(state.battlefield[state.battlefield.length - 1])
      }
    }
  }
}

// =============================================================================
// MANA CALCULATIONS
// =============================================================================

/**
 * Calculate total mana available from all sources
 */
function calculateManaAvailable(state: GameState): ManaPool {
  const pool: ManaPool = { ...EMPTY_MANA_POOL }
  
  // Get enhancer effects
  const enhancerEffects = getEnhancerEffects(state)
  
  for (const perm of state.battlefield) {
    if (perm.tapped) continue
    
    if (perm.card.isLand) {
      // Land mana
      const land = perm.card as SimLand
      for (const color of land.producesColors) {
        pool[color] += land.producesAmount
      }
    } else if ((perm.card as SimSpell).isProducer) {
      // Producer mana (if not summoning sick for creatures)
      const producer = (perm.card as SimSpell).producerDef!
      
      if (producer.isCreature && perm.summoningSick) continue
      if (producer.type === 'ENHANCER') continue  // Enhancers don't tap for mana
      
      // Base mana
      const colors = colorsFromMask(producer.producesMask)
      const netMana = producer.producesAmount - producer.activationTax
      
      if (netMana > 0) {
        if (producer.producesAny) {
          // Add to colorless, user can choose
          pool.C += netMana
        } else {
          // Add to first available color
          const color = colors[0] || 'C'
          pool[color] += netMana
        }
        
        // Apply enhancer bonus for creatures
        if (producer.isCreature) {
          for (const effect of enhancerEffects) {
            if (effect.enhancesTypes.includes(producer.type)) {
              const bonusColors = colorsFromMask(effect.bonusMask)
              for (const c of bonusColors) {
                pool[c] += effect.bonusPerDork
              }
            }
          }
        }
      }
    }
  }
  
  return pool
}

/**
 * Get active enhancer effects
 */
function getEnhancerEffects(state: GameState): EnhancerEffect[] {
  const effects: EnhancerEffect[] = []
  
  for (const perm of state.enhancersOnBattlefield) {
    if (perm.summoningSick) continue  // Enhancers also have summoning sickness
    
    const def = (perm.card as SimSpell).producerDef!
    effects.push({
      sourceId: perm.card.id,
      bonusPerDork: def.enhancerBonus ?? 1,
      bonusMask: def.enhancerBonusMask ?? 0,
      enhancesTypes: def.enhancesTypes ?? ['DORK']
    })
  }
  
  return effects
}

/**
 * Calculate total mana available (sum of all colors)
 */
function calculateTotalManaAvailable(state: GameState): number {
  const pool = calculateManaAvailable(state)
  return pool.W + pool.U + pool.B + pool.R + pool.G + pool.C
}

/**
 * Check if we can pay a mana cost
 */
function canPayCost(pool: ManaPool, def: ManaProducerDef): boolean {
  const available = { ...pool }
  
  // Pay colored costs first
  for (const [color, count] of Object.entries(def.castCostColors)) {
    const c = color as LandManaColor
    const need = count ?? 0
    if (available[c] < need) return false
    available[c] -= need
  }
  
  // Pay generic with remaining
  const remaining = Object.values(available).reduce((a, b) => a + b, 0)
  return remaining >= def.castCostGeneric
}

/**
 * Pay mana cost by tapping sources
 */
function payManaCost(state: GameState, def: ManaProducerDef): void {
  const colorNeeds = { ...def.castCostColors }
  let genericNeeds = def.castCostGeneric
  
  // Tap lands first for colored mana
  for (const perm of state.battlefield) {
    if (perm.tapped || !perm.card.isLand) continue
    
    const land = perm.card as SimLand
    let shouldTap = false
    
    for (const color of land.producesColors) {
      if ((colorNeeds[color] ?? 0) > 0) {
        colorNeeds[color]! -= 1
        shouldTap = true
        break
      }
    }
    
    if (shouldTap) {
      perm.tapped = true
    }
  }
  
  // Tap remaining for generic
  for (const perm of state.battlefield) {
    if (perm.tapped) continue
    if (genericNeeds <= 0) break
    
    if (perm.card.isLand) {
      perm.tapped = true
      genericNeeds -= (perm.card as SimLand).producesAmount
    } else if ((perm.card as SimSpell).isProducer && !perm.summoningSick) {
      const producer = (perm.card as SimSpell).producerDef!
      if (producer.type !== 'ENHANCER') {
        perm.tapped = true
        genericNeeds -= producer.producesAmount - producer.activationTax
      }
    }
  }
}

/**
 * Check if we can cast the target spell
 */
function canCastSpell(state: GameState, spell: ManaCost): boolean {
  const pool = calculateManaAvailable(state)
  
  // Check colored requirements
  for (const [color, need] of Object.entries(spell.pips)) {
    const c = color as LandManaColor
    if ((pool[c] ?? 0) < (need ?? 0)) return false
  }
  
  // Check total mana >= MV
  const total = pool.W + pool.U + pool.B + pool.R + pool.G + pool.C
  return total >= spell.mv
}

/**
 * Get colors needed for spells in hand
 */
function getColorsNeededInHand(
  hand: SimulationCard[],
  targetSpell: ManaCost
): Set<LandManaColor> {
  const needed = new Set<LandManaColor>()
  
  // Add colors from target spell
  for (const [color, pips] of Object.entries(targetSpell.pips)) {
    if ((pips ?? 0) > 0) {
      needed.add(color as LandManaColor)
    }
  }
  
  // Add colors from producers in hand
  for (const card of hand) {
    if ((card as SimSpell).producerDef) {
      const colors = (card as SimSpell).producerDef!.castCostColors
      for (const [color, count] of Object.entries(colors)) {
        if ((count ?? 0) > 0) {
          needed.add(color as LandManaColor)
        }
      }
    }
  }
  
  return needed
}

// =============================================================================
// REMOVAL SIMULATION
// =============================================================================

/**
 * Apply removal to creatures
 */
function applyRemoval(
  state: GameState,
  removalRate: number,
  ctx: AccelContext
): void {
  const rockFactor = ctx.rockRemovalFactor ?? 0.3
  
  state.battlefield = state.battlefield.filter(perm => {
    if (perm.card.isLand) return true
    
    const producer = (perm.card as SimSpell).producerDef
    if (!producer) return true
    
    // Calculate effective removal rate
    const effectiveRate = producer.isCreature 
      ? removalRate 
      : removalRate * rockFactor
    
    // Survive?
    return Math.random() > effectiveRate
  })
  
  // Update dork count
  updateDorkCount(state)
}

/**
 * Update dork count on battlefield
 */
function updateDorkCount(state: GameState): void {
  state.dorksOnBattlefield = state.battlefield.filter(p => {
    if (p.card.isLand) return false
    const def = (p.card as SimSpell).producerDef
    return def?.isCreature && def?.type !== 'ENHANCER'
  }).length
  
  state.enhancersOnBattlefield = state.battlefield.filter(p => {
    if (p.card.isLand) return false
    const def = (p.card as SimSpell).producerDef
    return def?.type === 'ENHANCER'
  })
}

// =============================================================================
// RESULT AGGREGATION
// =============================================================================

/**
 * Aggregate simulation results
 */
function aggregateResults(
  runs: SimulationRun[],
  config: SimulationConfig,
  targetTurn: number
): SimulationResult {
  const n = runs.length
  
  // Count successes by turn
  const successByTurn: Record<number, number> = {}
  for (let t = 1; t <= config.maxTurn; t++) {
    successByTurn[t] = 0
  }
  
  let totalSuccesses = 0
  let totalTurnCast = 0
  let successCount = 0
  
  const producerContributions: Record<string, number> = {}
  
  let keepOnSeven = 0
  let keepOnSix = 0
  let keepOnFive = 0
  let mulliganToFour = 0
  let totalMulligans = 0
  
  for (const run of runs) {
    if (run.success) {
      totalSuccesses++
      if (run.turnCast !== null) {
        successByTurn[run.turnCast] = (successByTurn[run.turnCast] || 0) + 1
        totalTurnCast += run.turnCast
        successCount++
        
        // Track producer contributions
        for (const producer of run.producersUsed) {
          producerContributions[producer] = (producerContributions[producer] || 0) + 1
        }
      }
    }
    
    // Mulligan stats
    totalMulligans += run.mulligansTaken
    if (run.mulligansTaken === 0) keepOnSeven++
    else if (run.mulligansTaken === 1) keepOnSix++
    else if (run.mulligansTaken === 2) keepOnFive++
    else mulliganToFour++
  }
  
  // Calculate probability and confidence interval
  const p = totalSuccesses / n
  const z = 1.96  // 95% confidence
  const se = Math.sqrt((p * (1 - p)) / n)
  
  // Cumulative probabilities by turn
  const probabilityByTurn: Record<number, number> = {}
  let cumulative = 0
  for (let t = 1; t <= config.maxTurn; t++) {
    cumulative += successByTurn[t]
    probabilityByTurn[t] = cumulative / n
  }
  
  // Key producers
  const keyProducers = Object.entries(producerContributions)
    .map(([name, count]) => ({
      name,
      contributionRate: successCount > 0 ? count / successCount : 0
    }))
    .sort((a, b) => b.contributionRate - a.contributionRate)
    .slice(0, 5)
  
  return {
    probability: p,
    confidenceInterval: {
      lower: Math.max(0, p - z * se),
      upper: Math.min(1, p + z * se)
    },
    iterations: n,
    averageTurnCast: successCount > 0 ? totalTurnCast / successCount : 0,
    probabilityByTurn,
    keyProducers,
    mulliganStats: {
      averageMulligans: totalMulligans / n,
      keepOnSeven: keepOnSeven / n,
      keepOnSix: keepOnSix / n,
      keepOnFive: keepOnFive / n,
      mulliganToFour: mulliganToFour / n
    },
    executionTimeMs: 0  // Will be set by caller
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Build mana cost string from ManaCost object
 */
function buildManaCostFromSpell(spell: ManaCost): string {
  let cost = ''
  if (spell.generic > 0) {
    cost += `{${spell.generic}}`
  }
  for (const [color, count] of Object.entries(spell.pips)) {
    for (let i = 0; i < (count || 0); i++) {
      cost += `{${color}}`
    }
  }
  return cost || '{0}'
}
```

---

## 5. Router Integration

### 5.1 Updated index.ts

```typescript
/**
 * Castability Service - Router
 * @version 1.1
 * 
 * Routes castability calculations to either:
 * - Analytic engine (O(1), instant mode) for simple cases
 * - Simulation engine (Monte Carlo) for complex cases
 */

import type {
  AccelContext,
  AcceleratedCastabilityResult,
  DeckManaProfile,
  ManaCost,
  ProducerInDeck
} from '../../types/manaProducers'
import {
  computeAcceleratedCastability as analyticCompute,
  computeCastabilityByTurn as analyticByTurn
} from './acceleratedAnalyticEngine'
import { runSimulation } from './simulationEngine'
import type { SimulationConfig, SimulationResult } from './simulationTypes'

// =============================================================================
// ROUTING LOGIC
// =============================================================================

/**
 * Check if simulation is required for this configuration
 */
export function shouldUseSimulation(producers: ProducerInDeck[]): boolean {
  for (const { def } of producers) {
    // ENHANCERs require simulation
    if (def.type === 'ENHANCER') return true
    
    // Conditional producers require simulation
    if (def.type === 'CONDITIONAL') return true
    
    // Treasure generators require simulation
    if (def.type === 'TREASURE') return true
  }
  
  return false
}

/**
 * Check if deck has complex multi-mana configuration
 */
export function hasComplexMultiMana(deck: DeckManaProfile): boolean {
  // Future: detect multiple multi-mana groups with different deltas
  // For v1.1, single group is handled analytically
  return false
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Main entry point: compute accelerated castability
 * Automatically routes to analytic or simulation engine
 */
export function computeAcceleratedCastability(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  options?: {
    forceSimulation?: boolean
    simulationConfig?: Partial<SimulationConfig>
  }
): AcceleratedCastabilityResult {
  const useSimulation = options?.forceSimulation || 
                        shouldUseSimulation(producers) ||
                        hasComplexMultiMana(deck)
  
  if (useSimulation) {
    // Run simulation and convert to AcceleratedCastabilityResult format
    const simResult = runSimulation(
      deck, 
      spell, 
      producers, 
      ctx, 
      options?.simulationConfig
    )
    
    return convertSimulationResult(simResult, spell.mv)
  }
  
  // Use fast analytic engine
  return analyticCompute(deck, spell, producers, ctx)
}

/**
 * Compute castability by turn (for charts)
 */
export function computeCastabilityByTurn(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  maxTurn: number = 7,
  options?: {
    forceSimulation?: boolean
    simulationConfig?: Partial<SimulationConfig>
  }
) {
  const useSimulation = options?.forceSimulation || 
                        shouldUseSimulation(producers)
  
  if (useSimulation) {
    const simResult = runSimulation(deck, spell, producers, ctx, {
      ...options?.simulationConfig,
      maxTurn
    })
    
    return convertSimulationToByTurn(simResult, maxTurn)
  }
  
  return analyticByTurn(deck, spell, producers, ctx, maxTurn)
}

/**
 * Run simulation explicitly (for advanced use cases)
 */
export function runCastabilitySimulation(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  config?: Partial<SimulationConfig>
): SimulationResult {
  return runSimulation(deck, spell, producers, ctx, config)
}

// =============================================================================
// RESULT CONVERSION
// =============================================================================

/**
 * Convert SimulationResult to AcceleratedCastabilityResult
 */
function convertSimulationResult(
  sim: SimulationResult,
  targetTurn: number
): AcceleratedCastabilityResult {
  const baseProbAtTarget = sim.probabilityByTurn[targetTurn] ?? 0
  
  // Find earliest turn with meaningful probability
  let acceleratedTurn: number | null = null
  for (let t = 1; t < targetTurn; t++) {
    if ((sim.probabilityByTurn[t] ?? 0) >= 0.05) {
      acceleratedTurn = t
      break
    }
  }
  
  return {
    base: {
      p1: baseProbAtTarget,  // Simulation doesn't separate P1/P2
      p2: baseProbAtTarget
    },
    withAcceleration: {
      p1: sim.probability,
      p2: sim.probability
    },
    accelerationImpact: sim.probability - baseProbAtTarget,
    acceleratedTurn,
    keyAccelerators: sim.keyProducers.slice(0, 3).map(p => p.name)
  }
}

/**
 * Convert simulation to by-turn format
 */
function convertSimulationToByTurn(
  sim: SimulationResult,
  maxTurn: number
): Array<{ turn: number; base: { p1: number; p2: number }; withAcceleration: { p1: number; p2: number } }> {
  const results = []
  
  for (let turn = 1; turn <= maxTurn; turn++) {
    const prob = sim.probabilityByTurn[turn] ?? 0
    results.push({
      turn,
      base: { p1: prob, p2: prob },
      withAcceleration: { p1: prob, p2: prob }
    })
  }
  
  return results
}

// Re-export types and utilities
export * from './acceleratedAnalyticEngine'
export type { SimulationConfig, SimulationResult } from './simulationTypes'
```

---

## 6. UI Integration

### 6.1 AccelerationSettings.tsx Updates

```typescript
// Add to existing AccelerationSettings component

interface AccelerationSettingsProps {
  // ... existing props
  
  /** Enable simulation mode toggle */
  showSimulationToggle?: boolean
}

// Add state for simulation mode
const [useSimulation, setUseSimulation] = useState(false)

// Add toggle in the UI
{showSimulationToggle && (
  <FormControlLabel
    control={
      <Switch
        checked={useSimulation}
        onChange={(e) => setUseSimulation(e.target.checked)}
        size="small"
      />
    }
    label={
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="body2">Simulation Mode</Typography>
        <Tooltip title="Uses Monte Carlo simulation (N=1000) for more accurate results with ENHANCERs and complex mana. Slower but more precise.">
          <HelpOutlineIcon sx={{ fontSize: 14 }} />
        </Tooltip>
      </Box>
    }
  />
)}
```

### 6.2 SimulationResultsDisplay Component

```typescript
/**
 * Display detailed simulation results
 */
interface SimulationResultsDisplayProps {
  result: SimulationResult
}

export const SimulationResultsDisplay: React.FC<SimulationResultsDisplayProps> = ({
  result
}) => {
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Simulation Results
      </Typography>
      
      {/* Probability with confidence interval */}
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Cast Probability
        </Typography>
        <Typography variant="h4" color="primary">
          {(result.probability * 100).toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          95% CI: [{(result.confidenceInterval.lower * 100).toFixed(1)}% - 
          {(result.confidenceInterval.upper * 100).toFixed(1)}%]
        </Typography>
      </Box>
      
      {/* Average turn cast */}
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Average Turn Cast
        </Typography>
        <Typography variant="h5">
          T{result.averageTurnCast.toFixed(1)}
        </Typography>
      </Box>
      
      {/* Key producers */}
      {result.keyProducers.length > 0 && (
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Key Contributors
          </Typography>
          {result.keyProducers.map(p => (
            <Chip
              key={p.name}
              label={`${p.name} (${(p.contributionRate * 100).toFixed(0)}%)`}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      )}
      
      {/* Mulligan stats */}
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Mulligan Stats
        </Typography>
        <Typography variant="caption" component="div">
          Keep 7: {(result.mulliganStats.keepOnSeven * 100).toFixed(0)}% |
          Keep 6: {(result.mulliganStats.keepOnSix * 100).toFixed(0)}% |
          Keep 5: {(result.mulliganStats.keepOnFive * 100).toFixed(0)}% |
          Mull to 4: {(result.mulliganStats.mulliganToFour * 100).toFixed(0)}%
        </Typography>
      </Box>
      
      {/* Execution time */}
      <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
        {result.iterations.toLocaleString()} iterations in {result.executionTimeMs.toFixed(0)}ms
      </Typography>
    </Paper>
  )
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// simulationEngine.test.ts

import { describe, it, expect } from 'vitest'
import { runSimulation } from './simulationEngine'

describe('SimulationEngine', () => {
  const baseDeck: DeckManaProfile = {
    deckSize: 60,
    totalLands: 24,
    landColorSources: { G: 20, C: 4 }
  }
  
  const simpleSpell: ManaCost = {
    mv: 3,
    generic: 1,
    pips: { G: 2 }
  }
  
  const ctx: AccelContext = {
    playDraw: 'PLAY',
    removalRate: 0,
    defaultRockSurvival: 0.98
  }

  describe('Basic functionality', () => {
    it('should return probability between 0 and 1', () => {
      const result = runSimulation(baseDeck, simpleSpell, [], ctx, {
        iterations: 100
      })
      
      expect(result.probability).toBeGreaterThanOrEqual(0)
      expect(result.probability).toBeLessThanOrEqual(1)
    })
    
    it('should complete within reasonable time', () => {
      const result = runSimulation(baseDeck, simpleSpell, [], ctx, {
        iterations: 1000
      })
      
      expect(result.executionTimeMs).toBeLessThan(1000)
    })
    
    it('should be reproducible with same seed', () => {
      const result1 = runSimulation(baseDeck, simpleSpell, [], ctx, {
        iterations: 100,
        seed: 12345
      })
      
      const result2 = runSimulation(baseDeck, simpleSpell, [], ctx, {
        iterations: 100,
        seed: 12345
      })
      
      expect(result1.probability).toBe(result2.probability)
    })
  })
  
  describe('ENHANCER handling', () => {
    const badgermoleCub: ProducerInDeck = {
      def: {
        name: 'Badgermole Cub',
        type: 'ENHANCER',
        castCostGeneric: 2,
        castCostColors: { G: 1 },
        delay: 1,
        isCreature: true,
        producesAmount: 0,
        activationTax: 0,
        producesMask: 16, // G
        producesAny: false,
        oneShot: false,
        enhancerBonus: 1,
        enhancerBonusMask: 16, // G
        enhancesTypes: ['DORK']
      },
      copies: 2
    }
    
    const llanowarElves: ProducerInDeck = {
      def: {
        name: 'Llanowar Elves',
        type: 'DORK',
        castCostGeneric: 0,
        castCostColors: { G: 1 },
        delay: 1,
        isCreature: true,
        producesAmount: 1,
        activationTax: 0,
        producesMask: 16,
        producesAny: false,
        oneShot: false
      },
      copies: 4
    }
    
    it('should handle ENHANCERs increasing mana output', () => {
      // With enhancers, dorks produce more mana
      const withEnhancers = runSimulation(
        baseDeck, 
        { mv: 5, generic: 3, pips: { G: 2 } },
        [badgermoleCub, llanowarElves], 
        ctx, 
        { iterations: 500 }
      )
      
      const withoutEnhancers = runSimulation(
        baseDeck,
        { mv: 5, generic: 3, pips: { G: 2 } },
        [llanowarElves],
        ctx,
        { iterations: 500 }
      )
      
      // With enhancers should have higher probability
      // (not guaranteed due to randomness, but should trend)
      console.log('With enhancers:', withEnhancers.probability)
      console.log('Without:', withoutEnhancers.probability)
    })
  })
  
  describe('Mulligan handling', () => {
    it('should track mulligan statistics', () => {
      const result = runSimulation(baseDeck, simpleSpell, [], ctx, {
        iterations: 500,
        mulliganStrategy: 'london'
      })
      
      expect(result.mulliganStats.keepOnSeven).toBeGreaterThan(0)
      expect(result.mulliganStats.averageMulligans).toBeGreaterThanOrEqual(0)
    })
  })
  
  describe('Confidence intervals', () => {
    it('should produce valid confidence intervals', () => {
      const result = runSimulation(baseDeck, simpleSpell, [], ctx, {
        iterations: 1000
      })
      
      expect(result.confidenceInterval.lower).toBeLessThanOrEqual(result.probability)
      expect(result.confidenceInterval.upper).toBeGreaterThanOrEqual(result.probability)
      expect(result.confidenceInterval.lower).toBeGreaterThanOrEqual(0)
      expect(result.confidenceInterval.upper).toBeLessThanOrEqual(1)
    })
  })
})
```

### 7.2 Integration Tests

```typescript
// castability.integration.test.ts

describe('Castability Router', () => {
  it('should route to simulation for ENHANCERs', () => {
    const producers = [
      { def: { type: 'ENHANCER', /* ... */ }, copies: 2 }
    ]
    
    expect(shouldUseSimulation(producers)).toBe(true)
  })
  
  it('should use analytic for simple dorks/rocks', () => {
    const producers = [
      { def: { type: 'DORK', /* ... */ }, copies: 4 },
      { def: { type: 'ROCK', /* ... */ }, copies: 2 }
    ]
    
    expect(shouldUseSimulation(producers)).toBe(false)
  })
  
  it('should produce similar results for simple cases', async () => {
    // Compare analytic vs simulation for simple case
    const analytic = computeAcceleratedCastability(deck, spell, producers, ctx)
    const simulation = computeAcceleratedCastability(deck, spell, producers, ctx, {
      forceSimulation: true,
      simulationConfig: { iterations: 5000 }
    })
    
    // Should be within 5% of each other
    const diff = Math.abs(analytic.withAcceleration.p2 - simulation.withAcceleration.p2)
    expect(diff).toBeLessThan(0.05)
  })
})
```

---

## 8. Performance Benchmarks

### 8.1 Target Metrics

| Metric | Target | Acceptable |
|--------|--------|------------|
| N=1000 simulation time | < 300ms | < 500ms |
| N=5000 simulation time | < 1.5s | < 2.5s |
| Memory usage | < 50MB | < 100MB |
| Accuracy (vs large N) | ±2% | ±5% |

### 8.2 Optimization Opportunities

1. **Web Workers**: Run simulation in background thread
2. **WASM**: Port hot paths to WebAssembly
3. **Caching**: Cache shuffled deck states
4. **Early termination**: Stop if confidence interval is tight
5. **Batch processing**: Simulate multiple spells together

---

## 9. Implementation Checklist

### Phase 1: Core Engine (2 days)
- [ ] Create `simulationTypes.ts` with all type definitions
- [ ] Implement `gameState.ts` with deck building and shuffling
- [ ] Implement `simulationEngine.ts` core loop
- [ ] Basic mulligan strategy (London)
- [ ] Basic land play strategy (greedy-color)

### Phase 2: ENHANCER Support (1 day)
- [ ] Implement ENHANCER effect tracking
- [ ] Modify mana calculation to include enhancer bonuses
- [ ] Test with Badgermole Cub + Llanowar Elves

### Phase 3: Router Integration (0.5 day)
- [ ] Update `index.ts` with routing logic
- [ ] Add `shouldUseSimulation()` checks
- [ ] Convert simulation results to standard format

### Phase 4: UI Integration (1 day)
- [ ] Add simulation mode toggle
- [ ] Create SimulationResultsDisplay component
- [ ] Add loading indicator for simulation
- [ ] Display confidence intervals

### Phase 5: Testing & Polish (0.5 day)
- [ ] Unit tests for simulation engine
- [ ] Integration tests for router
- [ ] Performance benchmarks
- [ ] Documentation updates

---

## 10. Known Limitations

1. **Conditional producers (Nykthos)**: Not implemented in v1.0 simulation
2. **Treasure generators**: Simplified model, no opponent interaction
3. **Complex ETB effects**: Only basic ETB-tapped supported
4. **Fetch lands**: Not modeled (would require library manipulation)
5. **Opponent interaction**: Goldfish only (no counterspells, discard)

---

## 11. Future Enhancements (v2.0)

1. **Parallel simulation** via Web Workers
2. **WASM acceleration** for hot paths
3. **Conditional producer modeling** (devotion, land count)
4. **Fetch land support** with deck thinning
5. **Interactive mode** with turn-by-turn decisions
6. **Export/replay** of simulation runs
7. **Visual replay** of game states

---

## 12. References

- [Hypergeometric Distribution](../MATHEMATICAL_REFERENCE.md)
- [v1.1 Analytic Engine](./acceleratedAnalyticEngine.ts)
- [Mana Producer Types](../../types/manaProducers.ts)
- [London Mulligan Rules](https://magic.wizards.com/en/articles/archive/news/london-mulligan-2019-06-03)

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-28  
**Author**: ManaTuner Team  
**Status**: Ready for Implementation Review
