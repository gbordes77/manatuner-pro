# ManaTuner Pro - Expert Analyses Collection

> **Purpose**: This document collects expert analyses and recommendations for implementing mana rocks, dorks, and non-land mana producers into the castability calculation system.
> 
> **Reference**: See `CASTABILITY_TECHNICAL.md` for current system documentation.

---

## Table of Contents

1. [Analysis #1: Mathematical & Algorithmic Modeling (Gemini 2.5 Pro)](#analysis-1-mathematical--algorithmic-modeling)
2. [Analysis #2: Disjoint Scenarios Approach (Gemini 3)](#analysis-2-disjoint-scenarios-approach)
3. [Analysis #3: Literature Review & Industry Benchmarks](#analysis-3-literature-review--industry-benchmarks)
4. [Analysis #4: Consolidated Implementation Specification](#analysis-4-consolidated-implementation-specification)
5. [Analysis #5: Unified Mathematical Model & UX Integration](#analysis-5-unified-mathematical-model--ux-integration)
6. [Updated Final Synthesis](#updated-final-synthesis)

---

# Analysis #1: Mathematical & Algorithmic Modeling

**Source**: Gemini 2.5 Pro Deep Research  
**Date**: December 2025  
**Focus**: Complete mathematical and algorithmic architecture

---

## 1. Introduction et Cadrage Stratégique

### 1.1 Contexte et Enjeux de la Consultation

L'évolution du jeu Magic: The Gathering (MTG) vers des formats de plus en plus rapides et interactifs, tels que le Modern, le Legacy et le Commander compétitif (cEDH), a rendu obsolètes les modèles traditionnels d'analyse de base de mana. Historiquement, les calculateurs de probabilités se sont appuyés sur des modèles statiques, principalement la distribution hypergéométrique, pour évaluer la consistance d'un deck. Ces modèles postulent que les terrains (Lands) sont les seules sources fiables de mana. Or, dans la réalité du jeu contemporain, l'accélération de mana via des créatures (mana dorks), des artefacts (mana rocks) et des sorts temporaires (rituels, trésors) constitue l'épine dorsale des stratégies compétitives.

Le projet ManaTuner Pro ambitionne de combler cette lacune technologique. L'objectif est de développer un moteur de calcul capable d'intégrer ces variables dynamiques pour fournir une estimation précise de la "Castability" (probabilité de lancer un sort). Le défi est double : modéliser mathématiquement des interactions complexes (dépendances séquentielles, vulnérabilité aux interactions adverses, coûts d'opportunité) tout en respectant des contraintes de performance strictes (<100ms dans un environnement navigateur client-side).

Ce rapport propose une architecture mathématique et algorithmique complète pour répondre à ce besoin. Il ne se contente pas de fournir des formules, mais analyse en profondeur les implications systémiques de chaque choix de modélisation, en s'appuyant sur la théorie des probabilités, l'analyse combinatoire et la simulation de Monte Carlo.

### 1.2 Limites des Modèles Actuels (P1/P2)

Le système actuel de ManaTuner Pro utilise deux métriques :
- **P1 (Perfect)** : Probabilité hypergéométrique simple d'avoir les sources de couleur requises parmi les terrains.
- **P2 (Realistic)** : P1 pondéré par la probabilité de piocher le nombre requis de terrains.

Cette approche présente une faille critique : **l'Hypothèse d'Indépendance**. La loi hypergéométrique suppose que chaque tirage est indépendant des autres en termes de valeur fonctionnelle. Or, un Llanowar Elves (Dork) est fonctionnellement dépendant d'un terrain vert (Forest) pour être joué au Tour 1. Sans ce terrain, le Dork est une carte morte qui ne produit pas de mana.

De plus, les modèles actuels échouent à capturer la **Vélocité du Mana (Mana Velocity)**. Un terrain produit +1 mana par tour de manière linéaire. Un Sol Ring produit +2 mana pour un coût de 1, créant une accélération exponentielle des ressources disponibles. Ignorer ces facteurs conduit à sous-estimer drastiquement la puissance des decks "Ramp" et artefact-centriques, faussant ainsi les décisions de construction de deck des utilisateurs.

### 1.3 Objectifs du Rapport

Ce document a pour vocation de :
1. Définir une taxonomie rigoureuse des sources de mana non-terrestres.
2. Proposer un modèle mathématique pour la disponibilité des ressources (Q1, Q3).
3. Quantifier le risque et la variance associés aux sources vulnérables (Q4).
4. Résoudre le problème des dépendances séquentielles par une approche algorithmique hybride (Q2, Q5).
5. Fournir des spécifications techniques pour l'implémentation en TypeScript/React.

---

## 2. Fondements Théoriques : Au-delà de l'Hypergéométrique

### 2.1 Analyse de la Distribution Hypergéométrique Multivariée (MVHGD)

Pour comprendre pourquoi l'approche actuelle est insuffisante, il faut examiner la théorie sous-jacente. La distribution hypergéométrique répond à la question : "Quelle est la probabilité d'obtenir k succès dans un échantillon de taille n tiré d'une population N?"

```
P(X=k) = C(K,k) × C(N-K, n-k) / C(N,n)
```

Dans un contexte MTG incluant des sources variées, nous devons passer à une distribution multivariée. Soit un deck contenant N cartes réparties en plusieurs catégories : Terrains (L), Dorks (D), Rocks (R), et Sorts (S). La probabilité d'une main initiale (n=7) contenant une configuration spécifique (l, d, r, s) est donnée par :

```
P(L=l, D=d, R=r, S=s) = C(N_L,l) × C(N_D,d) × C(N_R,r) × C(N_S,s) / C(N,n)
```

Bien que cette formule soit exacte pour décrire le contenu de la main, **elle ne nous renseigne pas sur la jouabilité de la main**.

Par exemple, une main contenant 0 Terrains et 2 Mox Diamond a une probabilité non nulle d'exister. Cependant, le Mox Diamond requiert de défausser un terrain pour entrer en jeu. Mathématiquement, la MVHGD dirait "Vous avez 2 sources de mana", alors que la réalité du jeu dicte "Vous avez 0 mana utilisable".

**C'est ici que réside la limite infranchissable des formules fermées : elles ne capturent pas les conditions d'activation ni le séquençage temporel.**

### 2.2 La Nécessité des Chaînes de Markov

Le mana dans Magic n'est pas un stock statique, c'est un flux dynamique accumulé au fil des tours. Le mana disponible au temps t+1 dépend strictement des décisions prises au temps t.

Nous pouvons modéliser l'état du système (le plateau de jeu) comme un vecteur d'état S_t dans une Chaîne de Markov :

```
S_t = { ManaDispo_t, SourcesActives_t, Main_t, DroitDeJeu_t }
```

La transition vers S_{t+1} est probabiliste et décisionnelle :

```
S_{t+1} = f(S_t, Pioche_{t+1}, Décision_t, Survie_t)
```

L'introduction de la variable `Décision_t` (choisir de jouer un Dork plutôt qu'un autre sort) et `Survie_t` (probabilité que le Dork ne soit pas détruit) rend la résolution analytique pure extrêmement complexe. Tenter de résoudre ce système par des équations fermées pour Q1 et Q2 conduirait à une explosion combinatoire ingérable pour un navigateur web.

**Cela confirme dès à présent que la réponse à la Q5 (Méthode de combinaison) ne peut pas être un calcul additif simple ni une formule conditionnelle statique, mais doit s'orienter vers une simulation stochastique.**

---

## 3. Taxonomie et Modélisation Vectorielle des Sources

Pour intégrer correctement les sources dans l'algorithme, nous ne pouvons pas les traiter comme de simples "Terrains + X". Chaque source doit être définie par un vecteur de propriétés qui influencent son coût, son timing et son risque.

### 3.1 Classification Fonctionnelle

| Type de Source | Exemples | Coût (C) | Délai (Lag) | Risque (R) | Persistance (P) | Notes Spéciales |
|----------------|----------|----------|-------------|------------|-----------------|-----------------|
| Basic Land | Forest, Mountain | 0 | 0 | Quasi-nul | Permanente | Référence de base |
| Tapland | Triome, Gate | 0 | 1 | Quasi-nul | Permanente | Produit à T+1 |
| Mana Dork | Llanowar Elves | 1 | 1 | Haut | Permanente | Soumis au mal d'invocation |
| Haste Dork | Orcish Lumberjack | 1 | 0 | Haut | Permanente | Produit immédiatement |
| Fast Rock | Sol Ring, Mana Crypt | X | 0 | Moyen | Permanente | Souvent Mana Positif (Prod > Cost) |
| Slow Rock | Arcane Signet | 2 | 0 | Moyen | Permanente | Produit immédiatement mais consomme le tour |
| Rituel | Dark Ritual, Rite of Flame | X | 0 | Nul (Stack) | Instantanée | Burst mana, non réutilisable |
| Treasure | Dockside Extortionist | X | 0 | Moyen | Unique | Token sacrifiable |
| Conditional | Mox Diamond | 0 | 0 | Moyen | Permanente | Coût additionnel (Discard Land) |

### 3.2 Modélisation du "Net Mana Flow" (Réponse à Q3)

La question Q3 concernant les "Rocks avec coût" (Arcane Signet) est centrale. Pour un calculateur de castability, la seule métrique qui compte est : **"Est-ce que jouer cette carte me permet de lancer mon sort cible plus tôt?"**

Nous introduisons le concept de **Net Mana Flow (NMF)**.

Pour une source S jouée au tour T_play :
- `Cost(S)` : Mana dépensé au tour T_play
- `Prod(S)` : Mana produit par la source
- `Usable(S, T)` : 1 si la source est dégagée et utilisable au tour T, 0 sinon

Le bilan mana au tour T_play est :

```
NMF(T_play) = -Cost(S) + (Prod(S) × Usable(S, T_play))
```

**Exemples :**

**Sol Ring** (Coût 1, Prod 2, Usable T1) :
- `NMF(T_play) = -1 + 2 = +1`
- ⇒ Accélération immédiate. Le Sol Ring agit comme un terrain supplémentaire et un rituel dès le tour où il est joué.

**Arcane Signet** (Coût 2, Prod 1, Usable T1) :
- `NMF(T_play) = -2 + 1 = -1`
- ⇒ Décélération immédiate. On perd 1 mana effectif ce tour-ci pour gagner +1 mana permanent aux tours suivants.

**Llanowar Elves** (Coût 1, Prod 1, Lag 1, Usable T+1) :
- `NMF(T_play) = -1 + 0 = -1`
- `NMF(T_play+1) = +1`

**Recommandation d'Implémentation :**

L'algorithme ne doit pas simplement vérifier si la source est "disponible". Il doit calculer si l'investissement en NMF négatif au tour T est rentabilisé avant le tour cible T_target.

---

## 4. Analyse des Risques et Probabilités de Survie (Q4)

### 4.1 Modélisation de la Fonction de Survie

La probabilité qu'un Dork survive jusqu'au tour T dépend de deux facteurs :
1. **L'environnement (Format Meta)** : La densité de sorts de gestion (removal) dans les decks adverses.
2. **L'exposition temporelle** : Plus le dork reste en jeu longtemps, plus la probabilité cumulée qu'il soit détruit augmente.

Nous modélisons la survie selon une **loi de décroissance géométrique** :

```
P(S_t) = (1 - r)^t
```

Où :
- `P(S_t)` est la probabilité de survie au temps t (nombre de tours adverses passés)
- `r` est le "Taux d'Attrition par Tour" (Removal Rate)

### 4.2 Calibration du Paramètre r par Format

**Format Modern & Legacy (Haute Interaction)**

Ces formats sont définis par l'efficacité des réponses (Lightning Bolt, Fatal Push, Swords to Plowshares, Orcish Bowmasters). Un Dork T1 est une cible prioritaire ("Bolt the Bird").

- Estimation : Un joueur a ~40-50% de chances d'avoir un removal à 1 mana en main de départ.
- **r_Modern ≈ 0.35 - 0.45**
- Implication : Un Birds of Paradise a moins de 20% de chances de survivre 3 tours.

**Format Standard (Interaction Modérée)**

Les removals coûtent souvent 2 manas (Go for the Throat) ou sont conditionnels (Cut Down). Le tempo perdu à tuer un dork à 1 mana avec un sort à 2 manas est défavorable pour l'adversaire.

- **r_Standard ≈ 0.15 - 0.20**

**Commander / EDH (Interaction Contextuelle)**

C'est le cas le plus complexe.

- **cEDH** : Les removals sont gratuits (Mental Misstep, Snuff Out) mais souvent conservés pour empêcher une victoire immédiate. Les dorks sont souvent ignorés sauf s'ils permettent une victoire rapide.
  - r_cEDH ≈ 0.15 (Early game), 0.80 (Board Wipe Turn 4-5)

- **Casual EDH** : Le "Contrat Social" et la nature multijoueur découragent le "Spot Removal" sur les sources de mana. Cependant, les "Board Wipes" sont fréquents vers le tour 6+.
  - r_Casual ≈ 0.05 (Tours 1-4), 0.50 (Tours 5+)

### 4.3 Recommandation pour l'Interface Utilisateur

Plutôt que de coder ces valeurs en dur, l'outil ManaTuner Pro devrait offrir un réglage de simulation : **"Interaction Adversaire"**.

| Niveau | Valeur r | Description UX |
|--------|----------|----------------|
| Goldfish | 0.00 | Pas d'interaction (Test pur de vitesse) |
| Faible | 0.10 | Tables Casual EDH, peu de removals |
| Moyen | 0.25 | Standard, High-Power EDH |
| Élevé | 0.45 | Modern, Legacy, cEDH (Environnement hostile) |

Pour le calcul de la castability "On Curve" (ex: Sort T3), la probabilité effective du mana d'un dork joué T1 est :

```
Mana_eff = 1 × (1-r)²
```

Si r=0.45, le dork ne vaut que **0.30 mana** au tour 3. Cela reflète parfaitement la réalité compétitive : on ne peut pas compter sur un Elfe pour lancer un sort crucial T3 en Modern.

---

## 5. Architecture Algorithmique : La Solution Hybride "Smart Monte Carlo"

### 5.1 Pourquoi le Monte Carlo est inévitable (Q2 & Q5)

La question Q5 interroge sur la méthode de combinaison : Additif, Conditionnel ou Monte Carlo.

| Approche | Verdict | Raison |
|----------|---------|--------|
| **Additif** (P_lands + P_dorks) | ❌ Faux | Ne gère pas la dépendance aux couleurs ni le séquençage |
| **Conditionnel Analytique** | ⚠️ Limité | Possible pour cas simples, explosion combinatoire sinon |
| **Monte Carlo** | ✅ Recommandé | Norme industrielle pour systèmes complexes |

Cependant, le Monte Carlo classique (simuler des parties entières) est trop lent pour le web (<100ms). Nous proposons une variante optimisée : le **"Mana Ramp Simulation" (MRS)**.

### 5.2 Algorithme "Mana Ramp Simulation" (MRS)

L'idée est de ne simuler que les aspects pertinents à la production de mana, en ignorant le combat, les points de vie, et les interactions adverses autres que la destruction de sources.

#### Phase 1 : Initialisation et Structure de Données

Le deck est converti en un tableau d'objets légers (Integers ou Bitmasks pour la performance JS).

```
CardID (Int)
Type (Enum: LAND, DORK, ROCK, SPELL)
Cost (Bitmask pour couleurs + Int pour Generic)
Prod (Bitmask pour couleurs produites)
```

#### Phase 2 : Le Mulligan "Intelligent" (Facteur critique)

Une simulation réaliste DOIT inclure une logique de Mulligan adaptée aux dorks.

- **Logique Standard** : Garder si 2-5 Lands
- **Logique Ramp** : Garder si (2-5 Lands) OU (1 Land ET 1 Low-Cost Mana Source ET Land produit couleur du Dork)

**Insight Important** : L'algorithme doit simuler le "London Mulligan". Si la main est mauvaise, on re-pioche 7 cartes, on en met 1 en dessous. La simulation doit choisir la carte à mettre en dessous.

#### Phase 3 : La Boucle de Simulation (Core Loop)

Pour répondre à la contrainte <100ms, nous visons **2500 itérations**.

**Pourquoi 2500?** Avec N=2500, la marge d'erreur pour une probabilité p=0.5 est de :

```
E = 1.96 × √(0.5 × 0.5 / 2500) ≈ 0.0196 (1.96%)
```

Une précision de ±2% est largement suffisante pour un outil d'aide à la décision.

#### Pseudo-Code de la Boucle (Optimisé)

```typescript
function simulateCastability(deck, targetSpell, targetTurn, removalRate) {
  let successes = 0;
  const iterations = 2500;

  for (let i = 0; i < iterations; i++) {
    // 1. Draw & Mulligan
    let hand = drawOpeningHand(deck);
    hand = performSmartMulligan(hand, deck);

    let board = [];
    let manaPool = { W:0, U:0, B:0, R:0, G:0, C:0 };
    
    // 2. Turn Loop
    for (let turn = 1; turn <= targetTurn; turn++) {
      // A. Upkeep (Reset Mana)
      resetMana(manaPool);
      
      // B. Draw (sauf T1 play)
      if (turn > 1) hand.push(drawCard(deck));

      // C. Survival Check (Q4)
      board = board.filter(source => 
        !source.isCreature || Math.random() > removalRate
      );

      // D. Generate Potential Mana
      let potentialMana = calculatePotentialMana(board, manaPool);
      
      // E. Check Castability (Win Condition)
      if (canCast(targetSpell, potentialMana)) {
        successes++;
        break;
      }

      // F. Main Phase : Play Sources (Q2 - Recursion)
      playOptimalLand(hand, board);
      playOptimalRamp(hand, board, potentialMana);
    }
  }
  return successes / iterations;
}
```

### 5.3 Gestion de la Récursivité (Q2)

Dans l'étape `playOptimalRamp`, l'algorithme doit être "Glouton" (Greedy) :

1. Calculer le mana disponible réel après avoir posé le land
2. Filtrer les cartes de la main qui sont des sources de mana (Dorks, Rocks)
3. Trier par efficacité (le plus cher jouable en premier, ou celui qui fixe les couleurs manquantes)
4. Jouer la source → Mise à jour du Board
5. Si la source est Untapped (Sol Ring), mettre à jour le mana pool et répéter (Chainage : Land → Sol Ring → Signet)

Cette boucle interne résout naturellement la question Q2.

---

## 6. Cas Spécifiques et "Edge Cases"

### 6.1 Les Trésors et le "Stock" vs "Flux"

Les Trésors (Treasure Tokens) introduisent une notion de **"Stock"** (Ressource épuisable) par opposition au **"Flux"** (Ressource renouvelable des Terrains).

**Implémentation** : Dans la simulation, les trésors sont des objets du board avec la propriété `singleUse: true`. Lorsqu'ils contribuent à `calculatePotentialMana`, ils sont marqués. S'ils sont effectivement consommés pour payer un coût, ils sont retirés du board.

### 6.2 Les Rituels et le "Storm Count"

Le Dark Ritual ({B} → {B}{B}{B}) est une source de type "Burst".

L'algorithme doit détecter les **"Sauts de Curve" (Skip Curve)**.

**Exemple** : Main avec Swamp, Dark Ritual, Hypnotic Specter (3 mana).
- Simulation T1 : Land (1B). Check Specter (Non). Check Ritual (Oui).
- Cast Ritual : Mana Pool passe de 1B à 3B.
- Check Specter (Oui). Succès.

**Insight** : Contrairement aux Dorks qui nécessitent d'être posés avant, les Rituels sont vérifiés pendant la phase de calcul de castability du sort cible. Ils doivent être traités comme des "modificateurs de coût" ou des "générateurs instantanés".

### 6.3 Terrains Légendaires et Conditionnels (Gaea's Cradle, Nykthos)

Ces terrains produisent un mana variable X.

**Solution** : Dans la simulation Monte Carlo, puisque nous maintenons l'état du board, c'est trivial.
`GaeasCradle.produce()` retourne `board.filter(c => c.isCreature).length`.

C'est un avantage majeur de la méthode Monte Carlo sur l'approche analytique.

### 6.4 Dorks avec Haste et Pseudo-Haste

**Burning-Tree Emissary** : Coût {R}{G}, produit {R}{G} à l'entrée. C'est un "Free Spell" qui ajoute un corps.

**Traitement** : Ils sont traités comme des rituels qui laissent un permanent. Lag = 0.

---

## 7. Spécifications Techniques pour l'Implémentation Web

### 7.1 Structure de Données (TypeScript)

```typescript
// Enumération efficace pour les types
enum SourceType { LAND = 1, DORK = 2, ROCK = 3, RITUAL = 4 }

// Bitmask pour les couleurs (Optimisation CPU)
const COLOR = { W: 1, U: 2, B: 4, R: 8, G: 16, C: 32 };

interface CardData {
  id: string;
  name: string;
  mv: number; // Mana Value
  colors: number; // Bitmask
  isManaSource: boolean;
  
  // Propriétés de production (si isManaSource = true)
  production?: {
    requiresTap: boolean;
    yield: number; // Bitmask des couleurs produites
    amount: number; // Quantité
    cost: number; // Coût d'activation
    enterTapped: boolean; // Lag natif
    isCreature: boolean; // Pour le removal check
    isOneShot: boolean; // Pour trésors/rituels
  };
}
```

### 7.2 Optimisation Web Worker

Pour garantir l'absence de "Main Thread Blocking" (UI freeze), la simulation doit tourner dans un **Web Worker**.

**Architecture :**
1. **Main Thread (React)** : Collecte la decklist, le sort cible, et les paramètres. Envoie un message `postMessage` au Worker.
2. **Worker Thread** : Reçoit le payload, instancie le moteur de simulation, exécute la boucle (2500 itérations), renvoie les résultats agrégés.
3. **Main Thread** : Affiche les résultats et met à jour les graphiques.

### 7.3 Performance Benchmarking

En JavaScript (V8), une itération de la boucle de simulation prend environ **0.01ms à 0.05ms** sur un CPU moderne.

- 2500 itérations ≈ 25ms à 125ms

Ceci respecte la contrainte des <100ms dans la majorité des cas.

Pour les mobiles, réduire dynamiquement à 1000 itérations si la première frame de calcul est lente.

---

## 8. Synthèse et Plan d'Action

### 8.1 Réponses Synthétiques aux 5 Questions

| Question | Réponse |
|----------|---------|
| **Q1** (Disponibilité) | Utiliser une matrice de ressources temporelle M(t) calculée par simulation, intégrant coût, lag et condition de couleur |
| **Q2** (Récursivité) | Oui, impératif. Géré par la boucle "Main Phase" de la simulation Monte Carlo qui tente de jouer les sources en chaîne |
| **Q3** (Coût Rocks) | Géré par le bilan "Net Mana Flow". Un rock n'est joué que s'il est un investissement rentable pour le tour cible |
| **Q4** (Survie) | Intégrer un paramètre utilisateur r (Taux d'attrition) qui applique une destruction probabiliste aux créatures à chaque tour simulé |
| **Q5** (Méthode) | Rejet de l'approche additive. Adoption d'une Simulation Monte Carlo dirigée ("Smart Monte Carlo") sur 2500 itérations, exécutée dans un Web Worker |

### 8.2 Roadmap d'Implémentation Proposée

| Phase | Description |
|-------|-------------|
| **Semaine 1** | Refactoriser la structure de données des cartes pour inclure les vecteurs de production (Lag, Coût, Type) |
| **Semaine 2** | Développer le moteur "Smart Monte Carlo" en TypeScript pur (hors UI) avec tests unitaires |
| **Semaine 3** | Implémenter la logique de Mulligan contextuelle (crucial pour la précision des Dorks) |
| **Semaine 4** | Intégration Web Worker et UI (Slider de risque, visualisation des résultats) |

### 8.3 Conclusion

L'approche proposée transforme ManaTuner Pro d'une simple calculatrice statique en un véritable simulateur de jeu. En acceptant la nature stochastique de Magic et en modélisant explicitement le temps et le risque, vous offrirez aux utilisateurs une précision inégalée, capable de justifier mathématiquement l'inclusion d'un Birds of Paradise dans un deck pentacolore ou l'exclusion d'un Arcane Signet dans un deck aggro. C'est ce niveau de nuance qui définit un outil "Expert".

---

# Analysis #2: Disjoint Scenarios Approach

**Source**: Gemini 3  
**Date**: December 2025  
**Focus**: Performance-optimized analytical approach (alternative to Monte Carlo)

---

## 1. Stratégie Recommandée : Scénarios Disjoints

L'approche actuelle (Hypergéométrique simple) ne suffit plus car elle traite les sources comme statiques. Les Dorks/Rocks introduisent une **dépendance temporelle** et un **coût d'opportunité**.

**Stratégie recommandée : L'approche par Scénarios Disjoints.**

Plutôt que de tenter une formule unique complexe ou une simulation Monte Carlo (potentiellement trop lente), nous allons générer les **combinaisons minimales de ressources** (Terrains + Accélérateurs) nécessaires pour lancer le sort au tour T, et sommer leurs probabilités.

---

## 2. Modélisation Mathématique (La Logique "Mana Credit")

Nous devons définir la valeur d'un accélérateur non pas comme "1 mana", mais comme une **fonction du temps**.

### Formule de Disponibilité

Soit un sort cible S de coût `C_target` à lancer au tour `T_target`.

Un accélérateur A (ex: Llanowar Elves) a :
- `C_cast` : Coût pour le jouer (ex: {G})
- `T_delay` : Mal d'invocation (1 pour créatures, 0 pour artefacts sans tap)

Pour qu'un accélérateur contribue au lancement de S au tour `T_target`, il doit être joué au plus tard au tour :

```
T_latest = T_target - T_delay - 1
```

### Formule de Probabilité Composée

Pour lancer un sort de CMC 4 au Tour 3 (Accélération), les scénarios valides sont :
1. 3 Lands + 1 Dork (Le Dork doit être jouable T1 ou T2)
2. 2 Lands + 2 Dorks (Rare, mais possible avec Sol Ring / double drop)

La probabilité totale est :

```
P(Cast) ≈ Σ P(Scénario_i) × P(Survie_Dorks)
```

---

## 3. Algorithme d'Implémentation (TypeScript)

Algorithme optimisé pour la performance, évitant la récursivité profonde.

### Phase A: Classification (Pré-calcul)

Au chargement du deck, classifiez les cartes :
- **Lands**: Sources statiques
- **Accelerators**: Sources dynamiques (Dorks, Rocks). Attributs : `cost`, `colors`, `delay`

### Phase B: Calcul de Castability (Runtime)

```typescript
// Structure pour définir une combinaison valide de ressources
interface ResourceCombo {
  landsNeeded: number;
  dorksNeeded: number;
  specificColorReq: { [color: string]: number }; // ex: {G: 1} pour l'Elf
}

function calculateAcceleratedProbability(
  spell: Spell, 
  turn: number, 
  deck: DeckAnalysis
): number {

  // 1. Définir le "Mana Cap" théorique max à ce tour
  // ex: Tour 3, max mana possible raisonnablement = 4 ou 5
  
  let totalProb = 0;

  // 2. Itérer sur le nombre d'accélérateurs "utiles" (k)
  // On se limite généralement à 0, 1 ou 2 pour la performance (suffisant à 99%)
  for (let k = 0; k <= 2; k++) {
    
    // Mana restant à couvrir par les lands
    const manaFromDorks = k; 
    const manaFromLands = spell.cmc - manaFromDorks;

    // Si le tour ne permet pas physiquement de poser 'manaFromLands' lands
    if (manaFromLands > turn) continue;

    // 3. Calculer la probabilité d'avoir k accélérateurs JOUABLES
    // Pour jouer k dorks, il faut aussi le mana pour les caster (souvent vert)
    const probDorks = calculateDorkSetupProbability(k, turn, deck);
    
    // 4. Calculer la probabilité d'avoir le reste en lands
    // Attention : On a déjà pioché des cartes pour les dorks
    const probLands = calculateLandProbability(
       manaFromLands, 
       turn, 
       spell.colors, 
       deck, 
       k // cartes "consommées" par les dorks
    );

    // 5. Appliquer le facteur de survie (Q4)
    const survivalFactor = Math.pow(getSurvivalRate(format), k);

    // Ajouter au total (somme disjointe simplifiée)
    totalProb += (probDorks * probLands * survivalFactor);
  }

  return Math.min(totalProb, 1); // Clamp
}
```

---

## 4. Réponses aux Questions Experts (Q1-Q5)

### Q1 : Modélisation de disponibilité

**Ne modélisez pas la séquence exacte tour par tour** (trop coûteux). Utilisez une **Approche par Contraintes** :

Pour avoir un Dork actif au Tour T, il faut :
1. L'avoir pioché dans les `7 + (T-2)` premières cartes
2. Avoir au moins 1 source de sa couleur (souvent verte) non engagée au tour T-1

**Solution Technique** : Utilisez la formule hypergéométrique pour la pioche du Dork, multipliée par la probabilité P1 (couleur du Dork) calculée pour le tour 1.

### Q2 : Calcul Récursif vs "Effective Turn"

**Non à la récursivité complète.** C'est un piège de performance.

Utilisez le modèle **"Mana Budget"** :
- Au lieu de simuler la séquence, demandez : "Au tour 3, quelle est la probabilité que mon board state contienne X mana ?"
- Si 0 Dork : Max 3 mana
- Si 1 Dork : Max 4 mana
- Calculer la probabilité de ces états est statique et rapide

### Q3 : Rocks avec coût (Arcane Signet)

La formule de validation est simple :

```
EffectiveContribution = (Turn_target > (Turn_cast + Sickness)) ? 1 : 0
```

**Exemple** : Arcane Signet ({2}, Tapped) et sort cible au Tour 3 :
- On le joue T2. Il untap T3.
- `3 > (2 + 1)` ? Faux (3 n'est pas > 3). **Il n'accélère pas** un sort de CMC 4 au T3.
- Il aide seulement pour la **fixation de couleur** (fixing).

**Règle** : Pour l'accélération pure, un rock de coût N n'accélère qu'au tour **N+2** (sauf s'il entre untapped comme Sol Ring).

### Q4 : Taux de survie (Metagame)

**Ne codez pas ça en dur.** Utilisez une configuration injectable.

**Proposition de valeurs par défaut :**

| Type | Taux | Raison |
|------|------|--------|
| Creature (x/1) | 0.70 | Dies to Bowmasters, Dart, W6 |
| Creature (x/2+) | 0.80 | Standard Bolt test |
| Artifact | 0.95 | Rarement visé early game |
| Enchantment | 0.98 | Très rarement visé |

**Par format :**

```typescript
const SURVIVAL_RATES = {
  modern: { dork: 0.65, rock: 0.90 },
  commander: { dork: 0.85, rock: 0.98 },
  legacy: { dork: 0.50, rock: 0.95 }
};
```

### Q5 : Combinaison Lands + Dorks

**L'option Conditionnelle est la seule mathématiquement viable sans simulation.**

L'additif simple (`lands + dorks`) fausse tout (on peut avoir 20 forêts et 4 elfes, mais piocher 0 elfes).

Il faut traiter les sources comme des **buckets distincts** dans l'analyse combinatoire :
- **Bucket A** : Terrains
- **Bucket B** : Accélérateurs

```
Probabilité totale = Σ P(i cartes du Bucket A) × P(j cartes du Bucket B) 
                     tel que i + j ≥ Coût
```

---

## 5. Edge Cases & Bonus

### Trésors (Treasure Tokens)

Traitez-les comme des **"One-shot Sources"**. Ils comptent pour la castability initiale, mais doivent dégrader la castability des tours suivants.

**Recommandation V1** : Ignorez l'impact futur pour l'instant (trop complexe).

### Mulligans

Pour un outil "Pro", le **London Mulligan** est crucial.

**Quick Win** : Si P1 < 50%, simulez un "virtual mulligan" : recalculez avec une main de 6 cartes mais en cherchant activement les sources manquantes (Bayesian update simplifié).

### Fetchlands

- Continuez à les ignorer pour le **thinning** (impact négligeable)
- Mais comptez-les comme sources de toutes les couleurs fetchables

---

## 6. Structure de Service Suggérée

```typescript
// Suggestion de structure immédiate
export interface ManaSourceAnalysis {
  lands: number;
  accelerators: {
    count: number;
    survivalRate: number; // ex: 0.8
    effectiveTurnOffset: number; // ex: -1 pour Elf T1 -> T2
  };
}

export class AcceleratorService {
  private survivalRates: SurvivalRates;
  
  classifyCard(card: Card): 'land' | 'dork' | 'rock' | 'ritual' | 'spell';
  
  getEffectiveTurn(accelerator: Card, playTurn: number): number;
  
  calculateAcceleratedCastability(
    spell: Spell,
    targetTurn: number,
    deck: DeckAnalysis
  ): AcceleratedProbability;
}
```

---

## 7. Comparaison avec Analyse #1

| Aspect | Analyse #1 (Monte Carlo) | Analyse #2 (Scénarios) |
|--------|--------------------------|------------------------|
| **Précision** | Très haute | Haute (approximation) |
| **Performance** | 25-125ms | <10ms |
| **Complexité code** | Élevée | Modérée |
| **Mulligan** | Simulation complète | Virtual mulligan |
| **Survie** | Décroissance `(1-r)^t` | Taux fixe par type |
| **Récursivité** | Boucle greedy | Mana Budget statique |

**Conclusion** : L'Analyse #2 propose une alternative plus légère et potentiellement suffisante pour une V1, avec possibilité d'évoluer vers Monte Carlo en V2 si la précision est insuffisante.

---

# Analysis #3: Literature Review & Industry Benchmarks

**Source**: Research Synthesis  
**Date**: December 2025  
**Focus**: External references, empirical data, existing tools analysis

---

## 1. Analyses Mathématiques et Modélisations Connues

### 1.1 Fondements Karsten

Frank Karsten est le pionnier du domaine : il a établi des **tables de référence** indiquant le nombre de sources requis pour une probabilité d'au moins 90% de pouvoir lancer un sort d'un certain coût d'ici un tour donné.

**Exemple clé** : Environ **14 sources** d'une couleur donnée sont nécessaires pour lancer un sort à un mana de cette couleur au tour 1 avec ~90% de fiabilité.

### 1.2 Pondération des Accélérateurs (Karsten)

Karsten recommande de **pondérer les accélérateurs** plutôt que de les compter comme des terrains à part entière :

> **Format 60 cartes** : Considérer les créatures à mana comme **« une demi-source »** chacune en raison de leur vulnérabilité (d'où le vieil adage "Bolt the Bird")
> 
> *Source: tcgplayer.com*

### 1.3 Recommandations Commander (EDH)

Pour Commander, Karsten conseille :

> « Commencez avec **42 terrains + 1 Sol Ring**, puis :
> - Retirez **1 terrain pour chaque 2-3 rocks** ajoutés
> - Retirez **1 terrain pour chaque 3-4 cantrips** (Ponder, Brainstorm)
> - Retirez **1 terrain pour chaque 3-4 dorks** (Llanowar Elves, Birds)
> - **Ne descendez jamais en dessous de ~37 terrains** »
> 
> *Source: casus-no.net*

**Implication** : Un mana dork vaut ~**0,25-0,33 terrain** en EDH (plus conservateur que la "demi-source" en 60 cartes).

### 1.4 Autres Pondérations Empiriques

Une modélisation sur Medium comptabilise chaque source non-terrain comme **0,75 (75%)** d'une source de mana en moyenne, pour tenir compte du risque de retrait.

---

## 2. Méthodes de Calcul Utilisées

### 2.1 Formule Conditionnelle (Inclusion-Exclusion)

```
P(couleur requise) = P(par terrains) + P(dork présent) × [1 - P(par terrains)] × P(couleur via dork)
```

**Limitation** : Devient très complexe avec le timing (elfe T1 → mana T2, rock T2 → mana T3).

### 2.2 Simulations Monte Carlo

Allen Wu note :

> « La simulation Monte Carlo est la technique utilisée par Frank Karsten pour ses articles de mana base »
> 
> *Source: article.hareruyamtg.com*

**Raison** : Certaines questions (ex: probabilité d'avoir Tron ou un sort double-couleur d'ici T4) sont difficiles à résoudre analytiquement.

### 2.3 Approche 17Lands (Manabase Evaluator)

> « Pour chaque deck limité soumis, nous simulons des milliers de parties. À chaque permutation du deck, on regarde quand chaque carte devient lançable. L'évaluateur ne se limite pas aux terrains : il inclut toute carte pouvant générer du mana – créatures, artefacts, trésors, etc. »
> 
> *Source: blog.17lands.com*

Cette approche **context-aware** modélise dynamiquement l'apport des accélérateurs (y compris Evolving Wilds, Cultivate, landcycling...).

---

## 3. Données Empiriques et Recommandations Chiffrées

### 3.1 Densité de Ramp pour "Gagner un Tour"

**En Commander** :
- Deck midrange typique : **~50 sources de mana** (37 terrains + ~13 ramp)
- Avec **~14 cartes de ramp** : ~80% de chances d'en jouer au moins une dans les 3 premiers tours
- Avec **~20 cartes de ramp** : ~90% mais risque de flood accru

> « Je recommande de débuter avec **10 à 15 accélérateurs** dans un deck EDH moyen »
> 
> *Source: Tomer Abram, MTGGoldfish*

**En Modern/Legacy** :
- Au-delà de **8-10 one-drops** (Llanowar Elves, Noble Hierarch), les rendements décroissants
- Un 11e dork augmente peu la probabilité d'en avoir un en main de départ

### 3.2 Impact sur le Winrate

> « Un Elfe tour 1 double tes chances de victoire s'il n'est pas géré »

D'où l'importance de le gérer immédiatement → **"Bolt the Bird"**

**Données 17Lands** : Les cartes produisant un Trésor supplémentaire (Jewel Thief, Prosperous Innkeeper) présentent souvent des winrates "Drawn" supérieurs à la moyenne.

### 3.3 Benchmark Karsten - Dorks en Chaîne

Pour lancer un sort **1G au tour 2** avec ~90% de fiabilité :
- Besoin de **14 sources vertes** (incluant les elfes jouables T1)
- L'elfe compte comme **une demi-source additionnelle** pour le sort suivant

**Calcul récursif suggéré** :
```
P(sort coût 3 au T2 avec dork T1) = 
  P(avoir dork en main ET source pour le caster T1) 
  × P(survie du dork) 
  × P(avoir les autres terrains d'ici T2)
```

---

## 4. Outils Similaires et Idées d'Interface (UX)

### 4.1 Moxfield

**Approche** : Probabilité d'avoir X terrains ou plus au tour X via hypergéométrique classique.

**Limitations** : 
- Ne prend pas explicitement en compte les dorks/rocks dans le timing
- Un deck avec 8 elfes et 32 lands est lu comme "40 sources potentielles" sans modéliser la séquence

**UX** : Code couleur 🟩🟧🟥 pour indiquer si chaque segment de courbe est assuré.

### 4.2 Salubrious Snail (Mana Base Analyzer)

**Métriques fournies** :
- **Cast rate** : Probabilité de lancer chaque sort à temps
- **Average delay** : Retard moyen en tours si la couleur/mana manque

**Benchmarks** :
| Cast Rate | Delay Moyen | Interprétation |
|-----------|-------------|----------------|
| ~90% | ~0,3 tours | Excellent |
| ~80% | ~0,6 tours | Manabase perfectible |

**Feature UX clé** : Simule automatiquement l'ajout d'une source supplémentaire et montre l'effet :

> « Si ajouter un terrain basique améliore le cast rate de plus de 1% (~réduit le délai moyen de 0,03), c'est que votre deck manque probablement de lands »
> 
> *Source: salubrioussnail.com*

**Ce qui est pris en compte** :
- ✅ Mana rocks, mana dorks, tuteurs de terrains

**Ce qui est ignoré** :
- ❌ Rituels one-shot
- ❌ Trésors/pierres de puissance
- ❌ Cartes qui untap des lands
- ❌ Auras sur les lands
- ❌ Accélérateurs avec coûts d'activation particuliers

### 4.3 17Lands - Manabase Evaluator

**Approche différente** : Indique pour chaque carte la **"turn drawn at which it becomes castable"** moyenne.

**Exemple** : Un sort coûteux n'est castable qu'après avoir pioché ~3 cartes supplémentaires = typiquement tour 7 au lieu de tour 4 espéré.

**Avantage** : Tient compte précisément de toutes les synergies (trésors, double-terrains, survie des dorks).

---

## 5. Coefficients de Pondération - Synthèse

| Source | Dork (60 cartes) | Dork (EDH) | Rock |
|--------|------------------|------------|------|
| **Karsten** | 0.50 | 0.25-0.33 | ~0.33-0.50 |
| **Medium empirique** | 0.75 | 0.75 | 0.75 |
| **Règle Reddit EDH** | - | "1 land pour 3-4 dorks" | "1 land pour 2-3 rocks" |

---

## 6. Recommandations UX Inspirées des Outils Existants

### 6.1 Affichages Suggérés pour ManaTuner Pro

1. **Probabilité par tour** (style Moxfield)
   - Code couleur par segment de courbe
   - 🟩 >85% | 🟨 65-85% | 🟥 <65%

2. **Cast Rate + Delay** (style Salubrious Snail)
   - "Lightning Bolt: 94% on curve (0.2 turn delay)"
   - "Cryptic Command: 71% on curve (0.8 turn delay)"

3. **Impact Accelerators** (nouveau)
   - "Grâce à vos elfes/rocks, ce sort de coût 5 devient lançable dès le tour 4 dans ~30% des cas"
   - "+10% de probabilité de caster telle carte un tour plus tôt grâce à vos accélérateurs"

4. **Simulation "+1 Source"** (style Salubrious)
   - "Ajouter +1 Forest améliorerait le cast rate de Llanowar Elves de 3%"
   - "Ajouter +1 Mountain n'améliore rien (vous avez assez de sources rouges)"

---

## 7. Conclusion de l'Analyse #3

Les approches modernes combinent :

1. **Formules hypergéométriques ajustées** (pondération des dorks/rocks)
2. **Simulations Monte Carlo** pour capturer le tempo
3. **Présentation UX** qui simplifie l'interprétation

**Consensus sur les coefficients** :
- Dork standard : **0.50-0.75** selon le format et le métagame
- Rock : **0.75-0.90** (plus fiable car non-créature)
- Minimum terrains EDH : **37** même avec beaucoup de ramp

**Défis identifiés** :
- Comment modéliser la survie d'un dork (métagame-dépendant)
- L'effet tempo d'un rocher qui coûte 2
- L'utilisation optimale d'un Trésor à usage unique

---

# Analysis #4: Consolidated Implementation Specification

**Source**: Cross-Analysis Synthesis (challenges & integrates Analyses #1-3)  
**Date**: December 2025  
**Focus**: Production-ready specification with all edge cases resolved

---

## 0. Objectif & Contraintes

### Objectif

Étendre le calcul de castability "on curve" pour intégrer :
- **Dorks** (Birds of Paradise, Noble Hierarch, Llanowar Elves…)
- **Rocks** (Sol Ring, Arcane Signet, Talismans…)
- **One-shots** (Treasure tokens, Dark Ritual…) en bonus

En tenant compte de :
- **Disponibilité** : pioché + castable + online au bon tour
- **Vulnérabilité** : survie dépendante du format/meta
- **Délai** : summoning sickness, ETB tapped, activation tax
- **Accélération** : jouer un 3-drop au T2 via dork T1

### Contraintes Techniques

| Contrainte | Valeur |
|------------|--------|
| Environnement | Client-side TS/React |
| Performance | <100ms par analyse "interactive" |
| UX | 2–3 contrôles max |
| Données | JSON local pour dorks/rocks connus + fallback Scryfall (cache) |

---

## 1. Rappel du Modèle Existant (à conserver)

### 1.1 Hypergéométrique

ManaTuner Pro utilise l'hypergéométrique cumulative `P(X≥k)` (tirages sans remise).

### 1.2 P1 / P2 Existants

- **P1** : Probabilité d'avoir assez de sources colorées en supposant les land drops
- **P2** : `P2 = P1 × P(enough lands by turn)` avec `cardsSeen = 7 + (turn-1)` sur le play

**Important** : La V1 actuelle ignore dorks/rocks/treasures/rituals → sous-estime les decks ramp.

---

## 2. Taxonomie Unifiée des Sources (Vectorisation)

Chaque source non-land n'est pas "+1 mana" : c'est une **fonction du temps**.

### 2.1 Propriétés Minimales

| Propriété | Description | Exemple |
|-----------|-------------|---------|
| `castCost` | Coût pour la mettre en jeu | Sol Ring: 1, Signet: 2 |
| `delay` | Tours avant d'être utilisable | Dork: 1, Rock ETB untapped: 0 |
| `produces` | Couleurs produites (bitmask) | Signet: any 2 colors |
| `producesAny` | Peut produire n'importe quelle couleur | Birds: true |
| `netPerTurn` | Mana net gagné par tour quand online | Sol Ring: +2, Signet: +1 |
| `isCreature` | Pour le modèle de survie | Dork: true |
| `oneShot` | Usage unique | Treasure: true |

### 2.2 Exemples de Calcul netPerTurn

```
netPerTurn = producesAmount - activationTax

Sol Ring:     produces 2, tax 0 → netPerTurn = 2
Arcane Signet: produces 2, tax 1 → netPerTurn = 1  
Talisman:     produces 1 (colored), tax 0 → netPerTurn = 1
```

### 2.3 Données : JSON Local + Fallback Scryfall

1. **`mana_producers.json`** local : ~200 cartes communes (Llanowar, Birds, Sol Ring, Signets, Talismans…)
2. **Fallback** : Appel Scryfall (oracle text) + heuristique "produit du mana ?"
3. **Cache** : localStorage/IndexedDB + in-memory

---

## 3. Modèle "Mana Credit" (Temps) + "Net Mana Flow" (Rentabilité)

### 3.1 Fenêtre de Contribution (Mana Credit)

Pour qu'un accélérateur A contribue au tour cible T :

```
T_latest = T - delay(A) - 1
```

| Type | delay | Pour contribuer à T3 | Doit être joué au plus tard |
|------|-------|---------------------|----------------------------|
| Dork classique | 1 | T3 | T1 |
| Rock ETB tapped | 1 | T3 | T1 |
| Rock ETB untapped | 0 | T3 | T2 |

### 3.2 Net Mana Flow (NMF)

Un rock n'est "bon" que s'il est **rentabilisé avant le tour cible**.

```
NMF(T_play) = producesAmount(A) - activationTax(A)
```

**Heuristique "accélère avant T"** :
- `onlineTurn = earliestPlayTurn + delay`
- Si `onlineTurn > T` → contribution ramp = 0
- Sinon → contribution ≈ netPerTurn

**Exemples** :
- **Arcane Signet** pour sort T3 : `netPerTurn=1`, joué T2, `delay=0` → online T2, accélère T3 ✅
- **Arcane Signet** pour sort T2 : joué T2, online T2, mais **consomme le mana du T2** → n'accélère PAS T2 ❌

---

## 4. Q1 — Probabilité "A online au tour T"

### 4.1 Formule de Base (Analytique)

```
P(A online à T) ≈ P(draw A ≤ T_latest) × P(castable à T_latest) × P(survie jusqu'à T)
```

| Composante | Méthode |
|------------|---------|
| P(draw) | Hypergéométrique sur cartes vues (7 + draws) |
| P(castable) | Moteur P1/P2 appliqué au coût de A |
| P(survie) | Modèle géométrique (section 6) |

### 4.2 Pourquoi c'est Mieux que "effective_sources = lands + dorks×survie"

Le modèle additif (Option A des analyses) ignore :
- La **dépendance couleur** : un dork {G} exige déjà une source verte
- La **contrainte temporelle** : un dork T2 n'accélère pas T2
- Les **chaînes** : Sol Ring → Signet → …

---

## 5. Q2/Q5 — Combiner Lands + Producers : Recommandation Finale

### Comparaison des 4 Options

| Option | Vitesse | Précision | Complexité | Verdict |
|--------|---------|-----------|------------|---------|
| **A. Additif** | <1ms | ❌ Faux | Triviale | Fallback uniquement |
| **B. Conditionnel** | <5ms | ⚠️ Limité | Modérée | Cas simples (1 accel) |
| **C. Monte Carlo** | 25-125ms | ✅ Exact | Élevée | Mode avancé (V2) |
| **D. Scénarios Disjoints** | <10ms | ✅ Haute | Modérée | **Recommandé V1** |

### Recommandation Hybride

| Mode | Méthode | Quand |
|------|---------|-------|
| **Instant** (défaut) | Scénarios Disjoints (k ≤ 2) + survie + NMF | UI interactive |
| **Analyse Avancée** | Monte Carlo deck-level (1 simulation → tous les sorts) | Toggle optionnel |

---

## 6. Q4 — Survie : Modèle Simple + Presets Format

### 6.1 Modèle Géométrique

```
P_survie(n) = (1 - r)^n
```

Où `n` = nombre de tours adverses exposés.

### 6.2 UX : Slider "Interaction Adverse"

| Niveau | Valeur r | Description |
|--------|----------|-------------|
| Goldfish | 0.00 | Pas d'interaction (test pur) |
| Faible | 0.10 | Casual EDH, peu de removals |
| Moyen | 0.25 | Standard, High-Power EDH |
| Élevé | 0.45 | Modern, Legacy, cEDH |

### 6.3 Différencier Dork vs Rock

| Type | Taux utilisé | Raison |
|------|--------------|--------|
| Dork (créature) | r complet | Spot removal + wipes |
| Rock (artefact) | r/3 ou constant 0.95-0.99 | Rarement ciblé early |

---

## 7. Architecture d'Implémentation

### 7.1 Deux Moteurs, Une API Stable

```
┌─────────────────────────────────────────────────────────────┐
│                    ACCELERATED CASTABILITY                   │
├─────────────────────────────────────────────────────────────┤
│  A) AcceleratedAnalyticEngine (UI-critical, <10ms)          │
│  ├── Pour chaque spell et tour cible :                      │
│  │   ├── Calcule baseP1/baseP2 (existant)                  │
│  │   ├── Calcule withAccelP1/withAccelP2                   │
│  │   └── Calcule acceleratedTurn (si ramp permet T-1/T-2)  │
│  └── Méthode : Scénarios Disjoints (k ≤ 2)                 │
├─────────────────────────────────────────────────────────────┤
│  B) ManaRampSimulationEngine (Web Worker, 25-125ms)         │
│  ├── 1000–2500 itérations                                  │
│  ├── Simulation "mana only" (ignore combat/life)           │
│  └── Évalue TOUS les spells dans le même run               │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 API de Sortie

```typescript
interface AcceleratedCastabilityResult {
  base: { p1: number; p2: number };
  withAcceleration: { p1: number; p2: number };
  accelerationImpact: number;           // delta P2
  acceleratedTurn: number | null;       // T-1 si ramp permet
  keyAccelerators: string[];            // ["Sol Ring", "Llanowar Elves"]
}
```

---

## 8. Algorithme Analytique (Scénarios Disjoints, k ≤ 2)

### 8.1 Étapes

Pour un sort S de mana value MV et un tour cible T :

**Étape 1 : Lister les accélérateurs candidats**
- Filtre : `onlineTurn <= T` ET `netPerTurn > 0` (ou fixing requis)

**Étape 2 : Estimer la distribution de K**
- K = nombre d'accélérateurs online utiles, tronqué à 0..2
- Chaque accel a `p_i = P(accel_i online à T)`

**Étape 3 : Approximation "exactement k" (Poisson-binomial)**

```
p_0 ≈ ∏(1 - p_i)
p_1 ≈ Σ_j [ p_j × ∏_{i≠j}(1 - p_i) ]
p_2 ≈ 1 - p_0 - p_1  (tronqué)
```

✅ Complexité O(n²) mais n(accels) ≤ 20 → acceptable

**Étape 4 : Conditionner le cast**

```
P(cast à T) ≈ Σ_{k=0}^{2} p_k × P(cast à T | K=k)
```

**Étape 5 : Calculer P(cast | K=k)**

```
extraMana = sum(netPerTurn des k meilleurs accels)
landsNeeded = max(0, MV - extraMana)
P2_lands = P(lands >= landsNeeded by T)  // hypergeom existant
P1_colors = recalcul avec fixing des accels
```

### 8.2 Pseudo-Code

```typescript
function calculateAcceleratedCastability(
  spell: Spell, 
  turn: number, 
  deck: DeckAnalysis,
  removalRate: number
): AcceleratedCastabilityResult {
  
  // 1. Base calculation (existing)
  const base = calculateBaseCastability(spell, turn, deck);
  
  // 2. Get candidate accelerators
  const candidates = getAcceleratorsOnlineByTurn(deck, turn, removalRate);
  
  // 3. Calculate P(exactly k accelerators online)
  const probs = candidates.map(a => a.onlineProb);
  const p0 = probs.reduce((acc, p) => acc * (1 - p), 1);
  const p1 = probs.reduce((sum, pj, j) => {
    const others = probs.filter((_, i) => i !== j);
    return sum + pj * others.reduce((acc, p) => acc * (1 - p), 1);
  }, 0);
  const p2 = Math.max(0, 1 - p0 - p1);
  
  // 4. Calculate P(cast | K=k) for each scenario
  const pCast0 = base.p2;
  const pCast1 = calculateCastWithExtraMana(spell, turn, deck, 1);
  const pCast2 = calculateCastWithExtraMana(spell, turn, deck, 2);
  
  // 5. Weighted sum
  const withAccelP2 = p0 * pCast0 + p1 * pCast1 + p2 * pCast2;
  
  return {
    base,
    withAcceleration: { p1: base.p1, p2: withAccelP2 },
    accelerationImpact: withAccelP2 - base.p2,
    acceleratedTurn: canCastEarlier(spell, deck) ? turn - 1 : null,
    keyAccelerators: candidates.slice(0, 3).map(a => a.name)
  };
}
```

---

## 9. Smart Monte Carlo (Worker) — Précision + Edge Cases

### 9.1 Quand l'Utiliser

- Utilisateur active "Analyse Avancée"
- Deck contient des catégories non modélisées proprement (treasure, ritual, Cradle, Nykthos, Mox Diamond…)

### 9.2 Simulation Mana-Only (Boucle)

```typescript
function simulateManaRamp(deck: Card[], targetSpells: Spell[], iterations: number) {
  const results = new Map<string, number[]>();
  
  for (let i = 0; i < iterations; i++) {
    // 1. Draw + Mulligan London (heuristique ramp-aware)
    let hand = drawOpeningHand(deck);
    hand = performSmartMulligan(hand, deck);
    
    let board: Source[] = [];
    let library = shuffleRemaining(deck, hand);
    
    // 2. Turn Loop
    for (let turn = 1; turn <= 10; turn++) {
      // A. Reset mana
      resetMana();
      
      // B. Draw (sauf T1 play)
      if (turn > 1) hand.push(library.shift()!);
      
      // C. Survival Check (dorks only)
      board = board.filter(source => 
        !source.isCreature || Math.random() > removalRate
      );
      
      // D. Calculate available mana
      const manaPool = calculateManaFromBoard(board);
      
      // E. Check castability for each target spell
      for (const spell of targetSpells) {
        if (canCast(spell, manaPool)) {
          recordCastable(spell, turn);
        }
      }
      
      // F. Main Phase: Play optimal sources (greedy)
      playOptimalLand(hand, board);
      playOptimalRamp(hand, board, manaPool);
    }
  }
  
  return computeStatistics(results);
}
```

### 9.3 Mulligan Heuristique (Critique pour Dorks)

Conserver si :
- 2–5 lands
- OU 1 land + 1 ramp low-cost castable + couleur OK
- OU main "fast rock" (Sol Ring/Crypt) + 1 land

---

## 10. Structures TypeScript (Référence)

```typescript
enum SourceType { 
  LAND = 1, 
  DORK = 2, 
  ROCK = 3, 
  RITUAL = 4, 
  TREASURE = 5, 
  CONDITIONAL = 6 
}

const COLOR = { W: 1, U: 2, B: 4, R: 8, G: 16, C: 32 } as const;
type ColorMask = number;

interface ManaProducer {
  name: string;
  type: SourceType;

  // Casting requirements
  castCostGeneric: number;
  castCostColors: ColorMask;    // ex: {G} => COLOR.G

  // Timing
  delay: number;                // 1 dork, 0 rock ETB untapped, 1 ETB tapped
  
  // Production
  producesAmount: number;       // Sol Ring=2, Signet=2
  activationTax: number;        // Signet=1, Sol Ring=0
  producesMask: ColorMask;      // couleurs produites
  producesAny: boolean;

  // Vulnerability
  isCreature: boolean;
  oneShot: boolean;             // ritual/treasure
  survivalBase?: number;        // override du slider r
}

interface AcceleratorSettings {
  format: 'modern' | 'legacy' | 'standard' | 'commander' | 'cedh' | 'custom';
  removalRate: number;          // 0.00 - 0.45
  showAcceleratedProb: boolean;
  advancedMode: boolean;        // Monte Carlo
}

const FORMAT_PRESETS = {
  modern:    { dork: 0.50, rock: 0.90, removalRate: 0.35 },
  legacy:    { dork: 0.50, rock: 0.95, removalRate: 0.40 },
  standard:  { dork: 0.75, rock: 0.95, removalRate: 0.20 },
  commander: { dork: 0.75, rock: 0.98, removalRate: 0.15 },
  cedh:      { dork: 0.60, rock: 0.92, removalRate: 0.30 },
};
```

---

## 11. Cas Particuliers (Intégration Progressive)

### 11.1 Treasures

| Version | Traitement |
|---------|------------|
| V1 Analytique | Ignorer ou "+1 one-shot" si carte génératrice reconnue |
| Simulation | Stock consommable (retirer du board après usage) |

### 11.2 Rituels (Dark Ritual)

| Version | Traitement |
|---------|------------|
| V1 Analytique | Simulation-only (trop contextuel) |
| Simulation | Jouer si débloque immédiatement le spell cible |

### 11.3 Lands Multi-Mana (Ancient Tomb)

| Version | Traitement |
|---------|------------|
| Analytique | Intégrer dans landService effectiveSourcesByTurn |
| Simulation | Trivial |

### 11.4 Gaea's Cradle / Nykthos / Tron

| Version | Traitement |
|---------|------------|
| Analytique | ❌ Non recommandé (trop dépendant du board) |
| Simulation | ✅ Recommandé |

---

## 12. Plan d'Implémentation (Phases)

### Phase 0 — Données (1–2 jours)

- [ ] Créer `mana_producers.json` (dorks/rocks connus, ~200 cartes)
- [ ] Parser/cacher Scryfall fallback
- [ ] Tests unitaires pour classification

### Phase 1 — Analytique (3–4 jours)

- [ ] Calcul `P(online by T)` pour chaque accel
- [ ] Scénarios disjoints k≤2
- [ ] Résultat `AcceleratedCastabilityResult`
- [ ] Tests unitaires complets

### Phase 2 — UX (2 jours)

- [ ] Toggle "Inclure accélération"
- [ ] Slider "Interaction adverse" (4 niveaux)
- [ ] Badge "accéléré à T-1/T-2" + "key accelerators"
- [ ] Tooltip explicatif

### Phase 3 — Simulation Worker (optionnel, 4–5 jours)

- [ ] "Analyse avancée" toggle
- [ ] Web Worker setup
- [ ] 1000–2500 itérations, deck-level
- [ ] Export "castableByTurn" + average delay

---

## 13. Notes de Rigueur

| Piège | Solution |
|-------|----------|
| Simuler par sort | ❌ Simule UNE partie mana → évalue tous les spells |
| Additionner k=0..2 naïvement | ❌ Éviter double comptage via "exactement k" |
| 50 paramètres de survie | ❌ Slider r suffit pour V1 |
| Ignorer NMF | ❌ NMF unifie Sol Ring / Signets / rocks ETB tapped / dorks |
| Formule fermée pour chaînage | ❌ Trop complexe → Monte Carlo pour chaînes |

---

## 14. Validation Finale

### Cas de Test

| Deck | Scénario | Attendu |
|------|----------|---------|
| Mono-G Elves (8 dorks, 20 lands) | Sort CMC 3, T2 | P ≈ 35-45% (avec survie Modern) |
| Artifact Storm (12 rocks, 15 lands) | Sort CMC 5, T3 | P > 50% (Sol Ring chains) |
| Control (0 ramp, 26 lands) | Tout | P = calcul actuel (pas de changement) |
| EDH (37 lands, 10 ramp) | Sort CMC 5, T4 | P > 80% (survie haute EDH) |

### Benchmarks de Performance

| Métrique | Target | Méthode |
|----------|--------|---------|
| Castability analytique | <10ms | Scénarios disjoints |
| Classification deck | <50ms | Une seule passe |
| Monte Carlo (optionnel) | <150ms | Web Worker, 2500 iter |

---

# Final Synthesis & Implementation Decisions

## Consensus Final (Analyses #1-4)

| Topic | Décision Finale | Justification |
|-------|-----------------|---------------|
| **Méthode V1** | Scénarios Disjoints (k≤2) | Performance <10ms, précision suffisante |
| **Méthode V2** | Monte Carlo Web Worker | Précision max pour edge cases |
| **Survie** | Slider UX 4 niveaux (r=0-0.45) | Simple, configurable, format-aware |
| **NMF** | Oui, obligatoire | Unifie tous les types d'accélérateurs |
| **Chaînage** | V2 seulement (Monte Carlo) | Trop complexe analytiquement |
| **Données** | JSON local + Scryfall fallback | Couverture 95% + extensibilité |

## Priorités Finales

| Priorité | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **P0** | `mana_producers.json` + classification | 2 jours | Fondation |
| **P0** | Slider survie + presets format | 0.5 jour | UX critique |
| **P1** | Scénarios disjoints k≤2 | 3 jours | Core feature |
| **P1** | UI "With Accelerators" + badges | 1 jour | Valeur visible |
| **P2** | Tooltips explicatifs | 0.5 jour | Pédagogie |
| **P3** | Monte Carlo Web Worker | 4 jours | Précision V2 |

## Résultat Attendu

```
┌─────────────────────────────────────────────────────────┐
│  Cryptic Command  {1}{U}{U}{U}                          │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  📊 Castability On Curve (T4)                           │
│  ├── Lands only:        67.3%                          │
│  └── With Ramp:         74.8%  (+7.5%)  ⓘ             │
│                                                         │
│  ⚡ Acceleration possible: T3 (28% chance)              │
│  🔑 Key accelerators: Sol Ring, Talismans              │
│                                                         │
│  ⓘ Includes 2 rocks (×0.90 survival)                   │
│     Format: Modern (high interaction)                   │
└─────────────────────────────────────────────────────────┘
```

---

# Analysis #5: Unified Mathematical Model & UX Integration

**Source**: External Expert Synthesis  
**Date**: December 2025  
**Focus**: Unified probability model, optimized algorithm, and UX patterns

---

## 1. Le Modèle Mathématique Unifié : "Probabilité de Mana Disponible"

### Constat

- L'approche **hypergéométrique statique** est insuffisante pour le ramp
- L'approche **simulation complète** est trop lente pour l'UI temps réel
- **Solution** : Approche Analytique par Scénarios (Bucket Approach)

### La Formule Cœur

Au lieu de calculer la probabilité de lancer un sort, nous calculons la **Distribution de Probabilité du Mana Disponible** (M_T) pour chaque tour T :

```
M_T = L_T + Σ(A_i × σ_i × δ_i)
```

Où :
- **L_T** : Nombre de terrains joués (limité par T)
- **A_i** : Accélérateur i pioché et castable
- **σ_i** : Taux de survie (Survival Rate, ex: 0.7 pour un Dork)
- **δ_i** : Facteur de disponibilité (1 si `T > T_cast + MalInvocation`, sinon 0)

### Alignement avec les Références

Cette approche s'aligne avec :
- **Frank Karsten** : Compter les dorks comme une fraction de source
- **Salubrious Snail** : Calcul du retard moyen (average delay)
- **17Lands** : Turn Drawn at which castable

---

## 2. Architecture des Données (JSON & Types)

### Structure Recommandée

```typescript
type AcceleratorType = 'dork' | 'rock' | 'ritual' | 'treasure';

interface ManaAccelerator {
  name: string;
  type: AcceleratorType;
  cost: number;             // CMC (ex: 1 pour Birds, 2 pour Signet)
  produces: string[];       // Couleurs ['G', 'Any']
  activationDelay: number;  // 1 pour Dork (sick), 0 pour Rock (sauf tapped)
  survivalRate: number;     // Base rate (ex: 0.75)
  isOneShot: boolean;       // True pour Ritual/Treasure
}

// Configuration injectable (Dependency Injection)
interface FormatContext {
  format: 'standard' | 'modern' | 'commander' | 'legacy';
  removalDensity: 'low' | 'medium' | 'high'; // low=0.9, medium=0.75, high=0.5
}
```

---

## 3. Algorithme d'Implémentation Optimisé (<100ms)

### Principe

Pour garantir la rapidité, nous évitons la récursion profonde. Nous utilisons une **itération sur les tours critiques** (T1 à T5).

### Algorithme : calculateDynamicCastability

**Pré-calcul du Deck :**
1. Séparer les sources en `Lands` et `Accelerators`
2. Calculer les probabilités hypergéométriques de piocher k accélérateurs au tour T

**Boucle de Résolution :**

```typescript
function getCastability(spell, targetTurn, deck, context) {
  let probabilitySum = 0;

  // On itère sur les scénarios de "Ramp" possibles (0, 1, ou 2 accélérateurs)
  // Limiter à 2 accélérateurs couvre 99% des cas réalistes et sauve le CPU.
  for (let rampCount = 0; rampCount <= 2; rampCount++) {
    
    // 1. Probabilité d'avoir 'rampCount' accélérateurs ACTIFS au tour 'targetTurn'
    // Implique: Piochés, Castés (mana dispo tôt), et Survivants
    const pRamp = getRampProbability(rampCount, targetTurn, deck, context);
    
    if (pRamp === 0) continue;

    // 2. Mana restant à couvrir par les lands
    const landsNeeded = Math.max(0, spell.cmc - rampCount);
    
    // 3. Probabilité d'avoir ces lands (Hypergéométrique standard)
    // Note: On soustrait les cartes 'ramp' de la population du deck
    const pLands = getLandProbability(landsNeeded, targetTurn, deck, rampCount);

    // 4. Somme pondérée (Probabilités disjointes simplifiées)
    probabilitySum += (pRamp * pLands);
  }
  
  return Math.min(1, probabilitySum);
}
```

### Gestion des Cas Spéciaux

| Cas | Traitement |
|-----|------------|
| **Rocks à coût** (Arcane Signet) | `getRampProbability` vérifie `currentTurn > (rockCost + 1)`. Si faux, contribution = 0 |
| **Trésors/Rituels** | Traités avec `isOneShot: true`. Boost le tour actuel mais pas le mana soutenu |

---

## 4. Paramétrage & Métagame (Configuration)

### Tableau Comparatif par Format

| Paramètre | Commander (Casual) | Modern/Legacy (Compétitif) |
|-----------|-------------------|----------------------------|
| **Dork Survival Base** | 0.90 (Peu de removal T1) | 0.60 ("Bolt the Bird" rule) |
| **Rock Survival Base** | 0.98 (Sol Ring safe) | 0.90 (Karn/Ouphe/Boseiju) |
| **Ramp Density Goal** | ~10-15 sources | 6-8 (Spécifique deck) |
| **Land Count Logic** | -1 land pour 2-3 rocks | Strictement optimisé |

### Implémentation UX

**Action** : Créer un slider ou sélecteur **"Removal Density"** dans l'UI qui modifie globalement les `survivalRate`.

```typescript
const REMOVAL_DENSITY_MULTIPLIERS = {
  low: 1.0,      // Casual EDH
  medium: 0.85,  // Standard, High-Power EDH
  high: 0.65     // Modern, Legacy, cEDH
};
```

---

## 5. Expérience Utilisateur (UX)

### Indicateur "Tour Accéléré"

Au lieu de juste afficher "75%", afficher :

```
┌─────────────────────────────────────────────────────────┐
│  ✅ Castable T3  (Gros vert)                            │
│  ⚡ T2 possible (35%) avec Dork                         │
└─────────────────────────────────────────────────────────┘
```

**Inspiration** : 17Lands "Turn Drawn" metric

### Visualisation de l'Impact (Barres Comparatives)

Une barre segmentée qui éduque l'utilisateur :

```
Probabilité de cast T3:

[ ██████████████████ ] 60% Lands seuls (Base fiable)
[ ▒▒▒▒▒▒▒▒          ] +20% Contribution Ramp (Risque removal)
─────────────────────────────────────────────────────
[ ██████████████████▒▒▒▒▒▒▒▒ ] 80% Total
```

**Message clé** : "Mon plan de jeu dépend à 20% de la survie de mon elfe"

### Tips Contextuels (Snail-style)

```
💡 Insight: Ajouter 1 Birds of Paradise augmenterait 
   votre probabilité T2 de +4%
```

---

## 6. Comparaison avec les Analyses Précédentes

| Aspect | Analyses #1-4 | Analyse #5 | Verdict |
|--------|---------------|------------|---------|
| **Formule** | Scénarios Disjoints k≤2 | M_T = L_T + Σ(A×σ×δ) | ✅ Équivalent, notation différente |
| **Performance** | O(n²) Poisson-binomial | O(1) itérations fixes | ✅ #5 plus explicite sur O(1) |
| **UX Barres** | Non mentionné | Segmented bar | ✅ Nouveauté utile |
| **Tips contextuels** | Tooltip simple | "+4% avec Birds" | ✅ Nouveauté utile |
| **survivalRate** | Slider r | removalDensity multiplier | ✅ Équivalent |

### Éléments Nouveaux Utiles de l'Analyse #5

1. **Notation mathématique explicite** : M_T = L_T + Σ(A×σ×δ) — plus formelle
2. **Barre segmentée** : Visualisation "Base fiable" vs "Risque removal"
3. **Tips "+X% avec carte"** : Recommandations actionnables
4. **O(1) explicite** : Confirmation que la boucle 0-2 est à complexité constante

---

## 7. Intégration dans l'Architecture Finale

### Mise à Jour des Types (merge avec Analyse #4)

```typescript
interface ManaProducer {
  // ... existing from Analysis #4 ...
  
  // Ajout Analysis #5
  survivalRate: number;     // Base rate modifié par format
  isOneShot: boolean;       // Pour rituels/trésors
}

interface FormatContext {
  format: 'standard' | 'modern' | 'commander' | 'legacy' | 'cedh';
  removalDensity: 'goldfish' | 'low' | 'medium' | 'high';
}

// Mapping vers les valeurs r de l'Analyse #4
const REMOVAL_TO_R = {
  goldfish: 0.00,
  low: 0.10,
  medium: 0.25,
  high: 0.45
};
```

### UX Enrichie

```
┌─────────────────────────────────────────────────────────┐
│  Cryptic Command  {1}{U}{U}{U}                          │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  📊 Castability T4                                      │
│  [ ██████████████████ ] 67% Lands only                 │
│  [ ▒▒▒▒▒▒▒            ] +8% With Ramp                  │
│  ─────────────────────────────────────────────────────  │
│  [ ██████████████████▒▒▒▒▒▒▒ ] 75% Total              │
│                                                         │
│  ⚡ T3 possible: 28% (avec Sol Ring)                    │
│                                                         │
│  💡 +3% si vous ajoutez 1 Talisman of Dominance        │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Conclusion de l'Analyse #5

### Points Confirmés

- ✅ Approche hybride (analytique + Monte Carlo optionnel)
- ✅ Calcul itératif O(1) — boucle 0/1/2 ramp sources
- ✅ S'appuie sur Karsten (pondération) et 17Lands (logique temporelle)

### Nouveautés à Intégrer

| Feature | Priorité | Effort |
|---------|----------|--------|
| **Barre segmentée** (Lands vs Ramp) | P1 | 2h |
| **Tips "+X% avec carte"** | P2 | 3h |
| **FormatContext injectable** | P0 | 1h |

---

# Updated Final Synthesis

## Consensus Final (Analyses #1-5)

| Topic | Décision Finale | Sources |
|-------|-----------------|---------|
| **Méthode V1** | Scénarios Disjoints k≤2 / M_T formule | #1, #2, #4, #5 |
| **Performance** | O(1) itérations, <10ms | #2, #4, #5 |
| **Survie** | Slider + format presets | #1, #3, #4, #5 |
| **UX Barres** | Segmentée (Base + Ramp) | #5 (nouveau) |
| **Tips contextuels** | "+X% avec carte Y" | #3 (Snail), #5 |
| **Monte Carlo V2** | Web Worker, deck-level | #1, #4 |

## Priorités Finales Mises à Jour

| Priorité | Feature | Effort | Source |
|----------|---------|--------|--------|
| **P0** | `mana_producers.json` + classification | 2 jours | #4 |
| **P0** | FormatContext injectable | 0.5 jour | #5 |
| **P0** | Slider survie + presets format | 0.5 jour | #1-5 |
| **P1** | Scénarios disjoints k≤2 | 3 jours | #2, #4, #5 |
| **P1** | UI "With Accelerators" + badges | 1 jour | #4 |
| **P1** | Barre segmentée (Lands vs Ramp) | 0.5 jour | #5 |
| **P2** | Tooltips explicatifs | 0.5 jour | #4 |
| **P2** | Tips "+X% avec carte" | 1 jour | #5 |
| **P3** | Monte Carlo Web Worker | 4 jours | #1, #4 |

---

# Appendix A: Reference Implementation (Expert Starter Pack)

**Source**: External Expert Implementation  
**Date**: December 2025  
**Contents**: Production-ready TypeScript code for immediate integration

---

## A.1 mana_producers.json (Starter Dataset)

Base de données locale des producteurs de mana connus. Extensible sans modification de code.

```json
{
  "Llanowar Elves": {
    "type": "DORK",
    "castCostGeneric": 0,
    "castCostColors": { "G": 1 },
    "delay": 1,
    "isCreature": true,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["G"],
    "producesAny": false,
    "oneShot": false,
    "survivalBase": 0.75
  },
  "Elvish Mystic": {
    "type": "DORK",
    "castCostGeneric": 0,
    "castCostColors": { "G": 1 },
    "delay": 1,
    "isCreature": true,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["G"],
    "producesAny": false,
    "oneShot": false,
    "survivalBase": 0.75
  },
  "Birds of Paradise": {
    "type": "DORK",
    "castCostGeneric": 0,
    "castCostColors": { "G": 1 },
    "delay": 1,
    "isCreature": true,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["W", "U", "B", "R", "G"],
    "producesAny": true,
    "oneShot": false,
    "survivalBase": 0.8
  },
  "Noble Hierarch": {
    "type": "DORK",
    "castCostGeneric": 0,
    "castCostColors": { "G": 1 },
    "delay": 1,
    "isCreature": true,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["W", "U", "G"],
    "producesAny": false,
    "oneShot": false,
    "survivalBase": 0.78
  },
  "Ignoble Hierarch": {
    "type": "DORK",
    "castCostGeneric": 0,
    "castCostColors": { "G": 1 },
    "delay": 1,
    "isCreature": true,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["B", "R", "G"],
    "producesAny": false,
    "oneShot": false,
    "survivalBase": 0.78
  },
  "Delighted Halfling": {
    "type": "DORK",
    "castCostGeneric": 0,
    "castCostColors": { "G": 1 },
    "delay": 1,
    "isCreature": true,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["C", "W", "U", "B", "R", "G"],
    "producesAny": true,
    "oneShot": false,
    "survivalBase": 0.8
  },
  "Sol Ring": {
    "type": "ROCK",
    "castCostGeneric": 1,
    "castCostColors": {},
    "delay": 0,
    "isCreature": false,
    "producesAmount": 2,
    "activationTax": 0,
    "produces": ["C"],
    "producesAny": false,
    "oneShot": false,
    "survivalBase": 0.99
  },
  "Mana Crypt": {
    "type": "ROCK",
    "castCostGeneric": 0,
    "castCostColors": {},
    "delay": 0,
    "isCreature": false,
    "producesAmount": 2,
    "activationTax": 0,
    "produces": ["C"],
    "producesAny": false,
    "oneShot": false,
    "survivalBase": 0.99
  },
  "Arcane Signet": {
    "type": "ROCK",
    "castCostGeneric": 2,
    "castCostColors": {},
    "delay": 0,
    "isCreature": false,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["W", "U", "B", "R", "G"],
    "producesAny": true,
    "oneShot": false,
    "survivalBase": 0.98
  },
  "Talisman of Dominance": {
    "type": "ROCK",
    "castCostGeneric": 2,
    "castCostColors": {},
    "delay": 0,
    "isCreature": false,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["U", "B", "C"],
    "producesAny": false,
    "oneShot": false,
    "survivalBase": 0.98
  },
  "Izzet Signet": {
    "type": "ROCK",
    "castCostGeneric": 2,
    "castCostColors": {},
    "delay": 0,
    "isCreature": false,
    "producesAmount": 2,
    "activationTax": 1,
    "produces": ["U", "R"],
    "producesAny": false,
    "oneShot": false,
    "survivalBase": 0.98
  },
  "Lotus Petal": {
    "type": "ONE_SHOT",
    "castCostGeneric": 0,
    "castCostColors": {},
    "delay": 0,
    "isCreature": false,
    "producesAmount": 1,
    "activationTax": 0,
    "produces": ["W", "U", "B", "R", "G"],
    "producesAny": true,
    "oneShot": true,
    "survivalBase": 1.0
  },
  "Dark Ritual": {
    "type": "RITUAL",
    "castCostGeneric": 0,
    "castCostColors": { "B": 1 },
    "delay": 0,
    "isCreature": false,
    "producesAmount": 3,
    "activationTax": 0,
    "produces": ["B"],
    "producesAny": false,
    "oneShot": true,
    "survivalBase": 1.0
  }
}
```

---

## A.2 types.ts (Type Definitions)

```typescript
// src/castability/types.ts
export const COLOR = { W: 1, U: 2, B: 4, R: 8, G: 16, C: 32 } as const;
export type ColorLetter = keyof typeof COLOR;
export type ColorMask = number;

export type SourceType = "LAND" | "DORK" | "ROCK" | "RITUAL" | "ONE_SHOT" | "TREASURE" | "CONDITIONAL";

export interface ManaCost {
  mv: number; // total mana value
  generic: number;
  pips: Partial<Record<ColorLetter, number>>;
}

export interface DeckManaProfile {
  deckSize: number; // 60 or 99
  totalLands: number;
  // how many cards in the deck can produce each color as a land source
  landColorSources: Partial<Record<ColorLetter, number>>;
}

export interface ManaProducerDef {
  name: string;
  type: SourceType;

  castCostGeneric: number;
  castCostColors: Partial<Record<ColorLetter, number>>;

  delay: number; // 1 for dorks (summoning sickness) or ETB tapped
  isCreature: boolean;

  producesAmount: number; // raw amount produced
  activationTax: number;  // e.g. signets cost 1 to activate
  producesMask: ColorMask; // which colors it can produce (or C)
  producesAny: boolean;

  oneShot: boolean;
  survivalBase?: number;
}

export interface ProducerInDeck {
  def: ManaProducerDef;
  copies: number;
}

export interface AccelContext {
  playDraw: "PLAY" | "DRAW";
  // removal attrition rate per exposed turn for creatures (0..1)
  removalRate: number;
  // used when producer is not creature; if survivalBase not set
  defaultRockSurvival: number; // e.g. 0.98
}

export interface CastabilityResult {
  p1: number;
  p2: number;
}

export interface AcceleratedCastabilityResult {
  base: CastabilityResult;
  withAcceleration: CastabilityResult;
  accelerationImpact: number; // withAccel.p2 - base.p2
  acceleratedTurn: number | null; // earliest turn where cast becomes possible
  keyAccelerators: string[];
}
```

---

## A.3 hypergeom.ts (Hypergeometric Utilities)

```typescript
// src/castability/hypergeom.ts
// Fast-enough hypergeometric utilities for N<=100 (MTG decks).
// Uses log-factorials to stay numerically stable.

export type PlayDraw = "PLAY" | "DRAW";

export function cardsSeenByTurn(turn: number, playDraw: PlayDraw): number {
  // Convention: starting hand = 7
  // PLAY: no draw on turn 1 => seen = 7 + (turn-1)
  // DRAW: draw on turn 1      => seen = 7 + turn
  if (turn <= 0) return 0;
  return playDraw === "PLAY" ? 7 + Math.max(0, turn - 1) : 7 + turn;
}

function buildLogFactorials(maxN: number): Float64Array {
  const lf = new Float64Array(maxN + 1);
  lf[0] = 0;
  for (let i = 1; i <= maxN; i++) lf[i] = lf[i - 1] + Math.log(i);
  return lf;
}

export class Hypergeom {
  private lf: Float64Array;
  private maxN: number;

  constructor(maxN: number) {
    this.maxN = maxN;
    this.lf = buildLogFactorials(maxN);
  }

  private logChoose(n: number, k: number): number {
    if (k < 0 || k > n) return -Infinity;
    return this.lf[n] - this.lf[k] - this.lf[n - k];
  }

  pmf(N: number, K: number, n: number, k: number): number {
    // P(X=k) where X~Hypergeom(N,K,n)
    if (N < 0 || K < 0 || n < 0) return 0;
    if (K > N || n > N) return 0;
    const kMin = Math.max(0, n - (N - K));
    const kMax = Math.min(K, n);
    if (k < kMin || k > kMax) return 0;

    const logP =
      this.logChoose(K, k) +
      this.logChoose(N - K, n - k) -
      this.logChoose(N, n);

    return Math.exp(logP);
  }

  atLeast(N: number, K: number, n: number, kMin: number): number {
    // P(X >= kMin)
    const kMax = Math.min(K, n);
    if (kMin <= 0) return 1;
    if (kMin > kMax) return 0;
    let sum = 0;
    for (let k = kMin; k <= kMax; k++) sum += this.pmf(N, K, n, k);
    return Math.min(1, Math.max(0, sum));
  }

  atMost(N: number, K: number, n: number, kMax: number): number {
    const kMin = Math.max(0, n - (N - K));
    if (kMax < kMin) return 0;
    let sum = 0;
    for (let k = kMin; k <= Math.min(kMax, K, n); k++) sum += this.pmf(N, K, n, k);
    return Math.min(1, Math.max(0, sum));
  }

  atLeastOneCopy(deckSize: number, copies: number, cardsSeen: number): number {
    if (copies <= 0) return 0;
    // 1 - P(0 copies)
    const p0 = this.pmf(deckSize, copies, cardsSeen, 0);
    return Math.min(1, Math.max(0, 1 - p0));
  }
}
```

---

## A.4 acceleratedAnalyticEngine.ts (Core Engine)

```typescript
// src/castability/acceleratedAnalyticEngine.ts
import { Hypergeom, cardsSeenByTurn } from "./hypergeom";
import { 
  COLOR, ColorLetter, ColorMask, ManaCost, DeckManaProfile, 
  ProducerInDeck, AccelContext, CastabilityResult, AcceleratedCastabilityResult 
} from "./types";

function colorMaskFromLetters(letters: ColorLetter[]): ColorMask {
  return letters.reduce((m, c) => m | COLOR[c], 0);
}

export function parseProducerJsonEntry(name: string, raw: any): ProducerInDeck {
  const producesMask = raw.producesAny 
    ? (COLOR.W|COLOR.U|COLOR.B|COLOR.R|COLOR.G|COLOR.C) 
    : colorMaskFromLetters(raw.produces ?? []);
  return {
    def: {
      name,
      type: raw.type,
      castCostGeneric: raw.castCostGeneric ?? 0,
      castCostColors: raw.castCostColors ?? {},
      delay: raw.delay ?? 0,
      isCreature: !!raw.isCreature,
      producesAmount: raw.producesAmount ?? 1,
      activationTax: raw.activationTax ?? 0,
      producesMask,
      producesAny: !!raw.producesAny,
      oneShot: !!raw.oneShot,
      survivalBase: raw.survivalBase,
    },
    copies: raw.copies ?? 0,
  };
}

function sumPips(pips: ManaCost["pips"]): number {
  let s = 0;
  for (const k of Object.keys(pips) as ColorLetter[]) s += pips[k] ?? 0;
  return s;
}

function popcountMask(mask: number): number {
  let x = mask >>> 0, c = 0;
  while (x) { x &= (x - 1) >>> 0; c++; }
  return c;
}

function producerOptionsForCost(
  producesAny: boolean, 
  producesMask: ColorMask, 
  neededColors: ColorLetter[]
): ColorLetter[] {
  if (producesAny) return neededColors;
  const opts: ColorLetter[] = [];
  for (const c of neededColors) {
    if ((producesMask & COLOR[c]) !== 0) opts.push(c);
  }
  return opts;
}

// Conservative "can cast this cost by turn" estimate using only lands.
function estimateCanCastCostByTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  costGeneric: number,
  costColors: Partial<Record<ColorLetter, number>>,
  turn: number,
  ctx: AccelContext
): number {
  const seen = cardsSeenByTurn(turn, ctx.playDraw);

  const colorLetters = Object.keys(costColors) as ColorLetter[];
  const pColor = colorLetters.map((cl) => {
    const need = costColors[cl] ?? 0;
    if (need <= 0) return 1;
    const K = deck.landColorSources[cl] ?? 0;
    return hg.atLeast(deck.deckSize, K, seen, need);
  });

  const totalNeededMana = costGeneric + colorLetters.reduce(
    (a, cl) => a + (costColors[cl] ?? 0), 0
  );
  const pLands = hg.atLeast(deck.deckSize, deck.totalLands, seen, totalNeededMana);

  const pMin = Math.min(pLands, ...pColor);
  return Math.max(0, Math.min(1, pMin));
}

export function producerOnlineProbByTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  producer: ProducerInDeck,
  turnTarget: number,
  ctx: AccelContext
): number {
  const def = producer.def;
  const tLatest = turnTarget - def.delay - 1;
  if (tLatest < 1) return 0;
  const seenLatest = cardsSeenByTurn(tLatest, ctx.playDraw);

  const pDraw = hg.atLeastOneCopy(deck.deckSize, producer.copies, seenLatest);
  const pCastable = estimateCanCastCostByTurn(
    hg, deck, def.castCostGeneric, def.castCostColors, tLatest, ctx
  );

  const exposure = Math.max(0, turnTarget - tLatest);
  const pSurvive = def.isCreature
    ? Math.pow(1 - ctx.removalRate, exposure)
    : (def.survivalBase ?? ctx.defaultRockSurvival);

  const p = pDraw * pCastable * pSurvive;
  return Math.max(0, Math.min(1, p));
}

function computeBaseCastability(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext
): CastabilityResult {
  const seen = cardsSeenByTurn(turn, ctx.playDraw);

  // P1: for each required color, have at least that many sources
  const colors = Object.keys(spell.pips) as ColorLetter[];
  const pColors = colors.map((cl) => {
    const need = spell.pips[cl] ?? 0;
    if (need <= 0) return 1;
    const K = deck.landColorSources[cl] ?? 0;
    return hg.atLeast(deck.deckSize, K, seen, need);
  });
  const p1 = Math.min(...pColors, 1);

  // P2: multiply by probability to have enough lands
  const pLandsEnough = hg.atLeast(deck.deckSize, deck.totalLands, seen, turn);
  const p2 = p1 * pLandsEnough;

  return { p1, p2 };
}

// Best allocation of <=2 online producers to cover colored pips.
// Brute-force assignment because k<=2 -> tiny search.
function bestP1GivenOnlineProducers(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext,
  onlineProducers: ProducerInDeck[]
): number {
  const seen = cardsSeenByTurn(turn, ctx.playDraw);

  const neededColors = (Object.keys(spell.pips) as ColorLetter[])
    .filter((c) => (spell.pips[c] ?? 0) > 0);
  if (neededColors.length === 0) return 1;

  const baseRemaining: Record<ColorLetter, number> = { W:0, U:0, B:0, R:0, G:0, C:0 };
  for (const c of neededColors) baseRemaining[c] = spell.pips[c] ?? 0;

  const prodOptions: Array<(ColorLetter | null)[]> = onlineProducers.map((p) => {
    const opts = producerOptionsForCost(p.def.producesAny, p.def.producesMask, neededColors);
    return [null, ...opts];
  });

  let best = 0;

  function evalAssignment(assignment: Array<ColorLetter | null>) {
    const rem: Record<ColorLetter, number> = { ...baseRemaining };
    for (const a of assignment) {
      if (a && rem[a] > 0) rem[a] -= 1;
    }

    let minP = 1;
    for (const c of neededColors) {
      const need = rem[c];
      if (need <= 0) continue;
      const K = deck.landColorSources[c] ?? 0;
      const p = hg.atLeast(deck.deckSize, K, seen, need);
      minP = Math.min(minP, p);
      if (minP === 0) break;
    }
    best = Math.max(best, minP);
  }

  function dfs(i: number, assignment: Array<ColorLetter | null>) {
    if (i === onlineProducers.length) {
      evalAssignment(assignment);
      return;
    }
    for (const opt of prodOptions[i]) {
      assignment.push(opt);
      dfs(i + 1, assignment);
      assignment.pop();
    }
  }

  dfs(0, []);
  return best;
}

function netPerTurn(p: ProducerInDeck): number {
  return Math.max(0, (p.def.producesAmount ?? 0) - (p.def.activationTax ?? 0));
}

function castabilityGivenOnlineSet(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  ctx: AccelContext,
  onlineSet: ProducerInDeck[]
): CastabilityResult {
  const extraMana = onlineSet.reduce((s, p) => s + netPerTurn(p), 0);

  const landsNeeded = Math.max(0, spell.mv - extraMana);
  if (landsNeeded > turn) return { p1: 0, p2: 0 };

  const seen = cardsSeenByTurn(turn, ctx.playDraw);
  const p1 = bestP1GivenOnlineProducers(hg, deck, spell, turn, ctx, onlineSet);
  const pLandsEnough = hg.atLeast(deck.deckSize, deck.totalLands, seen, landsNeeded);
  const p2 = p1 * pLandsEnough;

  return { p1, p2 };
}

// Approx. disjoint scenario calculation for K=0,1,2 online useful producers.
export function computeAcceleratedCastabilityAtTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  turn: number,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  kMax: 0 | 1 | 2 = 2
): CastabilityResult {
  const p = producers
    .filter((pd) => pd.copies > 0)
    .map((pd) => ({ pd, pOnline: producerOnlineProbByTurn(hg, deck, pd, turn, ctx) }))
    .filter((x) => x.pOnline > 0);

  if (p.length === 0 || kMax === 0) {
    return computeBaseCastability(hg, deck, spell, turn, ctx);
  }

  // Keep only most relevant producers
  p.sort((a, b) => (b.pOnline * netPerTurn(b.pd)) - (a.pOnline * netPerTurn(a.pd)));
  const candidates = p.slice(0, 18);

  const probs = candidates.map((x) => x.pOnline);
  const list = candidates.map((x) => x.pd);

  // p0 = Π(1-pi)
  let p0 = 1;
  for (const pi of probs) p0 *= (1 - pi);
  p0 = Math.max(0, Math.min(1, p0));

  // weights for exactly-1
  const w1: number[] = [];
  let p1 = 0;
  for (let i = 0; i < probs.length; i++) {
    const pi = probs[i];
    const wi = (pi >= 1) ? 0 : (pi * p0) / (1 - pi);
    w1.push(wi);
    p1 += wi;
  }
  p1 = Math.max(0, Math.min(1, p1));

  let p2 = 0;
  if (kMax >= 2) {
    p2 = Math.max(0, Math.min(1, 1 - p0 - p1));
  }

  const k0 = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, []);

  let outP1 = p0 * k0.p1;
  let outP2 = p0 * k0.p2;

  if (kMax >= 1 && p1 > 0) {
    let accP1 = 0, accP2 = 0;
    for (let i = 0; i < list.length; i++) {
      const wi = w1[i] / p1;
      const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [list[i]]);
      accP1 += wi * res.p1;
      accP2 += wi * res.p2;
    }
    outP1 += p1 * accP1;
    outP2 += p1 * accP2;
  }

  if (kMax >= 2 && p2 > 0 && list.length >= 2) {
    let sumPairs = 0;
    const pairWeights: Array<{ i: number; j: number; w: number }> = [];

    for (let i = 0; i < probs.length; i++) {
      const pi = probs[i];
      if (pi <= 0 || pi >= 1) continue;
      for (let j = i + 1; j < probs.length; j++) {
        const pj = probs[j];
        if (pj <= 0 || pj >= 1) continue;
        const w = (pi * pj * p0) / ((1 - pi) * (1 - pj));
        if (w > 0) {
          pairWeights.push({ i, j, w });
          sumPairs += w;
        }
      }
    }

    if (sumPairs > 0) {
      let accP1 = 0, accP2 = 0;
      for (const pw of pairWeights) {
        const wNorm = pw.w / sumPairs;
        const res = castabilityGivenOnlineSet(hg, deck, spell, turn, ctx, [list[pw.i], list[pw.j]]);
        accP1 += wNorm * res.p1;
        accP2 += wNorm * res.p2;
      }
      outP1 += p2 * accP1;
      outP2 += p2 * accP2;
    }
  }

  return { p1: Math.max(0, Math.min(1, outP1)), p2: Math.max(0, Math.min(1, outP2)) };
}

export function findAcceleratedTurn(
  hg: Hypergeom,
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext,
  minProb: number = 0.05
): { acceleratedTurn: number | null; withAccelAtTurn?: CastabilityResult } {
  const naturalTurn = spell.mv;
  for (let t = 1; t < naturalTurn; t++) {
    const res = computeAcceleratedCastabilityAtTurn(hg, deck, spell, t, producers, ctx, 2);
    if (res.p2 >= minProb) return { acceleratedTurn: t, withAccelAtTurn: res };
  }
  return { acceleratedTurn: null };
}

export function computeAcceleratedCastability(
  deck: DeckManaProfile,
  spell: ManaCost,
  producers: ProducerInDeck[],
  ctx: AccelContext
): AcceleratedCastabilityResult {
  const hg = new Hypergeom(Math.max(200, deck.deckSize + 20));

  const naturalTurn = spell.mv;
  const base = computeBaseCastability(hg, deck, spell, naturalTurn, ctx);
  const withAcceleration = computeAcceleratedCastabilityAtTurn(
    hg, deck, spell, naturalTurn, producers, ctx, 2
  );

  const accel = findAcceleratedTurn(hg, deck, spell, producers, ctx, 0.05);

  const scored = producers.map((pd) => {
    const pOnline = producerOnlineProbByTurn(hg, deck, pd, naturalTurn, ctx);
    return { name: pd.def.name, score: pOnline * netPerTurn(pd) };
  }).sort((a, b) => b.score - a.score);

  return {
    base,
    withAcceleration,
    accelerationImpact: withAcceleration.p2 - base.p2,
    acceleratedTurn: accel.acceleratedTurn,
    keyAccelerators: scored.slice(0, 3).map((x) => x.name),
  };
}
```

---

## A.5 acceleratedAnalyticEngine.test.ts (Vitest Tests)

```typescript
// src/castability/__tests__/acceleratedAnalyticEngine.test.ts
import { describe, it, expect } from "vitest";
import { Hypergeom } from "../hypergeom";
import { computeAcceleratedCastabilityAtTurn, producerOnlineProbByTurn } from "../acceleratedAnalyticEngine";
import type { DeckManaProfile, ManaCost, ProducerInDeck, AccelContext } from "../types";
import { COLOR } from "../types";

const ctx: AccelContext = { playDraw: "PLAY", removalRate: 0.25, defaultRockSurvival: 0.98 };

function mkDeck(): DeckManaProfile {
  return {
    deckSize: 60,
    totalLands: 24,
    landColorSources: { G: 14, U: 10, R: 10, B: 8, W: 8 }
  };
}

function mkElf(copies: number): ProducerInDeck {
  return {
    copies,
    def: {
      name: "Llanowar Elves",
      type: "DORK",
      castCostGeneric: 0,
      castCostColors: { G: 1 },
      delay: 1,
      isCreature: true,
      producesAmount: 1,
      activationTax: 0,
      producesMask: COLOR.G,
      producesAny: false,
      oneShot: false,
      survivalBase: 0.75,
    }
  };
}

function mkSignet(copies: number): ProducerInDeck {
  return {
    copies,
    def: {
      name: "Arcane Signet",
      type: "ROCK",
      castCostGeneric: 2,
      castCostColors: {},
      delay: 0,
      isCreature: false,
      producesAmount: 1,
      activationTax: 0,
      producesMask: COLOR.W|COLOR.U|COLOR.B|COLOR.R|COLOR.G,
      producesAny: true,
      oneShot: false,
      survivalBase: 0.98,
    }
  };
}

describe("producerOnlineProbByTurn", () => {
  it("returns 0 if cannot be online in time (tLatest<1)", () => {
    const hg = new Hypergeom(200);
    const deck = mkDeck();
    const elf = mkElf(4);
    const p = producerOnlineProbByTurn(hg, deck, elf, 2, ctx);
    expect(p).toBe(0);
  });
});

describe("computeAcceleratedCastabilityAtTurn", () => {
  it("Elf package increases probability to cast MV3 on turn 2 (ramp)", () => {
    const hg = new Hypergeom(200);
    const deck = mkDeck();

    const spell: ManaCost = { mv: 3, generic: 2, pips: { G: 1 } }; // 2G
    const noProd = computeAcceleratedCastabilityAtTurn(hg, deck, spell, 2, [], ctx, 2);
    const withElf = computeAcceleratedCastabilityAtTurn(hg, deck, spell, 2, [mkElf(4)], ctx, 2);

    expect(withElf.p2).toBeGreaterThan(noProd.p2);
  });

  it("Arcane Signet does not meaningfully enable MV2 on turn 1 (obvious)", () => {
    const hg = new Hypergeom(200);
    const deck = mkDeck();
    const spell: ManaCost = { mv: 2, generic: 2, pips: {} }; // {2}
    const res = computeAcceleratedCastabilityAtTurn(hg, deck, spell, 1, [mkSignet(4)], ctx, 2);
    expect(res.p2).toBe(0);
  });
});
```

---

## A.6 manaSimWorker.ts (Smart Monte Carlo Worker)

```typescript
// src/worker/manaSimWorker.ts
// Minimal "mana-only" simulation worker (Smart Monte Carlo).
/*
Usage:
  const worker = new Worker(new URL("./manaSimWorker.ts", import.meta.url), { type: "module" });
  worker.postMessage({ type: "RUN", payload: ... });
  worker.onmessage = (ev) => { ... }
*/

import { COLOR, type ColorLetter, type ColorMask, type ManaCost, type ManaProducerDef } from "./types";

export type SimCard =
  | { kind: "LAND"; producesMask: ColorMask; entersTapped?: boolean }
  | { kind: "PRODUCER"; producer: ManaProducerDef }
  | { kind: "SPELL"; id: string; cost: ManaCost };

export interface SimRequest {
  type: "RUN";
  payload: {
    deck: SimCard[];           // deck list as flat array
    spells: { id: string; cost: ManaCost }[]; // spells to track
    maxTurn: number;           // how far to simulate
    iterations: number;        // 1000..2500 typical
    playDraw: "PLAY" | "DRAW";
    removalRate: number;       // attrition per exposed turn for creatures
  };
}

export interface SimResponse {
  type: "RESULT";
  payload: {
    iterations: number;
    maxTurn: number;
    castableByTurn: Record<string, number[]>; // [spellId][t] = P(castable by turn t+1)
    avgCastTurn: Record<string, number>;      // expected turn of first cast
    durationMs: number;
  };
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function countPips(cost: ManaCost): number {
  return Object.values(cost.pips).reduce((a, v) => a + (v ?? 0), 0);
}

function canPay(
  cost: ManaCost, 
  available: { totalMana: number; colorSources: Record<ColorLetter, number> }
): boolean {
  if (available.totalMana < cost.mv) return false;
  for (const c of Object.keys(cost.pips) as ColorLetter[]) {
    const need = cost.pips[c] ?? 0;
    if ((available.colorSources[c] ?? 0) < need) return false;
  }
  return true;
}

function landChoiceScore(producesMask: ColorMask, haveMask: ColorMask): number {
  const newColors = producesMask & ~haveMask;
  return popcount(newColors);
}

function popcount(x: number): number {
  x >>>= 0;
  let c = 0;
  while (x) { x &= (x - 1) >>> 0; c++; }
  return c;
}

function maskToColorCounts(mask: ColorMask): Record<ColorLetter, number> {
  return {
    W: (mask & COLOR.W) ? 1 : 0,
    U: (mask & COLOR.U) ? 1 : 0,
    B: (mask & COLOR.B) ? 1 : 0,
    R: (mask & COLOR.R) ? 1 : 0,
    G: (mask & COLOR.G) ? 1 : 0,
    C: (mask & COLOR.C) ? 1 : 0,
  };
}

function producerNetPerTurn(p: ManaProducerDef): number {
  return Math.max(0, (p.producesAmount ?? 0) - (p.activationTax ?? 0));
}

function producerProducesMask(p: ManaProducerDef): ColorMask {
  return p.producesAny ? (COLOR.W|COLOR.U|COLOR.B|COLOR.R|COLOR.G|COLOR.C) : p.producesMask;
}

type OnlineProducerState = {
  p: ManaProducerDef;
  onlineAt: number;
  isCreature: boolean;
};

function drawHand(deck: SimCard[], size: number): SimCard[] {
  return deck.slice(0, size);
}

// TODO: Replace with London Mulligan heuristic (deck-aware).
function keepHandSimple(hand: SimCard[]): boolean {
  const lands = hand.filter((c) => c.kind === "LAND").length;
  return lands >= 2 && lands <= 5;
}

function mulliganSimple(deck: SimCard[]): { hand: SimCard[]; bottomed: SimCard[] } {
  const h7 = drawHand(deck, 7);
  if (keepHandSimple(h7)) return { hand: h7, bottomed: [] };
  const h6 = drawHand(deck, 7);
  let idx = -1;
  let bestMv = -1;
  for (let i = 0; i < h6.length; i++) {
    const c = h6[i];
    if (c.kind === "SPELL") {
      if (c.cost.mv > bestMv) { bestMv = c.cost.mv; idx = i; }
    }
  }
  if (idx < 0) idx = h6.length - 1;
  const bottomed = [h6[idx]];
  const hand = h6.filter((_, i) => i !== idx);
  return { hand, bottomed };
}

function computeAvailableMana(
  turn: number,
  landsInPlay: SimCard[],
  producersInPlay: OnlineProducerState[],
  removalRate: number
): { totalMana: number; colorSources: Record<ColorLetter, number>; producersInPlay: OnlineProducerState[] } {
  const survivors: OnlineProducerState[] = [];
  for (const s of producersInPlay) {
    if (s.isCreature && turn > 1) {
      if (Math.random() < removalRate) continue;
    }
    survivors.push(s);
  }

  let total = landsInPlay.length;
  let haveMask: ColorMask = 0;
  let colorCounts: Record<ColorLetter, number> = { W:0,U:0,B:0,R:0,G:0,C:0 };

  for (const l of landsInPlay) {
    if (l.kind !== "LAND") continue;
    const m = l.producesMask;
    haveMask |= m;
    const cc = maskToColorCounts(m);
    for (const k in cc) colorCounts[k as ColorLetter] += cc[k as ColorLetter];
  }

  for (const s of survivors) {
    if (turn >= s.onlineAt) {
      const net = producerNetPerTurn(s.p);
      total += net;
      const m = producerProducesMask(s.p);
      const cc = maskToColorCounts(m);
      for (const k in cc) colorCounts[k as ColorLetter] += cc[k as ColorLetter];
    }
  }

  return { totalMana: total, colorSources: colorCounts, producersInPlay: survivors };
}

function canCastProducerNow(
  p: ManaProducerDef, 
  availableTotal: number, 
  availableColors: Record<ColorLetter, number>
): boolean {
  const needTotal = p.castCostGeneric + Object.values(p.castCostColors ?? {})
    .reduce((a, v) => a + (v ?? 0), 0);
  if (availableTotal < needTotal) return false;
  for (const c of Object.keys(p.castCostColors ?? {}) as ColorLetter[]) {
    const need = p.castCostColors[c] ?? 0;
    if ((availableColors[c] ?? 0) < need) return false;
  }
  return true;
}

function playLandGreedy(hand: SimCard[], landsInPlay: SimCard[], haveMask: ColorMask): boolean {
  let bestIdx = -1;
  let bestScore = -1;
  for (let i = 0; i < hand.length; i++) {
    const c = hand[i];
    if (c.kind !== "LAND") continue;
    const score = landChoiceScore(c.producesMask, haveMask);
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  if (bestIdx >= 0) {
    landsInPlay.push(hand[bestIdx]);
    hand.splice(bestIdx, 1);
    return true;
  }
  return false;
}

function playRampGreedy(
  turn: number,
  hand: SimCard[],
  landsInPlay: SimCard[],
  producersInPlay: OnlineProducerState[],
  availableTotal: number,
  availableColors: Record<ColorLetter, number>
): boolean {
  let bestIdx = -1;
  let bestScore = -1;

  for (let i = 0; i < hand.length; i++) {
    const c = hand[i];
    if (c.kind !== "PRODUCER") continue;
    const p = c.producer;
    if (!canCastProducerNow(p, availableTotal, availableColors)) continue;

    const net = producerNetPerTurn(p);
    const breadth = popcount(producerProducesMask(p));
    const score = net * 10 + breadth;

    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }

  if (bestIdx >= 0) {
    const card = hand[bestIdx] as any;
    const p: ManaProducerDef = card.producer;
    producersInPlay.push({ p, onlineAt: turn + (p.delay ?? 0), isCreature: !!p.isCreature });
    hand.splice(bestIdx, 1);
    return true;
  }
  return false;
}

function initOutcome(spells: { id: string; cost: ManaCost }[], maxTurn: number) {
  const castableByTurn: Record<string, number[]> = {};
  const firstCastTurnSum: Record<string, number> = {};
  for (const s of spells) {
    castableByTurn[s.id] = new Array(maxTurn).fill(0);
    firstCastTurnSum[s.id] = 0;
  }
  return { castableByTurn, firstCastTurnSum };
}

function runSimulation(req: SimRequest["payload"]): SimResponse["payload"] {
  const t0 = performance.now();
  const { deck, spells, maxTurn, iterations, playDraw, removalRate } = req;

  const { castableByTurn, firstCastTurnSum } = initOutcome(spells, maxTurn);

  for (let it = 0; it < iterations; it++) {
    const d = shuffle(deck.slice());
    const { hand } = mulliganSimple(d);
    let libraryIndex = 7;
    const handCards = hand.slice();

    const landsInPlay: SimCard[] = [];
    const producersInPlay: OnlineProducerState[] = [];
    let haveMask: ColorMask = 0;

    const firstCast: Record<string, number> = {};
    for (const s of spells) firstCast[s.id] = maxTurn + 1;

    for (let turn = 1; turn <= maxTurn; turn++) {
      const doDraw = !(turn === 1 && playDraw === "PLAY");
      if (doDraw && libraryIndex < d.length) {
        handCards.push(d[libraryIndex++]);
      }

      const avail0 = computeAvailableMana(turn, landsInPlay, producersInPlay, removalRate);
      playLandGreedy(handCards, landsInPlay, haveMask);
      for (const l of landsInPlay) if (l.kind === "LAND") haveMask |= l.producesMask;

      const avail1 = computeAvailableMana(turn, landsInPlay, avail0.producersInPlay, removalRate);
      playRampGreedy(turn, handCards, landsInPlay, avail1.producersInPlay, avail1.totalMana, avail1.colorSources);

      const avail2 = computeAvailableMana(turn, landsInPlay, avail1.producersInPlay, removalRate);

      for (const s of spells) {
        if (firstCast[s.id] <= maxTurn) continue;
        if (canPay(s.cost, { totalMana: avail2.totalMana, colorSources: avail2.colorSources })) {
          firstCast[s.id] = turn;
        }
      }
    }

    for (const s of spells) {
      const fc = firstCast[s.id];
      firstCastTurnSum[s.id] += fc;
      for (let t = 1; t <= maxTurn; t++) {
        if (fc <= t) castableByTurn[s.id][t - 1] += 1;
      }
    }
  }

  for (const s of spells) {
    for (let t = 0; t < maxTurn; t++) castableByTurn[s.id][t] /= iterations;
  }
  const avgCastTurn: Record<string, number> = {};
  for (const s of spells) avgCastTurn[s.id] = firstCastTurnSum[s.id] / iterations;

  const durationMs = performance.now() - t0;
  return { iterations, maxTurn, castableByTurn, avgCastTurn, durationMs };
}

self.onmessage = (ev: MessageEvent<SimRequest>) => {
  if (!ev.data || ev.data.type !== "RUN") return;
  const result = runSimulation(ev.data.payload);
  const msg: SimResponse = { type: "RESULT", payload: result };
  self.postMessage(msg);
};
```

---

## A.7 Integration Notes

### How to Integrate (Quick Start)

**1. Analytique (chemin critique UI)**

```typescript
// Construis DeckManaProfile depuis ton analyse existante
const deckProfile: DeckManaProfile = {
  deckSize: 60,
  totalLands: 24,
  landColorSources: { G: 14, U: 10, R: 8 }
};

// Charge mana_producers.json et map decklist → ProducerInDeck[]
const producers: ProducerInDeck[] = [
  { def: manaProducersJson["Llanowar Elves"], copies: 4 },
  { def: manaProducersJson["Sol Ring"], copies: 1 }
];

// Contexte
const ctx: AccelContext = {
  playDraw: "PLAY",
  removalRate: 0.25,    // Medium interaction
  defaultRockSurvival: 0.98
};

// Calcul
const result = computeAcceleratedCastability(deckProfile, spellCost, producers, ctx);
```

**2. Simulation (toggle "Analyse avancée")**

```typescript
// Transforme ton deck en SimCard[]
const simDeck: SimCard[] = deck.map(card => {
  if (card.isLand) return { kind: "LAND", producesMask: ... };
  if (isProducer(card)) return { kind: "PRODUCER", producer: ... };
  return { kind: "SPELL", id: card.name, cost: ... };
});

// Lance le worker
worker.postMessage({
  type: "RUN",
  payload: {
    deck: simDeck,
    spells: targetSpells,
    maxTurn: 7,
    iterations: 2000,
    playDraw: "PLAY",
    removalRate: 0.25
  }
});
```

---

*Document maintained by the ManaTuner Pro development team.*
*Last updated: December 2025*
