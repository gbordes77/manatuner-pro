# 🚀 Analyseur MTG Manabase Amélioré

## Intégration du Projet de Référence

Votre analyseur MTG a été considérablement amélioré en intégrant les algorithmes avancés du projet open source de **Charles Wickham** : [magic-project-manabase](https://github.com/WickedFridge/magic-project-manabase)

## 🔧 Nouvelles Fonctionnalités Intégrées

### 1. **Gestion Avancée des Terrains**

#### **Fetchlands** 🔍
- Détection automatique des fetchlands (Scalding Tarn, Flooded Strand, etc.)
- Logique de recherche de terrains cibles
- Calcul de l'impact sur la production de mana

#### **Checklands** ⚡
- Terrains qui entrent engagés sauf si vous contrôlez certains types de base
- Exemples : Rootbound Crag, Dragonskull Summit
- Évaluation dynamique selon les terrains en jeu

#### **Fastlands** 🏃‍♂️
- Terrains rapides qui entrent engagés si vous contrôlez 3+ autres terrains
- Exemples : Seachrome Coast, Blackcleave Cliffs
- Optimisation pour les decks agressifs

#### **Shocklands/Ravlands** ⚡
- Terrains duaux qui peuvent entrer dégagés en payant 2 points de vie
- Exemples : Steam Vents, Sacred Foundry
- Assume le paiement de vie pour l'analyse

### 2. **Parsing de Coûts de Mana Avancé**

#### **Coûts Hybrides** 🌈
- Support des coûts hybrides comme `{W/U}`, `{B/R}`
- Calcul précis de la flexibilité de couleurs

#### **Coûts X** ❌
- Gestion des sorts avec coût X
- Adaptation du CMC selon la valeur X choisie

#### **Coûts Complexes** 🧮
- Parsing précis des coûts comme `{2}{U}{U}`, `{1}{R/W}{B}`
- Séparation entre mana générique et coloré

### 3. **Analyse des Sorts Individuels**

#### **Nouveau Onglet "Analyse des Sorts"** 📊
- Probabilité de pouvoir jouer chaque sort
- Évaluation carte par carte
- Visualisation avec barres de progression colorées

#### **Métriques par Sort** 📈
- Pourcentage de jouabilité
- Nombre de copies jouables/totales
- Classification : Excellent/Bon/Moyen/Faible

### 4. **Algorithmes Inspirés du Projet de Référence**

#### **Logique de Combinaisons** 🔄
- Inspiré des algorithmes de Charles Wickham
- Évaluation de toutes les combinaisons possibles de terrains
- Cache intelligent pour optimiser les performances

#### **Évaluation ETB (Enter the Battlefield)** 🎯
- Calcul précis des terrains qui entrent engagés
- Prise en compte des conditions spécifiques
- Impact sur la courbe de mana

## 🎨 Interface Utilisateur Améliorée

### **4 Onglets d'Analyse**
1. **Vue d'ensemble** : Statistiques générales + nouvelles métriques
2. **Probabilités** : Chances par tour et par couleur
3. **Recommandations** : Conseils personnalisés améliorés
4. **Analyse des Sorts** : ✨ NOUVEAU - Évaluation carte par carte

### **Nouvelles Métriques Affichées**
- CMC Moyenne du deck
- Ratio de terrains optimisé
- Évaluation globale avec rating coloré
- Consistance en pourcentage

## 🧠 Algorithmes Mathématiques

### **Distribution Hypergeométrique Précise**
- Calculs exacts (pas d'approximations)
- Fonction combinatoire optimisée
- Probabilités réelles pour chaque tour

### **Recommandations Dynamiques**
- Basées sur la CMC moyenne du deck
- Adaptation selon le style de jeu détecté
- Conseils spécifiques aux types de terrains

### **Évaluation de Consistance**
- Algorithme inspiré de Frank Karsten
- Prise en compte des terrains spéciaux
- Rating automatique : Excellent/Bon/Moyen/Faible

## 🔗 Crédits et Références

- **Projet de référence** : [WickedFridge/magic-project-manabase](https://github.com/WickedFridge/magic-project-manabase)
- **Auteur original** : Charles Wickham
- **Recherches mathématiques** : Frank Karsten
- **Intégration et améliorations** : Votre équipe

## 🚀 Prochaines Étapes Possibles

1. **Intégration Scryfall API** : Récupération automatique des données de cartes
2. **Cache Redis** : Optimisation des performances pour les gros decks
3. **Analyse Sideboard** : Extension pour les cartes de réserve
4. **Export/Import** : Sauvegarde et partage des analyses
5. **Graphiques Avancés** : Visualisations plus poussées

---

*Votre analyseur MTG est maintenant l'un des plus avancés disponibles, combinant la précision mathématique avec une interface utilisateur moderne et intuitive !* 🎯✨ 