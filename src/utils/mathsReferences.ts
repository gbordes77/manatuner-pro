/**
 * Utilitaires pour référencer la page Mathematics
 * À utiliser chaque fois qu'on mentionne des concepts mathématiques
 */

export const MATHEMATICS_ROUTE = '/mathematics';

export const createMathReference = (text: string, anchor?: string) => {
  const href = anchor ? `${MATHEMATICS_ROUTE}#${anchor}` : MATHEMATICS_ROUTE;
  return `${text} ([learn more about the mathematics](${href}))`;
};

export const MATH_REFERENCES = {
  hypergeometric: () => createMathReference(
    'hypergeometric distribution',
    'hypergeometric'
  ),

  monteCarlo: () => createMathReference(
    'Monte Carlo simulation',
    'monte-carlo'
  ),

  frankKarsten: () => createMathReference(
    'Frank Karsten 2022 standards',
    'frank-karsten'
  ),

  binomial: () => createMathReference(
    'binomial coefficients',
    'implementation'
  ),

  probability: () => createMathReference(
    'probability calculations',
    'mathematics'
  ),

  landOptimization: () => createMathReference(
    'land count optimization',
    'practical'
  )
};

/**
 * Messages avec références mathématiques pour l'UI
 */
export const MATH_MESSAGES = {
  analysisComplete: "Analysis complete using Frank Karsten's mathematical models. 📐 [View the mathematics](/mathematics)",

  probabilityBased: "Recommendations based on hypergeometric distribution calculations. 🔢 [Learn more](/mathematics)",

  monteCarloBased: "Results validated through Monte Carlo simulation. 🎲 [See the science](/mathematics)",

  optimizationNote: "Land counts optimized using proven statistical methods. ⚡ [Understanding the math](/mathematics)"
};

export default {
  MATHEMATICS_ROUTE,
  createMathReference,
  MATH_REFERENCES,
  MATH_MESSAGES
};
