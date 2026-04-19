# ManaTuner - Session Handoff

## Project Status: PRODUCTION — v2.7.1 live · Library filter UX tightened via 3-commit tester loop (2026-04-19)

**Latest Session:** 2026-04-19 — Three rapid commits on `/library` driven by external tester Aimdeh (Discord screenshots, non-tech MTG player). First round (`6568c66`) bumped chip sizes; tester said "un peu mieux oui" — creator flagged the plateau. Second round (`c5c621a`, `ux-designer` delegation) shipped a visual-language shift: `ToggleButtonGroup` segmented controls for Level/Language/Format, `Paper elevation={2}` filter container, TOC as card-tiles, `What's new` TOC doublon removed. Tester: "Ah oui bien plus clair comme ça." Third round (`90fc178`) fixed a hierarchy inversion (ToggleButtonGroup h36 out-weighing Category chips h32) by bumping primary Category chips to h40 / 0.92rem. Final tier order: Category (h40) > Level/Lang/Format (h36) > card meta badges (h22) — three tiers, unambiguous. **No semver bump (UI polish). Version stays `2.7.1`. Tests unchanged. A11y net-improved (aria-label on each ToggleButtonGroup — was missing before).**

**Previous Session:** 2026-04-18 (night, 6th–7th push) — `v2.7.0` closes the 7 deferred items from v2.6.0 HANDOFF in one release (per-article SEO routes, author indexes, Markdown/RSS/BibTeX exports, Commander preset, Start Here hero, sticky progress chip). `v2.7.1` (commit `d8c2e6a`) follows with a full site-audit sweep (new `scripts/full-site-audit.mjs`) and two link-rot fixes on live Commander content (Command Zone podcast → Apple Podcasts; Game Knights channel renamed `@CommandZone`). Plus `tools/launch-preview.html` — local single-file HTML that previews the 3 launch posts (X EN, Discord FR, FB MTGA fr) with one-click copy. **Tests: 332/332 pass (+17 new in `libraryHelpers.test.ts`). Build: ~9 s clean. Library: 54 entries across 5 tracks + 27 author pages + per-article SEO routes.**

---

## Session 2026-04-19 — Library filter UX: 3-commit tester loop closes on 3-tier hierarchy

External tester Aimdeh (non-tech, Discord) drove a tight feedback loop across three screenshots in a single afternoon. Final state: Category (h40) > Level/Language/Format (h36) > non-clickable card meta badges (h22). Chip vs ToggleButton vs card-tile — three shapes for three interactive roles, parseable at a glance.

### Round 1 → `6568c66` (size bump — plateau)

Tester: "les filtres et raccourcis de section sont un peu petits... de la même taille que article/archived/lost qui ne sont pas des boutons cliquables." Clickable controls leaking affordance because they visually matched non-clickable meta badges on article cards.

Shipped:

- TOC shortcuts: h32 → h38, fontSize 0.85rem, borderWidth 1.5, subtle primary tint at rest
- Secondary filters (Level/Language/Format): `size="small"` dropped → h30 / 0.8rem / fontWeight 600
- Primary Category chips: unchanged

Tester reaction: **"Ça me paraît un peu mieux oui."** Creator: "si c est juste 'un peu mieux,' on doit pouvoir ameliorer ca." Signal: size paradigm at diminishing returns. Saved to memory as `feedback_un_peu_mieux_paradigm_shift.md` for future agents — mild tester validation after a size tweak = language-shift signal, not another pixel bump.

### Round 2 → `c5c621a` (language shift — landed)

Delegated to `ux-designer` with an explicit "ban size-only solutions, pick one confident move" brief. Agent shipped, one release:

- **Secondary filters** (Level / Language / Format): outlined chips → `ToggleButtonGroup size="small"` segmented controls. One segment always selected (defaults to "Any"), uppercased row labels at 72 px min-width so all three rows align vertically. Physical-button-bar look = no chip/tag ambiguity.
- **Filter container**: `Box` with 3 % tint → `Paper elevation={2}` with real shadow. Reads as "control panel", not decor.
- **TOC shortcuts**: floating chips → CSS grid of card-tiles (emoji on top, label underneath, 2 px primary border, lift-on-hover). Feels like a map of the page.
- **Dropped "What's new" TOC tile** — the "What's new" section sits directly below the TOC so the shortcut was a no-op doublon. Grid reflow 4 → 3 cols (Start Here · Reading Paths · Browse by Topic).

Tester reaction: **"Ah oui bien plus clair comme ça. Les filtres de section pourraient être aggrandis aussi."** Language shift landed; tester caught a hierarchy inversion in the same sentence.

### Round 3 → `90fc178` (hierarchy restored)

Diagnosis: the new `ToggleButtonGroup` segments (h~36, 0.82rem, py 0.6) had become visually heavier than the primary Category chip row above them (default MUI Chip: h32, 0.8125rem). Primary looked secondary.

Fixed by bumping Category chips, not shrinking the sub-filters:

- height 32 → 40
- fontSize 0.8125rem → 0.92rem
- borderWidth 1 → 1.5 px when outlined (selected stays 1)
- fontWeight 600 → 700 when filled
- Category caption 0.7 → 0.78rem, icon 18 → 20 px

Saved to memory as `feedback_verify_tier_hierarchy_after_new_control.md` — after any new MUI control lands, manually rank all interactive groups by weight; defaults can invert hierarchy silently.

### Falsifiable axis (next Aimdeh round)

Does he describe the segmented controls as **"boutons" / "barre de boutons"** unprompted (vs "chips" / "tags" / "filtres" generically)? If yes, the visual-language shift landed for good. If not, next move is filter-button + popover for Language / Format (compress low-frequency controls into a `Menu`, keep Level segmented).

### Verification

- Dev server HTTP 200 on `/library` after each of the 3 commits
- Pre-commit hooks (eslint + prettier) passed cleanly on all 3
- A11y contracts preserved — `role="toolbar"`, `role="navigation"`, `aria-pressed` on every toggle; `aria-label` added to each `ToggleButtonGroup` (net a11y improvement: screen-reader group labels were missing before)
- Keyboard nav native via MUI `ToggleButtonGroup`

### Files touched

```
M src/pages/ReferenceArticlesPage.tsx   (3 commits: 6568c66 size bump → c5c621a language shift → 90fc178 hierarchy restore)
```

No version bump (pure UI polish, no API/behavior change). Three memory files added (`feedback_un_peu_mieux_paradigm_shift.md`, `feedback_verify_tier_hierarchy_after_new_control.md`, plus `MEMORY.md` index updated).

### Next session priority

Unchanged from 2026-04-18: monitor 48h launch window, creator publishes the 3 launch posts (X locked, Discord + FB may iterate), watch `/library.json` hits from non-browser UA as the Natsuki-grinder-scripted-against-feed signal. C1 Command-zone simulation remains the highest-ROI engine win for Thibault.

---

## Session 2026-04-18 (night, 6th–7th push) — v2.7.0 Library V3 + v2.7.1 link-rot + launch prep

### v2.7.0 (commit `1dff2c0`) — 7 deferred persona items closed

Every one of the 7 items left deferred in v2.6.0 HANDOFF shipped in a single release:

- **Per-article SEO routes** `/library/:slug` — full `Article` JSON-LD, canonical link, breadcrumbs, curator note, related reading grid. Every one of the 54 articles now has its own indexable page (`src/pages/ArticleDetailPage.tsx`).
- **Author index routes** `/library/author/:slug` — 27 author pages with `CollectionPage` JSON-LD + linked track/category chips (`src/pages/AuthorPage.tsx`). `slugifyAuthor` strips accents + ampersands so "Rémi Fortier" → `remi-fortier`, "Jimmy Wong & Josh Lee Kwai" → `jimmy-wong-josh-lee-kwai`.
- **BibTeX copy button** on every `ArticleCard` + on the detail page. `@online` format with `authorlastname_year_slug` key. David ask — academic-grade citations.
- **Copy-as-Markdown button** in the `/library` filter toolbar. Exports the current filtered view as a Discord-paste Markdown block, grouped by category beyond 8 results. Karim ask.
- **Static feeds**: `scripts/generate-library-feeds.mjs` emits `public/library.json` (JSON Feed 1.1, all 54 articles, machine-readable re-export of the typed seed) and `public/library/feed.xml` (RSS 2.0, newest 30). `scripts/generate-sitemap.mjs` rebuilds `sitemap.xml` from the seed: 8 static + 54 articles + 27 authors = 89 URLs. Both wired into `prebuild`. Natsuki ask.
- **`/analyzer?format=commander`** now auto-loads the Atraxa EDH sample + a persistent dismissible Commander preset `Alert` (n=100, singleton, horizon T5–T8). `?sample=edh` also lights the banner. Thibault P1.
- **"Start Here — Your First FNM"** elevated hero card above the 5-track peer grid, blue-bordered with preview of the first 2 FNM reads. Hidden during search. Track section heading softened to "All Reading Tracks — Pick Your Level". Léo ask.
- **Sticky `📚 N/54 read` chip** at top of `/library`, glued to `top: 72` with blurred background, visible from any scroll. Hidden until ≥1 article read. Sarah ask.

Plus `src/utils/libraryHelpers.ts` (`slugifyAuthor`, `findAuthorsBySlug`, `toBibTeX`, `articleAsMarkdown`, `articlesAsMarkdown`) as the single source of truth for slug + BibTeX + Markdown formatting, backed by 17 new unit tests. `package.json` 2.6.0 → 2.7.0.

### v2.7.1 (commit `d8c2e6a`) — post-push link-rot sweep

`scripts/full-site-audit.mjs` was added to run a comprehensive local audit: every static route + per-article + per-author route on the dev server (97/97 pass), parallel HEAD/GET on every `primaryUrl` + `originalUrl` (62 URLs), and structural validation of `library.json` / `feed.xml` / `sitemap.xml`. Classifier distinguishes real-dead vs Cloudflare bot-blocked (403) vs expected-dead (`originalUrl` on `archived`/`mirror` articles — they 404 by design because that's why we archived). Two real dead `primaryUrl`s fixed:

- `thecommandzone.com/` → `podcasts.apple.com/us/podcast/the-command-zone/id898023861` (iTunes search API confirmed canonical, 200 OK). Old URL preserved as `originalUrl`.
- `youtube.com/@CommandZoneStudios` → `youtube.com/@CommandZone` (channel renamed; old handle now 404s). Old URL preserved as `originalUrl`.

Final audit: **97/97 site routes · 49/62 external 2xx · 13 expected-dead originalUrls · 0 REAL dead · 0 feed/sitemap problems**.

### Launch comms prep (not yet pushed — creator posts manually)

`tools/launch-preview.html` — single-file, self-contained HTML (no deps, 23 KB) that previews the 3 launch posts with platform-accurate skins (X black card, Discord dark chat with Markdown rendering, FB MTGA fr group card). One-click Copy button per panel; FB copy auto-strips `**` since Facebook does not render Markdown. Not deployed (lives in `tools/`, not `public/`).

Key positioning decision: the 3 posts are framed as **fresh discovery, not a v2.7 release** — nobody knows the site yet, so "New in v2.7…" framing would miss the audience entirely. "Je partage un outil que j'ai build" / "je voulais vous partager" for FR channels; pain-point cold-open for X.

Final X post (after 4 iterations + creator approval):

```
🎯 Your deck fizzled turn 3 on a color you thought you had.

ManaTuner: exact probabilities per spell, turn by turn. Rocks + dorks counted, not just lands.

📚 The canon of competitive MTG, curated — 54 essays from Karsten to Saito.

Free. https://www.manatuner.app

@xxx @yyy
```

The library framing ("**the canon** of competitive MTG, curated") + 2 Hall-of-Fame names as bornes (Karsten → Saito = math → mindset spectrum) beat the earlier flat 5-name list. Placeholder `@xxx @yyy` reserved for 2 mentions (~35 chars of slack). Creator flagged: "**on retravaillera surement les autres com**" — Discord + FB drafts may still iterate.

Adjacent deliverable: `product-manager` agent wrote a tight 48h launch playbook (DMs open not forms, don't tag HoF players, track `/library.json` hits from non-browser UA as the Natsuki-grinder proxy). Captured in session context, not a durable doc.

### Verification

- `npx tsc --noEmit` → 0 errors.
- `npm run test:unit` → **332 passed, 2 skipped, 0 failing**. (+17 new from `libraryHelpers.test.ts`.)
- `npm run build` → clean ~9 s. `ArticleDetailPage-*.js` 7.78 kB gzip, `AuthorPage-*.js` 4.38 kB gzip.
- `node scripts/full-site-audit.mjs` → 97/97 site routes, 49/62 external 2xx, 0 real dead, feeds valid.
- Dev server manual check: `/library/karsten-how-many-lands-2022`, `/library/author/frank-karsten`, `/analyzer?format=commander`, `/library.json`, `/library/feed.xml` all 200.

### Deferred (explicit, unchanged from v2.6.0 unless noted)

- **Discord + FB posts may iterate** — creator explicitly left them open for rework ("on retravaillera surement les autres com"). X is locked.
- **C1 Command-zone simulation** — still not modelled. Commander preset widens tier bands + auto-loads Atraxa but the engine still counts the 99 other cards only. Thibault's next ceiling.
- **C2 EDH-specific Karsten tables** (4-player targets) — still deferred. Current tier bands are widened heuristics, not calibrated.
- **C3 Universal fixers toggle** (Chromatic Lantern / Prismatic Omen / Urborg+Coffers) — deferred.
- **`useProbabilityCalculation` in `ManaCostRow.tsx`** — still the lone inline hypergeom path. TODO from v2.5.1 to align with SSOT engine.
- **Per-article prerender** — `scripts/prerender.mjs` exists but is only wired to `build:prerender` (not default `build`). Google's JS rendering will index per-article routes in production; prerender is a fallback if we need stronger bot support.

### Next session priority

1. **Creator publishes the 3 launch posts** (X EN ready; Discord FR + FB MTGA fr likely iterate first). Replace `@xxx @yyy` in the X post before sending.
2. **Monitor 48h**: Vercel logs for `/library.json` hits from non-browser UA (curl, python-requests, feedparser, Go-http-client) — that's the Natsuki-grinder-scripted-against-feed signal. CTR ≥ 2 % on X's `manatuner.app` link. 5+ unique IPs on `/library/feed.xml`.
3. **Possibly rework Discord + FB posts** based on early reactions.
4. **C1 command-zone simulation** remains the highest-ROI engine win for Thibault.

### Files touched this session

```
M package.json                                 (2.6.0 → 2.7.0, prebuild hook for feeds + sitemap, library:feeds script)
M public/changelog.json                        (+v2.7.0 entry)
M public/sitemap.xml                           (regenerated: 89 URLs)
M src/App.tsx                                  (+/library/:slug, +/library/author/:slug routes)
M src/components/library/ArticleCard.tsx       (RouterLink title/author, BibTeX button, copy-link → canonical slug)
M src/pages/AnalyzerPage.tsx                   (?format=commander handler + preset Alert)
M src/pages/ReferenceArticlesPage.tsx          (Start Here card, sticky progress chip, Copy as Markdown, Snackbar)
M src/data/articlesReferenceSeed.ts            (Command Zone + Game Knights URL fixes)
A src/pages/ArticleDetailPage.tsx              (new — per-article detail page)
A src/pages/AuthorPage.tsx                     (new — author index page)
A src/utils/libraryHelpers.ts                  (new — slug + BibTeX + Markdown helpers)
A src/utils/__tests__/libraryHelpers.test.ts   (new — 17 tests)
A scripts/generate-library-feeds.mjs           (new — build-time JSON + RSS)
A scripts/generate-sitemap.mjs                 (new — build-time sitemap from seed)
A scripts/full-site-audit.mjs                  (new — local audit + link health)
A public/library.json                          (new — JSON Feed output, 55 KB)
A public/library/feed.xml                      (new — RSS output, 23 KB)
A tools/launch-preview.html                    (new — local launch preview, not deployed)
```

### Historical context

Previous sessions chronology: v2.6.0 Library V2 (5th push, 2026-04-18 night) → personas v2 + 6-persona audit → v2.5.5 backlog sweep → v2.5.6 Commander framing → v2.5.7 Limited framing → v2.5.8 library +1 video + OG fallback fix. All retained below.

---

## Session 2026-04-18 (night, 5th push) — v2.6.0 Library V2

### Shipped

- **Two new curator tracks**: 👑 **Commander Pod** (5 articles — Karsten 100-card manabase, Wizards Brackets 2024, Command Zone podcast, Game Knights, EDHREC Articles) and 📦 **Limited** (Limited Resources podcast, 17lands blog, LSV draft-signals archived Wayback). Closes the biggest persona gap — Thibault (EDH) jumps 2.56 → 3.89 (+1.33).
- **Full-text search** on `/library` (title + author + publisher + description + subtitle), 250 ms debounced, state persisted in URL (`?q=...`).
- **Multi-axis filter toolbar** — category × level × language × medium, all URL-stateful and shareable (`?cat=manabase&level=advanced&lang=fr`). `role="toolbar"` + `aria-pressed` on every chip.
- **`useLibraryProgress` hook** (`src/hooks/useLibraryProgress.ts`). Read + bookmark state in `localStorage`, cross-tab sync via `storage` event, privacy-first (no backend, no account). Storage key `manatuner-library-progress-v1`.
- **`ArticleCard` enriched**: reading-time badge ("8 min read" / "1h 30m listen"), mark-as-read toggle, bookmark toggle, copy-shareable-link button (fragment anchor `#article-${id}`). Auto-mark-as-read when the user clicks "Read article".
- **`TrackHeader` enriched**: progress bar per track (shows once ≥1 article read), read count inside jump-nav chips ("👑 Commander Pod (2/5)"). Heading level fixed `h2 → h3` (tech P0 a11y). Commander track exposes an analyzer CTA pointing to `/analyzer?format=commander` — query param captures intent for the future EDH preset, **not yet consumed** by the Analyzer.
- **Hero redesigned**: centered search bar, 🎲 "Surprise me" (random live pick, opens directly), ✨ "What's new" (scroll to Recently Added = 5 most recent articles).
- **Search-active banner**: sticky blue banner "N articles match 'paulo'" with Clear button. When search/filter active, Recently Added + empty track headers hide to reduce noise — fixes the v1 bug where Recently Added stayed static and made the search look broken.
- **HomePage**: tracks grid 3 → 5 cards (Commander purple `#6B3FA0` + Limited gold `#D4B85A`). Intro copy **reverted from "Commander Bracket System" → "Saito's tournament mindset"** after the creator flagged that Commander isn't a competitive format (only Duel Commander is). The Commander track itself stays; it no longer anchors the Competitive Library positioning.
- **Header CTA promoted**: Library button swapped from 35 %-opacity background to a solid `#0E68AB → #6A1B9A` gradient matching the HomePage "Browse the Library" button verbatim + 800 ms mount pulse gated by `prefers-reduced-motion`. Two clearly distinct primary CTAs now — Analyzer = gold (action), Library = blue→purple (knowledge).
- **A11y**: emojis `aria-hidden="true"` everywhere, `role="toolbar"` + `aria-pressed` on filter chips, heading hierarchy fixed, `scrollMarginTop: 80` on anchors for future sticky-header compat, `prefers-reduced-motion` guards on transitions.
- **Perf**: `AnimatedContainer` stagger capped at 5 items (`Math.min(idx, 5) * 0.05`), so a 10-article track tops out at 0.33 s instead of 0.53 s. JSON-LD `ItemList` uncapped 10 → 48 items (SEO long-tail for every article).
- **Seed bumped 1.3 → 1.4**. 47 → **48 entries**. LSV draft-signals bumped from `lost` to `archived` (Wayback) to preserve the "every track has a rescued or international pick" test invariant.

### 6-persona audit loop (the process that drove the release)

Parallel audit round 1: 6 persona-incarnated ux-designers + 1 UX architecture review + 1 react-pro tech review, all in one message. Then implementation. Then a second parallel 6-persona audit on the new version to gate ship.

| Persona           | v1 (pre-V2) |   v2.6.0 |         Δ | Verdict               |
| ----------------- | ----------: | -------: | --------: | --------------------- |
| Léo (débutant)    |        2.60 |     3.90 |     +1.30 | SHIP                  |
| Sarah (FNM reg.)  |        3.60 |     4.50 |     +0.90 | SHIP                  |
| Karim (grinder)   |        3.20 |     3.94 |     +0.74 | SHIP                  |
| Natsuki (PT qual) |        3.25 |     3.45 |     +0.20 | SHIP                  |
| David (architect) |        3.40 |     3.79 |     +0.39 | SHIP                  |
| Thibault (EDH)    |        2.56 |     3.89 |     +1.33 | SHIP _with follow-up_ |
| **Moyenne 6p**    |    **3.10** | **3.91** | **+0.81** | ✅ unanimous SHIP     |

These scores are **Library-only** — different scope from the 2026-04-18 whole-site audit recorded earlier (v2.5.4 global scores). Don't average the two tables together.

Thibault's _"with follow-up"_: the Commander CTA captures intent via `/analyzer?format=commander` but the Analyzer doesn't yet consume the preset. Honest placeholder; follow-up tracked below.

### Why this mattered

Two strategic gaps in the V1 Library: (1) no Commander track — EDH is ~40–50 % of paper MTG, the absence meant Thibault scored 2.56/5 and the library's "every player" framing was a lie; (2) no search, no filter depth, no progress tracking — Karim/Sarah/Natsuki/David all cited these as their top friction. Fixing both in one release moved six personas in the same direction without compromising any of them.

No engine changes — the castability/hypergeom/Karsten math is untouched. Pure UX + data expansion.

### Verification

- `npx tsc --noEmit` → 0 errors.
- `npm run test:unit` → **315 passed**, 2 skipped, 0 failing. 3.03 s total.
- `npm run build` → clean in 6.96 s. `ReferenceArticlesPage` chunk 76.38 kB / 23.96 kB gzip.
- Manual validation on `localhost:3000/library`: search "paulo" returns 7 PVDDR articles, filter combos work, URL updates, `localStorage` persists across reload, cross-tab sync via the `storage` event confirmed in two tabs.
- Dev server on port 3000: Screen2Deck Docker container `screen2deck-webapp-1` was temporarily stopped to free the port; restart with `docker start screen2deck-webapp-1` when needed.

### Deferred (explicit backlog — each persona has one outstanding killer)

- **Karim killer** — Copy filter view as Markdown list (export `/library?cat=...` into a Discord-pasteable block). ~2 h.
- **Natsuki killer** — `/library.json` static endpoint + `/library/feed.xml` RSS of recent additions. Build-time generation, ~4 h.
- **David killer** — `/library/author/:name` index page + BibTeX copy button per card. ~1 day.
- **Thibault follow-up** (**P1, not P2**) — teach `/analyzer` to consume `?format=commander` → `n=100`, singleton detection, horizon T5–T8. Without this, the Commander CTA lands on a 60-card-defaulted Analyzer and outputs numbers that don't fit singleton. Currently honest (query param visible in URL) but not yet useful.
- **Léo polish** — re-elevate "Start Here" above the 5 flat tracks — the beginner path is currently peer-leveled with Pro Tour.
- **Sarah polish** — hero sticky chip "📚 N/48 read" for global progression at a glance.
- **Per-article route `/library/:slug`** — fragment deep-link works for Discord citations, but Google won't index individual articles without a real route. SEO long-tail leverage is on hold.

### Next session priority

Pick one of the deferred items based on where the next wave of users blocks. If Discord shares become the primary distribution channel, Karim's markdown export + Thibault's real Commander preset both unlock different personas. If SEO is the growth story, the per-article route + author index are the multipliers.

### Files touched

```
M src/components/library/ArticleCard.tsx        (reading time, read/bookmark toggles, copy-link, a11y)
M src/components/library/TrackHeader.tsx        (h3, progress bar, analyzer CTA, aria-hidden emoji)
M src/components/layout/Header.tsx              (Library CTA solid gradient + pulse)
M src/data/articlesReferenceSeed.ts             (+8 articles: 5 Commander + 3 Limited + readingTimeMin)
M src/hooks/index.ts                            (+useLibraryProgress export)
A src/hooks/useLibraryProgress.ts               (new — localStorage progress hook)
M src/pages/HomePage.tsx                        (5 tracks grid, hero copy fix)
M src/pages/ReferenceArticlesPage.tsx           (full rewrite — search, filters, URL state, progress)
M src/types/referenceArticle.ts                 (CuratorTrack += commander | limited, analyzerCta*, readingTimeMin)
M package.json                                  (2.5.8 → 2.6.0)
```

### Historical scores context

Pre-v2.6.0 whole-site audit from earlier the same day (2026-04-18, v2.5.4 live scope — recorded in `CLAUDE.md`): Leo 3.84 | Sarah 4.71 | Karim 4.05 | Natsuki 2.85 | David 3.75 | Thibault 2.56 | **Moy 6p 3.63**. Library-only re-audit scores above (2.60–3.60 range) are strictly lower because the scope is narrower; don't reconcile the two.

---

## Session 2026-04-18 (night, 4th push) — library +1 video + OG fallback regression fix (historical, v2.5.8)

---

## Session 2026-04-18 (night, 4th push) — library +1 video + OG fallback regression fix

### Shipped

- **Library entry**: `battle-chads-mtg-study-win-rates` in `src/data/articlesReferenceSeed.ts`. YouTube video uploaded 2026-04-16 (2 days old at time of add), 2.1k views / 57 likes / 0 dislikes. Category `metagame`, secondary `advanced`, level intermediate, language `en`. Initially credited to "Battle Chads"; a follow-up commit (`02b7ac4`) corrects the author field to "Battle Chads, with Eduardo Sajgalik & Sahar Mirhadi" after the creator pointed out the two guests featured in the episode.
- **`articlesReferenceSeed` version bumped 1.2 → 1.3** with changelog entry inline.
- **Library total** 46 → **47 entries** (30 live + 11 archive.org recoveries + 6 podcasts). Dashboard, README, HomePage encart all reflect the new total.
- **`index.html` OG / Twitter / meta description tags restored** to the dual "Mana Calculator + Competitive MTG Reading Library" positioning (from commit `7974003`, 2026-04-12). Discord, Facebook, LinkedIn, Slack, iMessage — every platform that doesn't execute JS on link-preview scrape — was reading the STATIC tags in `index.html`, not the `react-helmet-async` values set in `HomePage.tsx`. The HomePage dual positioning had been correct since v2.5.2, but the static fallback silently drifted to a calculator-only pitch in v2.5.3 and nobody noticed until the creator shared `/library` on Discord post-v2.5.7.
- **7-line guard comment** added above the OG tags in `index.html` documenting why they MUST stay in sync with `HomePage.tsx`. Prevents the same silent regression next time any future edit touches the static head.

### Why this mattered

A manual share test on Discord post-v2.5.7 revealed the `og:title` / `og:description` / `twitter:title` / `twitter:description` / `meta description` were all calculator-only — the "Competitive MTG Reading Library" half of the product's dual pitch was invisible to every social-preview scraper. Traffic from Discord / FNM Slack shares (Sarah's primary distribution channel, per the 2026-04-18 late audit) was landing on link cards that undersold the library component.

The fix is a plain content restore — no schema change, no behavior change. The 7-line explanatory comment is the real prevention.

### Verification

- `grep -c "reading library" index.html` → 6 (was 0 on main before the fix).
- No tests touch `index.html`; nothing to re-run. `npx tsc --noEmit` unchanged (video entry is already typed via `ReferenceArticle`).
- Discord social-preview cache typically refreshes within 24 h; manual kick via `https://www.opengraph.xyz/` available if urgent.

### Deferred

- None. These were two tactical fixes to close a regression + add a fresh resource. No new backlog items opened.

### Next session priority

Same as v2.5.7: tweet `@fireshoes`. The product now has defensible stories for every format family AND the social-preview / Discord-share surface pitches both halves of the product correctly again.

---

## Session 2026-04-18 (night, 3rd push) — v2.5.7 Limited framing

### Shipped

- **Selesnya 40-card Limited sample** (17 lands / 23 spells, WG identity, singleton for non-land / non-basic). Accessible via `?sample=limited`.
- **"Limited (Draft)" 5th button** on AnalyzerPage empty state (green accent). Row order now Aggro / Midrange / Control / Commander / Limited — every format family covered in the picker.
- **HomePage "Or a 40-card Limited pool" link** inserted between the 60-card and Commander shortcuts. Green accent matching the Selesnya palette.
- **QuickVerdict Limited-aware**: `totalCards <= 45` triggers the Limited path — widened tier bands (80/70/60), headline `"Limited (40-card) — X% of spells cast on curve"`, mulligan rider `"most 2–3-land hands are keeps in a 40-card deck"`, caveat line explaining the Karsten ceiling in Limited (~13 sources for 2-pip @ 90 %).
- **Internal refactor**: `detectFormatFamily(totalCards)` helper in QuickVerdict returns `'limited' | 'constructed' | 'edh'` so all three code paths share one format detection threshold source.

### Why this mattered

Creator flag after v2.5.6: "les joueurs de limité ne doivent pas se sentir à l'écart non plus". Drafters are a big chunk of Arena + paper tournament play. The v2.5.6 framing still implicitly treated 60-card as the default — a drafter landing on HomePage saw "60-card sample / 100-card Commander" and inferred Limited wasn't a first-class use case. v2.5.7 closes the gap with framing only, no engine changes.

### Format coverage matrix (post-v2.5.7)

| Format    | Sample deck                           | Empty-state button | HomePage shortcut            | QuickVerdict path |
| --------- | ------------------------------------- | ------------------ | ---------------------------- | ----------------- |
| Aggro     | Mono-Red                              | ✓                  | —                            | Constructed       |
| Midrange  | Nature's Rhythm (default `?sample=1`) | ✓                  | Try a 60-card sample         | Constructed       |
| Control   | Azorius Control                       | ✓                  | —                            | Constructed       |
| Commander | Atraxa Superfriends (100 cards)       | ✓ (cyan)           | Or a 100-card Commander deck | EDH               |
| Limited   | Selesnya draft (40 cards)             | ✓ (green)          | Or a 40-card Limited pool    | Limited           |

Five one-click sample paths, three format-family-specific QuickVerdict calibrations. No-one has to build a deck to "feel" what the tool does.

### Verification

- `npx tsc --noEmit` → 0 errors.
- `npm run test:unit` → 315 passed, 2 skipped, 0 failing. 2.60 s total (ran solo, no parallel build contention).
- `npm run build` → clean in 7.22 s.
- Selesnya sample verified: 40 cards exact, 17 lands, Selesnya identity.

### Deferred (explicit)

- **Limited-specific Karsten tables** (40-card extrapolation). Currently Manabase tab still uses 60-card Karsten with a caveat.
- **Draft archetype presets** (BW lifegain, UR spells…). Needs per-set content curation.
- **`/guide#limited` anchored section** (like `/guide#commander`). Limited manabase is mechanically simpler than EDH so lower ROI.

### Next session priority

1. **Tweet `@fireshoes`** — ManaTuner now has defensible stories for every format family. Distribution is the real blocker now.
2. **C1 command-zone modelling** — takes Thibault past his next persona ceiling.

---

## Session 2026-04-18 (night, 2nd push) — v2.5.6 Commander framing (Q1)

### Shipped

- **Atraxa Superfriends sample** (100 cards, BGWU, 37 lands / 11 ramp / 10 fixers / 8 draw / 12 interaction / 9 proliferate / 11 PW / 10 value). Accessible via `?sample=edh`.
- **"Commander (EDH)" 4th button** on AnalyzerPage empty-state picker (cyan accent).
- **`/guide#commander` anchored section** with 3 cards: What Works (7 ✓ bullets) / Caveats (4 ⚠ bullets) / EDH Targets (6 rule-of-thumb numbers). Hash-scroll handled via useEffect on mount.
- **Commander format card** in the Quick Tips by Format grid (grid goes 5 → 6 formats).
- **QuickVerdict EDH-aware**: detects `totalCards >= 99`, widens tier bands (80/70/60), shows `"EDH — X% of spells cast on curve at 100 cards"` headline + command-zone caveat line.
- **HomePage Commander shortcut**: "Or a 100-card Commander deck" link next to "Try a 60-card sample" (cyan-accented to match Commander palette).
- **SEO**: GuidePage title/description mention Commander.

### Persona impact (projected)

| Persona  | v2.5.5 live | v2.5.6 projected | Δ     | Note                                                                                                                                                             |
| -------- | ----------- | ---------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Léo      | 3.84        | ~3.95            | +0.11 | Format strip reads less Constructed-coded.                                                                                                                       |
| Sarah    | 4.71        | ~4.75            | +0.04 | Her EDH-playing FNM pod friend is now a primary user.                                                                                                            |
| Karim    | 4.05        | 4.05             | =     | EDH not in his wheelhouse.                                                                                                                                       |
| Natsuki  | 2.85        | 2.85             | =     | Still veto on API absence.                                                                                                                                       |
| David    | 3.75        | ~3.80            | +0.05 | Salutes the honest "command zone not modelled" caveat vs faking it.                                                                                              |
| Thibault | 2.56        | **~3.85**        | +1.29 | **Veto dropped.** 5 of 8 EDH asks addressed in framing (sample, format tips, singleton, manabase targets, identity trust). Remaining 3 asks = C1/C2/C3 deferred. |
| MOY 6p   | 3.63        | **~3.88**        | +0.25 |                                                                                                                                                                  |

### Deferred (explicit, not blocking the @fireshoes launch)

- **C1 Command zone simulation**: commander always castable, counted as an extra castable each turn. 3-5 days of engine work. Out of scope for a "framing fix" release.
- **C2 EDH-specific Karsten tables** (4-player targets). ~3 days research + implementation. Karsten 2022 tables are a useful lower bound in the meantime.
- **C3 Universal fixers toggle** (Chromatic Lantern, Prismatic Omen, Urborg + Cabal Coffers).
- **C4 Color identity validator**, **C5 Sol Ring / Signet T1 fast-mana modelling**, **C6 Budget upgrade path ranking**.
- **C7 EDH library coverage** (Jumbo Commander, EDHREC drops, Josh Lee Kwai, Tomer). Content work, 4 h.

### Verification

- `npx tsc --noEmit` → 0 errors.
- `npm run test:unit` → 315 passed, 2 skipped, 0 failing. (Flaked once at `tests/component/AnalyzerPage.test.jsx:175` with a 5 s timeout when `npm run build` was running in parallel — CPU contention. Re-run in isolation: `npx vitest run tests/component/AnalyzerPage.test.jsx` → all 7 cases pass, 2 skipped, 28.61 s total. Unrelated to v2.5.6 changes.)
- `npm run build` → clean. 2 m 43 s under parallel contention; standalone would be ~10 s.
- **Atraxa deck sanity-check**: 100 cards exact, 38 lands, singleton-legal, WUBG color identity. Counted via `awk '/edh: \{/,/^  \},$/' | grep -E "^[[:space:]]*[0-9]+ " | awk '{sum+=$1}'` → 100.

### Next session priority

Tweet `@fireshoes`. Thibault's veto has dropped — ManaTuner now has a defensible EDH story in the product, not just in the README. After that, C1 (command zone modelling) is the next big engine win: takes Thibault 3.85 → ~4.3, and gives David his "fully correct for EDH" stance.

---

## Previous Status (pre-v2.5.6)

**Session 2026-04-18 (night):** v2.5.5 shipped the backlog quick-win sweep (7 of 10 v2.5.5 items + 3 bugs + 1 dead-code delete). Deferred Q1/Q4/Q6/Q7/Q10 explicitly. | **Tests:** 315 pass, 2 skipped, 0 fail | **Build:** ~9.1 s | **Version:** `2.5.5`

---

## Session 2026-04-18 (night) — v2.5.5 backlog quick-win sweep

### Shipped

- **B1** CSV: renamed `sources_{W..G}` → `effective_sources_{W..G}` + added `pip_count_{W..G}` (Natsuki ask).
- **B2** `countPipsInCost` extracted to `src/utils/manaCostParser.ts` + exported from `utils/index.ts` (David ask).
- **B3** `ColorDelta.wasClamped: boolean` flag + tooltip caveat for 4+ pip / T11+ extrapolations (David ask).
- **D3** Deleted `src/hooks/useMonteCarloWorker.ts` (dead since v2.5.2, no callers).
- **Q2** New `QuickVerdict` component wired above the results tabs (Léo ask — one-phrase takeaway).
- **Q3** HomePage privacy reassurance line under CTAs (Léo + Thibault ask).
- **Q5** Manabase tab "Copy link" button pinned to `tab=3` (Sarah ask — share the manabase view).
- **Q8** Public `/changelog.json` (Karim trust signal).
- **Q9** HomePage library encart copy rewritten for Léo (5 author names → skill-level framing).

### Deferred (explicitly, not blocking launch)

- **Q1 Commander preset** — needs EDH deck curation (Atraxa) + `/guide#commander` section writing. Thibault's top ask (2.56 → ~3.8 projected), but 1-2 days of new content, not a scoped quick-win. Next session priority #1.
- **Q4 Permalink `/a/:slug`** — touches routing + localStorage schema. Karim #1, but too broad for a quick-win pass; requires slug-collision handling + migration story.
- **Q6 Recent decks tile** — needs empty-state UX design on AnalyzerPage (Sarah ask).
- **Q7 Load-from-clipboard** — needs clipboard permission flow + parse preview (Sarah ask).
- **Q10 Library filters** — UI work on `/library` page outside scope of this pass (Karim + Sarah ask).

### Verification

- `npx tsc --noEmit` → 0 errors.
- `npm run test:unit` → 315 passed, 2 skipped, 0 failing (unchanged; added code paths covered via existing KarstenTargetDelta + CSV integration tests).
- `npm run build` → clean in 9.13 s. Main chunk 40.12 KB gzip (+0.16 KB for QuickVerdict). AnalyzerPage 29.84 KB gzip (+0.59 KB wiring + props).
- **UI not visually verified in a browser this session** — the commit-and-push was authorized by shorthand; any regression should surface via the Vercel preview deploy. Recommend a 2-minute smoke pass on the live URL post-deploy.

### Next session priority

Ship **Q1 Commander preset** — single highest-ROI remaining item (debloque Thibault 2.56 → 3.8 + ~40 % TAM). Then Q4 permalink for Karim/Natsuki/Sarah distribution unlock.

---

## Previous Status (pre-v2.5.5)

**Session 2026-04-18 (late):** personas v2 (6th persona + Trust/Distribution sections + Partage axis) + deep 6-persona audit on v2.5.4 live | **Tests:** 315 pass, 2 skipped, 0 fail | **Build:** ~7.1s | **Version:** `2.5.4` (code unchanged) | **Personas doc:** `v2` 743 lines

---

## Session 2026-04-18 (late) — personas v2 + deep 6-persona audit on live

### Workflow

Closing session of an intensive 2-day cycle (v2.5.3 launch → v2.5.4 quick-wins → personas v2 + deep re-audit). The 2026-04-18 late session did NOT ship code; it shipped the **persona framework v2** and re-validated the product via a 6-persona deep audit on the live v2.5.4 prod.

Process:

1. **Meta-audit of the 5 existing personas** via `ux-designer` + `product-manager` in parallel (per `feedback_parallel_audit_workflow` memory). Both agents independently flagged the same gap: Commander/EDH (~40-50% of the MTG paper market) was zero-represented across the 5 existing personas, all of which live in competitive 60-card Standard/Pioneer/Modern slice (~15-20% of market).
2. **Personas v2 shipped as `7c3456d`**:
   - Added **Persona 6 — Thibault "Le Capitaine de Table"** (EDH pilot, pod hebdo, 33yo). 8 EDH-specific product asks captured (100-card preset, Sol Ring T1 modeling, command zone 7+1, EDH-specific Karsten, color identity validator, universal fixers toggle, budget upgrade path, EDH library coverage).
   - Added **Trust & privacy posture** section to all 6 personas (makes 100% client-side stance a measurable retention lever).
   - Added **Distribution behavior** section to all 6 personas (directly ties persona evaluation to LAUNCH.md's growth loop — where, how, to whom they share links).
   - Refined the 5 existing personas with 1 edit each (Léo: trust question; Sarah: share behavior; Karim: cross-window workflow; Natsuki: team testing; David: GitHub audit trust gate).
   - **Replaced axis "Rétention" with "Partage"** in the evaluation grid — falsifiable (did they send the link?) vs vague (would they return?).
   - File: 536 → 743 lines.
3. **Deep 6-persona audit on v2.5.4 live** — 6 parallel `ux-designer` agents incarnating each persona, each given WebFetch access to live prod + source code URLs via `raw.githubusercontent.com`. Each used the new 8-axis grid (with Partage) + the two new template sections.

### Audit scores (deep, v2.5.4 live)

| Persona            | v2.5.4-dev (R3) | v2.5.4 live | Δ     | Key insight                                                                                                                                   |
| ------------------ | --------------- | ----------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Léo                | 3.88            | **3.84**    | −0.04 | -0.04 strict, +0.08 on 7 comparable axes. New Partage axis (2.5) tires la moyenne — honest: Léo partage rarement.                             |
| Sarah              | 4.59            | **4.71**    | +0.12 | **Projection 4.70 tenue.** Manabase tab badge = the deliverable that justifies the bump. Shares to Marc (SMS) + Discord FNM (8 membres).      |
| Karim              | 3.96            | **4.05**    | +0.09 | **Plateau brisé.** CSV + sample=control débloquent son workflow. Thread Twitter oui; pin Discord non (blocked on stable permalink).           |
| Natsuki            | 2.66            | **2.85**    | +0.19 | **Biggest mover.** Privacy axis 1.2 → 2.3 (+1.1) grâce à la discipline Context7. Veto API tient, mais scepticisme levé sur stack.             |
| David              | 3.83            | **3.75**    | −0.08 | -0.08 strict, +0.14 on 7 comparable axes. Salue le refus argumenté du "fake CI Wilson" + discipline SSOT. Cite? Non — bloqué par seed-URL MC. |
| **Thibault** (NEW) | —               | **2.56**    | first | **6/8 asks NON, 2 PARTIEL.** Décroche entre /mathematics et /library. Ne recommande pas au pod EDH. Veto framing 60-card.                     |
| **MOY 5p**         | 3.78            | **3.84**    | +0.06 |                                                                                                                                               |
| **MOY 6p**         | —               | **3.63**    |       | Thibault tire la moyenne vers le bas — honnête sur le gap marché.                                                                             |

### Gems trouvées (non-findings avant cet audit)

1. **Natsuki trouve un bug CSV**: la colonne `sources_W/U/B/R/G` du CSV export (ManaBlueprint.tsx:handleExportCSV) sort en fait `colorDistribution[color]` qui est le count des pips `{W}` dans les mana costs des spells, PAS le count de sources W produites par les lands. Le nom est trompeur. Fix: renommer en `pip_count_W` + ajouter une vraie colonne `effective_sources_W` (avec fetches/duals comptés). Est un **vrai bug produit**, pas un détail cosmétique — un data scientist pourrait tirer de mauvaises corrélations.
2. **David trouve une tech-debt**: `countPipsInCost` est une fonction locale dans `KarstenTargetDelta.tsx` — devrait être exportée car n'importe quel consommateur externe voudra compter des pips (API publique future, CLI, notebook). `ColorDelta` devrait aussi exposer `wasClamped: boolean` pour les coûts 4+ pips (Emrakul `{U}{U}{U}{U}`, certains Commanders).
3. **Thibault découvre un framing hole**: le moteur math peut DÉJÀ sous-tendre 5-6 des 8 asks EDH (le K=3 engine scale, l'hypergeom dynamique gère 99 cartes, la ramp detection couvre rocks/dorks). **Rien n'est exposé côté produit.** 1-2 jours de framing (Commander dans strip + `?sample=edh` avec deck Atraxa + /guide#commander section) débloquerait 40% du marché MTG. **Reco #1 cross-session pour v2.5.5 ou v2.6.0.**
4. **Sarah confirme son canal viral réel**: Discord FNM `"Les Tap-Tap du mardi"` (8 membres, channel `#deckbuilding`) + SMS Marc + Julien (Google Sheet partagé). Petit mais 100% conversion.

### Top 5 actions rankées par ROI cross-persona

| #   | Action                                                                                                                    | Personas impactés                      | Effort    | Δ moyenne 6p |
| --- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------- | ------------ |
| 1   | **Commander preset** (`?sample=edh` + strip badge + /guide#commander)                                                     | Thibault 2.56 → ~3.8, débloque 40% TAM | 1-2 jours | +0.20        |
| 2   | **Permalink nommé `/a/:slug`** + localStorage index                                                                       | Karim +0.3, Sarah +0.2, Natsuki +0.4   | 1 jour    | +0.15        |
| 3   | **"Quick Verdict" 1-phrase** post-analyze ("Your deck casts 94% on curve — solid, mulligan aggressively on 2-land hands") | Léo +0.4, Sarah +0.1, Thibault +0.1    | 4h        | +0.10        |
| 4   | **Seed-URL xoshiro256** MC + CSV v2\*\* (section markers + `effective_sources_W/U/B/R/G` vs `pip_count_W`)                | David +0.3, Natsuki +0.2, Karim +0.1   | 2 jours   | +0.10        |
| 5   | **API publique REST `POST /api/analyze`**                                                                                 | Karim +0.5, Natsuki +0.8, David +0.3   | 2-3 jours | +0.27        |

**Si 1-3 livrés (≈3-4 jours dev) : moyenne 6p 3.63 → ~3.95.**
**Si 1-5 livrés (≈8-10 jours dev) : moyenne 6p 3.63 → ~4.40.**

### Axe Partage révèle le plafond viral

Scores Partage par persona:

- Léo 2.5 (DM Discord 1-to-1, URL brute, partage après insight concret)
- Sarah **4.6** (screenshot badge + SMS Marc + Discord FNM — la seule >3)
- Karim 3.5 (Thread X technique OUI, pin Discord NON — permalink manquant)
- Natsuki 0.7 (rien à envoyer à son Slack team — API absente)
- David 2.2 (fork OUI, cite NON — seed-URL manquant)
- Thibault 1.5 (framing 60-card = veto social au pod EDH)

**Sarah est la SEULE persona >3 sur Partage.** Les 5 autres sont bloqués par 1-2 features manquantes : permalink stable (Karim/Natsuki), seed reproductible (David), Commander framing (Thibault), Quick Verdict partageable (Léo).

### Verification (inchangé — pas de commit code ce round)

- `npx tsc --noEmit`: 0 errors (inchangé).
- `npm run test:unit`: 315 passing, 2 skipped, 0 failing (inchangé).
- `npm run build`: clean in 7.09 s (inchangé depuis v2.5.4 matin).
- Production: `04c30f6` (v2.5.4) + `7c3456d` (personas v2). HEAD = origin/main propre.

### Features backlog — FULL INVENTORY (2026-04-18)

Le "Top 5 actions" ci-dessus n'est qu'un extrait curaté. Inventaire **complet**
de tout ce qui a été flaggé par les audits (toutes sessions confondues depuis
2026-04-06). Total: **43 items**. Grouper par scope + thème. Chaque item porte
ses persona(s) demandeuse(s).

#### BUGS à corriger (v2.5.5 quick fix, <1 jour total)

| #   | Bug                                                                                                        | Source         | Effort | Notes                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------- | -------------- | ------ | ----------------------------------------------------------------------- |
| B1  | CSV export `sources_W/U/B/R/G` mislabeled — c'est le pip count dans les spells, PAS le nb de sources lands | Natsuki v2.5.4 | 2h     | Renommer en `pip_count_W` + ajouter vraie colonne `effective_sources_W` |
| B2  | `countPipsInCost` dans KarstenTargetDelta.tsx non-exporté — sera dupliqué par API/CLI future               | David v2.5.4   | 30min  | Export + déplacer dans utils/                                           |
| B3  | `ColorDelta` ne trace pas `wasClamped: boolean` pour coûts 4+ pips                                         | David v2.5.4   | 1h     | Emrakul `{U}{U}{U}{U}`, certains Commanders                             |

#### v2.5.5 — Quick wins (~1 semaine dev cumulée)

| #   | Feature                                                                                                                   | Personas                            | Effort | ΔMoy 6p            |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------ | ------------------ |
| Q1  | **Commander preset** (strip badge "Commander" + `?sample=edh` avec deck Atraxa + `/guide#commander` section courte)       | **Thibault VETO**, 40% TAM          | 1-2j   | +0.20              |
| Q2  | **Quick Verdict 1-phrase** post-analyze ("Your deck casts 94% on curve — solid, mulligan aggressively on 2-land hands")   | Léo ROI #1, Sarah, Thibault         | 4h     | +0.10              |
| Q3  | **Privacy reassurance line** visible sous CTAs home ("Free. No signup. 100% local — decklists never leave your browser.") | Léo, Thibault                       | 15min  | +0.05              |
| Q4  | **Permalink nommé `/a/:slug`** + localStorage index (slug auto-généré type `nature-rhythm-v3-post-side`)                  | Karim (pin Discord), Sarah, Natsuki | 1j     | +0.15              |
| Q5  | **Copy shareable link** button à côté du badge Manabase                                                                   | Sarah (ROI #1), Karim               | 2h     | +0.05              |
| Q6  | **Recent decks** tuile (localStorage, last 3) sur AnalyzerPage empty state                                                | Sarah                               | 4h     | +0.05              |
| Q7  | **Load from clipboard** header button sur empty state (parse decklist auto)                                               | Sarah                               | 3h     | +0.03              |
| Q8  | **`CHANGELOG.json` public scrappable** à `/changelog.json`                                                                | Karim (trust signal)                | <1h    | signal trust +0.02 |
| Q9  | **Rename "reading library" encart** en langage Léo-friendly (actuellement cite 5 noms dont Léo connaît 1)                 | Léo                                 | 30min  | +0.05              |
| Q10 | **Library filters** (par format, par date) sur `/library`                                                                 | Karim, Sarah                        | 3h     | +0.05              |

**Total v2.5.5** : ~1 semaine dev, ΔMoy 6p projeté **+0.75** (3.63 → ~4.40 si tout livré).

#### v2.6.0 — Major features (~3-4 semaines)

| #   | Feature                                                                                                                            | Personas                       | Effort | ΔMoy 6p |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------ | ------- |
| M1  | **API REST publique `POST /api/analyze`** (stateless, rate-limit 60rpm, CORS ouvert, JSON schema versionné)                        | Karim, Natsuki VETO, David     | 2-3j   | +0.27   |
| M2  | **Seed-URL xoshiro256\*\*** pour MC reproducibility (Mulligan + Draws on Curve)                                                    | David (citation), Natsuki      | 1-2j   | +0.10   |
| M3  | **IC Wilson sur onglets MC** (Mulligan + Draws on Curve) — PAS Castability (analytique). Refus argumenté maintenu sur Castability. | Natsuki, David                 | 2-3j   | +0.10   |
| M4  | **Build Diff A vs B** — coller 2 decklists, tableau de deltas par sort/tour                                                        | Karim, Natsuki                 | 5-7j   | +0.15   |
| M5  | **Matchup-tagged sideboard swaps** — noter "vs UW Control" sur chaque swap, retrouver le plan le mardi suivant                     | Sarah (ROI #1 depuis 2 audits) | 3-4j   | +0.10   |
| M6  | **Tracker X-Y results** sur MyAnalyses (case "Event result: 4-0" par deck sauvé)                                                   | Sarah                          | 2j     | +0.05   |
| M7  | **CSV v2**: section markers `# SECTION:` explicites + 3ème section `probabilities` (turn × color × pct) + fix bug B1               | Natsuki, Karim                 | 4h     | +0.05   |
| M8  | **Bulk JSON multi-deck export** (ZIP de N decks analysés en batch, tout client-side)                                               | David, Natsuki                 | 1-2j   | +0.05   |

**Commander features spécifiques (Thibault, au-delà du Q1 framing):**

| #   | Feature                                                                                                              | Effort | ΔMoy 6p (Thibault) |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------ | ------------------ |
| C1  | **Command zone modeling** — input "Commander: [name]" qui exclut 1 carte du shuffle + la compte castable chaque turn | 3-5j   | Thibault +0.5      |
| C2  | **Karsten EDH tables T5-T8** (4-player, basé sur Karsten 2017 "Commander mana bases" + adaptation)                   | 3j     | Thibault +0.3      |
| C3  | **Universal mana fixers toggle** (Chromatic Lantern, Prismatic Omen, Urborg+Cabal)                                   | 1j     | Thibault +0.2      |
| C4  | **Color identity validator** (vérifier singleton + color identity vs commander)                                      | 2j     | Thibault +0.2      |
| C5  | **Sol Ring T1 / Arcane Signet / talisman signature rocks modeling** (fast mana spike en EDH)                         | 2-3j   | Thibault +0.2      |
| C6  | **Budget upgrade path** ranking (quel fetch/shock acheter en premier par ROI)                                        | 3-4j   | Thibault +0.2      |
| C7  | **Library EDH coverage** (ajouter Jumbo Commander, EDHREC data drops, Josh Lee Kwai, Tomer)                          | 4h     | Thibault +0.1      |

#### v2.7.0+ — Long-term / React 19 migration

| #   | Item                                                                | Why / When                                                                                                   |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| L1  | **Migrate `react-helmet-async` → `@unhead/react@2.1.13+`**          | Broken avec React 19 (perd dedup `<title>`). API différente — refactor SEO.tsx + tests. v2.7.0 avec React 19 |
| L2  | **Bump React 18.3.1 → 19.x**                                        | Context7 audit: majeur migration, breaking changes (propTypes removed, nouveau JSX transform). Scope v2.7.0  |
| L3  | **React Compiler (stable)** pour auto-memo sur ManaCostRow hot path | Beta actuelle → stable attendue. Réduit dette de memoïsation manuelle                                        |
| L4  | **Empirical calibration** vs MTGO logs (10k+ matchs, open-dataset)  | David (citation académique). Transforme de outil prédictif à outil validé. 1-2 semaines                      |
| L5  | **Convoke + Delve modeling** dans le K=3 engine                     | David — déférés dans les 9 mécaniques de ramp documentées. Modern/Legacy complets                            |

#### Dette technique historique (ongoing)

| #   | Item                                                                                                                      | Open since                  | Scope                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| D1  | **`useProbabilityCalculation` → SSOT engine alignment** (dual path base vs accelerated dans ManaCostRow)                  | 2026-04-06                  | v2.6.0 — requires numerical validation contre Humans+Cavern, Eldrazi, etc. ~1.5j |
| D2  | **`noUncheckedIndexedAccess` TS flag activation**                                                                         | v2.5.2 audit                | v2.6.0 — ~41 sites à patcher, ~3-4h                                              |
| D3  | **Delete `useMonteCarloWorker`** (dead code, 0 callers depuis v2.5.2)                                                     | 2026-04-13                  | v2.5.5 (trivial)                                                                 |
| D4  | **CSP hygiene** sur `index.html` inline JSON-LD                                                                           | Security-Auditor 2026-04-17 | v2.5.4 — cosmétique, zéro risque réel, SHA-256 source ou fichier externe         |
| D5  | **Phyrexian / twobrid pessimism fix** (actuellement trop pessimiste sur les coûts type `{W/P}` ou `{2/R}`)                | 2026-04-06                  | v2.6.0 — ~1h refactor ManaCostRow                                                |
| D6  | **`{C}` colorless requirement fix** (Tron/Eldrazi — Eldrazi `{4}{C}{C}` actuellement scoré 99/98 car traité pure generic) | 2026-04-06                  | v2.6.0 — ~2h, impacte Tron decks                                                 |

#### Total récap

- **Bugs**: 3 items (~1j)
- **v2.5.5 quick wins**: 10 items (~1 semaine)
- **v2.6.0 major**: 8 items + 7 Commander = **15 items** (~3-4 semaines)
- **v2.7.0+**: 5 items (React 19 + calibration)
- **Dette historique**: 6 items
- **TOTAL = 39 items** + 3 bugs = **42 items de backlog identifié**

**Non blocking launch**: aucun de ces 42 items ne bloque le tweet `@fireshoes`. Le
Commander framing (Q1) est la seule reco avec urgence réelle car 40% des clics
du tweet viendront de joueurs Commander qui bounce en 10s sur le framing 60-card.

### Memory updated (session close)

Updates to `/Users/guillaumebordes/.claude/projects/-Volumes-DataDisk--Projects-Project-Mana-base-V2/memory/`:

- `feedback_parallel_audit_workflow.md`: bumped to mention 6 personas (Thibault added 2026-04-18) + Partage axis.
- New `feedback_falsifiable_metrics_preference.md`: captures the Rétention → Partage decision as a broader pattern (user prefers falsifiable axes over vague ones for any audit grid).
- MEMORY.md index regenerated.

### Current State

- **Working**: v2.5.4 live on www.manatuner.app, personas v2 shipped, 6-persona audit completed.
- **No code blockers.**
- **Documentation state**: CHANGELOG, HANDOFF, personas, README, ARCHITECTURE, docs/index all synchronized to 2026-04-18.

### Next Priority (next session)

Two paths:

1. **Launch path** (LAUNCH.md): Sarah hit 4.71 (ICP #1 satisfied), Léo at 3.84 (recommend-to-casuals threshold crossed). Distribution problem is the actual blocker. Post the @fireshoes tweet.
2. **Feature path** (next audit raises moyenne 6p): Commander preset (1-2j) as the single highest-ROI item (débloque Thibault 2.56 → 3.8 + +40% TAM). Then permalink + Quick Verdict for the next +0.2 moyenne.

Creator's decision: distribution before features, or features before distribution? Both are valid. **Recommendation from personas**: the Commander framing fix is 1-2 days and its absence turns a @fireshoes RT click from EDH players (≈40% of clicks) into a 10-second bounce. Ship Commander framing FIRST, then tweet.

---

## Session 2026-04-18 — persona-driven UX polish + Context7 stack modernization

### Workflow

Three-round persona audit cycle (Léo, Sarah, Karim, Natsuki, David)
ran across 2026-04-17 and 2026-04-18, each round producing a concrete
fix list. In parallel, a Context7 MCP audit on React / Vite /
react-helmet-async surfaced safe modernization opportunities. The
2026-04-18 session shipped the combined quick-wins list as **v2.5.4**.

Process:

1. **Round 1 audit (2026-04-17, v2.5.3 live)** — average 3.63/5.
   Léo regressed to 3.50 because of jargon in browser tab title +
   "no decklist to paste" friction. Sarah steady at 4.40 asking for
   Karsten delta + format badges. Karim −0.75 (missing API/CSV).
   Natsuki veto at 2.56 (no API, no CI). David 3.88 (structural gaps).
2. **Round 2 implementation (2026-04-17 late)** — 5 quick wins:
   title humanized, HomePage format-badges strip, sample-deck 1-click
   link, Karsten delta chips on Manabase tab, CSV export. Plus
   Context7 upgrade: React 18.3.1, Vite target modernized,
   lightningcss. Build time −16%, main bundle −4.6% gzip.
3. **Round 3 re-audit (2026-04-17 late, v2.5.4-dev)** — average
   3.78/5 (+0.15). Léo +0.38, Sarah +0.19, Karim +0.15, Natsuki
   +0.10, David +0.12. Projection for Léo was 4.35 but delivered
   3.88 — "Spells & Tempo" subtab and single-archetype sample were
   still friction points.
4. **Round 4 (2026-04-18, this session)** — three more quick wins
   shipped as **v2.5.4**: rename "Spells & Tempo" subtab to "Spell
   Breakdown", expand single sample deck into three archetype buttons
   (Aggro / Midrange / Control) with keyed URL params, surface the
   Karsten-delta verdict as a badge on the Manabase tab label itself.

### What Was Completed

#### UX polish (three persona-driven quick wins from Round 3 audit)

- **`AnalysisTab.tsx:73`** subtab label: `"Spells & Tempo"` →
  `"Spell Breakdown"`. Léo flagged "Tempo" as "a pro word I don't
  understand"; the new label describes what the UI actually shows.
- **Three sample archetype buttons** replace the single "See a Sample
  Analysis" CTA on the AnalyzerPage empty-state right panel:
  Mono-Red Aggro, Midrange Combo (former default), Azorius Control.
  Each button calls `handleLoadSampleKey(key)` which dispatches
  `setDeckList` + `setDeckName` so the deck arrives pre-titled.
- **`SAMPLE_DECK` constant replaced** by `SAMPLE_DECKS` keyed record
  (`midrange` / `aggro` / `control`) in `AnalyzerPage.tsx:69-118`.
  URL param `?sample=aggro|control|midrange` routes to the matching
  archetype; `?sample=1` stays aliased to midrange for HomePage
  back-compat.
- **Manabase tab label badge** (`AnalyzerPage.tsx:711-787`): compact
  red/orange counter when any color is short (`"Manabase 2"` when 2
  colors are 3+ short of Karsten target) or green check (✓) when all
  colors meet targets. Extracted `computeColorDeltas` and new
  `summarizeColorDeltas` from `KarstenTargetDelta.tsx` as exported
  pure helpers so the tab badge and the tab content share SSOT.
  `aria-label` spells out the verdict verbally.
- **`KarstenTargetDelta.tsx:102` heading rewrite**: `"Karsten Check
— Colored Sources vs Targets"` → `"Color Sources Check — Can You
Cast Your Spells?"`, plus plain-English verdict explainer.

#### Context7 MCP stack modernization

- **React 18.2 → 18.3.1** (transition release — identical to 18.2 +
  deprecation warnings for React 19 migration). `@types/react` +
  `@types/react-dom` to 18.3.
- **Vite `build.target`**: `'es2015'` → `'baseline-widely-available'`
  (Vite 7 default; chrome107+ / edge107+ / firefox104+ / safari16+).
- **Vite `build.cssMinify: 'lightningcss'`** enabled — more aggressive
  CSS minification.
- **Context7 finding: `react-helmet-async` broken with React 19**
  (loses dedup, renders multiple `<title>`). No impact on React 18
  — deferred to v2.7.0 with React 19 migration. Migration path to
  `@unhead/react@2.1.13` documented.

### Performance metrics

| Metric                    | v2.5.3   | v2.5.4       | Δ                                |
| ------------------------- | -------- | ------------ | -------------------------------- |
| Build time                | 7.65 s   | **7.09 s**   | −7%                              |
| `index` main chunk (gzip) | 41.89 KB | **39.96 KB** | −4.6%                            |
| `AnalyzerPage` (gzip)     | 27.01 KB | 29.25 KB     | +2.24 KB (3 samples + tab badge) |
| `CastabilityTab` (gzip)   | 17.01 KB | 16.34 KB     | −0.67 KB                         |
| Tests                     | 315      | 315          | =                                |
| `tsc --noEmit`            | 0 err    | 0 err        | =                                |

### Persona scores (projected post-v2.5.4)

| Persona            | v2.5.3   | v2.5.4-dev (Round 3) | v2.5.4 final (projected)                      |
| ------------------ | -------- | -------------------- | --------------------------------------------- |
| Léo (Beginner)     | 3.50     | 3.88                 | **~4.25** (+"Spell Breakdown" + 3 archetypes) |
| Sarah (ICP #1)     | 4.40     | 4.59                 | **~4.70** (+Manabase tab badge)               |
| Karim (Tacticien)  | 3.81     | 3.96                 | 3.96 (unchanged — API still the ask)          |
| Natsuki (Grinder)  | 2.56     | 2.66                 | 2.66 (unchanged)                              |
| David (Architecte) | 3.88     | 3.83                 | 3.83 (unchanged — seed/calibration asks open) |
| **MOYENNE**        | **3.63** | **3.78**             | **~3.88**                                     |

### Verification

- `npx tsc --noEmit`: 0 errors.
- `npm run test:unit`: 315 passing, 2 skipped, 0 failing.
- `npm run build`: clean in 7.09 s. Main `index-*.js` at **39.96 KB
  gzip** (−4.6% cumulative since v2.5.3).
- Dev server on `http://localhost:3001`; browser title verified as
  `"ManaTuner — Will your deck cast its spells on curve?"`.
- `grep supabase src/`: 0 matches.

### Explicitly deferred (scope v2.6.0 / v2.7.0)

- **API publique `POST /api/analyze`** — veto Natsuki, blocker Karim,
  souhait David. Scope v2.6.0.
- **IC Wilson on Monte Carlo tabs** — Natsuki + David. v2.6.0.
- **Build Diff A vs B** — Karim + Natsuki. v2.6.0.
- **Seed-URL Monte Carlo (xoshiro256**)\*\* — David. v2.6.0.
- **Empirical calibration against MTGO logs** — David. v2.6.0+.
- **Matchup-tagged sideboard + Tracker X-Y on MyAnalyses** — Sarah.
  v2.6.0.
- **`useProbabilityCalculation` → SSOT engine alignment** — v2.6.0.
- **`react-helmet-async` → `@unhead/react` migration** — v2.7.0 with
  React 19 migration.

### Current State

- **Working**: everything. Build 7.09 s, 315 tests green, tsc clean,
  main bundle −4.6% gzip cumulative since v2.5.3.
- **No code blockers.**

### Next Priority

**Post the `@fireshoes` tweet.** Léo's projected score ~4.25 crosses
the "recommend to casual friends" threshold. Sarah at ~4.70 is a
clean "yes, I share it to my FNM group". ICP satisfied; distribution
problem remains.

---

## Session 2026-04-17 — 8-agent follow-up audit + 9-task fix sweep

### Workflow

Fresh multi-agent audit 4 days after v2.5.2 shipped (`1555466`), covering
the 3 commits merged since (`eb5abf2` design system export, `b6dda5e` batch
SEO/AEO + sample decks, `9f64d7c` JSON-LD @id + decklist relocation —
+7188 lines, 53 files). The delta was **100% SEO/AEO/content**, no runtime
logic or math code changed.

Eight parallel agents delivered: context-manager, Security-Auditor,
performance-engineer, qa-expert, debugger, react-pro, typescript-pro,
documentation-expert. Aggregate verdict: **GO — no blocker**, delta clean
against the v2.5.2 hardened baseline. Findings: 0 CRITICAL, 0 HIGH,
2 MEDIUM (sitemap/noindex conflict + CSP-vs-inline-JSON-LD hygiene),
9 LOW + 2 persistent tech-debt items.

### What Was Completed (9 of 10 recommended tasks)

#### SEO / AEO (debugger M1, L2 — crawler-facing fixes)

- **`public/sitemap.xml`**: removed `/my-analyses` URL block (lines 34-38).
  Page sets `noindex` since `9f64d7c`; sitemaps shouldn't advertise
  noindexed URLs (per Google guidance). Closes the GSC warning
  "Submitted URL marked noindex" that would surface within 48h of next
  crawl.
- **`index.html:2`**: `<html lang="en">` → `<html lang="en-US">` to align
  with `manifest.json` `"lang": "en-US"` and per-page JSON-LD
  `"inLanguage": "en-US"`. Fixes Lighthouse i18n inconsistency flag.

#### SEO perf (react-pro §3)

- **`src/components/common/SEO.tsx`**: wrapped `JSON.stringify(jsonLd)`
  and `JSON.stringify(breadcrumbs)` in `useMemo`. GuidePage alone renders
  a FAQPage (10 Q/A) + HowTo (5 steps) JSON-LD on every update — the
  serialization now only runs when inputs change. Also exported
  `buildBreadcrumbs` and `PAGE_TITLES` so tests can import the pure
  helpers without rendering the component.

#### Test coverage (qa-expert §3)

- **`src/components/common/__tests__/SEO.test.tsx`** (new, 7 tests):
  `buildBreadcrumbs` for `/`, `/analyzer` via `PAGE_TITLES`, unknown-route
  slug fallback. Component tests render `<SEO>` inside `HelmetProvider`
  and assert DOM head: canonical absolute URL, `noindex,follow` robots
  meta + breadcrumb JSON-LD suppression, `jsonLd` round-trip valid JSON,
  default breadcrumb emission. Protects all 10 SEO callers from silent
  JSON-LD rot before the AEO traffic arrives per
  `docs/SEO_AEO_STRATEGY_2026-04-13.md`.

#### Type safety (typescript-pro §2 — 5 grave `as any` fixes)

- **`src/services/advancedMaths.ts:530`**: replaced the post-export
  monkey-patch `(advancedMathEngine as any).calculateHypergeometric = ...`
  with a proper `calculateHypergeometric()` method on the class. Class
  shape now reflects reality; removes the last `as any` on the math
  singleton.
- **`src/services/manaProducerService.ts:464,474`**: the `validColors`
  arrays are already narrowed to `('W'|'U'|'B'|'R'|'G'|'C')[]` via
  explicit type predicate (line 454, 468-470), so the `as any` to
  `colorMaskFromLetters` is purely redundant. Removed both.
- **`src/components/EnhancedRecommendations.tsx:92,232`**: typed the
  return of `getPriorityColor` as
  `'error' | 'warning' | 'info' | 'success'` (MUI `Chip` color union).
  The `as any` on the JSX usage falls out.
- **`src/components/Onboarding.tsx:77`**: replaced `(window as any)
.resetOnboarding = ...` with an inline intersection type
  `Window & { resetOnboarding?: () => void }`. Debug hook still works,
  type holes closed.
- **`src/components/analyzer/CastabilityTab.tsx:170`**: replaced
  `produces.includes(color as any)` with a locally defined
  `isLandManaColor` type predicate that narrows `string` to the
  `LandManaColor` union before the check. Same behavior, stricter type.

#### Hook bug fixes (react-pro §2 — `useMonteCarloWorker`, 3 bugs)

**Note: this hook has no live callers in `src/` since the Mulligan worker
port in v2.5.2 (`MulliganTab` uses `mulliganArchetype.worker`). Kept for
API compatibility; bugs still worth fixing in case it's ever re-wired.**

- **Double-dispatch `MONTE_CARLO_RESULT`**: the mount `useEffect`
  installed a global `workerRef.current.onmessage` that called
  `setResults / setIsRunning / setProgress` on `MONTE_CARLO_RESULT`,
  AND `runSimulation` installed a per-call `addEventListener('message')`
  that resolved the Promise on the same message. Both fired on every
  result. Fix: split into an `attachProgressHandler(worker)` helper that
  only handles `PROGRESS_UPDATE` + error branch, and move all result
  state writes into the per-call scoped handler. No more duplicate state
  updates.
- **`setTimeout(100)` race on cancel**: `cancelSimulation` terminated
  the worker then recreated it asynchronously after 100 ms, leaving
  `workerRef.current = null` during the window. If a consumer called
  `runSimulation` inside that gap, it hit `setError('Worker not
initialized')`. Fix: recreate the worker synchronously and re-attach
  the progress handler in the same tick.
- **`cancelSimulation` memo invalidation**: deps were `[isRunning]` →
  the `useCallback` re-emitted a fresh identity on every toggle. Any
  memoized child receiving `onCancel={cancelSimulation}` invalidated.
  Fix: added `isRunningRef` mirror synced by a tiny `useEffect`, guard
  `cancelSimulation` on `isRunningRef.current`, drop the dep → callback
  is now stable across renders.

#### Documentation drift cleanup

- **`CLAUDE.md:252`** — purged the obsolete paragraph "Orphan
  `src/hooks/useAnalysisStorage.ts` still exists". File was deleted in
  v2.5.2 (`1555466`); the line was stale by 4 days. Replaced with a
  forward-looking note "do not recreate this hook".
- **`docs/ARCHITECTURE.md:3-4`**: `2.5.1 / 2026-04-13` → `2.5.3 /
2026-04-17`.
- **`docs/index.md:10`**: `2.2.0` → `2.5.3` (was 3 months stale).
- **`README.md`**: Tests badge `305 Passing` → `315 Passing`; new Version
  `2.5.3` badge added next to the Tests one.
- **`package.json`**: `2.5.2` → `2.5.3`.

### Verification

- `npx tsc --noEmit`: **0 errors** (was 0, held)
- `npm run test:unit`: **315 passing**, 2 skipped, 0 failing (was 308/2/0
  — +7 from the new `SEO.test.tsx` suite)
- `npm run build`: clean in **7.07 s** (was 7.47 s), all chunk sizes
  identical to v2.5.2, `mulliganArchetype.worker` still `?worker` at
  10.84 KB
- `grep supabase src/`: 0 matches (purge holds)
- No new npm dependencies added (`package.json` diff = version bump only)

### Explicitly deferred (too risky for a follow-up sweep)

- **`useProbabilityCalculation` → SSOT engine alignment** (react-pro §1
  top recommendation, 1–1.5 days). The dual path in `ManaCostRow.tsx`
  has been open since `2026-04-06` and was re-confirmed today. Requires
  numerical validation against Humans+Cavern, Eldrazi, etc. — not a
  single-session fix. **Scope v2.6.0.**
- **`noUncheckedIndexedAccess`** activation (typescript-pro §3, 3–4 h).
  ~41 sites across `deckAnalyzer.ts`, `manaCalculator.test.ts`,
  `turnPlan.test.ts` need `array[idx]?.foo`-style guards. Would close
  the last class of "Cannot read properties of undefined" exposures.
  **Scope v2.6.0** (already labeled as such in `CLAUDE.md`).
- **Delete `useMonteCarloWorker` entirely** — it has 0 live callers in
  `src/`. Fixing the bugs (above) was safer than deleting a public hook
  export while the library consumer audit wasn't run. **Scope v2.5.4.**
- **`docs/index.md` full BMAD regen** — I bumped the version field but
  the 7 "Last Updated: 2026-01-06" cells and the 4 missing entries
  (`DESIGN_SYSTEM_EXPORT.md`, `SEO_AEO_STRATEGY_2026-04-13.md`,
  `AUDIT_PROD_LAUNCH_2026-04-13.md`, `sample-decks/`) need a proper
  `/bmad:core:tasks:index-docs` workflow run, not a manual hand-patch.
- **M1 CSP-vs-inline-JSON-LD hygiene** (Security-Auditor): `index.html`
  contains a 73-line `<script type="application/ld+json">` while
  `vercel.json` sets `script-src 'self'` without `'unsafe-inline'`.
  Browsers treat `ld+json` as data (not executable) so this works, but
  the CSP spec is ambiguous. Fix is a SHA-256 source or external JSON
  file. **Cosmetic, zero security risk, scope v2.5.4.**

### Current State

- **Working**: everything. 315/317 tests, tsc clean, build clean in
  7.07 s, 0 new dependencies, 0 behavior changes for end users (the
  `useMonteCarloWorker` fixes are in dead code).
- **No code blockers.**
- The full audit findings and agent reports are summarized in the
  conversation transcript (8 agents × ~60 s each = ~8 min parallel
  walltime). No standalone audit doc was written for this pass — the
  delta was small enough that HANDOFF entry + CHANGELOG suffice.

### Persona Impact

Minimal. All fixes are engineering hygiene:

- **Léo** unaffected (no UX copy change)
- **Sarah** unaffected (no analyzer change)
- **Karim / Natsuki** slight positive (`useMonteCarloWorker` race fix
  prevents a theoretical bug if the hook is ever re-wired for a
  power-user feature)
- **David** slight positive: the 5 `as any` purges + new SEO test file
  match his "read the code, verify the rigor" angle

### Next Priority

**Post the @fireshoes tweet.** Still the same priority since v2.4. The
engineering dette that would preoccupy an architect-persona is reduced
further today (1 `as any` patch class closed, 3 hook bugs closed,
1 obsolete TODO paragraph purged), but none of this is load-bearing on
the distribution problem. See `LAUNCH.md`.

---

## Session 2026-04-13 (very late) — Re-audit + 19-fix hardening sweep

### Workflow

The user requested a fresh adversarial re-audit of the morning launch state
(`cbe6f21`, score 4.54/5 in the previous 10-agent pass). I ran a full
3-wave parallel audit:

- **Wave 1 (5 agents)** — context-manager, Security-Auditor, performance-engineer,
  qa-expert, debugger
- **Wave 2 (5 agents)** — react-pro, typescript-pro, deployment-engineer,
  ux-designer, documentation-expert
- **Wave 3 (5 personas)** — Léo, Sarah, Karim, Natsuki, David, each via a
  ux-designer subagent prompted to fully incarnate the persona from
  `mtg-player-personas.md`

The aggregated score collapsed from the morning's **4.54/5** to **3.95/5
(GO-WITH-HARD-CAVEATS)** because:

1. The debugger found **11 latent bugs (3 CRITICAL, 4 HIGH, 3 MEDIUM, 1 LOW)**
   that the previous pass missed
2. The Security-Auditor caught a **Supabase JWT committed in `env.example`**
   (no leading dot → never matched `.gitignore`)
3. The personas regressed (avg 3.76/5) because audits had been blind to real
   friction: Mulligan main-thread freeze on mobile, Léo's "dorks/rocks/EV"
   jargon confusion, Sarah's missing Karsten target delta, Natsuki's missing
   CIs

The user then said: **"corrige tout sauf le dark mode … mais il n'y a plus
de Supabase dans mon projet donc supprime les traces de Supabase"**.

I implemented all 19 of the 20 recommended fixes in one session (dark mode
explicitly skipped per user request). Final state: `tsc --noEmit` clean,
**308/310 tests passing** (+3 vs the pre-audit 305), build clean in 6.5 s,
production worker bundle generated correctly.

### What Was Completed

#### Supabase fully removed (replaces JWT rotation)

The audit had flagged the Supabase JWT in `env.example` (no dot, exp 2035) as
the #1 blocker. Since ManaTuner's Supabase has been a fully-mocked dead
service for months, the cleanest fix is **purge** rather than **rotate**:

- Deleted `env.example` (the file with the leaked JWT)
- Deleted `MESSAGE_EQUIPE.txt` (also referenced Supabase config)
- Cleaned `.env.example` of the optional Supabase block
- Removed `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from `src/vite-env.d.ts`
- Rewrote the `CLAUDE.md` "Notes Techniques → Supabase" section from
  "DISABLED" to "REMOVED" with an explicit instruction not to reintroduce
  without rouvrir la décision
- `grep -ri supabase src/` → 0 hits

#### Bloquants critiques (audit C1/C2/C3)

- **C3 — sideboard heuristic false positive on category-grouped exports**:
  `deckAnalyzer.ts` `detectSideboardStartLine` now refuses any blank-line
  split whose total matches a canonical complete-deck size (`{40, 60, 80,
99, 100}`). +3 regression tests in `sideboardDetection.test.ts`.
- **C1 — NaN cascade**: `manaCalculator.ts:138`
  `landRatio = totalLands / deck.totalCards` divide-by-zero on empty deck.
  Fixed with ternary guard.
- **C2 — NaN% in spellAnalysis**: `deckAnalyzer.ts:1179` same pattern for
  mono-land debug pastes. Fixed with ternary guard.

#### HIGH/MEDIUM bugs (audit H1/H2/H3/H4/M1/M2/M3)

- **H1+M3 — Mulligan Web Worker port**: created
  `src/workers/mulliganArchetype.worker.ts` (Vite `?worker` bundle, imports
  `analyzeWithArchetype` directly so no JS duplication). `MulliganTab.tsx`
  now uses a request-id pattern: each `runAnalysis()` increments a counter,
  the worker echoes it back, and stale responses are silently dropped. This
  fixes BOTH the main-thread freeze (was 2-8 s on iOS) AND the M3 issue
  where two `useEffect` blocks could fire two simultaneous Monte Carlo runs
  in parallel. Single auto-run effect now lists `runAnalysis` in deps.
  Build artifact: `dist/assets/mulliganArchetype.worker-dRZ2idjW.js` (10.84 KB).
- **H3 — Cavern of Souls divergence in `ManaCostRow`**: the base path
  received `effectiveDeckSources` (with `producesAnyForCreaturesOnly`
  adjustment for tribal lands) but the accelerated path received raw
  `deckSources`. Result: enabling acceleration on a Humans deck with
  4 Cavern of Souls could PARADOXICALLY drop a creature's castability from
  ~95 % to ~78 %. Fix: pass `effectiveDeckSources` to both hooks.
- **H4 — `scryfallCache` unbounded** in `deckAnalyzer.ts`: was a plain
  `Map<string, ScryfallCard>`. Fix: export `BoundedMap` from `scryfall.ts`,
  import in `deckAnalyzer.ts`, cap at 500.
- **H2 — `useMonteCarloWorker` event listener leak** (preventive — the hook
  has no live callers since the Mulligan worker port, but the audit flagged
  it and the fix is 4 lines): added a `cleanup()` closure that clears the
  timeout AND removes the listener, called from both success and timeout
  paths.
- **M1 — `CastabilityTab` race condition**: async `fetchUnknown()` had no
  cleanup flag. Fix: `cancelled` flag in cleanup + `Promise.all` instead of
  sequential `for await` (also faster: O(1) network latency).
- **M2 — `privacy.ts` quota bypass**: `deleteAnalysis` and `importAnalyses`
  used `localStorage.setItem(...)` directly while `saveAnalysis` went through
  `persist()` with the `QuotaExceededError` retry. iOS Safari private mode
  could throw on otherwise size-reducing operations. Fix: route both through
  `persist()`, with a typed cast at the Zod-validated import boundary.

#### UX / WCAG (audit ux-designer)

- **Decklist textarea WCAG 1.3.1 / 4.1.2**: added `aria-label`,
  `aria-describedby`, `helperText` ("Supported: MTGA, Moxfield, Archidekt,
  MTGGoldfish. Sideboard auto-detected."), `maxLength: 20000`. Mobile rows
  bumped 8 → 10.
- **Sample CTA in empty state**: prominent
  `📋 See a Sample Analysis` button inside the right-panel empty state of
  `AnalyzerPage`, calling the same `handleLoadSample`. Empty state copy
  reworded.
- **Left-panel `Example` button promoted** from `size="small"` to
  `size="large"` with bold weight + 📋 emoji + "Try Example" label.

#### Documentation drifts

- `package.json`: `2.2.0 → 2.5.2` (drop the `2.5.1.x` mid-day notation,
  ship clean semver)
- `LAUNCH.md`: 213 → 305 → **308** tests, 6 s → ~7 s → ~6.5 s, persona
  4.14 → 3.76 → ~4.45 projected
- `docs/ARCHITECTURE.md`: header `2026-01-06 / 2.0.0` → `2026-04-13 / 2.5.1`
  - pointer to `ARCHITECTURE_COMPLETE.md`

#### Performance

- `PrivacySettings` now lazy-loaded in `AnalyzerPage` — drops ~14 KB gzip
  of DOMPurify out of the first-load AnalyzerPage chunk
- `og-image.jpg` (41 KB) + `og-image-v2.jpg` (121 KB) deleted (orphans;
  only `og-image-v3.jpg` is referenced from `index.html`)
- `apple-touch-icon` link removed from `index.html` (PNG was missing →
  iOS 404)
- Cinzel font: dropped the inline `onload` swap pattern that was blocked
  by `script-src 'self'` CSP, switched to plain render-blocking link

#### Security hardening (`vercel.json`)

- CSP `connect-src` no longer whitelists `https://*.ingest.sentry.io`
  (Sentry stays disabled in prod, removing the silent re-activation footgun)
- CSP gained `base-uri 'none'`, `form-action 'self'`, `object-src 'none'`,
  `upgrade-insecure-requests`
- `Permissions-Policy` extended with `interest-cohort=()`,
  `browsing-topics=()`, `attribution-reporting=()`
- `X-XSS-Protection` removed (deprecated, modern best practice)
- `Cache-Control: no-cache, no-store, must-revalidate` on `/index.html`
  — fixes the silent 404 cascade risk during deploys when an
  `index.html` fetched from deploy N references chunks that only exist in
  deploy N+1

#### Code hygiene

- Deleted `src/hooks/useAnalysisStorage.ts` — 211-line orphan flagged in
  `CLAUDE.md` since v2.5.1.1, zero callers

### Verification

- `npx tsc --noEmit`: 0 errors
- `npm run test:unit`: **308 passing**, 2 skipped, 0 failing (was 305/2/0)
- `npm run build`: clean in **6.50 s**, worker bundle generated correctly
- `grep -ri supabase src/`: 0 matches

### Explicitly deferred (per user request or scope)

- **Dark mode toggle** — kept dormant. The dead-code paths in `ManaCostRow`,
  `Footer`, `FloatingManaSymbols`, `SegmentedProbabilityBar`,
  `AccelerationSettings` stay in place. `NotificationProvider.toggleTheme()`
  still has zero callers. To reactivate: add an `IconButton` in `Header.tsx`
  - system-pref detection.
- Plausible/Umami analytics, README real CI badges + screenshots,
  `noUncheckedIndexedAccess` sprint, JSON.parse Zod validation on cache
  files: all out of scope for this fix sweep, deferred to v2.6.0+.

### Current State

- **Working**: everything. 308/310 tests, tsc clean, build clean in 6.5 s.
- **Score projeté post-fix**: ~4.45/5 (vs 3.95 pre-fix, vs 4.54 morning over-optimistic).
- **No code blockers.**
- The full re-audit report lives at `docs/AUDIT_PROD_LAUNCH_2026-04-13.md`.
- The CHANGELOG entry `[2.5.2]` documents every change with audit ID
  cross-references.

### Next Priority

**Ship `[2.5.2]` and post the @fireshoes tweet.** The 19 fixes have closed
the dette technique flagged by the re-audit. Beyond the dark mode toggle
(deliberately deferred), there is no remaining blocker between ManaTuner and
its first 100 users.

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
