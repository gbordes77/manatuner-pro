# ManaTuner Pro - Document de Passation

## Bienvenue dans l'équipe !

Ce document vous permettra de prendre en main le projet rapidement.

---

## 1. Vue d'ensemble

**ManaTuner Pro** est un analyseur de manabase pour Magic: The Gathering.

| Info | Valeur |
|------|--------|
| **URL Production** | https://manatuner-pro.vercel.app |
| **Stack** | React 18 + TypeScript + Vite + MUI |
| **Hébergement** | Vercel |
| **Tests** | Vitest (unit) + Playwright (E2E) |
| **Score Prod** | 85/100 - Prêt production |

### Ce que fait l'app
- Calcule les probabilités exactes de cast de chaque sort (hypergeométrique)
- Simule 3000+ mains pour les décisions de mulligan (Monte Carlo)
- Analyse tour par tour la castabilité
- 100% client-side, privacy-first

---

## 2. Démarrage rapide

```bash
# Cloner et installer
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro
npm install

# Lancer le serveur dev
npm run dev
# → http://localhost:5173

# Tests
npm run test:unit    # 86/88 passing
npm run lint         # 0 errors, 40 warnings

# Build production
npm run build
```

---

## 3. Structure du projet

```
src/
├── components/
│   ├── analyzer/        # Interface saisie deck
│   │   ├── DeckInputSection.tsx   # Zone de texte + boutons
│   │   ├── DashboardTab.tsx       # Onglet principal résultats
│   │   └── ...
│   ├── analysis/        # Visualisation résultats
│   │   ├── EnhancedCharts.tsx     # Graphiques
│   │   └── ...
│   ├── common/          # Composants partagés
│   │   ├── FloatingManaSymbols.tsx # Mana flottants en fond
│   │   └── ...
│   └── export/          # Export PDF/PNG
│       └── ManaBlueprint.tsx      # Blueprint visuel
├── pages/               # Pages de l'app
│   ├── HomePage.tsx
│   ├── AnalyzerPage.tsx
│   ├── GuidePage.tsx
│   ├── MathematicsPage.tsx
│   ├── LandGlossaryPage.tsx
│   └── ...
├── services/            # Logique métier
│   ├── manaCalculator.ts   # Calculs hypergeométriques
│   ├── advancedMaths.ts    # Monte Carlo
│   ├── deckAnalyzer.ts     # Parsing deck
│   └── landService.ts      # Détection terrains
├── hooks/               # Hooks React custom
├── store/               # Redux slices
├── types/               # Types TypeScript
└── utils/               # Utilitaires
```

---

## 4. Routes de l'application

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page avec mana flottants |
| `/analyzer` | AnalyzerPage | Analyseur principal |
| `/guide` | GuidePage | Guide utilisateur |
| `/mathematics` | MathematicsPage | Explications mathématiques |
| `/land-glossary` | LandGlossaryPage | Glossaire des terrains |
| `/my-analyses` | MyAnalysesPage | Historique local |
| `/privacy-first` | PrivacyFirstPage | Politique privacy |
| `/about` | AboutPage | À propos |

---

## 5. Fonctionnalités clés

### Mana Font (icônes MTG)
```html
<!-- CDN dans index.html -->
<link href="https://cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css" rel="stylesheet" />

<!-- Usage -->
<i className="ms ms-w ms-cost" />  <!-- Mana blanc -->
<i className="ms ms-u ms-cost" />  <!-- Mana bleu -->
<i className="ms ms-b ms-cost" />  <!-- Mana noir -->
<i className="ms ms-r ms-cost" />  <!-- Mana rouge -->
<i className="ms ms-g ms-cost" />  <!-- Mana vert -->
```

### FloatingManaSymbols
Composant partagé pour les mana flottants en arrière-plan (toutes les pages).
```tsx
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols';

// Dans le JSX de la page
<FloatingManaSymbols />
```

### Theme WUBRG
```tsx
// Couleurs dans le theme MUI
theme.palette.mana.white      // #F8E7B9
theme.palette.mana.blue       // #0E68AB
theme.palette.mana.black      // #150B00
theme.palette.mana.red        // #D3202A
theme.palette.mana.green      // #00733E
theme.palette.mana.multicolor // #C9A32E (gold)
```

---

## 6. Tests

### Unit Tests (Vitest)
```bash
npm run test:unit
# 86/88 passing, 2 skipped
```

Tests critiques :
- `manaCalculator.test.ts` - Formules hypergeométriques
- `deckAnalyzer.test.ts` - Parsing de decklists
- `AnalyzerPage.test.jsx` - Interface principale

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

---

## 7. Déploiement

### Vercel (automatique)
Push sur `main` → déploiement automatique sur Vercel.

```bash
# Commit et push
git add .
git commit -m "feat: description"
git push origin main
```

### Variables d'environnement
Aucune requise - l'app est 100% client-side.

Supabase est **désactivé** (mocké). Toutes les données restent en localStorage.

---

## 8. État actuel

### Session 2025-12-27 - Dernières modifications

**Visual Identity MTG**
- ✅ Mana font CDN corrigé (keyrune → mana-font)
- ✅ Color Distribution avec icônes mana
- ✅ ManaBlueprint fond éclairci + icônes mana
- ✅ FloatingManaSymbols sur TOUTES les pages
- ✅ HomePage title gradient gold
- ✅ Footer avec coeur emoji
- ✅ Boutons Clear/Example inversés (Clear gros à gauche)

**Qualité**
- ✅ 0 erreurs ESLint
- ✅ 40 warnings ESLint (non-bloquants)
- ✅ 86/88 tests passing

### P1 - À faire (semaine 1 post-launch)
1. Ajouter headers CSP dans `vercel.json`
2. Ajouter aria-labels aux onglets emoji
3. Installer Sentry error tracking
4. Ajouter navigation clavier aux cartes
5. Fixer les dépendances vides useCallback

---

## 9. Contacts & Ressources

### Documentation
- `README.md` - Vue d'ensemble projet
- `docs/ARCHITECTURE.md` - Architecture technique
- `HANDOFF.md` - Notes de session
- `PRE_PRODUCTION_AUDIT.md` - Rapport d'audit

### Références externes
- [Frank Karsten - Manabase Theory](https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/how-many-lands-do-you-need-to-consistently-hit-your-land-drops/)
- [Mana Font Documentation](https://mana.andrewgioia.com/)
- [Scryfall API](https://scryfall.com/docs/api)

---

## 10. Commandes utiles

```bash
# Développement
npm run dev              # Serveur dev (port 5173)
npm run build            # Build production
npm run preview          # Preview du build

# Qualité
npm run lint             # Check ESLint
npm run lint:fix         # Auto-fix ESLint
npm run type-check       # Validation TypeScript

# Tests
npm run test:unit        # Tests unitaires
npm run test:e2e         # Tests E2E
npm run test:coverage    # Rapport de couverture
```

---

**Bonne prise en main !** 🎴
