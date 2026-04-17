# ManaTuner

[![Deploy Status](https://img.shields.io/badge/deploy-live-success)](https://manatuner.app)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-315%20Passing-green)](https://github.com/gbordes77/manatuner)
[![Version](https://img.shields.io/badge/Version-2.5.4-blue)](https://github.com/gbordes77/manatuner/releases)

**Advanced MTG Manabase Analyzer** - Calculate exact probabilities for casting spells on curve and make optimal mulligan decisions.

[Live Demo](https://manatuner.app) | [Documentation](./docs/ARCHITECTURE.md) | [Guide](https://manatuner.app/guide)

---

## Overview

ManaTuner answers the fundamental question every Magic player asks: **"Can I cast my spells on curve?"**

Built on Frank Karsten's mathematical research, it provides:

- Exact hypergeometric probabilities for every spell
- Monte Carlo mulligan simulations (10,000 hands, configurable up to 50k)
- Turn-by-turn castability analysis
- Optimal land count recommendations
- A curated reading library of **46 essential competitive MTG resources** — articles + podcasts (Karsten, PVDDR, Saito, Chapin, Reid Duke, Zvi Mowshowitz, Le Podcaster Mage FR, and more — many recovered via archive.org)

**100% client-side** - Your decklists never leave your browser.

---

## Features

| Feature                    | Description                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Castability Analysis**   | Exact probability of casting each spell on curve, turn by turn                                                                                              |
| **Post-Board Analysis**    | Sideboard auto-detected from any format; swap cards in/out to see post-board castability                                                                    |
| **Creature-Aware Sources** | Lands like Cavern of Souls correctly count as colored sources only for creature spells                                                                      |
| **Analysis Dashboard**     | Visual breakdown of spells by category, curve insights, performance diagnostics                                                                             |
| **Mana Acceleration**      | Detects 13 ramp types: dorks, rocks, rituals, land auras, land ramp, doublers, landfall, and more                                                           |
| **Mulligan Simulator**     | Monte Carlo simulation with optimal keep/mulligan thresholds                                                                                                |
| **Reading Library**        | 46 curated competitive MTG resources (articles + podcasts) in 3 tracks (First FNM / RCQ / Pro Tour) + Browse by Topic. 29 live + 11 archive.org recoveries. |
| **Export Blueprint**       | Download analysis as PNG, PDF, or JSON for sharing                                                                                                          |
| **Multi-Format Support**   | Limited (40), Constructed (60), Commander (99+)                                                                                                             |
| **Privacy-First**          | All data stored locally in your browser — nothing sent to our servers                                                                                       |

---

## Quick Start

### Use Online (Recommended)

Visit **[manatuner.app](https://manatuner.app)** - no installation required.

### Local Development

```bash
# Prerequisites: Node.js 18+
node --version  # v18.0.0 or higher

# Clone and install
git clone https://github.com/gbordes77/manatuner.git
cd manatuner
npm install

# Start development server
npm run dev
# Open http://localhost:3000

# Run tests
npm run test:unit    # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

---

## How It Works

```
1. Paste Your Deck     2. Get Probabilities     3. Know Your Mulligans
   MTGO, MTGA, or         Cast chances for          Optimal thresholds
   Moxfield format        every spell/turn          for your archetype
```

### Supported Formats

- **MTGO/MTGA**: `4 Lightning Bolt` or `4 Lightning Bolt (M21) 199`
- **Moxfield**: `4x Lightning Bolt`
- **Sideboard**: Auto-detected via `Sideboard` marker, `SB:` prefix, or blank line separator
- **Full 75**: Paste main + sideboard in one block — ManaTuner splits them automatically

---

## Mathematical Foundation

ManaTuner implements Frank Karsten's research on manabase optimization.

### Core Formulas

**Hypergeometric Distribution**

```
P(X = k) = C(K,k) * C(N-K,n-k) / C(N,n)

N = Deck size (60)
K = Mana sources in deck
n = Cards seen (hand + draws)
k = Sources needed
```

**Cards Seen by Turn**

```
On the play: 7 + turn - 1
On the draw: 7 + turn
```

### Karsten Tables (90% Probability)

| Colored Symbols | Turn 1 | Turn 2 | Turn 3 | Turn 4 |
| --------------- | ------ | ------ | ------ | ------ |
| 1 symbol        | 14     | 13     | 12     | 11     |
| 2 symbols       | -      | 20     | 18     | 16     |
| 3 symbols       | -      | -      | 23     | 20     |

**Reference**: [Frank Karsten - How Many Lands Do You Need?](https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/how-many-lands-do-you-need-to-consistently-hit-your-land-drops/)

---

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React 18, TypeScript, Material-UI |
| State    | Redux Toolkit, React Query        |
| Build    | Vite (ES2015 target)              |
| Testing  | Vitest, Playwright                |
| Hosting  | Vercel Edge Network               |
| Storage  | localStorage (client-only)        |

---

## Project Structure

```
src/
├── components/           # React components
│   ├── analyzer/        # Deck analysis UI
│   ├── analysis/        # Results visualization
│   ├── common/          # Shared UI components
│   └── layout/          # Header, Footer, Navigation
├── hooks/               # Custom React hooks
│   ├── useDeckAnalysis  # Main analysis orchestration
│   ├── useManaCalculations
│   └── useMonteCarloWorker
├── pages/               # Route pages
├── services/            # Business logic
│   ├── manaCalculator   # Hypergeometric calculations
│   ├── advancedMaths    # Monte Carlo engine
│   ├── deckAnalyzer     # Deck parsing & analysis
│   └── landService      # Land detection & ETB logic
├── store/               # Redux slices
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed system documentation.

---

## Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix lint issues
npm run type-check       # TypeScript validation
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes with tests
4. Run quality checks: `npm run lint && npm run test:unit`
5. Commit: `git commit -m "feat: your feature"`
6. Push and create a Pull Request

### Guidelines

- All new features require tests
- Critical math must pass Frank Karsten validation tests
- TypeScript strict mode enforced
- Bundle size monitored (target: <250KB gzipped)

---

## Performance

| Metric           | Value              |
| ---------------- | ------------------ |
| Bundle Size      | 202KB gzipped      |
| Build Time       | ~20 seconds        |
| Lighthouse Score | 90+ all categories |
| Test Coverage    | 85%+ critical code |

---

## Privacy

- **100% Client-Side**: All calculations run in your browser
- **No Account Required**: Use immediately without registration
- **No Tracking**: Zero analytics cookies by default, zero telemetry beacons
- **Local Storage Only**: Your decklists and analysis history never leave your device

---

## Credits

- **[Frank Karsten](https://strategy.channelfireball.com/all-strategy/author/frank-karsten/)** - Mathematical research foundation
- **[Charles Wickham](https://github.com/WickedFridge/magic-project-manabase)** - Original Project Manabase inspiration
- **[Scryfall](https://scryfall.com/)** - MTG card data API

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

**Ready to optimize your manabase?** [Start analyzing now](https://manatuner.app)
