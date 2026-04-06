/**
 * Glossary of MTG & ManaTuner terms — plain-English explanations
 * Used by the <Term> component for inline hover tooltips.
 */
export const GLOSSARY: Record<string, { short: string; long?: string }> = {
  castability: {
    short: 'Your chance of casting a spell on the turn you want to play it.',
    long: 'Combines the probability of drawing enough lands AND the right colors by a given turn.',
  },
  hypergeometric: {
    short: 'Exact math for drawing specific cards from a deck — no estimation, no simulation.',
    long: 'The hypergeometric distribution calculates the exact probability of drawing k successes from a population of N cards when you draw n cards without replacement.',
  },
  'monte-carlo': {
    short:
      '10,000 random opening hands are tested to find patterns and optimal mulligan decisions.',
    long: 'A Monte Carlo simulation shuffles your deck thousands of times and evaluates each opening hand to estimate keep/mulligan rates and expected game outcomes.',
  },
  bellman: {
    short: 'Math that finds your best mulligan decision at each hand size (7, 6, 5, 4).',
    long: "Bellman's equation uses backward induction: it calculates the expected value of keeping a 4-card hand first, then uses that to decide whether a 5-card hand is worth keeping, and so on up to 7.",
  },
  'health-score': {
    short: 'Overall grade for your mana base — higher is better.',
    long: 'A composite score combining land count, color source coverage, curve alignment, and Karsten compliance. 90%+ is Excellent, 70-89% is Good.',
  },
  'best-case': {
    short: 'Chance of casting if you always have the right colors — only land count matters.',
    long: 'P1 assumes every land you draw produces the color you need. It isolates the question: "Do I have enough lands total?"',
  },
  realistic: {
    short: 'Actual chance of casting, considering you might not draw the right color sources.',
    long: 'P2 accounts for both having enough lands AND having the right colors among them. This is your real-world probability.',
  },
  karsten: {
    short:
      'Frank Karsten — Pro Tour Hall of Fame & mathematician who calculated color source requirements.',
    long: 'His tables define how many sources of a color you need to cast spells reliably (e.g., 14 sources for a single-colored one-drop by turn 1).',
  },
  'color-sources': {
    short: 'Lands, rocks, and dorks that produce a specific color of mana.',
    long: 'A Steam Vents counts as both a blue source and a red source. Llanowar Elves count as a green source.',
  },
  'etb-tapped': {
    short: "Enters the battlefield tapped — you can't use it the turn you play it.",
    long: 'A land that ETBs tapped effectively costs you a turn of mana. This reduces your on-curve probability.',
  },
  'mana-curve': {
    short: 'Distribution of your spells by mana cost — how many 1-drops, 2-drops, etc.',
    long: 'A healthy curve ensures you have something to play every turn. Aggro decks peak at 1-2 mana; control decks at 3-4.',
  },
  acceleration: {
    short: 'Mana boost from rocks (artifacts) and dorks (creatures) that produce extra mana.',
    long: 'When you have a Llanowar Elves on turn 1, you can cast a 3-drop on turn 2. ManaTuner calculates the probability of this happening.',
  },
  'play-draw': {
    short: 'On the play you draw 1 fewer card; on the draw you see 1 extra card per turn.',
    long: 'This changes your probability of hitting land drops. On the play: 7 + (turn-1) cards seen. On the draw: 7 + turn cards seen.',
  },
  enhancer: {
    short: 'A creature that boosts mana production of your other dorks (e.g., Badgermole Cub).',
    long: 'When an ENHANCER is in play alongside dorks, each enhanced dork produces extra mana, dramatically increasing your acceleration.',
  },
}
