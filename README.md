# 🎯 ManaTuner Pro - Advanced MTG Manabase Analyzer

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://manatuner-pro.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.3-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-9%2F9%20Passing-green)](https://github.com/gbordes77/manatuner-pro)

**🔗 Live Application**: [https://manatuner-pro.vercel.app](https://manatuner-pro.vercel.app) ✅ **LIVE**

<!-- Vercel Sync Trigger: 2025-06-29 15:45 -->

## 🎯 Project Overview

ManaTuner Pro is an **advanced manabase analyzer** for Magic: The Gathering based on **Frank Karsten's mathematical research**. It helps competitive players optimize their manabases with scientific precision.

### 🔬 Based on Frank Karsten Research
- **Mathematical Foundation**: [TCGPlayer Article](https://tcgplayer.infinite.com/article/How-Many-Lands-Do-You-Need-to-Consistently-Hit-Your-Land-Drops/44ffb8b5-ae9b-45b4-b3d8-3ee9c9d2d0e5/)
- **Hypergeometric Distribution**: Exact probability calculations
- **Turn-by-Turn Analysis**: Precise mana curve optimization
- **Monte Carlo Simulations**: Advanced deck testing

### ✨ Key Features

- 🧮 **Advanced Math Engine** - Frank Karsten methodology implementation
- 🔒 **Privacy-First** - All data encrypted locally (AES-256)
- ⚡ **High Performance** - Web Workers + optimized bundle (202KB gzipped)
- 📱 **Mobile-First** - Responsive design + PWA installable
- 🎨 **Modern UI** - Material-UI with dark/light themes
- 🌐 **Zero-Config** - Works without any setup or registration

---

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Just visit **[https://manatuner-pro.vercel.app](https://manatuner-pro.vercel.app)** - no installation required!

### Option 2: Local Development

```bash
# Prerequisites: Node.js 18+
node --version  # Should be v18.0.0+

# Clone and setup
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro
npm install

# Start development server
npm run dev
# → Open http://localhost:3000

# Run tests (validates Frank Karsten math)
npm run test:unit
# → Should show: 9/9 tests passing
```

---

## 🏗️ Architecture

### Tech Stack
```
Frontend: React 18 + TypeScript + Material-UI
Build: Vite (ES2015 target)
Hosting: Vercel Edge Network
Database: Supabase (optional for cloud sync)
Storage: localStorage + AES encryption
Testing: Vitest + Playwright
CI/CD: GitHub Actions + Vercel
```

### Project Structure
```
src/
├── components/           # React components
│   ├── analysis/        # Analysis components
│   ├── common/          # Reusable UI components
│   └── layout/          # Layout and navigation
├── hooks/               # Custom React hooks
├── pages/               # Main application pages
├── services/            # Business logic and APIs
│   ├── advancedMaths.ts # Frank Karsten math engine
│   └── __tests__/       # Critical math tests
├── store/               # Redux store
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── lib/                 # Custom libraries
```

---

## 🧮 Frank Karsten Mathematics

### Core Formulas Implemented

#### Hypergeometric Distribution
```typescript
P(X = k) = C(K,k) × C(N-K,n-k) / C(N,n)
```
- **N**: Deck size (60)
- **K**: Mana sources in deck
- **n**: Cards seen (hand + draws)
- **k**: Sources needed

#### Turn-by-Turn Analysis
```typescript
cardsSeenOnTurn(turn: number, onPlay: boolean): number {
  return 7 + turn - (onPlay ? 1 : 0);
}
```

#### Fetchland Counting
Fetchlands count for **each color** they can search:
```typescript
// Scalding Tarn counts for both U and R
sources.blue += 1;
sources.red += 1;
```

### Karsten Recommendations

| Turn | Target Probability | Recommended Sources |
|------|-------------------|---------------------|
| T1   | 90%              | 14-15 sources       |
| T2   | 85%              | 17-18 sources       |
| T3   | 80%              | 20-21 sources       |
| T4   | 75%              | 22-23 sources       |

---

## 🔒 Privacy-First Architecture

### Core Principle
**No user data is sent by default.** Everything works locally with encryption.

### How It Works
```
User Input → Local Processing → AES-256 Encryption → localStorage
                    ↓
            (Optional) → Supabase Cloud Sync
```

### Features
- ✅ **Anonymous User Codes**: `MT-XXXX-XXXX-XXXX` format
- ✅ **Local Encryption**: AES-256 for all stored data
- ✅ **Optional Cloud**: Supabase sync with explicit consent
- ✅ **Export/Import**: Full data portability

---

## 🧪 Testing & Quality

### Test Suite
```bash
# Unit tests (Frank Karsten validation)
npm run test:unit          # 9/9 critical math tests

# End-to-end tests
npm run test:e2e           # Full user scenarios

# Performance tests
npm run test:performance   # Lighthouse audits

# All tests
npm test                   # Complete test suite
```

### Quality Metrics
- ✅ **Test Coverage**: 85%+ on critical code
- ✅ **Performance**: Lighthouse 90+ on all metrics
- ✅ **Accessibility**: WCAG AA compliant
- ✅ **Bundle Size**: 202KB gzipped
- ✅ **Build Time**: ~20 seconds

---

## 🚀 Deployment

### Current Deployment: Vercel

**Live URL**: https://manatuner-pro.vercel.app

### Configuration Files

#### `vercel.json`
```json
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

#### `vite.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  }
})
```

### Environment Variables (All Optional)
```bash
# Cloud sync (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Analytics (optional)
VITE_VERCEL_ANALYTICS_ID=your-analytics-id
```

### Deploy Your Own
```bash
# Fork this repository
# Connect to Vercel
# Automatic deployment on push to main

# Or manual deployment
npm run build
npx vercel --prod
```

---

## 📚 Documentation

### Complete Documentation Suite
1. **[COMPLETE_PROJECT_DOCUMENTATION.md](./COMPLETE_PROJECT_DOCUMENTATION.md)** - Full project overview
2. **[TECHNICAL_IMPLEMENTATION_GUIDE.md](./TECHNICAL_IMPLEMENTATION_GUIDE.md)** - Technical details with code examples
3. **[DEPLOYMENT_PRODUCTION_GUIDE.md](./DEPLOYMENT_PRODUCTION_GUIDE.md)** - Production deployment guide

### Quick References
- **[Frank Karsten Research](https://tcgplayer.infinite.com/article/How-Many-Lands-Do-You-Need-to-Consistently-Hit-Your-Land-Drops/44ffb8b5-ae9b-45b4-b3d8-3ee9c9d2d0e5/)** - Mathematical foundation
- **[Scryfall API](https://scryfall.com/docs/api)** - MTG card data
- **[Vercel Docs](https://vercel.com/docs)** - Deployment platform

---

## 🤝 Contributing

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Develop with tests
npm run test:unit
npm run lint

# Commit and push
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature

# Create Pull Request
# Automatic tests + review
# Merge to main = auto-deploy
```

### Guidelines
- ✅ **Tests Required**: All new features must have tests
- ✅ **Math Validation**: Critical math must pass Frank Karsten tests
- ✅ **TypeScript**: Strict typing enforced
- ✅ **Performance**: Bundle size and performance monitored

---

## 📊 Performance Metrics

### Current Stats
- **Bundle Size**: 739KB (202KB gzipped)
- **Build Time**: ~20 seconds
- **Lighthouse Score**: 90+ on all metrics
- **Test Suite**: 9/9 critical tests passing
- **Uptime**: 99.9% (Vercel SLA)

### Performance Features
- ✅ **Code Splitting**: Automatic by Vite
- ✅ **Web Workers**: Monte Carlo simulations
- ✅ **Service Worker**: PWA caching
- ✅ **CDN**: Global Vercel Edge Network
- ✅ **Compression**: Gzip + Brotli

---

## 🎯 Zero-to-Hero Setup

### For New Developers
Want to run this project from scratch? Here's the complete guide:

```bash
# 1. Prerequisites
node --version  # Must be 18+
git --version   # Any recent version

# 2. Clone and setup
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro
npm install

# 3. Verify everything works
npm run dev      # → http://localhost:3000
npm run test     # → 9/9 tests should pass
npm run build    # → Should complete without errors

# 4. Deploy to Vercel (optional)
# Fork repo → Connect to Vercel → Auto-deploy
```

### Validation Checklist
- ✅ **Local**: App loads on http://localhost:3000
- ✅ **Analyzer**: Can analyze a test deck
- ✅ **Math**: Tests pass (validates Frank Karsten formulas)
- ✅ **Build**: Production build completes
- ✅ **Deploy**: (Optional) Live on Vercel

---

## 🏆 Credits & Acknowledgments

- **[Frank Karsten](https://tcgplayer.infinite.com/author/Frank-Karsten)** - Mathematical research foundation
- **[Charles Wickham](https://github.com/WickedFridge/magic-project-manabase)** - Original Project Manabase inspiration
- **[Scryfall](https://scryfall.com/)** - MTG card data API
- **MTG Community** - Continuous feedback and testing

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **🚀 Live Demo**: [https://manatuner-pro.vercel.app](https://manatuner-pro.vercel.app)
- **📖 Documentation**: [Complete Project Docs](./COMPLETE_PROJECT_DOCUMENTATION.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/gbordes77/manatuner-pro/issues)
- **💡 Discussions**: [GitHub Discussions](https://github.com/gbordes77/manatuner-pro/discussions)

---

**🎉 Ready to optimize your manabase with mathematical precision? [Start analyzing now!](https://manatuner-pro.vercel.app)**

// Trigger redeploy: 2025-06-28 