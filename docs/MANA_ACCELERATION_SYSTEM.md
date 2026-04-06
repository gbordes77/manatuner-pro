# ManaTuner — Mana Acceleration System

**Version: 1.1 (Corrected)**  
**Last Updated: December 2025**  
**Scope: Client-side TS/React, <100ms (instant mode), Simple UX**

---

## Table of Contents

0. [Changelog v1.1](#0-changelog-v11)
1. [Objective](#1-objective)
2. [Notation & Fundamentals](#2-notation--fundamentals)
3. [Base Model (Lands-Only) — Rigorous Version](#3-base-model-lands-only--rigorous-version)
4. [Multi-Mana Lands — Random Variable Model](#4-multi-mana-lands--random-variable-model)
5. [Mana Producers (Dorks/Rocks) — "Online by T"](#5-mana-producers-dorksrocks--online-by-t)
6. [Survival — Unified Model](#6-survival--unified-model)
7. [Combined Model: Lands + Producers — Disjoint Scenarios K=0/1/2/3](#7-combined-model-lands--producers--disjoint-scenarios-k0123)
8. [Acceleration (Casting Before Natural Turn)](#8-acceleration-casting-before-natural-turn)
9. [Advanced Mode — Smart Monte Carlo](#9-advanced-mode--smart-monte-carlo)
10. [TypeScript Pseudo-Code (v1.1 Aligned)](#10-typescript-pseudo-code-v11-aligned)
11. [Limitations v1.1](#11-limitations-v11)
12. [API v1.1](#12-api-v11)

---

## 0) Changelog v1.1

### Removed (from v1.0)

| What                                                | Why it was wrong                                    |
| --------------------------------------------------- | --------------------------------------------------- |
| `EffectiveTurn = MV - ExpectedAcceleration`         | Non-probabilistic averages don't model variance     |
| `applyAcceleration()` with arbitrary additive boost | Magic number `0.05` was unjustified                 |
| `activationTurn` derived from MV                    | Conceptually incorrect — depends on delay, not cost |
| `survivalProfile` with fixed percentages            | Inflexible, didn't scale with removal rate          |
| `bonusManaFromLands` as deterministic sum           | Assumed all copies drawn and played                 |

### Added / Replaced

| Feature                                 | Description                                                                |
| --------------------------------------- | -------------------------------------------------------------------------- |
| **Disjoint scenario model K∈{0,1,2}**   | Probabilistic model for number of producers online                         |
| **Multi-mana lands as random variable** | Bonus mana conditional on lands actually in play                           |
| **Unified survival model**              | `P_survive(n) = (1-r)^n` with single slider                                |
| **Stable API**                          | `computeBaseCastabilityAtTurn()` + `computeAcceleratedCastabilityAtTurn()` |
| **Advanced Mode option**                | Smart Monte Carlo for rituals/treasures/conditional lands                  |
| **No magic numbers**                    | All constants derived or configurable                                      |
| **`delay` instead of `activationTurn`** | 1 for summoning sickness, 0 for immediate                                  |

---

## 1) Objective

Answer the question:

> **"What is the probability of casting this spell at turn T, considering lands + accelerators (dorks/rocks) + survival + timing?"**

### Constraints

| Mode                  | Method                   | Target              |
| --------------------- | ------------------------ | ------------------- |
| **Instant (default)** | Analytic                 | <100ms              |
| **Advanced (toggle)** | Monte Carlo (Web Worker) | Deck-level accuracy |

---

## 2) Notation & Fundamentals

### Variables

| Symbol | Definition                |
| ------ | ------------------------- |
| N      | Deck size (60 or 99)      |
| L      | Total lands in deck       |
| n(T)   | Cards seen by turn T      |
| Sᶜ     | Sources producing color c |
| MV     | Mana value of spell       |
| r      | Removal rate (0..1)       |

### Cards Seen by Turn T

```
PLAY: n(T) = 7 + (T - 1)
DRAW: n(T) = 7 + T
```

### Hypergeometric Distribution

**PMF (Probability Mass Function):**

```
P(X = k) = C(K,k) × C(N-K, n-k) / C(N,n)
```

**CDF (Cumulative — "at least k"):**

```
P(X ≥ k) = Σᵢ₌ₖᵐⁱⁿ⁽ⁿ'ᴷ⁾ P(X = i)
```

Where:

- N = population size (deck)
- K = success states in population (e.g., lands)
- n = draws (cards seen)
- k = successes needed

---

## 3) Base Model (Lands-Only) — Rigorous Version

### Why v1.0 Was Wrong

The formula `P2 = P1 × P(≥T lands)` is an approximation that:

- Doesn't properly condition color probability on actual lands drawn
- Assumes independence that doesn't exist

### Correct Approach: Sum Over Exact Lands Drawn

We want `P(castable at T)` without ramp. We sum over all possible values of lands drawn:

```
P(castable at T) = Σₗ₌₀ᵐⁱⁿ⁽ᴸ'ⁿ⁾ P(lands=l) × P(colors OK | l) × 𝟙[l ≥ MV]
```

### 3.1 Distribution of Lands Seen by Turn T

```
P(lands = l) = HypergeomPMF(N, L, n(T), l)
```

### 3.2 Color Probability Conditional on l Lands

For each color c with Sᶜ sources and needᶜ pips required:

```
P(pipᶜ OK | l) = P(Xᶜ ≥ needᶜ), where Xᶜ ~ Hypergeom(L, Sᶜ, l)
```

**Conservative approximation (fast, stable):**

```
P(colors OK | l) ≈ minᶜ P(Xᶜ ≥ needᶜ)
```

### 3.3 Total Mana with Lands-Only

Without multi-mana lands: mana available ≈ l

```
P(castable at T) = Σₗ P(lands=l) × P(colors OK | l) × 𝟙[l ≥ MV]
```

### 3.4 Legacy P1/P2 Compatibility

For UX continuity, expose:

- **P1** = `P(colors OK | l=T)` — "perfect drops" reading
- **P2** = sum above — realistic

---

## 4) Multi-Mana Lands — Random Variable Model

### 4.1 Why v1.0 Was Wrong

Adding `bonusManaFromLands` as if all copies were in play assumes "all drawn + all played". This **overestimates** significantly.

**Example:** 4× Ancient Tomb doesn't mean +4 mana — you might draw 0, 1, or 2.

### 4.2 Correct Model (Unconditional Multi-Mana)

Let:

- U = number of multi-mana lands in deck (e.g., Ancient Tomb)
- Δ = bonus per land (Ancient Tomb produces 2 → Δ = 1)
- l = lands in play at T (random variable)
- M = # of multi-mana among those l lands

**Distribution of M given l lands:**

```
P(M = m | l) = HypergeomPMF(L, U, l, m)
```

**Total mana:**

```
mana(l, m) = l + m × Δ
```

**Replace the mana test:**

```
𝟙[l ≥ MV]  →  𝟙[mana(l,m) ≥ MV]
```

### 4.3 Complete Formula

```
P(castable at T) = Σₗ P(l) × P(colors OK | l) × Σₘ P(m|l) × 𝟙[l + m×Δ ≥ MV]
```

### 4.4 Conditional Lands (Cradle/Nykthos/Coffers/Temple)

**Instant mode recommendation:**

- Disclaimer + ignore (V1 approach)
- OR: simulation only (advanced mode)

**Do NOT use "average" estimates silently** — this creates false precision.

---

## 5) Mana Producers (Dorks/Rocks) — "Online by T"

### 5.1 Data Model (v1.1)

We do NOT store `activationTurn`. We store only invariant properties:

```typescript
type ProducerType = 'DORK' | 'ROCK' | 'RITUAL' | 'ONE_SHOT' | 'TREASURE' | 'ENHANCER'

interface ManaProducerDef {
  name: string
  type: ProducerType

  // Casting cost
  castCostGeneric: number
  castCostPips: Partial<Record<Color, number>>

  // Timing
  delay: number // 1 = summoning sickness/ETB tapped; 0 = immediate
  isCreature: boolean

  // Production
  producesAmount: number // Raw output per tap
  activationTax: number // Signets: 1; Sol Ring: 0
  producesMask: ColorMask // Which colors
  producesAny: boolean // Any color?

  // One-shot
  oneShot: boolean // Rituals/treasures/petal
}
```

### 5.2 Contribution Window

For a producer to contribute mana at turn T:

```
T_latest = T - delay - 1
```

If `T_latest < 1` → cannot accelerate (too slow to help before T).

**Example:**

- Llanowar Elves (delay=1) helping cast a 4-drop on T3:
  - T_latest = 3 - 1 - 1 = 1 ✓ (must be cast T1)
- Sol Ring (delay=0) helping cast a 3-drop on T2:
  - T_latest = 2 - 0 - 1 = 1 ✓ (must be cast T1)

### 5.3 Probability "Online by T"

For producer A with `copies` in deck:

```
P(A online at T) ≈ P(draw A ≤ T_latest) × P(castable at T_latest) × P_survive(n)
```

Where:

- **P(draw)** = hypergeom "at least 1 copy" by T_latest
- **P(castable)** = lands-only castability at T_latest for producer's cost
- **P_survive(n)** = survival over n = T - T_latest turns

---

## 6) Survival — Unified Model

### Single Formula

**Slider UX:** `removalRate` r ∈ [0, 1]

```
P_survive(n) = (1 - r)^n
```

Where n = turns exposed to removal.

### Recommended Presets

| Preset   | r    | Environment          |
| -------- | ---- | -------------------- |
| Goldfish | 0.00 | Testing              |
| Low      | 0.10 | Casual/Battlecruiser |
| Medium   | 0.25 | Standard/Pioneer     |
| High     | 0.45 | Modern/Legacy        |

### Rock vs Creature Distinction

**Option:** `rockRemovalFactor = 0.3`

```
r_rock = 0.3 × r
r_creature = r
```

This models that artifact removal is less common than creature removal.

---

## 7) Combined Model: Lands + Producers — Disjoint Scenarios K=0/1/2

### 7.1 Principle

We model K = # of producers online and useful, truncated to 2 for performance.

We avoid double-counting by working with "exactly K":

```
P(cast at T) = Σₖ₌₀² P(K=k) × P(cast at T | K=k)
```

### 7.2 Constructing P(K=0), P(K=1), P(K=2)

Each producer i has pᵢ = P(i online at T).

Using **Poisson-binomial** (independence approximation, acceptable for instant mode):

```
P(K=0) = ∏ᵢ (1 - pᵢ)

P(K=1) = Σⱼ pⱼ × ∏ᵢ≠ⱼ (1 - pᵢ)

P(K≥2) = 1 - P(K=0) - P(K=1)
P(K=2) ≈ P(K≥2)  // Truncation
```

**Performance:** Cap at ~18 most impactful producers (score by pᵢ × netPerTurn).

### 7.3 P(cast | K=k): Mana Budget + Pip Allocation

For a set of k producers online:

**Net mana per turn:**

```
netPerTurn = producesAmount - activationTax  (≥0)
extraMana = Σ netPerTurn  // Total ramp
```

**Reduced mana requirement from lands:**

```
MV_lands = max(0, MV - extraMana)
```

**Pip coverage:** Allocate up to k pips covered by producers (k≤2 → brute-force trivial).

**Then calculate** lands-only castability with reduced spell cost.

### 7.4 Signets Special Case

- **activationTax** correctly reduces net mana
- For **color fixing**, activation requires input mana — in instant mode, stay conservative
- In advanced mode: exact payment modeling

---

## 8) Acceleration (Casting Before Natural Turn)

### Definition

**Natural turn** (convention): `T = MV` (or your existing mapping).

**Acceleration** = finding the smallest t < T where:

```
P(castable at t) ≥ θ
```

With θ configurable (e.g., 5% or 10%).

### Algorithm

```typescript
function findAcceleratedTurn(deck, spell, producers, ctx, threshold = 0.05): number | null {
  const naturalTurn = spell.mv

  for (let t = 1; t < naturalTurn; t++) {
    const p = computeAcceleratedCastabilityAtTurn(deck, spell, t, producers, ctx).p2
    if (p >= threshold) {
      return t
    }
  }

  return null // No acceleration possible
}
```

---

## 9) Advanced Mode — Smart Monte Carlo

### When to Use

- Rituals/treasures dominant
- Conditional lands (Cradle/Nykthos/Tron)
- Enhancers (Badgermole Cub)
- Complex sequencing interactions

### Characteristics

| Feature     | Description                       |
| ----------- | --------------------------------- |
| Execution   | Web Worker                        |
| Mulligan    | London mulligan, ramp-aware       |
| Play policy | Greedy (land fixing + ramp chain) |
| Output      | `castableByTurn[spellId][t]`      |
| Samples     | 10,000+ for convergence           |

### Implementation Sketch

```typescript
// In Web Worker
function simulateDeck(deck, spells, ctx, samples = 10000): SimulationResult {
  const results = spells.map(() => new Array(10).fill(0))

  for (let sim = 0; sim < samples; sim++) {
    const game = new GameState(deck, ctx)
    game.mulligan() // London mulligan with ramp awareness

    for (let turn = 1; turn <= 10; turn++) {
      game.drawStep(turn)
      game.playLand() // Greedy: fixing > ramp > utility
      game.playRamp() // Deploy available acceleration

      for (let s = 0; s < spells.length; s++) {
        if (game.canCast(spells[s])) {
          results[s][turn]++
        }
      }
    }
  }

  // Normalize to probabilities
  return results.map((r) => r.map((count) => count / samples))
}
```

---

## 10) TypeScript Pseudo-Code (v1.1 Aligned)

### 10.1 Hypergeometric Utilities

```typescript
function pmf(N: number, K: number, n: number, k: number): number {
  return (binomial(K, k) * binomial(N - K, n - k)) / binomial(N, n)
}

function atLeast(N: number, K: number, n: number, kMin: number): number {
  let sum = 0
  for (let k = kMin; k <= Math.min(n, K); k++) {
    sum += pmf(N, K, n, k)
  }
  return sum
}

function atLeastOneCopy(N: number, copies: number, cardsSeen: number): number {
  return 1 - pmf(N, copies, cardsSeen, 0)
}

function cardsSeen(T: number, playDraw: 'PLAY' | 'DRAW'): number {
  return playDraw === 'PLAY' ? 7 + (T - 1) : 7 + T
}
```

### 10.2 Base Castability (Lands + Multi-Mana Unconditional)

```typescript
interface BaseCastabilityResult {
  p1: number // Perfect drops (legacy)
  p2: number // Realistic
}

function baseCastabilityAtTurn(
  deck: DeckProfile,
  spell: SpellCost,
  turn: number,
  ctx: Context
): BaseCastabilityResult {
  const n = cardsSeen(turn, ctx.playDraw)

  // P1 "legacy" (perfect drops): colors given l=turn
  const p1 = colorsOkGivenLands(deck, spell, turn)

  // P2: Sum over all possible land counts
  let p2 = 0
  for (let l = 0; l <= Math.min(deck.totalLands, n); l++) {
    const pL = pmf(deck.deckSize, deck.totalLands, n, l)
    if (pL === 0) continue

    const pColors = colorsOkGivenLands(deck, spell, l)
    const pManaOk = manaOkGivenLands(deck, spell.mv, l)

    p2 += pL * pColors * pManaOk
  }

  return { p1, p2: clamp01(p2) }
}

function colorsOkGivenLands(deck: DeckProfile, spell: SpellCost, l: number): number {
  let minP = 1
  for (const [c, need] of Object.entries(spell.pips)) {
    if (!need) continue
    const Sc = deck.landColorSources[c] ?? 0
    const p = atLeast(deck.totalLands, Sc, l, need)
    minP = Math.min(minP, p)
  }
  return minP
}

function manaOkGivenLands(deck: DeckProfile, mvNeeded: number, l: number): number {
  // No multi-mana lands
  if (!deck.unconditionalMultiMana) {
    return l >= mvNeeded ? 1 : 0
  }

  const { U, delta } = deck.unconditionalMultiMana
  let sum = 0

  for (let m = 0; m <= Math.min(U, l); m++) {
    const pM = pmf(deck.totalLands, U, l, m)
    const mana = l + m * delta
    if (mana >= mvNeeded) sum += pM
  }

  return clamp01(sum)
}
```

### 10.3 Producer Online Probability

```typescript
function producerOnlineProb(
  deck: DeckProfile,
  producer: ProducerInDeck,
  turnTarget: number,
  ctx: Context
): number {
  const tLatest = turnTarget - producer.def.delay - 1
  if (tLatest < 1) return 0

  const seen = cardsSeen(tLatest, ctx.playDraw)

  // P(draw at least one copy)
  const pDraw = atLeastOneCopy(deck.deckSize, producer.copies, seen)

  // P(can cast producer by tLatest)
  const costSpell: SpellCost = {
    mv: producer.def.castCostGeneric + sumPips(producer.def.castCostPips),
    generic: producer.def.castCostGeneric,
    pips: producer.def.castCostPips,
  }
  const pCastable = baseCastabilityAtTurn(deck, costSpell, tLatest, ctx).p2

  // P(survives until turnTarget)
  const exposureTurns = turnTarget - tLatest
  const r = producer.def.isCreature ? ctx.removalRate : ctx.removalRate * ctx.rockRemovalFactor
  const pSurvive = Math.pow(1 - r, Math.max(0, exposureTurns))

  return clamp01(pDraw * pCastable * pSurvive)
}
```

### 10.4 Disjoint K=0/1/2 + Conditional Castability

```typescript
function acceleratedCastabilityAtTurn(
  deck: DeckProfile,
  spell: SpellCost,
  turn: number,
  producers: ProducerInDeck[],
  ctx: Context
): { p2: number } {
  // 1) Compute pᵢ for each producer
  const items = producers
    .filter((p) => p.copies > 0)
    .map((p) => ({
      p,
      pi: producerOnlineProb(deck, p, turn, ctx),
      net: netPerTurn(p),
    }))
    .filter((x) => x.pi > 0 && x.net > 0)

  // Cap for performance (top 18 by impact)
  items.sort((a, b) => b.pi * b.net - a.pi * a.net)
  const cand = items.slice(0, 18)

  // 2) Compute P(K=0), P(K=1), P(K≥2)
  const p0 = cand.reduce((acc, x) => acc * (1 - x.pi), 1)
  const p1Sum = cand.reduce((acc, xj) => {
    return acc + (xj.pi * p0) / (1 - xj.pi)
  }, 0)
  const p2Sum = clamp01(1 - p0 - p1Sum)

  // 3) K=0 scenario
  const k0 = castabilityGivenOnlineSet(deck, spell, turn, [], ctx)
  let out = p0 * k0

  // 4) K=1 scenario (mixture over which producer)
  if (p1Sum > 0) {
    let mix = 0
    for (const x of cand) {
      const w = (x.pi * p0) / (1 - x.pi) / p1Sum
      mix += w * castabilityGivenOnlineSet(deck, spell, turn, [x.p], ctx)
    }
    out += p1Sum * mix
  }

  // 5) K=2 scenario (pair mixture)
  if (p2Sum > 0 && cand.length >= 2) {
    let sumW = 0,
      mix = 0
    for (let i = 0; i < cand.length; i++) {
      for (let j = i + 1; j < cand.length; j++) {
        const pi = cand[i].pi,
          pj = cand[j].pi
        const w = (pi * pj * p0) / ((1 - pi) * (1 - pj))
        sumW += w
        mix += w * castabilityGivenOnlineSet(deck, spell, turn, [cand[i].p, cand[j].p], ctx)
      }
    }
    if (sumW > 0) out += p2Sum * (mix / sumW)
  }

  return { p2: clamp01(out) }
}

function castabilityGivenOnlineSet(
  deck: DeckProfile,
  spell: SpellCost,
  turn: number,
  onlineProducers: ProducerInDeck[],
  ctx: Context
): number {
  // Extra mana from online producers
  const extraMana = onlineProducers.reduce((s, p) => s + netPerTurn(p), 0)
  const mvNeeded = Math.max(0, spell.mv - extraMana)

  // Allocate pips covered by producers (k≤2, brute-force)
  const pipsCovered = bestPipCoverage(spell.pips, onlineProducers)

  const reducedSpell: SpellCost = {
    ...spell,
    mv: mvNeeded,
    pips: pipsCovered.remainingPips,
  }

  return baseCastabilityAtTurn(deck, reducedSpell, turn, ctx).p2
}

function netPerTurn(p: ProducerInDeck): number {
  return Math.max(0, p.def.producesAmount - p.def.activationTax)
}
```

---

## 11) Limitations v1.1

### Instant Mode (Analytic)

| Limitation                                           | Acceptable Because                          |
| ---------------------------------------------------- | ------------------------------------------- |
| Correlations approximated (dork {G} ↔ green sources) | Validated via advanced mode on sample decks |
| Signets: activation tax handled, fixing approximated | Conservative estimate is safe               |
| K truncated at 2                                     | 3+ producers online is rare edge case       |
| Independence assumption for producers                | Poisson-binomial is standard approximation  |

### Needs Advanced Mode

| Scenario                                             | Why                                     |
| ---------------------------------------------------- | --------------------------------------- |
| Rituals / Treasures                                  | One-shot timing is sequencing-dependent |
| Enhancers (Badgermole Cub)                           | Land ETB interactions                   |
| Conditional lands (Nykthos, Cradle, Coffers, Temple) | Board-state dependent                   |
| Tron lands                                           | Assembly probability needs simulation   |

---

## 12) API v1.1

### Core Functions

```typescript
// Base castability (lands only, includes multi-mana)
computeBaseCastabilityAtTurn(
  deck: DeckProfile,
  spell: SpellCost,
  turn: number,
  ctx: Context
): { p1: number, p2: number }

// With acceleration
computeAcceleratedCastabilityAtTurn(
  deck: DeckProfile,
  spell: SpellCost,
  turn: number,
  producers: ProducerInDeck[],
  ctx: Context
): { p2: number }

// Full analysis (wrapper)
computeAcceleratedCastability(
  deck: DeckProfile,
  spell: SpellCost,
  producers: ProducerInDeck[],
  ctx: Context
): {
  base: { p1: number, p2: number },
  withAcceleration: { p1: number, p2: number },
  accelerationImpact: number,
  acceleratedTurn: number | null
}
```

### Data Types

```typescript
interface DeckProfile {
  deckSize: number
  totalLands: number
  landColorSources: Record<Color, number>
  unconditionalMultiMana?: {
    U: number // Count of multi-mana lands
    delta: number // Bonus per land
  }
}

interface SpellCost {
  mv: number
  generic: number
  pips: Partial<Record<Color, number>>
}

interface Context {
  playDraw: 'PLAY' | 'DRAW'
  removalRate: number // 0..1
  rockRemovalFactor: number // e.g., 0.3
}

interface ProducerInDeck {
  def: ManaProducerDef
  copies: number
}
```

---

## 13) ENHANCER Producer Type (v2.0)

### 13.1 Motivation

Cards like **Badgermole Cub** don't produce mana themselves — they enhance other creature mana producers. Cub's ability: _"Whenever you tap a creature for mana, add an additional {G}."_ Plus Earthbend 1 (ETB: land becomes a creature with haste).

This creates a **multiplicative effect**: the more dorks on the board, the more mana Cub generates. A flat `producesAmount: 1` drastically underestimates Cub in dork-heavy decks.

### 13.2 Model

ENHANCER fields in `ManaProducerDef`:

```typescript
enhancerBonus: number        // +1G per creature that taps for mana
enhancerBonusMask: ColorMask // Color of the bonus (G for Cub)
enhancesTypes: ManaProducerType[] // Which types it enhances (['DORK'])
```

In `castabilityGivenOnlineSet`, the total extra mana from an online set is:

```
extraMana = Σ netMana(regular_i)           // Base production from dorks/rocks
          + Σ netMana(enhancer_j)          // Enhancer's own production (earthbend)
          + Σ_j enhancerBonus_j × |compatible_j|  // Bonus per enhanced dork
```

Where `compatible_j` = other producers in the online set that match `enhancesTypes`. ENHANCERs also enhance other ENHANCERs' earthbent land-creatures (they're creatures that tap for mana).

### 13.3 K-Scenario Impact

| Online Set          | Extra Mana | Calculation                             |
| ------------------- | ---------- | --------------------------------------- |
| Cub alone           | 1G         | 1 base (earthbend)                      |
| Cub + Elves         | 3G         | 1 base + 1 (Elves) + 1 (bonus on Elves) |
| Cub + Cub           | 4G         | 1+1 base + 1+1 mutual bonus             |
| Cub + Elves + Birds | 5G         | 1 base + 1+1 (dorks) + 1+1 (bonuses)    |

### 13.4 Color Assignment

ENHANCERs also add virtual color slots for the P1 DFS color assignment. `buildEnhancerVirtualSlots()` creates one `{producesAny: false, producesMask: enhancerBonusMask}` entry per enhanced dork, so the engine can allocate bonus G pips to reduce spell color requirements.

---

## 14) K=3 Triple Scenarios (v2.0)

### 14.1 Why K=3

The v1.1 engine truncated at K=2 (pairs). In a deck with 4 Llanowar Elves + 4 Badgermole Cub + 4 Gene Pollinator, having 3 producers online by T3-T4 is common. K=2 missed the critical ENHANCER + 2 dorks scenario.

### 14.2 Implementation

The probability mass is split exactly:

```
P(K=0)       = Π(1 - pᵢ)
P(K=1 exact) = Σⱼ pⱼ × Π_{i≠j}(1 - pᵢ)
P(K=2 exact) = Σ_{i<j} pᵢ pⱼ × P₀ / ((1-pᵢ)(1-pⱼ))
P(K≥3)       = 1 - P₀ - P₁ - P₂

Triple weights:
w_{i,j,k} = pᵢ pⱼ pₖ × P₀ / ((1-pᵢ)(1-pⱼ)(1-pₖ))
```

For each K scenario, we evaluate `castabilityGivenOnlineSet()` with the specific producer set and weight by the scenario probability.

### 14.3 Performance

With n ≤ 18 candidate producers (after `MAX_PRODUCER_CANDIDATES` cap):

- K=2: C(18,2) = 153 pairs
- K=3: C(18,3) = 816 triples
- Each evaluation: ~200 iterations (land count loop)
- Total: < 1ms on modern hardware

---

## 15) Hybrid Mana Handling (v2.0)

### 15.1 Display

Hybrid symbols `{R/G}` use mana-font's built-in split classes (`ms-rg`, `ms-wu`, etc.) for proper bicolor circle rendering.

### 15.2 Base Castability (P1/P2)

In `useProbabilityCalculation()`, hybrid mana uses `Math.max(pColor1, pColor2)` — player can choose the more available color.

### 15.3 Accelerated Castability

In `useAcceleratedCastability()`, hybrid pips are assigned to the color with the most deck sources. This is a conservative approximation (doesn't model the fallback color) but accurate for typical decks where one color dominates.

### 15.4 Ramp Detection

Combat-damage-conditional treasure creation (`"deals combat damage...create Treasure"`) is excluded from ramp detection. Only ETB/passive treasure makers (Dockside Extortionist, Smothering Tithe) qualify as ramp.

---

## Conclusion

Version 2.0 adds three major capabilities to the acceleration engine:

1. **Proper conditioning** — Color probability depends on actual lands drawn, not assumed
2. **Multi-mana as random variable** — No more deterministic "all copies in play"
3. **Disjoint scenarios** — K=0/1/2/3 model avoids probability double-counting
4. **Unified survival** — Single formula `(1-r)^n` with configurable slider
5. **No magic numbers** — All constants justified or configurable
6. **Clean separation** — `delay` replaces conceptually flawed `activationTurn`
7. **ENHANCER type** — Multiplicative dork enhancement (Badgermole Cub)
8. **K=3 triples** — Captures 3-producer combos critical for ENHANCER synergies
9. **Hybrid mana** — Correct display, probability, and ramp assignment

The result is a mathematically rigorous system that answers the real question players care about:

> **"What are my actual chances of casting this spell on curve?"**

---

_Document Version: 2.0_  
_Last Updated: April 2026_  
_ManaTuner v2.3_
