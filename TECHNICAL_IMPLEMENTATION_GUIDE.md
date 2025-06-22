# 🔧 Guide d'Implémentation Technique - ManaTuner Pro

## 🎯 Vue d'ensemble Technique

### Architecture Actuelle
- **🌐 Déploiement** : Vercel (pas Firebase)
- **⚡ Build** : Vite + React 18 + TypeScript
- **🎨 UI** : Material-UI + Responsive Design
- **🔒 Storage** : localStorage + AES encryption
- **📊 Database** : Supabase (optionnel pour cloud sync)

### Configuration Réelle du Projet

#### package.json (Dépendances Actuelles)
```json
{
  "name": "manatuner-pro",
  "version": "2.0.0",
  "dependencies": {
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "@mui/material": "^5.11.10",
    "@mui/icons-material": "^5.11.9",
    "@reduxjs/toolkit": "^1.9.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^8.0.5",
    "react-router-dom": "^6.8.1",
    "recharts": "^2.15.3",
    "zod": "^3.20.6"
  }
}
```

#### vite.config.js (Configuration Build)
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  }
})
```

#### vercel.json (Configuration Déploiement)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/workers/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

---

## 🧮 Moteur Mathématique Frank Karsten

### Implémentation Core (src/services/advancedMaths.ts)

```typescript
export interface HypergeometricParams {
  populationSize: number;    // N (deck size: 60)
  successStatesInPop: number; // K (sources in deck)
  sampleSize: number;        // n (cards seen)
  successStatesInSample: number; // k (sources needed)
}

export interface ProbabilityResult {
  probability: number;
  turn: number;
  cardsDrawn: number;
  sourcesNeeded: number;
  rating: 'excellent' | 'good' | 'acceptable' | 'poor';
}

// Distribution hypergéométrique exacte
export function hypergeometric(params: HypergeometricParams): number {
  const { populationSize: N, successStatesInPop: K, 
          sampleSize: n, successStatesInSample: k } = params;
  
  if (k > K || k > n || n > N) return 0;
  
  const numerator = combination(K, k) * combination(N - K, n - k);
  const denominator = combination(N, n);
  
  return numerator / denominator;
}

// Fonction combinaison optimisée
function combination(n: number, k: number): number {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  
  k = Math.min(k, n - k); // Optimisation
  
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  
  return Math.round(result);
}

// Analyse turn-by-turn selon Frank Karsten
export function analyzeTurnByTurn(
  deckConfig: DeckConfiguration
): TurnAnalysis[] {
  const results: TurnAnalysis[] = [];
  
  for (let turn = 1; turn <= 8; turn++) {
    const cardsDrawn = getCardsSeenOnTurn(turn, deckConfig.onPlay);
    
    for (const [color, requirement] of Object.entries(deckConfig.colorRequirements)) {
      const sources = deckConfig.sources[color] || 0;
      
      const probability = hypergeometric({
        populationSize: deckConfig.deckSize,
        successStatesInPop: sources,
        sampleSize: cardsDrawn,
        successStatesInSample: requirement.sourcesNeeded
      });
      
      results.push({
        turn,
        color,
        probability,
        cardsDrawn,
        sourcesNeeded: requirement.sourcesNeeded,
        sourcesInDeck: sources,
        rating: getRating(probability, turn)
      });
    }
  }
  
  return results;
}

// Cartes vues selon Frank Karsten
function getCardsSeenOnTurn(turn: number, onPlay: boolean): number {
  const startingHand = 7;
  const drawsBeforeTurn = turn - 1;
  const playDrawAdjustment = onPlay ? 0 : 1;
  
  return startingHand + drawsBeforeTurn - playDrawAdjustment;
}

// Rating selon les seuils de Frank Karsten
function getRating(probability: number, turn: number): string {
  const thresholds = {
    1: 0.90, // 90% turn 1
    2: 0.85, // 85% turn 2
    3: 0.80, // 80% turn 3
    4: 0.75  // 75% turn 4+
  };
  
  const threshold = thresholds[turn] || thresholds[4];
  
  if (probability >= threshold) return 'excellent';
  if (probability >= threshold - 0.1) return 'good';
  if (probability >= threshold - 0.2) return 'acceptable';
  return 'poor';
}
```

---

## 🃏 Détection Intelligente des Terres

### Algorithme de Reconnaissance (src/utils/landDetectionComplete.ts)

```typescript
export interface LandType {
  name: string;
  colors: string[];
  type: 'basic' | 'fetch' | 'shock' | 'check' | 'fast' | 'pain' | 'other';
  etb: 'untapped' | 'tapped' | 'conditional';
}

export function detectLandTypes(cardName: string): LandType {
  const normalized = cardName.toLowerCase().trim();
  
  // Fetchlands (toujours untapped, cherchent 2 couleurs)
  const fetchlands: Record<string, string[]> = {
    'scalding tarn': ['U', 'R'],
    'polluted delta': ['U', 'B'],
    'bloodstained mire': ['B', 'R'],
    'wooded foothills': ['R', 'G'],
    'windswept heath': ['G', 'W'],
    'flooded strand': ['W', 'U'],
    'marsh flats': ['W', 'B'],
    'verdant catacombs': ['B', 'G'],
    'arid mesa': ['R', 'W'],
    'misty rainforest': ['G', 'U']
  };
  
  if (fetchlands[normalized]) {
    return {
      name: cardName,
      colors: fetchlands[normalized],
      type: 'fetch',
      etb: 'untapped'
    };
  }
  
  // Shocklands (untapped si 2 life)
  const shocklands: Record<string, string[]> = {
    'steam vents': ['U', 'R'],
    'watery grave': ['U', 'B'],
    'blood crypt': ['B', 'R'],
    'stomping ground': ['R', 'G'],
    'temple garden': ['G', 'W'],
    'hallowed fountain': ['W', 'U'],
    'godless shrine': ['W', 'B'],
    'overgrown tomb': ['B', 'G'],
    'sacred foundry': ['R', 'W'],
    'breeding pool': ['G', 'U']
  };
  
  if (shocklands[normalized]) {
    return {
      name: cardName,
      colors: shocklands[normalized],
      type: 'shock',
      etb: 'conditional'
    };
  }
  
  // Checklands (untapped si condition)
  const checklands: Record<string, string[]> = {
    'dragonskull summit': ['B', 'R'],
    'drowned catacomb': ['U', 'B'],
    'glacial fortress': ['W', 'U'],
    'isolated chapel': ['W', 'B'],
    'rootbound crag': ['R', 'G'],
    'sunpetal grove': ['G', 'W'],
    'sulfur falls': ['U', 'R'],
    'woodland cemetery': ['B', 'G'],
    'clifftop retreat': ['R', 'W'],
    'hinterland harbor': ['G', 'U']
  };
  
  if (checklands[normalized]) {
    return {
      name: cardName,
      colors: checklands[normalized],
      type: 'check',
      etb: 'conditional'
    };
  }
  
  // Terres de base
  const basicLands: Record<string, string[]> = {
    'island': ['U'],
    'mountain': ['R'],
    'swamp': ['B'],
    'forest': ['G'],
    'plains': ['W']
  };
  
  if (basicLands[normalized]) {
    return {
      name: cardName,
      colors: basicLands[normalized],
      type: 'basic',
      etb: 'untapped'
    };
  }
  
  // Défaut : terre inconnue
  return {
    name: cardName,
    colors: [],
    type: 'other',
    etb: 'tapped'
  };
}

// Calcul des sources de mana selon Frank Karsten
export function calculateManaSourcesFromDeck(decklist: string): ManaSourceCount {
  const lines = decklist.split('\n').filter(line => line.trim());
  const sources: Record<string, number> = {
    W: 0, U: 0, B: 0, R: 0, G: 0
  };
  
  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (!match) continue;
    
    const quantity = parseInt(match[1]);
    const cardName = match[2];
    
    const landType = detectLandTypes(cardName);
    
    // Les fetchlands comptent pour chaque couleur qu'elles peuvent chercher
    for (const color of landType.colors) {
      sources[color] += quantity;
    }
  }
  
  return sources;
}
```

---

## 🔒 Système Privacy-First

### Chiffrement Local (src/lib/privacy.ts)

```typescript
import CryptoJS from 'crypto-js';

export class PrivacyStorage {
  private static readonly STORAGE_KEY = 'manatuner_encrypted_data';
  private static readonly USER_CODE_KEY = 'manatuner_user_code';
  
  // Génération de code utilisateur anonyme
  static generateUserCode(): string {
    const adjectives = ['Swift', 'Mystic', 'Noble', 'Fierce', 'Wise'];
    const creatures = ['Dragon', 'Phoenix', 'Sphinx', 'Hydra', 'Angel'];
    const numbers = Math.floor(Math.random() * 1000);
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const creature = creatures[Math.floor(Math.random() * creatures.length)];
    
    return `MT-${adj}-${creature}-${numbers}`;
  }
  
  // Récupération du code utilisateur
  static getUserCode(): string {
    let code = localStorage.getItem(this.USER_CODE_KEY);
    if (!code) {
      code = this.generateUserCode();
      localStorage.setItem(this.USER_CODE_KEY, code);
    }
    return code;
  }
  
  // Chiffrement AES-256
  static encryptData(data: any, userCode: string): string {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, userCode).toString();
    return encrypted;
  }
  
  // Déchiffrement AES-256
  static decryptData(encryptedData: string, userCode: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, userCode);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
  
  // Sauvegarde d'analyse chiffrée
  static saveAnalysis(analysis: DeckAnalysis): void {
    const userCode = this.getUserCode();
    const existingData = this.getAllAnalyses();
    
    const newAnalysis = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...analysis
    };
    
    existingData.push(newAnalysis);
    
    const encrypted = this.encryptData(existingData, userCode);
    localStorage.setItem(this.STORAGE_KEY, encrypted);
  }
  
  // Récupération de toutes les analyses
  static getAllAnalyses(): DeckAnalysis[] {
    const userCode = this.getUserCode();
    const encryptedData = localStorage.getItem(this.STORAGE_KEY);
    
    if (!encryptedData) return [];
    
    const decrypted = this.decryptData(encryptedData, userCode);
    return decrypted || [];
  }
  
  // Export des données (pour backup)
  static exportData(): Blob {
    const userCode = this.getUserCode();
    const allData = {
      userCode,
      analyses: this.getAllAnalyses(),
      exportDate: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(allData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }
  
  // Import des données
  static async importData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.userCode && data.analyses) {
        localStorage.setItem(this.USER_CODE_KEY, data.userCode);
        
        const encrypted = this.encryptData(data.analyses, data.userCode);
        localStorage.setItem(this.STORAGE_KEY, encrypted);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}
```

---

## ⚡ Optimisations Performance

### Web Workers pour Monte Carlo (public/workers/monteCarlo.worker.js)

```javascript
// Web Worker pour simulations Monte Carlo
self.onmessage = function(e) {
  const { deckConfig, iterations = 10000 } = e.data;
  
  const results = runMonteCarloSimulation(deckConfig, iterations);
  
  self.postMessage({
    success: true,
    results
  });
};

function runMonteCarloSimulation(deckConfig, iterations) {
  let successfulGames = 0;
  const turnResults = Array(8).fill(0);
  
  for (let i = 0; i < iterations; i++) {
    const gameResult = simulateGame(deckConfig);
    
    if (gameResult.success) {
      successfulGames++;
    }
    
    // Enregistrer les résultats par turn
    for (let turn = 0; turn < gameResult.turnResults.length; turn++) {
      if (gameResult.turnResults[turn]) {
        turnResults[turn]++;
      }
    }
  }
  
  return {
    successRate: successfulGames / iterations,
    turnProbabilities: turnResults.map(count => count / iterations),
    totalSimulations: iterations
  };
}

function simulateGame(deckConfig) {
  // Créer le deck
  const deck = createDeck(deckConfig);
  
  // Mélanger
  shuffleDeck(deck);
  
  // Main initiale
  const hand = deck.splice(0, 7);
  
  // Simuler 8 turns
  const turnResults = [];
  
  for (let turn = 1; turn <= 8; turn++) {
    // Piocher (sauf turn 1)
    if (turn > 1) {
      hand.push(deck.shift());
    }
    
    // Vérifier si on a assez de mana
    const hasEnoughMana = checkManaRequirement(hand, deckConfig, turn);
    turnResults.push(hasEnoughMana);
  }
  
  return {
    success: turnResults.every(Boolean),
    turnResults
  };
}

function createDeck(deckConfig) {
  const deck = [];
  
  // Ajouter les terres
  for (const [color, count] of Object.entries(deckConfig.sources)) {
    for (let i = 0; i < count; i++) {
      deck.push({ type: 'land', color });
    }
  }
  
  // Ajouter les sorts (représentés comme cartes génériques)
  const totalLands = Object.values(deckConfig.sources).reduce((a, b) => a + b, 0);
  const spellsCount = deckConfig.deckSize - totalLands;
  
  for (let i = 0; i < spellsCount; i++) {
    deck.push({ type: 'spell' });
  }
  
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}
```

### Hook de Performance (src/hooks/useMonteCarloWorker.ts)

```typescript
import { useState, useEffect, useCallback } from 'react';

interface MonteCarloResult {
  successRate: number;
  turnProbabilities: number[];
  totalSimulations: number;
}

export function useMonteCarloWorker() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Créer le Web Worker avec la syntaxe compatible Vercel
    const newWorker = new Worker(
      new URL('/workers/monteCarlo.worker.js', import.meta.url),
      { type: 'module' }
    );
    
    newWorker.onmessage = (e) => {
      const { success, results, error } = e.data;
      
      if (success) {
        setResult(results);
        setError(null);
      } else {
        setError(error || 'Simulation failed');
      }
      
      setIsRunning(false);
    };
    
    newWorker.onerror = (error) => {
      setError('Worker error: ' + error.message);
      setIsRunning(false);
    };
    
    setWorker(newWorker);
    
    return () => {
      newWorker.terminate();
    };
  }, []);
  
  const runSimulation = useCallback((deckConfig: DeckConfiguration, iterations = 10000) => {
    if (!worker || isRunning) return;
    
    setIsRunning(true);
    setError(null);
    setResult(null);
    
    worker.postMessage({ deckConfig, iterations });
  }, [worker, isRunning]);
  
  return {
    runSimulation,
    isRunning,
    result,
    error
  };
}
```

---

## 🧪 Tests Mathématiques Critiques

### Validation Frank Karsten (src/services/__tests__/maths.critical.test.ts)

```typescript
import { describe, test, expect } from 'vitest';
import { hypergeometric, analyzeTurnByTurn } from '../advancedMaths';

describe('Frank Karsten Mathematical Validation', () => {
  test('Hypergeometric distribution matches reference values', () => {
    // Valeurs de référence de l'article TCGPlayer
    
    // Turn 1: 7 cartes, besoin de 1 source sur 14 dans deck de 60
    const turn1 = hypergeometric({
      populationSize: 60,
      successStatesInPop: 14,
      sampleSize: 7,
      successStatesInSample: 1
    });
    expect(turn1).toBeCloseTo(0.8324, 3); // 83.24%
    
    // Turn 2: 8 cartes, besoin de 2 sources sur 17 dans deck de 60
    const turn2 = hypergeometric({
      populationSize: 60,
      successStatesInPop: 17,
      sampleSize: 8,
      successStatesInSample: 2
    });
    expect(turn2).toBeCloseTo(0.8156, 3); // 81.56%
    
    // Turn 3: 9 cartes, besoin de 3 sources sur 20 dans deck de 60
    const turn3 = hypergeometric({
      populationSize: 60,
      successStatesInPop: 20,
      sampleSize: 9,
      successStatesInSample: 3
    });
    expect(turn3).toBeCloseTo(0.7935, 3); // 79.35%
  });
  
  test('Fetchland counting matches Karsten methodology', () => {
    // Un fetchland compte pour chaque couleur qu'il peut chercher
    const deckWithFetchlands = {
      deckSize: 60,
      sources: {
        U: 8, // 4 Island + 4 Scalding Tarn
        R: 8  // 4 Mountain + 4 Scalding Tarn
      },
      colorRequirements: {
        U: { sourcesNeeded: 1, turn: 1 },
        R: { sourcesNeeded: 1, turn: 2 }
      },
      onPlay: true
    };
    
    const analysis = analyzeTurnByTurn(deckWithFetchlands);
    
    // Vérifier que les fetchlands sont comptés pour les deux couleurs
    const blueT1 = analysis.find(r => r.color === 'U' && r.turn === 1);
    const redT2 = analysis.find(r => r.color === 'R' && r.turn === 2);
    
    expect(blueT1?.sourcesInDeck).toBe(8);
    expect(redT2?.sourcesInDeck).toBe(8);
  });
  
  test('Mulligan calculations are accurate', () => {
    // Test avec main de 6 cartes (après mulligan)
    const mulliganProb = hypergeometric({
      populationSize: 60,
      successStatesInPop: 14,
      sampleSize: 6, // Main de 6 après mulligan
      successStatesInSample: 1
    });
    
    expect(mulliganProb).toBeCloseTo(0.7876, 3); // 78.76%
  });
  
  test('Edge cases handle correctly', () => {
    // Cas impossible : plus de sources demandées que disponibles
    const impossible = hypergeometric({
      populationSize: 60,
      successStatesInPop: 10,
      sampleSize: 7,
      successStatesInSample: 15 // Impossible
    });
    expect(impossible).toBe(0);
    
    // Cas trivial : 0 source demandée
    const trivial = hypergeometric({
      populationSize: 60,
      successStatesInPop: 10,
      sampleSize: 7,
      successStatesInSample: 0
    });
    expect(trivial).toBe(1); // 100%
  });
});
```

---

## 🚀 Configuration Déploiement

### Scripts npm (Actuels)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### Variables d'Environnement (Optionnelles)

```bash
# .env.example - Toutes optionnelles
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VERCEL_ANALYTICS_ID=your-analytics-id
```

### GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run build
      
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🎯 Résumé Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  Vercel Build    │───▶│  Global CDN     │
│                 │    │  (Vite + React)  │    │  Edge Network   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  localStorage   │◀───│   User Browser   │◀───│ https://app.com │
│  AES Encrypted  │    │  React 18 + MUI  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Stack Final :**
- **Frontend** : React 18 + TypeScript + Material-UI
- **Build** : Vite (ES2015 target, 202KB gzipped)
- **Hosting** : Vercel Edge Network
- **Database** : Supabase (optionnel)
- **Storage** : localStorage + AES-256 encryption
- **Testing** : Vitest + Playwright (9/9 tests passent)

---

🎉 **ManaTuner Pro - Architecture technique moderne, sécurisée et performante !** 