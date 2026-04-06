# ManaTuner - Component Inventory

## Component Overview

| Category     | Count | Purpose                              |
| ------------ | ----- | ------------------------------------ |
| **Layout**   | 4     | App structure (Header, Footer, etc.) |
| **Common**   | 6     | Shared/reusable components           |
| **Analyzer** | 8     | Core analysis functionality          |
| **Pages**    | 7     | Route-based pages                    |
| **Export**   | 1     | Export functionality                 |
| **Other**    | 8     | Specialized components               |
| **Total**    | 34    | -                                    |

---

## Layout Components

### `Header.tsx`

- **Location**: `src/components/layout/Header.tsx`
- **Purpose**: Main navigation header
- **Features**: Logo, nav links, theme toggle
- **Dependencies**: MUI AppBar, react-router-dom

### `Footer.tsx`

- **Location**: `src/components/layout/Footer.tsx`
- **Purpose**: App footer with credits
- **Features**: WUBRG signature, GitHub link, Fan Content Policy
- **Dependencies**: MUI Box, Typography

### `StaticPages.tsx`

- **Location**: `src/components/layout/StaticPages.tsx`
- **Purpose**: About and Privacy pages
- **Exports**: `AboutPage`, `PrivacyPage`
- **Dependencies**: MUI Container, Typography

### `BetaBanner.tsx`

- **Location**: `src/components/BetaBanner.tsx`
- **Purpose**: Beta announcement banner
- **Features**: Dismissible, localStorage persistence
- **Dependencies**: MUI Alert, IconButton

---

## Common/Shared Components

### `ErrorBoundary.tsx`

- **Location**: `src/components/common/ErrorBoundary.tsx`
- **Purpose**: React error boundary
- **Features**: Catches errors, fallback UI
- **Pattern**: Class component (required for error boundaries)

### `NotificationProvider.tsx`

- **Location**: `src/components/common/NotificationProvider.tsx`
- **Purpose**: Toast notification system
- **Features**: Success/error/warning toasts
- **Dependencies**: MUI Snackbar, Alert

### `ManaSymbols.tsx`

- **Location**: `src/components/common/ManaSymbols.tsx`
- **Purpose**: WUBRG mana symbol display
- **Exports**: `ManaSymbol`, `ManaSequence`, `WUBRGBar`, `ManaCost`
- **Dependencies**: Mana Font CSS

### `FloatingManaSymbols.tsx`

- **Location**: `src/components/common/FloatingManaSymbols.tsx`
- **Purpose**: Decorative background mana symbols
- **Features**: Animated, theme-aware
- **Dependencies**: MUI Box, CSS animations

### `LoadingSpinner.tsx`

- **Location**: `src/components/common/LoadingSpinner.tsx`
- **Purpose**: Loading state indicator
- **Features**: MTG-themed loading messages
- **Dependencies**: MUI CircularProgress

### `ResponsiveTable.tsx`

- **Location**: `src/components/ResponsiveTable.tsx`
- **Purpose**: Mobile-responsive data table
- **Features**: Horizontal scroll, sticky headers
- **Dependencies**: MUI Table components

---

## Analyzer Components

### `DashboardTab.tsx`

- **Location**: `src/components/analyzer/DashboardTab.tsx`
- **Purpose**: Analysis overview dashboard
- **Features**: Health score, quick stats, recommendations
- **Tab**: Dashboard (first tab)

### `CastabilityTab.tsx`

- **Location**: `src/components/analyzer/CastabilityTab.tsx`
- **Purpose**: Castability probability display
- **Features**: Turn-by-turn probabilities, color requirements
- **Tab**: Castability

### `MulliganTab.tsx`

- **Location**: `src/components/analyzer/MulliganTab.tsx`
- **Purpose**: Mulligan simulation interface
- **Features**: Monte Carlo simulation, decision chart
- **Tab**: Mulligan

### `SpellAnalysisTab.tsx`

- **Location**: `src/components/analyzer/SpellAnalysisTab.tsx`
- **Purpose**: Individual spell analysis
- **Features**: Per-card probabilities, recommendations
- **Tab**: Analysis

### `ManaBreakdownTab.tsx`

- **Location**: `src/components/analyzer/ManaBreakdownTab.tsx`
- **Purpose**: Mana source breakdown
- **Features**: Color distribution, land categorization
- **Tab**: Manabase

### `ManaBlueprint.tsx`

- **Location**: `src/components/analyzer/ManaBlueprint.tsx`
- **Purpose**: Visual manabase blueprint for export
- **Features**: PNG/PDF export, full analysis summary
- **Tab**: Blueprint

### `DeckInputArea.tsx`

- **Location**: `src/components/analyzer/DeckInputArea.tsx`
- **Purpose**: Deck text input
- **Features**: Multi-format parsing, validation
- **Dependencies**: MUI TextField

### `ResultsDisplay.tsx`

- **Location**: `src/components/analyzer/ResultsDisplay.tsx`
- **Purpose**: Analysis results container
- **Features**: Tab navigation, loading states
- **Dependencies**: MUI Tabs, TabPanel

---

## Page Components

### `HomePage.tsx`

- **Location**: `src/pages/HomePage.tsx`
- **Size**: 24.9 KB
- **Purpose**: Landing page
- **Features**: Hero, features showcase, CTA
- **Route**: `/`

### `AnalyzerPage.tsx`

- **Location**: `src/pages/AnalyzerPage.tsx`
- **Size**: 20.0 KB
- **Purpose**: Main analyzer interface
- **Features**: Deck input, tabbed results
- **Route**: `/analyzer`

### `GuidePage.tsx`

- **Location**: `src/pages/GuidePage.tsx`
- **Size**: 24.8 KB
- **Purpose**: User guide
- **Features**: How-to instructions, tips
- **Route**: `/guide`

### `MathematicsPage.tsx`

- **Location**: `src/pages/MathematicsPage.tsx`
- **Size**: 24.3 KB
- **Purpose**: Mathematical explanations
- **Features**: Frank Karsten formulas, theory
- **Route**: `/mathematics`

### `LandGlossaryPage.tsx`

- **Location**: `src/pages/LandGlossaryPage.tsx`
- **Size**: 19.0 KB
- **Purpose**: Land reference guide
- **Features**: Land types, dual lands, MDFC
- **Route**: `/land-glossary`

### `MyAnalysesPage.tsx`

- **Location**: `src/pages/MyAnalysesPage.tsx`
- **Size**: 8.7 KB
- **Purpose**: Saved analyses list
- **Features**: LocalStorage retrieval, delete
- **Route**: `/mes-analyses`

### `PrivacyFirstPage.tsx`

- **Location**: `src/pages/PrivacyFirstPage.tsx`
- **Size**: 11.7 KB
- **Purpose**: Privacy information
- **Features**: Data handling explanation
- **Route**: `/privacy`

---

## Specialized Components

### `EnhancedCharts.tsx`

- **Location**: `src/components/EnhancedCharts.tsx`
- **Size**: 15.2 KB
- **Purpose**: Data visualization charts
- **Features**: Probability curves, distributions
- **Dependencies**: Recharts

### `EnhancedRecommendations.tsx`

- **Location**: `src/components/EnhancedRecommendations.tsx`
- **Size**: 10.6 KB
- **Purpose**: Land recommendations
- **Features**: Add/remove suggestions, rationale
- **Dependencies**: MUI List, Chip

### `EnhancedSpellAnalysis.tsx`

- **Location**: `src/components/EnhancedSpellAnalysis.tsx`
- **Size**: 21.9 KB
- **Purpose**: Detailed spell analysis
- **Features**: Per-spell probabilities, curves
- **Dependencies**: Recharts, MUI

### `ManaCostRow.tsx`

- **Location**: `src/components/ManaCostRow.tsx`
- **Size**: 32.6 KB
- **Purpose**: Mana cost visualization
- **Features**: Pip display, cost breakdown
- **Dependencies**: ManaSymbols

### `MulliganDecisionChart.tsx`

- **Location**: `src/components/MulliganDecisionChart.tsx`
- **Size**: 12.8 KB
- **Purpose**: Mulligan decision tree
- **Features**: Keep/mulligan probabilities
- **Dependencies**: Recharts

### `CardImageTooltip.tsx`

- **Location**: `src/components/CardImageTooltip.tsx`
- **Size**: 2.6 KB
- **Purpose**: Card image preview on hover
- **Features**: Scryfall images, lazy loading
- **Dependencies**: MUI Tooltip

### `Onboarding.tsx`

- **Location**: `src/components/Onboarding.tsx`
- **Size**: 4.2 KB
- **Purpose**: User onboarding tour
- **Features**: Step-by-step guide, tooltips
- **Dependencies**: react-joyride

### `ExportDialog.tsx`

- **Location**: `src/components/export/ExportDialog.tsx`
- **Purpose**: Export modal
- **Features**: Format selection, preview
- **Dependencies**: html2canvas, jspdf

---

## Component Patterns

### State Management

- **Local State**: useState for component-specific state
- **Global State**: Redux for shared state
- **Server State**: React Query for API data

### Styling

- **MUI sx prop**: Primary styling method
- **Theme-aware**: Uses theme.palette colors
- **Responsive**: useMediaQuery for breakpoints

### Performance

- **Lazy Loading**: React.lazy for pages
- **Memoization**: useMemo, useCallback, React.memo
- **Virtualization**: react-window for long lists

### Accessibility

- **ARIA Labels**: On interactive elements
- **Keyboard Navigation**: Tab focus management
- **Screen Readers**: Proper heading hierarchy

---

_Generated by BMAD document-project workflow on 2026-01-06_
