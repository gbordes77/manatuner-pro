# ManaTuner - Instructions Claude

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

**Derniers scores (v2.1.0)** : Leo 4.2 | Sarah 4.2 | Karim 4.1 | Natsuki 3.8 | David 4.1 | **Moy: 4.08/5**

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

**4 hypergeometric implementations** — Know they exist before modifying math code:

1. `src/services/castability/hypergeom.ts` — Log-space, main engine (Castability tab)
2. `src/services/advancedMaths.ts` — Iterative with cache (Karsten/MC engine)
3. `src/services/manaCalculator.ts` — Iterative with memoization (legacy calculator)
4. `src/components/ManaCostRow.tsx` — Inline in `useProbabilityCalculation` (per-spell display)

**3 copies of Karsten tables** — Keep in sync if modifying:

1. `src/types/maths.ts:131` — Canonical (symbols x turn → sources needed)
2. `src/services/manaCalculator.ts:17` — Subset (T1-T6 only)
3. `src/utils/manabase.ts:14` — Alternate format (turn → single/double/triple)

**Play/Draw propagation chain** — Must flow end-to-end:

```
AccelerationSettings → AccelerationContext → CastabilityTab → ManaCostRow
  → useProbabilityCalculation(playDraw)   // base probabilities
  → useAcceleratedCastability(accelCtx)    // ramp probabilities
```

**Bellman equation** is in `mulliganSimulatorAdvanced.ts:922-941`. The thresholds (keep7/6/5) are derived from backward induction EVs. Do not modify without understanding the recursive structure.

**Fisher-Yates shuffle** — Every shuffle in the codebase MUST use the backward Fisher-Yates pattern. Never use `.sort(() => Math.random() - 0.5)` — it produces biased distributions.
