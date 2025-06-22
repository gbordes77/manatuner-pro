# 📋 Journal de Déploiement - ManaTuner Pro

## 🎯 Contexte
- **Projet** : ManaTuner Pro - Analyseur de manabase MTG
- **Repository** : https://github.com/gbordes77/manatuner-pro
- **Déploiement** : Vercel (https://vercel.com/gbordes77s-projects)
- **Date** : 21 Juin 2025
- **Environnement** : Node.js v24.2.0, npm v11.3.0, macOS

---

## 🚨 PROBLÈME MAJEUR IDENTIFIÉ

### **Symptôme**
Application bloquée sur écran "Loading ManaTuner Pro..." - Ne charge jamais l'interface principale sur Vercel, mais fonctionne parfaitement en local.

### **Cause Racine Identifiée**
Analyse des commits GitHub et comparaison local/production révèle **3 problèmes critiques** :

1. **Web Workers avec chemins absolus** - Ne fonctionnent pas sur Vercel
2. **Configuration Vite sur-optimisée** - Chunking manuel cassant la compatibilité
3. **Absence de configuration Vercel** - Pas de SPA routing ni headers CORS

---

## 🔍 ANALYSE DÉTAILLÉE DES ERREURS

### 1. **Problème Web Workers** ⚠️ **CRITIQUE**

**❌ Code Problématique :**
```javascript
// Dans useManaCalculations.ts et useMonteCarloWorker.ts
const worker = new Worker('/workers/manaCalculator.worker.js');
const worker = new Worker('/workers/monteCarlo.worker.js');
```

**✅ Solution Appliquée :**
```javascript
// Utilisation de new URL() pour compatibilité Vercel
const worker = new Worker(new URL('/workers/manaCalculator.worker.js', import.meta.url));
const worker = new Worker(new URL('/workers/monteCarlo.worker.js', import.meta.url));
```

**Explication :** Les chemins absolus ne sont pas résolus correctement sur Vercel. La syntaxe `new URL()` permet à Vite de traiter correctement les workers en production.

### 2. **Configuration Vite Sur-optimisée** ⚠️ **CRITIQUE**

**❌ Configuration Problématique :**
```javascript
// vite.config.ts - AVANT
build: {
  target: 'esnext',
  sourcemap: true,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        material: ['@mui/material', '@mui/icons-material'],
        // ... chunking manuel complexe
      }
    }
  }
}
```

**✅ Configuration Simplifiée :**
```javascript
// vite.config.ts - APRÈS
build: {
  target: 'es2015',        // Compatible avec plus de navigateurs
  sourcemap: false,        // Pas de sourcemap en production
  rollupOptions: {
    output: {
      manualChunks: undefined  // Laisser Vite gérer automatiquement
    }
  }
}
```

**Explication :** Le chunking manuel peut causer des problèmes de dépendances circulaires sur Vercel. La configuration automatique est plus stable.

### 3. **Configuration Vercel Manquante**

**✅ Nouveau fichier `vercel.json` :**
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
    }
  ]
}
```

**Explication :** Nécessaire pour le routing SPA et les headers CORS pour les Web Workers.

---

## 🛠️ CHRONOLOGIE DES CORRECTIONS

### **Étape 1 : Diagnostic** ✅
- Identification du commit problématique via GitHub
- Test local vs production
- Analyse des logs de build Vercel

### **Étape 2 : Correction Web Workers** ✅
- Modification de `src/hooks/useManaCalculations.ts`
- Modification de `src/hooks/useMonteCarloWorker.ts` (2 occurrences)
- Test local réussi

### **Étape 3 : Simplification Vite Config** ✅
- Changement `target: 'esnext'` → `'es2015'`
- Suppression du chunking manuel
- Désactivation des sourcemaps

### **Étape 4 : Configuration Vercel** ✅
- Création du fichier `vercel.json`
- Configuration SPA routing
- Headers CORS pour workers

### **Étape 5 : Tests et Validation** ✅
- Build local : `npm run build` ✅
- Dev server : `npm run dev` ✅
- Application répond correctement

---

## ✅ **SOLUTIONS VALIDÉES**

### **Tests Effectués**
1. **✅ Build de production** : `npm run build` sans erreurs
2. **✅ Serveur de développement** : Application charge correctement
3. **✅ Web Workers** : Chemins résolus correctement
4. **✅ Configuration Vercel** : SPA routing configuré

### **Fichiers Modifiés**
- `src/hooks/useManaCalculations.ts` : Web Worker path fix
- `src/hooks/useMonteCarloWorker.ts` : Web Worker path fix (2x)
- `vite.config.ts` : Configuration simplifiée
- `vercel.json` : Configuration Vercel ajoutée

---

## 🚀 **CHECKLIST DE DÉPLOIEMENT**

### **Avant Déploiement**
- [ ] `npm run build` réussit sans erreurs
- [ ] `npm run dev` fonctionne localement
- [ ] Web Workers utilisent `new URL()` syntax
- [ ] Configuration Vite simplifiée
- [ ] `vercel.json` présent et configuré

### **Après Déploiement**
- [ ] Application charge sur Vercel
- [ ] Pas d'erreur "Loading ManaTuner Pro..." infinie
- [ ] Web Workers fonctionnent
- [ ] Navigation SPA fonctionne

---

## 📚 **LEÇONS APPRISES**

### **❌ Erreurs à Éviter**
1. **Over-engineering** des configurations de build
2. **Chemins absolus** pour les Web Workers
3. **Chunking manuel** complexe sans nécessité
4. **Absence de configuration** plateforme-spécifique

### **✅ Bonnes Pratiques**
1. **Simplicité** dans les configurations
2. **new URL()** pour les Web Workers
3. **Configuration automatique** de Vite
4. **Tests local + build** avant déploiement

---

## 🔗 **Références**

- **Commit de référence stable** : `e798c8d` - "Confirm: Local version working perfectly"
- **Commit avec corrections** : `[EN_COURS]` - "VERCEL FIX: Résolution des problèmes de déploiement"
- **Documentation Vercel** : https://vercel.com/docs/concepts/projects/project-configuration
- **Vite Web Workers** : https://vitejs.dev/guide/features.html#web-workers

---

*Journal créé le 21/06/2025 - ManaTuner Pro v2.0.0* 