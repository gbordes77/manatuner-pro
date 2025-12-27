# ManaTuner Pro - Marketing Content Library

**Last Updated**: December 27, 2025  
**Product URL**: https://manatuner-pro.vercel.app  
**Target Audience**: Competitive MTG players, deckbuilders, Limited enthusiasts

---

## Table of Contents

1. [Reddit Posts](#reddit-posts)
2. [Twitter/X Posts](#twitterx-posts)
3. [Discord Announcement](#discord-announcement)
4. [Elevator Pitches](#elevator-pitches)
5. [Taglines](#taglines)
6. [Visual Identity Messaging](#visual-identity-messaging)

---

## Reddit Posts

### r/magicTCG - Casual/Community Version

**Title**: I built a free manabase analyzer that tells you the exact probability of casting each spell on curve

**Body**:

Hey everyone,

I've been frustrated for years with the "just play 24 lands" advice. It doesn't account for color requirements, curve, or format. So I built something better.

**ManaTuner Pro** (https://manatuner-pro.vercel.app) analyzes your deck and tells you:

- The exact probability of casting each spell on curve (not estimates - real hypergeometric math)
- Whether your mana sources actually support your color requirements
- When you should mulligan based on your archetype (aggro vs control have very different thresholds)

**How it works:**

1. Paste your decklist (MTGO, Arena, Moxfield format - all work)
2. Get a "Health Score" showing overall manabase quality
3. See turn-by-turn castability for every spell
4. Run the mulligan simulator to find your keep/mull thresholds

**The math**: Based on Frank Karsten's research (the mathematician/pro player who wrote the definitive articles on mana requirements). Uses hypergeometric distribution for exact probabilities + Monte Carlo simulation (3,000 hands) for mulligan analysis.

**Privacy**: Everything runs in your browser. No accounts, no data sent anywhere. Your spicy brews stay secret.

**Works for**: Standard, Modern, Pioneer, Limited (40-card), Commander (100-card)

It's completely free. I built this because I wanted it to exist, and figured others might find it useful too.

Let me know if you have questions or feedback!

---

### r/spikes - Competitive Version

**Title**: [Tool] Manabase analyzer with hypergeometric probabilities + Bellman-optimal mulligan thresholds

**Body**:

Built a tool that might be useful for testing manabases: https://manatuner-pro.vercel.app

**What it does:**

**1. Castability Analysis**
- Calculates P(casting spell on curve) using hypergeometric distribution
- Compares your sources against Karsten tables (14 sources for 90% T1 colored spell, 20 for double-pip T2, etc.)
- Shows exactly where your manabase is short

**2. Mulligan Simulator**
- Monte Carlo with 3,000 iterations
- Uses Bellman equation for optimal stopping (backward induction from 4-card hands)
- Archetype-aware: Aggro wants 1-3 lands + a 1-drop, Control wants 4+ lands + answers
- Shows expected value at each hand size and derived thresholds

**3. Health Score**
- Aggregate metric based on average castability across your curve
- Quick sanity check before submitting a list

**Technical details:**
- Frank Karsten methodology (his 2022 TCGPlayer article)
- London Mulligan properly modeled (draw 7, select best N)
- Fetchlands count as 1 source for each color they can fetch

**Limitations I'm aware of:**
- Doesn't model conditional mana (Cavern, Eldrazi Temple)
- Fetchland math assumes you always have the target
- No sideboard mulligan differences

No account required, runs client-side, free to use.

Curious if anyone finds issues with the math or has suggestions for competitive-relevant features.

---

### r/EDH - Commander Version

**Title**: Free manabase tool that actually works for 100-card decks - shows which spells you can't reliably cast

**Body**:

Commander manabases are hard. 100 cards, singleton, 3-5 colors, and "just play 37 lands" doesn't tell you if your Necropotence is castable on T3.

I built **ManaTuner Pro** to solve this: https://manatuner-pro.vercel.app

**What it shows:**

For each spell in your deck:
- Probability of having the colors to cast it on curve
- How many sources short you are (e.g., "BBB on T3 needs 23 sources, you have 18")
- Which colors are your bottleneck

**Example output:**

> Toxic Deluge (1BB, T3): 78% castability  
> Recommendation: Add 2-3 black sources for 90% reliability

**For Commander specifically:**

- Handles 100-card decks correctly
- Accounts for the larger deck size in probability calculations
- Color fixing lands (Command Tower, Mana Confluence) count for all your colors

**The mulligan simulator** runs 3,000 hands and tells you:
- Average hand quality for your specific deck
- Whether to keep 7 or go to 6 with your typical draws
- Turn-by-turn play plans for sample hands

It's free, no login, everything runs in your browser (your deck stays private).

Would love feedback from the EDH community - are there Commander-specific features that would help?

---

## Twitter/X Posts

### Tweet 1: Launch Announcement

```
Shipped: ManaTuner Pro

Free manabase analyzer for MTG. Paste your deck, get exact probabilities.

- Hypergeometric math (not estimates)
- Mulligan simulator with 3,000 hand Monte Carlo
- Works for 40/60/100 card decks

100% free. No account. Runs in browser.

manatuner-pro.vercel.app
```

---

### Tweet 2: Monte Carlo Feature

```
"Should I mulligan this hand?"

ManaTuner Pro simulates 3,000 hands using Bellman equations to find your optimal thresholds.

Aggro deck? Keep 2-landers with a 1-drop.
Control? Mulligan anything under 4 lands.

The math is archetype-aware.

manatuner-pro.vercel.app
```

---

### Tweet 3: Limited Support

```
Draft tonight? 

ManaTuner Pro works for 40-card Limited decks.

Paste your pool, see if 8 mountains actually supports your RR spell on T2.

Spoiler: It usually doesn't. The math says you need 10.

Free tool: manatuner-pro.vercel.app
```

---

### Tweet 4: Frank Karsten Method

```
Frank Karsten calculated: you need 14 sources for 90% T1 colored spell, 20 for double-pip T2.

ManaTuner Pro applies these tables to YOUR deck and shows exactly where you're short.

No more guessing. Real probability theory.

manatuner-pro.vercel.app
```

---

### Tweet 5: Privacy/CTA

```
Your spicy Modern brew deserves privacy.

ManaTuner Pro runs 100% in your browser. No data sent. No account needed.

Just paste, analyze, optimize.

Try it before your next league: manatuner-pro.vercel.app
```

---

## Discord Announcement

### For MTG Community Servers

```
---

**New Tool: ManaTuner Pro - Free Manabase Analyzer**

https://manatuner-pro.vercel.app

---

**What it does:**
Analyzes your manabase and shows the exact probability of casting each spell on curve.

**Features:**
- Health Score - instant manabase quality check
- Castability Analysis - turn-by-turn probabilities per spell
- Mulligan Simulator - 3,000 hand Monte Carlo with archetype-aware thresholds
- Export to PNG/PDF - share your analysis

**The Math:**
- Hypergeometric distribution (Frank Karsten methodology)
- Bellman equations for optimal mulligan decisions
- Proper fetchland counting (1 source per fetchable color)

**Formats Supported:**
- Standard/Modern/Pioneer (60 cards)
- Limited/Draft (40 cards)
- Commander (100 cards)

**Privacy:**
Everything runs in your browser. No accounts, no data collection. Your deck stays private.

---

Paste any decklist format (MTGO, Arena, Moxfield) and get results in seconds.

Feedback welcome!
```

---

## Elevator Pitches

### 30-Second Version

> "ManaTuner Pro is a free manabase analyzer for Magic: The Gathering. You paste your decklist, and it calculates the exact probability of casting each spell on curve using real probability math - not estimates. It also has a mulligan simulator that runs thousands of hands to tell you when to keep or mulligan based on your deck's archetype. Everything runs in your browser, no account needed. It's at manatuner-pro.vercel.app."

---

### 60-Second Version

> "Every MTG player has been told 'just play 24 lands' - but that doesn't tell you if your mana actually supports your color requirements.
>
> ManaTuner Pro fixes this. You paste your decklist - any format: MTGO, Arena, Moxfield - and it analyzes every spell in your deck. For each one, it calculates the exact probability of having the mana to cast it on curve. Not estimates. Real hypergeometric probability, using Frank Karsten's research.
>
> The tool also has a mulligan simulator. It runs 3,000 hands using Monte Carlo simulation and tells you the optimal keep/mulligan thresholds for your specific deck. And it's archetype-aware - an aggro deck and a control deck have very different mulligan math.
>
> It works for 40-card Limited, 60-card Constructed, and 100-card Commander. Everything runs in your browser - no account, no data sent anywhere. Your brews stay private.
>
> It's completely free at manatuner-pro.vercel.app."

---

## Taglines

### Option 1: Math-Forward
> **"Stop guessing. Start calculating."**

### Option 2: Question Hook
> **"Can you cast your spells on curve?"**

### Option 3: Problem/Solution
> **"24 lands isn't a manabase. It's a guess."**

### Option 4: Competitive Edge
> **"The math your opponents aren't doing."**

### Option 5: Simplicity
> **"Paste deck. Get probabilities."**

### Option 6: Frank Karsten Reference
> **"Frank Karsten's math, applied to your deck."**

### Option 7: Privacy Angle
> **"Your brew. Your browser. No data sent."**

### Option 8: Precision
> **"Hypergeometric precision for every spell."**

### Option 9: Action-Oriented
> **"Know your odds before you shuffle."**

### Option 10: Confidence
> **"Build manabases you can trust."**

---

## Usage Notes

### Tone Guidelines

- **Be specific**: MTG players smell vague marketing. Use real numbers (3,000 iterations, 14 sources for T1).
- **Acknowledge limitations**: Mentioning what the tool doesn't do builds trust.
- **Technical is okay**: The audience understands hypergeometric, Monte Carlo, Bellman. Don't dumb it down.
- **No hype words**: Avoid "revolutionary", "game-changing", "ultimate". Just describe what it does.

### Platform Adaptations

- **Reddit**: Longer form okay. Include example output. Engage in comments.
- **Twitter/X**: One key feature per tweet. Link at end.
- **Discord**: Formatted with markdown. Bullet points for scannability.

### A/B Testing Suggestions

1. Test "free" prominently vs. buried in copy
2. Test "Frank Karsten" name recognition vs. just "pro player mathematician"
3. Test privacy angle as lead vs. feature angle as lead
4. Test specific numbers (3,000 hands) vs. general ("thousands")

---

## Version History

| Date | Changes |
|------|---------|
| 2025-12-27 | Initial content library created |
| 2025-12-27 | Added Visual Identity Messaging section (MTG-themed taglines, hero copy, feature descriptions, microcopy) |

---

## Visual Identity Messaging

*Updated December 2025 - MTG-themed visual identity refresh*

With the integration of official MTG mana icons and a visual identity aligned with Magic: The Gathering aesthetics (per Wizards Fan Content Policy for free tools), all copy should reflect the game's vocabulary and culture.

---

### MTG-Themed Taglines

#### Mana Mechanics

> **1. "Tap into perfect mana."**
> Plays on the fundamental action of tapping lands. Simple, evocative.

> **2. "Resolve your manabase."**
> Uses stack terminology. Your manabase problems are on the stack - let them resolve.

> **3. "Never flood. Never screw. Just curve."**
> Addresses the two mana nightmares every player fears. Promise of consistency.

> **4. "Your curve, calculated."**
> Direct reference to mana curve. Mathematical precision implied.

#### Gameplay References

> **5. "Know your outs."**
> Classic competitive term. Applies probability knowledge to mana.

> **6. "Keep or ship? Now you'll know."**
> Mulligan decision framing. Casual but resonant.

> **7. "Untap with confidence."**
> Beginning of turn reference. Implies reliable mana every turn.

> **8. "Cast on curve. Every time."**
> The dream scenario. Bold but backed by math.

#### Strategic Framing

> **9. "The mulligan math your opponents skip."**
> Competitive edge angle with MTG vocabulary.

> **10. "Goldfish smarter."**
> Playtesting terminology. Speaks to dedicated deckbuilders who test alone.

---

### Hero Section Copy

#### Primary Headline Options

**Option A - Action-Oriented:**
> # Tap Into Perfect Mana
> *The free manabase analyzer built on Frank Karsten's math*

**Option B - Problem/Solution:**
> # Stop Guessing. Start Goldfishing.
> *Calculate exact casting probabilities for every spell in your deck*

**Option C - Confidence:**
> # Cast On Curve. Every Game.
> *Hypergeometric precision meets 10,000-hand simulation*

#### Subheadline

> Paste your decklist. See turn-by-turn castability. Simulate thousands of opening hands. 
> Know exactly when to keep and when to ship.

#### CTA Button Options

| Primary CTA | Secondary CTA |
|-------------|---------------|
| "Analyze My Deck" | "See How It Works" |
| "Run the Numbers" | "View Sample Analysis" |
| "Goldfish 10,000 Hands" | "Learn the Math" |
| "Tap to Start" | "See Example Output" |
| "Resolve Your Manabase" | "Read the Methodology" |

---

### Feature Descriptions (MTG Vocabulary)

#### Monte Carlo Simulation

**Before (Technical):**
> Monte Carlo simulation with 3,000 iterations for mulligan analysis.

**After (MTG-Flavored):**
> **Goldfish 10,000 Games**
> Draw opening hands at scale. Our simulation runs your deck through thousands of games, tracking land drops, color availability, and castable spells. See exactly how your manabase performs when the shuffler isn't kind.

---

#### Probability Calculator

**Before (Technical):**
> Hypergeometric probability calculations for spell castability.

**After (MTG-Flavored):**
> **Know Your Outs**
> For every spell in your deck, we calculate the exact probability of having the mana to cast it on curve. No estimates. Real math. See which spells are live and which are stranded in hand.

---

#### Mulligan Analysis

**Before (Technical):**
> Bellman-optimal mulligan thresholds with archetype awareness.

**After (MTG-Flavored):**
> **Keep or Ship?**
> Stop second-guessing mulligans. Our simulator uses optimal stopping theory to find your exact thresholds. Aggro wants 2-landers with gas. Control wants 4 lands and answers. We model your archetype's needs.

---

#### Health Score

**Before (Technical):**
> Aggregate manabase quality metric based on average castability.

**After (MTG-Flavored):**
> **Manabase Health Check**
> One number that tells you if your lands can support your spells. Green means go. Red means you're running hot and hoping. No more "trust me, the mana works."

---

#### Color Requirements

**Before (Technical):**
> Compares your sources against Karsten tables for color requirements.

**After (MTG-Flavored):**
> **Hit Your Pips**
> That 1BBB spell needs 23 black sources for 90% reliability on turn 4. We count your sources, including fetchlands, and show exactly where you're short. Every pip matters.

---

#### Archetype Detection

**Before (Technical):**
> Archetype-aware analysis adjusts thresholds for aggro vs control.

**After (MTG-Flavored):**
> **Aggro or Control?**
> A 2-land hand is a snap keep for RDW and a snap ship for UW Control. We detect your archetype from your curve and adjust all analysis accordingly. Your thresholds, not generic advice.

---

### Microcopy Suggestions

#### Loading States

| Context | Message |
|---------|---------|
| Parsing decklist | "Reading the stack..." |
| Calculating probabilities | "Resolving math..." |
| Running simulation | "Goldfishing 10,000 hands..." |
| Generating report | "Tapping for results..." |
| Fetching land data | "Fetching lands..." |
| Processing mulligan sim | "Shuffling up..." |
| Exporting results | "Sideboarding to PDF..." |

#### Success Messages

| Context | Message |
|---------|---------|
| Analysis complete | "Resolved." |
| Deck parsed successfully | "Deck registered. 60 cards on the stack." |
| Report exported | "Spell resolved. Check your downloads." |
| Manabase optimized | "Manabase online. Ready to goldfish." |
| High health score | "Mana's looking clean. Ship it." |
| Simulation complete | "10,000 games in the books." |

#### Warning Messages

| Context | Message |
|---------|---------|
| Low land count | "Running light on lands. Expect to flood less, screw more." |
| Missing colors | "Short on sources. Some spells may rot in hand." |
| Aggressive curve + few lands | "Aggro deck with control mana. Pick a lane." |
| Too many taplands | "ETB tapped is a tempo tax. You're paying a lot." |
| Unbalanced colors | "Heavy in one color, light in another. Splash or commit?" |

#### Error Messages

| Context | Message |
|---------|---------|
| Parse failed | "Fizzled. Check your decklist format." |
| Invalid card names | "Can't find these cards. Typo or custom cards?" |
| Simulation error | "Shuffler broke. Try again." |
| Empty decklist | "No cards on the stack. Paste a decklist to start." |
| Too few lands | "Not enough lands to simulate. Add more or check your list." |
| Server error | "Mana screw detected. Our servers, not your deck. Try again." |

#### Tooltip Microcopy

| Element | Tooltip |
|---------|---------|
| Health Score | "100 = cast everything on curve. Below 80 = time to tune." |
| Castability % | "Chance you have the mana to cast this on curve." |
| Sources Needed | "Frank Karsten's research: this many sources for 90% reliability." |
| Simulation Hands | "More hands = more accurate. We run 10,000 by default." |
| Mulligan Threshold | "Optimal hand size for your archetype based on expected value." |

#### Empty States

| Context | Message |
|---------|---------|
| No deck loaded | "No deck on the battlefield. Paste a list to begin." |
| No results yet | "Waiting for a decklist. MTGO, Arena, or Moxfield format all work." |
| Filtered view empty | "No spells match that filter. Try a different view." |

---

### Tone Guidelines for MTG Vocabulary

**Do:**
- Use terms players use naturally: tap, untap, cast, resolve, stack, curve, flood, screw, ship, keep, goldfish
- Reference game mechanics accurately (don't mix up "exile" and "sacrifice" metaphors)
- Keep the competitive edge - this is a tool for players who care about optimization
- Maintain technical credibility - MTG vocabulary plus mathematical precision

**Don't:**
- Overdo flavor text - this isn't a card, it's a tool
- Use "target" or "destroy" for error states (too violent/negative)
- Force MTG references where plain language is clearer
- Use obscure slang that casual players won't recognize

**Voice:**
- Confident but not arrogant
- Technical but accessible
- Competitive but welcoming
- Like a friend at FNM who happens to know probability theory

---

*Content created for ManaTuner Pro marketing launch*
