# Project Manabase - Advanced MTG Manabase Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-v9.17.2-orange.svg)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-v18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v4.9.3-blue.svg)](https://www.typescriptlang.org/)

Project Manabase is a sophisticated web application that provides mathematical analysis of Magic: The Gathering manabase configurations. It uses hypergeometric distribution calculations and Monte Carlo simulations to determine optimal land configurations for competitive play.

## 🎯 Features

### Core Analysis
- **Hypergeometric Probability Calculations** - Precise mathematical modeling based on Frank Karsten's research
- **Monte Carlo Simulations** - Statistical analysis with configurable parameters
- **Turn-by-Turn Analysis** - Cast probability calculations for turns 1-6
- **Color Requirements** - Optimal source calculations for each color combination
- **Reliability Ratings** - Performance classifications (Excellent, Good, Marginal, Poor)

### Advanced Capabilities
- **Multi-Format Support** - Standard, Modern, Legacy, Vintage, Commander, Pioneer, Historic
- **MDFC Handling** - Modal Double-Faced Cards analysis
- **Hybrid Mana** - Proper handling of hybrid and Phyrexian mana costs
- **Fetchland Optimization** - Advanced fetch target analysis
- **Landcycling Support** - Alternative mana source calculations

### User Experience
- **Real-time Analysis** - Instant feedback on decklist changes
- **Interactive Visualizations** - Charts and graphs powered by Recharts
- **Scryfall Integration** - Automatic card data fetching and validation
- **Responsive Design** - Mobile-first Material-UI interface
- **Progressive Web App** - Offline capability and native app-like experience

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Material-UI v5** for components
- **Redux Toolkit** for state management
- **Vite** for build tooling
- **PWA** capabilities with service worker

### Backend Infrastructure
- **Firebase Hosting** for static assets
- **Cloud Functions (Node.js 18)** for serverless API
- **Firestore** for data persistence
- **Firebase Auth** for user management
- **Cloud Scheduler** for maintenance tasks

### Security & Performance
- **Rate Limiting** - 10 requests per minute per IP
- **Input Validation** - Comprehensive Zod schemas
- **Security Headers** - CSP, HSTS, and more
- **Caching Strategy** - Multi-layer caching for optimal performance
- **Error Handling** - Comprehensive error boundaries and logging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/project-manabase/manabase-analyzer.git
   cd manabase-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up Firebase**
   ```bash
   firebase login
   firebase init
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase configuration
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Functions emulator
   npm run serve:functions
   ```

6. **Open the application**
   - Frontend: http://localhost:3000
   - Functions: http://localhost:5001

## 📊 API Reference

### Base URL
- **Production**: `https://us-central1-project-manabase.cloudfunctions.net/api`
- **Development**: `http://localhost:5001/project-manabase/us-central1/api`

### Endpoints

#### POST /analyze
Analyzes a decklist and returns manabase recommendations.

**Request Body:**
```json
{
  "decklist": "4 Lightning Bolt\n4 Counterspell\n...",
  "format": "modern",
  "simulationParams": {
    "iterations": 10000,
    "mulliganStrategy": "conservative",
    "playFirst": true,
    "maxMulligans": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "analysis_id",
      "totalLands": 24,
      "overallRating": 8.5,
      "cardAnalyses": [...],
      "recommendations": [...],
      "colorDistribution": {...}
    },
    "metadata": {
      "totalCards": 60,
      "notFoundCards": [],
      "processingTime": 1250,
      "cached": false
    }
  }
}
```

#### GET /cards/search
Searches for a specific card by name.

**Query Parameters:**
- `name` (required): Card name
- `exact` (optional): Boolean for exact match

#### POST /lands/suggest
Gets land suggestions for specific color combinations.

**Request Body:**
```json
{
  "colors": ["W", "U"],
  "format": "standard"
}
```

## 🧮 Mathematical Background

### Hypergeometric Distribution
The application uses hypergeometric distribution to calculate the probability of drawing specific combinations of lands:

```
P(X = k) = C(K,k) × C(N-K,n-k) / C(N,n)
```

Where:
- N = total deck size
- K = total lands of required color
- n = cards drawn
- k = required lands in hand

### Frank Karsten Tables
Based on empirical research, the following source requirements are used:

| Turn | Single Color | Double Color | Triple Color |
|------|-------------|-------------|-------------|
| 1    | 13          | 20          | 27          |
| 2    | 8           | 13          | 18          |
| 3    | 6           | 9           | 12          |
| 4    | 4           | 7           | 9           |
| 5    | 4           | 6           | 8           |
| 6    | 3           | 5           | 7           |

### Monte Carlo Simulation
For complex scenarios, the application runs Monte Carlo simulations:

1. **Hand Generation** - Simulate random 7-card hands
2. **Mulligan Logic** - Apply configurable mulligan strategies
3. **Draw Simulation** - Model card draw through multiple turns
4. **Statistical Analysis** - Aggregate results across thousands of games

## 🔧 Configuration

### Environment Variables
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=your_ga_id
```

### Firebase Configuration
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [{"source": "**", "destination": "/index.html"}],
    "headers": [...]
  },
  "functions": {
    "runtime": "nodejs18",
    "source": "functions"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Performance Testing
```bash
# Load testing with Artillery
npm run test:load
```

## 📈 Performance Optimization

### Frontend Optimizations
- **Code Splitting** - Dynamic imports for route-based splitting
- **Bundle Analysis** - Vite bundle analyzer integration
- **Image Optimization** - Optimized Scryfall image loading
- **Service Worker** - Offline-first PWA capabilities

### Backend Optimizations
- **Caching Strategy** - Redis-like caching with Node-cache
- **Connection Pooling** - Firestore connection optimization
- **Rate Limiting** - Prevent abuse with rate-limiter-flexible
- **Compression** - Gzip compression for responses

### Database Optimizations
- **Composite Indexes** - Optimized query performance
- **Denormalization** - Strategic data duplication
- **Pagination** - Cursor-based pagination for large datasets

## 🔐 Security

### Authentication & Authorization
- **Firebase Auth** - Secure user authentication
- **Custom Claims** - Role-based access control
- **JWT Validation** - Secure API endpoints

### Input Validation
- **Zod Schemas** - Runtime type checking
- **Sanitization** - XSS prevention
- **Rate Limiting** - DDoS protection

### Data Protection
- **Firestore Rules** - Database-level security
- **HTTPS Only** - Encrypted data transmission
- **CSP Headers** - Content Security Policy

## 🚀 Deployment

### Production Deployment
```bash
# Build and deploy everything
npm run deploy

# Deploy specific services
npm run deploy:hosting
npm run deploy:functions
```

### CI/CD Pipeline
The project includes GitHub Actions workflows for:
- **Automated Testing** - Run tests on every PR
- **Security Scanning** - Dependency vulnerability checks
- **Performance Monitoring** - Lighthouse CI integration
- **Automated Deployment** - Deploy on merge to main

### Monitoring & Logging
- **Firebase Analytics** - User behavior tracking
- **Cloud Logging** - Centralized log management
- **Error Reporting** - Automatic error tracking
- **Performance Monitoring** - Real-time performance metrics

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards
- **ESLint** - Code linting with strict rules
- **Prettier** - Code formatting
- **Husky** - Pre-commit hooks
- **Conventional Commits** - Structured commit messages

### Documentation
- Update README.md for new features
- Add JSDoc comments for public APIs
- Include examples for complex functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Frank Karsten** - Foundational manabase mathematics research
- **Scryfall** - Comprehensive MTG card database API
- **MTG Community** - Continuous feedback and testing
- **Firebase Team** - Excellent serverless platform

## 📞 Support

- **Documentation**: [Wiki](https://github.com/project-manabase/manabase-analyzer/wiki)
- **Issues**: [GitHub Issues](https://github.com/project-manabase/manabase-analyzer/issues)
- **Discord**: [Project Manabase Discord](https://discord.gg/project-manabase)
- **Email**: support@project-manabase.com

---

**Built with ❤️ for the Magic: The Gathering community** 