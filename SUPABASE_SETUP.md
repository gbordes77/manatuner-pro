# 🚀 SUPABASE SETUP GUIDE - ManaTuner Pro

## ⚡ CONFIGURATION RAPIDE (5 minutes)

### Étape 1: Configurer la base de données
1. **Ouvrez** → [Supabase Dashboard](https://supabase.com/dashboard)
2. **Allez dans** → SQL Editor
3. **Copiez-collez** le contenu de `supabase-setup.sql`
4. **Cliquez** → "Run" pour exécuter le script

### Étape 2: Configurer Vercel
1. **Ouvrez** → [Vercel Dashboard](https://vercel.com/dashboard)
2. **Trouvez** → votre projet ManaTuner Pro
3. **Allez dans** → Settings > Environment Variables
4. **Ajoutez ces variables** :

```
VITE_SUPABASE_URL = https://lcrzwjkbzbxanvmcjzst.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjcnp3amtiemJ4YW52bWNqenN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjUxMTcsImV4cCI6MjA2NTk0MTExN30.9eYq1lD19Gqh0uXSgE_9DqFALM-kL2oszx8vKrlH9cc
```

### Étape 3: Redéployer
1. **Dans Vercel** → Deployments
2. **Cliquez** → "Redeploy" sur le dernier déploiement
3. **Attendez** → 2-3 minutes

## ✅ FONCTIONNALITÉS ACTIVÉES

Une fois configuré, votre site aura :

### 💾 Sauvegarde d'analyses
- **Bouton "Save"** → Sauvegarde dans Supabase
- **Noms personnalisés** → "Mon deck Aggro"
- **Formats** → Standard, Modern, Legacy...

### 📱 Historique mobile
- **SpeedDial** → Accès rapide sur mobile
- **Liste des analyses** → Triées par date
- **Chargement rapide** → Clic pour recharger

### 🔗 Partage public
- **Bouton "Share"** → Génère un lien public
- **URL courte** → `votre-site.com/shared/abc123`
- **Copie automatique** → Dans le presse-papier

### 🏛️ Templates de decks
- **Decks populaires** → Mono Red, Azorius Control...
- **Votes communautaires** → Système d'upvotes
- **Formats variés** → Standard, Modern, Legacy

## 🔧 VÉRIFICATION

Pour tester si tout fonctionne :

1. **Analysez un deck** 
2. **Cliquez "Save"** → Doit sauvegarder sans erreur
3. **Cliquez "History"** → Doit afficher l'analyse sauvée
4. **Cliquez "Share"** → Doit générer un lien

## 🆘 EN CAS DE PROBLÈME

**Variables non prises en compte ?**
- Vérifiez qu'elles sont bien ajoutées dans Vercel
- Redéployez le projet

**Erreur de base de données ?**
- Vérifiez que le script SQL s'est exécuté sans erreur
- Vérifiez les permissions RLS dans Supabase

**Boutons ne fonctionnent pas ?**
- Ouvrez la console développeur (F12)
- Regardez les erreurs dans l'onglet Console

## 🎯 RÉSULTAT FINAL

Votre ManaTuner Pro sera alors une **application complète** avec :
- ⚡ **Performance PWA** (cache intelligent)
- 💾 **Persistance cloud** (Supabase)
- 📱 **Interface mobile** (SpeedDial)
- 🔗 **Partage social** (liens publics)
- 🏛️ **Communauté** (templates partagés)

**Niveau : Production-Ready ! 🚀** 