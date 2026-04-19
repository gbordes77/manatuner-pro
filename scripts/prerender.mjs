/**
 * Prerender script for ManaTuner
 *
 * Generates static HTML for each route at build time using Playwright.
 * Crawlers (Google, Discord, Twitter) get full HTML with meta tags and content.
 * Users get the normal SPA experience (React hydrates on top).
 *
 * Usage: node scripts/prerender.mjs
 * Requires: vite build to have run first (dist/ must exist)
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import { build } from 'esbuild'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const SEED_ENTRY = join(ROOT, 'src/data/articlesReferenceSeed.ts')

// Static routes always prerendered
const STATIC_ROUTES = [
  '/',
  '/analyzer',
  '/guide',
  '/mathematics',
  '/land-glossary',
  '/about',
  '/privacy',
  '/library',
]

const PORT = 4174
const PAGE_TIMEOUT = 15000

/**
 * Deterministic, URL-safe author slug. Kept in sync with
 * src/utils/libraryHelpers.ts::slugifyAuthor. Duplicated here because
 * this script runs outside the TS build — a future refactor could
 * extract both into a shared .mjs helper.
 */
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
  const js = result.outputFiles[0]?.text
  if (!js) throw new Error('esbuild produced no output for seed')
  const dataUrl = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
  const mod = await import(dataUrl)
  if (!Array.isArray(mod.articlesReferenceSeed)) {
    throw new Error('Seed module did not export articlesReferenceSeed as an array')
  }
  return mod.articlesReferenceSeed
}

async function computeLibraryRoutes() {
  const articles = await loadSeed()
  const articleRoutes = articles.map((a) => `/library/${a.id}`)
  const authorSlugs = Array.from(new Set(articles.map((a) => slugifyAuthor(a.author)))).filter(
    Boolean
  )
  const authorRoutes = authorSlugs.map((slug) => `/library/author/${slug}`)
  return { articleRoutes, authorRoutes, articleCount: articles.length, authorCount: authorSlugs.length }
}

async function prerender() {
  console.log('\n--- Prerendering ManaTuner ---\n')

  if (!existsSync(DIST)) {
    console.error('Error: dist/ not found. Run "vite build" first.')
    process.exit(1)
  }

  // Build full route list — static + /library article detail pages
  // + author index pages. Each article and author gets its own HTML
  // so Google/Discord/Twitter see real content with JSON-LD.
  const { articleRoutes, authorRoutes, articleCount, authorCount } = await computeLibraryRoutes()
  const ROUTES = [...STATIC_ROUTES, ...articleRoutes, ...authorRoutes]
  console.log(
    `Routes: ${STATIC_ROUTES.length} static + ${articleCount} articles + ${authorCount} authors = ${ROUTES.length} total`
  )

  // Start Vite preview server
  console.log('Starting preview server...')
  const server = await preview({
    root: ROOT,
    preview: { port: PORT, host: true, strictPort: true },
  })
  const baseUrl = `http://localhost:${PORT}`
  console.log(`Preview server running at ${baseUrl}`)

  // Launch headless browser
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'ManaTuner-Prerenderer/1.0',
  })

  let success = 0
  let failed = 0

  for (const route of ROUTES) {
    const url = `${baseUrl}${route}`
    const page = await context.newPage()

    try {
      process.stdout.write(`  Rendering ${route} ...`)

      // Navigate and wait for network to be idle (all lazy chunks loaded)
      await page.goto(url, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT })

      // Wait for React to finish rendering + helmet to update head
      await page.waitForTimeout(1500)

      // Extract the full rendered HTML
      const html = await page.content()

      // Determine output path
      let outFile
      if (route === '/') {
        outFile = join(DIST, 'index.html')
      } else {
        const outDir = join(DIST, route.slice(1))
        mkdirSync(outDir, { recursive: true })
        outFile = join(outDir, 'index.html')
      }

      // Inject a marker comment so we can verify prerendering worked
      const markedHtml = html.replace(
        '<head>',
        '<head>\n<!-- prerendered -->'
      )

      writeFileSync(outFile, markedHtml, 'utf-8')
      console.log(` -> ${outFile.replace(ROOT + '/', '')}`)
      success++
    } catch (err) {
      console.log(` FAILED: ${err.message}`)
      failed++
    } finally {
      await page.close()
    }
  }

  // Cleanup
  await browser.close()
  server.httpServer.close()

  console.log(`\nPrerender complete: ${success} succeeded, ${failed} failed`)
  console.log('---\n')

  if (failed > 0) process.exit(1)
}

prerender().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
