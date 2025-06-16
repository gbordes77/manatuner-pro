import { useEffect, useRef, useCallback, useState } from 'react'

interface WorkerMessage {
  type: string
  id: string
  data?: any
  error?: any
}

interface WorkerRequest {
  type: string
  data: any
  resolve: (value: any) => void
  reject: (error: any) => void
}

export function useWebWorker(workerPath: string) {
  const workerRef = useRef<Worker | null>(null)
  const pendingRequests = useRef<Map<string, WorkerRequest>>(new Map())
  const [isReady, setIsReady] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if Web Workers are supported
    if (typeof Worker !== 'undefined') {
      setIsSupported(true)
      
      try {
        const worker = new Worker(workerPath)
        workerRef.current = worker

        worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
          const { type, id, data, error } = e.data

          if (type === 'ready') {
            setIsReady(true)
            return
          }

          if (type === 'progress') {
            // Handle progress updates
            console.log('Worker progress:', data)
            return
          }

          if (id && pendingRequests.current.has(id)) {
            const request = pendingRequests.current.get(id)!
            pendingRequests.current.delete(id)

            if (type === 'result') {
              request.resolve(data)
            } else if (type === 'error') {
              request.reject(new Error(error.message || 'Worker error'))
            }
          }
        }

        worker.onerror = (error) => {
          console.error('Worker error:', error)
          setIsReady(false)
          
          // Reject all pending requests
          pendingRequests.current.forEach(request => {
            request.reject(new Error('Worker error: ' + error.message))
          })
          pendingRequests.current.clear()
        }

        return () => {
          worker.terminate()
          setIsReady(false)
        }
      } catch (error) {
        console.error('Failed to create worker:', error)
        setIsSupported(false)
      }
    } else {
      setIsSupported(false)
    }
  }, [workerPath])

  const postMessage = useCallback(async (type: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('Web Workers not supported'))
        return
      }

      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'))
        return
      }

      const id = Math.random().toString(36).substr(2, 9)
      
      pendingRequests.current.set(id, {
        type,
        data,
        resolve,
        reject
      })

      // Set timeout for long-running operations
      setTimeout(() => {
        if (pendingRequests.current.has(id)) {
          pendingRequests.current.delete(id)
          reject(new Error('Worker timeout'))
        }
      }, 30000) // 30 second timeout

      workerRef.current.postMessage({ type, data, id })
    })
  }, [isSupported, isReady])

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
      setIsReady(false)
      
      // Reject all pending requests
      pendingRequests.current.forEach(request => {
        request.reject(new Error('Worker terminated'))
      })
      pendingRequests.current.clear()
    }
  }, [])

  return {
    postMessage,
    terminate,
    isReady,
    isSupported,
    pendingCount: pendingRequests.current.size
  }
}

// Specialized hook for mana calculations
export function useManaCalculatorWorker() {
  const worker = useWebWorker('/workers/manaCalculator.worker.js')

  const calculateSingle = useCallback(async (
    deckSize: number,
    sourcesInDeck: number,
    turn: number,
    symbolsNeeded: number,
    onThePlay: boolean = true
  ) => {
    if (!worker.isSupported) {
      // Fallback to main thread calculation
      return fallbackCalculation(deckSize, sourcesInDeck, turn, symbolsNeeded, onThePlay)
    }

    return worker.postMessage('calculate_single', {
      deckSize,
      sourcesInDeck,
      turn,
      symbolsNeeded,
      onThePlay
    })
  }, [worker])

  const analyzeCard = useCallback(async (card: any, deck: any) => {
    if (!worker.isSupported) {
      // Fallback to main thread calculation
      return fallbackCardAnalysis(card, deck)
    }

    return worker.postMessage('analyze_card', { card, deck })
  }, [worker])

  const analyzeDeckBatch = useCallback(async (cards: any[], deck: any) => {
    if (!worker.isSupported) {
      // Fallback to main thread calculation
      return fallbackBatchAnalysis(cards, deck)
    }

    return worker.postMessage('analyze_deck_batch', { cards, deck })
  }, [worker])

  const clearCache = useCallback(async () => {
    if (worker.isSupported) {
      return worker.postMessage('clear_cache', {})
    }
  }, [worker])

  return {
    ...worker,
    calculateSingle,
    analyzeCard,
    analyzeDeckBatch,
    clearCache
  }
}

// Fallback calculations for when Web Workers aren't supported
function fallbackCalculation(deckSize: number, sourcesInDeck: number, turn: number, symbolsNeeded: number, onThePlay: boolean) {
  // Simple fallback calculation
  const cardsSeen = 7 + turn - (onThePlay ? 1 : 0)
  const probability = Math.min(1, (sourcesInDeck * cardsSeen) / (deckSize * symbolsNeeded))
  
  return {
    probability,
    meetsThreshold: probability >= 0.90,
    sourcesNeeded: symbolsNeeded,
    sourcesAvailable: sourcesInDeck,
    cardsSeen,
    turn,
    symbolsNeeded,
    fallback: true
  }
}

function fallbackCardAnalysis(card: any, deck: any) {
  return {
    overall: { 
      probability: 0.75, 
      meetsThreshold: false,
      fallback: true 
    }
  }
}

function fallbackBatchAnalysis(cards: any[], deck: any) {
  const results: any = {}
  cards.forEach(card => {
    results[card.name] = fallbackCardAnalysis(card, deck)
  })
  
  return {
    results,
    metadata: {
      processingTime: 0,
      cardsAnalyzed: cards.length,
      fallback: true
    }
  }
} 