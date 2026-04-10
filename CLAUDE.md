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
