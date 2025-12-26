# ManaTuner Pro - Session Handoff

## Date: 26 Décembre 2024

## État Actuel: QUASI-FINAL - Prêt pour Production

Le site est maintenant fonctionnel avec toutes les features core implémentées.

---

## Travail Complété Cette Session

### 1. Système de Probabilités P1/P2 (MAJEUR)

Implémentation complète basée sur la méthodologie du site original [Project Manabase](https://project-manabase.firebaseapp.com/).

**Logique finale :**
- **P1 (Perfect)** = Probabilité conditionnelle avec TES sources (assume land drops OK)
  - "Si j'ai N terrains au tour N, quelle proba d'avoir les bonnes couleurs?"
  - Formule: `Hypergeometric(totalLands, sourcesForColor, CMC, symbolsNeeded)`

- **P2 (Realistic)** = P1 × Probabilité d'avoir assez de lands (inclut mana screw)
  - Formule: `P1 × Hypergeometric(deckSize, totalLands, cardsSeen, CMC)`
  - `cardsSeen = 7 (main) + (CMC - 1) pioches`

**Impact CMC sur P2 (mana screw):**
| CMC | P(avoir lands) | Impact |
|-----|----------------|--------|
| 2 | ~89% | Faible |
| 5 | ~41% | Moyen |
| 8 | ~9% | Critique |

**Fichier modifié:** `src/components/ManaCostRow.tsx`

### 2. Réorganisation des Onglets

Nouvel ordre optimisé pour l'utilisateur :

| # | Onglet | Description |
|---|--------|-------------|
| 1 | 🎯 Castability | Analyse P1/P2 par carte (LE plus important) |
| 2 | 💡 Recommendations | Actions concrètes |
| 3 | ⚡ Spell Analysis | Analyse tempo |
| 4 | 📊 Probabilities | Probas par tour |
| 5 | 📋 Overview | Résumé global |
| 6 | 🏔️ Manabase | Détails terrains |
| 7 | 📜 Deck List | Référence |

**Fichier modifié:** `src/pages/AnalyzerPage.tsx`

### 3. Correction Affichage Couleurs

Filtrage des couleurs avec < 3 sources dans "Tempo Impact by Color" (évite d'afficher W/R dans un deck Sultai à cause de Cavern of Souls).

**Fichier modifié:** `src/components/EnhancedSpellAnalysis.tsx`

### 4. Extension Land Seed

Passage de 51 à 195 terrains dans le cache local couvrant :
- Fetch lands, Shock lands, Fast lands, Check lands
- Pain lands, Slow lands, Triomes, Pathways
- Creature lands, Horizon lands, Channel lands
- Bounce lands, Filter lands, Utility lands

**Fichier modifié:** `src/data/landSeed.ts`

### 5. Documentation

Création de `docs/P1_P2_PROBABILITY_METHOD.md` expliquant en détail la méthodologie de calcul avec formules et exemples.

---

## Fichiers Modifiés

```
src/components/ManaCostRow.tsx      - Calcul P1/P2 corrigé
src/components/EnhancedSpellAnalysis.tsx - Filtre couleurs < 3 sources
src/pages/AnalyzerPage.tsx          - Réorganisation onglets + icônes
src/services/deckAnalyzer.ts        - Nettoyage console.log
src/data/landSeed.ts                - Extension 51 → 195 lands
docs/P1_P2_PROBABILITY_METHOD.md    - Documentation méthode (NEW)
```

---

## Tests Effectués

- [x] Build production réussi
- [x] P1 toujours ≥ P2
- [x] Valeurs cohérentes avec site original
- [x] Onglets dans le bon ordre
- [x] Icônes appropriées

---

## Prochaines Étapes Suggérées

1. **Tests utilisateur** - Valider avec plusieurs decks réels
2. **Performance** - Optimiser si nécessaire pour gros decks (Brawl/Commander)
3. **Mobile** - Vérifier responsive sur petits écrans
4. **PWA** - Ajouter manifest pour installation mobile

---

## Commandes Utiles

```bash
# Dev
npm run dev

# Build
npm run build

# Preview production
npm run preview
```

---

## Notes Importantes

- Le texte d'aide du site original contient une ERREUR (P1/P2 inversés dans la description)
- Notre implémentation est basée sur les DONNÉES affichées, pas le texte d'aide
- Les hauts CMC (8+) ont des P2 très bas (~9%) - c'est CORRECT mathématiquement
