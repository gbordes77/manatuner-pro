import {
    Analytics as AnalyticsIcon,
    ArrowForward as ArrowForwardIcon,
    Casino as CasinoIcon,
    Functions as FunctionsIcon,
    GitHub as GitHubIcon,
    ShowChart as ShowChartIcon,
} from '@mui/icons-material';
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
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedContainer } from '../common/AnimatedContainer';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShowChartIcon sx={{ fontSize: 32 }} />,
      title: "Frank Karsten Mathematics",
      description: "Built on the foundational research of Pro Tour Hall of Famer Frank Karsten.",
      color: "#4caf50",
    },
    {
      icon: <CasinoIcon sx={{ fontSize: 32 }} />,
      title: "Monte Carlo Simulation",
      description: "3,000 hand simulations for accurate mulligan decisions.",
      color: "#9c27b0",
    },
    {
      icon: <FunctionsIcon sx={{ fontSize: 32 }} />,
      title: "Bellman Equation",
      description: "Optimal stopping theory for mathematically perfect keep/mulligan thresholds.",
      color: "#ff9800",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
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
            }}
          >
            About ManaTuner Pro
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}
          >
            Professional manabase analysis for competitive Magic: The Gathering
          </Typography>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Free & Open Source" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600 }} />
            <Chip label="100% Local" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600 }} />
            <Chip label="No Account Required" sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", fontWeight: 600 }} />
          </Box>
        </Box>
      </AnimatedContainer>

      {/* Mission Section */}
      <Paper
        sx={{
          p: 4,
          mb: 5,
          borderRadius: 4,
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          border: "2px solid #1976d2",
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ color: "#1565c0", mb: 2 }}>
          🎯 Our Mission
        </Typography>
        <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
          ManaTuner Pro is a comprehensive manabase analysis tool for Magic: The Gathering,
          meticulously crafted to provide tournament-level insights for competitive players and deck builders.
          We believe every player deserves access to the same mathematical tools used by professional players.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight={700} sx={{ textAlign: "center", mb: 4 }}>
          Built on Proven Mathematics
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.1}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: feature.color,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 16px 40px ${feature.color}30`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
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
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
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

      {/* Origin Story */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 3,
              bgcolor: "#e8f5e9",
              border: "2px solid #4caf50",
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: "#2e7d32", mb: 2 }}>
              📊 Built on Research
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              Our analysis algorithms are based on <strong>Frank Karsten's</strong> groundbreaking
              mathematical research on mana probability and deck construction theory, combined with
              hypergeometric distribution and Monte Carlo methods.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 3,
              bgcolor: "#f3e5f5",
              border: "2px solid #9c27b0",
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: "#7b1fa2", mb: 2 }}>
              🚀 Continuing Innovation
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              Built as a modern continuation of <strong>Charles Wickham's</strong> original
              <em> "Project Manabase"</em>, extending and modernizing his comprehensive analysis
              framework with Monte Carlo simulations and Bellman equation optimization.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* What Makes Us Different */}
      <Paper
        sx={{
          p: 4,
          mb: 5,
          borderRadius: 4,
          background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
          border: "2px solid #ff9800",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ color: "#e65100", mb: 2 }}>
          ⚡ What Makes Us Different
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.8 }}>
          We combine proven mathematical foundations with modern web technology to deliver
          real-time manabase optimization, interactive visualizations, and actionable recommendations
          that help you build better, more consistent decks.
        </Typography>
      </Paper>

      {/* Links Section */}
      <Box sx={{ mb: 5 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<GitHubIcon />}
              href="https://github.com/gbordes77/manatuner-pro"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                py: 2,
                borderRadius: 3,
                borderWidth: 2,
                fontWeight: 600,
                "&:hover": { borderWidth: 2 },
              }}
            >
              View on GitHub
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Final CTA */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 3,
          boxShadow: "0 16px 48px rgba(25, 118, 210, 0.3)",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Ready to Optimize?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
            Try ManaTuner Pro free — no account required
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/analyzer")}
          startIcon={<AnalyticsIcon />}
          endIcon={<ArrowForwardIcon />}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 700,
            bgcolor: "white",
            color: "#1976d2",
            borderRadius: 3,
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.9)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Start Analyzing
        </Button>
      </Paper>
    </Container>
  );
};

export const PrivacyPage: React.FC = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 800,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Privacy Policy
      </Typography>
    </Box>
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight={700}>
        Your Privacy Matters
      </Typography>
      <Typography variant="body1" paragraph>
        ManaTuner Pro is designed with privacy as a core principle. We don't collect, store,
        or transmit any of your personal data or deck information.
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>100% Local:</strong> All your analyses are stored in your browser's local storage.
        Your decklists never leave your device.
      </Typography>
      <Typography variant="body1">
        <strong>No Tracking:</strong> We don't use analytics, cookies, or any form of user tracking.
      </Typography>
    </Paper>
  </Container>
);
