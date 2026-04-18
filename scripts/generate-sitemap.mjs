#!/usr/bin/env node
/**
 * Generate public/sitemap.xml from the static route list + the library
 * seed. Gives Google + Bing a canonical list of every per-article URL
 * and every author index — the long-tail SEO lever Natsuki + David care
 * about. Runs as part of `prebuild`.
 */

import { build } from 'esbuild'
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SEED_ENTRY = join(ROOT, 'src/data/articlesReferenceSeed.ts')
const BASE_URL = 'https://www.manatuner.app'

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'monthly' },
  { path: '/analyzer', priority: 0.9, changefreq: 'monthly' },
  { path: '/land-glossary', priority: 0.8, changefreq: 'monthly' },
  { path: '/library', priority: 0.9, changefreq: 'weekly' },
  { path: '/guide', priority: 0.7, changefreq: 'monthly' },
  { path: '/mathematics', priority: 0.7, changefreq: 'monthly' },
  { path: '/about', priority: 0.4, changefreq: 'yearly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
]

function slugifyAuthor(author) {
  return author
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

async function loadSeed() {
  const result = await build({
    entryPoints: [SEED_ENTRY],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    write: false,
    logLevel: 'silent',
  })
  const dataUrl =
    'data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64')
  const mod = await import(dataUrl)
  return mod.articlesReferenceSeed
}

function urlEntry(loc, priority, changefreq, lastmod) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
}

async function main() {
  console.log('[sitemap] Loading seed…')
  const articles = await loadSeed()
  const today = new Date().toISOString().slice(0, 10)

  const entries = []
  for (const r of STATIC_ROUTES) {
    entries.push(urlEntry(`${BASE_URL}${r.path}`, r.priority, r.changefreq, today))
  }

  // Per-article routes — long-tail SEO. Prioritise live articles; archived
  // content still indexed but with slightly lower priority so crawl budget
  // lands on fresh URLs first.
  for (const a of articles) {
    const priority = a.linkStatus === 'live' ? 0.6 : 0.4
    entries.push(urlEntry(`${BASE_URL}/library/${a.id}`, priority, 'monthly', today))
  }

  // Author index routes — one per unique author
  const uniqueAuthors = [...new Set(articles.map((a) => a.author))]
  for (const author of uniqueAuthors) {
    entries.push(
      urlEntry(`${BASE_URL}/library/author/${slugifyAuthor(author)}`, 0.5, 'monthly', today)
    )
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

  writeFileSync(join(ROOT, 'public', 'sitemap.xml'), xml, 'utf-8')
  console.log(
    `[sitemap] Wrote public/sitemap.xml (${STATIC_ROUTES.length} static + ${articles.length} articles + ${uniqueAuthors.length} authors)`
  )
}

main().catch((err) => {
  console.error('[sitemap] Failed:', err)
  process.exit(1)
})
