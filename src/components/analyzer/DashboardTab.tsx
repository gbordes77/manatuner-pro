import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Terrain as TerrainIcon,
    TrendingUp as TrendingIcon,
    ViewList as ViewListIcon,
    Warning as WarningIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    Typography,
} from "@mui/material";
import React from "react";
import { AnalysisResult } from "../../services/deckAnalyzer";
import { MANA_COLORS } from "../../types";

interface DashboardTabProps {
  analysisResult: AnalysisResult;
  isMobile: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  analysisResult,
  isMobile,
}) => {
  const consistencyPercent = Math.round(analysisResult.consistency * 100);

  // Determine health status
  const getHealthStatus = () => {
    if (consistencyPercent >= 85) return { label: "Excellent", color: "success", icon: <CheckIcon /> };
    if (consistencyPercent >= 70) return { label: "Good", color: "primary", icon: <TrendingIcon /> };
    if (consistencyPercent >= 55) return { label: "Average", color: "warning", icon: <WarningIcon /> };
    return { label: "Needs Work", color: "error", icon: <ErrorIcon /> };
  };

  const health = getHealthStatus();

  // Top recommendations (max 3)
  const topRecommendations = analysisResult.recommendations?.slice(0, 3) || [];

  return (
    <Box>
      {/* Health Score Hero */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${
            health.color === "success" ? "#4caf50" :
            health.color === "primary" ? "#2196f3" :
            health.color === "warning" ? "#ff9800" : "#f44336"
          }15, transparent)`,
          border: `1px solid ${
            health.color === "success" ? "#4caf50" :
            health.color === "primary" ? "#2196f3" :
            health.color === "warning" ? "#ff9800" : "#f44336"
          }40`,
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="overline" color="text.secondary">
                  Manabase Health
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, my: 1 }}>
                  <Typography variant={isMobile ? "h3" : "h2"} fontWeight="bold" color={`${health.color}.main`}>
                    {consistencyPercent}%
                  </Typography>
                </Box>
                <Chip
                  icon={health.icon}
                  label={health.label}
                  color={health.color as "success" | "primary" | "warning" | "error"}
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ px: isMobile ? 0 : 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Consistency Score
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={consistencyPercent}
                  color={health.color as "success" | "primary" | "warning" | "error"}
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Land Ratio</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {(analysisResult.landRatio * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Average CMC</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {analysisResult.averageCMC.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", height: "100%" }}>
            <CardContent sx={{ py: isMobile ? 1.5 : 2 }}>
              <ViewListIcon color="primary" sx={{ fontSize: isMobile ? 28 : 32, mb: 0.5 }} />
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                {analysisResult.totalCards}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Cards
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", height: "100%" }}>
            <CardContent sx={{ py: isMobile ? 1.5 : 2 }}>
              <TerrainIcon color="success" sx={{ fontSize: isMobile ? 28 : 32, mb: 0.5 }} />
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                {analysisResult.totalLands}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lands
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", height: "100%" }}>
            <CardContent sx={{ py: isMobile ? 1.5 : 2 }}>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color="primary">
                {analysisResult.averageCMC.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg CMC
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", height: "100%" }}>
            <CardContent sx={{ py: isMobile ? 1.5 : 2 }}>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color="secondary">
                {Object.values(analysisResult.colorDistribution).filter(v => v > 0).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Colors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Color Distribution */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🎨 Color Distribution
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            {MANA_COLORS.map((color) => {
              const count = analysisResult.colorDistribution[color] || 0;
              if (count === 0) return null;

              const colorMap = {
                W: { bg: "#FFF8DC", text: "#2C3E50", border: "#D4AF37" },
                U: { bg: "#4A90E2", text: "#FFFFFF", border: "#2E5090" },
                B: { bg: "#2C2C2C", text: "#FFFFFF", border: "#1a1a1a" },
                R: { bg: "#E74C3C", text: "#FFFFFF", border: "#C0392B" },
                G: { bg: "#27AE60", text: "#FFFFFF", border: "#1E8449" },
              };

              const total = Object.values(analysisResult.colorDistribution).reduce((a, b) => a + b, 0);
              const percent = ((count / total) * 100).toFixed(0);

              return (
                <Chip
                  key={color}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <strong>{color}</strong>
                      <span>{count} sources</span>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>({percent}%)</Typography>
                    </Box>
                  }
                  sx={{
                    backgroundColor: colorMap[color]?.bg,
                    color: colorMap[color]?.text,
                    border: `2px solid ${colorMap[color]?.border}`,
                    fontWeight: "bold",
                    py: 2,
                    "& .MuiChip-label": { px: 1.5 },
                  }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      {topRecommendations.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              💡 Key Recommendations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {topRecommendations.map((rec, index) => (
              <Alert
                key={index}
                severity={rec.priority === "high" ? "warning" : rec.priority === "medium" ? "info" : "success"}
                sx={{ mb: index < topRecommendations.length - 1 ? 1.5 : 0 }}
                icon={
                  rec.priority === "high" ? <WarningIcon /> :
                  rec.priority === "medium" ? <TrendingIcon /> : <CheckIcon />
                }
              >
                <Typography variant="body2">
                  <strong>{rec.category}:</strong> {rec.message}
                </Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
