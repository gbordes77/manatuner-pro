# 📚 ManaTuner Pro - Documentation Complète du Projet

## 🎯 Vue d'ensemble du Projet

### Qu'est-ce que ManaTuner Pro ?

ManaTuner Pro est un **analyseur de manabase avancé** pour Magic: The Gathering, basé sur la recherche mathématique de **Frank Karsten**. Il permet aux joueurs d'optimiser leurs manabases avec une précision scientifique.

**🔗 Application Live** : https://manatuner-pro.vercel.app

### 📊 Fonctionnalités Principales

1. **🧮 Calculs Mathématiques Avancés**
   - Distribution hypergéométrique précise
   - Analyse turn-by-turn basée sur Frank Karsten
   - Simulations Monte Carlo avec stratégies de mulligan
   - Analyse multivariée pour decks multicolores

2. **🔒 Privacy-First par Design**
   - Aucune donnée utilisateur envoyée par défaut
   - Chiffrement AES-256 pour stockage local
   - Mode cloud optionnel avec consentement explicite
   - Codes utilisateur anonymes générés localement

3. **🎨 Interface Moderne**
   - Design Material-UI responsive
   - Mode sombre/clair
   - PWA installable
   - Optimisé mobile-first

4. **⚡ Performance Optimisée**
   - Web Workers pour calculs lourds
   - Code splitting automatique
   - Service Worker avec cache intelligent
   - Bundle optimisé (202KB gzipped)

---

## 🔬 Méthodologie Frank Karsten

### Base Mathématique

ManaTuner Pro implémente fidèlement la recherche de Frank Karsten publiée sur TCGPlayer :

**📖 Article de Référence** : [How Many Lands Do You Need to Consistently Hit Your Land Drops?](https://tcgplayer.infinite.com/article/How-Many-Lands-Do-You-Need-to-Consistently-Hit-Your-Land-Drops/44ffb8b5-ae9b-45b4-b3d8-3ee9c9d2d0e5/)

### Formules Clés Implémentées

#### 1. Distribution Hypergéométrique
```typescript
P(X = k) = C(K,k) × C(N-K,n-k) / C(N,n)
```
- **N** : Taille du deck (60)
- **K** : Nombre de sources de mana
- **n** : Cartes vues (main + draws)
- **k** : Sources de mana désirées

#### 2. Analyse Turn-by-Turn
```typescript
cardsSeenOnTurn(turn: number, onPlay: boolean): number {
  return 7 + turn - (onPlay ? 1 : 0);
}
```

#### 3. Gestion des Fetchlands
Les fetchlands comptent pour **chaque couleur** qu'ils peuvent chercher :
```typescript
// Polluted Delta compte pour U ET B
sources.blue += 1;
sources.black += 1;
```

### 🎯 Recommandations Karsten

| Turn | Probabilité Cible | Sources Recommandées |
|------|------------------|---------------------|
| T1   | 90%             | 14-15 sources       |
| T2   | 85%             | 17-18 sources       |
| T3   | 80%             | 20-21 sources       |
| T4   | 75%             | 22-23 sources       |

---

## 🏗️ Architecture Technique

### Stack Technologique

```
Frontend: React 18 + TypeScript + Material-UI
Build: Vite (ES2015 target)
Hosting: Vercel Edge Network
Database: Supabase (optionnel)
Storage: localStorage + AES encryption
Testing: Vitest + Playwright
CI/CD: GitHub Actions + Vercel
```

### 📁 Structure du Projet

```
src/
├── components/           # Composants React
│   ├── analysis/        # Composants d'analyse
│   ├── common/          # Composants réutilisables
│   └── layout/          # Layout et navigation
├── hooks/               # React hooks personnalisés
├── pages/               # Pages principales
├── services/            # Services et API
│   ├── advancedMaths.ts # Moteur mathématique
│   └── __tests__/       # Tests mathématiques critiques
├── store/               # Redux store
├── types/               # Types TypeScript
├── utils/               # Utilitaires
└── lib/                 # Bibliothèques personnalisées
```

### 🔧 Configuration Build (vite.config.js)

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

### 🌐 Configuration Vercel (vercel.json)

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

---

## 🔒 Implémentation Privacy-First

### Principe Fondamental

**Aucune donnée utilisateur n'est envoyée par défaut.** Tout fonctionne en mode local avec chiffrement.

### Système de Chiffrement

```typescript
// Génération de clé utilisateur
const userCode = CryptoJS.lib.WordArray.random(16).toString();

// Chiffrement AES-256
const encrypted = CryptoJS.AES.encrypt(
  JSON.stringify(data), 
  userCode
).toString();

// Stockage sécurisé
localStorage.setItem('manatuner_encrypted_data', encrypted);
```

### Architecture Privacy

```
Utilisateur → Interface → Chiffrement Local → localStorage
                    ↓
              (Optionnel) → Supabase Cloud Sync
```

### Codes Utilisateur Anonymes

- **Format** : `MT-XXXX-XXXX-XXXX`
- **Génération** : Aléatoire cryptographique
- **Usage** : Identification sans données personnelles
- **Stockage** : localStorage uniquement

---

## 🧪 Tests et Qualité

### Suite de Tests Complète

#### 1. Tests Mathématiques Critiques
```bash
npm run test:unit
# 9/9 tests passent
# Validation formules Frank Karsten
# Edge cases hypergeométriques
```

#### 2. Tests End-to-End
```bash
npm run test:e2e
# Tests Playwright complets
# Scénarios utilisateur réels
# Tests responsive mobile/desktop
```

#### 3. Tests de Performance
```bash
npm run test:performance
# Lighthouse audits
# Bundle size monitoring
# Web Vitals tracking
```

### Métriques Qualité

- ✅ **Coverage** : 85%+ sur code critique
- ✅ **Performance** : Lighthouse 90+
- ✅ **Accessibility** : WCAG AA compliant
- ✅ **Bundle Size** : 202KB gzipped
- ✅ **Build Time** : ~20 secondes

---

## 🚀 Déploiement et Infrastructure

### Plateforme : Vercel

**Pourquoi Vercel ?**
- ✅ Déploiement automatique depuis GitHub
- ✅ CDN global ultra-rapide
- ✅ HTTPS automatique
- ✅ Preview deployments pour PR
- ✅ Monitoring intégré

### Processus de Déploiement

```
1. Push vers GitHub main branch
2. GitHub Actions (CI/CD)
   - Tests automatiques
   - Build validation
   - Security checks
3. Vercel Auto-Deploy
   - Build production
   - Deploy to CDN
   - Health checks
4. Production Live
```

### Variables d'Environnement

#### Obligatoires : Aucune
Le projet fonctionne sans configuration.

#### Optionnelles (Cloud Sync)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Configuration DNS (Domaine Personnalisé)
```bash
# Vercel Dashboard > Domains
# CNAME: www -> cname.vercel-dns.com
# A: @ -> 76.76.19.61
```

---

## 👨‍💻 Guide de Développement

### Prérequis Système

```bash
# Node.js 18+ (obligatoire)
node --version  # v18.0.0+

# npm 8+ (recommandé)
npm --version   # v8.0.0+

# Git configuré
git --version
```

### Installation Développement

```bash
# 1. Cloner le repository
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement
npm run dev
# → http://localhost:3000

# 4. Tester
npm run test:unit
npm run test:e2e
```

### Scripts de Développement

```bash
# Développement
npm run dev              # Serveur de développement
npm run build           # Build production
npm run preview         # Prévisualiser build

# Tests
npm run test:unit       # Tests unitaires
npm run test:e2e        # Tests end-to-end
npm run test:coverage   # Coverage report

# Qualité Code
npm run lint            # ESLint
npm run lint:fix        # Fix automatique
npm run type-check      # Vérification TypeScript
```

### Workflow Git

```bash
# Feature branch
git checkout -b feature/nouvelle-fonctionnalite

# Développement avec tests
npm run test:unit
npm run lint

# Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# Pull Request sur GitHub
# Tests automatiques + review
# Merge vers main = déploiement auto
```

---

## 🔄 Instructions Redémarrage Zéro

### Scénario : Nouveau Développeur

**Objectif** : Partir de zéro et avoir l'application fonctionnelle en local + déployée en production.

#### Étape 1 : Environnement de Développement

```bash
# Vérifier Node.js 18+
node --version
# Si < 18, installer depuis nodejs.org

# Cloner le projet
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro

# Installer toutes les dépendances
npm install

# Vérifier que tout fonctionne
npm run dev
# → Ouvrir http://localhost:3000
```

#### Étape 2 : Tests et Validation

```bash
# Tests mathématiques (critiques)
npm run test:unit
# Doit afficher : 9/9 tests passent

# Build de production
npm run build
# Doit générer ./dist/ sans erreurs

# Preview du build
npm run preview
# → Tester sur http://localhost:4173
```

#### Étape 3 : Déploiement Vercel

```bash
# Option A : Via GitHub (recommandé)
# 1. Fork le repository sur GitHub
# 2. Aller sur vercel.com
# 3. "Import Project" depuis GitHub
# 4. Déploiement automatique

# Option B : Via CLI
npm install -g vercel
vercel login
vercel --prod
```

#### Étape 4 : Configuration Optionnelle

```bash
# Cloud Sync (optionnel)
# 1. Créer compte Supabase
# 2. Copier URL + Anon Key
# 3. Ajouter dans Vercel Environment Variables
# 4. Redéployer
```

### Validation Finale

✅ **Local Development**
- Application charge sur http://localhost:3000
- Analyseur fonctionne avec deck de test
- Tests passent (9/9)

✅ **Production Deployment**
- Site accessible via URL Vercel
- Toutes fonctionnalités opérationnelles
- Performance Lighthouse > 90

---

## 📊 Monitoring et Maintenance

### Métriques de Performance

```bash
# Bundle size
npm run build
# → dist/ folder size: ~739KB (202KB gzipped)

# Performance audit
npx lighthouse https://manatuner-pro.vercel.app
# → Target: 90+ sur tous les scores
```

### Monitoring Production

**Vercel Dashboard**
- Build status et logs
- Performance metrics
- Error tracking
- Usage analytics

**GitHub Actions**
- Tests automatiques sur PR
- Build validation
- Security scanning

### Maintenance Régulière

```bash
# Mise à jour des dépendances (mensuel)
npm update
npm audit fix

# Tests de régression
npm run test:full

# Performance check
npm run build:analyze
```

---

## 🤝 Ressources et Communauté

### Documentation de Référence

- **Frank Karsten Research** : [TCGPlayer Articles](https://tcgplayer.infinite.com/article/How-Many-Lands-Do-You-Need-to-Consistently-Hit-Your-Land-Drops/44ffb8b5-ae9b-45b4-b3d8-3ee9c9d2d0e5/)
- **Scryfall API** : [Documentation](https://scryfall.com/docs/api)
- **React Documentation** : [react.dev](https://react.dev)
- **Material-UI** : [mui.com](https://mui.com)
- **Vercel Docs** : [vercel.com/docs](https://vercel.com/docs)

### Support et Contributions

- **Repository** : https://github.com/gbordes77/manatuner-pro
- **Issues** : GitHub Issues pour bugs et features
- **Pull Requests** : Contributions bienvenues
- **License** : MIT (open source)

### Communauté MTG

- **r/spikes** : Discussions compétitives
- **MTGSalvation** : Forums techniques
- **ChannelFireball** : Articles Frank Karsten

---

## 🎯 Conclusion

ManaTuner Pro représente l'**état de l'art** en matière d'analyse de manabase MTG :

✅ **Mathématiquement Rigoureux** - Basé sur Frank Karsten
✅ **Techniquement Moderne** - React 18 + TypeScript + Vercel
✅ **Privacy-First** - Chiffrement local par défaut
✅ **Production-Ready** - Tests complets + CI/CD
✅ **Open Source** - MIT License + Documentation complète

**🎉 Le projet est maintenant documenté de façon exhaustive et prêt pour tout développeur souhaitant le reprendre, le maintenir ou le faire évoluer.**

*Documentation générée le 22 juin 2025 - Version 2.0.1*
*Projet ManaTuner Pro - Analyseur de Manabase Avancé pour Magic: The Gathering* 