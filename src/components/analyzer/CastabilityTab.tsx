import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { AnalysisResult } from "../../services/deckAnalyzer";
import ManaCostRow from "../ManaCostRow";
import { isLandCardComplete } from "./landUtils";

interface CastabilityTabProps {
  deckList: string;
  analysisResult: AnalysisResult;
}

export const CastabilityTab: React.FC<CastabilityTabProps> = ({
  deckList,
  analysisResult,
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        🎯 Castability Analysis
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Real-time mana costs from Scryfall with probability calculations
      </Typography>

      {deckList.trim() ? (
        <Box>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Card
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Mana Cost
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Probabilities
              </Typography>
            </Grid>
          </Grid>

          {deckList
            .split("\n")
            .filter((line) => line.trim())
            .map((line, index) => {
              const match = line.match(
                /^(\d+)\s+(.+?)(?:\s*\([A-Z0-9]+\)\s*\d*)?$/,
              );
              if (!match) return null;

              const quantity = parseInt(match[1]);
              const cardName = match[2].replace(/^A-/, "").trim();

              // Filtrer les terrains - ne montrer que les sorts
              const isLand = isLandCardComplete(cardName);
              if (isLand) return null;

              return (
                <ManaCostRow
                  key={index}
                  cardName={cardName}
                  quantity={quantity}
                  deckSources={analysisResult?.colorDistribution}
                  totalLands={analysisResult?.totalLands || 0}
                  totalCards={analysisResult?.totalCards || 60}
                />
              );
            })
            .filter(Boolean)}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No deck list available. Please enter a deck list and analyze it first.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          💡 P1 = Perfect scenario (all lands on curve) | P2 = Realistic probability (accounts for mana screw)
        </Typography>
      </Box>
    </>
  );
};
