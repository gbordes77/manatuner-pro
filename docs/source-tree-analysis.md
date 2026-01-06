# ManaTuner Pro - Source Tree Analysis

## Directory Structure

```
manatuner-pro/
├── .claude/                    # Claude AI configuration
│   ├── commands/               # BMAD slash commands
│   └── hooks/                  # AgentVibes TTS hooks
├── .github/                    # GitHub configuration
│   └── workflows/              # CI/CD pipelines
├── _bmad/                      # BMAD methodology files
│   ├── bmm/                    # BMAD Module Manager
│   └── core/                   # Core BMAD utilities
├── docs/                       # Project documentation (BMAD output)
├── public/                     # Static assets
│   ├── sw.js                   # Service Worker (PWA killer)
│   ├── robots.txt              # SEO robots file
│   ├── sitemap.xml             # SEO sitemap
│   └── og-image.png            # Open Graph image
├── src/                        # Source code (main)
│   ├── components/             # React components
│   ├── contexts/               # React contexts
│   ├── data/                   # Static data files
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Third-party integrations
│   ├── middleware/             # Request middleware
│   ├── pages/                  # Route pages
│   ├── services/               # Business logic services
│   ├── store/                  # Redux store
│   ├── styles/                 # Global styles
│   ├── theme/                  # MUI theme config
│   ├── types/                  # TypeScript definitions
│   └── utils/                  # Utility functions
├── tests/                      # Test files
│   ├── component/              # Component tests
│   ├── e2e/                    # Playwright E2E tests
│   ├── fixtures/               # Test fixtures
│   └── mtg-specific/           # MTG logic tests
├── index.html                  # HTML entry point
├── package.json                # NPM configuration
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite build config
├── vercel.json                 # Vercel deployment config
└── vitest.config.js            # Vitest test config
```

## Critical Directories Detail

### `/src/components/` - UI Components (22 files)

```
components/
├── analysis/                   # Analysis display components
│   └── AnalysisResults.tsx     # Main results container
├── analyzer/                   # Core analyzer components
│   ├── __tests__/              # Component tests
│   ├── CastabilityTab.tsx      # Castability analysis tab
│   ├── DashboardTab.tsx        # Overview dashboard
│   ├── ManaBreakdownTab.tsx    # Mana source breakdown
│   ├── ManaBlueprint.tsx       # Visual manabase blueprint
│   ├── MulliganTab.tsx         # Mulligan simulation tab
│   └── SpellAnalysisTab.tsx    # Spell-by-spell analysis
├── common/                     # Shared components
│   ├── ErrorBoundary.tsx       # Error handling
│   ├── FloatingManaSymbols.tsx # Background decoration
│   ├── ManaSymbols.tsx         # WUBRG mana icons
│   └── NotificationProvider.tsx # Toast notifications
├── export/                     # Export functionality
│   └── ExportDialog.tsx        # Export modal
├── layout/                     # Layout components
│   ├── Footer.tsx              # App footer
│   ├── Header.tsx              # App header/nav
│   └── StaticPages.tsx         # About, Privacy pages
├── performance/                # Performance components
│   └── PerformanceMonitor.tsx  # Performance tracking
├── BetaBanner.tsx              # Beta announcement
├── CardImageTooltip.tsx        # Card preview tooltips
├── CloudSyncSettings.tsx       # Sync settings (disabled)
├── DeckInputSection.tsx        # Deck input area
├── EnhancedCharts.tsx          # Chart visualizations
├── EnhancedRecommendations.tsx # Land recommendations
├── EnhancedSpellAnalysis.tsx   # Detailed spell analysis
├── ManaCostRow.tsx             # Mana cost display
├── MulliganDecisionChart.tsx   # Mulligan decision tree
├── Onboarding.tsx              # User onboarding tour
├── PrivacySettings.tsx         # Privacy controls
├── ResponsiveTable.tsx         # Responsive data table
└── SegmentedProbabilityBar.tsx # Probability visualization
```

### `/src/pages/` - Route Pages (7 pages)

```
pages/
├── api/                        # API routes (unused)
├── AnalyzerPage.tsx            # Main analyzer (20KB)
├── GuidePage.tsx               # User guide
├── HomePage.tsx                # Landing page
├── LandGlossaryPage.tsx        # Land reference
├── MathematicsPage.tsx         # Math explanations
├── MyAnalysesPage.tsx          # Saved analyses
└── PrivacyFirstPage.tsx        # Privacy info
```

### `/src/services/` - Business Logic (13 services)

```
services/
├── __tests__/                  # Service tests
├── castability/                # Castability calculations
│   ├── CastabilityEngine.ts    # Core engine
│   ├── ColorRequirements.ts    # Color pip analysis
│   └── TurnProbabilities.ts    # Turn-by-turn calcs
├── advancedMaths.ts            # Advanced math functions
├── deckAnalyzer.ts             # Deck parsing & analysis
├── landCacheService.ts         # Land data caching
├── landService.ts              # Land classification
├── manaCalculator.ts           # Core probability math
├── manaProducerService.ts      # Mana source detection
├── mulliganSimulator.ts        # Basic mulligan sim
├── mulliganSimulatorAdvanced.ts # Monte Carlo sim
├── scryfall.ts                 # Scryfall API client
└── supabase.ts                 # Supabase (disabled)
```

### `/src/hooks/` - Custom Hooks (10 hooks)

```
hooks/
├── useAdvancedAnalysis.ts      # Advanced analysis hook
├── useAnalysisStorage.ts       # LocalStorage persistence
├── useCardImage.ts             # Card image loading
├── useDeckAnalysis.ts          # Deck analysis wrapper
├── useManaCalculations.ts      # Mana math hook
├── useMonteCarloWorker.ts      # Web Worker for MC sim
├── usePrivacyStorage.ts        # Encrypted storage
├── useProbabilityValidation.ts # Math validation
└── useWebWorker.ts             # Generic Web Worker
```

### `/src/store/` - Redux State

```
store/
├── index.ts                    # Store configuration
└── slices/
    ├── analysisSlice.ts        # Analysis results state
    ├── analyzerSlice.ts        # Analyzer UI state
    ├── authSlice.ts            # Auth state (unused)
    ├── deckSlice.ts            # Deck data state
    └── uiSlice.ts              # UI preferences state
```

### `/src/types/` - TypeScript Definitions

```
types/
├── index.ts                    # Main type exports
├── lands.ts                    # Land type definitions
├── manaProducers.ts            # Mana producer types
├── maths.ts                    # Math calculation types
└── scryfall.ts                 # Scryfall API types
```

### `/src/utils/` - Utility Functions

```
utils/
├── hybridLandDetection.ts      # Hybrid land detection
├── intelligentLandAnalysis.ts  # Smart land categorization
├── landDetection.ts            # Basic land detection
├── landDetectionComplete.ts    # Complete land system
├── manabase.ts                 # Manabase utilities
└── mathsReferences.ts          # Frank Karsten tables
```

## Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML shell with meta tags |
| `src/main.tsx` | React app bootstrap |
| `src/App.tsx` | Root component with routing |

## File Statistics

| Category | Count |
|----------|-------|
| Total Source Files | 109 |
| React Components | 22 |
| Pages | 7 |
| Services | 13 |
| Custom Hooks | 10 |
| Type Definitions | 5 |
| Utility Modules | 6 |
| Redux Slices | 5 |

---

*Generated by BMAD document-project workflow on 2026-01-06*
