# 🔄 Rollback Guide - ManaTuner Pro

## 🎯 Point de Sauvegarde Stable

**Version**: v2.0.0-stable  
**Date**: 22 Juin 2025  
**Commit**: `efdd48a`  
**Status**: ✅ Production Ready  

### 📋 État au Moment de la Sauvegarde

#### **✅ Application**
- **Local**: Fonctionne parfaitement sur http://localhost:5173
- **Production**: Déployée et stable sur https://manatuner-pro.vercel.app
- **Build**: `npm run build` réussit sans erreurs
- **Tests**: Tous les tests passent

#### **✅ Documentation**
- `README.md` - Complet avec bonnes URLs et badges
- `CONTRIBUTING.md` - Guide contributeurs détaillé
- `CHANGELOG.md` - Historique des versions
- `SECURITY.md` - Politique de sécurité
- `DEPLOYMENT_LOG.md` - Journal des déploiements
- `.env.example` - Template des variables

#### **✅ Automation**
- `.github/workflows/ci.yml` - CI/CD complet
- `.github/dependabot.yml` - Mises à jour automatiques
- `.nvmrc` - Version Node.js 20.10.0

#### **✅ Corrections Appliquées**
- Web Workers avec `new URL()` syntax
- Configuration Vite simplifiée pour production
- `vercel.json` pour SPA routing
- Toutes les URLs GitHub corrigées

---

## 🔄 Méthodes de Rollback

### **Méthode 1: Rollback via Tag Git** ⭐ **RECOMMANDÉE**

```bash
# Rollback vers la version stable
git checkout v2.0.0-stable

# Créer une nouvelle branche depuis ce point
git checkout -b hotfix/rollback-to-stable

# Forcer la mise à jour de main (ATTENTION: destructif)
git checkout main
git reset --hard v2.0.0-stable
git push origin main --force
```

### **Méthode 2: Rollback via Branche de Backup**

```bash
# Utiliser la branche de backup
git checkout backup/v2.0.0-stable

# Créer une nouvelle branche de travail
git checkout -b restore/from-backup

# Merger dans main si nécessaire
git checkout main
git merge backup/v2.0.0-stable
```

### **Méthode 3: Rollback Commit Spécifique**

```bash
# Rollback vers le commit exact
git checkout efdd48a

# Créer une branche depuis ce commit
git checkout -b rollback/commit-efdd48a

# Reset main vers ce commit (ATTENTION: destructif)
git checkout main
git reset --hard efdd48a
git push origin main --force
```

### **Méthode 4: Rollback Vercel** 🚀

```bash
# Via Vercel Dashboard
# 1. Aller sur https://vercel.com/gbordes77s-projects/manatuner-pro
# 2. Onglet "Deployments"
# 3. Trouver le déploiement du commit efdd48a
# 4. Cliquer "Promote to Production"

# Via Vercel CLI
vercel --prod --force
```

---

## 📊 Informations de Référence

### **Commits Critiques**
```
efdd48a - ci: Add GitHub Actions CI/CD and configuration files
033ba90 - docs: Add comprehensive project documentation  
0a8aaf0 - Fix: Vercel deployment issues - Web Workers and config optimizations
e798c8d - ✅ Confirm: Local version working perfectly - Ready for production
```

### **Fichiers Critiques à Vérifier**
- `src/hooks/useManaCalculations.ts` - Web Workers fixes
- `src/hooks/useMonteCarloWorker.ts` - Web Workers fixes  
- `vite.config.ts` - Configuration production
- `vercel.json` - Configuration SPA
- `package.json` - Scripts et dépendances

### **URLs de Référence**
- **GitHub**: https://github.com/gbordes77/manatuner-pro
- **Vercel**: https://manatuner-pro.vercel.app
- **Tag Stable**: https://github.com/gbordes77/manatuner-pro/releases/tag/v2.0.0-stable

---

## ⚠️ Précautions Avant Rollback

### **1. Sauvegarde Actuelle**
```bash
# Créer un tag de l'état actuel avant rollback
git tag -a "backup-before-rollback-$(date +%Y%m%d-%H%M)" -m "Backup before rollback"
git push origin --tags
```

### **2. Vérification de l'État**
```bash
# Vérifier l'état actuel
git status
git log --oneline -5

# Vérifier les branches
git branch -a

# Vérifier les tags
git tag -l
```

### **3. Test Post-Rollback**
```bash
# Après rollback, tester immédiatement
npm install
npm run build
npm run dev

# Vérifier que l'application fonctionne
curl http://localhost:5173
```

---

## 🚨 Rollback d'Urgence (1 commande)

```bash
# ROLLBACK COMPLET EN UNE COMMANDE (ATTENTION: DESTRUCTIF)
git reset --hard v2.0.0-stable && git push origin main --force
```

---

## 📞 Support

Si vous rencontrez des problèmes lors du rollback :

1. **Vérifiez les logs** : `git log --oneline -10`
2. **Consultez le statut** : `git status`
3. **Référez-vous au DEPLOYMENT_LOG.md** pour les détails techniques
4. **Testez en local** avant de pousser en production

---

**⚠️ IMPORTANT**: Les rollbacks avec `--force` sont destructifs. Assurez-vous d'avoir une sauvegarde avant d'exécuter ces commandes.

**✅ Point de Sauvegarde Stable Confirmé**: v2.0.0-stable - Production Ready 🎯 