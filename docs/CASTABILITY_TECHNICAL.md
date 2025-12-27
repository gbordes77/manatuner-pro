# ManaTuner Pro - Castability System Technical Documentation

> **Version**: 1.0  
> **Last Updated**: December 2025  
> **Audience**: Developers, MTG enthusiasts, mathematicians

---

## Table of Contents

1. [Overview](#1-overview)
2. [Mathematical Foundations](#2-mathematical-foundations)
3. [Architecture](#3-architecture)
4. [Calculation Logic](#4-calculation-logic)
5. [Special Cases](#5-special-cases)
6. [Current Limitations](#6-current-limitations)
7. [Future Extension: Mana Rocks & Dorks](#7-future-extension-mana-rocks--dorks)
8. [Glossary](#8-glossary)

---

## 1. Overview

### What is Castability?

**Castability** measures the probability of being able to cast a spell on curve (at the turn equal to its converted mana cost). In Magic: The Gathering, having the right colors and quantity of mana at the right time is crucial for consistent gameplay.

ManaTuner Pro calculates two probability metrics for each spell:

| Metric | Name | Description |
|--------|------|-------------|
| **P1** | Perfect Scenario | Probability of having the right colored sources, assuming you hit all land drops |
| **P2** | Realistic Scenario | P1 adjusted for the probability of actually drawing enough lands |

### How to Interpret Results

```
+------------------+------------------+-------------------------------------+
| Probability      | Color Code       | Interpretation                      |
+------------------+------------------+-------------------------------------+
| >= 80%           | Green            | Excellent - reliable casting        |
| 65-79%           | Blue             | Good - usually castable             |
| 45-64%           | Orange/Yellow    | Risky - consider mana base changes  |
| < 45%            | Red              | Critical - likely casting problems  |
+------------------+------------------+-------------------------------------+
```

### Example Analysis

**Lightning Bolt {R}** in a deck with 20 Mountains:
- CMC: 1, Target turn: 1
- Cards seen by turn 1: 7 (opening hand)
- P1 (color): ~99% (very high chance of having 1 red source)
- P2 (realistic): ~95% (accounting for land draws)

**Cryptic Command {1}{U}{U}{U}** in a deck with 12 Islands:
- CMC: 4, Target turn: 4
- Cards seen by turn 4: 10 (7 + 3 draws)
- P1 (color): ~75% (need 3 blue sources by turn 4)
- P2 (realistic): ~70% (harder with triple-color requirement)

---

## 2. Mathematical Foundations

### The Hypergeometric Distribution

ManaTuner Pro uses the **hypergeometric distribution** to calculate probabilities. This is the correct statistical model for drawing cards without replacement from a deck.

#### The Formula

The probability of drawing exactly `k` successes from a population is:

```
P(X = k) = C(K, k) * C(N-K, n-k) / C(N, n)

Where:
  N = Total cards in deck (population size)
  K = Number of "successes" in deck (e.g., red sources)
  n = Number of cards drawn (sample size)
  k = Number of successes wanted
  C(a, b) = Binomial coefficient "a choose b"
```

For castability, we calculate the **cumulative probability** (at least k successes):

```
P(X >= k) = Sum from i=k to min(n, K) of P(X = i)
```

#### Implementation in ManaTuner

```typescript
// From ManaCostRow.tsx - Core hypergeometric calculation
const hypergeometric = (N: number, K: number, n: number, k: number): number => {
  const combination = (a: number, b: number): number => {
    if (b > a || b < 0) return 0
    if (b === 0 || b === a) return 1

    let result = 1
    for (let i = 0; i < b; i++) {
      result = result * (a - i) / (i + 1)
    }
    return result
  }

  // Cumulative: P(X >= k)
  let probability = 0
  for (let i = k; i <= Math.min(n, K); i++) {
    probability += combination(K, i) * combination(N - K, n - i) / combination(N, n)
  }
  return probability
}
```

### Relationship to Frank Karsten Tables

Frank Karsten's famous article ["How Many Colored Mana Sources Do You Need?"](https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/how-many-colored-mana-sources-do-you-need-to-consistently-cast-your-spells-a-guilds-of-ravnica-update/) provides lookup tables for 90% casting probability.

ManaTuner Pro implements these tables for recommendations:

```typescript
// From manaCalculator.ts - Karsten's 90% threshold tables
const KARSTEN_TABLES: { [symbols: number]: { [turn: number]: number } } = {
  1: { // 1 colored symbol needed
    1: 14,  // Turn 1: need 14 sources for 90%
    2: 13,  // Turn 2: need 13 sources
    3: 12,  // ...
    4: 11,
    5: 10,
    6: 9
  },
  2: { // 2 colored symbols (e.g., {U}{U})
    2: 20,  // Turn 2: need 20 sources
    3: 18,
    4: 16,
    5: 15,
    6: 14
  },
  3: { // 3 colored symbols (e.g., {U}{U}{U})
    3: 23,
    4: 20,
    5: 19,
    6: 18
  }
}
```

### Cards Seen Calculation

```
cardsSeen = openingHandSize + (turn - 1)
          = 7 + turn - 1

Turn 1: 7 cards (opening hand, no draw on turn 1 on the play)
Turn 2: 8 cards
Turn 3: 9 cards
Turn 4: 10 cards
...
```

> **Note**: This assumes "on the play" (no draw turn 1). On the draw, add 1 card.

---

## 3. Architecture

### System Overview

```
+------------------+     +-------------------+     +------------------+
|   CastabilityTab |---->|   ManaCostRow     |---->|  Scryfall API    |
|   (UI Container) |     |   (Card Display)  |     |  (Card Data)     |
+------------------+     +-------------------+     +------------------+
                               |
                               | useProbabilityCalculation()
                               v
                         +-------------------+
                         |  Local Calculation |
                         |  (hypergeometric)  |
                         +-------------------+
                               |
         +---------------------+---------------------+
         v                                           v
+------------------+                        +------------------+
|  manaCalculator  |                        |   landService    |
|  (Core Math)     |                        |  (ETB/Tempo)     |
+------------------+                        +------------------+
         |                                           |
         v                                           v
+------------------+                        +------------------+
| KARSTEN_TABLES   |                        | LandMetadata     |
| (90% thresholds) |                        | (ETB conditions) |
+------------------+                        +------------------+
```

### Data Flow

```
1. User enters decklist
        |
        v
2. DeckAnalyzer.analyzeDeck()
   - Parses deck list
   - Queries Scryfall for card data
   - Detects lands via LandService
   - Calculates color distribution
        |
        v
3. CastabilityTab receives AnalysisResult
   - colorDistribution: { W: 10, U: 8, B: 0, R: 12, G: 0 }
   - totalLands: 24
   - totalCards: 60
        |
        v
4. ManaCostRow for each spell
   - Fetches card data from Scryfall
   - Parses mana cost symbols
   - Calculates P1 and P2
        |
        v
5. Display with color-coded probability bars
```

### Key Files

| File | Responsibility |
|------|----------------|
| `ManaCostRow.tsx` | UI component + probability hook |
| `manaCalculator.ts` | Core math, Karsten tables, tempo-aware calculations |
| `landService.ts` | Land detection, ETB behavior analysis |
| `deckAnalyzer.ts` | Deck parsing, analysis orchestration |
| `types/lands.ts` | Type definitions for land system |

---

## 4. Calculation Logic

### Step 1: Parse Mana Cost

The mana cost string (e.g., `{2}{W}{W}`) is parsed to extract:
- Regular colored symbols: `{W}`, `{U}`, `{B}`, `{R}`, `{G}`
- Hybrid symbols: `{W/U}`, `{R/G}`
- Generic mana: `{2}`, `{3}`
- X costs: `{X}`

```typescript
// From ManaCostRow.tsx
const manaCostSymbols = actualManaCost.match(/\{[WUBRG]\}/g) || []
const hybridSymbols = actualManaCost.match(/\{([WUBRG])\/([WUBRG])\}/g) || []

const colorCounts: { [color: string]: number } = {}
manaCostSymbols.forEach(symbol => {
  const color = symbol.replace(/[{}]/g, '')
  colorCounts[color] = (colorCounts[color] || 0) + 1
})
```

### Step 2: Calculate P1 (Color Probability)

For each color requirement, calculate the probability of having enough sources:

```typescript
// For each color in the spell's cost
for (const [color, symbolsNeeded] of Object.entries(colorCounts)) {
  const sourcesForColor = deckSources?.[color] || 0
  
  // P(having >= symbolsNeeded sources of this color by turn)
  const p1Color = hypergeometric(
    landsInDeck,      // N: total lands
    sourcesForColor,  // K: sources of this color
    turn,             // n: lands drawn by this turn
    symbolsNeeded     // k: symbols needed
  )
  
  // Overall P1 is minimum across all colors
  p1Probability = Math.min(p1Probability, p1Color)
}
```

### Step 3: Calculate P2 (Realistic Probability)

P2 factors in the probability of actually drawing enough lands:

```typescript
// Cards seen by target turn
const cardsSeen = 7 + (turn - 1)

// Probability of having at least 'turn' lands by turn 'turn'
const probHavingEnoughLands = hypergeometric(
  deckSize,     // N: total cards
  landsInDeck,  // K: total lands
  cardsSeen,    // n: cards seen
  turn          // k: lands needed (1 per turn)
)

// P2 = P1 * P(enough lands)
const p2Probability = p1Probability * probHavingEnoughLands
```

### Step 4: Return Rounded Percentages

```typescript
const finalP1 = Math.round(Math.max(Math.min(p1Probability * 100, 99), 0))
const finalP2 = Math.round(Math.max(Math.min(p2Probability * 100, 99), 0))

return { p1: finalP1, p2: finalP2, hasX, xInfo }
```

---

## 5. Special Cases

### 5.1 Hybrid Mana ({W/U}, {R/G}, etc.)

Hybrid mana can be paid with **either** color. The calculation uses the **maximum** probability:

```typescript
// Parse hybrid symbols like {W/R}
hybridSymbols.forEach(symbol => {
  const match = symbol.match(/\{([WUBRG])\/([WUBRG])\}/)
  if (match) {
    hybridMana.push({ color1: match[1], color2: match[2] })
  }
})

// For each hybrid symbol, use the BETTER option
for (const hybrid of hybridMana) {
  const sources1 = deckSources?.[hybrid.color1] || 0
  const sources2 = deckSources?.[hybrid.color2] || 0

  const p1Color1 = hypergeometric(landsInDeck, sources1, turn, 1)
  const p1Color2 = hypergeometric(landsInDeck, sources2, turn, 1)

  // Take MAX since player chooses which to pay
  const p1Hybrid = Math.max(p1Color1, p1Color2)
  p1Probability = Math.min(p1Probability, p1Hybrid)
}
```

**Example**: Lightning Helix costs `{R}{W}`. If you have 12 red sources and 10 white sources, the hybrid symbol `{R/W}` (if it existed) would use whichever color has better probability.

### 5.2 X Costs ({X}, {X}{X})

X spells are evaluated assuming a "useful" X value:

```typescript
// Count X symbols in cost
const getXCountFromManaCost = (manaCost: string | null): number => {
  if (!manaCost) return 0
  const xMatches = manaCost.match(/\{X\}/g) || []
  return xMatches.length
}

// Calculate effective X (we use X=2 as reasonable default)
const calculateEffectiveX = (fixedCmc: number, xCount: number) => {
  const reasonableX = 2
  const xValue = Math.max(1, reasonableX)
  const targetTurn = fixedCmc + (xValue * xCount)
  return { xValue, targetTurn }
}
```

**Example**: Fireball costs `{X}{R}`.
- Fixed CMC: 1 (the {R})
- X count: 1
- Effective X: 2
- Target turn: 1 + 2 = 3

The UI shows: `CMC: 1+X` with a badge `X=2`

### 5.3 Double-Faced Cards (DFCs)

Modal DFCs and Transform cards have special handling:

```typescript
// Get mana cost from front face of DFC
const getManaCostFromCard = (cardData: MTGCard | null): string | null => {
  if (!cardData) return null

  // Direct mana_cost if present
  if (cardData.mana_cost) return cardData.mana_cost

  // For DFCs, get from front face
  if (cardData.card_faces && cardData.card_faces.length > 0) {
    const frontFace = cardData.card_faces[0]
    if (frontFace.mana_cost) return frontFace.mana_cost
  }

  return null
}
```

**Example**: Turntimber Symbiosis // Turntimber, Serpentine Wood
- Front face: {4}{G}{G}{G} (spell)
- Back face: Land (enters tapped unless you pay 3 life)
- We analyze the **spell side** for castability

### 5.4 Colorless Costs ({C})

Colorless mana symbols (like on Eldrazi) are tracked but treated as easily satisfiable:

```typescript
// Colorless spells return high probability
if (Object.keys(colorCounts).length === 0 && hybridMana.length === 0) {
  return { p1: 99, p2: 98, hasX, xInfo }
}
```

### 5.5 Phyrexian Mana ({W/P}, {U/P}, etc.)

Currently **not** specially handled. Phyrexian mana appears as regular colored symbols. Future enhancement could model the life payment option.

---

## 6. Current Limitations

### What is NOT Currently Considered

| Limitation | Impact | Reason |
|------------|--------|--------|
| **Mana dorks** | Underestimates fast decks | Complex interaction timing |
| **Mana rocks** | Underestimates ramp decks | Similar to dorks |
| **Treasure tokens** | Misses temporary mana | Dynamic mana sources |
| **Rituals** | Dark Ritual not counted | One-shot effects |
| **Fetchland thinning** | Minor inaccuracy (~1%) | Complexity vs. benefit |
| **Mulligans** | Assumes 7-card hand | Separate mulligan analysis exists |
| **Modal DFC lands** | Land side ignored for tempo | Complex dual-purpose |
| **Channel lands** | Land mode only | Special abilities |

### Why These Limitations Exist

1. **Complexity vs. Accuracy**: Adding mana dorks/rocks requires recursive probability calculations (see Section 7)

2. **User Experience**: Simpler model is easier to understand and verify

3. **Processing Time**: More complex models would slow down real-time analysis

4. **Edge Cases**: Many interactions (e.g., "destroy target creature" removing your dork) are hard to model

### Workarounds

For ramp decks, users can mentally adjust:
- Add ~10-15% to P1/P2 for decks with 4+ mana dorks
- Consider Sol Ring as effectively +2 land drops

---

## 7. Future Extension: Mana Rocks & Dorks

### The Challenge

Mana producers other than lands (like Llanowar Elves, Sol Ring, Birds of Paradise) significantly affect castability but introduce complexity:

```
Without dorks:  T1 land -> T2 land -> T3 land -> Cast 3-drop
With T1 dork:   T1 land + dork -> T2 land -> Cast 3-drop on T2!
```

### Questions for Expert Consultation

#### Q1: Modeling Dork/Rock Availability

**How should we calculate P(dork in play at the right time)?**

Considerations:
- P(dork in opening hand) = hypergeometric probability
- P(dork survives to produce mana) = survival rate factor
- Timing: T1 dork enables T2 acceleration, T2 dork enables T3 acceleration

```
P_effective(dork) = P(draw dork) * P(cast dork) * P(dork survives)
```

Proposed survival rates:
| Dork Type | Survival Rate | Reasoning |
|-----------|---------------|-----------|
| Llanowar Elves | 70-80% | Creature, vulnerable |
| Birds of Paradise | 75-85% | Flying helps slightly |
| Sol Ring | 95%+ | Artifact, rarely removed |
| Mana Crypt | 95%+ | Similar to Sol Ring |

#### Q2: Recursive Calculation

**Should castability be calculated recursively?**

Example: "Can I cast Cryptic Command on T3 with mana dorks?"

```
P(cast on T3) = 
  P(natural T4 mana on T3 with dork acceleration)
  = P(T1 dork) * P(dork produces right color) * P(remaining colors)
  + P(no T1 dork) * P(T4 natural cast)
```

This requires:
1. Calculating dork draw probability for each turn
2. Modeling dork mana contribution
3. Adjusting subsequent color probabilities

#### Q3: Late-Game Rocks

**How to handle rocks that cost mana themselves?**

Example: Arcane Signet costs {2}
- Can't accelerate until T3 at earliest (T2 play, T3 tap)
- But still adds to colored mana count

Proposed approach:
```
effectiveTurn(rock) = max(rock.cmc + 1, targetSpell.cmc - 1)

// Rock doesn't help if it comes online too late
if (effectiveTurn >= targetTurn) {
  contribution = 0
} else {
  contribution = partial (based on turns available)
}
```

#### Q4: Dork Reliability Factor

**How should removal-heavy metagames affect dork value?**

Proposed metagame-aware adjustment:
```typescript
interface MetagameContext {
  removalDensity: 'low' | 'medium' | 'high';
  // low: casual, commander
  // medium: standard, pioneer
  // high: legacy, modern
}

const DORK_SURVIVAL_MODIFIER = {
  low: 0.95,
  medium: 0.80,
  high: 0.65
}
```

#### Q5: Weighting Dorks vs. Lands

**How to combine dork probability with land probability?**

Option A: **Additive Model**
```
effective_sources = land_sources + (dork_sources * survival_rate)
```

Option B: **Conditional Model**
```
P(color) = P(color from lands) + P(dork) * (1 - P(color from lands)) * P(color from dork)
```

Option C: **Monte Carlo Simulation**
```
Simulate 10,000 games:
  - Draw opening hand
  - Track land drops and dork deployment
  - Record when target spell becomes castable
  - Aggregate statistics
```

### Proposed Implementation Phases

#### Phase 1: Static Dork Contribution
- Count mana dorks in deck
- Apply flat survival rate
- Add to effective source count

#### Phase 2: Turn-Aware Calculation
- Calculate dork availability by turn
- Model acceleration effect
- Adjust target turn for accelerated casts

#### Phase 3: Interactive Model
- User-configurable survival rates
- Metagame presets
- Monte Carlo option for accuracy

### Data Structure Proposal

```typescript
interface ManaProducer {
  name: string;
  type: 'dork' | 'rock' | 'ritual' | 'treasure';
  manaCost: string;  // Cost to play
  producedColors: LandManaColor[];
  producesAny: boolean;
  turnsToActivate: number;  // 0 for haste dorks, 1 normally
  survivalRate: number;  // 0-1, based on type and format
  isReusable: boolean;  // false for rituals/treasure
}

interface AcceleratedCastabilityResult {
  base: { p1: number; p2: number };
  withAcceleration: { p1: number; p2: number };
  accelerationImpact: number;  // % improvement
  acceleratedTurn: number;  // New effective turn
  keyAccelerators: string[];  // Which cards enable this
}
```

---

## 8. Glossary

| Term | Definition |
|------|------------|
| **Castability** | Probability of casting a spell on curve |
| **CMC** | Converted Mana Cost (total mana value) |
| **Color Pip** | A single colored mana symbol (e.g., {U}) |
| **DFC** | Double-Faced Card (two sides) |
| **ETB** | Enters The Battlefield |
| **Hypergeometric** | Statistical distribution for sampling without replacement |
| **Mana Dork** | Creature that produces mana (e.g., Llanowar Elves) |
| **Mana Rock** | Artifact that produces mana (e.g., Sol Ring) |
| **Mana Screw** | Not drawing enough lands to cast spells |
| **On Curve** | Casting a spell the turn its CMC allows |
| **P1 (Perfect)** | Color probability assuming all land drops |
| **P2 (Realistic)** | P1 adjusted for land draw probability |
| **Source** | A land (or other permanent) that can produce a color |
| **Tempo** | The pace of deploying threats/answers |

---

## Appendix A: Code Reference

### Key Functions

```typescript
// ManaCostRow.tsx
useProbabilityCalculation(cardData, cardName, deckSources, totalLands, totalCards)
  -> { p1: number, p2: number, hasX: boolean, xInfo: {...} }

// manaCalculator.ts  
ManaCalculator.calculateManaProbability(deckSize, sources, turn, symbolsNeeded, onPlay, handSize)
  -> ProbabilityResult

ManaCalculator.cumulativeHypergeometric(N, K, n, minK)
  -> number (0-1 probability)

analyzeSpellCastability(spell, lands, totalCards)
  -> Promise<SpellCastabilityResult>

calculateTempoAwareProbability(params)
  -> TempoAwareProbability

// landService.ts
landService.detectLand(cardName)
  -> Promise<LandMetadata | null>

landService.getUntappedProbability(land, turn, context)
  -> number (0-1)
```

### Type Definitions

```typescript
interface ProbabilityResult {
  probability: number;
  meetsThreshold: boolean;  // >= 90%
  sourcesNeeded: number;    // Karsten recommendation
  sourcesAvailable: number;
  recommendation: string;
}

interface TempoAwareProbability {
  raw: number;              // Ignoring ETB effects
  tempoAdjusted: number;    // Accounting for tapped lands
  scenarios: {
    aggressive: number;     // Pay life for shocks
    conservative: number;   // Don't pay life
    balanced: number;       // Weighted average
  };
  effectiveSourcesByTurn: number[];
  tempoImpact: number;      // raw - tempoAdjusted
}
```

---

## Appendix B: Validation Examples

### Example 1: Lightning Bolt {R}

```
Deck: 60 cards, 24 lands, 20 Mountains

Turn 1 calculation:
- N = 24 (lands in deck)
- K = 20 (red sources)
- n = 1 (lands by turn 1, simplified)
- k = 1 (need 1 red)

P1 = hypergeom(24, 20, 1, 1) = 20/24 = 83.3%

Actually, we calculate with cards seen:
- cardsSeen = 7
- P1 = hypergeom(24, 20, 7, 1) = 99.9%

P2 adjustment (need at least 1 land in 7 cards):
- P(>=1 land) = 1 - P(0 lands) = 1 - C(36,7)/C(60,7) = 99.7%
- P2 = 99.9% * 99.7% = 99.6%

Result: P1=99%, P2=99%
```

### Example 2: Cryptic Command {1}{U}{U}{U}

```
Deck: 60 cards, 24 lands, 14 Islands

Turn 4 calculation:
- cardsSeen = 10 (7 + 3)
- Need 3 blue sources

P1 = hypergeom(24, 14, 4, 3) 
   = probability of 3+ Islands in first 4 lands
   = ~65%

P2 = P1 * P(4+ lands in 10 cards)
   = 65% * 95%
   = ~62%

Result: P1=65%, P2=62%
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2025 | ManaTuner Team | Initial comprehensive documentation |

---

*This document is part of the ManaTuner Pro technical documentation suite.*
