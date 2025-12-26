import { useCallback, useEffect, useRef, useState } from 'react';

// 🎯 Types pour Monte Carlo Worker
interface DeckCardForMonteCarlo {
  name: string;
  cmc: number;
  quantity?: number;
  manaCost?: string;
  isLand?: boolean;
}

interface MonteCarloConfig {
  deck: DeckCardForMonteCarlo[];
  iterations?: number;
  targetCard?: { name: string; cmc: number };
  turns?: number;
  landRatio?: number;
}

interface MonteCarloResult {
  iterations: number;
  successCount: number;
  turnResults: Record<number, number>;
  averageManaAvailable: Record<number, number>;
  consistency: number;
  mulliganRate: number;
}

interface WorkerMessage {
  type: string;
  data?: MonteCarloResult | { progress: number } | { probability: number } | number[];
  error?: string;
  success: boolean;
}

// 🎯 Hook principal pour Web Worker
export const useMonteCarloWorker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MonteCarloResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker(new URL('/workers/monteCarlo.worker.js', import.meta.url));

        workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
          const { type, data, error, success } = e.data;

          if (!success && error) {
            setError(error);
            setIsRunning(false);
            return;
          }

          switch (type) {
            case 'MONTE_CARLO_RESULT':
              setResults(data as MonteCarloResult);
              setIsRunning(false);
              setProgress(100);
              break;

            case 'PROGRESS_UPDATE':
              if (data && typeof data === 'object' && 'progress' in data) {
                setProgress((data as { progress: number }).progress);
              }
              break;

            default:
              console.warn('Unknown worker message type:', type);
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Monte Carlo Worker error:', error);
          setError('Worker initialization failed');
          setIsRunning(false);
        };

      } catch (err) {
        console.error('Failed to create worker:', err);
        setError('Web Worker not supported');
      }
    } else {
      setError('Web Worker not supported in this browser');
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Run Monte Carlo simulation
  const runSimulation = useCallback(async (config: MonteCarloConfig): Promise<MonteCarloResult | null> => {
    if (!workerRef.current) {
      setError('Worker not initialized');
      return null;
    }

    setIsRunning(true);
    setError(null);
    setProgress(0);
    setResults(null);

    try {
      // Send work to worker
      workerRef.current.postMessage({
        type: 'MONTE_CARLO',
        data: config
      });

      // Return promise that resolves when worker completes
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          setError('Simulation timeout (30s)');
          setIsRunning(false);
          reject(new Error('Timeout'));
        }, 30000);

                 const messageHandler = (e: MessageEvent<WorkerMessage>) => {
           const { type, data, success } = e.data;

           if (type === 'MONTE_CARLO_RESULT') {
             clearTimeout(timeout);
             if (success && data) {
               resolve(data as MonteCarloResult);
             } else {
               reject(new Error(e.data.error || 'Simulation failed'));
             }
           }
         };

         if (workerRef.current) {
           workerRef.current.addEventListener('message', messageHandler);
         }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsRunning(false);
      return null;
    }
  }, []);

  // Quick probability calculation (non-blocking)
  const calculateProbability = useCallback(async (
    populationSize: number,
    successesInPopulation: number,
    sampleSize: number,
    successesNeeded: number
  ): Promise<number> => {
    if (!workerRef.current) {
      return 0;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Calculation timeout'));
      }, 5000);

      const messageHandler = (e: MessageEvent<WorkerMessage>) => {
        const { type, data, success } = e.data;

        if (type === 'HYPERGEOMETRIC_RESULT') {
          clearTimeout(timeout);
          workerRef.current?.removeEventListener('message', messageHandler);

          if (success && data && typeof data === 'object' && 'probability' in data) {
            resolve((data as { probability: number }).probability);
          } else {
            reject(new Error(e.data.error || 'Calculation failed'));
          }
        }
      };

      workerRef.current?.addEventListener('message', messageHandler);
      workerRef.current?.postMessage({
        type: 'HYPERGEOMETRIC',
        data: {
          populationSize,
          successesInPopulation,
          sampleSize,
          successesNeeded
        }
      });
    });
  }, []);

  // Batch calculations for performance
  const batchCalculate = useCallback(async (
    calculations: Array<{
      populationSize: number;
      successesInPopulation: number;
      sampleSize: number;
      successesNeeded: number;
    }>
  ): Promise<number[]> => {
    if (!workerRef.current) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Batch calculation timeout'));
      }, 10000);

      const messageHandler = (e: MessageEvent<WorkerMessage>) => {
        const { type, data, success } = e.data;

        if (type === 'BATCH_RESULT') {
          clearTimeout(timeout);
          workerRef.current?.removeEventListener('message', messageHandler);

          if (success && Array.isArray(data)) {
            resolve(data as number[]);
          } else {
            reject(new Error(e.data.error || 'Batch calculation failed'));
          }
        }
      };

      workerRef.current?.addEventListener('message', messageHandler);
      workerRef.current?.postMessage({
        type: 'BATCH_CALCULATION',
        data: { calculations }
      });
    });
  }, []);

  // Cancel running simulation
  const cancelSimulation = useCallback(() => {
    if (workerRef.current && isRunning) {
      workerRef.current.terminate();

      // Recreate worker
      setTimeout(() => {
        if (typeof Worker !== 'undefined') {
          workerRef.current = new Worker(new URL('/workers/monteCarlo.worker.js', import.meta.url));
        }
      }, 100);

      setIsRunning(false);
      setProgress(0);
      setError('Simulation cancelled');
    }
  }, [isRunning]);

  return {
    // State
    isRunning,
    results,
    error,
    progress,

    // Actions
    runSimulation,
    calculateProbability,
    batchCalculate,
    cancelSimulation,

    // Utils
    isWorkerSupported: !!workerRef.current
  };
};

// 🎯 Hook simplifié pour un calcul rapide
export const useQuickProbability = () => {
  const { calculateProbability, isWorkerSupported } = useMonteCarloWorker();

  return useCallback(async (
    deckSize: number = 60,
    sources: number,
    turn: number,
    symbols: number
  ) => {
    if (!isWorkerSupported) {
      // Fallback calculation on main thread
      return fallbackHypergeometric(deckSize, sources, turn + 6, symbols);
    }

    try {
      return await calculateProbability(deckSize, sources, turn + 6, symbols);
    } catch {
      return fallbackHypergeometric(deckSize, sources, turn + 6, symbols);
    }
  }, [calculateProbability, isWorkerSupported]);
};

// Fallback calculation for unsupported browsers
function fallbackHypergeometric(
  populationSize: number,
  successesInPopulation: number,
  sampleSize: number,
  successesNeeded: number
): number {
  if (successesNeeded > sampleSize) return 0;
  if (successesInPopulation < successesNeeded) return 0;
  if (populationSize < sampleSize) return 0;

  // Simplified approximation
  const prob = successesInPopulation / populationSize;
  return Math.min(1, prob * sampleSize / successesNeeded);
}
