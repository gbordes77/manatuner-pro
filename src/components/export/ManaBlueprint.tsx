import {
    Download as DownloadIcon,
    Image as ImageIcon,
    PictureAsPdf as PdfIcon,
    Share as ShareIcon
} from "@mui/icons-material";
import {
    Box,
    Button,
    ButtonGroup,
    Chip,
    CircularProgress,
    Divider,
    LinearProgress,
    Menu,
    MenuItem,
    Paper,
    Typography
} from "@mui/material";
import React, { useRef, useState } from "react";
import { COLOR_NAMES, MANA_COLOR_STYLES, ManaColor } from "../../constants/manaColors";
import { AnalysisResult } from "../../services/deckAnalyzer";

// Blueprint color palette - signature design
const BLUEPRINT_COLORS = {
  background: "#0A1628",
  backgroundLight: "#0F1E32",
  grid: "#1A3A5C",
  cyan: "#00D9FF",
  cyanLight: "#00D9FF33",
  gold: "#FFB800",
  goldLight: "#FFB80033",
  text: "#F0F4F8",
  textMuted: "#8BA3B9",
  success: "#00E676",
  warning: "#FFB800",
  error: "#FF5252",
};

// Mana Stability Index thresholds
const getStabilityLevel = (score: number): {
  label: string;
  color: string;
  description: string;
} => {
  if (score >= 95) return { label: "Optimal", color: BLUEPRINT_COLORS.success, description: "Tournament-ready manabase" };
  if (score >= 85) return { label: "Highly Stable", color: BLUEPRINT_COLORS.cyan, description: "Excellent consistency" };
  if (score >= 75) return { label: "Stable", color: "#4FC3F7", description: "Good reliability" };
  if (score >= 60) return { label: "Functional", color: BLUEPRINT_COLORS.warning, description: "Room for improvement" };
  return { label: "Unstable", color: BLUEPRINT_COLORS.error, description: "Needs optimization" };
};

// Calculate overall mana stability score
const calculateStabilityScore = (analysis: AnalysisResult): number => {
  const { consistency, landRatio, probabilities } = analysis;

  // Weight factors
  const consistencyWeight = 0.4;
  const landRatioWeight = 0.2;
  const turn2Weight = 0.25;
  const turn4Weight = 0.15;

  // Land ratio score (optimal is 0.38-0.42)
  const optimalRatio = 0.40;
  const ratioDeviation = Math.abs(landRatio - optimalRatio);
  const landRatioScore = Math.max(0, 1 - ratioDeviation * 5);

  // Average turn 2 probability across colors
  const turn2Colors = Object.values(probabilities.turn2.specificColors);
  const avgTurn2 = turn2Colors.length > 0
    ? turn2Colors.reduce((a, b) => a + b, 0) / turn2Colors.length
    : 0.8;

  // Average turn 4 probability
  const turn4Colors = Object.values(probabilities.turn4.specificColors);
  const avgTurn4 = turn4Colors.length > 0
    ? turn4Colors.reduce((a, b) => a + b, 0) / turn4Colors.length
    : 0.9;

  const score = (
    consistency * consistencyWeight +
    landRatioScore * landRatioWeight +
    avgTurn2 * turn2Weight +
    avgTurn4 * turn4Weight
  ) * 100;

  return Math.round(Math.min(100, Math.max(0, score)));
};

interface ManaBlueprintProps {
  analysisResult: AnalysisResult;
  deckName?: string;
  format?: string;
}

export const ManaBlueprint: React.FC<ManaBlueprintProps> = ({
  analysisResult,
  deckName = "Unnamed Deck",
  format = "Modern",
}) => {
  const blueprintRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const stabilityScore = calculateStabilityScore(analysisResult);
  const stability = getStabilityLevel(stabilityScore);

  // Get active colors from the deck
  const activeColors = (Object.keys(analysisResult.colorDistribution) as ManaColor[])
    .filter(color => analysisResult.colorDistribution[color] > 0);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportPNG = async () => {
    handleClose();
    setIsExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      if (blueprintRef.current) {
        const canvas = await html2canvas(blueprintRef.current, {
          scale: 2,
          backgroundColor: BLUEPRINT_COLORS.background,
          logging: false,
          useCORS: true,
        });

        const link = document.createElement("a");
        link.download = `mana-blueprint-${deckName.replace(/\s+/g, "-").toLowerCase()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } catch (error) {
      console.error("Error exporting PNG:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    handleClose();
    setIsExporting(true);

    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      if (blueprintRef.current) {
        const canvas = await html2canvas(blueprintRef.current, {
          scale: 2,
          backgroundColor: BLUEPRINT_COLORS.background,
          logging: false,
          useCORS: true,
        });

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF({
          orientation: imgHeight > 270 ? "portrait" : "portrait",
          unit: "mm",
          format: "a4",
        });

        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          10,
          10,
          imgWidth,
          imgHeight
        );

        pdf.save(`mana-blueprint-${deckName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    handleClose();
    const data = {
      deckName,
      format,
      generatedAt: new Date().toISOString(),
      stabilityScore,
      analysis: analysisResult,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `mana-blueprint-${deckName.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Box>
      {/* Export Controls */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, justifyContent: "flex-end" }}>
        <ButtonGroup variant="contained" disabled={isExporting}>
          <Button
            startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            onClick={handleExportClick}
            sx={{
              background: `linear-gradient(135deg, ${BLUEPRINT_COLORS.cyan} 0%, #0097A7 100%)`,
              "&:hover": {
                background: `linear-gradient(135deg, #00E5FF 0%, ${BLUEPRINT_COLORS.cyan} 100%)`,
              },
            }}
          >
            Export Blueprint
          </Button>
        </ButtonGroup>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleExportPNG}>
            <ImageIcon sx={{ mr: 1 }} /> PNG (Social Media)
          </MenuItem>
          <MenuItem onClick={handleExportPDF}>
            <PdfIcon sx={{ mr: 1 }} /> PDF (Documentation)
          </MenuItem>
          <MenuItem onClick={handleExportJSON}>
            <ShareIcon sx={{ mr: 1 }} /> JSON (Backup)
          </MenuItem>
        </Menu>
      </Box>

      {/* Blueprint Card - This is what gets exported */}
      <Paper
        ref={blueprintRef}
        sx={{
          background: BLUEPRINT_COLORS.background,
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          p: 3,
          // Grid pattern overlay
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(${BLUEPRINT_COLORS.grid}40 1px, transparent 1px),
              linear-gradient(90deg, ${BLUEPRINT_COLORS.grid}40 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            pointerEvents: "none",
            opacity: 0.5,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ position: "relative", zIndex: 1, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: BLUEPRINT_COLORS.cyan,
                  fontFamily: "monospace",
                  letterSpacing: 3,
                  fontSize: "0.75rem",
                }}
              >
                ◆ MANA BLUEPRINT
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: BLUEPRINT_COLORS.text,
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {deckName}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Chip
                  label={format}
                  size="small"
                  sx={{
                    bgcolor: BLUEPRINT_COLORS.cyanLight,
                    color: BLUEPRINT_COLORS.cyan,
                    fontWeight: 600,
                    fontFamily: "monospace",
                  }}
                />
                <Chip
                  label={`${analysisResult.totalCards} cards`}
                  size="small"
                  sx={{
                    bgcolor: BLUEPRINT_COLORS.backgroundLight,
                    color: BLUEPRINT_COLORS.textMuted,
                    fontFamily: "monospace",
                  }}
                />
              </Box>
            </Box>

            {/* ManaTuner Logo */}
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  color: BLUEPRINT_COLORS.textMuted,
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                }}
              >
                Powered by
              </Typography>
              <Typography
                sx={{
                  color: BLUEPRINT_COLORS.cyan,
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                ManaTuner Pro
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Deck List - First section for immediate deck identification */}
        {analysisResult.cards && analysisResult.cards.length > 0 && (
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              p: 2.5,
              bgcolor: BLUEPRINT_COLORS.backgroundLight,
              borderRadius: 2,
              border: `1px solid ${BLUEPRINT_COLORS.cyan}40`,
              mb: 3,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: BLUEPRINT_COLORS.cyan,
                fontFamily: "monospace",
                letterSpacing: 2,
                fontSize: "0.65rem",
              }}
            >
              DECK LIST
            </Typography>

            {/* Maindeck */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
                mt: 2,
              }}
            >
              {/* Lands Column */}
              <Box>
                <Typography
                  sx={{
                    color: BLUEPRINT_COLORS.cyan,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    mb: 1,
                    pb: 0.5,
                    borderBottom: `1px solid ${BLUEPRINT_COLORS.grid}`,
                  }}
                >
                  LANDS ({analysisResult.cards.filter(c => c.isLand && !c.isSideboard).reduce((sum, c) => sum + c.quantity, 0)})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {analysisResult.cards
                    .filter(card => card.isLand && !card.isSideboard)
                    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
                    .map((card, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          color: BLUEPRINT_COLORS.text,
                          fontFamily: "monospace",
                          fontSize: "0.7rem",
                          py: 0.25,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            color: BLUEPRINT_COLORS.gold,
                            fontWeight: 600,
                            minWidth: 24,
                            display: "inline-block",
                          }}
                        >
                          {card.quantity}x
                        </Box>{" "}
                        {card.name}
                      </Typography>
                    ))}
                </Box>
              </Box>

              {/* Spells Column */}
              <Box>
                <Typography
                  sx={{
                    color: BLUEPRINT_COLORS.cyan,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    mb: 1,
                    pb: 0.5,
                    borderBottom: `1px solid ${BLUEPRINT_COLORS.grid}`,
                  }}
                >
                  SPELLS ({analysisResult.cards.filter(c => !c.isLand && !c.isSideboard).reduce((sum, c) => sum + c.quantity, 0)})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {analysisResult.cards
                    .filter(card => !card.isLand && !card.isSideboard)
                    .sort((a, b) => a.cmc - b.cmc || b.quantity - a.quantity || a.name.localeCompare(b.name))
                    .map((card, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          color: BLUEPRINT_COLORS.text,
                          fontFamily: "monospace",
                          fontSize: "0.7rem",
                          py: 0.25,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            color: BLUEPRINT_COLORS.gold,
                            fontWeight: 600,
                            minWidth: 24,
                            display: "inline-block",
                          }}
                        >
                          {card.quantity}x
                        </Box>{" "}
                        {card.name}
                        {card.manaCost && (
                          <Box
                            component="span"
                            sx={{
                              color: BLUEPRINT_COLORS.textMuted,
                              fontSize: "0.6rem",
                              ml: 0.5,
                            }}
                          >
                            ({card.manaCost})
                          </Box>
                        )}
                      </Typography>
                    ))}
                </Box>
              </Box>
            </Box>

            {/* Sideboard Section */}
            {analysisResult.cards.some(c => c.isSideboard) && (
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${BLUEPRINT_COLORS.grid}` }}>
                <Typography
                  sx={{
                    color: BLUEPRINT_COLORS.textMuted,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    mb: 1,
                  }}
                >
                  SIDEBOARD ({analysisResult.cards.filter(c => c.isSideboard).reduce((sum, c) => sum + c.quantity, 0)})
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                    maxHeight: 100,
                    overflowY: "auto",
                  }}
                >
                  {analysisResult.cards
                    .filter(card => card.isSideboard)
                    .sort((a, b) => a.cmc - b.cmc || a.name.localeCompare(b.name))
                    .map((card, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          color: BLUEPRINT_COLORS.text,
                          fontFamily: "monospace",
                          fontSize: "0.65rem",
                          py: 0.25,
                          px: 0.75,
                          bgcolor: BLUEPRINT_COLORS.grid,
                          borderRadius: 1,
                          opacity: 0.85,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            color: BLUEPRINT_COLORS.gold,
                            fontWeight: 600,
                          }}
                        >
                          {card.quantity}x
                        </Box>{" "}
                        {card.name}
                      </Typography>
                    ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Mana Stability Index */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            p: 2.5,
            bgcolor: BLUEPRINT_COLORS.backgroundLight,
            borderRadius: 2,
            border: `1px solid ${BLUEPRINT_COLORS.grid}`,
            mb: 3,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: BLUEPRINT_COLORS.textMuted,
              fontFamily: "monospace",
              letterSpacing: 2,
              fontSize: "0.65rem",
            }}
          >
            MANA STABILITY INDEX
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 1 }}>
            <Typography
              variant="h2"
              sx={{
                color: stability.color,
                fontWeight: 800,
                fontFamily: "monospace",
                lineHeight: 1,
              }}
            >
              {stabilityScore}
            </Typography>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography
                  sx={{
                    color: stability.color,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                  }}
                >
                  {stability.label}
                </Typography>
                <Typography
                  sx={{
                    color: BLUEPRINT_COLORS.textMuted,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {stability.description}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={stabilityScore}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: BLUEPRINT_COLORS.grid,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${BLUEPRINT_COLORS.error} 0%, ${BLUEPRINT_COLORS.warning} 50%, ${BLUEPRINT_COLORS.success} 100%)`,
                  },
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography sx={{ color: BLUEPRINT_COLORS.textMuted, fontSize: "0.6rem", fontFamily: "monospace" }}>
                  UNSTABLE
                </Typography>
                <Typography sx={{ color: BLUEPRINT_COLORS.textMuted, fontSize: "0.6rem", fontFamily: "monospace" }}>
                  OPTIMAL
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Probability Matrix */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            p: 2.5,
            bgcolor: BLUEPRINT_COLORS.backgroundLight,
            borderRadius: 2,
            border: `1px solid ${BLUEPRINT_COLORS.grid}`,
            mb: 3,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: BLUEPRINT_COLORS.textMuted,
              fontFamily: "monospace",
              letterSpacing: 2,
              fontSize: "0.65rem",
            }}
          >
            HYPERGEOMETRIC PROBABILITY MATRIX
          </Typography>

          {/* Table Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "80px repeat(4, 1fr)",
              gap: 1,
              mt: 2,
              mb: 1,
            }}
          >
            <Box />
            {["T1", "T2", "T3", "T4"].map((turn) => (
              <Typography
                key={turn}
                sx={{
                  color: BLUEPRINT_COLORS.cyan,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  textAlign: "center",
                  fontSize: "0.85rem",
                }}
              >
                {turn}
              </Typography>
            ))}
          </Box>

          {/* Color Rows */}
          {activeColors.map((color) => {
            const colorStyle = MANA_COLOR_STYLES[color];
            const probs = [
              analysisResult.probabilities.turn1.specificColors[color],
              analysisResult.probabilities.turn2.specificColors[color],
              analysisResult.probabilities.turn3.specificColors[color],
              analysisResult.probabilities.turn4.specificColors[color],
            ];

            return (
              <Box
                key={color}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "80px repeat(4, 1fr)",
                  gap: 1,
                  py: 0.75,
                  borderBottom: `1px solid ${BLUEPRINT_COLORS.grid}40`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: colorStyle.bg,
                      border: `2px solid ${colorStyle.text}`,
                    }}
                  />
                  <Typography
                    sx={{
                      color: BLUEPRINT_COLORS.text,
                      fontFamily: "monospace",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    {COLOR_NAMES[color]}
                  </Typography>
                </Box>

                {probs.map((prob, idx) => {
                  const percentage = Math.round((prob || 0) * 100);
                  let probColor = BLUEPRINT_COLORS.success;
                  if (percentage < 70) probColor = BLUEPRINT_COLORS.error;
                  else if (percentage < 85) probColor = BLUEPRINT_COLORS.warning;

                  return (
                    <Typography
                      key={idx}
                      sx={{
                        color: probColor,
                        fontFamily: "monospace",
                        fontWeight: 600,
                        textAlign: "center",
                        fontSize: "0.9rem",
                      }}
                    >
                      {percentage}%
                    </Typography>
                  );
                })}
              </Box>
            );
          })}
        </Box>

        {/* Key Stats */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
            mb: 3,
          }}
        >
          {[
            { label: "Lands", value: analysisResult.totalLands, icon: "🏔️" },
            { label: "Spells", value: analysisResult.totalNonLands, icon: "⚡" },
            { label: "Avg CMC", value: analysisResult.averageCMC.toFixed(1), icon: "📊" },
            { label: "Land %", value: `${Math.round(analysisResult.landRatio * 100)}%`, icon: "🎯" },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                p: 1.5,
                bgcolor: BLUEPRINT_COLORS.backgroundLight,
                borderRadius: 2,
                border: `1px solid ${BLUEPRINT_COLORS.grid}`,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "1.2rem", mb: 0.5 }}>{stat.icon}</Typography>
              <Typography
                sx={{
                  color: BLUEPRINT_COLORS.text,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                sx={{
                  color: BLUEPRINT_COLORS.textMuted,
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Mulligan Analysis */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            p: 2.5,
            bgcolor: BLUEPRINT_COLORS.backgroundLight,
            borderRadius: 2,
            border: `1px solid ${BLUEPRINT_COLORS.grid}`,
            mb: 3,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: BLUEPRINT_COLORS.textMuted,
              fontFamily: "monospace",
              letterSpacing: 2,
              fontSize: "0.65rem",
            }}
          >
            OPENING HAND ANALYSIS
          </Typography>

          <Box sx={{ mt: 2 }}>
            {[
              { label: "Perfect Hand (2-4 lands + early play)", value: analysisResult.mulliganAnalysis.perfectHand, color: BLUEPRINT_COLORS.success },
              { label: "Good Hand (2-4 lands)", value: analysisResult.mulliganAnalysis.goodHand, color: BLUEPRINT_COLORS.cyan },
              { label: "Borderline (1 or 5 lands)", value: analysisResult.mulliganAnalysis.averageHand, color: BLUEPRINT_COLORS.warning },
              { label: "Mulligan (0 or 6+ lands)", value: analysisResult.mulliganAnalysis.poorHand, color: BLUEPRINT_COLORS.error },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0.75,
                  borderBottom: `1px solid ${BLUEPRINT_COLORS.grid}40`,
                }}
              >
                <Typography
                  sx={{
                    color: BLUEPRINT_COLORS.textMuted,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {item.label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 6,
                      bgcolor: BLUEPRINT_COLORS.grid,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${item.value}%`,
                        height: "100%",
                        bgcolor: item.color,
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      color: item.color,
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      minWidth: 40,
                      textAlign: "right",
                    }}
                  >
                    {item.value}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Top Recommendations */}
        {analysisResult.recommendations.length > 0 && (
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              p: 2.5,
              bgcolor: BLUEPRINT_COLORS.backgroundLight,
              borderRadius: 2,
              border: `1px solid ${BLUEPRINT_COLORS.grid}`,
              mb: 3,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: BLUEPRINT_COLORS.textMuted,
                fontFamily: "monospace",
                letterSpacing: 2,
                fontSize: "0.65rem",
              }}
            >
              💡 SUGGESTIONS
            </Typography>

            <Typography
              sx={{
                color: BLUEPRINT_COLORS.textMuted,
                fontFamily: "monospace",
                fontSize: "0.6rem",
                fontStyle: "italic",
                mt: 0.5,
                mb: 1.5,
                opacity: 0.8,
              }}
            >
              ⚠️ Heuristics only — not mathematical certainties. Your meta and playstyle matter.
            </Typography>

            <Box>
              {analysisResult.recommendations.slice(0, 3).map((rec, idx) => (
                <Typography
                  key={idx}
                  sx={{
                    color: BLUEPRINT_COLORS.text,
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    py: 0.5,
                    pl: 2,
                    borderLeft: `2px solid ${BLUEPRINT_COLORS.gold}40`,
                    mb: 1,
                    opacity: 0.9,
                  }}
                >
                  {rec}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Footer */}
        <Divider sx={{ borderColor: BLUEPRINT_COLORS.grid, my: 2 }} />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: BLUEPRINT_COLORS.textMuted,
              fontFamily: "monospace",
              fontSize: "0.7rem",
            }}
          >
            Generated {new Date().toLocaleDateString()} • manatuner-pro.vercel.app
          </Typography>

          <Typography
            sx={{
              color: BLUEPRINT_COLORS.cyan,
              fontFamily: "monospace",
              fontSize: "0.7rem",
            }}
          >
            #ManaTunerBlueprint
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ManaBlueprint;
