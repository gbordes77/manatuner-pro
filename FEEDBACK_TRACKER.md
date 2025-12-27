# ManaTuner Pro - Feedback Tracker

**Date de création**: 2025-12-27  
**Source**: Retours utilisateurs via captures d'écran

---

## Résumé

| ID | Écran | Type | Priorité | Status |
|----|-------|------|----------|--------|
| FB-001 | Castability | UX/Documentation | - | RESOLVED |
| FB-002 | Dashboard | UX/Documentation | P2 | TODO |
| FB-003 | Mulligan | UX/Documentation | P1 | TODO |
| FB-004 | Analysis | Bug | P1 | TODO |
| FB-005 | Analysis | Feature | P3 | TODO |
| FB-006 | Manabase | Bug | P0 | TODO |
| FB-007 | Blueprint | Positif | - | N/A |
| FB-008 | Castability | Feature/Design | P2 | TODO |
| FB-009 | Dashboard | Bug/UI | P1 | TODO |
| FB-010 | Manabase | Bug | P0 | TODO |
| FB-011 | Castability | Bug | P1 | TODO |

---

## Détails des Feedbacks

### FB-001: Castability - Différence P1 vs P2 pas claire

**Écran**: Castability Tab  
**Type**: UX/Documentation  
**Priorité**: -  
**Status**: RESOLVED

**Description**:  
L'utilisateur ne comprend pas la différence entre "P1 (Perfect)" et "P2 (Realistic)" affichés pour chaque carte (ex: 53% vs 52%).

**Résolution**:  
L'info est déjà présente :
- Tooltip au survol du "?" à côté de P1/P2
- Légende en bas de page : "P1 = Perfect scenario (all lands on curve) | P2 = Realistic (accounts for mana screw)"

**Conclusion**: Pas d'action requise, l'UX est suffisante.

---

### FB-002: Dashboard - Calcul du Manabase Health pas expliqué

**Écran**: Dashboard Tab  
**Type**: UX/Documentation  
**Priorité**: P2  
**Status**: TODO

**Description**:  
L'utilisateur ne comprend pas comment le "Manabase Health" global (75% "Good") est calculé.

**Capture**: Widget "MANABASE HEALTH" affichant 75% avec badge "Good"

**Action requise**:  
- Ajouter un tooltip ou un "?" cliquable expliquant la formule
- Référencer les Karsten Tables et le calcul hypergeométrique
- Expliquer les seuils (Good/Average/Poor)

**Fichiers concernés**:  
- `src/components/analyzer/DashboardTab.tsx`
- `src/services/manaCalculator.ts` (pour documenter la formule)

**Effort estimé**: 2h

---

### FB-003: Mulligan - Informations pas claires

**Écran**: Mulligan Tab  
**Type**: UX/Documentation  
**Priorité**: P1  
**Status**: TODO

**Description**:  
L'utilisateur ne comprend pas les informations affichées :
- "Midrange Deck Quality: GOOD (Score: 77/100)"
- Les 4 métriques : 77 (Avg. 7 cards), 74 (Avg. 6 cards), 74 (Thresh. 7), 70 (Thresh. 6)
- "Optimal Strategy" avec les barres colorées et seuils (Score >= 74, 70, 61)

**Capture**: Section Mulligan avec scores et barres de stratégie

**Action requise**:  
- Ajouter des tooltips explicatifs sur chaque métrique
- Clarifier ce que signifie "Avg. 7 cards" vs "Thresh. 7"
- Expliquer la section "Optimal Strategy" (Keep 7/6/5 cards if: Score >= X)
- Peut-être ajouter un mini-guide ou lien vers /mathematics

**Fichiers concernés**:  
- `src/components/analyzer/MulliganTab.tsx`

**Effort estimé**: 3-4h

---

### FB-004: Analysis - Crash au premier accès

**Écran**: Analysis Tab (Manabase Analysis)  
**Type**: Bug  
**Priorité**: P1  
**Status**: TODO

**Description**:  
L'utilisateur a eu un crash la première fois qu'il a accédé à l'onglet Analysis, puis ça a fonctionné ensuite.

**Hypothèses**:  
- Race condition sur le chargement des données
- État non initialisé lors du premier rendu
- Erreur dans un useEffect avec dépendances manquantes

**Action requise**:  
- Investiguer les logs console
- Vérifier les error boundaries
- Ajouter Sentry pour capturer ces erreurs en prod
- Revoir les useEffect dans les composants Analysis

**Fichiers concernés**:  
- `src/components/analyzer/AnalysisTab.tsx`
- `src/components/analysis/*.tsx`

**Effort estimé**: 2-4h (investigation + fix)

---

### FB-005: Analysis - Merger avec Dashboard ?

**Écran**: Analysis Tab  
**Type**: Feature/UX  
**Priorité**: P3  
**Status**: TODO

**Description**:  
L'utilisateur trouve l'écran Analysis "très clair et synthétique" mais suggère de le merger avec Dashboard car redondant.

**Action requise**:  
- Évaluer la pertinence de fusionner les deux onglets
- Ou clarifier la différence de purpose entre Dashboard et Analysis
- Dashboard = vue rapide/résumé
- Analysis = vue détaillée/deep dive

**Fichiers concernés**:  
- `src/components/analyzer/DashboardTab.tsx`
- `src/components/analyzer/AnalysisTab.tsx`
- `src/pages/AnalyzerPage.tsx`

**Effort estimé**: Discussion produit + 4-8h si fusion

---

### FB-006: Manabase - "Foggy Bottom Swamp" confondu avec "Swampsnare Trap"

**Écran**: Manabase Tab  
**Type**: Bug  
**Priorité**: P0  
**Status**: TODO

**Description**:  
"Swampsnare Trap" apparaît dans l'analyse alors que la carte n'est PAS dans le deck !

La carte réelle dans le deck est "Foggy Bottom Swamp" (TLA) 269 - un vrai terrain.

**Capture**: Land Breakdown montrant "Swampsnare Trap" sous "Other Land (1 types)"

**Cause probable**:  
- Recherche Scryfall fuzzy trop permissive
- "Swamp" dans "Foggy Bottom Swamp" matche "Swampsnare Trap"
- Ou problème de cache avec mauvaise association
- Ou parser qui tronque/modifie le nom

**Action requise**:  
1. Investiguer la logique de recherche Scryfall (`scryfall.ts`)
2. Vérifier le cache (`landCacheService.ts`)
3. Utiliser le set code (TLA) + collector number (269) pour identifier précisément
4. Ajouter des tests avec "Foggy Bottom Swamp"

**Fichiers concernés**:  
- `src/services/scryfall.ts`
- `src/services/landCacheService.ts`
- `src/services/landService.ts`
- `src/services/deckAnalyzer.ts`

**Effort estimé**: 3-4h

---

### FB-007: Blueprint - Feedback positif

**Écran**: Blueprint/Export  
**Type**: Positif  
**Priorité**: N/A  
**Status**: N/A

**Description**:  
"Joli récap bien visuel, j'aime bien" (même si noté comme redondant avec les autres écrans).

**Action**: Aucune - conserver tel quel.

---

### FB-008: Castability - Cartes avec X dans le coût mal gérées

**Écran**: Castability Tab  
**Type**: Feature/Design  
**Priorité**: P2  
**Status**: TODO

**Description**:  
Les cartes avec X dans le coût de mana sont traitées comme si X=0, ce qui donne des résultats trompeurs.

**Exemple**: "United Front" (coût: {X}{W}{W}) est considéré comme un drop 2 (CMC=2) alors qu'on ne voudra jamais la caster avec X=0.

**Capture**: United Front affichée avec CMC: 2, P1: 21%, P2: 19%

**Complexité**:  
- Définir une valeur de X par défaut est difficile car ça dépend de chaque carte
- Certaines cartes X sont jouables à X=1, d'autres à X=3+
- Le "bon" X dépend aussi de l'archétype du deck

**Options de solution**:

1. **Option A - X minimum contextuel** (complexe)
   - Analyser le texte de la carte pour deviner un X minimum utile
   - Ex: "Create X tokens" → X=1 minimum
   - Ex: "Deal X damage" → X=1 minimum
   - Ex: Converge comme United Front → X=nombre de couleurs du deck

2. **Option B - X par défaut = 1 ou 2** (simple)
   - Traiter toutes les cartes X comme CMC+1 ou CMC+2
   - Plus simple mais pas toujours juste

3. **Option C - Permettre à l'utilisateur de définir X** (UX)
   - Ajouter un input pour que l'utilisateur définisse la valeur de X souhaitée
   - Meilleure précision mais plus de friction

4. **Option D - Exclure les cartes X de l'analyse** (workaround)
   - Afficher un warning "Cartes X non analysées"
   - Laisser l'utilisateur juger

**Recommandation**: Option B (X=2 par défaut) + Option C (override utilisateur) en P3

**Fichiers concernés**:  
- `src/services/deckAnalyzer.ts` (parsing du coût)
- `src/services/manaCalculator.ts` (calcul des probas)
- `src/components/analyzer/CastabilityTab.tsx` (affichage)

**Effort estimé**: 
- Option B seule: 2-3h
- Option B + C: 4-6h

---

### FB-009: Dashboard - Légende "Category Distribution" tronquée

**Écran**: Dashboard Tab  
**Type**: Bug/UI  
**Priorité**: P1  
**Status**: TODO

**Description**:  
La légende du graphique "Category Distribution" (donut chart) est coupée en bas. On voit "Weak: 3 (15%)" partiellement et "Critical" est tronqué.

**Capture**: Donut chart avec légende coupée après "Weak"

**Cause probable**:  
- Container avec hauteur fixe insuffisante
- Overflow hidden sur le parent
- Légende positionnée en bas sans espace suffisant

**Action requise**:  
- Augmenter la hauteur du container du graphique
- Ou passer la légende sur le côté droit au lieu du bas
- Ou utiliser `overflow: visible` si approprié

**Fichiers concernés**:  
- `src/components/analyzer/DashboardTab.tsx`
- `src/components/EnhancedCharts.tsx` (si le chart est là)

**Effort estimé**: 30min - 1h

---

### FB-010: Manabase - "Path to Redemption" détecté comme terrain

**Écran**: Manabase Tab  
**Type**: Bug  
**Priorité**: P0  
**Status**: TODO

**Description**:  
"Path to Redemption" (TLA) est incorrectement classé comme "Other Land" alors que c'est un sort (probablement un instant ou sorcery).

**Capture**: Land Breakdown montrant "Path to Redemption" sous "Other Land (2 types)"

**Cause**: Même problème que FB-006 - détection basée sur le nom (contient "Path" qui peut matcher des patterns de terrains type "Path of..." ?)

**Lien**: À fusionner avec FB-006 - même root cause

**Fichiers concernés**:  
- `src/services/landService.ts`
- `src/utils/landDetection.ts`

**Effort estimé**: Inclus dans FB-006

---

### FB-011: Castability - Coûts hybrides (W/R) mal gérés

**Écran**: Castability Tab  
**Type**: Bug  
**Priorité**: P1  
**Status**: TODO

**Description**:  
Les cartes avec des coûts de mana hybrides ne sont pas correctement analysées.

**Exemple**: "Wandering Musicians" coûte {3}{W/R} mais l'analyse ne prend pas en compte que le mana hybride peut être payé par W OU R.

**Capture**: Wandering Musicians avec probabilité très basse (rouge) alors qu'avec 5 Plains + le coût hybride payable en W, ça devrait être castable.

**Impact**:  
- Probabilités de cast incorrectes pour les cartes hybrides
- Fausse alerte "Critical Issues" pour des cartes facilement castables

**Action requise**:  
- Parser correctement les coûts hybrides {W/R}, {U/B}, etc.
- Dans le calcul de proba, considérer que le mana hybride peut être payé par l'une OU l'autre couleur
- Mettre à jour la logique dans manaCalculator

**Fichiers concernés**:  
- `src/services/deckAnalyzer.ts` (parsing du coût)
- `src/services/manaCalculator.ts` (calcul des probas)

**Effort estimé**: 3-4h

---

## Notes additionnelles

### Point positif mentionné
- Les creatures cyclers (comme Canyon Crawler) sont bien prises en compte comme sources de mana.

---

## Decklists de Test

### Decklist #1 - "Avatar TLA" (pour FB-006, FB-008, FB-009)

Utilisée pour reproduire :
- **FB-006**: Swampsnare Trap détecté comme terrain (NOTE: pas dans cette liste, voir Decklist #2)
- **FB-008**: United Front avec X dans le coût
- **FB-009**: Légende Category Distribution tronquée

```
Deck
1 United Front (TLA) 39
2 Swamp (ELD) 258
1 Aang, the Last Airbender (TLA) 4
1 Momo, Playful Pet (TLA) 30
1 Glider Staff (TLA) 22
1 Water Tribe Captain (TLA) 41
1 Jeong Jeong's Deserters (TLA) 25
2 Compassionate Healer (TLA) 13
1 Enter the Avatar State (TLA) 18
1 Heartless Act (TLA) 103
1 Mountain (DMU) 273
1 The Fire Nation Drill (TLA) 98
1 Boiling Rock Prison (TLA) 267
1 Misty Palms Oasis (TLA) 273
1 Omashu City (TLA) 275
1 Foggy Bottom Swamp (TLA) 269
1 Rumble Arena (TLA) 277
1 Iroh, Grand Lotus (TLA) 227
2 Island (M20) 265
6 Plains (TDM) 277
1 Razor Rings (TLA) 33
1 Azula, Cunning Usurper (TLA) 208
1 Ba Sing Se (TLA) 266
2 Lost Days (TLA) 62
1 Airbender's Reversal (TLA) 7
1 Deadly Precision (TLA) 95
2 Aang's Journey (TLA) 1
1 Hei Bai, Spirit of Balance (TLA) 225
1 Abandon Attachments (TLA) 205
1 Messenger Hawk (TLA) 234
```

### Decklist #2 - "Aang Draft" (pour FB-010, FB-011)

Utilisée pour reproduire :
- **FB-010**: Path to Redemption détecté comme terrain
- **FB-011**: Wandering Musicians (coût hybride W/R) mal analysé

```
Deck
1 Aang, the Last Airbender (TLA) 4
1 Aang, at the Crossroads (TLA) 203
1 Knowledge Seeker (TLA) 60
2 Octopus Form (TLA) 66
1 It'll Quench Ya! (TLA) 58
1 Jasmine Dragon Tea Shop (TLA) 270
1 Barrels of Blasting Jelly (TLA) 254
1 Forecasting Fortune Teller (TLA) 51
1 Katara, Bending Prodigy (TLA) 59
1 Gran-Gran (TLA) 54
1 Earth Kingdom Protectors (TLA) 17
1 Path to Redemption (TLA) 31
1 Ty Lee, Chi Blocker (TLA) 76
1 Watery Grasp (TLA) 82
1 Fire Nation Warship (TLA) 256
1 Giant Koi (TLA) 53
1 Bumi, King of Three Trials (TLA) 169
2 Water Tribe Captain (TLA) 41
1 Allies at Last (TLA) 164
1 Rumble Arena (TLA) 277
1 Kyoshi Village (TLA) 271
1 Geyser Leaper (TLA) 52
1 Forest (DAR) 266
8 Island (M20) 265
1 Wandering Musicians (TLA) 250
1 Bender's Waterskin (TLA) 255
5 Plains (TDM) 277
```

### Decklist #3 - C'est la même que #1 (pour FB-006)

**IMPORTANT**: La liste ne contient PAS "Swampsnare Trap" !

Le bug est plus subtil : la carte "Foggy Bottom Swamp" (TLA) 269 (un vrai terrain) a été remplacée/confondue avec "Swampsnare Trap" lors de la recherche Scryfall.

**Hypothèse**: Le mot "Swamp" dans "Foggy Bottom Swamp" a déclenché une recherche fuzzy qui a retourné "Swampsnare Trap" à la place.

**À investiguer**:
- Logique de recherche Scryfall (fuzzy match trop permissif ?)
- Cache qui aurait stocké une mauvaise association
- Parser qui tronque/modifie le nom de la carte

### Prochaines étapes
1. **P0**: Fixer le bug Swampsnare Trap (FB-006)
2. **P1**: Investiguer le crash Analysis (FB-004)
3. **P1**: Clarifier l'onglet Mulligan (FB-003)
4. **P2**: Ajouter documentation P1/P2 et Health Score (FB-001, FB-002)

---

*Dernière mise à jour: 2025-12-27*
