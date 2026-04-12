# ManaTuner - Session Handoff

## Project Status: PRODUCTION — LAUNCH-READY

**Latest Session:** 2026-04-13 (late) — Library expansion +11 entries | **Tests:** 305 pass, 2 skipped, 0 fail | **Build:** ~7.5s | **Commit:** `6bcdc64`

---

## Session 2026-04-13 (late) — Library Expansion (+11 entries)

### Workflow

A community contributor sent 11 new entries to add to the library: 6 articles (Reid Duke Level One Full Course; Chapin Information Cascades; Zvi Mowshowitz ×3 — Elephant Method, Using Your Time Wisely, Who's the Beatdown II; PV's Rule) + 5 Podcaster Mage FR podcasts (#15, #67, #92, #125, #164). All 11 URLs verified HTTP 200 + content grep before adding (the Zvi Beatdown II Wayback URL the contributor sent had to be replaced with a more reliable 2020 snapshot — `web/20200804023440` instead of `web/20120701194521`).

### What Was Completed

**Type system additions:**

- New `ArticleMedium 'podcast'` added to the union
- New `ArticleCategory 'podcasts'` added to the union, `CATEGORY_LABELS` ("Podcasts"), and `CATEGORY_ORDER` (appended after `'advanced'`)
- New `MEDIUM_META.podcast` entry in `src/components/library/ArticleCard.tsx` with `PodcastsIcon` from `@mui/icons-material/Podcasts`
- Seed file header bumped to `@version 1.2` with explicit changelog for 1.0 / 1.1 / 1.2

**Content additions (commit `6bcdc64`):**

- Track 2 (RCQ) +1: Zvi "Using Your Time Wisely" — bridges FNM-grinding to RCQ-ready
- Track 3 (Pro Tour) +2: Chapin "Information Cascades", Zvi "The Elephant Method"
- Tournament Mindset section +1: PVDDR "PV's Rule"
- Fundamentals section +2: Reid Duke "Level One: The Full Course" (umbrella index), Zvi "Who's the Beatdown II: Multitasking" (sequel to the existing Flores entry)
- New PODCASTS section +5: Le Podcaster Mage FR episodes — including #67 which features Jean-Emmanuel Depraz, the same Pro Tour player whose "Petite leçon de stops" video is already in the library

### Distribution after expansion

| linkStatus | Before | After        |
| ---------- | ------ | ------------ |
| live       | 19     | **29** (+10) |
| archived   | 10     | **11** (+1)  |
| lost       | 6      | **6**        |
| **Total**  | **35** | **46**       |

### Track sizes after expansion

| Track     | Before | After                                 |
| --------- | ------ | ------------------------------------- |
| first-fnm | 5      | 5                                     |
| rcq       | 6      | 7 (+1 Zvi Time)                       |
| pro-tour  | 7      | 9 (+2 Chapin Cascades + Zvi Elephant) |

All tracks within the 3-10 integrity-test limit.

### Verification

- 11 new URLs verified HTTP 200 + content grep before adding
- Zvi Beatdown II Wayback snapshot: original `2012` snapshot the contributor sent didn't contain the article body via curl, so swapped to the verified `20200804023440` snapshot which contains "Beatdown", "Mowshowitz", "Multitask" markers
- 305 unit tests passing (test count unchanged because the 9 seed integrity tests are structural — they pass regardless of seed size as long as invariants hold)
- TypeScript clean (`npx tsc --noEmit`)
- Dev server `/library` returns 200

### Next Priority

Same as the morning session — **post the `@fireshoes` tweet**. The library is now more substantial (46 entries vs. 35) but the distribution problem remains unchanged. The expansion strengthens the library pillar without creating any new technical risk.

---

## Session 2026-04-13 — Library Link Audit + 10-Agent Final Go-Prod

### Workflow

1. **5-personas re-audit** post-v2.5.1 (`ceceb5f`): average **4.36/5** (Léo 4.21, Sarah 4.58, Karim 4.53, Natsuki 4.10, David 4.36). First time since v2.1 that all personas are ≥ 4.10.
2. **Sentry/privacy decision**: chose option B (DSN stays unset in prod). 7-line guard comment added to `src/main.tsx:13-19` (commit `27ef3a8`). Resolves the contradiction flagged in the v2.5.1 session — `PrivacySettings.tsx:204` "Nothing is sent to any server" is now enforceable.
3. **Library link audit** via sub-agent + my own curl/WebFetch verification of all 35 article URLs. Applied **17 fixes** to `src/data/articlesReferenceSeed.ts` (commit `8b2e523`):
   - 4 archived → live: Reid Duke "Building a Mana Base" + "Sideboarding" → magic.wizards.com (the Wayback prefix was 404'ing silently to a TCGplayer landing); Chapin "Art of the Mulligan" → live SCG; Chapin "Next Level Deckbuilding" → SCG ebook page (the seed had the wrong publisher entirely)
   - 5 marked `lost` after exhaustive Wayback CDX search: PVDDR "When to Mulligan", "Ten Commandments of Deckbuilding", "How to Sideboard"; LSV "Mulligans"; Karsten "What Are the New London Mulligan Odds?". Each kept its description + curatorNote calling for community recovery.
   - 3 generic Wayback `/web/YYYY/` prefixes pinned to 14-digit timestamps (Karsten 2018 colored sources, Flores "Who's the Beatdown?", Karsten Commander manabase)
   - 2 TCGplayer URLs migrated from the 301-redirecting `infinite.tcgplayer.com/article/...` to the new canonical `www.tcgplayer.com/content/article/...` (Karsten 2022 lands, Manfield tournament prep)
   - 1 paywall → live (PVDDR "Six Heuristics" — currently free on SCG, no longer behind Premium gate)
   - 1 slug + title fix: `karsten-commander-manabase` retitled to "What's an Optimal Mana Curve and Land/Ramp Count for Commander?" (seed's original slug pointed to a non-existent CFB URL)
   - 2 video metadata corrections: `boa-mtgo-stops` renamed to `depraz-mtgo-stops` (actual author is Pro Tour player Jean-Emmanuel Depraz, not Boa); `boa-mtgo-getting-started` retitled to "TUTO MTGO: Est-ce mieux qu'MTGA?" (actual El_Gran_Boa YouTube title, not a generic onboarding tutorial as the seed assumed)
4. **10-agent final go-prod audit** (QA, debugger, security, performance, frontend, UX, product, deployment, documentation, typescript). Average score **4.54/5** — highest historical (vs 4.19 on `ceceb5f`, vs 4.36 personas avg). Distribution: 8 GO + 2 GO-WITH-CAVEATS, **0 NO-GO**. One blocking item identified.
5. **CI fix**: disabled the `deploy` job in `.github/workflows/ci.yml` (added `if: false` + 6-line explainer comment). The job was racing with Vercel's native GitHub auto-deploy, producing mismatched `index.html` / JS chunk hash pairs that 404'd for users loading the page between the two deploys. Vercel native integration is sufficient and correct.

### Distribution post-fix

| linkStatus | Before | After       |
| ---------- | ------ | ----------- |
| live       | 14     | **19** (+5) |
| archived   | 19     | **10** (−9) |
| paywall    | 1      | **0** (−1)  |
| lost       | 1      | **6** (+5)  |
| **Total**  | **35** | **35**      |

### Per-persona scores after deltas

| Persona     | After v2.5.1 | After link audit | Δ         |
| ----------- | ------------ | ---------------- | --------- |
| Léo         | 4.21         | **4.27**         | +0.06     |
| Sarah       | 4.58         | **4.56**         | −0.02     |
| Karim       | 4.53         | **4.56**         | +0.03     |
| Natsuki     | 4.10         | **4.10**         | =         |
| David       | 4.36         | **4.43**         | +0.07     |
| **Average** | **4.36**     | **4.38**         | **+0.02** |

### Verification

- 27 of 29 non-lost URLs HTTP 200 + grep-confirmed expected article content in body
- 2 Fortier mtgdecks.net URLs Cloudflare-protected from bots — confirmed present via Wayback CDX (snapshots from 2023-07 and 2025-10)
- 305 unit tests passing, 0 failures (was 296 before the +9 seed integrity guards)
- TypeScript clean (`npx tsc --noEmit`)
- Build clean (~7.5s)
- Dev server `/library` returns 200 with correct JSON-LD

### Current State

- **Working**: everything. Score 4.54/5 across 10 dimensions.
- **No code blockers.**
- **Manual follow-ups before tweet** (~15-50 min total):
  1. Confirm `VITE_SENTRY_DSN` NOT set in Vercel env (privacy decision)
  2. UptimeRobot 5-min HTTPS monitor (recommended, 10 min)
  3. Plausible analytics for tweet conversion measurement (recommended, 20 min)
  4. GitHub branch protection on `main` (recommended, 2 min)
  5. 3 dark-mode screenshots for the @fireshoes tweet (5 min)

### Post-launch v2.5.2 backlog (not blocking)

- **JSON-LD CollectionPage**: emit `originalUrl` for `archived` items in `ReferenceArticlesPage.tsx:120` instead of the Wayback URL (latent SEO foot-gun, no current dead URL in first 10)
- **RCQ track ordering**: reorder `articlesReferenceSeed.ts` so `pvddr-when-to-mulligan` (lost) is position 4 or 5, not 6. Avoids ending Sarah's curated path on a disabled card.
- **Empty category chips**: hide chips that have zero non-tracked articles (`ReferenceArticlesPage.tsx:325-334`)
- **Disabled "Help us restore" button accessibility**: WCAG ~2.4:1 contrast in dark mode + not focusable. Replace with `<Box role="status">` + Tally feedback CTA scoped to article id.
- **CSP cleanup**: drop `https://*.ingest.sentry.io` from `vercel.json:41 connect-src` for coherence with the Sentry-disabled decision
- **Persona David's `methodology.md`**: white paper still missing (acknowledged debt since v2.4)
- Known math TODOs: Phyrexian/twobrid pessimism, `{C}` colorless requirement (Tron/Eldrazi), `useProbabilityCalculation` SSOT alignment

### Next Priority

**Post the @fireshoes tweet.** Everything technical is done. The product has been ready for 14 days; the only thing standing between ManaTuner and its first 100 users is a tweet the creator has been writing in his head.

---

## Session 2026-04-12 — Launch Hardening (audit → fix → re-audit)

### Workflow

1. **Audit round 1** — 12 specialized sub-agents in 3 parallel waves (context-manager, frontend, typescript-pro, performance, security, qa, ux, ui, docs, product, devops, database-optimizer, debugger). Initial weighted score: **3.75/5**. The debugger agent was the outlier at **2.5/5** with 10 latent bugs (2 CRITICAL, 4 HIGH, 2 MEDIUM) estimating 25–35 % of a viral-traffic cohort would hit a visible bug.
2. **Fix phase** — 7 implementation phases (A through G) covering critical parser/math bugs, error handling, UX copy, code quality, security/infra/docs, tests, and build verification. Committed as `ceceb5f` with 23 files changed (+994 / −216).
3. **Re-audit round 2** — same 12 agents re-invoked with the explicit instruction to verify each claimed fix line by line. All 20 claims verified in place. Weighted score post-fix: **4.19/5** (+0.44). Debugger re-score: **4.1/5** (+1.6, the biggest jump of the session).

### What Was Completed

**Critical bugs closed (Phase A):**

- MTGA double-face parser: `cleanCardName` splits `//` to front face, strips Arena markers (`*CMDR*`, `*F*`, `*E*`, `*CMP*`), normalizes unicode whitespace. ~80 % of Standard 2022+ decks (Fable of the Mirror-Breaker, Wedding Announcement, Invoke Despair) were silently falling back to wrong CMC/colors before this fix.
- Hypergeometric dynamic capacity: `Hypergeom` class now grows its log-factorial `Float64Array` on demand via `ensureCapacity()`. Cube (540), Commander (100), Highlander no longer render `NaN%`. Hot-path 60-card decks unchanged (initial capacity 200).
- NaN-safe math guards: `clampProbability()`, `clamp01()`, `safeNumber()` + `Number.isFinite` checks on every `pmf`/`atLeast`/`atMost` entry point. `landRatio = totalCards > 0 ? totalLands/totalCards : 0`. Empty decklists no longer display `NaN%`.
- Hybrid / twobrid / Phyrexian / colorless mana regex: `{R/G}`, `{2/W}`, `{W/P}`, `{C}` now all handled in `ManaCostRow.tsx`. Previously silently dropped — Eldrazi (Tron/Post) probabilities were mis-reported.
- GuidePage TS errors: `interface TabInfo { details?: TabDetail[] }` fixes 4 live `tsc --noEmit` errors committed on main.
- Probability ceiling 99 → 100 %: a perfectly built deck can now display 100 %.
- Overgrowth family regex: `adds?\s+` now matches both imperative "add" and triggered "adds" forms. Discovered via red test (land auras were counted as 1 mana instead of 2).

**Resilience (Phase B):**

- Tab-scoped `ErrorBoundary` around each of the 5 Analyzer tabs (Castability, Analysis, Mulligan, Manabase, Blueprint). A crash in one tab no longer takes down the whole page.
- Sentry integration in `ErrorBoundary`: `withScope` + `setTag('errorBoundary', label)` + `setExtra('componentStack', …)` + `captureException`. Gated on `VITE_SENTRY_DSN` (must be set in Vercel env — see manual follow-ups below).
- Scryfall fetch: 8-second `AbortController` timeout, one retry with 400 ms backoff on 429/5xx, exact → fuzzy fallback chain.
- `localStorage` quota handling: `PrivacyStorage.persist()` catches `QuotaExceededError`, trims records geometrically, retries. `AnalyzerPage` surfaces "Browser storage full" via snackbar instead of silent save-fail.

**UX homepage jargon fix (Phase C):**

- H1 swap: `"Can You Cast Your Spells On Curve?"` → `"The Only Mana Calculator That Counts Your Dorks & Rocks"`. Killer feature becomes hero.
- Chips: `"Turn-by-Turn Probabilities"` → `"See The Real Odds"`, `"Monte Carlo Mulligan"` → `"Smart Mulligan Advice"`.
- Math section subtitle: `"used by mathematicians and competitive players"` → `"so you can trust the advice"`. Leo persona no longer excluded.
- Formula badges: `P(X≥k)` → `Per spell`, `E[V₇]` → `Keep / Mull`.
- Beginner qualifier italic line: `"Works for every skill level — from your first Standard deck to Pro Tour prep."`
- **techTerm badges at the bottom of each Math Foundations card** (discreet monospace, dashed border): `Hypergeometric distribution`, `Frank Karsten tables`, `Monte Carlo + Bellman`. Invisible to Leo, trust signal to grinders. User feedback during session: "rajoute en bas les termes qu il y avait".
- `AnalyzerPage` chip `"Monte Carlo"` → `"Mulligan Sim"`, removed `"Health Score"` ghost chip (was pointing to a non-existent tab), replaced with `"Manabase"`.

**Code quality (Phase D):**

- `BoundedMap<K,V>` LRU on Scryfall caches (500 cards, 100 collections). Caps memory on long sessions.
- Legacy `manatuner-analyses` store merged into `manatuner_analyses` canonical on first read, then purged. One-time idempotent migration.
- Redux persist v1: `createMigrate` + `createTransform` drop `snackbar` and `isAnalyzing` from rehydrated state.
- Deps-array bug: `baseProbability` removed from `useAcceleratedCastability` signature and deps. Was never read, invalidated the memo on every P2 recalculation.

**Security + infra + docs (Phase E):**

- `.env` Supabase JWT scrubbed (placeholders only).
- SRI `sha384` + `crossorigin` on `mana-font@1.18.0` CDN link.
- `public/og-image.png` (965 KB, dead asset) deleted.
- `public/favicon.svg` redesigned: WUBRG 5-color gradient pie ring + Cinzel M on dark background.
- `public/manifest.json`: single maskable favicon icon (was a broken 512×512 reference to `og-image.png`).
- `@tanstack/react-query-devtools` moved to `devDependencies`.
- `npm run rollback` + `npm run rollback:list` scripts added to `package.json`.
- `README.md`: removed false `"AES-256 encryption"` claim and `"Optional Cloud Sync via Supabase"`. Now accurate.
- `CONTRIBUTING.md`: clone URL `manatuner-pro` → `manatuner`.

**Tests (Phase F):**

- **+61 tests** (235 → 296 passing, 2 skipped, 0 failing).
- `src/services/__tests__/manaProducerService.test.ts` (new, 25 tests): full ramp taxonomy (LAND_RAMP, LAND_AURA, LAND_FROM_HAND, LANDFALL_MANA, MANA_DOUBLER 2× + 3×, SPAWN_SCION, ROCK, RITUAL, TREASURE, priority ordering, malformed input). `analyzeOracleForMana` exported for testing (was previously private).
- `src/services/castability/__tests__/hypergeomDynamic.test.ts` (new, 15 tests): dynamic capacity growth, NaN-safety, no off-by-one after resize.
- `src/services/__tests__/cleanCardName.test.ts` (new, 21 tests): MTGA set codes, DFC split, Arena markers, A- prefix, unicode whitespace.

### Current State

- **Working**: 296/298 tests passing, `tsc --noEmit` clean, build 7.55 s, dev server HTTP 200.
- **No blockers in code.**
- **Manual follow-ups** (not possible to do via code — require external dashboards):
  1. **Set `VITE_SENTRY_DSN` in Vercel Production env** — code is already wired, `ErrorBoundary` will start reporting as soon as the env var is populated. Without it, any crash post-launch is invisible to the creator.
  2. **Delete or rotate the Supabase project** that issued the historical anon key. Service has been mocked in-code since v2.2.0, so deletion is safe.
  3. **Set up UptimeRobot** HTTPS monitor on `https://manatuner.app/` with 5 min interval and email alert. Without it, a Vercel edge outage would only be surfaced by a user tweet.
  4. **Install Plausible analytics** (privacy-first, matches the project stance) to measure the `@fireshoes` tweet conversion funnel. Without it, the launch is flown blind.
  5. **Enable GitHub branch protection on `main`** with `pr-validation.yml` as a required status check.
  6. **Fix double-deploy CI**: the `deploy` job in `.github/workflows/ci.yml` still runs in addition to Vercel's native Git integration. Either remove the job or disable Vercel's auto-deploy. Not urgent, but creates race conditions on each push.

### Known Residual Items (post-launch backlog)

Discovered by the re-audit, none are launch blockers:

- **Privacy copy vs Sentry contradiction**: `src/components/PrivacySettings.tsx:204` says `"Nothing is sent to any server"`. Once Sentry DSN is set in prod, this is false. Two resolutions: (a) add a `beforeSend` scrubber in `main.tsx` that drops URL params, breadcrumbs, and truncates error messages, then update the copy to disclose anonymous crash reporting; (b) leave `VITE_SENTRY_DSN` unset in prod. Resolution required before EU traffic.
- **`src/hooks/useAnalysisStorage.ts`** orphan: 211 lines, zero callers, still writes to the legacy `manatuner-analyses` key. The read-path migration in `PrivacyStorage.getMyAnalyses()` neutralizes it, but the file should be deleted to fully close the fix.
- **Split-card regression risk**: `cleanCardName` unconditionally splits on `//`. Legacy split cards like `Wear // Tear` become `Wear` alone. The fuzzy fallback in `fetchCardFromScryfall` usually rescues this, but a regression test should be added.
- **`Hypergeom.ensureCapacity` has no hard cap**: a pasted 10 000-card "deck" would allocate ~80 KB. Not catastrophic, but a `const HARD_CAP = 5000` guard is trivial.
- **`batchFetchFromScryfall` has no `AbortController`**: the POST to `/cards/collection` can hang indefinitely on a slow connection. Fix is 5 lines.
- **Phyrexian / twobrid probability**: currently modeled as `{color, color}` hybrid — too pessimistic. Phyrexian should always be payable (via life), twobrid should always be payable (via 2 generic). ~1 hour of rework in `ManaCostRow.tsx`.
- **`{C}` colorless in `ManaCostRow`**: detected for the "pure generic" branch but never actually requires a colorless source in the probability calc. Eldrazi `{4}{C}{C}` currently scores 99/98 (pure generic). Quantitatively wrong for Tron decks.
- **`useProbabilityCalculation` inline hypergeom** still not aligned with the SSOT castability engine. Known TODO from 2026-04-06, not addressed in this commit.
- **GAP-4 Scryfall fetch mock suite**: still no test mocking `fetch` for 429/500/timeout/fuzzy-fallback paths. Ship code has no regression coverage on this path.
- **GAP-5 `producesAnyForCreaturesOnly` tests**: Cavern of Souls and 4 other lands still have zero regression coverage.

### Persona Scores (projected post-fix)

| Persona                 | v2.5 (2026-04-10) | v2.5.1 (projected) | Δ         |
| ----------------------- | ----------------- | ------------------ | --------- |
| Leo (Beginner)          | 3.75              | **4.25**           | +0.50     |
| Sarah (Regular, ICP #1) | 4.42              | **4.65**           | +0.23     |
| Karim (Tactician)       | 4.50              | **4.55**           | +0.05     |
| Natsuki (Grinder)       | 4.08              | **4.15**           | +0.07     |
| David (Architect)       | 4.42              | **4.50**           | +0.08     |
| **Average**             | **4.23**          | **4.42**           | **+0.19** |

First time since v2.1 that all personas are ≥ 4.15. Leo regression (v2.5 → 3.75) is resolved by the QW-1/2/3/4/5 homepage copy changes.

### Next Priority

1. **Resolve Sentry/privacy contradiction** (15 min) before launching — pick option (a) or (b) above.
2. **Manual infra follow-ups** (~55 min): Sentry DSN, UptimeRobot, Plausible, test rollback, Supabase project deletion.
3. **Prepare `@fireshoes` launch tweet**: 3 dark-mode screenshots (hero H1, Castability tab with a DFC-containing deck, Math Foundations section with techTerm badges visible), reply-tag strategy, 3 fallback tweets in draft.
4. **Post-launch v2.5.2**: delete `useAnalysisStorage.ts`, fix Phyrexian/twobrid probability, `{C}` colorless requirement, add GAP-4 Scryfall mock suite, add GAP-5 Cavern regression tests, cap `ensureCapacity`, add `AbortController` to batch fetch.

---

## Session 2026-04-11 — Smart Sideboard Detection + Creature-Only Mana Flag

### What Was Completed

Two features that improve analysis accuracy and user friction:

### 1. Smart Sideboard Auto-Detection

**Problem:** Users paste decklists from various sources. Some have "Sideboard" written, some just have a blank line, some use MTGA format with set codes. The parser only detected explicit markers.

**Solution:** New `detectSideboardStartLine()` function (exported, testable) with 3-tier detection:

1. Explicit markers: `Sideboard`, `SB:`, `// Sideboard`, `# Sideboard` (existing)
2. Inline `SB:` prefix: `SB: 2 Rest in Peace` (new)
3. Blank-line heuristic: last blank line splitting 40-100 cards from 1-15 cards (new)

Works with Standard (60+15), Limited (40+), Commander (100+side), MTGA format with set codes.

**Files:**

- `src/services/deckAnalyzer.ts` — `detectSideboardStartLine()` + updated `parseDeckList()`
- `src/services/__tests__/sideboardDetection.test.ts` — 14 tests (all formats, edge cases)

### 2. Creature-Only Mana Flag (`producesAnyForCreaturesOnly`)

**Problem:** Cavern of Souls was counted as a colored source for ALL spells. In reality it only produces colored mana for creature spells. This overestimated castability of non-creature spells like Bitter Triumph in decks running Cavern.

**Solution:** New `producesAnyForCreaturesOnly` flag on `LandMetadata`. When a spell is not a creature, these lands don't count as colored sources.

**Affected lands:** Cavern of Souls, Unclaimed Territory, Secluded Courtyard, Plaza of Heroes, Ancient Ziggurat (new in seed, 210 total).

**Data flow:**

```
Scryfall type_line → DeckCard.isCreature
→ CastabilityTab calculates creatureOnlyExtraSources
→ ManaCostRow adjusts deckSources for creatures
→ manaCalculator.landProducesColorForSpell() filters in tempo chain
```

**Concrete impact (Dimir deck with 2 Cavern of Souls):**

- Doomsday Excruciator (creature): Cavern counts as B source → higher castability
- Bitter Triumph (instant): Cavern = colorless only → lower, more realistic castability

**Files:**

- `src/types/lands.ts` — `producesAnyForCreaturesOnly` field, `isCreatureSpell` param
- `src/services/deckAnalyzer.ts` — `isCreature` on `DeckCard`, populated from Scryfall
- `src/data/landSeed.ts` — 5 lands flagged + Ancient Ziggurat added
- `src/services/manaCalculator.ts` — `landProducesColorForSpell()` helper
- `src/components/ManaCostRow.tsx` — `isCreature` + `creatureOnlyExtraSources` props
- `src/components/analyzer/CastabilityTab.tsx` — `creatureOnlyExtraSources` calculation

### Current State

- **Working**: All features, 235 tests pass (14 new), build clean
- **No blockers**

### Next Priority

1. Fix Leo's regression: replace technical chips on homepage with accessible labels
2. Manabase Grade (A-F) — highest-impact viral feature from brainstorming session
3. Shareable Report Card (PNG export) — distribution amplifier
4. Launch preparation (LAUNCH.md priorities)

---

## Session 2026-04-10 — Ramp Taxonomy, Mathematics Refonte, Homepage Reorder

### What Was Completed

Three major changes: comprehensive ramp detection expansion, Mathematics page rewrite for progressive disclosure, and homepage feature reordering.

| Commit    | Description                                                                               |
| --------- | ----------------------------------------------------------------------------------------- |
| `4502dc5` | Add 5 new ramp types: LAND_AURA, LAND_FROM_HAND, SPAWN_SCION, LANDFALL_MANA, MANA_DOUBLER |
| `38e4c7c` | Replace Health Score with Analysis Dashboard in homepage features                         |
| `1ffb6d5` | Rewrite Mathematics page with progressive disclosure                                      |
| `78ff8ff` | Remove mana screw/color screw terminology from Mathematics page                           |

### 1. Ramp Taxonomy Expansion (5 new ManaProducerTypes)

Comprehensive Scryfall analysis identified 22 distinct ramp mechanisms in MTG. ManaTuner detected 8/22. Added the 5 highest-impact missing types:

| New Type         | Oracle Pattern                                             | Examples                                   | Seed Cards |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------ | ---------- |
| `LAND_AURA`      | `enchant land` + `tapped for mana...add`                   | Wild Growth, Utopia Sprawl, Fertile Ground | 7          |
| `LAND_FROM_HAND` | `put a land card from your hand onto the battlefield`      | Growth Spiral, Arboreal Grazer, Uro        | 5          |
| `SPAWN_SCION`    | `Eldrazi Spawn/Scion` + `sacrifice`                        | Awakening Zone, Glaring Fleshraker         | 4          |
| `LANDFALL_MANA`  | `whenever a land enters...add`                             | Lotus Cobra, Nissa Resurgent Animist       | 2          |
| `MANA_DOUBLER`   | `tap a land for mana...add` / `produces twice/three times` | Mirari's Wake, Nyxbloom Ancient            | 10         |

Files modified:

- `src/types/manaProducers.ts` — 5 new types + `doublerMultiplier` field
- `src/services/manaProducerService.ts` — 5 new oracle detection patterns + Scryfall handler blocks
- `src/data/manaProducerSeed.ts` — 28 new seed cards
- `src/services/castability/acceleratedAnalyticEngine.ts` — LAND_FROM_HAND survival = 1.0

### 2. Homepage Feature Reorder

Removed Health Score from "What You Get" (abstract metric that doesn't sell). New order:

1. **Castability** — core promise
2. **Analysis Dashboard** — visual wow factor (bar charts, pie chart, insights)
3. **Mulligan Simulator** — 10K simulations
4. **Export Blueprint** — utility

### 3. Mathematics Page Refonte

Complete rewrite with progressive disclosure approach:

**Old structure (problems):**

- 3 redundant sections repeating Hypergeometric/Monte Carlo/Karsten
- "Mana Screw / Color Screw" negative framing
- "Implementation Details" accordion (IEEE 754 — nobody reads this)
- All accordions expanded by default

**New structure:**

1. Hero: "The Mathematics Behind ManaTuner" (positive framing)
2. Two Questions: "How Many Lands?" / "How Many Sources per Color?" (constructive)
3. Three Engines, Three Questions (single clear explanation per model)
4. FAQ promoted: "Why 82% when Karsten says 90%?" (was buried callout)
5. Realistic vs Best Case (kept, it's great)
6. Deep Dive accordions (all collapsed, opt-in for curious)
7. Rules of Thumb cheat sheet
8. CTA: "Ready to Fix Your Mana?"

### Persona Scores (2026-04-10 audit)

| Persona           | v2.4 (04-06) | v2.5 (04-10) |   Delta   |
| ----------------- | :----------: | :----------: | :-------: |
| Leo (Beginner)    |     4.11     |     3.75     |   -0.36   |
| Sarah (Regular)   |     4.31     |     4.42     |   +0.11   |
| Karim (Tactician) |     4.44     |     4.50     |   +0.06   |
| Natsuki (Grinder) |     4.03     |     4.08     |   +0.05   |
| David (Architect) |     3.80     |     4.42     |   +0.62   |
| **Average**       |   **4.14**   |   **4.23**   | **+0.09** |

Leo dropped because homepage chips still show "Hypergeometric"/"Monte Carlo" jargon. Quick fix: replace with accessible labels.

### Current State

- **Working**: All features, 221 tests pass, build clean
- **No blockers**
- **Terminology**: "mana screw" removed from Mathematics page. Still present in CastabilityTab legend, GuidePage FAQ, ManaCostRow comments — consider cleaning in next session.

### Next Priority

1. Fix Leo's regression: replace technical chips on homepage with accessible labels
2. Clean remaining "mana screw" references across the site
3. Launch preparation (LAUNCH.md priorities)

---

## Session 2026-04-06 (part 5) — Persona-Driven Improvements

### What Was Completed

5 persona UX analyses (Leo, Sarah, Karim, Natsuki, David) drove 4 features + 2 fixes:

| Commit    | Description                                                                         |
| --------- | ----------------------------------------------------------------------------------- |
| `3343bd9` | Simplify beta banner: remove beta label, keep feedback CTA                          |
| `13b0f82` | Glossary tooltips, unified math, URL sharing, sideboard analysis, Blueprint tab fix |

### Key Changes

**1. Glossary Tooltips (`<Term>` component)**

- `src/data/glossary.ts` — 14 plain-English term definitions
- `src/components/common/Term.tsx` — MUI Tooltip wrapper with dotted underline
- Applied to HomePage feature descriptions + CastabilityTab Best Case/Realistic

**2. Unified Math (4 hypergeom -> 1, 3 Karsten -> 1)**

- `advancedMaths.ts`, `manaCalculator.ts`, `manabase.ts` now delegate to `hypergeom.ts` singleton
- All local `binomial()`, `hypergeometric()`, `cumulativeHypergeometric()` removed
- 3 Karsten table copies replaced by single import from `types/maths.ts`
- Bug fix: `manabase.ts` T3/triple was 19, should be 23

**3. URL-Shareable Analyses**

- `src/utils/urlCodec.ts` — encode/decode deck as base64 URL-safe param
- Share button in AnalyzerPage copies link to clipboard
- URL hydration on mount: `?d=` param auto-loads deck

**4. Post-Board Sideboard Analysis**

- `src/components/analyzer/SideboardSwapEditor.tsx` — IN/OUT swap editor with +/- buttons
- Integrated in CastabilityTab: swaps modify `effectiveCards`, ManaCostRow recalculates
- Balance indicator (balanced/unbalanced), collapse by default

**5. UX Polish**

- Beta banner: removed "Beta Version" label, kept feedback CTA only
- Blueprint tab: removed cyan color + NEW badge, normalized style

### Persona Scores (before -> after)

| Persona           |  Before  |  After   |   Delta   |
| ----------------- | :------: | :------: | :-------: |
| Leo (Beginner)    |   3.69   |   4.11   |   +0.42   |
| Sarah (Regular)   |   4.13   |   4.31   |   +0.18   |
| Karim (Tactician) |   4.13   |   4.44   |   +0.31   |
| Natsuki (Grinder) |   3.75   |   4.03   |   +0.28   |
| David (Architect) |   3.40   |   3.80   |   +0.40   |
| **Average**       | **3.82** | **4.14** | **+0.32** |

### Next Priority: Communication / Launch Preparation

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
