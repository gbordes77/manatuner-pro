# 🚀 Guide de Déploiement Production - ManaTuner Pro

## 🎯 Vue d'ensemble

ManaTuner Pro est déployé sur **Vercel** avec une architecture React + TypeScript + Vite. Ce guide couvre tous les aspects du déploiement en production.

### ✅ Status Actuel
- **🌐 Production Live** : https://manatuner-pro.vercel.app
- **📦 Plateforme** : Vercel (pas Firebase)
- **🔧 Framework** : Vite + React 18 + TypeScript
- **🗃️ Base de données** : Supabase (optionnel pour cloud sync)

---

## 📋 Checklist de Déploiement

### ✅ Pré-déploiement
- [ ] Tests mathématiques passent (9/9) : `npm run test:unit`
- [ ] Build de production réussit : `npm run build`
- [ ] Aucune erreur TypeScript : `npm run type-check`
- [ ] Lint clean : `npm run lint`
- [ ] Variables d'environnement configurées

### ✅ Déploiement Vercel
- [ ] Push sur branche `main`
- [ ] Déploiement automatique via GitHub
- [ ] Tests de fumée sur production
- [ ] Monitoring activé

---

## 🔧 Configuration Vercel Complète

### vercel.json (Déjà configuré)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/workers/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Variables d'Environnement Vercel

#### Variables Obligatoires (Aucune)
Le projet fonctionne **100% en mode privacy-first** sans variables d'environnement.

#### Variables Optionnelles (Cloud Sync)
Si vous voulez activer la synchronisation cloud :

```bash
# Supabase (optionnel)
VITE_SUPABASE_URL=https://lcrzwjkbzbxanvmcjzst.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Analytics (optionnel)
VITE_VERCEL_ANALYTICS_ID=your-analytics-id
```

---

## 📦 Configuration Build (vite.config.js)

Le projet utilise une configuration Vite optimisée :

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

---

## 🚀 Processus de Déploiement

### 1. Déploiement Automatique (Recommandé)

```bash
# 1. Développement local
git checkout -b feature/nouvelle-fonctionnalité
# ... développement ...
npm run test
npm run build

# 2. Push vers GitHub
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalité

# 3. Pull Request
# Créer une PR sur GitHub
# Les tests s'exécutent automatiquement

# 4. Merge vers main
# Le déploiement se fait automatiquement sur Vercel
```

### 2. Déploiement Manuel

```bash
# Installation Vercel CLI
npm install -g vercel

# Login
vercel login

# Déploiement
npm run build
vercel --prod
```

---

## 🔒 Sécurité Production

### Headers de Sécurité (Configurés)
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY` 
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ HTTPS automatique par Vercel
- ✅ CORS configuré pour Web Workers

### Privacy-First Architecture
- ✅ **Aucune donnée utilisateur** envoyée par défaut
- ✅ **Chiffrement AES-256** pour stockage local
- ✅ **Codes utilisateur anonymes** générés localement
- ✅ **Mode cloud optionnel** avec consentement explicite

---

## 📊 Monitoring et Performance

### Métriques Actuelles
- ✅ **Bundle Size** : 739KB (202KB gzipped)
- ✅ **Build Time** : ~20 secondes
- ✅ **Tests** : 9/9 mathématiques passent
- ✅ **Lighthouse Score** : 90+ sur tous les critères

### Monitoring Vercel
```bash
# Voir les logs de déploiement
vercel logs

# Analytics (si configuré)
# Vercel Dashboard > Analytics
```

---

## 🧪 Tests et Validation

### Tests Pré-déploiement
```bash
# Tests unitaires (critiques)
npm run test:unit

# Tests mathématiques Frank Karsten
npm run test:math

# Tests end-to-end
npm run test:e2e

# Vérification TypeScript
npm run type-check

# Linting
npm run lint
```

### Tests Post-déploiement
```bash
# Test rapide des fonctionnalités critiques
# 1. Page d'accueil charge
# 2. Analyseur fonctionne
# 3. Calculs mathématiques corrects
# 4. Responsive mobile
# 5. Mode sombre/clair
```

---

## 🚨 Rollback et Recovery

### Procédure de Rollback Vercel
```bash
# Via Dashboard Vercel
# 1. Aller dans Deployments
# 2. Cliquer sur un déploiement précédent
# 3. "Promote to Production"

# Via CLI
vercel rollback [deployment-url]
```

### Monitoring des Erreurs
- **Console Browser** : Vérifier les erreurs JavaScript
- **Vercel Logs** : Erreurs de build et runtime
- **GitHub Actions** : Status des tests automatiques

---

## 📱 PWA et Performance

### Fonctionnalités PWA (Activées)
- ✅ **Service Worker** avec cache intelligent
- ✅ **Offline-ready** pour analyses locales
- ✅ **Installable** sur mobile et desktop
- ✅ **Responsive** mobile-first

### Optimisations Performance
- ✅ **Code Splitting** automatique par Vite
- ✅ **Lazy Loading** des composants lourds
- ✅ **Web Workers** pour calculs mathématiques
- ✅ **Compression Gzip** par Vercel
- ✅ **CDN Global** Vercel Edge Network

---

## 🔧 Configuration Domaine Personnalisé

### Ajouter un Domaine
```bash
# Via Vercel Dashboard
# 1. Project Settings > Domains
# 2. Add Domain : manatuner.pro
# 3. Configurer DNS selon instructions Vercel

# DNS Configuration
# CNAME: www -> cname.vercel-dns.com
# A: @ -> 76.76.19.61 (IP Vercel)
```

---

## 📋 Checklist Post-Déploiement

### ✅ Fonctionnalités Critiques
- [ ] **Page d'accueil** : Animations et navigation
- [ ] **Analyseur** : Calculs mathématiques corrects
- [ ] **Frank Karsten** : Liens cliquables vers TCGPlayer
- [ ] **Modes** : Sombre/clair fonctionnels
- [ ] **Mobile** : Interface responsive
- [ ] **PWA** : Installation possible
- [ ] **Performance** : Chargement < 3 secondes
- [ ] **Sécurité** : HTTPS et headers configurés

### ✅ Tests Utilisateur
- [ ] **Deck Standard** : Analyse complète
- [ ] **Deck Multicolore** : Recommandations correctes
- [ ] **Mobile** : Interface utilisable
- [ ] **Partage** : URLs fonctionnelles
- [ ] **Sauvegarde** : Mode privacy-first

---

## 🆘 Support et Dépannage

### Problèmes Courants

**Site ne charge pas**
```bash
# Vérifier build local
npm run build
npm run preview

# Vérifier logs Vercel
vercel logs
```

**Erreurs JavaScript**
```bash
# Console navigateur F12
# Vérifier erreurs réseau et JavaScript
```

**Performance dégradée**
```bash
# Lighthouse audit
npx lighthouse https://manatuner-pro.vercel.app

# Bundle analyzer
npm run build:analyze
```

### Contacts
- **Repository** : https://github.com/gbordes77/manatuner-pro
- **Issues** : GitHub Issues pour bugs
- **Vercel Support** : Dashboard Vercel > Help

---

## 🎯 Résumé Architecture

```
GitHub Repository
       ↓
   Push to main
       ↓
GitHub Actions (CI/CD)
       ↓
   Vercel Build
       ↓
   Global CDN Deploy
       ↓
https://manatuner-pro.vercel.app
```

**Stack Technique :**
- **Frontend** : React 18 + TypeScript + Material-UI
- **Build** : Vite (ES2015 target)
- **Hosting** : Vercel Edge Network
- **Database** : Supabase (optionnel)
- **Storage** : localStorage + AES encryption

---

🎉 **ManaTuner Pro est maintenant production-ready avec une architecture moderne et sécurisée !** 