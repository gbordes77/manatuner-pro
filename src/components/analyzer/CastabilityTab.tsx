import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";
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

      <Box sx={{ mt: 3, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: 0.5 }}>
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
            <strong>P1</strong>
            <Tooltip title="P1 (Play First): Probability of casting this spell assuming you hit all your land drops. This is the optimistic scenario where you always draw the lands you need on curve." arrow>
              <IconButton size="small" sx={{ p: 0, mx: 0.5 }}>
                <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
              </IconButton>
            </Tooltip>
            = Perfect scenario (all lands on curve)
          </Box>
          <Box component="span" sx={{ mx: 1 }}>|</Box>
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
            <strong>P2</strong>
            <Tooltip title="P2 (Draw First): Realistic probability that accounts for mana screw (not drawing enough lands). This factors in the chance of missing land drops, giving you a more accurate picture of castability." arrow>
              <IconButton size="small" sx={{ p: 0, mx: 0.5 }}>
                <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
              </IconButton>
            </Tooltip>
            = Realistic (accounts for
            <Tooltip title="Mana screw happens when you don't draw enough lands to cast your spells. It's one of the most frustrating experiences in Magic, and proper manabase construction helps minimize it." arrow>
              <IconButton size="small" sx={{ p: 0, mx: 0.5 }}>
                <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
              </IconButton>
            </Tooltip>
            mana screw)
          </Box>
        </Typography>
      </Box>
    </>
  );
};
