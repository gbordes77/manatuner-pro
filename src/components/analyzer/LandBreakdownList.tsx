import { HelpOutline as HelpOutlineIcon, Terrain as TerrainIcon } from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Tooltip,
    Typography
} from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { CardImageTooltip } from "../CardImageTooltip";

// Land category power ranking (1 = most powerful)
const LAND_CATEGORY_ORDER: Record<string, number> = {
  "Fetchland": 1,
  "Rainbow Land": 2,
  "Shockland": 3,
  "Horizon Land": 4,
  "Fastland": 5,
  "Checkland": 6,
  "Painland": 7,
  "Conditional Land": 8,
  "Triome": 9,
  "Utility Land": 10,
  "Basic Land": 11,
  "Other Land": 12,
};

interface LandBreakdownListProps {
  landTypes: Record<string, string[]>;
  isMobile: boolean;
}

export const LandBreakdownList: React.FC<LandBreakdownListProps> = ({
  landTypes,
  isMobile,
}) => {
  // Sort land types by power ranking
  const sortedLandTypes = Object.entries(landTypes).sort(([typeA], [typeB]) => {
    const orderA = LAND_CATEGORY_ORDER[typeA] ?? 99;
    const orderB = LAND_CATEGORY_ORDER[typeB] ?? 99;
    return orderA - orderB;
  });

  return (
    <Paper sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography
          variant={isMobile ? "body1" : "h6"}
          sx={{
            fontSize: isMobile ? "1rem" : undefined,
            fontWeight: "bold",
          }}
        >
          Land Breakdown
        </Typography>
        <Tooltip title="Learn about land types and their power ranking" arrow>
          <IconButton
            component={RouterLink}
            to="/land-glossary"
            size="small"
            sx={{ ml: 1 }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <List>
        {sortedLandTypes.map(([type, lands]) => (
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
  );
};
