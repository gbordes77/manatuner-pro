import { Box, Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { AnalysisResult } from "../../services/deckAnalyzer";

interface ManabaseStatsProps {
  analysisResult: AnalysisResult;
  isMobile: boolean;
}

export const ManabaseStats: React.FC<ManabaseStatsProps> = ({
  analysisResult,
  isMobile,
}) => {
  return (
    <Paper sx={{ p: isMobile ? 2 : 3 }}>
      <Typography
        variant={isMobile ? "body1" : "h6"}
        gutterBottom
        sx={{
          fontSize: isMobile ? "1rem" : undefined,
          fontWeight: "bold",
        }}
      >
        Manabase Statistics
      </Typography>

      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={6} sm={6} md={3}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              color="primary"
              sx={{ fontSize: isMobile ? "1.2rem" : undefined }}
            >
              {analysisResult.totalLands}
            </Typography>
            <Typography
              variant={isMobile ? "caption" : "body2"}
              color="text.secondary"
              sx={{ fontSize: isMobile ? "0.7rem" : undefined }}
            >
              Total Lands
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              color="primary"
              sx={{ fontSize: isMobile ? "1.2rem" : undefined }}
            >
              {(analysisResult.landRatio * 100).toFixed(1)}%
            </Typography>
            <Typography
              variant={isMobile ? "caption" : "body2"}
              color="text.secondary"
              sx={{ fontSize: isMobile ? "0.7rem" : undefined }}
            >
              Land Ratio
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              color="primary"
              sx={{ fontSize: isMobile ? "1.2rem" : undefined }}
            >
              {
                Object.values(analysisResult.colorDistribution).filter(
                  (v) => v > 0
                ).length
              }
            </Typography>
            <Typography
              variant={isMobile ? "caption" : "body2"}
              color="text.secondary"
              sx={{ fontSize: isMobile ? "0.7rem" : undefined }}
            >
              Colors Used
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              color="primary"
              sx={{ fontSize: isMobile ? "1.2rem" : undefined }}
            >
              {analysisResult.averageCMC.toFixed(1)}
            </Typography>
            <Typography
              variant={isMobile ? "caption" : "body2"}
              color="text.secondary"
              sx={{ fontSize: isMobile ? "0.7rem" : undefined }}
            >
              Average CMC
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
