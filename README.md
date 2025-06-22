# 🎯 ManaTuner Pro

[![CI/CD Pipeline](https://github.com/gbordes77/manatuner-pro/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/gbordes77/manatuner-pro/actions/workflows/ci-cd.yml)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/gbordes77/manatuner-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## Advanced MTG Manabase Analysis Tool

A modern web application for analyzing and optimizing Magic: The Gathering manabases, inspired by the pioneering work of [Charles Wickham](https://github.com/WickedFridge/magic-project-manabase) and based on Frank Karsten's mathematical research.

## 🌟 Features

### 🔍 **Advanced Analysis**
- Precise hypergeometric calculations
- Special lands handling (fetchlands, checklands, fastlands, shocklands)
- Sophisticated mana cost parsing (hybrid, X, complex)
- Card-by-card evaluation

### 📊 **Modern Interface**
- 4 comprehensive analysis tabs
- Interactive visualizations
- Responsive Material-UI design
- Custom MTG theme

### 🧠 **Intelligent Algorithms**
- Dynamic recommendations based on CMC
- Automatic deck style detection
- Turn-by-turn probability calculations
- Consistency rating system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage
1. Open http://localhost:3000
2. Navigate to the Analyzer
3. Paste your decklist (format: "4 Lightning Bolt")
4. Click "Analyze Manabase"
5. Explore the 4 analysis tabs

## 📊 Analysis Features

### 1. **Overview Tab**
- General statistics (total cards, lands, CMC)
- Color distribution with visual chips
- Overall consistency rating
- Land ratio analysis

### 2. **Probabilities Tab**
- Turn-by-turn probability calculations (turns 1-4)
- Hypergeometric distribution based
- Visual progress bars for each color requirement

### 3. **Recommendations Tab**
- Intelligent suggestions based on deck composition
- CMC-based optimization advice
- Archetype-specific recommendations
- Frank Karsten methodology

### 4. **Spell Analysis Tab**
- Individual card castability evaluation
- Playable copies calculation
- Color-coded performance indicators
- Combination-based algorithms

## 🔧 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI** for components
- **Redux Toolkit** for state management
- **Vite** for build tooling

### Backend
- **Vercel** for deployment and hosting
- **Supabase** for optional data persistence
- **Privacy-First** mode with offline functionality

### Algorithms
- **Hypergeometric distribution** for probability calculations
- **Frank Karsten's research** for mana requirements
- **Charles Wickham's algorithms** for advanced land handling

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── services/           # Business logic and API calls
├── store/              # Redux store and slices
├── theme/              # Material-UI theme configuration
└── types/              # TypeScript type definitions
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Deploy to Vercel (via GitHub integration)
git push origin main
```

### Environment Variables
```env
# Supabase (optional - for data persistence)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics (optional)
VITE_GA_TRACKING_ID=your_analytics_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Charles Wickham** - Original [Project Manabase](https://github.com/WickedFridge/magic-project-manabase)
- **Frank Karsten** - Mathematical research and mana base theory
- **Scryfall** - MTG card data API
- **MTG Community** - Continuous feedback and testing

## 📚 Research References

- [Frank Karsten's Manabase Articles](https://www.channelfireball.com/author/frank-karsten/)
- [Hypergeometric Distribution in MTG](https://www.mtgsalvation.com/articles/15690-hypergeometric-calculator-and-you)
- [Project Manabase Open Source](https://github.com/WickedFridge/magic-project-manabase)

## 🔗 Links

- **Live Demo**: [🚀 https://manatuner-pro.vercel.app](https://manatuner-pro.vercel.app) ✅ **LIVE**
- **Documentation**: [Wiki](https://github.com/gbordes77/manatuner-pro/wiki)
- **Issues**: [GitHub Issues](https://github.com/gbordes77/manatuner-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gbordes77/manatuner-pro/discussions)

---

**ManaTuner Pro** - Precision manabase analysis for competitive Magic: The Gathering players. 🎯✨ 