/**
 * Reference Article type — powers the /library page (Competitive MTG
 * Reading List). A curated archive of essential articles on manabase
 * math, mulligan theory, tournament mindset, and competitive theory.
 *
 * Many articles are preserved via archive.org after their original
 * hosts went offline (ChannelFireball 2010-2018 content mostly).
 *
 * @version 1.0 (2026-04-12)
 */

export type ArticleCategory =
  | 'fundamentals' // Reid Duke Level One, Chapin Next Level
  | 'manabase' // Karsten suite, mana math
  | 'deckbuilding' // PVDDR, LSV archetype analysis
  | 'mulligan' // Chapin, Karsten London mulligan
  | 'sideboard' // Reid Duke, PVDDR, Chapin sideboard theory
  | 'metagame' // PVDDR Theory of Everything, data analysis, meta-tools
  | 'mindset' // Saito, Kuisma, Manfield, Fortier — mental game
  | 'advanced' // Moudou game theory, decision theory
  | 'podcasts' // Audio shows: Le Podcaster Mage (FR), Limited Resources, etc.

export type ArticleLevel = 'beginner' | 'intermediate' | 'advanced'

export type ArticleMedium =
  | 'article' // Standard web article
  | 'article-series' // Multi-part series (Saito's 6-part)
  | 'video' // Single video
  | 'video-series' // Playlist (Moudou game theory)
  | 'pdf' // PDF mirror (Karsten land drops)
  | 'spreadsheet' // Google Sheets (Anaël YAHI inventory)
  | 'reference' // Official reference (Wizards ban list)
  | 'podcast' // Audio episode (Podcaster Mage, Limited Resources, etc.)

export type ArticleLanguage = 'en' | 'fr' | 'jp' | 'multi'

export type LinkStatus =
  | 'live' // Original URL works
  | 'archived' // Original dead, use archive.org snapshot
  | 'mirror' // Hosted on a trusted mirror (orkerhulen.dk, TCGPlayer reprint)
  | 'paywall' // Live but requires a subscription
  | 'lost' // No known working URL — call for help from the community

export type CuratorTrack = 'first-fnm' | 'rcq' | 'pro-tour' | 'commander' | 'limited'

export interface ReferenceArticle {
  /** Stable slug, used as React key and in URL fragments */
  id: string

  /** Full title of the article/resource */
  title: string

  /** Author or creator */
  author: string

  /** Optional subtitle for series parts (e.g., "Part 1: Concentration") */
  subtitle?: string

  /** Publisher (ChannelFireball, StarCityGames, Hareruya, etc.) */
  publisher: string

  /** Year of original publication */
  year: number

  /** Main category for grid grouping */
  category: ArticleCategory

  /** Optional secondary categories for cross-tagging */
  secondaryCategories?: ArticleCategory[]

  /** Reading level target */
  level: ArticleLevel

  /** Medium type (article, video, spreadsheet, etc.) */
  medium: ArticleMedium

  /** Language of the content */
  language: ArticleLanguage

  /** Link state — drives the icon and which URL we actually open */
  linkStatus: LinkStatus

  /** The URL we actually direct users to (live, archive, or mirror) */
  primaryUrl: string

  /**
   * The original URL when we serve an archive/mirror. Shown as a
   * secondary "view original" link for transparency. Undefined when
   * the primary URL IS the original.
   */
  originalUrl?: string

  /** 1-2 sentence description (max ~200 chars) */
  description: string

  /**
   * Editorial note from the curator. The voice that makes the library
   * feel personal rather than an aggregator. Only present on articles
   * featured in a curator track.
   */
  curatorNote?: string

  /**
   * Which track to feature this article in (at most one). Articles
   * without a track only appear in the main grid.
   */
  curatorTrack?: CuratorTrack

  /**
   * If this article belongs to a series, the series slug (used to
   * group series parts visually). E.g., 'saito-tournament-success'.
   */
  seriesId?: string

  /** Position within a series (1-indexed) */
  seriesPart?: number

  /** Hide from the main grid (useful if article is only a series sub-part) */
  hideFromMainGrid?: boolean

  /**
   * Estimated reading time in minutes. Optional — when set, appears as
   * a badge on the ArticleCard so Léo/Sarah can pick a piece that fits
   * the time they have before FNM. Rough estimate (±30%). Video/podcast
   * durations use the actual runtime.
   */
  readingTimeMin?: number
}

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  fundamentals: 'Fundamentals',
  manabase: 'Manabase & Mana Math',
  deckbuilding: 'Deckbuilding & Archetypes',
  mulligan: 'Mulligans & Sequencing',
  sideboard: 'Sideboarding',
  metagame: 'Metagame & Data',
  mindset: 'Tournament Mindset',
  advanced: 'Advanced Theory',
  podcasts: 'Podcasts',
}

export const CATEGORY_ORDER: ArticleCategory[] = [
  'fundamentals',
  'manabase',
  'deckbuilding',
  'mulligan',
  'sideboard',
  'metagame',
  'mindset',
  'advanced',
  'podcasts',
]

export const TRACK_METADATA: Record<
  CuratorTrack,
  {
    id: CuratorTrack
    emoji: string
    title: string
    tagline: string
    description: string
    accentColor: 'w' | 'u' | 'b' | 'r' | 'g' // mana color for the track accent
    /**
     * Optional action CTA label + analyzer preset link. Used by the
     * Commander track to surface "Analyze my Commander deck →", closing
     * the loop between the Library (reading) and the Analyzer (doing).
     */
    analyzerCtaLabel?: string
    analyzerCtaHref?: string
  }
> = {
  'first-fnm': {
    id: 'first-fnm',
    emoji: '🎴',
    title: 'Your First FNM',
    tagline: 'Starting out — give yourself a fighting chance',
    description:
      'For players preparing for their first Friday Night Magic. The foundations that help you play your deck, not fight it.',
    accentColor: 'u',
  },
  rcq: {
    id: 'rcq',
    emoji: '🏆',
    title: 'Preparing for an RCQ',
    tagline: 'Leveling up — the competitive curriculum',
    description:
      'For players moving from FNM to Regional Championship Qualifiers. The articles that separate regulars from competitors.',
    accentColor: 'g',
  },
  'pro-tour': {
    id: 'pro-tour',
    emoji: '🎯',
    title: 'Pro Tour Preparation',
    tagline: 'Mastering — the hidden canon',
    description:
      'For grinders who have read the classics. International pros, rescued archives, and deep game theory you will not find on other reading lists.',
    accentColor: 'r',
  },
  commander: {
    id: 'commander',
    emoji: '👑',
    title: 'Commander Pod',
    tagline: 'Piloting 100 cards — singleton, multiplayer, political',
    description:
      "You're past 60-card. Your deck is 100 cards, singleton, built around a commander. Turns go long, tables have four seats, and the math is different. The Commander canon — manabase theory for 100-card, bracket system, pod politics, and the authors the rest of the internet ignores.",
    accentColor: 'b',
    analyzerCtaLabel: 'Analyze my Commander deck →',
    // /analyzer?format=commander is consumed by AnalyzerPage.tsx:302 —
    // auto-loads the Atraxa EDH sample and sets the persistent Commander
    // preset banner. Future work: format-aware horizon (T5–T8), singleton
    // detection, Rule-0 caveat copy, EDH-calibrated Karsten targets (the
    // 60-card table is still applied today — "command zone not yet
    // modelled" is disclosed in the banner).
    analyzerCtaHref: '/analyzer?format=commander',
  },
  limited: {
    id: 'limited',
    emoji: '📦',
    title: 'Limited (Draft & Sealed)',
    tagline: 'Cracking packs — from signals to curves',
    description:
      'For the pre-release hero, the cube captain, and the draft grinder. Reading the signals, building the curve from 40-card chaos, and the data-driven Limited coverage that changed how the format is played.',
    accentColor: 'w',
  },
}

export const TRACK_ORDER: CuratorTrack[] = ['first-fnm', 'rcq', 'pro-tour', 'commander', 'limited']
