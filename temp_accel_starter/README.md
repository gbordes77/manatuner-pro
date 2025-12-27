# ManaTuner Pro — Accel Starter Pack

Contenu:
- mana_producers.json : starter dataset (dorks/rocks/rituals courants)
- hypergeom.ts : hypergéométrique stable (log-factorials)
- types.ts : types communs
- acceleratedAnalyticEngine.ts : moteur analytique (scénarios disjoints K=0..2)
- acceleratedAnalyticEngine.test.ts : tests Vitest
- manaSimWorker.ts : worker Smart Monte Carlo (mana-only) minimal

Notes:
- Le moteur analytique suppose l'indépendance des évènements "producer online".
- Le worker est volontairement minimal: mulligan et heuristiques de play sont simplifiés (TODO London mulligan + play optimal par objectif).
