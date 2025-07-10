import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ManaCalculator } from '../services/manaCalculator';
import type { DeckAnalysis } from '../types';

interface UseManaCalculationsProps {
  deckList: string;
  enabled?: boolean;
}

interface UseManaCalculationsReturn {
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Create a stable hash for the deck list to use as cache key
const createDeckHash = (deckList: string): string => {
  // Normalize the deck list by sorting and trimming
  const normalized = deckList
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .sort()
    .join('\n');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export const useManaCalculations = ({ 
  deckList, 
  enabled = true 
}: UseManaCalculationsProps): UseManaCalculationsReturn => {
  // Memoize the deck hash to avoid recalculation
  const deckHash = useMemo(() => createDeckHash(deckList), [deckList]);
  
  const {
    data: analysisResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['manaCalculations', deckHash],
    queryFn: async (): Promise<AnalysisResult> => {
      if (!deckList.trim()) {
        throw new Error('Empty deck list');
      }

      try {
        // Use the ManaCalculator service
        const calculator = new ManaCalculator();
        const result = await calculator.analyzeDeck(deckList);
        
        if (!result) {
          throw new Error('Failed to analyze deck');
        }
        
        return result;
      } catch (error) {
        console.error('Mana calculation error:', error);
        throw new Error(error instanceof Error ? error.message : 'Unknown calculation error');
      }
    },
    enabled: enabled && deckList.trim().length > 0,
    // Cache calculations for 10 minutes
    staleTime: 10 * 60 * 1000,
    // Keep in memory for 30 minutes
    gcTime: 30 * 60 * 1000,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Retry once on failure
    retry: 1,
    // Don't refetch on mount if we have data
    refetchOnMount: false
  });

  return {
    analysisResult: analysisResult || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
};

// Hook for background calculations with Web Worker
export const useManaCalculationsWithWorker = ({ 
  deckList, 
  enabled = true 
}: UseManaCalculationsProps): UseManaCalculationsReturn => {
  const deckHash = useMemo(() => createDeckHash(deckList), [deckList]);
  
  const {
    data: analysisResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['manaCalculationsWorker', deckHash],
    queryFn: async (): Promise<AnalysisResult> => {
      return new Promise((resolve, reject) => {
        // Create Web Worker for heavy calculations
        const worker = new Worker(new URL('/workers/manaCalculator.worker.js', import.meta.url));
        
        worker.postMessage({ deckList });
        
        worker.onmessage = (event) => {
          const { result, error } = event.data;
          worker.terminate();
          
          if (error) {
            reject(new Error(error));
          } else {
            resolve(result);
          }
        };
        
        worker.onerror = (error) => {
          worker.terminate();
          reject(new Error('Worker calculation failed'));
        };
        
        // Timeout after 30 seconds
        setTimeout(() => {
          worker.terminate();
          reject(new Error('Calculation timeout'));
        }, 30000);
      });
    },
    enabled: enabled && deckList.trim().length > 0,
    // Cache worker calculations for 15 minutes
    staleTime: 15 * 60 * 1000,
    gcTime: 45 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    refetchOnMount: false
  });

  return {
    analysisResult: analysisResult || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
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