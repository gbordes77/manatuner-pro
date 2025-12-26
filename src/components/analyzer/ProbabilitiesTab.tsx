import React from "react";
import { AnalysisResult } from "../../services/deckAnalyzer";
import EnhancedCharts from "../EnhancedCharts";

interface ProbabilitiesTabProps {
  analysisResult: AnalysisResult;
}

export const ProbabilitiesTab: React.FC<ProbabilitiesTabProps> = ({
  analysisResult,
}) => {
  return (
    <EnhancedCharts
      analysis={{
        id: "current-analysis",
        deckId: "current-deck",
        format: "modern",
        totalCards: analysisResult.totalCards,
        totalLands: analysisResult.totalLands,
        colorDistribution: analysisResult.colorDistribution,
        manaCurve: {
          "0": 0,
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7+": 0,
        },
        overallScore: Math.round(analysisResult.consistency * 100),
        consistency: Math.round(analysisResult.consistency * 100),
        colorScrew: Math.round((1 - analysisResult.consistency) * 20),
        avgCMC: analysisResult.averageCMC,
        recommendations: [],
        probabilities: {
          turn1: {
            anyColor: analysisResult.probabilities.turn1.anyColor,
            specificColors: analysisResult.probabilities.turn1.specificColors,
            multipleColors: {},
          },
          turn2: {
            anyColor: analysisResult.probabilities.turn2.anyColor,
            specificColors: analysisResult.probabilities.turn2.specificColors,
            multipleColors: {},
          },
          turn3: {
            anyColor: analysisResult.probabilities.turn3.anyColor,
            specificColors: analysisResult.probabilities.turn3.specificColors,
            multipleColors: {},
          },
          turn4: {
            anyColor: analysisResult.probabilities.turn4.anyColor,
            specificColors: analysisResult.probabilities.turn4.specificColors,
            multipleColors: {},
          },
          overall: {
            consistency: analysisResult.consistency,
            colorScrew: (1 - analysisResult.consistency) * 0.2,
            manaFlood: 0.1,
            manaScrew: 0.15,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }}
    />
  );
};
