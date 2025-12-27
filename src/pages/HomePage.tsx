import {
    Analytics as AnalyticsIcon,
    ArrowForward as ArrowForwardIcon,
    Book as BookIcon,
    Casino as CasinoIcon,
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
    useTheme,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedContainer } from "../components/common/AnimatedContainer";

// Mana symbol component using Keyrune font
const ManaSymbol: React.FC<{ color: 'w' | 'u' | 'b' | 'r' | 'g' | 'c'; size?: number; glow?: boolean }> = ({
  color,
  size = 24,
  glow = false
}) => (
  <i
    className={`ms ms-${color} ms-cost`}
    style={{
      fontSize: size,
      filter: glow ? 'drop-shadow(0 0 8px currentColor)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      transition: 'all 0.3s ease',
    }}
  />
);

// Floating mana symbols background decoration
const FloatingManaSymbols: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: isDark ? 0.15 : 0.08,
        zIndex: 0,
      }}
    >
      {/* Scattered mana symbols */}
      {[
        { color: 'w', top: '10%', left: '5%', size: 40, delay: 0 },
        { color: 'u', top: '20%', right: '8%', size: 35, delay: 0.5 },
        { color: 'b', bottom: '30%', left: '10%', size: 30, delay: 1 },
        { color: 'r', top: '40%', right: '5%', size: 38, delay: 1.5 },
        { color: 'g', bottom: '20%', right: '12%', size: 32, delay: 2 },
        { color: 'w', bottom: '10%', left: '20%', size: 28, delay: 2.5 },
        { color: 'u', top: '60%', left: '3%', size: 34, delay: 3 },
      ].map((symbol, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            ...symbol,
            animation: `float ${4 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${symbol.delay}s`,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(5deg)' },
            },
          }}
        >
          <ManaSymbol color={symbol.color as 'w' | 'u' | 'b' | 'r' | 'g'} size={symbol.size} />
        </Box>
      ))}
    </Box>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Réorganisé: dans l'ordre du Dashboard
  const features = [
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      title: "Health Score",
      description: "Instant manabase health percentage based on hypergeometric probability.",
      color: theme.palette.mana.green,
      manaColor: 'g' as const,
    },
    {
      icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
      title: "Castability",
      description: "Exact probability of casting each spell on curve, turn by turn.",
      color: theme.palette.mana.blue,
      manaColor: 'u' as const,
    },
    {
      icon: <CasinoIcon sx={{ fontSize: 40 }} />,
      title: "Mulligan Simulator",
      description: "Monte Carlo simulation tells you exactly when to keep or mulligan.",
      color: "#9c27b0",
      manaColor: 'b' as const,
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: "Export Blueprint",
      description: "Download your analysis as PNG, PDF or JSON. Share on Discord or archive.",
      color: theme.palette.mana.multicolor,
      manaColor: 'w' as const,
      isNew: true,
    },
  ];

  // Les fondations mathématiques avec mana colors
  const mathFoundations = [
    {
      title: "Karsten Tables",
      desc: "Mana source requirements",
      formula: "90%",
      manaColor: 'g' as const,
      color: isDark ? 'rgba(0, 115, 62, 0.15)' : '#e8f5e9',
      borderColor: theme.palette.mana.green,
    },
    {
      title: "Hypergeometric",
      desc: "Exact probability calculation",
      formula: "P(X≥k)",
      manaColor: 'u' as const,
      color: isDark ? 'rgba(14, 104, 171, 0.15)' : '#e3f2fd',
      borderColor: theme.palette.mana.blue,
    },
    {
      title: "Monte Carlo",
      desc: "3,000 hands simulated",
      formula: "n=3000",
      manaColor: 'b' as const,
      color: isDark ? 'rgba(90, 60, 90, 0.2)' : '#f3e5f5',
      borderColor: "#9c27b0",
    },
    {
      title: "Bellman Equation",
      desc: "Optimal stopping theory",
      formula: "E[V₇]",
      manaColor: 'r' as const,
      color: isDark ? 'rgba(211, 32, 42, 0.15)' : '#fff3e0',
      borderColor: theme.palette.mana.red,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ position: 'relative' }}>
      {/* Floating mana symbols background */}
      <FloatingManaSymbols />

      {/* Hero Section */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: "center", py: 3, position: 'relative', zIndex: 1 }}>
          {/* WUBRG mana row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              mb: 2,
              '& i': {
                transition: 'all 0.3s ease',
                cursor: 'default',
                '&:hover': {
                  transform: 'scale(1.2) translateY(-4px)',
                  filter: 'drop-shadow(0 0 12px currentColor) !important',
                },
              },
            }}
          >
            <ManaSymbol color="w" size={32} />
            <ManaSymbol color="u" size={32} />
            <ManaSymbol color="b" size={32} />
            <ManaSymbol color="r" size={32} />
            <ManaSymbol color="g" size={32} />
          </Box>

          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontFamily: '"Cinzel", serif',
              // WUBRG gradient - gold start for better visibility
              background: `linear-gradient(135deg,
                ${theme.palette.mana.multicolor} 0%,
                ${theme.palette.mana.blue} 25%,
                #9c27b0 50%,
                ${theme.palette.mana.red} 75%,
                ${theme.palette.mana.green} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.02em",
              textShadow: isDark ? '0 0 40px rgba(255,255,255,0.1)' : 'none',
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

          {/* Tags with mana symbols */}
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
              icon={<i className="ms ms-u ms-cost" style={{ fontSize: 14 }} />}
              label="Turn-by-Turn Probabilities"
              sx={{
                bgcolor: isDark ? 'rgba(14, 104, 171, 0.2)' : "#e3f2fd",
                color: isDark ? theme.palette.mana.blue : "#1565c0",
                fontWeight: 600,
                '& .MuiChip-icon': { ml: 1 }
              }}
            />
            <Chip
              icon={<i className="ms ms-b ms-cost" style={{ fontSize: 14 }} />}
              label="Monte Carlo Mulligan"
              sx={{
                bgcolor: isDark ? 'rgba(90, 60, 90, 0.3)' : "#f3e5f5",
                color: isDark ? '#CE93D8' : "#7b1fa2",
                fontWeight: 600,
                '& .MuiChip-icon': { ml: 1 }
              }}
            />
            <Chip
              icon={<i className="ms ms-g ms-cost" style={{ fontSize: 14 }} />}
              label="Proven Mathematics"
              sx={{
                bgcolor: isDark ? 'rgba(0, 115, 62, 0.2)' : "#e8f5e9",
                color: isDark ? theme.palette.mana.green : "#2e7d32",
                fontWeight: 600,
                '& .MuiChip-icon': { ml: 1 }
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
                  // Gold multicolor button
                  background: `linear-gradient(135deg, ${theme.palette.mana.multicolor} 0%, #FFD700 50%, ${theme.palette.mana.multicolor} 100%)`,
                  color: "#1a1a2e",
                  boxShadow: `0 8px 32px ${theme.palette.mana.multicolor}50`,
                  border: '2px solid rgba(255,255,255,0.3)',
                  "&:hover": {
                    background: `linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFD700 100%)`,
                    boxShadow: `0 12px 40px ${theme.palette.mana.multicolor}70`,
                    transform: "translateY(-3px)",
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
                  borderColor: theme.palette.mana.blue,
                  color: isDark ? theme.palette.mana.blue : theme.palette.primary.main,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                    bgcolor: `${theme.palette.mana.blue}15`,
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

      {/* Math Foundations with mana symbols */}
      <Box sx={{ my: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: 2.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.mana.multicolor,
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
            sx={{ mt: 0.5, fontFamily: '"Cinzel", serif' }}
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
                    position: 'relative',
                    overflow: 'hidden',
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

      {/* Features Grid with mana-colored accents */}
      <Box sx={{ my: 3, position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mb: 2.5, textAlign: "center", fontFamily: '"Cinzel", serif' }}
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
                    position: 'relative',
                    overflow: 'hidden',
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 16px 40px ${feature.color}30`,
                      borderColor: feature.color,
                      '& .feature-mana': {
                        transform: 'scale(1.3)',
                        opacity: 0.3,
                      },
                    },
                  }}
                >
                  {/* Background mana symbol */}
                  <Box
                    className="feature-mana"
                    sx={{
                      position: 'absolute',
                      bottom: -10,
                      right: -10,
                      opacity: 0.1,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ManaSymbol color={feature.manaColor} size={80} />
                  </Box>

                  <CardContent sx={{ textAlign: "center", py: 3, position: 'relative', zIndex: 1 }}>
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
                        border: `2px solid ${feature.color}30`,
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
                            bgcolor: theme.palette.mana.multicolor,
                            color: "#1a1a2e",
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

      {/* How It Works */}
      <Card
        sx={{
          my: 3,
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(135deg, rgba(26,26,30,0.8) 0%, rgba(13,13,15,0.9) 100%)'
            : "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
          border: "1px solid",
          borderColor: "divider",
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ py: 3, px: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 2.5, textAlign: "center", fontFamily: '"Cinzel", serif' }}
          >
            How It Works
          </Typography>
          <Grid container spacing={3} alignItems="center">
            {[
              { num: "1", title: "Paste Your Deck", desc: "MTGO, MTGA, Moxfield & more", mana: 'w' },
              { num: "2", title: "Get Probabilities", desc: "Cast chances for every spell, every turn", mana: 'u' },
              { num: "3", title: "Know Your Mulligans", desc: "Optimal thresholds for your archetype", mana: 'g' },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,
                        ${theme.palette.mana.white} 0%,
                        ${theme.palette.mana.blue} 25%,
                        #9c27b0 50%,
                        ${theme.palette.mana.red} 75%,
                        ${theme.palette.mana.green} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                      position: 'relative',
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
          background: isDark
            ? 'linear-gradient(135deg, rgba(90, 60, 90, 0.2) 0%, rgba(30, 30, 50, 0.3) 100%)'
            : "linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)",
          flexWrap: "wrap",
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BookIcon sx={{ color: "#9c27b0", fontSize: 28 }} />
          <Typography variant="body1">
            <strong>New to manabase theory?</strong> Learn the math behind optimal deckbuilding
          </Typography>
        </Box>
        <Button
          onClick={() => navigate("/mathematics")}
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontWeight: 600,
            color: "#9c27b0",
          }}
        >
          Learn the Math
        </Button>
      </Paper>

      {/* Privacy - with mana symbols */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          py: 1.5,
          flexWrap: "wrap",
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[
          { icon: <i className="ms ms-w ms-cost" style={{ fontSize: 16 }} />, text: "100% Local" },
          { icon: <i className="ms ms-u ms-cost" style={{ fontSize: 16 }} />, text: "No account required" },
          { icon: <i className="ms ms-g ms-cost" style={{ fontSize: 16 }} />, text: "Auto-saved" },
        ].map((item, index) => (
          <Typography key={index} variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {item.icon} {item.text}
          </Typography>
        ))}
      </Box>

      {/* Final CTA with WUBRG gradient */}
      <Paper
        sx={{
          p: 3,
          mt: 2,
          mb: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg,
            ${theme.palette.mana.blue} 0%,
            #7B1FA2 50%,
            ${theme.palette.mana.red} 100%)`,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Background mana symbols */}
        <Box sx={{ position: 'absolute', top: 10, left: 20, opacity: 0.2 }}>
          <ManaSymbol color="w" size={40} />
        </Box>
        <Box sx={{ position: 'absolute', bottom: 10, right: 100, opacity: 0.2 }}>
          <ManaSymbol color="g" size={35} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} fontFamily='"Cinzel", serif'>
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
            bgcolor: theme.palette.mana.multicolor,
            color: "#1a1a2e",
            borderRadius: 3,
            border: '2px solid rgba(255,255,255,0.3)',
            position: 'relative',
            zIndex: 1,
            "&:hover": {
              bgcolor: "#FFD700",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
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
