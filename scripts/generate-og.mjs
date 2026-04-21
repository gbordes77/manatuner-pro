/**
 * OG image generator for ManaTuner.
 *
 * Produces two candidates at 1200×630 (retina-doubled) for Facebook,
 * LinkedIn, Discord, and Twitter-card `summary_large_image`:
 *
 *   A1 — live-site hero screenshot (Analyzer-first pitch)
 *   A2 — custom composite (Analyzer + Canon dual-pitch)
 *
 * Run: `node scripts/generate-og.mjs`
 * Requires dev server on http://localhost:3000 for A1.
 *
 * Outputs to `public/og-image-v4-a1.jpg` and `public/og-image-v4-a2.jpg`.
 * Creator picks one → rename to `og-image-v4.jpg`, update meta refs.
 */

import { chromium } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public')
const SITE_URL = process.env.OG_SITE_URL || 'http://localhost:3000/'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

// ---------- A1 — live hero screenshot ----------

async function generateA1(browser) {
  const context = await browser.newContext({
    viewport: { width: OG_WIDTH, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  })
  const page = await context.newPage()

  await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30_000 })

  // Hide sticky header + freeze floating mana animations for a clean frame.
  await page.addStyleTag({
    content: `
      header, [class*="MuiAppBar"] { display: none !important; }
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  })

  await page.waitForTimeout(600)

  // Anchor on the H1 so the clip starts just above it.
  const heroTop = await page.evaluate(() => {
    const h1 = document.querySelector('h1')
    if (!h1) return 0
    return Math.max(0, h1.getBoundingClientRect().top + window.scrollY - 60)
  })

  await page.screenshot({
    path: path.join(PUBLIC_DIR, 'og-image-v4-a1.jpg'),
    type: 'jpeg',
    quality: 92,
    clip: { x: 0, y: heroTop, width: OG_WIDTH, height: OG_HEIGHT },
  })

  await context.close()
  console.log('[A1] public/og-image-v4-a1.jpg')
}

// ---------- A2 — custom composite (Analyzer + Canon) ----------

const A2_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/mana-font@1.15.0/css/mana.min.css" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${OG_WIDTH}px;
    height: ${OG_HEIGHT}px;
    overflow: hidden;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1a1a2e;
    background: linear-gradient(180deg, #f5f7fa 0%, #e6eaf0 100%);
    position: relative;
  }
  .frame {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    position: relative; z-index: 1;
  }

  /* --- TOP: Analyzer pitch --- */
  .top {
    flex: 0 0 48%;
    padding: 22px 70px 12px;
    text-align: center;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  /* WUBRG canonical mana row — instant MTG recognition at thumbnail size */
  .wubrg {
    display: flex; justify-content: center; gap: 14px;
    margin-bottom: 16px;
  }
  .wubrg i {
    font-size: 40px;
    filter: drop-shadow(0 3px 5px rgba(0,0,0,0.25));
  }
  .h1 {
    font-family: 'Cinzel', serif;
    font-weight: 800;
    font-size: 40px;
    line-height: 1.08;
    letter-spacing: 0.015em;
    text-transform: uppercase;
    margin-bottom: 18px;
    background: linear-gradient(90deg, #808080 0%, #0E68AB 25%, #6A1B9A 50%, #C0392B 75%, #2e7d32 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    max-width: 980px;
  }
  .cta-gold {
    display: inline-flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #E9B54C 0%, #FFD700 50%, #E9B54C 100%);
    color: #1a1a2e;
    font-weight: 700;
    font-size: 20px;
    padding: 14px 34px;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(233, 181, 76, 0.4);
    border: 2px solid rgba(255,255,255,0.35);
    letter-spacing: 0.01em;
  }

  /* --- BRIDGE --- */
  .bridge {
    flex: 0 0 auto;
    padding: 10px 80px;
    display: flex; align-items: center; justify-content: center;
    gap: 24px;
  }
  .rule { flex: 1; height: 1px; background: rgba(0,0,0,0.18); max-width: 120px; }
  .bridge-text {
    font-family: 'Cinzel', serif;
    font-style: italic;
    font-weight: 500;
    font-size: 18px;
    color: rgba(26, 26, 46, 0.78);
    letter-spacing: 0.015em;
    white-space: nowrap;
  }

  /* --- BOTTOM: Canon pitch --- */
  .canon {
    flex: 1 1 auto;
    padding: 18px 60px 28px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    background: radial-gradient(ellipse at center, rgba(14,104,171,0.07) 0%, rgba(106,27,154,0.045) 55%, transparent 100%);
    border-top: 1px solid rgba(14, 104, 171, 0.10);
  }
  .overline {
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.2em;
    color: #0E68AB;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .h2 {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: 28px;
    line-height: 1.2;
    margin-bottom: 8px;
  }
  .canon-desc {
    font-size: 15px;
    color: rgba(26,26,46,0.65);
    max-width: 680px;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .canon-desc b { color: #1a1a2e; font-weight: 600; }
  .cta-library {
    display: inline-flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #0E68AB 0%, #6A1B9A 100%);
    color: white;
    font-weight: 700;
    font-size: 16px;
    padding: 12px 30px;
    border-radius: 14px;
    box-shadow: 0 8px 28px rgba(14,104,171,0.45);
    border: 1px solid rgba(125,180,255,0.4);
    letter-spacing: 0.01em;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="top">
      <div class="wubrg">
        <i class="ms ms-w ms-cost" aria-hidden="true"></i>
        <i class="ms ms-u ms-cost" aria-hidden="true"></i>
        <i class="ms ms-b ms-cost" aria-hidden="true"></i>
        <i class="ms ms-r ms-cost" aria-hidden="true"></i>
        <i class="ms ms-g ms-cost" aria-hidden="true"></i>
      </div>
      <div class="h1">The Only Mana Calculator<br>That Counts Your Dorks &amp; Rocks</div>
      <div class="cta-gold">⚡ Analyze My Deck →</div>
    </div>

    <div class="bridge">
      <div class="rule"></div>
      <div class="bridge-text">The math tells you what to play. The canon tells you why.</div>
      <div class="rule"></div>
    </div>

    <div class="canon">
      <div class="overline">The Canon</div>
      <div class="h2">Competitive MTG, curated.</div>
      <div class="canon-desc">
        From <b>Karsten&rsquo;s</b> manabase math to <b>Saito&rsquo;s</b> tournament mindset — 48 must-read articles organized by skill level.
      </div>
      <div class="cta-library">📚 Browse the Library →</div>
    </div>
  </div>
</body>
</html>`

async function generateA2(browser) {
  const context = await browser.newContext({
    viewport: { width: OG_WIDTH, height: OG_HEIGHT },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  })
  const page = await context.newPage()

  await page.setContent(A2_HTML, { waitUntil: 'networkidle', timeout: 15_000 })
  // Wait for Google Fonts to kick in
  await page.waitForTimeout(1200)

  await page.screenshot({
    path: path.join(PUBLIC_DIR, 'og-image-v4-a2.jpg'),
    type: 'jpeg',
    quality: 92,
    clip: { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT },
  })

  await context.close()
  console.log('[A2] public/og-image-v4-a2.jpg')
}

// ---------- entry ----------

async function main() {
  console.log(`[og] rendering to ${PUBLIC_DIR}`)
  const browser = await chromium.launch()
  try {
    await generateA1(browser)
    await generateA2(browser)
  } finally {
    await browser.close()
  }
  console.log('[og] done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
