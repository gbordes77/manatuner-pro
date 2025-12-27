# ManaTuner Pro - Onboarding Nouvelle Équipe

## Bienvenue !

Vous rejoignez le projet **ManaTuner Pro** en phase de **feedback utilisateurs et debug**.

**URL Production**: https://manatuner-pro.vercel.app  
**Repository**: https://github.com/gbordes77/manatuner-pro

---

## 1. Contexte du Projet

### Qu'est-ce que ManaTuner Pro ?

Un analyseur de manabase pour **Magic: The Gathering** qui répond à LA question : *"Est-ce que je peux cast mes sorts à temps ?"*

| Fonctionnalité | Description |
|----------------|-------------|
| **Health Score** | Score de santé manabase basé sur probabilités hypergeométriques |
| **Castability** | Probabilité exacte de cast chaque sort, tour par tour |
| **Mulligan Sim** | Simulation Monte Carlo (3000+ mains) avec seuils optimaux |
| **Export** | PNG, PDF, JSON pour partager les analyses |

### Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Material-UI (MUI) |
| State | Redux Toolkit |
| Tests | Vitest (unit) + Playwright (E2E) |
| Hosting | Vercel (auto-deploy sur push main) |

### Architecture Simplifiée

```
src/
├── components/          # Composants React
│   ├── analyzer/       # Interface saisie deck
│   ├── analysis/       # Visualisation résultats
│   ├── common/         # Composants partagés
│   └── export/         # Export PDF/PNG
├── pages/              # Pages de l'app (7 routes)
├── services/           # Logique métier (calculs)
├── hooks/              # Hooks React custom
├── store/              # Redux slices
└── types/              # Types TypeScript
```

---

## 2. Phase Actuelle : Feedback & Debug

### Votre Mission

1. **Collecter les retours utilisateurs** via Tally.so (intégré)
2. **Corriger les bugs** remontés par les utilisateurs
3. **Améliorer l'UX** basé sur les retours réels
4. **Maintenir la qualité** (tests, lint, build)

### Priorités

| Priorité | Focus |
|----------|-------|
| **P0** | Bugs bloquants (crash, calculs faux) |
| **P1** | UX friction (navigation, compréhension) |
| **P2** | Améliorations demandées par utilisateurs |
| **P3** | Optimisations techniques |

---

## 3. Démarrage Rapide

### Installation

```bash
# Cloner
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro

# Installer
npm install

# Lancer serveur dev
npm run dev
# → http://localhost:5173

# Vérifier que tout marche
npm run lint        # 0 errors attendu
npm run test:unit   # 86/88 passing attendu
```

### Workflow Git

```bash
# Nouvelle feature/fix
git checkout -b fix/description-courte

# Développer...

# Avant commit
npm run lint
npm run test:unit

# Commit
git add .
git commit -m "fix: description claire"
git push origin fix/description-courte

# Créer PR sur GitHub
# Merge sur main → déploiement auto Vercel
```

---

## 4. Routes de l'Application

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page avec mana flottants |
| `/analyzer` | AnalyzerPage | **Page principale** - Analyseur |
| `/guide` | GuidePage | Guide utilisateur |
| `/mathematics` | MathematicsPage | Explications maths |
| `/land-glossary` | LandGlossaryPage | Glossaire terrains MTG |
| `/my-analyses` | MyAnalysesPage | Historique local |
| `/privacy-first` | PrivacyFirstPage | Politique privacy |
| `/about` | AboutPage | À propos |

---

## 5. Fichiers Clés à Connaître

### Composants Principaux

| Fichier | Rôle |
|---------|------|
| `src/pages/AnalyzerPage.tsx` | Page principale, orchestration |
| `src/components/analyzer/DeckInputSection.tsx` | Saisie deck + boutons |
| `src/components/analyzer/DashboardTab.tsx` | Onglet résultats principal |
| `src/components/analysis/EnhancedCharts.tsx` | Graphiques d'analyse |
| `src/components/export/ManaBlueprint.tsx` | Export visuel |

### Services (Logique Métier)

| Fichier | Rôle |
|---------|------|
| `src/services/manaCalculator.ts` | Calculs hypergeométriques |
| `src/services/advancedMaths.ts` | Monte Carlo engine |
| `src/services/deckAnalyzer.ts` | Parsing decklists |
| `src/services/landService.ts` | Détection terrains |

### Configuration

| Fichier | Rôle |
|---------|------|
| `vite.config.ts` | Config build Vite |
| `vercel.json` | Config déploiement |
| `tsconfig.json` | Config TypeScript |
| `vitest.config.ts` | Config tests unit |
| `playwright.config.ts` | Config tests E2E |

---

## 6. Mana Font (Icônes MTG)

CDN chargé dans `index.html`:
```html
<link href="https://cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css" rel="stylesheet" />
```

Usage dans le code:
```tsx
<i className="ms ms-w ms-cost" />  // Blanc
<i className="ms ms-u ms-cost" />  // Bleu
<i className="ms ms-b ms-cost" />  // Noir
<i className="ms ms-r ms-cost" />  // Rouge
<i className="ms ms-g ms-cost" />  // Vert
<i className="ms ms-c ms-cost" />  // Incolore
```

Documentation: https://mana.andrewgioia.com/

---

## 7. État du Projet

### Score Audit Pré-Production : 85/100

| Domaine | Score | Status |
|---------|-------|--------|
| Security | 82/100 | GO |
| UX/Accessibility | 78/100 | GO |
| Performance | 85/100 | GO |
| TypeScript | 72/100 | GO |
| MVP Readiness | 92/100 | GO |
| Tests | 72/100 | GO |
| React Patterns | 78/100 | GO |
| DevOps | 78/100 | GO |

### Tests Actuels

```
Unit Tests:  86/88 passing (2 skipped)
ESLint:      0 errors, 40 warnings
E2E:         Multi-browser (Chrome, Firefox, Safari)
```

### P1 à Faire (Semaine 1)

1. Ajouter headers CSP dans `vercel.json`
2. Ajouter aria-labels aux onglets emoji
3. Installer Sentry error tracking
4. Ajouter navigation clavier aux cartes
5. Fixer dépendances vides useCallback

---

## 8. Documentation Disponible

### Documents Essentiels

| Document | Contenu |
|----------|---------|
| `README.md` | Vue d'ensemble projet |
| `TEAM_HANDOFF.md` | Document passation technique |
| `HANDOFF.md` | Notes de sessions |
| `PRE_PRODUCTION_AUDIT.md` | Rapport audit 8 agents |

### Documentation Technique (docs/)

| Document | Contenu |
|----------|---------|
| `docs/ARCHITECTURE.md` | Architecture technique détaillée |
| `docs/MATHEMATICAL_REFERENCE.md` | Formules hypergeométriques |
| `docs/MULLIGAN_SYSTEM.md` | Système de mulligan |
| `docs/LAND_SYSTEM_REDESIGN.md` | Système de détection terrains |
| `docs/MTG_VISUAL_IDENTITY.md` | Identité visuelle MTG |
| `docs/PRODUCT_STRATEGY.md` | Stratégie produit |

---

## 9. Points d'Attention

### Privacy-First

- **Supabase est DÉSACTIVÉ** - Tout est mocké
- Toutes les données restent en **localStorage**
- Aucun tracking utilisateur
- 100% client-side

### Performance

- Bundle: ~202KB gzipped
- Code splitting: 7 chunks lazy
- Web Workers pour Monte Carlo
- Memoization extensive

### Patterns React

- Tous les pages en React.lazy()
- Custom hooks dans `/src/hooks/`
- Redux pour état global
- MUI pour tous les composants UI

---

## 10. Commandes Utiles

```bash
# Développement
npm run dev              # Serveur dev (5173)
npm run build            # Build production
npm run preview          # Preview build local

# Qualité
npm run lint             # Check ESLint
npm run lint:fix         # Auto-fix
npm run type-check       # Check TypeScript

# Tests
npm run test:unit        # Tests Vitest
npm run test:e2e         # Tests Playwright
npm run test:coverage    # Couverture
```

---

## 11. Contacts & Ressources

### Ressources MTG

- [Frank Karsten - Manabase Theory](https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/how-many-lands-do-you-need-to-consistently-hit-your-land-drops/)
- [Scryfall API](https://scryfall.com/docs/api)
- [Mana Font](https://mana.andrewgioia.com/)

### Outils

- [Vercel Dashboard](https://vercel.com/) - Déploiements
- [GitHub Repo](https://github.com/gbordes77/manatuner-pro) - Code
- Tally.so - Feedback utilisateurs (intégré dans l'app)

---

## 12. Checklist Premier Jour

- [ ] Cloner le repo et `npm install`
- [ ] Lancer `npm run dev` et explorer l'app
- [ ] Lire `README.md` et `TEAM_HANDOFF.md`
- [ ] Lire `PRE_PRODUCTION_AUDIT.md` (sections P1)
- [ ] Lancer `npm run test:unit` pour vérifier setup
- [ ] Analyser un deck exemple sur http://localhost:5173/analyzer
- [ ] Explorer le code de `AnalyzerPage.tsx`

---

## Bonne prise en main !

L'app est stable et en production. Votre rôle est de la rendre encore meilleure grâce aux retours utilisateurs.

**Questions ?** Consultez d'abord la documentation, puis n'hésitez pas à demander.
