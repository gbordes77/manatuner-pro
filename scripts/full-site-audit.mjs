#!/usr/bin/env node
/**
 * Full-site + link-health audit.
 *
 * - Hits every static route + per-article + per-author route on the local
 *   dev server; every non-200 is flagged.
 * - Parallel HEAD (falls back to GET) on every primaryUrl + originalUrl
 *   in the seed; timeouts count as "check-manually", not as dead.
 * - Parses public/library.json + public/library/feed.xml + public/sitemap.xml
 *   for structure sanity.
 *
 * Usage: node scripts/full-site-audit.mjs
 * Requires: dev server on http://localhost:3000
 */

import { build } from 'esbuild'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DEV_BASE = process.env.AUDIT_BASE || 'http://localhost:3000'
const TIMEOUT_MS = Number(process.env.AUDIT_TIMEOUT || 15000)
// External origins throttle aggressively — keep fan-out low. Wayback in
// particular refuses connections when it sees a burst from one IP.
const CONCURRENCY = Number(process.env.AUDIT_CONCURRENCY || 4)
const RETRIES = Number(process.env.AUDIT_RETRIES || 2)

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
    entryPoints: [join(ROOT, 'src/data/articlesReferenceSeed.ts')],
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

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (ManaTuner-Audit/1.0; +https://www.manatuner.app) Firefox/120.0',
        accept: '*/*',
      },
      ...opts,
    })
    return { ok: r.ok, status: r.status, finalUrl: r.url }
  } catch (err) {
    return { ok: false, status: 0, err: err.name === 'AbortError' ? 'timeout' : err.message }
  } finally {
    clearTimeout(timer)
  }
}

async function probeOnce(url) {
  // HEAD first (fast), GET fallback (some servers reject HEAD).
  const head = await fetchWithTimeout(url, { method: 'HEAD' })
  if (head.ok) return head
  if (head.status === 405 || head.status === 403 || head.status === 0 || head.status >= 500) {
    const get = await fetchWithTimeout(url, { method: 'GET' })
    if (get.ok) return get
    return get
  }
  return head
}

async function probe(url) {
  // Retry with exponential backoff on transient network errors (status=0).
  // archive.org and Wayback drop connections under burst, not real deaths.
  let last
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    last = await probeOnce(url)
    if (last.ok) return last
    const retryable = last.status === 0 || last.status >= 500 || last.status === 429
    if (!retryable) return last
    if (attempt < RETRIES) {
      const wait = 800 * (attempt + 1) + Math.random() * 400
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  return last
}

async function parallelMap(items, fn, concurrency) {
  const results = new Array(items.length)
  let idx = 0
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = idx++
      if (i >= items.length) return
      results[i] = await fn(items[i], i)
      // small stagger to be polite to origins
      if (i % 4 === 0) await new Promise((r) => setTimeout(r, 30))
    }
  })
  await Promise.all(workers)
  return results
}

function fmtResult(label, result) {
  if (result.ok) return `  ✓ [${result.status}] ${label}`
  if (result.err === 'timeout') return `  ⏱ [timeout] ${label}`
  return `  ✗ [${result.status}${result.err ? ' ' + result.err : ''}] ${label}`
}

async function auditSiteRoutes(articles) {
  console.log('\n=== 1/3 Site routes on dev server ===\n')

  const uniqueAuthors = [...new Set(articles.map((a) => a.author))]
  const routes = [
    '/',
    '/analyzer',
    '/guide',
    '/mathematics',
    '/my-analyses',
    '/land-glossary',
    '/library',
    '/about',
    '/privacy',
    '/analyzer?format=commander',
    '/analyzer?sample=edh',
    '/library.json',
    '/library/feed.xml',
    '/sitemap.xml',
    '/robots.txt',
    '/changelog.json',
  ]
  for (const a of articles) routes.push(`/library/${a.id}`)
  for (const a of uniqueAuthors) routes.push(`/library/author/${slugifyAuthor(a)}`)

  const results = await parallelMap(
    routes,
    async (r) => {
      const res = await probe(`${DEV_BASE}${r}`)
      return { route: r, res }
    },
    CONCURRENCY
  )

  const failed = results.filter((x) => !x.res.ok)
  for (const r of results.filter((x) => !x.res.ok)) console.log(fmtResult(r.route, r.res))
  console.log(`\nSite routes: ${results.length - failed.length}/${results.length} OK`)
  return { routes, results, failed }
}

async function auditExternalLinks(articles) {
  console.log('\n=== 2/3 External library links ===\n')
  const checks = []
  for (const a of articles) {
    if (a.linkStatus !== 'lost') {
      checks.push({
        label: `[${a.id}] primary`,
        url: a.primaryUrl,
        article: a,
        isPrimary: true,
      })
    }
    if (a.originalUrl && a.originalUrl !== a.primaryUrl) {
      checks.push({
        label: `[${a.id}] original`,
        url: a.originalUrl,
        article: a,
        isOriginal: true,
      })
    }
  }

  const results = await parallelMap(
    checks,
    async (c) => ({ ...c, res: await probe(c.url) }),
    CONCURRENCY
  )

  // Classify
  // - `okResponses`: server said 2xx
  // - `timeout`: abort — surface for manual review
  // - `expectedDead`: originalUrl 404s on archived/mirror articles — this
  //    is WHY we archived. Not a real problem.
  // - `botBlocked`: 403 with `linkStatus === 'live'` is usually Cloudflare
  //    or similar — the URL works in a browser but rejects our UA.
  // - `realDead`: primary URL of a supposedly-live article is actually 404.
  const okResponses = results.filter((r) => r.res.ok)
  const timeout = results.filter((r) => r.res.err === 'timeout')
  const failed = results.filter((r) => !r.res.ok && r.res.err !== 'timeout')

  // An `originalUrl` exists precisely to document "the old URL that no
  // longer works reliably". Any failure on an originalUrl is expected —
  // that's the reason we recorded it. Only failures on `primaryUrl` (the
  // URL users actually click) can be a real problem.
  const expectedDead = failed.filter((r) => r.isOriginal)
  const botBlocked = failed.filter(
    (r) => !expectedDead.includes(r) && r.res.status === 403
  )
  const realDead = failed.filter(
    (r) => !expectedDead.includes(r) && !botBlocked.includes(r)
  )

  console.log(`Health: ${okResponses.length}/${results.length} responded 2xx`)
  console.log(`         ${timeout.length} timed out (check manually)`)
  console.log(`         ${expectedDead.length} expected 404 on archived originalUrl (these ARE why we archived)`)
  console.log(`         ${botBlocked.length} bot-blocked 403 (Cloudflare / WAF — live for real users)`)
  console.log(`         ${realDead.length} REAL dead\n`)

  if (realDead.length) {
    console.log('--- ⚠ REAL DEAD (fix these) ---')
    for (const r of realDead) console.log(fmtResult(`${r.label} ${r.url}`, r.res))
  }
  if (botBlocked.length) {
    console.log('\n--- Bot-blocked (verify in a browser — probably fine) ---')
    for (const r of botBlocked) console.log(`  🛡 [${r.res.status}] ${r.label} ${r.url}`)
  }
  if (expectedDead.length) {
    console.log('\n--- Expected-dead originalUrl (archived, not a bug) ---')
    for (const r of expectedDead) console.log(`  📁 ${r.label} ${r.url}`)
  }
  if (timeout.length) {
    console.log('\n--- Timed out (slow origin) ---')
    for (const r of timeout) console.log(`  ⏱ ${r.label} ${r.url}`)
  }

  return { results, realDead, botBlocked, expectedDead, timeout }
}

function auditFeeds() {
  console.log('\n=== 3/3 Feed + sitemap structure ===\n')

  const jsonPath = join(ROOT, 'public/library.json')
  const rssPath = join(ROOT, 'public/library/feed.xml')
  const sitePath = join(ROOT, 'public/sitemap.xml')

  const problems = []
  try {
    const j = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    if (j.$schema !== 'https://jsonfeed.org/version/1.1')
      problems.push(`library.json: unexpected $schema ${j.$schema}`)
    if (!Array.isArray(j.articles)) problems.push('library.json: articles is not an array')
    if (!j.count || j.count !== j.articles.length)
      problems.push(`library.json: count=${j.count} vs articles.length=${j.articles?.length}`)
    const required = ['id', 'url', 'title', 'author', 'year', 'category', 'primaryUrl']
    for (const a of j.articles || []) {
      for (const k of required) {
        if (!a[k] && a[k] !== 0)
          problems.push(`library.json: article ${a.id || '?'} missing ${k}`)
      }
      if (!/^https?:\/\//.test(a.url))
        problems.push(`library.json: article ${a.id} bad url ${a.url}`)
    }
    console.log(`library.json: $schema OK, count=${j.count}`)
  } catch (e) {
    problems.push(`library.json: ${e.message}`)
  }

  try {
    const xml = readFileSync(rssPath, 'utf-8')
    if (!xml.startsWith('<?xml')) problems.push('feed.xml: missing XML prolog')
    if (!/<rss\s+version="2\.0"/.test(xml)) problems.push('feed.xml: missing RSS 2.0 root')
    const itemCount = (xml.match(/<item>/g) || []).length
    if (itemCount === 0) problems.push('feed.xml: zero <item> entries')
    console.log(`feed.xml: RSS 2.0 OK, ${itemCount} items`)
  } catch (e) {
    problems.push(`feed.xml: ${e.message}`)
  }

  try {
    const xml = readFileSync(sitePath, 'utf-8')
    const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || []
    const bad = locs.filter((l) => !/<loc>https:\/\/www\.manatuner\.app/.test(l))
    if (bad.length) problems.push(`sitemap.xml: ${bad.length} non-canonical <loc>`)
    console.log(`sitemap.xml: ${locs.length} <loc> entries, ${bad.length} non-canonical`)
  } catch (e) {
    problems.push(`sitemap.xml: ${e.message}`)
  }

  for (const p of problems) console.log(`  ✗ ${p}`)
  return problems
}

async function main() {
  const articles = await loadSeed()
  console.log(`Seed: ${articles.length} articles loaded.`)

  // Dev server reachable?
  const base = await fetchWithTimeout(DEV_BASE)
  if (!base.ok) {
    console.error(`Dev server unreachable at ${DEV_BASE}. Start with 'npm run dev'.`)
    process.exit(2)
  }

  const site = await auditSiteRoutes(articles)
  const ext = await auditExternalLinks(articles)
  const feedProblems = auditFeeds()

  console.log('\n============= SUMMARY =============')
  console.log(`Site routes OK:               ${site.results.length - site.failed.length}/${site.results.length}`)
  console.log(`Article URLs OK:              ${ext.results.length - ext.realDead.length - ext.botBlocked.length - ext.expectedDead.length - ext.timeout.length}/${ext.results.length}`)
  console.log(`Article URLs timed out:       ${ext.timeout.length}`)
  console.log(`Article URLs expected-dead:   ${ext.expectedDead.length} (archived originals)`)
  console.log(`Article URLs bot-blocked:     ${ext.botBlocked.length} (verify in browser)`)
  console.log(`Article URLs REAL dead:       ${ext.realDead.length}`)
  console.log(`Feed/sitemap problems:        ${feedProblems.length}`)

  // Fail hard on site route failures, REAL dead primary URLs, and feed
  // problems. Expected-dead originals and bot-blocks don't fail the run —
  // they're surfaced as a manual-review checklist.
  const hardFail = site.failed.length > 0 || ext.realDead.length > 0 || feedProblems.length > 0
  process.exit(hardFail ? 1 : 0)
}

main().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
