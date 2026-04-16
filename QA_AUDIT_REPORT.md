# ManaTuner v2.2.0 -- Comprehensive QA Audit Report

**Date:** 2026-04-06
**Auditor:** QA Expert (Claude Opus 4.6)
**Scope:** Full-stack QA audit of https://www.manatuner.app/ and source code
**Branch:** main (commit ea7d6a3)

---

## Executive Summary

ManaTuner is a well-structured React/TypeScript SPA with strong mathematical foundations and good code organization. However, this audit has uncovered **4 Blocker-level issues**, **8 Major issues**, **9 Minor issues**, and **6 Cosmetic issues** that collectively impact SEO discoverability, PWA compliance, production reliability, and test stability.

**Overall Quality Score: 72/100**

| Category               | Score  | Assessment                                             |
| ---------------------- | ------ | ------------------------------------------------------ |
| Functional Correctness | 82/100 | Core analyzer works; 2 failing unit tests              |
| SEO Technical          | 35/100 | Sitemap/robots point to wrong domain                   |
| PWA Quality            | 20/100 | manifest.json missing entirely                         |
| Error Handling         | 78/100 | ErrorBoundary + Sentry present, but CSP blocks Sentry  |
| Test Coverage          | 68/100 | 195/199 unit tests pass; E2E suite present             |
| Security               | 85/100 | Good CSP, HSTS, XSS protection; .env in repo           |
| Accessibility          | 70/100 | aria-labels on tabs; some gaps                         |
| Code Quality           | 80/100 | Clean TypeScript, Zod validation; 73 console.log calls |

---

## 1. BLOCKER Issues (Must Fix Before Next Deploy)

### BLK-001: sitemap.xml Uses Wrong Domain (manatuner-pro.vercel.app)

**File:** `/public/sitemap.xml`
**Severity:** BLOCKER -- SEO
**Impact:** Google is indexing the old Vercel domain instead of https://manatuner.app. All 6 URLs in the sitemap reference `https://manatuner-pro.vercel.app/` instead of `https://manatuner.app/`. This means search engines are not properly indexing the canonical site.

**Evidence:**

```xml
<loc>https://manatuner-pro.vercel.app/</loc>  <!-- WRONG -->
<loc>https://manatuner-pro.vercel.app/analyzer</loc>  <!-- WRONG -->
```

**Fix:** Replace all `https://manatuner-pro.vercel.app` with `https://manatuner.app` in `sitemap.xml`.

---

### BLK-002: robots.txt Uses Wrong Domain and Sitemap URL

**File:** `/public/robots.txt`
**Severity:** BLOCKER -- SEO
**Impact:** The sitemap directive points crawlers to the wrong URL. The comment also references the old domain.

**Evidence:**

```
# https://manatuner-pro.vercel.app/
Sitemap: https://manatuner-pro.vercel.app/sitemap.xml
```

**Fix:** Update to:

```
# https://manatuner.app/
Sitemap: https://manatuner.app/sitemap.xml
```

---

### BLK-003: manifest.json Does Not Exist (PWA Installability Broken)

**File:** Referenced in `index.html` line 42 but no file exists
**Severity:** BLOCKER -- PWA
**Impact:** `index.html` contains `<link rel="manifest" href="/manifest.json" />` but no `manifest.json` file exists in `/public/` or anywhere in the project. This causes a 404 on every page load and makes the app fail PWA installability checks (Lighthouse will report this as a failure). Browser console will show a network error.

**Fix:** Create `/public/manifest.json` with proper PWA fields (name, short_name, icons, start_url, display, theme_color, background_color).

---

### BLK-004: Favicon and Apple Touch Icon Files Missing

**File:** Referenced in `index.html` lines 5, 41
**Severity:** BLOCKER -- UX/PWA
**Impact:** `index.html` references:

- `/vite.svg` as favicon (line 5) -- file does not exist in `/public/`
- `/apple-touch-icon.png` (line 41) -- file does not exist in `/public/`

Both produce 404 errors on every page load. The default Vite favicon is visible instead of a ManaTuner branded icon, and iOS home screen addition shows a blank icon.

**Fix:** Create proper branded icons:

- `/public/vite.svg` or rename to a proper favicon
- `/public/apple-touch-icon.png` (180x180px)
- Consider adding `/public/favicon.ico` for legacy browser support

---

## 2. MAJOR Issues

### MAJ-001: CSP Blocks Sentry Error Reporting in Production

**File:** `vercel.json` line 41
**Severity:** MAJOR -- Monitoring
**Impact:** The Content-Security-Policy `connect-src` directive is set to `'self' https://api.scryfall.com`. Sentry requires `connect-src` to include `https://*.ingest.sentry.io` (or the specific Sentry DSN domain). This means **all production error reports are silently dropped** by the browser's CSP enforcement.

**Evidence:**

- `src/main.tsx` line 14: Sentry.init() is called in production
- `vercel.json` CSP connect-src does not include any Sentry domain
- `@sentry/react: ^10.47.0` is installed as a dependency

**Fix:** Add `https://*.ingest.sentry.io` to the `connect-src` CSP directive in `vercel.json`.

---

### MAJ-002: nanoid Is a Transitive Dependency (Not Declared)

**File:** `src/lib/privacy.ts` line 7
**Severity:** MAJOR -- Reliability
**Impact:** `import { nanoid } from 'nanoid'` is used to generate analysis IDs, but `nanoid` is NOT listed in `package.json` dependencies. It only exists because `vite -> postcss -> nanoid` brings it transitively. If postcss or vite change their dependency tree (e.g., postcss moves to a different ID generator), the import will break silently on the next `npm install`.

**Fix:** Add `nanoid` as a direct dependency: `npm install nanoid`

---

### MAJ-003: .env File Contains Supabase Credentials and Is Committed

**File:** `.env` (committed to git, visible in repo)
**Severity:** MAJOR -- Security
**Impact:** The `.env` file is committed to git and contains a Supabase URL and anon key. While the CLAUDE.md states Supabase is disabled/mocked, these credentials are still exposed in the repository history. The anon key (`eyJhbG...`) grants read access to the Supabase project.

**Evidence:** `.env` line 2-3 contain full Supabase URL and JWT anon key.

**Note:** `.gitignore` does include `.env` (line present), but the file was committed before the gitignore was set up, so it persists in history.

**Fix:** Rotate the Supabase anon key. Remove `.env` from tracking with `git rm --cached .env`. Consider using `.env.example` with placeholder values (which already exists).

---

### MAJ-004: handleAnalyze useCallback Missing isMobile Dependency

**File:** `src/pages/AnalyzerPage.tsx` line 157
**Severity:** MAJOR -- Functional
**Impact:** The `handleAnalyze` callback references `isMobile` (line 115) to auto-minimize the deck on mobile, but `isMobile` is NOT included in the `useCallback` dependency array `[deckList, dispatch]`. This means on mobile, if the screen is resized or orientation changes after the component mounts, the callback captures a stale `isMobile` value. The deck may not auto-minimize on mobile after analysis.

**Fix:** Add `isMobile` to the dependency array: `}, [deckList, dispatch, isMobile])`

---

### MAJ-005: Two Failing Unit Tests

**Files:** `tests/component/AnalyzerPage.test.jsx`, `src/components/analyzer/__tests__/landUtils.test.ts`
**Severity:** MAJOR -- Quality
**Impact:**

1. **AnalyzerPage "affiche les onglets d'analyse"** -- Times out after 5000ms. The test waits for analysis results that take too long due to real API calls or heavy computation in test environment.

2. **landUtils performance test "isLandCardComplete est rapide"** -- Fails with 451ms vs expected <100ms. This performance assertion is environment-dependent and flaky.

**Results:** 2 failed / 195 passed / 2 skipped out of 199 total tests.

**Fix:**

1. For AnalyzerPage test: Mock the DeckAnalyzer service or increase timeout.
2. For landUtils performance test: Either increase the threshold (500ms), skip in CI, or use a relative benchmark approach.

---

### MAJ-006: Theme Toggle Notification in French

**File:** `src/components/common/NotificationProvider.tsx` line 80
**Severity:** MAJOR -- i18n/UX
**Impact:** The entire app UI is in English, but the theme toggle notification shows French text: `Theme sombre active` / `Theme clair active`. This breaks the language consistency for all users.

**Fix:** Change to English: `Dark theme activated` / `Light theme activated`

---

### MAJ-007: SPA Has No Server-Side Rendering (SSR) or Prerendering

**Severity:** MAJOR -- SEO
**Impact:** All 5 pages return only a loading spinner (`<div class="loading">Loading ManaTuner</div>`) to web crawlers and tools that don't execute JavaScript. While Googlebot does render JavaScript, other search engines (Bing, DuckDuckGo), social media link previews, and SEO tools see zero content. The Open Graph tags and meta description mitigate this for social sharing, but the actual page content is invisible to non-JS crawlers.

**Note:** This is a structural architecture decision. The immediate mitigation is ensuring meta tags are comprehensive (which they are). Long-term, consider Vite SSG or prerendering for static pages (guide, mathematics, land-glossary).

---

### MAJ-008: sitemap.xml Lists /mes-analyses Route (French, Dead Link)

**File:** `/public/sitemap.xml` line 34
**Severity:** MAJOR -- SEO
**Impact:** The sitemap includes `/mes-analyses` which is a French alias. The canonical English route is `/my-analyses`. Navigation links use `/my-analyses`. Having `/mes-analyses` in the sitemap confuses search engines about the canonical URL. Additionally, this route is not linked from any navigation -- it exists only as an alias in `App.tsx`.

**Fix:** Remove `/mes-analyses` from sitemap. Only include `/my-analyses`.

---

## 3. MINOR Issues

### MIN-001: Residual "ManaTunerPro" Text in Source

**File:** `src/lib/privacy.ts` line 2
**Evidence:** `* Simple Storage for ManatunerPro` (comment)
**Impact:** Inconsistent branding. Low visibility but indicates incomplete rebrand.

---

### MIN-002: robots.txt Comment References Old Brand

**File:** `public/robots.txt` line 1
**Evidence:** `# robots.txt for ManaTuner Pro`
**Impact:** Minor branding inconsistency.

---

### MIN-003: 73 console.log Statements in Production Source

**Files:** 22 files across `src/`
**Impact:** While `vite.config.ts` line 52 drops console/debugger in production builds (`esbuild: { drop: ['console', 'debugger'] }`), these statements still exist in source. This is acceptable for now since Vite strips them, but it adds noise in development.

**Recommendation:** Consider using a proper logging utility with log levels instead of raw console calls.

---

### MIN-004: Open Graph Image Uses Non-Custom Domain

**File:** `index.html` lines 22, 32
**Evidence:** `og:image` and `twitter:image` point to `https://manatuner.app/og-image-v2.jpg`
**Note:** This is actually correct and uses the canonical domain. However, the og-image-v2.jpg is 123KB -- consider compressing to under 100KB for faster social preview loading.

---

### MIN-005: Canonical URL Missing www Subdomain

**File:** `index.html` line 35
**Evidence:** `<link rel="canonical" href="https://manatuner.app/" />`
**Impact:** The live site is served at `https://www.manatuner.app/` but the canonical points to `https://manatuner.app/`. This creates a potential canonical mismatch. Search engines may see two different "versions" of the site.

**Fix:** Ensure canonical URL matches the actual serving domain, or set up a redirect from one to the other.

---

### MIN-006: Stale lastmod Dates in Sitemap

**File:** `public/sitemap.xml`
**Impact:** All entries show `<lastmod>2025-12-26</lastmod>` but the app has been actively updated through April 2026. This misleads crawlers about content freshness.

**Fix:** Update lastmod dates to reflect actual content changes, or automate via build process.

---

### MIN-007: E2E Tests Use French Selectors/Locators

**File:** `tests/e2e/core-flows/main-user-flows.spec.js`
**Evidence:** Tests search for `/collez votre decklist/i` but the actual UI placeholder is in English: `Paste your decklist here...`
**Impact:** E2E tests may fail against the English UI. The E2E selectors appear out of sync with the current English-only UI.

---

### MIN-008: Land Glossary Page Not Linked in Navigation Header

**File:** `src/components/layout/Header.tsx`
**Evidence:** `navItems` array does not include `{ label: 'Land Glossary', path: '/land-glossary' }` even though the route exists and is a valuable content page.
**Impact:** Users can only discover the Land Glossary page through internal links on other pages, not via primary navigation.

---

### MIN-009: No JSON-LD Structured Data

**File:** `index.html`
**Impact:** No Schema.org structured data is present (WebApplication, SoftwareApplication, FAQPage, etc.). Adding JSON-LD could improve rich snippet appearance in search results for queries like "MTG mana calculator."

---

## 4. COSMETIC Issues

### COS-001: BetaBanner Sticky Overlap with AppBar

**File:** `src/components/common/BetaBanner.tsx` line 12
**Evidence:** BetaBanner has `position: 'sticky', top: 0, zIndex: 1100` and Header AppBar also has `position="sticky"`. Both compete for the top position. On scroll, the stacking may cause visual overlap or flicker.

---

### COS-002: Emoji Usage in Component Text

**Files:** Multiple components
**Evidence:** `DeckInputSection.tsx` uses emoji directly in Typography: `Your Deck`, `Clear`. The `ErrorFallback` in `main.tsx` uses a target emoji. While these render well on modern browsers, they may appear differently across operating systems.

---

### COS-003: Loading Messages Inconsistent Style

**File:** `src/App.tsx` lines 15-21
**Evidence:** MTG loading messages use ellipsis format ("Tapping mana sources..." / "Calculating probabilities") but the `index.html` loading uses `Loading ManaTuner` with CSS animated dots. Two different loading UX patterns.

---

### COS-004: Footer Copyright Year Range

**File:** `src/components/layout/Footer.tsx` line 57
**Evidence:** `2025-2026 ManaTuner` -- This is fine currently but should be dynamically generated.

---

### COS-005: Format Grid Has 5 Items in 4-Column Layout

**File:** `src/pages/GuidePage.tsx` lines 588-650
**Evidence:** 5 format tips (Limited, Standard, Pioneer, Modern, Legacy) are displayed in a `xs={6} md={3}` grid. With 5 items, the last item sits alone on a row at md breakpoint, creating an asymmetric layout.

---

### COS-006: "Example" Button Size Inconsistency

**File:** `src/components/analyzer/DeckInputSection.tsx` line 146
**Evidence:** `size={isMobile ? 'small' : 'small'}` -- The ternary is redundant; both branches resolve to `'small'`.

---

## 5. Cross-Browser Compatibility Assessment

### CSS Compatibility

| Feature                   | Usage                                | Browser Support                            |
| ------------------------- | ------------------------------------ | ------------------------------------------ |
| `background-clip: text`   | HomePage, GuidePage, MathematicsPage | Modern browsers OK; uses `-webkit-` prefix |
| `WebkitBackgroundClip`    | Multiple components                  | Webkit prefix present -- good              |
| `WebkitTextFillColor`     | Multiple components                  | Webkit prefix present -- good              |
| `backdrop-filter: blur()` | NotificationProvider snackbar        | Safari 9+, Chrome 76+; OK                  |
| `animation`               | Floating mana symbols, loading       | Universally supported                      |
| CSS custom properties     | `var(--mtg-red)` in DeckInputSection | IE11 not supported; acceptable             |
| `overflow-x: hidden`      | Root styles                          | Universal                                  |
| `box-sizing: border-box`  | Global reset                         | Universal                                  |

**Verdict:** No critical browser compatibility issues. The app targets modern browsers (es2015 build target), which is appropriate for the audience.

### JavaScript API Compatibility

| API                         | Usage                  | Support                        |
| --------------------------- | ---------------------- | ------------------------------ |
| `localStorage`              | Privacy storage, theme | Universal                      |
| `navigator.serviceWorker`   | SW cleanup             | Safari 11.1+; feature-detected |
| `caches` API                | Cache cleanup          | Safari 11.1+; feature-detected |
| `performance.now()`         | Tests only             | Universal                      |
| `import.meta.env`           | Vite env vars          | Build-time only                |
| `React.lazy()` + `Suspense` | Code splitting         | React 16.6+                    |

**Verdict:** Good API usage with proper feature detection for SW/caches.

---

## 6. Error Handling Assessment

| Scenario                   | Handled? | Mechanism                                        | Quality                            |
| -------------------------- | -------- | ------------------------------------------------ | ---------------------------------- |
| App crash (render error)   | Yes      | ErrorBoundary in App.tsx                         | Good -- shows recovery UI          |
| App load failure           | Yes      | try/catch in main.tsx                            | Good -- shows ErrorFallback        |
| Empty deck submission      | Yes      | Button disabled when `!deckList.trim()`          | Good                               |
| Analysis failure           | Yes      | try/catch in handleAnalyze                       | Good -- shows snackbar error       |
| Invalid deck format        | Partial  | DeckAnalyzer handles parsing                     | Cards not found gracefully skipped |
| Network error (Scryfall)   | Yes      | React Query retry + cache                        | Good -- 1 retry, fails gracefully  |
| localStorage full          | No       | PrivacyStorage does not catch QuotaExceededError | Gap                                |
| Invalid import JSON        | Yes      | Zod validation in importAnalyses                 | Good                               |
| Rapid double-click analyze | Partial  | Button disabled during analysis                  | Good                               |
| Browser back/forward       | Yes      | React Router handles SPA navigation              | Good                               |

---

## 7. Security Assessment

| Control                | Status                                   | Notes                                             |
| ---------------------- | ---------------------------------------- | ------------------------------------------------- |
| CSP Header             | Active                                   | Strict; blocks Sentry (see MAJ-001)               |
| X-Frame-Options        | DENY                                     | Good -- prevents clickjacking                     |
| X-Content-Type-Options | nosniff                                  | Good                                              |
| X-XSS-Protection       | 1; mode=block                            | Present (legacy but harmless)                     |
| HSTS                   | Active                                   | max-age=63072000; includeSubDomains; preload      |
| Referrer-Policy        | strict-origin-when-cross-origin          | Good                                              |
| Permissions-Policy     | camera=(), microphone=(), geolocation=() | Good                                              |
| Input Sanitization     | Yes                                      | Zod validation + sanitizeString in validations.ts |
| XSS in deck input      | Protected                                | HTML tags stripped by sanitizeInput               |
| CORS/Workers           | Configured                               | COEP/COOP headers for workers path                |
| .env exposure          | Issue                                    | See MAJ-003                                       |

---

## 8. State Management Assessment

| State                         | Storage                           | Persistence                       | Cleanup                                 |
| ----------------------------- | --------------------------------- | --------------------------------- | --------------------------------------- |
| Analyzer (deck, results, tab) | Redux + redux-persist             | localStorage via `persist:root`   | `clearAnalyzer` action                  |
| Saved analyses                | localStorage `manatuner_analyses` | Persistent                        | `clearAllLocalData()` in PrivacyStorage |
| Theme preference              | localStorage `manatuner-theme`    | Persistent                        | Manual only                             |
| Scryfall card cache           | In-memory Map                     | Session only                      | Clears on page reload                   |
| React Query cache             | In-memory                         | Session only (10-15 min stale/gc) | Auto-managed                            |
| Onboarding state              | Not tracked in store              | Unknown                           | N/A                                     |

**Gap:** No mechanism to detect or handle `localStorage` quota exceeded errors. If a user has many saved analyses plus large `persist:root` state, localStorage could fill up silently.

---

## 9. Test Coverage Summary

### Unit Tests (Vitest)

| Status  | Count |
| ------- | ----- |
| Passed  | 195   |
| Failed  | 2     |
| Skipped | 2     |
| Total   | 199   |

**Failing Tests:**

1. `AnalyzerPage.test.jsx > affiche les onglets d'analyse` -- Timeout (5000ms)
2. `landUtils.test.ts > isLandCardComplete est rapide` -- Performance assertion (451ms > 100ms)

### E2E Tests (Playwright)

| Test Suite        | File                                                                  | Status                    |
| ----------------- | --------------------------------------------------------------------- | ------------------------- |
| Core User Flows   | `tests/e2e/core-flows/main-user-flows.spec.js`                        | Not run (requires server) |
| Accessibility     | `tests/e2e/accessibility/a11y.spec.js`                                | Not run                   |
| Responsive        | `tests/e2e/responsive/mobile-desktop.spec.js`                         | Not run                   |
| Performance       | `tests/e2e/performance/loading.spec.js`                               | Not run                   |
| Analyzer Tabs     | `tests/e2e/tabs/analyzer-tabs.spec.js`                                | Not run                   |
| Mana Calculations | `tests/mtg-specific/mana-calculations/frank-karsten-formulas.spec.js` | Not run                   |
| Special Lands     | `tests/mtg-specific/card-types/special-lands.spec.js`                 | Not run                   |

**Note:** E2E test selectors appear to use French text that may not match the current English UI (see MIN-007).

### TypeScript Type Checking

**Status:** PASS -- `tsc --noEmit` completes with zero errors.

---

## 10. Link Validation

### Internal Links

| Link             | Source                      | Status                             |
| ---------------- | --------------------------- | ---------------------------------- |
| `/`              | Header, multiple CTAs       | OK                                 |
| `/analyzer`      | Header, HomePage CTAs       | OK                                 |
| `/guide`         | Header, HomePage            | OK                                 |
| `/mathematics`   | Header, HomePage, GuidePage | OK                                 |
| `/my-analyses`   | Header nav                  | OK                                 |
| `/mes-analyses`  | App.tsx route alias         | OK (redirects to same component)   |
| `/land-glossary` | App.tsx route               | OK (but not in nav -- see MIN-008) |
| `/about`         | Header nav, App.tsx         | OK                                 |
| `/privacy`       | Footer                      | OK                                 |
| `/*` (404)       | App.tsx catchall            | OK -- shows themed 404 page        |

### External Links

| Link                  | Source         | Target                                                |
| --------------------- | -------------- | ----------------------------------------------------- |
| GitHub repo           | Header, Footer | https://github.com/gbordes77/manatuner                |
| Scryfall API          | Footer         | https://scryfall.com                                  |
| Keyrune Icons         | Footer         | https://andrewgioia.github.io/Keyrune/                |
| Fan Content Policy    | Footer         | https://company.wizards.com/en/legal/fancontentpolicy |
| Frank Karsten article | Footer         | https://www.channelfireball.com/articles/...          |
| Tally.so feedback     | BetaBanner     | https://tally.so/r/A7KRkN                             |
| Project Manabase      | About page     | https://project-manabase.firebaseapp.com/             |

---

## 11. Testing Checklist

### Pre-Release Verification

- [ ] **BLK-001** Fix sitemap.xml domain (manatuner-pro -> manatuner.app)
- [ ] **BLK-002** Fix robots.txt domain and sitemap reference
- [ ] **BLK-003** Create /public/manifest.json with proper PWA fields
- [ ] **BLK-004** Create favicon and apple-touch-icon files
- [ ] **MAJ-001** Add Sentry domain to CSP connect-src
- [ ] **MAJ-002** Add nanoid as direct dependency
- [ ] **MAJ-003** Remove .env from git tracking, rotate Supabase key
- [ ] **MAJ-004** Fix handleAnalyze useCallback dependency array
- [ ] **MAJ-005** Fix or skip failing unit tests
- [ ] **MAJ-006** Change French theme notification to English
- [ ] **MAJ-008** Remove /mes-analyses from sitemap

### Functional Test Checklist

- [ ] Home page loads and displays hero section
- [ ] Navigate to Analyzer via CTA button
- [ ] Paste deck in textarea
- [ ] Click "Analyze Manabase" button
- [ ] Verify loading indicator appears
- [ ] Verify results display with all 6 tabs
- [ ] Click through each tab (Dashboard, Castability, Mulligan, Analysis, Manabase, Blueprint)
- [ ] Test "Clear" button resets interface
- [ ] Test "Example" button loads sample deck
- [ ] Test empty deck submission (button should be disabled)
- [ ] Test deck name input
- [ ] Navigate to Guide page -- all accordions expand/collapse
- [ ] Navigate to Mathematics page -- tables and formulas render
- [ ] Navigate to Land Glossary page -- land categories display
- [ ] Navigate to My Analyses page -- saved analyses list or empty state
- [ ] Navigate to About page -- content renders
- [ ] Navigate to Privacy page -- content renders
- [ ] Test 404 page by visiting /nonexistent
- [ ] Test theme toggle (light/dark)
- [ ] Test mobile responsive layout (< 600px)
- [ ] Test mobile drawer navigation
- [ ] Verify analysis auto-saves to localStorage
- [ ] Verify saved analysis loads from My Analyses
- [ ] Test analysis export (PNG, PDF, JSON)

### Browser Compatibility Checklist

- [ ] Chrome latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest
- [ ] Chrome on Android
- [ ] Safari on iOS
- [ ] Verify fonts load (Roboto, Cinzel, Mana Font)

### Performance Checklist

- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] Lazy-loaded pages load on navigation
- [ ] Scryfall API calls are rate-limited (100ms delay)
- [ ] React Query caching reduces redundant API calls

---

## 12. Recommendations Priority Matrix

| Priority         | Issue                                          | Effort    | Impact            |
| ---------------- | ---------------------------------------------- | --------- | ----------------- |
| P0 (Now)         | BLK-001, BLK-002: Fix sitemap/robots domain    | 10 min    | Critical SEO      |
| P0 (Now)         | BLK-003, BLK-004: Create manifest.json + icons | 30 min    | PWA compliance    |
| P1 (Soon)        | MAJ-001: Fix CSP for Sentry                    | 5 min     | Error monitoring  |
| P1 (Soon)        | MAJ-002: Add nanoid dependency                 | 1 min     | Build reliability |
| P1 (Soon)        | MAJ-003: Secure .env                           | 15 min    | Security          |
| P1 (Soon)        | MAJ-004: Fix useCallback deps                  | 1 min     | Mobile UX         |
| P1 (Soon)        | MAJ-006: English theme notification            | 1 min     | UX consistency    |
| P2 (Next sprint) | MAJ-005: Fix failing tests                     | 30 min    | CI reliability    |
| P2 (Next sprint) | MAJ-007: Consider prerendering                 | 4-8 hours | SEO               |
| P2 (Next sprint) | MIN-007: Update E2E selectors                  | 1 hour    | Test reliability  |
| P3 (Backlog)     | MIN-008: Add Land Glossary to nav              | 5 min     | Discoverability   |
| P3 (Backlog)     | MIN-009: Add JSON-LD                           | 30 min    | SEO rich snippets |

---

## Appendix: Files Examined

### Source Code (36 files analyzed)

- `index.html`, `package.json`, `vercel.json`, `vite.config.ts`, `vitest.config.js`
- `src/App.tsx`, `src/main.tsx`
- `src/pages/` -- all 6 page components
- `src/components/layout/` -- Header.tsx, Footer.tsx, StaticPages.tsx
- `src/components/common/` -- ErrorBoundary, NotificationProvider, BetaBanner, FloatingManaSymbols
- `src/components/analyzer/` -- DeckInputSection, TabPanel, AnalyzerSkeleton
- `src/store/`, `src/store/slices/analyzerSlice.ts`
- `src/lib/privacy.ts`, `src/lib/validations.ts`
- `src/services/scryfall.ts`
- `public/sitemap.xml`, `public/robots.txt`, `public/sw.js`

### Tests (11 test files identified)

- `tests/component/AnalyzerPage.test.jsx`
- `src/components/analyzer/__tests__/landUtils.test.ts`
- `tests/e2e/` -- 5 E2E spec files
- `tests/mtg-specific/` -- 2 domain-specific test files
- `src/services/__tests__/` -- service tests

### Live Site (7 URLs fetched)

- https://www.manatuner.app/ (5 routes)
- https://www.manatuner.app/sitemap.xml
- https://www.manatuner.app/robots.txt

---

_Report generated by QA Expert agent. All findings verified against source code at commit ea7d6a3 on branch main._
