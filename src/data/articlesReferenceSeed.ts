/**
 * Reference Articles Seed — The Competitive MTG Reading Library
 *
 * Every essential article a competitive Magic player should read,
 * curated across 15+ years of pro-level writing. Many articles are
 * preserved via archive.org after their original hosts (mostly
 * ChannelFireball 2010-2018) went offline.
 *
 * Organized into 8 categories + 3 curator tracks (First FNM / RCQ /
 * Pro Tour Preparation). Each article has a verified URL and, for
 * tracked articles, an editorial curator note.
 *
 * Credits: curation driven by Guillaume Bordes + the Videre Discord
 * community. Archive.org recoveries by KaP and others.
 *
 * @version 1.0 (2026-04-12)
 */

import type { ReferenceArticle } from '../types/referenceArticle'

export const articlesReferenceSeed: ReferenceArticle[] = [
  // ==========================================================================
  // TRACK 1 — YOUR FIRST FNM (5 articles)
  // ==========================================================================

  {
    id: 'reid-duke-level-one-building-a-deck',
    title: 'Level One: Building a Mana Base',
    author: 'Reid Duke',
    publisher: 'Wizards of the Coast',
    year: 2014,
    category: 'manabase',
    secondaryCategories: ['fundamentals'],
    level: 'beginner',
    medium: 'article-series',
    language: 'en',
    linkStatus: 'live',
    primaryUrl:
      'https://magic.wizards.com/en/articles/archive/level-one/building-mana-base-2014-11-24',
    description:
      "From Reid Duke's foundational Level One course on magic.wizards.com — the chapter that teaches you how to build a balanced, reliable mana base. Every concept built from the ground up, no gatekeeping, no jargon.",
    curatorNote:
      "If you only read ONE thing about manabase construction before your first FNM, make it this. Reid writes like he's patiently teaching his younger self — and the chapter is hosted directly on magic.wizards.com. It's THAT good.",
    curatorTrack: 'first-fnm',
  },

  {
    id: 'karsten-how-many-lands-2022',
    title: 'How Many Lands Do You Need in Your Deck?',
    subtitle: 'An Updated Analysis (2022)',
    author: 'Frank Karsten',
    publisher: 'TCGPlayer Infinite',
    year: 2022,
    category: 'manabase',
    level: 'beginner',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl:
      'https://www.tcgplayer.com/content/article/How-Many-Lands-Do-You-Need-in-Your-Deck-An-Updated-Analysis/cd1c1a24-d439-4a8e-b369-b936edb0b38a/',
    description:
      "Karsten's 2022 refresh of the definitive answer to 'how many lands should my deck have?' with updated hypergeometric tables adjusted for the London mulligan era. The mathematical foundation of ManaTuner.",
    curatorNote:
      'This is the article that makes ManaTuner possible. Karsten works out the math so every deckbuilder can stop guessing. If you read only one piece about manabase construction, make it this one — and read it with ManaTuner open in another tab.',
    curatorTrack: 'first-fnm',
  },

  {
    id: 'kuisma-beat-bad-luck',
    title: 'How to Beat Bad Luck',
    author: 'Matti Kuisma',
    publisher: 'Hareruya',
    year: 2021,
    category: 'mindset',
    level: 'beginner',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://article.hareruyamtg.com/article/41870/?lang=en',
    description:
      'A Finnish pro breaks down the difference between variance you should accept and variance you can fight — and how beginners confuse the two.',
    curatorNote:
      "Everyone loses their first FNM to 'bad luck'. This article is the medicine: Kuisma shows you exactly when variance is real, when it's an excuse, and what to do about both. If you've ever said 'I would have won if I had drawn my lands', read this twice.",
    curatorTrack: 'first-fnm',
  },

  {
    id: 'chapin-art-of-mulligan',
    title: 'The Art of the Mulligan',
    author: 'Patrick Chapin',
    publisher: 'StarCityGames',
    year: 2010,
    category: 'mulligan',
    level: 'beginner',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://articles.starcitygames.com/articles/the-art-of-the-mulligan/',
    description:
      "Chapin's canonical treatment of when to keep, when to mull, and why. The article that made the mulligan a skill instead of a reflex.",
    curatorNote:
      "Chapin wrote this in 2010 and it's still cited in 2026 pro-level discussions. He treats the mulligan as a mini-game you can train for, with a framework every beginner needs before their first tournament.",
    curatorTrack: 'first-fnm',
  },

  {
    id: 'saito-part-2-having-fun',
    title: 'Important Things for Tournament Success',
    subtitle: 'Part 2: Having Fun',
    author: 'Tomoharu Saito',
    publisher: 'ChannelFireball',
    year: 2013,
    category: 'mindset',
    level: 'beginner',
    medium: 'article-series',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20220520011135/https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-2-having-fun/',
    originalUrl:
      'https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-2-having-fun/',
    description:
      'Part 2 of Saito\'s 6-part series on tournament success. On why "having fun" is not the opposite of taking Magic seriously — it\'s the engine that makes taking it seriously sustainable.',
    curatorNote:
      "If your first FNM is stressful, Saito's answer is counterintuitive: the pros who last are the ones who kept having fun. This piece will save you from burning out before you even get good.",
    curatorTrack: 'first-fnm',
    seriesId: 'saito-tournament-success',
    seriesPart: 2,
  },

  // ==========================================================================
  // TRACK 2 — PREPARING FOR AN RCQ (6 articles)
  // ==========================================================================

  {
    id: 'pvddr-6-heuristics',
    title: 'Six Heuristics to Make You a Better Magic Player',
    author: 'Paulo Vitor Damo da Rosa',
    publisher: 'StarCityGames',
    year: 2019,
    category: 'advanced',
    secondaryCategories: ['mindset'],
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl:
      'https://articles.starcitygames.com/magic-the-gathering/premium/six-heuristics-to-make-you-a-better-magic-player/',
    description:
      "PVDDR's decision-making shortcuts — the mental rules of thumb that let top players make good choices under pressure without grinding through every line.",
    curatorNote:
      'This is the framework that separates a regular from a competitor. PVDDR shows you the six mental shortcuts he actually uses when the clock is ticking — not theoretical, not romantic, just the heuristics that work. Worth the SCG Premium sub for this one article alone.',
    curatorTrack: 'rcq',
  },

  {
    id: 'manfield-prepare-tournament',
    title: 'How to Prepare for a Magic Tournament',
    author: 'Seth Manfield',
    publisher: 'TCGPlayer Infinite',
    year: 2020,
    category: 'mindset',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl:
      'https://www.tcgplayer.com/content/article/How-to-Prepare-for-a-Magic-Tournament/f961017a-117e-4cea-8576-170a0414d3e1/',
    description:
      "Hall of Famer Seth Manfield's tournament preparation process — testing cadence, deck selection, sleep, diet, routine. The practical pro workflow.",
    curatorNote:
      "Before your first RCQ you'll want to know 'what do the pros actually DO the week before a tournament?'. Manfield wrote it down step by step. Copy it, adjust it, make it yours.",
    curatorTrack: 'rcq',
  },

  {
    id: 'reid-duke-level-one-sideboarding',
    title: 'Level One: Sideboarding',
    author: 'Reid Duke',
    publisher: 'Wizards of the Coast',
    year: 2015,
    category: 'sideboard',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://magic.wizards.com/en/articles/archive/level-one/sideboard-2015-08-10',
    description:
      "Reid's sideboarding chapter from the Level One course on magic.wizards.com. The framework for building and piloting a 15-card sideboard that actually wins games.",
    curatorNote:
      "FNM doesn't really use sideboards. RCQ does. This is the crash course you need before your first competitive event that goes multiple rounds with best-of-three matches.",
    curatorTrack: 'rcq',
  },

  {
    id: 'pvddr-one-mistake-archive',
    title: "It's Better to Make One Mistake Everyone Sees Than Two Only You Know About",
    author: 'Paulo Vitor Damo da Rosa',
    publisher: 'ChannelFireball',
    year: 2018,
    category: 'mindset',
    secondaryCategories: ['advanced'],
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20201209132902/https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/its-better-to-make-one-mistake-everyone-sees-than-two-only-you-know-about/',
    originalUrl:
      'https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/its-better-to-make-one-mistake-everyone-sees-than-two-only-you-know-about/',
    description:
      'PVDDR on how perfectionism about visible mistakes often causes bigger invisible mistakes. A counterintuitive essay on error acceptance and growth.',
    curatorNote:
      "Rescued from archive.org. This is the article that changed how I think about my own mistakes — you'll read it once and then again a year later and see completely different things. Accept visible mistakes, hunt invisible ones.",
    curatorTrack: 'rcq',
  },

  {
    id: 'fortier-ladder-series',
    title: 'Tournament Preparation Like A Pro: Ladder And Series',
    author: 'Rémi Fortier',
    publisher: 'MTGdecks',
    year: 2022,
    category: 'mindset',
    secondaryCategories: ['metagame'],
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://mtgdecks.net/theory/tournament-preparation-ladder-and-series-mtg-157',
    description:
      "French pro Rémi Fortier's practical framework for structured tournament prep: using ladder grinding and tournament series as stepping stones instead of sporadic one-offs.",
    curatorNote:
      'Fortier is a Pro Tour veteran and one of the most structured minds in competitive MTG. This piece is the process — specific, time-boxed, actually executable. Nothing like it in the English-speaking scene at this level of rigor.',
    curatorTrack: 'rcq',
  },

  {
    id: 'pvddr-when-to-mulligan',
    title: 'When to Mulligan',
    author: 'Paulo Vitor Damo da Rosa',
    publisher: 'ChannelFireball',
    year: 2015,
    category: 'mulligan',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'lost',
    primaryUrl: 'https://www.channelfireball.com/articles/when-to-mulligan/',
    description:
      "PVDDR's decision tree for mulligan decisions in constructed formats. More actionable than Chapin's abstract framework — direct rules for real tournament hands.",
    curatorNote:
      "Chapin's 'Art of the Mulligan' is the theory; this is the practice. Lost to link rot — no archive.org snapshot exists and no mirror has been found. If you have a copy (PDF, screenshot, text dump), please reach out on GitHub.",
    curatorTrack: 'rcq',
  },

  // ==========================================================================
  // TRACK 3 — PRO TOUR PREPARATION (7 articles)
  // ==========================================================================

  {
    id: 'saito-part-1-concentration',
    title: 'Important Things for Tournament Success',
    subtitle: 'Part 1: Concentration',
    author: 'Tomoharu Saito',
    publisher: 'ChannelFireball',
    year: 2013,
    category: 'mindset',
    level: 'advanced',
    medium: 'article-series',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20220520020828/https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-1-concentration/',
    originalUrl:
      'https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-1-concentration/',
    description:
      "Opening article of Saito's 6-part series. Concentration as a trainable skill — not a mood, not willpower, but a discipline with specific exercises.",
    curatorNote:
      "Saito writes about the mental state of competitive play with a rigor nobody in the English scene matches. If you've never considered that concentration is a skill you can train like any other, start here. Then read parts 3-7 below.",
    curatorTrack: 'pro-tour',
    seriesId: 'saito-tournament-success',
    seriesPart: 1,
  },

  {
    id: 'fortier-dash-method',
    title: 'Innovation And Performance In Magic: The DASH Method',
    author: 'Rémi Fortier',
    publisher: 'MTGdecks',
    year: 2022,
    category: 'advanced',
    secondaryCategories: ['metagame'],
    level: 'advanced',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl:
      'https://mtgdecks.net/theory/innovation-and-perfomance-in-magic-dash-method-mtg-163',
    description:
      "Fortier's four-step framework (Diagnose, Archetype, Select, Hone) for deck innovation and tournament performance. A methodology, not a recipe.",
    curatorNote:
      "This is the article Fortier wrote after years of Pro Tour preparation. It's the kind of structured thinking about innovation that usually stays in private Discord servers. The fact that it's publicly available and in English is a minor miracle.",
    curatorTrack: 'pro-tour',
  },

  {
    id: 'dagen-puzzling-improvements',
    title: 'Puzzling Improvements',
    author: 'Pierre Dagen',
    publisher: 'Hareruya',
    year: 2021,
    category: 'advanced',
    secondaryCategories: ['mindset'],
    level: 'advanced',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://article.hareruyamtg.com/article/article_en_44/?lang=en',
    description:
      'French Pro Tour regular Pierre Dagen on the small, puzzle-like decisions that compound over a tournament weekend. How to hunt edges everyone else walks past.',
    curatorNote:
      'Dagen is one of the sharpest minds on the European circuit but most of his writing stays in French. This Hareruya piece in English is the rare window into his process — focus on the accumulation of micro-edges, not the search for a silver bullet.',
    curatorTrack: 'pro-tour',
  },

  {
    id: 'moudou-game-theory-series',
    title: 'Les Bases de la Théorie des Jeux (appliquée à Magic)',
    author: 'Moudou',
    publisher: 'YouTube',
    year: 2023,
    category: 'advanced',
    level: 'advanced',
    medium: 'video-series',
    language: 'fr',
    linkStatus: 'live',
    primaryUrl: 'https://youtube.com/playlist?list=PLad4ffhFKLnfzNXJWxyBdRXO5lrkjL556',
    description:
      'French video series teaching game theory fundamentals through Magic examples. Mixed strategies, Nash equilibrium, minimax — all applied to real tournament decisions.',
    curatorNote:
      "Moudou teaches game theory the way it should be taught — every concept anchored to a Magic scenario you've actually been in. In French, but the math is universal. If you've ever wondered why pros randomize their bluffs, this series is the answer.",
    curatorTrack: 'pro-tour',
  },

  {
    id: 'chapin-61-cards-russian-roulette',
    title: '61 Cards — Magic Russian Roulette',
    author: 'Patrick Chapin',
    publisher: 'StarCityGames',
    year: 2013,
    category: 'deckbuilding',
    secondaryCategories: ['advanced'],
    level: 'advanced',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://articles.starcitygames.com/articles/61-cards-magic-russian-roulette/',
    description:
      'Chapin on why cutting your deck to 60 cards is a harder decision than it looks — decision theory applied to a problem every deckbuilder faces.',
    curatorNote:
      "Every time you choose between 60 and 61 cards you're making a decision-theory problem into an ego problem. Chapin forces you to think clearly about it. One of the purest 'theory' articles ever written about Magic.",
    curatorTrack: 'pro-tour',
  },

  {
    id: 'yahi-maths-inventory',
    title: 'Comprehensive MTG Maths Inventory',
    author: 'Anaël YAHI',
    publisher: 'Google Sheets',
    year: 2023,
    category: 'metagame',
    secondaryCategories: ['advanced', 'manabase'],
    level: 'advanced',
    medium: 'spreadsheet',
    language: 'multi',
    linkStatus: 'live',
    primaryUrl:
      'https://docs.google.com/spreadsheets/d/1YvQkZyNJNKEjUlewPjmdEPDqqvnZCD5Y_IRKQ5qU-TM/edit?usp=sharing',
    description:
      'A living inventory of every mathematical tool, article, and creator relevant to competitive MTG. Community-maintained, cross-referenced.',
    curatorNote:
      "This spreadsheet is the meta-resource. Every time you wonder 'has anyone computed X for Magic?', the answer is in Anaël's inventory. ManaTuner itself belongs in this lineage — consider this the map of the territory we're all exploring.",
    curatorTrack: 'pro-tour',
  },

  {
    id: 'pvddr-best-vs-known',
    title: 'Should You Play What Is Best Or What You Know?',
    author: 'Paulo Vitor Damo da Rosa',
    publisher: 'Three For One Trading',
    year: 2024,
    category: 'metagame',
    secondaryCategories: ['mindset'],
    level: 'advanced',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://www.threeforonetrading.com/en/experience-vs-meta',
    description:
      'PVDDR on the eternal tournament question: is it better to play the strongest deck or the deck you know best? His honest, nuanced answer.',
    curatorNote:
      "The most common question a grinder faces on tournament week. PVDDR's answer is not the one you'd expect from a Hall of Famer — it's actually more empathetic than dogmatic, and it will change how you think about your own deck choices.",
    curatorTrack: 'pro-tour',
  },

  // ==========================================================================
  // TOURNAMENT MINDSET — Rest of Saito's 6-part series (4 parts)
  // ==========================================================================

  {
    id: 'saito-part-3-environment',
    title: 'Important Things for Tournament Success',
    subtitle: 'Part 3: Improving Your Magic Environment',
    author: 'Tomoharu Saito',
    publisher: 'ChannelFireball',
    year: 2013,
    category: 'mindset',
    level: 'advanced',
    medium: 'article-series',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20220701191943/https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-3-improving-your-magic-environment/',
    originalUrl:
      'https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-3-improving-your-magic-environment/',
    description:
      'Part 3: how your physical environment, playgroup, and daily routine silently shape your competitive ceiling. Saito on the inputs nobody talks about.',
    seriesId: 'saito-tournament-success',
    seriesPart: 3,
  },

  {
    id: 'saito-part-4-metagame',
    title: 'Important Things for Tournament Success',
    subtitle: 'Part 4: Familiarizing Yourself With the Metagame',
    author: 'Tomoharu Saito',
    publisher: 'ChannelFireball',
    year: 2013,
    category: 'mindset',
    secondaryCategories: ['metagame'],
    level: 'advanced',
    medium: 'article-series',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20220520003840/https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-4-familiarizing-yourself-with-the-metagame/',
    originalUrl:
      'https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-4-familiarizing-yourself-with-the-metagame/',
    description:
      'Part 4: how to build real metagame knowledge instead of surface-level netdeck awareness. The Saito method for mapping a format.',
    seriesId: 'saito-tournament-success',
    seriesPart: 4,
  },

  {
    id: 'saito-part-5-connections',
    title: 'Important Things for Tournament Success',
    subtitle: 'Part 5: Building Connections',
    author: 'Tomoharu Saito',
    publisher: 'ChannelFireball',
    year: 2013,
    category: 'mindset',
    level: 'advanced',
    medium: 'article-series',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20220520002930/https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-5-building-connections-with-others-2/',
    originalUrl:
      'https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-5-building-connections-with-others-2/',
    description:
      'Part 5: competitive Magic as a social graph. How Saito built the relationships that kept him sharp over a 20-year career.',
    seriesId: 'saito-tournament-success',
    seriesPart: 5,
  },

  {
    id: 'saito-part-7-other-lessons',
    title: 'Important Things for Tournament Success',
    subtitle: 'Part 7: Other Lessons Learned',
    author: 'Tomoharu Saito',
    publisher: 'ChannelFireball',
    year: 2013,
    category: 'mindset',
    level: 'advanced',
    medium: 'article-series',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20220627183739/https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-7-other-lessons-learned/',
    originalUrl:
      'https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/important-things-for-tournament-success-part-7-other-lessons-learned/',
    description:
      "Part 7 (there is no Part 6 — Saito's publishing order): the closing chapter of the series with the lessons that did not fit anywhere else.",
    seriesId: 'saito-tournament-success',
    seriesPart: 7,
  },

  // ==========================================================================
  // MANABASE & MANA MATH
  // ==========================================================================

  {
    id: 'karsten-colored-sources-2022',
    title: 'How Many Sources Do You Need to Consistently Cast Your Spells? (2022 Update)',
    author: 'Frank Karsten',
    publisher: 'TCGPlayer Infinite',
    year: 2022,
    category: 'manabase',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'live',
    primaryUrl:
      'https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/',
    description:
      "The 2022 update of Karsten's canonical manabase tables. Adjusts for the London mulligan rule and modern format speeds. The working reference used by ManaTuner's engine.",
  },

  {
    id: 'karsten-colored-sources-2018-archive',
    title: 'How Many Colored Mana Sources Do You Need to Consistently Cast Your Spells?',
    subtitle: 'Guilds of Ravnica Update (2018)',
    author: 'Frank Karsten',
    publisher: 'ChannelFireball',
    year: 2018,
    category: 'manabase',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20190208133353/https://www.channelfireball.com/articles/how-many-colored-mana-sources-do-you-need-to-consistently-cast-your-spells-a-guilds-of-ravnica-update/',
    originalUrl:
      'https://www.channelfireball.com/articles/how-many-colored-mana-sources-do-you-need-to-consistently-cast-your-spells-a-guilds-of-ravnica-update/',
    description:
      "The 2018 pre-London-mulligan version, preserved for historical and cross-reference value. Still cited when a deck hasn't migrated to the modern tables.",
  },

  {
    id: 'karsten-commander-manabase',
    title: "What's an Optimal Mana Curve and Land/Ramp Count for Commander?",
    author: 'Frank Karsten',
    publisher: 'ChannelFireball',
    year: 2019,
    category: 'manabase',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20230315090726/https://strategy.channelfireball.com/all-strategy/home/whats-an-optimal-mana-curve-and-land-ramp-count-for-commander/',
    originalUrl:
      'https://strategy.channelfireball.com/all-strategy/home/whats-an-optimal-mana-curve-and-land-ramp-count-for-commander/',
    description:
      "Karsten's adaptation of his manabase math to 100-card singleton Commander. Optimal curve, land count, and ramp targets — different formulas, same rigor as his Constructed work.",
  },

  // ==========================================================================
  // FUNDAMENTALS & DECKBUILDING
  // ==========================================================================

  {
    id: 'chapin-next-level-deckbuilding',
    title: 'Next Level Deckbuilding',
    author: 'Patrick Chapin',
    publisher: 'StarCityGames',
    year: 2013,
    category: 'deckbuilding',
    level: 'intermediate',
    medium: 'reference',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://starcitygames.com/next-level-deckbuilding-ebook/',
    description:
      "Chapin's deckbuilding theory book (eBook on StarCityGames). Archetype theory, innovation cycles, and the discipline of building decks that punch above their individual card quality.",
  },

  {
    id: 'pvddr-ten-commandments',
    title: 'The Ten Commandments of Deckbuilding',
    author: 'Paulo Vitor Damo da Rosa',
    publisher: 'ChannelFireball',
    year: 2013,
    category: 'deckbuilding',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'lost',
    primaryUrl: 'https://www.channelfireball.com/articles/the-ten-commandments-of-deckbuilding/',
    description:
      "PVDDR's ten-point deckbuilding checklist. Every pro who has published a deckbuilding piece since 2013 has referenced this article.",
    curatorNote:
      "Lost to link rot — no archive.org snapshot exists and no mirror has been found on SCG, TCGPlayer, or PVDDR's Substack. If you have a copy (PDF, screenshot, text dump), please reach out on GitHub.",
  },

  {
    id: 'flores-whos-the-beatdown',
    title: "Who's the Beatdown?",
    author: 'Mike Flores',
    publisher: 'StarCityGames',
    year: 1999,
    category: 'fundamentals',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'archived',
    primaryUrl:
      'https://web.archive.org/web/20210120002241/https://articles.starcitygames.com/premium/whos-the-beatdown/',
    originalUrl: 'https://articles.starcitygames.com/premium/whos-the-beatdown/',
    description:
      "The single most-cited article in competitive Magic history. Flores' 1999 meditation on who plays offense and who plays defense in any matchup.",
  },

  // ==========================================================================
  // MULLIGAN & SEQUENCING
  // ==========================================================================

  {
    id: 'karsten-london-mulligan',
    title: 'What Are the New London Mulligan Odds?',
    author: 'Frank Karsten',
    publisher: 'ChannelFireball',
    year: 2019,
    category: 'mulligan',
    secondaryCategories: ['manabase'],
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'lost',
    primaryUrl: 'https://www.channelfireball.com/articles/what-are-the-new-london-mulligan-odds/',
    description:
      'Karsten computing the mulligan-adjusted probabilities under the London rule. The math behind every "do I keep this?" you face at turn zero.',
    curatorNote:
      'Lost to link rot — no archive.org snapshot exists at any URL variant. The 2022 update (above) incorporates London mulligan math, so the substance is preserved. If you have a copy of the original 2019 article, please reach out on GitHub.',
  },

  {
    id: 'lsv-mulligans',
    title: 'Mulligans',
    author: 'Luis Scott-Vargas',
    publisher: 'ChannelFireball',
    year: 2012,
    category: 'mulligan',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'lost',
    primaryUrl: 'https://www.channelfireball.com/articles/mulligans/',
    description:
      "LSV's pragmatic take on mulligan decisions — less theoretical than Chapin, less systematic than PVDDR, but delightfully direct.",
    curatorNote:
      'Lost to link rot — no archive.org snapshot exists, and the LSV articles index on the strategy.channelfireball.com subdomain has no entry for it. If you have a copy, please reach out on GitHub.',
  },

  // ==========================================================================
  // SIDEBOARD
  // ==========================================================================

  {
    id: 'pvddr-how-to-sideboard',
    title: 'How to Sideboard',
    author: 'Paulo Vitor Damo da Rosa',
    publisher: 'ChannelFireball',
    year: 2014,
    category: 'sideboard',
    level: 'intermediate',
    medium: 'article',
    language: 'en',
    linkStatus: 'lost',
    primaryUrl: 'https://www.channelfireball.com/articles/how-to-sideboard/',
    description:
      "PVDDR's systematic framework for constructing and using a 15-card sideboard. The 'why' behind every slot.",
    curatorNote:
      'Lost to link rot — no archive.org snapshot exists. The live SCG URL with the same slug 302-redirects to an unrelated article. If you have a copy, please reach out on GitHub.',
  },

  // ==========================================================================
  // METAGAME, DATA & TOOLS
  // ==========================================================================

  {
    id: 'wizards-banned-restricted',
    title: 'Banned & Restricted Announcements',
    author: 'Wizards of the Coast',
    publisher: 'magic.wizards.com',
    year: 2024,
    category: 'metagame',
    level: 'beginner',
    medium: 'reference',
    language: 'en',
    linkStatus: 'live',
    primaryUrl: 'https://magic.wizards.com/en/banned-restricted-list',
    description:
      'The official banned and restricted list for every competitive format. Always up-to-date, always the source of truth before a tournament.',
  },

  {
    id: 'boa-mtgo-getting-started',
    title: "TUTO MTGO: Est-ce mieux qu'MTGA? (oui)",
    author: 'El_Gran_Boa',
    publisher: 'YouTube',
    year: 2023,
    category: 'metagame',
    level: 'beginner',
    medium: 'video',
    language: 'fr',
    linkStatus: 'live',
    primaryUrl: 'https://youtu.be/SoK6Dlm1FPg',
    description:
      'French video by El_Gran_Boa (TCG FR channel) comparing Magic Online to MTG Arena, arguing MTGO is the better client for serious players. A natural entry point for French Arena players curious about switching.',
  },

  {
    id: 'depraz-mtgo-stops',
    title: 'Petite leçon de stops',
    author: 'Jean-Emmanuel Depraz',
    publisher: 'YouTube',
    year: 2023,
    category: 'metagame',
    level: 'intermediate',
    medium: 'video',
    language: 'fr',
    linkStatus: 'live',
    primaryUrl: 'https://youtu.be/xLFjxcKmDr4',
    description:
      'Essential French video by Pro Tour player Jean-Emmanuel Depraz on MTGO stops — the priority-passing system every online player must master to avoid catastrophic misplays.',
  },

  // ==========================================================================
  // LOST TO LINK ROT (community call-to-action)
  // ==========================================================================

  {
    id: 'lsv-looter-problem-lost',
    title: "What's the Play? The Looter Problem",
    author: 'Luis Scott-Vargas',
    publisher: 'ChannelFireball',
    year: 2014,
    category: 'advanced',
    level: 'advanced',
    medium: 'article',
    language: 'en',
    linkStatus: 'lost',
    primaryUrl:
      'https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/luis-scott-vargas-articles/whats-the-play-the-looter-problem/',
    description:
      "LSV's classic decision-theory puzzle on sequencing with a Looter effect. Original ChannelFireball page is dead and no archive.org snapshot has been found.",
    curatorNote:
      "If you have a copy of this article — PDF, screenshot, text dump, anything — please reach out on GitHub. It's one of the few LSV 'What's the Play?' puzzles that's been truly lost, and we would love to bring it back.",
  },
]
