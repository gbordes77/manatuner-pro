import {
    ArrowForward as ArrowForwardIcon,
    Calculate as CalculateIcon,
    Casino as CasinoIcon,
    ExpandMore as ExpandMoreIcon,
    Functions as FunctionsIcon,
    Science as ScienceIcon,
    Timeline as TimelineIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedContainer } from '../components/common/AnimatedContainer';

const MathematicsPage: React.FC = () => {
  const navigate = useNavigate();

  const mathFoundations = [
    {
      icon: <FunctionsIcon sx={{ fontSize: 40 }} />,
      title: "Hypergeometric Distribution",
      desc: "Exact probability of drawing specific cards from a finite deck",
      color: "#1976d2",
      bgColor: "#e3f2fd",
    },
    {
      icon: <CasinoIcon sx={{ fontSize: 40 }} />,
      title: "Monte Carlo Simulation",
      desc: "3,000 random hands to validate probability calculations",
      color: "#9c27b0",
      bgColor: "#f3e5f5",
    },
    {
      icon: <CalculateIcon sx={{ fontSize: 40 }} />,
      title: "Bellman Equation",
      desc: "Optimal stopping theory for mulligan decisions",
      color: "#ff9800",
      bgColor: "#fff3e0",
    },
  ];

  const karstenTable = [
    { cost: "1 Colored (C)", t1: "14", t2: "12", t3: "11", t4: "10" },
    { cost: "1C + Colorless", t1: "-", t2: "13", t3: "12", t4: "11" },
    { cost: "2 Same (CC)", t1: "-", t2: "21", t3: "19", t4: "18" },
    { cost: "3 Same (CCC)", t1: "-", t2: "-", t3: "25", t4: "23" },
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
            The Mathematics Behind ManaTuner Pro
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}
          >
            Rigorous probability theory powering your manabase optimization
          </Typography>

          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip
              icon={<FunctionsIcon />}
              label="Hypergeometric"
              sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600 }}
            />
            <Chip
              icon={<CasinoIcon />}
              label="Monte Carlo"
              sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", fontWeight: 600 }}
            />
            <Chip
              icon={<TrendingUpIcon />}
              label="Bellman Equation"
              sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600 }}
            />
          </Box>
        </Box>
      </AnimatedContainer>

      {/* Academic Foundation Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 3,
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          border: "2px solid #1976d2",
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: "#1565c0", mb: 1 }}>
          Academic Foundation
        </Typography>
        <Typography variant="body1">
          Our calculations are based on Frank Karsten's 2022 research:{" "}
          <Link
            href="https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/"
            target="_blank"
            rel="noopener"
            sx={{ fontWeight: 600 }}
          >
            "How Many Sources Do You Need to Consistently Cast Your Spells?"
          </Link>
        </Typography>
      </Paper>

      {/* Core Mathematical Concepts */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 2 }}>
            Core Concepts
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            Mathematical Foundations
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {mathFoundations.map((math, index) => (
            <Grid item xs={12} md={4} key={index}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.1}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: math.color,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 16px 40px ${math.color}30`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: math.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        color: math.color,
                      }}
                    >
                      {math.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {math.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {math.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Detailed Explanations */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 2 }}>
            Deep Dive
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            <ScienceIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Mathematical Models Explained
          </Typography>
        </Box>

        {/* Hypergeometric */}
        <Accordion
          defaultExpanded
          sx={{
            borderRadius: "12px !important",
            mb: 2,
            "&:before": { display: "none" },
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "2px solid #e3f2fd",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "#e3f2fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1976d2",
                }}
              >
                <FunctionsIcon />
              </Box>
              <Typography variant="h6" fontWeight={700}>Hypergeometric Distribution</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              The hypergeometric distribution answers: "What's the probability of drawing exactly k successes
              in n draws, without replacement, from a finite population?"
            </Typography>

            <Paper
              sx={{
                p: 3,
                my: 3,
                borderRadius: 2,
                bgcolor: "#e3f2fd",
                textAlign: "center",
              }}
            >
              <Typography variant="overline" color="#1565c0" fontWeight={700}>Formula</Typography>
              <Typography
                variant="h5"
                sx={{ fontFamily: "monospace", color: "#1565c0", fontWeight: 700 }}
              >
                P(X = k) = C(K,k) × C(N-K,n-k) / C(N,n)
              </Typography>
            </Paper>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                { var: "N", desc: "Total deck size (usually 60 cards)" },
                { var: "K", desc: "Total mana sources in deck" },
                { var: "n", desc: "Cards drawn (hand + draws)" },
                { var: "k", desc: "Mana sources needed" },
              ].map((item, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight={800} color="primary" sx={{ fontFamily: "monospace" }}>
                      {item.var}
                    </Typography>
                    <Typography variant="caption">{item.desc}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#2e7d32">
                <strong>Real Example:</strong> With 14 red sources in a 60-card deck, what's the probability
                of having at least 1 red source on Turn 1 (7 cards drawn)? Answer: ~90% (Karsten standard)
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* Monte Carlo */}
        <Accordion
          sx={{
            borderRadius: "12px !important",
            mb: 2,
            "&:before": { display: "none" },
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "2px solid #f3e5f5",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "#f3e5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9c27b0",
                }}
              >
                <CasinoIcon />
              </Box>
              <Typography variant="h6" fontWeight={700}>Monte Carlo Simulation</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Monte Carlo methods use random sampling to solve complex probability problems
              that might be difficult to calculate analytically.
            </Typography>

            <Grid container spacing={2} sx={{ my: 2 }}>
              {[
                { icon: <TimelineIcon />, text: "Simulate 3,000+ hands with your exact decklist" },
                { icon: <TrendingUpIcon />, text: "Track mana availability each turn" },
                { icon: <CalculateIcon />, text: "Calculate empirical probabilities" },
              ].map((item, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "2px solid #f3e5f5",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ color: "#9c27b0" }}>{item.icon}</Box>
                    <Typography variant="body2">{item.text}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ p: 2, bgcolor: "#f3e5f5", borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#7b1fa2">
                <strong>Validation:</strong> Our Monte Carlo results consistently match
                hypergeometric calculations within 0.1%, confirming our model accuracy.
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* Frank Karsten */}
        <Accordion
          sx={{
            borderRadius: "12px !important",
            mb: 2,
            "&:before": { display: "none" },
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "2px solid #e8f5e9",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "#e8f5e9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4caf50",
                }}
              >
                <TrendingUpIcon />
              </Box>
              <Typography variant="h6" fontWeight={700}>Frank Karsten 2022 Standards</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Frank Karsten's 2022 update incorporates modern Magic design and play patterns.
              These are the sources needed for <strong>90% probability</strong> to cast on curve:
            </Typography>

            <TableContainer component={Paper} sx={{ my: 3, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#e8f5e9" }}>
                    <TableCell><Typography fontWeight={700}>Mana Cost</Typography></TableCell>
                    <TableCell align="center"><Typography fontWeight={700}>Turn 1</Typography></TableCell>
                    <TableCell align="center"><Typography fontWeight={700}>Turn 2</Typography></TableCell>
                    <TableCell align="center"><Typography fontWeight={700}>Turn 3</Typography></TableCell>
                    <TableCell align="center"><Typography fontWeight={700}>Turn 4</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {karstenTable.map((row, i) => (
                    <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}>
                      <TableCell>{row.cost}</TableCell>
                      <TableCell align="center">
                        <Chip label={row.t1} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.t2} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.t3} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.t4} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Key Updates for 2022:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                "Fetchlands count as 1 source per fetchable color (not double)",
                "Mulliganing considerations (6-card and 5-card hands)",
                "Modern card velocity and selection effects",
              ].map((text, i) => (
                <Typography key={i} variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4caf50" }} />
                  {text}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Implementation */}
        <Accordion
          sx={{
            borderRadius: "12px !important",
            mb: 2,
            "&:before": { display: "none" },
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "2px solid #fff3e0",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "#fff3e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff9800",
                }}
              >
                <CalculateIcon />
              </Box>
              <Typography variant="h6" fontWeight={700}>Implementation Details</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              ManaTuner Pro implements these mathematical concepts with several optimizations:
            </Typography>

            <Grid container spacing={3} sx={{ my: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "#e3f2fd",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="#1565c0" gutterBottom>
                    Performance Optimizations
                  </Typography>
                  {["Memoized binomial coefficients", "Web Workers for heavy calculations", "Lazy evaluation of probability trees"].map((text, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {text}</Typography>
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "#f3e5f5",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="#7b1fa2" gutterBottom>
                    Accuracy Measures
                  </Typography>
                  {["IEEE 754 double precision", "Edge case handling (empty decks, etc.)", "Cross-validation with Monte Carlo"].map((text, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {text}</Typography>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#e65100">
                <strong>Note:</strong> All calculations assume optimal play and do not account for
                human error, opponent disruption, or complex interaction timing.
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Practical Applications */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 2 }}>
            Practical Use
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            How This Applies to Your Deck
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderRadius: 3, border: "2px solid #1976d2" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#1976d2" gutterBottom>
                  Land Count Optimization
                </Typography>
                <Typography variant="body2" paragraph>
                  Based on your deck's mana curve, we calculate the exact number of lands
                  needed to hit your mana requirements with 90%+ consistency.
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label="Aggro: 18-22" size="small" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 600 }} />
                  <Chip label="Midrange: 22-26" size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600 }} />
                  <Chip label="Control: 26-28" size="small" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderRadius: 3, border: "2px solid #9c27b0" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#9c27b0" gutterBottom>
                  Color Requirements
                </Typography>
                <Typography variant="body2" paragraph>
                  For each color in your deck, we determine how many sources you need
                  to cast your spells on curve with mathematical precision.
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label="T1 1C: 14 sources" size="small" sx={{ bgcolor: "#f3e5f5", fontWeight: 600 }} />
                  <Chip label="T2 CC: 21 sources" size="small" sx={{ bgcolor: "#f3e5f5", fontWeight: 600 }} />
                  <Chip label="T3 CCC: 25 sources" size="small" sx={{ bgcolor: "#f3e5f5", fontWeight: 600 }} />
                </Box>
              </CardContent>
            </Card>
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
            Ready to Apply the Math?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
            Analyze your manabase and export your results as a shareable Blueprint (PNG/PDF/JSON)
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/analyzer")}
          endIcon={<ArrowForwardIcon />}
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
            },
            transition: "all 0.3s ease",
          }}
        >
          Analyze Your Deck
        </Button>
      </Paper>
    </Container>
  );
};

export default MathematicsPage;
