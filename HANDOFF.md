# HANDOFF - ManaTuner Pro

**Date**: 26 Decembre 2025  
**Version**: 2.0.0  
**Status**: Production - Stable  
**Live URL**: https://manatuner-pro.vercel.app

---

## Etat Actuel du Projet

### Statut Global: FONCTIONNEL

L'application est deployee et fonctionnelle sur Vercel. Toutes les fonctionnalites principales sont operationnelles.

### Derniers Commits
```
3455dd0 Fix: Add missing AnalyzerSkeleton import
be1a111 UI Polish: skeleton loader, icons, fade animations, refactoring
f8aaae1 Major UX Overhaul: 4 tabs + Dashboard + Full optimization
09b397b Refactor: AnalyzerPage 2041 -> 407 lignes (-80%)
770a9f0 Perf: Lazy loading - Bundle initial 684KB -> 90KB (-87%)
```

---

## Architecture Technique

### Stack Technologique
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Frontend | React | 18.2.0 |
| Langage | TypeScript | 5.9.3 |
| UI Framework | Material-UI | 5.11.10 |
| Build Tool | Vite | 7.3.0 |
| State Management | Redux Toolkit | 1.9.3 |
| Charts | Recharts | 2.15.3 |
| Testing | Vitest + Playwright | 4.0.16 / 1.53.1 |
| Hosting | Vercel | - |

### Structure des Dossiers
```
src/
├── components/
│   ├── analyzer/           # Composants principaux de l'analyseur
│   │   ├── AnalyzerSkeleton.tsx    # Skeleton loader
│   │   ├── AnalysisTab.tsx         # Onglet analyse (sub-tabs)
│   │   ├── CastabilityTab.tsx      # Onglet castabilite
│   │   ├── DashboardTab.tsx        # Onglet dashboard (246 lignes)
│   │   ├── DeckInputSection.tsx    # Section input deck
│   │   ├── DeckListTab.tsx         # Liste du deck
│   │   ├── LandBreakdownList.tsx   # Liste des terrains (NEW)
│   │   ├── ManabaseFullTab.tsx     # Onglet manabase complet
│   │   ├── ManabaseStats.tsx       # Stats manabase (NEW)
│   │   ├── ManabaseTab.tsx         # Onglet manabase (116 lignes)
│   │   ├── ManaDistributionChart.tsx # Chart distribution (NEW)
│   │   ├── OverviewTab.tsx         # Vue d'ensemble
│   │   ├── ProbabilitiesTab.tsx    # Probabilites
│   │   ├── TabPanel.tsx            # Panel avec Fade animation
│   │   ├── index.ts                # Barrel exports
│   │   └── landUtils.ts            # Utilitaires terrains (366 lignes)
│   ├── common/             # Composants reutilisables
│   ├── layout/             # Header, Footer
│   └── analysis/           # Monte Carlo, Turn by Turn
├── pages/
│   ├── AnalyzerPage.tsx    # Page principale (379 lignes)
│   ├── HomePage.tsx        # Landing page
│   ├── GuidePage.tsx       # Documentation utilisateur
│   └── ...                 # Autres pages
├── services/
│   ├── deckAnalyzer.ts     # Service d'analyse de deck
│   ├── manaCalculator.ts   # Calculs mathematiques Karsten
│   └── advancedMaths.ts    # Distribution hypergeometrique
├── hooks/                  # Custom hooks React
├── store/                  # Redux slices
├── types/                  # Definitions TypeScript
└── utils/                  # Utilitaires
```

---

## Scores Qualite Actuels

| Domaine | Score | Details |
|---------|-------|---------|
| **UI** | 8.6/10 | Design coherent, MUI bien utilise |
| **UX** | 7.8/10 | Navigation claire, manque onboarding interactif |
| **Performance** | 7.5/10 | Lazy loading OK, manque memoization |
| **Code Quality** | 8.4/10 | Bon refactoring, typage strict |
| **Moyenne** | **8.1/10** | |

---

## Fonctionnalites Implementees

### Core Features
- [x] Analyse de deck MTG (formats MTGA, Moxfield, TappedOut)
- [x] Calculs probabilites Frank Karsten (distribution hypergeometrique)
- [x] Systeme P1/P2 (Play vs Draw)
- [x] Recommendations intelligentes basees sur les calculs
- [x] Score de sante du deck (%)
- [x] Distribution des couleurs de mana
- [x] Analyse des terrains (tempo-aware)
- [x] Monte Carlo simulations (Web Workers)

### UI/UX Features
- [x] 4 onglets principaux (Dashboard, Castability, Analysis, Manabase)
- [x] Skeleton loader pendant l'analyse
- [x] Fade animations sur changement d'onglet
- [x] Icones MUI sur les sous-onglets
- [x] Design responsive (mobile-first)
- [x] Dark/Light theme
- [x] PWA installable

### Privacy Features
- [x] Stockage local uniquement (localStorage)
- [x] Auto-save des analyses
- [x] Export/Import des donnees
- [x] Zero tracking par defaut

---

## Ameliorations Identifiees (Non Implementees)

### Priorite Haute - Impact immediat sur les scores

#### 1. Memoisation des composants (+1 pt Performance)
```typescript
// DashboardTab.tsx - Ajouter
const health = useMemo(() => getHealthStatus(), [consistencyPercent]);

// ManabaseTab.tsx - Ajouter  
const colorData = useMemo(() => MANA_COLORS.map(...), [analysisResult.colorDistribution]);

// AnalyzerPage.tsx - Ajouter
const handleAnalyze = useCallback(async () => {...}, [deckList]);
```

#### 2. Tooltips explicatifs (+0.5 pt UX)
- Ajouter des icones "?" sur les termes techniques
- Termes a expliquer: CMC, consistency, P1/P2, mana screw, tempo loss
- Utiliser `<Tooltip>` de MUI

#### 3. Extraction constantes MANA_COLORS (+0.5 pt Code Quality)
```typescript
// Creer src/constants/manaColors.ts
export const MANA_COLOR_STYLES = {
  W: { bg: "#FFF8DC", text: "#2C3E50", border: "#D4AF37" },
  U: { bg: "#4A90E2", text: "#FFFFFF", border: "#2E5090" },
  B: { bg: "#2C2C2C", text: "#FFFFFF", border: "#1a1a1a" },
  R: { bg: "#E74C3C", text: "#FFFFFF", border: "#C0392B" },
  G: { bg: "#27AE60", text: "#FFFFFF", border: "#1E8449" },
};
```
Actuellement duplique dans: DashboardTab, ManabaseTab, OverviewTab

### Priorite Moyenne

#### 4. Code Splitting Vendors
```javascript
// vite.config.ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-mui': ['@mui/material', '@mui/icons-material'],
  'vendor-charts': ['recharts'],
}
```

#### 5. Prefetch /analyzer
- Preload la page Analyzer au hover du lien navigation
- Utiliser `<link rel="prefetch">`

#### 6. Migration vers Redux
- Le Redux store existe mais n'est PAS utilise dans AnalyzerPage
- AnalyzerPage utilise useState local (6 states) + localStorage manuel
- Migrer vers les slices existants: deckSlice, analysisSlice, uiSlice

### Priorite Basse

#### 7. Tests unitaires composants analyzer
- Aucun test dans `/components/analyzer/`
- Priorite: landUtils.ts, DashboardTab, ManabaseTab

#### 8. Onboarding interactif
- Ajouter react-joyride pour tour guide
- Coachmarks sur premieres utilisations

---

## Bugs Connus / Points d'Attention

### 1. Import manquant lors d'edits
**Probleme**: L'outil Edit peut parfois ne pas appliquer correctement les imports.  
**Solution**: Toujours verifier que les imports sont presents apres un Edit. Utiliser Write pour les modifications complexes.

### 2. Section Tempo Impact retiree
**Raison**: Les calculs de "Tempo Loss" etaient incorrects pour certains decks.  
**Fichier**: `src/components/EnhancedSpellAnalysis.tsx`  
**Action**: Si cette feature doit revenir, recalculer la logique de detection des terrains tapped.

### 3. Redux non synchronise
**Probleme**: Le store Redux existe mais AnalyzerPage utilise useState + localStorage.  
**Impact**: Double source de verite, prop drilling.  
**Solution**: Migrer vers Redux selectors.

---

## Commandes Utiles

```bash
# Developpement
npm run dev              # Serveur dev sur localhost:5173

# Build
npm run build            # Build production
npm run preview          # Preview du build

# Tests
npm run test:unit        # Tests unitaires Vitest
npm run test:e2e         # Tests E2E Playwright
npm run test:quick       # Tests rapides (unit + core flows)

# Qualite
npm run lint             # ESLint
npm run lint:fix         # ESLint avec fix
npm run type-check       # Verification TypeScript

# Deploiement
git push origin main     # Auto-deploy sur Vercel
```

---

## Configuration Environnement

### Variables d'environnement (optionnelles)
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VERCEL_ANALYTICS_ID=your-analytics-id
```

### Fichiers de configuration importants
- `vite.config.ts` - Build configuration
- `vercel.json` - Deployment configuration
- `tsconfig.json` - TypeScript configuration
- `playwright.config.ts` - E2E tests configuration

---

## Tags Git Importants

| Tag | Description |
|-----|-------------|
| `v1.4-pre-final-polish` | Version stable avant polish UI |
| `v1.3-ux-overhaul` | Refonte UX 4 onglets |
| `v1.2-analyzer-cta` | CTA Analyzer dore |
| `v1.1-pre-refactoring` | Avant refactoring -80% |
| `v1.0-pre-optimization` | Avant optimisations majeures |

Pour rollback:
```bash
git reset --hard v1.4-pre-final-polish
```

---

## Contact & Ressources

### Repository
- GitHub: https://github.com/gbordes77/manatuner-pro

### Documentation
- README.md - Vue d'ensemble
- COMPLETE_PROJECT_DOCUMENTATION.md - Documentation complete
- TECHNICAL_IMPLEMENTATION_GUIDE.md - Guide technique
- DEPLOYMENT_PRODUCTION_GUIDE.md - Guide deploiement

### References Mathematiques
- [Frank Karsten - TCGPlayer](https://tcgplayer.infinite.com/article/How-Many-Lands-Do-You-Need-to-Consistently-Hit-Your-Land-Drops/44ffb8b5-ae9b-45b4-b3d8-3ee9c9d2d0e5/)
- [Scryfall API](https://scryfall.com/docs/api)

---

## Checklist Reprise de Projet

- [ ] Cloner le repository
- [ ] `npm install`
- [ ] `npm run dev` - Verifier que ca tourne
- [ ] `npm run test:unit` - 9/9 tests doivent passer
- [ ] `npm run build` - Build doit reussir
- [ ] Lire HANDOFF.md (ce fichier)
- [ ] Lire les scores d'audit (section Ameliorations)
- [ ] Choisir les ameliorations prioritaires a implementer

---

**Derniere mise a jour**: 26 Decembre 2025  
**Par**: Session Claude Code
