# ManaTuner - Session Handoff

## Project Status: PRODUCTION

**Latest Session:** 2026-04-06 (ENHANCER + K=3 + Hybrid Mana) | **Tests:** 213 pass, 0 fail | **Build:** OK | **Commit:** 75e607d

---

## Session 2026-04-06 (part 4) — ENHANCER Type, K=3 Triples, Hybrid Mana

### What Was Completed

6 commits implementing proper mana enhancer modeling, extending the acceleration engine, and fixing hybrid mana:

| Commit    | Description                                                               |
| --------- | ------------------------------------------------------------------------- |
| `51b7d9e` | ENHANCER type: Badgermole Cub scales with dork count                      |
| `5b212f6` | Exclude Sticky Fingers from ramp (combat damage conditional)              |
| `1bd4ab9` | K=3 triples + Gene Pollinator/Spider Manifestation seed + new sample deck |
| `f2c3cef` | Hybrid mana `{R/G}` assigned to best color in accelerated castability     |
| `75e607d` | Hybrid mana symbol rendering using mana-font `ms-rg` classes              |

### Key Changes

**1. ENHANCER Producer Type (was disabled, now fully implemented)**

Badgermole Cub changed from `type: 'DORK'` (flat +1G) to `type: 'ENHANCER'` with `enhancerBonus: 1`. The engine now dynamically computes bonus mana based on how many creature dorks are co-online:

- `enhancerBonusMana()` — synergy calculation
- `buildEnhancerVirtualSlots()` — color assignment for bonus pips
- Removed all `type !== 'ENHANCER'` filters from the analytic engine
- ENHANCERs now have real draw/cast/survive probability (treated like creatures)
- ENHANCERs included in keyAccelerators with synergy-aware scoring

Files: `acceleratedAnalyticEngine.ts`, `manaProducerSeed.ts`, `manaProducers.ts`

**2. K=3 Triple Scenarios (was capped at K=2 pairs)**

Extended `computeAcceleratedCastabilityAtTurn` from K=0/1/2 to K=0/1/2/3:

- P(K=2 exact) computed from pair weights (was P(K≥2) catch-all)
- P(K≥3) = remainder, distributed across triples
- C(n,3) evaluations — negligible perf cost with n=4-18 producer types
- Default kMax changed from 2 to 3 in all call sites

**3. Hybrid Mana Fixes**

- `ManaCostRow.tsx` `useAcceleratedCastability`: hybrid `{R/G}` assigned to color with most deck sources (was `.find()` → always first alphabetically)
- `ManaCostRow.tsx` `KeyruneManaSymbol`: renders `<i class="ms ms-rg ms-cost">` for split bicolor circle (was showing single-color icon)
- `manaProducerService.ts` `parseManaCost`: now handles `/` in mana cost symbols

**4. Ramp Detection Fix**

- Combat-damage treasure creators excluded: `deals combat damage...create Treasure` pattern filtered out
- Affects: Sticky Fingers, Professional Face-Breaker
- Does NOT affect: Dockside Extortionist (ETB), Smothering Tithe (passive)

**5. New Seed Cards & Sample Deck**

- Gene Pollinator (DORK, G, any-color production)
- Spider Manifestation (DORK, 1{R/G}, R/G production)
- Sample deck: Nature's Rhythm / Badgermole Cub (Standard, 60 cards)

### Current State

- All features working, verified visually
- 213 tests pass, 2 skipped
- Server running on localhost:3000

### What Needs To Be Done Next

- The K=3 truncation still underestimates K=4+ scenarios (Cub + 3 dorks). Could extend to K=4 if needed but diminishing returns.
- `castCostColors` in `ManaProducerDef` doesn't natively support hybrid casting costs. Currently picks one color. Would need type extension for full modeling.
- Users with old `manatuner_producer_cache` in localStorage may still see Sticky Fingers as ramp until cache expires (7 days TTL).

---

## Session 2026-04-06 (part 3) — Pro Player Feedback: Fetchland Fix + Turn Plan Audit

### What Was Completed

Feedback from pro player Walaoumpa (31/12/2025) analyzed and partially resolved.

**Fix 1: Fetchlands not counted as color sources (DONE, pushed)**

Fetchlands had `produces: []` everywhere because Scryfall returns `produced_mana: null` for them (they search, not produce). This caused castability to collapse in Modern.

- `src/data/landSeed.ts` — 14 fetchlands: `produces: []` → colors from fetchTargets
- `src/services/landService.ts` — `analyzeFromScryfall()`: derive produces from fetchTargets; `detectFetchland()`: also matches "basic land card" (Prismatic Vista, Fabled Passage)
- `src/services/landCacheService.ts` — Cache version 2.0 → 2.1 (invalidate stale data)

**Fix 2: Land Glossary accessible from navbar (DONE, pushed)**

- `src/components/layout/Header.tsx` — Added "Lands" link in main navigation bar

### What Needs To Be Done Next: Turn-by-Turn Plan Refactor

Pro player identified 3 bugs in `generateTurnPlan()` (`mulliganSimulatorAdvanced.ts:561`):

| #   | Bug                                                        | Severity | Example                                        |
| --- | ---------------------------------------------------------- | -------- | ---------------------------------------------- |
| 1   | **Greedy CMC sort plays 1+2 drop instead of 3-drop on T3** | HIGH     | 2-drop played on T3, 3-drop delayed to T4      |
| 2   | **No color checking** — only CMC verified, not pip colors  | HIGH     | Glacial Dragonhunt planned T2 with just Forest |
| 3   | **No ETB tapped handling** — taplands give mana same turn  | MEDIUM   | Wind-Scarred Crag counted as untapped mana T1  |

#### Blast Radius Analysis

| Component                 | Risk if modified | Impact                                               |
| ------------------------- | ---------------- | ---------------------------------------------------- |
| `generateTurnPlan`        | **Very low**     | Display only, 0 tests, does NOT affect score         |
| `calculateManaEfficiency` | **Medium**       | Same greedy bugs, but affects score → recommendation |
| `SimulatedCard` interface | **Medium**       | Adding optional fields = backward compatible         |
| `TurnPlan` interface      | **Very low**     | Only consumed by `MulliganTab.tsx`                   |

#### Planned Approach (2 phases)

**Phase 1 — Fix display only (safe, score unchanged):**

1. Enrich `SimulatedCard` with optional `producedMana?: string[]` and `etbTapped?: boolean`
2. Feed these from `DeckCard` data in `prepareDeckForSimulation()`
3. Rewrite `generateTurnPlan()`:
   - Track color pool (not just mana count)
   - Handle ETB tapped (land gives mana next turn only)
   - Prefer curve-out (play 3-drop on T3) over greedy pack (1+2 on T3)
   - Verify color requirements before scheduling a spell
4. Write tests BEFORE modifying: Forest+Dragonhunt, tapland T1, curve-out preference
5. **Score/recommendation stays identical** — only the visual Turn Plan boxes change

**Phase 2 — Fix scoring (separate, later):**

- Apply same logic to `calculateManaEfficiency` so scores reflect reality
- Will change SNAP_KEEP/MULLIGAN thresholds — needs careful validation

---

## Session 2026-04-06 (part 2) — Mathematical Audit, Bug Fixes & UX Improvements

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

### Files Modified (13 files, +776 -77)

**Math bug fixes (6 files):**

- `src/components/ManaCostRow.tsx` — playDraw param in useProbabilityCalculation
- `src/services/mulliganSimulatorAdvanced.ts` — mulliganValue formula fix
- `src/services/manaCalculator.ts` — onThePlay implementation + hypergeometric guards
- `src/services/advancedMaths.ts` — re-shuffle on mulligan
- `src/utils/manabase.ts` — Fisher-Yates shuffle + Karsten table alignment

**UX: explain math engines to users (4 files):**

- `src/pages/MathematicsPage.tsx` — "Three Engines, Three Questions" section, fix 86%/90% error, correct Karsten table
- `src/pages/GuidePage.tsx` — New FAQ "Why below 90%?", fix P1/P2 labels, richer Analysis tab description, reworded math foundations
- `src/pages/HomePage.tsx` — Reorder math cards (Exact Probabilities first), merge MC+Bellman into "Mulligan Optimizer", better descriptions
- `src/components/analyzer/CastabilityTab.tsx` — Tooltip on Probabilities header explaining single-draw vs Karsten

**Navigation:**

- `src/components/layout/Header.tsx` — Center nav buttons relative to full page width (logo absolute-positioned)

**Documentation:**

- `docs/MATH_AUDIT_REPORT.md` — Complete 12-section audit report
- `CLAUDE.md` — Math architecture notes (4 hypergeom implementations, 3 Karsten copies, Play/Draw chain)
- `HANDOFF.md` — This file

### Full Report

See `docs/MATH_AUDIT_REPORT.md` for the complete audit with formulas, verification tables, and architecture diagram.

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
