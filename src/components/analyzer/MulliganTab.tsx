/**
 * MulliganTab - Advanced Mulligan Strategy Analysis
 *
 * Features:
 * - Archetype Selector (Aggro/Midrange/Control/Combo)
 * - Hand Score Breakdown with visual metrics
 * - Sample Hands Visualizer with turn-by-turn plan
 * - Score Legend with concrete explanations
 * - Distribution charts
 */

import {
    Casino as CasinoIcon,
    ExpandMore as ExpandMoreIcon,
    Help as HelpIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    LinearProgress,
    Paper,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts'
import type { DeckCard } from '../../services/deckAnalyzer'
import {
    analyzeWithArchetype,
    ARCHETYPE_CONFIGS,
    SCORE_LEGEND,
    type AdvancedMulliganResult,
    type Archetype,
    type SampleHand,
} from '../../services/mulliganSimulatorAdvanced'

// =============================================================================
// PROPS
// =============================================================================

interface MulliganTabProps {
  cards: DeckCard[]
  isMobile?: boolean
}

// =============================================================================
// ARCHETYPE SELECTOR
// =============================================================================

interface ArchetypeSelectorProps {
  value: Archetype
  onChange: (archetype: Archetype) => void
  disabled?: boolean
}

const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({ value, onChange, disabled }) => {
  const theme = useTheme()

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        🎯 Deck Archetype
        <Tooltip title="Select your deck's archetype to optimize mulligan decisions for your strategy">
          <HelpIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Typography>

      <Grid container spacing={1}>
        {(Object.entries(ARCHETYPE_CONFIGS) as [Archetype, typeof ARCHETYPE_CONFIGS.aggro][]).map(([key, config]) => (
          <Grid item xs={6} sm={3} key={key}>
            <Paper
              elevation={value === key ? 4 : 1}
              onClick={() => !disabled && onChange(key)}
              sx={{
                p: 2,
                cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                border: 2,
                borderColor: value === key ? 'primary.main' : 'transparent',
                backgroundColor: value === key ? 'action.selected' : 'background.paper',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.6 : 1,
                '&:hover': disabled ? {} : {
                  borderColor: 'primary.light',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography variant="h5" sx={{ mb: 0.5 }}>{config.icon}</Typography>
              <Typography variant="subtitle2" fontWeight="bold">{config.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {config.description.split(' ').slice(0, 4).join(' ')}...
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Archetype priorities */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          <strong>{ARCHETYPE_CONFIGS[value].icon} {ARCHETYPE_CONFIGS[value].name} Priorities:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {ARCHETYPE_CONFIGS[value].priorities.map((priority, i) => (
            <Chip key={i} label={priority} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// =============================================================================
// SCORE LEGEND
// =============================================================================

const ScoreLegendSection: React.FC = () => {
  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">📊 Score Legend - What do the numbers mean?</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {Object.entries(SCORE_LEGEND).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={2.4} key={key}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: `${value.color}22`,
                  borderLeft: 4,
                  borderColor: value.color,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: value.color }}>
                  {value.min}+ {value.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {value.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

// =============================================================================
// EXPECTED VALUES DISPLAY
// =============================================================================

interface ExpectedValuesProps {
  result: AdvancedMulliganResult
}

const ExpectedValues: React.FC<ExpectedValuesProps> = ({ result }) => {
  const theme = useTheme()

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4caf50'
    if (score >= 75) return '#8bc34a'
    if (score >= 60) return '#ff9800'
    if (score >= 40) return '#f44336'
    return '#b71c1c'
  }

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'E[Score] at 7 cards', value: result.expectedScores.hand7, highlight: true },
        { label: 'E[Score] at 6 cards', value: result.expectedScores.hand6 },
        { label: 'Keep 7 Threshold', value: result.thresholds.keep7, isThreshold: true },
        { label: 'Keep 6 Threshold', value: result.thresholds.keep6, isThreshold: true },
      ].map((item, i) => (
        <Grid item xs={6} md={3} key={i}>
          <Paper
            elevation={item.highlight ? 3 : 1}
            sx={{
              p: 2,
              textAlign: 'center',
              border: item.highlight ? 2 : 0,
              borderColor: 'primary.main',
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: getScoreColor(item.value) }}
            >
              {item.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

// =============================================================================
// OPTIMAL STRATEGY BARS
// =============================================================================

interface OptimalStrategyProps {
  result: AdvancedMulliganResult
}

const OptimalStrategy: React.FC<OptimalStrategyProps> = ({ result }) => {
  const strategies = [
    { label: 'Keep 7 cards if:', threshold: result.thresholds.keep7, color: '#4caf50' },
    { label: 'Keep 6 cards if:', threshold: result.thresholds.keep6, color: '#2196f3' },
    { label: 'Keep 5 cards if:', threshold: result.thresholds.keep5, color: '#ff9800' },
  ]

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>🎯 Optimal Strategy</Typography>
      {strategies.map((s, i) => (
        <Box key={i} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{s.label}</Typography>
            <Typography variant="body2" fontWeight="bold">Score ≥ {s.threshold}</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={s.threshold}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                backgroundColor: s.color,
                borderRadius: 5,
              },
            }}
          />
        </Box>
      ))}
    </Paper>
  )
}

// =============================================================================
// DISTRIBUTION CHART
// =============================================================================

interface DistributionChartProps {
  result: AdvancedMulliganResult
}

const DistributionChart: React.FC<DistributionChartProps> = ({ result }) => {
  const data = result.distributions.hand7.map((d7, i) => ({
    score: d7.score,
    '7 Cards': Math.round(d7.frequency * 100),
    '6 Cards': Math.round(result.distributions.hand6[i].frequency * 100),
    '5 Cards': Math.round(result.distributions.hand5[i].frequency * 100),
  }))

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>📈 Hand Quality Distribution</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="score" label={{ value: 'Hand Score', position: 'bottom', offset: -5 }} />
          <YAxis label={{ value: 'Frequency %', angle: -90, position: 'insideLeft' }} />
          <RechartsTooltip />
          <Legend />
          <Area type="monotone" dataKey="7 Cards" stackId="1" stroke="#4caf50" fill="#4caf5066" />
          <Area type="monotone" dataKey="6 Cards" stackId="2" stroke="#2196f3" fill="#2196f366" />
          <Area type="monotone" dataKey="5 Cards" stackId="3" stroke="#ff9800" fill="#ff980066" />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  )
}

// =============================================================================
// SCORE BREAKDOWN DISPLAY
// =============================================================================

interface ScoreBreakdownProps {
  breakdown: SampleHand['breakdown']
}

const ScoreBreakdownDisplay: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
  const metrics = [
    { label: 'Mana Efficiency', value: breakdown.manaEfficiency, icon: '⚡' },
    { label: 'Curve Playability', value: breakdown.curvePlayability, icon: '📈' },
    { label: 'Color Access', value: breakdown.colorAccess, icon: '🎨' },
    { label: 'Early Game', value: breakdown.earlyGame, icon: '🚀' },
    { label: 'Land Balance', value: breakdown.landBalance, icon: '🏔️' },
  ]

  const getColor = (value: number): string => {
    if (value >= 80) return '#4caf50'
    if (value >= 60) return '#8bc34a'
    if (value >= 40) return '#ff9800'
    return '#f44336'
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      {metrics.map((m, i) => (
        <Chip
          key={i}
          label={`${m.icon} ${m.label}: ${m.value}%`}
          size="small"
          sx={{
            backgroundColor: `${getColor(m.value)}22`,
            borderColor: getColor(m.value),
            border: 1,
          }}
        />
      ))}
    </Box>
  )
}

// =============================================================================
// SAMPLE HAND CARD
// =============================================================================

interface SampleHandCardProps {
  hand: SampleHand
  index: number
}

const SampleHandCard: React.FC<SampleHandCardProps> = ({ hand, index }) => {
  const getRecommendationColor = (rec: SampleHand['recommendation']): string => {
    switch (rec) {
      case 'SNAP_KEEP': return '#4caf50'
      case 'KEEP': return '#8bc34a'
      case 'MARGINAL': return '#ff9800'
      case 'MULLIGAN': return '#f44336'
      case 'SNAP_MULL': return '#b71c1c'
    }
  }

  const getRecommendationLabel = (rec: SampleHand['recommendation']): string => {
    switch (rec) {
      case 'SNAP_KEEP': return '✅ SNAP KEEP'
      case 'KEEP': return '👍 KEEP'
      case 'MARGINAL': return '⚠️ MARGINAL'
      case 'MULLIGAN': return '👎 MULLIGAN'
      case 'SNAP_MULL': return '❌ SNAP MULL'
    }
  }

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Sample Hand #{index + 1}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: getRecommendationColor(hand.recommendation) }}
            >
              {hand.score}
            </Typography>
            <Chip
              label={getRecommendationLabel(hand.recommendation)}
              size="small"
              sx={{
                backgroundColor: `${getRecommendationColor(hand.recommendation)}22`,
                color: getRecommendationColor(hand.recommendation),
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Box>

        {/* Cards in hand */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Opening Hand:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {hand.cards.map((card, i) => (
              <Chip
                key={i}
                label={card.name}
                size="small"
                variant={card.isLand ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: card.isLand ? 'success.light' : 'transparent',
                  color: card.isLand ? 'success.contrastText' : 'text.primary',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Score Breakdown */}
        <ScoreBreakdownDisplay breakdown={hand.breakdown} />

        {/* Turn by Turn Plan */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="caption">📅 Turn-by-Turn Plan (T1-T4)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {hand.turnByTurn.map((turn, i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'action.hover',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      Turn {turn.turn}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {turn.landDrop ? `🏔️ ${turn.landDrop.split(' ')[0]}` : '❌ No land'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {turn.plays.length > 0
                        ? `⚡ ${turn.plays.map(p => p.split(' ')[0]).join(', ')}`
                        : '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {turn.manaUsed}/{turn.manaAvailable} mana
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Reasoning */}
        <Box sx={{ mt: 2 }}>
          {hand.reasoning.map((reason, i) => (
            <Typography key={i} variant="caption" display="block" color="text.secondary">
              {reason}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// SAMPLE HANDS SECTION
// =============================================================================

interface SampleHandsSectionProps {
  sampleHands: AdvancedMulliganResult['sampleHands']
}

const SampleHandsSection: React.FC<SampleHandsSectionProps> = ({ sampleHands }) => {
  const categories = [
    { key: 'excellent', label: '🌟 Excellent Hands (90+)', hands: sampleHands.excellent },
    { key: 'good', label: '✅ Good Hands (70-89)', hands: sampleHands.good },
    { key: 'marginal', label: '⚠️ Marginal Hands (55-69)', hands: sampleHands.marginal },
    { key: 'poor', label: '❌ Poor Hands (<55)', hands: sampleHands.poor },
  ]

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        🃏 Sample Hands from Your Deck
        <Tooltip title="These are actual hands your deck can generate, scored with your selected archetype">
          <HelpIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Typography>

      {categories.map((cat) => (
        <Accordion key={cat.key} defaultExpanded={cat.key === 'excellent' || cat.key === 'marginal'}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">
              {cat.label} ({cat.hands.length} examples)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {cat.hands.length > 0 ? (
              cat.hands.map((hand, i) => (
                <SampleHandCard key={i} hand={hand} index={i} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hands in this category from the simulation
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MulliganTab: React.FC<MulliganTabProps> = ({ cards, isMobile = false }) => {
  const [archetype, setArchetype] = useState<Archetype>('midrange')
  const [result, setResult] = useState<AdvancedMulliganResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate total cards including quantities
  const totalCards = cards.reduce((sum, card) => sum + (card.quantity || 1), 0)

  const runAnalysis = useCallback(async () => {
    if (totalCards < 40) {
      setError('Need at least 40 cards for mulligan analysis')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    // Run in next tick to allow UI to update
    setTimeout(() => {
      try {
        const analysisResult = analyzeWithArchetype(cards, archetype, 3000)
        setResult(analysisResult)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Analysis failed')
      } finally {
        setIsAnalyzing(false)
      }
    }, 50)
  }, [cards, archetype, totalCards])

  // Auto-run on mount and archetype change
  useEffect(() => {
    if (totalCards >= 40) {
      runAnalysis()
    }
  }, [archetype]) // Only re-run when archetype changes

  // Initial analysis
  useEffect(() => {
    if (totalCards >= 40 && !result) {
      runAnalysis()
    }
  }, [cards, totalCards])

  if (totalCards < 40) {
    return (
      <Alert severity="warning">
        Need at least 40 cards in your deck to run mulligan analysis.
        Currently: {totalCards} cards.
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CasinoIcon /> Mulligan Strategy Analysis
        </Typography>
        <Button
          variant="outlined"
          startIcon={isAnalyzing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={runAnalysis}
          disabled={isAnalyzing}
          size="small"
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
      </Box>

      {/* Archetype Selector */}
      <ArchetypeSelector
        value={archetype}
        onChange={setArchetype}
        disabled={isAnalyzing}
      />

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Running Monte Carlo simulation ({result ? 'updating' : 'initial analysis'})...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {result && !isAnalyzing && (
        <>
          {/* Quality Badge */}
          <Alert
            severity={
              result.deckQuality === 'excellent' ? 'success' :
              result.deckQuality === 'good' ? 'info' :
              result.deckQuality === 'average' ? 'warning' : 'error'
            }
            sx={{ mb: 3 }}
          >
            <Typography variant="body2">
              <strong>{result.archetypeConfig.icon} {result.archetypeConfig.name} Deck Quality: </strong>
              {result.deckQuality.toUpperCase()} (Score: {result.qualityScore}/100)
            </Typography>
          </Alert>

          {/* Expected Values */}
          <ExpectedValues result={result} />

          {/* Optimal Strategy */}
          <OptimalStrategy result={result} />

          {/* Distribution Chart */}
          <DistributionChart result={result} />

          {/* Score Legend */}
          <ScoreLegendSection />

          {/* Recommendations */}
          <Paper sx={{ p: 2, mb: 3, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>💡 Recommendations</Typography>
            {result.recommendations.map((rec, i) => (
              <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                {rec}
              </Typography>
            ))}
          </Paper>

          {/* Sample Hands */}
          <SampleHandsSection sampleHands={result.sampleHands} />

          {/* Footer */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            Based on {result.iterations.toLocaleString()} Monte Carlo simulations using Frank Karsten methodology
          </Typography>
        </>
      )}
    </Box>
  )
}

export default MulliganTab
