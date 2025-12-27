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
    Grid,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedContainer } from "../components/common/AnimatedContainer";
import { FloatingManaSymbols } from "../components/common/FloatingManaSymbols";

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
    name: "Original Dual Land",
    description: "The original Alpha/Beta dual lands with two basic land types and no drawback.",
    whyPowerful: "The absolute best lands ever printed. They produce 2 colors, always enter untapped, have basic land types (fetchable!), and have ZERO downside. Reserved List means they'll never be reprinted, making them the gold standard all other duals are measured against.",
    examples: ["Underground Sea", "Tropical Island", "Volcanic Island", "Tundra", "Bayou", "Savannah", "Scrubland", "Badlands", "Taiga", "Plateau"],
    etbTapped: "No",
    colorFix: "2 colors",
    downside: "None (only price and Reserved List)",
  },
  {
    rank: 2,
    name: "Fetchland",
    description: "Lands that sacrifice to search your library for another land.",
    whyPowerful: "The most versatile lands in Magic. They thin your deck (improving draw quality), shuffle away bad cards, trigger landfall multiple times, and most importantly can find Shocklands or Original Duals giving you access to any color combination.",
    examples: ["Scalding Tarn", "Flooded Strand", "Polluted Delta", "Misty Rainforest", "Arid Mesa"],
    etbTapped: "No (but fetched land might be)",
    colorFix: "Any 2 colors (via fetchable duals)",
    downside: "1 life + fetched land cost",
  },
  {
    rank: 3,
    name: "Rainbow Land",
    description: "Lands that produce any color of mana.",
    whyPowerful: "Perfect mana fixing for any deck. Always enters untapped, giving you immediate access to all 5 colors. Essential for aggressive multicolor decks that need to curve out perfectly.",
    examples: ["Mana Confluence", "City of Brass", "Gemstone Mine", "Grand Coliseum"],
    etbTapped: "No",
    colorFix: "All 5 colors",
    downside: "1 life per tap (or limited uses)",
  },
  {
    rank: 4,
    name: "Shockland",
    description: "Dual lands with basic land types that can enter untapped for 2 life.",
    whyPowerful: "The backbone of competitive Modern/Pioneer manabases. They have basic land types (fetchable!), provide 2 colors, and you choose whether to pay life for tempo or enter tapped when life matters more.",
    examples: ["Sacred Foundry", "Hallowed Fountain", "Steam Vents", "Overgrown Tomb", "Blood Crypt"],
    etbTapped: "Optional (pay 2 life for untapped)",
    colorFix: "2 colors",
    downside: "2 life if untapped",
  },
  {
    rank: 5,
    name: "Horizon Land",
    description: "Dual lands that can be sacrificed to draw a card.",
    whyPowerful: "Excellent in aggressive and low-curve decks. Early game they fix your mana, late game when you're flooded you can cash them in for a card. The card draw option makes them never truly dead.",
    examples: ["Sunbaked Canyon", "Fiery Islet", "Silent Clearing", "Waterlogged Grove", "Nurturing Peatland"],
    etbTapped: "No",
    colorFix: "2 colors",
    downside: "1 life per colored mana + no long-term mana",
  },
  {
    rank: 6,
    name: "Fastland",
    description: "Dual lands that enter untapped if you control 2 or fewer other lands.",
    whyPowerful: "Perfect for aggressive decks. Untapped on turns 1-3 when you need to curve out, which is exactly when tempo matters most. The downside of entering tapped late game is often irrelevant.",
    examples: ["Inspiring Vantage", "Seachrome Coast", "Blackcleave Cliffs", "Copperline Gorge", "Blooming Marsh"],
    etbTapped: "Only if you control 3+ lands",
    colorFix: "2 colors",
    downside: "Enters tapped in late game",
  },
  {
    rank: 7,
    name: "Checkland",
    description: "Dual lands that enter untapped if you control a land with a basic land type.",
    whyPowerful: "Great budget option and synergize perfectly with Shocklands (which have basic types). Reliable untapped mana once you've established your manabase.",
    examples: ["Clifftop Retreat", "Glacial Fortress", "Dragonskull Summit", "Rootbound Crag", "Sunpetal Grove"],
    etbTapped: "Only if no basic land type in play",
    colorFix: "2 colors",
    downside: "Unreliable turn 1, needs setup",
  },
  {
    rank: 8,
    name: "Painland",
    description: "Dual lands that deal 1 damage when tapped for colored mana.",
    whyPowerful: "Always untapped, always available. The 1 life cost is minimal in most matchups, and you can tap for colorless when you don't need colored mana to save life.",
    examples: ["Battlefield Forge", "Caves of Koilos", "Shivan Reef", "Llanowar Wastes", "Adarkar Wastes"],
    etbTapped: "No",
    colorFix: "2 colors + colorless",
    downside: "1 life per colored mana",
  },
  {
    rank: 9,
    name: "Conditional Land",
    description: "Lands with time-based or situational conditions for entering untapped.",
    whyPowerful: "Cards like Starting Town are excellent in aggressive decks - untapped turns 1-3 when it matters, and the 'downside' of entering tapped later rarely affects aggro strategies.",
    examples: ["Starting Town", "Elegant Parlor", "Lush Portico", "Raucous Theater"],
    etbTapped: "Depends on condition (turn number, life total, etc.)",
    colorFix: "Varies (often any color)",
    downside: "Conditional, may enter tapped",
  },
  {
    rank: 10,
    name: "Triome",
    description: "Lands that produce 3 colors but always enter tapped.",
    whyPowerful: "Excellent color fixing for 3+ color decks. Having basic land types makes them fetchable. The cycling ability provides late-game utility.",
    examples: ["Raffine's Tower", "Spara's Headquarters", "Jetmir's Garden", "Xander's Lounge", "Ziatora's Proving Ground"],
    etbTapped: "Yes (always)",
    colorFix: "3 colors",
    downside: "Always tapped, slow",
  },
  {
    rank: 11,
    name: "Utility Land",
    description: "Lands with special abilities beyond mana production.",
    whyPowerful: "Provide unique effects that can't be replicated by spells. Cavern of Souls makes creatures uncounterable, Mutavault is a creature land, etc.",
    examples: ["Cavern of Souls", "Mutavault", "Command Tower", "Reflecting Pool"],
    etbTapped: "Usually no",
    colorFix: "Varies",
    downside: "Often limited color production",
  },
  {
    rank: 12,
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
  if (rank === 2) return "#9e9e9e"; // Silver
  if (rank === 3) return "#CD7F32"; // Bronze
  if (rank <= 6) return "#1976d2"; // Blue
  if (rank <= 9) return "#9c27b0"; // Purple
  return "#607d8b"; // Grey
};

const getRankGradient = (rank: number): string => {
  if (rank === 1) return "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)";
  if (rank === 2) return "linear-gradient(135deg, #C0C0C0 0%, #9e9e9e 100%)";
  if (rank === 3) return "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)";
  return `linear-gradient(135deg, ${getRankColor(rank)} 0%, ${getRankColor(rank)}dd 100%)`;
};

export const LandGlossaryPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const rankingFactors = [
    { title: "Tempo", desc: "Does it enter untapped?", icon: "⚡", color: "#f44336" },
    { title: "Flexibility", desc: "How many colors? Fetchable?", icon: "🎨", color: "#2196f3" },
    { title: "Synergy", desc: "Basic land types? Enables others?", icon: "🔗", color: "#4caf50" },
    { title: "Downside", desc: "Life cost? Conditions?", icon: "⚠️", color: "#ff9800" },
  ];

  const deckTips = [
    { type: "Aggro", desc: "Prioritize untapped lands. Fetchlands, Fastlands, and Rainbow Lands.", color: "#f44336" },
    { type: "Midrange", desc: "Balance Fetchlands + Shocklands, add Checklands and basics.", color: "#ff9800" },
    { type: "Control", desc: "Can afford some taplands. Triomes become more playable.", color: "#2196f3" },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      {/* Floating mana symbols background */}
      <FloatingManaSymbols />

      {/* Header */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ mb: 5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "3rem" },
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <TerrainIcon sx={{ fontSize: { xs: 40, md: 56 }, color: "#1976d2" }} />
              Land Type Glossary
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: "auto" }}
            >
              Understanding land types is crucial for building an optimal manabase.
              Ranked from most to least powerful for competitive play.
            </Typography>
          </Box>
        </Box>
      </AnimatedContainer>

      {/* Ranking Factors */}
      <Paper
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 3,
          background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <TrophyIcon sx={{ color: "#FFD700", fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700}>
            Why This Ranking?
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {rankingFactors.map((factor, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  border: "2px solid",
                  borderColor: factor.color,
                  bgcolor: `${factor.color}08`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${factor.color}30`,
                  },
                }}
              >
                <Typography variant="h4" sx={{ mb: 0.5 }}>{factor.icon}</Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: factor.color }}>
                  {factor.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {factor.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Land Categories */}
      <Box sx={{ mb: 5 }}>
        <Grid container spacing={3}>
          {LAND_CATEGORIES.map((category, index) => (
            <Grid item xs={12} key={category.name}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.05}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateX(8px)",
                      boxShadow: `0 8px 32px ${getRankColor(category.rank)}30`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 6,
                      background: getRankGradient(category.rank),
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: getRankGradient(category.rank),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: category.rank <= 3 ? "#000" : "#fff",
                          fontWeight: 800,
                          fontSize: "1.2rem",
                          boxShadow: `0 4px 12px ${getRankColor(category.rank)}40`,
                        }}
                      >
                        #{category.rank}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={700}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Paper
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: `${getRankColor(category.rank)}10`,
                        borderLeft: `4px solid ${getRankColor(category.rank)}`,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: getRankColor(category.rank), mb: 0.5 }}>
                        Why it's powerful:
                      </Typography>
                      <Typography variant="body2">
                        {category.whyPowerful}
                      </Typography>
                    </Paper>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                          Examples
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                          {category.examples.slice(0, isMobile ? 3 : 5).map((ex) => (
                            <Chip
                              key={ex}
                              label={ex}
                              size="small"
                              sx={{
                                bgcolor: `${getRankColor(category.rank)}15`,
                                borderColor: getRankColor(category.rank),
                                fontWeight: 500,
                              }}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                          ETB Tapped?
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {category.etbTapped}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                          Color Fixing
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {category.colorFix}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                          Downside
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {category.downside}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Building Tips */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)",
          color: "white",
          mb: 4,
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Building Your Manabase - Quick Tips
        </Typography>
        <Grid container spacing={3}>
          {deckTips.map((tip, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.95)",
                  height: "100%",
                }}
              >
                <Chip
                  label={tip.type}
                  sx={{
                    bgcolor: tip.color,
                    color: "white",
                    fontWeight: 700,
                    mb: 1.5,
                  }}
                />
                <Typography variant="body2" color="text.primary">
                  {tip.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default LandGlossaryPage;
