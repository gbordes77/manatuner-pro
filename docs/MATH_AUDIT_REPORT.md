# RAPPORT D'AUDIT MATHEMATIQUE - ManaTuner

**Date** : 2026-04-06
**Auditeur** : Claude Opus 4.6 (1M context)
**Version** : main @ 4290f5b
**Scope** : 56 fichiers, 4 moteurs de calcul, 7 implementations hypergeometriques
**Tests** : 197 pass / 0 fail (11 suites)
**Build** : OK (6.18s, 0 erreurs TypeScript)

---

## Verdict Final : PASS

7 bugs trouves et corriges dans cette session. Le code mathematique est desormais correct sur tous les chemins de calcul.

---

## 1. Distribution Hypergeometrique

**Verdict : CORRECT**

### Implementations auditees (4)

| Fichier                    | Methode                                 | Overflow-safe | Utilisation                  |
| -------------------------- | --------------------------------------- | ------------- | ---------------------------- |
| `castability/hypergeom.ts` | Log-factorials (Float64Array, maxN=200) | OUI           | Moteur castabilite principal |
| `advancedMaths.ts`         | Iteratif + cache Map (maxSize=10000)    | OUI           | Moteur Karsten / MC          |
| `manaCalculator.ts`        | Iteratif + memoisation                  | OUI           | Calculs Karsten classiques   |
| `ManaCostRow.tsx`          | Iteratif inline (useMemo)               | OUI           | Affichage par sort           |

Toutes implementent la meme formule correcte :

```
P(X = k) = C(K,k) x C(N-K, n-k) / C(N,n)
```

### Edge cases

Tous geres : `k < 0`, `k > K`, `k > n`, `K > N`, `n > N`, `N = 0`, `K = 0`.

Bug #7 corrige : `manaCalculator.ts:359` ajout gardes `N <= 0 || K < 0 || n < 0 || k < 0` et protection division par zero.

### Verification par calcul manuel

| Scenario                        | Calcul a la main | Code     | Delta    |
| ------------------------------- | ---------------- | -------- | -------- |
| 20/60 sources, 7 cartes, P(>=1) | 0.951726         | 0.951726 | 0.000000 |
| PMF sum (N=60, K=24, n=7)       | 1.000000         | 1.000000 | 0.000000 |
| 24/60 lands, P(>=2 in 7)        | 0.8573           | 0.8573   | 0.0000   |
| 24/60 lands, P(>=1 in 7)        | 0.9784           | 0.9784   | 0.0000   |

### Tests couvrants

46 tests dans `hypergeom.test.ts` — PMF, atLeast, atMost, atLeastOneCopy, complement identity, deck size variants (40/60/100), numerical stability.

---

## 2. Simulation Monte Carlo

**Verdict : CORRECT** (apres correction bugs #1 et #5)

### Fisher-Yates Shuffle

| Fichier                            | Avant                                         | Apres                      |
| ---------------------------------- | --------------------------------------------- | -------------------------- |
| `advancedMaths.ts:344`             | Correct Fisher-Yates                          | Inchange                   |
| `mulliganSimulatorAdvanced.ts:762` | Correct Fisher-Yates                          | Inchange                   |
| `manabase.ts:226`                  | **`.sort(() => Math.random() - 0.5)` BIAISE** | **Corrige : Fisher-Yates** |

**Bug #1 corrige** : Le tri aleatoire par `.sort()` produit une distribution non-uniforme dependant de l'algorithme interne du moteur JS. Remplace par Fisher-Yates standard (backward iteration, swap avec index aleatoire dans [0, i+1]).

### Nombre d'iterations

| Source                                            | Valeur                        | Conforme doc  |
| ------------------------------------------------- | ----------------------------- | ------------- |
| Default (`mulliganSimulator.ts:106`)              | 10,000                        | OUI           |
| UI (`MulliganTab.tsx:793`)                        | 10,000 initial                | OUI           |
| UI option haute precision (`MulliganTab.tsx:801`) | 50,000                        | OUI           |
| Max valide (`types/maths.ts:125`)                 | 100,000                       | OUI           |
| Direct (`analyzeWithArchetype:873`)               | 5,000 (si appele directement) | N/A (interne) |

### Re-shuffle London Mulligan

**Bug #5 corrige** : `advancedMaths.ts:281` — Le commentaire disait "re-shuffle between mulligans" mais le code re-slicait le meme deck. Corrige : re-shuffle Fisher-Yates a chaque tentative de mulligan, conforme aux regles London Mulligan.

### Intervalle de confiance

Wilson score interval (z=1.96, 95%). Formule correcte. Plus precis que Wald pour petits echantillons.

### Generateur aleatoire

`Math.random()` — PRNG non-seedable. Acceptable pour simulations statistiques (pas de besoins crypto). Pas de reproductibilite, ce qui est explicitement voulu.

---

## 3. Equation de Bellman / Mulligan

**Verdict : CORRECT** (apres correction bug #2)

### Implementation

`mulliganSimulatorAdvanced.ts:922-941` — Backward induction correcte :

```
E[V_4] = mean(scores_4)                          // Base case
E[V_5] = mean(max(score_5, E[V_4]))              // Keep 5 if score >= E[V_4]
E[V_6] = mean(max(score_6, E[V_5]))              // Keep 6 if score >= E[V_5]
E[V_7] = mean(max(score_7, E[V_6]))              // Keep 7 if score >= E[V_6]
```

C'est l'equation de Bellman pour l'arret optimal. Les seuils en decoulent :

- `keep7 = round(E[V_6])` — garder 7 si score >= expected value de 6
- `keep6 = round(E[V_5])`
- `keep5 = round(E[V_4])`

### Bug #2 corrige : Recommandation mulligan morte

**Avant** :

```typescript
const mulliganValue = ev6 - ev7 + (ev7 - ev6) // = 0 TOUJOURS
```

**Apres** :

```typescript
const rawEv7 = results[7].scores.reduce((a, b) => a + b, 0) / iterations
const mulliganValue = ev7 - rawEv7 // Gain reel de l'option mulligan
```

`ev7` = EV avec option de mulligan (Bellman). `rawEv7` = EV brute sans mulligan. La difference mesure combien l'option de mulligan ameliore l'expected value. Le message "Mulliganing bad 7s to 6 gains ~X points" s'affiche maintenant correctement.

### London Mulligan

- Draw 7, select best k, bottom (7-k)
- `chooseBottom()` : heuristique de scoring (CMC-based priority)
- `selectBestSubset()` : scoring archetype-specific pour choisir quoi garder
- Re-shuffle entre chaque tentative

### Archetypes

| Archetype | Poids dominants                          | Ideal lands (in 7) | Correct |
| --------- | ---------------------------------------- | ------------------ | ------- |
| Aggro     | curvePlayability 30%, earlyGame 25%      | 1-3                | OUI     |
| Midrange  | manaEfficiency 25%, curvePlayability 25% | 2-4                | OUI     |
| Control   | colorAccess 30%, landCount 30%           | 3-5                | OUI     |
| Combo     | landCount 30%, colorAccess 25%           | 2-4                | OUI     |

---

## 4. Tables de Frank Karsten

**Verdict : CORRECT** (apres correction bug #6)

### Source

"How Many Sources Do You Need to Consistently Cast Your Spells? A 2022 Update" — TCGPlayer/ChannelFireball, Frank Karsten.

### Tables principales (`types/maths.ts:131-179`)

| Pips | T1  | T2  | T3  | T4  | T5  | T6  | T7  | T8  | T9  | T10 |
| ---- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1    | 14  | 13  | 12  | 11  | 10  | 9   | 8   | 8   | 7   | 7   |
| 2    | —   | 20  | 18  | 16  | 15  | 14  | 13  | 12  | 11  | 11  |
| 3    | —   | —   | 23  | 20  | 19  | 18  | 17  | 16  | 15  | 14  |

Toutes les valeurs correspondent au papier Karsten 2022. Copie dans `manaCalculator.ts:17-43` (tronquee T1-T6) egalement correcte.

### Bug #6 corrige : `manabase.ts` KARSTEN_TABLE

**Avant** : Valeurs extrapolees incorrectes (T1 single=13, double=20, triple=27). T1 triple=27 est impossible (un sort CCC coute minimum 3 mana).

**Apres** : Aligne sur Karsten 2022 reel. Valeurs croisees avec les tables canoniques dans `types/maths.ts`.

### Note : Probabilites brutes vs Karsten

Les tables Karsten visent 90% **incluant l'option mulligan**. Les probabilites hypergeometriques pures sont plus basses :

| Sources | Tour | Pips | Hypergeom brut | Cible Karsten |
| ------- | ---- | ---- | -------------- | ------------- |
| 14      | T1   | 1    | 86.1%          | 90%           |
| 13      | T2   | 1    | 87.7%          | 90%           |
| 20      | T2   | 2    | 82.4%          | 90%           |
| 23      | T3   | 3    | 75.5%          | 90%           |

C'est attendu et documente dans les tests (`maths.critical.test.ts:302-303`).

---

## 5. Acceleration de Mana (Rocks & Dorks)

**Verdict : CORRECT**

### Moteur

`castability/acceleratedAnalyticEngine.ts` — 700 lignes. Approche par scenarios disjoints K=0/1/2 producers online.

```
P(cast at T) = P(K=0) x P(cast|0 producers)
             + P(K=1) x P(cast|1 producer)
             + P(K=2) x P(cast|2 producers)
```

### Probabilite producer online

```
P(online at T) = P(draw) x P(castable) x P(survive)
```

- `P(draw)` = `hypergeom.atLeastOneCopy()` — correct
- `P(castable)` = base castability v1.1 (sum over l) — rigoureux
- `P(survive)` = `(1-r)^n` avec `r_effective = r * rockRemovalFactor` pour artefacts — correct

### Parametres

| Param                            | Valeur | Source                                    |
| -------------------------------- | ------ | ----------------------------------------- |
| `DEFAULT_ROCK_REMOVAL_FACTOR`    | 0.3    | Rocks 30% aussi vulnerables que creatures |
| `MAX_PRODUCER_CANDIDATES`        | 18     | Cap performance                           |
| `DEFAULT_ACCELERATION_THRESHOLD` | 0.05   | Minimum 5% pour detecter acceleration     |

### Sol Ring

Correctement modelise via `netManaPerTurn()` : +2 mana incolore au T2 (delay=0 pour artefact, cast T1, online T2).

### Separation Lands only / Realistic

- `base` = `computeBaseCastability()` (terrains seuls)
- `withAcceleration` = `computeAcceleratedCastabilityAtTurn()` (avec producers)
- `accelerationImpact` = delta exact

---

## 6. Health Score

**Verdict : CORRECT**

### Methode

`EnhancedRecommendations.tsx:106-122` — Systeme a penalites degressives depuis 100 :

| Condition                    | Penalite |
| ---------------------------- | -------- |
| `consistency < 0.60`         | -30      |
| `consistency < 0.75`         | -15      |
| `consistency < 0.85`         | -5       |
| `colorScrew > 0.30`          | -20      |
| `colorScrew > 0.20`          | -10      |
| `landRatio < 0.35 ou > 0.45` | -10      |

### Seuils

| Score | Label code | Label doc           | Match |
| ----- | ---------- | ------------------- | ----- |
| >= 85 | Excellent  | "tournament-ready"  | OUI   |
| 70-84 | Good       | "minor adjustments" | OUI   |
| 55-69 | Average    | "needs improvement" | OUI   |
| < 55  | Needs Work | "rebuild required"  | OUI   |

### Verification mono-couleur

Deck 24 Mountains / 36 spells rouges : consistency ~1.0, colorScrew ~0.0, landRatio = 0.40. Score = 100. >90%.

### Note documentation

`llms-full.txt` dit "weighted hypergeometric probabilities". La `consistency` sous-jacente EST derivee de calculs hypergeometriques, mais le Health Score final est un systeme a penalites, pas une moyenne ponderee directe. Techniquement simplification, pas erreur.

---

## 7. Courbe de Mana

**Verdict : CORRECT**

### Cards seen by turn

Coherent dans tous les fichiers apres correction :

| Fichier                 | Play                  | Draw              |
| ----------------------- | --------------------- | ----------------- |
| `hypergeom.ts:25-28`    | `7 + (turn - 1)`      | `7 + turn`        |
| `advancedMaths.ts:161`  | `handSize + turn - 1` | `handSize + turn` |
| `manaCalculator.ts:391` | `handSize + turn - 1` | `handSize + turn` |
| `ManaCostRow.tsx:390`   | `7 + (turn - 1)`      | `7 + turn`        |

### CMC moyen

Exclut les terrains (cmc=0 pour tous les terrains). Correct.

### MDFC

Pas de traitement specifique. Les Modal Double-Faced Cards sont categorises par leur face avant via Scryfall. Feature manquante mais pas un bug.

---

## 8. Play/Draw Toggle

**Verdict : CORRECT** (apres corrections bugs #3 et #4)

### Chaine complete

```
UI Dropdown (AccelerationSettings.tsx)
  → AccelerationContext (playDraw: 'PLAY' | 'DRAW')
    → CastabilityTab (accelContext)
      → ManaCostRow (accelContext.playDraw)
        → useProbabilityCalculation (cardsSeen selon playDraw)  ← BUG #4 CORRIGE
        → useAcceleratedCastability (ctx.playDraw)              ← deja correct
      → TurnByTurnAnalysis (via calculateKarstenProbability)    ← deja correct
```

### Bug #4 corrige : useProbabilityCalculation ignorait playDraw

**Avant** : `const cardsSeen = 7 + (turn - 1)` — toujours "on the play"
**Apres** : `const cardsSeen = playDraw === 'PLAY' ? 7 + (turn - 1) : 7 + turn`

Le parametre `playDraw` est maintenant propage depuis `accelContext` jusqu'au calcul final. Changer "On the Play" → "On the Draw" dans l'UI modifie reellement les probabilites p1/p2 affichees pour chaque sort (+1 carte vue = probas plus hautes).

### Bug #3 corrige : ManaCalculator.calculateManaProbability

Le parametre `_onThePlay` (avec underscore = ignore) a ete renomme `onThePlay` et implemente :

```typescript
const cardsSeen = onThePlay ? handSize + turn - 1 : handSize + turn
```

---

## 9. Coherence Code <-> Documentation

| Affirmation                             | Code                                                | Verdict            |
| --------------------------------------- | --------------------------------------------------- | ------------------ |
| "10,000 hands simulated"                | Default 10k via chemin principal                    | **MATCH**          |
| "Fisher-Yates shuffle"                  | 3 implementations, toutes correctes (apres fix)     | **MATCH**          |
| "configurable up to 50,000"             | UI offre 50k, validation accepte 100k               | **MATCH**          |
| "Bellman equation"                      | Backward induction correcte                         | **MATCH**          |
| "Frank Karsten's research"              | Tables Karsten 2022, source citee                   | **MATCH**          |
| "Hypergeometric distribution"           | 4 implementations correctes                         | **MATCH**          |
| "4 deck archetypes"                     | aggro, midrange, control, combo                     | **MATCH**          |
| "Health Score 85%+ excellent"           | `getScoreLabel(score)` >= 85                        | **MATCH**          |
| "100% local, no tracking"               | Supabase disabled, localStorage only                | **MATCH**          |
| "Mana rocks and dorks support"          | acceleratedAnalyticEngine.ts complet                | **MATCH**          |
| "MC matches hypergeometric within 0.1%" | Possible sur grands echantillons, agressif pour 10k | **APPROX**         |
| "weighted hypergeometric probabilities" | Systeme a penalites (base hypergeom)                | **SIMPLIFICATION** |

---

## 10. Bugs Trouves et Corriges

### Recapitulatif

| #   | Severite | Bug                                                | Fix                                                 | Fichier                            |
| --- | -------- | -------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| 1   | MOYENNE  | Shuffle biaise `.sort(random)`                     | Fisher-Yates standard                               | `manabase.ts:226`                  |
| 2   | MOYENNE  | `mulliganValue = 0` toujours                       | `ev7 - rawEv7` (gain Bellman reel)                  | `mulliganSimulatorAdvanced.ts:989` |
| 3   | HAUTE    | `onThePlay` ignore dans ManaCalculator             | `onThePlay ? h+t-1 : h+t`                           | `manaCalculator.ts:384`            |
| 4   | HAUTE    | Play/Draw toggle ne propage pas aux probas de base | `playDraw` propage dans `useProbabilityCalculation` | `ManaCostRow.tsx:299`              |
| 5   | FAIBLE   | Pas de re-shuffle entre mulligans MC               | Re-shuffle Fisher-Yates chaque tentative            | `advancedMaths.ts:281`             |
| 6   | FAIBLE   | KARSTEN_TABLE valeurs extrapolees                  | Alignement Karsten 2022 reel                        | `manabase.ts:13`                   |
| 7   | FAIBLE   | Division par zero si N=0                           | Gardes `N<=0, K<0, n<0, k<0`                        | `manaCalculator.ts:359`            |

### Bugs #3 et #4 — Impact utilisateur direct

Ces deux bugs faisaient que le bouton "On the Play / On the Draw" dans les reglages d'acceleration ne modifiait PAS les probabilites de castabilite affichees pour chaque sort. Seule l'acceleration (ramp) etait affectee. Apres correction, changer play/draw modifie reellement le nombre de cartes vues (`7+turn-1` vs `7+turn`) et donc toutes les probabilites affichees.

### Bug #2 — Feature silencieusement cassee

La recommandation "Mulliganing bad 7s to 6 gains ~X points" ne s'affichait jamais car la formule `ev6 - ev7 + (ev7 - ev6)` est une identite nulle (= 0). Corrige : mesure desormais le vrai gain Bellman.

---

## 11. Architecture Mathematique — Vue d'ensemble

```
                    ┌─────────────────────────┐
                    │   UI: AccelerationSettings   │
                    │   (playDraw, format, rate)    │
                    └──────────┬──────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │  AccelerationContext     │
                    │  (accelContext: AccelCtx) │
                    └──────────┬──────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
   ┌──────▼──────┐    ┌───────▼───────┐    ┌───────▼───────┐
   │ ManaCostRow  │    │ TurnByTurn   │    │ MulliganTab   │
   │ (par sort)   │    │ (graphiques) │    │ (simulation)  │
   └──────┬──────┘    └───────┬───────┘    └───────┬───────┘
          │                    │                    │
   ┌──────▼──────┐    ┌───────▼───────┐    ┌───────▼────────┐
   │ useProbCalc  │    │ advancedMaths │    │ mulliganSim    │
   │ (hypergeom)  │    │ (Karsten)    │    │ Advanced       │
   │ + useAccel   │    │              │    │ (Bellman + MC) │
   └──────┬──────┘    └──────────────┘    └────────────────┘
          │
   ┌──────▼───────────────┐
   │ acceleratedAnalytic   │
   │ Engine (v1.1)         │
   │ K=0/1/2 scenarios     │
   └──────┬───────────────┘
          │
   ┌──────▼──────┐
   │ hypergeom.ts │
   │ (log-space)  │
   └─────────────┘
```

---

## 12. Recommandations Futures

| #   | Item                                                 | Impact                        | Effort  |
| --- | ---------------------------------------------------- | ----------------------------- | ------- |
| 1   | Support MDFC (terrain/sort dual-face)                | Precision pour Modern/Pioneer | Moyen   |
| 2   | Consolider les 4 implementations hypergeometriques   | Maintenabilite                | Faible  |
| 3   | Consolider les 3 copies de KARSTEN_TABLES            | Maintenabilite                | Faible  |
| 4   | Preciser doc Health Score ("penalty-based")          | Transparence                  | Trivial |
| 5   | Ajouter seed PRNG optionnel pour reproductibilite MC | Tests, debug                  | Faible  |

---

## Annexe : Commandes de Verification

```bash
# Lancer tous les tests math
npx vitest run src/services/castability/__tests__/ src/services/__tests__/

# Verification manuelle hypergeometrique
node -e "
function C(n,k){if(k>n||k<0)return 0;if(k===0||k===n)return 1;let r=1;for(let i=0;i<Math.min(k,n-k);i++)r=r*(n-i)/(i+1);return r}
function P(N,K,n,kMin){let s=0;for(let k=kMin;k<=Math.min(K,n);k++)s+=C(K,k)*C(N-K,n-k)/C(N,n);return s}
console.log('14 sources T1:', P(60,14,7,1).toFixed(4))   // 0.8614
console.log('20 sources T2:', P(60,20,8,2).toFixed(4))    // 0.8242
console.log('23 sources T3:', P(60,23,9,3).toFixed(4))    // 0.7553
"

# Build complet
npm run build
```
