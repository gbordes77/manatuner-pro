# P3 Team Onboarding - Monte Carlo Simulation Engine

## Context pour l'IA/Équipe

Tu es assigné à l'implémentation du **P3: Simulation Engine** pour ManaTuner Pro, un outil d'analyse de mana pour Magic: The Gathering.

---

## Projet: ManaTuner Pro

**Stack technique:**
- React 18 + TypeScript + Vite
- MUI (Material-UI) pour l'UI
- Vitest pour les tests
- Architecture: Services modulaires + Hooks React

**Repo:** `/Volumes/DataDisk/_Projects/Project Mana base V2`  
**Port dev:** `http://localhost:5173`  
**Commandes:**
```bash
npm run dev          # Serveur dev
npm run type-check   # Vérification TypeScript
npm run test:unit    # Tests unitaires
npm run build        # Build production
```

---

## Ta Mission: Implémenter le Simulation Engine

### Pourquoi?

Le moteur analytique v1.1 (déjà implémenté) gère 95% des cas en O(1). Mais certains scénarios nécessitent une **simulation Monte Carlo**:

| Cas | Pourquoi simulation requise |
|-----|----------------------------|
| **ENHANCERs** (Badgermole Cub) | Multiplie le mana des autres dorks - nécessite tracking du board |
| **Multi-mana lands complexes** | Ancient Tomb + Bounce lands avec deltas différents |
| **Conditional producers** | Nykthos (devotion), Urborg+Coffers (count lands) |
| **Treasure generators** | Dockside Extortionist - output variable |

### Livrables attendus

1. `src/services/castability/simulationTypes.ts` - Types
2. `src/services/castability/gameState.ts` - État de jeu
3. `src/services/castability/simulationEngine.ts` - Moteur Monte Carlo
4. Mise à jour de `src/services/castability/index.ts` - Router
5. Composants UI pour afficher les résultats simulation
6. Tests unitaires et d'intégration

---

## Documents à lire OBLIGATOIREMENT

### 1. Spécification P3 (CRITIQUE - lire en premier)
```
docs/P3_SIMULATION_ENGINE_SPEC.md
```
Contient:
- Architecture complète
- Tous les types TypeScript à implémenter
- Code du moteur de simulation
- Stratégies de mulligan et land play
- Tests à écrire
- Benchmarks de performance

### 2. Moteur analytique existant (référence)
```
src/services/castability/acceleratedAnalyticEngine.ts
```
Le moteur v1.1 que tu dois compléter (pas remplacer). Comprends comment il fonctionne pour assurer la compatibilité.

### 3. Types existants
```
src/types/manaProducers.ts
```
Tous les types de producteurs de mana (DORK, ROCK, RITUAL, ENHANCER, etc.)

### 4. Documentation mathématique
```
docs/MATHEMATICAL_REFERENCE.md
docs/P1_P2_PROBABILITY_METHOD.md
```
Comprendre P1/P2 et la distribution hypergéométrique.

### 5. Système d'accélération
```
docs/MANA_ACCELERATION_SYSTEM.md
```
Vue d'ensemble du système complet.

---

## Architecture actuelle

```
src/services/castability/
├── acceleratedAnalyticEngine.ts   # v1.1 - Mode instant O(1) ✅ DONE
├── hypergeom.ts                   # Calculs hypergéométriques ✅ DONE
├── index.ts                       # Exports publics (à modifier)
│
├── simulationTypes.ts             # 🆕 P3: Types simulation
├── gameState.ts                   # 🆕 P3: État de jeu
└── simulationEngine.ts            # 🆕 P3: Monte Carlo
```

---

## Concepts clés à maîtriser

### 1. Producteurs de mana

```typescript
type ManaProducerType =
  | 'DORK'       // Créature qui tap pour mana (Llanowar Elves)
  | 'ROCK'       // Artefact qui tap pour mana (Sol Ring)
  | 'RITUAL'     // One-shot (Dark Ritual)
  | 'ONE_SHOT'   // Artefact one-use (Lotus Petal)
  | 'TREASURE'   // Génère des tokens treasure
  | 'CONDITIONAL' // Dépend du board (Nykthos)
  | 'ENHANCER'   // Multiplie les autres dorks (Badgermole Cub) ⭐
```

### 2. ENHANCER pattern (cas principal P3)

**Badgermole Cub**: Quand un autre dork tap pour du mana, il produit +1G en plus.

Exemple:
- Sans Badgermole: Llanowar Elves tap → {G}
- Avec 1 Badgermole: Llanowar Elves tap → {G}{G}
- Avec 2 Badgermole: Llanowar Elves tap → {G}{G}{G}

**C'est impossible à calculer analytiquement** car ça dépend de combien de dorks ET d'enhancers sont sur le board simultanément.

### 3. Game State à tracker

```typescript
interface GameState {
  library: Card[]
  hand: Card[]
  battlefield: Permanent[]
  turn: number
  landDropUsed: boolean
  manaPool: { W, U, B, R, G, C }
  dorksOnBattlefield: number      // Pour les ENHANCERs
  enhancersOnBattlefield: Permanent[]
}
```

### 4. Boucle de simulation

```
Pour N = 1000 itérations:
  1. Shuffle deck
  2. Draw 7, évaluer mulligan (London)
  3. Pour chaque tour jusqu'à maxTurn:
     - Untap, remove summoning sickness
     - Draw (sauf T1 on the play)
     - Play land (stratégie greedy-color)
     - Cast mana producers si possible
     - Calculer mana disponible (avec ENHANCERs!)
     - Check: peut-on cast le spell cible?
     - Appliquer removal probabiliste
  4. Enregistrer succès/échec et tour de cast

Agréger les résultats → probabilité + intervalle de confiance
```

---

## Routing: Quand utiliser simulation vs analytique?

```typescript
function shouldUseSimulation(producers: ProducerInDeck[]): boolean {
  return producers.some(p => 
    p.def.type === 'ENHANCER' ||
    p.def.type === 'CONDITIONAL' ||
    p.def.type === 'TREASURE'
  )
}
```

- **Analytique**: Dorks + Rocks simples → O(1), instantané
- **Simulation**: ENHANCERs, Conditional → N=1000, ~300-500ms

---

## Critères de succès

### Performance
- [ ] N=1000 simulations < 500ms
- [ ] N=5000 simulations < 2.5s
- [ ] Memory < 50MB

### Précision
- [ ] Résultats dans ±5% du moteur analytique pour cas simples
- [ ] Intervalles de confiance 95% corrects

### Fonctionnalités
- [ ] ENHANCER support complet (Badgermole Cub pattern)
- [ ] London mulligan avec évaluation de main
- [ ] Stratégies de land play (greedy-color, untapped-first)
- [ ] Removal probabiliste (removalRate * rockRemovalFactor)
- [ ] Router automatique analytique vs simulation

### Tests
- [ ] Tests unitaires pour chaque composant
- [ ] Tests d'intégration simulation vs analytique
- [ ] Tests de reproductibilité (seed)

### UI
- [ ] Toggle "Simulation Mode" dans AccelerationSettings
- [ ] Affichage intervalle de confiance
- [ ] Indicateur de chargement pendant simulation
- [ ] Affichage des key contributors

---

## Pièges à éviter

1. **Summoning sickness**: Les créatures ne peuvent pas tap le tour où elles arrivent
2. **ETB tapped**: Certaines lands arrivent tapped
3. **Activation tax**: Signets coûtent {1} pour activer
4. **ENHANCER timing**: L'enhancer doit être sur le board ET sans summoning sickness pour fonctionner
5. **Ordre de tap**: Tap les dorks APRÈS avoir calculé les bonus enhancer

---

## Exemple de test à écrire

```typescript
it('ENHANCER should increase dork mana output', () => {
  const deck = { deckSize: 60, totalLands: 24, landColorSources: { G: 20 } }
  const spell = { mv: 5, generic: 3, pips: { G: 2 } }
  
  const llanowar = { def: { type: 'DORK', producesAmount: 1, ... }, copies: 4 }
  const badgermole = { def: { type: 'ENHANCER', enhancerBonus: 1, ... }, copies: 2 }
  
  const withEnhancer = runSimulation(deck, spell, [llanowar, badgermole], ctx)
  const withoutEnhancer = runSimulation(deck, spell, [llanowar], ctx)
  
  // Avec enhancer devrait avoir probabilité plus élevée
  expect(withEnhancer.probability).toBeGreaterThan(withoutEnhancer.probability)
})
```

---

## Checklist d'implémentation

### Phase 1: Types et État (Jour 1 matin)
- [ ] Créer `simulationTypes.ts` avec tous les types
- [ ] Créer `gameState.ts` avec shuffle, draw, deck building

### Phase 2: Moteur core (Jour 1 après-midi)
- [ ] Implémenter `simulationEngine.ts` boucle principale
- [ ] Mulligan London basique
- [ ] Land play greedy-color

### Phase 3: ENHANCER (Jour 2 matin)
- [ ] Tracker `dorksOnBattlefield` et `enhancersOnBattlefield`
- [ ] Modifier `calculateManaAvailable()` pour appliquer bonus
- [ ] Tests ENHANCER

### Phase 4: Router + UI (Jour 2 après-midi)
- [ ] Mettre à jour `index.ts` avec routing
- [ ] Toggle simulation dans UI
- [ ] Affichage résultats avec CI

### Phase 5: Tests + Polish (Jour 3)
- [ ] Tests unitaires complets
- [ ] Tests d'intégration
- [ ] Benchmark performance
- [ ] Documentation

---

## Commandes utiles

```bash
# Lancer le dev server
npm run dev

# Vérifier les types
npm run type-check

# Lancer les tests
npm run test:unit

# Lancer un test spécifique
npm run test:unit -- simulationEngine

# Build production
npm run build
```

---

## Contact

Pour toute question sur:
- **Architecture existante**: Lire `docs/ARCHITECTURE.md`
- **Mathématiques**: Lire `docs/MATHEMATICAL_REFERENCE.md`
- **Types producteurs**: Lire `src/types/manaProducers.ts`
- **Moteur v1.1**: Lire `src/services/castability/acceleratedAnalyticEngine.ts`

---

## Prompt de démarrage pour l'IA

```
Je travaille sur ManaTuner Pro, un outil d'analyse de mana pour Magic: The Gathering.

Ma mission: Implémenter le P3 Simulation Engine (Monte Carlo) pour gérer les cas 
complexes comme les ENHANCERs (Badgermole Cub) que le moteur analytique ne peut 
pas calculer.

J'ai lu:
- docs/P3_SIMULATION_ENGINE_SPEC.md (spec complète)
- src/services/castability/acceleratedAnalyticEngine.ts (moteur existant)
- src/types/manaProducers.ts (types)

Commençons par créer simulationTypes.ts avec tous les types nécessaires.
```

---

**Bonne chance! Le code existant est propre et bien documenté. Tu as tout ce qu'il faut pour réussir.**
