import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    HelpOutline as HelpOutlineIcon,
    Terrain as TerrainIcon,
    TrendingUp as TrendingIcon,
    ViewList as ViewListIcon,
    Warning as WarningIcon
} from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    LinearProgress,
    Tooltip,
    Typography
} from "@mui/material";
import React, { useMemo } from "react";
import { MANA_COLORS } from "../../constants/manaColors";
import { AnalysisResult } from "../../services/deckAnalyzer";

interface DashboardTabProps {
  analysisResult: AnalysisResult;
  isMobile: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  analysisResult,
  isMobile,
}) => {
  const consistencyPercent = Math.round(analysisResult.consistency * 100);

  // Memoized health status calculation
  const health = useMemo(() => {
    if (consistencyPercent >= 85) return { label: "Excellent", color: "success", icon: <CheckIcon /> };
    if (consistencyPercent >= 70) return { label: "Good", color: "primary", icon: <TrendingIcon /> };
    if (consistencyPercent >= 55) return { label: "Average", color: "warning", icon: <WarningIcon /> };
    return { label: "Needs Work", color: "error", icon: <ErrorIcon /> };
  }, [consistencyPercent]);

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
                <Typography variant="overline" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  Manabase Health
                  <Tooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>How is this calculated?</Typography>
                        <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                          This score uses hypergeometric probability to measure your deck's ability to cast spells on curve. The same math behind Frank Karsten's famous mana tables.
                        </Typography>
                        <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                          <strong>Factors:</strong>
                        </Typography>
                        <Typography variant="caption" component="div">• Color sources vs requirements</Typography>
                        <Typography variant="caption" component="div">• Land ratio for your CMC</Typography>
                        <Typography variant="caption" component="div">• Multi-color consistency</Typography>
                        <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                          <strong>≥85%</strong> Excellent | <strong>≥70%</strong> Good | <strong>≥55%</strong> Average
                        </Typography>
                      </Box>
                    }
                    arrow
                  >
                    <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                      <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                    </IconButton>
                  </Tooltip>
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
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  Consistency Score
                  <Tooltip title="Consistency measures the probability of having the right mana colors to cast your spells on curve. A higher score means your manabase reliably produces the colors you need." arrow>
                    <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                      <HelpOutlineIcon fontSize="small" sx={{ fontSize: 16, opacity: 0.7 }} />
                    </IconButton>
                  </Tooltip>
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
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                      Average CMC
                      <Tooltip title="CMC (Converted Mana Cost), now called Mana Value, is the total amount of mana needed to cast a spell. For example, a spell costing {2}{U}{U} has a CMC of 4." arrow>
                        <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                          <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                        </IconButton>
                      </Tooltip>
                    </Typography>
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
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                Avg CMC
                <Tooltip title="CMC (Converted Mana Cost), now called Mana Value, is the total amount of mana needed to cast a spell." arrow>
                  <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                    <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                  </IconButton>
                </Tooltip>
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
            <i className="ms ms-c ms-cost" style={{ fontSize: 24 }} /> Color Distribution
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
            {MANA_COLORS.map((color) => {
              const count = analysisResult.colorDistribution[color] || 0;
              if (count === 0) return null;

              const total = Object.values(analysisResult.colorDistribution).reduce((a, b) => a + b, 0);
              const percent = ((count / total) * 100).toFixed(0);
              const manaClass = color.toLowerCase(); // W -> w, U -> u, etc.

              return (
                <Box
                  key={color}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <i
                    className={`ms ms-${manaClass} ms-cost`}
                    style={{
                      fontSize: 28,
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="bold" lineHeight={1.2} color="text.primary">
                      {count} sources
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {percent}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
};
