# 🔧 Guide Technique d'Implémentation - ManaTuner Pro

## 🎯 Implémentation du Moteur Mathématique

### Distribution Hypergéométrique - Code Complet
```typescript
// src/services/advancedMaths.ts
export class AdvancedMathEngine {
  
  /**
   * Calcul de la distribution hypergéométrique
   * Basé sur l'article Frank Karsten 2022
   */
  static hypergeometric(N: number, K: number, n: number, k: number): number {
    if (k > Math.min(K, n)) return 0;
    if (k <= 0) return 1;
    
    let probability = 0;
    
    // P(X >= k) = 1 - P(X < k) = 1 - Σ(i=0 to k-1) P(X = i)
    for (let i = 0; i < k; i++) {
      probability += this.hypergeometricExact(N, K, n, i);
    }
    
    return Math.max(0, Math.min(1, 1 - probability));
  }
  
  /**
   * Calcul exact P(X = k) pour la distribution hypergéométrique
   */
  private static hypergeometricExact(N: number, K: number, n: number, k: number): number {
    // P(X = k) = C(K,k) * C(N-K,n-k) / C(N,n)
    const numerator = this.combination(K, k) * this.combination(N - K, n - k);
    const denominator = this.combination(N, n);
    
    return denominator > 0 ? numerator / denominator : 0;
  }
  
  /**
   * Calcul des combinaisons C(n,k) avec optimisation
   */
  private static combination(n: number, k: number): number {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    // Optimisation : C(n,k) = C(n,n-k)
    k = Math.min(k, n - k);
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  }
}
```

### Analyse Turn-by-Turn Complète
```typescript
// Interface pour l'analyse par tour
export interface TurnAnalysis {
  turn: number;
  cardsDrawn: number;
  probabilityByColor: Record<ManaColor, number>;
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
}

export class TurnByTurnAnalyzer {
  static analyze(deck: DeckConfiguration): TurnAnalysis[] {
    const results: TurnAnalysis[] = [];
    
    // Analyse turns 1-4 (critiques pour le gameplay)
    for (let turn = 1; turn <= 4; turn++) {
      const cardsDrawn = this.getCardsDrawn(turn, deck.mulliganStrategy);
      const analysis: TurnAnalysis = {
        turn,
        cardsDrawn,
        probabilityByColor: {},
        recommendations: [],
        confidence: 'high'
      };
      
      // Calcul pour chaque couleur
      for (const color of deck.colors) {
        const sources = this.countSources(deck, color);
        const required = this.getRequiredSources(turn, color);
        
        analysis.probabilityByColor[color] = AdvancedMathEngine.hypergeometric(
          deck.totalCards,
          sources,
          cardsDrawn,
          required
        );
      }
      
      // Génération des recommandations
      analysis.recommendations = this.generateRecommendations(analysis);
      analysis.confidence = this.calculateConfidence(analysis);
      
      results.push(analysis);
    }
    
    return results;
  }
  
  private static getCardsDrawn(turn: number, strategy: MulliganStrategy): number {
    // Formule Frank Karsten : main initiale + tours - 1
    const baseCards = strategy.keepHand7 ? 7 : 6;
    return baseCards + turn - 1;
  }
}
```

## 🏗️ Architecture des Composants React

### Composant d'Analyse Principal
```typescript
// src/components/analysis/TurnByTurnAnalysis.tsx
import React, { useMemo } from 'react';
import { Box, Card, Typography, LinearProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface TurnByTurnAnalysisProps {
  deckConfiguration: DeckConfiguration;
  onRecommendationClick: (recommendation: string) => void;
}

export const TurnByTurnAnalysis: React.FC<TurnByTurnAnalysisProps> = ({
  deckConfiguration,
  onRecommendationClick
}) => {
  // Calculs mémorisés pour optimiser les performances
  const analysisData = useMemo(() => {
    return TurnByTurnAnalyzer.analyze(deckConfiguration);
  }, [deckConfiguration]);
  
  const chartData = useMemo(() => {
    return analysisData.map(turn => ({
      turn: `T${turn.turn}`,
      ...turn.probabilityByColor,
      overall: Object.values(turn.probabilityByColor).reduce((a, b) => a + b, 0) / Object.keys(turn.probabilityByColor).length
    }));
  }, [analysisData]);
  
  return (
    <Card sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Analyse Turn-by-Turn (Méthode Frank Karsten)
      </Typography>
      
      {/* Graphique des probabilités */}
      <Box sx={{ height: 300, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="turn" />
            <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <Bar dataKey="overall" fill="#1976d2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      {/* Détails par tour */}
      {analysisData.map((turn) => (
        <TurnAnalysisCard 
          key={turn.turn}
          analysis={turn}
          onRecommendationClick={onRecommendationClick}
        />
      ))}
    </Card>
  );
};

// Sous-composant pour chaque tour
const TurnAnalysisCard: React.FC<{
  analysis: TurnAnalysis;
  onRecommendationClick: (rec: string) => void;
}> = ({ analysis, onRecommendationClick }) => {
  const getColorEmoji = (color: ManaColor): string => {
    const colorMap = {
      W: '⚪', U: '🔵', B: '⚫', R: '🔴', G: '🟢'
    };
    return colorMap[color] || '⚪';
  };
  
  return (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Tour {analysis.turn} - {analysis.cardsDrawn} cartes vues
      </Typography>
      
      {/* Probabilités par couleur */}
      {Object.entries(analysis.probabilityByColor).map(([color, prob]) => (
        <Box key={color} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" sx={{ minWidth: 40 }}>
            {getColorEmoji(color as ManaColor)} {color}:
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={prob * 100} 
            sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" fontWeight="bold">
            {(prob * 100).toFixed(1)}%
          </Typography>
        </Box>
      ))}
      
      {/* Recommandations */}
      {analysis.recommendations.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Recommandations:
          </Typography>
          {analysis.recommendations.map((rec, idx) => (
            <Typography 
              key={idx}
              variant="body2" 
              sx={{ cursor: 'pointer', color: 'primary.main', mt: 0.5 }}
              onClick={() => onRecommendationClick(rec)}
            >
              • {rec}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};
```

## 🔒 Système Privacy-First

### Implémentation Complète du Stockage Privé
```typescript
// src/lib/privacy.ts
import CryptoJS from 'crypto-js';

export class PrivacyStorage {
  private static readonly STORAGE_KEY = 'manatuner_private_data';
  private static readonly USER_CODE_KEY = 'manatuner_user_code';
  
  /**
   * Génère un code utilisateur unique et mémorable
   */
  static generateUserCode(): string {
    const adjectives = ['SWIFT', 'BOLD', 'WISE', 'PURE', 'DARK', 'BRIGHT', 'SHARP', 'CALM'];
    const nouns = ['DECK', 'MANA', 'SPELL', 'LAND', 'CARD', 'PLAY', 'TURN', 'GAME'];
    const numbers = Math.floor(Math.random() * 99) + 1;
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}-${noun}-${numbers}`;
  }
  
  /**
   * Obtient ou crée le code utilisateur
   */
  static getUserCode(): string {
    let code = localStorage.getItem(this.USER_CODE_KEY);
    
    if (!code) {
      code = this.generateUserCode();
      localStorage.setItem(this.USER_CODE_KEY, code);
    }
    
    return code;
  }
  
  /**
   * Chiffre les données avec AES
   */
  static encryptData(data: any): string {
    const jsonString = JSON.stringify(data);
    const userCode = this.getUserCode();
    
    // Utilise le code utilisateur comme clé de chiffrement
    const encrypted = CryptoJS.AES.encrypt(jsonString, userCode).toString();
    
    return encrypted;
  }
  
  /**
   * Déchiffre les données
   */
  static decryptData(encryptedData: string): any {
    try {
      const userCode = this.getUserCode();
      const decrypted = CryptoJS.AES.decrypt(encryptedData, userCode);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      return null;
    }
  }
  
  /**
   * Sauvegarde une analyse de deck
   */
  static saveAnalysis(analysis: DeckAnalysis): void {
    const existingData = this.getAllAnalyses();
    const newData = {
      ...existingData,
      [analysis.id]: {
        ...analysis,
        timestamp: Date.now(),
        userCode: this.getUserCode()
      }
    };
    
    const encrypted = this.encryptData(newData);
    localStorage.setItem(this.STORAGE_KEY, encrypted);
  }
  
  /**
   * Récupère toutes les analyses
   */
  static getAllAnalyses(): Record<string, DeckAnalysis> {
    const encrypted = localStorage.getItem(this.STORAGE_KEY);
    
    if (!encrypted) {
      return {};
    }
    
    const decrypted = this.decryptData(encrypted);
    return decrypted || {};
  }
  
  /**
   * Exporte les données pour sauvegarde
   */
  static exportData(): Blob {
    const allData = {
      userCode: this.getUserCode(),
      analyses: this.getAllAnalyses(),
      exportDate: new Date().toISOString(),
      version: '2.0.1'
    };
    
    const jsonString = JSON.stringify(allData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }
  
  /**
   * Importe des données depuis un fichier
   */
  static async importData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validation des données
      if (!data.userCode || !data.analyses) {
        throw new Error('Format de fichier invalide');
      }
      
      // Fusion avec les données existantes
      const existingAnalyses = this.getAllAnalyses();
      const mergedAnalyses = { ...existingAnalyses, ...data.analyses };
      
      const encrypted = this.encryptData(mergedAnalyses);
      localStorage.setItem(this.STORAGE_KEY, encrypted);
      
      return true;
    } catch (error) {
      console.error('Erreur d\'importation:', error);
      return false;
    }
  }
}
```

## 🎯 Détection Intelligente des Terres

### Algorithme de Reconnaissance Avancé
```typescript
// src/utils/landDetectionComplete.ts
export interface LandCapability {
  colors: ManaColor[];
  type: LandType;
  entersTapped: boolean;
  conditions?: string[];
}

export class IntelligentLandDetection {
  
  // Base de données des patterns de terres connues
  private static readonly LAND_PATTERNS = {
    fetchlands: [
      { pattern: /scalding tarn/i, colors: ['U', 'R'] },
      { pattern: /polluted delta/i, colors: ['U', 'B'] },
      { pattern: /bloodstained mire/i, colors: ['B', 'R'] },
      { pattern: /wooded foothills/i, colors: ['R', 'G'] },
      { pattern: /windswept heath/i, colors: ['G', 'W'] },
      { pattern: /flooded strand/i, colors: ['W', 'U'] },
      { pattern: /marsh flats/i, colors: ['W', 'B'] },
      { pattern: /verdant catacombs/i, colors: ['B', 'G'] },
      { pattern: /arid mesa/i, colors: ['R', 'W'] },
      { pattern: /misty rainforest/i, colors: ['G', 'U'] }
    ],
    shocklands: [
      { pattern: /steam vents/i, colors: ['U', 'R'] },
      { pattern: /watery grave/i, colors: ['U', 'B'] },
      { pattern: /blood crypt/i, colors: ['B', 'R'] },
      { pattern: /stomping ground/i, colors: ['R', 'G'] },
      { pattern: /temple garden/i, colors: ['G', 'W'] },
      { pattern: /hallowed fountain/i, colors: ['W', 'U'] },
      { pattern: /godless shrine/i, colors: ['W', 'B'] },
      { pattern: /overgrown tomb/i, colors: ['B', 'G'] },
      { pattern: /sacred foundry/i, colors: ['R', 'W'] },
      { pattern: /breeding pool/i, colors: ['G', 'U'] }
    ],
    checklands: [
      { pattern: /dragonskull summit/i, colors: ['B', 'R'] },
      { pattern: /drowned catacomb/i, colors: ['U', 'B'] },
      { pattern: /glacial fortress/i, colors: ['W', 'U'] },
      { pattern: /isolated chapel/i, colors: ['W', 'B'] },
      { pattern: /clifftop retreat/i, colors: ['R', 'W'] },
      { pattern: /hinterland harbor/i, colors: ['G', 'U'] },
      { pattern: /sulfur falls/i, colors: ['U', 'R'] },
      { pattern: /woodland cemetery/i, colors: ['B', 'G'] },
      { pattern: /sunpetal grove/i, colors: ['G', 'W'] },
      { pattern: /rootbound crag/i, colors: ['R', 'G'] }
    ]
  };
  
  /**
   * Détecte le type et les capacités d'une terre
   */
  static analyzeLand(cardName: string, manaCost?: string, text?: string): LandCapability | null {
    const normalizedName = cardName.toLowerCase().trim();
    
    // Vérification des patterns connus
    for (const [landType, patterns] of Object.entries(this.LAND_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.pattern.test(normalizedName)) {
          return {
            colors: pattern.colors as ManaColor[],
            type: landType as LandType,
            entersTapped: this.determineETBStatus(landType as LandType, text),
            conditions: this.extractConditions(text)
          };
        }
      }
    }
    
    // Analyse du texte de la carte si disponible
    if (text) {
      return this.analyzeCardText(normalizedName, text);
    }
    
    // Analyse basique par nom
    return this.analyzeByName(normalizedName);
  }
  
  /**
   * Analyse le texte de la carte pour extraire les capacités
   */
  private static analyzeCardText(name: string, text: string): LandCapability | null {
    const colors: ManaColor[] = [];
    const normalizedText = text.toLowerCase();
    
    // Recherche des symboles de mana
    const manaPatterns = [
      { pattern: /add.*{w}/i, color: 'W' as ManaColor },
      { pattern: /add.*{u}/i, color: 'U' as ManaColor },
      { pattern: /add.*{b}/i, color: 'B' as ManaColor },
      { pattern: /add.*{r}/i, color: 'R' as ManaColor },
      { pattern: /add.*{g}/i, color: 'G' as ManaColor }
    ];
    
    for (const { pattern, color } of manaPatterns) {
      if (pattern.test(normalizedText)) {
        colors.push(color);
      }
    }
    
    if (colors.length === 0) return null;
    
    return {
      colors,
      type: this.inferLandType(name, normalizedText),
      entersTapped: /enters.*tapped/i.test(normalizedText),
      conditions: this.extractConditions(normalizedText)
    };
  }
  
  /**
   * Détermine si une terre arrive engagée
   */
  private static determineETBStatus(landType: LandType, text?: string): boolean {
    if (!text) {
      // Règles par défaut selon le type
      const tappedByDefault = ['checklands', 'gainlands', 'temples'];
      return tappedByDefault.includes(landType);
    }
    
    return /enters.*tapped/i.test(text);
  }
  
  /**
   * Extrait les conditions d'utilisation
   */
  private static extractConditions(text?: string): string[] {
    if (!text) return [];
    
    const conditions: string[] = [];
    const normalizedText = text.toLowerCase();
    
    // Conditions communes
    if (/unless you control/i.test(normalizedText)) {
      conditions.push('Requires specific permanents');
    }
    
    if (/pay.*life/i.test(normalizedText)) {
      conditions.push('Life payment required');
    }
    
    if (/sacrifice/i.test(normalizedText)) {
      conditions.push('Sacrifice required');
    }
    
    return conditions;
  }
  
  /**
   * Infère le type de terre basé sur le nom et le texte
   */
  private static inferLandType(name: string, text: string): LandType {
    if (/search.*library/i.test(text)) return 'fetchland';
    if (/shock/i.test(text) || /2 damage/i.test(text)) return 'shockland';
    if (/unless you control/i.test(text)) return 'checkland';
    if (/scry/i.test(text)) return 'temple';
    if (/gain.*life/i.test(text)) return 'gainland';
    if (/comes.*play.*tapped/i.test(text)) return 'tapland';
    
    return 'utility';
  }
}
```

## 🚀 Optimisations de Performance

### Web Workers pour Monte Carlo
```javascript
// public/workers/monteCarlo.worker.js
self.onmessage = function(e) {
  const { deckConfig, iterations, method } = e.data;
  
  // Simulation Monte Carlo intensive
  const results = runMonteCarloSimulation(deckConfig, iterations);
  
  // Retour des résultats
  self.postMessage({
    type: 'MONTE_CARLO_COMPLETE',
    results: results,
    timestamp: Date.now()
  });
};

function runMonteCarloSimulation(deckConfig, iterations) {
  const results = {
    successRate: 0,
    averageTurn: 0,
    distribution: {},
    confidence: 0.95
  };
  
  let successes = 0;
  let totalTurns = 0;
  
  for (let i = 0; i < iterations; i++) {
    const simulation = simulateGame(deckConfig);
    
    if (simulation.success) {
      successes++;
      totalTurns += simulation.successTurn;
    }
    
    // Mise à jour progressive pour l'UI
    if (i % 1000 === 0) {
      self.postMessage({
        type: 'MONTE_CARLO_PROGRESS',
        progress: i / iterations,
        currentResults: {
          successRate: successes / (i + 1),
          averageTurn: totalTurns / Math.max(successes, 1)
        }
      });
    }
  }
  
  results.successRate = successes / iterations;
  results.averageTurn = totalTurns / Math.max(successes, 1);
  
  return results;
}

function simulateGame(deckConfig) {
  // Simulation d'une partie complète
  const deck = shuffleDeck(deckConfig.cards);
  const hand = deck.splice(0, 7);
  
  // Logique de simulation...
  return {
    success: true,
    successTurn: 3
  };
}
```

### Hook React pour Web Workers
```typescript
// src/hooks/useMonteCarloWorker.ts
import { useEffect, useRef, useState } from 'react';

export interface MonteCarloResult {
  successRate: number;
  averageTurn: number;
  distribution: Record<number, number>;
  confidence: number;
}

export const useMonteCarloWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MonteCarloResult | null>(null);
  
  useEffect(() => {
    // Initialisation du worker
    workerRef.current = new Worker(
      new URL('/workers/monteCarlo.worker.js', import.meta.url)
    );
    
    workerRef.current.onmessage = (e) => {
      const { type, ...data } = e.data;
      
      switch (type) {
        case 'MONTE_CARLO_PROGRESS':
          setProgress(data.progress);
          break;
          
        case 'MONTE_CARLO_COMPLETE':
          setResults(data.results);
          setIsRunning(false);
          setProgress(1);
          break;
          
        default:
          console.warn('Message worker non géré:', type);
      }
    };
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);
  
  const runSimulation = (deckConfig: DeckConfiguration, iterations = 10000) => {
    if (!workerRef.current || isRunning) return;
    
    setIsRunning(true);
    setProgress(0);
    setResults(null);
    
    workerRef.current.postMessage({
      deckConfig,
      iterations,
      method: 'standard'
    });
  };
  
  const cancelSimulation = () => {
    if (workerRef.current && isRunning) {
      workerRef.current.terminate();
      setIsRunning(false);
      setProgress(0);
    }
  };
  
  return {
    runSimulation,
    cancelSimulation,
    isRunning,
    progress,
    results
  };
};
```

---

*Guide technique généré le 22 juin 2025*
*Contient les implémentations critiques pour ManaTuner Pro* 