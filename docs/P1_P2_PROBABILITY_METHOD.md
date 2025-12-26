# Méthodologie de Calcul P1/P2 - ManaTuner Pro

## Vue d'ensemble

ManaTuner Pro utilise une méthodologie de calcul de probabilités basée sur le site original [Project Manabase](https://project-manabase.firebaseapp.com/), avec deux métriques complémentaires :

| Métrique | Nom | Description |
|----------|-----|-------------|
| **P1** | Perfect / Conditionnel | Probabilité de cast **en assumant qu'on touche tous ses land drops** |
| **P2** | Realistic / Réaliste | Probabilité de cast **incluant le risque de mana screw** |

**Relation : P2 ≤ P1 toujours**

---

## P1 : Probabilité Conditionnelle

### Définition
P1 répond à la question : *"Si j'ai exactement N terrains en jeu au tour N, quelle est la probabilité d'avoir les bonnes couleurs ?"*

### Formule
Pour un sort de CMC `N` nécessitant `k` symboles d'une couleur :

```
P1 = Hypergeometric(totalLands, sourcesForColor, N, k)
```

Où :
- `totalLands` = Nombre total de terrains dans le deck
- `sourcesForColor` = Nombre de sources de la couleur requise
- `N` = CMC du sort (nombre de lands assumés)
- `k` = Nombre de symboles colorés requis

### Exemple : Harvester of Misery {3}{B}{B}
- CMC = 5, donc on assume 5 terrains
- Besoin de 2 symboles noirs ({B}{B})
- Deck avec 24 lands dont 18 sources noires

```
P1 = Hypergeometric(24, 18, 5, 2)
   = P(avoir ≥2 sources noires parmi 5 terrains piochés)
   = 94%
```

---

## P2 : Probabilité Réaliste (Mana Screw)

### Définition
P2 répond à la question : *"Quelle est ma vraie probabilité de jouer ce sort on-curve, en incluant le risque de ne pas avoir assez de terrains ?"*

### Formule
```
P2 = P1 × P(avoir ≥N lands parmi cardsSeen cartes)
```

Où :
- `cardsSeen` = 7 (main initiale) + (N - 1) pioches = N + 6
- La probabilité d'avoir assez de lands utilise aussi la distribution hypergéométrique

### Exemple : Harvester of Misery {3}{B}{B}
- CMC = 5
- Cartes vues au tour 5 = 7 + 4 = **11 cartes**
- Deck de 60 cartes avec 24 lands

```
P(avoir ≥5 lands parmi 11 cartes) = Hypergeometric(60, 24, 11, 5)
                                   = ~41%

P2 = P1 × P(lands)
   = 94% × 41%
   = 39%
```

---

## Impact du CMC sur le Mana Screw

Plus le CMC est élevé, plus la probabilité d'avoir assez de lands diminue drastiquement :

| CMC | Cartes vues | P(avoir CMC lands) | Impact typique sur P2 |
|-----|-------------|-------------------|----------------------|
| 1 | 7 | ~97% | Négligeable |
| 2 | 8 | ~89% | Faible |
| 3 | 9 | ~73% | Modéré |
| 4 | 10 | ~55% | Significatif |
| 5 | 11 | ~41% | Important |
| 6 | 12 | ~27% | Majeur |
| 7 | 13 | ~16% | Sévère |
| 8 | 14 | ~9% | Critique |
| 9 | 15 | ~5% | Extrême |

*Valeurs calculées pour un deck 60 cartes avec 24 lands*

### Interprétation
- **CMC 1-2** : P1 ≈ P2 (le mana screw n'est pas un facteur majeur)
- **CMC 3-4** : P2 commence à diverger de P1
- **CMC 5+** : P2 chute significativement
- **CMC 8+** : P2 très bas (<10%) - jouer on-curve est statistiquement rare

---

## Distribution Hypergéométrique

### Définition
La distribution hypergéométrique modélise le tirage **sans remise** d'un échantillon. C'est le modèle mathématique exact pour Magic car on pioche des cartes sans les remettre dans le deck.

### Formule Mathématique
```
P(X = k) = C(K,k) × C(N-K, n-k) / C(N,n)
```

Où :
- `N` = Taille de la population (deck ou pool de lands)
- `K` = Nombre de succès dans la population (sources de couleur ou lands)
- `n` = Taille de l'échantillon (cartes piochées)
- `k` = Nombre de succès requis
- `C(a,b)` = Coefficient binomial "a choose b"

### Probabilité Cumulative
Pour "au moins k succès", on somme :
```
P(X ≥ k) = Σ P(X = i) pour i de k à min(n, K)
```

---

## Cas Particuliers

### Sorts Multicolores
Pour un sort comme Awaken the Honored Dead `{B}{G}{U}` :
- On calcule P1 pour **chaque couleur** séparément
- P1 final = **minimum** des probabilités (le maillon faible)

```
P1(B) = Hypergeometric(24, sourcesB, 3, 1)
P1(G) = Hypergeometric(24, sourcesG, 3, 1)
P1(U) = Hypergeometric(24, sourcesU, 3, 1)

P1 = min(P1(B), P1(G), P1(U))
```

### Sorts Incolores
Pour les sorts sans symboles colorés (ex: artifacts) :
- P1 = 99% (on assume toujours les bonnes couleurs car aucune requise)
- P2 dépend uniquement de la probabilité d'avoir assez de lands

### Symboles Colorés Multiples
Pour un sort avec `{B}{B}{B}` :
- On a besoin de 3 sources noires parmi N terrains
- Plus exigeant que `{B}` simple

---

## Comparaison avec le Site Original

Notre implémentation suit la même logique que [Project Manabase](https://project-manabase.firebaseapp.com/) :

| Aspect | Project Manabase | ManaTuner Pro |
|--------|-----------------|---------------|
| P1 | Conditionnel (lands OK) | ✅ Identique |
| P2 | P1 × P(lands) | ✅ Identique |
| Distribution | Hypergéométrique | ✅ Identique |
| Sources | Vraies sources du deck | ✅ Identique |

### Note sur la Documentation Originale
Le texte d'aide du site original contient une erreur : il dit "P2 = conditionnel" et "P1 = P2 × proba lands", mais les données affichées montrent clairement que P1 ≥ P2, donc P1 est le conditionnel et P2 le réaliste.

---

## Utilisation Pratique

### Lecture des Résultats

| Situation | Interprétation |
|-----------|----------------|
| P1 élevé, P2 élevé | Sort facile à jouer on-curve |
| P1 élevé, P2 bas | Bonnes couleurs, mais CMC trop élevé pour on-curve |
| P1 bas, P2 bas | Manque de sources pour cette couleur |
| P1 = P2 | CMC bas, mana screw négligeable |

### Recommandations
- **P2 < 50%** : Considérer ce sort comme un late-game uniquement
- **P2 < 30%** : Sort très difficile à jouer on-curve
- **P1 < 80%** : Ajouter des sources de cette couleur

---

## Références

- [Frank Karsten - How Many Colored Mana Sources Do You Need](https://www.channelfireball.com/articles/how-many-colored-mana-sources-do-you-need-to-consistently-cast-your-spells-a-guilds-of-ravnica-update/)
- [Project Manabase](https://project-manabase.firebaseapp.com/)
- [Hypergeometric Distribution (Wikipedia)](https://en.wikipedia.org/wiki/Hypergeometric_distribution)
