# Plan d'Action - ManaTuner Pro

**Date**: 25 décembre 2024
**Version actuelle**: 1.0.0
**Statut global**: Fonctionnel localement, maintenance requise pour production

---

## Résumé de l'État des Lieux

### Ce qui fonctionne
- Build TypeScript : 0 erreurs
- Tests unitaires : 17/17 passent (5 UI skippés temporairement)
- Serveur de développement : Port 5173
- API Scryfall : Fonctionnel avec cache et rate limiting
- Calculs Frank Karsten : Hypergeométrique validé
- Simulations Monte Carlo : Opérationnelles
- Supabase : Configuré en mode privacy-first (optionnel)

### Problèmes identifiés
- 8 vulnérabilités de sécurité (2 high, 5 moderate, 1 low)
- Dépendances obsolètes (Firebase 9→12, MUI 5→7, React 18→19)
- 5 tests UI désactivés (manque de data-testid)

---

## Phase 1 - Sécurité (Priorité Critique)

**Objectif**: Corriger les vulnérabilités de sécurité

### Tâches
- [ ] Exécuter `npm audit fix` pour les corrections automatiques
- [ ] Mettre à jour manuellement les packages avec vulnérabilités high:
  - `axios` → dernière version stable
  - `body-parser` → dernière version stable
- [ ] Vérifier que le build passe après corrections
- [ ] Relancer `npm audit` pour confirmer résolution

### Packages concernés
| Package | Sévérité | Action |
|---------|----------|--------|
| axios | High | Mise à jour requise |
| body-parser | High | Mise à jour requise |
| @grpc/grpc-js | Moderate | npm audit fix |
| cookie | Moderate | npm audit fix |
| cross-spawn | Moderate | npm audit fix |
| path-to-regexp | Moderate | npm audit fix |
| send | Moderate | npm audit fix |
| nanoid | Low | npm audit fix |

---

## Phase 2 - Vérification Déploiement (Priorité Haute)

**Objectif**: S'assurer que le déploiement Vercel fonctionne

### Tâches
- [ ] Vérifier le statut du projet sur dashboard.vercel.com
- [ ] Confirmer les variables d'environnement en production:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Déclencher un nouveau déploiement si nécessaire
- [ ] Tester l'application en production après déploiement
- [ ] Vérifier les logs Vercel pour erreurs éventuelles

---

## Phase 3 - Mise à jour des dépendances (Priorité Moyenne)

**Objectif**: Moderniser les dépendances du projet

### Approche recommandée
Mise à jour progressive pour éviter les breaking changes massifs.

### Étape 3.1 - Mises à jour mineures (safe)
```bash
npm update
```

### Étape 3.2 - Vite et outils de build
- [ ] vite: 5.x → 6.x
- [ ] vitest: 2.x → 3.x
- [ ] @vitejs/plugin-react: mise à jour

### Étape 3.3 - React et écosystème (attention breaking changes)
- [ ] react: 18.x → 19.x
- [ ] react-dom: 18.x → 19.x
- [ ] @types/react: mise à jour correspondante

### Étape 3.4 - Material UI (breaking changes majeurs)
- [ ] @mui/material: 5.x → 7.x
- [ ] @emotion/react et @emotion/styled: versions compatibles
- [ ] Adapter les composants aux nouvelles APIs si nécessaire

### Étape 3.5 - Firebase (breaking changes)
- [ ] firebase: 9.x → 12.x
- [ ] Adapter les imports et APIs modifiées

---

## Phase 4 - Tests et Qualité (Priorité Basse)

**Objectif**: Restaurer la couverture de tests complète

### Tâches
- [ ] Ajouter `data-testid` aux composants UI:
  - Bouton "Analyze"
  - Zone de résultats
  - Messages d'erreur
- [ ] Réactiver les 5 tests skippés dans `AnalyzerPage.test.jsx`
- [ ] Configurer les tests E2E Playwright
- [ ] Atteindre 80% de couverture de code

---

## Phase 5 - Améliorations Futures (Nice-to-have)

### Fonctionnalités
- [ ] Mode hors-ligne complet (PWA)
- [ ] Export des analyses en PDF
- [ ] Historique des analyses stocké localement
- [ ] Support de formats de deck additionnels

### Performance
- [ ] Optimisation du bundle size
- [ ] Lazy loading des composants lourds
- [ ] Cache ServiceWorker amélioré

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
npm test                 # Tests unitaires
npm run test:coverage    # Avec couverture

# Qualité
npm run lint             # ESLint
npm run type-check       # TypeScript

# Sécurité
npm audit                # Vérifier vulnérabilités
npm audit fix            # Corriger automatiquement
```

---

## Suivi des Progrès

| Phase | Statut | Date début | Date fin |
|-------|--------|------------|----------|
| Phase 1 - Sécurité | En attente | - | - |
| Phase 2 - Déploiement | En attente | - | - |
| Phase 3 - Dépendances | En attente | - | - |
| Phase 4 - Tests | En attente | - | - |
| Phase 5 - Améliorations | Backlog | - | - |

---

## Notes

- Le projet utilise la méthodologie Frank Karsten pour les calculs de manabase
- Mode privacy-first : fonctionne sans Supabase si non configuré
- API Scryfall avec rate limiting intégré (100ms entre requêtes)
- Build PWA activé pour utilisation hors-ligne partielle
