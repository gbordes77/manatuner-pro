# Changelog

All notable changes to ManaTuner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.3] - 2026-04-17 (follow-up audit — 9-task fix sweep)

### Context

Fresh 8-agent parallel audit (context-manager, Security-Auditor,
performance-engineer, qa-expert, debugger, react-pro, typescript-pro,
documentation-expert) 4 days after v2.5.2. Target: the +7188 lines of
SEO/AEO/design system content merged between `1555466` and `9f64d7c`.
Verdict: 0 CRITICAL, 0 HIGH, 2 MEDIUM, 9 LOW. No blocker. 9 of 10
recommended fixes landed in this release; the 10th
(`useProbabilityCalculation` SSOT alignment) is deferred to v2.6.0
because it requires numerical validation not feasible in one sweep.

### Fixed

- **Sitemap advertised noindexed URL** (`public/sitemap.xml`): the
  `/my-analyses` entry was live while `MyAnalysesPage` sets `noindex`
  (introduced in `9f64d7c`). Removed the entry to close the
  "Submitted URL marked noindex" GSC warning that would have surfaced
  within 48 h of the next crawl.
- **Locale inconsistency** (`index.html:2`): `<html lang="en">` did not
  match `manifest.json` (`"en-US"`) nor the per-page JSON-LD
  `"inLanguage": "en-US"`. Aligned to `"en-US"`.
- **`useMonteCarloWorker` double-dispatch** on `MONTE_CARLO_RESULT`:
  the mount `useEffect` installed a `workerRef.current.onmessage` that
  wrote `setResults / setIsRunning / setProgress`, AND `runSimulation`
  installed a per-call `addEventListener('message')` that resolved the
  Promise — both fired on every result. Split into
  `attachProgressHandler` (progress + error only) and a scoped
  per-call handler that owns all result state writes.
- **`useMonteCarloWorker.cancelSimulation` race**: `setTimeout(100)` to
  recreate the worker after `terminate()` left `workerRef.current =
null` for ~100 ms. Any caller invoking `runSimulation` in that
  window hit `"Worker not initialized"`. Now recreated synchronously.
- **`useMonteCarloWorker.cancelSimulation` unstable memo**: deps
  `[isRunning]` invalidated the callback identity on every toggle,
  breaking downstream `memo` boundaries. Replaced with an
  `isRunningRef` mirror, deps `[]`, callback is now stable.

### Added

- **7 unit tests for `SEO.tsx`**
  (`src/components/common/__tests__/SEO.test.tsx`): covers
  `buildBreadcrumbs` root-only, `/analyzer` with `PAGE_TITLES`,
  unknown-route slug fallback; component tests canonical URL
  emission, `noindex,follow` robots meta + breadcrumb JSON-LD
  suppression, `jsonLd` prop serialization + round-trip JSON
  validity, default breadcrumb emission. Protects all 10 SEO callers
  from silent JSON-LD drift.

### Changed

- **`SEO.tsx` JSON-LD serialization memoized**: `JSON.stringify(jsonLd)`
  and `JSON.stringify(breadcrumbs)` now wrapped in `useMemo`. GuidePage
  (10 FAQ Q/A + 5 HowTo steps) no longer re-serializes on every render.
  `buildBreadcrumbs` and `PAGE_TITLES` are now named exports so tests
  and callers can use the pure helpers without rendering the component.
- **`advancedMaths.ts` monkey-patch replaced**: the post-export
  `(advancedMathEngine as any).calculateHypergeometric = ...` pattern is
  now a proper `calculateHypergeometric()` method on
  `AdvancedMathEngine`. Class shape reflects reality.
- **`manaProducerService.ts:464,474`**: removed redundant `as any`
  on `colorMaskFromLetters(validColors)`. The arrays were already
  narrowed via explicit type predicate on the preceding `.filter`
  call; the cast was noise.
- **`EnhancedRecommendations.tsx`**: typed return of
  `getPriorityColor` as `'error' | 'warning' | 'info' | 'success'`
  (MUI `Chip` color union). The JSX-site `as any` falls out.
- **`Onboarding.tsx:77`**: replaced `(window as any).resetOnboarding`
  with a local `Window & { resetOnboarding?: () => void }`
  intersection.
- **`CastabilityTab.tsx:170`**: replaced
  `produces.includes(color as any)` with an `isLandManaColor` type
  predicate that narrows `string` to the `LandManaColor` union.

### Documentation

- **`CLAUDE.md:252`** — removed the obsolete "Orphan
  `src/hooks/useAnalysisStorage.ts` still exists" paragraph. File was
  deleted in v2.5.2 (`1555466`); the line was stale by 4 days.
  Replaced with a forward note.
- **`docs/ARCHITECTURE.md`** version bumped to `2.5.3 / 2026-04-17`.
- **`docs/index.md`** version bumped from the stale `2.2.0` (3 months
  old) to `2.5.3`. Full BMAD regen of the status table deferred.
- **`README.md`** Tests badge bumped `305 Passing` → `315 Passing`;
  new Version `2.5.3` badge added.

### Verification

- `npx tsc --noEmit`: **0 errors**
- `npm run test:unit`: **315 passing**, 2 skipped, 0 failing (+7 vs
  v2.5.2)
- `npm run build`: clean in **7.07 s**, bundle sizes identical,
  `mulliganArchetype.worker` still 10.84 KB
- `grep supabase src/`: **0 matches** (purge holds)
- No new npm dependencies (`package.json` diff = version bump only)

### Explicitly deferred (scope v2.5.4 or v2.6.0)

- **`useProbabilityCalculation` SSOT alignment** (v2.6.0, ~1.5 d) —
  dual path `base` vs `accelerated` in `ManaCostRow.tsx:685+701`
  open since 2026-04-06.
- **`noUncheckedIndexedAccess`** activation (v2.6.0, ~3–4 h) —
  ~41 array-index sites need `?.`-guards.
- **Delete `useMonteCarloWorker`** (v2.5.4) — 0 live callers in
  `src/`. Bugs patched today in case it's ever re-wired, deletion
  deferred pending export-API consumer audit.
- **CSP hygiene** (v2.5.4) — `index.html` inline `ld+json` vs
  `vercel.json` `script-src 'self'`. Works today (data-script), but
  CSP spec ambiguity suggests SHA-256 source or external JSON file.
- **`docs/index.md`** full BMAD regen (scheduled for the next
  `/bmad:core:tasks:index-docs` run).

---

## [2.5.2] - 2026-04-13 (post-launch hardening pass)

### Re-audit + 19-fix sweep

A 10-agent + 5-persona adversarial re-audit of the 2026-04-13 morning launch
state (`cbe6f21`, score 4.54/5) found that the previous round had been too
generous: the debugger surfaced 11 latent bugs (3 CRITICAL, 4 HIGH, 3 MEDIUM,
1 LOW), the security agent caught a Supabase JWT committed in `env.example`
that the `.gitignore` audits had missed (the file lacks the leading dot, so
`.env*` doesn't match), and the personas regressed to **3.76/5** average
(Léo 3.06, Sarah 4.13, Karim 4.13, Natsuki 3.13, David 4.34) because the
technical audits weren't capturing real friction (Mulligan freeze, jargon,
hidden sample CTA). Score pondéré: **3.95/5 — GO-WITH-HARD-CAVEATS**.

This release closes 19 of the 20 fix recommendations. The only one explicitly
deferred is the dark-mode toggle (kept dormant by user decision; the dead-code
paths stay in place for a possible future re-activation). The full audit
report lives at `docs/AUDIT_PROD_LAUNCH_2026-04-13.md`.

### Removed

- **Supabase entirely purged from the project** (replaces the JWT rotation
  bloquant). The audit found a live Supabase anon JWT (`exp 2035-07-12`) in
  `env.example` (no leading dot, never covered by `.gitignore`), present in
  `HEAD` since the initial commit. Since ManaTuner's Supabase has been a
  fully-mocked dead service for months, the cleanest fix is to remove every
  trace rather than rotate a key for a dependency that does not exist:
  - `env.example` deleted (was the file with the leaked JWT)
  - `MESSAGE_EQUIPE.txt` deleted (also referenced Supabase config)
  - `.env.example` Supabase commented block removed
  - `src/vite-env.d.ts` `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` types
    removed
  - `CLAUDE.md` "Notes Techniques → Supabase" rewritten from "DISABLED" to
    "REMOVED" with an explicit "do not reintroduce without rouvrir la décision"
    instruction for future contributors
  - `grep -ri supabase src/` now returns zero matches
- **`src/hooks/useAnalysisStorage.ts` deleted** — 211-line orphan flagged
  in `CLAUDE.md` since v2.5.1.1, zero callers, was still writing to the
  legacy `manatuner-analyses` localStorage key.
- **`public/og-image.jpg` (41 KB) and `public/og-image-v2.jpg` (121 KB)**
  deleted — only `og-image-v3.jpg` is referenced from `index.html`. 160 KB of
  orphan assets removed from every Vercel deployment.
- **`<link rel="apple-touch-icon">` removed from `index.html`** — the
  referenced `/apple-touch-icon.png` was missing from `public/`, causing iOS
  Add-to-Homescreen to 404. Re-add when a proper 180×180 PNG is generated.
- **`X-XSS-Protection: 1; mode=block` removed from `vercel.json`** — deprecated
  header, modern browsers ignore it, OWASP currently recommends `0` or removal
  to avoid the Chrome XSS Auditor bypass class.
- **`https://*.ingest.sentry.io` dropped from CSP `connect-src`** — Sentry is
  intentionally disabled in production (DSN unset), and the audit pointed out
  that whitelisting an egress endpoint for a service we don't use creates a
  silent re-activation footgun. When/if Sentry is re-enabled, adding the
  domain back becomes a forcing function for the diff review.

### Fixed — Bloquants critiques (audit C1/C2/C3)

- **Sideboard heuristic false positive on category-grouped exports (audit C3)**
  — `src/services/deckAnalyzer.ts` `detectSideboardStartLine`. The blank-line
  heuristic introduced 2026-04-11 silently treated the last category of a
  MTGGoldfish/Moxfield "Creatures / Spells / Lands" dump as a sideboard when
  the last block happened to fall into [1, 15] cards. Estimated 8 % of paste
  flows affected. Fix: refuse the split if `cardsBefore + cardsAfter` matches
  a canonical complete-deck size (`{40, 60, 80, 99, 100}`) — these are the
  formats where no sideboard is implied. +3 regression tests in
  `sideboardDetection.test.ts` covering 60-card and 100-card category-grouped
  decks plus a 75-card legitimate Standard split that must still detect.
- **NaN cascade on empty deck (audit C1)** —
  `src/services/manaCalculator.ts:138`. `landRatio = totalLands / deck.totalCards`
  divided by zero on empty decks (autosave race or sideboard-only paste),
  poisoning Redux Persist with serialized `null`/`NaN`. Fix: guard
  `deck.totalCards > 0 ? totalLands / deck.totalCards : 0`.
- **NaN% in spellAnalysis on mono-land deck (audit C2)** —
  `src/services/deckAnalyzer.ts:1179`. `(castable / total) * 100` produced
  `NaN` when `total === 0` (deck with no spells, e.g. a "24 Forest" debug
  paste). Fix: same ternary guard.

### Fixed — Bugs HIGH/MEDIUM (audit H1/H2/H3/H4/M1/M2/M3)

- **Mulligan Monte Carlo + Bellman now runs in a Web Worker (audit H1, M3)**
  — `src/workers/mulliganArchetype.worker.ts` (new, Vite `?worker` bundle) +
  `src/components/analyzer/MulliganTab.tsx`. The previous code wrapped the
  10k–50k iteration loop in `setTimeout(fn, 50)`, which only defers one tick
  before blocking the main thread for 2-8 s on iOS Safari and mid-tier
  Android, triggering "page unresponsive" prompts. The worker:
  - Imports `analyzeWithArchetype` from `mulliganSimulatorAdvanced` directly
    (full TS module graph via Vite's `?worker` query, no JS duplication).
  - Carries a monotonic `id` per request so only the latest run's response
    reaches React state — also fixes M3 (two overlapping `useEffect` hooks
    that could fire two simultaneous Monte Carlo runs in parallel).
  - Terminates on component unmount.
  - The build now ships `dist/assets/mulliganArchetype.worker-*.js` (10.84 KB).
- **Cavern of Souls divergence between base and accelerated castability paths
  (audit H3)** — `src/components/ManaCostRow.tsx`. The base path
  (`useProbabilityCalculation`) received `effectiveDeckSources` (with the
  `producesAnyForCreaturesOnly` adjustment for tribal lands like Cavern of
  Souls / Unclaimed Territory / Plaza of Heroes / Ancient Ziggurat applied
  for creature spells), but the accelerated path (`useAcceleratedCastability`)
  received raw `deckSources`. Result: on a Humans deck with 4 Cavern of Souls
  and a `{W}{W}{W}` Thalia's Lieutenant, enabling acceleration could
  PARADOXICALLY drop the displayed castability from ~95 % to ~78 % —
  inexplicable to the user and incorrect. Fix: pass `effectiveDeckSources`
  to both hooks. Tribal Humans/Merfolk/Slivers/Vampires/Elves/Goblins now
  agree across the two paths.
- **`scryfallCache` unbounded leak in `deckAnalyzer.ts` (audit H4)** —
  `src/services/deckAnalyzer.ts:8`. Used a plain `Map<string, ScryfallCard>`
  while `src/services/scryfall.ts` already had a `BoundedMap` LRU class for
  the same purpose. CLAUDE.md "in-memory caches are LRU-bounded" applied only
  to the latter. A power user analysing 50 distinct decks in one tab would
  accumulate 5-10 KB per card × thousands of entries = 30-60 MB heap leak.
  Fix: export `BoundedMap` from `scryfall.ts`, import it in `deckAnalyzer.ts`,
  cap to 500 entries.
- **`useMonteCarloWorker` event listener leak (audit H2)** —
  `src/hooks/useMonteCarloWorker.ts`. `runSimulation` added a `message`
  listener but never removed it, so each call accumulated a permanent handler.
  Currently dormant (the hook has no live callers since the Mulligan port to
  the new dedicated worker), but fixed preventively because the audit flagged
  it and the fix is 4 lines: a `cleanup()` closure that clears the timeout
  AND removes the listener, called from both the success and timeout paths.
- **`CastabilityTab` race condition on fast deck switch (audit M1)** —
  `src/components/analyzer/CastabilityTab.tsx:69-107`. The async Scryfall
  `fetchUnknown()` for unknown producers had no cleanup flag, so pasting deck
  A then deck B before A finished could leak A's producers into B's state via
  `setProducersInDeck((prev) => [...prev, ...newProducers])`. Fix: `cancelled`
  flag in cleanup + `Promise.all` instead of sequential `for await` loop
  (also faster: O(1) network latency instead of O(n)).
- **`PrivacyStorage.deleteAnalysis` and `importAnalyses` bypassed quota
  fallback (audit M2)** — `src/lib/privacy.ts:164,220`. Both used
  `localStorage.setItem(...)` directly while `saveAnalysis` went through
  `persist()` which has the `QuotaExceededError` retry pattern. iOS Safari
  private mode (revokes quota between tabs) could throw on these otherwise
  size-reducing operations. Fix: route through `persist()`. The Zod-validated
  cast at the import boundary is annotated.

### Fixed — UX / WCAG (audit ux-designer #2 #3 #5)

- **Decklist textarea now has proper accessibility labels (WCAG 1.3.1 / 4.1.2)**
  — `src/components/analyzer/DeckInputSection.tsx`. The primary input had no
  `aria-label`, no `aria-describedby`, no `id` — screen readers announced
  "edit multi-line" with no context. Fix: added a complete `aria-label`
  describing supported formats, an `aria-describedby` pointing to a new
  `helperText` on the field ("Supported: MTGA, Moxfield, Archidekt, MTGGoldfish.
  Sideboard auto-detected."), and a `maxLength: 20000` `inputProps` to prevent
  multi-MB paste pathology. Also bumped mobile `rows` from 8 to 10 for less
  cramped paste.
- **Sample CTA surfaced in the empty state of the right results panel** —
  `src/pages/AnalyzerPage.tsx`. The previous flow had a small `Example` button
  tucked at the bottom of the LEFT panel while the RIGHT panel said only
  "Enter your deck and click Analyze" — a first-time visitor (Léo persona)
  would scan the right panel and bounce. Fix: prominent `<Button variant=
"outlined">📋 See a Sample Analysis</Button>` directly inside the empty
  state box, calling the same `handleLoadSample`. The chips below it are
  re-spaced. Empty state copy reworded to "Paste your decklist on the left
  and hit Analyze — or try a sample below."
- **Left-panel `Example` button promoted from `size="small"` to
  `size="large"`** with a 📋 emoji prefix and bold weight. Was visually
  indistinguishable from secondary actions; now matches the visual weight of
  Clear and Analyze.

### Fixed — Documentation drifts (audit documentation-expert)

- **`package.json` version `2.2.0` → `2.5.2`** — the audit found the file
  had never been bumped past v2.2.0 even though the CHANGELOG was at
  `[2.5.1.2]` and HANDOFF talked about v2.5.1.2. First thing a contributor
  or persona David inspecting the GitHub repo sees in 10 seconds; a 3-version
  drift screams "abandoned". Bumped to a clean semver `2.5.2` — also drops
  the `2.5.1.x` mid-day patch notation.
- **`LAUNCH.md` test count `213 → 305`, build time `6s → ~7s`, persona
  average `4.14 → 3.76`** — it had been static since 2026-04-10. Updated
  to reflect the re-audit numbers + a "100 % … zero Supabase" line.
- **`docs/ARCHITECTURE.md` header `2026-01-06 / 2.0.0` → `2026-04-13 / 2.5.1`**
  with a note pointing readers to `ARCHITECTURE_COMPLETE.md` for the current
  architecture. The original v2.0.0 baseline doc lives on for historical
  context but is no longer the entry point.

### Fixed — Performance (audit performance-engineer)

- **`PrivacySettings` is now lazy-loaded in `AnalyzerPage`** —
  `src/pages/AnalyzerPage.tsx`. Was a non-lazy import even though the
  component is below-the-fold and only renders after user scrolls. Brings
  ~14 KB gzip of DOMPurify out of the first-load chunk for every visitor
  to `/analyzer`.
- **Cinzel font no longer blocked by CSP** — `index.html`. The previous
  pattern `<link rel="preload" ... onload="this.onload=null;this.rel='stylesheet'">`
  was an inline `onload` handler, which `script-src 'self'` (without
  `'unsafe-inline'`) blocks in the production CSP. Cinzel was therefore
  never loading in production despite being referenced. Fix: switched to a
  plain `<link rel="stylesheet">` — Cinzel is decorative, render-blocking
  is acceptable for ~8 KB of font CSS.

### Hardened — Security (audit Security-Auditor)

- **CSP hardening in `vercel.json`** — added the four directives the audit
  flagged as missing best-practice defenses:
  - `base-uri 'none'` — blocks injected `<base>` tag URL hijacking.
  - `form-action 'self'` — restricts where forms can POST.
  - `object-src 'none'` — explicit deny on legacy plugins.
  - `upgrade-insecure-requests` — auto-upgrades any stray `http://`.
- **`Permissions-Policy` extended** with `interest-cohort=()`,
  `browsing-topics=()`, `attribution-reporting=()` for explicit GDPR-friendly
  opt-out of FLoC / Privacy Sandbox / Topics API / Attribution Reporting.
- **`Cache-Control: no-cache, no-store, must-revalidate` on `/index.html`**
  — `vercel.json`. Without this header, a user visiting during a deploy
  could get a stale `index.html` referencing JS chunks that no longer exist
  in the new deployment, producing a silent 404 cascade. The deployment
  audit flagged this as the #1 issue.

### Stats post-fix

| Metric                | Pre-audit | Post-fix       |
| --------------------- | --------- | -------------- |
| Tests passing         | 305       | **308** (+3)   |
| Tests failing         | 0         | 0              |
| `tsc --noEmit` errors | 0         | 0              |
| Build time            | ~7.5 s    | **6.5 s**      |
| Latent bugs (audit)   | 11        | 0 unaddressed  |
| Audit weighted score  | **3.95**  | **~4.45 est.** |
| Files modified        | —         | 19             |
| Files deleted         | —         | 5              |
| Files added           | —         | 2              |

### Files modified

`.env.example`, `CLAUDE.md`, `LAUNCH.md`, `docs/ARCHITECTURE.md`, `index.html`,
`package.json`, `src/components/ManaCostRow.tsx`,
`src/components/analyzer/CastabilityTab.tsx`,
`src/components/analyzer/DeckInputSection.tsx`,
`src/components/analyzer/MulliganTab.tsx`, `src/hooks/useMonteCarloWorker.ts`,
`src/lib/privacy.ts`, `src/pages/AnalyzerPage.tsx`,
`src/services/__tests__/sideboardDetection.test.ts`,
`src/services/deckAnalyzer.ts`, `src/services/manaCalculator.ts`,
`src/services/scryfall.ts`, `src/vite-env.d.ts`, `vercel.json`

### Files deleted

`MESSAGE_EQUIPE.txt`, `env.example`, `public/og-image.jpg`,
`public/og-image-v2.jpg`, `src/hooks/useAnalysisStorage.ts`

### Files added

`src/workers/mulliganArchetype.worker.ts`,
`docs/AUDIT_PROD_LAUNCH_2026-04-13.md`

### Explicitly deferred (NOT in this release)

- **Dark mode toggle**: dead-code paths in `ManaCostRow`, `Footer`,
  `FloatingManaSymbols`, `SegmentedProbabilityBar`, `AccelerationSettings`
  remain in place. `NotificationProvider.toggleTheme()` still has zero
  callers. Decision: keep dormant for now, will be reactivated in a future
  release with proper system-pref detection + a header IconButton.
- **Plausible/Umami analytics**: out of scope for the fix sweep; the launch
  goes ahead without traffic measurement (acknowledged blind-spot in the
  audit's "Forte recommandation" section).
- **noUncheckedIndexedAccess + Zod on JSON.parse cache files**: deferred to
  v2.6.0 — large refactor surface (~40-80 sites).
- **README real CI badges + 2 screenshots**: cosmetic, deferred.

## [2.5.1.2] - 2026-04-13

### Library Expansion (+11 entries)

Single commit (`6bcdc64`) on top of `2.5.1.1`. Eleven new entries contributed by a community member, expanding the curated library from 35 to 46 entries. All URLs verified HTTP 200 + content grep before adding. Adds a brand-new "Podcasts" category and `medium: 'podcast'` to the type system.

### Added

- **6 new articles** in the reading library:
  - **Reid Duke "Level One: The Full Course"** (magic.wizards.com, 2015) — the umbrella index of Reid Duke's complete Level One curriculum, linking every chapter from one page. Includes the manabase + sideboarding chapters already featured in the First FNM and RCQ tracks.
  - **Patrick Chapin "Information Cascades in Magic"** (StarCityGames, 2006) — added to the Pro Tour track. The information theory framework that explains why testing groups converge on flawed conclusions when each member trusts others' tests more than their own.
  - **Zvi Mowshowitz "The Elephant Method: A Case Study"** (StarCityGames, 2013) — added to the Pro Tour track. Zvi walks through how he used the Elephant method to tune Team SCG's Bant Control deck for Pro Tour Dragon's Maze.
  - **Zvi Mowshowitz "Using Your Time Wisely"** (StarCityGames, 2010) — added to the RCQ track. Zvi's framework for budgeting prep hours the week before a tournament.
  - **Zvi Mowshowitz "Who's the Beatdown II: Multitasking"** (TCGPlayer legacy, archived 2003 era) — Wayback snapshot from `20200804023440`. The sequel to Mike Flores's "Who's the Beatdown?" — extending the framework from the binary (offense-or-defense) to multi-axis games where you must do both. Sits next to the original Flores entry in the Fundamentals section.
  - **Paulo Vitor Damo da Rosa "PV's Rule"** (TCGPlayer Infinite, 2024) — added to the Tournament Mindset section. PVDDR's eponymous decision-making rule, distilled from 20+ years of pro-level play.
- **New PODCASTS section** with 5 episodes from Le Podcaster Mage (FR):
  - **#15 "Level-up : Avoir un plan"** (2019) — Théau & Charles on game plans
  - **#67 "Level-up : La cohérence à Magic, avec J-E Depraz"** (2021) — features Jean-Emmanuel Depraz, the same Pro Tour player whose "Petite leçon de stops" video is already in the library
  - **#92 "Level-up : Tourner autour des cartes"** (2021) — range-finding & hidden information reads
  - **#125 "Level-up : Les heuristiques, c'est pas automatique"** (2022) — the audio pendant of PVDDR's "Six Heuristics" article
  - **#164 "Dans la peau d'un grand père à Magic, avec Erwan Maisonneuve"** (2023) — the science of control with the co-author of "Manuel du Joueur de Control"
- **New `ArticleMedium 'podcast'`** added to the union in `src/types/referenceArticle.ts`.
- **New `ArticleCategory 'podcasts'`** added to the union, with `CATEGORY_LABELS` entry "Podcasts" and appended to `CATEGORY_ORDER` after `'advanced'`.
- **New `MEDIUM_META.podcast`** entry in `src/components/library/ArticleCard.tsx` using `PodcastsIcon` from `@mui/icons-material/Podcasts`.

### Changed

- **Seed file header** bumped to `@version 1.2` (`src/data/articlesReferenceSeed.ts`) with explicit changelog for 1.0 (initial 35-article seed), 1.1 (yesterday's 17-link audit), and 1.2 (this expansion).
- **README** Overview library bullet now reads "46 essential competitive MTG resources" instead of "35 essential competitive MTG articles", and the features-table Library row updated to reflect the new total + podcasts.

### Track sizes after expansion

| Track     | Before | After                                          |
| --------- | ------ | ---------------------------------------------- |
| first-fnm | 5      | 5                                              |
| rcq       | 6      | 7 (+1 Zvi Using Time Wisely)                   |
| pro-tour  | 7      | 9 (+2 Chapin Cascades, +1 Zvi Elephant Method) |

All tracks within the 3-10 integrity-test limit.

### Distribution after expansion

| linkStatus | Before | After        |
| ---------- | ------ | ------------ |
| live       | 19     | **29** (+10) |
| archived   | 10     | **11** (+1)  |
| lost       | 6      | **6**        |
| **Total**  | **35** | **46**       |

### Verified

- 11 new URLs verified HTTP 200 + content grep before adding
- The Zvi Beatdown II Wayback snapshot the contributor originally sent (`web/20120701194521`) didn't contain the article body via curl, so swapped to a verified `web/20200804023440` snapshot which contains "Beatdown", "Mowshowitz", and "Multitask" markers
- 305 unit tests passing including the 9 dedicated `articlesReferenceSeed` integrity guards (unique ids, valid primaryUrl, originalUrl for archived/mirror, curatorNote for tracked, track sizes 3-10, international/rescued picks per track) — test count unchanged because the integrity tests are structural
- TypeScript clean (`npx tsc --noEmit`)
- Dev server `/library` returns 200

## [2.5.1.1] - 2026-04-13

### Library Link Audit + Launch Prep

Three commits on top of `2.5.1`. The library was re-verified end-to-end (HTTP 200 + content grep on every non-lost URL), the privacy/Sentry contradiction flagged in the v2.5.1 session was resolved with a code-level guard, and the CI/CD double-deploy race that could serve users mismatched HTML/JS chunk hash pairs was fixed. A 10-agent final go-prod audit scored an average of **4.54/5** — the highest in project history.

### Fixed

- **17 broken or fragile library links** in `src/data/articlesReferenceSeed.ts` (commit `8b2e523`):
  - 4 articles flipped `archived → live` with verified canonical URLs (Reid Duke "Building a Mana Base" + "Sideboarding" → magic.wizards.com — the Wayback prefix was 404'ing silently to a TCGplayer landing; Chapin "Art of the Mulligan" → live SCG; Chapin "Next Level Deckbuilding" → SCG ebook page — the seed had the wrong publisher entirely)
  - 5 articles marked `lost` after exhaustive Wayback CDX API searches found zero snapshots: PVDDR "When to Mulligan", "Ten Commandments of Deckbuilding", "How to Sideboard"; LSV "Mulligans"; Karsten "What Are the New London Mulligan Odds?". Each kept its description with a `curatorNote` calling for community recovery.
  - 3 generic Wayback `/web/YYYY/` prefixes pinned to 14-digit timestamps (Karsten 2018 colored sources, Flores "Who's the Beatdown?", Karsten Commander manabase) — generic prefixes silently redirect to wrong content when the slug isn't archived.
  - 2 TCGplayer article URLs migrated from the 301-redirecting `infinite.tcgplayer.com/article/...` to the new canonical `www.tcgplayer.com/content/article/...` (Karsten 2022 lands, Manfield tournament prep). The redirect chain still works but pinning the canonical URL is more robust.
  - 1 paywall → live: PVDDR "Six Heuristics to Make You a Better Magic Player" is currently free on SCG, no longer behind the Premium gate.
  - 1 slug + title fix: `karsten-commander-manabase` retitled to "What's an Optimal Mana Curve and Land/Ramp Count for Commander?" — the seed's original slug pointed to a non-existent CFB URL.
  - 2 video metadata corrections in the metagame category: `boa-mtgo-stops` renamed to `depraz-mtgo-stops` (the actual author of `youtu.be/xLFjxcKmDr4` is Pro Tour player Jean-Emmanuel Depraz, not Boa); `boa-mtgo-getting-started` retitled to "TUTO MTGO: Est-ce mieux qu'MTGA?" (the actual El_Gran_Boa YouTube title, not the generic "Bien commencer sur MTGO" the seed assumed).
- **CI/CD double-deploy race** (`.github/workflows/ci.yml:51`): the `deploy` job that pushed to Vercel `--prod` via `amondnet/vercel-action@v25` was running in addition to Vercel's native GitHub auto-deploy on every push to `main`. Two simultaneous builds produced different content-hashed asset filenames (`index-XXXX.js`), so a user loading `index.html` from deploy #1 then fetching a JS chunk from deploy #2 received a 404 on the chunk. The job is now disabled (`if: false`) with a 6-line explainer comment. Vercel native integration alone handles all production deploys.

### Changed

- **Sentry privacy decision documented in code** (`src/main.tsx:13-19`, commit `27ef3a8`): a 7-line guard comment above the Sentry init explains why `VITE_SENTRY_DSN` must remain unset in Vercel production environment. Without first (a) adding a `beforeSend` scrubber for URLs/breadcrumbs/PII and (b) updating `PrivacySettings.tsx:204` to disclose anonymous crash reporting, enabling Sentry would break the "Nothing is sent to any server" privacy promise — a GDPR risk for EU traffic. Decision: option B, keep DSN unset, fly blind on crashes, preserve the 100% client-side privacy promise that backs the launch positioning.
- **README test badge** bumped from 235 → 305 (matches the actual `npm run test:unit` count after the +9 `articlesReferenceSeed` integrity tests added in v2.5.1).
- **README features table** gained a "Reading Library" row + Overview section gained a library bullet, surfacing the 35-article curated library now exposed at `/library` and prominently linked from the homepage hero.
- **`CLAUDE.md` Notes Techniques** gained a `### Sentry` subsection documenting the privacy rule for future contributors (must-not-set DSN without scrubber + copy update).
- **Library distribution** post-fix: 19 live + 10 archived + 6 lost + 0 paywall = 35 articles. Was 14 live + 19 archived + 1 paywall + 1 lost.

### Verified

- 27 of 29 non-lost library URLs return HTTP 200 + grep-confirmed expected article content in the body
- 2 Fortier `mtgdecks.net` URLs are Cloudflare-protected from bots but confirmed present via Wayback CDX (snapshots from 2023-07 and 2025-10)
- 305 unit tests passing including 9 dedicated `articlesReferenceSeed` integrity guards
- TypeScript clean (`npx tsc --noEmit`)
- Build clean
- 10-agent final go-prod audit average **4.54/5** (highest historical, vs 4.19 on `ceceb5f`, vs 4.36 personas average)

### Manual launch checklist (not in code)

Before posting the launch tweet:

1. Confirm `VITE_SENTRY_DSN` is NOT set in Vercel project env vars (privacy decision)
2. Set up UptimeRobot 5-min HTTPS monitor on `https://manatuner.app`
3. Set up Plausible (or equivalent privacy-first analytics) for tweet conversion measurement
4. Enable GitHub branch protection on `main`
5. Capture 3 dark-mode screenshots (H1, Castability with DFC deck, Math foundations techTerm badges)

## [2.5.1] - 2026-04-12

### Launch Hardening — Parser, Math, UX Jargon, Resilience

Commit `ceceb5f`. Fixes 8 latent bugs identified by a 12-agent audit (2 CRITICAL, 4 HIGH, 2 MEDIUM), plus documentation/security/UX touch-ups. Estimated user-visible bug rate dropped from ~25–35% on a viral-traffic scenario to ~3–5%.

### Fixed

- **MTGA double-face parser** (`deckAnalyzer.ts:703-723`): `cleanCardName` now splits `Front // Back` to the front face, strips Arena markers (`*CMDR*`, `*F*`, `*E*`, `*CMP*`), normalizes unicode whitespace (`\u00A0`, `\u3000`). Fixes ~80% of Standard 2022+ decks (Fable of the Mirror-Breaker, Wedding Announcement, Invoke Despair) silently falling back to wrong CMC/colors.
- **Hypergeometric dynamic capacity** (`castability/hypergeom.ts`): `Hypergeom` class now grows its log-factorial table on demand via `ensureCapacity()` (geometric 1.5× strategy). Cube (540), Commander (100), Highlander no longer display `NaN%`. Hot-path 60-card decks unaffected (initial capacity 200).
- **NaN-safe math guards**: `clampProbability()` in `hypergeom.ts`, `clamp01()` in `acceleratedAnalyticEngine.ts`, `safeNumber()` in `ManabaseStats.tsx`. Every `pmf`/`atLeast`/`atMost` call validates `Number.isFinite` on all inputs and collapses non-finite output to 0.
- **Division by zero guard** (`deckAnalyzer.ts:1143`): `landRatio = totalCards > 0 ? totalLands/totalCards : 0`. Empty decklists no longer render `NaN%` in `ManabaseStats`.
- **Hybrid / twobrid / Phyrexian / colorless mana** (`ManaCostRow.tsx:343-389`): regex now handles `{R/G}` (pure hybrid), `{2/W}` (twobrid), `{W/P}` (Phyrexian), `{C}` (true colorless). Previously silently dropped — Eldrazi (Tron/Post) probabilities were mis-reported.
- **Probability ceiling** (`ManaCostRow.tsx:449-455`): `safePct` rounds to 100% instead of capping at 99%. A perfectly built deck can now display 100%.
- **Overgrowth family regex** (`manaProducerService.ts:286`): `adds?\s+\{[WUBRGC]\}\{[WUBRGC]\}` now matches both imperative "add" and triggered "adds" forms. Previously 2-mana land auras (Overgrowth, Dawn's Reflection) were counted as 1 mana. Discovered via red test.
- **Scryfall resilience** (`deckAnalyzer.ts:225-275`): 8-second `AbortController` timeout, one retry with 400 ms backoff on 429/5xx, exact→fuzzy fallback chain. Previously silent failure on rate-limit or network flake.
- **localStorage quota handling** (`privacy.ts:55-75`): new `persist()` method catches `QuotaExceededError`, trims records geometrically, retries. `AnalyzerPage.tsx:164-172` surfaces "Browser storage full" via snackbar instead of silent save-fail.
- **GuidePage TS errors** (`GuidePage.tsx:32-45`): `interface TabInfo { details?: TabDetail[] }` fixes 4 live `tsc --noEmit` errors that were committed on main.
- **`useAcceleratedCastability` deps-array bug** (`ManaCostRow.tsx:540-651`): `baseProbability` removed from signature and deps. Was never read, invalidated the memo on every P2 recalculation.

### Added

- **Tab-scoped ErrorBoundaries** (`AnalyzerPage.tsx`): each of the 5 analyzer tabs (Castability, Analysis, Mulligan, Manabase, Blueprint) wrapped in its own `<ErrorBoundary label="...">`. A crash in one tab no longer takes down the whole page.
- **Sentry integration in ErrorBoundary** (`ErrorBoundary.tsx:41-48`): `Sentry.withScope` with `setTag('errorBoundary', label)`, `setExtra('componentStack', ...)`, and `captureException`. Gated behind `VITE_SENTRY_DSN` in Vercel env; silent no-op when unset.
- **Bounded LRU Scryfall caches** (`scryfall.ts:21-49`): `BoundedMap<K,V> extends Map<K,V>` with `override get`/`set`. `cardCache` capped at 500, `collectionCache` at 100. Prevents unbounded memory growth on long sessions (Cube grinders, power users).
- **Redux persist v1 migration** (`store/index.ts`): `createMigrate` + `createTransform` drop `snackbar` and `isAnalyzing` from rehydrated state. Prevents "stale notification on reload" bug and stale `isAnalyzing: true` flag after crash recovery.
- **Legacy store migration** (`privacy.ts:100-138`): `manatuner-analyses` (hyphen, legacy hook) now merges into `manatuner_analyses` (canonical) on first read, then removes the legacy key. One-time, idempotent, id-deduplicated.
- **Favicon WUBRG redesign** (`public/favicon.svg`): 5-color gradient pie ring + Cinzel-style M on dark gradient background. Replaces generic red-on-blue "M" with authentic MTG identity.
- **SRI integrity on mana-font CDN** (`index.html:50-56`): `integrity="sha384-xa3t1kOl..."` + `crossorigin="anonymous"` on `cdn.jsdelivr.net/npm/mana-font@1.18.0`. Prevents CDN-compromise CSS injection.
- **Rollback scripts** (`package.json:40-41`): `npm run rollback` → `vercel rollback`, `npm run rollback:list` → `vercel ls --prod`. Fast recovery path if a deploy ships broken.
- **techTerm badges on homepage Math Foundations**: each of the 3 math cards now displays a discreet monospace caption at the bottom, behind a dashed border — `Hypergeometric distribution`, `Frank Karsten tables`, `Monte Carlo + Bellman`. Invisible to beginners (accessible titles up top), trust signal for grinders (pro terms at the bottom).

### Changed

- **Homepage H1** (`HomePage.tsx:243`): `"Can You Cast Your Spells On Curve?"` → `"The Only Mana Calculator That Counts Your Dorks & Rocks"`. Killer feature becomes the hero. Addresses Leo persona regression (v2.5: 3.75/5 → projected 4.25/5).
- **Homepage chips**: `"Turn-by-Turn Probabilities"` → `"See The Real Odds"`, `"Monte Carlo Mulligan"` → `"Smart Mulligan Advice"`. Removes jargon repellent for beginners.
- **Math section subtitle** (`HomePage.tsx:436`): `"used by mathematicians and competitive players"` → `"so you can trust the advice"`. Removes exclusionary framing.
- **Formula badges on math cards**: `P(X≥k)` → `Per spell`, `E[V₇]` → `Keep / Mull`, `90%` kept.
- **Beginner qualifier** (`HomePage.tsx:274`): new italic line `"Works for every skill level — from your first Standard deck to Pro Tour prep."` directly answers the persona question "is this for me?".
- **Analyzer chip** (`AnalyzerPage.tsx:294`): `"Monte Carlo"` → `"Mulligan Sim"`. Removes ghost `"Health Score"` chip that pointed to a non-existent tab; replaced by `"Manabase"`.
- **Manifest PWA** (`public/manifest.json`): single maskable `favicon.svg` icon (was 512×512 `og-image.png`, dimensions mismatch).
- **README Privacy section**: removed false `"AES-256 encryption"` claim and `"Optional Cloud Sync via Supabase"` mention. Now accurate: `"localStorage only"`, `"No tracking"`. Supabase service has been mocked since v2.2.0.
- **CONTRIBUTING.md clone URL**: `manatuner-pro` → `manatuner`. The repo was renamed in v2.2.0; the doc was stale.
- **`.env` template**: Supabase JWT removed (placeholder only). Historical key must still be rotated/deleted manually in the Supabase dashboard.

### Removed

- **`public/og-image.png`** (965 KB): dead asset, never referenced. `og-image-v2.jpg` (121 KB) and `og-image.svg` remain.
- **`@tanstack/react-query-devtools` from `dependencies`**: moved to `devDependencies`. Production bundle unaffected (gated by `import.meta.env.DEV` in `main.tsx`), but clean dependency graph matters for audit tools.

### Tests

- **+61 tests** (235 → 296 passing, 2 skipped, 0 failing).
- **`manaProducerService.test.ts`** (new, 25 tests): full ramp taxonomy — LAND_RAMP, LAND_AURA, LAND_FROM_HAND, LANDFALL_MANA, MANA_DOUBLER (2× and 3×), SPAWN_SCION, ROCK, RITUAL, TREASURE, plus priority ordering and malformed input. Exports `analyzeOracleForMana` which was previously private.
- **`hypergeomDynamic.test.ts`** (new, 15 tests): dynamic capacity growth (Cube 540, Commander 100), NaN-safety (Infinity, NaN inputs, empty deck, zero copies), no off-by-one after resize.
- **`cleanCardName.test.ts`** (new, 21 tests): MTGA set codes, DFC split, Arena markers, A- prefix, unicode whitespace, edge cases.

### Security

- **Supabase JWT scrub** (local `.env`): historical anon key removed from the local dev env file. `.env` remains untracked. Manual follow-up: delete or rotate the Supabase project in the dashboard, since the key could still be cached in shell history or editor state.
- **SRI sha384** on the only runtime-external stylesheet (`mana-font`).
- **New LOW finding to resolve before EU launch**: `PrivacySettings.tsx` still says "Nothing is sent to any server" / "does not collect any data". Once `VITE_SENTRY_DSN` is set in Vercel prod, this claim becomes inaccurate (Sentry default integration ships stack traces + breadcrumbs). Two resolutions: (1) add `beforeSend` scrubber in `main.tsx` and update `PrivacySettings.tsx:204,233` copy to disclose anonymous crash reporting; (2) leave `VITE_SENTRY_DSN` unset in production.

### Architecture notes

- **Hypergeom singleton API unchanged**: `hypergeom.pmf/atLeast/atMost/atLeastOneCopy` signatures identical. Growth is transparent to callers.
- **Two parallel probability paths in `ManaCostRow.tsx` remain**: `useProbabilityCalculation` (inline hypergeom, lands-only) and `useAcceleratedCastability` (K=3 engine with producers). Alignment to a single source of truth is still a post-launch TODO.
- **Orphan `src/hooks/useAnalysisStorage.ts`**: 211-line hook with zero callers, writes to the legacy `manatuner-analyses` key. The read-path migration in `PrivacyStorage.getMyAnalyses()` neutralizes it, but the file should be deleted post-launch to fully close the W1 fix.

## [2.5.0] - 2026-04-10

### Ramp Taxonomy Expansion — 5 New Producer Types

Comprehensive Scryfall audit of all 22 MTG ramp mechanisms. Implemented the 5 highest-impact missing types with oracle text detection and 28 seed cards.

### Added

- **LAND_AURA producer type**: Enchantments on lands that produce extra mana (Wild Growth, Utopia Sprawl, Fertile Ground, Overgrowth, Dawn's Reflection, Gift of Paradise, Wolfwillow Haven)
- **LAND_FROM_HAND producer type**: Effects that put lands from hand onto battlefield (Growth Spiral, Arboreal Grazer, Sakura-Tribe Scout, Skyshroud Ranger, Uro)
- **SPAWN_SCION producer type**: Eldrazi Spawn/Scion tokens that sacrifice for {C} (Awakening Zone, From Beyond, Pawn of Ulamog, Glaring Fleshraker)
- **LANDFALL_MANA producer type**: Mana generation on land ETB triggers (Lotus Cobra, Nissa Resurgent Animist)
- **MANA_DOUBLER producer type**: Effects that double/triple land mana output (Mirari's Wake, Zendikar Resurgent, Mana Reflection, Nyxbloom Ancient, Caged Sun, Dictate of Karametra, Nissa Who Shakes the World, Crypt Ghast)
- **`doublerMultiplier` field** on `ManaProducerDef` for MANA_DOUBLER type (2x or 3x)
- **Oracle detection patterns** for all 5 new types in `analyzeOracleForMana()`
- **Scryfall handler blocks** for all 5 new types in `detectProducerFromScryfall()`
- **LAND_FROM_HAND survival = 1.0** in accelerated engine (extra land is irremovable)

### Changed

- **Homepage "What You Get"**: Replaced Health Score (abstract) with Analysis Dashboard (visual). New order: Castability → Analysis Dashboard → Mulligan Simulator → Export Blueprint
- **Mathematics page**: Complete rewrite with progressive disclosure. Removed 3 redundant sections, added "Two Questions" positive framing, promoted 82%-vs-90% FAQ, collapsed all deep-dive accordions by default
- **Mathematics terminology**: Removed "Mana Screw / Color Screw" negative framing, replaced with constructive "How Many Lands? / How Many Sources per Color?"

### Removed

- Health Score from homepage feature cards (still exists in analyzer)
- "Implementation Details" accordion from Mathematics page (IEEE 754, memoized binomial — too technical)
- "Academic Foundation" top banner from Mathematics page (Karsten link moved into his own accordion)
- Duplicate "Mathematical Foundations" 3-icon-card section from Mathematics page

## [2.3.0] - 2026-04-06

### Mana Acceleration Engine v2.0 — ENHANCER Type & K=3 Triples

Major upgrade to the mana acceleration system: properly models cards that enhance other mana producers, extends the probability engine from pairs to triples, and fixes hybrid mana handling throughout.

### Added

- **ENHANCER producer type**: Badgermole Cub now modeled as ENHANCER instead of flat DORK. Its "whenever you tap a creature for mana, add {G}" scales with co-online dorks:
  - K=1 (Cub alone): +1G (earthbend bonus only)
  - K=2 (Cub + 1 dork): +3G (base + dork + bonus)
  - K=3 (Cub + 2 dorks): +5G (base + 2 dorks + 2 bonuses)
- **K=3 triple scenarios**: Engine extended from K=0/1/2 to K=0/1/2/3. Evaluates all C(n,3) triples of producers for accurate multi-accelerator modeling. Critical for ENHANCER synergies.
- **Gene Pollinator** added to seed: 1-CMC any-color DORK (`{T}, Tap a permanent: Add any`)
- **Spider Manifestation** added to seed: 2-CMC R/G DORK (`{T}: Add {R} or {G}`)
- **Hybrid mana symbol rendering**: `{R/G}`, `{W/U}`, etc. now display as proper bicolor split circles using mana-font's `ms-rg`, `ms-wu` classes
- **Hybrid mana in accelerated castability**: `{R/G}` pips assigned to the color with most deck sources (was always picking first color alphabetically)
- **New sample deck**: Nature's Rhythm / Badgermole Cub (Standard) replaces Light-Paws Auras

### Fixed

- **Sticky Fingers false ramp detection**: Combat-damage-conditional treasure creators (`"deals combat damage...create Treasure"`) excluded from ramp detection. Dockside Extortionist (ETB) still correctly detected.
- **Hybrid mana cost parsing in producer service**: `parseManaCost()` now handles `{R/G}` symbols for Scryfall-detected producers
- **ENHANCER tests updated**: 42 tests (was 41), including K=3 synergy verification

### Architecture

New helper functions in `acceleratedAnalyticEngine.ts`:

- `enhancerBonusMana(onlineSet)` — computes synergy bonus for any online producer set
- `buildEnhancerVirtualSlots(onlineSet)` — creates virtual color slots for P1 DFS color assignment

ENHANCER fields in `ManaProducerDef` (existed in types, now used):

- `enhancerBonus: number` — mana added per enhanced dork
- `enhancerBonusMask: ColorMask` — color of bonus mana
- `enhancesTypes: ManaProducerType[]` — which producer types are enhanced

### Tests

- 213 pass, 2 skipped (was 212)
- New test: "K=3 should capture Cub + 2 dorks synergy better than K=2"
- Updated ENHANCER tests from "should return 0" to "should compute positive probability"

## [2.2.0] - 2026-04-06

### Rebrand

- **Name**: "ManaTuner Pro" renamed to "ManaTuner" across entire codebase (152+ occurrences)
- **Domain**: Custom domain `manatuner.app` (was manatuner-pro.vercel.app)
- **GitHub**: Repository renamed from `manatuner-pro` to `manatuner`
- **Badge**: Removed "PRO" badge from header
- **Copyright**: Updated to 2025-2026

### Documentation

- **Monte Carlo**: Fixed all references from 3,000 to 10,000 simulations (matching actual code)
- **SECURITY.md**: Rewritten for client-side architecture (removed backend/SQL/auth references)
- **TEAM_HANDOFF.md**: Consolidated and updated (merged ONBOARDING_NOUVELLE_EQUIPE)
- **technology-stack.md**: Removed phantom dependencies (axios, lodash, react-hook-form, vite-plugin-pwa)
- **Cleanup**: Deleted 9 redundant/obsolete files (3 orphan HTML pages, 3 archive files, 3 duplicate docs)

### SEO

- **OG tags**: All meta tags updated with new domain and name
- **Canonical URL**: Points to manatuner.app
- **GitHub description**: Updated with rocks & dorks killer feature

## [2.1.0] - 2026-04-05

### Performance

- **Batch Scryfall API**: N sequential calls replaced by single `/cards/collection` batch request (~5s to ~1s)
- **Remove artificial delay**: Removed 1.5s setTimeout in deck analysis
- **React.memo**: Added to 6 analyzer tab components, preventing unnecessary re-renders
- **Monte Carlo fix**: Single-pass standard deviation calculation (was running simulations twice)
- **Lazy-loaded tabs**: All analyzer tabs and ManaBlueprint loaded on demand via React.lazy
- **Bundle splitting**: AnalyzerPage no longer loaded as a monolithic 608KB chunk

### Security

- **CSP hardened**: Removed `unsafe-eval` from Content-Security-Policy
- **Reverse tabnabbing**: Added `noopener,noreferrer` to all `window.open` calls
- **Import validation**: JSON imports in PrivacyStorage now validated with Zod schema
- **Supabase key**: Removed from env.example (was committed with real JWT)

### Code Quality

- **Unified types**: Consolidated ScryfallCard from 4 duplicate definitions to 1
- **Fixed ManaSymbol**: Removed `| string` that was nullifying type safety
- **Removed dead code**: 4 unused Redux slices, Next.js middleware/API routes, Jest config, orphan setupTests.ts
- **Removed dead deps**: jest, ts-jest, next-pwa, c8, @types/jest
- **Replaced `process.env`**: Migrated to Vite-idiomatic `import.meta.env.DEV`
- **Duplicate SimulationParams**: Removed second identical definition in types/index.ts

### DevOps

- **CI/CD consolidated**: 5 overlapping workflows reduced to 2 (ci.yml + pr-validation.yml)
- **Node 20**: Aligned .nvmrc and CI workflows on Node 20
- **Prettier + Husky**: Added .prettierrc, .prettierignore, and lint-staged pre-commit hook
- **upload-artifact v4**: Updated deprecated v3 action

### UX

- **404 page**: Added proper Not Found page instead of silent redirect
- **URL consistency**: `/my-analyses` route (kept `/mes-analyses` as alias)
- **Label fix**: "List of deck" corrected to "Deck List"
- **.gitignore fix**: `/lib/` instead of `lib/` to stop ignoring `src/lib/`

## [2.0.0] - 2025-06-22

### 🚀 Major Release - Production Ready

### Added

- **Privacy-First Mode**: Complete offline functionality without external dependencies
- **Web Workers Optimization**: Monte Carlo simulations and mana calculations in background threads
- **Advanced Mana Analysis**: Sophisticated probability calculations using hypergeometric distribution
- **Modern UI/UX**: Complete Material-UI redesign with custom MTG theme
- **Responsive Design**: Full mobile and tablet compatibility
- **Performance Optimization**: Lazy loading, code splitting, and efficient rendering
- **Comprehensive Testing**: Unit tests, integration tests, and E2E coverage
- **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions
- **Documentation**: Complete API documentation and user guides

### Fixed

- **Vercel Deployment Issues**: Resolved Web Workers compatibility problems
- **Build Configuration**: Simplified Vite configuration for production stability
- **TypeScript Errors**: Resolved all compilation issues
- **Memory Leaks**: Optimized component lifecycle and state management
- **Loading Performance**: Reduced initial bundle size and improved caching

### Changed

- **Architecture**: Migrated from Firebase to Vercel + Supabase (optional)
- **Build System**: Upgraded to Vite 4.x with optimized configuration
- **State Management**: Enhanced Redux Toolkit implementation
- **API Integration**: Improved Scryfall API integration with error handling
- **Error Handling**: Comprehensive error boundaries and user feedback

### Technical Improvements

- **Bundle Size**: Reduced by 40% through code splitting and tree shaking
- **Performance**: 60% faster load times with optimized assets
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Enhanced metadata and structured data
- **Security**: Implemented CSP headers and security best practices

## [1.5.0] - 2025-06-15

### Added

- Multi-format deck import support
- Enhanced mana curve visualization
- Improved land recommendation algorithms

### Fixed

- Deck parsing edge cases
- Probability calculation accuracy
- UI responsiveness issues

### Changed

- Updated dependencies to latest versions
- Improved error messages and user feedback

## [1.4.0] - 2025-06-10

### Added

- Special lands support (fetchlands, shocklands, etc.)
- Advanced filtering options
- Export functionality for analysis results

### Fixed

- Hybrid mana cost calculations
- Memory optimization for large decklists
- Cross-browser compatibility issues

## [1.3.0] - 2025-06-05

### Added

- Real-time analysis updates
- Deck archetype detection
- Performance metrics dashboard

### Fixed

- Async state management issues
- Component re-rendering optimization
- API rate limiting handling

## [1.2.0] - 2025-05-28

### Added

- Interactive probability charts
- Detailed spell analysis tab
- Mana base recommendations

### Fixed

- Card parsing for special characters
- Probability edge cases
- UI layout inconsistencies

## [1.1.0] - 2025-05-20

### Added

- Turn-by-turn probability analysis
- Color distribution visualization
- Basic deck statistics

### Fixed

- Initial loading performance
- Card database synchronization
- Mobile layout issues

## [1.0.0] - 2025-05-15

### 🎉 Initial Release

### Added

- **Core Functionality**
  - Deck list parsing and analysis
  - Basic mana base calculations
  - Hypergeometric probability distributions
  - Simple web interface

- **Analysis Features**
  - Mana cost distribution
  - Color requirements analysis
  - Basic land recommendations
  - Consistency ratings

- **Technical Foundation**
  - React 18 with TypeScript
  - Material-UI component library
  - Redux for state management
  - Firebase integration

### Technical Stack

- Frontend: React 18, TypeScript, Material-UI
- Backend: Firebase Functions, Firestore
- Build: Create React App
- Deployment: Firebase Hosting

---

## 📋 Version History Summary

| Version   | Date       | Description                                                             |
| --------- | ---------- | ----------------------------------------------------------------------- |
| **2.2.0** | 2026-04-06 | 🔄 **Rebrand** - ManaTuner Pro → ManaTuner, custom domain manatuner.app |
| **2.1.0** | 2026-04-05 | ⚡ **Performance & Quality** - 4 audit sprints, ~8s to ~1s analysis     |
| **2.0.0** | 2025-06-22 | 🚀 **Production Ready** - Major rewrite with Vercel deployment          |
| 1.5.0     | 2025-06-15 | Multi-format support and enhanced visualizations                        |
| 1.4.0     | 2025-06-10 | Special lands support and export functionality                          |
| 1.3.0     | 2025-06-05 | Real-time updates and archetype detection                               |
| 1.2.0     | 2025-05-28 | Interactive charts and detailed analysis                                |
| 1.1.0     | 2025-05-20 | Turn-by-turn analysis and visualizations                                |
| 1.0.0     | 2025-05-15 | 🎉 **Initial Release** - Core functionality                             |

---

## 🔗 Links

- **Live Demo**: [manatuner.app](https://manatuner.app)
- **Repository**: [github.com/gbordes77/manatuner](https://github.com/gbordes77/manatuner)
- **Issues**: [GitHub Issues](https://github.com/gbordes77/manatuner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gbordes77/manatuner/discussions)
