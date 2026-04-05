# AUDIT REPORT -- ManaTuner Pro v2.0.0

**Date**: 2026-04-05
**Auditors**: 9 specialized AI agents (Claude Opus 4.6)
**Project**: ManaTuner Pro -- Advanced MTG Manabase Analyzer
**Stack**: React 18 + TypeScript 5.9 + Vite 7 + MUI 5 + Redux Toolkit
**Production**: https://manatuner-pro.vercel.app
**Backup**: `Project Mana base V2 - BACKUP 20260405_161950`

---

## SCORES PAR DOMAINE

| Agent                | Domaine             | Score      | Verdict                                                        |
| -------------------- | ------------------- | ---------- | -------------------------------------------------------------- |
| Context Manager      | Cartographie projet | --         | Projet bien structure, stack moderne, 100% client-side         |
| React-pro            | Frontend React      | **6/10**   | Architecture hybride, state chaotique, 0 React.memo            |
| TypeScript-pro       | Qualite TypeScript  | **6.5/10** | Types fragmentes (4x ScryfallCard, 4x ManaCost), 23 `any`      |
| Security Auditor     | Securite            | **7/10**   | 1 critique (cle Supabase), 3 hautes (CSP, import, window.open) |
| Performance Engineer | Performance         | **5.5/10** | N+1 API Scryfall, SW mort, 608KB chunk monolithique            |
| QA Expert            | Tests & QA          | **55/100** | 15% couverture, castability non teste, fixtures inutilisees    |
| UX Designer          | UX & Accessibilite  | **7/10**   | 45 problemes identifies, gaps accessibilite critiques          |
| Documentation Expert | Documentation       | **7.3/10** | Math excellent (9/10), CHANGELOG obsolete, docs fragmentees    |
| DevOps Engineer      | CI/CD & Infra       | **46/100** | 5 workflows dupliques, 0 git hooks, 0 monitoring               |

### Score global estime : 60/100

Base solide (mathematiques, architecture, deploiement Vercel), mais dette technique significative dans la gestion d'etat, les tests, le CI/CD, et la performance.

---

## TOP 10 ACTIONS CRITIQUES (P0)

| #   | Action                                                                                                       | Agent(s) source    | Impact                                                 | Effort |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------ | ------ |
| 1   | **Revoquer la cle Supabase** exposee dans `env.example` + purger l'historique git                            | Security, DevOps   | Securite critique -- cle JWT 10 ans exposee            | 1h     |
| 2   | **Batch Scryfall API** via `/cards/collection` au lieu de N appels sequentiels (100ms chacun)                | Performance        | -80% temps d'analyse (5s -> 1s)                        | Medium |
| 3   | **Ajouter `React.memo`** sur les 19 composants analyzer tabs                                                 | React, Performance | -70% re-renders inutiles                               | Low    |
| 4   | **Supprimer les 4 slices Redux morts** (deck, analysis, auth, ui) + hook `useDeckAnalysis` duplique          | React              | Elimine sources de verite concurrentes                 | Low    |
| 5   | **Consolider les 5 workflows CI** en 2 (ci + pr-validation)                                                  | DevOps, QA         | CI fiable, -60% cout, fin des race conditions deploy   | 3h     |
| 6   | **Tester `castability/hypergeom.ts`** et `acceleratedAnalyticEngine.ts` -- modules critiques sans aucun test | QA                 | Filet de securite calculs probabilites                 | 1 jour |
| 7   | **Unifier `ScryfallCard`** (4 definitions dans 4 fichiers) et `ManaCost` (4 definitions avec 4 structures)   | TypeScript         | Coherence types, elimination bugs silencieux           | Medium |
| 8   | **Restaurer le Service Worker** (actuellement tue a chaque chargement par main.tsx)                          | Performance        | Cache offline restaure, repeat visits instantanes      | Medium |
| 9   | **Installer Sentry** pour le monitoring d'erreurs production                                                 | DevOps             | 0 -> observabilite (actuellement zero visibilite prod) | 2h     |
| 10  | **Ajouter `aria-label`** sur tous les mana symbols + graphiques Recharts                                     | UX                 | Accessibilite WCAG AA -- lecteurs d'ecran              | Low    |

---

## ACTIONS HAUTE PRIORITE (P1)

### Performance (impact immediat)

| #   | Action                                                                               | Fichier(s)                              | Impact                       |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------- | ---------------------------- |
| 11  | Split AnalyzerPage (608KB monolithique) en lazy-loaded tabs                          | `src/pages/AnalyzerPage.tsx`            | -300-400KB initial load      |
| 12  | Supprimer le `setTimeout(1500ms)` artificiel dans `useDeckAnalysis`                  | `src/hooks/useDeckAnalysis.ts:62`       | -1.5s temps analyse          |
| 13  | Fix Monte Carlo double-iteration pour std deviation                                  | `src/services/advancedMaths.ts:235-238` | -50% computation time        |
| 14  | Utiliser le singleton `manaCalculator` partout                                       | `src/services/manaCalculator.ts`        | Cache memo persistant        |
| 15  | Fix fuite de listener dans `useMonteCarloWorker`                                     | `src/hooks/useMonteCarloWorker.ts:126`  | Memory leak elimine          |
| 16  | `ManaCostRow` fires N individual Scryfall calls -- utiliser les donnees pre-fetchees | `src/components/ManaCostRow.tsx`        | -30-40 appels API redondants |

### Code Quality

| #   | Action                                                                                  | Fichier(s)                            | Impact                            |
| --- | --------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------- |
| 17  | Supprimer `vite.config.js` (garder uniquement `.ts`)                                    | `vite.config.js`                      | Fin confusion dual config         |
| 18  | Supprimer deps mortes : `jest`, `ts-jest`, `next-pwa`, `c8`, `@types/jest`              | `package.json`                        | -40MB node_modules, fin confusion |
| 19  | Creer type guards pour types domaine (`isManaColor`, `isMTGFormat`, `isLandCategory`)   | Nouveau fichier `src/types/guards.ts` | Validation runtime                |
| 20  | Corriger `ManaSymbol = ManaColor \| 'C' \| string` -- le `\| string` annule la securite | `src/types/index.ts:3`                | Type safety restauree             |
| 21  | Eliminer les 9 `any` les plus critiques                                                 | 9 fichiers (voir audit TypeScript)    | -9 any evitables                  |
| 22  | Supprimer duplication `SimulationParams` (defini 2x dans meme fichier)                  | `src/types/index.ts:216+265`          | Elimine confusion                 |
| 23  | Connecter schemas Zod aux types TS via `z.infer<>`                                      | `src/lib/validations.ts`              | Validation alignee                |

### Securite

| #   | Action                                                             | Fichier(s)                                                                | Impact                      |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------- |
| 24  | Corriger `window.open` sans `noopener,noreferrer`                  | `src/components/analyzer/DeckListTab.tsx:58`, `LandBreakdownList.tsx:115` | Reverse tabnabbing elimine  |
| 25  | Valider imports JSON dans `PrivacyStorage.importAnalyses` avec Zod | `src/lib/privacy.ts:135-143`                                              | XSS stocke prevenu          |
| 26  | Durcir CSP : supprimer `unsafe-eval`                               | `vercel.json:37`                                                          | Surface d'attaque reduite   |
| 27  | Creer `src/lib/validateEnv.ts`                                     | Nouveau fichier                                                           | Config validee au demarrage |
| 28  | Ajouter `nanoid` aux deps explicites (dep fantome)                 | `package.json`                                                            | Dep stabilisee              |

### DevOps

| #   | Action                                                       | Fichier(s)                      | Impact                |
| --- | ------------------------------------------------------------ | ------------------------------- | --------------------- |
| 29  | Installer `husky` + `lint-staged` (0 git hooks actuellement) | `package.json`, `.husky/`       | Quality gates locales |
| 30  | Creer `.prettierrc` (inexistant) et `.prettierignore`        | Nouveau fichier                 | Formatage coherent    |
| 31  | Configurer branch protection sur `main`                      | GitHub settings                 | Securite branches     |
| 32  | Aligner Node version a 20 partout (`.nvmrc`, CI workflows)   | `.nvmrc`, `.github/workflows/*` | Coherence runtime     |
| 33  | Mettre a jour `actions/upload-artifact` v3 -> v4             | `.github/workflows/ci.yml`      | Fix deprecation       |

### UX & Accessibilite

| #   | Action                                                                   | Fichier(s)                                          | Impact                      |
| --- | ------------------------------------------------------------------------ | --------------------------------------------------- | --------------------------- |
| 34  | Afficher message d'erreur quand analyse echoue (actuellement silencieux) | `src/pages/AnalyzerPage.tsx:112-114`                | UX critique                 |
| 35  | Remplacer emojis des onglets par icones MUI                              | `src/pages/AnalyzerPage.tsx`                        | Coherence visuelle cross-OS |
| 36  | Creer page 404 (actuellement redirect silencieux vers Home)              | `src/App.tsx`, nouveau composant                    | Navigation comprehensible   |
| 37  | Separer `NotificationProvider` en ThemeContext + NotificationContext     | `src/components/common/NotificationProvider.tsx`    | -50% re-renders cascade     |
| 38  | Remplacer `window.confirm` par Dialog MUI                                | `src/pages/MyAnalysesPage.tsx:49`                   | Coherence design system     |
| 39  | Corriger label TextField "List of deck" -> "Deck List"                   | `src/components/analyzer/DeckInputSection.tsx`      | UX + a11y                   |
| 40  | Unifier langue notifications (francais -> anglais)                       | `src/components/common/NotificationProvider.tsx:80` | Coherence linguistique      |
| 41  | Renommer `/mes-analyses` en `/my-analyses`                               | `src/App.tsx`                                       | Coherence URL anglaise      |

### Documentation

| #   | Action                                                                       | Fichier(s)              | Impact            |
| --- | ---------------------------------------------------------------------------- | ----------------------- | ----------------- |
| 42  | Mettre a jour CHANGELOG.md avec v2.1.0 (3+ mois non documentes)              | `CHANGELOG.md`          | Traçabilite       |
| 43  | Harmoniser instructions installation (6 docs incoherents, port 3000 vs 5173) | Multiples fichiers .md  | Onboarding fiable |
| 44  | Supprimer `CLAUDE_CHEAT_SHEET.md` (fichier vide)                             | `CLAUDE_CHEAT_SHEET.md` | Nettoyage         |

### Tests (QA)

| #   | Action                                                                                  | Fichier(s)             | Impact                         |
| --- | --------------------------------------------------------------------------------------- | ---------------------- | ------------------------------ |
| 45  | Reactiver `special-lands.spec.js` (exclu de vitest config!)                             | `vitest.config.js:16`  | Tests parsing MDFC, fetchlands |
| 46  | Cross-validation des 3 moteurs math (ManaCalculator vs AdvancedMathEngine vs Hypergeom) | Nouveau fichier test   | Garantie coherence calculs     |
| 47  | Corriger port Playwright (3000) vs Vite (5173)                                          | `playwright.config.js` | E2E fonctionnels en CI         |
| 48  | Exploiter les fixtures `competitive-decklists.js` (donnees mortes)                      | `tests/mtg-specific/`  | Edge cases MTG couverts        |

---

## DETTE TECHNIQUE STRUCTURELLE

### 1. Architecture State (probleme #1)

```
ETAT ACTUEL : 3 systemes concurrents
+-- Redux Toolkit (5 slices, dont 4 MORTS : deck, analysis, auth, ui)
+-- React Context (theme + notifications melanges dans CombinedContext)
+-- useState + localStorage direct (useDeckAnalysis.ts)

CIBLE RECOMMANDEE : Source de verite unique
+-- analyzerSlice (le seul actif -> garder et enrichir)
+-- ThemeContext (separe)
+-- NotificationContext (separe)
+-- Supprimer : deckSlice, analysisSlice, authSlice, uiSlice, useDeckAnalysis
```

### 2. Types fragmentes (probleme #2)

```
ScryfallCard -> 4 definitions dans 4 fichiers differents
  - types/scryfall.ts (reference)
  - services/scryfall.ts (avec produced_mana, keywords)
  - services/deckAnalyzer.ts (redeclaration partielle)
  - utils/hybridLandDetection.ts (locale)

ManaCost -> 4 definitions avec 4 structures differentes
  - types/index.ts:44       { symbols, cmc, colors }
  - types/manaProducers.ts:67 { mv, generic, pips }
  - services/manaCalculator.ts:3 { colorless, symbols: Record }
  - hooks/useManaCalculations.ts:5 { colorless, symbols: {} }

ManaSymbol = ManaColor | 'C' | string  <- le | string rend le type = string

SimulationParams -> duplique 2x dans types/index.ts (lignes 216 et 265)
```

### 3. Couverture de tests (probleme #3)

```
COUVERT (82/100) :
  [x] ManaCalculator (3 fichiers de test)
  [x] AdvancedMathEngine (1 fichier)
  [x] MulliganSimulator (1 fichier)
  [x] landUtils (1 fichier)
  [x] Frank Karsten reference (1 fichier)

NON COUVERT :
  [ ] castability/hypergeom.ts          <- CRITIQUE (0 tests, module central)
  [ ] castability/acceleratedAnalytic   <- CRITIQUE (0 tests)
  [ ] services/deckAnalyzer.ts          <- CRITIQUE (tests EXCLUS de vitest!)
  [ ] 5 Redux slices                    <- 0 tests
  [ ] 9 custom hooks                    <- 0 tests
  [ ] 34/35 composants React            <- 0 tests unitaires
  [ ] 6 fichiers utils/landDetection    <- 0 tests
  [ ] lib/privacy.ts                    <- 0 tests (encryption)
  [ ] lib/validations.ts                <- 0 tests (Zod schemas)
  [ ] services/scryfall.ts              <- 0 tests
  [ ] services/landService.ts           <- 0 tests
  [ ] services/landCacheService.ts      <- 0 tests
  [ ] services/manaProducerService.ts   <- 0 tests
```

### 4. CI/CD (probleme #4)

```
5 workflows GitHub Actions qui se chevauchent :
  ci-cd.yml   -> test + build + deploy (push main)
  ci.yml      -> test + security + deploy (push main)    <- DOUBLON
  deploy.yml  -> build + deploy x3 plateformes (push main) <- DOUBLON
  pr-validation.yml -> test + security (PR)
  tests.yml   -> 11 jobs (push main)                     <- DOUBLON

Resultat : chaque push sur main declenche ~3 deploys Vercel en parallele
```

### 5. Performance (probleme #5)

```
Analyse d'un deck de 60 cartes (36 uniques) :
  Scryfall API : 36 appels x 100ms delay = 3.6s minimum
  + ManaCostRow : 36 appels SUPPLEMENTAIRES (N+1)
  + Monte Carlo : 40,000 iterations (double-run pour stddev)
  + setTimeout artificiel : 1.5s
  = ~7-8 secondes total

CIBLE avec optimisations :
  Scryfall batch : 1 appel = 0.4s
  + Pas de N+1 ManaCostRow : 0s
  + Monte Carlo fix : -50%
  + Pas de setTimeout : 0s
  = ~1-2 secondes total
```

---

## VULNERABILITES DE SECURITE

| #   | Severite     | Description                                                           | Fichier                                           |
| --- | ------------ | --------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | **CRITIQUE** | Cle Supabase JWT (10 ans) commise dans `env.example` (suivi par git)  | `env.example:27-28`                               |
| 2   | **HAUTE**    | CSP avec `unsafe-inline` + `unsafe-eval` dans script-src              | `vercel.json:37`                                  |
| 3   | **HAUTE**    | Import JSON sans validation dans `importAnalyses()`                   | `src/lib/privacy.ts:135`                          |
| 4   | **HAUTE**    | `window.open()` sans `noopener,noreferrer`                            | `DeckListTab.tsx:58`, `LandBreakdownList.tsx:115` |
| 5   | **MOYENNE**  | Pas de `validateEnv.ts` -- config silencieusement incorrecte          | (fichier manquant)                                |
| 6   | **MOYENNE**  | `JSON.parse` sans try/catch dans privacy.ts et manaProducerService.ts | `privacy.ts:138`, `manaProducerService.ts:113`    |
| 7   | **MOYENNE**  | Pas de limite de taille sur localStorage (caches cumules)             | Multiples services                                |
| 8   | **MOYENNE**  | Rate limiter en memoire (inefficace en serverless)                    | `src/pages/api/analyze.ts:13`                     |
| 9   | **MOYENNE**  | Memory leak setInterval dans rateLimiting.ts                          | `src/middleware/rateLimiting.ts:277`              |
| 10  | **BASSE**    | console.warn/error non supprimes en production                        | `src/services/scryfall.ts`                        |
| 11  | **BASSE**    | Redux persist sans garde-fou explicite pour auth                      | `src/store/index.ts`                              |
| 12  | **BASSE**    | Dependance nanoid non declaree (dep fantome)                          | `src/lib/privacy.ts:1`                            |

### Points positifs securite

- Zero `dangerouslySetInnerHTML`, zero `eval()`, zero `innerHTML`
- Validation Zod solide dans `validations.ts`
- Supabase desactive par defaut (privacy-first)
- PKCE flow pour auth Supabase
- Headers securite Vercel bien configures (X-Frame-Options, Referrer-Policy, etc.)
- 13/15 liens `target="_blank"` ont `rel="noopener noreferrer"`

---

## PLAN D'ACTION RECOMMANDE

### Sprint 1 -- Securite & Stabilite (immediat)

1. Revoquer cle Supabase, remplacer par placeholder dans env.example
2. `git rm --cached .env` + purger historique avec BFG
3. Consolider CI/CD (5 -> 2 workflows)
4. Supprimer code mort (4 slices Redux, Jest, vite.config.js, deps mortes)
5. Installer Sentry
6. Creer `.prettierrc` + installer husky/lint-staged

### Sprint 2 -- Performance (semaine 1-2)

7. Batch Scryfall API (`/cards/collection`)
8. `React.memo` sur tous les tabs analyzer
9. Split AnalyzerPage en chunks lazy-loaded
10. Supprimer setTimeout 1500ms
11. Fix Monte Carlo double-iteration
12. Restaurer Service Worker proprement

### Sprint 3 -- Qualite (semaine 2-3)

13. Unifier types (ScryfallCard, ManaCost, ManaSymbol)
14. Tester castability/ + deckAnalyzer + cross-validation moteurs
15. Reactiver special-lands.spec.js
16. Fixes securite (window.open, import validation, CSP)
17. Fixes UX critiques (erreurs silencieuses, a11y mana symbols, page 404)

### Sprint 4 -- Polish (semaine 3-4)

18. Mettre a jour CHANGELOG (v2.1.0)
19. Harmoniser documentation (eliminer les 6 docs installation redondants)
20. Tests composants React prioritaires (ErrorBoundary, tabs)
21. Design tokens + hierarchie boutons + UI consistency
22. Compresser og-image.png (965KB -> ~150KB)

---

## METRIQUES CIBLES POST-AUDIT

| Metrique                 | Actuel         | Cible                     |
| ------------------------ | -------------- | ------------------------- |
| Score global             | 60/100         | 80/100                    |
| Temps analyse deck       | 5-8s           | 1-2s                      |
| Bundle AnalyzerPage      | 608KB          | <250KB                    |
| Couverture tests         | ~15%           | >60%                      |
| ESLint warnings          | 22             | 0                         |
| `any` dans le code       | 23             | <5                        |
| Workflows CI             | 5 (redondants) | 2 (consolides)            |
| Web Vitals LCP           | ~3s            | <2.5s                     |
| Vulnerabilites critiques | 1              | 0                         |
| Monitoring production    | 0%             | Sentry + Vercel Analytics |

---

## FICHIERS CLES REFERENCES

### Configuration

- `package.json` -- deps, scripts (jest/vitest/playwright)
- `tsconfig.json` -- strict mode, ES2020 target
- `vite.config.ts` -- build ES2015 (devrait etre ES2020), manual chunks, PWA
- `vite.config.js` -- **A SUPPRIMER** (config dupliquee)
- `vercel.json` -- headers securite, CSP
- `.eslintrc.cjs` -- `no-explicit-any: off` (devrait etre `warn`)
- `vitest.config.js` -- exclusion special-lands (ligne 16)
- `playwright.config.js` -- port 3000 (devrait etre 5173)
- `jest.config.js` -- **A SUPPRIMER** (orphelin)

### Code critique

- `src/pages/AnalyzerPage.tsx` -- 572 lignes, monolithique, orchestration complete
- `src/services/deckAnalyzer.ts` -- parseur central, N+1 Scryfall
- `src/services/manaCalculator.ts` -- 922 lignes, moteur mathematique
- `src/services/castability/hypergeom.ts` -- calcul hypergeometrique, 0 tests
- `src/hooks/useDeckAnalysis.ts` -- duplique Redux, setTimeout 1500ms
- `src/hooks/useMonteCarloWorker.ts` -- fuite listener ligne 126
- `src/lib/privacy.ts` -- import sans validation ligne 135
- `src/store/slices/` -- 4 slices morts sur 5
- `src/types/index.ts` -- SimulationParams duplique, ManaSymbol | string
- `src/components/common/NotificationProvider.tsx` -- theme + notifs melanges

### Securite

- `env.example` -- cle Supabase JWT exposee (lignes 27-28)
- `.env` -- credentials reelles (dans .gitignore mais deja tracked)
- `vercel.json:37` -- CSP avec unsafe-eval

### CI/CD

- `.github/workflows/ci-cd.yml` -- pipeline principal
- `.github/workflows/ci.yml` -- **DOUBLON**
- `.github/workflows/deploy.yml` -- **DOUBLON** (deploy x3 plateformes)
- `.github/workflows/pr-validation.yml` -- PR checks
- `.github/workflows/tests.yml` -- **DOUBLON** (11 jobs)

---

_Rapport genere le 2026-04-05 par 9 agents specialises (Claude Opus 4.6)_
_Backup du projet : `Project Mana base V2 - BACKUP 20260405_161950`_
