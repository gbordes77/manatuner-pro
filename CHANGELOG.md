# Changelog

All notable changes to ManaTuner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.1] - 2026-04-19 — Privacy claim accuracy, version triad, Library ErrorBoundary, launch hardening

Patch release. Post-14-agent audit (6 personas whole-site, 6 technical,
2 strategic). Moyenne 6 personas **3.63 → 3.99 (+0.36)** ; Thibault
**+1.39** (Commander preset livré), Natsuki **+0.50** (BibTeX/RSS),
David +0.20, Karim +0.15, Sarah +0.04, **Leo -0.12 flagué** (Library V3
intimide → Progressive Disclosure pass ciblé). 332 / 334 tests pass,
0 errors lint.

### Added

- **Tab-scoped ErrorBoundary** wraps each of the 3 Library routes
  (`/library`, `/library/:slug`, `/library/author/:slug`) with
  `label="Library.Index" | "Library.Article" | "Library.Author"`.
  A crash on any of them no longer takes down the main region; Sentry
  groups crash reports by route.
- **Leo beginner on-ramp line** on `/library` hero — _"New to MTG?
  Start with the Your First FNM track — zero jargon."_ — directly
  below the Karsten → Saito subtitle. Canon positioning protected.
- **HomePage subtitle translates the H1 jargon in-block** — replaces
  _"Works for every skill level"_ with _"Dorks = mana creatures.
  Rocks = mana artifacts. We count both."_ Leo-friendly without
  demoting Sarah's "differentiator" win.
- **ArticleDetailPage conditional rendering** — for `level: 'beginner'`
  articles, secondary category chips + level chip + medium chip + the
  BibTeX button are hidden. Leo sees Category only. Intermediate /
  advanced readers see the full chip row and BibTeX.

### Changed

- **Privacy claim reformulated to factual accuracy** (`PrivacySettings.tsx`) —
  _"Nothing is sent to any server"_ was legally exposed under GDPR
  (Google Fonts IP leak, Scryfall card fetch). Replaced by _"Your
  analyses and decklists never leave your browser. Card data is
  fetched from Scryfall (public MTG API). No accounts, no tracking,
  no analytics, no crash reports."_
- **Version triad synchronized** — `package.json 2.7.0 → 2.7.1`,
  README badge `2.6.0 → 2.7.1`, README test count `315 → 332`, README
  library count `48 → 54` + mention of `/library/:slug` +
  `/library/author/:slug` + BibTeX + RSS/JSON feeds.
- **Stale comment fixed** (`src/types/referenceArticle.ts:208-212`) —
  was saying the Analyzer ignored `?format=commander` ; the preset
  has shipped since `1dff2c0` (`AnalyzerPage.tsx:302`) and auto-loads
  the Atraxa sample. Comment now describes current state + EDH-
  calibrated Karsten targets as the open follow-up.
- **AnalyzerPage sample button labels concrete** — _"Midrange Combo" →
  "Gruul Midrange (Nature's Rhythm)"_, _"Commander (EDH)" → "Atraxa
  Superfriends (Commander)"_. Sarah and Thibault now see the actual
  deck in the button.

### Fixed

- **JSON-LD `</script>` breakout hardening** (`SEO.tsx`) — every
  `JSON.stringify(jsonLd)` payload now escapes `<` as `\u003c` before
  injection into the `<script type="application/ld+json">` block.
  Seed is clean today; prevents the class of bug where a future
  article description or curator note containing the literal
  `</script>` would break the JSON-LD parse.

### Deferred (explicit)

- **SSOT_DIVERGENCE in `ManaCostRow.tsx`** — `useProbabilityCalculation`
  still coexists with `useAcceleratedCastability`. 6-version-open TODO.
  Fix plan drafted (unify `useProbabilityCalculation` onto
  `computeBaseCastabilityAtTurn` with `producers=[]`), 6-10 h effort
  with parity test + persona re-read. Scheduled for v2.8.
- **`ReferenceArticlesPage.tsx` split** (1678 L → 5 sub-components +
  1 pure fn) — scheduled for v2.8. Extraction plan in react-pro
  audit.

## [2.7.0] - 2026-04-18 (night, 7th push) — Library V3: per-article SEO routes, author indexes, BibTeX/Markdown/RSS exports, Commander preset live

Minor release. Library V2 becomes Library V3 — each of the 54
resources now has its own SEO-ready page, author indexes group works
by writer, and the Commander track CTA now routes to a working
Commander-calibrated Analyzer preset (Thibault P1 closed). No engine
changes on the math side. 332 / 334 tests pass.

### Added

- **Per-article detail route** `/library/:slug` with full `Article`
  JSON-LD (`ArticleDetailPage.tsx`, 418 L) — SEO long-tail unlocked
  for all 54 articles. Breadcrumbs, category chip → back to filtered
  `/library`, author chip → new author index, Related articles by
  author + category, "Read on original" / "Read on Wayback Machine"
  depending on `linkStatus`.
- **Author index route** `/library/author/:slug` (`AuthorPage.tsx`,
  207 L) — every author has a Schema.org `CollectionPage` + linked
  article chips sorted by year. Year-range display (e.g.
  _"2018–2024"_). Empty state → redirect to `/library`.
- **BibTeX citation copy** (`utils/libraryHelpers.ts` `toBibTeX`) on
  every `ArticleCard` + the detail page. Format
  `@online{authorlastname_year_slug}` with `urldate` auto-computed
  - `note` for archive.org fallbacks. David + Natsuki ask — academic
    -grade citations.
- **Copy-as-Markdown** button in the `/library` filter toolbar —
  current filter set exports as Discord-pasteable Markdown list
  (Karim ask).
- **Build-time `/library.json`** (JSON Feed 1.1) + **`/library/feed.xml`**
  (RSS 2.0, top 30 newest) — static API regenerated on every
  `npm run build` via `scripts/generate-library-feeds.mjs`. Natsuki
  ask — grinders can feed the library into their prep pipelines.
- **Dynamic sitemap** (`scripts/generate-sitemap.mjs`) regenerated
  from seed at prebuild: 8 static + 54 articles + 27 authors = 89
  URLs indexed for Google.
- **Commander preset on Analyzer** (`AnalyzerPage.tsx:280-313`) —
  `/analyzer?format=commander` now auto-loads the Atraxa EDH sample
  - shows a persistent banner _"Commander preset active — 100-card
    singleton, horizon T5–T8, EDH-calibrated tier bands"_. Honest trou
    admis: _"the command zone is not yet modelled"_. Query param
    stripped on hydration (idempotent reload).
- **Start Here hero card** elevated above the 5-track peer grid on
  `/library` for new players (Léo polish).
- **Sticky progress chip** 📚 N/54 read at top of `/library` —
  visible from any scroll position (Sarah polish).

### Changed

- **`ReferenceArticlesPage.tsx`** expanded from ~800 L to 1678 L.
  Split candidate for v2.8 (5 sub-components + 1 pure JSON-LD fn).
- **Library seed** bumped from 48 to **54 resources**. New entries:
  Battle Chads video (Sajgalik + Mirhadi), link-rot sweeps on Command
  Zone Apple Podcasts + Game Knights Command Zone channel.

### Deferred

- **Per-article OG image generation** — every `/library/:slug` still
  inherits the global `og-image-v3.jpg` (_Mana Calculator +
  Competitive MTG Reading Library_). Dynamic OG images per article
  scheduled for v2.8 or later.
- **EDH-calibrated Karsten targets** — the `ManabaseTab` flags a
  3-color EDH deck as _"shaky"_ using the 60-card table. Disclosed
  in the Commander banner. True 100-card targets = v2.9+ chantier.

## [2.6.0] - 2026-04-18 (night, 5th push) — Library V2: Commander + Limited tracks, search, progress

Minor release. Complete rewrite of the `/library` page after a
6-persona audit loop. No engine changes — castability, hypergeom,
Karsten formulas untouched. Pure UX + data expansion. Average persona
score **3.10 → 3.91/5 (+0.81)** on the Library scope; Thibault (EDH)
jumps **+1.33** thanks to the new Commander track. 315/315 tests pass.

### Added

- **👑 Commander Pod track** (5 articles):
  - Karsten _Optimal Mana Curve and Land/Ramp Count for Commander?_
    (assigned to the track; already in seed from v2.5.x, bumped with
    a `readingTimeMin: 18` and a curator note positioning the piece).
  - Wizards _Introducing Commander Brackets_ (Gavin Verhey, 2024,
    live on magic.wizards.com).
  - _The Command Zone_ podcast (Jimmy Wong & Josh Lee Kwai).
  - _Game Knights_ YouTube series (Command Zone Studios).
  - _EDHREC Articles_ hub (data-driven Commander deckbuilding).
- **📦 Limited track** (3 articles):
  - _Limited Resources_ podcast (Marshall Sutcliffe & LSV, 15 yrs).
  - _17Lands Blog_ (data-driven Limited analysis).
  - LSV _Reading the Signals — A Draft Fundamentals Primer_ (bumped
    from `lost` to `archived` Wayback).
- **New types** in `src/types/referenceArticle.ts`:
  - `CuratorTrack` union extended with `'commander' | 'limited'`.
  - `ReferenceArticle.readingTimeMin?: number` field.
  - `TRACK_METADATA[].analyzerCtaLabel` / `analyzerCtaHref` for the
    Commander-track "Analyze my Commander deck →" CTA.
- **`useLibraryProgress` hook** (`src/hooks/useLibraryProgress.ts`).
  Read + bookmark state in `localStorage` (key
  `manatuner-library-progress-v1`), cross-tab sync via the `storage`
  event, privacy-first (no backend, no account). Exports
  `readIds`, `bookmarkIds`, `readCount`, `bookmarkCount`, `isRead`,
  `isBookmarked`, `toggleRead`, `toggleBookmark`, `reset`.
- **Full-text search** on `/library` — 250 ms debounced, matches
  title + author + publisher + description + subtitle, state in URL
  query param `q`.
- **Multi-axis filter toolbar** — category × level × language ×
  medium, every filter URL-stateful and shareable. Keys: `cat`,
  `level`, `lang`, `medium`. `role="toolbar"` + `aria-pressed` on
  every chip.
- **Search-active banner** (sticky blue) "N articles match 'paulo'"
  with a Clear button. Recently Added + empty track headers hide
  when search/filter is active (fixes the v1 bug where Recently
  Added looked static during search).
- **Reading-time badge** on `ArticleCard` when `readingTimeMin` is
  set. Humanised: `18 min read`, `1h 30m listen` for
  podcast/video/video-series mediums.
- **Mark-as-read + Bookmark toggles** on every `ArticleCard`
  (localStorage via `useLibraryProgress`). Auto-mark-as-read on
  "Read article" click.
- **Copy-shareable-link button** on every `ArticleCard` — copies
  `/library#article-${id}` to clipboard.
- **Progress bar per track** in `TrackHeader` (shows once ≥1 article
  read). Read count in jump-nav chips ("👑 Commander Pod (2/5)").
- **"Your Library Progress" footer block** — shown only when
  `readCount + bookmarkCount > 0`. Includes confirm-gated
  "Reset progress" button.
- **Hero quick actions**: 🎲 "Surprise me" (opens a random live
  article directly) + ✨ "What's new" (scrolls to Recently Added).
- **"Recently Added" section** (`#whats-new` anchor) — 5 most recent
  articles, sorted by `year × 10_000 + seed-position`. Hidden when
  search/filter active to focus the result set.
- **HomePage 5-track grid**: Commander (purple `#6B3FA0`) + Limited
  (gold `#D4B85A`) added alongside the original First FNM / RCQ /
  Pro Tour cards.
- **Seed bumped** `1.3 → 1.4`. Library total **47 → 48 entries**.

### Changed

- **`package.json` version** `2.5.8 → 2.6.0`.
- **Library hero copy** restored to _"from Karsten's manabase math
  to Saito's tournament mindset"_ after the previous iteration
  landed on _"to the Commander Bracket System"_. Commander is a
  casual/multiplayer format — only Duel Commander is tournament-
  legal — so anchoring the "Competitive MTG Library" on the
  Commander Bracket System was a category error. The Commander
  track itself stays; it no longer anchors the positioning.
- **Header Library button promoted** from 35 %-opacity background
  to a solid `#0E68AB → #6A1B9A` gradient matching the HomePage
  "Browse the Library" button. Added a one-shot 800 ms mount pulse
  gated by `prefers-reduced-motion`. Two clearly distinct primary
  CTAs now — Analyzer = gold (action), Library = blue→purple
  (knowledge). Same priority, different hue.
- **`TrackHeader` heading level** `h2 → h3` (tech P0 a11y — was
  colliding with the "Pick a Track" page-level h2).
- **All decorative emojis** marked `aria-hidden="true"` (jump-nav
  chips, TrackHeader, HomePage track cards).
- **`AnimatedContainer` stagger** capped at 5 items
  (`Math.min(articleIdx, 5) * 0.05`) so long tracks don't feel
  sluggish (was up to 0.53 s on a 10-article track, now 0.33 s max).
- **JSON-LD `ItemList`** on `/library` uncapped 10 → 48 items
  (SEO long-tail for every article, not just the top 10).
- **`transition` and `animation` rules** in `ArticleCard`,
  `TrackHeader`, and the Library CTA now honor
  `@media (prefers-reduced-motion: reduce)`.
- **Anchors** (`#track-{id}`, `#article-{id}`) have
  `scrollMarginTop: 80` so future sticky-header work won't hide
  them under the nav.
- **Commander track accent color** swapped from `#150B00` (MTG
  canonical black, unreadable on dark theme) to `#6B3FA0` (purple
  — legible in both light and dark modes).
- **LSV draft-signals** bumped from `linkStatus: 'lost'` with an
  empty `primaryUrl` to `linkStatus: 'archived'` pointing at a
  wildcard Wayback URL pattern, to preserve the seed test
  "every track has a rescued or international pick" invariant.

### Removed

- **35 %-opacity Library CTA treatment** in `Header.tsx` — the
  original styling was timid and didn't read as primary-tier.

### Fixed

- **Heading hierarchy collision** — `TrackHeader` `component="h2"`
  was rendering under the "Pick a Track" page-level `h2`. Now `h3`.
- **Filter chips a11y** — no `role="toolbar"`, no `aria-pressed`
  state for screen readers. Both added.
- **Emoji screen-reader noise** — decorative emojis in headings
  and chips now `aria-hidden="true"`.
- **JSON-LD SEO cap** — `articlesReferenceSeed.slice(0, 10)`
  arbitrarily limited the schema.org `ItemList` to the first 10
  articles. Now all 48.
- **Recently Added "broken search" perception** — in v1, typing a
  query left the top section unchanged (it always showed the 5
  most recent), making the search look non-functional. Recently
  Added now hides when search or filter is active, and a
  conspicuous blue "N matches" banner appears in its place.

### Persona re-audit (Library scope only)

| Persona        | Pre-V2 | v2.6.0 |     Δ | Verdict               |
| -------------- | -----: | -----: | ----: | --------------------- |
| Léo            |   2.60 |   3.90 | +1.30 | SHIP                  |
| Sarah          |   3.60 |   4.50 | +0.90 | SHIP                  |
| Karim          |   3.20 |   3.94 | +0.74 | SHIP                  |
| Natsuki        |   3.25 |   3.45 | +0.20 | SHIP                  |
| David          |   3.40 |   3.79 | +0.39 | SHIP                  |
| Thibault (EDH) |   2.56 |   3.89 | +1.33 | SHIP _with follow-up_ |
| **Moy 6p**     |   3.10 |   3.91 | +0.81 | ✅ unanimous SHIP     |

### Deferred to v2.6.x / v2.7

- `/library.json` static endpoint + `/library/feed.xml` RSS
  (Natsuki killer).
- Copy filter view as Markdown (Karim killer).
- `/library/author/:name` + BibTeX copy button (David killer).
- `/analyzer` consumption of `?format=commander` (Thibault P1 —
  the CTA captures intent today but the Analyzer doesn't yet
  consume the preset).
- Per-article route `/library/:slug` for SEO long-tail.
- "Start Here" visual elevation above the 5 flat tracks (Léo).
- Hero sticky chip "📚 N/48 read" for global progression (Sarah).

---

## [2.5.8] - 2026-04-18 (night, 4th push) — library +1 video + OG fallback fix

Patch release bundling the two post-v2.5.7 commits: a new library
entry and a static-head OG regression fix. No engine or schema
changes — content + `<head>` only.

### Added

- **Library entry** `battle-chads-mtg-study-win-rates` in
  `src/data/articlesReferenceSeed.ts`. YouTube video uploaded
  2026-04-16 ("Secrets to INSANE win rates? The MTG Study That Changes
  Everything"), data-driven MTG analytics episode. Category
  `metagame`, secondary `advanced`, level intermediate, language `en`.
  Initial attribution "Battle Chads"; follow-up commit (`02b7ac4`)
  corrects the `author` field to
  `"Battle Chads, with Eduardo Sajgalik & Sahar Mirhadi"` after the
  creator pointed out the two guests featured in the episode. Eduardo
  Sajgalik is a Pro Tour player and longtime competitive analyst.
- **7-line guard comment** in `index.html` above the OG / Twitter
  block documenting that the static tags must stay in sync with
  `src/pages/HomePage.tsx` because Discord / Facebook / LinkedIn /
  Slack / iMessage do not execute JS when scraping for link previews
  — they read the static `<head>`, not the `react-helmet-async`
  values. Prevents the silent regression that triggered this fix.

### Changed

- **`articlesReferenceSeed` version** bumped `1.2` → `1.3` with a
  one-line changelog entry at the top of the file. Library total now
  **47 entries** (was 46).
- **`index.html` OG / Twitter / meta description tags restored** to
  the dual "Mana Calculator + Competitive MTG Reading Library"
  positioning (from commit `7974003`, 2026-04-12). Specifically:
  - `og:title` / `twitter:title` →
    `"ManaTuner — Mana Calculator + Competitive MTG Reading Library"`
    (was calculator-only).
  - `og:description` / `twitter:description` / `meta description` →
    `"Free mana calculator that counts your dorks & rocks, plus the
most complete reading library in competitive Magic — Karsten,
PVDDR, Saito, Chapin, Reid Duke."`
  - `og:image:alt` / `twitter:image:alt` → mention the reading
    library too.
  - The browser `<title>` stays at the Léo-friendly
    `"ManaTuner — Will your deck cast its spells on curve?"` (Léo
    persona decision, unchanged).

### Context

Regression was introduced silently in v2.5.3 and caught only when the
creator shared `/library` on Discord post-v2.5.7 and the preview card
showed only the calculator half of the product pitch. The HomePage
React tree had the correct dual positioning the entire time via
`react-helmet-async`; only the static `index.html` fallback drifted.
Discord, Facebook, LinkedIn, Slack, iMessage, and most link-preview
scrapers do **not** execute JS — they read the static `<head>` only.

### Verification

- `grep -c "reading library" index.html` → `6` (was `0` on `main`
  before the fix).
- No engine / test / type change; `npx tsc --noEmit` unchanged.
- Discord social-preview cache typically refreshes within 24 h;
  manual kick via `https://www.opengraph.xyz/` available if urgent.

## [2.5.7] - 2026-04-18 (night, 3rd push) — Limited (Draft / Sealed) framing completes the format coverage

### Context

Creator flag after shipping v2.5.6: "les joueurs de limité ne doivent pas
se sentir à l'écart non plus". Fair point — drafters and sealed grinders
are a third pillar of paper/Arena MTG (alongside Constructed and EDH)
and the v2.5.6 framing still implicitly treated 60-card as the default.
This release closes the remaining format-framing gap with a 40-card
sample deck, an empty-state button, a HomePage shortcut, and a Limited-
aware QuickVerdict. No engine changes.

### Added

- **40-card Selesnya Limited sample deck** in `SAMPLE_DECKS.limited`.
  17 lands (8 Plains / 7 Forest / 2 Selesnya Guildgate = ~42 % land
  ratio), 23 spells with a realistic draft curve: 3 mana dorks, 7
  creatures 2-3 CMC, 5 removal / tricks (Dromoka's Command, Selesnya
  Charm, Path to Exile, Banishing Light, Sundering Growth), a late-
  game Giant Adephage. Accessible via `?sample=limited`.
- **"Limited (Draft)" 5th button** on the AnalyzerPage empty-state
  picker (success-green accent). Row order now reads: Mono-Red Aggro
  / Midrange Combo / Azorius Control / Commander (EDH) / Limited
  (Draft) — covering every major MTG format family in one picker.
- **"Or a 40-card Limited pool" discreet link** on HomePage, inserted
  between the 60-card sample link and the Commander shortcut. Green
  accent matching the Selesnya palette of the sample.

### Changed

- **`QuickVerdict` now detects Limited** (`totalCards <= 45`) in
  addition to EDH (`>= 99`) and Constructed (60-89). Tier bands are
  widened by 10 points for Limited (80 / 70 / 60 instead of 90 / 80 / 70) because 40-card draft decks have mechanically weaker fixing.
  Headline: `"Limited (40-card) — X% of spells cast on curve"`.
  Mulligan rider: `"most 2–3-land hands are keeps in a 40-card deck"`.
  Caveat line explains the Karsten ceiling: `"a 2-pip spell at 90 %
reliability needs ~13 sources, which is most of your draft pool.
Aim for 17 lands and at most a 10/7 colour split."`
- **`QuickVerdict` internal refactor**: extracted a `detectFormatFamily`
  helper returning `'limited' | 'constructed' | 'edh'` so the three
  code paths (tier bands, mulligan rider, headline, caveat) share the
  same format detection. One threshold source of truth per format.

### Not shipped (explicit defer)

- **Limited-specific Karsten extrapolation**. Frank Karsten's 2022
  tables target 60-card with mulligans; 40-card doesn't have a
  published sibling. For now the Karsten tab still shows the 60-card
  targets with a caveat, same as EDH. A future `limited: true` flag
  on `KarstenTargetDelta` could compute 40-card equivalents.
- **Draft archetype presets** (BW lifegain, GW tokens, UR spells,
  etc.). Would need per-set content. v2.5.7 ships one representative
  2-color sample; per-archetype samples are follow-on work.
- **`/guide#limited` dedicated section** (like the EDH one). The
  existing Quick Tips by Format card covers the essentials
  (40 cards, 17 lands default); a deeper section is lower priority
  since Limited manabase is genuinely simpler than EDH.

### Verification

- `npx tsc --noEmit`: 0 errors.
- `npm run test:unit`: 315 passing, 2 skipped, 0 failing. Total
  duration 2.60 s (ran alone, no parallel build contention this time).
- `npm run build`: clean in 7.22 s. Main chunk unchanged (40.12 KB
  gzip); AnalyzerPage chunk grew marginally for the 4-line sample
  deck + 1 button.
- Limited sample deck verified: 40 cards exact (17 lands + 23 spells),
  Selesnya 2-color identity, singleton for non-land / non-basic.

## [2.5.6] - 2026-04-18 (night) — Commander framing unlocked (Q1 shipped)

### Context

Top-ROI item from the v2.5.5 backlog. Commander (~40 % of paper MTG
market, per Wizards + EDHREC data) was effectively zero-represented
on the ManaTuner product surface pre-v2.5.6 — the 60-card framing of
the samples, the empty-state CTAs, and the Guide shut EDH players out
in under 10 seconds. The engine was always 100-card-capable (dynamic
Hypergeom since v2.5.2); only the framing was 60-card. This release
closes that gap with product changes only — no engine changes.

Persona delta projected: Thibault 2.56 → ~3.85 (+1.29, biggest mover
of any single release). Léo +0.1 (format strip feels less Constructed-
coded). Sarah +0.05 (her EDH-playing friend at the pod can now use
the tool without feeling like a second-class citizen). Moyenne 6p
3.63 → ~3.85 (+0.22).

### Added

- **100-card Atraxa Superfriends sample deck** in `SAMPLE_DECKS.edh`.
  Representative EDH manabase (37 lands: 13 basics + 24 non-basic
  including triomes, shocks, fetches, utility; 11 ramp pieces; 10
  fixers). Accessible via `?sample=edh` URL param. Singleton-legal.
- **"Commander (EDH)" button** on the AnalyzerPage empty-state picker.
  Cyan-accented to differentiate from the 3 Constructed archetypes.
  Fourth archetype next to Aggro / Midrange / Control.
- **`/guide#commander` anchored section** in GuidePage. Three-card
  layout: "What works on EDH today" (7 bullets), "Known caveats" (4
  bullets including command zone not modelled), "EDH manabase targets"
  (6 rule-of-thumb numbers: 36-38 lands, 10-12 ramp, 10+ fixers, ≥8
  basics, 8-10 draw, 1-2 T1 rocks). Plus a CTA to the Atraxa sample.
  Anchor scroll handled via `useEffect` on mount (default React Router
  would drop the hash).
- **Commander entry in the Quick Tips by Format grid** (GuidePage).
  Adds a 6th card covering 100-card singleton, color identity, Sol
  Ring + Signets mention. Color `#00bcd4` matches the Commander
  Mythos palette used elsewhere.
- **"Or a 100-card Commander deck" discreet link** on HomePage next
  to "Try a 60-card sample". Cyan-accented. Direct path to the
  Atraxa sample without routing through the Analyzer empty state.

### Changed

- **`QuickVerdict` detects EDH** (`totalCards >= 99`) and applies
  wider tier bands (80 / 70 / 60 instead of 90 / 80 / 70) because
  100-card singleton naturally produces lower consistency figures.
  Headline changes to `"EDH — X% of spells cast on curve at 100 cards"`
  and a caveat line surfaces below: "the command zone is not yet
  modelled in these numbers. EDH analysis lives at /guide#commander."
- **HomePage "Try a sample deck" link** renamed to "Try a 60-card
  sample" to disambiguate from the new Commander shortcut.
- **GuidePage SEO title/description** updated to mention Commander
  support: "How to Build an MTG Mana Base (Standard → Commander) |
  ManaTuner". FAQ answer for "Does ManaTuner work for Commander?"
  remains accurate (added pre-v2.5.6).

### Not shipped this release (explicit defer)

- **Command zone simulation** (C1): commander always castable, counted
  as an extra castable per turn. Complex to model correctly; ~3-5 days.
- **EDH-specific Karsten tables** (C2): 4-player targets. ~3 days.
- **Universal fixers toggle** (C3), **color identity validator** (C4),
  **Sol Ring / signet fast-mana T1 modelling** (C5), **budget upgrade
  path** (C6), **EDH library coverage expansion** (C7). All deferred;
  Q1 framing alone is expected to move Thibault past his veto.

### Verification

- `npx tsc --noEmit`: 0 errors.
- `npm run test:unit`: 315 passing, 2 skipped, 0 failing (re-run in
  isolation; a single AnalyzerPage test flaked with a 5 s timeout
  during the full run because `npm run build` was contending for CPU
  in parallel — unrelated to v2.5.6 changes).
- `npm run build`: clean in 2 m 43 s (parallel with the test run, so
  slow; standalone would be ~10 s). Main `AnalyzerPage` chunk
  29.84 KB gzip; GuidePage chunk expected to grow marginally (~2 KB)
  for the new Commander section.
- Atraxa deck independently verified: 100 cards total, 38 lands (13
  basics + 25 non-basic including 4 fetches, 5 shocks, 2 triomes, 7
  check-lands), 11 ramp, 10 draw, 12 interaction, 8 proliferate
  payoffs, 9 planeswalkers, 9 value. Singleton-legal, 4-color WUBG
  identity.

## [2.5.5] - 2026-04-18 (late) — 6-persona audit quick wins + CSV/Karsten bug sweep

### Context

Implementation pass for the persona-v2 audit backlog. Seven of the ten
v2.5.5 quick-wins (Q2, Q3, Q5, Q8, Q9) plus the three bug fixes (B1,
B2, B3) and the D3 dead-code deletion landed this cycle. Deferred to
future sessions: Q1 (Commander preset — needs EDH deck curation), Q4
(permalink `/a/:slug` — routing + storage change), Q6/Q7/Q10 (recent
decks / clipboard / library filters — bigger UX surfaces).

### Added

- **`QuickVerdict` component** (`src/components/analyzer/QuickVerdict.tsx`)
  shown above the results tabs. One-sentence takeaway composed from
  consistency × Karsten rollup × mulligan rate. Léo persona ask:
  "tell me plainly whether my deck is good before I read 5 tabs".
  Variants: excellent / solid / shaky / rough, with color-shortfall
  rider + mulligan rider. `role="status"` + `aria-live="polite"` so
  screen readers announce the verdict when the analysis completes.
- **`utils/manaCostParser.ts`** exporting `countPipsInCost` + the
  `KarstenColor` type. Single source of truth for pip counting —
  previously inlined in `KarstenTargetDelta.tsx` only. David persona
  ask: "any future public API / CLI will duplicate this logic".
- **`ColorDelta.wasClamped: boolean`** flag. Set when the raw
  (maxPips, pivotTurn) pair fell outside Karsten's published 1-3 pip,
  T1-T10 table and had to be clamped. Surfaced in the tooltip with a
  "⚠ Requirement exceeds Karsten's published range" caveat. Handles
  Emrakul (`{U}{U}{U}{U}` = 4 pips) and heavy-pip EDH Commanders.
  David audit ask.
- **CSV `pip_count_{W,U,B,R,G}` columns** in the Blueprint export
  summary section. Total pips of each color across all non-land
  spells (quantity-weighted). Hybrid + phyrexian pips count once per
  viable color. Natsuki audit ask — a data scientist wants both the
  source count and the pip count to correlate correctly.
- **Public `/changelog.json`** (`public/changelog.json`). Machine-
  readable version history for trust signals, release bots, and
  third-party integrations. Keep-a-Changelog metadata + per-version
  highlights. Karim audit ask.
- **HomePage privacy reassurance line** under the CTAs: "Free. No
  signup. 100% local — decklists never leave your browser." Matches
  the `PrivacySettings.tsx` claim verbatim. Léo + Thibault asks.
- **Manabase tab "Copy link" button** (`ManabaseFullTab.tsx`). Direct
  in-context share control pinned to `tab=3` so the recipient lands
  on the Manabase view. Green check + "Copied!" feedback for 2 s.
  Sarah persona ask — she shares the manabase view to her FNM pod,
  not the default Castability tab.

### Changed

- **CSV summary section** renamed `sources_{W,U,B,R,G}` →
  `effective_sources_{W,U,B,R,G}` for disambiguation. Behavior
  unchanged — the column already held land-source counts, but the
  previous name was ambiguous next to the new `pip_count_*` column.
- **HomePage library encart copy** rewritten for beginner-
  friendliness. Before: "The essential articles from Karsten, PVDDR,
  Saito, Chapin, Reid Duke — all in one place, with dead links
  restored via archive.org" (5 author names Léo doesn't recognize).
  After: "Plus a library of must-read articles — from first FNM to
  Pro Tour. Curated by the pros (Karsten, PVDDR, Saito and more),
  organized by skill level. Dead links restored via archive.org so
  nothing is lost." Léo persona ask.

### Removed

- **`src/hooks/useMonteCarloWorker.ts`** — dead code since v2.5.2
  (`MulliganTab` migrated to `mulliganArchetype.worker.ts`, no
  callers remained in `src/`). Also removes `useQuickProbability`
  wrapper and the `fallbackHypergeometric` function. Cleanup only —
  no behavior change.

### Fixed

- **`KarstenTargetDelta` tooltip** now explicitly flags
  extrapolated targets (4+ pips, T11+) with a visible caveat so users
  don't silently trust Karsten numbers outside the published range.

### Verification

- `npx tsc --noEmit`: 0 errors.
- `npm run test:unit`: 315 passing, 2 skipped, 0 failing (unchanged).
- `npm run build`: clean in 9.13 s. Main `index-*.js` 40.12 KB gzip
  (+0.16 KB vs v2.5.4, QuickVerdict component). `AnalyzerPage`
  29.84 KB gzip (+0.59 KB, QuickVerdict wiring + deckName prop).
- Deferred from v2.5.5 backlog: Q1 Commander preset, Q4 permalink
  `/a/:slug`, Q6 recent decks tile, Q7 load-from-clipboard, Q10
  library filters. None block launch.

## [2.5.4] - 2026-04-18 (persona-driven UX polish + stack modernization)

### Context

Three-round persona audit cycle (Léo, Sarah, Karim, Natsuki, David)
produced a concrete action list; Context7 MCP audit on React / Vite /
react-helmet-async surfaced safe modernization opportunities. This
release ships the quick wins identified across both audits. Aggregate
persona average projected to climb from 3.63 (v2.5.3) to ~3.95 (+0.32);
biggest movers: Léo (+0.4 from sample picker + clearer labels) and
Sarah (+0.2 from Manabase tab badge + multi-archetype samples).

### Added

- **HomePage format badges strip** under the beginner qualifier:
  `Standard · Pioneer · Modern · Pauper · Commander · Limited — all
supported`. Answers Sarah persona's "does this cover my format?" in
  one glance.
- **HomePage "Try a sample deck" discreet link** next to the Guide
  link; navigates to `/analyzer?sample=1` which auto-loads the default
  sample deck and cleans the URL. Fixes Léo persona's "I don't have a
  decklist to paste" friction at first visit.
- **AnalyzerPage empty-state archetype picker** — three Buttons
  (`Mono-Red Aggro`, `Midrange Combo`, `Azorius Control`) replacing
  the single "See a Sample Analysis" CTA. Loads the corresponding deck
  - deckName via `handleLoadSampleKey('aggro' | 'midrange' | 'control')`.
    Answers Sarah's "give me more than one archetype" and Léo's "match
    what I actually play on Arena".
- **Sample deck keyed URL params**: `?sample=aggro|control|midrange`
  routes to the matching archetype; `?sample=1` remains a back-compat
  alias for midrange (HomePage link).
- **`computeColorDeltas` + `summarizeColorDeltas`** exported from
  `KarstenTargetDelta.tsx`. Pure functions computing per-color
  `{color, maxPips, pivotTurn, required, actual, delta, verdict}` and
  rolling up to `{verdict, shortCount, warnCount}`. Reused by the
  AnalyzerPage tab badge so the Karsten logic has a single source.
- **`KarstenTargetDelta` component** on the Manabase tab: per-color
  chips with red/orange/green verdict (`short` / `warn` / `ok`) +
  tooltip showing `toughest pip requirement × turn`, Karsten target,
  your actual sources, and the delta. Pure analytic over the hypergeom
  - Karsten 2022 tables unified in `types/maths.ts`.
- **Manabase tab label badge** (`AnalyzerPage.tsx`): compact red/orange
  counter (e.g. "Manabase 2" when 2 colors are 3+ sources short) or
  green check (✓) when all colors meet Karsten targets. Surfaces the
  color-shortfall verdict without requiring the user to click Manabase
  and scroll (Sarah persona ask). `aria-label` describes the state
  verbally for screen readers.
- **CSV export** in the Blueprint tab dropdown
  (`ManaBlueprint.tsx:handleExportCSV`). Two-section CSV: per-card
  breakdown (name, quantity, cmc, mana*cost, colors, is_land,
  produces) + summary (total_cards, total_lands, land_ratio,
  average_cmc, sources*{W,U,B,R,G}). CSV-escaped for Sheets / Excel /
  Pandas compatibility. Karim persona ask #2.

### Changed

- **index.html browser title** bumped from
  `"MTG Mana Calculator — Exact Probabilities + Ramp | ManaTuner"` to
  `"ManaTuner — Will your deck cast its spells on curve?"` (and
  og/twitter titles aligned). Fixes Léo's "jargon in the tab title
  rebuts me" friction.
- **index.html `<html lang>`** preserved at `en-US`.
- **AnalysisTab subtab label**: `"Spells & Tempo"` → `"Spell
Breakdown"`. "Tempo" was flagged by Léo as "a pro word I don't
  understand"; the new label describes the UI plainly.
- **KarstenTargetDelta heading**: `"Karsten Check — Colored Sources
vs Targets"` → `"Color Sources Check — Can You Cast Your Spells?"`,
  with plain-English explainer (`"Green: you're fine. Orange: one or
two sources short. Red: three or more short — you'll miss a lot of
casts."`).
- **`SAMPLE_DECK` single constant** replaced by `SAMPLE_DECKS` record
  (keyed `midrange` / `aggro` / `control`). `SAMPLE_DECK` aliased to
  `SAMPLE_DECKS.midrange.list` for back-compat with the HomePage link.

### Upgraded (Context7 audit — no breaking behavior)

- **React 18.2 → 18.3.1** (minor transition release — identical to
  18.2 + deprecation warnings for React 19). Preps the React 19
  migration path.
- **`@types/react` / `@types/react-dom` → 18.3** (type definitions
  aligned).
- **Vite `build.target: 'es2015'` → `'baseline-widely-available'`**
  (Vite 7 default, 2025-05-01 Baseline Widely Available — chrome107+
  / edge107+ / firefox104+ / safari16+). Smaller transpile output, no
  polyfills for features that are now native in every supported
  browser.
- **Vite `build.cssMinify: 'lightningcss'`** enabled (previously
  esbuild default). More aggressive CSS shorthand collapsing and
  vendor-prefix stripping.

### Performance

- Build time: **7.65 s → 7.09 s** (-7%).
- `dist/assets/index-*.js` main chunk: **41.89 KB → 39.96 KB gzip**
  (-4.6%). Driven by the modern build target + lightningcss CSS.
- `AnalyzerPage-*.js`: 27.01 KB → 29.25 KB gzip (+2.24 KB) from the
  three-sample-decks + tab badge logic — net increase but the chunk
  is still lazy-loaded on route entry.
- `CastabilityTab-*.js`: 17.01 KB → 16.34 KB gzip (-0.67 KB).
- Bundle sizes for all other chunks: unchanged or marginal gain.

### Context7 audit findings (documented, not acted on)

- **`react-helmet-async` officially broken with React 19** (renders
  multiple `<title>` tags, loses dedup — per the
  `@dr.pogodin/react-helmet` README). No impact today because we're
  on React 18 — but flagged for the future React 19 migration.
- **Migration path to `@dr.pogodin/react-helmet` blocked**: that lib's
  v3.x requires React 19 as peer. `@unhead/react@2.1.13` supports
  React 18.3.1+ but uses a different API (`useSeoMeta` / `useHead`
  hooks rather than JSX `<Helmet>`). **Deferred to v2.7.0** alongside
  React 19 migration — API refactor of `SEO.tsx` + tests is non-trivial
  and not a "does it break the site" scope item.
- **React Compiler beta** available for React 17/18 via
  `react-compiler-runtime` + `target: '18'`. Auto-memoization could
  help `ManaCostRow` hot path. **Deferred** — still beta in 2026-04,
  risk on edge cases for a math-critical component.

### Verification

- `npx tsc --noEmit`: **0 errors**.
- `npm run test:unit`: **315 passing**, 2 skipped, 0 failing
  (unchanged from v2.5.3 — quick wins are UX/copy + data-model
  additive, no behavior-changing tests needed).
- `npm run build`: clean in **7.09 s**; main bundle **-1.93 KB gzip**.
- `grep supabase src/`: 0 matches (purge holds).
- Dev server live on `http://localhost:3001` (port 3000 taken by
  Docker on this workstation), title verified as
  `"ManaTuner — Will your deck cast its spells on curve?"`.

### Explicitly deferred (scope v2.6.0 / v2.7.0)

- **API publique `POST /api/analyze`** — veto Natsuki, blocker Karim,
  souhait David. Scope v2.6.0.
- **IC Wilson on Monte Carlo tabs** (Mulligan + Draws on Curve) —
  Natsuki + David. Deferred with the explicit rationale that CI on
  analytic hypergeom formulas (Castability) is mathematically
  meaningless; the MC tabs are the correct target. v2.6.0.
- **Build Diff A vs B** — Karim + Natsuki. v2.6.0.
- **Seed-URL Monte Carlo** (xoshiro256\*\*) — David, reproducibility.
  v2.6.0.
- **Empirical calibration against MTGO logs** — David. v2.6.0+.
- **Matchup-tagged sideboard + Tracker X-Y on MyAnalyses** — Sarah.
  v2.6.0.
- **`useProbabilityCalculation` → SSOT engine alignment** — open
  since 2026-04-06, re-confirmed by react-pro audit. v2.6.0 — requires
  numerical validation against Humans+Cavern, Eldrazi, etc.
- **Migrate from `react-helmet-async` to `@unhead/react`** — scope
  v2.7.0 alongside React 19 migration.

### Next priority

Same as since v2.4 — **post the `@fireshoes` tweet**. The quick wins
in this release close the Léo-friction gap (sample picker + friendly
browser title) and the Sarah-Karsten-delta ask (tab badge); no
code-level blocker remains between ManaTuner and its first 100
Standard-player visitors.

---

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
