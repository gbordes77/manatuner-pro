# ManaTuner Security Audit Report

**Audit Date**: 2026-04-06
**Auditor**: Security Auditor Agent (Claude Opus 4.6)
**Application**: ManaTuner v2.2.0
**Live URL**: https://www.manatuner.app/
**Architecture**: 100% client-side SPA (React 18 + TypeScript + Vite, deployed on Vercel)
**Scope**: Full-stack code review + live website header/configuration analysis

---

## Executive Summary

ManaTuner is a client-side-only MTG manabase analysis tool with no backend, no authentication, and no server-side data processing. This architecture inherently limits the attack surface. The security posture is **generally strong** for its threat model, with well-configured HTTP security headers, proper input sanitization using Zod schemas, and a privacy-first approach (all data stays in localStorage).

However, the audit identified **13 findings** across severity levels that should be addressed. The most critical finding is a **Supabase JWT token committed in the local .env file**, which, while not tracked in git and with Supabase currently disabled, represents a credential hygiene issue. Other notable findings include a CSP gap that would block Sentry error reporting, use of an unpinned CDN dependency, and stale SEO artifacts referencing the old brand name.

### Findings Summary

| Severity     | Count | Description                                                                                                                         |
| ------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | 0     | -                                                                                                                                   |
| **High**     | 2     | CSP blocks Sentry; Supabase credentials in .env                                                                                     |
| **Medium**   | 4     | Unpinned CDN dep; 19 dev dependency vulns; stale robots/sitemap; SECURITY.md inaccuracy                                             |
| **Low**      | 4     | localStorage no size quota enforcement; sanitizeInput regex-based; legacy encrypted storage handling; Redux DevTools exposure check |
| **Info**     | 3     | Good practices observed (for acknowledgment)                                                                                        |

**Overall Risk Rating**: LOW (for a client-side-only app with no auth/backend)

---

## Detailed Findings

---

### FINDING-01: CSP `connect-src` Missing Sentry Ingest Domain

**Severity**: HIGH
**Category**: HTTP Security Headers / Content Security Policy
**CWE**: CWE-693 (Protection Mechanism Failure)
**OWASP**: A05:2021 - Security Misconfiguration

**Description**:
The Content-Security-Policy configured in `vercel.json` specifies `connect-src 'self' https://api.scryfall.com`. However, the application integrates Sentry (`@sentry/react` v10.47.0) for production error reporting. When `VITE_SENTRY_DSN` is set, Sentry will attempt to send error reports to its ingest endpoint (e.g., `https://*.ingest.sentry.io`). The current CSP will **silently block** all Sentry error reports, rendering the error monitoring integration completely non-functional in production.

**Location**: `/vercel.json` line 41, `/src/main.tsx` lines 14-19

**Steps to Reproduce**:

1. Set `VITE_SENTRY_DSN` in environment variables
2. Deploy to production
3. Trigger a JavaScript error
4. Open browser DevTools console -- observe CSP violation for Sentry ingest domain
5. Verify no errors appear in Sentry dashboard

**Remediation**:
Add the Sentry ingest domain to the `connect-src` directive:

```json
"Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:; img-src 'self' data: https://cards.scryfall.io https://c1.scryfall.com; connect-src 'self' https://api.scryfall.com https://*.ingest.sentry.io; frame-ancestors 'none'"
```

If you do not intend to use Sentry, remove the `@sentry/react` dependency to reduce bundle size and eliminate dead code.

---

### FINDING-02: Supabase JWT Credentials Present in Local .env File

**Severity**: HIGH
**Category**: Secrets Management
**CWE**: CWE-798 (Use of Hard-coded Credentials)
**OWASP**: A07:2021 - Identification and Authentication Failures

**Description**:
The file `.env` at the project root contains a live Supabase URL and anon key:

```
VITE_SUPABASE_URL=https://lcrzwjkbzbxanvmcjzst.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Mitigating Factors**:

- The `.env` file is correctly listed in `.gitignore` and is NOT tracked in git (confirmed: `git ls-files --error-unmatch .env` returns error)
- The `.env` file has never been committed to git history (confirmed: `git log --all -- ".env"` returns no results)
- Supabase is documented as "DISABLED" in the project -- the service is entirely mocked (`isConfigured: () => false`)
- The anon key is a _public_ key by design (Supabase Row Level Security should protect data regardless)

**However**: The token is a valid JWT that decodes to reveal the Supabase project reference (`lcrzwjkbzbxanvmcjzst`), role (`anon`), and expiry (`2065-09-41`). If the Supabase project has no RLS policies or has permissive policies, this key could be used to access or modify data.

**Remediation**:

1. If Supabase is no longer needed, delete the Supabase project entirely from the Supabase dashboard
2. If keeping for future use, rotate the anon key
3. Remove the actual values from `.env` and keep only placeholders (as in `.env.example`)
4. Remove `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `src/vite-env.d.ts` if Supabase is fully decommissioned

---

### FINDING-03: Unpinned CDN Dependency (`mana-font@latest`)

**Severity**: MEDIUM
**Category**: Supply Chain Security
**CWE**: CWE-829 (Inclusion of Functionality from Untrusted Control Sphere)
**OWASP**: A08:2021 - Software and Data Integrity Failures

**Description**:
In `index.html` line 52, the mana-font CSS is loaded from a CDN using the `@latest` tag:

```html
<link href="https://cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css" rel="stylesheet" />
```

Using `@latest` means any new version published to npm will be automatically served to all users. If the `mana-font` package were compromised (supply chain attack), malicious CSS could be injected -- potentially enabling CSS-based data exfiltration or UI manipulation. Additionally, there is no Subresource Integrity (SRI) hash on this resource.

**Remediation**:

1. Pin to a specific version:
   ```html
   <link
     href="https://cdn.jsdelivr.net/npm/mana-font@2.0.0/css/mana.css"
     rel="stylesheet"
     integrity="sha384-<hash>"
     crossorigin="anonymous"
   />
   ```
2. Alternatively, install `mana-font` as an npm dependency and bundle it with the application, eliminating the external CDN dependency entirely.

---

### FINDING-04: 19 Dev Dependency Vulnerabilities (npm audit)

**Severity**: MEDIUM
**Category**: Dependency Management
**CWE**: CWE-1395 (Dependency on Vulnerable Third-Party Component)
**OWASP**: A06:2021 - Vulnerable and Outdated Components

**Description**:
`npm audit` reports 19 vulnerabilities (2 low, 6 moderate, 11 high) in the dependency tree. All vulnerabilities are in **devDependencies only** -- specifically in the `vercel` CLI package and its transitive dependencies:

- `undici` (<=6.23.0): Multiple issues including HTTP smuggling, CRLF injection, proxy-authorization leaks
- `path-to-regexp` (4.0.0-6.2.2): ReDoS via backtracking regex
- `semver` (7.0.0-7.5.1): ReDoS
- `ajv` (7.0.0-8.17.1): ReDoS with `$data` option
- `esbuild` (<=0.24.2): Dev server request interception
- `debug` (4.0.0-4.3.0): ReDoS
- `@tootallnate/once` (<3.0.1): Incorrect control flow scoping

**Mitigating Factor**: `npm audit --omit=dev` reports **0 vulnerabilities**. None of these vulnerable packages ship to production users.

**Remediation**:

1. Run `npm audit fix` to resolve what can be auto-fixed
2. For the `vercel` CLI, consider updating to the latest major version: `npm install vercel@latest --save-dev`
3. Consider using `npx vercel` instead of a project-level `vercel` devDependency

---

### FINDING-05: Stale robots.txt and sitemap.xml (Old Brand URLs)

**Severity**: MEDIUM
**Category**: Information Disclosure / SEO Misconfiguration
**CWE**: CWE-200 (Exposure of Sensitive Information)

**Description**:
Both `public/robots.txt` and `public/sitemap.xml` reference the old domain `manatuner-pro.vercel.app` instead of the current `manatuner.app`:

**robots.txt**:

```
Sitemap: https://manatuner-pro.vercel.app/sitemap.xml
```

**sitemap.xml**: All `<loc>` entries use `https://manatuner-pro.vercel.app/...`

This misdirects search engine crawlers, potentially causing:

- Indexing failures for the correct domain
- SEO dilution between old and new domains
- Information disclosure about previous branding/infrastructure

**Remediation**:
Update both files to reference `https://manatuner.app/` and ensure all page URLs match the current route structure (`/my-analyses` vs `/mes-analyses`).

---

### FINDING-06: SECURITY.md Claims AES-256 Encryption for localStorage

**Severity**: MEDIUM
**Category**: Documentation Inaccuracy / Misleading Security Claims
**CWE**: CWE-1059 (Insufficient Technical Documentation)

**Description**:
The `SECURITY.md` file states:

> "All deck data stored in browser localStorage with AES-256 encryption"

This is **factually incorrect**. Code review of `src/lib/privacy.ts`, `src/hooks/useAnalysisStorage.ts`, `src/services/landCacheService.ts`, and `src/contexts/AccelerationContext.tsx` confirms that all localStorage data is stored as **plaintext JSON** via `JSON.stringify()` and `localStorage.setItem()`. There is no encryption layer.

The `useAnalysisStorage.ts` hook even contains legacy handling for a `parsed.encrypted` flag (line 101), suggesting encryption was removed at some point but the documentation was not updated.

**Remediation**:
Update `SECURITY.md` to accurately state:

> "All deck data stored in browser localStorage as JSON. Data never leaves your browser."

Misleading security claims erode user trust when discovered and could have legal implications depending on jurisdiction.

---

### FINDING-07: No localStorage Storage Quota Enforcement

**Severity**: LOW
**Category**: Denial of Service (Client-Side)
**CWE**: CWE-770 (Allocation of Resources Without Limits or Throttling)

**Description**:
Multiple services write to localStorage without coordinated size management:

| Service                    | localStorage Key                  | Limit                             |
| -------------------------- | --------------------------------- | --------------------------------- |
| `privacy.ts`               | `manatuner_analyses`              | Last 50 entries                   |
| `useAnalysisStorage.ts`    | `manatuner-analyses`              | Last 50 entries                   |
| `landCacheService.ts`      | `manatuner_lands_cache`           | 500 before cleanup, 100 emergency |
| `manaProducerService.ts`   | (producer cache)                  | Not examined                      |
| `AccelerationContext.tsx`  | `manatuner_acceleration_settings` | Single object                     |
| `NotificationProvider.tsx` | `manatuner-theme`                 | Single value                      |
| `Onboarding.tsx`           | Onboarding key                    | Single boolean                    |
| `redux-persist`            | `persist:root`                    | Entire Redux state                |

Each service handles its own cleanup independently. The `landCacheService.ts` has good emergency cleanup logic (line 347), but there is no global quota coordination. If localStorage approaches its 5-10MB limit, services could compete and cause silent data loss.

Additionally, there are **two separate analysis storage systems** (`manatuner_analyses` and `manatuner-analyses`) that appear to serve the same purpose, which is both a data integrity and storage waste issue.

**Remediation**:

1. Consolidate the two analysis storage keys into one
2. Consider a centralized storage manager that tracks total usage
3. The emergency cleanup pattern in `landCacheService.ts` is well-implemented and could be adopted as a project-wide pattern

---

### FINDING-08: Regex-Based HTML Sanitization (Bypassable)

**Severity**: LOW
**Category**: Cross-Site Scripting Prevention
**CWE**: CWE-79 (Improper Neutralization of Input During Web Page Generation)

**Description**:
Two sanitization functions exist in `src/lib/validations.ts`:

```typescript
// Line 204
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
}

// Line 348
export const sanitizeString = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}
```

Regex-based HTML sanitization is inherently fragile and can be bypassed. For example, `sanitizeString` removes `javascript:` but does not remove `<img>` tags or other elements. However, the actual risk is **LOW** because:

1. React's JSX automatically escapes interpolated values (no `dangerouslySetInnerHTML` is used anywhere -- confirmed by grep)
2. No `innerHTML`, `eval()`, `document.write()`, or `new Function()` patterns exist in the codebase
3. The sanitization is applied to deck card names before they are used in API calls (e.g., `parseDecklistText` in `scryfall.ts` line 201)
4. All user input flows through React's virtual DOM, which provides inherent XSS protection

**Remediation**:
The current approach is adequate given React's built-in protections. If stronger sanitization is ever needed (e.g., rendering user HTML), use a dedicated library like DOMPurify instead of regex.

---

### FINDING-09: Legacy Encrypted Storage Handling Without Validation

**Severity**: LOW
**Category**: Data Integrity
**CWE**: CWE-502 (Deserialization of Untrusted Data)

**Description**:
In `src/hooks/useAnalysisStorage.ts` lines 97-105:

```typescript
if (parsed.data && !parsed.encrypted) {
  return JSON.parse(parsed.data) // Double JSON.parse
}
if (parsed.encrypted) {
  console.warn('Clearing legacy encrypted storage')
  localStorage.removeItem(LOCAL_STORAGE_KEY)
  return []
}
```

The code performs a double `JSON.parse` on `parsed.data` without validation. If localStorage data is malformed, this could throw an uncaught exception. While wrapped in a try-catch at the outer level, this pattern indicates incomplete migration from a previous storage format.

**Remediation**:

1. Remove the legacy format handling entirely if the migration period has passed
2. If keeping it, add Zod validation (as done correctly in `privacy.ts` line 161)

---

### FINDING-10: Redux DevTools Enabled in Development Mode

**Severity**: LOW
**Category**: Information Disclosure (Development Only)
**CWE**: CWE-489 (Active Debug Code)

**Description**:
In `src/store/index.ts` line 26:

```typescript
devTools: import.meta.env.DEV,
```

Redux DevTools and React Query DevTools (`src/main.tsx` line 135) are correctly gated behind `import.meta.env.DEV`, which means they are stripped from production builds by Vite's build process. This is the correct pattern.

**Verification**: The `esbuild.drop: ['console', 'debugger']` in `vite.config.ts` further strips console statements from production builds.

**Status**: No action required. This is properly implemented.

---

### FINDING-11 (Info): Excellent Input Validation Architecture

**Severity**: INFO (Positive Finding)
**Category**: Input Validation

The codebase demonstrates strong input validation practices:

- Comprehensive Zod schemas in `src/lib/validations.ts` for all data types
- Deck size limits (40-250 cards), iteration limits (1,000-100,000), string length caps
- Input sanitization applied at the parsing layer before API calls
- `encodeURIComponent()` consistently used for all Scryfall API URL parameters
- Proper rate limiting on Scryfall API calls (100ms delay between requests)

---

### FINDING-12 (Info): Strong HTTP Security Headers

**Severity**: INFO (Positive Finding)
**Category**: HTTP Security Headers

The `vercel.json` configuration includes all recommended security headers:

| Header                    | Value                                              | Status                               |
| ------------------------- | -------------------------------------------------- | ------------------------------------ |
| Content-Security-Policy   | Comprehensive policy with `frame-ancestors 'none'` | GOOD (see FINDING-01 for gap)        |
| X-Frame-Options           | DENY                                               | GOOD                                 |
| X-Content-Type-Options    | nosniff                                            | GOOD                                 |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload       | EXCELLENT (2-year HSTS with preload) |
| Referrer-Policy           | strict-origin-when-cross-origin                    | GOOD                                 |
| Permissions-Policy        | camera=(), microphone=(), geolocation=()           | GOOD                                 |
| X-XSS-Protection          | 1; mode=block                                      | PRESENT (deprecated but harmless)    |

The `/workers/` path also has `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`, which is excellent for Web Worker isolation.

---

### FINDING-13 (Info): External Link Handling is Mostly Correct

**Severity**: INFO (Positive Finding)
**Category**: Tabnabbing Prevention

All `target="_blank"` links in layout components (Header, Footer, StaticPages, BetaBanner) correctly include `rel="noopener noreferrer"`. The `window.open()` calls in `LandBreakdownList.tsx` and `DeckListTab.tsx` also correctly specify `'noopener,noreferrer'` as the third argument.

---

## Additional Security Observations

### Service Worker Security

The `sw.js` "SW Killer" pattern is correctly implemented. It clears all caches, unregisters itself, and reloads clients. The `no-cache, no-store, must-revalidate` headers on `/sw.js` in `vercel.json` ensure browsers always fetch the latest version. The `main.tsx` also includes client-side SW unregistration logic as a belt-and-suspenders approach.

### No Exposed API Keys in Production Build

The only external API used is **Scryfall** (public, no key required). Supabase code has been stripped to a mock. `VITE_SENTRY_DSN` is only read at runtime and is not hardcoded in source. The `vite.config.ts` disables source maps in production (`sourcemap: false`), preventing source code exposure.

### Privacy-First Architecture

The application genuinely follows its privacy-first claims:

- No cookies set
- No analytics/tracking scripts in the codebase
- No Google Analytics integration (despite `VITE_GA_TRACKING_ID` in `.env.example`, it is not referenced in any source code)
- All data remains in the user's browser localStorage
- Export/import and one-click data deletion features exist
- The only external network calls are to Scryfall's public API for card data

### HTTPS and Mixed Content

The application is deployed on Vercel with automatic HTTPS. The HSTS header with preload ensures HTTPS is enforced. All external resources (Google Fonts, jsdelivr CDN, Scryfall API, Scryfall card images) are loaded over HTTPS. No mixed content vectors were identified.

### `style-src 'unsafe-inline'` in CSP

The CSP includes `'unsafe-inline'` in `style-src`. This is necessary for MUI (Material UI), which injects styles via `<style>` tags at runtime. While `'unsafe-inline'` weakens the CSP for styles, it does NOT affect `script-src` (which correctly restricts to `'self'` only), so the XSS protection remains strong.

---

## Remediation Priority

| Priority | Finding                                                             | Effort | Impact                   |
| -------- | ------------------------------------------------------------------- | ------ | ------------------------ |
| P1       | FINDING-01: Add Sentry domain to CSP connect-src (or remove Sentry) | 5 min  | Enables error monitoring |
| P1       | FINDING-02: Clean up .env Supabase credentials                      | 10 min | Credential hygiene       |
| P2       | FINDING-06: Fix SECURITY.md encryption claim                        | 5 min  | Documentation accuracy   |
| P2       | FINDING-05: Update robots.txt and sitemap.xml URLs                  | 10 min | SEO correctness          |
| P2       | FINDING-03: Pin mana-font CDN version + add SRI                     | 15 min | Supply chain security    |
| P3       | FINDING-04: Run npm audit fix for dev deps                          | 5 min  | Dev environment security |
| P3       | FINDING-07: Consolidate duplicate localStorage keys                 | 30 min | Data integrity           |
| P3       | FINDING-09: Clean up legacy storage handling                        | 15 min | Code quality             |

---

## Methodology

This audit was conducted using the following approach:

1. **Static Code Analysis**: Full source tree review of all TypeScript/TSX files for security anti-patterns (XSS sinks, eval, innerHTML, hardcoded secrets, insecure deserialization)
2. **Dependency Analysis**: `npm audit` for known CVEs in direct and transitive dependencies
3. **Configuration Review**: Analysis of `vercel.json`, `vite.config.ts`, `.gitignore`, `.env`, and CSP headers
4. **Live Website Inspection**: WebFetch of https://www.manatuner.app/ and https://www.manatuner.app/sw.js to verify deployed configuration
5. **Git History Audit**: Verification that `.env` was never committed to version control
6. **OWASP Top 10 Mapping**: Each finding mapped to OWASP 2021 and CWE classifications

### Tools Used

- Manual code review (grep, file analysis)
- `npm audit` / `npm audit --omit=dev`
- `git log` / `git ls-files` for history analysis
- WebFetch for live site inspection

### Out of Scope

- Dynamic penetration testing (no authorization to run active attacks)
- Network-level scanning (Vercel infrastructure)
- Browser-level exploitation testing
- Performance/availability testing

---

**Report Prepared By**: Security Auditor Agent
**Classification**: Internal Use
**Next Review Date**: Recommended in 90 days or after any major feature addition
