/**
 * Land Service for ManaTuner Pro
 *
 * Unified service for land detection, ETB analysis, and tempo-aware calculations.
 * Orchestrates cache, Scryfall API, and pattern detection.
 *
 * @version 1.0
 * @see docs/LAND_SYSTEM_REDESIGN.md
 */

import type {
    DeckContext,
    ETBCondition,
    ETBParseResult,
    ILandService,
    LandCategory,
    LandManaColor,
    LandMetadata
} from '@/types/lands'

import { LAND_SEED } from '../data/landSeed'
import { landCacheService } from './landCacheService'
import { fetchLandData, type ScryfallLandData } from './scryfall'

// =============================================================================
// CONSTANTS
// =============================================================================

/** Mana symbol to color mapping */
const MANA_SYMBOL_MAP: Record<string, LandManaColor> = {
  'W': 'W', 'U': 'U', 'B': 'B', 'R': 'R', 'G': 'G', 'C': 'C'
}



// =============================================================================
// ETB DETECTION PATTERNS
// =============================================================================

/**
 * Regular expression patterns for detecting ETB behavior from oracle text.
 * Order matters - more specific patterns should come first.
 */
const ETB_PATTERNS: Array<{
  pattern: RegExp
  getCondition: (match: RegExpMatchArray) => ETBCondition
  category?: LandCategory
  confidence: number
}> = [
  // Shocklands: "As ~ enters the battlefield, you may pay 2 life. If you don't, it enters the battlefield tapped."
  {
    pattern: /you may pay (\d+) life.*if you don't.*enters.*tapped/i,
    getCondition: (match) => ({ type: 'pay_life', amount: parseInt(match[1], 10) }),
    category: 'shock',
    confidence: 98
  },

  // Fastlands: "~ enters the battlefield tapped unless you control two or fewer other lands."
  {
    pattern: /enters.*tapped unless you control (?:two|2) or fewer other lands/i,
    getCondition: () => ({ type: 'control_lands_max', threshold: 2 }),
    category: 'fast',
    confidence: 95
  },

  // Slowlands: "~ enters the battlefield tapped unless you control two or more other lands."
  {
    pattern: /enters.*tapped unless you control (?:two|2) or more other lands/i,
    getCondition: () => ({ type: 'control_lands_min', threshold: 2 }),
    category: 'slow',
    confidence: 95
  },

  // Battle lands: "~ enters the battlefield tapped unless you control two or more basic lands."
  {
    pattern: /enters.*tapped unless you control (?:two|2) or more basic lands/i,
    getCondition: () => ({ type: 'control_basics_min', threshold: 2 }),
    category: 'battle',
    confidence: 95
  },

  // Checklands: "~ enters the battlefield tapped unless you control a Plains or Island."
  {
    pattern: /enters.*tapped unless you control (?:a |an )?([A-Z][a-z]+)(?: or (?:a |an )?([A-Z][a-z]+))?/i,
    getCondition: (match) => {
      const basicTypes = [match[1]]
      if (match[2]) basicTypes.push(match[2])
      return { type: 'control_basic', basicTypes }
    },
    category: 'check',
    confidence: 95
  },

  // Reveal lands: "you may reveal an Island card from your hand. If you don't, ~ enters the battlefield tapped."
  {
    pattern: /you may reveal (?:a |an )?([A-Za-z]+) card.*if you don't.*enters.*tapped/i,
    getCondition: (match) => ({ type: 'reveal_card', cardType: match[1] }),
    confidence: 90
  },

  // Turn threshold (Starting Town): "~ enters the battlefield tapped unless it's your first, second, or third turn."
  {
    pattern: /enters.*tapped.*unless.*(?:first|second|third|fourth|fifth)/i,
    getCondition: (match) => {
      // Count how many turn numbers mentioned
      const text = match[0].toLowerCase()
      let maxTurn = 1
      if (text.includes('second')) maxTurn = 2
      if (text.includes('third')) maxTurn = 3
      if (text.includes('fourth')) maxTurn = 4
      if (text.includes('fifth')) maxTurn = 5
      return { type: 'turn_threshold', threshold: maxTurn }
    },
    confidence: 92
  },

  // Always tapped (simple pattern): "~ enters the battlefield tapped."
  {
    pattern: /enters the battlefield tapped\.$/im,
    getCondition: () => ({ type: 'pay_life', amount: 0 }), // Placeholder, will be overridden
    confidence: 100
  }
]

// =============================================================================
// CATEGORY DETECTION PATTERNS
// =============================================================================

/** Patterns for detecting land category from name/type */
const CATEGORY_PATTERNS: Array<{
  pattern: RegExp | ((name: string, typeLine: string) => boolean)
  category: LandCategory
}> = [
  // Basic lands
  { pattern: (_, type) => type.toLowerCase().includes('basic'), category: 'basic' },

  // Fetchlands (search library for land)
  { pattern: /search your library for (?:a |an )?(?:plains|island|swamp|mountain|forest)/i, category: 'fetch' },

  // Triomes (three basic types)
  {
    pattern: (_, type) => {
      const types = type.toLowerCase()
      const basicCount = ['plains', 'island', 'swamp', 'mountain', 'forest']
        .filter(t => types.includes(t)).length
      return basicCount >= 3
    },
    category: 'triome'
  },

  // Creature lands
  { pattern: /becomes? (?:a |an )?\d+\/\d+.*creature/i, category: 'creature' },

  // Channel lands
  { pattern: /channel/i, category: 'channel' },

  // Bounce lands
  { pattern: /return a land you control to its owner's hand/i, category: 'bounce' },

  // Horizon lands
  { pattern: /\{1\}, \{T\}, Sacrifice.*: Draw a card/i, category: 'horizon' },

  // Filter lands
  { pattern: /\{1\}, \{T\}: Add \{[WUBRG]\}\{[WUBRG]\}/i, category: 'filter' },

  // Painlands
  { pattern: /\{T\}: Add \{C\}\..*\{T\}: Add \{[WUBRG]\} or \{[WUBRG]\}.*deals 1 damage/i, category: 'pain' }
]

// =============================================================================
// LAND SERVICE CLASS
// =============================================================================

/**
 * Main service for land detection and analysis.
 */
class LandService implements ILandService {
  private initialized = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the service with seed data.
   */
  private initialize(): void {
    if (this.initialized) return

    // Preload seed data into cache
    landCacheService.preloadFromSeed(LAND_SEED)
    this.initialized = true

    console.debug('[LandService] Initialized with seed data')
  }

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Detect and analyze a land by name.
   * Uses cache → seed → Scryfall API → pattern fallback.
   *
   * @param cardName - The exact card name
   * @returns Land metadata or null if not a land
   */
  async detectLand(cardName: string): Promise<LandMetadata | null> {
    // 1. Check cache (includes seed data)
    const cached = landCacheService.get(cardName)
    if (cached) {
      return cached
    }

    // 2. Fetch from Scryfall
    const scryfallData = await fetchLandData(cardName)
    if (!scryfallData) {
      return null
    }

    // 3. Analyze the Scryfall data
    const metadata = this.analyzeFromScryfall(scryfallData)

    // 4. Cache the result
    landCacheService.set(cardName, metadata, 'scryfall')

    return metadata
  }

  /**
   * Check if a card name is a land.
   *
   * @param cardName - The card name to check
   * @returns True if the card is a land
   */
  async isLand(cardName: string): Promise<boolean> {
    const metadata = await this.detectLand(cardName)
    return metadata !== null
  }

  /**
   * Get all lands from a deck list.
   *
   * @param deckList - Array of card names
   * @returns Array of land metadata
   */
  async getLandsFromDeckList(deckList: string[]): Promise<LandMetadata[]> {
    const lands: LandMetadata[] = []

    for (const cardName of deckList) {
      const metadata = await this.detectLand(cardName)
      if (metadata) {
        lands.push(metadata)
      }
    }

    return lands
  }

  /**
   * Get the probability that a land enters untapped at a specific turn.
   *
   * @param land - The land metadata
   * @param turn - The turn number (1-indexed)
   * @param context - Deck context for condition evaluation
   * @returns Probability between 0 and 1
   */
  getUntappedProbability(
    land: LandMetadata,
    turn: number,
    context: DeckContext
  ): number {
    const { type, condition } = land.etbBehavior

    switch (type) {
      case 'always_untapped':
        return 1.0

      case 'always_tapped':
        return 0.0

      case 'conditional':
        if (!condition) return 0.5
        return this.evaluateCondition(condition, turn, context)

      default:
        return 0.5
    }
  }

  // ===========================================================================
  // ANALYSIS METHODS
  // ===========================================================================

  /**
   * Analyze Scryfall data and create land metadata.
   */
  private analyzeFromScryfall(data: ScryfallLandData): LandMetadata {
    // Handle MDFC (Modal Double-Faced Cards)
    if (data.layout === 'modal_dfc' && data.card_faces) {
      return this.analyzeMDFC(data)
    }

    // Regular land analysis
    const oracleText = data.oracle_text || ''
    const typeLine = data.type_line || ''

    // Detect colors produced
    const produces = this.detectProducedColors(data)

    // Detect ETB behavior
    const etbResult = this.parseETBBehavior(oracleText)

    // Detect category
    const category = this.detectCategory(data.name, typeLine, oracleText)

    // Detect special abilities
    const isFetch = this.detectFetchland(oracleText)
    const fetchTargets = isFetch ? this.extractFetchTargets(oracleText) : undefined
    const isCreatureLand = /becomes? (?:a |an )?\d+\/\d+.*creature/i.test(oracleText)
    const hasChannel = /channel/i.test(oracleText)

    // Detect basic land types
    const basicLandTypes = this.extractBasicLandTypes(typeLine)

    // Override ETB for always-tapped categories
    let etbBehavior = etbResult.behavior
    if (category === 'triome' || category === 'bounce') {
      etbBehavior = { type: 'always_tapped' }
    }

    return {
      name: data.name,
      category,
      produces,
      producesAny: produces.length === 0 && /add.*mana of any/i.test(oracleText),
      etbBehavior,
      isFetch,
      fetchTargets,
      isCreatureLand,
      hasChannel,
      basicLandTypes: basicLandTypes.length > 0 ? basicLandTypes : undefined,
      confidence: etbResult.confidence,
      scryfallData: {
        oracleText: data.oracle_text,
        typeLine: data.type_line,
        layout: data.layout
      }
    }
  }

  /**
   * Analyze a Modal Double-Faced Card (MDFC) like Pathways.
   */
  private analyzeMDFC(data: ScryfallLandData): LandMetadata {
    const faces = data.card_faces || []

    // Find the first land face
    const landFace = faces.find(f => f.type_line?.toLowerCase().includes('land'))

    if (!landFace) {
      // No land face found, return basic unknown
      return {
        name: data.name,
        category: 'unknown',
        produces: [],
        producesAny: false,
        etbBehavior: { type: 'always_untapped' },
        isFetch: false,
        isCreatureLand: false,
        hasChannel: false,
        confidence: 50
      }
    }

    const oracleText = landFace.oracle_text || ''
    const produces = this.extractColorsFromOracleText(oracleText)

    // Find the other face name
    const otherFace = faces.find(f => f.name !== landFace.name)

    return {
      name: landFace.name,
      category: 'pathway',
      produces,
      producesAny: false,
      etbBehavior: { type: 'always_untapped' }, // Pathways always enter untapped
      isFetch: false,
      isCreatureLand: false,
      hasChannel: false,
      isMDFC: true,
      otherFace: otherFace?.name,
      confidence: 95,
      scryfallData: {
        oracleText: landFace.oracle_text,
        typeLine: landFace.type_line,
        layout: data.layout
      }
    }
  }

  // ===========================================================================
  // ETB DETECTION
  // ===========================================================================

  /**
   * Parse ETB behavior from oracle text.
   */
  private parseETBBehavior(oracleText: string): ETBParseResult {
    // Check for "enters the battlefield tapped" without conditions
    if (/enters the battlefield tapped\.$/im.test(oracleText) &&
        !/unless/i.test(oracleText) &&
        !/you may pay/i.test(oracleText)) {
      return {
        behavior: { type: 'always_tapped' },
        confidence: 100,
        matchedPattern: 'always_tapped'
      }
    }

    // Try each pattern
    for (const { pattern, getCondition, confidence } of ETB_PATTERNS) {
      const match = oracleText.match(pattern)
      if (match) {
        const condition = getCondition(match)

        // Special case: pattern matched but it's always tapped
        if (condition.type === 'pay_life' && condition.amount === 0) {
          return {
            behavior: { type: 'always_tapped' },
            confidence,
            matchedPattern: 'always_tapped'
          }
        }

        return {
          behavior: { type: 'conditional', condition },
          confidence,
          matchedPattern: pattern.toString()
        }
      }
    }

    // Default: untapped (no ETB restriction found)
    return {
      behavior: { type: 'always_untapped' },
      confidence: 70,
      matchedPattern: 'default_untapped'
    }
  }

  // ===========================================================================
  // CONDITION EVALUATION
  // ===========================================================================

  /**
   * Evaluate an ETB condition for a specific turn and deck context.
   * Returns probability of entering untapped.
   */
  private evaluateCondition(
    condition: ETBCondition,
    turn: number,
    context: DeckContext
  ): number {
    switch (condition.type) {
      case 'pay_life':
        // Shocklands: depends on strategy
        return context.assumePayLife ? 1.0 : 0.0

      case 'control_lands_max': {
        // Fastlands: untapped if ≤ threshold lands in play
        // At turn N, you have N-1 lands in play when playing this
        const landsInPlayFast = turn - 1
        if (landsInPlayFast <= (condition.threshold || 2)) {
          return 0.95
        }
        if (landsInPlayFast === (condition.threshold || 2) + 1) {
          return 0.3
        }
        return 0.1
      }

      case 'control_lands_min': {
        // Slowlands: untapped if ≥ threshold lands in play
        const landsInPlaySlow = turn - 1
        if (landsInPlaySlow >= (condition.threshold || 2)) {
          return 0.9
        }
        if (landsInPlaySlow === (condition.threshold || 2) - 1) {
          return 0.4
        }
        return 0.1
      }

      case 'control_basic': {
        // Checklands: depends on basic land composition
        const basicTypes = condition.basicTypes || []
        const hasMatchingBasics = basicTypes.some(type =>
          (context.basicTypeCount[type] || 0) > 0
        )

        if (!hasMatchingBasics) {
          return 0.0
        }

        // Probability increases with turn and basic count
        const basicRatio = context.basicCount / context.totalLands
        if (turn >= 3) return Math.min(0.9, basicRatio * 1.5 + 0.2)
        if (turn === 2) return Math.min(0.8, basicRatio * 1.2)
        return basicRatio * 0.7
      }

      case 'control_basics_min':
        // Battle lands: need ≥ threshold basic lands
        if (context.basicCount >= (condition.threshold || 2)) {
          return turn >= 3 ? 0.85 : 0.5
        }
        return 0.2

      case 'reveal_card': {
        // Reveal lands: depends on card type ratio
        const ratio = context.getCardTypeRatio(condition.cardType || '')
        return ratio * 0.9
      }

      case 'turn_threshold':
        // Turn-based (Starting Town)
        return turn <= (condition.threshold || 3) ? 1.0 : 0.0

      default:
        return 0.5
    }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  /**
   * Detect colors produced by a land from Scryfall data.
   */
  private detectProducedColors(data: ScryfallLandData): LandManaColor[] {
    // Use produced_mana if available
    if (data.produced_mana && data.produced_mana.length > 0) {
      return data.produced_mana
        .map(symbol => MANA_SYMBOL_MAP[symbol])
        .filter((color): color is LandManaColor => color !== undefined)
    }

    // Fallback: extract from oracle text
    return this.extractColorsFromOracleText(data.oracle_text || '')
  }

  /**
   * Extract colors from oracle text mana symbols.
   */
  private extractColorsFromOracleText(oracleText: string): LandManaColor[] {
    const colors: Set<LandManaColor> = new Set()

    // Match patterns like "{T}: Add {W}." or "{T}: Add {G} or {W}."
    const addManaPattern = /add \{([WUBRGC])\}/gi
    let match

    while ((match = addManaPattern.exec(oracleText)) !== null) {
      const color = MANA_SYMBOL_MAP[match[1].toUpperCase()]
      if (color) {
        colors.add(color)
      }
    }

    return Array.from(colors)
  }

  /**
   * Detect land category from name, type line, and oracle text.
   */
  private detectCategory(
    name: string,
    typeLine: string,
    oracleText: string
  ): LandCategory {
    // Check each pattern
    for (const { pattern, category } of CATEGORY_PATTERNS) {
      if (typeof pattern === 'function') {
        if (pattern(name, typeLine)) {
          return category
        }
      } else {
        if (pattern.test(oracleText)) {
          return category
        }
      }
    }

    // Check type line for dual land types (shock, check, etc.)
    const typeLineLower = typeLine.toLowerCase()
    const basicTypeCount = ['plains', 'island', 'swamp', 'mountain', 'forest']
      .filter(t => typeLineLower.includes(t)).length

    if (basicTypeCount === 2) {
      // Could be shock, check, battle, etc. - analyze ETB
      if (/you may pay 2 life/i.test(oracleText)) return 'shock'
      if (/unless you control.*or/i.test(oracleText)) return 'check'
      if (/unless you control two or more basic/i.test(oracleText)) return 'battle'
    }

    // Default to utility if unknown
    return 'utility'
  }

  /**
   * Detect if a land is a fetchland.
   */
  private detectFetchland(oracleText: string): boolean {
    return /search your library for (?:a |an )?(?:plains|island|swamp|mountain|forest)/i.test(oracleText)
  }

  /**
   * Extract fetch targets from oracle text.
   */
  private extractFetchTargets(oracleText: string): string[] {
    const targets: string[] = []
    const pattern = /search your library for (?:a |an )?((?:plains|island|swamp|mountain|forest)(?:(?: or )?(?:plains|island|swamp|mountain|forest))*)/i
    const match = oracleText.match(pattern)

    if (match) {
      const targetString = match[1].toLowerCase()
      if (targetString.includes('plains')) targets.push('Plains')
      if (targetString.includes('island')) targets.push('Island')
      if (targetString.includes('swamp')) targets.push('Swamp')
      if (targetString.includes('mountain')) targets.push('Mountain')
      if (targetString.includes('forest')) targets.push('Forest')
    }

    return targets
  }

  /**
   * Extract basic land types from type line.
   */
  private extractBasicLandTypes(typeLine: string): string[] {
    const types: string[] = []
    const typeLineLower = typeLine.toLowerCase()

    if (typeLineLower.includes('plains')) types.push('Plains')
    if (typeLineLower.includes('island')) types.push('Island')
    if (typeLineLower.includes('swamp')) types.push('Swamp')
    if (typeLineLower.includes('mountain')) types.push('Mountain')
    if (typeLineLower.includes('forest')) types.push('Forest')

    return types
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

/** Singleton instance of the land service */
export const landService = new LandService()

/** Export the class for testing */
export { LandService }

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a deck context for condition evaluation.
 */
export function createDeckContext(
  lands: LandMetadata[],
  assumePayLife: boolean = true
): DeckContext {
  const basicCount = lands.filter(l => l.category === 'basic').length

  const basicTypeCount: Record<string, number> = {
    'Plains': 0,
    'Island': 0,
    'Swamp': 0,
    'Mountain': 0,
    'Forest': 0
  }

  for (const land of lands) {
    if (land.basicLandTypes) {
      for (const type of land.basicLandTypes) {
        basicTypeCount[type] = (basicTypeCount[type] || 0) + 1
      }
    }
  }

  return {
    totalLands: lands.length,
    basicCount,
    basicTypeCount,
    assumePayLife,
    getCardTypeRatio: (cardType: string) => {
      // Simplified: return ratio of lands with matching basic type
      const typeCount = basicTypeCount[cardType] || 0
      return lands.length > 0 ? typeCount / lands.length : 0
    }
  }
}
