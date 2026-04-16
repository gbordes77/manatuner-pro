# ManaTuner Performance Audit Report

**Date:** 2026-04-06
**Auditor:** Performance Engineer (Claude Opus)
**Target:** https://www.manatuner.app/ (v2.2.0)
**Stack:** React 18 + TypeScript + Vite 7 + MUI 5 + Redux Toolkit + Recharts
**Hosting:** Vercel (CDN edge, CDG1 region observed)

---

## Executive Summary

ManaTuner demonstrates **strong foundational performance engineering** with code splitting, lazy loading, Web Workers for heavy computation, and manual chunk configuration. However, there are several significant optimization opportunities, particularly around **cache headers, the MUI vendor bundle size, CSS bloat, render-blocking fonts, and missing image optimization**. The critical rendering path loads approximately **209 KB gzipped** before first meaningful paint, which is acceptable but improvable.

**Overall Score: 3.6 / 5.0** -- Good foundation, several high-impact optimizations available.

---

## 1. Page Weight and Assets

**Score: 3 / 5**

### Bundle Size Breakdown (gzipped)

| Category                   | File                        | Raw          | Gzipped    |
| -------------------------- | --------------------------- | ------------ | ---------- |
| **Critical Path**          |                             |              |            |
| App entry                  | index-FBa3Xr_J.js           | 80 KB        | 24 KB      |
| MUI vendor                 | vendor-mui-C61bE5bU.js      | 521 KB       | 161 KB     |
| React vendor               | vendor-react-383rF5iP.js    | 20 KB        | 7.5 KB     |
| Redux vendor               | vendor-redux-CgOFSSuI.js    | 32 KB        | 11.5 KB    |
| CSS                        | index-DgLYZKF0.css          | 16 KB        | 4.3 KB     |
| **Critical Total**         |                             | **670 KB**   | **209 KB** |
| **Lazy Chunks**            |                             |              |            |
| AnalyzerPage               | AnalyzerPage-CPh0aKIM.js    | 99 KB        | 25.6 KB    |
| Onboarding (react-joyride) | Onboarding-CHcCsz20.js      | 100 KB       | 31.3 KB    |
| Castability                | CastabilityTab-HLwFSYSo.js  | 51 KB        | 13.4 KB    |
| MulliganTab                | MulliganTab-D_1Mmzfm.js     | 29 KB        | 10 KB      |
| Privacy util               | privacy-D8P8SWfB.js         | 58 KB        | 13.4 KB    |
| jsPDF (export)             | jspdf.es.min-CjZNtdGu.js    | 386 KB       | 125 KB     |
| html2canvas (export)       | html2canvas.esm-DcJhN69B.js | 201 KB       | 47 KB      |
| Recharts vendor            | vendor-charts-DnXCNo5K.js   | 432 KB       | 114 KB     |
| **All JS Total**           |                             | **2,322 KB** | **676 KB** |
| **CSS Total**              |                             | **16.6 KB**  | **4.3 KB** |

### Findings

- **CRITICAL:** The MUI vendor chunk is 161 KB gzipped (521 KB raw) -- the single largest bundle. This includes `@mui/material` AND `@mui/icons-material` together. The icons package alone contributes significantly because all icons are bundled even when only ~20 are used.
- **GOOD:** Export-only dependencies (jsPDF: 125 KB gzip, html2canvas: 47 KB gzip) are lazy-loaded only when the Blueprint tab is selected. Smart decision.
- **CONCERN:** Recharts at 114 KB gzipped is loaded lazily but is still very large. Consider lighter alternatives for the specific chart types used.
- **CONCERN:** Onboarding (react-joyride) at 31 KB gzipped loads on every AnalyzerPage visit even if the user has already completed onboarding.
- **CONCERN:** The `privacy-D8P8SWfB.js` chunk at 13.4 KB gzip seems disproportionately large for a privacy utility. Investigate what is bundled there (possibly includes `index.es-DxDtF6jN.js` at 52.6 KB gzip as a shared dependency).
- **GOOD:** OG images: v2 JPEG is 121 KB (reasonable), but `og-image.png` at 965 KB is unnecessarily large and should be removed or converted.

### Recommendations

1. **P0** -- Replace barrel import of `@mui/icons-material` with direct path imports (e.g., `@mui/icons-material/Analytics` instead of `import { Analytics } from '@mui/icons-material'`). Expected savings: 50-80 KB gzipped.
2. **P1** -- Consider `@mui/material` tree-shaking improvements or migration to MUI v6 which has better ESM tree-shaking.
3. **P1** -- Delete `og-image.png` (965 KB) from `public/` -- only `og-image-v2.jpg` (124 KB) is referenced in meta tags.
4. **P2** -- Gate onboarding lazy import behind a localStorage check so it never loads for returning users.
5. **P2** -- Evaluate replacing Recharts (114 KB gzip) with a lighter library like `chart.js` or `lightweight-charts` for the specific chart types used.

---

## 2. Core Web Vitals Indicators

**Score: 3.5 / 5**

### Largest Contentful Paint (LCP)

- **Positive:** Inline critical CSS in `index.html` provides immediate loading state feedback.
- **Positive:** HomePage is eagerly imported (not lazy-loaded), avoiding a double load.
- **CONCERN:** Three render-blocking external stylesheet requests fire before any content appears:
  1. `fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap`
  2. `cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css`
  3. `fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap`
- These external CSS files are render-blocking by default and add sequential network roundtrips to three different origins.
- **CONCERN:** The MUI vendor chunk (161 KB gzip) must be downloaded, parsed, and executed before any React component can render.

### Interaction to Next Paint (INP)

- **POSITIVE:** Heavy computation (Monte Carlo simulations, hypergeometric calculations) is offloaded to Web Workers (`public/workers/monteCarlo.worker.js`, `public/workers/manaCalculator.worker.js`). This is excellent practice.
- **POSITIVE:** `React.memo`, `useMemo`, and `useCallback` are used extensively (106 occurrences across 20 files).
- **POSITIVE:** `react-window` is used for virtualized lists (VirtualizedTurnAnalysis).
- **POSITIVE:** Debounced inputs for expensive calculations.
- **CONCERN:** `PersistGate` from redux-persist blocks all rendering until localStorage is deserialized. If the analyzer state is large, this could add perceptible delay.

### Cumulative Layout Shift (CLS)

- **POSITIVE:** Proper loading state with `<Suspense fallback={<PageLoader />}>` prevents jarring content shifts.
- **POSITIVE:** Skeleton loaders (`AnalyzerSkeleton`) reserve space during tab loading.
- **CONCERN:** External fonts (Roboto, Cinzel, Mana Font) load asynchronously. When they arrive after initial paint, text reflow causes CLS. The `display=swap` mitigates FOIT but causes FOUT (flash of unstyled text).
- **CONCERN:** No `width`/`height` attributes on card images loaded via `CardImageTooltip`. While these are in tooltips (so less impactful), it is still a gap.

### Recommendations

1. **P0** -- Add `media="print" onload="this.media='all'"` to the Cinzel font stylesheet (display font, not critical for initial render), or load it via `@font-face` with a local fallback.
2. **P0** -- Pin `mana-font` to a specific version instead of `@latest` to benefit from CDN edge caching (currently `@latest` forces version resolution on every visit).
3. **P1** -- Add `<link rel="preload">` for the most critical font files (Roboto 400 and 500 weights).
4. **P2** -- Consider self-hosting Roboto and Cinzel to eliminate third-party DNS lookups and connection setups.

---

## 3. Bundle Optimization

**Score: 4 / 5**

### Code Splitting

- **EXCELLENT:** Route-level code splitting with `React.lazy()` for all pages except HomePage (7 lazy routes).
- **EXCELLENT:** Tab-level code splitting within AnalyzerPage -- each analysis tab (Dashboard, Castability, Mulligan, Analysis, Manabase, Blueprint) is lazy-loaded.
- **EXCELLENT:** Onboarding (react-joyride) is lazy-loaded separately.
- **GOOD:** Manual chunk splitting in Vite config separates vendor-react, vendor-mui, vendor-charts, and vendor-redux.

### Tree Shaking

- **GOOD:** Vite with esbuild minification is active. `sourcemap: false` reduces build overhead.
- **GOOD:** `esbuild.drop: ['console', 'debugger']` strips debug statements from production.
- **CONCERN:** `@mui/icons-material` barrel imports prevent effective tree-shaking. This is the most impactful tree-shaking issue in the entire application.
- **CONCERN:** `@tanstack/react-query-devtools` is in `dependencies` (not `devDependencies`). While the code conditionally loads it (`isDevelopment && <ReactQueryDevtools />`), it may still be included in the production bundle depending on tree-shaking effectiveness.

### Minification

- **GOOD:** esbuild minification is fast and effective.
- The build target `es2015` is conservative. Modern browsers support `es2020` or higher, which could produce slightly smaller output with newer syntax.

### Recommendations

1. **P0** -- Convert MUI icon imports to direct path imports. This is the single highest ROI change.
2. **P1** -- Move `@tanstack/react-query-devtools` to `devDependencies`.
3. **P2** -- Upgrade build target from `es2015` to `es2020` for smaller output.
4. **P2** -- Consider splitting the MUI vendor chunk further: separate `@mui/material` from `@emotion/react`/`@emotion/styled`.

---

## 4. Caching Strategy

**Score: 2 / 5** (Major improvement needed)

### Current State

**This is the weakest area of the audit.**

#### HTML Document

```
cache-control: public, max-age=0, must-revalidate
etag: "0746641cf47839b31a92d4527a5af133"
```

This is correct. HTML should always be revalidated.

#### JavaScript/CSS Assets (hashed filenames)

```
cache-control: public, max-age=0, must-revalidate
```

**CRITICAL ISSUE:** Hashed assets (e.g., `vendor-mui-C61bE5bU.js`) have `max-age=0`. These files have content hashes in their filenames, meaning their URL changes whenever the content changes. They should be cached aggressively:

```
cache-control: public, max-age=31536000, immutable
```

This means **every single visitor re-downloads 676 KB of JavaScript on every page load** instead of serving it from browser cache. This is the single most impactful performance issue on the site.

#### Service Worker

```
Cache-Control: no-cache, no-store, must-revalidate
```

Correct -- the SW killer should never be cached.

#### External Resources

- `cdn.jsdelivr.net` (mana-font): `max-age=604800` (7 days) -- Good CDN caching.
- Google Fonts: Typically cached well by the browser.

### Vercel Configuration Gap

The `vercel.json` defines security headers for all routes (`/(.*)`) but does not set cache headers for hashed assets. Vercel's default for static assets is `max-age=0, must-revalidate`, which is safe but suboptimal for hashed filenames.

### Recommendations

1. **P0 (CRITICAL)** -- Add immutable caching for hashed assets in `vercel.json`:

   ```json
   {
     "source": "/assets/(.*)",
     "headers": [
       {
         "key": "Cache-Control",
         "value": "public, max-age=31536000, immutable"
       }
     ]
   }
   ```

   **Expected impact:** Eliminates ~676 KB of redundant downloads for returning visitors. This single change will have the largest impact on repeat visit performance.

2. **P1** -- Add cache headers for static files (images, workers):

   ```json
   {
     "source": "/workers/(.*)",
     "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400" }]
   }
   ```

3. **P2** -- Consider implementing `stale-while-revalidate` for the HTML document to improve perceived performance on repeat visits.

---

## 5. Network Optimization

**Score: 3.5 / 5**

### Compression

- **CONCERN:** The live server response for JS files shows `content-length: 521675` (raw size). The response headers do NOT include a `content-encoding` header, suggesting **Brotli/gzip compression may not be active**, or it is transparent. Vercel typically handles this automatically via its edge, but this should be verified with a browser request that includes `Accept-Encoding: br, gzip`.
- Vercel's edge CDN should serve Brotli to supporting browsers. The `x-vercel-cache: HIT` header confirms edge caching is working.

### Resource Hints

- **GOOD:** `<link rel="preconnect" href="https://fonts.googleapis.com">` present.
- **GOOD:** `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` present.
- **GOOD:** `<link rel="dns-prefetch" href="https://api.scryfall.com">` for the card API.
- **MISSING:** No `preconnect` for `cdn.jsdelivr.net` (mana-font CDN) -- this is a render-blocking resource.
- **GOOD:** Vite auto-generates `<link rel="modulepreload">` for vendor chunks in the built HTML.
- **CONCERN:** No `<link rel="prefetch">` for the AnalyzerPage chunk, despite it being the primary user journey.

### Font Loading Strategy

- 3 external font requests on initial load (2 Google Fonts, 1 jsDelivr).
- Using `display=swap` for Google Fonts (good FOIT prevention, causes FOUT).
- `mana-font@latest` uses an unpinned version, forcing version resolution on each cold load.
- **EXCELLENT:** Header component includes `prefetchAnalyzer()` on hover of the Analyzer nav button. This is a smart predictive prefetch.

### Recommendations

1. **P0** -- Add `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` before the mana-font stylesheet.
2. **P1** -- Add `<link rel="prefetch">` for the AnalyzerPage chunk since it is the primary CTA target.
3. **P1** -- Pin mana-font version: `https://cdn.jsdelivr.net/npm/mana-font@1.18.0/css/mana.css` instead of `@latest`.
4. **P2** -- Verify Brotli compression is active by testing with `curl -H "Accept-Encoding: br" -sI`.

---

## 6. Mobile Performance

**Score: 4 / 5**

### Viewport and Responsive Design

- **EXCELLENT:** Proper viewport meta: `width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes`.
- **EXCELLENT:** `user-scalable=yes` respects accessibility (allows pinch-to-zoom).
- **EXCELLENT:** MUI's `useMediaQuery` is used throughout for responsive breakpoints.
- **EXCELLENT:** Multiple breakpoint-aware layouts: `isMobile`, `isSmallMobile` (375px).

### Touch Targets

- **GOOD:** CSS sets `min-height: 44px; min-width: 44px` for buttons on mobile (index.css, line 379-382).
- **GOOD:** Input font-size set to 16px on mobile to prevent iOS zoom (ux-improvements.css, line 82).
- **GOOD:** `allowScrollButtonsMobile` on Tabs component.

### Responsive Images

- **CONCERN:** No responsive images (`srcset`) used anywhere in the codebase. Only one `<img>` tag exists (CardImageTooltip) and it fetches full-size card images from Scryfall regardless of screen size.
- **POSITIVE:** The app is primarily text/data-driven with minimal image usage, so the impact is limited.

### Mobile-Specific Optimizations

- **GOOD:** Auto-minimize deck input on mobile after analysis (`if (isMobile) dispatch(setIsDeckMinimized(true))`).
- **GOOD:** Scrollable tabs with `variant="scrollable"` on mobile.
- **GOOD:** Reduced padding and spacing on small screens.
- **GOOD:** `overflow-x: hidden` prevents horizontal scroll on mobile.

### Recommendations

1. **P2** -- Consider using Scryfall's `small` image variant for mobile tooltips (if API supports it).
2. **P3** -- Add `width` and `height` attributes to the card image tooltip to prevent layout shift.

---

## 7. Third-Party Scripts

**Score: 4 / 5**

### External Dependencies (Runtime)

| Resource     | Origin                                   | Impact                  | Loading                 |
| ------------ | ---------------------------------------- | ----------------------- | ----------------------- |
| Roboto font  | fonts.googleapis.com + fonts.gstatic.com | Render-blocking CSS     | `display=swap`          |
| Cinzel font  | fonts.googleapis.com + fonts.gstatic.com | Render-blocking CSS     | `display=swap`          |
| Mana Font    | cdn.jsdelivr.net                         | Render-blocking CSS     | Synchronous             |
| Sentry       | @sentry/react (bundled)                  | ~13 KB gzip (estimated) | Conditional (prod only) |
| Scryfall API | api.scryfall.com                         | Runtime data fetch      | On-demand (hover)       |

### Analysis

- **GOOD:** Only 3 external origins for fonts. No analytics, advertising, or social media scripts.
- **GOOD:** Sentry is bundled (not loaded from CDN) and initialized conditionally only in production with a DSN environment variable.
- **GOOD:** Sentry's `tracesSampleRate: 0.1` (10%) is conservative, minimizing overhead.
- **CONCERN:** Three render-blocking font stylesheets from two external origins.
- **GOOD:** No Google Analytics, no Meta Pixel, no Hotjar, or similar tracking scripts. The app is genuinely privacy-first.

### Recommendations

1. **P1** -- Consider making Cinzel font non-blocking (it is a decorative display font used only for headings and could load asynchronously).
2. **P2** -- Self-host all fonts to eliminate 2 external origins from the critical path (Google Fonts + jsDelivr).

---

## 8. CSS Analysis (Bonus Category)

**Score: 2.5 / 5**

### Findings

The `index.css` file is 1,111 lines with significant issues:

- **CRITICAL:** Massive CSS duplication. The file contains:
  - **3 duplicate** `@keyframes pulse` definitions (lines 196, 826, 926)
  - **3 duplicate** `@keyframes fadeIn` definitions (lines 137, 833)
  - **3 duplicate** `@keyframes slideIn` definitions (lines 159, 838)
  - **2 duplicate** `@keyframes shimmer` definitions (lines 737, 1043)
  - **2 duplicate** `.mtg-button` style blocks (lines 640-670, 964-998)
  - **2 duplicate** `.mtg-card:hover` declarations (lines 577-581, 1001-1004)
  - **2 duplicate** scrollbar style blocks
  - **2 duplicate** focus-visible blocks
  - **2 duplicate** print style blocks
  - **3 duplicate** `@media (prefers-reduced-motion)` blocks
  - **3 duplicate** `@media (prefers-contrast: high)` blocks
  - **2 duplicate** `.sr-only` declarations
- This file appears to have been composed by concatenating multiple CSS files without deduplication. Roughly **40-50% of the CSS is duplicate**.
- CSS custom properties (`:root` variables) are defined but rarely used -- most styles use hardcoded values.
- Three CSS files are imported in `main.tsx`: `index.css`, `contrast-fixes.css`, and `ux-improvements.css`. Combined they are still relatively small (16.6 KB raw, 4.3 KB gzip), but the duplication indicates technical debt.

### Recommendations

1. **P1** -- Deduplicate `index.css`. Remove all duplicate keyframes, media queries, and style blocks. Expected reduction: ~40% of the file.
2. **P2** -- Consolidate the three CSS files into one, or use CSS modules for component-scoped styles.
3. **P3** -- Leverage the existing CSS custom properties consistently instead of hardcoded values.

---

## 9. Application Architecture Performance

**Score: 4.5 / 5**

### Excellent Patterns Found

1. **Web Workers for computation** -- Monte Carlo simulations and hypergeometric calculations run in dedicated Web Workers, keeping the UI thread free.
2. **Route-level code splitting** -- All non-landing pages use `React.lazy()`.
3. **Tab-level code splitting** -- The Analyzer's 6 tabs each lazy-load independently.
4. **Predictive prefetch** -- The Header prefetches the AnalyzerPage chunk on hover of the Analyzer navigation button.
5. **Virtualized lists** -- `react-window` (`FixedSizeList`) for turn analysis data.
6. **Lazy chart loading** -- `OptimizedComponents.tsx` dynamically imports Recharts components.
7. **Debounced input** -- Expensive calculations use debounced input with configurable delay.
8. **Performance monitoring** -- Development-only slow render detection (`PerformanceMonitor` component).
9. **Memoization** -- Extensive use of `React.memo`, `useMemo`, `useCallback` (106 occurrences across 20 files).
10. **Conditional DevTools** -- React Query DevTools only loaded in development.

### Minor Concerns

- `PersistGate` blocks the entire render tree until localStorage is hydrated. For large stored decks, this could be perceivable.
- The `PerformanceMonitor` component uses `useEffect` without a dependency array, causing it to measure on every render -- this is intentional but adds a small overhead in development.

---

## Priority Summary

### P0 -- Critical (Do Immediately)

| #   | Issue                                                      | Impact                                                       | Effort |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------ | ------ |
| 1   | Add immutable cache headers for `/assets/*` in vercel.json | Eliminates 676 KB redundant downloads for returning visitors | 5 min  |
| 2   | Convert MUI icon imports to direct path imports            | Reduces MUI bundle by 50-80 KB gzip                          | 30 min |
| 3   | Add preconnect for cdn.jsdelivr.net                        | Saves 100-300ms on mana-font load                            | 1 min  |
| 4   | Pin mana-font version instead of @latest                   | Enables CDN long-term caching                                | 1 min  |

### P1 -- High Priority

| #   | Issue                                              | Impact                                               | Effort |
| --- | -------------------------------------------------- | ---------------------------------------------------- | ------ |
| 5   | Make Cinzel font non-blocking                      | Reduces render-blocking resources by 1               | 10 min |
| 6   | Prefetch AnalyzerPage chunk                        | Faster navigation to primary feature                 | 2 min  |
| 7   | Deduplicate index.css                              | Reduces CSS technical debt, ~40% file size reduction | 1 hour |
| 8   | Move react-query-devtools to devDependencies       | Ensures no production bundle leak                    | 1 min  |
| 9   | Delete og-image.png (965 KB unused)                | Reduces deploy size                                  | 1 min  |
| 10  | Add preload hints for critical Roboto font weights | Faster font availability                             | 5 min  |

### P2 -- Medium Priority

| #   | Issue                                            | Impact                                      | Effort  |
| --- | ------------------------------------------------ | ------------------------------------------- | ------- |
| 11  | Gate Onboarding import behind localStorage check | Saves 31 KB gzip for returning users        | 15 min  |
| 12  | Self-host fonts (eliminate 2 external origins)   | Reduces DNS lookups, better caching control | 2 hours |
| 13  | Upgrade build target to es2020                   | Slightly smaller bundles                    | 5 min   |
| 14  | Add stale-while-revalidate for HTML              | Faster repeat visits                        | 5 min   |
| 15  | Verify Brotli compression is active              | 15-20% better compression vs gzip           | 10 min  |

### P3 -- Low Priority / Long Term

| #   | Issue                                   | Impact                           | Effort  |
| --- | --------------------------------------- | -------------------------------- | ------- |
| 16  | Evaluate lighter charting library       | Reduce 114 KB gzip vendor-charts | 8 hours |
| 17  | Add width/height to card image tooltips | Marginal CLS improvement         | 5 min   |
| 18  | Consolidate CSS architecture            | Better maintainability           | 4 hours |

---

## Category Scorecard

| Category                      | Score       | Grade                    |
| ----------------------------- | ----------- | ------------------------ |
| 1. Page Weight & Assets       | 3.0 / 5     | Needs Work               |
| 2. Core Web Vitals Indicators | 3.5 / 5     | Acceptable               |
| 3. Bundle Optimization        | 4.0 / 5     | Good                     |
| 4. Caching Strategy           | 2.0 / 5     | Poor                     |
| 5. Network Optimization       | 3.5 / 5     | Acceptable               |
| 6. Mobile Performance         | 4.0 / 5     | Good                     |
| 7. Third-Party Scripts        | 4.0 / 5     | Good                     |
| 8. CSS Quality                | 2.5 / 5     | Needs Work               |
| 9. Application Architecture   | 4.5 / 5     | Excellent                |
| **Overall**                   | **3.6 / 5** | **Good (with key gaps)** |

---

## Quick Wins (under 15 minutes total)

If you implement only the quick wins below, you will address the two largest performance issues:

1. **Add asset cache headers to vercel.json** -- 5 minutes, massive repeat-visit improvement
2. **Add preconnect for jsdelivr** -- 1 minute
3. **Pin mana-font version** -- 1 minute
4. **Delete og-image.png** -- 1 minute
5. **Move react-query-devtools to devDependencies** -- 1 minute
6. **Add prefetch for AnalyzerPage** -- 2 minutes

Total time: ~11 minutes. Expected impact: significantly improved Lighthouse scores for repeat visitors and faster first-load font rendering.
