# 🚀 Guide de Déploiement - ManaTuner Pro

## 📋 Prérequis

- Node.js 18+ installé
- Git configuré
- Compte sur la plateforme de déploiement choisie

## 🏗️ Build de Production

```bash
npm run build
```

Le build génère un dossier `dist/` optimisé pour la production.

## 🌐 Options de Déploiement

### 🥇 Option 1 : Vercel (Recommandé)

**Avantages :**
- ✅ Gratuit pour projets personnels
- ✅ Déploiement automatique depuis Git
- ✅ CDN global ultra-rapide
- ✅ Domaine personnalisé gratuit
- ✅ HTTPS automatique

**Déploiement rapide :**
```bash
# Méthode 1 : Script automatique
./deploy.sh

# Méthode 2 : Manuel
npm run build
npx vercel --prod
```

**Configuration Git (recommandé) :**
1. Push votre code sur GitHub
2. Connectez votre repo sur [vercel.com](https://vercel.com)
3. Déploiement automatique à chaque push !

### 🥈 Option 2 : Netlify

**Avantages :**
- ✅ Gratuit avec généreux quotas
- ✅ Déploiement par drag & drop
- ✅ Formulaires intégrés
- ✅ Functions serverless

**Déploiement :**
```bash
npm run build
# Puis drag & drop du dossier dist/ sur netlify.com
```

### 🥉 Option 3 : GitHub Pages

**Avantages :**
- ✅ Totalement gratuit
- ✅ Intégration GitHub native
- ✅ Domaine personnalisé possible

**Configuration :**
1. Créer `.github/workflows/deploy.yml`
2. Push sur GitHub
3. Activer GitHub Pages dans les settings

### 🏢 Option 4 : Serveur Personnel

**Pour VPS/serveur dédié :**
```bash
# Build
npm run build

# Upload dist/ vers votre serveur
scp -r dist/* user@server:/var/www/html/

# Configuration Nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 Configuration Avancée

### Variables d'Environnement

Créer `.env.production` :
```env
VITE_APP_TITLE=ManaTuner Pro
VITE_API_URL=https://api.scryfall.com
```

### Optimisations Performance

Le projet inclut déjà :
- ✅ Code splitting automatique
- ✅ Compression Gzip
- ✅ Service Worker (PWA)
- ✅ Lazy loading des composants
- ✅ Optimisation des images

### Domaine Personnalisé

**Vercel :**
1. Aller dans Project Settings
2. Domains → Add Domain
3. Configurer DNS : CNAME vers `cname.vercel-dns.com`

**Netlify :**
1. Site Settings → Domain Management
2. Add Custom Domain
3. Configurer DNS selon instructions

## 📊 Monitoring & Analytics

### Ajout de Google Analytics

```typescript
// src/utils/analytics.ts
import { gtag } from 'ga-gtag';

gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: 'ManaTuner Pro',
  page_location: window.location.href
});
```

### Performance Monitoring

Le projet utilise Vite's built-in performance monitoring.

## 🔒 Sécurité

### Headers de Sécurité (inclus)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### HTTPS

Toutes les plateformes recommandées fournissent HTTPS automatique.

## 🐛 Dépannage

### Build Errors

```bash
# Nettoyer cache
rm -rf node_modules dist
npm install
npm run build
```

### Routing Issues (SPA)

Vérifier que votre serveur redirige toutes les routes vers `index.html`.

### Performance Issues

```bash
# Analyser le bundle
npm run build -- --analyze
```

## 📱 PWA & Mobile

Le site est automatiquement :
- ✅ Responsive (mobile-first)
- ✅ PWA (installable)
- ✅ Offline-ready
- ✅ Fast loading

## 🎯 Recommandations Finales

1. **Utilisez Vercel** pour la simplicité
2. **Configurez un domaine personnalisé**
3. **Activez les analytics**
4. **Testez sur mobile**
5. **Surveillez les performances**

---

🎉 **Votre ManaTuner Pro est prêt à conquérir le monde MTG !** 