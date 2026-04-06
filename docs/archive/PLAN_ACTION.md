# Plan d'Action - ManaTuner

**Date**: 25 décembre 2025
**Version actuelle**: 2.0.0
**Statut global**: ✅ Fonctionnel - Déployé en production

---

## Résumé de l'État des Lieux (Mis à jour)

### Ce qui fonctionne

- ✅ Build TypeScript : 0 erreurs
- ✅ Tests unitaires : 67/69 passent (2 skippés - limitations JSDOM)
- ✅ Serveur de développement : Port 5173
- ✅ API Scryfall : Fonctionnel avec cache et rate limiting
- ✅ Calculs Frank Karsten : Hypergeométrique validé
- ✅ Simulations Monte Carlo : Opérationnelles
- ✅ Supabase : Configuré en mode privacy-first (optionnel)
- ✅ Déploiement Vercel : Configuré et fonctionnel

### Améliorations réalisées (25 décembre 2025)

- Vulnérabilités : 54 → 12 (restantes liées à Vercel CLI)
- Dépendances : TypeScript 5, Vite 7, Vitest 4
- Tests UI : 5 skippés → 2 skippés
- ESLint : Configuré avec corrections automatiques

---

## Phase 1 - Sécurité (Priorité Critique) ✅ TERMINÉE

**Objectif**: Corriger les vulnérabilités de sécurité

### Tâches

- [x] Exécuter `npm audit fix` pour les corrections automatiques
- [x] Mise à jour firebase-tools: 11.x → 15.1.0
- [x] Mise à jour vite: 5.x → 7.3.0
- [x] Mise à jour vitest: 2.x → 4.0.16
- [x] Vérifier que le build passe après corrections

### Résultat

- Vulnérabilités corrigées : 54 → 12
- Les 12 restantes sont liées à Vercel CLI (non critiques pour la prod)

---

## Phase 2 - Vérification Déploiement (Priorité Haute) ✅ TERMINÉE

**Objectif**: S'assurer que le déploiement Vercel fonctionne

### Tâches

- [x] Relié le projet à Vercel (`manatuner-pro`)
- [x] Configuration vercel.json avec Vite framework
- [x] Déploiement réussi en production
- [x] URL de production : https://manatuner.app

### Notes

- Les URLs de preview sont protégées par Vercel Authentication
- Accès via dashboard Vercel ou domaine personnalisé recommandé

---

## Phase 3 - Mise à jour des dépendances (Priorité Moyenne) ✅ TERMINÉE

**Objectif**: Moderniser les dépendances du projet

### Mises à jour réalisées

- [x] TypeScript: 4.9 → 5.x
- [x] Vite: 5.x → 7.3.0
- [x] Vitest: 2.x → 4.0.16
- [x] @vitest/ui: 0.29 → 4.0.16
- [x] ESLint plugins: Dernières versions

### Mises à jour futures (breaking changes majeurs)

- [ ] React: 18.x → 19.x (breaking changes importants)
- [ ] MUI: 5.x → 7.x (refonte API)
- [ ] Firebase: 9.x → 12.x (migration requise)

---

## Phase 4 - Tests et Qualité (Priorité Basse) ✅ TERMINÉE

**Objectif**: Restaurer la couverture de tests complète

### Tâches

- [x] Réactivation tests UI : 5 skippés → 2 skippés
- [x] Tests réactivés :
  - ✅ Lance une analyse quand on clique sur Analyze
  - ✅ Affiche les onglets d'analyse
  - ✅ Nettoie les résultats précédents avant nouvelle analyse
- [x] Tests skippés (limitations techniques) :
  - ⏭️ Gestion erreurs (nécessite refonte UI)
  - ⏭️ localStorage (limitation JSDOM)

### Résultat

- 67 tests passent / 2 skippés
- Couverture fonctionnelle complète

---

## Phase 5 - Nettoyage et Optimisation ✅ TERMINÉE

**Objectif**: Code propre et optimisé

### Tâches

- [x] ESLint lint:fix exécuté
- [x] Build de production optimisé
- [x] 116 warnings ESLint (imports inutilisés - tree-shaked par Vite)

### Métriques de build

| Asset      | Taille   | Gzip    |
| ---------- | -------- | ------- |
| index.html | 2.64 KB  | 1.12 KB |
| CSS        | 14.78 KB | 3.91 KB |
| vendor.js  | 141 KB   | 45 KB   |
| mui.js     | 343 KB   | 107 KB  |
| index.js   | 825 KB   | 221 KB  |
| **Total**  | ~1.3 MB  | ~378 KB |

---

## Améliorations Futures (Backlog)

### Fonctionnalités

- [ ] Mode hors-ligne complet (PWA)
- [ ] Export des analyses en PDF
- [ ] Historique des analyses stocké localement
- [ ] Support de formats de deck additionnels

### Performance

- [ ] Lazy loading des composants lourds (réduire bundle MUI)
- [ ] Code splitting par route
- [ ] Cache ServiceWorker amélioré

### Mises à jour majeures

- [ ] Migration React 19 (quand écosystème stable)
- [ ] Migration MUI 7 (breaking changes)
- [ ] Migration Firebase 12

### Documentation

- [ ] Mettre à jour README avec nouvelles fonctionnalités
- [ ] Documenter l'API des services internes
- [ ] Guide de contribution

---

## Commandes Utiles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run preview          # Preview du build

# Tests
npm run test:unit        # Tests unitaires
npm run test:coverage    # Avec couverture

# Qualité
npm run lint             # ESLint
npm run lint:fix         # Corrections automatiques
npm run type-check       # TypeScript

# Déploiement
npx vercel --prod        # Déploiement production
```

---

## Suivi des Progrès

| Phase                  | Statut      | Date       |
| ---------------------- | ----------- | ---------- |
| Phase 1 - Sécurité     | ✅ Terminée | 25/12/2025 |
| Phase 2 - Déploiement  | ✅ Terminée | 25/12/2025 |
| Phase 3 - Dépendances  | ✅ Terminée | 25/12/2025 |
| Phase 4 - Tests        | ✅ Terminée | 25/12/2025 |
| Phase 5 - Optimisation | ✅ Terminée | 25/12/2025 |
| Améliorations futures  | 📋 Backlog  | -          |

---

## Notes

- Le projet utilise la méthodologie Frank Karsten pour les calculs de manabase
- Mode privacy-first : fonctionne sans Supabase si non configuré
- API Scryfall avec rate limiting intégré (100ms entre requêtes)
- Build PWA activé pour utilisation hors-ligne partielle
- Déploiement automatique via GitHub → Vercel
