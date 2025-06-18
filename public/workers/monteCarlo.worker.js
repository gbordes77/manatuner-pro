/**
 * 🎯 MONTE CARLO WEB WORKER - Performance Boost
 * Calculs intensifs en arrière-plan pour éviter de bloquer l'UI
 */

// Hypergeometric calculation in worker context
function calculateHypergeometric(populationSize, successesInPopulation, sampleSize, successesNeeded) {
  if (successesNeeded > sampleSize) return 0;
  if (successesInPopulation < successesNeeded) return 0;
  if (populationSize < sampleSize) return 0;
  
  // Calculate probability of getting at least successesNeeded successes
  let probability = 0;
  
  for (let k = successesNeeded; k <= Math.min(sampleSize, successesInPopulation); k++) {
    // C(successesInPopulation, k) * C(populationSize - successesInPopulation, sampleSize - k) / C(populationSize, sampleSize)
    const numerator = combination(successesInPopulation, k) * 
                     combination(populationSize - successesInPopulation, sampleSize - k);
    const denominator = combination(populationSize, sampleSize);
    
    probability += numerator / denominator;
  }
  
  return Math.min(1, probability);
}

function combination(n, k) {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  k = Math.min(k, n - k); // Take advantage of symmetry
  
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  
  return result;
}

// 🎯 Monte Carlo Simulation
function runMonteCarloSimulations(config) {
  const { 
    deck, 
    iterations = 10000, 
    targetCard, 
    turns = 7,
    landRatio = 0.4
  } = config;
  
  const results = {
    iterations,
    successCount: 0,
    turnResults: {},
    averageManaAvailable: {},
    consistency: 0,
    mulliganRate: 0
  };
  
  // Initialize turn results
  for (let turn = 1; turn <= turns; turn++) {
    results.turnResults[turn] = 0;
    results.averageManaAvailable[turn] = 0;
  }
  
  let mulligans = 0;
  
  // Run simulations
  for (let sim = 0; sim < iterations; sim++) {
    // Simulate opening hand (7 cards)
    const hand = drawRandomCards(deck, 7);
    const landCount = countLands(hand, landRatio);
    
    // Mulligan decision (simple: keep if 2-5 lands)
    if (landCount < 2 || landCount > 5) {
      mulligans++;
      continue; // Skip this simulation
    }
    
    // Simulate each turn
    let currentHand = [...hand];
    let landsInPlay = 0;
    let manaAvailable = 0;
    let successThisSim = false;
    
    for (let turn = 1; turn <= turns; turn++) {
      // Draw card (except turn 1)
      if (turn > 1) {
        const drawnCard = drawRandomCards(deck, 1)[0];
        if (drawnCard) currentHand.push(drawnCard);
      }
      
      // Play land if available
      const availableLand = currentHand.find(card => isLand(card, landRatio));
      if (availableLand) {
        landsInPlay++;
        currentHand = currentHand.filter(card => card !== availableLand);
      }
      
      manaAvailable = landsInPlay;
      results.averageManaAvailable[turn] += manaAvailable;
      
      // Check if we can cast target card
      if (targetCard && canCastCard(currentHand, targetCard, manaAvailable)) {
        if (!successThisSim) {
          results.turnResults[turn]++;
          successThisSim = true;
        }
      }
    }
    
    if (successThisSim) {
      results.successCount++;
    }
  }
  
  // Calculate averages
  const validSims = iterations - mulligans;
  results.consistency = results.successCount / validSims;
  results.mulliganRate = mulligans / iterations;
  
  for (let turn = 1; turn <= turns; turn++) {
    results.averageManaAvailable[turn] /= validSims;
    results.turnResults[turn] = results.turnResults[turn] / validSims;
  }
  
  return results;
}

// Helper functions
function drawRandomCards(deck, count) {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function countLands(hand, landRatio) {
  return hand.filter(card => isLand(card, landRatio)).length;
}

function isLand(card, landRatio) {
  // Simple heuristic: assume cards are lands based on ratio
  return Math.random() < landRatio;
}

function canCastCard(hand, targetCard, manaAvailable) {
  // Simplified: check if we have the card and enough mana
  const hasCard = hand.some(card => card.name === targetCard.name);
  const hasEnoughMana = manaAvailable >= (targetCard.cmc || 0);
  
  return hasCard && hasEnoughMana;
}

// 🎯 Message Handler
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'MONTE_CARLO':
        const results = runMonteCarloSimulations(data);
        self.postMessage({
          type: 'MONTE_CARLO_RESULT',
          data: results,
          success: true
        });
        break;
        
      case 'HYPERGEOMETRIC':
        const probability = calculateHypergeometric(
          data.populationSize,
          data.successesInPopulation,
          data.sampleSize,
          data.successesNeeded
        );
        self.postMessage({
          type: 'HYPERGEOMETRIC_RESULT',
          data: { probability },
          success: true
        });
        break;
        
      case 'BATCH_CALCULATION':
        const batchResults = data.calculations.map(calc => 
          calculateHypergeometric(
            calc.populationSize,
            calc.successesInPopulation,
            calc.sampleSize,
            calc.successesNeeded
          )
        );
        self.postMessage({
          type: 'BATCH_RESULT',
          data: batchResults,
          success: true
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      success: false
    });
  }
};

// Performance monitoring
const PERF_MONITOR = {
  startTime: Date.now(),
  totalCalculations: 0,
  averageTime: 0
};

console.log('🚀 ManaTuner Pro Monte Carlo Worker initialized'); 