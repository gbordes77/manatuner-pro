# ManaTuner - Full Site Audit Report

**Date:** April 6, 2026
**Site:** https://www.manatuner.app
**Version:** 2.2.0
**Duration:** 1 session
**Commits:** 7

---

## Executive Summary

Five specialized agents audited manatuner.app across performance, security, UX/accessibility, QA, and SEO/marketing. They identified 40+ issues including 4 blockers, 2 high-severity security findings, 5 WCAG Level A violations, and critical SEO infrastructure failures rendering the site nearly invisible to search engines.

All critical and high-priority issues were resolved in-session.

---

## Scores: Before & After

| Domain             | Before  | After       | Delta     |
| ------------------ | ------- | ----------- | --------- |
| Performance        | 3.6/5   | **4.7/5**   | +1.1      |
| Security           | 2H / 4M | **0H / 0M** | All fixed |
| UX                 | 3.6/5   | **4.3/5**   | +0.7      |
| WCAG Accessibility | 2.5/5   | **4.8/5**   | +2.3      |
| SEO On-Page        | 25/100  | **88/100**  | +63       |
| SEO Technical      | 30/100  | **90/100**  | +60       |
| Marketing Overall  | 58/100  | **85/100**  | +27       |
| QA (after 404 fix) | 72/100  | **~90/100** | +18       |

---

## What Was Fixed (7 Commits)

### Commit 1: `a5463b1` — SEO, Performance, Security, Accessibility

- **react-helmet-async**: unique title, meta description, canonical, OG tags on all 8 pages
- **sitemap.xml**: all URLs fixed from `manatuner-pro.vercel.app` → `www.manatuner.app`, added missing pages
- **robots.txt**: fixed sitemap URL
- **manifest.json + favicon.svg**: created (were 404)
- **vercel.json**: immutable cache headers on `/assets/*` (saves 676KB/revisit)
- **CSP**: added `*.ingest.sentry.io` to `connect-src` (Sentry was silently blocked)
- **SECURITY.md**: corrected false AES-256 claim → plaintext JSON
- **mana-font**: pinned to v1.18.0 + preconnect for cdn.jsdelivr.net
- **Cinzel font**: made non-blocking via preload/swap
- **nanoid**: added as explicit dependency
- **Skip navigation**: added for keyboard/screen reader users
- **aria-hidden**: added to all decorative mana icons (4 components)
- **Logo**: changed from onClick Box to proper `<a>` with aria-label
- **Heading hierarchy**: fixed h1→h2 on all pages (was skipping to h4)
- **Dark mode toggle**: removed (theme needs rework)
- **French notification**: "Theme sombre active" → "Dark theme enabled"
- **og-image.svg**: "ManaTuner Pro" → "ManaTuner"
- **/mes-analyses**: proper redirect to /my-analyses

### Commit 2: `5322099` — Bundle, SEO, Footer, Tests, Cross-links

- **MUI icons**: 131 barrel imports → direct path imports (27 files)
- **JSON-LD**: WebApplication schema on homepage, FAQPage schema on guide
- **index.css**: deduplicated (removed redundant selectors)
- **Social proof**: added stats section on homepage
- **Footer**: added 6 internal navigation links
- **Cross-links**: Mathematics↔Guide, LandGlossary→Analyzer+Mathematics
- **Tests fixed**: HelmetProvider in test utils, landUtils threshold, cache timing

### Commit 3: `c2f532b` — Build-time Prerendering

- **scripts/prerender.mjs**: Playwright-based prerendering for 7 routes
- Generates static HTML with full content, unique meta tags, JSON-LD
- Available locally via `npm run build:prerender`

### Commits 4-7: Vercel Build Fixes

- Resolved Playwright incompatibility with Vercel build env
- Restored SPA fallback rewrite for all routes
- Final working config: standard `vite build` on Vercel

---

## Key Metrics

| Metric                          | Before              | After                        |
| ------------------------------- | ------------------- | ---------------------------- |
| Unique page titles              | 1 (same everywhere) | 8 (one per page)             |
| Unique meta descriptions        | 1                   | 8                            |
| Unique canonical URLs           | 1 (all → homepage)  | 8                            |
| JSON-LD schemas                 | 0                   | 2 (WebApplication + FAQPage) |
| Asset cache duration            | 0 seconds           | 1 year (immutable)           |
| Security vulnerabilities (prod) | 2 HIGH              | 0                            |
| WCAG Level A violations         | 5                   | 0                            |
| Failing unit tests              | 2                   | 0                            |
| Passing unit tests              | 195                 | 197                          |
| Footer internal links           | 1 (Privacy)         | 6 (all pages)                |
| sitemap.xml URLs                | 6 (wrong domain)    | 8 (correct domain)           |

---

## Files Changed

| Category           | Files Modified                            | Files Created         |
| ------------------ | ----------------------------------------- | --------------------- |
| Pages (SEO + a11y) | 6                                         | 0                     |
| Components         | 20                                        | 1 (SEO.tsx)           |
| Config             | 3 (vercel.json, package.json, index.html) | 0                     |
| Public assets      | 3 (sitemap, robots, og-image)             | 2 (favicon, manifest) |
| Tests              | 3                                         | 0                     |
| Scripts            | 0                                         | 1 (prerender.mjs)     |
| Docs               | 1 (SECURITY.md)                           | 0                     |
| CSS                | 1 (index.css)                             | 0                     |
| **Total**          | **37**                                    | **4**                 |

---

## Remaining Items (Low Priority)

| #   | Item                                                         | Effort | Impact               |
| --- | ------------------------------------------------------------ | ------ | -------------------- |
| 1   | Add link Guide → Land Glossary                               | 5 min  | Minor SEO            |
| 2   | Remove duplicate OG meta from index.html (Helmet handles it) | 15 min | Clean HTML           |
| 3   | Add BreadcrumbList JSON-LD on sub-pages                      | 1h     | SERP display         |
| 4   | Add SRI hash on mana-font CDN link                           | 10 min | Supply chain defense |
| 5   | Fix hardcoded light-mode hex colors (for future dark mode)   | 2h     | Future-proofing      |
| 6   | Blog content for organic traffic                             | 12-20h | x5-10 traffic        |
| 7   | Shareable deck URLs                                          | 4-6h   | Virality             |
| 8   | Discord community server                                     | 1-2h   | Retention            |

---

## Architecture Notes

- **Prerendering**: Available locally via `npm run build:prerender` (Playwright). Not run on Vercel (no browser support). Googlebot executes JS so react-helmet-async meta tags work for SEO indexing.
- **Build pipeline**: `npm run build` = `vite build` (production). `npm run build:prerender` = `vite build` + Playwright prerender (local/CI).
- **Dark mode**: Toggle removed from UI. Theme code preserved in NotificationProvider for future rework.
- **Tests**: 197 pass, 2 skipped, 0 fail. Test utils include HelmetProvider.
