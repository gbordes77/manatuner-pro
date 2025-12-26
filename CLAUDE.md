# ManaTuner Pro - Instructions Claude

## RÈGLE CRITIQUE: Rechargement Automatique

**À chaque modification de fichier frontend (.tsx, .ts, .css, .scss):**

1. Vérifier que le serveur dev tourne
2. Recharger/redémarrer le serveur si nécessaire
3. Informer l'utilisateur de rafraîchir la page avec l'URL exacte

```bash
# Vérifier et relancer le serveur
curl -s http://localhost:5173 > /dev/null || (cd "/Volumes/DataDisk/_Projects/Project Mana base V2" && npm run dev &)

# Informer l'utilisateur
echo "Rafraîchis http://localhost:5173/[page-modifiée]"
```

**Ne JAMAIS marquer une modification UI comme terminée sans avoir:**
- Relancé/vérifié le serveur local
- Donné l'URL exacte à rafraîchir à l'utilisateur

---

## Informations Projet

- **Stack**: React 18 + TypeScript + Vite + MUI
- **Port dev**: 5173
- **Tests**: `npm run test:unit` (Vitest) / `npm run test:e2e` (Playwright)
- **Build**: `npm run build`

## Routes Principales

- `/` - Home
- `/analyzer` - Analyseur de deck
- `/land-glossary` - Glossaire des terrains
- `/guide` - Guide utilisateur
- `/mathematics` - Explications mathématiques

## Session 2025-12-26

### Corrections effectuées
- ✅ 9 erreurs ESLint corrigées (case blocks + escape)
- ✅ 67→40 warnings ESLint (unused vars/imports)
- ✅ Test AnalyzerPage.test.jsx corrigé (mock + noms d'onglets)
- ✅ Original Dual Lands ajoutés en #1 dans Land Glossary

### Tests Status
- Unit: 86/88 passing (2 skipped)
- ESLint: 0 errors, 40 warnings
