#!/bin/bash

# ManaTuner Pro - Script de Déploiement
echo "🚀 Déploiement de ManaTuner Pro..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

# Nettoyer les anciens builds
echo "🧹 Nettoyage des anciens builds..."
rm -rf dist/

# Build de production
echo "🔨 Build de production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build. Arrêt du déploiement."
    exit 1
fi

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le dossier dist n'a pas été créé."
    exit 1
fi

echo "✅ Build terminé avec succès!"

# Déploiement sur Vercel
echo "🌐 Déploiement sur Vercel..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Déploiement réussi!"
    echo "📱 Votre site est maintenant en ligne!"
else
    echo "❌ Erreur lors du déploiement."
    exit 1
fi 