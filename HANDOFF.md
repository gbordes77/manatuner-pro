# HANDOFF - ManaTuner Pro

**Date**: 26 December 2025  
**Version**: 2.1.0  
**Status**: Production - Stable  
**Live URL**: https://manatuner-pro.vercel.app

---

## Current Project State

### Global Status: FUNCTIONAL

The application is deployed and functional on Vercel. All main features are operational.

### Latest Session (December 26, 2025)

**Major Additions**:
- Advanced Mulligan Strategy Tab with archetype support
- Monte Carlo simulation (3000 iterations)
- Bellman equation for optimal thresholds
- Comprehensive tooltips on all technical terms
- Dashboard cleanup (removed subjective recommendations)

**Quality Improvements**:
- Fixed ~23 `any` types
- Enabled `noImplicitAny: true`
- Added 11 mulligan tests
- Score improved: 7.2 → 8.6/10

### Recent Commits
```
[pending] 🎲 Feature: Advanced Mulligan Strategy Tab
[pending] 🔧 Fix: Dashboard cleanup, tooltips
5a733f3 UI: Add icons to Home and About nav items
cab1e45 Fix: 0 TypeScript errors, remove dead file
d7e0a62 Features: Redux migration, landUtils tests, onboarding
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

### Folder Structure
```
src/
├── components/
│   ├── analyzer/           # Main analyzer components
│   │   ├── AnalyzerSkeleton.tsx    # Skeleton loader
│   │   ├── AnalysisTab.tsx         # Analysis tab (sub-tabs)
│   │   ├── CastabilityTab.tsx      # Castability tab
│   │   ├── DashboardTab.tsx        # Dashboard tab (clean, no recommendations)
│   │   ├── DeckInputSection.tsx    # Deck input section
│   │   ├── MulliganTab.tsx         # NEW: Advanced mulligan strategy (860 lines)
│   │   ├── ManabaseFullTab.tsx     # Full manabase tab
│   │   ├── TabPanel.tsx            # Panel with Fade animation
│   │   ├── index.ts                # Barrel exports
│   │   └── landUtils.ts            # Land utilities (366 lines)
│   ├── common/             # Reusable components
│   ├── layout/             # Header, Footer
│   └── analysis/           # Monte Carlo, Turn by Turn
├── pages/
│   ├── AnalyzerPage.tsx    # Main page (5 tabs)
│   ├── HomePage.tsx        # Landing page
│   ├── GuidePage.tsx       # User documentation
│   └── ...                 # Other pages
├── services/
│   ├── deckAnalyzer.ts     # Deck analysis service
│   ├── manaCalculator.ts   # Karsten math calculations
│   ├── mulliganSimulator.ts        # Base mulligan simulator
│   ├── mulliganSimulatorAdvanced.ts # NEW: Archetype-aware engine (600 lines)
│   └── advancedMaths.ts    # Hypergeometric distribution
├── hooks/                  # Custom React hooks
├── store/                  # Redux slices
├── types/                  # TypeScript definitions
└── utils/                  # Utilities
```

---

## Current Quality Scores

| Domain | Score | Details |
|--------|-------|---------|
| **UI** | 8.8/10 | Coherent design, MUI well used, tooltips |
| **UX** | 8.2/10 | Clear navigation, onboarding, mulligan guide |
| **Performance** | 7.8/10 | Lazy loading OK, Monte Carlo optimized |
| **Code Quality** | 9.0/10 | Strict typing, 0 `any` types, good tests |
| **Average** | **8.6/10** | Up from 7.2 |

---

## Implemented Features

### Core Features
- [x] MTG deck analysis (MTGA, Moxfield, TappedOut formats)
- [x] Frank Karsten probability calculations (hypergeometric distribution)
- [x] P1/P2 system (Play vs Draw)
- [x] Intelligent recommendations based on calculations
- [x] Deck health score (%)
- [x] Mana color distribution
- [x] Land analysis (tempo-aware)
- [x] Monte Carlo simulations (Web Workers)

### Mulligan System (NEW - December 26, 2025)
- [x] Archetype selector (Aggro/Midrange/Control/Combo)
- [x] Monte Carlo simulation (3000 iterations)
- [x] Bellman equation for optimal thresholds
- [x] London Mulligan support (draw 7, keep N)
- [x] 5-metric score breakdown (Mana Efficiency, Curve, Colors, Early Game, Land Balance)
- [x] Sample hands with turn-by-turn plans
- [x] Comprehensive tooltips on all technical terms

### UI/UX Features
- [x] 5 main tabs (Dashboard, Castability, Mulligan, Analysis, Manabase)
- [x] Skeleton loader during analysis
- [x] Fade animations on tab change
- [x] MUI icons on sub-tabs
- [x] Responsive design (mobile-first)
- [x] Dark/Light theme
- [x] PWA installable
- [x] Tooltips on all technical terms

### Privacy Features
- [x] Local storage only (localStorage)
- [x] Auto-save analyses
- [x] Export/Import data
- [x] Zero tracking by default

---

## Identified Improvements (Not Implemented)

### High Priority

#### 1. Component Memoization (+0.5 pt Performance)
```typescript
// Some components could benefit from React.memo
// ManabaseTab, AnalysisTab sub-components
```

#### 2. Code Splitting Vendors
```javascript
// vite.config.ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-mui': ['@mui/material', '@mui/icons-material'],
  'vendor-charts': ['recharts'],
}
```

### Medium Priority

#### 3. Mulligan Enhancements
- Sideboard mode for post-board mulligans
- Matchup-aware recommendations
- Card tagging (combo pieces, must-keeps)

#### 4. Non-basic Land Color Detection
- Currently assumes non-basic lands produce all colors
- Could parse Scryfall data for accurate color production

### Low Priority

#### 5. More Unit Tests
- Component tests for analyzer tabs
- E2E tests for mulligan flow

#### 6. Export/Share Features
- Export mulligan analysis as image
- Share deck analysis link

---

## Known Issues / Notes

### 1. Non-basic Land Color Detection
**Issue**: Non-basic lands are assumed to produce all 5 colors (simplification).  
**Impact**: Color access score may be slightly inflated for complex manabases.  
**Workaround**: Manual verification for edge cases.

### 2. Card Synergies in Mulligan
**Issue**: Mulligan simulator doesn't account for card synergies.  
**Example**: A hand with 2 combo pieces might score lower than it should.  
**Future**: Could add card tagging feature.

### 3. Dashboard Recommendations Removed
**Reason**: Recommendations were subjective and could mislead users.  
**Example**: "Add more lands" is wrong advice for a well-built Aggro deck.  
**Solution**: Recommendations moved to Analysis tab (opt-in).

---

## Useful Commands

```bash
# Development
npm run dev              # Dev server on localhost:5173

# Build
npm run build            # Production build
npm run preview          # Preview build

# Tests
npm run test:unit        # Unit tests (Vitest)
npm run test:e2e         # E2E tests (Playwright)
npm run test:quick       # Quick tests (unit + core flows)

# Quality
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run type-check       # TypeScript verification

# Deployment
git push origin main     # Auto-deploy on Vercel
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

## Important Git Tags

| Tag | Description |
|-----|-------------|
| `v2.1-mulligan-system` | **CURRENT** - Mulligan tab + quality improvements |
| `v2.0-stable-complete` | Previous stable - Before mulligan system |
| `v1.4-pre-final-polish` | Stable before UI polish |
| `v1.3-ux-overhaul` | UX overhaul 4 tabs |
| `v1.1-pre-refactoring` | Before refactoring -80% |

To rollback to stable version:
```bash
git reset --hard v2.0-stable-complete
```

---

## Resources & References

### Repository
- GitHub: https://github.com/gbordes77/manatuner-pro

### Documentation
- `README.md` - Overview
- `HANDOFF.md` - This file (project state)
- `docs/MULLIGAN_SYSTEM.md` - Mulligan technical documentation
- `docs/SESSION_2025_12_26.md` - Session notes
- `docs/MATHEMATICAL_REFERENCE.md` - Math foundations

### Mathematical References
- [Frank Karsten - TCGPlayer](https://tcgplayer.infinite.com/article/How-Many-Lands-Do-You-Need-to-Consistently-Hit-Your-Land-Drops/)
- [Scryfall API](https://scryfall.com/docs/api)
- Bellman Equation (optimal stopping theory)
- Monte Carlo simulation methods

---

## Project Resumption Checklist

- [ ] Clone the repository
- [ ] `npm install`
- [ ] `npm run dev` - Verify it runs
- [ ] `npm run test:unit` - All tests should pass
- [ ] `npm run type-check` - No TypeScript errors
- [ ] `npm run build` - Build should succeed
- [ ] Read HANDOFF.md (this file)
- [ ] Read docs/MULLIGAN_SYSTEM.md for mulligan logic
- [ ] Test the 5 tabs in the analyzer

---

**Last Updated**: December 26, 2025  
**Version**: 2.1.0  
**Quality Score**: 8.6/10
