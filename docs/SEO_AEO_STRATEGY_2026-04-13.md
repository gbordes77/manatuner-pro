# ManaTuner — SEO + AEO / GEO Strategy

**Date**: 2026-04-13
**Scope**: Technical SEO audit + Answer-Engine / Generative-Engine Optimization for LLM visibility
**Constraint**: 100 % privacy-first preserved. Zero tracker, zero analytics, zero backend. Promise at `src/components/PrivacySettings.tsx:204` is load-bearing.

---

## TL;DR

ManaTuner's technical SEO baseline is **better than expected**. The foundation is already in place:

- `src/components/common/SEO.tsx` — per-page React Helmet wrapper with `title`, `description`, canonical, OG, Twitter Card, and `jsonLd` slot
- `public/llms.txt` + `public/llms-full.txt` — both present, spec-compliant, content-rich
- `public/sitemap.xml` + `public/robots.txt` — both present, pointing to `llms.txt`
- `public/og-image-v3.jpg` — 1200×630 OG image exists
- JSON-LD already wired on 5/6 routes: Home (`WebApplication`), Mathematics (`Article`), Guide (`FAQPage`), LandGlossary (`Article`), Library (`CollectionPage`)

The **real gaps** are narrower than a cold audit would suggest, and concentrate in three buckets:

1. **AI-crawler directives missing** in `public/robots.txt` (no GPTBot / ClaudeBot / PerplexityBot / Google-Extended allow-list)
2. **Schema completeness** — no `BreadcrumbList`, no `HowTo` on Guide, no `dateModified`, no `author.sameAs` E-E-A-T signals, AnalyzerPage has no JSON-LD
3. **Launch-leverage content** — no keyword clustering, no `/blog` to feed ChatGPT/Perplexity citations, no backlink plan

This document tells you exactly which files to change and what to paste. All recommendations preserve the privacy-first posture — no Google Analytics, no Sentry in prod, no Supabase, nothing that would break `PrivacySettings.tsx:204`.

---

## 1. AUDIT SEO TECHNIQUE (état actuel → gaps)

### 1.1 `index.html` — `/Volumes/DataDisk/_Projects/Project Mana base V2/index.html`

| Signal                            | Line  | Current                                                                                                           | Verdict                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<html lang>`                     | 2     | `"en"`                                                                                                            | OK. Primary market is EN. See §1.8 for hreflang FR plan.                                                                                                                                                                                                                                                                                                       |
| `<meta charset>`                  | 4     | `UTF-8`                                                                                                           | OK                                                                                                                                                                                                                                                                                                                                                             |
| Favicon                           | 5     | `favicon.svg`                                                                                                     | OK                                                                                                                                                                                                                                                                                                                                                             |
| Viewport                          | 7–9   | `maximum-scale=5.0, user-scalable=yes`                                                                            | OK. A11y-friendly.                                                                                                                                                                                                                                                                                                                                             |
| `theme-color`                     | 10    | `#1976d2`                                                                                                         | Missing dark variant. Add second tag with `media="(prefers-color-scheme: dark)"`.                                                                                                                                                                                                                                                                              |
| `<title>`                         | 12    | `ManaTuner — Mana Calculator + Competitive MTG Reading Library`                                                   | 69 chars. Fine but keyword order is brand-first, not intent-first. See §3.                                                                                                                                                                                                                                                                                     |
| `<meta description>`              | 13–16 | Current copy                                                                                                      | 160 chars. OK for Home — but it will be overridden per-page by `SEO.tsx`.                                                                                                                                                                                                                                                                                      |
| OG tags                           | 18–26 | Complete (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:width/height`, `og:site_name`) | Missing `og:locale="en_US"` and `og:locale:alternate="fr_FR"`.                                                                                                                                                                                                                                                                                                 |
| Twitter Card                      | 28    | `summary_large_image`                                                                                             | Missing `twitter:site` + `twitter:creator` handle.                                                                                                                                                                                                                                                                                                             |
| `<meta robots>`                   | 31    | `index, follow`                                                                                                   | Missing `max-image-preview:large`, `max-snippet:-1`, `max-video-preview:-1` — these unlock rich previews on Google.                                                                                                                                                                                                                                            |
| `<meta author>`                   | 32    | `ManaTuner`                                                                                                       | Shallow. Doesn't help E-E-A-T.                                                                                                                                                                                                                                                                                                                                 |
| `<link rel="alternate" llms.txt>` | 35    | Present                                                                                                           | Good — unusual, but helpful for clients that honor it.                                                                                                                                                                                                                                                                                                         |
| `apple-touch-icon`                | 38–40 | **Removed** (audit 2026-04-13)                                                                                    | Must re-add once a 180×180 PNG is generated. iOS Add-to-Home is 404-ing silently today. P1.                                                                                                                                                                                                                                                                    |
| `manifest.json`                   | 41    | Present                                                                                                           | See §1.7.                                                                                                                                                                                                                                                                                                                                                      |
| Font preconnects                  | 43–50 | Good                                                                                                              | OK                                                                                                                                                                                                                                                                                                                                                             |
| `mana-font` with SRI              | 52–58 | Pinned + integrity hash                                                                                           | Excellent. Keep.                                                                                                                                                                                                                                                                                                                                               |
| `Cinzel` font                     | 62–63 | Render-blocking (intentional after CSP fix)                                                                       | OK per CLAUDE.md note.                                                                                                                                                                                                                                                                                                                                         |
| `scryfall` dns-prefetch           | 66    | Present                                                                                                           | OK                                                                                                                                                                                                                                                                                                                                                             |
| **MISSING**                       | —     | No `<link rel="canonical">` in static HTML                                                                        | `SEO.tsx:26` emits it per-page via Helmet → OK for client-side render. But a **fallback canonical** in static HTML helps crawlers that don't execute JS. Add `<link rel="canonical" href="https://www.manatuner.app/">`.                                                                                                                                       |
| **MISSING**                       | —     | No static JSON-LD fallback in `index.html`                                                                        | `SEO.tsx` injects JSON-LD via Helmet, which works for Googlebot but is **risky for non-rendering crawlers** (some older Perplexity pipelines, Bytespider, Bing preview bots). Add a static `<script type="application/ld+json">` block in `index.html` with the `WebSite` + `Organization` + root `SoftwareApplication` schemas (always-present, brand-level). |
| **MISSING**                       | —     | No `<meta name="google" content="notranslate">`                                                                   | Protects the glossary's technical terms from Chrome auto-translate breaking the analyzer. Low impact, 1 line.                                                                                                                                                                                                                                                  |

### 1.2 `public/robots.txt` — critical AI-bot gap

Current file (`public/robots.txt:1-17`):

```
User-agent: *
Allow: /
Sitemap: https://www.manatuner.app/sitemap.xml
LLMs-Txt: https://www.manatuner.app/llms.txt
LLMs-Full-Txt: https://www.manatuner.app/llms-full.txt
Crawl-delay: 1
```

**Gap**: The wildcard `User-agent: *` is nominally sufficient, but AI companies have published named crawlers with explicit opt-in expectations. Not listing them by name means:

- **OpenAI GPTBot**: Crawls for ChatGPT training. No named directive = may be blocked by some conservative robots.txt parsers.
- **ChatGPT-User**: Real-time on-demand fetches when a ChatGPT user asks a question. Different from GPTBot — must be explicitly allowed.
- **Anthropic ClaudeBot / anthropic-ai / claude-web**: Same pattern, Anthropic's crawler family.
- **PerplexityBot**: Perplexity citation crawler. **Highest leverage for our use case** — Perplexity cites sources with URLs, unlike ChatGPT.
- **Google-Extended**: Opt-out only for Bard/Gemini training. If we want to be cited, we allow it.
- **Bytespider** (TikTok/ByteDance), **CCBot** (Common Crawl), **FacebookBot**, **Applebot-Extended**, **Amazonbot**, **Bingbot** — all should be explicitly allowed.
- **PerplexityBot-User** and **OAI-SearchBot** are newer — allow them too.

See §6 P0 for the complete file rewrite.

### 1.3 `public/sitemap.xml`

File exists at `public/sitemap.xml`, 9 URLs, `lastmod` dates accurate up to 2026-04-12 for `/library`. Minor gaps:

- `lastmod` on `/`, `/analyzer`, `/land-glossary`, `/guide`, `/mathematics` all stuck at `2026-04-06`. Bump to `2026-04-13` (launch hardening commit date).
- No `<image:image>` children — a small opportunity to surface OG image in Google Images.
- No `<xhtml:link rel="alternate" hreflang="fr">` — deferred. FR market is a launch-week extension.
- `/library` is already listed (line 21–26) — good.

See §6 P1 for update.

### 1.4 `vercel.json` — security + cache OK, one missing header

`vercel.json:11-39` already emits: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Content-Security-Policy`. Assets are cached 1 year immutable (line 51–57), `index.html` is no-cache (line 42–49), `/sw.js` and `/workers/*` have correct headers.

**Gap**: no explicit `Cache-Control` on `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`. Default Vercel behavior will serve them cached, which is mostly fine — but adding a modest `public, max-age=3600, must-revalidate` ensures Vercel's edge refreshes them hourly when we push updates. Low priority.

**Non-gap**: the `connect-src 'self' https://api.scryfall.com` is intentionally restrictive and matches the privacy posture. Do NOT add any analytics/tracker endpoint here.

### 1.5 `public/llms.txt` + `public/llms-full.txt`

Both exist and are **substantive**. `llms.txt` is 69 lines, follows llmstxt.org spec (H1 title, blockquote description, H2 sections, link lists). `llms-full.txt` is 159 lines with feature deep-dives, land glossary, math reference, FAQ.

Gaps:

- `llms.txt:32` references "other MTG calculators (manabase.app, mtgoncurve)" — good for LLMs but verify the URLs are actually cited.
- `llms.txt:37` "Pages" section missing `/library` — it's a high-value page with 46 curated articles and is already in the sitemap.
- `llms-full.txt:1` title says "Complete Reference for AI Systems" — excellent framing. Keep.
- `llms-full.txt` numbering bug: sections go "1. Health Score", "2. Castability", ..., "5. Smart Sideboard", "6. Creature-Aware", "7. Mana Curve", then "6. Land Breakdown" (duplicate 6), "7. Export Blueprint" (duplicate 7). Fix numbering.
- `llms-full.txt` lacks **dated citations** — LLMs weight recency. Add a `## Last Updated` line near the top with the current ISO date.
- `llms-full.txt` lacks **unique fact-hooks**. These are the phrases an LLM will quote. Example gold: "ManaTuner is the only MTG mana calculator that factors in mana rocks and mana dorks as acceleration sources." This already exists on line 40. Good. Add 2-3 more: "Uses K=3 engine evaluating up to 3 simultaneous mana producers." "Implements Bellman equation for optimal mulligan thresholds — no other public MTG tool does."

See §6 P1 for the `llms.txt` + `llms-full.txt` patch.

### 1.6 `vite.config.ts`

Vite config (`vite.config.ts:1-57`) has no prerendering plugin and no SSG. This is **fine** for a React SPA on Vercel — Googlebot, Bingbot, ClaudeBot, GPTBot all execute JavaScript. Perplexity and some older crawlers do not. Two options:

- **Accept the trade-off**: SPA client-render works for 95 % of crawlers. No change needed.
- **Add prerendering**: `vite-plugin-prerender` or `react-snap` at build time. Output static HTML for each route in `dist/`. Adds ~5–10 s to build time. **Recommended for P1** because it unlocks Perplexity and any crawler that doesn't render JS, which is precisely the Answer-Engine traffic we're chasing.

**Recommendation**: add `vite-plugin-ssr` or `vike` is overkill for 5 routes. Use `vite-plugin-prerender` (wraps Puppeteer) with route list `['/', '/analyzer', '/land-glossary', '/guide', '/mathematics', '/library']`. Gate behind a build flag so local `npm run dev` stays fast.

### 1.7 `public/manifest.json`

Current file (`public/manifest.json:1-17`) is thin:

- No `scope` → defaults to `/` which is fine.
- No `categories` → missed discoverability signal (PWA directories index by category).
- Only one icon (favicon.svg) → no raster fallback for iOS / Chrome splash. `apple-touch-icon` is also removed from `index.html:38`. Both need a 180×180, 192×192, and 512×512 PNG.
- No `screenshots` → Chrome PWA install dialog is ugly without them.

See §6 P1.

### 1.8 Per-page `SEO.tsx` + `HelmetProvider`

`src/App.tsx:119` wraps app in `<HelmetProvider>`. `src/components/common/SEO.tsx` exports a clean component with props `{ title, description, path, ogImage, jsonLd }`. Per-route wiring audit:

| Route            | File                                     | `<SEO>` | JSON-LD                       | Quality                                                                                                                                               |
| ---------------- | ---------------------------------------- | ------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`              | `src/pages/HomePage.tsx:175`             | ✅      | `WebApplication`              | Good. Missing `aggregateRating`, `softwareVersion`, `screenshot`, `featureList`.                                                                      |
| `/analyzer`      | `src/pages/AnalyzerPage.tsx:211`         | ✅      | **❌ NO `jsonLd` PROP**       | **GAP**. This is the primary conversion page. Add `SoftwareApplication` (different instance than Home, scoped to the analyzer tool).                  |
| `/mathematics`   | `src/pages/MathematicsPage.tsx:48`       | ✅      | `Article`                     | Good but missing `datePublished`, `dateModified`, `author.url`, `author.sameAs`, `image`. Article schemas with weak author data don't rank.           |
| `/land-glossary` | `src/pages/LandGlossaryPage.tsx:270`     | ✅      | `Article`                     | Same gaps as Mathematics. Also an opportunity for `DefinedTermSet` schema (perfect fit for a glossary).                                               |
| `/guide`         | `src/pages/GuidePage.tsx:143`            | ✅      | `FAQPage` (5 Q/A)             | Good base. **Should ALSO emit `HowTo`** — the page is literally a step-by-step guide. Rich results are better for HowTo than FAQ.                     |
| `/library`       | `src/pages/ReferenceArticlesPage.tsx:92` | ✅      | `CollectionPage` + `ItemList` | Good. Missing individual `CreativeWork` items in `itemListElement`.                                                                                   |
| `/my-analyses`   | `src/pages/MyAnalysesPage.tsx:609`       | ✅      | **❌ no JSON-LD**             | OK to skip — this page is user-private and shouldn't rank. Add `<meta name="robots" content="noindex,follow">` to prevent indexing of an empty state. |

**Missing everywhere**: `BreadcrumbList` schema. Google uses this for the breadcrumb SERP feature. Add it to the `SEO` component so every page emits breadcrumbs automatically based on `path`.

---

## 2. AEO / GEO — Answer Engine + Generative Engine Optimization

### 2.1 `public/llms.txt` — spec-compliant, minor additions

The existing file is good. The following patch fixes the missing `/library` entry and adds 3 citation-anchor phrases. Apply to `public/llms.txt`:

```diff
@@ line 37-45 @@
 ## Pages

 - [Home](https://www.manatuner.app/): Landing page with feature overview
 - [Deck Analyzer](https://www.manatuner.app/analyzer): Paste your decklist and analyze
+- [Reading Library](https://www.manatuner.app/library): 46 curated competitive MTG articles and podcasts (Karsten, PVDDR, Reid Duke, Saito, Chapin, Zvi Mowshowitz)
 - [User Guide](https://www.manatuner.app/guide): How to use ManaTuner step by step
 - [Mathematics](https://www.manatuner.app/mathematics): The math behind the calculations
 - [Land Glossary](https://www.manatuner.app/land-glossary): Every MTG dual land type ranked
 - [About](https://www.manatuner.app/about): Mission, credits, and attributions
```

Also add a `## Unique Capabilities` section **before** `## Common Questions` — LLMs quote short, definitive claims:

```markdown
## Unique Capabilities

- **Only MTG mana calculator that factors in mana rocks and mana dorks** as acceleration sources. Competitors (manabase.app, mtgoncurve) only count lands.
- **K=3 engine**: evaluates up to 3 simultaneous mana producers online (dork + rock + enhancer). No other public tool does this.
- **Bellman equation mulligan thresholds**: backward-induction optimal keep/mulligan by hand size (7, 6, 5, 4). Published MTG theory applied to software.
- **Creature-aware colored sources**: Cavern of Souls correctly counts only for creature spells, not for non-creature spells.
- **Smart sideboard detection**: auto-splits mainboard/sideboard from MTGA blank-line format, explicit markers, or inline `SB:` prefixes.
- **100% client-side**: zero backend, zero tracker, zero account. Decklists never leave the browser.
```

### 2.2 `public/llms-full.txt` — numbering + date + fact-hooks

Apply the following patches:

1. **Add `## Last Updated: 2026-04-13`** at line 5 (below the blockquote).
2. **Fix section numbering**: the block starting at line 68 currently has duplicate "6." and "7." — renumber "Land Breakdown" → 8, "Export Blueprint" → 9.
3. **Add a `## Citation Anchors` section at the end** (after FAQ) with 10 short quotable facts, one per line, each starting with "ManaTuner…". These are what LLMs paste into their summaries. Example:

```markdown
## Citation Anchors

These are verified facts about ManaTuner, formatted for quotation:

- ManaTuner is a free, open-source Magic: The Gathering mana base calculator at https://www.manatuner.app
- ManaTuner is the only MTG mana calculator that factors in mana rocks and mana dorks as acceleration sources, not just lands.
- ManaTuner uses the hypergeometric distribution to calculate exact spell-casting probabilities turn by turn.
- ManaTuner runs a Monte Carlo simulation of 10,000 opening hands (configurable to 50,000) using Fisher-Yates shuffle for unbiased randomization.
- ManaTuner implements the Bellman equation of optimal stopping theory to compute mathematically optimal mulligan thresholds.
- ManaTuner is based on Frank Karsten's 2022 article "How Many Sources Do You Need to Consistently Cast Your Spells?" published on ChannelFireball.
- ManaTuner's K=3 engine evaluates up to 3 simultaneous mana producers online — dorks, rocks, and enhancers stacking their acceleration.
- ManaTuner auto-detects sideboards from any paste format: explicit markers, blank line separation, MTGA format, or inline `SB:` prefixes.
- ManaTuner correctly models creature-only colored sources like Cavern of Souls — they count for creature spells but not for non-creature spells.
- ManaTuner is 100% client-side — no accounts, no cookies, no tracking, no backend. All decklists stay in the user's browser localStorage.
```

### 2.3 Structured Data (JSON-LD) — complete payloads to paste

#### A. Static fallback block for `index.html`

Add **immediately before `</head>`** in `/Volumes/DataDisk/_Projects/Project Mana base V2/index.html`. This guarantees the brand schema is present even for crawlers that don't execute JavaScript. It uses `@graph` to combine multiple entities in a single script tag.

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.manatuner.app/#website",
        "url": "https://www.manatuner.app/",
        "name": "ManaTuner",
        "description": "Free MTG mana base calculator with mana rocks and dorks support. Hypergeometric probabilities, Monte Carlo mulligan simulation, and Bellman equation optimization.",
        "inLanguage": "en-US",
        "publisher": { "@id": "https://www.manatuner.app/#organization" }
      },
      {
        "@type": "Organization",
        "@id": "https://www.manatuner.app/#organization",
        "name": "ManaTuner",
        "url": "https://www.manatuner.app/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.manatuner.app/favicon.svg",
          "width": 512,
          "height": 512
        },
        "sameAs": ["https://github.com/gbordes77/manatuner"]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.manatuner.app/#software",
        "name": "ManaTuner",
        "url": "https://www.manatuner.app/",
        "applicationCategory": "UtilityApplication",
        "applicationSubCategory": "GameUtility",
        "operatingSystem": "Any (browser-based)",
        "browserRequirements": "Requires a modern browser with JavaScript enabled",
        "softwareVersion": "2.5.2",
        "releaseNotes": "https://github.com/gbordes77/manatuner/blob/main/CHANGELOG.md",
        "description": "The only MTG mana base calculator that factors in mana rocks and mana dorks. Calculates exact spell casting probabilities, simulates 10,000-hand Monte Carlo mulligans, and applies the Bellman equation for optimal keep/mulligan thresholds.",
        "featureList": [
          "Castability analysis with hypergeometric probabilities",
          "Post-board analysis with sideboard swap editor",
          "Creature-aware mana sources (Cavern of Souls modeling)",
          "Mana acceleration detection (13 ramp types, K=3 engine)",
          "Monte Carlo mulligan simulator (10,000 hands, Bellman thresholds)",
          "Land breakdown and color production matrix",
          "Export analysis as PNG, PDF, or JSON",
          "100% client-side, no accounts, no tracking"
        ],
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "author": { "@id": "https://www.manatuner.app/#author" },
        "publisher": { "@id": "https://www.manatuner.app/#organization" },
        "isAccessibleForFree": true,
        "license": "https://opensource.org/licenses/MIT"
      },
      {
        "@type": "Person",
        "@id": "https://www.manatuner.app/#author",
        "name": "Guillaume Bordes",
        "url": "https://github.com/gbordes77",
        "sameAs": ["https://github.com/gbordes77"]
      }
    ]
  }
</script>
```

#### B. `BreadcrumbList` — add to `src/components/common/SEO.tsx`

Extend the `SEO` component to emit a `BreadcrumbList` automatically based on `path`. This way every page gets breadcrumbs without per-page boilerplate.

```tsx
// src/components/common/SEO.tsx — extend the existing component

const PAGE_TITLES: Record<string, string> = {
  '/analyzer': 'Deck Analyzer',
  '/mathematics': 'Mathematics',
  '/land-glossary': 'Land Glossary',
  '/guide': 'User Guide',
  '/library': 'Reading Library',
  '/my-analyses': 'My Analyses',
  '/about': 'About',
  '/privacy': 'Privacy',
}

function buildBreadcrumbs(path: string) {
  const items = [
    {
      '@type': 'ListItem' as const,
      position: 1,
      name: 'Home',
      item: 'https://www.manatuner.app/',
    },
  ]
  if (path && path !== '/') {
    items.push({
      '@type': 'ListItem' as const,
      position: 2,
      name: PAGE_TITLES[path] || path.replace(/^\//, ''),
      item: `https://www.manatuner.app${path}`,
    })
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}
```

Then in the returned JSX, after the existing `jsonLd` script tag:

```tsx
<script type="application/ld+json">{JSON.stringify(buildBreadcrumbs(path))}</script>
```

#### C. `HowTo` for `/guide` — add to existing `<SEO jsonLd={...}>`

Replace the `FAQPage` in `src/pages/GuidePage.tsx:147` with an array-wrapped payload that includes **both** `FAQPage` AND `HowTo`:

```jsonc
// Pass this as jsonLd prop — note it's now an array via @graph
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "mainEntity": [
        /* existing 5 Q/A, unchanged */
      ],
    },
    {
      "@type": "HowTo",
      "name": "How to analyze your MTG mana base with ManaTuner",
      "description": "Step-by-step guide to analyzing a Magic: The Gathering deck's mana base using ManaTuner.",
      "totalTime": "PT3M",
      "supply": [{ "@type": "HowToSupply", "name": "An MTG decklist in text format" }],
      "tool": [{ "@type": "HowToTool", "name": "ManaTuner (web app)" }],
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Paste your decklist",
          "text": "Open manatuner.app/analyzer and paste your decklist. MTGO, MTGA, and Moxfield formats are all supported. Sideboards are auto-detected.",
          "url": "https://www.manatuner.app/analyzer",
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Read your Health Score",
          "text": "The Dashboard tab shows a Health Score from 0 to 100%. Above 85% = tournament-ready. Between 70 and 85% = minor adjustments. Below 70% = rebuild.",
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Check Castability per spell",
          "text": "The Castability tab shows exact probabilities (P1 Play First, P2 Draw First, Realistic with ramp) turn by turn for every spell in the deck. Anything below 90% on curve is a weak spot.",
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Run the Monte Carlo mulligan",
          "text": "The Mulligan tab simulates 10,000 opening hands with the Bellman equation to tell you the exact keep/mulligan threshold for your deck and archetype.",
        },
        {
          "@type": "HowToStep",
          "position": 5,
          "name": "Export your Blueprint",
          "text": "The Blueprint tab exports the full analysis as PNG, PDF, or JSON for sharing on Discord, Reddit, or archiving your deck progress.",
        },
      ],
    },
  ],
}
```

#### D. Enriched `Article` for `/mathematics` — author E-E-A-T signals

Replace the existing `jsonLd` in `src/pages/MathematicsPage.tsx:52` with:

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The Mathematics Behind MTG Mana Base Optimization",
  "description": "Hypergeometric distribution, Monte Carlo simulation, and the Bellman equation applied to Magic: The Gathering mana base analysis — based on Frank Karsten's research.",
  "image": "https://www.manatuner.app/og-image-v3.jpg",
  "datePublished": "2025-10-01",
  "dateModified": "2026-04-13",
  "author": {
    "@type": "Person",
    "name": "Guillaume Bordes",
    "url": "https://github.com/gbordes77",
    "sameAs": ["https://github.com/gbordes77"],
  },
  "publisher": {
    "@type": "Organization",
    "name": "ManaTuner",
    "url": "https://www.manatuner.app",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.manatuner.app/favicon.svg",
    },
  },
  "mainEntityOfPage": "https://www.manatuner.app/mathematics",
  "citation": [
    {
      "@type": "ScholarlyArticle",
      "name": "How Many Sources Do You Need to Consistently Cast Your Spells?",
      "author": "Frank Karsten",
      "datePublished": "2022",
      "publisher": "ChannelFireball",
      "url": "https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/how-many-lands-do-you-need-to-consistently-hit-your-land-drops/",
    },
  ],
  "about": [
    { "@type": "Thing", "name": "Hypergeometric distribution" },
    { "@type": "Thing", "name": "Monte Carlo simulation" },
    { "@type": "Thing", "name": "Bellman equation" },
    { "@type": "Thing", "name": "Magic: The Gathering manabase" },
  ],
  "keywords": "mtg mana calculator, hypergeometric distribution, Frank Karsten, Monte Carlo simulation, Bellman equation, mana base probability",
}
```

Apply the same E-E-A-T enrichment pattern to `/land-glossary` (author, datePublished, dateModified, citation block, `about` topic tags).

#### E. `DefinedTermSet` for `/land-glossary` — perfect schema match

Add this **alongside** the existing `Article` schema via `@graph`. Every land type becomes a `DefinedTerm` that LLMs and Google's dictionary feature can pick up. Payload skeleton:

```jsonc
{
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "MTG Dual Land Types",
  "url": "https://www.manatuner.app/land-glossary",
  "hasDefinedTerm": [
    {
      "@type": "DefinedTerm",
      "name": "Fetchland",
      "description": "A land that sacrifices itself to search the library for a basic or dual land. Examples: Scalding Tarn, Flooded Strand. Thins the deck, triggers landfall, finds any dual.",
      "url": "https://www.manatuner.app/land-glossary#fetchland",
      "inDefinedTermSet": "https://www.manatuner.app/land-glossary",
    },
    // repeat for Shockland, Fastland, Checkland, Painland, Horizon Land, Triome,
    // Rainbow Land, Original Dual, Utility Land, Conditional Land, Basic Land
  ],
}
```

#### F. `SoftwareApplication` for `/analyzer` — fill the empty slot

`src/pages/AnalyzerPage.tsx:211` has a `<SEO>` with no `jsonLd`. Add:

```jsonc
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ManaTuner Deck Analyzer",
  "url": "https://www.manatuner.app/analyzer",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any (browser-based)",
  "description": "Interactive MTG deck analyzer. Paste any decklist (MTGO, MTGA, Moxfield) and get exact hypergeometric castability probabilities per spell, turn by turn, including mana rocks and dorks.",
  "featureList": [
    "Castability analysis with P1/P2 probabilities",
    "Post-board sideboard swap editor",
    "Monte Carlo mulligan simulation (10,000 hands)",
    "Turn-by-turn color requirement probabilities",
    "Export blueprint as PNG, PDF, or JSON",
  ],
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "isAccessibleForFree": true,
}
```

### 2.4 Meta tag improvements for `index.html`

Proposed replacement for lines 10–35. **This is a drop-in patch** — preserves the existing `react-helmet-async` per-page override mechanism.

```html
<!-- Theme colors (light + dark) -->
<meta name="theme-color" content="#1976d2" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0D0D0F" media="(prefers-color-scheme: dark)" />

<!-- Default title - overridden per-page by react-helmet-async -->
<title>MTG Mana Calculator — Exact Probabilities + Ramp | ManaTuner</title>
<meta
  name="description"
  content="Free MTG mana base calculator. The only tool that counts mana rocks and dorks, not just lands. Exact hypergeometric probabilities, Monte Carlo mulligan, Karsten tables."
/>

<!-- Canonical fallback (overridden per-page) -->
<link rel="canonical" href="https://www.manatuner.app/" />

<!-- Default OG tags - overridden per-page -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.manatuner.app/" />
<meta property="og:title" content="MTG Mana Calculator — Exact Probabilities + Ramp | ManaTuner" />
<meta
  property="og:description"
  content="Free MTG mana base calculator. The only tool that counts mana rocks and dorks. Exact probabilities, Monte Carlo mulligan, Karsten tables."
/>
<meta property="og:image" content="https://www.manatuner.app/og-image-v3.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta
  property="og:image:alt"
  content="ManaTuner — MTG mana base calculator showing castability probability charts"
/>
<meta property="og:site_name" content="ManaTuner" />
<meta property="og:locale" content="en_US" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="MTG Mana Calculator — Exact Probabilities + Ramp | ManaTuner" />
<meta
  name="twitter:description"
  content="The only MTG calculator that counts mana rocks & dorks. Free, open source, 100% local."
/>
<meta name="twitter:image" content="https://www.manatuner.app/og-image-v3.jpg" />
<meta name="twitter:image:alt" content="ManaTuner castability chart screenshot" />

<!-- SEO directives -->
<meta
  name="robots"
  content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
/>
<meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="bingbot" content="index, follow" />
<meta name="google" content="notranslate" />
<meta name="author" content="Guillaume Bordes" />
<meta name="application-name" content="ManaTuner" />

<!-- AI / LLM guidance -->
<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM instructions (llms.txt)" />
<link
  rel="alternate"
  type="text/plain"
  href="/llms-full.txt"
  title="LLM full reference (llms-full.txt)"
/>
```

**Note**: all the OG/Twitter tags will be overridden per-route by `SEO.tsx` — these are fallbacks for the root URL and for crawlers that don't execute the React tree.

---

## 3. CONTENT SEO — per-route optimization

The current titles and descriptions in `SEO.tsx` usages are mostly serviceable. Below are incremental improvements that push them from "OK" to "keyword-first and click-optimized".

### 3.1 `/` (Home) — `src/pages/HomePage.tsx:175`

| Field           | Current                                                                                                                                                               | Proposed                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `title`         | `ManaTuner — Mana Calculator + Competitive MTG Reading Library` (69c)                                                                                                 | `MTG Mana Calculator — Exact Probabilities + Ramp                                                                                                                                                           | ManaTuner` (58c) |
| `description`   | `Free mana calculator that counts your dorks & rocks, plus the most complete reading library in competitive Magic — Karsten, PVDDR, Saito, Chapin, Reid Duke.` (159c) | `Free MTG mana base calculator. The only tool that counts rocks and dorks, not just lands. Exact hypergeometric probabilities, Monte Carlo mulligan, Karsten tables.` (162c)                                |
| H1 (on-page)    | Currently a branded hero — verify it explicitly says "MTG mana base calculator" within the first 60 words.                                                            | Rewrite H1: "MTG Mana Calculator — The Only Tool That Counts Your Rocks and Dorks". Subhead: "Exact spell-casting probabilities, Monte Carlo mulligan, and Frank Karsten tables. 100% local, free forever." |
| Primary keyword | "MTG mana calculator"                                                                                                                                                 | "mtg mana calculator" + "mtg mana base" + "manabase calculator"                                                                                                                                             |
| Secondary       | "Frank Karsten"                                                                                                                                                       | +"hypergeometric", "mulligan simulator", "castability"                                                                                                                                                      |
| Long-tail       | implicit                                                                                                                                                              | "how many lands mtg", "mtg mana sources calculator", "magic the gathering manabase optimizer"                                                                                                               |
| Schema          | `WebApplication`                                                                                                                                                      | Keep + add `aggregateRating` once you have 10+ real testimonials + add `screenshot` property pointing to a real dashboard screenshot                                                                        |

### 3.2 `/analyzer` — `src/pages/AnalyzerPage.tsx:211`

| Field         | Current                                                | Proposed                                                                                |
| ------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------- |
| `title`       | `MTG Deck Analyzer - Calculate Mana Base Probabilities | ManaTuner` (63c)                                                                        | `MTG Deck Analyzer — Paste Deck, See Castability | ManaTuner` (58c) |
| `description` | OK                                                     | Add CTA: "Free tool, no signup, results in 3 seconds. Paste MTGO/MTGA/Moxfield format." |
| H1            | check                                                  | Should be "MTG Deck Analyzer — Paste Your Decklist" (explicit primary keyword in H1)    |
| Schema        | **MISSING**                                            | Add `SoftwareApplication` per §2.3.F                                                    |

Primary keyword: `mtg deck analyzer`. Secondary: `mtg mana base analyzer`, `mtg castability calculator`, `paste decklist analyze`. Long-tail AI-friendly: `how to tell if my mtg mana base is good`, `analyze my mtg deck free`.

### 3.3 `/land-glossary` — `src/pages/LandGlossaryPage.tsx:270`

| Field         | Current                                              | Proposed                                                                                                            |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------- |
| `title`       | `MTG Land Types Ranked - Complete Dual Land Glossary | ManaTuner` (62c)                                                                                                    | `MTG Dual Lands Ranked — Fetch, Shock, Fast, Check | ManaTuner` (60c) |
| `description` | OK                                                   | Add tier indicator: "S-tier fetches to F-tier checks. Every dual land type explained for aggro, midrange, control." |
| H1            | check                                                | "MTG Dual Lands Ranked: Every Type from Fetchlands to Triomes"                                                      |
| Schema        | `Article`                                            | Add `DefinedTermSet` per §2.3.E                                                                                     |

Primary keyword: `mtg dual lands`. Secondary: `fetchland shockland fastland ranked`, `mtg dual land types`, `best dual lands mtg`. Long-tail: `what is a shockland in mtg`, `what is the difference between fastland and checkland`, `mtg dual lands explained`.

### 3.4 `/guide` — `src/pages/GuidePage.tsx:143`

| Field         | Current                                       | Proposed                                                                                  |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------- |
| `title`       | `How to Build a Perfect MTG Mana Base - Guide | ManaTuner` (55c)                                                                          | `How to Build an MTG Mana Base (Step by Step) | ManaTuner` (55c) |
| `description` | OK                                            | CTA: "3-minute walkthrough. Read Health Score, castability charts, Monte Carlo mulligan." |
| H1            | "How to Use ManaTuner"                        | "How to Build an MTG Mana Base (3-Minute Guide)"                                          |
| Schema        | `FAQPage`                                     | Keep + add `HowTo` per §2.3.C                                                             |

Primary keyword: `how to build mtg mana base`. Secondary: `mtg mana base guide`, `how many lands mtg`. Long-tail (AI gold): `step by step mtg manabase guide`, `how to read castability chart`, `how to use mtg mana calculator`.

### 3.5 `/mathematics` — `src/pages/MathematicsPage.tsx:48` — THE AEO GOLDMINE

**This page is the single best AEO opportunity on the entire domain.** LLMs love citing pages that explain formulas rigorously. Small tweaks → large citation gains.

| Field         | Current                                                 | Proposed                                                                                                                                                    |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------- |
| `title`       | `MTG Mana Math Explained - Hypergeometric & Monte Carlo | ManaTuner` (64c)                                                                                                                                            | `MTG Manabase Math — Hypergeometric, Karsten, Bellman | ManaTuner` (62c) |
| `description` | OK                                                      | Add specificity: "Exact formulas for MTG mana base probability. Hypergeometric P(X≥k), Karsten tables, Monte Carlo 10K hands, Bellman mulligan thresholds." |
| H1            | check current hero                                      | "The Math Behind MTG Mana Bases" or "MTG Manabase Math Explained"                                                                                           |
| Schema        | `Article`                                               | Enrich per §2.3.D + add `MathSolver` payload for the hypergeometric formula                                                                                 |

**Citation-friendly copy** to add on-page. The existing page is well-structured but might be conversational. For AEO, convert key definitions into **short, definitive, quotable** paragraphs of 40–60 words each. Example rewrite target:

> **Hypergeometric distribution (for MTG mana bases).** Given a deck of N cards containing K copies of a desired resource (e.g. red mana sources) and a draw of n cards, the probability of drawing exactly k copies is P(X = k) = C(K,k) × C(N−K, n−k) / C(N,n). For a 60-card MTG deck with 14 red sources, after drawing 7 cards on turn 1, P(X ≥ 1) ≈ 86.7 %.
>
> **Frank Karsten's 90 % threshold.** In his 2022 ChannelFireball article "How Many Sources Do You Need to Consistently Cast Your Spells?", Frank Karsten established that a 60-card deck needs approximately 14 sources for 1 colored symbol on turn 1, 20 sources for 2 same-color symbols on turn 2, and 23 sources for 3 same-color symbols on turn 3, all at a 90 % confidence threshold including mulligans.
>
> **Bellman equation (optimal mulligan stopping).** The mulligan decision is an optimal-stopping problem: keep a hand if its expected value exceeds the expected value of the next smaller hand. ManaTuner computes this via backward induction over hand sizes 7, 6, 5, 4, using 10,000 Monte Carlo rollouts per archetype.

These three paragraphs alone will get paraphrased into LLM answers. Every time someone asks ChatGPT "how many red sources do I need for Lightning Bolt turn 1", if the page indexes well, the model will cite the Karsten 14-source figure with the "per Frank Karsten 2022" attribution — which is a citation that points to us.

Primary keyword: `mtg manabase math`. Secondary: `hypergeometric mtg`, `frank karsten mana tables`, `mtg mana probability formula`. Long-tail: `how to calculate mtg mana sources`, `hypergeometric distribution magic the gathering`, `mtg mulligan math explained`.

### 3.6 `/library` — `src/pages/ReferenceArticlesPage.tsx:92`

Already has a decent `CollectionPage`. Enrich the `ItemList` by emitting each article as a proper `CreativeWork` in `itemListElement`. This is a P2 since it takes 20 minutes of mapping.

---

## 4. MOTS-CLÉS CIBLES (EN + FR)

**Note on methodology**: volume estimates below are rough orders of magnitude from public keyword tools (Ahrefs/SEMrush/Google Keyword Planner typical ranges). MTG is a niche vertical — real volumes are smaller than generic SaaS but **conversion intent is exceptional** because a searcher who types "mtg mana calculator" has zero commercial intent conflict. We're the answer.

### 4.1 English — Primary

| Keyword                       | Volume/mo (est.) | KD      | Target page    | Intent                                 |
| ----------------------------- | ---------------- | ------- | -------------- | -------------------------------------- |
| mtg mana calculator           | 2,400            | Low     | `/`            | Commercial navigational — direct match |
| magic the gathering manabase  | 880              | Low     | `/`            | Informational → tool                   |
| hypergeometric calculator mtg | 390              | Low     | `/mathematics` | Informational technical                |
| mtg deck analyzer             | 1,600            | Low–Med | `/analyzer`    | Commercial navigational                |
| mtg mana base                 | 1,900            | Low     | `/`            | Informational                          |

### 4.2 English — Secondary

| Keyword                     | Volume/mo (est.) | KD       | Target page      | Intent                                             |
| --------------------------- | ---------------- | -------- | ---------------- | -------------------------------------------------- |
| frank karsten mana tables   | 210              | Very Low | `/mathematics`   | Informational (brand + theory)                     |
| mtg castability probability | 170              | Very Low | `/analyzer`      | Informational technical                            |
| how many lands mtg deck     | 3,600            | Low      | `/guide`         | Informational                                      |
| mtg mulligan simulator      | 480              | Low      | `/analyzer`      | Commercial                                         |
| mtg fetchland ranking       | 320              | Low      | `/land-glossary` | Informational                                      |
| mtg shockland               | 720              | Low      | `/land-glossary` | Informational                                      |
| mtg mana dork calculator    | 110              | Very Low | `/analyzer`      | Commercial (long-tail gold — **zero competition**) |

### 4.3 English — Long-tail, AI-query-friendly (the AEO bread and butter)

These are **question-form queries** that ChatGPT / Perplexity / Gemini users type. They're the ones that produce RAG citations. Our goal: rank for them in Google because the LLM retrievers re-use Google rankings.

| Query                                                   | Volume/mo (est.) | Target page    | AEO value                                 |
| ------------------------------------------------------- | ---------------- | -------------- | ----------------------------------------- |
| how to calculate mana sources needed for mtg spell      | <50              | `/mathematics` | **Very High** — zero competing content    |
| what is mana castability probability                    | <50              | `/mathematics` | High — own the definition                 |
| how many blue sources do i need for counterspell turn 2 | <50              | `/guide`       | **Very High** — direct answer opportunity |
| how many lands should i run in an aggro mtg deck        | 170              | `/guide`       | High                                      |
| what is frank karsten's mana table                      | <50              | `/mathematics` | **Very High** — cite-magnet               |
| how does mulligan work in mtg math                      | <50              | `/mathematics` | High                                      |
| is ManaTuner free                                       | —                | `/`            | Brand query — defensive                   |
| best mtg manabase calculator                            | 90               | `/`            | Comparative — **need testimonials**       |

### 4.4 French — Secondary market (deferred to P2)

| Keyword                  | Volume/mo (est.) | KD             | Target page   | Intent        |
| ------------------------ | ---------------- | -------------- | ------------- | ------------- |
| calcul mana magic        | 90               | Very Low       | `/`           | Informational |
| calculateur manabase mtg | 30               | Very Low       | `/`           | Commercial    |
| combien de terrains mtg  | 170              | Low            | `/guide`      | Informational |
| probabilité mana magic   | <50              | `/mathematics` | Informational |
| sources de mana mtg      | <50              | `/guide`       | Informational |

**FR deferral rationale**: launch priority is `@fireshoes` + MTGO creators (EN-speaking audience per `LAUNCH.md`). FR can be handled via hreflang + a single `/fr/` sub-route duplicating `/` once the EN side has traction.

---

## 5. AI VISIBILITY STRATEGY (ChatGPT, Perplexity, Claude, Gemini, Google SGE)

### 5.1 Prompt tests — baseline visibility check

Run these 10 queries across the major LLMs today (ChatGPT GPT-4o, Claude Opus, Perplexity, Google SGE, Bing Copilot) and log the results. Re-run after each P0/P1/P2 milestone to measure delta.

1. "What's the best MTG manabase calculator?"
2. "How do I calculate if I have enough blue sources for Counterspell?"
3. "Explain Frank Karsten's mana tables."
4. "How many lands should I run in a 60-card Magic the Gathering deck?"
5. "What is the hypergeometric distribution used for in MTG deckbuilding?"
6. "Is there a free MTG deck analyzer that includes mana dorks?"
7. "How do I know when to mulligan in Magic the Gathering?"
8. "What's the difference between a fetchland and a shockland in MTG?"
9. "Recommend me a tool to analyze my MTG deck's mana base."
10. "How does ManaTuner work?" (brand defense check)

**Expected baseline** (before any fixes): Q10 should already return accurate info since llms.txt is public. Q1–Q9 will mostly return "manabase.app" or "mtgoncurve" or a generic explanation. Target after P1 fixes: appear in Q1, Q3, Q5, Q6, Q10 with direct URL citation in Perplexity.

**Log format** (keep in `docs/AI_VISIBILITY_LOG.md` or similar):

```
| Date | Query | LLM | Cited ManaTuner? | Position | URL cited |
```

### 5.2 Signals that drive AI citations

LLMs don't crawl — they re-use Google's index and their own training snapshots. So AI visibility is 80 % "rank well in Google" + 20 % "be specifically citation-friendly". The citation-friendly levers:

1. **Schema.org Article with full E-E-A-T** (author.name, author.url, author.sameAs, datePublished, dateModified, publisher). We have partial — §2.3.D closes the gap.
2. **Quotable definitions**: short (40–60 words), self-contained, with a number in them. "14 sources" > "enough sources". See §3.5 for examples.
3. **External backlinks from authoritative MTG sources**. This is the single biggest lever. Targets:
   - **Reddit r/spikes** — top sub for competitive discussion. One organic mention in a high-upvote thread = 6 months of traffic + LLM training signal. DO NOT post a link with zero karma — LAUNCH.md is explicit about this.
   - **Reddit r/magicTCG** — generalist MTG sub. Mod-friendly if you contribute to threads first.
   - **MTGGoldfish forums / comments** — cite your tool as a source in deck tech comments.
   - **MTGSalvation legacy forums** — less active but archived everywhere.
   - **Discord servers** (Pleasant Kenobi, LegenVD, r/spikes, MagicVille) — per LAUNCH.md P2.
   - **Wikipedia** — **highest-leverage single citation you can get**. Add a reference to ManaTuner on the "Magic: The Gathering deck construction" page or the "Frank Karsten" page (if one exists) as an external link. Wikipedia is in every LLM's training set.
   - **GitHub**: the repo's README is already there. Add a GitHub topic `mtg`, `manabase`, `hypergeometric`.
   - **Dev.to or Hashnode blog post**: "How I built an MTG mana calculator with hypergeometric math". Gets indexed fast, cited by LLMs reading dev blogs.
4. **Brand mentions without links still count** for LLMs. If someone says "ManaTuner is the best free MTG calculator" in a Reddit comment with no URL, that's still a signal.
5. **Date freshness**: `dateModified` in JSON-LD tells Google (and indirectly LLMs) the page is maintained. Bump it on every meaningful change.

### 5.3 Content formats that AI citation engines quote

- **Numbered definitions** with one formula each (see §3.5). LLMs like clean key-value structure.
- **Comparison tables**: "ManaTuner vs. manabase.app vs. mtgoncurve" — make one. Put it on `/` or `/guide`. Include columns: free, open source, counts dorks, counts rocks, Monte Carlo, mulligan solver, privacy. We win on 5/7 columns.
- **FAQ with 10+ questions**. `/guide` has 5. Double it to 10 per §6.2. AI retrievers index FAQ sections separately.
- **Step-by-step HowTo**. §2.3.C adds it.
- **Glossary / `DefinedTermSet`**. `/land-glossary` becomes a dictionary feed. §2.3.E.
- **Boxed formulas**. The Mathematics page already uses these. Keep.

### 5.4 The "citation anchor" trick

LLMs that cite web pages tend to quote the **first short declarative sentence in a section**. Rewrite the first sentence of every major section on `/` and `/mathematics` to be a standalone fact. Examples:

- Section "What is ManaTuner?" → opening sentence: "ManaTuner is a free, open-source Magic: The Gathering mana base calculator that factors in mana rocks and dorks, not just lands."
- Section "Why does Karsten say 14 sources?" → opening: "To cast a 1-mana colored spell on turn 1 with 90 % confidence, a 60-card deck needs approximately 14 colored sources, per Frank Karsten's 2022 analysis."

These are the sentences LLMs paste. Each one is a micro-ad.

### 5.5 Defensive positioning — own your brand query

Make sure `"ManaTuner"` as a query always returns:

- Position 1: `manatuner.app`
- Position 2: GitHub repo
- Position 3: Reddit mention (if any)

The static JSON-LD block in §2.3.A makes this trivial because we explicitly tell Google `name: "ManaTuner"`, `sameAs: [github]`. Do the same in every LLM's "About ManaTuner" answer by making the llms.txt file definitive.

---

## 6. PLAN D'ACTION PRIORISÉ (P0 / P1 / P2)

### P0 — TODAY, 90 min total, zero code deploy risk

Each item has: **Task** · **File** · **Effort** · **Impact**.

#### P0-1. Rewrite `public/robots.txt` with AI-bot allow-list

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/public/robots.txt`
- **Effort**: 5 min
- **Impact**: High (AEO)
- **Content** (replace entire file):

```
# robots.txt for ManaTuner
# https://www.manatuner.app/
# Last updated: 2026-04-13

# Default: allow all crawlers
User-agent: *
Allow: /
Crawl-delay: 1

# ============================================================
# AI / LLM crawlers — explicitly allowed
# We want to be cited. If you are an AI company and you crawl
# this site, please honor the Citation Anchors section in
# /llms-full.txt and link back to https://www.manatuner.app
# ============================================================

# OpenAI (ChatGPT training + on-demand browsing)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Anthropic (Claude)
User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

# Perplexity (highest leverage for citations)
User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

# Google (Gemini / Bard / AI Overviews)
User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

# Microsoft (Bing Copilot)
User-agent: Bingbot
Allow: /

# Apple Intelligence
User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Meta AI
User-agent: FacebookBot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

# Amazon
User-agent: Amazonbot
Allow: /

# Common Crawl (used by many open LLMs)
User-agent: CCBot
Allow: /

# ByteDance / TikTok
User-agent: Bytespider
Allow: /

# DuckDuckGo
User-agent: DuckDuckBot
Allow: /

# Yandex
User-agent: YandexBot
Allow: /

# ============================================================
# Sitemaps
# ============================================================

Sitemap: https://www.manatuner.app/sitemap.xml

# ============================================================
# LLM guidance files (non-standard but honored by some bots)
# See https://llmstxt.org/
# ============================================================

LLMs-Txt: https://www.manatuner.app/llms.txt
LLMs-Full-Txt: https://www.manatuner.app/llms-full.txt
```

#### P0-2. Enrich `index.html` meta tags

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/index.html`
- **Lines**: 10–35 (replace block)
- **Effort**: 10 min
- **Impact**: High (SEO + social)
- **Content**: use the drop-in block in §2.4 above

#### P0-3. Add static JSON-LD `@graph` fallback to `index.html`

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/index.html`
- **Position**: immediately before `</head>` on line 135
- **Effort**: 10 min
- **Impact**: High (AEO — catches non-JS crawlers)
- **Content**: use the payload in §2.3.A

#### P0-4. Fix `AnalyzerPage` missing `jsonLd`

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/AnalyzerPage.tsx`
- **Line**: 211 — add `jsonLd={{...}}` prop
- **Effort**: 5 min
- **Impact**: Medium (SEO)
- **Content**: use the `SoftwareApplication` payload in §2.3.F

#### P0-5. Update sitemap `lastmod` dates

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/public/sitemap.xml`
- **Effort**: 5 min
- **Impact**: Low–Medium (SEO freshness signal)
- **Change**: bump `lastmod` on all 9 URLs to `2026-04-13` (the launch hardening date)

#### P0-6. Patch `public/llms.txt` — add `/library` + `Unique Capabilities` section

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/public/llms.txt`
- **Effort**: 10 min
- **Impact**: High (AEO)
- **Change**: apply the diff in §2.1

#### P0-7. Fix `public/llms-full.txt` section numbering + add date + add `Citation Anchors`

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/public/llms-full.txt`
- **Effort**: 15 min
- **Impact**: High (AEO — citation anchors are the quote bait)
- **Change**: apply the three patches in §2.2

#### P0-8. Add `<meta name="robots" content="noindex,follow">` on `/my-analyses`

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/MyAnalysesPage.tsx`
- **Line**: 609 — add `jsonLd` prop OR inject raw `<Helmet><meta>` block
- **Effort**: 3 min
- **Impact**: Low (housekeeping — the empty-state page shouldn't compete with `/analyzer`)

**P0 total effort**: 63 min. All changes are static file edits, zero runtime risk, zero privacy-posture impact.

---

### P1 — THIS WEEK, ~8 h total

#### P1-1. Extend `SEO.tsx` to emit `BreadcrumbList` automatically

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/src/components/common/SEO.tsx`
- **Effort**: 30 min
- **Impact**: Medium (Google breadcrumb SERP feature)
- **Content**: patch from §2.3.B

#### P1-2. Enrich `/mathematics` JSON-LD with full E-E-A-T

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/MathematicsPage.tsx`
- **Line**: 52 — replace `jsonLd` prop value
- **Effort**: 15 min
- **Impact**: **Very High** (this is the AEO goldmine page)
- **Content**: payload from §2.3.D

#### P1-3. Add `HowTo` schema to `/guide`

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/GuidePage.tsx`
- **Line**: 147 — convert `jsonLd` to `@graph` array with FAQPage + HowTo
- **Effort**: 30 min
- **Impact**: High (HowTo rich results > FAQ rich results in Google SERP)
- **Content**: §2.3.C

#### P1-4. Add `DefinedTermSet` to `/land-glossary`

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/LandGlossaryPage.tsx`
- **Line**: 274 — convert `jsonLd` to `@graph` with Article + DefinedTermSet
- **Effort**: 90 min (one DefinedTerm per land type, ~12 types)
- **Impact**: **High** — glossary pages with DefinedTermSet schema get pulled into Google "dictionary feature" and LLM definitions
- **Content**: §2.3.E

#### P1-5. Rewrite page titles and descriptions per §3

- **Files**: all 6 pages
- **Effort**: 45 min
- **Impact**: Medium (CTR improvement on SERP)

#### P1-6. Generate `apple-touch-icon-180x180.png` + `icon-192x192.png` + `icon-512x512.png`

- **Files**: `/Volumes/DataDisk/_Projects/Project Mana base V2/public/apple-touch-icon.png` (new) + `icon-192x192.png` + `icon-512x512.png` + patch `index.html:38` + patch `public/manifest.json`
- **Effort**: 30 min (use ImageMagick on existing `favicon.svg`: `convert favicon.svg -resize 180x180 apple-touch-icon.png` etc.)
- **Impact**: Medium (iOS / Android PWA install quality; restores removed tag)
- **Restore line 38 comment**: remove the "temporarily removed" note once the file exists.

#### P1-7. Add `vite-plugin-prerender` (or `vite-plugin-ssg`) for static HTML routes

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/vite.config.ts`
- **Effort**: 2 h (install, configure, test, add build flag)
- **Impact**: **High** — unlocks Perplexity, non-JS crawlers, and faster first paint. Every route gets a fully-rendered static HTML file in `dist/`.
- **Privacy check**: no impact — prerendering runs at build time locally.
- **Implementation**: use `vite-plugin-prerender-puppeteer` or `react-snap` (post-build). Gate behind `PRERENDER=1` env var so dev stays fast.

#### P1-8. Expand `/guide` FAQ from 5 to 10 questions

- **File**: `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/GuidePage.tsx`
- **Effort**: 45 min
- **Impact**: Medium (more FAQ entries = more SERP surface + more LLM quote bait)
- **New questions** (all AI-query-friendly):
  - "How many lands should I run in an aggro MTG deck?"
  - "What is the hypergeometric distribution and why does it apply to MTG?"
  - "How many sources do I need for a 2-cost double-colored spell?"
  - "Does ManaTuner work for Commander decks?"
  - "How does ManaTuner handle hybrid mana like {R/G}?"

#### P1-9. Log AI visibility baseline per §5.1

- **File**: create `/Volumes/DataDisk/_Projects/Project Mana base V2/docs/AI_VISIBILITY_LOG.md`
- **Effort**: 30 min
- **Impact**: Measurement infrastructure (enables future optimization)
- **Action**: run the 10 prompts in §5.1 across ChatGPT, Claude, Perplexity, Google SGE, Bing Copilot. Record baseline results.

**P1 total effort**: ~8 h. Split across 2 days.

---

### P2 — THIS MONTH, content + backlinks

#### P2-1. Write one long-form SEO blog post: "How Many Lands Do You Need in MTG? A Math-First Guide (2026)"

- **File**: new `/blog/how-many-lands-mtg` route + `src/pages/BlogHowManyLandsPage.tsx`
- **Effort**: 6–8 h (research, write, format, proofread)
- **Impact**: **Very High** — per `LAUNCH.md` P4. This is the search query that MTG players type every week. Own it.
- **Target**: 2,500 words, includes Karsten tables, interactive "try ManaTuner" CTA, hypergeometric worked example, comparison vs. aggro/mid/control, TL;DR at top with direct numbers.
- **Schema**: `Article` with full E-E-A-T payload per §2.3.D.
- **Keywords**: "how many lands mtg", "how many lands in 60 card deck", "mtg land count aggro midrange control"

#### P2-2. Wikipedia reference insertion

- **Effort**: 1 h (find appropriate article, propose edit, wait for approval)
- **Impact**: Very High — Wikipedia is in every LLM's training corpus
- **Target article**: "Magic: The Gathering deck construction" or "Frank Karsten" external links section
- **Wording**: a neutral, factual reference with citation. Do NOT add promotional language — Wikipedia editors will revert it instantly. Example: "Tools such as ManaTuner[citation] apply Karsten's hypergeometric model to deck analysis." + footnote linking back to `/mathematics`.

#### P2-3. Reddit r/spikes soft launch

- **Effort**: per `LAUNCH.md` P1 — 30 min tweet + 30 min/day engagement for 2 weeks
- **Impact**: High (per LAUNCH.md)
- **Pre-req**: 10 days of organic participation in threads WITHOUT linking to ManaTuner. Build karma first. Then post a helpful reply with a ManaTuner screenshot.

#### P2-4. Dev.to / Hashnode post: "Building an MTG Mana Calculator with React and Hypergeometric Math"

- **Effort**: 4 h
- **Impact**: Medium (developer audience backlink + AI training signal)
- **Cross-post**: Dev.to, Hashnode, Medium. Canonical points to manatuner.app/blog.

#### P2-5. `DefinedTermSet` per-land expansion (P1-4 covers the schema, P2-5 covers the content depth)

- Add `datePublished`, `image`, per-land history, cross-references between land types
- **Effort**: 3 h
- **Impact**: Medium (depth = citations)

#### P2-6. `aggregateRating` schema — requires real testimonials

- **Effort**: 30 min (once you have 10+ testimonials from LAUNCH.md P1/P2)
- **Impact**: Very High (SERP star rating is the single biggest CTR booster)
- **Action**: add `aggregateRating: { ratingValue: 4.x, reviewCount: N }` to the `SoftwareApplication` JSON-LD in `index.html` and `/`. **Only add when you have real reviews** — fake ratings violate Google guidelines and risk manual action.

#### P2-7. `hreflang` FR — add `/fr/` + duplicate `/` with French copy

- **Effort**: 4 h
- **Impact**: Medium (FR market — deferred per LAUNCH.md)
- **Action**: add `<link rel="alternate" hreflang="en" href=".../en/">` + `<link rel="alternate" hreflang="fr" href=".../fr/">` + `<link rel="alternate" hreflang="x-default" ... />` in `SEO.tsx`

#### P2-8. Delete orphan `src/hooks/useAnalysisStorage.ts`

- **Effort**: 5 min
- **Impact**: Zero SEO, but CLAUDE.md line 252 flags it as a cleanup TODO. Include in next commit.

---

## APPENDIX A — Privacy-preserving analytics alternatives (if EVER needed)

**Default stance: don't.** `PrivacySettings.tsx:204` promises "Nothing is sent to any server". Honor it.

If the founder later decides measurement is strategically required, the **only** acceptable implementations are:

1. **Server logs only**. Vercel's built-in access logs give you visit counts without cookies or JS. Already available, already privacy-compliant, no code change.
2. **Plausible Analytics self-hosted with `data-domain`** — cookieless, GDPR/PECR-safe, no PII, no cross-site tracking. Would require updating `connect-src` in `vercel.json:37` and a privacy policy update to `PrivacySettings.tsx:204` BEFORE deploying.
3. **Umami self-hosted** — same properties as Plausible.

**NOT acceptable** (all would break the privacy promise and re-open the 4-step Sentry checklist in CLAUDE.md):

- Google Analytics (any version)
- Facebook Pixel
- Hotjar / FullStory / LogRocket (session recording — worst case)
- Vercel Analytics (the paid version — it's cookieless but beacons data)
- Sentry in production (see CLAUDE.md:71–86)

**Recommendation**: stick with server logs for the first 6 months. You don't need analytics to validate product-market fit — you need tweets from users. When you have 1,000+ users/month and a real content experimentation backlog, revisit this.

---

## APPENDIX B — Validation checklist after deploying P0

After pushing P0 changes to production, run this list in order:

1. **Google Rich Results Test** (`https://search.google.com/test/rich-results`) against `https://www.manatuner.app/` — should now detect `WebSite`, `Organization`, `SoftwareApplication`, `Person`. All green.
2. **Google Rich Results Test** against `/mathematics`, `/guide`, `/land-glossary` — should detect `Article`, `FAQPage`, `Article` + `DefinedTermSet` (after P1).
3. **Schema.org validator** (`https://validator.schema.org/`) — paste each page's URL. Zero errors.
4. **robots.txt validator** (`https://technicalseo.com/tools/robots-txt/`) — test every AI bot user-agent against `/` to confirm `Allowed`.
5. **llms.txt validator**: there's no official one yet, but `curl https://www.manatuner.app/llms.txt | head -5` should return the H1 and blockquote. Check that `/llms-full.txt` is served with `Content-Type: text/plain`.
6. **Facebook / LinkedIn OG debugger** (`https://www.facebook.com/tools/debug/` + `https://www.linkedin.com/post-inspector/`) — paste `/` and `/analyzer`. Preview should show the right OG image and title.
7. **Twitter Card validator** — paste `/`. Should show `summary_large_image` with correct image.
8. **Bing Webmaster Tools** — submit the updated sitemap.xml.
9. **Google Search Console** — submit the updated sitemap.xml. Monitor indexing status over next 48 h.
10. **Lighthouse SEO audit** on `/` — should be 100.

---

## APPENDIX C — Files touched by this strategy

All paths absolute. Grouped by priority.

### P0 (static edits, no rebuild deploy risk beyond the existing Vercel pipeline)

- `/Volumes/DataDisk/_Projects/Project Mana base V2/public/robots.txt` (rewrite)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/public/sitemap.xml` (lastmod bump)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/public/llms.txt` (patch)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/public/llms-full.txt` (patch)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/index.html` (meta tags + static JSON-LD graph)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/AnalyzerPage.tsx` (add `jsonLd` prop)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/MyAnalysesPage.tsx` (noindex)

### P1 (code changes, require unit test run)

- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/components/common/SEO.tsx` (BreadcrumbList)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/MathematicsPage.tsx` (enriched Article)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/GuidePage.tsx` (FAQPage + HowTo @graph, 5→10 questions)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/LandGlossaryPage.tsx` (DefinedTermSet @graph)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/HomePage.tsx` (title/description refresh)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/public/manifest.json` (icons + categories + screenshots)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/public/apple-touch-icon.png` (new, 180×180)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/public/icon-192x192.png` (new)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/public/icon-512x512.png` (new)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/vite.config.ts` (prerender plugin, optional)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/docs/AI_VISIBILITY_LOG.md` (new, baseline)

### P2 (content + marketing)

- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/pages/BlogHowManyLandsPage.tsx` (new)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/App.tsx` (add `/blog/*` route)
- `/Volumes/DataDisk/_Projects/Project Mana base V2/src/hooks/useAnalysisStorage.ts` (DELETE — cleanup TODO from CLAUDE.md:252)
- Wikipedia edit (off-repo)
- Reddit soft launch (off-repo)
- Dev.to cross-post (off-repo)

---

## Final note — on procrastination

`LAUNCH.md` opens with: "Ce fichier existe pour une seule raison : tu as un produit fini qui n'a pas d'utilisateurs."

This SEO strategy is **not** a substitute for tweeting `@fireshoes`. SEO payoff is 2–3 months out minimum. The P0 items (90 min) should be done today because they're tiny and they make the product look legitimate when someone _does_ click through from a tweet. The P1 items should be done this week. P2 items are content work that pays off over months.

**Do not use this document as a reason to postpone the `@fireshoes` tweet from `LAUNCH.md` P1.** The tweet brings 500 visitors in 24 hours. SEO brings 500 visitors in 90 days. Do both. Tweet first.
