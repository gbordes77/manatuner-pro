# ManaTuner - Technology Stack

## Stack Overview

| Layer              | Technology          | Version | Purpose                     |
| ------------------ | ------------------- | ------- | --------------------------- |
| **Language**       | TypeScript          | 5.9     | Type-safe JavaScript        |
| **Runtime**        | Node.js             | >=18.0  | Development environment     |
| **Framework**      | React               | 18.2    | UI library                  |
| **Build Tool**     | Vite                | 7.3     | Fast dev server & bundler   |
| **UI Library**     | MUI                 | 5.11    | Material Design components  |
| **State (Global)** | Redux Toolkit       | 1.9     | Predictable state container |
| **State (Server)** | TanStack Query      | 5.80    | Server state management     |
| **Routing**        | React Router        | 6.8     | Client-side routing         |
| **Validation**     | Zod                 | 3.20    | Schema validation           |
| **Charts**         | Recharts            | 2.15    | Data visualization          |
| **Styling**        | Emotion             | 11.10   | CSS-in-JS                   |
| **Export**         | html2canvas + jsPDF | -       | PNG/PDF export              |
| **Onboarding**     | react-joyride       | -       | Step-by-step tour           |
| **Testing (Unit)** | Vitest              | 4.0     | Unit test runner            |
| **Testing (E2E)**  | Playwright          | 1.53    | E2E browser testing         |
| **Deployment**     | Vercel              | -       | Serverless hosting          |

## Frontend Core

### React 18.2

- **Concurrent Features**: Suspense for lazy loading all analyzer tabs
- **Strict Mode**: Enabled for development
- **Hooks**: Extensive use of useState, useEffect, useMemo, useCallback, useReducer
- **Custom Hooks**: useMonteCarloWorker, useAnalyzer, useDeckHistory
- **React.memo**: Applied to all 6 analyzer tab components

### TypeScript 5.9

- **Strict Mode**: `strict: true` enabled
- **Path Aliases**: `@/*` for clean imports
- **Module Resolution**: Bundler mode

### Vite 7.3

- **Dev Server**: HMR with sub-second updates
- **Build**: ESBuild minification, tree-shaking
- **Code Splitting**: Manual chunks (vendor-react, vendor-mui, vendor-charts, vendor-redux)
- **Lazy Loading**: AnalyzerPage and all tab components loaded on demand

## UI Framework

### MUI (Material-UI) v5.11

- **Theme**: Custom dark/light themes with WUBRG colors (W/U/B/R/G mana)
- **Font**: Cinzel for display headings, Roboto for body text
- **Components**: Box, Container, Typography, Grid, Accordion, Tabs, Dialog
- **Icons**: @mui/icons-material

### Styling Strategy

- **CSS-in-JS**: Emotion with `sx` prop
- **Mana Font**: cdn.jsdelivr.net/npm/mana-font for MTG mana symbols
- **Responsive**: 3 breakpoints (isSmallMobile / isMobile / desktop)
- **Animations**: CSS keyframes for floating mana symbols, pulse effects

## State Management

### Redux Toolkit

- **Single slice**: `analyzerSlice` (deck data, analysis results, UI state)
- **Redux Persist**: LocalStorage persistence for deck history
- **Immer**: Immutable updates

### TanStack React Query v5

- **Scryfall Queries**: Card data fetching with batch API
- **Caching**: 1 hour staleTime, 24 hour cacheTime
- **Devtools**: Available in development

## External APIs

| API                          | Purpose           | Method       |
| ---------------------------- | ----------------- | ------------ |
| Scryfall `/cards/collection` | Card data (batch) | POST         |
| Scryfall card images         | Card visuals      | CDN cached   |
| Google Fonts                 | Cinzel + Roboto   | Preconnected |
| Mana Font CDN                | MTG mana symbols  | Stylesheet   |

## Testing

### Vitest 4.0 (Unit Tests)

- **Coverage**: @vitest/coverage-v8
- **Environment**: jsdom
- **Utilities**: @testing-library/react

### Playwright 1.53 (E2E Tests)

- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Mobile Chrome viewport
- **Accessibility**: @axe-core/playwright
- **Reports**: HTML reporter

## Build & Deployment

### Vercel

- **Auto-deploy**: Push to `main` triggers deployment
- **Framework**: Vite (auto-detected)
- **Build Command**: `vite build`
- **Output**: `dist/`
- **Custom Domain**: manatuner.app

### Security Headers (vercel.json)

- Content-Security-Policy (strict, no unsafe-eval)
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS preload)
- X-Content-Type-Options: nosniff
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Privacy-First Architecture

- **No Backend**: 100% client-side processing
- **LocalStorage**: Encrypted with AES-256
- **No Tracking**: No analytics, no cookies
- **Supabase**: Disabled (mocked, `isConfigured: () => false`)

---

_Last Updated: April 2026_
