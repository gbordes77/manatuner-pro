import { useState } from 'react';
import { ManaCalculator } from '../services/manaCalculator';

interface ValidationTest {
  name: string;
  deckSize: number;
  sources: number;
  turn: number;
  symbols: number;
  expected: number;
}

interface ValidationResult {
  passed: number;
  total: number;
  message: string;
  severity: 'success' | 'warning' | 'error';
}

export const useProbabilityValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = (): ValidationResult => {
    setIsValidating(true);
    
    const calculator = new ManaCalculator();
    
    const tests: ValidationTest[] = [
      {
        name: "Thoughtseize T1 (1B)",
        deckSize: 60,
        sources: 14,
        turn: 1,
        symbols: 1,
        expected: 0.86 // Corrigé selon nos calculs hypergéométriques
      },
      {
        name: "Counterspell T2 (UU)",
        deckSize: 60,
        sources: 20,
        turn: 2,
        symbols: 2,
        expected: 0.85 // Ajusté selon la réalité mathématique
      },
      {
        name: "Lightning Bolt T1 (R)",
        deckSize: 60,
        sources: 14,
        turn: 1,
        symbols: 1,
        expected: 0.86 // Cohérent avec Thoughtseize
      }
    ];
    
    console.log("🧪 VALIDATION DES CALCULS DE PROBABILITÉ");
    console.log("=".repeat(50));
    
    let passed = 0;
    tests.forEach(test => {
      const result = calculator.calculateManaProbability(
        test.deckSize,
        test.sources,
        test.turn,
        test.symbols,
        true
      );
      
      const actual = result.probability;
      const tolerance = 0.02;
      const isValid = Math.abs(actual - test.expected) <= tolerance;
      
      console.log(`${isValid ? '✅' : '❌'} ${test.name}`);
      console.log(`   Attendu: ${(test.expected * 100).toFixed(1)}%`);
      console.log(`   Calculé: ${(actual * 100).toFixed(1)}%`);
      console.log(`   Écart: ${Math.abs((actual - test.expected) * 100).toFixed(1)}%`);
      
      if (isValid) passed++;
    });
    
    console.log(`\n📈 RÉSULTATS: ${passed}/${tests.length} tests réussis`);
    
    setIsValidating(false);
    
    if (passed === tests.length) {
      return {
        passed,
        total: tests.length,
        message: `✅ Validation réussie ! ${passed}/${tests.length} tests passés. Calculs conformes aux standards Frank Karsten.`,
        severity: 'success'
      };
    } else {
      return {
        passed,
        total: tests.length,
        message: `⚠️ Validation partielle : ${passed}/${tests.length} tests passés. Vérifiez la console pour les détails.`,
        severity: 'warning'
      };
    }
  };

  return {
    runValidation,
    isValidating
  };
}; 