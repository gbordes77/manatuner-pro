# ManaTuner - Document de Passation

## 1. Vue d'ensemble

**ManaTuner** est un analyseur de manabase pour Magic: The Gathering.

| Info               | Valeur                                 |
| ------------------ | -------------------------------------- |
| **URL Production** | https://manatuner.app                  |
| **Repository**     | https://github.com/gbordes77/manatuner |
| **Stack**          | React 18 + TypeScript + Vite 7.3 + MUI |
| **Hebergement**    | Vercel (auto-deploy on push to main)   |
| **Tests**          | Vitest (unit) + Playwright (E2E)       |
| **Version**        | 2.5.8                                  |

### Ce que fait l'app

- Calcule les probabilites exactes de cast (hypergeometrique, Frank Karsten 2022)
- Simule 10,000 mains pour les decisions de mulligan (Monte Carlo, configurable 3k/10k/50k)
- Prend en compte les **mana rocks et dorks** (pas juste les terrains) via le moteur K=3
- Analyse tour par tour la castabilite (Best Case / Realistic)
- **QuickVerdict** : phrase-verdict au-dessus des onglets calibrée par format (Constructed / EDH / Limited)
- **Couverture formats complète** : 5 sample decks one-click (Aggro / Midrange / Control / Atraxa Superfriends 100c / Selesnya draft 40c) via `?sample=aggro|midrange|control|edh|limited`
- **Reading library** : 47 ressources compétitives curées (articles + podcasts + videos)
- Export Blueprint (PNG/PDF/JSON/CSV) pour partage Discord / Sheets / notebooks
- 100% client-side, privacy-first, open source MIT, zero Supabase, zero Sentry en prod

---

## 2. Demarrage rapide

```bash
git clone https://github.com/gbordes77/manatuner.git
cd manatuner
npm install
npm run dev        # http://localhost:3000

npm run test:unit  # Vitest
npm run test:e2e   # Playwright
npm run build      # Production build
```

Aucune variable d'environnement requise. L'app est 100% client-side.

---

## 3. Structure du projet

```
src/
├── components/
│   ├── analyzer/        # Onglets d'analyse (Castability, Mulligan, Analysis, Manabase, Blueprint)
│   ├── common/          # Composants partages (FloatingManaSymbols, AnimatedContainer, BetaBanner)
│   ├── export/          # ManaBlueprint (export PNG/PDF/JSON)
│   └── layout/          # Header, Footer, StaticPages
├── pages/               # HomePage, AnalyzerPage, GuidePage, MathematicsPage, LandGlossaryPage
├── services/            # Logique metier
│   ├── manaCalculator.ts      # Calculs hypergeometriques
│   ├── advancedMaths.ts       # Monte Carlo engine
│   ├── deckAnalyzer.ts        # Parsing deck + orchestration
│   ├── mulliganSimulator.ts   # Simulation mulligan + Bellman
│   ├── landService.ts         # Detection terrains (fetch, shock, check, etc.)
│   └── scryfall.ts            # API Scryfall (batch /cards/collection)
├── hooks/               # useMonteCarloWorker, useAnalyzer, etc.
├── store/               # Redux (analyzerSlice uniquement)
├── types/               # Types TypeScript
└── lib/                 # Privacy, validations (Zod)
```

---

## 4. Routes

| Route            | Page             | Description                                                                                                         |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`              | HomePage         | Landing page avec mana flottants                                                                                    |
| `/analyzer`      | AnalyzerPage     | Analyseur principal (5 onglets : Castability / Analysis / Mulligan / Manabase / Blueprint) + QuickVerdict au-dessus |
| `/guide`         | GuidePage        | Guide utilisateur                                                                                                   |
| `/mathematics`   | MathematicsPage  | Fondements mathematiques                                                                                            |
| `/land-glossary` | LandGlossaryPage | Glossaire des terrains                                                                                              |
| `/my-analyses`   | MyAnalysesPage   | Historique local                                                                                                    |
| `/about`         | AboutPage        | A propos                                                                                                            |

---

## 5. Documentation technique

| Document                           | Contenu                         |
| ---------------------------------- | ------------------------------- |
| `docs/ARCHITECTURE.md`             | Architecture technique complete |
| `docs/MATHEMATICAL_REFERENCE.md`   | Formules et algorithmes         |
| `docs/MULLIGAN_SYSTEM.md`          | Systeme Monte Carlo + Bellman   |
| `docs/CASTABILITY_TECHNICAL.md`    | Methode de calcul castabilite   |
| `docs/MANA_ACCELERATION_SYSTEM.md` | Rocks & dorks (killer feature)  |
| `docs/LAND_SYSTEM_REDESIGN.md`     | Detection terrains              |

---

## 6. Commandes utiles

```bash
npm run dev              # Serveur dev (port 3000)
npm run build            # Build production
npm run test:unit        # Tests unitaires (Vitest)
npm run test:e2e         # Tests E2E (Playwright)
npm run test:coverage    # Rapport de couverture
npm run lint             # Check ESLint
```

---

## 7. References

- [Frank Karsten - Manabase Theory](https://www.channelfireball.com/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/)
- [Mana Font Documentation](https://mana.andrewgioia.com/)
- [Scryfall API](https://scryfall.com/docs/api)

---

**Last Updated**: 2026-04-18 (v2.5.8)
