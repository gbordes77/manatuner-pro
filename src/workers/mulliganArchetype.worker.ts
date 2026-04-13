/// <reference lib="webworker" />
/**
 * Mulligan Archetype Worker
 *
 * Runs `analyzeWithArchetype` (Monte Carlo + Bellman backward induction) off
 * the main thread. Bundled by Vite via the `?worker` import suffix, so the
 * worker module enjoys the same TypeScript + module graph as the rest of the
 * app — no need to duplicate code into a vanilla `.js` file.
 *
 * Audit fix H1 (2026-04-13): on iOS Safari and mid-range Android, running 50k
 * iterations on the main thread froze the UI for 2-8 s and triggered "page
 * unresponsive" prompts. With this worker, the simulation is non-blocking and
 * cancellable (terminate the worker).
 */

import type { DeckCard } from '../services/deckAnalyzer'
import {
  analyzeWithArchetype,
  type AdvancedMulliganResult,
  type Archetype,
} from '../services/mulliganSimulatorAdvanced'

export interface MulliganWorkerRequest {
  id: number
  cards: DeckCard[]
  archetype: Archetype
  iterations: number
}

export interface MulliganWorkerSuccess {
  id: number
  ok: true
  result: AdvancedMulliganResult
}

export interface MulliganWorkerFailure {
  id: number
  ok: false
  error: string
}

export type MulliganWorkerResponse = MulliganWorkerSuccess | MulliganWorkerFailure

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.addEventListener('message', (event: MessageEvent<MulliganWorkerRequest>) => {
  const { id, cards, archetype, iterations } = event.data
  try {
    const result = analyzeWithArchetype(cards, archetype, iterations)
    const response: MulliganWorkerSuccess = { id, ok: true, result }
    ctx.postMessage(response)
  } catch (err) {
    const response: MulliganWorkerFailure = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown analysis error',
    }
    ctx.postMessage(response)
  }
})
