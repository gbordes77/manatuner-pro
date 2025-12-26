import {
    BarChart as BarChartIcon,
    Bolt as BoltIcon,
    Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import { Box, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { AnalysisResult } from "../../services/deckAnalyzer";
import EnhancedCharts from "../EnhancedCharts";
import EnhancedRecommendations from "../EnhancedRecommendations";
import EnhancedSpellAnalysis from "../EnhancedSpellAnalysis";

interface AnalysisTabProps {
  analysisResult: AnalysisResult;
  isMobile: boolean;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  analysisResult,
  isMobile,
}) => {
  const [subTab, setSubTab] = useState(0);

  return (
    <Box>
      {/* Sub-navigation */}
      <Tabs
        value={subTab}
        onChange={(_, v) => setSubTab(v)}
        variant="fullWidth"
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "medium",
            fontSize: isMobile ? "0.8rem" : "0.9rem",
          },
        }}
      >
        <Tab icon={<BoltIcon />} iconPosition="start" label="Spells & Tempo" />
        <Tab icon={<BarChartIcon />} iconPosition="start" label="Probabilities" />
        <Tab icon={<LightbulbIcon />} iconPosition="start" label="Recommendations" />
      </Tabs>

      {/* Spells & Tempo */}
      {subTab === 0 && (
        <EnhancedSpellAnalysis
          spellAnalysis={analysisResult.spellAnalysis}
          tempoSpellAnalysis={analysisResult.tempoSpellAnalysis}
          tempoImpactByColor={analysisResult.tempoImpactByColor}
        />
      )}

      {/* Probabilities */}
      {subTab === 1 && (
        <EnhancedCharts
          analysis={{
            id: "current-analysis",
            deckId: "current-deck",
            format: "modern",
            totalCards: analysisResult.totalCards,
            totalLands: analysisResult.totalLands,
            colorDistribution: analysisResult.colorDistribution,
            manaCurve: {
              "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7+": 0,
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
      )}

      {/* All Recommendations */}
      {subTab === 2 && (
        <EnhancedRecommendations
          recommendations={analysisResult.recommendations}
          analysis={{
            consistency: analysisResult.consistency,
            colorScrew: (1 - analysisResult.consistency) * 0.2,
            landRatio: analysisResult.landRatio,
            avgCMC: analysisResult.averageCMC,
          }}
        />
      )}
    </Box>
  );
};
