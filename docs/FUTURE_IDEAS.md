# ManaTuner - Idées Futures (À Faire Peut-Être)

Ce document contient les idées d'améliorations identifiées mais non prioritaires.

---

## 1. 🌿 Intégration Mana Dorks & Mana Rocks

**Date**: 26 décembre 2025  
**Priorité**: Moyenne  
**Complexité**: Moyenne-Haute

### Problème Actuel

L'outil ne prend pas en compte les créatures produisant du mana (Mana Dorks) ni les artefacts (Mana Rocks) dans les calculs de probabilités. Seuls les terrains sont comptabilisés.

### Solution Proposée

Créer un système de "Sources Effectives" avec coefficients de fiabilité :

```
Sources Effectives = Terrains + (Dorks × 0.7) + (Rocks × 0.85)
```

| Source     | Coefficient | Raison                                       |
| ---------- | ----------- | -------------------------------------------- |
| Terrains   | 1.0         | Toujours fiables                             |
| Mana Rocks | 0.85        | Robustes, pas de summoning sickness          |
| Mana Dorks | 0.70        | Vulnérables aux removals, summoning sickness |

### Prise en Compte du Timing

| Source            | Disponible à partir de      |
| ----------------- | --------------------------- |
| Land              | Tour où joué                |
| Mana Rock (CMC 1) | Tour 2                      |
| Mana Rock (CMC 2) | Tour 3                      |
| Mana Dork (CMC 1) | Tour 2 (summoning sickness) |
| Mana Dork (CMC 2) | Tour 3                      |

### Implémentation Technique

1. **Créer `manaProducerSeed.ts`** avec les 30-50 dorks/rocks les plus joués
2. **Modifier `ManaCostRow.tsx`** pour calculer les sources effectives par tour
3. **Ajouter détection Scryfall** : Type "Creature" + oracle contient "Add {"
4. **Nouvelle section UI** : "Mana Acceleration" montrant l'impact

### Exemple de Données

```typescript
const MANA_PRODUCERS = {
  'Llanowar Elves': { type: 'dork', cmc: 1, produces: ['G'], reliability: 0.7 },
  'Birds of Paradise': {
    type: 'dork',
    cmc: 1,
    produces: ['W', 'U', 'B', 'R', 'G'],
    reliability: 0.7,
  },
  'Sol Ring': { type: 'rock', cmc: 1, produces: ['C', 'C'], reliability: 0.9 },
  'Arcane Signet': { type: 'rock', cmc: 2, produces: ['any'], reliability: 0.85 },
}
```

### Phases de Développement

- **Phase 1 (MVP)** : 20-30 dorks/rocks les plus joués, coefficients fixes
- **Phase 2** : Détection automatique via Scryfall API
- **Phase 3** : Coefficients ajustables par format (Commander vs Modern)

### Estimation Effort

- Phase 1 : ~4-6 heures
- Phase 2 : ~2-3 heures
- Phase 3 : ~2 heures

---

## 2. 🌍 Internationalisation FR/EN

**Date**: 26 décembre 2025  
**Priorité**: Basse  
**Complexité**: Moyenne  
**Analyse**: Ultra-thinking par 3 agents spécialisés

### Verdict

| Critère           | Évaluation         |
| ----------------- | ------------------ |
| **Faisable ?**    | ✅ OUI             |
| **Souhaitable ?** | ⚠️ PARTIELLEMENT   |
| **Effort total**  | 5-8 jours (20-30h) |
| **ROI**           | Modéré             |

### Pourquoi priorité BASSE

1. **Public déjà anglophone** - Joueurs compétitifs MTG maîtrisent l'anglais technique
2. **Termes MTG universels** - "Fetchland", "Mana", "CMC" ne se traduisent PAS
3. **Risque de confusion** - UI FR vs noms de cartes EN (API Scryfall)
4. **Maintenance double** - Chaque modif = 2 langues

### Solution technique recommandée

**react-i18next** avec structure :

```
src/i18n/
├── config.ts
├── locales/
│   ├── en/ (common.json, analyzer.json, guide.json)
│   └── fr/ (common.json, analyzer.json, guide.json)
```

### Règles d'or si implémentation

| Traduire           | NE PAS traduire                       |
| ------------------ | ------------------------------------- |
| Boutons d'action   | Termes MTG (mana, deck, land...)      |
| Textes explicatifs | Noms de cartes (API Scryfall)         |
| Messages d'aide    | Types de lands (fetchland, shockland) |
| Titres de pages    | Métriques (CMC, T1, T2, T3)           |

### Option "Quick Wins" (~8h)

| Action                         | Effort |
| ------------------------------ | ------ |
| Sélecteur FR/EN dans footer    | 2h     |
| Traduire HomePage              | 2h     |
| Traduire 10 boutons principaux | 1h     |
| Traduire GuidePage (Karsten)   | 3h     |

### Alternative : Tooltips explicatifs (~4h)

Plutôt que traduction complète :

- Survoler terme technique → explication en FR
- Interface reste en anglais (cohérence MTG)
- Valeur pédagogique sans confusion
- Effort minimal

### Phases si implémentation complète

1. **Phase A - MVP** (8h) : Setup + HomePage + Navigation
2. **Phase B - Core** (12h) : AnalyzerPage + Recommandations
3. **Phase C - Contenu** (10h) : GuidePage + MathematicsPage

### Dépendances npm

```json
{
  "i18next": "^23.x",
  "react-i18next": "^14.x",
  "i18next-http-backend": "^2.x",
  "i18next-browser-languagedetector": "^7.x"
}
```

---

## 3. [Placeholder pour futures idées]

_Ajouter ici les prochaines idées d'amélioration_

---

## Notes

- Ce document sert de backlog pour les améliorations non urgentes
- Les idées peuvent être promues vers une implémentation active si demandé
- Chaque idée doit avoir : problème, solution, estimation d'effort
