# 🚀 VERCEL ENVIRONMENT VARIABLES SETUP

## 📋 Variables à configurer sur Vercel

Pour activer le Cloud Sync (optionnel), vous devez configurer ces variables d'environnement sur Vercel :

### 🔑 Variables Supabase (OPTIONNELLES)

```bash
VITE_SUPABASE_URL=https://lcrzwjkbzbxanvmcjzst.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjcnp3amtiemJ4YW52bWNqenN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjUxMTcsImV4cCI6MjA2NTk0MTExN30.9eYq1lD19Gqh0uXSgCCODE_TRONQUE
```

## 🛠️ Comment configurer sur Vercel

### Méthode 1 : Interface Web Vercel

1. **Allez sur** → [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Cliquez** → Sur votre projet "manatuner-pro"
3. **Allez dans** → Settings → Environment Variables
4. **Ajoutez** les variables une par une :
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://lcrzwjkbzbxanvmcjzst.supabase.co`
   - Environment: `Production`, `Preview`, `Development`
5. **Répétez** pour `VITE_SUPABASE_ANON_KEY`
6. **Redéployez** → Settings → Deployments → Redeploy

### Méthode 2 : CLI Vercel

```bash
# Installer Vercel CLI si pas déjà fait
npm i -g vercel

# Se connecter
vercel login

# Configurer les variables
vercel env add VITE_SUPABASE_URL
# Entrer la valeur quand demandé

vercel env add VITE_SUPABASE_ANON_KEY
# Entrer la valeur quand demandé

# Redéployer
vercel --prod
```

## ✅ Vérification

Après configuration, votre app aura :

- **Sans variables** : Mode Privacy-First uniquement (recommandé)
- **Avec variables** : Mode Privacy-First + option Cloud Sync

## 🔒 Sécurité

- Ces clés sont publiques (anon key)
- Elles permettent uniquement l'accès aux données publiques
- Les permissions sont gérées par Supabase RLS (Row Level Security)
- Aucune donnée sensible n'est exposée

## 🎯 Résultat

L'utilisateur pourra choisir :
- 🔒 **Mode Privacy-First** (par défaut) : 100% local
- ☁️ **Mode Cloud Sync** (optionnel) : Synchronisation multi-appareils

**L'app fonctionne parfaitement sans ces variables !** 