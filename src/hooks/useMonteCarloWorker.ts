import { useCallback, useEffect, useRef, useState } from 'react'

// 🎯 Types pour Monte Carlo Worker
interface DeckCardForMonteCarlo {
  name: string
  cmc: number
  quantity?: number
  manaCost?: string
  isLand?: boolean
}

interface MonteCarloConfig {
  deck: DeckCardForMonteCarlo[]
  iterations?: number
  targetCard?: { name: string; cmc: number }
  turns?: number
  landRatio?: number
}

interface MonteCarloResult {
  iterations: number
  successCount: number
  turnResults: Record<number, number>
  averageManaAvailable: Record<number, number>
  consistency: number
  mulliganRate: number
}

interface WorkerMessage {
  type: string
  data?: MonteCarloResult | { progress: number } | { probability: number } | number[]
  error?: string
  success: boolean
}

// 🎯 Hook principal pour Web Worker
// NOTE (2026-04-17): ce hook n'a plus de consommateurs en prod depuis que
// MulliganTab utilise `mulliganArchetype.worker.ts`. Conservé pour
// compatibilité API. Corrections audit react-pro 2026-04-17 :
// - suppression du double-dispatch MONTE_CARLO_RESULT (global onmessage +
//   addEventListener par appel). Seul le handler scoped résout l'état.
// - `cancelSimulation` utilise `isRunningRef` au lieu de la state `isRunning`
//   pour ne plus invalider la memo à chaque toggle.
// - reconstruction du worker synchrone (plus de setTimeout 100ms).
export const useMonteCarloWorker = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<MonteCarloResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const workerRef = useRef<Worker | null>(null)
  const isRunningRef = useRef(false)

  // Keep ref in sync so cancelSimulation can stay memoized
  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  // Progress listener — stateless, does not resolve results.
  // Result / error handling happens in the per-call scoped listener.
  const attachProgressHandler = (w: Worker) => {
    w.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { type, data, error: msgError, success } = e.data
      if (!success && msgError) {
        setError(msgError)
        setIsRunning(false)
        return
      }
      if (type === 'PROGRESS_UPDATE' && data && typeof data === 'object' && 'progress' in data) {
        setProgress((data as { progress: number }).progress)
      }
    }
    w.onerror = (err) => {
      console.error('Monte Carlo Worker error:', err)
      setError('Worker initialization failed')
      setIsRunning(false)
    }
  }

  // Initialize worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker(new URL('/workers/monteCarlo.worker.js', import.meta.url))
        attachProgressHandler(workerRef.current)
      } catch (err) {
        console.error('Failed to create worker:', err)
        setError('Web Worker not supported')
      }
    } else {
      setError('Web Worker not supported in this browser')
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  // Run Monte Carlo simulation
  const runSimulation = useCallback(
    async (config: MonteCarloConfig): Promise<MonteCarloResult | null> => {
      if (!workerRef.current) {
        setError('Worker not initialized')
        return null
      }

      setIsRunning(true)
      setError(null)
      setProgress(0)
      setResults(null)

      try {
        // Send work to worker
        workerRef.current.postMessage({
          type: 'MONTE_CARLO',
          data: config,
        })

        // Return promise that resolves when worker completes
        // Audit fix H2 (2026-04-13): always remove the message listener and
        // clear the timeout — the previous code never cleaned up the listener,
        // which leaked one handler per call (compounding race conditions).
        return new Promise((resolve, reject) => {
          const cleanup = () => {
            clearTimeout(timeout)
            workerRef.current?.removeEventListener('message', messageHandler)
          }
          const timeout = setTimeout(() => {
            cleanup()
            setError('Simulation timeout (30s)')
            setIsRunning(false)
            reject(new Error('Timeout'))
          }, 30000)

          const messageHandler = (e: MessageEvent<WorkerMessage>) => {
            const { type, data, success } = e.data

            if (type === 'MONTE_CARLO_RESULT') {
              cleanup()
              if (success && data) {
                const result = data as MonteCarloResult
                setResults(result)
                setIsRunning(false)
                setProgress(100)
                resolve(result)
              } else {
                setIsRunning(false)
                reject(new Error(e.data.error || 'Simulation failed'))
              }
            }
          }

          if (workerRef.current) {
            workerRef.current.addEventListener('message', messageHandler)
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsRunning(false)
        return null
      }
    },
    []
  )

  // Quick probability calculation (non-blocking)
  const calculateProbability = useCallback(
    async (
      populationSize: number,
      successesInPopulation: number,
      sampleSize: number,
      successesNeeded: number
    ): Promise<number> => {
      if (!workerRef.current) {
        return 0
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Calculation timeout'))
        }, 5000)

        const messageHandler = (e: MessageEvent<WorkerMessage>) => {
          const { type, data, success } = e.data

          if (type === 'HYPERGEOMETRIC_RESULT') {
            clearTimeout(timeout)
            workerRef.current?.removeEventListener('message', messageHandler)

            if (success && data && typeof data === 'object' && 'probability' in data) {
              resolve((data as { probability: number }).probability)
            } else {
              reject(new Error(e.data.error || 'Calculation failed'))
            }
          }
        }

        workerRef.current?.addEventListener('message', messageHandler)
        workerRef.current?.postMessage({
          type: 'HYPERGEOMETRIC',
          data: {
            populationSize,
            successesInPopulation,
            sampleSize,
            successesNeeded,
          },
        })
      })
    },
    []
  )

  // Batch calculations for performance
  const batchCalculate = useCallback(
    async (
      calculations: Array<{
        populationSize: number
        successesInPopulation: number
        sampleSize: number
        successesNeeded: number
      }>
    ): Promise<number[]> => {
      if (!workerRef.current) {
        return []
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Batch calculation timeout'))
        }, 10000)

        const messageHandler = (e: MessageEvent<WorkerMessage>) => {
          const { type, data, success } = e.data

          if (type === 'BATCH_RESULT') {
            clearTimeout(timeout)
            workerRef.current?.removeEventListener('message', messageHandler)

            if (success && Array.isArray(data)) {
              resolve(data as number[])
            } else {
              reject(new Error(e.data.error || 'Batch calculation failed'))
            }
          }
        }

        workerRef.current?.addEventListener('message', messageHandler)
        workerRef.current?.postMessage({
          type: 'BATCH_CALCULATION',
          data: { calculations },
        })
      })
    },
    []
  )

  // Cancel running simulation.
  // Using isRunningRef keeps the callback memoized across isRunning toggles.
  // Worker recreation is synchronous to close the race window where
  // workerRef.current was null between terminate() and the previous setTimeout.
  const cancelSimulation = useCallback(() => {
    if (workerRef.current && isRunningRef.current) {
      workerRef.current.terminate()

      if (typeof Worker !== 'undefined') {
        try {
          workerRef.current = new Worker(new URL('/workers/monteCarlo.worker.js', import.meta.url))
          attachProgressHandler(workerRef.current)
        } catch (err) {
          console.error('Failed to recreate worker after cancel:', err)
          workerRef.current = null
        }
      }

      setIsRunning(false)
      setProgress(0)
      setError('Simulation cancelled')
    }
  }, [])

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
    isWorkerSupported: !!workerRef.current,
  }
}

// 🎯 Hook simplifié pour un calcul rapide
export const useQuickProbability = () => {
  const { calculateProbability, isWorkerSupported } = useMonteCarloWorker()

  return useCallback(
    async (deckSize: number = 60, sources: number, turn: number, symbols: number) => {
      if (!isWorkerSupported) {
        // Fallback calculation on main thread
        return fallbackHypergeometric(deckSize, sources, turn + 6, symbols)
      }

      try {
        return await calculateProbability(deckSize, sources, turn + 6, symbols)
      } catch {
        return fallbackHypergeometric(deckSize, sources, turn + 6, symbols)
      }
    },
    [calculateProbability, isWorkerSupported]
  )
}

// Fallback calculation for unsupported browsers
function fallbackHypergeometric(
  populationSize: number,
  successesInPopulation: number,
  sampleSize: number,
  successesNeeded: number
): number {
  if (successesNeeded > sampleSize) return 0
  if (successesInPopulation < successesNeeded) return 0
  if (populationSize < sampleSize) return 0

  // Simplified approximation
  const prob = successesInPopulation / populationSize
  return Math.min(1, (prob * sampleSize) / successesNeeded)
}
