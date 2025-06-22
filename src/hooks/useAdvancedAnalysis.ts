// Advanced Analysis Hooks - ManaTuner Pro
// Hooks pour utiliser les fonctionnalités mathématiques avancées

import { useState, useCallback, useMemo } from 'react';
import { 
  DeckConfiguration,
  MulliganCriteria,
  MulliganResult,
  TurnByTurnAnalysis,
  CastingAnalysis,
  ManaCost,
  ManaSource,
  MonteCarloSimulation,
  MultiConstraint,
  MAGIC_CONSTANTS
} from '../types/maths';
import { AdvancedMathEngine } from '../services/advancedMaths';

interface UseAdvancedAnalysisOptions {
  maxTurns?: number;
  simulations?: number;
  mulliganCriteria?: MulliganCriteria;
}

interface AdvancedAnalysisState {
  isLoading: boolean;
  error: string | null;
  turnByTurnAnalysis: TurnByTurnAnalysis[] | null;
  mulliganAnalysis: MulliganResult | null;
  castingAnalysis: { [spellName: string]: CastingAnalysis };
  monteCarloResults: MonteCarloSimulation | null;
}

export const useAdvancedAnalysis = (options: UseAdvancedAnalysisOptions = {}) => {
  const {
    maxTurns = 6,
    simulations = 10000,
    mulliganCriteria = {
      minLands: 2,
      maxLands: 5,
      keepProbability: 0.8,
      aggressiveness: 'normal'
    }
  } = options;

  const [state, setState] = useState<AdvancedAnalysisState>({
    isLoading: false,
    error: null,
    turnByTurnAnalysis: null,
    mulliganAnalysis: null,
    castingAnalysis: {},
    monteCarloResults: null
  });

  const mathEngine = useMemo(() => new AdvancedMathEngine(), []);

  const analyzeTurnByTurn = useCallback(async (
    deck: DeckConfiguration,
    onThePlay: boolean = true
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysis = mathEngine.calculateTurnByTurnProbabilities(deck, maxTurns, onThePlay);
      
      setState(prev => ({
        ...prev,
        turnByTurnAnalysis: analysis,
        isLoading: false
      }));

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error in turn-by-turn analysis';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      throw error;
    }
  }, [mathEngine, maxTurns]);

  const analyzeMulligan = useCallback(async (
    deck: DeckConfiguration,
    criteria: MulliganCriteria = mulliganCriteria
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysis = mathEngine.calculateMulliganProbability(deck, criteria);
      
      setState(prev => ({
        ...prev,
        mulliganAnalysis: analysis,
        isLoading: false
      }));

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error in mulligan analysis';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      throw error;
    }
  }, [mathEngine, mulliganCriteria]);

  const analyzeCastingProbability = useCallback(async (
    spell: ManaCost,
    turn: number,
    manabase: ManaSource[],
    deck: DeckConfiguration,
    spellName: string = 'Unknown Spell'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysis = mathEngine.calculateCastingProbability(spell, turn, manabase, deck, simulations);
      
      setState(prev => ({
        ...prev,
        castingAnalysis: {
          ...prev.castingAnalysis,
          [spellName]: analysis
        },
        isLoading: false
      }));

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error in casting analysis';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      throw error;
    }
  }, [mathEngine, simulations]);

  const runMonteCarloSimulation = useCallback(async (
    deck: DeckConfiguration,
    targetSpells: ManaCost[],
    iterations: number = simulations
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = mathEngine.runMonteCarloSimulation(deck, targetSpells, maxTurns, iterations);
      
      setState(prev => ({
        ...prev,
        monteCarloResults: results,
        isLoading: false
      }));

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error in Monte Carlo simulation';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      throw error;
    }
  }, [mathEngine, maxTurns, simulations]);

  const analyzeMultivariate = useCallback(async (
    deckSize: number,
    handSize: number,
    constraints: MultiConstraint[]
  ) => {
    try {
      return mathEngine.multivariateHypergeometric(deckSize, handSize, constraints);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error in multivariate analysis';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [mathEngine]);

  const clearAnalysis = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      turnByTurnAnalysis: null,
      mulliganAnalysis: null,
      castingAnalysis: {},
      monteCarloResults: null
    });
  }, []);

  return {
    ...state,
    analyzeTurnByTurn,
    analyzeMulligan,
    analyzeCastingProbability,
    runMonteCarloSimulation,
    analyzeMultivariate,
    clearAnalysis
  };
};

// Hook spécialisé pour l'analyse de fetchlands
export const useFetchlandAnalysis = () => {
  const mathEngine = useMemo(() => new AdvancedMathEngine(), []);

  const analyzeFetchlandImpact = useCallback((
    baseSources: { [color: string]: number },
    fetchlands: Array<{ colors: string[]; quantity: number }>,
    targetSpell: ManaCost,
    turn: number
  ) => {
    // Calcul de l'impact des fetchlands selon Frank Karsten
    // Un fetchland compte comme 1 source pour chaque couleur qu'il peut chercher
    
    const enhancedSources = { ...baseSources };
    
    fetchlands.forEach(fetchland => {
      fetchland.colors.forEach(color => {
        enhancedSources[color] = (enhancedSources[color] || 0) + fetchland.quantity;
      });
    });

    const cardsDrawn = MAGIC_CONSTANTS.STARTING_HAND_SIZE + (turn - 1);
    let castingProbability = 1;

    // Calculer la probabilité pour chaque couleur requise
    Object.entries(targetSpell.specific).forEach(([color, needed]) => {
      const sources = enhancedSources[color] || 0;
      if (sources < needed) {
        castingProbability = 0;
        return;
      }

      // Probabilité d'avoir au moins 'needed' sources de cette couleur
      const prob = mathEngine['calculator'].cumulativeHypergeometric(
        60, // Deck size standard
        sources,
        cardsDrawn,
        needed
      );
      
      castingProbability *= prob;
    });

    return {
      probability: castingProbability,
      enhancedSources,
      improvement: castingProbability // vs baseline sans fetchlands
    };
  }, [mathEngine]);

  return { analyzeFetchlandImpact };
};

// Hook pour l'optimisation de manabase
export const useManabaseOptimization = () => {
  const [optimizationState, setOptimizationState] = useState({
    isOptimizing: false,
    currentScore: 0,
    optimizedScore: 0,
    recommendations: [] as Array<{
      change: string;
      impact: number;
      reasoning: string;
    }>
  });

  const mathEngine = useMemo(() => new AdvancedMathEngine(), []);

  const optimizeManabase = useCallback(async (
    deck: DeckConfiguration,
    targetSpells: ManaCost[],
    constraints: {
      maxLands?: number;
      minLands?: number;
      budgetConstraints?: string[];
    } = {}
  ) => {
    setOptimizationState(prev => ({ ...prev, isOptimizing: true }));

    try {
      // Algorithme d'optimisation génétique simplifié
      const currentScore = await evaluateManabase(deck, targetSpells);
      
      // Générer des variations de manabase
      const variations = generateManabaseVariations(deck, constraints);
      
      let bestScore = currentScore;
      let bestConfiguration = deck;
             const recommendations: Array<{
         change: string;
         impact: number;
         reasoning: string;
       }> = [];

      for (const variation of variations) {
        const score = await evaluateManabase(variation, targetSpells);
        if (score > bestScore) {
          bestScore = score;
          bestConfiguration = variation;
          recommendations.push({
            change: `Adjust manabase configuration`,
            impact: score - currentScore,
            reasoning: 'Improved casting consistency'
          });
        }
      }

      setOptimizationState({
        isOptimizing: false,
        currentScore,
        optimizedScore: bestScore,
        recommendations: recommendations.slice(0, 5) // Top 5 recommendations
      });

      return {
        currentScore,
        optimizedScore: bestScore,
        optimizedConfiguration: bestConfiguration,
        recommendations
      };

    } catch (error) {
      setOptimizationState(prev => ({ ...prev, isOptimizing: false }));
      throw error;
    }

    async function evaluateManabase(config: DeckConfiguration, spells: ManaCost[]): Promise<number> {
      // Score basé sur la probabilité moyenne de cast des sorts critiques
      let totalScore = 0;
      
      for (const spell of spells) {
        const analysis = mathEngine.calculateCastingProbability(
          spell,
          3, // Turn critique
          [], // Manabase simplifiée
          config,
          1000 // Moins de simulations pour l'optimisation
        );
        totalScore += analysis.probability;
      }
      
      return spells.length > 0 ? totalScore / spells.length : 0;
    }

    function generateManabaseVariations(
      baseConfig: DeckConfiguration,
      constraints: any
    ): DeckConfiguration[] {
      // Génération simplifiée de variations
      const variations: DeckConfiguration[] = [];
      
      // Variation +1 terrain
      if (!constraints.maxLands || baseConfig.totalLands < constraints.maxLands) {
        variations.push({
          ...baseConfig,
          totalLands: baseConfig.totalLands + 1
        });
      }
      
      // Variation -1 terrain
      if (!constraints.minLands || baseConfig.totalLands > constraints.minLands) {
        variations.push({
          ...baseConfig,
          totalLands: baseConfig.totalLands - 1
        });
      }
      
      return variations;
    }
  }, [mathEngine]);

  return {
    ...optimizationState,
    optimizeManabase
  };
};

// Hook pour l'analyse comparative
export const useComparativeAnalysis = () => {
  const mathEngine = useMemo(() => new AdvancedMathEngine(), []);

     const compareConfigurations = useCallback(async (
     configurations: Array<{
       name: string;
       deck: DeckConfiguration;
       spells: ManaCost[];
     }>
   ) => {
     const results: Array<{
       name: string;
       turnByTurnScore: number;
       mulliganScore: number;
       castingScore: number;
       overallScore: number;
     }> = [];

    for (const config of configurations) {
      const turnByTurn = mathEngine.calculateTurnByTurnProbabilities(config.deck, 6);
      const mulligan = mathEngine.calculateMulliganProbability(config.deck, {
        minLands: 2,
        maxLands: 5,
        keepProbability: 0.8,
        aggressiveness: 'normal'
      });

      let averageCastingProb = 0;
      if (config.spells.length > 0) {
        for (const spell of config.spells) {
          const casting = mathEngine.calculateCastingProbability(
            spell,
            3,
            [], // Simplified manabase
            config.deck,
            1000
          );
          averageCastingProb += casting.probability;
        }
        averageCastingProb /= config.spells.length;
      }

      results.push({
        name: config.name,
        turnByTurnScore: turnByTurn.reduce((sum, turn) => 
          sum + (turn.probabilities.atLeastNLands[3] || 0), 0) / turnByTurn.length,
        mulliganScore: mulligan.finalKeepProbability,
        castingScore: averageCastingProb,
        overallScore: (
          (turnByTurn.reduce((sum, turn) => sum + (turn.probabilities.atLeastNLands[3] || 0), 0) / turnByTurn.length) +
          mulligan.finalKeepProbability +
          averageCastingProb
        ) / 3
      });
    }

    return results.sort((a, b) => b.overallScore - a.overallScore);
  }, [mathEngine]);

  return { compareConfigurations };
}; 