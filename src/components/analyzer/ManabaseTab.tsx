import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { AnalysisResult } from "../../services/deckAnalyzer";
import { COLOR_NAMES, MANA_COLORS } from "../../types";
import { LandBreakdownList } from "./LandBreakdownList";
import { ManaDistributionChart } from "./ManaDistributionChart";
import { ManabaseStats } from "./ManabaseStats";
import { categorizeLandComplete, isLandCardComplete } from "./landUtils";

interface ManabaseTabProps {
  deckList: string;
  analysisResult: AnalysisResult;
  isMobile: boolean;
  isSmallMobile: boolean;
}

export const ManabaseTab: React.FC<ManabaseTabProps> = ({
  deckList,
  analysisResult,
  isMobile,
  isSmallMobile,
}) => {
  // Analyser les terrains du deck
  const landTypes: Record<string, string[]> = {};

  deckList
    .split("\n")
    .filter((line) => line.trim())
    .forEach((line) => {
      const match = line.match(/^(\d+)\s+(.+?)(?:\s*\([A-Z0-9]+\)\s*\d*)?$/);
      if (!match) return;

      const quantity = parseInt(match[1]);
      const cardName = match[2].replace(/^A-/, "").trim();

      const isLand = isLandCardComplete(cardName);

      if (isLand) {
        const type = categorizeLandComplete(cardName);
        if (!landTypes[type]) landTypes[type] = [];
        landTypes[type].push(`${quantity}x ${cardName}`);
      }
    });

  // Préparer les données pour le graphique
  const colorData = MANA_COLORS.map((color) => ({
    name: COLOR_NAMES[color],
    value: analysisResult.colorDistribution[color] || 0,
    color:
      {
        W: "#FFF8DC",
        U: "#4A90E2",
        B: "#2C2C2C",
        R: "#E74C3C",
        G: "#27AE60",
      }[color] || "#95A5A6",
    textColor:
      {
        W: "#2C3E50",
        U: "#FFFFFF",
        B: "#FFFFFF",
        R: "#FFFFFF",
        G: "#FFFFFF",
      }[color] || "#2C3E50",
  })).filter((item) => item.value > 0);

  const totalMana = colorData.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Manabase Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Detailed analysis of your land base and mana production capabilities.
        Click on any land name to view it on Scryfall.
      </Typography>

      <Grid container spacing={4}>
        {/* Liste des terrains */}
        <Grid item xs={12} md={6}>
          <LandBreakdownList landTypes={landTypes} isMobile={isMobile} />
        </Grid>

        {/* Graphique de distribution */}
        <Grid item xs={12} md={6}>
          <ManaDistributionChart
            colorData={colorData}
            totalMana={totalMana}
            isMobile={isMobile}
            isSmallMobile={isSmallMobile}
          />
        </Grid>

        {/* Statistiques de la manabase */}
        <Grid item xs={12}>
          <ManabaseStats analysisResult={analysisResult} isMobile={isMobile} />
        </Grid>
      </Grid>

      <Box sx={{ mt: isMobile ? 2 : 3, px: isMobile ? 1 : 0 }}>
        <Typography
          variant={isMobile ? "caption" : "body2"}
          color="text.secondary"
          sx={{
            fontSize: isMobile ? "0.75rem" : undefined,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          This manabase analysis helps you understand your land distribution
          and mana production capabilities for optimal deck performance.
        </Typography>
      </Box>
    </>
  );
};
