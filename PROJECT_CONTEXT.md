# PROJECT_CONTEXT.md - Guide AI pour ManaTuner Pro

Ce fichier contient le contexte technique pour les assistants AI travaillant sur ce projet.

---

## Contexte Rapide

**ManaTuner Pro** = Analyseur de manabase MTG base sur les mathematiques de Frank Karsten.

### Stack
- React 18 + TypeScript + Material-UI + Vite
- Deploye sur Vercel: https://manatuner-pro.vercel.app

### Commandes Essentielles
```bash
npm run dev      # Dev server localhost:5173
npm run build    # Build production
npm run test:unit # Tests unitaires
```

---

## Architecture Cle

### Composants Analyzer (src/components/analyzer/)
| Fichier | Role | Lignes |
|---------|------|--------|
| `AnalyzerPage.tsx` | Page principale, orchestration | 379 |
| `DashboardTab.tsx` | Onglet dashboard, score sante | 246 |
| `AnalysisTab.tsx` | Onglet analyse avec sub-tabs | 117 |
| `CastabilityTab.tsx` | Probabilites de cast | 93 |
| `ManabaseTab.tsx` | Orchestrateur manabase | 116 |
| `landUtils.ts` | Utilitaires detection terrains | 366 |

### Services (src/services/)
| Fichier | Role |
|---------|------|
| `deckAnalyzer.ts` | Service principal d'analyse |
| `manaCalculator.ts` | Calculs probabilites Karsten |
| `advancedMaths.ts` | Distribution hypergeometrique |

---

## Patterns Importants

### 1. Imports depuis analyzer/
Toujours importer via le barrel export:
```typescript
import { DashboardTab, AnalysisTab, TabPanel } from "../components/analyzer";
```

### 2. Props communes
```typescript
interface CommonProps {
  analysisResult: AnalysisResult;
  isMobile: boolean;
  isSmallMobile?: boolean;
}
```

### 3. Responsive breakpoints
```typescript
const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
const isTablet = useMediaQuery(theme.breakpoints.down("md"));
const isSmallMobile = useMediaQuery("(max-width:375px)");
```

---

## Pieges a Eviter

### 1. Oublier les imports
Apres chaque Edit, VERIFIER que les imports sont presents. L'outil Edit peut parfois ne pas appliquer les imports correctement.

### 2. Styles MANA_COLORS dupliques
Les couleurs MTG sont definies dans 3 fichiers differents. Si tu modifies, pense a tous les synchroniser:
- DashboardTab.tsx
- ManabaseTab.tsx  
- OverviewTab.tsx

### 3. Redux non utilise
Le store Redux existe (`src/store/`) mais AnalyzerPage utilise useState + localStorage. Ne pas mixer les deux approches.

---

## Scores Qualite Actuels

| Audit | Score | Points faibles |
|-------|-------|----------------|
| UI | 8.6/10 | - |
| UX | 7.8/10 | Manque onboarding interactif |
| Performance | 7.5/10 | Pas de useMemo/useCallback |
| Code Quality | 8.4/10 | Duplication styles couleurs |

---

## Ameliorations Prioritaires

1. **Memoisation** - Ajouter useMemo/useCallback dans DashboardTab, ManabaseTab, AnalyzerPage
2. **Tooltips** - Ajouter "?" explicatifs sur termes techniques (CMC, P1/P2, consistency)
3. **Constantes** - Extraire MANA_COLOR_STYLES dans fichier partage

---

## Tags Git pour Rollback

```bash
git reset --hard v1.4-pre-final-polish  # Version stable
```

---

## Liens Utiles

- [Frank Karsten Math](https://tcgplayer.infinite.com/article/How-Many-Lands-Do-You-Need-to-Consistently-Hit-Your-Land-Drops/44ffb8b5-ae9b-45b4-b3d8-3ee9c9d2d0e5/)
- [Scryfall API](https://scryfall.com/docs/api)
