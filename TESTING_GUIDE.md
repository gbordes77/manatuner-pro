# 🧪 Guide des Tests Automatiques - ManaTuner Pro

## 📋 Vue d'ensemble

Ce guide explique comment utiliser la suite complète de tests automatiques implémentée pour ManaTuner Pro. La procédure couvre tous les aspects : fonctionnalités, responsivité, accessibilité, et performance.

## 🚀 Démarrage Rapide

### Installation des Dépendances
```bash
npm install
npx playwright install --with-deps
```

### Lancer Tous les Tests
```bash
npm test                    # Tests unitaires + E2E
npm run test:full          # Suite complète (unitaires + E2E + accessibilité)
npm run test:quick         # Tests rapides (unitaires + flux principaux)
```

## 🎯 Types de Tests Disponibles

### 1. Tests Unitaires et de Composants
```bash
npm run test:unit          # Tests unitaires seulement
npm run test:unit:watch    # Mode watch pour développement
npm run test:component     # Tests de composants React
npm run test:coverage      # Avec rapport de couverture
```

### 2. Tests End-to-End (E2E)
```bash
npm run test:e2e           # Tous les tests E2E
npm run test:e2e:ui        # Interface graphique Playwright
npm run test:e2e:debug     # Mode debug
npm run test:e2e:headed    # Avec interface navigateur visible
```

### 3. Tests Spécialisés
```bash
npm run test:tabs          # Tests des 4 onglets d'analyse
npm run test:responsive    # Tests mobile/desktop/tablette
npm run test:accessibility # Tests WCAG et accessibilité
npm run test:performance   # Tests de performance et vitesse
npm run test:core-flows    # Flux utilisateur principaux
```

### 4. Tests par Navigateur
```bash
npm run test:chromium      # Chrome/Chromium
npm run test:firefox       # Firefox
npm run test:webkit        # Safari/WebKit
npm run test:mobile        # Chrome mobile
```

## 📊 Structure des Tests

```
tests/
├── e2e/                          # Tests End-to-End
│   ├── core-flows/              # Flux principaux
│   │   └── main-user-flows.spec.js
│   ├── tabs/                    # Tests des 4 onglets
│   │   └── analyzer-tabs.spec.js
│   ├── responsive/              # Tests responsivité
│   │   └── mobile-desktop.spec.js
│   ├── accessibility/           # Tests accessibilité
│   │   └── a11y.spec.js
│   └── performance/             # Tests performance
│       └── loading.spec.js
├── component/                   # Tests de composants
│   └── AnalyzerPage.test.jsx
├── unit/                       # Tests unitaires
├── fixtures/                   # Données de test
│   └── sample-decklists.js
└── utils/                      # Utilitaires de test
```

## 🎯 Tests des Fonctionnalités Principales

### Tests des 4 Onglets d'Analyse
```bash
npm run test:tabs
```

**Ce qui est testé :**
- ✅ Onglet Statistiques Générales
- ✅ Onglet Probabilités de Mana
- ✅ Onglet Recommandations
- ✅ Onglet Évaluation des Cartes
- ✅ Navigation entre onglets
- ✅ Persistance des données

### Tests des Flux Utilisateur
```bash
npm run test:core-flows
```

**Flux testés :**
- ✅ Accueil → Analyzer → Analyse → Résultats
- ✅ Nouvel utilisateur : Découverte → Premier essai
- ✅ Utilisateur expérimenté : Analyses multiples
- ✅ Gestion d'erreurs et récupération
- ✅ Navigation complète du site

## 📱 Tests de Responsivité

```bash
npm run test:responsive
```

**Tailles d'écran testées :**
- 📱 Mobile Portrait (375x667)
- 📱 Mobile Landscape (667x375)
- 📱 Tablette (768x1024)
- 💻 Desktop (1920x1080)
- 💻 Small Desktop (1366x768)

**Éléments vérifiés :**
- ✅ Navigation adaptative
- ✅ Formulaires responsifs
- ✅ Onglets d'analyse
- ✅ Tableaux et graphiques
- ✅ Performance scroll mobile

## ♿ Tests d'Accessibilité

```bash
npm run test:accessibility
```

**Standards testés :**
- ✅ WCAG 2.1 AA compliance
- ✅ Navigation au clavier
- ✅ Contraste des couleurs
- ✅ Alternatives textuelles
- ✅ Structure sémantique
- ✅ Touch targets mobile (44px min)

## ⚡ Tests de Performance

```bash
npm run test:performance
```

**Métriques surveillées :**
- ⏱️ Temps de chargement initial (< 3s)
- ⏱️ Navigation vers Analyzer (< 1s)
- ⏱️ Analyse decklist simple (< 3s)
- ⏱️ Analyse decklist complexe (< 5s)
- ⏱️ Changement d'onglets (< 500ms)

## 🔧 Configuration et Personnalisation

### Configuration Playwright
Le fichier `playwright.config.js` configure :
- Multi-navigateurs (Chrome, Firefox, Safari)
- Multi-plateformes (Desktop, Mobile, Tablet)
- Capture d'écrans en cas d'échec
- Vidéos et traces pour debug

### Configuration Vitest
Le fichier `vitest.config.js` configure :
- Environnement jsdom pour React
- Couverture de code avec v8
- Mocks pour les APIs du navigateur

## 🤖 Automatisation CI/CD

### GitHub Actions
Chaque push déclenche automatiquement :
1. **Tests Unitaires** - Composants et logique
2. **Tests E2E** - Flux complets
3. **Tests Responsivité** - Multi-plateformes
4. **Tests Accessibilité** - WCAG compliance
5. **Tests Performance** - Métriques de vitesse
6. **Tests Multi-navigateurs** - Chrome, Firefox, Safari

### Workflow Complet
```yaml
# .github/workflows/tests.yml
- Tests unitaires et composants
- Build et vérification bundle
- Tests E2E sur tous navigateurs
- Tests responsivité mobile/desktop
- Tests accessibilité WCAG
- Tests performance et vitesse
- Audit sécurité
- Notification des résultats
```

## 📈 Rapports et Monitoring

### Rapports Disponibles
- **Playwright HTML Report** - Tests E2E détaillés
- **Coverage Report** - Couverture du code
- **Accessibility Report** - Violations WCAG
- **Performance Metrics** - Temps de chargement

### Accéder aux Rapports
```bash
npx playwright show-report    # Rapport E2E interactif
open coverage/index.html      # Rapport de couverture
```

## 🐛 Debug et Développement

### Mode Debug Interactif
```bash
npm run test:e2e:ui          # Interface graphique Playwright
npm run test:e2e:debug       # Mode pas-à-pas
npm run test:e2e:headed      # Voir le navigateur
```

### Tests en Mode Watch
```bash
npm run test:unit:watch      # Tests unitaires auto-reload
```

### Debug d'un Test Spécifique
```bash
npx playwright test tests/e2e/tabs/analyzer-tabs.spec.js --debug
```

## 📋 Checklist de Tests

### Avant chaque commit
- [ ] `npm run test:unit` - Tests unitaires
- [ ] `npm run test:quick` - Flux principaux
- [ ] Linting et formatage

### Avant chaque merge
- [ ] `npm run test:full` - Suite complète
- [ ] `npm run test:responsive` - Multi-plateformes
- [ ] `npm run test:accessibility` - WCAG
- [ ] `npm run test:performance` - Vitesse

### Après déploiement
- [ ] Tests de smoke en production
- [ ] Vérification métriques performance
- [ ] Monitoring erreurs

## 🎯 Bonnes Pratiques

### Écriture de Tests
1. **Descriptifs** - Noms de tests clairs
2. **Isolés** - Chaque test indépendant
3. **Reproductibles** - Résultats constants
4. **Rapides** - Éviter les attentes inutiles

### Maintenance
1. **Mise à jour régulière** des dépendances
2. **Révision** des tests qui échouent
3. **Optimisation** des tests lents
4. **Documentation** des nouveaux tests

## 🆘 Résolution de Problèmes

### Tests qui Échouent
1. Vérifier les captures d'écran dans `test-results/`
2. Consulter les traces Playwright
3. Lancer en mode debug : `npm run test:e2e:debug`

### Performance Dégradée
1. Analyser les métriques dans les rapports
2. Vérifier la taille du bundle
3. Profiler avec les DevTools

### Problèmes d'Accessibilité
1. Consulter le rapport axe-core
2. Tester manuellement avec lecteur d'écran
3. Vérifier les contrastes de couleurs

## 📞 Support

Pour toute question sur les tests :
1. Consulter les logs détaillés dans GitHub Actions
2. Vérifier les artifacts de tests
3. Analyser les rapports HTML générés

---

**🎯 Objectif :** Garantir que ManaTuner Pro fonctionne parfaitement sur toutes les plateformes et pour tous les utilisateurs, à chaque modification du code. 