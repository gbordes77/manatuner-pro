import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    Typography,
} from "@mui/material";
import React from "react";
import { CardImageTooltip } from "../CardImageTooltip";

interface DeckListTabProps {
  deckList: string;
}

export const DeckListTab: React.FC<DeckListTabProps> = ({ deckList }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        📜 Deck List
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Click on any card name to view it on Scryfall
      </Typography>

      {deckList.trim() ? (
        <Grid container spacing={2}>
          {deckList
            .split("\n")
            .filter((line) => line.trim())
            .map((line, index) => {
              const match = line.match(
                /^(\d+)\s+(.+?)(?:\s*\([A-Z0-9]+\)\s*\d*)?$/,
              );
              if (!match) return null;

              const quantity = match[1];
              const cardName = match[2].replace(/^A-/, "").trim();
              const scryfallUrl = `https://scryfall.com/search?q=${encodeURIComponent(cardName)}`;

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <CardImageTooltip cardName={cardName}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          boxShadow: 2,
                          transform: "translateY(-2px)",
                        },
                      }}
                      onClick={() => window.open(scryfallUrl, "_blank")}
                    >
                      <CardContent sx={{ p: 2 }}>
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
                            sx={{ minWidth: 32 }}
                          />
                          <Typography
                            variant="body1"
                            sx={{
                              flexGrow: 1,
                              "&:hover": { color: "primary.main" },
                            }}
                          >
                            {cardName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            🔗
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </CardImageTooltip>
                </Grid>
              );
            })}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No deck list available. Please enter a deck list and analyze it first.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          🔍 Cards are automatically linked to Scryfall for detailed information and pricing.
        </Typography>
      </Box>
    </>
  );
};
