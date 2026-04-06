import AnalyticsIcon from '@mui/icons-material/Analytics'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CasinoIcon from '@mui/icons-material/Casino'
import CheckIcon from '@mui/icons-material/CheckCircle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PsychologyIcon from '@mui/icons-material/Psychology'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import TimelineIcon from '@mui/icons-material/Timeline'
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SEO } from '../components/common/SEO'
import { AnimatedContainer } from '../components/common/AnimatedContainer'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'

export const GuidePage: React.FC = () => {
  const navigate = useNavigate()

  const tabs = [
    {
      icon: <TimelineIcon sx={{ fontSize: 32 }} />,
      title: 'Dashboard',
      description: 'Your Health Score tells you instantly if your manabase is competitive.',
      color: '#4caf50',
      details: [
        { label: '85%+', text: 'Excellent manabase', color: 'success' },
        { label: '70-84%', text: 'Good, minor tweaks', color: 'primary' },
        { label: '55-69%', text: 'Needs improvement', color: 'warning' },
        { label: '<55%', text: 'Rebuild required', color: 'error' },
      ],
    },
    {
      icon: <ShowChartIcon sx={{ fontSize: 32 }} />,
      title: 'Castability',
      description: 'Exact probability of casting each spell on curve, turn by turn.',
      color: '#2196f3',
      badge: 'Core Feature',
    },
    {
      icon: <CasinoIcon sx={{ fontSize: 32 }} />,
      title: 'Mulligan',
      description: 'Monte Carlo simulation tells you exactly when to keep or mulligan.',
      color: '#9c27b0',
      badge: 'Unique',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 32 }} />,
      title: 'Analysis',
      description:
        'Three sub-tabs: Spells & Tempo (per-spell castability with tempo impact from tapped lands), Probabilities (mana curve chart, color distribution, land drop odds by turn), and Recommendations (prioritized fixes for your manabase).',
      color: '#ff9800',
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 32 }} />,
      title: 'Manabase',
      description: 'Complete breakdown of your lands: basics, duals, fetches, utility.',
      color: '#00bcd4',
    },
    {
      icon: '📋',
      title: 'Blueprint',
      description:
        'Export your complete analysis as PNG, PDF, or JSON. Share on Discord or archive your progress.',
      color: '#00D9FF',
      badge: 'NEW',
    },
  ]

  const mathFoundations = [
    {
      title: 'Exact Math',
      formula: 'P(X≥k)',
      desc: 'Your real chance of casting each spell on curve',
      color: '#e3f2fd',
      borderColor: '#1976d2',
      details:
        'Hypergeometric distribution — the exact odds of drawing the right mana from your deck',
    },
    {
      title: 'Karsten Standards',
      formula: '90%',
      desc: 'How many sources you actually need per color',
      color: '#e8f5e9',
      borderColor: '#4caf50',
      details: 'Pro-level targets: 14 sources for 1 pip T1, 20 for 2 pips T2, 23 for 3 pips T3',
    },
    {
      title: 'Monte Carlo',
      formula: 'n=10k',
      desc: '10,000 opening hands shuffled and evaluated',
      color: '#f3e5f5',
      borderColor: '#9c27b0',
      details: 'Each hand scored on mana efficiency, curve, colors, early game, and land balance',
    },
    {
      title: 'Smart Mulligan',
      formula: 'E[V₇]',
      desc: 'Mathematically optimal keep or mulligan thresholds',
      color: '#fff3e0',
      borderColor: '#ff9800',
      details: 'Bellman equation: keep 7 if hand quality ≥ expected value of mulling to 6',
    },
    {
      title: 'Health Score',
      formula: '0-100',
      desc: 'One number that tells you if your manabase is tournament-ready',
      color: '#e0f7fa',
      borderColor: '#00bcd4',
      details: '85%+ excellent | 70-84% good | 55-69% needs work | below 55% rebuild',
    },
    {
      title: 'Archetype Weights',
      formula: '4×',
      desc: 'Tailored scoring per deck type',
      color: '#fce4ec',
      borderColor: '#e91e63',
      details: 'Aggro: curve | Midrange: balance | Control: colors | Combo: pieces',
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO
        title="How to Build a Perfect MTG Mana Base - Guide | ManaTuner"
        description="Step-by-step guide to building optimal mana bases in Magic: The Gathering. Learn to read your Health Score, castability charts, Monte Carlo mulligan, and more."
        path="/guide"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What makes ManaTuner different?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "The only tool combining Frank Karsten's exact hypergeometric calculations, Monte Carlo mulligan simulation (10,000 hands), and Bellman equation for optimal keep/mulligan thresholds across 4 deck archetypes.",
              },
            },
            {
              '@type': 'Question',
              name: 'What do Best Case and Realistic mean in Castability?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Best Case: probability of having the right colors assuming perfect land drops. Realistic: probability accounting for mana screw. Focus on Realistic.',
              },
            },
            {
              '@type': 'Question',
              name: "Why is my castability below 90% even when I follow Karsten's recommendations?",
              acceptedAnswer: {
                '@type': 'Answer',
                text: "The Castability tab shows single-draw probability (one hand, no mulligan). Karsten's tables target 90% including mulligans. With 14 red sources, your single-draw chance at Turn 1 is 86%, but with mulligans factored in, your effective chance exceeds 90%.",
              },
            },
            {
              '@type': 'Question',
              name: 'Can I export or share my analysis?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! The Blueprint tab lets you export your complete analysis as PNG, PDF, or JSON. Perfect for sharing on Discord, Reddit, or archiving your deck tuning progress.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is my deck data saved anywhere?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "No. ManaTuner is 100% local. Your decks are saved in your browser's localStorage only. We never see your decklists.",
              },
            },
          ],
        }}
      />
      {/* Floating mana symbols background */}
      <FloatingManaSymbols />

      {/* Hero Section */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3rem' },
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            How to Use ManaTuner
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            Master your manabase analysis in 3 minutes
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/analyzer')}
              startIcon={<AnalyticsIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Go to Analyzer
            </Button>
          </Box>
        </Box>
      </AnimatedContainer>

      {/* Quick Start Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          border: '2px solid #4caf50',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: '#2e7d32', mb: 1 }}>
          Quick Start
        </Typography>
        <Typography variant="body1">
          Paste your decklist → Click "Analyze Manabase" → Get your Health Score instantly. That's
          it!
        </Typography>
      </Paper>

      {/* The 5 Tabs Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            Your Results
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            The 5 Analysis Tabs
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {tabs.map((tab, index) => (
            <Grid item xs={12} sm={6} md={index < 3 ? 4 : 6} key={index}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.1}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: tab.color,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${tab.color}30`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: `${tab.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: tab.color,
                        }}
                      >
                        {tab.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {index + 1}. {tab.title}
                        </Typography>
                        {tab.badge && (
                          <Chip
                            label={tab.badge}
                            size="small"
                            sx={{
                              bgcolor: tab.color,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {tab.description}
                    </Typography>
                    {tab.details && (
                      <Box sx={{ mt: 2 }}>
                        {tab.details.map((detail, i) => (
                          <Box
                            key={i}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                          >
                            <Chip
                              label={detail.label}
                              size="small"
                              color={detail.color as 'success' | 'primary' | 'warning' | 'error'}
                              sx={{ minWidth: 60, fontWeight: 600 }}
                            />
                            <Typography variant="caption">{detail.text}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Step by Step Guide */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            Getting Started
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            Step-by-Step Guide
          </Typography>
        </Box>

        <Accordion
          defaultExpanded
          sx={{
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                }}
              >
                1
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Paste Your Deck
              </Typography>
              <Chip label="10 seconds" size="small" color="success" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Copy your decklist from MTGO, MTGA, Moxfield, or any source and paste it in the text
              area. ManaTuner accepts any standard text format.
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#1565c0">
                💡 Tip: Click "Load Example" to see a sample deck and understand the format.
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>

        <Accordion
          sx={{
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                }}
              >
                2
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Click "Analyze Manabase"
              </Typography>
              <Chip label="Instant" size="small" color="primary" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              ManaTuner will automatically:
            </Typography>
            <List>
              {[
                {
                  text: 'Detect all your lands and their colors',
                  sub: 'Including dual lands, fetches, and utility lands',
                },
                {
                  text: 'Parse mana costs from Scryfall',
                  sub: 'Hybrid, Phyrexian, and colorless costs handled correctly',
                },
                {
                  text: 'Calculate probabilities using hypergeometric formulas',
                  sub: 'Exact results, not approximations',
                },
              ].map((item, i) => (
                <ListItem key={i}>
                  <ListItemIcon>
                    <CheckIcon sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText primary={item.text} secondary={item.sub} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion
          sx={{
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                }}
              >
                3
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Read Your Results
              </Typography>
              <Chip label="Key Insight" size="small" color="warning" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              <strong>Start with Dashboard</strong> - your Health Score tells you instantly if your
              manabase is competitive.
            </Typography>
            <Typography variant="body1" paragraph>
              Check <strong>Castability</strong> - look for any spell below 90% probability. These
              are your weak spots.
            </Typography>
            <Typography variant="body1" paragraph>
              Explore <strong>Mulligan Strategy</strong> - select your archetype and learn your
              optimal keep thresholds.
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#e65100">
                🎯 Pro Tip: If a key spell is below 85% castability, you need more sources of that
                color.
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Mathematics Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            Under the Hood
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            The Math Behind ManaTuner
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1, maxWidth: 600, mx: 'auto' }}
          >
            Built on rigorous mathematical foundations: probability theory, optimal stopping theory,
            and Monte Carlo methods.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {mathFoundations.map((math, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.08}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: math.color,
                    border: '2px solid',
                    borderColor: math.borderColor,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${math.borderColor}30`,
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      fontFamily: 'monospace',
                      color: math.borderColor,
                      lineHeight: 1,
                      mb: 1,
                    }}
                  >
                    {math.formula}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: math.borderColor }}>
                    {math.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                    {math.desc}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      color: 'text.secondary',
                      display: 'block',
                      bgcolor: 'rgba(255,255,255,0.5)',
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    {math.details}
                  </Typography>
                </Paper>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/mathematics')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 600,
              '&:hover': { borderWidth: 2 },
            }}
          >
            Deep Dive into Mathematics
          </Button>
        </Box>
      </Box>

      {/* Format Tips */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            Format Specific
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            Quick Tips by Format
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {[
            {
              name: 'Limited',
              lands: '16-18',
              tips: ['40-card deck', '17 lands is default'],
              color: '#4caf50',
            },
            {
              name: 'Standard',
              lands: '24-26',
              tips: ['Minimize taplands', 'Curve peaks T3-T4'],
              color: '#2196f3',
            },
            {
              name: 'Pioneer',
              lands: '22-25',
              tips: ['Shocks + checks', 'Fast mana matters'],
              color: '#9c27b0',
            },
            {
              name: 'Modern',
              lands: '19-23',
              tips: ['Fetches essential', 'T1-T3 critical'],
              color: '#f44336',
            },
            {
              name: 'Legacy',
              lands: '18-22',
              tips: ['Duals + fetches', 'Every land untapped'],
              color: '#ff9800',
            },
          ].map((format, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 3,
                  borderTop: `4px solid ${format.color}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${format.color}20`,
                  },
                }}
              >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {format.name}
                </Typography>
                <Chip
                  label={`${format.lands} lands`}
                  size="small"
                  sx={{ bgcolor: format.color, color: 'white', fontWeight: 600, mb: 1.5 }}
                />
                {format.tips.map((tip, i) => (
                  <Typography key={i} variant="body2" color="text.secondary">
                    • {tip}
                  </Typography>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Cross-link to Land Glossary */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/land-glossary')}
          sx={{ borderRadius: 3, borderWidth: 2, fontWeight: 600, '&:hover': { borderWidth: 2 } }}
        >
          Explore the Land Type Glossary
        </Button>
      </Box>

      {/* FAQ */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" fontWeight={700}>
            Frequently Asked Questions
          </Typography>
        </Box>

        {[
          {
            q: 'What makes ManaTuner different?',
            a: "The only tool combining Frank Karsten's exact hypergeometric calculations, Monte Carlo mulligan simulation (10,000 hands, configurable up to 50k), and Bellman equation for optimal keep/mulligan thresholds across 4 deck archetypes.",
          },
          {
            q: 'What do Best Case and Realistic mean in Castability?',
            a: "Best Case: probability of having the right colors assuming you hit all your land drops on curve. Realistic: probability accounting for mana screw (not drawing enough lands). Focus on Realistic \u2014 it's the number that matters for deckbuilding.",
          },
          {
            q: "Why is my castability below 90% even when I follow Karsten's recommendations?",
            a: "Because the Castability tab shows your single-draw probability: the chance of casting a spell with one specific hand. Karsten's tables target 90% including the option to mulligan bad hands. With 14 red sources, your single-draw chance at Turn 1 is 86% \u2014 but across a real game where you'd mulligan a no-red hand, your effective chance climbs above 90%. Both numbers are correct; they answer different questions. See the Mathematics page for details.",
          },
          {
            q: 'Can I export or share my analysis?',
            a: 'Yes! The Blueprint tab lets you export your complete analysis as PNG (shareable image), PDF (print-ready document), or JSON (raw data). Perfect for sharing on Discord, Reddit, or archiving your deck tuning progress.',
          },
          {
            q: 'Is my deck data saved anywhere?',
            a: "No. ManaTuner is 100% local. Your decks are saved in your browser's localStorage only. We never see your decklists.",
          },
        ].map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              borderRadius: '12px !important',
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600}>
                {faq.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">{faq.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Final CTA */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 3,
          boxShadow: '0 16px 48px rgba(25, 118, 210, 0.3)',
        }}
      >
        <Box>
          <Typography variant="h4" component="h2" fontWeight={700}>
            Ready to Analyze?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
            Find out if your manabase can support your game plan
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/analyzer')}
          startIcon={<AnalyticsIcon />}
          sx={{
            px: 5,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 700,
            bgcolor: 'white',
            color: '#1976d2',
            borderRadius: 3,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.9)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Go to Analyzer
        </Button>
      </Paper>
    </Container>
  )
}
