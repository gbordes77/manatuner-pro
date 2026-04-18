#!/usr/bin/env node
/**
 * Natsuki's API: build-time generator for /library.json and
 * /library/feed.xml. Static endpoints that let grinders plug the library
 * into their own tools (spreadsheet ingest, Discord cron bot, feed
 * reader) without scraping the React bundle.
 *
 * Runs as npm `prebuild` and via the dev script below so the files are
 * present in both `public/` (served by Vite dev) and `dist/` (deployed
 * to production). Transpiles the TS seed through esbuild in-process —
 * no tsx/ts-node dependency required.
 *
 * Emits:
 *   public/library.json      — full ReferenceArticle[] + metadata
 *   public/library/feed.xml  — RSS 2.0 feed, newest 30 entries
 *
 * Verified by: `node scripts/generate-library-feeds.mjs && head public/library.json`
 */

import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SEED_ENTRY = join(ROOT, 'src/data/articlesReferenceSeed.ts')
const PUBLIC_DIR = join(ROOT, 'public')
const BASE_URL = 'https://www.manatuner.app'

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function articleFreshnessScore(article, idx) {
  // Same ranking as the UI — newest year wins, seed position breaks ties.
  return article.year * 10_000 + idx
}

function buildRssFeed(articles) {
  const sorted = [...articles]
    .map((a, idx) => ({ a, score: articleFreshnessScore(a, idx) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, 30)
    .map((x) => x.a)

  const pubDate = new Date().toUTCString()
  const items = sorted.map((a) => {
    const link = `${BASE_URL}/library/${a.id}`
    return `    <item>
      <title>${xmlEscape(a.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${new Date(`${a.year}-01-01T00:00:00Z`).toUTCString()}</pubDate>
      <author>${xmlEscape(a.author)}</author>
      <category>${xmlEscape(a.category)}</category>
      <description>${xmlEscape(a.description)}</description>
      <source url="${xmlEscape(a.primaryUrl)}">${xmlEscape(a.publisher)}</source>
    </item>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ManaTuner Competitive MTG Library — Recent additions</title>
    <link>${BASE_URL}/library</link>
    <atom:link href="${BASE_URL}/library/feed.xml" rel="self" type="application/rss+xml" />
    <description>Recently curated articles on manabase math, mulligans, tournament mindset, Commander, and Limited. Updated when new picks land in the reading library.</description>
    <language>en</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <generator>ManaTuner prebuild</generator>
${items.join('\n')}
  </channel>
</rss>
`
}

function buildJsonFeed(articles) {
  // JSON Feed 1.1 schema — machine-readable, lossless re-export of the
  // typed seed so power users (Natsuki) can sync into their own tools.
  const sorted = [...articles]
    .map((a, idx) => ({ a, score: articleFreshnessScore(a, idx) }))
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a)

  return {
    $schema: 'https://jsonfeed.org/version/1.1',
    generated: new Date().toISOString(),
    source: `${BASE_URL}/library`,
    count: sorted.length,
    articles: sorted.map((a) => ({
      id: a.id,
      url: `${BASE_URL}/library/${a.id}`,
      title: a.title,
      subtitle: a.subtitle,
      author: a.author,
      publisher: a.publisher,
      year: a.year,
      category: a.category,
      secondaryCategories: a.secondaryCategories ?? [],
      level: a.level,
      medium: a.medium,
      language: a.language,
      linkStatus: a.linkStatus,
      primaryUrl: a.primaryUrl,
      originalUrl: a.originalUrl,
      description: a.description,
      curatorTrack: a.curatorTrack,
      curatorNote: a.curatorNote,
      readingTimeMin: a.readingTimeMin,
    })),
  }
}

async function loadSeed() {
  // Transpile + bundle the TS seed to an in-memory ESM module, then
  // dynamically import the data URL. Works without a TS runtime because
  // esbuild emits plain JS.
  const result = await build({
    entryPoints: [SEED_ENTRY],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    write: false,
    logLevel: 'silent',
  })
  const js = result.outputFiles[0]?.text
  if (!js) throw new Error('esbuild produced no output for seed')
  const dataUrl = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
  const mod = await import(dataUrl)
  if (!Array.isArray(mod.articlesReferenceSeed)) {
    throw new Error('Seed module did not export articlesReferenceSeed as an array')
  }
  return mod.articlesReferenceSeed
}

async function main() {
  console.log('[library-feeds] Loading seed via esbuild…')
  const articles = await loadSeed()

  mkdirSync(join(PUBLIC_DIR, 'library'), { recursive: true })

  const json = buildJsonFeed(articles)
  writeFileSync(
    join(PUBLIC_DIR, 'library.json'),
    JSON.stringify(json, null, 2) + '\n',
    'utf-8'
  )
  console.log(`[library-feeds] Wrote public/library.json (${articles.length} articles)`)

  const rss = buildRssFeed(articles)
  writeFileSync(join(PUBLIC_DIR, 'library', 'feed.xml'), rss, 'utf-8')
  console.log('[library-feeds] Wrote public/library/feed.xml (top 30 newest)')
}

main().catch((err) => {
  console.error('[library-feeds] Failed:', err)
  process.exit(1)
})
