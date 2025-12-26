import { Terrain as TerrainIcon } from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AnalysisResult } from "../../services/deckAnalyzer";
import { COLOR_NAMES, MANA_COLORS } from "../../types";
import { CardImageTooltip } from "../CardImageTooltip";
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
        🏔️ Manabase Analysis
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Detailed analysis of your land base and mana production capabilities. Click on any land name to view it on Scryfall.
      </Typography>

      <Grid container spacing={4}>
        {/* Liste des terrains */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: isMobile ? 2 : 3 }}>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              gutterBottom
              sx={{
                fontSize: isMobile ? "1rem" : undefined,
                fontWeight: "bold",
              }}
            >
              📋 Land Breakdown
            </Typography>

            <List>
              {Object.entries(landTypes).map(([type, lands]) => (
                <Box key={type}>
                  <ListItem>
                    <ListItemIcon>
                      <TerrainIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {type} ({lands.length} types)
                        </Typography>
                      }
                    />
                  </ListItem>
                  {lands.map((land, index) => {
                    const match = land.match(/^(\d+)x\s+(.+)$/);
                    if (!match) return null;

                    const quantity = match[1];
                    const cardName = match[2].trim();
                    const scryfallUrl = `https://scryfall.com/search?q=${encodeURIComponent(cardName)}`;

                    return (
                      <ListItem key={index} sx={{ pl: 4, py: 0.5 }}>
                        <CardImageTooltip cardName={cardName}>
                          <Card
                            variant="outlined"
                            sx={{
                              width: "100%",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                boxShadow: 1,
                                transform: "translateY(-1px)",
                                backgroundColor: "action.hover",
                              },
                            }}
                            onClick={() => window.open(scryfallUrl, "_blank")}
                          >
                            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={quantity}
                                  size="small"
                                  color="primary"
                                  sx={{ minWidth: 28, fontSize: "0.75rem" }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    flexGrow: 1,
                                    "&:hover": { color: "primary.main" },
                                  }}
                                >
                                  {cardName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  🔗
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </CardImageTooltip>
                      </ListItem>
                    );
                  })}
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Graphiques */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: isMobile ? 2 : 3 }}>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              gutterBottom
              sx={{
                fontSize: isMobile ? "1rem" : undefined,
                fontWeight: "bold",
              }}
            >
              📊 Mana Production Distribution
            </Typography>

            {colorData.length > 0 ? (
              <Box>
                <Box
                  sx={{
                    width: "100%",
                    overflowX: "hidden",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height={isSmallMobile ? 150 : isMobile ? 200 : 300}
                    minWidth={250}
                  >
                    <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <Pie
                        data={colorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={
                          isMobile
                            ? false
                            : ({ name, value, percent }) =>
                                `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={isSmallMobile ? 45 : isMobile ? 60 : 80}
                        innerRadius={isSmallMobile ? 15 : isMobile ? 20 : 25}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={isMobile ? 1 : 2}
                      >
                        {colorData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={isMobile ? 1 : 2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} sources`, name]}
                        labelStyle={{ fontSize: isMobile ? "12px" : "14px" }}
                        contentStyle={{
                          fontSize: isMobile ? "12px" : "14px",
                          padding: isMobile ? "4px 8px" : "8px 12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant={isMobile ? "caption" : "subtitle2"}
                    gutterBottom
                    sx={{
                      fontSize: isMobile ? "0.8rem" : undefined,
                      fontWeight: "bold",
                    }}
                  >
                    Color Requirements Summary:
                  </Typography>
                  {colorData.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: isMobile ? 0.5 : 1,
                        flexWrap: isMobile ? "wrap" : "nowrap",
                      }}
                    >
                      <Box
                        sx={{
                          width: isMobile ? 16 : 20,
                          height: isMobile ? 16 : 20,
                          backgroundColor: item.color,
                          border: "1px solid #ddd",
                          borderRadius: 1,
                          mr: isMobile ? 1 : 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: isMobile ? "0.6rem" : "0.75rem",
                          fontWeight: "bold",
                          color: item.textColor,
                          flexShrink: 0,
                        }}
                      >
                        {MANA_COLORS.find((c) => COLOR_NAMES[c] === item.name)}
                      </Box>
                      <Typography
                        variant={isMobile ? "caption" : "body2"}
                        sx={{ fontSize: isMobile ? "0.75rem" : undefined }}
                      >
                        {item.name}: {item.value} sources (
                        {((item.value / totalMana) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No mana requirements detected. This might be a colorless deck or the analysis needs more data.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Statistiques de la manabase */}
        <Grid item xs={12}>
          <Paper sx={{ p: isMobile ? 2 : 3 }}>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              gutterBottom
              sx={{
                fontSize: isMobile ? "1rem" : undefined,
                fontWeight: "bold",
              }}
            >
              📈 Manabase Statistics
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
                        (v) => v > 0,
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
          🏔️ This manabase analysis helps you understand your land distribution and mana production capabilities for optimal deck performance.
        </Typography>
      </Box>
    </>
  );
};
