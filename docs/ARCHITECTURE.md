# ManaTuner Pro - Architecture Documentation

This document provides a comprehensive overview of the ManaTuner Pro system architecture, data flows, and key implementation patterns.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Directory Structure](#directory-structure)
3. [Data Flow](#data-flow)
4. [Core Services](#core-services)
5. [React Patterns](#react-patterns)
6. [State Management](#state-management)
7. [Performance Optimizations](#performance-optimizations)
8. [Testing Strategy](#testing-strategy)

---

## System Overview

ManaTuner Pro is a client-side React application that analyzes Magic: The Gathering decklists using mathematical probability theory. The application runs entirely in the browser with no backend dependencies for core functionality.

### Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **Privacy-First** | All calculations client-side, localStorage with AES-256 |
| **Performance** | Web Workers for Monte Carlo, lazy loading, memoization |
| **Accuracy** | Frank Karsten methodology, validated test suite |
| **Accessibility** | Material-UI, WCAG AA compliance, responsive design |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │   Redux     │  │    Web Workers          │  │
│  │   Pages     │◄─┤   Store     │◄─┤    (Monte Carlo)        │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│  ┌──────▼──────────────────▼──────────────────────▼─────────┐   │
│  │                    Services Layer                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐  │   │
│  │  │ DeckAnalyzer │ │ManaCalculator│ │AdvancedMathEngine│  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────┘  │   │
│  └───────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────────┐   │
│  │                   External APIs (Optional)                 │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │   │
│  │  │   Scryfall   │ │   Supabase   │ │   localStorage   │   │   │
│  │  │  (Card Data) │ │ (Cloud Sync) │ │  (Persistence)   │   │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────┘   │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Application entry point
├── index.css                  # Global styles
│
├── components/                # React components
│   ├── analyzer/              # Deck analysis interface
│   │   ├── DeckInputSection   # Decklist textarea
│   │   ├── OverviewTab        # Summary dashboard
│   │   ├── CastabilityTab     # Spell probabilities
│   │   ├── ManabaseTab        # Land analysis
│   │   ├── MulliganTab        # Mulligan simulator
│   │   └── ProbabilitiesTab   # Detailed probabilities
│   │
│   ├── analysis/              # Visualization components
│   │   ├── TurnByTurnAnalysis # Turn progression charts
│   │   └── MonteCarloResults  # Simulation results
│   │
│   ├── common/                # Shared UI components
│   │   ├── ErrorBoundary      # Error handling
│   │   ├── AnimatedContainer  # Animation wrapper
│   │   ├── ManaSymbols        # Mana icon rendering
│   │   ├── NotificationProvider
│   │   └── VirtualList        # Virtualized scrolling
│   │
│   ├── layout/                # Layout components
│   │   ├── Header             # Navigation header
│   │   ├── Footer             # Site footer
│   │   └── StaticPages        # About, Privacy pages
│   │
│   └── performance/           # Performance-optimized components
│       └── OptimizedComponents
│
├── hooks/                     # Custom React hooks
│   ├── useDeckAnalysis        # Main analysis orchestration
│   ├── useManaCalculations    # Probability calculations
│   ├── useAdvancedAnalysis    # Advanced math integration
│   ├── useMonteCarloWorker    # Web Worker management
│   ├── useAnalysisStorage     # localStorage persistence
│   └── useCardImage           # Scryfall image loading
│
├── pages/                     # Route pages
│   ├── HomePage               # Landing page
│   ├── AnalyzerPage           # Main analyzer (lazy loaded)
│   ├── GuidePage              # User guide
│   ├── MathematicsPage        # Math explanations
│   ├── LandGlossaryPage       # Land reference
│   └── MyAnalysesPage         # Saved analyses
│
├── services/                  # Business logic
│   ├── manaCalculator.ts      # Core hypergeometric math
│   ├── advancedMaths.ts       # Monte Carlo engine
│   ├── deckAnalyzer.ts        # Deck parsing & analysis
│   ├── landService.ts         # Land detection & ETB
│   ├── mulliganSimulator.ts   # Mulligan logic
│   ├── scryfall.ts            # Card data API
│   └── supabase.ts            # Optional cloud sync
│
├── store/                     # Redux state
│   ├── index.ts               # Store configuration
│   └── slices/
│       ├── deckSlice          # Deck state
│       ├── uiSlice            # UI preferences
│       └── analysisSlice      # Analysis results
│
├── types/                     # TypeScript definitions
│   ├── index.ts               # Core types
│   ├── lands.ts               # Land metadata types
│   ├── maths.ts               # Math calculation types
│   └── scryfall.ts            # API response types
│
├── utils/                     # Utility functions
│   ├── landDetection.ts       # Land identification
│   ├── hybridLandDetection.ts # Hybrid mana handling
│   └── manabase.ts            # Manabase utilities
│
├── lib/                       # Custom libraries
│   ├── privacy.ts             # Encryption utilities
│   └── validations.ts         # Input validation
│
├── constants/                 # Application constants
│   └── manaColors.ts          # Color definitions
│
├── theme/                     # MUI theme configuration
│   └── index.ts
│
└── data/                      # Static data
    └── landSeed.ts            # Known land database
```

---

## Data Flow

### Primary Analysis Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Input  │────►│ DeckAnalyzer │────►│   Analysis   │
│  (Decklist)  │     │   Service    │     │   Result     │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │  Parser   │ │ Scryfall  │ │   Land    │
       │           │ │   API     │ │  Service  │
       └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    ┌─────────────┐
                    │  DeckCard[] │
                    │   Array     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │   Mana    │ │  Karsten  │ │  Monte    │
       │Calculator │ │  Tables   │ │  Carlo    │
       └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    ┌─────────────┐
                    │ AnalysisResult│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    UI       │
                    │  Display    │
                    └─────────────┘
```

### Step-by-Step Flow

1. **Input**: User pastes decklist in textarea
2. **Parsing**: `DeckAnalyzer.parseDeckList()` extracts cards
3. **Enrichment**: Scryfall API provides mana costs, types
4. **Land Detection**: `LandService` identifies lands and ETB conditions
5. **Analysis**: `ManaCalculator` computes hypergeometric probabilities
6. **Monte Carlo**: Web Worker runs 3,000+ hand simulations
7. **Results**: Aggregated `AnalysisResult` displayed in tabs

---

## Core Services

### ManaCalculator

The mathematical core implementing Frank Karsten's methodology.

```typescript
// Location: src/services/manaCalculator.ts

class ManaCalculator {
  // Memoized binomial coefficient
  private binomial(n: number, k: number): number;
  
  // Exact hypergeometric probability
  hypergeometric(N: number, K: number, n: number, k: number): number;
  
  // Cumulative probability (at least k successes)
  cumulativeHypergeometric(N: number, K: number, n: number, minK: number): number;
  
  // Main calculation with Karsten recommendations
  calculateManaProbability(
    deckSize: number,
    sourcesInDeck: number,
    turn: number,
    symbolsNeeded: number,
    onThePlay: boolean,
    handSize: number
  ): ProbabilityResult;
}
```

**Key Formula**:
```
P(X = k) = C(K,k) * C(N-K,n-k) / C(N,n)

Where:
- N = Population (deck size)
- K = Success states (mana sources)
- n = Sample size (cards seen)
- k = Successes wanted (sources needed)
```

### AdvancedMathEngine

Extended calculations including Monte Carlo simulations.

```typescript
// Location: src/services/advancedMaths.ts

class AdvancedMathEngine {
  // Performance-optimized with memoization cache
  private cache: MemoizationCache;
  
  // Monte Carlo simulation for complex scenarios
  async runMonteCarloSimulation(params: MonteCarloParams): Promise<MonteCarloResult>;
  
  // Multivariate color requirement analysis
  analyzeMultivariateRequirements(
    deckConfig: DeckConfiguration,
    colorRequirements: ColorRequirement[]
  ): MultivariateAnalysis;
  
  // Optimal manabase generation
  generateOptimalManabase(config: DeckConfiguration): ManabaseRecommendation;
}
```

### DeckAnalyzer

Deck parsing and comprehensive analysis orchestration.

```typescript
// Location: src/services/deckAnalyzer.ts

class DeckAnalyzer {
  // Parse various deck formats
  static async parseDeckList(deckList: string): Promise<DeckCard[]>;
  
  // Scryfall integration with caching
  private static async fetchCardFromScryfall(name: string): Promise<ScryfallCard>;
  
  // Main analysis entry point
  static async analyzeDeck(deckList: string): Promise<AnalysisResult>;
  
  // Complex land mechanics evaluation
  private static evaluateLandProperties(name: string): Partial<DeckCard>;
  
  // Mulligan probability distribution
  private static calculateMulliganAnalysis(
    deckSize: number,
    landCount: number,
    manaCurve: Record<string, number>
  ): MulliganAnalysis;
}
```

### LandService

Intelligent land detection with ETB (Enter The Battlefield) analysis.

```typescript
// Location: src/services/landService.ts

class LandService {
  // Detect if card is a land with full metadata
  async detectLand(cardName: string): Promise<LandMetadata | null>;
  
  // Calculate untapped probability by turn
  getUntappedProbability(
    land: LandMetadata,
    turn: number,
    context: DeckContext
  ): number;
  
  // Tempo-aware probability adjustments
  calculateTempoAwareProbability(params: TempoCalculationParams): TempoAwareProbability;
}
```

---

## React Patterns

### Lazy Loading

Pages are lazy-loaded to minimize initial bundle size.

```typescript
// src/App.tsx
const AnalyzerPage = React.lazy(() => import("./pages/AnalyzerPage"));
const GuidePage = React.lazy(() => 
  import("./pages/GuidePage").then((m) => ({ default: m.GuidePage }))
);

// Wrapped in Suspense with loading fallback
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/analyzer" element={<AnalyzerPage />} />
  </Routes>
</Suspense>
```

### Custom Hooks

Analysis logic encapsulated in reusable hooks.

```typescript
// src/hooks/useDeckAnalysis.ts
export const useDeckAnalysis = () => {
  const [deckList, setDeckList] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Auto-persist to localStorage
  useEffect(() => {
    localStorage.setItem('manatuner-decklist', deckList);
  }, [deckList]);
  
  const analyzeDeck = async () => {
    setIsAnalyzing(true);
    const result = await DeckAnalyzer.analyzeDeck(deckList);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };
  
  return { deckList, setDeckList, isAnalyzing, analysisResult, analyzeDeck };
};
```

### Error Boundaries

Graceful error handling with recovery options.

```typescript
// src/components/common/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## State Management

### Redux Store Structure

```typescript
// src/store/index.ts
const store = configureStore({
  reducer: {
    deck: deckReducer,      // Current deck and saved decks
    ui: uiReducer,          // Theme, preferences, UI state
    analysis: analysisReducer  // Analysis results cache
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false  // Allow Date objects
    })
});
```

### Deck Slice

```typescript
// src/store/slices/deckSlice.ts
interface DeckState {
  currentDeck: Deck | null;
  savedDecks: Deck[];
  analysis: ManabaseAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
}

const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    setCurrentDeck,
    addCardToDeck,
    removeCardFromDeck,
    updateCardQuantity,
    saveDeck,
    loadDeck,
    deleteDeck,
    setAnalysis,
    clearAnalysis
  }
});
```

### Persistence

Redux state persisted with `redux-persist` to localStorage.

```typescript
const persistConfig = {
  key: 'manatuner',
  storage,
  whitelist: ['deck', 'ui']  // Only persist specific slices
};
```

---

## Performance Optimizations

### Web Workers

Monte Carlo simulations run in a dedicated Web Worker to avoid blocking the main thread.

```typescript
// src/hooks/useMonteCarloWorker.ts
export const useMonteCarloWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/monteCarlo.worker.ts', import.meta.url)
    );
    return () => workerRef.current?.terminate();
  }, []);
  
  const runSimulation = useCallback((params: MonteCarloParams) => {
    return new Promise<MonteCarloResult>((resolve) => {
      workerRef.current?.postMessage(params);
      workerRef.current!.onmessage = (e) => resolve(e.data);
    });
  }, []);
  
  return { runSimulation };
};
```

### Memoization

Expensive calculations cached at multiple levels.

```typescript
// In ManaCalculator
private memoCache: Map<string, number> = new Map();

private binomial(n: number, k: number): number {
  const key = `${n},${k}`;
  if (this.memoCache.has(key)) {
    return this.memoCache.get(key)!;
  }
  // ... calculate and cache
}
```

### Code Splitting

Vite configuration for optimal chunk splitting.

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          charts: ['recharts']
        }
      }
    }
  }
});
```

### Virtual Lists

Large lists rendered efficiently with `react-window`.

```typescript
// src/components/common/VirtualList.tsx
import { FixedSizeList } from 'react-window';

export const VirtualList = ({ items, renderItem, itemHeight }) => (
  <FixedSizeList
    height={400}
    itemCount={items.length}
    itemSize={itemHeight}
  >
    {({ index, style }) => (
      <div style={style}>{renderItem(items[index])}</div>
    )}
  </FixedSizeList>
);
```

---

## Testing Strategy

### Test Categories

| Category | Tool | Location | Purpose |
|----------|------|----------|---------|
| Unit | Vitest | `src/**/*.test.ts` | Service logic validation |
| Critical Math | Vitest | `src/services/__tests__/` | Frank Karsten formula verification |
| E2E | Playwright | `tests/e2e/` | User workflow testing |
| Accessibility | @axe-core/playwright | `tests/e2e/accessibility/` | WCAG compliance |

### Critical Math Tests

```typescript
// src/services/__tests__/maths.critical.test.ts
describe('Frank Karsten Methodology', () => {
  it('calculates hypergeometric probability correctly', () => {
    const result = manaCalculator.cumulativeHypergeometric(60, 24, 7, 1);
    expect(result).toBeCloseTo(0.985, 2);  // 98.5% for 1+ land in 7 cards
  });
  
  it('matches Karsten tables for colored sources', () => {
    // 14 sources for 90% on turn 1 with 1 colored symbol
    const result = manaCalculator.calculateManaProbability(60, 14, 1, 1, true, 7);
    expect(result.probability).toBeGreaterThanOrEqual(0.90);
  });
});
```

### Running Tests

```bash
# Unit tests
npm run test:unit

# Watch mode
npm run test:unit:watch

# E2E tests
npm run test:e2e

# Specific test suites
npm run test:mtg-logic      # MTG-specific logic
npm run test:mana-calc      # Mana calculations
npm run test:accessibility  # A11y compliance
```

---

## API Integrations

### Scryfall API

Used for card data enrichment (mana costs, types, produced mana).

```typescript
// Rate-limited requests with caching
const scryfallCache = new Map<string, ScryfallCard>();

async function fetchCard(name: string): Promise<ScryfallCard | null> {
  if (scryfallCache.has(name)) {
    return scryfallCache.get(name)!;
  }
  
  const response = await fetch(
    `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`
  );
  
  if (!response.ok) return null;
  
  const data = await response.json();
  scryfallCache.set(name, data);
  return data;
}
```

### Supabase (Optional)

Cloud sync for saved analyses when user opts in.

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const syncAnalysis = async (analysis: AnalysisResult) => {
  const { data, error } = await supabase
    .from('analyses')
    .upsert({ ...analysis, user_code: getUserCode() });
  return { data, error };
};
```

---

## Security Considerations

### Data Encryption

All locally stored data encrypted with AES-256.

```typescript
// src/lib/privacy.ts
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = generateUserKey();

export const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### Input Validation

Deck input sanitized before processing.

```typescript
// src/lib/validations.ts
export const sanitizeDeckList = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/[^\w\s\d\-\/\(\)]/g, '')  // Allow only safe characters
    .trim();
};
```

---

## Deployment

### Vercel Configuration

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/workers/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

### Build Process

```bash
# Production build
npm run build

# Output: dist/
# - index.html
# - assets/
#   - index-[hash].js (main bundle)
#   - vendor-[hash].js (React, etc.)
#   - mui-[hash].js (Material-UI)
#   - index-[hash].css
```

---

## Future Considerations

- **Offline Mode**: Full PWA with service worker caching
- **Deck Comparison**: Side-by-side manabase analysis
- **Historical Tracking**: Performance trends over time
- **AI Recommendations**: ML-powered optimization suggestions
- **Commander Support**: Enhanced 99-card format analysis

---

*Last updated: December 2025*
