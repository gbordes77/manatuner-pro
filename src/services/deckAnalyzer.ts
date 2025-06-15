import { ManaColor, MANA_COLORS } from '../types'

export interface DeckCard {
  name: string
  quantity: number
  manaCost: string
  colors: ManaColor[]
  isLand: boolean
  producedMana?: ManaColor[]
  cmc: number
  // Enhanced land properties from reference project
  etbTapped?: (lands: DeckCard[], cmc?: number) => boolean
  fetchland?: string[]
  checkland?: boolean
  ravland?: boolean
  fastland?: boolean
  producesMana?: boolean
}

export interface AnalysisResult {
  totalCards: number
  totalLands: number
  totalNonLands: number
  colorDistribution: Record<ManaColor, number>
  manaRequirements: Record<ManaColor, number>
  recommendations: string[]
  probabilities: {
    turn1: { anyColor: number; specificColors: Record<ManaColor, number> }
    turn2: { anyColor: number; specificColors: Record<ManaColor, number> }
    turn3: { anyColor: number; specificColors: Record<ManaColor, number> }
    turn4: { anyColor: number; specificColors: Record<ManaColor, number> }
  }
  consistency: number
  rating: 'excellent' | 'good' | 'average' | 'poor'
  averageCMC: number
  landRatio: number
  // Enhanced analysis from reference project
  spellAnalysis: Record<string, { castable: number; total: number; percentage: number }>
}

export class DeckAnalyzer {
  private static parseManaCost(manaCost: string): { colors: ManaColor[], cmc: number, cost: Record<string, number> } {
    const colors: ManaColor[] = []
    const cost: Record<string, number> = {}
    let cmc = 0
    
    if (!manaCost) {
      return { colors, cmc, cost }
    }
    
    // Parse mana cost like {2}{U}{R} or {W/U}{B}
    const matches = manaCost.match(/\{[^}]+\}/g) || []
    
    matches.forEach(match => {
      const symbol = match.slice(1, -1) // Remove { }
      
      // Generic mana
      if (/^\d+$/.test(symbol)) {
        const num = parseInt(symbol)
        cost.generic = (cost.generic || 0) + num
        cmc += num
      }
      // Hybrid mana like W/U
      else if (symbol.includes('/')) {
        const hybridColors = symbol.split('/')
        hybridColors.forEach(color => {
          if (MANA_COLORS.includes(color as ManaColor)) {
            colors.push(color as ManaColor)
          }
        })
        cost[symbol] = (cost[symbol] || 0) + 1
        cmc += 1
      }
      // Regular colored mana
      else if (MANA_COLORS.includes(symbol as ManaColor)) {
        colors.push(symbol as ManaColor)
        cost[symbol] = (cost[symbol] || 0) + 1
        cmc += 1
      }
      // X costs
      else if (symbol === 'X') {
        cost.X = (cost.X || 0) + 1
        // X doesn't add to CMC until resolved
      }
    })
    
    return { colors, cmc, cost }
  }

  // Enhanced land detection from reference project
  private static isLandCard(name: string): boolean {
    const landKeywords = [
      // Basic lands
      'island', 'mountain', 'forest', 'plains', 'swamp',
      // Land types
      'land', 'terrain',
      // Fetchlands
      'strand', 'tarn', 'mesa', 'foothills', 'delta', 'mire', 'catacombs', 'flats',
      // Other land indicators
      'temple', 'sanctuary', 'grove', 'cavern', 'spire', 'foundry',
      'confluence', 'command tower', 'city of brass', 'mana confluence',
      // Additional land types
      'courtyard', 'vantage', 'tower', 'town', 'shrine', 'crypt',
      'heath', 'rainforest', 'garden', 'pool', 'ground', 'fountain',
      // French translations
      'île', 'montagne', 'forêt', 'plaine', 'marais'
    ]
    
    const lowerName = name.toLowerCase()
    return landKeywords.some(keyword => lowerName.includes(keyword)) ||
           lowerName.includes('terrain') ||
           lowerName.endsWith('land') ||
           lowerName.endsWith('lands')
  }

  // Enhanced land logic from reference project
  private static evaluateLandProperties(name: string, text?: string): Partial<DeckCard> {
    const lowerName = name.toLowerCase()
    const properties: Partial<DeckCard> = {
      etbTapped: () => false,
      producesMana: true
    }

    // Fetchlands
    if (lowerName.includes('strand') || lowerName.includes('tarn') || 
        lowerName.includes('mesa') || lowerName.includes('foothills') || 
        lowerName.includes('delta') || lowerName.includes('mire') ||
        lowerName.includes('catacombs') || lowerName.includes('flats')) {
      properties.fetchland = this.getFetchlandTargets(name)
      properties.etbTapped = () => false // Fetchlands don't ETB tapped themselves
    }
    
    // Checklands (enter tapped unless you control specific basic land types)
    else if (lowerName.includes('rootbound') || lowerName.includes('sunpetal') ||
             lowerName.includes('dragonskull') || lowerName.includes('drowned') ||
             lowerName.includes('glacial') || lowerName.includes('hinterland') ||
             lowerName.includes('isolated') || lowerName.includes('sulfur') ||
             lowerName.includes('woodland') || lowerName.includes('clifftop')) {
      properties.checkland = true
      properties.etbTapped = (lands) => !this.hasRequiredBasicTypes(lands || [], name)
    }
    
    // Fastlands (enter tapped if you control 3+ other lands)
    else if (lowerName.includes('seachrome') || lowerName.includes('darkslick') ||
             lowerName.includes('blackcleave') || lowerName.includes('copperline') ||
             lowerName.includes('razorverge') || lowerName.includes('botanical')) {
      properties.fastland = true
      properties.etbTapped = (lands, cmc) => (lands?.length || 0) > 2 && (cmc || 0) > 2
    }
    
    // Shocklands/Ravlands (can pay 2 life to enter untapped)
    else if (lowerName.includes('temple garden') || lowerName.includes('sacred foundry') ||
             lowerName.includes('steam vents') || lowerName.includes('overgrown tomb') ||
             lowerName.includes('watery grave') || lowerName.includes('godless shrine') ||
             lowerName.includes('stomping ground') || lowerName.includes('breeding pool') ||
             lowerName.includes('blood crypt') || lowerName.includes('hallowed fountain')) {
      properties.ravland = true
      properties.etbTapped = () => false // Assume we pay life
    }
    
    // Basic ETB tapped lands
    else if (lowerName.includes('temple') || lowerName.includes('guildgate') ||
             lowerName.includes('tap land') || lowerName.includes('enters tapped')) {
      properties.etbTapped = () => true
    }

    return properties
  }

  private static getFetchlandTargets(name: string): string[] {
    const fetchlandMap: Record<string, string[]> = {
      'Flooded Strand': ['Plains', 'Island'],
      'Polluted Delta': ['Island', 'Swamp'],
      'Bloodstained Mire': ['Swamp', 'Mountain'],
      'Wooded Foothills': ['Mountain', 'Forest'],
      'Windswept Heath': ['Forest', 'Plains'],
      'Scalding Tarn': ['Island', 'Mountain'],
      'Verdant Catacombs': ['Swamp', 'Forest'],
      'Marsh Flats': ['Plains', 'Swamp'],
      'Misty Rainforest': ['Forest', 'Island'],
      'Arid Mesa': ['Mountain', 'Plains']
    }
    return fetchlandMap[name] || []
  }

  private static hasRequiredBasicTypes(lands: DeckCard[], checklandName: string): boolean {
    const requirements: Record<string, string[]> = {
      'Rootbound Crag': ['Mountain', 'Forest'],
      'Sunpetal Grove': ['Forest', 'Plains'],
      'Dragonskull Summit': ['Swamp', 'Mountain'],
      'Drowned Catacomb': ['Island', 'Swamp'],
      'Glacial Fortress': ['Plains', 'Island']
    }
    
    const required = requirements[checklandName] || []
    return required.some(type => 
      lands.some(land => land.name.toLowerCase().includes(type.toLowerCase()))
    )
  }

  // Enhanced card parsing with better mana cost handling
  private static parseDeckList(deckList: string): DeckCard[] {
    const lines = deckList.split('\n').filter(line => line.trim())
    const cards: DeckCard[] = []

    for (const line of lines) {
      const patterns = [
        /^(\d+)\s+(.+)$/,
        /^(\d+)x\s+(.+)$/,
        /^(.+)\s+x(\d+)$/
      ]
      
      let match = null
      let quantity = 0
      let name = ''
      
      for (const pattern of patterns) {
        match = line.match(pattern)
        if (match) {
          if (pattern === patterns[2]) {
            quantity = parseInt(match[2])
            name = match[1].trim()
          } else {
            quantity = parseInt(match[1])
            name = match[2].trim()
          }
          break
        }
      }
      
      if (match && quantity > 0) {
        // Clean card name by removing MTGA set codes like "(TDM) 33" or "(RNA) 245"
        name = this.cleanCardName(name)
        
        const isLand = this.isLandCard(name)
        const manaCost = this.getSimulatedManaCost(name)
        const { colors, cmc, cost } = this.parseManaCost(manaCost)
        const producedMana = isLand ? this.getProducedMana(name) : undefined
        const landProperties = isLand ? this.evaluateLandProperties(name) : {}

        cards.push({
          name,
          quantity,
          manaCost,
          colors,
          isLand,
          producedMana,
          cmc,
          ...landProperties
        })
      }
    }

    return cards
  }

  private static cleanCardName(name: string): string {
    // Remove MTGA set codes and collector numbers
    // Patterns: "(SET) 123", "(SET) 123a", "A-CardName", etc.
    return name
      .replace(/\s*\([A-Z0-9]{2,4}\)\s*\d+[a-z]?$/i, '') // Remove "(SET) 123" at end
      .replace(/^A-/, '') // Remove "A-" prefix for Arena rebalanced cards
      .trim()
  }

  private static getSimulatedManaCost(name: string): string {
    // Enhanced simulation with more cards
    const costs: Record<string, string> = {
      // Red spells
      'Lightning Bolt': '{R}',
      'Monastery Swiftspear': '{R}',
      'Goblin Guide': '{R}',
      'Lava Spike': '{R}',
      'Young Pyromancer': '{1}{R}',
      'Pyroclasm': '{1}{R}',
      'Claim the Firstborn': '{R}',
      'Unlucky Witness': '{R}',
      'Amped Raptor': '{1}{R}',
      'Stadium Headliner': '{1}{R}',
      'Goblin Trapfinder': '{R}',
      
      // Blue spells
      'Counterspell': '{U}{U}',
      'Brainstorm': '{U}',
      'Ponder': '{U}',
      'Delver of Secrets': '{U}',
      'Force of Will': '{3}{U}{U}',
      'Jace, the Mind Sculptor': '{2}{U}{U}',
      
      // White spells
      'Swords to Plowshares': '{W}',
      'Path to Exile': '{W}',
      'Wrath of God': '{2}{W}{W}',
      'Guide of Souls': '{W}',
      'Voice of Victory': '{1}{W}',
      
      // Black spells
      'Dark Ritual': '{B}',
      'Thoughtseize': '{B}',
      'Fatal Push': '{B}',
      'Liliana of the Veil': '{1}{B}{B}',
      'Village Rites': '{B}',
      'Corrupted Conviction': '{B}',
      'Marionette Apprentice': '{1}{B}',
      
      // Green spells
      'Llanowar Elves': '{G}',
      'Birds of Paradise': '{G}',
      'Tarmogoyf': '{1}{G}',
      'Noble Hierarch': '{G}',
      
      // Multicolor
      'Lightning Helix': '{R}{W}',
      'Terminate': '{B}{R}',
      'Abrupt Decay': '{B}{G}',
      'Ajani, Nacatl Pariah': '{1}{W}',
      'Sephiroth, Fabled SOLDIER': '{1}{W}{B}',
      
      // Artifacts and Colorless
      'Sol Ring': '{1}',
      'Mox Ruby': '{0}',
      'Black Lotus': '{0}',
      'Sensei\'s Divining Top': '{1}',
      'Goblin Bombardment': '{1}{R}',
      'Phyrexian Tower': '{0}',
      'Starting Town': '{0}'
    }
    
    // If we don't have the exact card, try to guess based on name patterns
    if (costs[name]) {
      return costs[name]
    }
    
    // Simple heuristics for unknown cards
    const lowerName = name.toLowerCase()
    if (lowerName.includes('bolt') || lowerName.includes('shock')) return '{R}'
    if (lowerName.includes('counter')) return '{U}{U}'
    if (lowerName.includes('swords') || lowerName.includes('path')) return '{W}'
    if (lowerName.includes('ritual') || lowerName.includes('dark')) return '{B}'
    if (lowerName.includes('elf') || lowerName.includes('birds')) return '{G}'
    
    // Default to 2 generic mana
    return '{2}'
  }

  private static getProducedMana(name: string): ManaColor[] {
    // Enhanced land production mapping
    const landProduction: Record<string, ManaColor[]> = {
      // Basic lands
      'Island': ['U'],
      'Mountain': ['R'],
      'Plains': ['W'],
      'Swamp': ['B'],
      'Forest': ['G'],
      
      // Fetchlands
      'Flooded Strand': ['W', 'U'],
      'Polluted Delta': ['U', 'B'],
      'Bloodstained Mire': ['B', 'R'],
      'Wooded Foothills': ['R', 'G'],
      'Windswept Heath': ['G', 'W'],
      'Scalding Tarn': ['U', 'R'],
      'Verdant Catacombs': ['B', 'G'],
      'Marsh Flats': ['W', 'B'],
      'Misty Rainforest': ['G', 'U'],
      'Arid Mesa': ['R', 'W'],
      
      // Dual lands
      'Volcanic Island': ['U', 'R'],
      'Tundra': ['W', 'U'],
      'Underground Sea': ['U', 'B'],
      'Badlands': ['B', 'R'],
      'Taiga': ['R', 'G'],
      'Savannah': ['G', 'W'],
      'Scrubland': ['W', 'B'],
      'Tropical Island': ['G', 'U'],
      'Bayou': ['B', 'G'],
      'Plateau': ['R', 'W'],
      
      // Shocklands
      'Steam Vents': ['U', 'R'],
      'Hallowed Fountain': ['W', 'U'],
      'Watery Grave': ['U', 'B'],
      'Blood Crypt': ['B', 'R'],
      'Stomping Ground': ['R', 'G'],
      'Temple Garden': ['G', 'W'],
      'Godless Shrine': ['W', 'B'],
      'Breeding Pool': ['G', 'U'],
      'Overgrown Tomb': ['B', 'G'],
      'Sacred Foundry': ['R', 'W'],
      
      // Utility lands
      'Command Tower': ['W', 'U', 'B', 'R', 'G'],
      'City of Brass': ['W', 'U', 'B', 'R', 'G'],
      'Mana Confluence': ['W', 'U', 'B', 'R', 'G'],
      
      // Fastlands
      'Concealed Courtyard': ['W', 'B'],
      'Inspiring Vantage': ['R', 'W'],
      
      // Special lands
      'Phyrexian Tower': [], // Colorless but sacrifices creatures
      'Starting Town': [] // Colorless utility land
    }
    
    if (landProduction[name]) {
      return landProduction[name]
    }
    
    // Heuristics for unknown lands
    const lowerName = name.toLowerCase()
    if (lowerName.includes('island')) return ['U']
    if (lowerName.includes('mountain')) return ['R']
    if (lowerName.includes('plains')) return ['W']
    if (lowerName.includes('swamp')) return ['B']
    if (lowerName.includes('forest')) return ['G']
    
    // Default: produces colorless
    return []
  }

  private static calculateHypergeometric(
    populationSize: number,
    successStates: number,
    sampleSize: number,
    observedSuccesses: number
  ): number {
    // Improved hypergeometric calculation
    if (successStates === 0 || populationSize === 0) return 0
    if (observedSuccesses === 0) return 1
    if (observedSuccesses > sampleSize || observedSuccesses > successStates) return 0
    if (sampleSize > populationSize) return 0

    // Calculate probability of getting AT LEAST observedSuccesses
    let probability = 0
    
    for (let k = observedSuccesses; k <= Math.min(sampleSize, successStates); k++) {
      // P(X = k) using hypergeometric formula
      const numerator = this.combination(successStates, k) * this.combination(populationSize - successStates, sampleSize - k)
      const denominator = this.combination(populationSize, sampleSize)
      
      if (denominator > 0) {
        probability += numerator / denominator
      }
    }
    
    return Math.min(1, Math.max(0, probability))
  }

  private static combination(n: number, k: number): number {
    if (k > n || k < 0) return 0
    if (k === 0 || k === n) return 1
    
    // Use the more efficient formula: C(n,k) = C(n,n-k)
    k = Math.min(k, n - k)
    
    let result = 1
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1)
    }
    
    return Math.round(result)
  }

  private static calculateColorProbabilities(
    cards: DeckCard[],
    colorRequirements: Record<ManaColor, number>,
    turn: number
  ): Record<ManaColor, number> {
    const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)
    const handSize = 7
    const cardsDrawn = Math.min(handSize + turn - 1, totalCards)

    const probabilities: Record<ManaColor, number> = {} as Record<ManaColor, number>

    MANA_COLORS.forEach(color => {
      const sourcesForColor = cards
        .filter(card => card.isLand && card.producedMana?.includes(color))
        .reduce((sum, card) => sum + card.quantity, 0)

      const requiredSources = colorRequirements[color] || 0
      
      if (requiredSources === 0) {
        probabilities[color] = 1
      } else {
        // Calculate probability of having at least 1 source of this color
        const minSources = Math.min(1, requiredSources)
        probabilities[color] = this.calculateHypergeometric(
          totalCards,
          sourcesForColor,
          cardsDrawn,
          minSources
        )
      }
    })

    return probabilities
  }

  private static generateRecommendations(
    cards: DeckCard[],
    analysis: Partial<AnalysisResult>
  ): string[] {
    const recommendations: string[] = []
    const totalCards = analysis.totalCards || 0
    const totalLands = analysis.totalLands || 0
    const landRatio = analysis.landRatio || 0
    const averageCMC = analysis.averageCMC || 0

    // Dynamic land ratio recommendations based on average CMC
    const idealLandRatio = this.calculateIdealLandRatio(averageCMC)
    
    if (landRatio < idealLandRatio - 0.05) {
      const suggestedLands = Math.ceil(totalCards * idealLandRatio) - totalLands
      recommendations.push(`Your manabase seems light for an average CMC of ${averageCMC.toFixed(1)}. Consider adding ${suggestedLands} more land(s).`)
    }

    if (landRatio > idealLandRatio + 0.05) {
      const excessLands = totalLands - Math.floor(totalCards * idealLandRatio)
      recommendations.push(`Your manabase seems heavy for an average CMC of ${averageCMC.toFixed(1)}. You could reduce by ${excessLands} land(s).`)
    }

    // Color distribution analysis
    const activeColors = Object.values(analysis.colorDistribution || {}).filter(count => count > 0).length
    const colorDistribution = analysis.colorDistribution || {}
    
    if (activeColors >= 3) {
      recommendations.push('Multicolor deck detected. Prioritize dual lands and fixing sources like fetchlands.')
    }

    // Check for color imbalance
    const colorCounts = Object.entries(colorDistribution).filter(([_, count]) => (count as number) > 0)
    if (colorCounts.length >= 2) {
      const maxColor = Math.max(...colorCounts.map(([_, count]) => count as number))
      const minColor = Math.min(...colorCounts.map(([_, count]) => count as number))
      
      if (maxColor > minColor * 2) {
        recommendations.push('Color imbalance detected. Adjust land proportions to better match your mana needs.')
      }
    }

    // CMC-based recommendations
    if (averageCMC < 2) {
      recommendations.push('Very aggressive deck detected. Prioritize fast lands and avoid those that enter tapped.')
    } else if (averageCMC > 4) {
      recommendations.push('High curve deck. You can afford some utility lands that enter tapped.')
    }

    // Consistency recommendations
    if ((analysis.consistency || 0) < 0.7) {
      recommendations.push('Consistency can be improved. Increase the number of sources for your main colors.')
    }

    // Deck size recommendations
    if (totalCards < 60) {
      recommendations.push(`Your deck contains ${totalCards} cards. Consider optimizing to 60 cards for better consistency.`)
    } else if (totalCards > 100) {
      recommendations.push(`${totalCards}-card deck detected. Make sure you have enough mana sources for each color.`)
    }

    if (recommendations.length === 0) {
      recommendations.push('Your manabase looks well balanced! Keep it up.')
    }

    return recommendations
  }

  private static calculateIdealLandRatio(averageCMC: number): number {
    // Dynamic land ratio based on average CMC
    // Based on Frank Karsten's research and common deck building principles
    if (averageCMC <= 1.5) return 0.33      // Very aggressive (20/60)
    if (averageCMC <= 2.0) return 0.35      // Aggressive (21/60)
    if (averageCMC <= 2.5) return 0.37      // Midrange-low (22/60)
    if (averageCMC <= 3.0) return 0.40      // Midrange (24/60)
    if (averageCMC <= 3.5) return 0.42      // Midrange-high (25/60)
    if (averageCMC <= 4.0) return 0.43      // Control-low (26/60)
    return 0.45                             // Control/Ramp (27/60)
  }

  public static analyzeDeck(deckList: string): AnalysisResult {
    const cards = this.parseDeckList(deckList)
    
    const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)
    const lands = cards.filter(card => card.isLand)
    const nonLands = cards.filter(card => !card.isLand)
    
    const totalLands = lands.reduce((sum, card) => sum + card.quantity, 0)
    const totalNonLands = nonLands.reduce((sum, card) => sum + card.quantity, 0)

    // Calcul de la distribution des couleurs dans les terrains
    const colorDistribution: Record<ManaColor, number> = {} as Record<ManaColor, number>
    MANA_COLORS.forEach(color => {
      colorDistribution[color] = lands
        .filter(card => card.producedMana?.includes(color))
        .reduce((sum, card) => sum + card.quantity, 0)
    })

    // Calcul des besoins en mana basé sur les sorts
    const manaRequirements: Record<ManaColor, number> = {} as Record<ManaColor, number>
    MANA_COLORS.forEach(color => {
      const requirement = nonLands
        .filter(card => card.colors.includes(color))
        .reduce((sum, card) => sum + card.quantity, 0)
      manaRequirements[color] = Math.ceil(requirement * 0.6) // Approximation Frank Karsten
    })

    // Calcul des probabilités par tour
    const probabilities = {
      turn1: this.calculateColorProbabilities(cards, manaRequirements, 1),
      turn2: this.calculateColorProbabilities(cards, manaRequirements, 2),
      turn3: this.calculateColorProbabilities(cards, manaRequirements, 3),
      turn4: this.calculateColorProbabilities(cards, manaRequirements, 4)
    }

    // Calcul de la consistance globale
    const avgProbability = MANA_COLORS.reduce((sum, color) => {
      return sum + (probabilities.turn2[color] || 0)
    }, 0) / MANA_COLORS.length

    const consistency = avgProbability

    // Détermination du rating
    let rating: 'excellent' | 'good' | 'average' | 'poor'
    if (consistency >= 0.9) rating = 'excellent'
    else if (consistency >= 0.8) rating = 'good'
    else if (consistency >= 0.7) rating = 'average'
    else rating = 'poor'

    const partialAnalysis = {
      totalCards,
      totalLands,
      totalNonLands,
      colorDistribution,
      manaRequirements,
      consistency,
      rating
    }

    const recommendations = this.generateRecommendations(cards, partialAnalysis)

    const averageCMC = totalNonLands > 0 
      ? nonLands.reduce((sum, card) => sum + (card.cmc * card.quantity), 0) / totalNonLands
      : 0
    const landRatio = totalLands / totalCards

    // Calculate spell analysis (simplified version inspired by reference project)
    const spellAnalysis: Record<string, { castable: number; total: number; percentage: number }> = {}
    nonLands.forEach(spell => {
      const total = spell.quantity
      const castable = Math.round(total * (consistency + 0.1)) // Simplified calculation
      spellAnalysis[spell.name] = {
        castable,
        total,
        percentage: Math.round((castable / total) * 100)
      }
    })

    return {
      ...partialAnalysis,
      recommendations,
      probabilities: {
        turn1: { anyColor: 0.95, specificColors: probabilities.turn1 },
        turn2: { anyColor: 0.98, specificColors: probabilities.turn2 },
        turn3: { anyColor: 0.99, specificColors: probabilities.turn3 },
        turn4: { anyColor: 0.995, specificColors: probabilities.turn4 }
      },
      averageCMC,
      landRatio,
      spellAnalysis
    }
  }

  private static getBasicLandColors(name: string): ManaColor[] {
    const lowerName = name.toLowerCase()
    
    // Basic lands
    if (lowerName.includes('island')) return ['U']
    if (lowerName.includes('mountain')) return ['R']
    if (lowerName.includes('plains')) return ['W']
    if (lowerName.includes('swamp')) return ['B']
    if (lowerName.includes('forest')) return ['G']
    
    // Default: produces colorless
    return []
  }
} 