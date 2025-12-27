/**
 * Castability Module Exports
 *
 * @version 1.0
 */

// Core engine
export {
    computeAcceleratedCastability,
    computeAcceleratedCastabilityAtTurn,
    computeCastabilityByTurn,
    findAcceleratedTurn,
    producerOnlineProbByTurn
} from './acceleratedAnalyticEngine'

// Hypergeometric utilities
export { cardsSeenByTurn, Hypergeom, hypergeom } from './hypergeom'
export type { PlayDraw } from './hypergeom'

// Re-export types for convenience
export type {
    AccelContext,
    AcceleratedCastabilityResult,
    CastabilityResult,
    DeckManaProfile, FormatPreset, ManaCost,
    ManaProducerDef,
    ProducerInDeck
} from '../../types/manaProducers'

export { FORMAT_REMOVAL_RATES } from '../../types/manaProducers'
