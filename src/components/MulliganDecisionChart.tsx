/**
 * Mulligan Decision Chart Component
 *
 * Visualizes mulligan analysis results with:
 * - Distribution curves for 7, 6, 5 card hands
 * - Optimal thresholds from DP solver
 * - Clear keep/mulligan recommendations
 */

import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    LinearProgress,
    Tooltip,
    Typography
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Tooltip as RechartsTooltip,
    ReferenceLine,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts'
import type { DeckCard } from '../services/deckAnalyzer'
import {
    type MulliganAnalysisResult,
    quickMulliganAnalysis
} from '../services/mulliganSimulator'

interface MulliganDecisionChartProps {
  cards: DeckCard[]
  onAnalysisComplete?: (result: MulliganAnalysisResult) => void
}

export const MulliganDecisionChart: React.FC<MulliganDecisionChartProps> = ({
  cards,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<MulliganAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Run analysis when cards change
  useEffect(() => {
    // Check total cards (sum of quantities), not unique card count
    const totalCards = cards?.reduce((sum, c) => sum + c.quantity, 0) || 0

    if (!cards || totalCards < 40) {
      setAnalysis(null)
      return
    }

    const runAnalysis = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Use setTimeout to allow UI to update before heavy computation
        await new Promise(resolve => setTimeout(resolve, 50))

        const result = quickMulliganAnalysis(cards, 3000)
        setAnalysis(result)
        onAnalysisComplete?.(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed')
      } finally {
        setIsLoading(false)
      }
    }

    runAnalysis()
  }, [cards, onAnalysisComplete])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!analysis) return []

    const data: Array<{
      score: number
      hand7: number
      hand6: number
      hand5: number
    }> = []

    for (let i = 0; i < 11; i++) {
      const score = i * 10 + 5
      data.push({
        score,
        hand7: (analysis.distributions.hand7[i]?.frequency || 0) * 100,
        hand6: (analysis.distributions.hand6[i]?.frequency || 0) * 100,
        hand5: (analysis.distributions.hand5[i]?.frequency || 0) * 100
      })
    }

    return data
  }, [analysis])

  // Get quality color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'success'
      case 'good': return 'info'
      case 'average': return 'warning'
      case 'poor': return 'error'
      default: return 'default'
    }
  }

  // Help tooltip content
  const helpContent = (
    <Box sx={{ p: 1, maxWidth: 350 }}>
      <Typography variant="subtitle2" gutterBottom>
        Mulligan Decision Analysis
      </Typography>
      <Typography variant="body2" paragraph>
        This chart uses <strong>Monte Carlo simulation</strong> and{' '}
        <strong>Dynamic Programming</strong> to calculate optimal mulligan thresholds.
      </Typography>
      <Typography variant="body2" paragraph>
        <strong>Score (0-100):</strong> Mana Efficiency over turns 1-4.
        Higher = better curve execution.
      </Typography>
      <Typography variant="body2" paragraph>
        <strong>Thresholds:</strong> Vertical lines show the minimum score to keep.
        If your hand scores below the threshold, mulligan improves your expected outcome.
      </Typography>
      <Typography variant="body2">
        <strong>Curves:</strong> Distribution of hand scores for each hand size.
        More area to the right = better hands.
      </Typography>
    </Box>
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Running Monte Carlo simulation...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Analyzing 3,000 hands with Goldfish simulation
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Enter a deck with at least 40 cards to see mulligan analysis.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const v7 = analysis.values.find(v => v.handSize === 7)!
  const v6 = analysis.values.find(v => v.handSize === 6)!
  const v5 = analysis.values.find(v => v.handSize === 5)!

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">
              Mulligan Decision Analysis
            </Typography>
            <Tooltip title={helpContent} arrow placement="right">
              <HelpOutlineIcon
                fontSize="small"
                sx={{ color: 'text.secondary', cursor: 'help' }}
              />
            </Tooltip>
          </Box>
          <Chip
            label={analysis.deckQuality.toUpperCase()}
            color={getQualityColor(analysis.deckQuality) as any}
            size="small"
          />
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary.main">
                {v7.expectedValue.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                E[Score] at 7 cards
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="secondary.main">
                {v6.expectedValue.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                E[Score] at 6 cards
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                {v7.threshold.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Keep 7 Threshold
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                {v6.threshold.toFixed(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Keep 6 Threshold
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Distribution Chart */}
        <Box height={300} mb={3}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="score"
                label={{ value: 'Hand Score', position: 'bottom', offset: -5 }}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                label={{ value: 'Frequency %', angle: -90, position: 'insideLeft' }}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              />
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === 'hand7' ? '7 Cards' : name === 'hand6' ? '6 Cards' : '5 Cards'
                ]}
                labelFormatter={(label) => `Score: ${label}`}
              />
              <Legend
                formatter={(value) =>
                  value === 'hand7' ? '7 Cards' :
                  value === 'hand6' ? '6 Cards' : '5 Cards'
                }
              />

              {/* Reference lines for thresholds */}
              <ReferenceLine
                x={v7.threshold}
                stroke="#ff9800"
                strokeDasharray="5 5"
                label={{ value: 'Keep 7', fill: '#ff9800', fontSize: 12 }}
              />
              <ReferenceLine
                x={v6.threshold}
                stroke="#2196f3"
                strokeDasharray="5 5"
                label={{ value: 'Keep 6', fill: '#2196f3', fontSize: 12 }}
              />

              {/* Area charts for distributions */}
              <Area
                type="monotone"
                dataKey="hand7"
                stroke="#4caf50"
                fill="#4caf50"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="hand6"
                stroke="#2196f3"
                fill="#2196f3"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="hand5"
                stroke="#ff9800"
                fill="#ff9800"
                fillOpacity={0.2}
                strokeWidth={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Strategy Summary */}
        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Optimal Strategy
        </Typography>

        <Box mb={2}>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="body2" sx={{ minWidth: 120 }}>
              Keep 7 cards if:
            </Typography>
            <LinearProgress
              variant="determinate"
              value={v7.threshold}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
              color="success"
            />
            <Typography variant="body2" fontWeight="bold">
              Score ≥ {v7.threshold.toFixed(0)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="body2" sx={{ minWidth: 120 }}>
              Keep 6 cards if:
            </Typography>
            <LinearProgress
              variant="determinate"
              value={v6.threshold}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
              color="info"
            />
            <Typography variant="body2" fontWeight="bold">
              Score ≥ {v6.threshold.toFixed(0)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" sx={{ minWidth: 120 }}>
              Keep 5 cards if:
            </Typography>
            <LinearProgress
              variant="determinate"
              value={v5.threshold}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
              color="warning"
            />
            <Typography variant="body2" fontWeight="bold">
              Score ≥ {v5.threshold.toFixed(0)}
            </Typography>
          </Box>
        </Box>

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <Box mt={2}>
            {analysis.recommendations.map((rec, i) => (
              <Alert
                key={i}
                severity={rec.startsWith('✅') ? 'success' : rec.startsWith('⚠️') ? 'warning' : 'info'}
                sx={{ mb: 1 }}
              >
                {rec}
              </Alert>
            ))}
          </Box>
        )}

        {/* Technical Details */}
        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary">
            Analysis based on {analysis.values[0].sampleSize.toLocaleString()} Monte Carlo simulations
            per hand size. Uses Bellman equation for optimal thresholds with London Mulligan rules.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MulliganDecisionChart
