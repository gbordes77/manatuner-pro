import {
    Assessment as AssessmentIcon,
    Speed as SpeedIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import React, { useMemo } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import type { MonteCarloResult } from '../../types/maths'

interface MonteCarloResultsProps {
  result: MonteCarloResult | null
  title?: string
  showDistribution?: boolean
  showConfidence?: boolean
  compactMode?: boolean
}

export const MonteCarloResults: React.FC<MonteCarloResultsProps> = ({
  result,
  title = 'Monte Carlo Simulation Results',
  showDistribution = true,
  showConfidence = true,
  compactMode = false
}) => {
  const theme = useTheme()
  const _isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Prepare distribution chart data
  const distributionData = useMemo(() => {
    if (!result) return []

    return result.distribution.map((count, turn) => ({
      turn: turn === 0 ? 'Failed' : `Turn ${turn}`,
      count,
      percentage: ((count / result.iterations) * 100).toFixed(1)
    })).filter(item => item.count > 0)
  }, [result])

  // Prepare success/failure pie data
  const successData = useMemo(() => {
    if (!result) return []

    const failed = result.iterations - result.successfulRuns
    return [
      { name: 'Success', value: result.successfulRuns, color: theme.palette.success.main },
      { name: 'Failed', value: failed, color: theme.palette.error.main }
    ]
  }, [result, theme])

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return theme.palette.success.main
    if (rate >= 80) return theme.palette.info.main
    if (rate >= 70) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getConfidenceLevel = (rate: number) => {
    if (rate >= 95) return 'Excellent'
    if (rate >= 90) return 'Good'
    if (rate >= 80) return 'Acceptable'
    if (rate >= 70) return 'Poor'
    return 'Unplayable'
  }

  if (!result) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Alert severity="info">
            No Monte Carlo simulation data available. Run a simulation to see results.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            {title}
          </Typography>
          <Chip
            icon={<AssessmentIcon />}
            label={`${result.iterations.toLocaleString()} iterations`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color={getSuccessRateColor(result.successRate)}>
                {result.successRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={result.successRate}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getSuccessRateColor(result.successRate)
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary.main">
                {result.averageTurn.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Turn
              </Typography>
              <Chip
                icon={<TimelineIcon />}
                label={getConfidenceLevel(result.successRate)}
                color={result.successRate >= 90 ? 'success' : result.successRate >= 80 ? 'warning' : 'error'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                {result.successfulRuns.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successful Runs
              </Typography>
              <Typography variant="caption" color="text.secondary">
                out of {result.iterations.toLocaleString()}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="secondary.main">
                ±{result.standardDeviation.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Std Deviation
              </Typography>
              <Chip
                icon={<SpeedIcon />}
                label="Consistency"
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Confidence Interval */}
        {showConfidence && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              95% Confidence Interval
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                {result.confidence.lower.toFixed(1)}%
              </Typography>
              <Box flex={1}>
                <LinearProgress
                  variant="buffer"
                  value={result.confidence.upper}
                  valueBuffer={100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar1': {
                      backgroundColor: getSuccessRateColor(result.successRate)
                    },
                    '& .MuiLinearProgress-bar2': {
                      backgroundColor: 'grey.300'
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {result.confidence.upper.toFixed(1)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              True success rate is likely between {result.confidence.lower.toFixed(1)}% and {result.confidence.upper.toFixed(1)}%
            </Typography>
          </Box>
        )}

        {!compactMode && <Divider sx={{ my: 3 }} />}

        {/* Charts */}
        {showDistribution && !compactMode && (
          <Grid container spacing={3}>
            {/* Turn Distribution */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>
                Success Distribution by Turn
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="turn" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value} runs (${((value / result.iterations) * 100).toFixed(1)}%)`,
                        'Count'
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            {/* Success/Failure Pie */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Overall Success Rate
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={successData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {successData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toLocaleString()} runs (${((value / result.iterations) * 100).toFixed(1)}%)`,
                        'Count'
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Interpretation */}
        <Box mt={3} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="subtitle2" gutterBottom>
            Interpretation
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This Monte Carlo simulation ran {result.iterations.toLocaleString()} games to estimate the probability
            of meeting your mana requirements. The success rate of {result.successRate.toFixed(1)}% means that
            in a typical game, you have about a {Math.round(result.successRate)}% chance of having the mana you need.
          </Typography>

          {result.successRate >= 90 && (
            <Alert severity="success" sx={{ mt: 1 }}>
              Excellent consistency! Your manabase reliably supports your strategy.
            </Alert>
          )}

          {result.successRate >= 80 && result.successRate < 90 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Good consistency. Consider minor adjustments for competitive play.
            </Alert>
          )}

          {result.successRate >= 70 && result.successRate < 80 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Moderate consistency. Your manabase needs improvement for reliable performance.
            </Alert>
          )}

          {result.successRate < 70 && (
            <Alert severity="error" sx={{ mt: 1 }}>
              Poor consistency. Significant manabase improvements needed.
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
