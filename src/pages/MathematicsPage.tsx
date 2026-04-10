import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CalculateIcon from '@mui/icons-material/Calculate'
import CasinoIcon from '@mui/icons-material/Casino'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FunctionsIcon from '@mui/icons-material/Functions'
import ScienceIcon from '@mui/icons-material/Science'
import TimelineIcon from '@mui/icons-material/Timeline'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
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
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedContainer } from '../components/common/AnimatedContainer'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'
import { SEO } from '../components/common/SEO'

const MathematicsPage: React.FC = () => {
  const navigate = useNavigate()

  const karstenTable = [
    { cost: '1 Colored (e.g. {R}, {1}{U})', t1: '14', t2: '13', t3: '12', t4: '11' },
    { cost: '2 Same (e.g. {U}{U})', t1: '-', t2: '20', t3: '18', t4: '16' },
    { cost: '3 Same (e.g. {B}{B}{B})', t1: '-', t2: '-', t3: '23', t4: '20' },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO
        title="MTG Mana Math Explained - Hypergeometric & Monte Carlo | ManaTuner"
        description="The mathematics behind ManaTuner: hypergeometric distribution, Monte Carlo simulation (10,000 hands), Bellman equation for mulligan decisions, and Frank Karsten's research."
        path="/mathematics"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'The Mathematics Behind MTG Mana Base Optimization',
          description:
            'Hypergeometric distribution, Monte Carlo simulation, and Bellman equation applied to Magic: The Gathering mana base analysis.',
          author: { '@type': 'Person', name: 'Guillaume Bordes' },
          publisher: { '@type': 'Organization', name: 'ManaTuner' },
          mainEntityOfPage: 'https://www.manatuner.app/mathematics',
        }}
      />
      <FloatingManaSymbols />

      {/* ================================================================
          SECTION 1 — Hero: Start with the PROBLEM, not the math
          ================================================================ */}
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
            Why Does My Mana Never Work?
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
            You've been there: stuck with the wrong lands, can't cast your key spell on time. It's
            not bad luck — it's math. And math has solutions.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<FunctionsIcon />}
              label="Exact Probabilities"
              sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
            />
            <Chip
              icon={<CasinoIcon />}
              label="10,000 Simulations"
              sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontWeight: 600 }}
            />
            <Chip
              icon={<TrendingUpIcon />}
              label="Pro-Level Research"
              sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
            />
          </Box>
        </Box>
      </AnimatedContainer>

      {/* ================================================================
          SECTION 2 — The Two Problems (relatable to everyone)
          ================================================================ */}
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AnimatedContainer animation="fadeInUp" delay={0}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  border: '2px solid #ef5350',
                  bgcolor: 'rgba(239, 83, 80, 0.04)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <WarningAmberIcon sx={{ color: '#ef5350', fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={700} color="#ef5350">
                    Mana Screw
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  You drew spells but not enough lands. Your 4-drop is stuck in hand on turn 6.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>The question:</strong> How many lands should I run so this rarely happens?
                </Typography>
              </Paper>
            </AnimatedContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <AnimatedContainer animation="fadeInUp" delay={0.1}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  border: '2px solid #ff9800',
                  bgcolor: 'rgba(255, 152, 0, 0.04)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={700} color="#ff9800">
                    Color Screw
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  You have lands, but they're all the wrong color. Your Counterspell sits dead next
                  to three Mountains.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>The question:</strong> How many blue sources do I need to reliably cast{' '}
                  {'{U}{U}'} on turn 2?
                </Typography>
              </Paper>
            </AnimatedContainer>
          </Grid>
        </Grid>

        <Paper
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            bgcolor: '#e8f5e9',
            border: '2px solid #4caf50',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={700} color="#2e7d32">
            ManaTuner answers both questions with exact math — no guessing, no "feels right."
          </Typography>
        </Paper>
      </Box>

      {/* ================================================================
          SECTION 3 — Three Engines, Three Questions
          The best section from the old page, kept and promoted
          ================================================================ */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            How It Works
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            <CompareArrowsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Three Engines, Three Questions
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mt: 1 }}
          >
            ManaTuner uses three mathematical models. Each answers a different question about your
            deck.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            {
              tab: 'Castability Tab',
              engine: 'Hypergeometric Distribution',
              icon: <FunctionsIcon sx={{ fontSize: 32 }} />,
              question: 'Can I cast this spell on curve?',
              detail:
                'For each spell in your deck, ManaTuner calculates the exact probability of having the right mana at the right time. Not an estimate — precise math based on your deck composition.',
              color: '#1976d2',
              bgColor: '#e3f2fd',
              example:
                'Your Counterspell has 82% chance of being castable on Turn 2 with 20 blue sources',
            },
            {
              tab: 'Recommendations',
              engine: "Frank Karsten's Research",
              icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
              question: 'How many sources do I need?',
              detail:
                "Based on Hall-of-Famer Frank Karsten's peer-reviewed research, ManaTuner tells you exactly how many sources of each color you need to hit the 90% reliability threshold.",
              color: '#4caf50',
              bgColor: '#e8f5e9',
              example: '"Add 3 more blue sources to reach the 90% consistency threshold"',
            },
            {
              tab: 'Mulligan Tab',
              engine: 'Monte Carlo + Bellman Equation',
              icon: <CasinoIcon sx={{ fontSize: 32 }} />,
              question: 'Should I keep or mulligan?',
              detail:
                '10,000 simulated games with your exact decklist. Optimal stopping theory calculates the hand quality threshold below which you should mulligan — customized for your archetype.',
              color: '#9c27b0',
              bgColor: '#f3e5f5',
              example: 'Keep 7 if hand score > 62, otherwise mulligan to 6',
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <AnimatedContainer animation="fadeInUp" delay={index * 0.1}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: item.color,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: item.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: item.color,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Chip
                          label={item.tab}
                          size="small"
                          sx={{ fontWeight: 700, bgcolor: item.bgColor, color: item.color }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {item.engine}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      "{item.question}"
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{ flexGrow: 1 }}
                    >
                      {item.detail}
                    </Typography>
                    <Paper sx={{ p: 1.5, bgcolor: item.bgColor, borderRadius: 2 }}>
                      <Typography variant="caption" fontWeight={600} color={item.color}>
                        {item.example}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ================================================================
          SECTION 4 — The FAQ everyone has (promoted from yellow callout)
          ================================================================ */}
      <Paper
        sx={{
          p: 4,
          mb: 6,
          borderRadius: 3,
          bgcolor: '#fff8e1',
          border: '2px solid #ffc107',
        }}
      >
        <Typography variant="h5" fontWeight={700} color="#f57f17" gutterBottom>
          "Why does ManaTuner show 82% when Karsten says I need 90%?"
        </Typography>
        <Typography variant="body1" paragraph>
          Great question — this is the #1 source of confusion, and it has a simple answer:
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.7)' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#1976d2" gutterBottom>
                ManaTuner's Castability Tab: 82%
              </Typography>
              <Typography variant="body2">
                This is your <strong>single-draw probability</strong>. You drew one hand of 7 cards
                — what are the odds you have the right mana? No mulligans, no do-overs.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.7)' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#4caf50" gutterBottom>
                Karsten's Recommendation: 90%
              </Typography>
              <Typography variant="body2">
                This includes <strong>the option to mulligan</strong> bad hands. If your first hand
                has no red mana, you mulligan and try again. Across all attempts, your effective
                chance rises to ~90%.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Typography
          variant="body2"
          sx={{ mt: 2, fontWeight: 600, color: '#f57f17', textAlign: 'center' }}
        >
          Both numbers are correct — they answer different questions. ManaTuner shows you both.
        </Typography>
      </Paper>

      {/* ================================================================
          SECTION 5 — Realistic vs Best Case (the two probability modes)
          ================================================================ */}
      <Box id="probabilities" sx={{ mb: 6, scrollMarginTop: '80px' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            Castability Tab
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            Two Ways to Read Your Odds
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '2px solid #4caf50' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#4caf50' }}>
                Realistic (primary)
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>What it answers:</strong> "If I keep this hand, can I cast this spell on
                curve?"
              </Typography>
              <Typography variant="body2" component="div">
                Checks two things at once:
                <ol style={{ paddingLeft: 20, margin: '8px 0' }}>
                  <li>
                    <strong>Enough lands</strong> — P(drawing at least N lands by turn N)
                  </li>
                  <li>
                    <strong>Right colors</strong> — P(those lands include the colors you need)
                  </li>
                </ol>
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                This is the number to optimize. It catches both mana screw and color screw.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '2px solid #2196f3' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2196f3' }}>
                Best case (secondary)
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>What it answers:</strong> "If I hit a land every turn, do I have the right
                colors?"
              </Typography>
              <Typography variant="body2" paragraph>
                Assumes perfect land drops, then checks color availability. Always higher than
                Realistic because it ignores mana screw.
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                Use it to evaluate your color balance independently of your land count.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#e8f5e9' }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                +Ramp bonus (when dorks/rocks detected)
              </Typography>
              <Typography variant="body2">
                When your deck contains mana accelerators (Llanowar Elves, Sol Ring, Wild Growth,
                Lotus Cobra...), ManaTuner calculates the probability of having them online and adds
                their mana contribution. The engine evaluates up to 3 accelerators simultaneously,
                including synergies like enhancers that boost other dorks.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ================================================================
          SECTION 6 — Deep Dive (for David and advanced players)
          All accordions collapsed by default — opt-in depth
          ================================================================ */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            For the Curious
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            The Math Under the Hood
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', mt: 1 }}
          >
            You don't need to understand any of this to use ManaTuner — but if you're curious,
            here's exactly how it works.
          </Typography>
        </Box>

        {/* Hypergeometric */}
        <Accordion
          sx={{
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #e3f2fd',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1976d2',
                }}
              >
                <FunctionsIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Hypergeometric Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  The core formula behind castability
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Imagine a bag with 60 marbles: 14 red and 46 other colors. You grab 7 at random. What
              are the odds you got at least one red? That's what the hypergeometric distribution
              calculates — except the "marbles" are your cards and the "red" ones are your mana
              sources.
            </Typography>

            <Paper
              sx={{
                p: 3,
                my: 3,
                borderRadius: 2,
                bgcolor: '#e3f2fd',
                textAlign: 'center',
              }}
            >
              <Typography variant="overline" color="#1565c0" fontWeight={700}>
                The Formula
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontFamily: 'monospace', color: '#1565c0', fontWeight: 700 }}
              >
                P(X = k) = C(K,k) × C(N-K,n-k) / C(N,n)
              </Typography>
            </Paper>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                { var: 'N', desc: 'Cards in deck (60)', example: '60' },
                { var: 'K', desc: 'Mana sources you have', example: '14 red sources' },
                { var: 'n', desc: "Cards you've seen", example: '7 (opening hand)' },
                { var: 'k', desc: 'Sources you need', example: '1 red source' },
              ].map((item, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="primary"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {item.var}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {item.desc}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                      {item.example}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#2e7d32">
                <strong>Concrete example:</strong> 14 red sources in a 60-card deck, opening hand of
                7 cards. Probability of at least 1 red source = <strong>86.1%</strong>. That means
                roughly 1 in 7 games you'll start with zero red mana — which is why Karsten
                recommends 14 sources (mulligans bring it up to ~90%).
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* Monte Carlo */}
        <Accordion
          sx={{
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #f3e5f5',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#f3e5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9c27b0',
                }}
              >
                <CasinoIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Monte Carlo Simulation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  10,000 games with your exact decklist
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Instead of doing math, we let the computer play 10,000 games for you. It shuffles your
              deck, draws hands, makes mulligan decisions, and tracks how often things work out.
              Think of it as playtesting on fast-forward.
            </Typography>

            <Grid container spacing={2} sx={{ my: 2 }}>
              {[
                {
                  step: '1',
                  title: 'Shuffle',
                  text: 'Your exact 60 cards are randomly shuffled using an unbiased algorithm (Fisher-Yates)',
                },
                {
                  step: '2',
                  title: 'Draw & Decide',
                  text: 'Draw 7 cards. The engine decides keep or mulligan using optimal theory (Bellman equation)',
                },
                {
                  step: '3',
                  title: 'Play Out',
                  text: 'Track mana availability each turn. Repeat 10,000 times. Count the results.',
                },
              ].map((item, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid #f3e5f5',
                      height: '100%',
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="#9c27b0"
                      sx={{ fontFamily: 'monospace', mb: 0.5 }}
                    >
                      {item.step}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.text}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#7b1fa2">
                <strong>Why both?</strong> The hypergeometric formula gives instant exact answers.
                Monte Carlo validates them and handles complex scenarios (mulligans, multiple
                spells) that formulas alone can't solve. Our results match within 0.1%.
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* Frank Karsten */}
        <Accordion
          sx={{
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #e8f5e9',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4caf50',
                }}
              >
                <TrendingUpIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Frank Karsten's Research
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  The gold standard for mana base construction
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Frank Karsten is a <strong>Magic Pro Tour Hall of Famer</strong> and PhD
              mathematician. His{' '}
              <Link
                href="https://www.channelfireball.com/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 600 }}
              >
                2022 research
              </Link>{' '}
              is the definitive guide on how many mana sources you need. Here's his table (targeting
              90% consistency including mulligans):
            </Typography>

            <TableContainer component={Paper} sx={{ my: 3, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                    <TableCell>
                      <Typography fontWeight={700}>Mana Cost</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={700}>Turn 1</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={700}>Turn 2</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={700}>Turn 3</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={700}>Turn 4</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {karstenTable.map((row, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
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

            <Typography variant="body2" color="text.secondary">
              <strong>How to read this:</strong> If your deck has a spell that costs {'{U}{U}'} and
              you want to cast it on turn 2 reliably, you need 20 blue sources. If you're OK casting
              it on turn 3 instead, 18 sources are enough.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Bellman Equation */}
        <Accordion
          sx={{
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #fff3e0',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#fff3e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff9800',
                }}
              >
                <CalculateIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Bellman Equation (Mulligan Math)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Optimal stopping theory for keep/mulligan decisions
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              The hardest question in a game of Magic: "Is this hand good enough, or should I
              mulligan and risk getting a worse 6-card hand?" The Bellman equation solves this
              mathematically.
            </Typography>
            <Typography variant="body1" paragraph>
              It works backwards: first it calculates how good an average 5-card hand is, then uses
              that to determine the minimum quality a 6-card hand must have to be worth keeping, and
              finally uses <em>that</em> to set the threshold for 7-card hands.
            </Typography>

            <Paper sx={{ p: 3, my: 3, borderRadius: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
              <Typography variant="overline" color="#e65100" fontWeight={700}>
                The Logic
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontFamily: 'monospace', color: '#e65100', fontWeight: 700 }}
              >
                Keep 7 if EV(hand) {'>'} EV(mulligan to 6)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Where EV(mulligan to 6) already accounts for the option to go down to 5
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#e65100">
                <strong>In practice:</strong> ManaTuner runs 10,000 simulations with these
                thresholds pre-computed for your archetype (aggro keeps more aggressively, control
                mulligans more freely). The result is a concrete "keep" or "mulligan" recommendation
                for each simulated hand.
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* ================================================================
          SECTION 7 — Practical cheat sheet
          ================================================================ */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
          >
            Quick Reference
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            Rules of Thumb
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3, border: '2px solid #1976d2' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#1976d2" gutterBottom>
                  <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                  Land Count by Archetype
                </Typography>
                <Typography variant="body2" paragraph>
                  How many lands you need depends on your average mana cost and game plan:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="Aggro: 18-22"
                    size="small"
                    sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }}
                  />
                  <Chip
                    label="Midrange: 22-26"
                    size="small"
                    sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                  />
                  <Chip
                    label="Control: 26-28"
                    size="small"
                    sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3, border: '2px solid #9c27b0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#9c27b0" gutterBottom>
                  <FunctionsIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                  Color Sources Needed
                </Typography>
                <Typography variant="body2" paragraph>
                  From Karsten's research — the minimum sources for 90% consistency:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="1 pip on T1: 14"
                    size="small"
                    sx={{ bgcolor: '#f3e5f5', fontWeight: 600 }}
                  />
                  <Chip
                    label="2 pips on T2: 20"
                    size="small"
                    sx={{ bgcolor: '#f3e5f5', fontWeight: 600 }}
                  />
                  <Chip
                    label="3 pips on T3: 23"
                    size="small"
                    sx={{ bgcolor: '#f3e5f5', fontWeight: 600 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* ================================================================
          Cross-links + CTA
          ================================================================ */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => navigate('/guide')} sx={{ borderRadius: 3 }}>
          Read the User Guide
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/land-glossary')}
          sx={{ borderRadius: 3 }}
        >
          Land Type Glossary
        </Button>
      </Box>

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
            Ready to Fix Your Mana?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
            Paste your decklist and get instant analysis backed by real math.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/analyzer')}
          endIcon={<ArrowForwardIcon />}
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
          Analyze Your Deck
        </Button>
      </Paper>
    </Container>
  )
}

export default MathematicsPage
