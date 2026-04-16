# Prompt pour Audit Mathematique Complet de ManaTuner

Copie-colle ce prompt dans une nouvelle conversation Claude Code depuis le dossier du projet.

---

## Le Prompt

````
Tu es un expert en probabilites, statistiques et theorie des jeux. Tu audites ManaTuner, un calculateur de mana base pour Magic: The Gathering dont TOUTE la valeur repose sur la rigueur mathematique.

Les joueurs competitifs utilisent cet outil pour des decisions de tournoi. Une erreur de calcul = outil inutile.

## Ta Mission

Auditer TOUT le code mathematique du projet et produire un rapport structuré qui verifie :

1. **Exactitude** : chaque formule implementee est mathematiquement correcte
2. **Coherence** : ce que le code calcule correspond exactement a ce que l'UI et la documentation affichent aux utilisateurs
3. **Robustesse** : pas de division par zero, NaN, overflow, off-by-one, edge cases non geres
4. **Convergence** : les resultats Monte Carlo convergent avec les calculs analytiques

## Etape 1 : Cartographie du code mathematique

Trouve TOUS les fichiers qui contiennent des calculs. Commence par :

```bash
grep -r "hypergeometric\|monteCarlo\|bellman\|binomial\|probability\|factorial\|combination\|choose\|shuffle\|karsten\|castability\|healthScore\|mulligan" src/ --include="*.ts" --include="*.tsx" -l
````

Lis aussi :

- src/services/ (DeckAnalyzer et tous les services de calcul)
- src/lib/ ou src/utils/ (fonctions utilitaires math)
- src/workers/ (Web Workers pour calculs lourds)
- Les fichiers de tests associes dans tests/ et **tests**/

## Etape 2 : Verification formule par formule

### 2.1 Distribution Hypergeometrique

Verifie l'implementation de : P(X = k) = C(K,k) × C(N-K, n-k) / C(N,n)

- Le coefficient binomial C(n,k) est-il calcule correctement ?
- Gere-t-il les grands nombres sans overflow ? (log-space ou iteratif)
- La probabilite cumulative P(X >= k) est-elle calculee comme 1 - P(X < k) ou par sommation ?
- Edge cases : k > K, k > n, N = 0, deck vide, 0 sources de couleur

### 2.2 Simulation Monte Carlo

- Le shuffle est-il Fisher-Yates ? (tout autre algo introduit un biais)
- Combien de simulations ? Le code fait-il bien 10,000 par defaut ? Correspond a ce qui est documente ?
- Le generateur aleatoire est-il Math.random() ou un PRNG seed ? Est-ce acceptable ?
- L'evaluation de la main est-elle correcte ? (Sol Ring + 2 lands = 3 mana au T2 ?)
- Les resultats MC convergent-ils avec les calculs hypergeometriques a ±2% ?

### 2.3 Equation de Bellman / Decision de Mulligan

- La fonction de valeur recursive est-elle correctement implementee ?
- E[V_n] = max(valeur*garder_n, E[V*{n-1}] - penalite) ?
- Le London Mulligan est-il correctement modelise ? (piocher 7, remettre N dessous)
- Les seuils par archetype (aggro, midrange, control, combo) sont-ils raisonnables ?
- Comment la "qualite de main" est-elle scoree exactement ?

### 2.4 Tables de Frank Karsten

- L'app revendique les recherches de Karsten. Verifie que les chiffres source correspondent.
- Karsten dit ~14 sources pour 1 mana colore a 90% au tour prevu. Le code est-il d'accord ?
- Les "sources recommandees" sont-elles derivees de Karsten ou custom ?
- Le papier source est "How Many Sources Do You Need to Consistently Cast Your Spells?" (ChannelFireball, 2022)

### 2.5 Acceleration de Mana (Rocks & Dorks)

C'est la feature unique de ManaTuner. Verifie tres attentivement :

- Comment exactement les rocks/dorks sont-ils integres aux calculs de probabilite ?
- Un Sol Ring est-il compte comme +2 mana incolore au T2 ? Ou +1 equivalent terrain ?
- Y a-t-il un taux de retrait (removal rate) pour les dorks ? Quel defaut ?
- La separation "Lands only" vs "Realistic (with ramp)" est-elle mathematiquement saine ?
- Le boost de ramp affiche dans l'UI correspond-il exactement au delta calcule ?

### 2.6 Health Score

- Comment le pourcentage unique de "sante" est-il calcule ?
- Est-ce une moyenne ponderee des castabilities ? Quels sont les poids ?
- Les seuils (85%+ excellent, 70-84% bon, 55-69% a ameliorer, <55% refaire) sont-ils justifies ?
- Un deck mono-couleur avec 24 lands devrait scorer >90%. Verifie.

### 2.7 Analyse de Courbe de Mana

- Le CMC moyen inclut-il les terrains ? (ne devrait pas)
- Les probabilites tour par tour sont-elles coherentes avec l'hypergeometrique ?
- Les MDFC (Modal Double-Faced Cards) sont-ils comptes comme terrain ET sort ?

## Etape 3 : Verification de coherence Code ↔ Documentation

Lis ces fichiers et compare avec le code :

- src/pages/MathematicsPage.tsx — formules montrees aux utilisateurs
- src/pages/GuidePage.tsx — comment les features sont decrites
- public/llms.txt et public/llms-full.txt — affirmations faites aux systemes IA

Pour chaque affirmation factuelle, verifie :

- "10,000 hands simulated" → le code fait-il bien 10,000 ?
- "Fisher-Yates shuffle" → est-ce bien Fisher-Yates dans le code ?
- "Bellman equation" → est-ce vraiment Bellman ou une heuristique approchee ?
- "Frank Karsten's research" → les chiffres correspondent-ils au papier ?
- "configurable up to 50,000" → le code permet-il vraiment 50k ?

## Etape 4 : Tests de validation

Fais des calculs a la main pour des cas simples et compare avec le code :

**Cas test 1** : Deck 60 cartes, 24 lands, 20 sources bleues

- P(au moins 1 source bleue dans 7 cartes) = 1 - C(40,7)/C(60,7) = ?
- Le code donne-t-il le meme resultat ?

**Cas test 2** : Deck 60 cartes, 24 lands, 12 sources d'une couleur

- P(au moins 2 sources en 8 cartes) selon hypergeometrique = ?
- Compare avec le code

**Cas test 3** : Monte Carlo convergence

- Pour le cas test 1, lance la simulation MC (si possible via les tests)
- Le resultat MC est-il dans ±2% du resultat analytique ?

## Format du Rapport

```markdown
# RAPPORT D'AUDIT MATHEMATIQUE - ManaTuner

## Verdict Global : [PASS / PASS AVEC RESERVES / FAIL]

## 1. Distribution Hypergeometrique

**Status** : [CORRECT / INCORRECT / A VERIFIER]

- Fichier(s) : [chemin:ligne]
- Formule verifiee : oui/non
- Edge cases geres : oui/non
- Problemes trouves : [liste]

## 2. Simulation Monte Carlo

[meme format]

## 3. Equation de Bellman

[meme format]

## 4. Tables de Frank Karsten

[meme format]

## 5. Acceleration de Mana (Rocks & Dorks)

[meme format]

## 6. Health Score

[meme format]

## 7. Courbe de Mana

[meme format]

## 8. Coherence Code ↔ Documentation

| Affirmation dans les docs | Ce que le code fait | MATCH/MISMATCH |
| ------------------------- | ------------------- | -------------- |
| "10,000 hands simulated"  | [valeur reelle]     | ?              |
| "Fisher-Yates shuffle"    | [algo reel]         | ?              |
| ...                       | ...                 | ...            |

## 9. Bugs et Edge Cases Trouves

- [liste avec fichier:ligne et description]

## 10. Recommandations Prioritaires

1. [fix critique si applicable]
2. [amelioration recommandee]
```

Sois exhaustif. Lis chaque fichier de calcul entierement. Croise la doc avec le code. C'est un audit de confiance — la credibilite de l'outil en depend.

```

---

## Notes

- Lance ce prompt depuis le dossier racine du projet ManaTuner
- L'audit prendra du temps (beaucoup de fichiers a lire) — c'est normal
- Si l'agent trouve des bugs critiques, traite-les en priorite absolue avant tout autre travail
```
