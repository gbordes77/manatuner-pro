import {
    Analytics as AnalyticsIcon,
    ArrowForward as ArrowForwardIcon,
    Book as BookIcon,
    MenuBook as MenuBookIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    Widgets as WidgetsIcon,
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
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedContainer } from "../components/common/AnimatedContainer";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AnalyticsIcon color="primary" sx={{ fontSize: 32 }} />,
      title: "Advanced Analytics",
      description:
        "Precise manabase calculations using Frank Karsten's research and hypergeometric distribution.",
    },
    {
      icon: <SpeedIcon color="primary" sx={{ fontSize: 32 }} />,
      title: "Lightning Fast",
      description:
        "Instant results with cached Scryfall data and optimized algorithms.",
    },
    {
      icon: <SecurityIcon color="primary" sx={{ fontSize: 32 }} />,
      title: "Secure & Private",
      description:
        "Your deck data stays private. No tracking, no ads, just pure manabase analysis.",
    },
    {
      icon: <WidgetsIcon color="primary" sx={{ fontSize: 32 }} />,
      title: "All Formats",
      description:
        "Support for Standard, Modern, Legacy, Commander, and more MTG formats.",
    },
  ];

  const privacyFeatures = [
    { icon: "🔒", title: "Zero-Knowledge", desc: "Client-side encryption" },
    { icon: "📱", title: "100% Local", desc: "Works offline" },
    { icon: "🔑", title: "Personal Code", desc: "Retrieve your analyses" },
    { icon: "🚀", title: "Ultra Fast", desc: "No server = speed" },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section - Optimisation 3: Reduced spacing */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #1976d2, #42a5f5)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Perfect Your Manabase
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<StarIcon />}
              label="Frank Karsten Research"
              color="primary"
              component="a"
              href="https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/"
              target="_blank"
              rel="noopener noreferrer"
              clickable
              sx={{
                cursor: "pointer",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 2,
                },
                transition: "all 0.2s ease-in-out",
              }}
            />
            <Chip
              icon={<TrendingUpIcon />}
              label="Hypergeometric Analysis"
              color="secondary"
            />
            <Chip label="Free & Open Source" variant="outlined" />
          </Box>

          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Professional MTG manabase analysis tool. Get precise probabilities
            and optimal land counts for competitive play.
          </Typography>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 3,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <AnimatedContainer animation="slideInLeft" delay={0.2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/guide")}
                startIcon={<MenuBookIcon />}
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 3,
                  boxShadow: 3,
                  background:
                    "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
                  color: "white",
                  "&:hover": {
                    boxShadow: 5,
                    transform: "translateY(-2px)",
                    background:
                      "linear-gradient(45deg, #388e3c 30%, #4caf50 90%)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Read Guide First
              </Button>
            </AnimatedContainer>

            <AnimatedContainer animation="scaleIn" delay={0.4}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/analyzer")}
                startIcon={<AnalyticsIcon />}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  borderRadius: 3,
                  boxShadow: 4,
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                  color: "white",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                    background:
                      "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Start Analyzing
              </Button>
            </AnimatedContainer>

            <AnimatedContainer animation="slideInLeft" delay={0.6}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/about")}
                color="secondary"
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 3,
                  boxShadow: 3,
                  background:
                    "linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)",
                  color: "white",
                  "&:hover": {
                    boxShadow: 5,
                    transform: "translateY(-2px)",
                    background:
                      "linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Learn More
              </Button>
            </AnimatedContainer>
          </Box>
        </Box>
      </AnimatedContainer>

      {/* Features Grid - Optimisation 4: 4 colonnes au lieu de 2x2 */}
      <Grid container spacing={2} sx={{ py: 3 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center", py: 2 }}>
                <Box sx={{ mb: 1 }}>{feature.icon}</Box>
                <Typography variant="subtitle1" component="h2" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Complete Guide - Optimisation 1: Bandeau horizontal compact */}
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          mb: 3,
          bgcolor: "action.hover",
          borderRadius: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BookIcon color="secondary" />
          <Typography variant="body1">
            <strong>Complete Guide:</strong> Learn manabase basics with Frank Karsten's research
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={() => navigate("/guide")}
          endIcon={<ArrowForwardIcon />}
          sx={{ whiteSpace: "nowrap" }}
        >
          Read Guide
        </Button>
      </Paper>

      {/* Privacy-First Feature - Optimisation 2: Layout 2 colonnes */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          mb: 3,
        }}
      >
        <CardContent sx={{ py: 3, px: 4 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Left: Title + description */}
            <Grid item xs={12} md={5}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                🔐 First Privacy-First MTG Analyzer
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Your decks stay private. Even we, the developers, cannot see them!
              </Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate("/analyzer")}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  }}
                >
                  Try Analyzer
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/privacy-first")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Privacy Info
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/mes-analyses")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  My Analyses
                </Button>
              </Box>
            </Grid>
            {/* Right: 2x2 grid of features */}
            <Grid item xs={12} md={7}>
              <Grid container spacing={1}>
                {privacyFeatures.map((feat, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
                      <Typography variant="h6" component="span">{feat.icon}</Typography>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{feat.title}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>{feat.desc}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Call to Action - Optimisation 5: Compacté en une ligne */}
      <Paper
        sx={{
          p: 3,
          mt: 3,
          mb: 4,
          background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h2" fontWeight="bold">
          Ready to Optimize Your Deck?
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/analyzer")}
          startIcon={<AnalyticsIcon />}
          sx={{
            px: 4,
            py: 1,
            fontSize: "1rem",
            fontWeight: "bold",
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: 3,
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.3)",
              transform: "translateY(-2px)",
              boxShadow: 6,
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          Try It Now - Free
        </Button>
      </Paper>
    </Container>
  );
};
