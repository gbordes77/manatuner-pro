# Changelog

All notable changes to ManaTuner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-04-05

### Performance

- **Batch Scryfall API**: N sequential calls replaced by single `/cards/collection` batch request (~5s to ~1s)
- **Remove artificial delay**: Removed 1.5s setTimeout in deck analysis
- **React.memo**: Added to 6 analyzer tab components, preventing unnecessary re-renders
- **Monte Carlo fix**: Single-pass standard deviation calculation (was running simulations twice)
- **Lazy-loaded tabs**: All analyzer tabs and ManaBlueprint loaded on demand via React.lazy
- **Bundle splitting**: AnalyzerPage no longer loaded as a monolithic 608KB chunk

### Security

- **CSP hardened**: Removed `unsafe-eval` from Content-Security-Policy
- **Reverse tabnabbing**: Added `noopener,noreferrer` to all `window.open` calls
- **Import validation**: JSON imports in PrivacyStorage now validated with Zod schema
- **Supabase key**: Removed from env.example (was committed with real JWT)

### Code Quality

- **Unified types**: Consolidated ScryfallCard from 4 duplicate definitions to 1
- **Fixed ManaSymbol**: Removed `| string` that was nullifying type safety
- **Removed dead code**: 4 unused Redux slices, Next.js middleware/API routes, Jest config, orphan setupTests.ts
- **Removed dead deps**: jest, ts-jest, next-pwa, c8, @types/jest
- **Replaced `process.env`**: Migrated to Vite-idiomatic `import.meta.env.DEV`
- **Duplicate SimulationParams**: Removed second identical definition in types/index.ts

### DevOps

- **CI/CD consolidated**: 5 overlapping workflows reduced to 2 (ci.yml + pr-validation.yml)
- **Node 20**: Aligned .nvmrc and CI workflows on Node 20
- **Prettier + Husky**: Added .prettierrc, .prettierignore, and lint-staged pre-commit hook
- **upload-artifact v4**: Updated deprecated v3 action

### UX

- **404 page**: Added proper Not Found page instead of silent redirect
- **URL consistency**: `/my-analyses` route (kept `/mes-analyses` as alias)
- **Label fix**: "List of deck" corrected to "Deck List"
- **.gitignore fix**: `/lib/` instead of `lib/` to stop ignoring `src/lib/`

## [2.0.0] - 2025-06-22

### 🚀 Major Release - Production Ready

### Added

- **Privacy-First Mode**: Complete offline functionality without external dependencies
- **Web Workers Optimization**: Monte Carlo simulations and mana calculations in background threads
- **Advanced Mana Analysis**: Sophisticated probability calculations using hypergeometric distribution
- **Modern UI/UX**: Complete Material-UI redesign with custom MTG theme
- **Responsive Design**: Full mobile and tablet compatibility
- **Performance Optimization**: Lazy loading, code splitting, and efficient rendering
- **Comprehensive Testing**: Unit tests, integration tests, and E2E coverage
- **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions
- **Documentation**: Complete API documentation and user guides

### Fixed

- **Vercel Deployment Issues**: Resolved Web Workers compatibility problems
- **Build Configuration**: Simplified Vite configuration for production stability
- **TypeScript Errors**: Resolved all compilation issues
- **Memory Leaks**: Optimized component lifecycle and state management
- **Loading Performance**: Reduced initial bundle size and improved caching

### Changed

- **Architecture**: Migrated from Firebase to Vercel + Supabase (optional)
- **Build System**: Upgraded to Vite 4.x with optimized configuration
- **State Management**: Enhanced Redux Toolkit implementation
- **API Integration**: Improved Scryfall API integration with error handling
- **Error Handling**: Comprehensive error boundaries and user feedback

### Technical Improvements

- **Bundle Size**: Reduced by 40% through code splitting and tree shaking
- **Performance**: 60% faster load times with optimized assets
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Enhanced metadata and structured data
- **Security**: Implemented CSP headers and security best practices

## [1.5.0] - 2025-06-15

### Added

- Multi-format deck import support
- Enhanced mana curve visualization
- Improved land recommendation algorithms

### Fixed

- Deck parsing edge cases
- Probability calculation accuracy
- UI responsiveness issues

### Changed

- Updated dependencies to latest versions
- Improved error messages and user feedback

## [1.4.0] - 2025-06-10

### Added

- Special lands support (fetchlands, shocklands, etc.)
- Advanced filtering options
- Export functionality for analysis results

### Fixed

- Hybrid mana cost calculations
- Memory optimization for large decklists
- Cross-browser compatibility issues

## [1.3.0] - 2025-06-05

### Added

- Real-time analysis updates
- Deck archetype detection
- Performance metrics dashboard

### Fixed

- Async state management issues
- Component re-rendering optimization
- API rate limiting handling

## [1.2.0] - 2025-05-28

### Added

- Interactive probability charts
- Detailed spell analysis tab
- Mana base recommendations

### Fixed

- Card parsing for special characters
- Probability edge cases
- UI layout inconsistencies

## [1.1.0] - 2025-05-20

### Added

- Turn-by-turn probability analysis
- Color distribution visualization
- Basic deck statistics

### Fixed

- Initial loading performance
- Card database synchronization
- Mobile layout issues

## [1.0.0] - 2025-05-15

### 🎉 Initial Release

### Added

- **Core Functionality**
  - Deck list parsing and analysis
  - Basic mana base calculations
  - Hypergeometric probability distributions
  - Simple web interface

- **Analysis Features**
  - Mana cost distribution
  - Color requirements analysis
  - Basic land recommendations
  - Consistency ratings

- **Technical Foundation**
  - React 18 with TypeScript
  - Material-UI component library
  - Redux for state management
  - Firebase integration

### Technical Stack

- Frontend: React 18, TypeScript, Material-UI
- Backend: Firebase Functions, Firestore
- Build: Create React App
- Deployment: Firebase Hosting

---

## 📋 Version History Summary

| Version   | Date       | Description                                                         |
| --------- | ---------- | ------------------------------------------------------------------- |
| **2.1.0** | 2026-04-05 | ⚡ **Performance & Quality** - 4 audit sprints, ~8s to ~1s analysis |
| **2.0.0** | 2025-06-22 | 🚀 **Production Ready** - Major rewrite with Vercel deployment      |
| 1.5.0     | 2025-06-15 | Multi-format support and enhanced visualizations                    |
| 1.4.0     | 2025-06-10 | Special lands support and export functionality                      |
| 1.3.0     | 2025-06-05 | Real-time updates and archetype detection                           |
| 1.2.0     | 2025-05-28 | Interactive charts and detailed analysis                            |
| 1.1.0     | 2025-05-20 | Turn-by-turn analysis and visualizations                            |
| 1.0.0     | 2025-05-15 | 🎉 **Initial Release** - Core functionality                         |

---

## 🔗 Links

- **Live Demo**: [manatuner.app](https://manatuner.app)
- **Repository**: [github.com/gbordes77/manatuner](https://github.com/gbordes77/manatuner)
- **Issues**: [GitHub Issues](https://github.com/gbordes77/manatuner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gbordes77/manatuner/discussions)
