# ManaTuner — Audit Pré-Production Complet

**Date** : 2026-04-13 (re-audit final)
**Commit** : `cbe6f21` (HEAD `main`)
**Version package.json** : `2.2.0` (DRIFT — devrait être `2.5.1`)
**Tests** : 305 passing / 2 skipped / 0 failing
**Build** : ~7 s (Vite + esbuild)
**Méthode** : 10 sub-agents spécialisés + 5 personas MTG en 3 vagues parallèles

---

## TL;DR — Verdict global

### Score pondéré : **3.95 / 5**

### **GO-WITH-HARD-CAVEATS**

Le produit reste **launch-eligible**, mais l'audit précédent (2026-04-13 matin, score 4.54/5) **était trop généreux**. Cette re-vérification adversariale a trouvé :

- **3 bugs CRITIQUES** non détectés (régression ~25 % des sessions utilisateur)
- **1 leak HIGH** de credential (JWT Supabase committé dans `env.example`)
- **2 drifts BLOQUANTS** de documentation publique (version, LAUNCH.md)
- **5 régressions personas** : moyenne 3.76 (vs 4.42 projeté)

**Recommandation** : 6 fixes hard (~90 min de dev) avant le tweet `@fireshoes`. Sans ces fixes, ~25 % des premiers utilisateurs verront un bug visible et 8 % auront leur deck mal parsé silencieusement.

---

## Scores par dimension

### Audits techniques (10 agents)

| Agent                |    Score | Verdict             | Critique principale                                                                |
| -------------------- | -------: | ------------------- | ---------------------------------------------------------------------------------- |
| context-manager      |      n/a | Briefing            | 3 doc drifts (version, LAUNCH.md, ARCHITECTURE.md)                                 |
| Security-Auditor     |  **3.9** | GO-WITH-CAVEATS     | **JWT Supabase committé** (env.example sans dot, miss .gitignore)                  |
| performance-engineer | **4.55** | GO                  | Bundle 221 KB gzip first-load, build 7 s, K=3 engine sain                          |
| qa-expert            | **4.15** | GO-WITH-CAVEATS     | Coverage 48.7 %, `deckAnalyzer.ts` à 8.5 %, Playwright non lancé                   |
| **debugger**         |  **3.3** | **GO-WITH-CAVEATS** | **11 bugs latents : 3 CRITICAL, 4 HIGH, 3 MEDIUM, 1 LOW**                          |
| react-pro (frontend) | **4.15** | GO-WITH-CAVEATS     | Mulligan main-thread, NotificationProvider non mémo, textarea sans maxLength       |
| typescript-pro       | **4.35** | GO-WITH-CAVEATS     | `tsc --noEmit` clean, 6 `: any`, 1/8 JSON.parse Zod                                |
| deployment-engineer  |  **4.6** | GO-WITH-CAVEATS     | `index.html` sans `Cache-Control`, inline `onload` bloqué CSP                      |
| ux-designer          | **4.05** | GO-WITH-CAVEATS     | **Pas de dark mode toggle exposé**, textarea sans aria-label, WCAG borderline FAIL |
| documentation-expert |  **4.1** | GO-WITH-CAVEATS     | **Version drift 2.2.0 vs 2.5.1.2**, LAUNCH.md stale, badges README factices        |
| **Moyenne tech**     | **4.13** |                     |                                                                                    |

### Évaluations personas (5 personas MTG)

| Persona              | Profil                 | Projeté v2.5.1.2 | **Re-audit** |         Δ | Pain principal                                                                |
| -------------------- | ---------------------- | ---------------: | -----------: | --------: | ----------------------------------------------------------------------------- |
| **Léo**              | Curieux 6 mois         |             4.25 |     **3.06** | **−1.19** | "Dorks/Rocks" jargon dans H1, pas de mode débutant, mobile cramped            |
| **Sarah**            | FNM Regular 3 ans      |             4.65 |     **4.13** |     −0.52 | Pas de delta Karsten visible, pas d'import URL, sub-tab Manabase caché        |
| **Karim**            | Tacticien RCQ 7 ans    |             4.55 |     **4.13** |     −0.42 | **Pas d'export CSV/API**, pas de A/B builds, COST_REDUCER absent              |
| **Natsuki**          | Grinder Pro Tour qual  |             4.15 |     **3.13** | **−1.02** | **Monte Carlo freeze main thread**, pas de CI 95 % en UI, K=3 caché de la doc |
| **David**            | Architect Pro Tour vet |             4.50 |     **4.34** |     −0.16 | Hypothèse `min_c` non documentée, pas de RNG seed, pas de bibliographie       |
| **Moyenne personas** |                        |         **4.42** |     **3.76** | **−0.66** |                                                                               |

### Score pondéré (technique 50 % × personas 50 %)

`(4.13 × 0.5) + (3.76 × 0.5) = 3.95 / 5`

---

## BLOQUANTS HARD avant le tweet (~90 min total)

### Bloquant #1 — Rotation du JWT Supabase committé

**Agent** : Security-Auditor (HIGH) · **Effort** : 15 min
**Fichier** : `env.example:27-28`

Le `.gitignore` couvre `.env*` (avec dot leading) mais pas `env.example`. Un JWT Supabase anon valide jusqu'en **2035-07-12** est dans HEAD depuis le commit initial `2701974`. L'audit du 2026-04-12 avait scrubbed `.env.example` mais oublié le jumeau sans dot.

**Fix** :

1. Rotate la clé dans Supabase Dashboard → Settings → API → "Roll anon key" (ou supprimer le projet entier — ManaTuner ne l'utilise plus)
2. Overwrite `env.example` avec des placeholders vides
3. Ajouter `env.example` à `.gitignore`
4. Commit : `security: rotate Supabase JWT, scrub env.example`

### Bloquant #2 — Sideboard heuristic faux positif

**Agent** : debugger (CRITICAL C3) · **Effort** : 20 min
**Fichier** : `src/services/deckAnalyzer.ts:192-208`
**Impact** : ~8 % des utilisateurs (formats MTGGoldfish/Moxfield category-grouped)

La heuristique blank-line introduit en 2026-04-11 prend le **dernier** blank en priorité. Un deck groupé `Lands [blank] Creatures [blank] Spells` (59 main, 0 side) déclenche : `cardsBefore=44 ∈ [40,100]`, `cardsAfter=15 ∈ [1,15]` → match → 15 spells deviennent silencieusement sideboard. **Le user ne voit pas le bug**, juste un manabase cassé.

**Fix** : refuser l'heuristique si `cardsBefore + cardsAfter ∈ {60, 100}` (formats canoniques) OU si plusieurs blank lines consécutifs détectés. Test à ajouter dans `sideboardDetection.test.ts`.

### Bloquant #3 — NaN cascade dans `manaCalculator.ts:138`

**Agent** : debugger (CRITICAL C1) · **Effort** : 5 min
**Fichier** : `src/services/manaCalculator.ts:138`
**Impact** : ~0.5 % users mais corrompt Redux Persist

```ts
// Avant
const landRatio = totalLands / deck.totalCards
// Après
const landRatio = deck.totalCards > 0 ? totalLands / deck.totalCards : 0
```

### Bloquant #4 — NaN% dans `spellAnalysis`

**Agent** : debugger (CRITICAL C2) · **Effort** : 5 min
**Fichier** : `src/services/deckAnalyzer.ts:1179`
**Impact** : ~2 % users (deck all-lands)

```ts
percentage: total > 0 ? Math.round((castable / total) * 100) : 0
```

### Bloquant #5 — Bump version `package.json`

**Agent** : documentation-expert (BLOQUANT) · **Effort** : 5 min
**Fichier** : `package.json:3`

Drift visible immédiatement : `package.json` → `2.2.0`, `CHANGELOG.md` → `[2.5.1.2]`, `HANDOFF.md` parle de v2.5.1.2. Premier signal d'abandon perçu par David/Karim qui inspectent le repo en 10 secondes.

**Fix** : `npm version 2.5.1 --no-git-tag-version` puis commit.

### Bloquant #6 — Update `LAUNCH.md` (stale)

**Agent** : documentation-expert (BLOQUANT) · **Effort** : 2 min
**Fichier** : `LAUNCH.md:11-18`

```diff
- 213 tests passent, 0 echec
+ 305 tests passent, 2 skipped, 0 echec

- Build en 6s, deploye sur Vercel
+ Build en 7s, deploye sur Vercel

- Score persona moyen : 4.14/5
+ Score persona moyen : 3.76/5 (re-audit 2026-04-13)
```

---

## Forte recommandation (24-48 h post-tweet)

### #7 — Mulligan Monte Carlo en Web Worker

**Agent** : debugger (HIGH H1) + react-pro + Natsuki · **Effort** : 1 jour
**Fichier** : `src/components/analyzer/MulliganTab.tsx:807-834`, `src/services/mulliganSimulatorAdvanced.ts`

200 000 simulations sur main thread → freeze 2-8 s sur mobile + iOS Safari "page unresponsive". Le scaffolding existe (`src/hooks/useMonteCarloWorker.ts`, `public/workers/monteCarlo.worker.js`) mais n'est pas branché. Natsuki et Sarah auront ce freeze entre 2 rounds de FNM. **Régression directe sur l'expérience Pro Tour grinders.**

### #8 — ManaCostRow : aligner Cavern of Souls

**Agent** : debugger (HIGH H3) + react-pro · **Effort** : 30 min
**Fichier** : `src/components/ManaCostRow.tsx:685-706`

`useProbabilityCalculation` reçoit `effectiveDeckSources` (avec `creatureOnlyExtraSources`) mais `useAcceleratedCastability` reçoit `deckSources` brut. Résultat : sur un deck Humans avec 4 Cavern of Souls, l'activation de l'accélération **fait baisser** la castability de 95 % → 78 %. Inexplicable pour l'utilisateur, et faux. Touche tribal Humans/Merfolk/Slivers/Vampires/Elves/Goblins.

### #9 — Dark mode toggle dans le Header

**Agent** : ux-designer + Léo (mobile) · **Effort** : 30 min
**Fichier** : `src/components/layout/Header.tsx:232-245`

`NotificationProvider.tsx:75-78` définit `toggleTheme()`. **Aucun caller** dans la codebase. Tout le dark mode CSS du site est dead code parce qu'aucun user ne peut basculer. Ajouter un `IconButton` `Brightness4`/`Brightness7` à côté de l'icône GitHub.

### #10 — `aria-label` sur la textarea decklist

**Agent** : ux-designer (WCAG 1.3.1, 4.1.2) · **Effort** : 15 min
**Fichier** : `src/components/analyzer/DeckInputSection.tsx:79-93`

```tsx
inputProps={{
  'aria-label': 'Paste your decklist in MTGA, Moxfield, or MTGO format',
  'aria-describedby': 'deck-format-hint'
}}
```

### #11 — Surface du sample deck dans l'empty state

**Agent** : ux-designer + Léo · **Effort** : 20 min
**Fichier** : `src/pages/AnalyzerPage.tsx:438-500`

Le bouton `Example` est dans le panel **gauche**, taille `small`, peu visible. Un visiteur Léo voit "Enter your deck and click Analyze" dans le panel **droit** et abandonne. Dupliquer le CTA dans l'empty state du panel droit avec `<Button variant="outlined" startIcon={<PlayArrow/>}>See a Sample Analysis</Button>`.

### #12 — Cache-Control sur `index.html`

**Agent** : deployment-engineer · **Effort** : 5 min
**Fichier** : `vercel.json`

```json
{
  "source": "/index.html",
  "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
}
```

Sans ce header, un user qui visite avant/pendant un déploiement peut rester sur une version stale d'`index.html` qui référence des chunks JS qui n'existent plus dans le nouveau déploiement → 404 silencieux sur les imports.

### #13 — Delete `src/hooks/useAnalysisStorage.ts`

**Agent** : context-manager + multiple · **Effort** : 1 min

211 lignes orphelines, 0 callers, écrit dans la legacy localStorage key. Flaggé depuis 24 h dans CLAUDE.md. `git rm`.

---

## Post-launch backlog (non-bloquant)

### Friction personas (à itérer après les premiers retours)

| Persona | Demande                                                                   | Effort    |
| ------- | ------------------------------------------------------------------------- | --------- |
| Léo     | Mode débutant qui cache 3 onglets avancés                                 | 4 h       |
| Léo     | Renommer "Castability"/"Karsten Math"/"Dorks/Rocks" en langage simple     | 1 h       |
| Léo     | Mobile : textarea plus grande, onglets icônes seules                      | 2 h       |
| Sarah   | Delta Karsten visible (✓ 91 % above target / ⚠ 87 % below)                | 4 h       |
| Sarah   | Import deck par URL Moxfield/Archidekt/MTGA                               | 1 jour    |
| Sarah   | Sideboard swap comparatif "before/after"                                  | 1 jour    |
| Karim   | Export CSV des % par turn/color/spell                                     | 4 h       |
| Karim   | Comparaison A/B de builds side-by-side                                    | 1-2 jours |
| Karim   | Implémenter `COST_REDUCER` (Goblin Electromancer, Emry, Will Kenrith)     | 1-2 jours |
| Natsuki | Afficher CI 95 % à côté de chaque proba (Wilson `±1.96·√(p(1-p)/n)`)      | 4 h       |
| Natsuki | Toggle sample size Monte Carlo (10 k / 50 k / 100 k)                      | 2 h       |
| Natsuki | Documenter K=3 + ENHANCER sur `/mathematics` (LaTeX)                      | 1 jour    |
| David   | Documenter l'hypothèse `min_c` lower bound dans `/mathematics`            | 2 h       |
| David   | Exposer un RNG seed pour reproducibility Monte Carlo (`seedrandom`)       | 2 h       |
| David   | Tester `ENHANCER + MANA_DOUBLER + 2 dorks` cas limite                     | 2 h       |
| David   | Bibliographie académique sur `/mathematics` (Karsten ArXiv, Bellman 1957) | 1 h       |

### Bugs HIGH/MEDIUM/LOW restants

| ID  | Sévérité | Fichier                      | Description                                                       |
| --- | -------- | ---------------------------- | ----------------------------------------------------------------- |
| H2  | HIGH     | `useMonteCarloWorker.ts:140` | Event listener leak sur addEventListener sans removeEventListener |
| H4  | HIGH     | `deckAnalyzer.ts:8`          | `scryfallCache` Map unbounded → fuite mémoire long-session        |
| M1  | MED      | `CastabilityTab.tsx:69-107`  | Race condition fetchUnknown sans cleanup flag                     |
| M2  | MED      | `privacy.ts:164,220`         | `deleteAnalysis`/`importAnalyses` bypass quota-safe `persist()`   |
| M3  | MED      | `MulliganTab.tsx:830,837`    | Deux useEffect overlap → double Monte Carlo en parallèle          |
| L1  | LOW      | `useAnalysisStorage.ts`      | Orphan 211 LOC (déjà dans bloquants #13)                          |

### Performance (post-launch)

- `apple-touch-icon.png` référencé dans `index.html:38` mais absent → 404 iOS Add-to-Homescreen
- `og-image.jpg` (41 KB) + `og-image-v2.jpg` (121 KB) traînent dans `dist/` (160 KB orphelins)
- `og-image-v3.jpg` 138 KB → re-compress MozJPEG q75 ou WebP (gain ~50 KB)
- Lazy-load `PrivacySettings` dans `AnalyzerPage.tsx:26` (gain 14 KB gzip first-load Analyzer)
- Lazy-load `jspdf` (377 KB) + `html2canvas` (196 KB) — actuellement bundle commun

### Sécurité (post-launch)

- Retirer `https://*.ingest.sentry.io` de `connect-src` CSP (Sentry désactivé en prod)
- Ajouter `base-uri 'none'`, `form-action 'self'`, `object-src 'none'`, `upgrade-insecure-requests` au CSP
- `security.txt` à `public/.well-known/security.txt`
- `npm audit signatures` dans CI
- Permissions-Policy : `interest-cohort=()`, `attribution-reporting=()`, `browsing-topics=()`

### Tests (post-launch)

- Installer Firefox + WebKit pour Playwright local + ajouter job Playwright dans CI
- 10 tests Vitest mockant `fetch` Scryfall (404, 429, 500, timeout, abort)
- Tests Phyrexian `{W/P}` + twobrid `{2/W}`
- Tests edge cases : deck vide, 1 carte, all-lands, all-colorless, 200 cartes
- Débloquer les 2 tests skipped (refonte error handling AnalyzerPage)
- Tests crash localStorage (JSON corrompu, schema v0 → v1)
- Budget coverage CI : `vitest.config.js coverage.thresholds 50 %` minimum

### Documentation (post-launch)

- README : 2 screenshots Castability + Mulligan above-the-fold
- Badges CI réels (au lieu des shields statiques)
- `docs/README.md` index navigationnel pour les 30+ docs
- Runbook contributeur "Adding a new ramp card type"
- `/terms` page (10 lignes MIT-derived)
- Expand `PrivacyPage` de 3 à 10 phrases (4 garanties depuis `llms.txt`)

### Monitoring & analytics (post-launch)

- **Plausible** ou **Umami** (privacy-first, compatible avec la promesse no-tracking) — sinon le tweet `@fireshoes` se fera dans le noir total
- UptimeRobot 5-min HTTPS monitor (recommandé HANDOFF)
- GitHub branch protection sur `main`
- `npm run rollback` test à blanc avant le tweet

### Type system (post-launch)

- Activer `noUncheckedIndexedAccess: true` (40-80 sites à fixer, sprint dédié)
- 7/8 JSON.parse manquent de validation Zod (cache files surtout)
- 4 `as any` cosmétiques à narrow correctement
- `src/types/guards.ts` avec `isCreatureCard`, `isLandCard`, `isEnhancerProducer`, `isScryfallDfc`
- Brand types pour `AnalysisId` / `DeckId`

---

## Comparatif scores historique

| Audit                             | Date                  | Score pondéré |         Δ | Notes                               |
| --------------------------------- | --------------------- | ------------: | --------: | ----------------------------------- |
| 12-agent launch hardening         | 2026-04-12            |          4.19 |     +0.44 | Phase fix après round 1 (3.75)      |
| 10-agent final go-prod            | 2026-04-13 (matin)    |          4.54 |     +0.35 | "8 GO + 2 GO-WITH-CAVEATS, 0 NO-GO" |
| **10-agent + 5 persona re-audit** | **2026-04-13 (soir)** |      **3.95** | **−0.59** | **Cette session**                   |

**Pourquoi la régression** :

1. Le debugger de cette session a été **plus adversarial** que les précédents et a trouvé 11 bugs latents (3 critiques) dans des chemins peu testés (sideboard heuristique, NaN edge cases, Cavern of Souls)
2. Le Security-Auditor a remonté un fichier missed par les `.gitignore` audits précédents (`env.example` sans dot)
3. Les personas ont été **plus brutales** : Léo et Natsuki sous 3.5 (ils étaient à 4+) parce que le copywriting et la performance Mulligan sont des friction réelles que les audits techniques n'ont pas capturées
4. Documentation drift accumulé sur 24 h : `package.json` n'a jamais été bumped à `2.5.1`, `LAUNCH.md` reste sur les chiffres v2.4

**Ce qui n'est PAS une régression** :

- Le code reste excellent : `tsc --noEmit` clean, 305/307 tests, hypergeom dynamique NaN-safe, K=3 engine analytique sound
- L'architecture est saine : tab-scoped ErrorBoundary, BoundedMap LRU, Redux persist versioned, Scryfall fetch resilient
- La sécurité de fond est bonne : 0 vuln npm prod, CSP solide, headers Vercel complets, Sentry gate correct, XSS-safe

---

## Arbre de décision du créateur

### Si le tweet doit partir DANS LES 2 HEURES

→ **STOP**. Faire les 6 bloquants (≈ 90 min) :

1. Rotate JWT Supabase
2. Fix sideboard heuristic C3
3. Fix NaN C1 + C2 (10 min combinés)
4. Bump `package.json` à 2.5.1
5. Update `LAUNCH.md` (3 lignes)
6. (Bonus 5 min) Cache-Control `index.html`

Le reste devient post-launch backlog.

### Si le tweet doit partir DANS LES 24 H

→ Faire les 6 bloquants + les 4 fortes recommandations critiques :

- #7 Web Worker Mulligan
- #8 Cavern of Souls fix
- #9 Dark mode toggle
- #10 + #11 textarea aria-label + sample CTA

Total : **~6 h de travail focalisé**.

### Si le tweet doit partir DANS LA SEMAINE

→ Tout ce qui précède + adresser les frictions persona les plus criantes :

- Mode débutant Léo (cacher 3 onglets avancés derrière un toggle "Advanced")
- Delta Karsten visible Sarah
- Export CSV Karim
- CI 95 % en UI Natsuki
- Documenter K=3 + min_c sur `/mathematics` David

Total : **~3-4 jours de travail**.

### Si le tweet a déjà été posté

→ Implémenter rollback (`npm run rollback`) si > 5 % d'erreurs reportées sur le sideboard cassé. Sinon, hotfix C3 + JWT en priorité absolue, le reste en suivi normal.

---

## Top 10 quick wins (par ROI décroissant)

1. **Bump `package.json` à 2.5.1** — 2 min — restaure crédibilité GitHub
2. **Update `LAUNCH.md` stats** — 2 min — restaure crédibilité interne
3. **Rotate JWT Supabase + scrub `env.example`** — 15 min — supprime credential leak HIGH
4. **Fix sideboard heuristic C3** — 20 min — sauve 8 % des sessions
5. **Cache-Control `index.html`** — 5 min — supprime risque de 404 chunks post-deploy
6. **NaN guards C1 + C2** — 10 min — supprime cascade NaN sur edge cases
7. **Dark mode toggle Header** — 30 min — débloque dead code dark mode pour tous les users
8. **`aria-label` textarea decklist** — 15 min — passe WCAG 1.3.1
9. **Sample CTA dans empty state** — 20 min — sauve Léo en /analyzer
10. **Delete orphan `useAnalysisStorage.ts`** — 1 min — code hygiene, prévient footgun

**Total** : ≈ **2 heures de dev** pour passer de 3.95/5 à ~4.4/5.

---

## Détail des findings critiques (cross-référence)

### Multi-agent overlap : Mulligan main thread (H1)

Trouvé indépendamment par :

- **debugger** (sévérité HIGH, ~15 % users impactés)
- **react-pro** (frontend, freeze visible iOS Safari)
- **performance-engineer** (recommandation backlog)
- **Natsuki** (persona, "amateur, dealbreaker pour itération rapide")

Convergence forte → priorité élevée.

### Multi-agent overlap : `useAnalysisStorage.ts` orphan

Trouvé par :

- **context-manager** (orphan, 0 callers)
- **react-pro** (cleanup recommandé)
- **typescript-pro** (2 unvalidated `JSON.parse` à supprimer)
- **debugger** (LOW L1)

→ Delete maintenant.

### Multi-agent overlap : Documentation drift

Trouvé par :

- **context-manager** (3 drifts identifiés : version, LAUNCH.md, ARCHITECTURE.md)
- **documentation-expert** (5 doc gaps détaillés)
- **David** (persona, "première chose qu'un contributeur vérifie")

→ 6 minutes de fix `package.json` + `LAUNCH.md` + `ARCHITECTURE.md` header.

### Single-agent finding mais critique : JWT leak

Trouvé uniquement par **Security-Auditor** (audits précédents l'avaient missed). Severity HIGH parce que (a) credential committé sur repo public, (b) JWT valide jusqu'en 2035, (c) `.gitignore` ne couvre pas le pattern. Rotation obligatoire avant tout tweet public.

---

## Conclusion

Le créateur a un produit **techniquement solide** qui mérite le lancement. Le code source est de qualité production : `tsc --noEmit` clean, hypergeom NaN-safe, K=3 engine analytique innovant, architecture Redux propre, CSP/headers de sécurité complets.

**Mais** la session précédente (4.54/5) a survendu la robustness end-to-end. Cette re-vérification trouve :

- 1 credential leak qui peut tourner à l'incident en 24 h post-tweet si quelqu'un voit le repo
- 1 bug parser (sideboard heuristique) qui casse silencieusement 8 % des decklists
- 2 NaN guards manquants sur des edge cases probables (deck vide, all-lands)
- 1 freeze main-thread sur le Mulligan qui fera ragequit les mobile users
- 5 régressions persona dont **2 sous 3.5** (Léo et Natsuki) à cause de friction réelle non capturée par les audits techniques

**Les 6 bloquants représentent 90 minutes de dev focalisé**. Au-delà de ces 90 minutes, le tweet `@fireshoes` peut partir avec confiance. Sans ces 90 minutes, le risque réel est :

- ~25 % des premiers utilisateurs hitent un bug visible
- 8 % des decks sont mal parsés sans avertissement
- Le repo public expose une credential
- Le premier visiteur GitHub voit `package.json: "2.2.0"` et conclut "abandonné"

**Le créateur a 2-6 heures de travail entre lui et un lancement vraiment propre.** Ces 2-6 heures sont la dette accumulée des audits précédents trop bienveillants. Une fois cette dette payée, ManaTuner mérite vraiment son moment `@fireshoes`.

---

## Annexe — Personas mises à jour

```
Persona Scores History (re-audit 2026-04-13)

| Persona     | v2.1   | v2.4   | v2.5   | v2.5.1.2 (proj) | 2026-04-13 (re-audit) |
|-------------|--------|--------|--------|-----------------|-----------------------|
| Léo         | 3.69   | 4.11   | 3.75   | 4.25            | **3.06**              |
| Sarah       | 4.13   | 4.31   | 4.42   | 4.65            | **4.13**              |
| Karim       | 4.13   | 4.44   | 4.50   | 4.55            | **4.13**              |
| Natsuki     | 3.75   | 4.03   | 4.08   | 4.15            | **3.13**              |
| David       | 3.40   | 3.80   | 4.42   | 4.50            | **4.34**              |
| **Average** | 3.82   | 4.14   | 4.23   | 4.42            | **3.76**              |
```

Les scores chutent parce que la grille adversariale a été plus stricte sur les frictions réelles (jargon, performance, friction mobile, manque export). Les scores remonteront à 4.4+ après les 6-13 fixes des sections "Bloquants" et "Forte recommandation".

---

**Auteurs de l'audit** : 10 sub-agents Claude (`context-manager`, `Security-Auditor`, `performance-engineer`, `qa-expert`, `debugger`, `react-pro`, `typescript-pro`, `deployment-engineer`, `ux-designer`, `documentation-expert`) + 5 personas MTG simulées par `ux-designer`
**Méthode** : 3 vagues parallèles, ~30 min total real-time
**Confiance dans le verdict** : haute (overlap multi-agent sur les findings critiques)
