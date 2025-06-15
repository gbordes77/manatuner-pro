# 📋 ManaTuner Pro - TODO & Roadmap

## 🚨 **Fonctionnalités Critiques à Implémenter**

### **1. Intégration Scryfall API** 🔥
- [ ] Appel API Scryfall avec la decklist
- [ ] Récupération des objets simplifiés
- [ ] Validation automatique des noms de cartes
- [ ] Test avec Scryfall mocké
- [ ] Gestion des erreurs de cartes non trouvées

### **2. Gestion Avancée des Terrains** 🏔️
- [x] ✅ Fetchlands (déjà implémenté)
- [x] ✅ Checklands (déjà implémenté) 
- [x] ✅ Fastlands (déjà implémenté)
- [ ] **Ravlands** (Sacred Foundry, Steam Vents, etc.)
- [ ] **Mana Phyrexien** ({W/P}, {U/P}, {B/P}, {R/P}, {G/P})
- [ ] **Mana incolore** (amélioration)
- [ ] **Terrains tricolores** (Arcane Sanctum, etc.)

### **3. Types de Sorts Complexes** 🎴
- [ ] **Split cards** (Fire // Ice, Wear // Tear)
- [ ] **Alternate costs** (Force of Will, Daze, Pitch spells)
- [ ] **Escape costs** (Uro, Kroxa)
- [ ] **Sorts X** (amélioration - cycling variable)
- [ ] **Modal spells** (Commands, Charms)
- [ ] **Adventure cards** (Brazen Borrower)
- [ ] **Double-faced cards** (DFC)

## 🔧 **Bugs Connus à Corriger**

- [ ] **X amounts in cycling** - Problème avec les coûts de cycling variables
- [x] ✅ **Duplicate key "Lightning Helix"** - RÉSOLU - Doublon supprimé
- [x] ✅ **Missing semicolon** - RÉSOLU - Erreur de syntaxe corrigée
- [x] ✅ **Failed to resolve import** - RÉSOLU - Cache Vite nettoyé, imports fonctionnels

## 🎨 **Fonctionnalités Frontend Avancées**

### **Interface Utilisateur**
- [ ] **Mobile overlay** - Interface responsive mobile optimisée
- [ ] **Contact page** - Page de contact avec formulaire
- [ ] **Nice recap graph** - Graphiques visuels des probabilités
- [ ] **Mean / median / percentiles** - Statistiques avancées
- [ ] **Nice sideboard input** - Interface séparée pour sideboard

### **Navigation & UX**
- [ ] **Navbar améliorée**
  - [ ] Choix de valeur X pour sorts
  - [ ] Pourcentages de jouer sorts à tour N+X
- [ ] **Non-conditional probability** - Probabilités sans conditions
- [ ] **Rework placeholder** - Amélioration des textes d'exemple

## ⚡ **Optimisations de Performance**

### **Backend**
- [ ] **Handle colorless spells** - Gestion optimisée sorts incolores
- [ ] **Redis cache** - Cache pour les calculs répétitifs
- [ ] **Parallelization**
  - [ ] Essayer parallel.js
  - [ ] Architecture multi-services
  - [ ] Clusters Node.js

### **Architecture**
- [ ] **Precalculate generic combinations** - Précalcul des combinaisons communes
- [ ] **On the go calculation** - Calculs à la demande
- [ ] **Search each CMC only once** - Optimisation algorithmes

## 🚀 **Déploiement & Infrastructure**

- [ ] **Expose cloud function** - API publique
- [ ] **Expose basic front** - Interface de base
- [ ] **Express.js** - Serveur backend complet
- [ ] **Environment variables** - Configuration production

## 📊 **Plan d'Action par Phases**

### **Phase 1 - Corrections Critiques** (Priorité 1)
1. [ ] Corriger les erreurs de compilation actuelles
2. [ ] Intégration Scryfall API
3. [ ] Support des terrains Ravnica
4. [ ] Gestion du mana phyrexien

### **Phase 2 - Fonctionnalités Avancées** (Priorité 2)
1. [ ] Split cards et alternate costs
2. [ ] Modal spells et adventure cards
3. [ ] Page de contact et About
4. [ ] Interface mobile optimisée

### **Phase 3 - Interface & UX** (Priorité 3)
1. [ ] Graphiques visuels (courbes de probabilité)
2. [ ] Statistiques avancées (médiane, percentiles)
3. [ ] Input sideboard séparé
4. [ ] Navigation améliorée

### **Phase 4 - Performance** (Priorité 4)
1. [ ] Cache Redis pour les calculs
2. [ ] Parallélisation des algorithmes
3. [ ] Précalcul des combinaisons communes
4. [ ] Architecture multi-services

## 🎯 **Recommandations Immédiates**

**À faire en premier :**
1. 🔥 **Corriger les erreurs de compilation** (deckSlice, analysisSlice)
2. 🔥 **Scryfall API** - Validation automatique des cartes
3. 🔥 **Terrains Ravnica** - Très utilisés en compétitif
4. 🔥 **Interface mobile** - Beaucoup de joueurs sur mobile

## 📝 **Notes de Développement**

- **Base solide** : Architecture moderne React 18 + TypeScript + Material-UI
- **Avantage** : Interface plus avancée que l'original de Charles
- **Objectif** : Créer l'outil d'analyse de manabase le plus complet pour MTG
- **Inspiration** : TODO list du projet original de Charles Wickham

---

**Dernière mise à jour** : $(date)
**Version** : ManaTuner Pro v2.0.0
**Repository** : https://github.com/gbordes77/manatuner-pro 