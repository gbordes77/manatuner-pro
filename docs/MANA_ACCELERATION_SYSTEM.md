# ManaTuner Pro - Mana Acceleration System

## Table of Contents

1. [Introduction](#introduction)
2. [Theory & Magic Fundamentals](#theory--magic-fundamentals)
3. [Mathematical Model](#mathematical-model)
4. [Producer Types & Classification](#producer-types--classification)
5. [Multi-Mana Lands](#multi-mana-lands)
6. [Technical Implementation](#technical-implementation)
7. [Probability Calculations](#probability-calculations)
8. [Survival & Removal Modeling](#survival--removal-modeling)
9. [API Reference](#api-reference)
10. [Examples & Use Cases](#examples--use-cases)

---

## Introduction

ManaTuner Pro's acceleration system models the impact of mana ramp on spell castability. Unlike simple "count your lands" approaches, this system uses hypergeometric probability distributions combined with survival modeling to answer the critical question:

> "What is the probability I can cast this spell on curve, considering my ramp?"

### Why This Matters

In Magic: The Gathering, a deck with Sol Ring has fundamentally different casting probabilities than one without. A Turn 1 Sol Ring effectively gives you 3 mana on Turn 2 instead of 2. This system quantifies that advantage mathematically.

---

## Theory & Magic Fundamentals

### The Mana Curve Problem

Every Magic player faces the same challenge: you need the right amount of mana at the right time. Too little mana = mana screw. Too much = mana flood. The traditional solution is running 24 lands in a 60-card deck (~40%).

But this ignores **mana acceleration** - cards that produce more mana than they cost.

### Types of Acceleration

| Type | Definition | Example | Mana Advantage |
|------|------------|---------|----------------|
| **Dork** | Creature that taps for mana | Llanowar Elves | +1 mana/turn after T1 |
| **Rock** | Artifact that produces mana | Sol Ring | +2 mana/turn after T1 |
| **Ritual** | One-shot mana burst | Dark Ritual | +2 mana once |
| **Enhancer** | Modifies land ETB | Badgermole Cub | +1 mana per land ETB |
| **Multi-Land** | Land producing 2+ mana | Ancient Tomb | +1 mana/turn |

### The Acceleration Equation

For any spell with mana value MV, the **effective turn** to cast it is:

```
Effective Turn = max(1, MV - Expected Acceleration by Turn MV)
```

A 4-mana spell in a deck with Sol Ring might be castable on Turn 3:
- Turn 1: Land + Sol Ring (3 mana available)
- Turn 2: Land (4 mana available) - Cast the 4-drop!

---

## Mathematical Model

### Core Probability Framework

We use **hypergeometric distribution** to model card draw probabilities. The hypergeometric probability of drawing exactly k successes from a population is:

```
P(X = k) = C(K, k) * C(N-K, n-k) / C(N, n)

Where:
- N = population size (deck size)
- K = number of success states (e.g., lands in deck)
- n = number of draws (cards seen)
- k = number of successes needed
- C(a,b) = binomial coefficient "a choose b"
```

### Cumulative Probability

We typically want P(X >= k) - the probability of having **at least** k successes:

```typescript
function hypergeometricCDF(N: number, K: number, n: number, k: number): number {
  let probability = 0;
  for (let i = k; i <= Math.min(n, K); i++) {
    probability += hypergeometricPMF(N, K, n, i);
  }
  return probability;
}
```

### Cards Seen Calculation

The number of cards seen by turn T depends on play/draw:

```
Cards Seen = Opening Hand + Draw Steps
           = 7 + (T - 1)           // On the play
           = 7 + T                  // On the draw
```

### Two-Stage Probability Model

ManaTuner calculates two probabilities:

1. **P1 (Perfect/Optimistic)**: Probability of having the right colors, assuming you hit all land drops
2. **P2 (Realistic)**: P1 multiplied by the probability of actually hitting those land drops

```
P2 = P1 * P(having >= T lands by turn T)
```

---

## Producer Types & Classification

### Type Definitions

```typescript
type ProducerType = 'DORK' | 'ROCK' | 'RITUAL' | 'ENHANCER';

interface ManaProducerDef {
  name: string;
  type: ProducerType;
  
  // When can this be played?
  castingCost: number;        // Total MV
  colorRequirement?: string;  // e.g., "G" for Llanowar Elves
  
  // What mana does it produce?
  producedMana: number;       // Amount per activation
  producedColors: string[];   // Colors it can produce
  
  // Timing and survival
  activationTurn: number;     // First turn it can tap (usually castingCost + 1)
  isTapAbility: boolean;      // Does it need to tap?
  isOneShot: boolean;         // Ritual = true, Dork/Rock = false
  
  // Survival characteristics
  survivalProfile: 'fragile' | 'moderate' | 'resilient';
}
```

### Survival Profiles

Different producer types have different survival rates against removal:

| Profile | Base Survival | Description |
|---------|---------------|-------------|
| `fragile` | 60% | Creatures (Lightning Bolt, Fatal Push) |
| `moderate` | 80% | Artifacts (Abrade, Nature's Claim exist but less common) |
| `resilient` | 95% | Lands, hexproof, indestructible |

### Producer Database Examples

```typescript
// Dorks - Fragile but efficient
'Llanowar Elves': {
  type: 'DORK',
  castingCost: 1,
  colorRequirement: 'G',
  producedMana: 1,
  producedColors: ['G'],
  activationTurn: 2,
  survivalProfile: 'fragile'
}

// Rocks - Moderate survival, varied costs
'Sol Ring': {
  type: 'ROCK',
  castingCost: 1,
  producedMana: 2,
  producedColors: ['C'],
  activationTurn: 1,  // Can tap immediately!
  survivalProfile: 'moderate'
}

// Rituals - One-shot burst
'Dark Ritual': {
  type: 'RITUAL',
  castingCost: 1,
  colorRequirement: 'B',
  producedMana: 3,
  producedColors: ['B'],
  isOneShot: true,
  survivalProfile: 'resilient'  // Instant, can't be removed
}

// Enhancers - Modify land behavior
'Badgermole Cub': {
  type: 'ENHANCER',
  castingCost: 2,
  colorRequirement: 'G',
  bonusManaPerLandETB: 1,
  bonusColors: ['G'],
  survivalProfile: 'fragile'
}
```

---

## Multi-Mana Lands

### The producesAmount Field

Lands can produce more than 1 mana per tap. This is tracked via `producesAmount`:

```typescript
interface LandMetadata {
  // ... other fields
  producesAmount?: number;  // Default: 1
}
```

### Multi-Mana Land Categories

#### Unconditional (Always 2+ mana)

| Land | producesAmount | Produces | Notes |
|------|----------------|----------|-------|
| Ancient Tomb | 2 | C, C | 2 life cost |
| Bounce Lands | 2 | 2 colors | Returns a land |
| Lotus Field | 3 | Any | Sacrifices 2 lands ETB |

#### Conditional (Variable output)

| Land | producesAmount | Condition |
|------|----------------|-----------|
| Temple of the False God | 2 | Need 5+ lands |
| Nykthos, Shrine to Nyx | 3* | Based on devotion |
| Gaea's Cradle | 3* | Based on creatures |
| Cabal Coffers | 4* | Based on Swamps |

*Average estimated output

### Bonus Mana Calculation

The system calculates bonus mana from multi-mana lands:

```typescript
const landBonuses = useMemo(() => {
  let bonusManaFromLands = 0;
  const bonusColoredMana: Record<string, number> = {};

  for (const card of analysisResult.cards) {
    if (!card.isLand || !card.landMetadata) continue;
    
    const producesAmount = card.landMetadata.producesAmount ?? 1;
    
    if (producesAmount > 1) {
      const bonusPerLand = producesAmount - 1;
      bonusManaFromLands += bonusPerLand * card.quantity;
      
      // Track colored bonus
      for (const color of card.landMetadata.produces) {
        if (color !== 'C') {
          bonusColoredMana[color] = 
            (bonusColoredMana[color] ?? 0) + bonusPerLand * card.quantity;
        }
      }
    }
  }
  
  return { bonusManaFromLands, bonusColoredMana };
}, [analysisResult?.cards]);
```

### Impact on Castability

Multi-mana lands reduce the effective lands needed:

```typescript
// In acceleratedAnalyticEngine.ts
const effectiveLandsNeeded = Math.max(
  1, 
  turn - Math.floor(bonusMana / 2)
);
```

Example: With 2 Ancient Tombs (4 bonus mana), a 5-mana spell needs only 3 lands on board instead of 5.

---

## Technical Implementation

### Architecture Overview

```
src/
├── types/
│   ├── lands.ts           # LandMetadata with producesAmount
│   └── manaProducers.ts   # ProducerDef, AccelContext, DeckManaProfile
├── data/
│   ├── landSeed.ts        # Land database with producesAmount
│   └── manaProducerSeed.ts # Mana producer database
├── services/
│   ├── manaProducerService.ts  # Producer lookup & caching
│   └── castability/
│       ├── hypergeom.ts              # Core probability functions
│       ├── acceleratedAnalyticEngine.ts  # Main calculation engine
│       └── index.ts                  # Public API
├── contexts/
│   └── AccelerationContext.tsx  # Global acceleration settings
└── components/
    ├── ManaCostRow.tsx              # Card castability display
    ├── SegmentedProbabilityBar.tsx  # Visual ramp impact
    └── analyzer/
        └── AccelerationSettings.tsx # UI controls
```

### Key Data Structures

#### DeckManaProfile

```typescript
interface DeckManaProfile {
  deckSize: number;           // Usually 60 or 99
  totalLands: number;         // Land count
  landColorSources: Partial<Record<LandManaColor, number>>;
  
  // Multi-mana land bonuses
  bonusManaFromLands?: number;
  bonusColoredMana?: Partial<Record<LandManaColor, number>>;
}
```

#### AccelContext

```typescript
interface AccelContext {
  playDraw: 'PLAY' | 'DRAW';      // Affects cards seen
  removalRate: number;             // 0-1, environment hostility
  defaultRockSurvival: number;     // Base artifact survival
}
```

#### CastabilityResult

```typescript
interface CastabilityResult {
  p1: number;  // Color probability (0-1)
  p2: number;  // Realistic castability (0-1)
}

interface AcceleratedCastabilityResult {
  base: CastabilityResult;              // Without ramp
  withAcceleration: CastabilityResult;  // With ramp
  accelerationImpact: number;           // Delta (0-1)
  acceleratedTurn: number | null;       // Turns saved
}
```

### Core Algorithm: computeAcceleratedCastability

```typescript
function computeAcceleratedCastability(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext
): AcceleratedCastabilityResult {
  
  // 1. Calculate base castability (lands only)
  const base = computeBaseCastability(deck, spell, ctx);
  
  // 2. Calculate expected mana from acceleration
  const accelMana = computeExpectedAcceleration(
    producers, 
    spell.mv, 
    ctx
  );
  
  // 3. Determine accelerated turn
  const acceleratedTurn = computeAcceleratedTurn(
    spell.mv, 
    accelMana, 
    deck.bonusManaFromLands
  );
  
  // 4. Recalculate with acceleration
  const withAccel = computeCastabilityAtTurn(
    deck, 
    spell, 
    acceleratedTurn, 
    ctx
  );
  
  return {
    base,
    withAcceleration: withAccel,
    accelerationImpact: withAccel.p2 - base.p2,
    acceleratedTurn
  };
}
```

---

## Probability Calculations

### Step 1: Color Source Probability

For each colored pip in the mana cost, calculate the probability of having enough sources:

```typescript
function computeColorProbability(
  deck: DeckManaProfile,
  pips: Record<string, number>,
  turn: number,
  cardsSeen: number
): number {
  let colorProb = 1.0;
  
  for (const [color, needed] of Object.entries(pips)) {
    if (!needed) continue;
    
    const sources = deck.landColorSources[color] ?? 0;
    const bonusColored = deck.bonusColoredMana?.[color] ?? 0;
    const effectiveNeed = Math.max(0, needed - bonusColored);
    
    if (effectiveNeed > 0) {
      const pColor = hypergeometricCDF(
        deck.totalLands,  // Population: lands in deck
        sources,          // Successes: sources for this color
        turn,             // Draws: lands expected by turn
        effectiveNeed     // Need: pips required
      );
      colorProb = Math.min(colorProb, pColor);
    }
  }
  
  return colorProb;
}
```

### Step 2: Land Drop Probability

Calculate the probability of hitting enough land drops:

```typescript
function computeLandDropProbability(
  deckSize: number,
  totalLands: number,
  cardsSeen: number,
  landsNeeded: number
): number {
  return hypergeometricCDF(
    deckSize,      // Population: deck size
    totalLands,    // Successes: lands in deck
    cardsSeen,     // Draws: cards seen
    landsNeeded    // Need: lands required
  );
}
```

### Step 3: Combine Probabilities

```typescript
const p1 = colorProbability;  // Assumes perfect land drops
const p2 = p1 * landDropProbability;  // Realistic scenario
```

### Step 4: Apply Acceleration

```typescript
function applyAcceleration(
  baseP2: number,
  expectedAccelMana: number,
  survivalRate: number
): number {
  // Acceleration provides a probability boost
  // The more mana, the higher the boost, but diminishing returns
  const accelBoost = expectedAccelMana * survivalRate * 0.05;
  return Math.min(0.99, baseP2 + accelBoost);
}
```

---

## Survival & Removal Modeling

### The Survival Problem

A Turn 1 Llanowar Elves might not survive to Turn 2. The opponent could:
- Lightning Bolt it
- Fatal Push it
- Block with a 1/1

We model this with survival rates.

### Survival Rate Calculation

```typescript
function computeSurvivalRate(
  producer: ManaProducerDef,
  ctx: AccelContext,
  turnsUntilNeeded: number
): number {
  // Base survival from profile
  let baseSurvival: number;
  switch (producer.survivalProfile) {
    case 'fragile': baseSurvival = 0.60; break;
    case 'moderate': baseSurvival = 0.80; break;
    case 'resilient': baseSurvival = 0.95; break;
  }
  
  // Adjust for environment hostility
  const removalAdjustment = 1 - ctx.removalRate;
  let survival = baseSurvival * removalAdjustment;
  
  // More turns = more chances to die
  // Each turn reduces survival by ~10%
  for (let t = 0; t < turnsUntilNeeded; t++) {
    survival *= 0.90;
  }
  
  return Math.max(0.1, survival);  // Floor at 10%
}
```

### Expected Mana from Producers

```typescript
function computeExpectedManaFromProducer(
  producer: ProducerInDeck,
  targetTurn: number,
  ctx: AccelContext
): number {
  const def = producer.def;
  const copies = producer.copies;
  
  // Can't activate before activation turn
  if (targetTurn < def.activationTurn) {
    return 0;
  }
  
  // Probability of having the producer in hand
  const pHaveProducer = hypergeometricCDF(
    60,              // Deck size
    copies,          // Copies in deck
    7 + targetTurn,  // Cards seen
    1                // Need at least 1
  );
  
  // Survival rate
  const turnsAlive = targetTurn - def.activationTurn;
  const survival = computeSurvivalRate(def, ctx, turnsAlive);
  
  // Expected mana contribution
  if (def.isOneShot) {
    // Rituals: one-time burst
    return pHaveProducer * def.producedMana;
  } else {
    // Dorks/Rocks: ongoing production
    return pHaveProducer * survival * def.producedMana;
  }
}
```

### Removal Rate Slider

The UI exposes a "Removal Rate" slider (0% - 100%):

| Setting | Meaning | Example Meta |
|---------|---------|--------------|
| 0% | No removal | Goldfish testing |
| 25% | Light removal | Casual/Commander |
| 50% | Moderate | Standard |
| 75% | Heavy | Modern/Legacy |
| 100% | Maximum | cEDH, Vintage |

---

## API Reference

### computeAcceleratedCastability

Main entry point for castability calculations.

```typescript
function computeAcceleratedCastability(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext
): AcceleratedCastabilityResult;
```

**Parameters:**
- `deck`: Mana profile including lands, colors, and bonuses
- `spell`: The spell's mana cost broken down
- `producers`: Array of mana producers in the deck
- `ctx`: Acceleration context (play/draw, removal rate)

**Returns:**
- `base`: Castability without acceleration
- `withAcceleration`: Castability with acceleration
- `accelerationImpact`: Probability increase (0-1)
- `acceleratedTurn`: How many turns earlier the spell can be cast

### producerCacheService

Service for looking up mana producers.

```typescript
const producerCacheService = {
  get(cardName: string): ManaProducerDef | null,
  has(cardName: string): boolean,
  getAll(): Map<string, ManaProducerDef>
};
```

### useAcceleration Hook

React context hook for acceleration settings.

```typescript
const { settings, accelContext, updateSettings } = useAcceleration();

// settings: { showAcceleration: boolean, playDraw: 'PLAY'|'DRAW', removalRate: number }
// accelContext: AccelContext for calculations
// updateSettings: (partial: Partial<Settings>) => void
```

---

## Examples & Use Cases

### Example 1: Sol Ring Impact on 4-Drop

**Deck:** 60 cards, 24 lands, 1 Sol Ring
**Spell:** Wrath of God (2WW, MV 4)

```typescript
const deck: DeckManaProfile = {
  deckSize: 60,
  totalLands: 24,
  landColorSources: { W: 20 }
};

const spell: ManaCost = {
  mv: 4,
  generic: 2,
  pips: { W: 2 }
};

const producers: ProducerInDeck[] = [{
  def: MANA_PRODUCERS['Sol Ring'],
  copies: 1
}];

const result = computeAcceleratedCastability(deck, spell, producers, ctx);
// base.p2: ~72% (Turn 4)
// withAcceleration.p2: ~78% 
// acceleratedTurn: 3 (one turn earlier!)
```

### Example 2: Dork-Heavy Green Deck

**Deck:** 60 cards, 20 lands, 4x Llanowar Elves, 4x Birds of Paradise
**Spell:** Craterhoof Behemoth (5GGG, MV 8)

With 8 mana dorks, the expected acceleration is significant:
- P(having 1+ dork by T2) ≈ 65%
- Expected mana boost: +1.5 by T4, +2.5 by T6
- Craterhoof castable T6-7 instead of T8

### Example 3: Ancient Tomb in Colorless Deck

**Deck:** 60 cards, 24 lands including 4x Ancient Tomb
**Spell:** Wurmcoil Engine (6, MV 6)

```typescript
const landBonuses = {
  bonusManaFromLands: 4,  // 4 Ancient Tombs × 1 bonus each
  bonusColoredMana: {}
};

// Effective lands needed: 6 - floor(4/2) = 4 lands
// Much easier to cast on T4-5!
```

### Example 4: Ritual for Early Combo

**Deck:** 60 cards, 22 lands, 4x Dark Ritual
**Spell:** Necropotence (BBB, MV 3)

Dark Ritual enables T1 Necropotence:
- T1: Swamp + Dark Ritual (BBB available) → Cast Necropotence

```typescript
// Ritual has 100% "survival" (instant speed, can't be removed)
// P(having Swamp + Dark Ritual + Necropotence in opener) ≈ 3%
// Magical Christmas land, but the system models it!
```

---

## Limitations & Future Work

### Current Limitations

1. **K=2 Model**: Currently assumes you need at most 2 of any color (sufficient for most spells)
2. **Static Survival**: Survival rates are estimates, not metagame-aware
3. **No Synergy Modeling**: Doesn't account for dork + pump spell combos
4. **Simplified Multi-Mana**: Conditional lands (Nykthos) use average estimates

### Planned Improvements

1. **Dynamic K**: Support for spells with 3+ of one color (Cryptic Command)
2. **Metagame Integration**: Fetch removal data from tournament results
3. **Synergy Bonuses**: Model Urza + artifact synergies
4. **Monte Carlo Validation**: Run simulations to validate hypergeometric model
5. **Fetch Land Modeling**: Account for deck thinning from fetches

---

## Conclusion

ManaTuner Pro's acceleration system provides a mathematically rigorous approach to modeling mana ramp in Magic: The Gathering. By combining hypergeometric probability with survival modeling, it answers the practical question every player faces:

> "Can I actually cast this spell when I need to?"

The system accounts for:
- Mana dorks, rocks, rituals, and enhancers
- Multi-mana lands like Ancient Tomb and Gaea's Cradle
- Removal rates and survival probabilities
- Play vs. draw card advantage

This enables more informed deckbuilding decisions and realistic expectations about mana consistency.

---

*Document Version: 1.0*
*Last Updated: December 2024*
*ManaTuner Pro v2.0*
