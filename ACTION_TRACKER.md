# ManaTuner Pro — Action Tracker

**Version**: 2.1.0
**Date de creation**: 2026-04-05
**Derniere mise a jour**: 2026-04-05

---

## SPRINT 1 — Securite & Stabilite

- [x] Revoquer cle Supabase dans env.example (deja fait avant session)
- [x] Verifier .env non tracke par git
- [x] Supprimer 4 slices Redux morts (deck, analysis, auth, ui)
- [x] Supprimer vite.config.js et jest.config.js (configs dupliquees)
- [x] Supprimer deps mortes (jest, ts-jest, next-pwa, c8, @types/jest)
- [x] Supprimer fichiers Next.js morts (middleware/, pages/api/, setupTests.ts)
- [x] Consolider CI/CD de 5 a 2 workflows (ci.yml + pr-validation.yml)
- [x] Aligner Node 20 partout (.nvmrc, CI)
- [x] Installer prettier + .prettierrc + .prettierignore
- [x] Installer husky + lint-staged (pre-commit hook)
- [x] Migrer process.env.NODE_ENV vers import.meta.env.DEV
- [x] Ajouter vitest/globals au tsconfig.json
- [x] Nettoyer tests/test-utils.jsx (imports morts)

## SPRINT 2 — Performance

- [x] Supprimer setTimeout(1500ms) dans useDeckAnalysis
- [x] Ajouter React.memo sur 6 composants tabs analyzer
- [x] Fix Monte Carlo double-iteration (single pass std deviation)
- [x] Lazy-load tous les tabs analyzer via React.lazy/Suspense
- [x] Batch Scryfall API via /cards/collection (N appels -> 1)

## SPRINT 3 — Qualite

- [x] Unifier ScryfallCard (4 defs -> 1 dans types/scryfall.ts)
- [x] Fix ManaSymbol (supprimer | string)
- [x] Supprimer SimulationParams duplique
- [x] Fix window.open noopener,noreferrer (2 fichiers)
- [x] Valider imports JSON dans PrivacyStorage avec Zod
- [x] Supprimer unsafe-eval de CSP (vercel.json)
- [x] Fix .gitignore (/lib/ au lieu de lib/)
- [x] Ajouter page 404
- [x] Fix label "List of deck" -> "Deck List"
- [x] Ajouter route /my-analyses (garder /mes-analyses comme alias)
- [ ] Reactiver special-lands.spec.js (BLOQUE: tests importent API privee, need rewrite)

## SPRINT 4 — Polish

- [x] Mettre a jour CHANGELOG.md avec v2.1.0
- [x] Bumper version package.json a 2.1.0
- [x] Harmoniser port 5173 -> 3000 dans 7+ docs
- [x] Compresser og-image.png 943KB -> og-image.jpg 41KB
- [x] Mettre a jour meta tags og-image dans index.html
- [x] Supprimer CLAUDE_CHEAT_SHEET.md (fichier vide)

## POST-AUDIT — 10 Actions Prioritaires

- [x] P1: Fix ManaCostRow N+1 Scryfall (passer card data en props)
- [x] P2: npm audit fix (0 vulnerabilites production, jspdf upgrade)
- [x] P3: Resoudre conflit Service Worker (supprimer vite-plugin-pwa)
- [x] P4: Installer Sentry SDK (@sentry/react, besoin VITE_SENTRY_DSN)
- [x] P5: Supprimer 7 fichiers dead code (OverviewTab, ProbabilitiesTab, useDeckAnalysis, CloudSyncSettings, ancien DeckInputSection, ResponsiveTable, PrivacyFirstPage)
- [x] P6: Supprimer 8 deps fantomes (axios, lodash, date-fns, react-hook-form, @hookform/resolvers, @supabase/supabase-js, @types/lodash, supabase.ts)
- [x] P7: 85 tests castability/hypergeom.ts + acceleratedAnalyticEngine
- [x] P8: Unifier ManaColor (4->1 avec 'C') et ManaCost (ParsedManaCost/ProducerManaCost)
- [x] P9: Fix erreur analyse silencieuse (snackbar au lieu de catch vide)
- [x] P10: Archiver 8 docs obsoletes dans docs/archive/

## BUGFIX CRITIQUE

- [x] Fix Monte Carlo drawCard() — tirage avec remplacement -> sans remplacement
- [x] Fix Vercel build — terser -> esbuild (terser n'etait pas installe)

## QUICK WINS (Features personas)

- [x] QW1: Monte Carlo 10k default + selecteur Quick(3k)/Standard(10k)/Precise(50k)
- [x] QW1b: Tooltip aide "?" expliquant Monte Carlo, marge erreur, choix precision
- [x] QW2: Champ "Deck Name" optionnel dans Analyzer
- [x] QW2b: Page My Analyses refaite (cartes avec Health Score, couleurs, stats, Load, Delete)
- [x] QW2c: Auto-nommage des decks par couleurs (ex: "3C White/Blue/Black - 05/04")
- [x] QW3: Compare A/B manabases avec deltas colores (Health Score, stats, turn probs, common spells)
- [x] QW3b: Mode selection dans My Analyses (checkboxes, 2 max)
- [x] UX: Barre tips "What you can do here" dans My Analyses
- [x] UX: Fix typo "analysises" -> "analyses"

---

## A FAIRE — Prochaine session

### Priorite Haute (4h estimees)

- [ ] Compare A/B: afficher deltas de PROBABILITE de cast par spell (pas juste CMC)
      Les donnees existent dans analysisResult.cards — les propager dans AnalysisRecord
      et les rendre dans CompareView avec DeltaChip par spell
- [ ] Fix CI Monte Carlo: utiliser Wilson interval pour le success rate
      Actuellement calcule sur stddev des turns, pas sur la proportion binaire
      Formule: margin = 1.96 _ sqrt(p_(1-p)/n) ou Wilson pour les extremes
- [ ] Filtres/tri dans My Analyses: recherche texte, tri date/score, filtre couleurs WUBRG

### Priorite Moyenne

- [ ] Bouton Import JSON dans My Analyses (le code existe dans privacy.ts, pas expose en UI)
- [ ] Remplacer click-to-expand panel par un bouton explicite (expand/collapse)
- [ ] Ajouter "Load A/B in Analyzer" directement depuis CompareView dialog
- [ ] Export CSV du tableau Compare A/B
- [ ] Reactiver/reecrire special-lands.spec.js (parseDeckList est privee)
- [ ] Configurer Sentry DSN en production (SDK installe, besoin du compte)
- [ ] Ajouter HSTS header dans vercel.json

### Projet Dedie — London Mulligan (Sprint separe)

> **Pourquoi c'est important**: Le modele actuel simule le Vancouver Mulligan (draw 7-N).
> Le London Mulligan (draw 7, bottom N) est la regle officielle depuis 2019.
> Ca change significativement les thresholds de keep/mull.

- [ ] Implementer London Mulligan dans simulateSingleGame: - Toujours draw 7 cartes apres mulligan - Ajouter chooseBottom(hand, n, strategy) pour selectionner quoi mettre en dessous - Re-shuffle le deck entre chaque mulligan - Tracker les cartes bottomed (vont en dessous de la library)
- [ ] Aligner le scoring mulligan avance (mulliganSimulatorAdvanced.ts) avec le Monte Carlo (advancedMaths.ts)
      Actuellement deux systemes paralleles avec des logiques differentes
- [ ] Tester contre des donnees de 17Lands pour calibrer les poids d'archetype
- [ ] Ajouter option "London Mulligan" vs "Vancouver Mulligan" dans le selecteur

### Nice-to-have (Futur)

- [ ] Import depuis URL Moxfield/Archidekt
- [ ] Mode debutant / explications en langage courant dans les resultats
- [ ] Remplacer "Castability" par "Spell Timing" ou ajouter sous-titre
- [ ] Remplacer loading text "hypergeometric" par "Analyzing your mana..."
- [ ] Re-take tour (replay onboarding Joyride)
- [ ] Detecteur automatique de format (Standard/Pioneer/Modern)
- [ ] Analyse post-sideboard
- [ ] API JSON / mode batch pour power users
- [ ] Export CSV structure avec schema versionne

---

## METRIQUES

| Metrique             | Debut session | Fin session     |
| -------------------- | ------------- | --------------- |
| Score audit global   | 60/100        | ~82/100         |
| Score personas moyen | 3.61/5        | 4.08/5          |
| Tests passants       | 96            | 180             |
| Vulnerabilites prod  | 1 critique    | 0               |
| Temps analyse deck   | ~7-8s         | ~1-2s           |
| Dead code files      | 15+           | 0               |
| Deps fantomes        | 13+           | 0               |
| ScryfallCard defs    | 4             | 1               |
| ManaColor defs       | 4             | 1               |
| Monte Carlo default  | 3000 (bugged) | 10000 (correct) |

## COMMITS DE CETTE SESSION

| Hash    | Message                                                   |
| ------- | --------------------------------------------------------- |
| ceb3f0f | Sprint 1: Clean up dead code, consolidate CI/CD           |
| 371a4c5 | Sprint 2: Performance optimizations                       |
| 4fc9e9a | Sprint 3: Quality — unified types, security fixes         |
| 06a0614 | Sprint 4: Polish — v2.1.0 changelog, docs, og-image       |
| ce6036c | Post-audit: 10 priority actions                           |
| 0e890f8 | Fix critical Monte Carlo bug: sampling with replacement   |
| 1901a81 | Fix Vercel build: terser -> esbuild                       |
| 10dcca9 | Monte Carlo 10k + precision selector + help tooltip       |
| 2a7b7f4 | QW2: My Analyses — deck names, health scores, load/delete |
| 049766b | QW3: A/B manabase comparison with colored deltas          |
| 49b8224 | My Analyses UX: tips bar, fix typo, auto-name by colors   |
