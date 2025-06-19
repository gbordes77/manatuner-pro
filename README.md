# 🎯 ManaTuner Pro

[![CI/CD Pipeline](https://github.com/gbordes77/manatuner-pro/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/gbordes77/manatuner-pro/actions/workflows/ci-cd.yml)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/gbordes77/manatuner-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

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
git clone https://github.com/your-username/manatuner-pro.git
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
- **Firebase Functions** with Express.js
- **Firestore** for data persistence
- **Firebase Hosting** for deployment

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

### Firebase Deployment
```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
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
- **Documentation**: [Wiki](https://github.com/your-username/manatuner-pro/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/manatuner-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/manatuner-pro/discussions)

---

**ManaTuner Pro** - Precision manabase analysis for competitive Magic: The Gathering players. 🎯✨ 