import { useMemo } from 'react';
import { ManaCalculator } from '../services/manaCalculator';

// ⚡ HOOK OPTIMISÉ - Performance Boost
export const useManaCalculations = (
  deckSize: number,
  manabase: Record<string, number>,
  cards: Array<{ name: string; manaCost: any; cmc: number; quantity: number }>
) => {
  // 🎯 Memoized Calculator Instance
  const calculator = useMemo(() => new ManaCalculator(), []);
  
  // 🎯 Memoized Deck Analysis
  const deckAnalysis = useMemo(() => {
    if (!cards.length) return null;
    
    const lands = Object.entries(manabase).map(([color, count]) => ({
      name: `${color} Source`,
      produces: [color],
      quantity: count
    }));
    
    return calculator.analyzeDeck({
      cards: cards.filter(card => Object.keys(card.manaCost.symbols || {}).length > 0),
      lands
    });
  }, [calculator, cards, manabase]);
  
  // 🎯 Memoized Probability Cache pour Lightning Fast calculs
  const probabilityCache = useMemo(() => {
    const cache = new Map<string, number>();
    
    // Pre-calculate common scenarios
    const commonTurns = [1, 2, 3, 4, 5];
    const commonSources = [8, 10, 12, 14, 16, 18, 20, 22, 24];
    const commonSymbols = [1, 2, 3];
    
    commonTurns.forEach(turn => {
      commonSources.forEach(sources => {
        commonSymbols.forEach(symbols => {
          const key = `${deckSize}-${sources}-${turn}-${symbols}`;
          try {
            const result = calculator.calculateManaProbability(deckSize, sources, turn, symbols, true);
            cache.set(key, result.probability);
          } catch (e) {
            // Skip invalid combinations
          }
        });
      });
    });
    
    return cache;
  }, [calculator, deckSize]);
  
  // 🎯 Fast Lookup Function
  const getQuickProbability = useMemo(() => {
    return (sources: number, turn: number, symbols: number): number => {
      const key = `${deckSize}-${sources}-${turn}-${symbols}`;
      
      if (probabilityCache.has(key)) {
        return probabilityCache.get(key)!;
      }
      
      // Calculate and cache if not found
      try {
        const result = calculator.calculateManaProbability(deckSize, sources, turn, symbols, true);
        probabilityCache.set(key, result.probability);
        return result.probability;
      } catch (e) {
        return 0;
      }
    };
  }, [calculator, deckSize, probabilityCache]);
  
  // 🎯 Optimized Card Analysis
  const cardAnalysis = useMemo(() => {
    if (!cards.length) return [];
    
    return cards
      .filter(card => card.manaCost?.symbols)
      .map(card => {
        const analysis: Record<string, any> = {};
        
        Object.entries(card.manaCost.symbols).forEach(([color, count]) => {
          const symbolCount = Number(count);
          if (symbolCount > 0 && manabase[color]) {
            const sources = manabase[color] || 0;
            const probability = getQuickProbability(sources, card.cmc, symbolCount);
            
            analysis[color] = {
              probability,
              sources,
              turn: card.cmc,
              symbols: symbolCount,
              meetsThreshold: probability >= 0.90
            };
          }
        });
        
        return {
          card: card.name,
          cmc: card.cmc,
          analysis
        };
      });
  }, [cards, manabase, getQuickProbability]);
  
  // 🎯 Performance Metrics
  const performanceMetrics = useMemo(() => {
    const start = performance.now();
    const sampleCalc = calculator.calculateManaProbability(60, 14, 1, 1, true);
    const calcTime = performance.now() - start;
    
    return {
      cacheSize: probabilityCache.size,
      avgCalculationTime: calcTime,
      totalCards: cards.length,
      analyzedCards: cardAnalysis.length
    };
  }, [calculator, probabilityCache.size, cards.length, cardAnalysis.length]);
  
  return {
    calculator,
    deckAnalysis,
    cardAnalysis,
    getQuickProbability,
    performanceMetrics,
    probabilityCache: probabilityCache.size
  };
};

// 🎯 Hook for Single Card Analysis (Ultra Fast)
export const useQuickCardAnalysis = (
  card: { name: string; manaCost: any; cmc: number },
  sources: Record<string, number>,
  deckSize: number = 60
) => {
  return useMemo(() => {
    const calculator = new ManaCalculator();
    
    if (!card.manaCost?.symbols) return null;
    
    const results: Record<string, any> = {};
    
    Object.entries(card.manaCost.symbols).forEach(([color, count]) => {
      const symbolCount = Number(count);
      if (symbolCount > 0 && sources[color]) {
        const result = calculator.calculateManaProbability(
          deckSize,
          sources[color],
          card.cmc,
          symbolCount,
          true
        );
        
        results[color] = result;
      }
    });
    
    return results;
  }, [card.name, card.manaCost, card.cmc, JSON.stringify(sources), deckSize]);
};

// 🎯 Export for Performance Monitoring
export const PERFORMANCE_CONSTANTS = {
  CACHE_WARM_UP_SIZE: 75, // Pre-calculated scenarios
  TARGET_CALC_TIME: 1,    // Target < 1ms per calculation
  MEMOIZATION_ENABLED: true
} as const; 