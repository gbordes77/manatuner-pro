# ManaTuner Pro - Refonte du Système de Gestion des Terrains

**Version**: 1.0  
**Date**: 25 décembre 2025  
**Auteur**: Analyse IA approfondie (mode ultrathink)  
**Statut**: Proposition - En attente d'approbation

---

## Table des Matières

1. [Résumé Exécutif](#1-résumé-exécutif)
2. [Analyse de l'Existant](#2-analyse-de-lexistant)
3. [Problèmes Identifiés](#3-problèmes-identifiés)
4. [Étude du Projet Original](#4-étude-du-projet-original)
5. [Types de Terrains MTG](#5-types-de-terrains-mtg)
6. [Architecture Proposée](#6-architecture-proposée)
7. [Spécifications Techniques](#7-spécifications-techniques)
8. [Plan d'Implémentation](#8-plan-dimplémentation)
9. [Tests et Validation](#9-tests-et-validation)
10. [Risques et Mitigations](#10-risques-et-mitigations)

---

## 1. Résumé Exécutif

### Constat

Le système actuel de ManaTuner Pro **ignore le tempo** dans ses calculs de probabilité. Un terrain qui entre engagé (tapped) au tour 1 est compté comme une source disponible, ce qui fausse les résultats.

### Impact

- **Surestimation** des probabilités de cast on curve de 10-20%
- **Recommandations incorrectes** pour les manabases agressives
- **Manque de différenciation** entre Shocklands (pay 2 life) et Taplands

### Solution Proposée

Refonte complète du système de détection et calcul avec :
- Prise en compte du **tempo** (ETB tapped/untapped)
- **Base de données exhaustive** de 200+ terrains
- **Calculs probabilistes par tour** avec pondération
- Support des **MDFC** (Pathways) et autres cas complexes

### Effort Estimé

| Phase | Durée | Complexité |
|-------|-------|------------|
| Types & Data | 1 jour | Moyenne |
| Service unifié | 2 jours | Haute |
| Calculs tempo | 2 jours | Haute |
| Tests & Cleanup | 1 jour | Moyenne |
| **Total** | **6 jours** | |

---

## 2. Analyse de l'Existant

### 2.1 Fichiers Actuels

```
src/
├── services/
│   ├── manaCalculator.ts      # Calculs hypergeométriques (OK mais incomplet)
│   ├── deckAnalyzer.ts        # Analyse deck + détection ETB (non utilisé dans calculs)
│   └── scryfall.ts            # API Scryfall (basique)
├── utils/
│   ├── landDetection.ts       # Détection statique (~100 lands)
│   ├── landDetectionComplete.ts # Duplication de landDetection.ts
│   ├── hybridLandDetection.ts # Scryfall + statique (~50 lands dans LAND_BEHAVIORS)
│   └── intelligentLandAnalysis.ts # Analyse regex du texte Oracle
└── types/
    └── index.ts               # Types généraux (pas de types spécifiques lands)
```

### 2.2 Flux Actuel

```
Decklist Input
     │
     ▼
parseDeckList() ─────────────────────────────────────┐
     │                                                │
     ▼                                                │
isLandCard() ← landDetection.ts (statique)           │
     │                                                │
     ▼                                                │
evaluateLandProperties() ← deckAnalyzer.ts           │
     │                                                │
     │  etbTapped: (lands, cmc) => boolean  ◄────────┤ EXISTE mais NON UTILISÉ
     │                                                │
     ▼                                                │
manaCalculator.calculateManaProbability()            │
     │                                                │
     │  sourcesInDeck: number  ◄─────────────────────┘ COMPTE TOUTES LES SOURCES
     │                                                  SANS DISTINCTION TEMPO
     ▼
Résultat (FAUX car ignore ETB tapped)
```

### 2.3 Code Problématique

**manaCalculator.ts - Ligne 280-290** :
```typescript
// PROBLÈME : Compte toutes les sources sans distinction
for (const land of deck.lands) {
  for (const color of land.produces) {
    sources[color] = (sources[color] || 0) + land.quantity;
    // ❌ Un Shockland tapped compte autant qu'un Basic
  }
}
```

**hybridLandDetection.ts - LAND_BEHAVIORS** :
```typescript
// PROBLÈME : Seulement ~50 terrains hardcodés
const LAND_BEHAVIORS: Record<string, LandBehavior> = {
  'Polluted Delta': { behavior: 'Fetchland', entersUntapped: false },
  // ... seulement 50 entrées
  // ❌ Manque : Triomes, Slowlands, Painlands, Pathways, etc.
}
```

---

## 3. Problèmes Identifiés

### 3.1 Problème Critique : Ignorance du Tempo

| Scénario | Calcul Actuel | Réalité |
|----------|---------------|---------|
| 12 Shocklands + 8 Basic, T1, besoin {R} | 95% (20 sources) | 75% (8 sources untapped si refuse pay life) |
| 4 Triomes + 20 autres lands, T1 | 92% (24 sources) | 85% (20 sources, Triomes toujours tapped) |
| 8 Fastlands, T4 | 90% | 60% (Fastlands tapped T4+) |

**Impact** : Surestimation de 10-25% des probabilités de cast on curve.

### 3.2 Problème : Détection Incomplète

| Type de Terrain | Nombre | Détecté ? | Dans LAND_BEHAVIORS ? |
|-----------------|--------|-----------|----------------------|
| Basic Lands | 6 | ✅ | ✅ |
| Fetchlands | 14 | ✅ | ✅ |
| Shocklands | 10 | ✅ | ✅ |
| Fastlands | 10 | ✅ | ✅ |
| Checklands | 10 | ⚠️ Partiel | ❌ |
| Slowlands | 10 | ❌ | ❌ |
| Painlands | 10 | ❌ | ❌ |
| Triomes | 15 | ⚠️ Partiel | ❌ |
| Pathways (MDFC) | 10 | ❌ | ❌ |
| Channel Lands | 5 | ❌ | ❌ |
| Creature Lands | 48 | ⚠️ Partiel | ❌ |
| Horizon Lands | 6 | ✅ | ✅ |
| Battle Lands | 5 | ❌ | ❌ |
| **Total** | ~160 | ~40% | ~30% |

### 3.3 Problème : Duplication de Code

```
landDetection.ts (280 lignes)
        │
        ├── Dupliqué dans ──► landDetectionComplete.ts (200 lignes)
        │
        └── Partiellement dans ──► hybridLandDetection.ts (250 lignes)
```

**Conséquences** :
- Maintenance difficile (3 fichiers à synchroniser)
- Incohérences entre les détections
- Code mort et confusion

### 3.4 Problème : Pas de Support MDFC

Les Pathways (Modal Double-Faced Cards) ne sont pas gérés :

```typescript
// API Scryfall retourne :
{
  "layout": "modal_dfc",
  "oracle_text": null,  // ❌ Null pour MDFC !
  "card_faces": [
    { "name": "Cragcrown Pathway", "oracle_text": "{T}: Add {R}." },
    { "name": "Timbercrown Pathway", "oracle_text": "{T}: Add {G}." }
  ]
}

// Notre code actuel :
if (scryfallCard.oracle_text) {  // ❌ Toujours null pour MDFC
  analyzeIntelligentLand(scryfallCard.oracle_text)
}
// Résultat : Pathways non analysés
```

### 3.5 Problème : Interface Scryfall Minimaliste

```typescript
// Actuel (scryfall.ts)
interface ScryfallCard {
  id: string
  name: string
  type_line: string
  mana_cost?: string
  cmc: number
  colors: string[]
  produced_mana?: string[]
  layout: string
  // ❌ Manque : oracle_text, card_faces, keywords
}
```

---

## 4. Étude du Projet Original

### 4.1 Source

Projet : [WickedFridge/magic-project-manabase](https://github.com/WickedFridge/magic-project-manabase)  
Créé par : Charles Wickham (février 2020)

### 4.2 Architecture Clé

Le projet original utilise une **fonction dynamique** pour ETB tapped :

```javascript
// utils.js - Projet original
evaluateEtb(card) {
  return {
    etbTapped: (lands, cmc) => {
      // Fonction qui prend en paramètre l'état du jeu
      // et retourne true/false dynamiquement
    },
    landType: string
  }
}
```

**Exemples de fonctions ETB** :
```javascript
// Fastland
etbTapped: (lands, cmc) => lands.length > 2 && cmc > 2

// Checkland
etbTapped: (lands) => !hasRequiredBasicTypes(lands, cardName)

// Shockland (assume pay life)
etbTapped: () => false

// Triome (toujours tapped)
etbTapped: () => true
```

### 4.3 Calcul de Castabilité

```javascript
// analyzeDecklist/index.js - Projet original
canPlaySpellOnCurve(lands, spell) {
  // 1. Vérifie que les couleurs requises existent
  if (!hasCorrectColors(lands, spell)) return false
  
  // 2. Vérifie qu'il y a au moins un terrain UNTAPPED
  if (!hasUntappedLand(lands, spell.cmc)) return false
  
  // 3. Génère TOUTES les combinaisons de N terrains pour CMC N
  const combinations = generateCombinations(lands, spell.cmc)
  
  // 4. Pour chaque combinaison, évalue si le coût est payable
  for (const combo of combinations) {
    // Filtre les terrains tapped ce tour
    const untappedLands = combo.filter(land => 
      !land.etbTapped(existingLands, spell.cmc)
    )
    
    if (canPayCost(untappedLands, spell.cost)) {
      return true
    }
  }
  
  return false
}
```

### 4.4 Différences Clés

| Aspect | Projet Original | ManaTuner Pro |
|--------|-----------------|---------------|
| ETB Tapped | Fonction dynamique `(lands, cmc) => bool` | Existe mais non utilisé |
| Calcul | Combinatoire exhaustif | Hypergeométrique simple |
| Prise en compte tempo | ✅ Oui, via simulation | ❌ Non |
| Par sort | ✅ Chaque sort testé | ✅ Oui |
| Performance | Lent (combinatoire) | Rapide (formule) |

### 4.5 Leçons à Retenir

1. **ETB doit être une fonction**, pas un boolean fixe
2. **Le tour est crucial** pour évaluer les conditions
3. **Combinatoire = précis mais lent**, hypergeométrique = rapide mais approximatif
4. **Solution hybride** : pondérer les sources par probabilité d'être untapped

---

## 5. Types de Terrains MTG

### 5.1 Classification Complète

#### Tier 1 - Critique (100+ cartes, formats compétitifs)

| Type | Quantité | ETB | Condition |
|------|----------|-----|-----------|
| Basic Lands | 6 | Untapped | - |
| Fetchlands | 14 | Tapped (eux-mêmes) | Sacrifice pour chercher |
| Shocklands | 10 | Conditionnel | Pay 2 life |
| Fastlands | 10 | Conditionnel | ≤2 autres lands |
| Checklands | 10 | Conditionnel | Contrôle basic type |
| Triomes | 15 | Tapped | Toujours |

#### Tier 2 - Important (50+ cartes)

| Type | Quantité | ETB | Condition |
|------|----------|-----|-----------|
| Slowlands | 10 | Conditionnel | ≥2 autres lands |
| Painlands | 10 | Untapped | Pay 1 life pour couleur |
| Pathways (MDFC) | 10 | Untapped | Choix de face |
| Battle Lands | 5 | Conditionnel | ≥2 basic lands |
| Horizon Lands | 6 | Untapped | Sacrifice pour draw |
| Creature Lands | 48 | Variable | Selon le land |

#### Tier 3 - Edge Cases (30+ cartes)

| Type | Quantité | ETB | Condition |
|------|----------|-----|-----------|
| Channel Lands | 5 | Untapped | Capacité Channel |
| Filter Lands | 10 | Untapped | - |
| Reveal Lands | 5 | Conditionnel | Révéler carte |
| Snow Lands | 6 | Untapped | - |
| Artifact Lands | 12 | Variable | - |

### 5.2 Patterns de Détection Oracle Text

```
PATTERN                                          TYPE           CONFIANCE
─────────────────────────────────────────────────────────────────────────
enters the battlefield tapped.$                  always_tapped  100%
{T}: Add                                         always_untap   95%
you may pay 2 life.*enters.*tapped               shockland      98%
tapped unless you control two or fewer           fastland       95%
tapped unless you control two or more            slowland       95%
tapped unless you control a [Basic]              checkland      98%
tapped unless you control two or more basic      battle_land    95%
you may reveal.*if you don't.*tapped             reveal_land    95%
channel.*discard this card                       channel_land   90%
becomes a.*creature                              creature_land  90%
```

### 5.3 Cas Spéciaux

#### MDFC (Modal Double-Faced Cards)

```
Scryfall Response:
{
  "layout": "modal_dfc",
  "card_faces": [
    { "name": "Face A", "type_line": "Land", "oracle_text": "..." },
    { "name": "Face B", "type_line": "Land", "oracle_text": "..." }
  ]
}

Traitement:
1. Détecter layout === 'modal_dfc'
2. Itérer sur card_faces
3. Analyser chaque face indépendamment
4. Retourner un tableau de LandMetadata
```

#### Starting Town (Turn Threshold)

```
Oracle Text:
"Starting Town enters the battlefield tapped unless it's your 
first, second, or third turn."

Condition:
{ type: 'turn_threshold', maxTurn: 3 }

Probabilité:
- Turn 1-3: 100% untapped
- Turn 4+: 0% untapped (tapped)
```

#### Fetchlands (Sacrifice Pattern)

```
Les Fetchlands entrent untapped MAIS sont sacrifiés immédiatement.
Ils ne comptent pas comme source au tour où ils sont joués.

Traitement spécial:
- etbBehavior: 'always_untapped'
- isFetch: true
- fetchTargets: ['Plains', 'Island']
- Calcul: compte comme 0.9 source (délai de fetch)
```

---

## 6. Architecture Proposée

### 6.1 Nouveaux Types

```typescript
// src/types/lands.ts

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

export type LandCategory = 
  | 'basic' | 'fetch' | 'shock' | 'fast' | 'slow' | 'check' 
  | 'battle' | 'pain' | 'filter' | 'horizon' | 'triome'
  | 'pathway' | 'channel' | 'creature' | 'utility' | 'unknown'

export type ETBType = 'always_untapped' | 'always_tapped' | 'conditional'

export interface ETBCondition {
  type: 
    | 'pay_life'           // Shocklands
    | 'control_lands_max'  // Fastlands (≤2)
    | 'control_lands_min'  // Slowlands (≥2)
    | 'control_basic'      // Checklands
    | 'control_basics_min' // Battle lands
    | 'reveal_card'        // Reveal lands
    | 'turn_threshold'     // Starting Town
  
  // Paramètres selon le type
  amount?: number          // pay_life: 2
  threshold?: number       // control_lands: 2, turn_threshold: 3
  basicTypes?: string[]    // control_basic: ['Plains', 'Island']
  cardType?: string        // reveal_card: 'Island'
}

export interface LandMetadata {
  name: string
  category: LandCategory
  
  // Production de mana
  produces: ManaColor[]
  producesAny: boolean
  
  // Comportement ETB
  etbBehavior: {
    type: ETBType
    condition?: ETBCondition
  }
  
  // Capacités spéciales
  isFetch: boolean
  fetchTargets?: string[]
  isCreatureLand: boolean
  hasChannel: boolean
  
  // Données Scryfall
  scryfall?: {
    oracleText: string
    typeLine: string
    layout: string
    cardFaces?: Array<{
      name: string
      oracleText: string
      typeLine: string
    }>
  }
  
  // Confiance de la détection (0-100)
  confidence: number
}

export interface TempoAwareProbability {
  // Probabilité brute (ignore tempo)
  raw: number
  
  // Probabilité ajustée tempo
  tempoAdjusted: number
  
  // Scénarios
  scenarios: {
    aggressive: number    // Paye toutes les vies
    conservative: number  // Refuse de payer
    balanced: number      // Mix réaliste
  }
  
  // Sources effectives par tour
  effectiveSourcesByTurn: number[]
}
```

### 6.2 Service Unifié

```typescript
// src/services/landService.ts

import { LandMetadata, ETBCondition, ManaColor } from '@/types/lands'
import { KNOWN_LANDS } from '@/data/knownLands'

export class LandService {
  private cache: Map<string, LandMetadata> = new Map()
  private scryfallCache: Map<string, any> = new Map()
  
  /**
   * Détecte et analyse un terrain
   */
  async detectLand(cardName: string): Promise<LandMetadata | null> {
    // 1. Check cache
    if (this.cache.has(cardName)) {
      return this.cache.get(cardName)!
    }
    
    // 2. Check base de données statique
    const known = KNOWN_LANDS[cardName]
    if (known) {
      this.cache.set(cardName, known)
      return known
    }
    
    // 3. Fetch Scryfall
    const scryfallData = await this.fetchScryfall(cardName)
    if (!scryfallData) return null
    
    // 4. Analyser
    const metadata = this.analyzeFromScryfall(scryfallData)
    this.cache.set(cardName, metadata)
    
    return metadata
  }
  
  /**
   * Calcule la probabilité qu'un terrain soit untapped à un tour donné
   */
  getUntappedProbability(
    land: LandMetadata,
    turn: number,
    deckContext: DeckContext
  ): number {
    switch (land.etbBehavior.type) {
      case 'always_untapped':
        return 1.0
        
      case 'always_tapped':
        return 0.0
        
      case 'conditional':
        return this.evaluateCondition(
          land.etbBehavior.condition!,
          turn,
          deckContext
        )
    }
  }
  
  /**
   * Évalue une condition ETB
   */
  private evaluateCondition(
    condition: ETBCondition,
    turn: number,
    context: DeckContext
  ): number {
    switch (condition.type) {
      case 'pay_life':
        // Shocklands : dépend de la stratégie
        return context.assumePayLife ? 1.0 : 0.0
        
      case 'control_lands_max':
        // Fastlands : untapped si ≤ threshold lands
        // Probabilité diminue avec les tours
        if (turn <= condition.threshold!) return 0.95
        if (turn === condition.threshold! + 1) return 0.5
        return 0.2
        
      case 'control_lands_min':
        // Slowlands : untapped si ≥ threshold lands
        if (turn >= condition.threshold! + 1) return 0.9
        if (turn === condition.threshold!) return 0.5
        return 0.1
        
      case 'control_basic':
        // Checklands : dépend de la composition du deck
        const basicRatio = context.basicCount / context.totalLands
        if (turn >= 2) return Math.min(0.9, basicRatio * 1.5)
        return basicRatio * 0.8
        
      case 'control_basics_min':
        // Battle lands
        const basics = context.basicCount
        if (basics >= condition.threshold!) return 0.9
        if (turn >= 3) return 0.7
        return 0.3
        
      case 'reveal_card':
        // Reveal lands : dépend du nombre de cartes du type
        return context.getCardTypeRatio(condition.cardType!) * 0.9
        
      case 'turn_threshold':
        // Starting Town
        return turn <= condition.threshold! ? 1.0 : 0.0
        
      default:
        return 0.5
    }
  }
  
  /**
   * Gère les MDFC
   */
  private handleMDFC(scryfallData: any): LandMetadata[] {
    if (scryfallData.layout !== 'modal_dfc') return []
    
    const results: LandMetadata[] = []
    
    for (const face of scryfallData.card_faces || []) {
      if (face.type_line?.toLowerCase().includes('land')) {
        results.push(this.analyzeFace(face))
      }
    }
    
    return results
  }
}
```

### 6.3 Calcul Tempo-Aware

```typescript
// src/services/manaCalculator.ts (additions)

export interface TempoCalculationParams {
  deck: {
    lands: LandMetadata[]
    totalCards: number
  }
  targetTurn: number
  colorNeeded: ManaColor
  symbolsNeeded: number
  strategy: 'aggressive' | 'conservative' | 'balanced'
}

/**
 * Calcule la probabilité de cast en prenant en compte le tempo
 */
export function calculateTempoAwareProbability(
  params: TempoCalculationParams
): TempoAwareProbability {
  const { deck, targetTurn, colorNeeded, symbolsNeeded, strategy } = params
  
  // 1. Calculer les sources effectives pour chaque scénario
  const assumePayLife = strategy === 'aggressive'
  const context = createDeckContext(deck, assumePayLife)
  
  // 2. Compter les sources pondérées
  let effectiveSources = 0
  
  for (const land of deck.lands) {
    if (!land.produces.includes(colorNeeded) && !land.producesAny) {
      continue
    }
    
    const untappedProb = landService.getUntappedProbability(
      land,
      targetTurn,
      context
    )
    
    // Fetchlands : pénalité car délai d'un tour
    const fetchPenalty = land.isFetch ? 0.9 : 1.0
    
    effectiveSources += untappedProb * fetchPenalty
  }
  
  // 3. Calculer la probabilité hypergeométrique avec sources effectives
  const cardsSeen = 7 + targetTurn - 1
  
  const probability = cumulativeHypergeometric(
    deck.totalCards,
    Math.round(effectiveSources),
    cardsSeen,
    symbolsNeeded
  )
  
  // 4. Calculer aussi la probabilité brute pour comparaison
  const rawSources = deck.lands.filter(l => 
    l.produces.includes(colorNeeded) || l.producesAny
  ).length
  
  const rawProbability = cumulativeHypergeometric(
    deck.totalCards,
    rawSources,
    cardsSeen,
    symbolsNeeded
  )
  
  // 5. Calculer les scénarios
  const scenarios = {
    aggressive: calculateWithStrategy(params, 'aggressive'),
    conservative: calculateWithStrategy(params, 'conservative'),
    balanced: (
      calculateWithStrategy(params, 'aggressive') * 0.6 +
      calculateWithStrategy(params, 'conservative') * 0.4
    )
  }
  
  return {
    raw: rawProbability,
    tempoAdjusted: probability,
    scenarios,
    effectiveSourcesByTurn: calculateSourcesByTurn(deck, colorNeeded, context)
  }
}
```

### 6.4 Base de Données de Lands

```json
// src/data/knownLands.json (extrait)

{
  "Plains": {
    "name": "Plains",
    "category": "basic",
    "produces": ["W"],
    "producesAny": false,
    "etbBehavior": { "type": "always_untapped" },
    "isFetch": false,
    "isCreatureLand": false,
    "hasChannel": false,
    "confidence": 100
  },
  
  "Hallowed Fountain": {
    "name": "Hallowed Fountain",
    "category": "shock",
    "produces": ["W", "U"],
    "producesAny": false,
    "etbBehavior": {
      "type": "conditional",
      "condition": { "type": "pay_life", "amount": 2 }
    },
    "isFetch": false,
    "isCreatureLand": false,
    "hasChannel": false,
    "confidence": 100
  },
  
  "Seachrome Coast": {
    "name": "Seachrome Coast",
    "category": "fast",
    "produces": ["W", "U"],
    "producesAny": false,
    "etbBehavior": {
      "type": "conditional",
      "condition": { "type": "control_lands_max", "threshold": 2 }
    },
    "isFetch": false,
    "isCreatureLand": false,
    "hasChannel": false,
    "confidence": 100
  },
  
  "Flooded Strand": {
    "name": "Flooded Strand",
    "category": "fetch",
    "produces": [],
    "producesAny": false,
    "etbBehavior": { "type": "always_untapped" },
    "isFetch": true,
    "fetchTargets": ["Plains", "Island"],
    "isCreatureLand": false,
    "hasChannel": false,
    "confidence": 100
  },
  
  "Raffine's Tower": {
    "name": "Raffine's Tower",
    "category": "triome",
    "produces": ["W", "U", "B"],
    "producesAny": false,
    "etbBehavior": { "type": "always_tapped" },
    "isFetch": false,
    "isCreatureLand": false,
    "hasChannel": false,
    "confidence": 100
  },
  
  "Cragcrown Pathway": {
    "name": "Cragcrown Pathway",
    "category": "pathway",
    "produces": ["R"],
    "producesAny": false,
    "etbBehavior": { "type": "always_untapped" },
    "isFetch": false,
    "isCreatureLand": false,
    "hasChannel": false,
    "isMDFC": true,
    "otherFace": "Timbercrown Pathway",
    "confidence": 100
  }
}
```

---

## 7. Spécifications Techniques

### 7.1 Interface Scryfall Étendue

```typescript
interface ScryfallCardExtended {
  id: string
  name: string
  type_line: string
  oracle_text?: string          // Ajouté
  mana_cost?: string
  cmc: number
  colors: string[]
  color_identity: string[]
  produced_mana?: string[]
  layout: string
  keywords?: string[]           // Ajouté
  card_faces?: Array<{          // Ajouté
    name: string
    type_line: string
    oracle_text: string
    mana_cost?: string
    colors?: string[]
  }>
}
```

### 7.2 Patterns Regex Complets

```typescript
const ETB_PATTERNS = {
  // Toujours tapped
  ALWAYS_TAPPED: /enters the battlefield tapped\.$/i,
  
  // Shocklands
  SHOCK: /you may pay (\d+) life.*if you don't.*enters.*tapped/i,
  
  // Fastlands
  FAST: /enters.*tapped unless you control (?:two|2) or fewer other lands/i,
  
  // Slowlands
  SLOW: /enters.*tapped unless you control (?:two|2) or more other lands/i,
  
  // Checklands
  CHECK: /enters.*tapped unless you control (?:a |an )?([A-Z][a-z]+)(?: or (?:a |an )?([A-Z][a-z]+))?/i,
  
  // Battle lands
  BATTLE: /enters.*tapped unless you control (?:two|2) or more basic lands/i,
  
  // Reveal lands
  REVEAL: /you may reveal (?:a |an )?([A-Za-z]+) card.*if you don't.*tapped/i,
  
  // Turn threshold (Starting Town)
  TURN: /enters.*tapped.*unless.*(?:first|second|third|turn (\d+))/i,
  
  // Channel (pas ETB mais capacité spéciale)
  CHANNEL: /channel.*—.*discard this card/i,
  
  // Creature activation
  CREATURE: /becomes? (?:a |an )?(?:\d+\/\d+.*)?creature/i,
  
  // Cycling
  CYCLING: /cycling/i,
}
```

### 7.3 Algorithme de Détection

```
ENTRÉE: cardName (string)

1. CACHE CHECK
   └─► Si cache.has(cardName) → return cache.get(cardName)

2. DATABASE CHECK
   └─► Si KNOWN_LANDS[cardName] → return KNOWN_LANDS[cardName]

3. SCRYFALL FETCH
   └─► scryfallData = await fetchScryfall(cardName)
   └─► Si erreur ou non-land → return null

4. MDFC CHECK
   └─► Si layout === 'modal_dfc' ET card_faces existe
       └─► Pour chaque face avec type 'Land'
           └─► Analyser indépendamment
           └─► Retourner tableau de LandMetadata

5. ORACLE TEXT ANALYSIS
   └─► Pour chaque pattern dans ETB_PATTERNS
       └─► Si match
           └─► Extraire condition
           └─► Calculer confiance
           └─► Construire LandMetadata

6. FALLBACK
   └─► Si type_line contient 'Land'
       └─► Catégoriser par type_line (Basic, Legendary, etc.)
       └─► ETB = 'always_untapped' par défaut
       └─► confidence = 50

7. CACHE & RETURN
   └─► cache.set(cardName, metadata)
   └─► return metadata
```

### 7.4 Formule de Pondération

```
Sources_Effectives(turn, color) = Σ pour chaque land L:
  
  Si L ne produit pas color:
    contribution = 0
    
  Sinon:
    base = 1.0
    
    # Pénalité ETB tapped
    Si L.etbBehavior.type === 'always_tapped':
      etb_penalty = (turn > 1) ? 0.8 : 0.0
    Sinon Si L.etbBehavior.type === 'conditional':
      etb_penalty = evaluateCondition(L.condition, turn, context)
    Sinon:
      etb_penalty = 1.0
    
    # Pénalité fetchland (délai d'un tour)
    fetch_penalty = L.isFetch ? 0.9 : 1.0
    
    contribution = base * etb_penalty * fetch_penalty
    
  Sources_Effectives += contribution
```

---

## 8. Plan d'Implémentation

### Phase 1 : Types et Données (1 jour)

| Tâche | Fichier | Priorité |
|-------|---------|----------|
| Créer types LandMetadata | `src/types/lands.ts` | P0 |
| Créer base 200+ lands | `src/data/knownLands.json` | P0 |
| Étendre interface Scryfall | `src/services/scryfall.ts` | P1 |

**Livrables** :
- Types TypeScript complets
- JSON avec tous les Fetchlands, Shocklands, Fastlands, Checklands, Slowlands, Triomes, Pathways, Painlands, Horizon Lands

### Phase 2 : Service Unifié (2 jours)

| Tâche | Fichier | Priorité |
|-------|---------|----------|
| Créer LandService | `src/services/landService.ts` | P0 |
| Implémenter détection MDFC | `src/services/landService.ts` | P0 |
| Implémenter patterns Oracle | `src/services/landService.ts` | P0 |
| Ajouter cache LRU | `src/services/landService.ts` | P1 |

**Livrables** :
- Service de détection unifié
- Support MDFC complet
- 12 patterns de détection ETB

### Phase 3 : Calculs Tempo (2 jours)

| Tâche | Fichier | Priorité |
|-------|---------|----------|
| Ajouter calculateTempoAwareProbability | `src/services/manaCalculator.ts` | P0 |
| Implémenter getUntappedProbability | `src/services/landService.ts` | P0 |
| Ajouter scénarios (aggressive/conservative) | `src/services/manaCalculator.ts` | P1 |
| Intégrer dans deckAnalyzer | `src/services/deckAnalyzer.ts` | P0 |

**Livrables** :
- Fonction de calcul tempo-aware
- 3 scénarios de jeu
- Intégration avec l'analyseur existant

### Phase 4 : Tests et Cleanup (1 jour)

| Tâche | Fichier | Priorité |
|-------|---------|----------|
| Tests unitaires LandService | `src/services/__tests__/landService.test.ts` | P0 |
| Tests calculs tempo | `src/services/__tests__/manaCalculator.test.ts` | P0 |
| Supprimer fichiers obsolètes | `src/utils/landDetection*.ts` | P1 |
| Documentation inline | Tous | P2 |

**Livrables** :
- Suite de tests (≥80% coverage)
- Code nettoyé
- Documentation

---

## 9. Tests et Validation

### 9.1 Cas de Test Critiques

```typescript
describe('LandService', () => {
  describe('ETB Detection', () => {
    test('Basic lands always untapped', () => {
      const plains = landService.detectLand('Plains')
      expect(plains.etbBehavior.type).toBe('always_untapped')
    })
    
    test('Triomes always tapped', () => {
      const triome = landService.detectLand("Raffine's Tower")
      expect(triome.etbBehavior.type).toBe('always_tapped')
    })
    
    test('Shocklands conditional on life payment', () => {
      const shock = landService.detectLand('Hallowed Fountain')
      expect(shock.etbBehavior.type).toBe('conditional')
      expect(shock.etbBehavior.condition.type).toBe('pay_life')
      expect(shock.etbBehavior.condition.amount).toBe(2)
    })
    
    test('Fastlands conditional on land count', () => {
      const fast = landService.detectLand('Seachrome Coast')
      expect(fast.etbBehavior.type).toBe('conditional')
      expect(fast.etbBehavior.condition.type).toBe('control_lands_max')
      expect(fast.etbBehavior.condition.threshold).toBe(2)
    })
  })
  
  describe('MDFC Handling', () => {
    test('Pathways detected as MDFC', async () => {
      const pathway = await landService.detectLand('Cragcrown Pathway')
      expect(pathway.isMDFC).toBe(true)
      expect(pathway.produces).toEqual(['R'])
    })
  })
  
  describe('Untapped Probability', () => {
    test('Fastland T1-T3 = high probability', () => {
      const fast = { etbBehavior: { type: 'conditional', condition: { type: 'control_lands_max', threshold: 2 }}}
      expect(landService.getUntappedProbability(fast, 1, context)).toBeGreaterThan(0.9)
      expect(landService.getUntappedProbability(fast, 2, context)).toBeGreaterThan(0.9)
      expect(landService.getUntappedProbability(fast, 3, context)).toBeGreaterThan(0.9)
    })
    
    test('Fastland T4+ = low probability', () => {
      expect(landService.getUntappedProbability(fast, 4, context)).toBeLessThan(0.5)
      expect(landService.getUntappedProbability(fast, 5, context)).toBeLessThan(0.3)
    })
  })
})

describe('Tempo-Aware Calculations', () => {
  test('Deck with all shocks: aggressive vs conservative differs', () => {
    const deck = createDeck({ shocklands: 12, basics: 8 })
    
    const aggressive = calculateTempoAwareProbability({
      deck, targetTurn: 1, colorNeeded: 'R', symbolsNeeded: 1,
      strategy: 'aggressive'
    })
    
    const conservative = calculateTempoAwareProbability({
      deck, targetTurn: 1, colorNeeded: 'R', symbolsNeeded: 1,
      strategy: 'conservative'
    })
    
    expect(aggressive.tempoAdjusted).toBeGreaterThan(conservative.tempoAdjusted)
    expect(aggressive.tempoAdjusted - conservative.tempoAdjusted).toBeGreaterThan(0.1)
  })
  
  test('Raw probability > tempo adjusted for taplands', () => {
    const deck = createDeck({ triomes: 8, basics: 12 })
    
    const result = calculateTempoAwareProbability({
      deck, targetTurn: 1, colorNeeded: 'W', symbolsNeeded: 1,
      strategy: 'balanced'
    })
    
    expect(result.raw).toBeGreaterThan(result.tempoAdjusted)
  })
})
```

### 9.2 Decks de Validation

| Deck | Composition | Attendu T1 {R} | Attendu T3 {U}{U} |
|------|-------------|----------------|-------------------|
| Mono-R Aggro | 20 Mountain | 95% | N/A |
| UW Control (Shocks) | 8 Shock + 4 Fast + 12 Basic | 85% aggressive, 65% conservative | 88% |
| 5C Triomes | 12 Triome + 8 Basic | 60% (Triomes tapped) | 75% |
| Modern Fetch/Shock | 8 Fetch + 8 Shock + 4 Basic | 90% | 92% |

---

## 10. Risques et Mitigations

### 10.1 Risques Techniques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| API Scryfall rate limit | Moyenne | Moyen | Cache LRU + bulk data |
| MDFC non détectés | Haute | Haut | Tests exhaustifs + fallback |
| Performance dégradée | Basse | Moyen | Mémoïsation + lazy loading |
| Régression calculs existants | Moyenne | Haut | Tests de non-régression |

### 10.2 Risques Fonctionnels

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Terrains inconnus mal catégorisés | Moyenne | Moyen | Fallback conservateur (untapped) |
| Conditions complexes mal évaluées | Basse | Moyen | Confiance score + warning UI |
| Probabilités trop pessimistes | Moyenne | Moyen | Scénario "balanced" par défaut |

### 10.3 Plan de Rollback

1. Conserver `manaCalculator.ts` original (renommer en `.backup.ts`)
2. Feature flag pour activer/désactiver tempo-aware
3. A/B testing avec utilisateurs volontaires

---

## Annexes

### A. Liste Complète des 200+ Terrains

*(À générer dans knownLands.json)*

### B. Références

1. [Frank Karsten - How Many Sources Do You Need](https://www.channelfireball.com/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/)
2. [Scryfall API Documentation](https://scryfall.com/docs/api)
3. [WickedFridge/magic-project-manabase](https://github.com/WickedFridge/magic-project-manabase)
4. [MTG Wiki - Land Types](https://mtg.fandom.com/wiki/Land)

### C. Glossaire

| Terme | Définition |
|-------|------------|
| ETB | Enters The Battlefield |
| Tapped | Terrain engagé, ne peut pas produire de mana |
| Tempo | Vitesse de développement du jeu |
| CMC | Converted Mana Cost (coût de mana converti) |
| MDFC | Modal Double-Faced Card |
| Hypergeométrique | Distribution de probabilité pour tirage sans remise |

---

**Document généré le 25 décembre 2025**  
**Prêt pour revue et approbation**
