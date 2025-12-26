import {
    Analytics as AnalyticsIcon,
    ArrowForward as ArrowForwardIcon,
    Book as BookIcon,
    Casino as CasinoIcon,
    Functions as FunctionsIcon,
    MenuBook as MenuBookIcon,
    Psychology as PsychologyIcon,
    ShowChart as ShowChartIcon,
    Timeline as TimelineIcon
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

  // Réorganisé: dans l'ordre du Dashboard
  const features = [
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      title: "Health Score",
      description: "Instant manabase health percentage based on hypergeometric probability.",
      color: "#4caf50",
    },
    {
      icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
      title: "Castability",
      description: "Exact probability of casting each spell on curve, turn by turn.",
      color: "#2196f3",
    },
    {
      icon: <CasinoIcon sx={{ fontSize: 40 }} />,
      title: "Mulligan Simulator",
      description: "Monte Carlo simulation tells you exactly when to keep or mulligan.",
      color: "#9c27b0",
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: "Export Blueprint",
      description: "Download your analysis as PNG, PDF or JSON. Share on Discord or archive.",
      color: "#00D9FF",
      isNew: true,
    },
  ];

  // Les fondations mathématiques avec couleurs - Karsten en premier
  const mathFoundations = [
    {
      title: "Karsten Tables",
      desc: "Mana source requirements",
      formula: "90%",
      color: "#e8f5e9",
      borderColor: "#4caf50",
    },
    {
      title: "Hypergeometric",
      desc: "Exact probability calculation",
      formula: "P(X≥k)",
      color: "#e3f2fd",
      borderColor: "#1976d2",
    },
    {
      title: "Monte Carlo",
      desc: "3,000 hands simulated",
      formula: "n=3000",
      color: "#f3e5f5",
      borderColor: "#9c27b0",
    },
    {
      title: "Bellman Equation",
      desc: "Optimal stopping theory",
      formula: "E[V₇]",
      color: "#fff3e0",
      borderColor: "#ff9800",
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Can You Cast Your Spells On Curve?
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              maxWidth: 650,
              mx: "auto",
              mb: 2,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Stop guessing. Get <strong>exact probabilities</strong> for every spell,
            plus know <strong>exactly when to mulligan</strong>.
          </Typography>

          {/* Tags */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
              mb: 2.5,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<ShowChartIcon />}
              label="Turn-by-Turn Probabilities"
              sx={{
                bgcolor: "#e3f2fd",
                color: "#1565c0",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "#1565c0" }
              }}
            />
            <Chip
              icon={<CasinoIcon />}
              label="Monte Carlo Mulligan"
              sx={{
                bgcolor: "#f3e5f5",
                color: "#7b1fa2",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "#7b1fa2" }
              }}
            />
            <Chip
              icon={<FunctionsIcon />}
              label="Proven Mathematics"
              sx={{
                bgcolor: "#fff3e0",
                color: "#e65100",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "#e65100" }
              }}
            />
          </Box>

          {/* CTA Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <AnimatedContainer animation="scaleIn" delay={0.2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/analyzer")}
                startIcon={<AnalyticsIcon />}
                sx={{
                  px: 5,
                  py: 1.8,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(25, 118, 210, 0.35)",
                  background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                  "&:hover": {
                    boxShadow: "0 12px 40px rgba(25, 118, 210, 0.45)",
                    transform: "translateY(-3px)",
                    background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Analyze My Deck
              </Button>
            </AnimatedContainer>

            <AnimatedContainer animation="slideInLeft" delay={0.4}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/guide")}
                startIcon={<MenuBookIcon />}
                sx={{
                  px: 4,
                  py: 1.8,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Read Guide
              </Button>
            </AnimatedContainer>
          </Box>
        </Box>
      </AnimatedContainer>

      {/* Math Foundations - Design sexy */}
      <Box sx={{ my: 3 }}>
        <Box sx={{ textAlign: "center", mb: 2.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: "0.85rem",
            }}
          >
            Powered By
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mt: 0.5 }}
          >
            Rigorous Mathematics
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1, maxWidth: 500, mx: "auto" }}
          >
            Not guesswork. Real probability theory used by mathematicians and competitive players.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {mathFoundations.map((foundation, index) => (
            <Grid item xs={6} md={3} key={index}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.1}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: foundation.color,
                    border: "2px solid",
                    borderColor: foundation.borderColor,
                    height: "100%",
                    minHeight: 140,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 24px ${foundation.borderColor}40`,
                    },
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      color: foundation.borderColor,
                      lineHeight: 1,
                      mb: 0.5,
                    }}
                  >
                    {foundation.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{
                      fontFamily: "monospace",
                      color: foundation.borderColor,
                      opacity: 0.8,
                      mb: 1,
                    }}
                  >
                    {foundation.formula}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {foundation.desc}
                  </Typography>
                </Paper>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Grid - Cards colorées */}
      <Box sx={{ my: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mb: 2.5, textAlign: "center" }}
        >
          What You Get
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.1}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 16px 40px ${feature.color}30`,
                      borderColor: feature.color,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        bgcolor: `${feature.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {feature.title}
                      </Typography>
                      {(feature as { isNew?: boolean }).isNew && (
                        <Box
                          component="span"
                          sx={{
                            bgcolor: "#00D9FF",
                            color: "#0A1628",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            px: 0.8,
                            py: 0.2,
                            borderRadius: 1,
                            letterSpacing: 0.5,
                          }}
                        >
                          NEW
                        </Box>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works - Style moderne */}
      <Card
        sx={{
          my: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ py: 3, px: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 2.5, textAlign: "center" }}
          >
            How It Works
          </Typography>
          <Grid container spacing={3} alignItems="center">
            {[
              { num: "1", title: "Paste Your Deck", desc: "MTGO, MTGA, Moxfield or any format" },
              { num: "2", title: "Get Probabilities", desc: "Cast chances for every spell, every turn" },
              { num: "3", title: "Know Your Mulligans", desc: "Optimal thresholds for your archetype" },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                      boxShadow: "0 8px 24px rgba(25, 118, 210, 0.3)",
                    }}
                  >
                    <Typography variant="h4" fontWeight={800} color="white">
                      {step.num}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Guide Banner */}
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          mb: 2,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BookIcon sx={{ color: "#7b1fa2", fontSize: 28 }} />
          <Typography variant="body1">
            <strong>New to manabase theory?</strong> Learn the math behind optimal deckbuilding
          </Typography>
        </Box>
        <Button
          onClick={() => navigate("/guide")}
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontWeight: 600,
            color: "#7b1fa2",
          }}
        >
          Read Guide
        </Button>
      </Paper>

      {/* Privacy - Discret */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          py: 1.5,
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: "🔒", text: "100% Local" },
          { icon: "⚡", text: "No account required" },
          { icon: "💾", text: "Auto-saved" },
        ].map((item, index) => (
          <Typography key={index} variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {item.icon} {item.text}
          </Typography>
        ))}
      </Box>

      {/* Final CTA */}
      <Paper
        sx={{
          p: 3,
          mt: 2,
          mb: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 16px 48px rgba(25, 118, 210, 0.3)",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Ready to Optimize?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
            Find out if your manabase can support your game plan
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/analyzer")}
          startIcon={<AnalyticsIcon />}
          sx={{
            px: 5,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 700,
            bgcolor: "white",
            color: "#1976d2",
            borderRadius: 3,
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.9)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Start Now — Free
        </Button>
      </Paper>
    </Container>
  );
};
