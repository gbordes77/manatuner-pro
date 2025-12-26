# Mulligan Strategy System - Technical Documentation

**Created**: December 26, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

---

## Overview

The Mulligan Strategy System is an advanced Monte Carlo simulation engine that helps MTG players make mathematically optimal mulligan decisions based on their deck's archetype and composition.

### Key Features

- **Archetype-Aware Analysis**: Aggro, Midrange, Control, Combo - each with different priorities
- **Monte Carlo Simulation**: 3,000+ iterations for statistical significance
- **Bellman Equation Optimization**: Dynamic programming for optimal thresholds
- **London Mulligan Support**: Properly models "draw 7, keep N" mechanics
- **Score Breakdown**: 5 detailed metrics per hand
- **Sample Hands Visualization**: Real examples with turn-by-turn plans

---

## Mathematical Foundation

### Bellman Equation for Optimal Stopping

The core algorithm uses backward induction (dynamic programming) to calculate optimal mulligan thresholds:

```
E[V₄] = Average score of all 4-card hands

E[V₅] = (1/N) × Σ max(score₅ᵢ, E[V₄])
        For each 5-card hand, keep if better than expected 4-card

E[V₆] = (1/N) × Σ max(score₆ᵢ, E[V₅])
        For each 6-card hand, keep if better than expected 5-card

E[V₇] = (1/N) × Σ max(score₇ᵢ, E[V₆])
        For each 7-card hand, keep if better than expected 6-card
```

**Result**: 
- `threshold_keep7 = E[V₆]` → Keep 7 if score ≥ this value
- `threshold_keep6 = E[V₅]` → Keep 6 if score ≥ this value
- `threshold_keep5 = E[V₄]` → Keep 5 if score ≥ this value

### London Mulligan Simulation

The London Mulligan rule allows players to draw 7 cards, then choose the best N to keep:

```typescript
function selectBestSubset(hand: SimulatedHand, targetSize: number, archetype: Archetype): SimulatedHand {
  // Score each card based on archetype priorities
  const scoredCards = cards.map(card => ({
    card,
    priority: calculateCardPriority(card, archetype)
  }));
  
  // Sort by priority and select top N
  scoredCards.sort((a, b) => b.priority - a.priority);
  
  // Ensure good land/spell balance for archetype
  return selectWithBalance(scoredCards, targetSize, archetype);
}
```

---

## Archetype Configurations

### Aggro ⚡

```typescript
{
  name: 'Aggro',
  weights: {
    manaEfficiency: 0.20,
    curvePlayability: 0.30,  // High - curve is critical
    colorAccess: 0.15,
    earlyGame: 0.25,         // High - T1 play essential
    landCount: 0.10
  },
  idealLands: { min: 1, optimal: 2, max: 3 },
  priorities: [
    '1-drop on T1 is critical',
    'Curve out T1-T2-T3',
    '2-3 lands is ideal, 4+ is flood',
    'Mulligan aggressively for action'
  ]
}
```

### Midrange ⚖️

```typescript
{
  name: 'Midrange',
  weights: {
    manaEfficiency: 0.25,
    curvePlayability: 0.25,
    colorAccess: 0.20,       // Higher - often 2-3 colors
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
}
```

### Control 🛡️

```typescript
{
  name: 'Control',
  weights: {
    manaEfficiency: 0.15,
    curvePlayability: 0.15,
    colorAccess: 0.30,       // Highest - needs all colors
    earlyGame: 0.10,         // Low - can afford slow starts
    landCount: 0.30          // Highest - needs 4+ lands
  },
  idealLands: { min: 3, optimal: 4, max: 5 },
  priorities: [
    'Hit land drops every turn',
    'Have answers for early threats',
    '4+ lands is ideal',
    'Color access is critical'
  ]
}
```

### Combo 🔮

```typescript
{
  name: 'Combo',
  weights: {
    manaEfficiency: 0.15,
    curvePlayability: 0.10,  // Low - doesn't play fair
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
```

---

## Score Breakdown Metrics

Each hand is evaluated on 5 dimensions (0-100 scale):

### 1. Mana Efficiency

Simulates T1-T4 goldfish play and measures mana utilization:

```typescript
function calculateManaEfficiency(hand, deck): number {
  // Simulate 4 turns of play
  for (turn = 1 to 4) {
    // Play land if available
    // Cast spells greedily by CMC
    // Track mana spent vs available
  }
  
  return (totalManaSpent / totalManaAvailable) * 100;
}
```

**Interpretation**:
- 100% = Perfect curve, used all mana
- 70%+ = Good efficiency
- <50% = Wasted mana, curve problems

### 2. Curve Playability

Checks if hand has appropriate spells for each turn:

```typescript
// Aggro scoring
if (has1Drop) score += 40;   // Critical
if (has2Drop) score += 30;
if (multiple1Drops) score += 15;
if (has3Drop) score += 15;

// Control scoring
if (has2Drop) score += 30;   // Early interaction
if (has3Drop) score += 25;
if (has4Drop) score += 25;
if (multipleSpells) score += 20;
```

### 3. Color Access

Validates that lands can produce colors needed for spells:

```typescript
function calculateColorAccess(hand): number {
  const colorsProduced = extractColorsFromLands(hand.lands);
  
  let totalRequired = 0;
  let totalMet = 0;
  
  for (spell of hand.spells) {
    for ([color, count] of spell.manaCost.symbols) {
      totalRequired += count;
      if (colorsProduced.has(color)) totalMet += count;
    }
  }
  
  return (totalMet / totalRequired) * 100;
}
```

### 4. Early Game

Evaluates ability to interact in first turns:

- **Aggro**: 1-drop + 1 land = 50 points
- **Midrange**: 2-drop + 2 lands = 50 points
- **Control**: 2+ lands + interaction = 40 points
- **Combo**: 2+ lands + cantrip = 50 points

### 5. Land Balance

Checks if land count matches archetype needs:

```typescript
function calculateLandBalance(hand, config): number {
  const { min, optimal, max } = config.idealLands;
  
  if (count === optimal) return 100;
  if (count >= min && count <= max) return 70-100; // Linear interpolation
  if (count > max) return 50 - (count - max) * 15; // Flood penalty
  if (count < min) return 50 - (min - count) * 20; // Screw penalty
}
```

---

## Score Categories & Recommendations

```typescript
const SCORE_LEGEND = {
  snapKeep: { min: 90, label: 'SNAP KEEP' },     // Perfect hand
  keep:     { min: 75, label: 'KEEP' },          // Good hand
  marginal: { min: 60, label: 'MARGINAL' },      // Risky
  mulligan: { min: 40, label: 'MULLIGAN' },      // Weak
  snapMull: { min: 0,  label: 'SNAP MULL' }      // Unplayable
};
```

**Decision Logic**:
```
if (handScore >= threshold_keep7) → KEEP 7
else if (mulligan6Score >= threshold_keep6) → KEEP 6
else if (mulligan5Score >= threshold_keep5) → KEEP 5
else → KEEP 4 (sad)
```

---

## File Structure

```
src/
├── services/
│   ├── mulliganSimulator.ts          # Base simulator (original)
│   └── mulliganSimulatorAdvanced.ts  # Advanced archetype-aware engine
│
└── components/analyzer/
    └── MulliganTab.tsx               # Full UI component
```

### mulliganSimulatorAdvanced.ts (600+ lines)

**Exports**:
- `analyzeWithArchetype(cards, archetype, iterations)` - Main analysis function
- `quickArchetypeAnalysis(cards, archetype)` - Fast analysis (2000 iterations)
- `ARCHETYPE_CONFIGS` - Configuration for each archetype
- `SCORE_LEGEND` - Score category definitions
- `getScoreCategory(score)` - Get category from numeric score

**Types**:
```typescript
type Archetype = 'aggro' | 'midrange' | 'control' | 'combo';

interface AdvancedMulliganResult {
  archetype: Archetype;
  archetypeConfig: ArchetypeConfig;
  expectedScores: { hand7, hand6, hand5, hand4 };
  thresholds: { keep7, keep6, keep5 };
  distributions: { hand7, hand6, hand5 };
  sampleHands: { excellent, good, marginal, poor };
  deckQuality: 'excellent' | 'good' | 'average' | 'poor';
  qualityScore: number;
  recommendations: string[];
  iterations: number;
}

interface SampleHand {
  cards: SimulatedCard[];
  score: number;
  breakdown: ScoreBreakdown;
  recommendation: 'SNAP_KEEP' | 'KEEP' | 'MARGINAL' | 'MULLIGAN' | 'SNAP_MULL';
  reasoning: string[];
  turnByTurn: TurnPlan[];
}
```

### MulliganTab.tsx (860+ lines)

**Components**:
- `ArchetypeSelector` - 4 archetype buttons with descriptions
- `ExpectedValues` - Display E[Score] for 7/6 cards + thresholds
- `OptimalStrategy` - Visual threshold bars
- `DistributionChart` - Recharts area chart for hand quality
- `ScoreLegendSection` - Accordion with score explanations
- `ScoreBreakdownDisplay` - 5 metric chips per hand
- `SampleHandCard` - Individual hand with turn-by-turn plan
- `SampleHandsSection` - Categorized sample hands

**Features**:
- Auto-runs analysis on mount and archetype change
- Calculates `totalCards` from quantities (fixes "Need 40 cards" bug)
- Comprehensive tooltips on all technical terms
- Responsive design (isMobile support)

---

## Tooltips Reference

All technical terms have explanatory tooltips. Key explanations:

| Term | Explanation |
|------|-------------|
| E[Score] at 7 | Average quality of all 7-card hands |
| Threshold Keep 7 | If hand score < this, mulligan to 6 |
| Mana Efficiency | % of mana actually spent T1-T4 |
| Curve Playability | Ability to play spells on curve |
| Color Access | Can your lands cast your spells? |
| Land Balance | Right number of lands for archetype |
| Distribution | Probability of each quality level |

---

## Integration Points

### From AnalyzerPage.tsx

```tsx
import { MulliganTab } from "../components/analyzer";

// In tab content
<TabPanel value={activeTab} index={2}>
  <MulliganTab 
    cards={analysisResult.cards || []} 
    isMobile={isMobile} 
  />
</TabPanel>
```

### Card Data Format

The component expects `DeckCard[]` from the deck analyzer:

```typescript
interface DeckCard {
  name: string;
  quantity: number;
  manaCost: string;      // e.g., "{1}{W}{W}"
  cmc: number;
  types: string[];
  colors: string[];
  // ... other fields
}
```

---

## Performance Considerations

### Simulation Count

- **Default**: 3,000 iterations
- **Quick mode**: 2,000 iterations
- **Accuracy**: ±2% margin at 3000 iterations

### Execution Time

- Initial analysis: ~50-100ms
- Re-analysis on archetype change: ~50ms
- Uses `setTimeout` to prevent UI blocking

### Memory Usage

- Sample hands limited to 3 per category (12 total)
- Distributions bucketed into 11 bins (0-100 by 10s)

---

## Future Improvements

### Potential Enhancements

1. **Sideboard Mode**: Analyze post-board mulligan decisions
2. **Matchup Awareness**: Adjust priorities based on opponent's deck
3. **Card Tagging**: Mark combo pieces, must-have cards
4. **Historical Tracking**: Save and compare mulligan results
5. **Export**: Share analysis results

### Known Limitations

1. **Color Detection**: Non-basic lands assumed to produce all colors
2. **Card Synergies**: Doesn't account for card interactions
3. **Format Awareness**: Same logic for all formats (could tune for Standard vs Modern)

---

## Validation

### Expert Feedback

> "The Bellman equation is working correctly - the thresholds are mathematically sound for optimal stopping problems."

### Test Coverage

- 11 unit tests for mulligan simulator
- Tests cover: scoring, thresholds, distributions, edge cases

---

## References

- **Frank Karsten**: Original mulligan mathematics
- **London Mulligan Rule**: Official MTG mulligan procedure
- **Bellman Equation**: Dynamic programming for optimal decisions
- **Monte Carlo Methods**: Statistical simulation techniques

---

**Last Updated**: December 26, 2025
