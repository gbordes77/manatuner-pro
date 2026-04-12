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

export type ArticleLevel = 'beginner' | 'intermediate' | 'advanced'

export type ArticleMedium =
  | 'article' // Standard web article
  | 'article-series' // Multi-part series (Saito's 6-part)
  | 'video' // Single video
  | 'video-series' // Playlist (Moudou game theory)
  | 'pdf' // PDF mirror (Karsten land drops)
  | 'spreadsheet' // Google Sheets (Anaël YAHI inventory)
  | 'reference' // Official reference (Wizards ban list)

export type ArticleLanguage = 'en' | 'fr' | 'jp' | 'multi'

export type LinkStatus =
  | 'live' // Original URL works
  | 'archived' // Original dead, use archive.org snapshot
  | 'mirror' // Hosted on a trusted mirror (orkerhulen.dk, TCGPlayer reprint)
  | 'paywall' // Live but requires a subscription
  | 'lost' // No known working URL — call for help from the community

export type CuratorTrack = 'first-fnm' | 'rcq' | 'pro-tour'

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
]

export const TRACK_METADATA: Record<
  CuratorTrack,
  {
    id: CuratorTrack
    emoji: string
    title: string
    tagline: string
    description: string
    accentColor: 'u' | 'g' | 'r' // mana color for the track accent
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
}

export const TRACK_ORDER: CuratorTrack[] = ['first-fnm', 'rcq', 'pro-tour']
