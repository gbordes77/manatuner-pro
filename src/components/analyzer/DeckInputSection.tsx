import {
    Add as AddIcon,
    Analytics as AnalyticsIcon,
    Speed as SpeedIcon,
} from "@mui/icons-material";
import {
    Box,
    Button,
    LinearProgress,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import { AnalysisResult } from "../../services/deckAnalyzer";

interface DeckInputSectionProps {
  deckList: string;
  setDeckList: (value: string) => void;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  isDeckMinimized: boolean;
  setIsDeckMinimized: (value: boolean) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onLoadSample: () => void;
  isMobile: boolean;
  isSmallMobile: boolean;
}

export const DeckInputSection: React.FC<DeckInputSectionProps> = ({
  deckList,
  setDeckList,
  isAnalyzing,
  analysisResult,
  isDeckMinimized,
  setIsDeckMinimized,
  onAnalyze,
  onClear,
  onLoadSample,
  isMobile,
  isSmallMobile,
}) => {
  return (
    <Paper
      sx={{
        p: isMobile ? 2 : 3,
        height: "fit-content",
        cursor: analysisResult && isDeckMinimized ? "pointer" : "default",
        transition: "all 0.3s ease-in-out",
        "&:hover":
          analysisResult && isDeckMinimized
            ? {
                transform: isMobile ? "none" : "scale(1.02)",
                boxShadow: 3,
              }
            : {},
      }}
      onClick={() => {
        if (analysisResult && isDeckMinimized) {
          setIsDeckMinimized(false);
        }
      }}
    >
      <Typography
        variant={isMobile ? "h6" : "h5"}
        gutterBottom
        sx={{ fontSize: isMobile ? "1.1rem" : undefined }}
      >
        📝 Your Deck{" "}
        {analysisResult && isDeckMinimized && "(Click to expand)"}
      </Typography>

      {!isDeckMinimized && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 8 : 12}
            label="List of deck"
            placeholder="Paste your decklist here...&#10;Format: 4 Lightning Bolt&#10;3 Counterspell&#10;..."
            value={deckList}
            onChange={(e) => setDeckList(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiInputBase-root": {
                fontSize: isMobile ? "0.875rem" : undefined,
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: isMobile ? 1 : 2,
              mb: 2,
              flexWrap: "wrap",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={onAnalyze}
              disabled={!deckList.trim() || isAnalyzing}
              startIcon={isAnalyzing ? <SpeedIcon /> : <AnalyticsIcon />}
              sx={{
                flexGrow: 1,
                minWidth: isMobile ? "auto" : "200px",
                fontSize: isMobile ? "0.875rem" : undefined,
              }}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Manabase"}
            </Button>

            <Box
              sx={{
                display: "flex",
                gap: isMobile ? 1 : 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                onClick={onLoadSample}
                startIcon={<AddIcon />}
                sx={{
                  minWidth: isMobile ? "auto" : "100px",
                  fontSize: isMobile ? "0.75rem" : undefined,
                }}
              >
                Example
              </Button>

              <Button
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                onClick={onClear}
                sx={{
                  color: "var(--mtg-red)",
                  borderColor: "var(--mtg-red)",
                  minWidth: isMobile ? "auto" : "80px",
                  fontSize: isMobile ? "0.75rem" : undefined,
                  "&:hover": {
                    borderColor: "var(--mtg-red)",
                    backgroundColor: "rgba(220, 53, 69, 0.1)",
                  },
                }}
              >
                🗑️ Clear
              </Button>


            </Box>
          </Box>

          {isAnalyzing && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  fontSize: isMobile ? "0.75rem" : undefined,
                }}
              >
                Calculating hypergeometric probabilities...
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Version minimisée - affichage du résumé */}
      {isDeckMinimized && analysisResult && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {analysisResult.totalCards} cards •{" "}
            {analysisResult.totalLands} lands
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Click to expand deck editor
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
