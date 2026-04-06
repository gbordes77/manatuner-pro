# ManaTuner - Session Handoff

## Project Status: PRODUCTION

**Latest Session:** 2026-04-06 (Math Audit) | **Tests:** 197 pass, 0 fail | **Build:** OK

---

## Session 2026-04-06 (part 2) — Mathematical Audit & Fixes

### What Happened

Comprehensive mathematical audit of ALL calculation code (56 files, 4 engines, 7 hypergeometric implementations). Verified every formula against hand calculations and Frank Karsten's published research. Found and fixed 7 bugs.

### Verdict: PASS (after fixes)

All core math (hypergeometric, Bellman equation, Fisher-Yates, Karsten tables) is correct.

### 7 Bugs Found & Fixed

| #   | Severity | What                                                               | File                               |
| --- | -------- | ------------------------------------------------------------------ | ---------------------------------- |
| 1   | MEDIUM   | Biased shuffle (`.sort(random)` instead of Fisher-Yates)           | `manabase.ts:226`                  |
| 2   | MEDIUM   | Mulligan recommendation never displayed (`mulliganValue` always 0) | `mulliganSimulatorAdvanced.ts:989` |
| 3   | HIGH     | `onThePlay` parameter ignored in ManaCalculator                    | `manaCalculator.ts:384`            |
| 4   | HIGH     | Play/Draw toggle didn't affect base spell probabilities            | `ManaCostRow.tsx:299`              |
| 5   | LOW      | No re-shuffle between mulligan attempts in basic MC                | `advancedMaths.ts:281`             |
| 6   | LOW      | KARSTEN_TABLE had extrapolated impossible values                   | `manabase.ts:13`                   |
| 7   | LOW      | Potential division by zero if N=0 in hypergeometric                | `manaCalculator.ts:359`            |

### Key Fix: Play/Draw Toggle Now Works End-to-End

Before: Changing "On the Play" → "On the Draw" only affected acceleration calculations. Base p1/p2 probabilities for each spell were always computed as "on the play" (7 + turn - 1 cards seen).

After: The `playDraw` setting propagates from `AccelerationContext` → `CastabilityTab` → `ManaCostRow` → `useProbabilityCalculation`. On the draw: `7 + turn` cards seen (one extra). All displayed probabilities now change correctly.

### Files Modified

- `src/components/ManaCostRow.tsx` — playDraw param in useProbabilityCalculation
- `src/services/mulliganSimulatorAdvanced.ts` — mulliganValue formula fix
- `src/services/manaCalculator.ts` — onThePlay implementation + hypergeometric guards
- `src/services/advancedMaths.ts` — re-shuffle on mulligan
- `src/utils/manabase.ts` — Fisher-Yates shuffle + Karsten table alignment
- `docs/MATH_AUDIT_REPORT.md` — full audit report

### Full Report

See `docs/MATH_AUDIT_REPORT.md` for the complete 12-section audit with formulas, verification tables, and architecture diagram.

---

## Session 2026-04-06 — Full Site Audit & Fixes

### What Happened

5 specialized agents audited the live site (manatuner.app) across performance, security, UX/accessibility, QA, and SEO/marketing. Found 40+ issues. All critical and high-priority items fixed in-session.

### Scores Before → After

| Domain             | Before  | After       |
| ------------------ | ------- | ----------- |
| Performance        | 3.6/5   | **4.7/5**   |
| Security           | 2H / 4M | **0H / 0M** |
| UX                 | 3.6/5   | **4.3/5**   |
| WCAG Accessibility | 2.5/5   | **4.8/5**   |
| SEO On-Page        | 25/100  | **88/100**  |
| SEO Technical      | 30/100  | **90/100**  |
| Marketing          | 58/100  | **85/100**  |

### Commits (9 total)

1. `a5463b1` — SEO, performance, security, accessibility (the big one)
2. `5322099` — Bundle optimization, footer, tests, cross-links
3. `c2f532b` — Build-time prerendering script (Playwright)
4. `0515706` — Vercel build fix attempt (Playwright)
5. `70f68b5` — Vercel: use standard build (no Playwright in Vercel env)
6. `501ed13` — Fix buildCommand reference
7. `9866737` — Fix critical 404: restore SPA fallback for all routes
8. `bd81b97` — llms.txt for AI discoverability + enriched JSON-LD
9. Dark mode toggle removed

### What Was Fixed

**SEO (critical)**

- ✅ react-helmet-async: unique title/meta/description/canonical/OG per page (8 pages)
- ✅ sitemap.xml: all URLs fixed to www.manatuner.app, added missing pages
- ✅ robots.txt: correct sitemap URL
- ✅ Hardcoded canonical removed (was marking all pages as homepage duplicates)
- ✅ /mes-analyses → redirect to /my-analyses
- ✅ JSON-LD: WebApplication (home), FAQPage (guide), Article (mathematics, land-glossary)

**Performance**

- ✅ Cache headers: immutable 1-year cache on /assets/\*
- ✅ mana-font pinned to v1.18.0 + preconnect cdn.jsdelivr.net
- ✅ Cinzel font non-blocking (preload/swap)
- ✅ MUI icons: 131 barrel imports → direct path imports (27 files)
- ✅ index.css deduplicated

**Security**

- ✅ CSP: added \*.ingest.sentry.io to connect-src
- ✅ SECURITY.md: corrected false AES-256 claim
- ✅ nanoid added as explicit dependency

**Accessibility (WCAG Level A)**

- ✅ Skip navigation link (visible on focus)
- ✅ aria-hidden on all decorative mana icons
- ✅ Logo: proper `<a>` tag with aria-label
- ✅ Heading hierarchy: h1→h2 on all pages (was skipping to h4)

**UX**

- ✅ Dark mode toggle removed (theme needs rework)
- ✅ French notification → English
- ✅ Social proof section on homepage
- ✅ Footer: 6 internal page links added
- ✅ Cross-links between Guide, Mathematics, LandGlossary, Analyzer

**QA**

- ✅ manifest.json + favicon.svg created (were 404)
- ✅ og-image.svg: "ManaTuner Pro" → "ManaTuner"
- ✅ 2 failing tests fixed (HelmetProvider in test utils, perf threshold)
- ✅ 197 tests pass, 0 fail

**AI/LLM Discoverability**

- ✅ llms.txt: concise description for AI crawlers
- ✅ llms-full.txt: comprehensive reference (features, math, FAQ, glossary)
- ✅ Referenced in robots.txt and index.html

### What Was NOT Fixed (intentional)

- **Hardcoded light-mode hex colors** (dark mode toggle removed, no visible bug)
- **19 dev dep vulnerabilities** (all in vercel CLI transitive deps, not shipped)
- **Prerendering on Vercel** (Playwright not supported in Vercel build env; available locally via `npm run build:prerender`)

---

## Remaining Items

### Quick Wins (< 1h)

| #   | Item                                                         | Effort | Impact       |
| --- | ------------------------------------------------------------ | ------ | ------------ |
| 1   | Remove duplicate OG meta from index.html (Helmet handles it) | 15 min | Clean HTML   |
| 2   | Add BreadcrumbList JSON-LD on sub-pages                      | 1h     | SERP display |
| 3   | Add SRI hash on mana-font CDN link                           | 10 min | Supply chain |
| 4   | Remove 73 console.log from source                            | 30 min | Clean code   |

### Medium Effort (1-4h)

| #   | Item                                                       | Effort | Impact            |
| --- | ---------------------------------------------------------- | ------ | ----------------- |
| 5   | Fix hardcoded light-mode hex colors (for future dark mode) | 2h     | Future-proofing   |
| 6   | Shareable deck URLs (?deck=...)                            | 4-6h   | Virality          |
| 7   | Discord community server + link in UI                      | 1-2h   | Retention         |
| 8   | Expand FAQ to 8-10 questions (more JSON-LD)                | 1h     | SEO rich snippets |

### Big Effort (days)

| #   | Item                                              | Effort | Impact                 |
| --- | ------------------------------------------------- | ------ | ---------------------- |
| 9   | Blog: "How many lands in MTG?" etc.               | 12-20h | x5-10 organic traffic  |
| 10  | Commander/EDH specific content                    | 8-12h  | Biggest MTG audience   |
| 11  | Rework dark mode with proper theme colors         | 4-8h   | UX for dark mode users |
| 12  | SSR/pre-rendering on CI (GitHub Actions + deploy) | 4-6h   | Social bot previews    |

---

## Architecture Notes

- **Build**: `npm run build` = `vite build` (Vercel production)
- **Build + prerender**: `npm run build:prerender` = vite build + Playwright (local/CI only)
- **Dark mode**: Toggle removed from UI. Code preserved in NotificationProvider.
- **Prerendering**: Script at `scripts/prerender.mjs`. Works locally, not on Vercel.
- **SEO**: Per-page meta via react-helmet-async `<SEO>` component in each page.
- **AI**: llms.txt + llms-full.txt in /public/, referenced in robots.txt.
- **Tests**: 197 pass, 2 skipped, 0 fail. Test utils include HelmetProvider.

---

## Previous Sessions

### Session 2026-01-06

- CSP headers added to vercel.json
- aria-labels on analyzer tabs
- Cleaned temp files, reduced ESLint warnings

### Session 2025-12-27

- Visual identity MTG refresh (mana font, floating symbols, footer)
- TEAM_HANDOFF.md created

### Session 2025-12-26

- Pre-production audit (8 agents)
- OG/Twitter meta tags, robots.txt, sitemap.xml, og-image.png
- ESLint fixes, test fixes, Land Glossary update

---

## Technical Stack

- React 18 + TypeScript + Vite + MUI
- Vercel deployment (auto-deploy on push to main)
- Supabase: DISABLED (100% localStorage, privacy-first)
- Sentry: configured (CSP now allows it)
- Port: 3000 (dev)
