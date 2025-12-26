import {
    Terrain as TerrainIcon,
    ViewList as ViewListIcon,
} from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import React from "react";
import { COLOR_NAMES, MANA_COLORS, MANA_COLOR_STYLES, ManaColor } from "../../constants/manaColors";
import { AnalysisResult } from "../../services/deckAnalyzer";

interface OverviewTabProps {
  analysisResult: AnalysisResult;
  isMobile: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  analysisResult,
  isMobile,
}) => {
  return (
    <>
      <Grid container spacing={isMobile ? 1 : 2}>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              textAlign: "center",
              p: isMobile ? 1 : 2,
              minHeight: isMobile ? 80 : 100,
              position: "relative",
            }}
          >
            <CardContent
              sx={{
                p: isMobile ? 1 : undefined,
                "&:last-child": { pb: isMobile ? 1 : undefined },
              }}
            >
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="primary"
                sx={{ fontSize: isMobile ? "1.2rem" : undefined }}
              >
                {analysisResult.totalCards}
              </Typography>
              <Typography
                variant={isMobile ? "caption" : "body2"}
                color="text.secondary"
                sx={{ fontSize: isMobile ? "0.7rem" : undefined }}
              >
                Total Cards
              </Typography>
              <ViewListIcon
                sx={{
                  position: "absolute",
                  top: isMobile ? 4 : 8,
                  right: isMobile ? 4 : 8,
                  opacity: 0.5,
                  fontSize: isMobile ? "1rem" : undefined,
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              textAlign: "center",
              p: isMobile ? 1 : 2,
              minHeight: isMobile ? 80 : 100,
              position: "relative",
            }}
          >
            <CardContent
              sx={{
                p: isMobile ? 1 : undefined,
                "&:last-child": { pb: isMobile ? 1 : undefined },
              }}
            >
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
                Lands
              </Typography>
              <TerrainIcon
                sx={{
                  position: "absolute",
                  top: isMobile ? 4 : 8,
                  right: isMobile ? 4 : 8,
                  opacity: 0.5,
                  fontSize: isMobile ? "1rem" : undefined,
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              textAlign: "center",
              p: isMobile ? 1 : 2,
              minHeight: isMobile ? 80 : 100,
            }}
          >
            <CardContent
              sx={{
                p: isMobile ? 1 : undefined,
                "&:last-child": { pb: isMobile ? 1 : undefined },
              }}
            >
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
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              textAlign: "center",
              p: isMobile ? 1 : 2,
              minHeight: isMobile ? 80 : 100,
            }}
          >
            <CardContent
              sx={{
                p: isMobile ? 1 : undefined,
                "&:last-child": { pb: isMobile ? 1 : undefined },
              }}
            >
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: isMobile ? 2 : 3 }} />

      <Typography
        variant={isMobile ? "body1" : "h6"}
        gutterBottom
        sx={{
          fontSize: isMobile ? "1rem" : undefined,
          fontWeight: "bold",
        }}
      >
        Color Distribution
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: isMobile ? 0.5 : 1,
          flexWrap: "wrap",
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        {MANA_COLORS.map((color) => {
          const count = analysisResult.colorDistribution[color] || 0;
          if (count === 0) return null;

          const style = MANA_COLOR_STYLES[color as ManaColor];

          return (
            <Chip
              key={color}
              label={`${COLOR_NAMES[color]}: ${count}`}
              size={isMobile ? "small" : "medium"}
              sx={{
                backgroundColor: style.bg,
                color: style.text,
                fontWeight: "bold",
                fontSize: isMobile ? "0.7rem" : undefined,
                "& .MuiChip-label": {
                  color: style.text,
                  fontSize: isMobile ? "0.7rem" : undefined,
                },
              }}
            />
          );
        })}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Overall Rating
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          label={(analysisResult.rating || "unknown").toUpperCase()}
          color={
            analysisResult.rating === "excellent"
              ? "success"
              : analysisResult.rating === "good"
                ? "primary"
                : analysisResult.rating === "average"
                  ? "warning"
                  : "error"
          }
          size="medium"
        />
        <Typography variant="body1">
          Consistency: {(analysisResult.consistency * 100).toFixed(1)}%
        </Typography>
      </Box>
    </>
  );
};
