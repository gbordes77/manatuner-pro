# ManaTuner Pro - Technology Stack

## Stack Overview

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Language** | TypeScript | 5.9 | Type-safe JavaScript |
| **Runtime** | Node.js | >=18.0 | Development environment |
| **Framework** | React | 18.2 | UI library |
| **Build Tool** | Vite | 7.3 | Fast dev server & bundler |
| **UI Library** | MUI | 5.11 | Material Design components |
| **State (Global)** | Redux Toolkit | 1.9 | Predictable state container |
| **State (Server)** | TanStack Query | 5.80 | Server state management |
| **Routing** | React Router | 6.8 | Client-side routing |
| **Forms** | React Hook Form | 7.43 | Form state management |
| **Validation** | Zod | 3.20 | Schema validation |
| **Charts** | Recharts | 2.15 | Data visualization |
| **Styling** | Emotion | 11.10 | CSS-in-JS |
| **Testing (Unit)** | Vitest | 4.0 | Unit test runner |
| **Testing (E2E)** | Playwright | 1.53 | E2E browser testing |
| **Deployment** | Vercel | - | Serverless hosting |

## Detailed Technology Analysis

### Frontend Core

#### React 18.2
- **Concurrent Features**: Suspense for lazy loading
- **Strict Mode**: Enabled for development
- **Hooks**: Extensive use of useState, useEffect, useMemo, useCallback
- **Custom Hooks**: 10 domain-specific hooks

#### TypeScript 5.9
- **Strict Mode**: `strict: true` enabled
- **Path Aliases**: `@/*` for clean imports
- **Module Resolution**: Node (bundler mode)
- **JSX**: react-jsx transform

#### Vite 7.3
- **Dev Server**: HMR with sub-second updates
- **Build**: Terser minification, tree-shaking
- **Code Splitting**: Manual chunks for vendors
- **PWA Plugin**: vite-plugin-pwa for offline support

### UI Framework

#### MUI (Material-UI) v5.11
- **Theme**: Custom dark/light themes with WUBRG colors
- **Components**: Extensive use of Box, Container, Typography, Grid
- **Charts**: @mui/x-charts for additional visualizations
- **Icons**: @mui/icons-material

#### Styling Strategy
- **CSS-in-JS**: Emotion with `sx` prop
- **Theme Variables**: Consistent color palette
- **Responsive**: Mobile-first breakpoints
- **Animations**: CSS keyframes for mana symbols

### State Management

#### Redux Toolkit
```typescript
// Store Structure
store/
├── slices/
│   ├── deckSlice        // Deck data & cards
│   ├── analysisSlice    // Analysis results
│   ├── analyzerSlice    // UI state
│   ├── uiSlice          // Theme, preferences
│   └── authSlice        // Auth (disabled)
```
- **Redux Persist**: LocalStorage persistence
- **Immer**: Immutable updates

#### TanStack React Query v5
- **Scryfall Queries**: Card data fetching
- **Caching**: Aggressive caching strategy
- **Devtools**: Available in development

### Data Visualization

#### Recharts 2.15
- **Line Charts**: Probability curves
- **Bar Charts**: Mana distribution
- **Composed Charts**: Multi-metric displays
- **Responsive**: ResponsiveContainer usage

### Form Handling

#### React Hook Form + Zod
- **Validation**: Schema-based with Zod
- **Performance**: Uncontrolled components
- **Integration**: @hookform/resolvers

### HTTP & APIs

#### Axios 1.3
- **Scryfall API**: Card data fetching
- **Error Handling**: Interceptors for retries
- **Caching**: Integrated with React Query

#### External APIs
| API | Purpose | Caching |
|-----|---------|---------|
| Scryfall | Card data, images | 1 week |
| Card Images | scryfall.io | 1 month |
| Google Fonts | Typography | 1 year |

### PWA Configuration

#### vite-plugin-pwa + Workbox
- **Service Worker**: Auto-update strategy
- **Precaching**: Static assets
- **Runtime Caching**: API responses
- **Offline Support**: Full functionality

```typescript
// Caching Strategy
{
  'scryfall-api': 'CacheFirst',      // 1 week
  'card-images': 'CacheFirst',       // 1 month
  'google-fonts': 'StaleWhileRevalidate',
  'app-shell': 'NetworkFirst'        // 3s timeout
}
```

### Testing Stack

#### Vitest 4.0 (Unit Tests)
- **Config**: vitest.config.js
- **Coverage**: @vitest/coverage-v8
- **Environment**: jsdom
- **Utilities**: @testing-library/react

#### Playwright 1.53 (E2E Tests)
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Mobile Chrome viewport
- **Accessibility**: @axe-core/playwright
- **Reports**: HTML reporter

### Build & Deployment

#### Vite Build Configuration
```typescript
build: {
  target: 'es2015',
  minify: 'terser',
  sourcemap: false,
  rollupOptions: {
    manualChunks: {
      'vendor-react': ['react', 'react-dom'],
      'vendor-mui': ['@mui/material'],
      'vendor-charts': ['recharts'],
      'vendor-redux': ['@reduxjs/toolkit']
    }
  }
}
```

#### Vercel Deployment
- **Framework**: Vite (auto-detected)
- **Build Command**: `vite build`
- **Output**: `dist/`
- **Headers**: CSP, X-Frame-Options, etc.

### Security Headers (vercel.json)

```json
{
  "Content-Security-Policy": "default-src 'self'; ...",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

## Architecture Decisions

### Why These Technologies?

| Decision | Rationale |
|----------|-----------|
| **React + Vite** | Fast DX, excellent ecosystem, Vercel integration |
| **MUI** | Comprehensive components, themeable, accessible |
| **Redux Toolkit** | Predictable state, devtools, persistence |
| **React Query** | Server state separation, caching, offline support |
| **TypeScript** | Type safety, better IDE support, catch errors early |
| **Vitest** | Vite-native, fast, Jest-compatible |
| **Playwright** | Cross-browser, reliable, excellent DX |

### Privacy-First Architecture

- **No Backend**: 100% client-side processing
- **LocalStorage**: Encrypted with AES-256
- **No Tracking**: No analytics, no cookies
- **Supabase Disabled**: Optional cloud sync removed

## Dependencies Summary

### Production (25 packages)
- React ecosystem (react, react-dom, react-router-dom)
- MUI ecosystem (@mui/material, @mui/icons-material, @emotion/*)
- State management (@reduxjs/toolkit, react-redux, redux-persist)
- Data fetching (@tanstack/react-query, axios)
- Forms (react-hook-form, @hookform/resolvers, zod)
- Charts (recharts, @mui/x-charts)
- Export (html2canvas, jspdf)
- Utilities (lodash, date-fns)

### Development (25 packages)
- Build (vite, @vitejs/plugin-react, vite-plugin-pwa)
- TypeScript (typescript, @types/*)
- Testing (vitest, playwright, @testing-library/*)
- Linting (eslint, @typescript-eslint/*)
- Deployment (vercel)

---

*Generated by BMAD document-project workflow on 2026-01-06*
