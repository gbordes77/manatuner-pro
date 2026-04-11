# ManaTuner - Architecture Documentation

> **Last Updated**: 2026-01-06
> **Version**: 2.0.0
> **Status**: Production Ready (85/100)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Principles](#architecture-principles)
4. [High-Level Architecture](#high-level-architecture)
5. [Directory Structure](#directory-structure)
6. [Core Services](#core-services)
7. [Data Flow](#data-flow)
8. [State Management](#state-management)
9. [Component Architecture](#component-architecture)
10. [External Integrations](#external-integrations)
11. [Performance Optimizations](#performance-optimizations)
12. [Security Architecture](#security-architecture)
13. [Testing Strategy](#testing-strategy)
14. [Deployment Architecture](#deployment-architecture)
15. [Technical Decisions](#technical-decisions)
16. [Future Considerations](#future-considerations)

---

## Executive Summary

**ManaTuner** is a client-side Magic: The Gathering manabase analyzer built on Frank Karsten's mathematical research. The application calculates exact hypergeometric probabilities for spell castability and provides Monte Carlo-based mulligan simulations.

### Key Characteristics

| Attribute              | Value                            |
| ---------------------- | -------------------------------- |
| **Architecture Style** | Single Page Application (SPA)    |
| **Deployment Model**   | 100% Client-Side (Privacy-First) |
| **Primary Framework**  | React 18 + TypeScript            |
| **State Management**   | Redux Toolkit + React Query      |
| **Build System**       | Vite 7.3                         |
| **Hosting**            | Vercel Edge Network              |

### Core Value Proposition

> "Can I cast my spells on curve?"

The application answers this fundamental deckbuilding question with mathematical precision, providing:

- Exact hypergeometric probability calculations
- Monte Carlo mulligan simulations (10,000 hands default, configurable up to 50k)
- Turn-by-turn castability analysis
- Optimal land count recommendations

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER (Client)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        PRESENTATION LAYER                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │ │
│  │  │  HomePage   │  │AnalyzerPage │  │  GuidePage  │  │ Other...  │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │ │
│  │         │                │                │               │        │ │
│  │  ┌──────▼────────────────▼────────────────▼───────────────▼──────┐ │ │
│  │  │                    COMPONENT LIBRARY                          │ │ │
│  │  │  analyzer/ │ common/ │ layout/ │ analysis/ │ export/          │ │ │
│  │  └───────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│  ┌─────────────────────────────────▼────────────────────────────────┐   │
│  │                         STATE LAYER                               │   │
│  │  ┌─────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │   │
│  │  │   Redux     │  │  React Query    │  │    React Context      │ │   │
│  │  │   Toolkit   │  │  (Scryfall)     │  │  (Acceleration)       │ │   │
│  │  └─────────────┘  └─────────────────┘  └───────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────▼────────────────────────────────┐   │
│  │                       SERVICES LAYER                              │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │   │
│  │  │DeckAnalyzer  │ │ManaCalculator│ │ LandService  │ │ Scryfall │ │   │
│  │  │   (42KB)     │ │   (28KB)     │ │   (21KB)     │ │  (14KB)  │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐  │   │
│  │  │AdvancedMaths │ │  Mulligan    │ │  ManaProducerService     │  │   │
│  │  │   (18KB)     │ │ Simulator    │ │       (11KB)             │  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────▼────────────────────────────────┐   │
│  │                      PERSISTENCE LAYER                            │   │
│  │  ┌───────────────────┐  ┌─────────────────────────────────────┐  │   │
│  │  │   localStorage    │  │        IndexedDB (future)           │  │   │
│  │  │  AES-256 Encrypted│  │                                     │  │   │
│  │  └───────────────────┘  └─────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
            ┌──────────────┐                 ┌──────────────┐
            │  Scryfall    │                 │   Vercel     │
            │    API       │                 │   (CDN)      │
            └──────────────┘                 └──────────────┘
```

---

## Architecture Principles

### 1. Privacy-First Design

All calculations happen client-side. User data never leaves the browser.

```typescript
// Pattern: All sensitive operations are local
class PrivacyStorage {
  private static ENCRYPTION_KEY = generateUserKey() // Per-device key

  static saveAnalysis(data: Analysis): void {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), this.ENCRYPTION_KEY)
    localStorage.setItem('analysis', encrypted.toString())
  }
}
```

### 2. Mathematical Accuracy

Every probability calculation is validated against Frank Karsten's published tables.

```typescript
// Karsten Tables for 90% probability threshold
const KARSTEN_TABLES = {
  1: { 1: 14, 2: 13, 3: 12, 4: 11 }, // 1 colored symbol
  2: { 2: 20, 3: 18, 4: 16, 5: 15 }, // 2 colored symbols
  3: { 3: 23, 4: 20, 5: 19, 6: 18 }, // 3 colored symbols
}
```

### 3. Performance by Default

Heavy calculations are offloaded to Web Workers; UI remains responsive.

```typescript
// Monte Carlo runs in dedicated worker
const worker = new Worker(new URL('../workers/monteCarlo.worker.ts', import.meta.url))
worker.postMessage({ iterations: 3000, deck: deckData })
```

### 4. Progressive Enhancement

Core functionality works without JavaScript advanced features; enhanced features degrade gracefully.

---

## Directory Structure

```
src/
├── App.tsx                     # Root component with React Router
├── main.tsx                    # Application bootstrap
├── index.css                   # Global styles + animations
│
├── components/                 # UI Components (23 files)
│   ├── analyzer/              # Deck analysis interface
│   │   ├── DeckInputSection   # Textarea with format support
│   │   ├── DashboardTab       # Health score overview
│   │   ├── CastabilityTab     # Per-spell probabilities
│   │   ├── MulliganTab        # Monte Carlo simulation UI
│   │   ├── ManabaseTab        # Land breakdown
│   │   └── AnalysisTab        # Detailed recommendations
│   │
│   ├── common/                # Shared components
│   │   ├── ErrorBoundary      # React error handling
│   │   ├── ManaSymbols        # Mana icon rendering (Keyrune)
│   │   ├── FloatingManaSymbols # Background animation
│   │   ├── VirtualList        # react-window integration
│   │   └── NotificationProvider
│   │
│   ├── layout/                # Layout components
│   │   ├── Header             # Navigation + theme toggle
│   │   ├── Footer             # Credits + links
│   │   └── StaticPages        # About, Privacy pages
│   │
│   ├── analysis/              # Visualization components
│   │   ├── TurnByTurnAnalysis # Turn progression charts
│   │   └── MonteCarloResults  # Simulation histogram
│   │
│   └── export/                # Export functionality
│       └── ManaBlueprint      # PNG/PDF/JSON export
│
├── pages/                     # Route pages (8 files)
│   ├── HomePage               # Landing (eager loaded)
│   ├── AnalyzerPage           # Main analyzer (lazy)
│   ├── GuidePage              # User guide (lazy)
│   ├── MathematicsPage        # Math explanations (lazy)
│   ├── LandGlossaryPage       # Land reference (lazy)
│   ├── MyAnalysesPage         # Saved analyses (lazy)
│   └── PrivacyFirstPage       # Privacy info (lazy)
│
├── services/                  # Business logic (15 files, ~175KB)
│   ├── manaCalculator.ts      # Core hypergeometric math
│   ├── advancedMaths.ts       # Monte Carlo engine
│   ├── deckAnalyzer.ts        # Deck parsing + orchestration
│   ├── landService.ts         # Land detection + ETB logic
│   ├── landCacheService.ts    # Land metadata caching
│   ├── mulliganSimulator.ts   # Mulligan decision engine
│   ├── manaProducerService.ts # Mana production analysis
│   ├── scryfall.ts            # Scryfall API client
│   └── supabase.ts            # DISABLED (mocked)
│
├── hooks/                     # Custom React hooks (10 files)
│   ├── useDeckAnalysis        # Main analysis orchestration
│   ├── useManaCalculations    # Probability computations
│   ├── useAdvancedAnalysis    # Advanced math integration
│   ├── useMonteCarloWorker    # Web Worker management
│   ├── useAnalysisStorage     # localStorage persistence
│   ├── usePrivacyStorage      # Encrypted storage
│   └── useCardImage           # Scryfall image loading
│
├── store/                     # Redux state
│   ├── index.ts               # Store configuration
│   └── slices/
│       └── analyzerSlice.ts   # Analyzer state management
│
├── types/                     # TypeScript definitions (7 files)
│   ├── index.ts               # Core types (345 lines)
│   ├── lands.ts               # Land metadata types
│   ├── maths.ts               # Math calculation types
│   ├── manaProducers.ts       # Mana producer types
│   └── scryfall.ts            # API response types
│
├── utils/                     # Utilities (9 files)
│   ├── landDetection.ts       # Land identification
│   ├── hybridLandDetection.ts # Hybrid mana handling
│   ├── intelligentLandAnalysis.ts
│   └── manabase.ts            # Manabase utilities
│
├── contexts/                  # React contexts
│   └── AccelerationContext.tsx # Mana acceleration state
│
├── constants/                 # Application constants
│   └── manaColors.ts          # WUBRG definitions
│
├── lib/                       # Custom libraries
│   ├── privacy.ts             # AES-256 encryption
│   └── validations.ts         # Input sanitization
│
└── theme/                     # MUI theme
    └── index.ts               # Custom palette + mana colors
```

---

## Core Services

### ManaCalculator (`manaCalculator.ts`)

The mathematical core implementing hypergeometric distribution.

```typescript
class ManaCalculator {
  /**
   * Hypergeometric probability: P(X ≥ k)
   *
   * P(X = k) = C(K,k) × C(N-K,n-k) / C(N,n)
   *
   * Where:
   * - N = Population (deck size, typically 60)
   * - K = Success states (mana sources of color)
   * - n = Sample size (cards seen by turn T)
   * - k = Successes needed (colored symbols required)
   */
  cumulativeHypergeometric(N: number, K: number, n: number, minK: number): number

  /**
   * Calculate probability considering on-the-play vs on-the-draw
   * Cards seen = 7 + turn - 1 (play) or 7 + turn (draw)
   */
  calculateManaProbability(params: ProbabilityParams): ProbabilityResult
}
```

### DeckAnalyzer (`deckAnalyzer.ts`)

Deck parsing and analysis orchestration (42KB, largest service).

```typescript
/**
 * Pre-scan to detect sideboard boundary.
 * Handles: explicit markers (Sideboard, SB:, // Sideboard),
 * inline prefix (SB: 2 Card), blank-line heuristic (40-100 main + 1-15 side).
 */
function detectSideboardStartLine(lines: string[]): number

class DeckAnalyzer {
  /**
   * Parse multiple deck formats:
   * - MTGO: "4 Lightning Bolt"
   * - MTGA: "4 Lightning Bolt (M21) 199"
   * - Moxfield: "4x Lightning Bolt"
   * - Sideboard: auto-detected via markers or blank line
   *
   * Each DeckCard includes:
   * - isSideboard: true if in sideboard section
   * - isCreature: true if Scryfall type_line contains "Creature"
   */
  static async parseDeckList(text: string): Promise<DeckCard[]>

  /**
   * Full deck analysis pipeline:
   * 1. Parse deck text → DeckCard[] (with sideboard + creature detection)
   * 2. Enrich with Scryfall data
   * 3. Detect land properties (ETB, fetchlands, etc.)
   * 4. Calculate probabilities per turn
   * 5. Generate recommendations
   */
  static async analyzeDeck(deckList: string): Promise<AnalysisResult>
}
```

### LandService (`landService.ts`)

Intelligent land detection with ETB (Enter The Battlefield) analysis.

```typescript
class LandService {
  /**
   * Detect land properties:
   * - Fetchlands (can find specific land types)
   * - Shocklands (pay 2 life for untapped)
   * - Checklands (check for basic land types)
   * - Fastlands (untapped if ≤2 other lands)
   * - Triomes (3-color tap lands)
   */
  async detectLand(cardName: string): Promise<LandMetadata | null>

  /**
   * Calculate probability of land entering untapped
   * considering deck composition and turn number
   */
  getUntappedProbability(land: LandMetadata, turn: number, context: DeckContext): number
}
```

### AdvancedMathEngine (`advancedMaths.ts`)

Monte Carlo simulation engine.

```typescript
class AdvancedMathEngine {
  /**
   * Run Monte Carlo simulation
   * Default: 10,000 iterations for statistical significance
   */
  async runMonteCarloSimulation(params: {
    deck: DeckCard[]
    iterations: number
    mulliganStrategy: 'aggressive' | 'conservative' | 'balanced'
  }): Promise<MonteCarloResult>

  /**
   * Multivariate analysis for multi-color requirements
   * e.g., "WW on turn 2 AND UU on turn 4"
   */
  analyzeMultivariateRequirements(colorRequirements: ColorRequirement[]): MultivariateAnalysis
}
```

---

## Data Flow

### Analysis Pipeline

```
User Input (Deck Text)
        │
        ▼
┌───────────────────┐
│  DeckAnalyzer     │
│  parseDeckList()  │
└───────┬───────────┘
        │ DeckCard[]
        ▼
┌───────────────────┐     ┌─────────────────┐
│  Scryfall API     │────►│  LandService    │
│  (card data)      │     │  (land metadata)│
└───────┬───────────┘     └────────┬────────┘
        │                          │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌───────────────────┐
        │  ManaCalculator   │
        │  (hypergeometric) │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │ AdvancedMathEngine│
        │ (Monte Carlo)     │◄──── Web Worker
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │  AnalysisResult   │
        │  {                │
        │    totalCards     │
        │    probabilities  │
        │    recommendations│
        │    mulliganAnalysis│
        │  }                │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │  Redux Store      │
        │  analyzerSlice    │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │  React Components │
        │  (Tabs: Dashboard,│
        │   Castability,    │
        │   Mulligan, etc.) │
        └───────────────────┘
```

---

## State Management

### Redux Store Structure

```typescript
// store/index.ts
const store = configureStore({
  reducer: {
    analyzer: analyzerReducer, // Main deck analysis state
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allow non-serializable values
    }),
})

// store/slices/analyzerSlice.ts
interface AnalyzerState {
  deckList: string // Raw deck text
  analysisResult: AnalysisResult | null
  isAnalyzing: boolean // Loading state
  isDeckMinimized: boolean // UI state
  activeTab: number // Current tab index
  snackbar: SnackbarState // Notifications
}
```

### State Flow

```
Component ──dispatch──► Redux Action ──► Reducer ──► New State
                                              │
                                              ▼
                                        useSelector()
                                              │
                                              ▼
                                    Component Re-render
```

### React Query (Scryfall)

```typescript
// Card data is fetched and cached with React Query
const { data: cardData } = useQuery({
  queryKey: ['card', cardName],
  queryFn: () => scryfallService.getCard(cardName),
  staleTime: 1000 * 60 * 60, // 1 hour
  cacheTime: 1000 * 60 * 60 * 24, // 24 hours
})
```

---

## Component Architecture

### Page Hierarchy

```
App
├── ErrorBoundary
├── NotificationProvider
├── AccelerationProvider
│
├── BetaBanner
├── Header (Navigation)
│
├── Routes (React Router)
│   ├── / → HomePage (eager)
│   ├── /analyzer → AnalyzerPage (lazy)
│   ├── /guide → GuidePage (lazy)
│   ├── /mathematics → MathematicsPage (lazy)
│   ├── /land-glossary → LandGlossaryPage (lazy)
│   └── /mes-analyses → MyAnalysesPage (lazy)
│
└── Footer
```

### AnalyzerPage Component Tree

```
AnalyzerPage
├── FloatingManaSymbols (background)
├── DeckInputSection
│   ├── Textarea
│   ├── ClearButton
│   └── LoadSampleButton
│
├── Tabs (MUI)
│   ├── Tab 0: DashboardTab
│   │   ├── HealthScore
│   │   ├── ColorDistribution
│   │   └── QuickRecommendations
│   │
│   ├── Tab 1: CastabilityTab
│   │   ├── SpellList
│   │   └── TurnByTurnProbabilities
│   │
│   ├── Tab 2: MulliganTab
│   │   ├── MonteCarloResults
│   │   └── MulliganDecisionChart
│   │
│   ├── Tab 3: AnalysisTab
│   │   ├── EnhancedSpellAnalysis
│   │   └── EnhancedRecommendations
│   │
│   ├── Tab 4: ManabaseTab
│   │   ├── LandBreakdown
│   │   └── ManaCurveChart
│   │
│   └── Tab 5: ManaBlueprint
│       └── ExportOptions (PNG/PDF/JSON)
│
├── PrivacySettings
└── Snackbar (notifications)
```

---

## External Integrations

### Scryfall API

**Purpose**: Card data enrichment (mana costs, types, produced mana)

```typescript
// Rate-limited: 10 requests/second
// Cache: Map<cardName, ScryfallCard> (in-memory)

const SCRYFALL_BASE = 'https://api.scryfall.com'

async function fetchCard(name: string): Promise<ScryfallCard | null> {
  // Check cache first
  if (scryfallCache.has(name)) {
    return scryfallCache.get(name)
  }

  const response = await fetch(`${SCRYFALL_BASE}/cards/named?exact=${encodeURIComponent(name)}`)

  if (!response.ok) return null

  const data = await response.json()
  scryfallCache.set(name, data)
  return data
}
```

### Supabase (DISABLED)

**Status**: Fully mocked (`isConfigured: () => false`)

The application was designed with optional Supabase cloud sync, but this is currently disabled. All data remains in localStorage.

---

## Performance Optimizations

### Code Splitting

```typescript
// Lazy loading for route pages
const AnalyzerPage = React.lazy(() => import('./pages/AnalyzerPage'));
const GuidePage = React.lazy(() => import('./pages/GuidePage'));

// Suspense boundary with MTG-themed loader
<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```

### Bundle Optimization (Vite)

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        mui: ['@mui/material', '@mui/icons-material'],
        redux: ['@reduxjs/toolkit', 'react-redux'],
        charts: ['recharts'],
      },
    },
  },
}
```

**Bundle Sizes (gzipped)**:
| Chunk | Size |
|-------|------|
| AnalyzerPage | 166KB |
| MUI | 114KB |
| jspdf | 124KB |
| Vendor (React) | 45KB |
| **Total** | ~550KB |

### Web Workers

```typescript
// Monte Carlo simulations run in dedicated worker
const useMonteCarloWorker = () => {
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/monteCarlo.worker.ts', import.meta.url))
    return () => workerRef.current?.terminate()
  }, [])

  const runSimulation = useCallback((params) => {
    return new Promise((resolve) => {
      workerRef.current?.postMessage(params)
      workerRef.current!.onmessage = (e) => resolve(e.data)
    })
  }, [])

  return { runSimulation }
}
```

### Memoization

```typescript
// Heavy calculations are memoized
const ManaCalculator = {
  // Binomial coefficient cache
  private memoCache: Map<string, number> = new Map();

  binomial(n: number, k: number): number {
    const key = `${n},${k}`;
    if (this.memoCache.has(key)) {
      return this.memoCache.get(key)!;
    }
    // ... calculate and cache
  }
};
```

---

## Security Architecture

### Security Headers (Vercel)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:; img-src 'self' data: https://cards.scryfall.io https://c1.scryfall.com; connect-src 'self' https://api.scryfall.com; frame-ancestors 'none'"
        }
      ]
    }
  ]
}
```

### Client-Side Security

| Measure                    | Implementation                         |
| -------------------------- | -------------------------------------- |
| XSS Prevention             | Input sanitization via Zod + DOMPurify |
| Data Encryption            | AES-256 for localStorage               |
| No eval()                  | ESLint rule enforced                   |
| No dangerouslySetInnerHTML | ESLint rule enforced                   |
| HTTPS Only                 | Vercel enforces HTTPS                  |

---

## Testing Strategy

### Test Categories

| Type            | Tool         | Location                   | Coverage            |
| --------------- | ------------ | -------------------------- | ------------------- |
| Unit            | Vitest       | `src/**/*.test.ts`         | ~60% services       |
| Component       | Vitest + RTL | `tests/component/`         | ~20%                |
| E2E             | Playwright   | `tests/e2e/`               | Core flows          |
| Accessibility   | axe-core     | `tests/e2e/accessibility/` | WCAG AA             |
| Math Validation | Vitest       | `src/services/__tests__/`  | 100% Karsten tables |

### Running Tests

```bash
npm run test:unit       # Unit tests
npm run test:e2e        # E2E tests
npm run test:coverage   # Coverage report
npm run test:mtg-logic  # MTG-specific math tests
```

### Critical Math Tests

```typescript
// Validate against Frank Karsten's published tables
describe('Karsten Methodology', () => {
  it('14 sources = 90%+ for 1 symbol turn 1', () => {
    const result = manaCalculator.calculateManaProbability(60, 14, 1, 1, true, 7)
    expect(result.probability).toBeGreaterThanOrEqual(0.9)
  })
})
```

---

## Deployment Architecture

### Vercel Configuration

```
┌──────────────────────────────────────────────────────────────┐
│                        Vercel Platform                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   GitHub    │───►│   Build     │───►│   Deploy    │       │
│  │   Push      │    │  (Vite)     │    │  (Edge CDN) │       │
│  └─────────────┘    └─────────────┘    └─────────────┘       │
│                                                               │
│  Build Command: npm run build                                 │
│  Output: dist/                                                │
│  Framework: Vite                                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  https://manatuner.app       │
        │                                          │
        │  - SPA rewrites (/* → /index.html)      │
        │  - Security headers                      │
        │  - COOP/COEP for Web Workers            │
        │  - No-cache SW killer                    │
        └─────────────────────────────────────────┘
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci-cd.yml
jobs:
  test:
    - npm run lint
    - npm run test:unit
    - npm run test:e2e

  deploy:
    needs: test
    - vercel deploy --prod
```

---

## Technical Decisions

### Decision 1: Client-Side Only

**Context**: Privacy concerns for deck data
**Decision**: All calculations run in browser
**Rationale**: MTG players value deck secrecy (tournament prep)
**Consequences**: No server costs, offline capability, limited analytics

### Decision 2: Redux Toolkit over Context

**Context**: State management choice
**Decision**: Redux Toolkit for global state, Context for UI themes
**Rationale**: DevTools, middleware support, predictable updates
**Trade-off**: Additional bundle size (~12KB gzipped)

### Decision 3: Vite over CRA

**Context**: Build tooling
**Decision**: Vite 7.3
**Rationale**: Faster dev server (HMR), smaller bundles, ESM-native
**Consequences**: Modern browser requirement (ES2015+)

### Decision 4: MUI over Tailwind

**Context**: UI framework
**Decision**: Material-UI 5
**Rationale**: Accessible components, consistent design, theme system
**Trade-off**: Larger bundle (~114KB gzipped)

---

## Future Considerations

### Near-Term (P1)

- [ ] Sentry error tracking integration
- [ ] Keyboard navigation for cards
- [ ] Fix remaining useCallback dependencies (22 ESLint warnings)

### Medium-Term (P2)

- [ ] Full PWA offline support
- [ ] Deck comparison (side-by-side)
- [ ] Commander (99-card) enhanced support
- [ ] Import from Moxfield/Archidekt URLs

### Long-Term (P3)

- [ ] AI-powered recommendations (ML model)
- [ ] Historical analysis tracking
- [ ] Community deck database (opt-in)
- [ ] Mobile app (React Native)

---

## References

- [Frank Karsten - How Many Lands Do You Need?](https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/how-many-lands-do-you-need-to-consistently-hit-your-land-drops/)
- [Scryfall API Documentation](https://scryfall.com/docs/api)
- [Keyrune - MTG Set Icons](https://andrewgioia.github.io/Keyrune/)
- [Mana Font - Mana Symbols](https://mana.andrewgioia.com/)

---

_Document generated by Winston (BMAD Architect Agent) on 2026-01-06_
