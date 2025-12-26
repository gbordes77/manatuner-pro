import {
    ArrowBack as ArrowBackIcon,
    Terrain as TerrainIcon,
    EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

interface LandCategory {
  rank: number;
  name: string;
  description: string;
  whyPowerful: string;
  examples: string[];
  etbTapped: string;
  colorFix: string;
  downside: string;
}

const LAND_CATEGORIES: LandCategory[] = [
  {
    rank: 1,
    name: "Fetchland",
    description: "Lands that sacrifice to search your library for another land.",
    whyPowerful: "The most powerful lands in Magic. They thin your deck (improving draw quality), shuffle away bad cards, trigger landfall multiple times, and most importantly can find Shocklands or Dual lands giving you access to any color combination.",
    examples: ["Scalding Tarn", "Flooded Strand", "Polluted Delta", "Misty Rainforest", "Arid Mesa"],
    etbTapped: "No (but fetched land might be)",
    colorFix: "Any 2 colors (via fetchable duals)",
    downside: "1 life + fetched land cost",
  },
  {
    rank: 2,
    name: "Rainbow Land",
    description: "Lands that produce any color of mana.",
    whyPowerful: "Perfect mana fixing for any deck. Always enters untapped, giving you immediate access to all 5 colors. Essential for aggressive multicolor decks that need to curve out perfectly.",
    examples: ["Mana Confluence", "City of Brass", "Gemstone Mine", "Grand Coliseum"],
    etbTapped: "No",
    colorFix: "All 5 colors",
    downside: "1 life per tap (or limited uses)",
  },
  {
    rank: 3,
    name: "Shockland",
    description: "Dual lands with basic land types that can enter untapped for 2 life.",
    whyPowerful: "The backbone of competitive manabases. They have basic land types (fetchable!), provide 2 colors, and you choose whether to pay life for tempo or enter tapped when life matters more.",
    examples: ["Sacred Foundry", "Hallowed Fountain", "Steam Vents", "Overgrown Tomb", "Blood Crypt"],
    etbTapped: "Optional (pay 2 life for untapped)",
    colorFix: "2 colors",
    downside: "2 life if untapped",
  },
  {
    rank: 4,
    name: "Horizon Land",
    description: "Dual lands that can be sacrificed to draw a card.",
    whyPowerful: "Excellent in aggressive and low-curve decks. Early game they fix your mana, late game when you're flooded you can cash them in for a card. The card draw option makes them never truly dead.",
    examples: ["Sunbaked Canyon", "Fiery Islet", "Silent Clearing", "Waterlogged Grove", "Nurturing Peatland"],
    etbTapped: "No",
    colorFix: "2 colors",
    downside: "1 life per colored mana + no long-term mana",
  },
  {
    rank: 5,
    name: "Fastland",
    description: "Dual lands that enter untapped if you control 2 or fewer other lands.",
    whyPowerful: "Perfect for aggressive decks. Untapped on turns 1-3 when you need to curve out, which is exactly when tempo matters most. The downside of entering tapped late game is often irrelevant.",
    examples: ["Inspiring Vantage", "Seachrome Coast", "Blackcleave Cliffs", "Copperline Gorge", "Blooming Marsh"],
    etbTapped: "Only if you control 3+ lands",
    colorFix: "2 colors",
    downside: "Enters tapped in late game",
  },
  {
    rank: 6,
    name: "Checkland",
    description: "Dual lands that enter untapped if you control a land with a basic land type.",
    whyPowerful: "Great budget option and synergize perfectly with Shocklands (which have basic types). Reliable untapped mana once you've established your manabase.",
    examples: ["Clifftop Retreat", "Glacial Fortress", "Dragonskull Summit", "Rootbound Crag", "Sunpetal Grove"],
    etbTapped: "Only if no basic land type in play",
    colorFix: "2 colors",
    downside: "Unreliable turn 1, needs setup",
  },
  {
    rank: 7,
    name: "Painland",
    description: "Dual lands that deal 1 damage when tapped for colored mana.",
    whyPowerful: "Always untapped, always available. The 1 life cost is minimal in most matchups, and you can tap for colorless when you don't need colored mana to save life.",
    examples: ["Battlefield Forge", "Caves of Koilos", "Shivan Reef", "Llanowar Wastes", "Adarkar Wastes"],
    etbTapped: "No",
    colorFix: "2 colors + colorless",
    downside: "1 life per colored mana",
  },
  {
    rank: 8,
    name: "Conditional Land",
    description: "Lands with time-based or situational conditions for entering untapped.",
    whyPowerful: "Cards like Starting Town are excellent in aggressive decks - untapped turns 1-3 when it matters, and the 'downside' of entering tapped later rarely affects aggro strategies.",
    examples: ["Starting Town", "Elegant Parlor", "Lush Portico", "Raucous Theater"],
    etbTapped: "Depends on condition (turn number, life total, etc.)",
    colorFix: "Varies (often any color)",
    downside: "Conditional, may enter tapped",
  },
  {
    rank: 9,
    name: "Triome",
    description: "Lands that produce 3 colors but always enter tapped.",
    whyPowerful: "Excellent color fixing for 3+ color decks. Having basic land types makes them fetchable. The cycling ability provides late-game utility.",
    examples: ["Raffine's Tower", "Spara's Headquarters", "Jetmir's Garden", "Xander's Lounge", "Ziatora's Proving Ground"],
    etbTapped: "Yes (always)",
    colorFix: "3 colors",
    downside: "Always tapped, slow",
  },
  {
    rank: 10,
    name: "Utility Land",
    description: "Lands with special abilities beyond mana production.",
    whyPowerful: "Provide unique effects that can't be replicated by spells. Cavern of Souls makes creatures uncounterable, Mutavault is a creature land, etc.",
    examples: ["Cavern of Souls", "Mutavault", "Command Tower", "Reflecting Pool"],
    etbTapped: "Usually no",
    colorFix: "Varies",
    downside: "Often limited color production",
  },
  {
    rank: 11,
    name: "Basic Land",
    description: "The fundamental lands of Magic: Plains, Island, Swamp, Mountain, Forest.",
    whyPowerful: "Immune to non-basic land hate (Blood Moon, Back to Basics). Always untapped, no life cost. Essential for fetch targets and checkland enablers.",
    examples: ["Plains", "Island", "Swamp", "Mountain", "Forest"],
    etbTapped: "No",
    colorFix: "1 color only",
    downside: "Single color, no flexibility",
  },
];

const getRankColor = (rank: number): string => {
  if (rank === 1) return "#FFD700"; // Gold
  if (rank === 2) return "#C0C0C0"; // Silver
  if (rank === 3) return "#CD7F32"; // Bronze
  return "#1976d2"; // Default blue
};

export const LandGlossaryPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          <TerrainIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Land Type Glossary
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Understanding the different types of lands and their power level is crucial for building
          an optimal manabase. This guide ranks land categories from most to least powerful for
          competitive constructed play.
        </Typography>
      </Box>

      {/* Power Ranking Explanation */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          <TrophyIcon sx={{ mr: 1, verticalAlign: "middle", color: "#FFD700" }} />
          Why This Ranking?
        </Typography>
        <Typography variant="body2" paragraph>
          The ranking is based on several factors that matter in competitive Magic:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Tempo
                </Typography>
                <Typography variant="caption">
                  Does it enter untapped? Tempo loss from tapped lands can cost games.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Flexibility
                </Typography>
                <Typography variant="caption">
                  How many colors can it produce? Can it be fetched?
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Synergy
                </Typography>
                <Typography variant="caption">
                  Does it have basic land types? Does it enable other lands?
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Downside
                </Typography>
                <Typography variant="caption">
                  Life cost, conditions, or other restrictions that limit usefulness.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Land Categories */}
      <Grid container spacing={3}>
        {LAND_CATEGORIES.map((category) => (
          <Grid item xs={12} key={category.name}>
            <Card
              sx={{
                borderLeft: `4px solid ${getRankColor(category.rank)}`,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateX(4px)",
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
                  <Chip
                    label={`#${category.rank}`}
                    size="small"
                    sx={{
                      backgroundColor: getRankColor(category.rank),
                      color: category.rank <= 3 ? "#000" : "#fff",
                      fontWeight: "bold",
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {category.name}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {category.description}
                </Typography>

                <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                    Why it's powerful:
                  </Typography>
                  <Typography variant="body2">
                    {category.whyPowerful}
                  </Typography>
                </Paper>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Examples
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                      {category.examples.slice(0, isMobile ? 3 : 5).map((ex) => (
                        <Chip key={ex} label={ex} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3} md={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ETB Tapped?
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {category.etbTapped}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Color Fixing
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {category.colorFix}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Downside
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {category.downside}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {category.rank < 11 && <Divider sx={{ my: 1 }} />}
          </Grid>
        ))}
      </Grid>

      {/* Footer Tips */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Building Your Manabase - Quick Tips
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Aggressive Decks (Aggro)
            </Typography>
            <Typography variant="body2">
              Prioritize untapped lands. Fetchlands, Fastlands, and Rainbow Lands are your best friends.
              Every tapped land is a turn you can't attack.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Midrange Decks
            </Typography>
            <Typography variant="body2">
              Balance is key. Mix Fetchlands + Shocklands for flexibility, add some Checklands for
              consistency, and a few basics for Blood Moon protection.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Control Decks
            </Typography>
            <Typography variant="body2">
              You can afford some tapped lands early. Triomes become more playable, and the card
              selection from Fetch + shuffle is valuable for long games.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default LandGlossaryPage;
