# Security Audit Report - ManaTuner Pro
## Privacy Claims Verification

**Audit Date:** 2025-12-25  
**Auditor:** Security-Auditor Agent  
**Project:** ManaTuner Pro v2.0.0  
**Scope:** Verification of all privacy/security claims made on the website

---

## Executive Summary

This audit evaluates whether the privacy and security claims made on the ManaTuner Pro website are accurately implemented in the codebase. The audit reveals **mixed results**: while some claims are well-implemented, others are **misleading or not fully implemented**.

### Overall Assessment: **PARTIAL COMPLIANCE**

| Category | Status |
|----------|--------|
| Claims Fully Verified | 5/11 (45%) |
| Claims Partially Verified | 4/11 (36%) |
| Claims Not Verified/False | 2/11 (18%) |

---

## Detailed Findings by Claim

---

### 1. "Your decks stay private"

**Status:** :warning: PARTIAL

**Evidence:**
- File: `/src/lib/privacy.ts` (lines 95-115)
- Deck data is stored in `localStorage` by default
- No automatic transmission to servers in default mode

**Issues Found:**
- Decks ARE stored in plain text in localStorage (see finding #6)
- If cloud sync is enabled, deck data could be transmitted
- File `/src/hooks/useAnalysisStorage.ts` lines 59-72 shows plain JSON storage

**Verdict:** Decks stay local by default, but "private" is misleading since they are not encrypted locally.

---

### 2. "Encrypted local storage only"

**Status:** :x: FALSE

**Evidence:**
- File: `/src/lib/privacy.ts` lines 18-28
- File: `/src/hooks/useAnalysisStorage.ts` lines 59-72
- File: `/src/pages/AnalyzerPage.tsx` lines 477-487

**Critical Finding:**
```typescript
// From useAnalysisStorage.ts - NO ENCRYPTION
localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

// From AnalyzerPage.tsx - NO ENCRYPTION  
localStorage.setItem("manatuner-decklist", deckList);
localStorage.setItem("manatuner-analysis", JSON.stringify(analysisResult));
```

**The encryption class exists but is NEVER USED:**
```typescript
// privacy.ts has ClientEncryption class with encrypt/decrypt methods
// But these methods are never called when saving data!
```

**Verdict:** FALSE CLAIM. Data is stored in plain JSON, not encrypted.

---

### 3. "No sensitive data sent to server"

**Status:** :warning: PARTIAL

**Evidence:**
- File: `/src/services/scryfall.ts` - Card names ARE sent to Scryfall API
- File: `/src/services/supabase.ts` - Supabase disabled by default
- File: `/src/services/firebase.ts` - Firebase Analytics configured

**Network Calls Found:**
```typescript
// scryfall.ts lines 86, 153 - Card names sent to external API
const response = await fetch(`${SCRYFALL_API_BASE}/cards/collection`, {
  method: 'POST',
  body: JSON.stringify({ identifiers }) // Card names sent here!
})
```

**Verdict:** Card names (which reveal deck contents) ARE sent to Scryfall's servers. This contradicts the claim.

---

### 4. "Zero-Knowledge Architecture"

**Status:** :x: NOT IMPLEMENTED

**Evidence:**
- File: `/src/lib/privacy.ts` - Encryption exists but unused
- No server-side component that would require zero-knowledge proof
- Local storage is plain text

**Definition Check:** Zero-Knowledge Architecture means the service provider cannot access user data even if they wanted to. This requires:
1. Client-side encryption with user-held keys
2. Server never sees plaintext data

**Reality:**
- No actual encryption of stored data
- Card names sent to third-party (Scryfall)
- If Supabase/Firebase enabled, data sent unencrypted

**Verdict:** FALSE CLAIM. Zero-knowledge architecture is not implemented.

---

### 5. "Client-side encryption"

**Status:** :warning: PARTIAL (Code exists, not used)

**Evidence:**
- File: `/src/lib/privacy.ts` lines 7-55

**Code Review:**
```typescript
// XOR encryption exists (weak, but present)
static encrypt(text: string, key: string): string {
  // ... XOR implementation
}

// Comment admits it's not production-ready:
// "Simple XOR encryption (production would use AES-GCM)"
```

**Critical Issues:**
1. Encryption class exists but `encrypt()` is NEVER called
2. XOR encryption is cryptographically weak (trivially breakable)
3. Website claims "AES-256" but code uses XOR
4. No key management system implemented

**Verdict:** MISLEADING. Encryption code exists but is not used. Claimed AES-256 but only weak XOR implemented.

---

### 6. "We NEVER store your decks in plain text"

**Status:** :x: FALSE

**Evidence:**
- File: `/src/hooks/useAnalysisStorage.ts` lines 59-72
- File: `/src/pages/AnalyzerPage.tsx` lines 477-487
- File: `/src/lib/privacy.ts` lines 107-115

**Proof of Plain Text Storage:**
```typescript
// useAnalysisStorage.ts
localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

// AnalyzerPage.tsx  
localStorage.setItem("manatuner-decklist", deckList);

// privacy.ts - saveAnalysis stores in plain JSON
localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(trimmed))
```

**Verification:** Anyone can open browser DevTools > Application > Local Storage and see full deck contents in readable JSON.

**Verdict:** FALSE CLAIM. All deck data is stored in plain text JSON.

---

### 7. "We CANNOT read your private decks"

**Status:** :warning: PARTIAL

**Evidence:**
- No server-side storage by default (Supabase disabled)
- File: `/src/services/supabase.ts` shows mocked/disabled service

**Analysis:**
- TRUE for server access: Default mode doesn't send to their servers
- FALSE for local access: Plain text storage means anyone with device access can read

**Verdict:** Partially true - developers can't read remotely, but claim is misleading about local security.

---

### 8. "We sell NO data"

**Status:** :white_check_mark: VERIFIED

**Evidence:**
- No data collection infrastructure found
- No advertising SDKs
- No data broker integrations
- File: `/package.json` - No analytics monetization packages

**Verdict:** No evidence of data selling mechanisms.

---

### 9. "We DO NOT use tracking cookies"

**Status:** :warning: PARTIAL

**Evidence:**
- File: `/src/services/firebase.ts` lines 33-35
- File: `/package.json` - Contains `@sentry/react`
- File: `/.env.example` - Shows `VITE_GA_TRACKING_ID` option

**Findings:**
```typescript
// firebase.ts - Analytics IS configured
import { getAnalytics } from 'firebase/analytics'

// Initialize Analytics only in production
if (import.meta.env.PROD && firebaseConfig.measurementId) {
  analytics = getAnalytics(app)
}
```

```json
// package.json includes:
"@sentry/react": "^9.30.0"  // Error tracking service
```

```bash
# .env.example shows Google Analytics option:
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_ENABLE_ANALYTICS=true
```

**Verdict:** MISLEADING. Firebase Analytics and Sentry are in the codebase. Google Analytics is an optional config. While not enabled by default, the infrastructure exists.

---

### 10. "Works offline"

**Status:** :white_check_mark: VERIFIED

**Evidence:**
- File: `/vite.config.ts` lines 7-91 - Full PWA configuration
- Service worker with comprehensive caching strategy
- Scryfall API responses cached for 1 week

```typescript
// vite.config.ts - PWA with offline support
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      // Scryfall API caching for offline
      {
        urlPattern: /^https:\/\/api\.scryfall\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'scryfall-api-cache',
          expiration: { maxAgeSeconds: 60 * 60 * 24 * 7 }
        }
      }
    ]
  }
})
```

**Verdict:** TRUE. Full PWA implementation with offline support.

---

### 11. "100% Open Source"

**Status:** :white_check_mark: VERIFIED

**Evidence:**
- File: `/LICENSE` - MIT License
- Git remote: `https://github.com/gbordes77/manatuner-pro.git`
- File: `/package.json` - Repository field points to GitHub

**Verdict:** TRUE. Code is MIT licensed and available on GitHub.

---

## Summary Table

| # | Claim | Status | Severity |
|---|-------|--------|----------|
| 1 | "Your decks stay private" | :warning: PARTIAL | Medium |
| 2 | "Encrypted local storage only" | :x: FALSE | **Critical** |
| 3 | "No sensitive data sent to server" | :warning: PARTIAL | High |
| 4 | "Zero-Knowledge Architecture" | :x: FALSE | **Critical** |
| 5 | "Client-side encryption" | :warning: PARTIAL | **Critical** |
| 6 | "We NEVER store in plain text" | :x: FALSE | **Critical** |
| 7 | "We CANNOT read your private decks" | :warning: PARTIAL | Medium |
| 8 | "We sell NO data" | :white_check_mark: VERIFIED | - |
| 9 | "No tracking cookies" | :warning: PARTIAL | Medium |
| 10 | "Works offline" | :white_check_mark: VERIFIED | - |
| 11 | "100% Open Source" | :white_check_mark: VERIFIED | - |

---

## Critical Vulnerabilities

### CVE-Equivalent: Local Storage Data Exposure

**Severity:** HIGH  
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)

**Description:** User deck data is stored in browser localStorage without any encryption, despite claims of "encrypted local storage" and "AES-256 encryption".

**Impact:**
- Any browser extension can read deck data
- Any script on the same origin can access data
- Physical access to device reveals all data
- Browser sync features may upload unencrypted data to cloud

**Remediation:**
```typescript
// BEFORE (current - insecure)
localStorage.setItem("manatuner-decklist", deckList);

// AFTER (recommended)
const userKey = PrivacyStorage.getUserKey(); // Get or generate user key
const encrypted = await ClientEncryption.encryptAES(deckList, userKey);
localStorage.setItem("manatuner-decklist", encrypted);
```

---

### CVE-Equivalent: Weak Encryption Algorithm

**Severity:** MEDIUM  
**CWE:** CWE-327 (Use of Broken or Risky Cryptographic Algorithm)

**Description:** The encryption implementation uses XOR cipher instead of the claimed AES-256.

**Impact:**
- XOR encryption is trivially reversible with known-plaintext attacks
- Magic card names are predictable (known plaintext)
- Key can be recovered with minimal effort

**Remediation:**
Replace XOR with Web Crypto API's AES-GCM:
```typescript
static async encryptAES(text: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  // Return IV + ciphertext as base64
}
```

---

### Information Disclosure via Third-Party API

**Severity:** MEDIUM  
**CWE:** CWE-200 (Exposure of Sensitive Information)

**Description:** Card names are sent to Scryfall API, revealing deck contents to a third party.

**Impact:**
- Scryfall can log and analyze deck compositions
- Network observers can see deck contents
- Contradicts "no sensitive data sent" claim

**Remediation:**
- Cache card data more aggressively
- Consider local card database
- Update privacy claims to disclose Scryfall integration

---

## Recommendations

### Immediate Actions (Critical)

1. **Implement Actual Encryption**
   - Use the existing `ClientEncryption` class
   - Upgrade from XOR to AES-GCM
   - Encrypt all localStorage data

2. **Update Privacy Claims**
   - Remove or correct false claims about encryption
   - Disclose Scryfall API data transmission
   - Be transparent about Firebase Analytics potential

3. **Remove Unused Tracking Dependencies**
   - Remove `@sentry/react` if not used
   - Remove Firebase Analytics code if not intended
   - Clean up `.env.example` analytics references

### Short-Term Actions (High Priority)

4. **Implement Key Management**
   - Store encryption keys securely
   - Implement key derivation from user password
   - Add key backup/recovery mechanism

5. **Add Data Transmission Disclosure**
   - Show users when data is sent to Scryfall
   - Add option to use cached-only mode
   - Implement consent for any external calls

### Long-Term Actions (Medium Priority)

6. **True Zero-Knowledge Implementation**
   - Encrypt data before any cloud sync
   - Implement proper key exchange
   - Add end-to-end encryption for sharing

7. **Security Testing**
   - Add automated security tests
   - Implement CSP headers
   - Regular dependency audits

---

## Files Requiring Changes

| File | Required Change |
|------|-----------------|
| `/src/lib/privacy.ts` | Upgrade encryption, actually use it |
| `/src/hooks/useAnalysisStorage.ts` | Encrypt before localStorage |
| `/src/pages/AnalyzerPage.tsx` | Encrypt deck data |
| `/src/pages/PrivacyFirstPage.tsx` | Update false claims |
| `/src/components/PrivacySettings.tsx` | Update UI claims |
| `/package.json` | Remove unused Sentry dependency |
| `/src/services/firebase.ts` | Remove analytics or disclose |

---

## Conclusion

ManaTuner Pro makes strong privacy claims that are **not fully implemented**. While the application does function primarily locally and is genuinely open source, the core security claims about encryption are **materially false**.

The most critical issue is that the website explicitly claims "encrypted local storage" and "AES-256" encryption, when in reality:
1. No encryption is applied to stored data
2. The only encryption code is weak XOR (never used)
3. All deck data is stored in plain text JSON

**Recommendation:** Either implement the claimed security features or update the marketing claims to reflect the actual implementation.

---

*Report generated by Security-Auditor Agent*  
*ManaTuner Pro Security Audit - December 2025*
