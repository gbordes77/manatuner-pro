import { Box, Grid, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { COLOR_NAMES, MANA_COLORS, MANA_COLOR_STYLES, ManaColor } from "../../constants/manaColors";
import { AnalysisResult } from "../../services/deckAnalyzer";
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

  // Memoized color data for chart
  const colorData = useMemo(() =>
    MANA_COLORS.map((color) => {
      const style = MANA_COLOR_STYLES[color as ManaColor];
      return {
        name: COLOR_NAMES[color],
        value: analysisResult.colorDistribution[color] || 0,
        color: style.bg,
        textColor: style.text,
      };
    }).filter((item) => item.value > 0),
    [analysisResult.colorDistribution]
  );

  const totalMana = useMemo(() =>
    colorData.reduce((sum, item) => sum + item.value, 0),
    [colorData]
  );

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
