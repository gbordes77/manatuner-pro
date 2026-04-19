import { describe, expect, it } from 'vitest'
import type { ReferenceArticle } from '../../types/referenceArticle'
import {
  articleAsMarkdown,
  articlesAsMarkdown,
  findAuthorsBySlug,
  slugifyAuthor,
  toBibTeX,
} from '../libraryHelpers'

const sample: ReferenceArticle = {
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
  primaryUrl: 'https://example.com/karsten',
  description: 'Karsten refresh.',
}

describe('slugifyAuthor', () => {
  it('lowercases and hyphenates ASCII names', () => {
    expect(slugifyAuthor('Frank Karsten')).toBe('frank-karsten')
    expect(slugifyAuthor('Paulo Vitor Damo da Rosa')).toBe('paulo-vitor-damo-da-rosa')
  })

  it('strips accents', () => {
    expect(slugifyAuthor('Rémi Fortier')).toBe('remi-fortier')
    expect(slugifyAuthor('Javier Domínguez')).toBe('javier-dominguez')
  })

  it('collapses ampersands and punctuation', () => {
    expect(slugifyAuthor('Jimmy Wong & Josh Lee Kwai')).toBe('jimmy-wong-josh-lee-kwai')
    expect(slugifyAuthor('EDHREC Staff & Contributors')).toBe('edhrec-staff-contributors')
  })

  it('returns a stable value for the same input', () => {
    const s1 = slugifyAuthor('Gavin Verhey & Wizards of the Coast')
    const s2 = slugifyAuthor('Gavin Verhey & Wizards of the Coast')
    expect(s1).toBe(s2)
  })
})

describe('findAuthorsBySlug', () => {
  const library: ReferenceArticle[] = [
    { ...sample, id: 'a1', author: 'Frank Karsten' },
    { ...sample, id: 'a2', author: 'Frank Karsten' },
    { ...sample, id: 'a3', author: 'Paulo Vitor Damo da Rosa' },
    { ...sample, id: 'a4', author: 'Rémi Fortier' },
  ]

  it('finds articles by slug', () => {
    const res = findAuthorsBySlug(library, 'frank-karsten')
    expect(res.articles).toHaveLength(2)
    expect(res.authorNames).toEqual(['Frank Karsten'])
  })

  it('handles accented names', () => {
    const res = findAuthorsBySlug(library, 'remi-fortier')
    expect(res.articles).toHaveLength(1)
    expect(res.authorNames).toEqual(['Rémi Fortier'])
  })

  it('returns empty for unknown slug', () => {
    const res = findAuthorsBySlug(library, 'unknown-name')
    expect(res.articles).toHaveLength(0)
    expect(res.authorNames).toHaveLength(0)
  })
})

describe('toBibTeX', () => {
  it('produces a valid @online entry with required fields', () => {
    const bib = toBibTeX(sample)
    expect(bib).toContain('@online{karsten_2022_')
    expect(bib).toContain('author    = {Frank Karsten}')
    expect(bib).toContain('title     = {How Many Lands Do You Need in Your Deck?}')
    expect(bib).toContain('year      = {2022}')
    expect(bib).toContain('url       = {https://example.com/karsten}')
    expect(bib).toContain('publisher = {TCGPlayer Infinite}')
    expect(bib.trim().endsWith('}')).toBe(true)
  })

  it('adds archive note for archived articles', () => {
    const archived: ReferenceArticle = { ...sample, linkStatus: 'archived' }
    expect(toBibTeX(archived)).toContain('note      = {Archived via archive.org}')
  })

  it('prefers explicit originalUrl note over default archive note', () => {
    const archivedWithOrig: ReferenceArticle = {
      ...sample,
      linkStatus: 'archived',
      originalUrl: 'https://dead.example.com/original',
    }
    expect(toBibTeX(archivedWithOrig)).toContain(
      'note      = {Original URL: https://dead.example.com/original}'
    )
  })

  it('uses first author last-name for key when authors are listed', () => {
    const multi: ReferenceArticle = {
      ...sample,
      author: 'Jimmy Wong & Josh Lee Kwai',
      id: 'command-zone-podcast',
    }
    const bib = toBibTeX(multi)
    expect(bib).toMatch(/@online\{wong_2022_command-zone-podcast/)
  })
})

describe('articleAsMarkdown', () => {
  it('formats a standard article with a URL', () => {
    const md = articleAsMarkdown(sample)
    expect(md).toContain('**How Many Lands Do You Need in Your Deck?**')
    expect(md).toContain('Frank Karsten')
    expect(md).toContain('<https://example.com/karsten>')
  })

  it('marks lost articles without a URL', () => {
    const lost: ReferenceArticle = { ...sample, linkStatus: 'lost' }
    expect(articleAsMarkdown(lost)).toContain('(no working link)')
  })

  it('includes medium emoji for videos', () => {
    const video: ReferenceArticle = { ...sample, medium: 'video' }
    expect(articleAsMarkdown(video)).toContain('📺')
  })
})

describe('articlesAsMarkdown', () => {
  it('returns a non-empty block with the curation footer', () => {
    const md = articlesAsMarkdown([sample])
    expect(md).toContain('## MTG Competitive Reading List')
    expect(md).toContain('manatuner.app/library')
    expect(md).toContain('1 article.')
  })

  it('respects a custom heading', () => {
    const md = articlesAsMarkdown([sample], { heading: 'My Discord Pod Reading Week' })
    expect(md).toContain('## My Discord Pod Reading Week')
  })

  it('groups by category when asked', () => {
    const md = articlesAsMarkdown([sample, { ...sample, id: 'x', category: 'mulligan' }], {
      heading: 'Test',
      groupBy: 'category',
      categoryLabels: { manabase: 'Manabase & Mana Math', mulligan: 'Mulligans & Sequencing' },
    })
    expect(md).toContain('### Manabase & Mana Math')
    expect(md).toContain('### Mulligans & Sequencing')
  })
})
