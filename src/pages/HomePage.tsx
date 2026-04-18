import AnalyticsIcon from '@mui/icons-material/Analytics'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import BookIcon from '@mui/icons-material/Book'
import CasinoIcon from '@mui/icons-material/Casino'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PsychologyIcon from '@mui/icons-material/Psychology'
import ShowChartIcon from '@mui/icons-material/ShowChart'
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
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedContainer } from '../components/common/AnimatedContainer'
import { SEO } from '../components/common/SEO'
import { Term } from '../components/common/Term'

// Mana symbol component using Keyrune font
const ManaSymbol: React.FC<{
  color: 'w' | 'u' | 'b' | 'r' | 'g' | 'c'
  size?: number
  glow?: boolean
}> = ({ color, size = 24, glow = false }) => (
  <i
    className={`ms ms-${color} ms-cost`}
    aria-hidden="true"
    style={{
      fontSize: size,
      filter: glow ? 'drop-shadow(0 0 8px currentColor)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      transition: 'all 0.3s ease',
    }}
  />
)

// Floating mana symbols background decoration
const FloatingManaSymbols: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

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
  )
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Features displayed on the home page
  const features = [
    {
      icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
      title: 'Castability',
      description: (
        <>
          Exact <Term id="castability">cast probability</Term> including mana rocks and dorks — not
          just lands.
        </>
      ),
      color: theme.palette.mana.blue,
      manaColor: 'u' as const,
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Analysis Dashboard',
      description:
        'Visual breakdown of your spells by category, curve insights, and performance diagnostics at a glance.',
      color: theme.palette.mana.green,
      manaColor: 'g' as const,
    },
    {
      icon: <CasinoIcon sx={{ fontSize: 40 }} />,
      title: 'Mulligan Simulator',
      description: (
        <>
          <Term id="monte-carlo">10,000 simulated hands</Term> tell you exactly when to keep or
          mulligan.
        </>
      ),
      color: '#9c27b0',
      manaColor: 'b' as const,
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: 'Export Blueprint',
      description: 'Download your analysis as PNG, PDF or JSON. Share on Discord or archive.',
      color: theme.palette.mana.multicolor,
      manaColor: 'w' as const,
      isNew: true,
    },
  ]

  // Les fondations mathématiques avec mana colors
  const mathFoundations = [
    {
      title: 'Exact Probabilities',
      desc: 'Real cast odds for every spell, every turn',
      formula: 'Per spell',
      techTerm: 'Hypergeometric distribution',
      manaColor: 'u' as const,
      color: isDark ? 'rgba(14, 104, 171, 0.15)' : '#e3f2fd',
      borderColor: theme.palette.mana.blue,
    },
    {
      title: 'Proven Land Targets',
      desc: 'How many color sources you need to cast your spells on curve',
      formula: '90%',
      techTerm: 'Frank Karsten tables',
      manaColor: 'g' as const,
      color: isDark ? 'rgba(0, 115, 62, 0.15)' : '#e8f5e9',
      borderColor: theme.palette.mana.green,
    },
    {
      title: 'Smart Mulligan Advice',
      desc: '10,000 hands simulated to find your optimal keep/mull thresholds',
      formula: 'Keep / Mull',
      techTerm: 'Monte Carlo + Bellman',
      manaColor: 'r' as const,
      color: isDark ? 'rgba(211, 32, 42, 0.15)' : '#fff3e0',
      borderColor: theme.palette.mana.red,
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ position: 'relative' }}>
      <SEO
        title="ManaTuner — Mana Calculator + Competitive MTG Reading Library"
        description="Free mana calculator that counts your dorks & rocks, plus the most complete reading library in competitive Magic — Karsten, PVDDR, Saito, Chapin, Reid Duke."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'ManaTuner',
          url: 'https://www.manatuner.app',
          description:
            'Free MTG mana base calculator with mana rocks and dorks support. Hypergeometric probabilities, Monte Carlo mulligan simulation, and Bellman equation optimization.',
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          author: { '@type': 'Person', name: 'Guillaume Bordes' },
        }}
      />
      {/* Floating mana symbols background */}
      <FloatingManaSymbols />

      {/* Hero Section */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
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
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontFamily: '"Cinzel", serif',
              // WUBRG gradient - gold start for better visibility
              background: `linear-gradient(135deg,
                ${theme.palette.mana.multicolor} 0%,
                ${theme.palette.mana.blue} 25%,
                #9c27b0 50%,
                ${theme.palette.mana.red} 75%,
                ${theme.palette.mana.green} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.02em',
              textShadow: isDark ? '0 0 40px rgba(255,255,255,0.1)' : 'none',
            }}
          >
            The Only Mana Calculator That Counts Your Dorks & Rocks
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              maxWidth: 650,
              mx: 'auto',
              mb: 2,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Stop guessing. Get <strong>exact cast odds</strong> for every spell, plus know{' '}
            <strong>exactly when to mulligan</strong>.
          </Typography>

          {/* Beginner-friendly qualifier — answers Leo's "is this for me?" */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 550,
              mx: 'auto',
              mb: 1.5,
              fontWeight: 400,
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            Works for every skill level — from your first Standard deck to Pro Tour prep.
          </Typography>

          {/* Format badges strip — answers Sarah's "does this cover my format?"
              in one glance. Thin, subtle row, not a chip bar. */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mb: 2,
              color: 'text.secondary',
              fontSize: '0.78rem',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            Standard · Pioneer · Modern · Pauper · Commander · Limited — all supported
          </Typography>

          {/* Dual positioning — ManaTuner as both a calculator AND the
              competitive reading library. Visually distinct from the
              calculator pitch above so users immediately understand the
              site is also a reference destination. */}
          <Box
            sx={{
              maxWidth: 640,
              mx: 'auto',
              mb: 2.5,
              px: 2.5,
              py: 1.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: isDark ? 'rgba(125, 180, 255, 0.3)' : 'rgba(14, 104, 171, 0.25)',
              background: isDark
                ? 'linear-gradient(135deg, rgba(14, 104, 171, 0.15) 0%, rgba(106, 27, 154, 0.12) 100%)'
                : 'linear-gradient(135deg, rgba(14, 104, 171, 0.06) 0%, rgba(106, 27, 154, 0.05) 100%)',
              boxShadow: isDark
                ? '0 4px 24px rgba(14, 104, 171, 0.15)'
                : '0 4px 16px rgba(14, 104, 171, 0.08)',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                lineHeight: 1.55,
                color: isDark ? 'rgba(255,255,255,0.92)' : 'text.primary',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '1.15em',
                  mr: 0.75,
                  verticalAlign: 'middle',
                }}
              >
                📚
              </Box>
              Plus a library of must-read articles — from first FNM to Pro Tour.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                lineHeight: 1.5,
                fontSize: '0.88rem',
              }}
            >
              Curated by the pros (Karsten, PVDDR, Saito and more), organized by skill level.{' '}
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Dead links restored
              </Box>{' '}
              via archive.org so nothing is lost.
            </Typography>
          </Box>

          {/* Tags with mana symbols */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
              mb: 2.5,
              flexWrap: 'wrap',
            }}
          >
            <Chip
              icon={
                <i
                  className="ms ms-u ms-cost"
                  style={{ fontSize: 14 }}
                  aria-label="Blue mana"
                  role="img"
                />
              }
              label="See The Real Odds"
              sx={{
                bgcolor: isDark ? 'rgba(14, 104, 171, 0.2)' : '#e3f2fd',
                color: isDark ? theme.palette.mana.blue : '#1565c0',
                fontWeight: 600,
                '& .MuiChip-icon': { ml: 1 },
              }}
            />
            <Chip
              icon={
                <i
                  className="ms ms-c ms-cost"
                  style={{ fontSize: 14 }}
                  aria-label="Colorless mana"
                  role="img"
                />
              }
              label="Rocks & Dorks Included"
              sx={{
                bgcolor: isDark ? 'rgba(0, 115, 62, 0.25)' : '#e8f5e9',
                color: isDark ? theme.palette.success.light : '#2e7d32',
                fontWeight: 700,
                border: `1px solid ${isDark ? 'rgba(0, 115, 62, 0.4)' : '#a5d6a7'}`,
                '& .MuiChip-icon': { ml: 1 },
              }}
            />
            <Chip
              icon={
                <i
                  className="ms ms-b ms-cost"
                  style={{ fontSize: 14 }}
                  aria-label="Black mana"
                  role="img"
                />
              }
              label="Smart Mulligan Advice"
              sx={{
                bgcolor: isDark ? 'rgba(90, 60, 90, 0.3)' : '#f3e5f5',
                color: isDark ? '#CE93D8' : '#7b1fa2',
                fontWeight: 600,
                '& .MuiChip-icon': { ml: 1 },
              }}
            />
          </Box>

          {/* CTA Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <AnimatedContainer animation="scaleIn" delay={0.2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/analyzer')}
                startIcon={<AnalyticsIcon />}
                sx={{
                  px: 5,
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  // Gold multicolor button
                  background: `linear-gradient(135deg, ${theme.palette.mana.multicolor} 0%, #FFD700 50%, ${theme.palette.mana.multicolor} 100%)`,
                  color: '#1a1a2e',
                  boxShadow: `0 8px 32px ${theme.palette.mana.multicolor}50`,
                  border: '2px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: `linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFD700 100%)`,
                    boxShadow: `0 12px 40px ${theme.palette.mana.multicolor}70`,
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Analyze My Deck
              </Button>
            </AnimatedContainer>

            <AnimatedContainer animation="slideInLeft" delay={0.4}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/library')}
                startIcon={<AutoStoriesIcon />}
                sx={{
                  px: 4,
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: 'none',
                  // Mana-blue → purple gradient (knowledge tier, matches Header)
                  background: 'linear-gradient(135deg, #0E68AB 0%, #6A1B9A 100%)',
                  color: 'white',
                  boxShadow: '0 8px 28px rgba(14, 104, 171, 0.45)',
                  border: '1px solid rgba(125, 180, 255, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976D2 0%, #7B1FA2 100%)',
                    boxShadow: '0 12px 36px rgba(14, 104, 171, 0.6)',
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Browse the Library
              </Button>
            </AnimatedContainer>
          </Box>

          {/* Privacy reassurance line — sits directly under the CTAs so
              Léo (first visit, wary of handing over a decklist) and
              Thibault (pod EDH, trust-first) see the claim before clicking
              anything. Matches the PrivacySettings copy verbatim. */}
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              maxWidth: 560,
              mx: 'auto',
            }}
          >
            Free. No signup. 100% local —{' '}
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              decklists never leave your browser
            </Box>
            .
          </Typography>

          {/* Secondary discreet links: sample deck + Guide. Moved below
              primary CTAs so Library stays primary-tier alongside Analyze
              My Deck. Sample deck answers Léo's "I don't have a deck to
              paste" friction — the ?sample=1 query param triggers auto-load
              in AnalyzerPage. */}
          <Box
            sx={{
              mt: 2,
              textAlign: 'center',
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Box
              component="a"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                navigate('/analyzer?sample=1')
              }}
              sx={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.85rem',
                color: 'text.secondary',
                textDecoration: 'none',
                borderBottom: '1px dotted',
                borderColor: 'text.secondary',
                pb: 0.125,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main',
                },
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 16 }} />
              Try a 60-card sample
            </Box>
            <Box
              component="span"
              sx={{ color: 'text.disabled', fontSize: '0.75rem' }}
              aria-hidden="true"
            >
              ·
            </Box>
            {/* Limited shortcut — drafters shouldn't feel sidelined by the
                Constructed / Commander framing. Green accent matches the
                Selesnya palette of the sample deck. */}
            <Box
              component="a"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                navigate('/analyzer?sample=limited')
              }}
              sx={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.85rem',
                color: '#2e7d32',
                textDecoration: 'none',
                borderBottom: '1px dotted',
                borderColor: '#2e7d32',
                pb: 0.125,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#4caf50',
                  borderColor: '#4caf50',
                },
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 16 }} />
              Or a 40-card Limited pool
            </Box>
            <Box
              component="span"
              sx={{ color: 'text.disabled', fontSize: '0.75rem' }}
              aria-hidden="true"
            >
              ·
            </Box>
            {/* Commander shortcut — Thibault persona ask: "don't make me
                scroll to know EDH is supported". The cyan accent hints at
                the Commander color identity used throughout the Guide. */}
            <Box
              component="a"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                navigate('/analyzer?sample=edh')
              }}
              sx={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.85rem',
                color: '#00838f',
                textDecoration: 'none',
                borderBottom: '1px dotted',
                borderColor: '#00838f',
                pb: 0.125,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#00bcd4',
                  borderColor: '#00bcd4',
                },
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 16 }} />
              Or a 100-card Commander deck
            </Box>
            <Box
              component="span"
              sx={{ color: 'text.disabled', fontSize: '0.75rem' }}
              aria-hidden="true"
            >
              ·
            </Box>
            <Box
              component="a"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                navigate('/guide')
              }}
              sx={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.85rem',
                color: 'text.secondary',
                textDecoration: 'none',
                borderBottom: '1px dotted',
                borderColor: 'text.secondary',
                pb: 0.125,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuBookIcon sx={{ fontSize: 16 }} />
              Need help? Read the Guide
            </Box>
          </Box>
        </Box>
      </AnimatedContainer>

      {/* Math Foundations with mana symbols */}
      <Box sx={{ my: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.mana.multicolor,
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: '0.85rem',
            }}
          >
            Powered By
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            fontWeight={700}
            sx={{ mt: 0.5, fontFamily: '"Cinzel", serif' }}
          >
            Rigorous Mathematics
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1, maxWidth: 500, mx: 'auto' }}
          >
            Not guesswork. Real math behind every number — so you can trust the advice.
          </Typography>
        </Box>

        <Grid container spacing={2} justifyContent="center" alignItems="stretch">
          {mathFoundations.map((foundation, index) => (
            <Grid item xs={6} md={4} key={index} sx={{ display: 'flex' }}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.1} sx={{ width: '100%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: foundation.color,
                    border: '2px solid',
                    borderColor: foundation.borderColor,
                    height: '100%',
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
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
                      fontFamily: 'monospace',
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
                  {/* Pro-level term — discreet badge at the bottom, for
                      competitive players who want to know exactly what
                      maths powers the tool. Invisible to beginners, a
                      trust signal to experts. */}
                  <Box
                    sx={{
                      mt: 1.5,
                      pt: 1,
                      borderTop: `1px dashed ${foundation.borderColor}40`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        color: foundation.borderColor,
                        opacity: 0.7,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {foundation.techTerm}
                    </Typography>
                  </Box>
                </Paper>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* The Competitive Library showcase — essential section, positioned
          right after Rigorous Mathematics because the library is the
          intellectual bedrock that the math section name-drops (Karsten,
          Hypergeometric, Bellman). */}
      <Box sx={{ my: 5, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.mana.blue,
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: '0.85rem',
            }}
          >
            The Intellectual Canon
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mt: 0.5,
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,
              fontSize: { xs: '1.6rem', md: '2.1rem' },
            }}
          >
            The Competitive Reading Library
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1.5, maxWidth: 680, mx: 'auto', lineHeight: 1.6 }}
          >
            Every essential article a Magic player should read, in one place. From Karsten's
            manabase math to Saito's tournament mindset —{' '}
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              five curated tracks across every format
            </Box>
            , with dead links restored via archive.org.
          </Typography>
        </Box>

        <Grid container spacing={2.5} justifyContent="center">
          {[
            {
              id: 'first-fnm',
              emoji: '🎴',
              title: 'Your First FNM',
              count: 5,
              tagline: 'Starting out',
              accent: theme.palette.mana.blue,
              description:
                'Reid Duke · Karsten · Chapin · Kuisma · Saito — the foundations that win your first round.',
              href: '/library#track-first-fnm',
            },
            {
              id: 'rcq',
              emoji: '🏆',
              title: 'Preparing for an RCQ',
              count: 7,
              tagline: 'Leveling up',
              accent: theme.palette.mana.green,
              description:
                "PVDDR's 6 Heuristics · Manfield's prep routine · ladder strategy essentials — the curriculum from FNM regular to RCQ competitor.",
              href: '/library#track-rcq',
            },
            {
              id: 'pro-tour',
              emoji: '🎯',
              title: 'Pro Tour Preparation',
              count: 9,
              tagline: 'Mastering',
              accent: theme.palette.mana.red,
              description:
                "Saito's 6-part mindset series · Dagen · Moudou game theory — the international canon rescued from link rot.",
              href: '/library#track-pro-tour',
            },
            {
              id: 'commander',
              emoji: '👑',
              title: 'Commander Pod',
              count: 5,
              tagline: 'Piloting 100 cards',
              accent: '#6B3FA0',
              description:
                'Karsten adapted for singleton · Bracket System · Command Zone · Game Knights · EDHREC — the EDH canon 60-card sites ignore.',
              href: '/library#track-commander',
            },
            {
              id: 'limited',
              emoji: '📦',
              title: 'Limited (Draft & Sealed)',
              count: 3,
              tagline: 'Cracking packs',
              accent: '#D4B85A',
              description:
                'Limited Resources · 17Lands · LSV — the signals, the curves, and the data-driven coverage that changed how Limited is played.',
              href: '/library#track-limited',
            },
          ].map((track, idx) => (
            <Grid item xs={12} sm={6} md={4} key={track.id}>
              <AnimatedContainer animation="fadeInUp" delay={idx * 0.1}>
                <Card
                  onClick={() => navigate(track.href)}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
                    background: isDark
                      ? `linear-gradient(180deg, ${track.accent}15 0%, rgba(255,255,255,0.02) 100%)`
                      : `linear-gradient(180deg, ${track.accent}10 0%, rgba(255,255,255,1) 100%)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 40px ${track.accent}35`,
                      borderColor: track.accent,
                    },
                  }}
                >
                  {/* Accent stripe */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: track.accent,
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography aria-hidden="true" sx={{ fontSize: '1.8rem', lineHeight: 1 }}>
                        {track.emoji}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 'auto',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: track.accent,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {track.count} articles
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Cinzel", serif',
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {track.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.25,
                        mb: 1.25,
                        color: track.accent,
                        fontWeight: 600,
                        fontStyle: 'italic',
                      }}
                    >
                      {track.tagline}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.55, fontSize: '0.85rem' }}
                    >
                      {track.description}
                    </Typography>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>

        {/* CTA to browse the full library */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/library')}
            startIcon={<AutoStoriesIcon />}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1.25,
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 3,
              borderWidth: 2,
              borderColor: theme.palette.mana.blue,
              color: isDark ? theme.palette.mana.blue : theme.palette.primary.main,
              textTransform: 'none',
              '&:hover': {
                borderWidth: 2,
                backgroundColor: `${theme.palette.mana.blue}15`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${theme.palette.mana.blue}30`,
              },
              transition: 'all 0.3s ease',
            }}
          >
            Browse the Full Library
          </Button>
        </Box>
      </Box>

      {/* Features Grid with mana-colored accents */}
      <Box sx={{ my: 3, position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{ mb: 2.5, textAlign: 'center', fontFamily: '"Cinzel", serif' }}
        >
          What You Get
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.1}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
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

                  <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        bgcolor: `${feature.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: feature.color,
                        border: `2px solid ${feature.color}30`,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {feature.title}
                      </Typography>
                      {(feature as { isNew?: boolean }).isNew && (
                        <Box
                          component="span"
                          sx={{
                            bgcolor: theme.palette.mana.multicolor,
                            color: '#1a1a2e',
                            fontSize: '0.6rem',
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
            : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ py: 3, px: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            fontWeight={700}
            sx={{ mb: 2.5, textAlign: 'center', fontFamily: '"Cinzel", serif' }}
          >
            How It Works
          </Typography>
          <Grid container spacing={3} alignItems="center">
            {[
              {
                num: '1',
                title: 'Paste Your Deck',
                desc: 'MTGO, MTGA, Moxfield & more',
                mana: 'w',
              },
              {
                num: '2',
                title: 'Get Probabilities',
                desc: 'Cast chances for every spell, every turn',
                mana: 'u',
              },
              {
                num: '3',
                title: 'Know Your Mulligans',
                desc: 'Optimal thresholds for your archetype',
                mana: 'g',
              },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg,
                        ${theme.palette.mana.white} 0%,
                        ${theme.palette.mana.blue} 25%,
                        #9c27b0 50%,
                        ${theme.palette.mana.red} 75%,
                        ${theme.palette.mana.green} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          mb: 2,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(90, 60, 90, 0.2) 0%, rgba(30, 30, 50, 0.3) 100%)'
            : 'linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)',
          flexWrap: 'wrap',
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BookIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
          <Typography variant="body1">
            <strong>New to manabase theory?</strong> Learn the math behind optimal deckbuilding
          </Typography>
        </Box>
        <Button
          onClick={() => navigate('/mathematics')}
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontWeight: 600,
            color: '#9c27b0',
          }}
        >
          Learn the Math
        </Button>
      </Paper>

      {/* Privacy - with mana symbols */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          py: 1.5,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[
          {
            icon: <i className="ms ms-w ms-cost" aria-hidden="true" style={{ fontSize: 16 }} />,
            text: '100% Local',
          },
          {
            icon: <i className="ms ms-u ms-cost" aria-hidden="true" style={{ fontSize: 16 }} />,
            text: 'No account required',
          },
          {
            icon: <i className="ms ms-g ms-cost" aria-hidden="true" style={{ fontSize: 16 }} />,
            text: 'Auto-saved',
          },
        ].map((item, index) => (
          <Typography
            key={index}
            variant="body2"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            {item.icon} {item.text}
          </Typography>
        ))}
      </Box>

      {/* Social Proof */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 2, md: 4 },
          py: 2,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[
          { value: 'Free & Open Source', sub: 'MIT License' },
          { value: '10,000', sub: 'Hands simulated per analysis' },
          { value: '6', sub: 'Analysis tabs' },
          { value: '0', sub: 'Data sent to servers' },
        ].map((stat, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: 100 }}>
            <Typography variant="h6" fontWeight={700} color="primary" sx={{ lineHeight: 1.2 }}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stat.sub}
            </Typography>
          </Box>
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
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
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
          <Typography variant="h4" component="h2" fontWeight={700} fontFamily='"Cinzel", serif'>
            Ready to Optimize?
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
            bgcolor: theme.palette.mana.multicolor,
            color: '#1a1a2e',
            borderRadius: 3,
            border: '2px solid rgba(255,255,255,0.3)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              bgcolor: '#FFD700',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Start Now — Free
        </Button>
      </Paper>
    </Container>
  )
}
