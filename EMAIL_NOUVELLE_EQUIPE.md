# Email de Bienvenue - Nouvelle Équipe ManaTuner Pro

---

**Objet**: Bienvenue sur ManaTuner Pro - Phase Feedback & Debug

---

Bonjour à tous,

Bienvenue dans l'équipe **ManaTuner Pro** !

## Le Projet

ManaTuner Pro est un analyseur de manabase pour Magic: The Gathering, actuellement **en production** sur https://manatuner-pro.vercel.app

L'app permet aux joueurs de :
- Calculer les probabilités exactes de cast de leurs sorts
- Simuler des milliers de mains pour optimiser les décisions de mulligan
- Exporter leurs analyses en PNG/PDF

**Score d'audit : 85/100** - L'app est stable et prête pour les utilisateurs.

---

## Votre Mission : Phase Feedback & Debug

Nous passons maintenant à la phase de **prise en compte des retours utilisateurs**.

### Vos priorités :

1. **Monitorer les retours** via Tally.so (intégré dans l'app)
2. **Corriger les bugs** remontés par les vrais utilisateurs
3. **Améliorer l'UX** basé sur le feedback réel
4. **Maintenir la qualité** du code (tests, lint, build)

---

## Pour Démarrer

### 1. Accès

- **Repo GitHub** : https://github.com/gbordes77/manatuner-pro
- **Production** : https://manatuner-pro.vercel.app
- **Vercel** : Déploiement automatique sur push `main`

### 2. Installation locale

```bash
git clone https://github.com/gbordes77/manatuner-pro.git
cd manatuner-pro
npm install
npm run dev
# → http://localhost:5173
```

### 3. Documentation à lire EN PRIORITÉ

| Document | Contenu | Temps |
|----------|---------|-------|
| `ONBOARDING_NOUVELLE_EQUIPE.md` | Guide complet d'onboarding | 15 min |
| `TEAM_HANDOFF.md` | Passation technique | 10 min |
| `README.md` | Vue d'ensemble | 5 min |
| `PRE_PRODUCTION_AUDIT.md` | Audit complet (focus P1) | 20 min |

---

## Stack Technique

| Élément | Technologie |
|---------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Material-UI (MUI) |
| Tests | Vitest + Playwright |
| Hosting | Vercel |
| State | Redux Toolkit |

**Note importante** : L'app est 100% client-side, privacy-first. Supabase est désactivé, toutes les données restent en localStorage.

---

## État Actuel

### Ce qui fonctionne
- Toutes les features core sont complètes
- Tests : 86/88 passing
- ESLint : 0 errors
- Performance : Bundle 202KB gzipped

### P1 à traiter (Semaine 1)

1. Ajouter headers CSP dans `vercel.json`
2. Ajouter aria-labels aux onglets emoji
3. Installer Sentry pour error tracking
4. Navigation clavier sur les cartes
5. Fixer dépendances vides useCallback

---

## Workflow

```
1. Créer branche: git checkout -b fix/description
2. Développer + tester: npm run lint && npm run test:unit
3. Commit: git commit -m "fix: description"
4. Push + PR sur GitHub
5. Merge sur main → déploiement auto Vercel
```

---

## Documents Disponibles

### Racine du projet
- `README.md` - Vue d'ensemble
- `ONBOARDING_NOUVELLE_EQUIPE.md` - **CE DOCUMENT EN PREMIER**
- `TEAM_HANDOFF.md` - Passation technique
- `HANDOFF.md` - Notes de sessions
- `PRE_PRODUCTION_AUDIT.md` - Audit 8 agents

### Dossier docs/
- `ARCHITECTURE.md` - Architecture technique
- `MATHEMATICAL_REFERENCE.md` - Formules maths
- `MULLIGAN_SYSTEM.md` - Système mulligan
- `LAND_SYSTEM_REDESIGN.md` - Détection terrains
- `MTG_VISUAL_IDENTITY.md` - Identité visuelle
- `PRODUCT_STRATEGY.md` - Stratégie produit

---

## Checklist Premier Jour

- [ ] Cloner et installer le projet
- [ ] Lire `ONBOARDING_NOUVELLE_EQUIPE.md`
- [ ] Lancer l'app en local et l'explorer
- [ ] Analyser un deck exemple
- [ ] Lire `PRE_PRODUCTION_AUDIT.md` (sections P1)
- [ ] Identifier votre premier ticket de travail

---

Bienvenue dans l'équipe ! L'app est solide, votre mission est de l'améliorer grâce aux retours des vrais utilisateurs.

Bonne prise en main,

L'équipe ManaTuner Pro

---

**TL;DR** : 
1. `git clone` + `npm install` + `npm run dev`
2. Lire `ONBOARDING_NOUVELLE_EQUIPE.md`
3. Explorer https://manatuner-pro.vercel.app
4. Commencer par les P1 dans `PRE_PRODUCTION_AUDIT.md`
