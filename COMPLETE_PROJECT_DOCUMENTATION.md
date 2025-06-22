# 📖 ManaTuner Pro - Documentation Complète du Projet

## 🎯 Vue d'Ensemble du Projet

### Objectif Principal
**ManaTuner Pro** est un analyseur de manabase avancé pour Magic: The Gathering (MTG) qui permet aux joueurs d'optimiser leurs decks en calculant les probabilités mathématiques précises d'avoir le bon mana au bon moment.

### Problématique Résolue
- **Problème** : Les joueurs de MTG construisent souvent des manabases inefficaces par intuition
- **Solution** : Calculs mathématiques précis basés sur la méthodologie de Frank Karsten (expert reconnu)
- **Valeur ajoutée** : Recommandations concrètes pour optimiser les performances compétitives

### Public Cible
- Joueurs compétitifs de Magic: The Gathering
- Constructeurs de decks professionnels
- Communauté MTG recherchant l'optimisation mathématique

---

## 🔬 Fondements Mathématiques

### Méthodologie Frank Karsten
Le projet se base sur l'article de référence : [How Many Sources Do You Need to Consistently Cast Your Spells - A 2022 Update](https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/)

### Concepts Mathématiques Clés

#### 1. Distribution Hypergéométrique
```typescript
// Formule de base pour calculer P(X ≥ k)
P(X ≥ k) = 1 - Σ(i=0 to k-1) [C(K,i) * C(N-K,n-i)] / C(N,n)

// Où :
// N = taille totale du deck (60 cartes)
// K = nombre de sources de mana d'une couleur
// n = nombre de cartes vues (main + tours)
// k = nombre minimum de sources nécessaires
```

#### 2. Analyse Turn-by-Turn
- **Turn 1** : 7 cartes vues (main initiale)
- **Turn 2** : 8 cartes vues (7 + 1 pioche)
- **Turn T** : 6 + T cartes vues (avec mulligan à 6)

#### 3. Gestion des Mulligans
```typescript
// Probabilité avec mulligans
P_final = P_7cards * (1-mulligan_rate) + P_6cards * mulligan_rate
```

#### 4. Terres Spéciales
- **Fetchlands** : Comptent pour chaque couleur qu'elles peuvent chercher
- **Dual lands** : Sources multiples selon leurs capacités
- **Utility lands** : Analysées séparément

### Constantes Mathématiques Critiques
```typescript
export const MAGIC_CONSTANTS = {
  DECK_SIZE: 60,
  STARTING_HAND_SIZE: 7,
  MULLIGAN_HAND_SIZE: 6,
  RECOMMENDED_THRESHOLDS: {
    TURN_1: 0.90, // 90% de chance turn 1
    TURN_2: 0.85, // 85% de chance turn 2
    TURN_3: 0.80, // 80% de chance turn 3
  }
}
```

---

## 🏗️ Architecture Technique

### Stack Technologique
```json
{
  "frontend": {
    "framework": "React 18 + TypeScript",
    "ui": "Material-UI (MUI) v5",
    "bundler": "Vite 4.5",
    "charts": "Recharts",
    "state": "Redux Toolkit"
  },
  "backend": {
    "runtime": "Node.js",
    "api": "Next.js API Routes",
    "validation": "Zod schemas",
    "security": "Rate limiting + CORS"
  },
  "deployment": {
    "platform": "Vercel",
    "cdn": "Vercel Edge Network",
    "monitoring": "Vercel Analytics"
  },
  "performance": {
    "workers": "Web Workers (Monte Carlo)",
    "optimization": "Code splitting + lazy loading",
    "caching": "Intelligent memoization"
  }
}
```

### Structure du Projet
```
Project Mana base V2/
├── src/
│   ├── components/           # Composants React réutilisables
│   │   ├── analysis/        # Composants d'analyse avancée
│   │   ├── common/          # Composants UI génériques
│   │   ├── layout/          # Structure de page
│   │   └── performance/     # Optimisations de performance
│   ├── hooks/               # React hooks personnalisés
│   ├── lib/                 # Utilitaires et validations
│   ├── pages/               # Pages de l'application
│   ├── services/            # Services métier et calculs
│   ├── store/               # State management Redux
│   ├── types/               # Définitions TypeScript
│   └── utils/               # Fonctions utilitaires
├── public/
│   └── workers/             # Web Workers pour calculs lourds
├── tests/                   # Suite de tests complète
└── docs/                    # Documentation technique
```

### Composants Clés

#### 1. Moteur de Calcul (`src/services/advancedMaths.ts`)
```typescript
export class AdvancedMathEngine {
  // Distribution hypergéométrique avec optimisations
  static hypergeometric(N: number, K: number, n: number, k: number): number
  
  // Analyse turn-by-turn complète
  static analyzeTurnByTurn(deck: DeckConfiguration): TurnAnalysis[]
  
  // Simulations Monte Carlo (10,000+ itérations)
  static monteCarloSimulation(params: MonteCarloParams): MonteCarloResult
  
  // Recommandations selon Frank Karsten
  static generateKarstenRecommendations(analysis: ProbabilityResult): KarstenRecommendation[]
}
```

#### 2. Détection Intelligente des Terres (`src/utils/landDetectionComplete.ts`)
```typescript
export const detectLandTypes = (cardName: string): LandType[] => {
  // Algorithme de reconnaissance par patterns
  // - Fetchlands : "Scalding Tarn", "Polluted Delta"
  // - Shocklands : "Steam Vents", "Watery Grave"  
  // - Checklands : "Dragonskull Summit"
  // - Fastlands : "Seachrome Coast"
  // - Painlands : "Underground River"
}
```

#### 3. Validation Sécurisée (`src/lib/validations.ts`)
```typescript
// Schemas Zod pour validation complète
export const DeckSchema = z.object({
  cards: z.array(CardSchema).min(40).max(250),
  format: FormatSchema,
  name: z.string().min(1).max(100),
  colors: z.array(ManaColorSchema)
})
```

### Sécurité et Performance

#### Rate Limiting
```typescript
// src/middleware/rateLimiting.ts
export const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  skipSuccessfulRequests: false,
  skipFailedRequests: false
}
```

#### Web Workers
```javascript
// public/workers/monteCarlo.worker.js
// Calculs Monte Carlo en arrière-plan
// Évite le blocage de l'interface utilisateur
```

---

## 🎨 Interface Utilisateur et UX

### Design System
- **Thème** : Material Design avec personnalisation MTG
- **Couleurs** : Palette inspirée des couleurs de mana
- **Typographie** : Inter font pour la lisibilité
- **Responsive** : Mobile-first design

### Fonctionnalités UX Avancées
1. **Progressive Disclosure** : Affichage progressif de la complexité
2. **Feedback Temps Réel** : Calculs instantanés pendant la saisie
3. **Visualisations Interactives** : Graphiques Recharts dynamiques
4. **Mode Sombre/Clair** : Thème adaptatif avec persistance
5. **Accessibilité** : Conformité WCAG AA

### Pages Principales
- **HomePage** : Présentation et démarrage rapide
- **AnalyzerPage** : Interface d'analyse principale
- **GuidePage** : Documentation utilisateur
- **PrivacyFirstPage** : Gestion de la confidentialité

---

## 🔒 Architecture Privacy-First

### Philosophie
- **Aucune donnée utilisateur** stockée sur serveur
- **Chiffrement côté client** pour les données sensibles
- **Codes personnels** pour identification anonyme
- **Stockage local** avec options d'export/import

### Implémentation
```typescript
// src/lib/privacy.ts
export class PrivacyStorage {
  static generateUserCode(): string // "BLUE-DECK-42"
  static encryptData(data: any): string
  static decryptData(encrypted: string): any
  static exportAnalyzes(): Blob
  static importAnalyzes(file: File): Promise<Analysis[]>
}
```

---

## 🧪 Tests et Qualité

### Suite de Tests
```bash
# Tests mathématiques critiques
npm run test:math

# Tests d'interface utilisateur
npm run test:ui

# Tests end-to-end
npm run test:e2e

# Tests de performance
npm run test:perf
```

### Validation Mathématique
```typescript
// src/services/__tests__/maths.critical.test.ts
describe('Frank Karsten Validation', () => {
  test('Hypergeometric matches reference values', () => {
    // Validation contre les valeurs de référence de l'article
    expect(hypergeometric(60, 24, 7, 2)).toBeCloseTo(0.8324, 4)
  })
})
```

---

## 🚀 Déploiement et Infrastructure

### Configuration Vercel
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
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

### Variables d'Environnement
```bash
# .env.example
VITE_APP_NAME=ManaTuner Pro
VITE_API_BASE_URL=https://manatuner-pro.vercel.app
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Pipeline CI/CD
1. **Push sur main** → Déploiement automatique Vercel
2. **Pull Request** → Preview deployment + tests
3. **Release** → Production deployment + monitoring

---

## 🛠️ Guide de Développement

### Prérequis
```bash
# Versions requises
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.30.0
```

### Installation Complète
```bash
# 1. Cloner le repository
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local

# 4. Lancer le serveur de développement
npm run dev

# 5. Lancer les tests
npm run test

# 6. Build de production
npm run build
```

### Scripts Disponibles
```json
{
  "dev": "vite",                    // Serveur de développement
  "build": "vite build",           // Build de production
  "preview": "vite preview",       // Preview du build
  "test": "vitest",                // Tests unitaires
  "test:ui": "vitest --ui",        // Interface de test
  "test:e2e": "playwright test",   // Tests end-to-end
  "lint": "eslint src",            // Linting
  "type-check": "tsc --noEmit"     // Vérification TypeScript
}
```

### Workflow de Développement
1. **Feature Branch** : `git checkout -b feature/nouvelle-fonctionnalite`
2. **Développement** : Code + tests + documentation
3. **Tests Locaux** : `npm run test && npm run build`
4. **Pull Request** : Review + tests automatiques
5. **Merge** : Déploiement automatique

---

## 🔧 Redémarrage à Zéro

### Checklist Complète
Si vous devez redémarrer le projet from scratch :

#### 1. Setup Initial
```bash
# Créer nouveau projet Vite + React + TypeScript
npm create vite@latest manatuner-pro -- --template react-ts
cd manatuner-pro
npm install

# Ajouter les dépendances essentielles
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install @reduxjs/toolkit react-redux
npm install recharts
npm install zod
npm install react-router-dom
```

#### 2. Structure de Base
```bash
# Créer l'architecture de dossiers
mkdir -p src/{components,hooks,lib,pages,services,store,types,utils}
mkdir -p src/components/{analysis,common,layout,performance}
mkdir -p public/workers
mkdir -p tests/{unit,e2e,fixtures}
```

#### 3. Fichiers Critiques à Recréer
1. **`src/services/advancedMaths.ts`** - Moteur mathématique Frank Karsten
2. **`src/types/maths.ts`** - Types TypeScript pour les calculs
3. **`src/lib/validations.ts`** - Schemas Zod de validation
4. **`src/utils/landDetectionComplete.ts`** - Détection des terres
5. **`src/lib/privacy.ts`** - Système privacy-first

#### 4. Configuration Essentielle
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['recharts']
  },
  build: {
    target: 'es2015',
    sourcemap: false
  }
})
```

#### 5. Tests de Validation
```typescript
// Créer immédiatement les tests mathématiques
// pour valider l'implémentation Frank Karsten
describe('Mathematical Validation', () => {
  test('Hypergeometric reference values', () => {
    // Tests contre les valeurs de l'article TCGPlayer
  })
})
```

---

## 📊 Métriques et Monitoring

### KPIs Techniques
- **Performance** : LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Qualité** : Coverage > 80%, 0 erreurs TypeScript
- **Sécurité** : Aucune vulnérabilité critique

### Métriques Utilisateur
- **Engagement** : Temps passé sur l'analyseur
- **Conversion** : Analyses complétées vs abandonnées
- **Satisfaction** : Feedback utilisateur

### Outils de Monitoring
- **Vercel Analytics** : Performance et usage
- **Sentry** : Error tracking et debugging
- **Lighthouse** : Audits de performance automatiques

---

## 🤝 Contribution et Maintenance

### Guidelines de Contribution
1. **Code Style** : ESLint + Prettier configurés
2. **Commits** : Convention Conventional Commits
3. **Tests** : Couverture obligatoire pour nouvelles fonctionnalités
4. **Documentation** : Mise à jour systématique

### Maintenance Régulière
- **Dépendances** : Mise à jour mensuelle
- **Sécurité** : Audit hebdomadaire avec `npm audit`
- **Performance** : Monitoring continu Lighthouse
- **Tests** : Validation quotidienne des calculs mathématiques

---

## 🔗 Ressources et Références

### Documentation Technique
- [Frank Karsten Article](https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/)
- [Hypergeometric Distribution](https://en.wikipedia.org/wiki/Hypergeometric_distribution)
- [MTG Comprehensive Rules](https://magic.wizards.com/en/rules)

### Outils de Développement
- [Vite Documentation](https://vitejs.dev/)
- [Material-UI](https://mui.com/)
- [Recharts](https://recharts.org/)
- [Vercel Platform](https://vercel.com/)

### Communauté MTG
- [MTG Salvation](https://www.mtgsalvation.com/)
- [EDHRec](https://edhrec.com/)
- [Scryfall API](https://scryfall.com/docs/api)

---

## 📋 Résumé Exécutif

**ManaTuner Pro** est un projet techniquement solide qui combine :
- **Excellence mathématique** : Implémentation fidèle de Frank Karsten
- **Architecture moderne** : React + TypeScript + Vercel
- **UX exceptionnelle** : Interface intuitive et performante
- **Sécurité privacy-first** : Aucune donnée utilisateur stockée
- **Qualité industrielle** : Tests complets + monitoring

Le projet est **prêt pour la production** et peut être maintenu/étendu par n'importe quel développeur suivant cette documentation.

---

*Documentation générée le 22 juin 2025 - Version 2.0.1*
*Projet ManaTuner Pro - Analyseur de Manabase Avancé pour Magic: The Gathering* 