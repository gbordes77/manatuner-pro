import type { ReferenceArticle } from '../types/referenceArticle'

/**
 * Deterministic, URL-safe author slug for `/library/author/:slug`.
 * Strips accents, collapses punctuation/whitespace, lowercases.
 * "Rémi Fortier" → "remi-fortier"
 * "Jimmy Wong & Josh Lee Kwai" → "jimmy-wong-josh-lee-kwai"
 */
export function slugifyAuthor(author: string): string {
  return author
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

/** Reverse lookup — find the canonical author name(s) for a slug. */
export function findAuthorsBySlug(
  articles: ReferenceArticle[],
  slug: string
): { articles: ReferenceArticle[]; authorNames: string[] } {
  const normalized = slug.toLowerCase()
  const matches = articles.filter((a) => slugifyAuthor(a.author) === normalized)
  const authorNames = Array.from(new Set(matches.map((a) => a.author)))
  return { articles: matches, authorNames }
}

/**
 * Build a BibTeX @online entry from a ReferenceArticle. Produces a valid
 * citation suitable for papers, theses, and academic blog posts.
 * Key format: `authorlastname_year_slug` — unique + readable.
 *
 * Example output:
 *   @online{karsten_2022_how-many-lands,
 *     author    = {Frank Karsten},
 *     title     = {How Many Lands Do You Need in Your Deck?},
 *     year      = {2022},
 *     url       = {https://...},
 *     urldate   = {2026-04-18},
 *     publisher = {TCGPlayer Infinite},
 *     note      = {Archived via archive.org},
 *   }
 */
export function toBibTeX(article: ReferenceArticle): string {
  const firstAuthor = article.author.split(/[,&]|and /)[0].trim()
  const lastName =
    firstAuthor
      .split(/\s+/)
      .slice(-1)[0]
      ?.toLowerCase()
      .replace(/[^a-z]/g, '') || 'anon'
  const slugPart = article.id.slice(0, 32)
  const key = `${lastName}_${article.year}_${slugPart}`

  const today = new Date().toISOString().slice(0, 10)
  const cleanTitle = article.title.replace(/[{}]/g, '')
  const lines = [
    `@online{${key},`,
    `  author    = {${article.author}},`,
    `  title     = {${cleanTitle}}${article.subtitle ? '' : ','}`,
  ]
  if (article.subtitle) {
    lines.push(`  subtitle  = {${article.subtitle.replace(/[{}]/g, '')}},`)
  }
  lines.push(`  year      = {${article.year}},`)
  lines.push(`  url       = {${article.primaryUrl}},`)
  if (article.originalUrl && article.originalUrl !== article.primaryUrl) {
    lines.push(`  note      = {Original URL: ${article.originalUrl}},`)
  } else if (article.linkStatus === 'archived') {
    lines.push(`  note      = {Archived via archive.org},`)
  } else if (article.linkStatus === 'mirror') {
    lines.push(`  note      = {Community-hosted mirror},`)
  }
  lines.push(`  urldate   = {${today}},`)
  lines.push(`  publisher = {${article.publisher}},`)
  lines.push('}')
  return lines.join('\n')
}

/**
 * Format a single article as a Markdown bullet for Discord/Slack paste.
 * Short and scannable — title + author link, not a full blurb.
 */
export function articleAsMarkdown(article: ReferenceArticle): string {
  const link = article.linkStatus === 'lost' ? '(no working link)' : `<${article.primaryUrl}>`
  const medium =
    article.medium === 'video' || article.medium === 'video-series'
      ? ' 📺'
      : article.medium === 'podcast'
        ? ' 🎧'
        : ''
  return `- **${article.title}**${medium} — ${article.author} (${article.publisher}, ${article.year}) ${link}`
}

/**
 * Build a complete Markdown block from a list of articles, grouped by
 * the category we were told to surface first. Used by the "Copy as
 * Markdown" action on /library — Karim's Discord-paste ask.
 */
export function articlesAsMarkdown(
  articles: ReferenceArticle[],
  options?: {
    heading?: string
    groupBy?: 'category' | 'none'
    categoryLabels?: Record<string, string>
  }
): string {
  const heading = options?.heading ?? 'MTG Competitive Reading List'
  const out: string[] = [`## ${heading}`, '']

  if (options?.groupBy === 'category' && options.categoryLabels) {
    const byCat = new Map<string, ReferenceArticle[]>()
    for (const a of articles) {
      const list = byCat.get(a.category) || []
      list.push(a)
      byCat.set(a.category, list)
    }
    for (const [cat, list] of byCat) {
      out.push(`### ${options.categoryLabels[cat] ?? cat}`, '')
      for (const a of list) out.push(articleAsMarkdown(a))
      out.push('')
    }
  } else {
    for (const a of articles) out.push(articleAsMarkdown(a))
  }

  out.push('')
  out.push(
    `_Curated at https://www.manatuner.app/library — ${articles.length} article${articles.length === 1 ? '' : 's'}._`
  )
  return out.join('\n')
}
