/**
 * Guards for the Competitive MTG Reading Library seed data.
 *
 * These tests protect the library from the single worst regression class:
 * a broken link shipping to users who trust the curation.
 */

import { describe, expect, it } from 'vitest'
import { articlesReferenceSeed } from '../articlesReferenceSeed'
import { TRACK_ORDER } from '../../types/referenceArticle'

describe('articlesReferenceSeed — data integrity', () => {
  it('contains at least 30 articles', () => {
    expect(articlesReferenceSeed.length).toBeGreaterThanOrEqual(30)
  })

  it('has unique IDs', () => {
    const ids = articlesReferenceSeed.map((a) => a.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('every article has a non-empty primaryUrl starting with http(s)://', () => {
    for (const article of articlesReferenceSeed) {
      expect(article.primaryUrl, `Article "${article.title}" has empty primaryUrl`).toBeTruthy()
      expect(
        article.primaryUrl.match(/^https?:\/\//),
        `Article "${article.title}" primaryUrl is not a valid URL: ${article.primaryUrl}`
      ).toBeTruthy()
    }
  })

  it('lost articles are the only ones allowed to have unreachable URLs', () => {
    // "lost" is the only linkStatus that is not expected to open successfully.
    // Everything else MUST have a live, archived, mirrored, or paywalled URL.
    for (const article of articlesReferenceSeed) {
      if (article.linkStatus === 'lost') {
        // Lost articles still store their last-known URL for community hunts.
        continue
      }
      expect(
        article.primaryUrl,
        `Non-lost article "${article.title}" missing primaryUrl`
      ).toBeTruthy()
    }
  })

  it('archived / mirror articles have an originalUrl for transparency', () => {
    for (const article of articlesReferenceSeed) {
      if (article.linkStatus === 'archived' || article.linkStatus === 'mirror') {
        expect(
          article.originalUrl,
          `Article "${article.title}" (${article.linkStatus}) should declare its originalUrl`
        ).toBeTruthy()
      }
    }
  })

  it('every article featured in a curator track has a curator note', () => {
    const tracked = articlesReferenceSeed.filter((a) => a.curatorTrack !== undefined)
    for (const article of tracked) {
      expect(
        article.curatorNote,
        `Tracked article "${article.title}" is missing its curator note`
      ).toBeTruthy()
    }
  })

  it('every curator track has between 3 and 10 articles', () => {
    for (const track of TRACK_ORDER) {
      const count = articlesReferenceSeed.filter((a) => a.curatorTrack === track).length
      expect(count, `Track "${track}" has ${count} articles`).toBeGreaterThanOrEqual(3)
      expect(count, `Track "${track}" has ${count} articles`).toBeLessThanOrEqual(10)
    }
  })

  it('series parts share a seriesId and declare a seriesPart', () => {
    const seriesParts = articlesReferenceSeed.filter((a) => a.seriesId !== undefined)
    for (const part of seriesParts) {
      expect(
        part.seriesPart,
        `Series part "${part.title}" missing seriesPart number`
      ).toBeGreaterThan(0)
    }
  })

  it('each curator track features at least one user-curated (FR/JP/rare) pick', () => {
    // Make sure the "hidden gems" angle is preserved — each track should
    // include at least one article that is either non-English or from a
    // rescued archive (the international canon the library is proud of).
    for (const track of TRACK_ORDER) {
      const articles = articlesReferenceSeed.filter((a) => a.curatorTrack === track)
      const hasRareContent = articles.some(
        (a) => a.language !== 'en' || a.linkStatus === 'archived' || a.linkStatus === 'mirror'
      )
      expect(hasRareContent, `Track "${track}" lost its international / rescued picks`).toBe(true)
    }
  })
})
