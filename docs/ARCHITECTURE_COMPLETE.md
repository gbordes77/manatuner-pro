# ManaTuner - Complete Architecture Document

> A comprehensive technical reference for the ManaTuner MTG manabase analyzer.
> Last updated: 2026-04-11

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Data Flow](#3-data-flow)
4. [Core Services](#4-core-services)
5. [Data Layer](#5-data-layer)
6. [Mathematical Models](#6-mathematical-models)
7. [Components and Pages](#7-components-and-pages)
8. [State Management](#8-state-management)
9. [Smart Features](#9-smart-features)
10. [Testing Strategy](#10-testing-strategy)
11. [Build and Deployment](#11-build-and-deployment)
12. [SEO and Discoverability](#12-seo-and-discoverability)
13. [Security](#13-security)

---

## 1. High-Level Architecture

ManaTuner is a **100% client-side** single-page application (SPA). There is no backend server, no database, and no authentication. All computation runs in the browser. External dependencies are limited to the Scryfall API for card data enrichment.

```
+------------------------------------------------------------------+
|                         BROWSER (Client)                          |
|                                                                   |
|  +------------------+    +------------------+    +-------------+  |
|  |   React UI       |    |   Redux Store    |    | localStorage|  |
|  |   (Pages/Tabs)   |--->|   (analyzerSlice)|<-->| (persistence|  |
|  +--------+---------+    +--------+---------+    |  caches)    |  |
|           |                       |               +-------------+  |
|           v                       v                               |
|  +------------------+    +------------------+                     |
|  | ManaCostRow      |    | DeckAnalyzer     |                     |
|  | CastabilityTab   |    | ManaCalculator   |                     |
|  | MulliganTab      |    | AdvancedMathEng  |                     |
|  | AnalysisTab      |    | MulliganSimAdv   |                     |
|  +--------+---------+    | ManaProducerSvc  |                     |
|           |              | LandService      |                     |
|           |              | Castability/      |                     |
|           |              +--------+---------+                     |
|           |                       |                               |
|           v                       v                               |
|  +------------------+    +------------------+                     |
|  | Acceleration     |    | Scryfall API     |   (HTTPS, batch)   |
|  | Context          |    | Client           |-----> scryfall.com  |
|  +------------------+    +------------------+                     |
+------------------------------------------------------------------+

Deployment: Vercel (static hosting, SPA fallback)
Domain: manatuner.app
```

### Key Design Principles

- **Privacy-first**: No user data leaves the browser. Supabase is explicitly disabled.
- **Offline-capable**: Seed data (210 lands, 70+ mana producers) enables analysis without network.
- **Progressive enrichment**: Scryfall calls add precision but are not required for basic operation.
- **Mathematical rigor**: All probability calculations use peer-reviewed Frank Karsten methodology.

---

## 2. Technology Stack

| Layer          | Technology            | Version | Purpose                       |
| -------------- | --------------------- | ------- | ----------------------------- |
| Framework      | React                 | 18.2    | UI rendering                  |
| Language       | TypeScript            | 5.9     | Type safety                   |
| Build Tool     | Vite                  | 7.3     | Dev server, bundling          |
| UI Library     | MUI (Material-UI)     | 5.11    | Component library             |
| Charts         | Recharts              | 2.15    | Mana curve, distributions     |
| State          | Redux Toolkit         | 1.9     | Global state (deck, analysis) |
| Persistence    | redux-persist         | 6.0     | localStorage persistence      |
| Routing        | react-router-dom      | 6.8     | SPA routing                   |
| Data Fetching  | @tanstack/react-query | 5.80    | Scryfall caching/dedup        |
| PDF Export     | jspdf + html2canvas   | -       | Blueprint export              |
| Validation     | Zod                   | 3.20    | Runtime type validation       |
| Error Tracking | @sentry/react         | 10.47   | Production error reporting    |
| SEO            | react-helmet-async    | 3.0     | Per-page meta tags            |
| Unit Tests     | Vitest                | 4.0     | Fast unit/integration tests   |
| E2E Tests      | Playwright            | 1.53    | Browser automation tests      |
| Linting        | ESLint + Prettier     | -       | Code quality                  |
| Git Hooks      | Husky + lint-staged   | -       | Pre-commit checks             |

---

## 3. Data Flow

### Main Analysis Pipeline

```
User pastes decklist (text)
         |
         v
+-------------------+
| parseDeckList()   |  Parse lines into card names + quantities
| DeckAnalyzer      |  Detect sideboard (3-tier heuristic)
+--------+----------+
         |
         v
+-------------------+
| batchFetchFrom    |  POST /cards/collection (75 cards/batch)
| Scryfall          |  100ms rate limit between batches
+--------+----------+
         |
         v
+-------------------+
| Enrich DeckCards  |  isLand, colors, cmc, isCreature, manaCost
| + LandService     |  LandMetadata: ETB behavior, category, fetch targets
| + ProducerService |  ManaProducerDef: type, delay, producesMask
+--------+----------+
         |
         v
+-------------------+
| Calculate:        |  colorDistribution, manaRequirements
| AnalysisResult    |  probabilities (T1-T4), manaCurve
|                   |  mulliganAnalysis, spellAnalysis
|                   |  tempoSpellAnalysis, landMetadata
+--------+----------+
         |
         v
+-------------------+
| Redux Store       |  analysisResult stored in analyzerSlice
| (analyzerSlice)   |  Persisted to localStorage via redux-persist
+--------+----------+
         |
         v
+-------------------+
| CastabilityTab    |  ManaCostRow per spell
| AnalysisTab       |  Charts, curve, recommendations
| MulliganTab       |  10K simulation results
| ManabaseFullTab   |  Land breakdown, source counts
| ManaBlueprint     |  Exportable summary (PDF/image)
+-------------------+
```

### Castability Calculation Flow (per spell)

```
ManaCostRow receives: cardName, deckSources, totalLands, producers, accelContext
         |
         v
+------------------------+
| useProbabilityCalc()   |  Hook: fetch card data, parse mana cost
| (internal hook)        |  Compute P1/P2 for each color at each turn
+----------+-------------+
           |
           v
+------------------------+
| computeAccelerated     |  K=0,1,2,3 disjoint scenarios
| Castability()          |  Sum: P(K=k) * P(cast | K=k)
| acceleratedAnalytic    |  Includes ENHANCER synergy, survival model
| Engine.ts              |  Returns {baseCast, accelCast, gainPercent}
+----------+-------------+
           |
           v
+------------------------+
| SegmentedProbability   |  Visual: P1 (best case), P2 (realistic)
| Bar                    |  Green/yellow/red color coding
+------------------------+
```

### Play/Draw Propagation Chain

```
AccelerationSettings (UI toggle)
         |
         v
AccelerationContext (React Context)
  settings.playDraw: 'PLAY' | 'DRAW'
         |
         v
CastabilityTab (reads useAcceleration())
  passes accelContext to ManaCostRow
         |
         v
ManaCostRow
  |-- useProbabilityCalculation(playDraw)    --> base P1/P2
  |-- useAcceleratedCastability(accelCtx)    --> accelerated probabilities
         |
         v
hypergeom.ts: cardsSeenByTurn(turn, playDraw)
  PLAY: 7 + (turn - 1)
  DRAW: 7 + turn
```

---

## 4. Core Services

### 4.1 DeckAnalyzer (`src/services/deckAnalyzer.ts`)

The entry point for all deck analysis. Parses raw text input into structured data.

**Key exports:**

```typescript
// Standalone function: detect sideboard boundary
export function detectSideboardStartLine(lines: string[]): number

// Main class
export class DeckAnalyzer {
  static async analyzeDeck(deckList: string): Promise<AnalysisResult>
}

// Core interfaces
export interface DeckCard {
  name: string
  quantity: number
  manaCost: string
  colors: ManaColor[]
  isLand: boolean
  producedMana?: ManaColor[]
  cmc: number
  isCreature?: boolean
  isSideboard?: boolean
  landMetadata?: LandMetadata
}

export interface AnalysisResult {
  totalCards: number
  totalLands: number
  totalNonLands: number
  colorDistribution: Record<ManaColor, number>
  manaRequirements: Record<ManaColor, number>
  probabilities: { turn1..turn4: { anyColor, specificColors } }
  consistency: number
  rating: 'excellent' | 'good' | 'average' | 'poor'
  averageCMC: number
  manaCurve: Record<string, number>
  mulliganAnalysis: { perfectHand, goodHand, averageHand, poorHand, terribleHand }
  spellAnalysis: Record<string, { castable, total, percentage }>
  tempoSpellAnalysis?: Record<string, TempoSpellAnalysis>
  cards: DeckCard[]
  landMetadata?: LandMetadata[]
}
```

**Sideboard Detection** (`detectSideboardStartLine`):

Three-tier heuristic:

1. Explicit markers: `Sideboard`, `SB:`, `// Sideboard`, `# Sideboard`
2. Inline `SB:` prefix: `SB: 2 Rest in Peace`
3. Blank-line heuristic: last blank line splitting 40-100 cards (main) from 1-15 cards (side)

**Scryfall Batch Fetching:**

```typescript
async function batchFetchFromScryfall(cardNames: string[]): Promise<void>
// POST https://api.scryfall.com/cards/collection
// Max 75 identifiers per request
// 100ms delay between batches
// Results cached in memory Map
```

---

### 4.2 ManaCalculator (`src/services/manaCalculator.ts`)

Provides hypergeometric probability calculations following Frank Karsten's methodology.

**Key exports:**

```typescript
export class ManaCalculator {
  // Core probability (delegates to hypergeom singleton)
  hypergeometric(N, K, n, k): number           // P(X = k)
  cumulativeHypergeometric(N, K, n, minK): number  // P(X >= minK)

  // Main Karsten calculation
  calculateManaProbability(
    deckSize, sourcesInDeck, turn, symbolsNeeded,
    onThePlay?, handSize?
  ): ProbabilityResult

  // Full deck analysis
  analyzeDeck(deck): { deckSize, sources, analysis[], overallHealth }

  // Mana base optimizer
  optimizeManabase(deck): { [color]: number }
}

// Singleton
export const manaCalculator: ManaCalculator

// Tempo-aware calculations
export function calculateTempoAwareProbability(params: TempoCalculationParams): TempoAwareProbability
export function landProducesColorForSpell(land, colorNeeded, isCreatureSpell?): boolean
export async function analyzeSpellCastability(spell, lands, totalCards): Promise<...>
export function compareTempoImpact(lands, totalCards, targetTurn?): Record<LandManaColor, ...>
```

**`landProducesColorForSpell`** — Handles creature-only mana:

- Cavern of Souls, Ancient Ziggurat: `producesAnyForCreaturesOnly = true`
- When spell is NOT a creature: these lands produce only colorless
- When spell IS a creature: they count as full any-color sources

**Tempo-aware probability** accounts for:

- ETB tapped/untapped probability per turn (via `landService.getUntappedProbability`)
- Fetchland delay penalty (0.9x multiplier)
- Strategy variants: aggressive (shock always untapped), conservative, balanced

---

### 4.3 LandService (`src/services/landService.ts`)

Unified service for land detection, classification, and ETB analysis.

**Resolution chain:** Cache -> Seed (210 lands) -> Scryfall API -> Pattern fallback

```typescript
class LandService implements ILandService {
  async detectLand(cardName: string): Promise<LandMetadata | null>
  async isLand(cardName: string): Promise<boolean>
  async getLandsFromDeckList(deckList: string[]): Promise<LandMetadata[]>
  getUntappedProbability(land: LandMetadata, turn: number, context: DeckContext): number
}

export const landService: LandService // singleton
```

**Land categories detected:** basic, fetch, shock, fast, slow, check, battle, pain, filter, horizon, triome, pathway (MDFC), channel, creature, bounce, utility, dual

**ETB condition types:**

- `pay_life` — Shocklands (pay 2 life or tapped)
- `control_lands_max` — Fastlands (untapped if <=2 other lands)
- `control_lands_min` — Slowlands (untapped if >=2 other lands)
- `control_basic` — Checklands (need matching basic type)
- `control_basics_min` — Battle lands (need >=2 basics)
- `reveal_card` — Reveal lands
- `turn_threshold` — Starting Town (untapped turns 1-3)

**Untapped probability model:**

```
Turn 1: Fastland = 0.95, Slowland = 0.1, Checkland = basicRatio * 0.7
Turn 2: Fastland = 0.95, Slowland = 0.4, Checkland = min(0.8, basicRatio * 1.2)
Turn 3+: Fastland = 0.3,  Slowland = 0.9, Checkland = min(0.9, basicRatio * 1.5 + 0.2)
```

---

### 4.4 LandCacheService (`src/services/landCacheService.ts`)

Multi-level caching for land metadata.

```
Level 1: Memory cache (Map<string, LandMetadata>) — instant, session-only
Level 2: localStorage (JSON) — persistent, 30-day TTL
```

- Cache key: `manatuner_lands_cache`
- Cache version: `2.1` (bumped when fetchland color derivation was fixed)
- Max entries before cleanup: 500
- Emergency cleanup cap: 100 most recent entries kept

---

### 4.5 ManaProducerService (`src/services/manaProducerService.ts`)

Detects and manages mana-producing non-land cards (dorks, rocks, rituals, etc.).

**Architecture mirrors LandService:**

```
ProducerCacheService (memory + localStorage, 7-day TTL)
  -> Seed data (70+ pre-defined producers)
  -> Scryfall detection (oracle text analysis)
```

**`analyzeOracleForMana(oracleText)`** — Pattern matching priority:

1. `LAND_RAMP` — "search...basic land...onto the battlefield"
2. Extra land drops — "play an additional land"
3. `LAND_FROM_HAND` — "put a land card from your hand onto the battlefield"
4. `LAND_AURA` — "enchant land" + "tapped for mana...add"
5. `LANDFALL_MANA` — "whenever a land enters...add"
6. `MANA_DOUBLER` — "whenever you tap a land for mana...add"
7. `SPAWN_SCION` — "Eldrazi Spawn/Scion" + "sacrifice"
8. "any color" production
9. `{T}: Add` patterns (ROCK)
10. Remove counter / Sacrifice patterns
11. Treasure creation (excluding combat-damage conditional)

**Combat-damage exclusion:**

```
"deals combat damage...create Treasure" → NOT ramp (Sticky Fingers, Professional Face-Breaker)
"Whenever...enters...create Treasure"   → IS ramp (Dockside Extortionist)
```

**13 Producer Types:**

| Type           | Examples                           | Delay                  | OneShot         | Survival                |
| -------------- | ---------------------------------- | ---------------------- | --------------- | ----------------------- |
| DORK           | Llanowar Elves, Birds of Paradise  | 1 (summoning sickness) | No              | Creature removal        |
| ROCK           | Sol Ring, Arcane Signet            | 0                      | No              | 30% of creature removal |
| RITUAL         | Dark Ritual, Irencrag Feat         | 0                      | Yes             | N/A                     |
| ONE_SHOT       | Lotus Petal, LED                   | 0                      | Yes             | N/A                     |
| TREASURE       | Dockside Extortionist              | 0                      | Yes             | N/A                     |
| CONDITIONAL    | Nykthos, Urborg+Coffers            | varies                 | No              | varies                  |
| ENHANCER       | Badgermole Cub                     | 1                      | No              | Creature removal        |
| LAND_RAMP      | Cultivate, Kodama's Reach          | 0                      | Yes             | 1.0 (irremovable)       |
| LAND_AURA      | Wild Growth, Utopia Sprawl         | 0                      | No              | Enchantment removal     |
| LAND_FROM_HAND | Growth Spiral, Arboreal Grazer     | 0                      | varies          | 1.0 (irremovable)       |
| SPAWN_SCION    | Awakening Zone, Glaring Fleshraker | 1                      | Yes (per token) | Creature removal        |
| LANDFALL_MANA  | Lotus Cobra, Nissa Resurgent       | 0                      | No              | Creature removal        |
| MANA_DOUBLER   | Mirari's Wake, Nyxbloom Ancient    | 0                      | No              | Enchantment removal     |

---

### 4.6 Castability Engine (`src/services/castability/`)

The mathematical core. Three files:

#### `hypergeom.ts` — Singleton calculator

```typescript
export class Hypergeom {
  constructor(maxN: number = 200) // pre-builds log-factorial table

  pmf(N, K, n, k): number // P(X = k) exact
  atLeast(N, K, n, kMin): number // P(X >= kMin)
  atMost(N, K, n, kMax): number // P(X <= kMax)
  atLeastOneCopy(deckSize, copies, cardsSeen): number // 1 - P(0 copies)
}

export const hypergeom = new Hypergeom(200) // singleton

export function cardsSeenByTurn(turn: number, playDraw: PlayDraw): number
// PLAY: 7 + max(0, turn - 1)
// DRAW: 7 + turn
```

Uses **log-space arithmetic** for numerical stability:

```
logP = logChoose(K, k) + logChoose(N-K, n-k) - logChoose(N, n)
P = exp(logP)
```

#### `acceleratedAnalyticEngine.ts` — K=0/1/2/3 Engine

The most complex service. Calculates castability including mana acceleration.

```typescript
export function computeAcceleratedCastabilityAtTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ProducerManaCost,
  turn: number,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  kMax: 0 | 1 | 2 | 3 = 3
): CastabilityResult

export function computeAcceleratedCastability(
  deck: DeckManaProfile,
  spell: ProducerManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  maxTurn?: number
): AcceleratedCastabilityResult

export function computeCastabilityByTurn(
  deck: DeckManaProfile,
  spell: ProducerManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  maxTurn?: number
): CastabilityResult[]

export function producerOnlineProbByTurn(hg, deck, producer, turnTarget, ctx): number
```

**Disjoint scenario approach:**

```
P(cast at T) = P(K=0) * P(cast | K=0)    // Base lands only
             + P(K=1) * P(cast | K=1)    // With 1 accelerator
             + P(K=2) * P(cast | K=2)    // With 2 accelerators
             + P(K>=3) * P(cast | K=3)   // With 3+ accelerators

Where:
  P(K=0) = Product(1 - p_i)  for all producers i
  P(K=1 from j) = p_j * Product(1-p_i, i!=j) / (1-p_j) * p0
  P(K=2 from i,j) = p_i * p_j * p0 / ((1-p_i)*(1-p_j))
```

**Producer online probability:**

```
P(online at T) = P(draw by T_latest) * P(castable at T_latest) * P(survive until T)

Where:
  T_latest = T - delay - 1
  P(draw) = hypergeom.atLeastOneCopy(deckSize, copies, cardsSeen)
  P(castable) = baseCastability(producerSpell, T_latest)
  P(survive) = (1 - r_effective)^exposureTurns
    r_effective = removalRate (creature) or removalRate * 0.3 (artifact)

  LAND_RAMP / LAND_FROM_HAND: survival = 1.0 (land is irremovable)
```

**ENHANCER synergy calculation:**

```typescript
function enhancerBonusMana(onlineSet: ProducerInDeck[]): number
// Badgermole Cub (enhancerBonus=1, enhancesTypes=['DORK']):
//   [Cub alone]        → 0 bonus
//   [Cub + Elves]      → 1 bonus
//   [Cub + 2 dorks]    → 2 bonus
//   [2 Cubs]           → 2 bonus (each enhances the other)
```

**Base castability (v1.1 rigorous):**

```
P(castable at T) = Sum_l [ P(lands=l) * P(colors_OK | l) * P(mana_OK | l) ]

P(lands=l) = Hypergeom.pmf(deckSize, totalLands, cardsSeen, l)
P(colors_OK | l) = min_c [ Hypergeom.atLeast(totalLands, sources_c, l, pips_c) ]
P(mana_OK | l) = indicator(l + multiManaBonus >= MV)
```

#### `index.ts` — Re-exports all public APIs

---

### 4.7 AdvancedMaths (`src/services/advancedMaths.ts`)

Higher-level mathematical engine wrapping the hypergeometric core.

```typescript
export class AdvancedMathEngine {
  // Delegates to hypergeom singleton
  hypergeometric(params: HypergeometricParams): number
  cumulativeHypergeometric(params): ProbabilityResult

  // Karsten methodology
  calculateKarstenProbability(deckSize, sources, turn, symbols, onThePlay, handSize): TurnAnalysis

  // Monte Carlo simulation
  async runMonteCarloSimulation(params: MonteCarloParams): Promise<MonteCarloResult>
}
```

**Monte Carlo simulation:**

- Default 10,000 iterations
- Fisher-Yates shuffle (backward pattern, unbiased)
- London Mulligan support (re-shuffle between attempts)
- Wilson score 95% confidence interval
- Web Worker fallback for heavy computation

---

### 4.8 Mulligan Simulator (`src/services/mulliganSimulatorAdvanced.ts`)

Full London Mulligan simulation with Bellman equation optimization.

```typescript
export type Archetype = 'aggro' | 'midrange' | 'control' | 'combo'

export function prepareDeckForSimulation(cards: DeckCard[]): SimulatedCard[]
export function chooseBottom(hand, bottomCount): { kept; bottomed }

// Main analysis (10K simulations)
export function runAdvancedMulliganAnalysis(
  cards: DeckCard[],
  archetype: Archetype,
  iterations?: number
): AdvancedMulliganResult
```

**Bellman equation (lines 922-941):**

Backward induction determines keep/mulligan thresholds:

```
EV(keep_N) = score(hand_N)
EV(mull_N) = E[max(EV(keep_{N-1}), EV(mull_{N-1}))]

Threshold: keep if score(hand) >= EV(mull_next)
```

The thresholds adapt per archetype:

- Aggro: low threshold (keep more 2-3 land hands with 1-drops)
- Control: higher threshold (need 3+ lands and interaction)
- Combo: specific card presence matters more than general quality

**Score breakdown (per hand):**

- manaEfficiency (0-100): How well mana is spent each turn
- curvePlayability (0-100): Playing on curve
- colorAccess (0-100): Right colors available
- earlyGame (0-100): T1-T2 play availability
- landBalance (0-100): Appropriate land count

**Turn plan generation:**

- Greedy CMC ordering (known bug: doesn't prefer curve-out)
- No color checking yet (planned fix)
- No ETB tapped handling yet (planned fix)

---

### 4.9 Scryfall Client (`src/services/scryfall.ts`)

API client for card data fetching.

```typescript
// Rate limiting: 100ms between requests
const RATE_LIMIT_DELAY = 100

// Caching: in-memory Map<string, Card>
const cardCache = new Map<string, Card>()

// Batch endpoint (used by DeckAnalyzer)
// POST /cards/collection — up to 75 identifiers per request

// Individual lookup
export async function searchCardByName(name: string): Promise<Card | null>
export async function fetchLandData(name: string): Promise<ScryfallLandData | null>
```

---

## 5. Data Layer

### 5.1 Land Seed (`src/data/landSeed.ts`)

**210 pre-defined lands** with complete metadata. No Scryfall call needed for these.

Includes:

- All 10 fetchlands (Onslaught + Zendikar) + Prismatic Vista, Fabled Passage
- All 10 shocklands
- All 10 fastlands
- All 10 slowlands
- All 10 checklands
- All triomes (Ikoria + Streets)
- All pathways (Zendikar Rising + Kaldheim)
- Channel lands (Kamigawa)
- Painlands, filter lands, horizon lands
- Creature lands
- Key utility lands (Cavern of Souls, Ancient Ziggurat, etc.)

Each entry has: `name`, `category`, `produces`, `producesAny`, `producesAnyForCreaturesOnly`, `etbBehavior`, `isFetch`, `fetchTargets`, `basicLandTypes`, etc.

### 5.2 Mana Producer Seed (`src/data/manaProducerSeed.ts`)

**70+ pre-defined mana producers** covering the most common accelerants.

Categories in seed:

- Classic dorks: Llanowar Elves, Birds of Paradise, Noble Hierarch
- Mana rocks: Sol Ring, Arcane Signet, Talismans, Signets
- Rituals: Dark Ritual, Rite of Flame
- Treasure makers: Dockside Extortionist, Gilded Goose
- Land ramp: Cultivate, Kodama's Reach
- Land auras: Wild Growth, Utopia Sprawl, Fertile Ground (7 cards)
- Land from hand: Growth Spiral, Arboreal Grazer, Uro (5 cards)
- Spawn/Scion: Awakening Zone, Glaring Fleshraker (4 cards)
- Landfall: Lotus Cobra, Nissa Resurgent Animist (2 cards)
- Mana doublers: Mirari's Wake, Nyxbloom Ancient (10 cards)
- Enhancers: Badgermole Cub

### 5.3 Glossary (`src/data/glossary.ts`)

14 term definitions used by the `<Term>` tooltip component:

- castability, hypergeometric, monte-carlo, bellman
- health-score, best-case, realistic, karsten
- color-sources, etb-tapped, mana-curve
- acceleration, play-draw, enhancer

### 5.4 Type Definitions (`src/types/`)

| File               | Contents                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `index.ts`         | Core types: ManaColor, Card, Deck, MTGFormat, ParsedManaCost, ManabaseAnalysis                                           |
| `lands.ts`         | LandManaColor, LandCategory, ETBType, ETBCondition, LandMetadata, DeckContext                                            |
| `manaProducers.ts` | ManaProducerType (13 types), ManaProducerDef, ProducerInDeck, DeckManaProfile, AccelContext, ColorMask                   |
| `maths.ts`         | HypergeometricParams, ProbabilityResult, KarstenRecommendation, MonteCarloParams/Result, KARSTEN_TABLES, MAGIC_CONSTANTS |
| `scryfall.ts`      | ScryfallCard, ScryfallLandData (Scryfall API response shapes)                                                            |

### 5.5 localStorage Caching Strategy

| Cache Key                      | TTL       | Purpose                           |
| ------------------------------ | --------- | --------------------------------- |
| `manatuner_lands_cache`        | 30 days   | Land metadata (Scryfall-enriched) |
| `manatuner_producer_cache`     | 7 days    | Mana producer definitions         |
| Redux persist (`persist:root`) | Permanent | Deck state, analysis results      |

Version bumps invalidate stale caches:

- Lands: v2.1 (fetchland color fix)
- Producers: v2.0 (Scryfall produced_mana integration)

---

## 6. Mathematical Models

### 6.1 Hypergeometric Distribution

**The foundation of all probability calculations.**

Formula: `P(X = k) = C(K,k) * C(N-K, n-k) / C(N, n)`

Where:

- N = deck size (typically 60)
- K = success states (e.g., green sources in deck)
- n = cards seen (7 + draws)
- k = successes needed (e.g., 2 for {G}{G})

Implementation uses log-factorials for stability:

```
logP = logFact[K] - logFact[k] - logFact[K-k]
     + logFact[N-K] - logFact[n-k] - logFact[N-K-n+k]
     - logFact[N] + logFact[n] + logFact[N-n]
```

Pre-computed table: `Float64Array` of length 201 (supports decks up to 200 cards, covering Commander).

### 6.2 Karsten Tables (Single Source of Truth)

Located in `src/types/maths.ts` line 131:

```typescript
export const KARSTEN_TABLES: Record<number, Record<number, number>> = {
  1: { 1: 14, 2: 13, 3: 12, 4: 11, 5: 10, 6: 9, 7: 8, 8: 8, 9: 7, 10: 7 },
  2: { 2: 20, 3: 18, 4: 16, 5: 15, 6: 14, 7: 13, 8: 12, 9: 11, 10: 11 },
  3: { 3: 23, 4: 20, 5: 19, 6: 18, 7: 17, 8: 16, 9: 15, 10: 14 },
  4: { 4: 25, 5: 22, 6: 21, 7: 20, 8: 19, 9: 18, 10: 17 },
}
```

Interpretation: `KARSTEN_TABLES[symbols][turn]` = sources needed for 90% probability.

Example: To cast a {R}{R} spell on turn 4, you need 16 red sources.

### 6.3 Monte Carlo Simulation

Used for complex scenarios where closed-form hypergeometric is insufficient.

```
for each iteration (10,000 default):
  1. Create deck array: [land, land, ..., spell, spell, ...]
  2. Fisher-Yates shuffle (backward, unbiased)
  3. Draw opening hand (7 cards)
  4. Apply mulligan strategy (London: redraw 7, bottom N)
  5. Simulate turns (draw, check land count)
  6. Record: success/fail, turn achieved
```

**Fisher-Yates shuffle (mandatory pattern):**

```typescript
for (let i = deck.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[deck[i], deck[j]] = [deck[j], deck[i]]
}
```

Never use `.sort(() => Math.random() - 0.5)` — it produces biased distributions.

### 6.4 Bellman Equation for Mulligan Optimization

Backward induction determines expected value at each hand size:

```
EV(hand_4) = score(hand_4)                          // Must keep at 4
EV(hand_5) = max(score(hand_5), E[EV(hand_4)])      // Keep or mull to 4
EV(hand_6) = max(score(hand_6), E[EV(hand_5)])      // Keep or mull to 5
EV(hand_7) = max(score(hand_7), E[EV(hand_6)])      // Keep or mull to 6

Threshold_N = E[EV(hand_{N-1})]  // Keep if score >= threshold
```

Results in recommendations: SNAP_KEEP, KEEP, MARGINAL, MULLIGAN, SNAP_MULL.

### 6.5 K=3 Acceleration Engine

Evaluates 0, 1, 2, or 3 mana producers being online simultaneously:

```
K=0: Base lands only
K=1: One accelerator (e.g., Llanowar Elves online → cast 3-drop on T2)
K=2: Two accelerators (e.g., Sol Ring + Signet → 5 mana on T2)
K=3: Three accelerators (e.g., Badgermole Cub + 2 dorks → massive mana)

P(cast) = P(K=0)*P(cast|0) + P(K=1)*P(cast|1) + P(K=2)*P(cast|2) + P(K>=3)*P(cast|3)
```

Performance: With n=18 max candidates, C(18,3) = 816 triples — negligible computation cost.

### 6.6 Survival Model

```
P_survive(turns) = (1 - r_effective)^turns

r_effective:
  - Creatures: removalRate (format-dependent)
  - Artifacts: removalRate * 0.3 (rocks are 30% as vulnerable)
  - LAND_RAMP/LAND_FROM_HAND: survival = 1.0 (land is irremovable)

Format removal rates (FORMAT_REMOVAL_RATES):
  - Standard: 0.12
  - Modern: 0.15
  - Legacy: 0.20
  - Commander: 0.08
```

---

## 7. Components and Pages

### 7.1 Pages

| Route            | Page             | Description                                         |
| ---------------- | ---------------- | --------------------------------------------------- |
| `/`              | HomePage         | Landing page, feature highlights, social proof, CTA |
| `/analyzer`      | AnalyzerPage     | Main tool: deck input + analysis tabs               |
| `/guide`         | GuidePage        | User guide, FAQ, methodology explanation            |
| `/mathematics`   | MathematicsPage  | Progressive disclosure: math foundations            |
| `/land-glossary` | LandGlossaryPage | Interactive land type reference                     |
| `/my-analyses`   | MyAnalysesPage   | Saved analyses (localStorage)                       |

### 7.2 AnalyzerPage Tabs

The analyzer has 5 lazy-loaded tabs:

1. **CastabilityTab** — Per-spell probability table with ManaCostRow components
2. **AnalysisTab** — Mana curve chart, color distribution pie, recommendations
3. **MulliganTab** — 10K simulation results, sample hands, turn plans
4. **ManabaseFullTab** — Land breakdown by category, source counts per color
5. **ManaBlueprint** — Exportable summary (PDF/image)

### 7.3 Key Components

#### `ManaCostRow` (`src/components/ManaCostRow.tsx`)

The core visualization for a single spell's castability.

Props:

```typescript
interface ManaCostRowProps {
  cardName: string
  quantity: number
  deckSources?: Record<string, number> // color -> source count
  totalLands?: number
  totalCards?: number
  producers?: ProducerInDeck[] // mana accelerators
  accelContext?: { playDraw; removalRate; defaultRockSurvival }
  showAcceleration?: boolean
  unconditionalMultiMana?: { count; delta }
  initialCardData?: MTGCard | null
  isCreature?: boolean
  creatureOnlyExtraSources?: Record<string, number>
}
```

Internally:

1. Fetches card image/data from Scryfall (or uses `initialCardData`)
2. Parses mana cost into colored symbol requirements
3. Computes base P1/P2 using `hypergeom` directly
4. If `showAcceleration`: calls `computeAcceleratedCastability`
5. Renders `SegmentedProbabilityBar` for each turn

#### `SegmentedProbabilityBar`

Visual bar showing P1 (best case) and P2 (realistic) probabilities with color coding:

- Green: >= 90%
- Yellow: 80-89%
- Red: < 80%

#### `AccelerationSettings` (`src/components/analyzer/AccelerationSettings.tsx`)

UI controls for:

- Format preset dropdown (Standard/Modern/Legacy/Commander)
- Play/Draw toggle
- Custom removal rate slider
- Show/hide acceleration toggle

#### `SideboardSwapEditor` (`src/components/analyzer/SideboardSwapEditor.tsx`)

Post-board analysis:

- IN/OUT swap interface with +/- buttons
- Balance indicator (balanced when IN count = OUT count)
- Modifies `effectiveCards` in CastabilityTab for recalculation
- Collapsed by default

#### `Term` (`src/components/common/Term.tsx`)

MUI Tooltip wrapper for glossary terms. Renders with dotted underline. Definitions from `src/data/glossary.ts`.

#### `CardImageTooltip`

Hover tooltip showing the card's Scryfall image (loaded on demand from `cards.scryfall.io`).

### 7.4 Layout Components

- `Header.tsx` — Navigation bar with links: Analyzer, Lands, Guide, Mathematics
- `FloatingManaSymbols.tsx` — Decorative animated mana symbols (background)
- `SEO.tsx` — Per-page helmet meta tags (title, description, OG, canonical)
- `ErrorBoundary.tsx` — React error boundary with Sentry integration

---

## 8. State Management

### 8.1 Redux Store

```typescript
// src/store/index.ts
const rootReducer = combineReducers({
  analyzer: analyzerReducer,
})

// Persisted to localStorage via redux-persist
const persistConfig = {
  key: 'root',
  storage, // localStorage
  whitelist: ['analyzer'],
}
```

### 8.2 Analyzer Slice

```typescript
interface AnalyzerState {
  deckList: string // Raw deck text
  deckName: string // User-assigned name
  analysisResult: AnalysisResult | null // Full analysis output
  isAnalyzing: boolean // Loading state
  isDeckMinimized: boolean // UI: collapse deck input
  activeTab: number // Current tab index (0-4)
  snackbar: SnackbarState // Notification state
}

// Actions:
;(setDeckList,
  setDeckName,
  setAnalysisResult,
  setIsAnalyzing,
  setIsDeckMinimized,
  setActiveTab,
  showSnackbar,
  hideSnackbar,
  clearAnalyzer)
```

### 8.3 AccelerationContext (React Context)

Separate from Redux for performance (frequent updates during slider interaction):

```typescript
interface AccelerationSettings {
  format: FormatPreset // 'standard' | 'modern' | 'legacy' | 'commander'
  playDraw: 'PLAY' | 'DRAW'
  customRemovalRate: number | null
  showAcceleration: boolean
}

// Computed AccelContext passed to engine:
interface AccelContext {
  playDraw: 'PLAY' | 'DRAW'
  removalRate: number // Effective rate (custom or format default)
  rockRemovalFactor: number // 0.3
}
```

---

## 9. Smart Features

### 9.1 URL Sharing (`src/utils/urlCodec.ts`)

Encodes deck state into a shareable URL:

```
https://manatuner.app/analyzer?d=<base64>&name=<deckName>&tab=<tabIndex>
```

Codec: TextEncoder -> base64 -> URL-safe (replace `+/_` with `-/_`, strip `=` padding).

On page load: `parseShareParams()` checks for `?d=` param and auto-loads the deck.

### 9.2 Creature-Only Mana

5 lands flagged with `producesAnyForCreaturesOnly: true`:

- Cavern of Souls
- Unclaimed Territory
- Secluded Courtyard
- Plaza of Heroes
- Ancient Ziggurat

**Flow:**

```
Scryfall type_line → DeckCard.isCreature (boolean)
→ CastabilityTab computes creatureOnlyExtraSources per color
→ ManaCostRow: if isCreature, adds extra sources to deckSources
→ manaCalculator.landProducesColorForSpell() filters in tempo chain
```

### 9.3 Hybrid Mana Handling

For costs like `{R/G}`:

- **Base probability**: `Math.max(P_red, P_green)` — player can choose either
- **Accelerated castability**: assigns to color with most deck sources
- **Display**: mana-font class `ms-rg` for bicolor split circle icon
- **Parser**: `parseManaCost` in manaProducerService handles `/` symbols

### 9.4 MDFC/DFC Lands

Modal Double-Faced Cards (e.g., Pathways, Emeria's Call):

- `landService.analyzeMDFC()` finds the land face
- Uses `produced_mana` from Scryfall (authoritative) for colors
- Non-land face ignored for mana analysis
- `otherFace` stored for reference

### 9.5 Sideboard Auto-Detection

Three-tier system in `detectSideboardStartLine()`:

1. Explicit markers (regex): `Sideboard`, `SB:`, `// Sideboard`, `# Sideboard`
2. Inline prefix: lines starting with `SB: 2 Card Name`
3. Blank-line heuristic: find last blank line where before=40-100 cards, after=1-15 cards

Works with: Standard (60+15), Limited (40+), Commander (100+side), MTGA format (with set codes).

### 9.6 Post-Board Sideboard Swaps

`SideboardSwapEditor` allows users to simulate post-board configurations:

- Pick IN cards from sideboard
- Pick OUT cards from maindeck
- CastabilityTab recalculates with modified card pool
- Balance indicator warns if swap count is uneven

---

## 10. Testing Strategy

### 10.1 Unit Tests (Vitest)

**235 tests passing** as of 2026-04-11.

| Test File                    | Coverage                                                  |
| ---------------------------- | --------------------------------------------------------- |
| `sideboardDetection.test.ts` | 14 tests: all formats, blank-line, SB: prefix, edge cases |
| `maths.critical.test.ts`     | 25 tests: hypergeometric accuracy, Karsten validation     |
| `manaCalculator.test.ts`     | 14 tests: probability calculations, play/draw             |
| `londonMulligan.test.ts`     | 16 tests: London rules, bottom selection                  |
| `mulliganSimulator.test.ts`  | 13 tests: archetype scoring, turn plans                   |
| `turnPlan.test.ts`           | 15 tests: turn-by-turn generation                         |
| `critical.test.ts`           | 7 tests: Fisher-Yates, division-by-zero guards            |

**Frank Karsten validation tests** (`tests/mtg-specific/mana-calculations/`):

- Verify that calculated probabilities match Karsten's published tables
- Regression tests for known correct values

### 10.2 E2E Tests (Playwright)

| Suite            | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `accessibility/` | axe-core WCAG Level A compliance                      |
| `core-flows/`    | Full user journey: paste deck -> analyze -> view tabs |
| `responsive/`    | Mobile/tablet/desktop layout verification             |
| `performance/`   | Page load time, interaction latency                   |
| `tabs/`          | Individual tab functionality                          |

### 10.3 Test Configuration

```bash
npm run test:unit          # Vitest (fast, ~5s)
npm run test:e2e           # Playwright (all browsers)
npm run test:quick         # Unit + core E2E flows
npm run test:full          # Unit + all E2E + accessibility
npm run test:coverage      # Vitest with coverage report
```

---

## 11. Build and Deployment

### 11.1 Vite Configuration

```typescript
// vite.config.ts
{
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/*'],
          'vendor-charts': ['recharts'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
        }
      }
    }
  },
  server: { port: 3000 },
  esbuild: { drop: ['console', 'debugger'] },  // Strip in production
  worker: { format: 'es' }
}
```

### 11.2 Vercel Deployment

- **Domain**: manatuner.app (www.manatuner.app)
- **Build command**: `npm run build` (standard Vite build)
- **Output**: `dist/`
- **SPA fallback**: All routes except `/sw.js` rewrite to `/index.html`

### 11.3 Vercel Headers (`vercel.json`)

Security headers on all routes:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy`: strict CSP allowing Scryfall, Sentry, fonts

Cache headers:

- `/assets/*`: `public, max-age=31536000, immutable` (hashed filenames)
- `/sw.js`: `no-cache, no-store, must-revalidate`

### 11.4 PWA Cache Killer (`public/sw.js`)

Solves stale Service Worker caches from a previous PWA configuration:

```javascript
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', async () => {
  // Delete ALL caches
  await Promise.all((await caches.keys()).map((name) => caches.delete(name)))
  // Unregister self
  await self.registration
    .unregister()(
      // Force reload all open tabs
      await self.clients.matchAll({ type: 'window' })
    )
    .forEach((c) => c.navigate(c.url))
})
```

---

## 12. SEO and Discoverability

### 12.1 Per-Page Meta (react-helmet-async)

Each page uses the `<SEO>` component:

```typescript
<SEO
  title="Mana Calculator - ManaTuner"
  description="Calculate exact probabilities..."
  canonical="https://www.manatuner.app/analyzer"
  ogImage="/og-image-v2.jpg"
/>
```

### 12.2 Structured Data (JSON-LD)

- **Homepage**: `WebApplication` schema
- **GuidePage**: `FAQPage` schema
- **MathematicsPage**: `Article` schema
- **LandGlossaryPage**: `Article` schema

### 12.3 AI Discoverability

- `public/llms.txt` — Concise site description for AI crawlers
- `public/llms-full.txt` — Comprehensive feature/math/FAQ reference
- Referenced in `robots.txt` and `<link>` in index.html

### 12.4 Static Files

- `public/sitemap.xml` — All page URLs (www.manatuner.app)
- `public/robots.txt` — Allow all, sitemap reference, llms.txt reference
- `public/manifest.json` — PWA manifest (name, icons, theme)
- `public/og-image-v2.jpg` — Social sharing preview image

---

## 13. Security

### 13.1 Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:;
img-src 'self' data: https://cards.scryfall.io https://c1.scryfall.com;
connect-src 'self' https://api.scryfall.com https://*.ingest.sentry.io;
frame-ancestors 'none';
```

### 13.2 Data Privacy

- **No user accounts, no server, no analytics cookies**
- All data stays in browser localStorage
- Scryfall API calls are card-data only (no user information sent)
- Supabase: explicitly disabled (`isConfigured: () => false`)
- No tracking beyond Sentry error reporting

### 13.3 Supply Chain

- CDN dependency: `mana-font v1.18.0` from jsdelivr.net (pinned version)
- All other dependencies bundled at build time
- `preconnect` hint for cdn.jsdelivr.net

---

## Appendix: File Map

```
src/
  components/
    ManaCostRow.tsx              # Core spell probability row
    SegmentedProbabilityBar.tsx  # P1/P2 visual bar
    CardImageTooltip.tsx         # Card hover preview
    Onboarding.tsx              # react-joyride tutorial
    PrivacySettings.tsx         # localStorage clear UI
    analyzer/
      CastabilityTab.tsx        # Per-spell castability table
      AnalysisTab.tsx           # Charts + recommendations
      MulliganTab.tsx           # 10K simulation results
      ManabaseFullTab.tsx       # Land breakdown
      AccelerationSettings.tsx  # Format/play-draw controls
      SideboardSwapEditor.tsx   # Post-board swap UI
      DeckInputSection.tsx      # Textarea + sample decks
      ManabaseStats.tsx         # Quick stats card
    common/
      SEO.tsx                   # react-helmet-async wrapper
      Term.tsx                  # Glossary tooltip
      ErrorBoundary.tsx         # Sentry error capture
      FloatingManaSymbols.tsx   # Background animation
      NotificationProvider.tsx  # Snackbar system
    export/
      ManaBlueprint.tsx         # PDF/image export
    layout/
      Header.tsx                # Navigation bar
  contexts/
    AccelerationContext.tsx     # Play/draw + format settings
  data/
    landSeed.ts                # 210 pre-defined lands (2536 lines)
    manaProducerSeed.ts        # 70+ producers (1605 lines)
    glossary.ts                # 14 term definitions
  pages/
    HomePage.tsx               # Landing page
    AnalyzerPage.tsx           # Main tool (tabs)
    GuidePage.tsx              # User guide + FAQ
    MathematicsPage.tsx        # Math methodology
    LandGlossaryPage.tsx       # Land reference
    MyAnalysesPage.tsx         # Saved analyses
  services/
    deckAnalyzer.ts            # Deck parsing + Scryfall enrichment
    manaCalculator.ts          # Hypergeometric + tempo-aware
    landService.ts             # Land detection + ETB analysis
    landCacheService.ts        # Multi-level land cache
    manaProducerService.ts     # Producer detection + cache
    advancedMaths.ts           # Monte Carlo + Karsten
    mulliganSimulatorAdvanced.ts # Bellman + London mulligan
    scryfall.ts                # API client
    castability/
      hypergeom.ts             # Log-space hypergeometric (singleton)
      acceleratedAnalyticEngine.ts # K=0/1/2/3 disjoint scenarios
      index.ts                 # Module re-exports
  store/
    index.ts                   # Redux store config + persist
    slices/
      analyzerSlice.ts         # Deck state + analysis results
  types/
    index.ts                   # Core types (ManaColor, Card, Deck, MTGFormat)
    lands.ts                   # Land system types (LandMetadata, ETB, DeckContext)
    manaProducers.ts           # Producer types (13 types, ManaProducerDef, AccelContext)
    maths.ts                   # Math types (Karsten tables, Monte Carlo params)
    scryfall.ts                # Scryfall API response types
  utils/
    urlCodec.ts                # Shareable URL encoding/decoding
    manabase.ts                # Utility math functions
    landDetection.ts           # Legacy land detection helpers
public/
  sw.js                        # PWA cache killer
  sitemap.xml                  # SEO sitemap
  robots.txt                   # Crawler directives
  llms.txt / llms-full.txt     # AI discoverability
  manifest.json                # PWA manifest
  og-image-v2.jpg              # Social preview
```

---

## Appendix: Key Constants

```typescript
// Deck sizes
STANDARD_DECK_SIZE = 60
COMMANDER_DECK_SIZE = 100
LIMITED_DECK_SIZE = 40

// Probability thresholds
EXCELLENT_THRESHOLD = 0.95
GOOD_THRESHOLD = 0.90      // Karsten standard
ACCEPTABLE_THRESHOLD = 0.80

// Scryfall
BATCH_SIZE = 75            // Max cards per /cards/collection call
RATE_LIMIT = 100           // ms between requests

// Caching
LAND_CACHE_TTL = 30 days
PRODUCER_CACHE_TTL = 7 days
CACHE_MAX_ENTRIES = 500

// Engine
MAX_PRODUCER_CANDIDATES = 18  // Performance cap for K-scenario engine
DEFAULT_ROCK_REMOVAL_FACTOR = 0.3
DEFAULT_K_MAX = 3
```
