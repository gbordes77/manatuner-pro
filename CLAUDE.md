# ManaTuner - Instructions Claude

## LANCEMENT — LIRE EN PREMIER

**Lis `LAUNCH.md` a la racine du projet au debut de chaque session.** Avant de proposer un refactoring, une nouvelle feature, ou un audit : est-ce que ca aide a avoir des utilisateurs ? Si non, redirige vers le plan de lancement.

---

## RÈGLE CRITIQUE: Rechargement Automatique

**À chaque modification de fichier frontend (.tsx, .ts, .css, .scss):**

1. Vérifier que le serveur dev tourne
2. Recharger/redémarrer le serveur si nécessaire
3. Informer l'utilisateur de rafraîchir la page avec l'URL exacte

```bash
# Vérifier et relancer le serveur
curl -s http://localhost:3000 > /dev/null || (cd "/Volumes/DataDisk/_Projects/Project Mana base V2" && npm run dev &)

# Informer l'utilisateur
echo "Rafraîchis http://localhost:3000/[page-modifiée]"
```

**Ne JAMAIS marquer une modification UI comme terminée sans avoir:**

- Relancé/vérifié le serveur local
- Donné l'URL exacte à rafraîchir à l'utilisateur

---

## Informations Projet

- **Stack**: React 18 + TypeScript + Vite + MUI
- **Port dev**: 3000
- **Tests**: `npm run test:unit` (Vitest) / `npm run test:e2e` (Playwright)
- **Build**: `npm run build`

## Routes Principales

- `/` - Home
- `/analyzer` - Analyseur de deck
- `/land-glossary` - Glossaire des terrains
- `/guide` - Guide utilisateur
- `/mathematics` - Explications mathématiques

## Personas Utilisateurs

**Fichier** : `mtg-player-personas.md` (racine du projet)

5 personas joueurs MTG pour evaluer l'UX, du casual au Pro Tour :

1. **Leo (Le Curieux)** — 6 mois, casual Arena, fuit le jargon
2. **Sarah (La Reguliere)** — FNM weekly, copie/ajuste des decklists
3. **Karim (Le Tacticien)** — Grinder RCQ, veut data fine et exports
4. **Natsuki (La Grinder)** — Pro Tour qual, pense en EV/equity, veut l'API
5. **David (L'Architecte)** — Pro Tour vet, theoricien, lit le code source

Utiliser pour evaluer toute modification UX. Chaque persona a : identite, vocabulaire, parcours de navigation, grille d'evaluation (8 axes), et format de sortie structure.

**Derniers scores (v2.4 — 2026-04-06)** : Leo 4.11 | Sarah 4.31 | Karim 4.44 | Natsuki 4.03 | David 3.80 | **Moy: 4.14/5** (scoring plus rigoureux que v2.1)

---

## Notes Techniques

### Supabase

**Status: DISABLED** - Service entièrement mocké (`isConfigured: () => false`). Toutes les données restent en localStorage. App 100% privacy-first.

### PWA Cache Fix (Janvier 2025)

**Problème résolu**: Après déploiement sur Vercel, les navigateurs ayant déjà visité le site restaient bloqués sur l'ancienne version (cache Service Worker).

**Cause racine**:

- `vite-plugin-pwa` était configuré mais ne générait pas de SW fonctionnel
- Les anciens Service Workers restaient actifs dans les navigateurs des utilisateurs
- Ces anciens SW servaient les fichiers depuis leur cache local

**Solution déployée** - SW Killer (`public/sw.js`):

```javascript
// Ce SW remplace l'ancien, vide les caches, et se désinstalle
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', async () => {
  await Promise.all((await caches.keys()).map((name) => caches.delete(name)))
  await self.registration.unregister()
  ;(await self.clients.matchAll({ type: 'window' })).forEach((c) => c.navigate(c.url))
})
```

**Configuration Vercel** (`vercel.json`):

- Exclut `/sw.js` du rewrite SPA
- Headers `no-cache, no-store` sur `/sw.js`

**Résultat**: Les navigateurs téléchargent le nouveau SW killer qui nettoie tout et se désinstalle, garantissant que les utilisateurs voient toujours la dernière version.

### Mathematical Code Architecture (Audit 2026-04-06)

**Audit report**: `docs/MATH_AUDIT_REPORT.md`

**Hypergeometric implementation** — UNIFIED (2026-04-06):

- `src/services/castability/hypergeom.ts` — **Single source of truth**, log-space, singleton `hypergeom`
- `src/services/advancedMaths.ts` — Delegates to `hypergeom.pmf()` / `hypergeom.atLeast()`
- `src/services/manaCalculator.ts` — Delegates to `hypergeom.pmf()` / `hypergeom.atLeast()`
- `src/components/ManaCostRow.tsx` — Still has inline `useProbabilityCalculation` (TODO: align with engine)

**Karsten tables** — UNIFIED (2026-04-06):

- `src/types/maths.ts:131` — **Single source of truth** (symbols x turn → sources needed, T1-T10)
- `src/services/manaCalculator.ts` — Imports from `types/maths.ts`
- `src/utils/manabase.ts` — Imports from `types/maths.ts` via `getKarstenSources()` helper

**Play/Draw propagation chain** — Must flow end-to-end:

```
AccelerationSettings → AccelerationContext → CastabilityTab → ManaCostRow
  → useProbabilityCalculation(playDraw)   // base probabilities
  → useAcceleratedCastability(accelCtx)    // ramp probabilities
```

**Bellman equation** is in `mulliganSimulatorAdvanced.ts:922-941`. The thresholds (keep7/6/5) are derived from backward induction EVs. Do not modify without understanding the recursive structure.

**Fisher-Yates shuffle** — Every shuffle in the codebase MUST use the backward Fisher-Yates pattern. Never use `.sort(() => Math.random() - 0.5)` — it produces biased distributions.

### ENHANCER Type & K=3 Engine (2026-04-06)

**ENHANCER producer type** — Cards like Badgermole Cub that boost other dorks. Uses 3 fields:

- `enhancerBonus: number` — mana added per enhanced creature
- `enhancerBonusMask: ColorMask` — color of bonus
- `enhancesTypes: ManaProducerType[]` — what types it enhances (default: `['DORK']`)

**K=3 triple scenarios** — Engine evaluates K=0/1/2/3 producers online simultaneously (was K=0/1/2). Default `kMax=3`. Critical for ENHANCER + 2 dorks combos:

```
K=1 (Cub alone):     extraMana = 1G
K=2 (Cub + Elves):   extraMana = 3G (1 base + 1 dork + 1 bonus)
K=3 (Cub + 2 dorks): extraMana = 5G (1 base + 2 dorks + 2 bonuses)
```

**Hybrid mana** — `{R/G}` symbols in mana costs:

- Base P1/P2 in `ManaCostRow.tsx`: `Math.max(pColor1, pColor2)` — correct
- Accelerated castability: assigns to color with most deck sources
- Display: uses mana-font `ms-rg` class for bicolor split circle
- `parseManaCost` in `manaProducerService.ts`: handles `/` symbols

**Combat-damage treasure exclusion** — `analyzeOracleForMana()` in `manaProducerService.ts` filters out `"deals combat damage...create Treasure"` pattern. Sticky Fingers = NOT ramp.

**Sample deck** — Nature's Rhythm / Badgermole Cub (Standard). 4 producer types in seed: Llanowar Elves, Gene Pollinator, Spider Manifestation, Badgermole Cub.

### Ramp Taxonomy Expansion (2026-04-10)

**5 new ManaProducerTypes** added after comprehensive Scryfall audit of all 22 MTG ramp mechanisms:

| Type             | Oracle Pattern                                             | Modeling                                                      | Key Cards                                  |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| `LAND_AURA`      | `enchant land` + `tapped for mana...add`                   | delay=0, permanent, non-creature                              | Wild Growth, Utopia Sprawl, Fertile Ground |
| `LAND_FROM_HAND` | `put a land card from your hand onto the battlefield`      | delay=0, oneShot if instant/sorcery, survival=1.0             | Growth Spiral, Arboreal Grazer, Uro        |
| `SPAWN_SCION`    | `Eldrazi Spawn`/`Scion` + `sacrifice`                      | colorless only ({C}), oneShot per token                       | Awakening Zone, Glaring Fleshraker         |
| `LANDFALL_MANA`  | `whenever a land enters...add` / `landfall...add`          | delay=1 if creature, passive trigger                          | Lotus Cobra, Nissa Resurgent Animist       |
| `MANA_DOUBLER`   | `tap a land for mana...add` / `produces twice/three times` | `doublerMultiplier` field (2 or 3), producesAmount = net gain | Mirari's Wake, Nyxbloom Ancient            |

**Detection priority** in `analyzeOracleForMana()`: LAND_RAMP → extra land drop → LAND_FROM_HAND → LAND_AURA → LANDFALL_MANA → MANA_DOUBLER → SPAWN_SCION → standard patterns (tap, sacrifice, treasure, ritual).

**Not implemented (deferred)**: COST_REDUCER (~286 cards, virtual ramp), UNTAP_RAMP (~54 cards, complex modeling), CAST_TRIGGER_MANA (storm enablers), ATTACK_TRIGGER_MANA (combat-conditional), FREE_CAST/CASCADE, CONVOKE/DELVE/AFFINITY, PHYREXIAN_MANA, PLAY_FROM_GRAVEYARD.

### Smart Sideboard Detection & Creature-Only Mana (2026-04-11)

**Sideboard auto-detection** — `detectSideboardStartLine()` exported from `deckAnalyzer.ts`:

Parser now handles ALL sideboard formats without user friction:

| Format            | Example                                                             | Detection Method                         |
| ----------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| Explicit marker   | `Sideboard` / `Sideboard:` / `SB:` / `// Sideboard` / `# Sideboard` | Regex match (existing)                   |
| Inline prefix     | `SB: 2 Rest in Peace`                                               | Regex strip + flag (new)                 |
| Blank line        | `...60 cards...\n\n...15 cards...`                                  | Heuristic: 40-100 main + 1-15 side (new) |
| MTGA + blank line | `4 Card (SET) 123\n\n1 Card (SET) 456`                              | Same heuristic (new)                     |

Heuristic: last blank line that splits a block of 40-100 cards from a block of 1-15 cards = sideboard boundary. Handles Standard (60+15), Limited (40+), Commander (100+side).

**`producesAnyForCreaturesOnly` flag** — Lands that only produce colored mana for creature spells:

| Land                | Behavior                                               |
| ------------------- | ------------------------------------------------------ |
| Cavern of Souls     | `producesAny: true, producesAnyForCreaturesOnly: true` |
| Unclaimed Territory | Same                                                   |
| Secluded Courtyard  | Same                                                   |
| Plaza of Heroes     | Same                                                   |
| Ancient Ziggurat    | Same (new in seed)                                     |

**How it works:**

- `DeckCard.isCreature` populated from Scryfall `type_line`
- `landProducesColorForSpell(land, color, isCreatureSpell)` helper in `manaCalculator.ts`
- `ManaCostRow` receives `isCreature` + `creatureOnlyExtraSources` props
- For creatures: Cavern counts as B/U source. For non-creatures (Bitter Triumph): Cavern = colorless only.
- `TempoCalculationParams.isCreatureSpell` passed through tempo chain

**Files modified:**

- `src/types/lands.ts` — `producesAnyForCreaturesOnly` on `LandMetadata`, `isCreatureSpell` on `TempoCalculationParams`
- `src/services/deckAnalyzer.ts` — `detectSideboardStartLine()` (exported), `isCreature` on `DeckCard`, blank-line + inline SB: detection
- `src/data/landSeed.ts` — 5 lands flagged + Ancient Ziggurat added (210 total)
- `src/services/manaCalculator.ts` — `landProducesColorForSpell()` helper, used in 3 calculation paths
- `src/components/ManaCostRow.tsx` — `isCreature`, `creatureOnlyExtraSources` props, `effectiveDeckSources` memo
- `src/components/analyzer/CastabilityTab.tsx` — `creatureOnlyExtraSources` calculation, props passed to ManaCostRow
- `src/services/__tests__/sideboardDetection.test.ts` — 14 tests covering all formats

### Persona Scores History

| Persona           | v2.1 (initial) | v2.4 (04-06) | v2.5 (04-10) |
| ----------------- | -------------- | ------------ | ------------ |
| Leo (Beginner)    | 3.69           | 4.11         | 3.75         |
| Sarah (Regular)   | 4.13           | 4.31         | 4.42         |
| Karim (Tactician) | 4.13           | 4.44         | 4.50         |
| Natsuki (Grinder) | 3.75           | 4.03         | 4.08         |
| David (Architect) | 3.40           | 3.80         | 4.42         |
| **Average**       | **3.82**       | **4.14**     | **4.23**     |

Leo's v2.5 regression: homepage chips still show "Hypergeometric"/"Monte Carlo" jargon. Fix: replace with accessible labels.
