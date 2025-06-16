// Web Worker for heavy mana calculations
// This runs in a separate thread to avoid blocking the main UI

// Frank Karsten's tables for optimal sources
const KARSTEN_TABLES = {
  1: { 1: 14, 2: 13, 3: 12, 4: 11, 5: 10, 6: 9 },    // 1 symbol
  2: { 2: 20, 3: 18, 4: 16, 5: 15, 6: 14 },          // 2 symbols  
  3: { 3: 23, 4: 20, 5: 19, 6: 18 }                   // 3 symbols
}

// Memoization cache for performance
const calculationCache = new Map()

// Combination function with memoization
function combination(n, k) {
  if (k > n || k < 0) return 0
  if (k === 0 || k === n) return 1
  
  const key = `${n},${k}`
  if (calculationCache.has(key)) {
    return calculationCache.get(key)
  }
  
  let result = 1
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1)
  }
  
  calculationCache.set(key, result)
  return result
}

// Hypergeometric distribution
function hypergeometric(N, K, n, k) {
  return (
    combination(K, k) * 
    combination(N - K, n - k) / 
    combination(N, n)
  )
}

// Cumulative hypergeometric (at least k successes)
function cumulativeHypergeometric(N, K, n, minK) {
  let probability = 0
  const maxK = Math.min(n, K)
  
  for (let k = minK; k <= maxK; k++) {
    probability += hypergeometric(N, K, n, k)
  }
  
  return probability
}

// Main calculation function using Frank Karsten methodology
function calculateManaProbability(deckSize, sourcesInDeck, turn, symbolsNeeded, onThePlay = true) {
  // Cards seen = starting hand + draws (7 + turn - 1)
  // -1 if playing first (no draw on turn 1)
  const cardsSeen = 7 + turn - (onThePlay ? 1 : 0)
  
  // Calculate probability using hypergeometric distribution
  const probability = cumulativeHypergeometric(
    deckSize,
    sourcesInDeck,
    cardsSeen,
    symbolsNeeded
  )
  
  // Get Karsten recommendation
  const karstenRequirement = KARSTEN_TABLES[symbolsNeeded]?.[turn] || 0
  
  return {
    probability,
    meetsThreshold: probability >= 0.90,
    sourcesNeeded: karstenRequirement,
    sourcesAvailable: sourcesInDeck,
    cardsSeen,
    turn,
    symbolsNeeded
  }
}

// Analyze a complete card
function analyzeCard(cardData, deckData) {
  const results = {}
  
  // Parse mana cost to extract colored symbols
  const manaCost = cardData.mana_cost || '{2}'
  const symbols = manaCost.match(/\{[WUBRG]\}/g) || []
  
  if (symbols.length === 0) {
    // Colorless or artifact - high probability
    return {
      overall: { probability: 0.95, meetsThreshold: true }
    }
  }
  
  // Count symbols by color
  const colorCounts = {}
  symbols.forEach(symbol => {
    const color = symbol.replace(/[{}]/g, '')
    colorCounts[color] = (colorCounts[color] || 0) + 1
  })
  
  // Calculate for each color requirement
  let worstProbability = 1
  
  for (const [color, count] of Object.entries(colorCounts)) {
    const sourcesAvailable = deckData.sources[color] || 0
    const result = calculateManaProbability(
      deckData.size,
      sourcesAvailable,
      cardData.cmc || 2,
      count,
      true
    )
    
    results[color] = result
    worstProbability = Math.min(worstProbability, result.probability)
  }
  
  // Overall result is the worst case
  results.overall = {
    probability: worstProbability,
    meetsThreshold: worstProbability >= 0.90,
    colors: Object.keys(colorCounts),
    totalSymbols: Object.values(colorCounts).reduce((sum, count) => sum + count, 0)
  }
  
  return results
}

// Batch processing for multiple cards
function analyzeDeckBatch(cards, deckData) {
  const results = {}
  const startTime = performance.now()
  
  cards.forEach((card, index) => {
    try {
      results[card.name] = analyzeCard(card, deckData)
      
      // Send progress updates for large batches
      if (index % 10 === 0) {
        self.postMessage({
          type: 'progress',
          completed: index + 1,
          total: cards.length,
          currentCard: card.name
        })
      }
    } catch (error) {
      console.error(`Error analyzing ${card.name}:`, error)
      results[card.name] = {
        error: error.message,
        overall: { probability: 0, meetsThreshold: false }
      }
    }
  })
  
  const endTime = performance.now()
  
  return {
    results,
    metadata: {
      processingTime: endTime - startTime,
      cardsAnalyzed: cards.length,
      cacheSize: calculationCache.size
    }
  }
}

// Message handler
self.onmessage = function(e) {
  const { type, data, id } = e.data
  
  try {
    let result
    
    switch (type) {
      case 'calculate_single':
        result = calculateManaProbability(
          data.deckSize,
          data.sourcesInDeck,
          data.turn,
          data.symbolsNeeded,
          data.onThePlay
        )
        break
        
      case 'analyze_card':
        result = analyzeCard(data.card, data.deck)
        break
        
      case 'analyze_deck_batch':
        result = analyzeDeckBatch(data.cards, data.deck)
        break
        
      case 'clear_cache':
        calculationCache.clear()
        result = { cleared: true, message: 'Cache cleared successfully' }
        break
        
      default:
        throw new Error(`Unknown calculation type: ${type}`)
    }
    
    self.postMessage({
      type: 'result',
      id,
      data: result
    })
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: {
        message: error.message,
        stack: error.stack
      }
    })
  }
}

// Worker ready signal
self.postMessage({
  type: 'ready',
  message: 'Mana Calculator Worker initialized successfully'
}) 