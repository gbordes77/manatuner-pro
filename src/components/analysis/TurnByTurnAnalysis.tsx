import React, { useMemo } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  Alert
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { TurnAnalysis } from '../../types/maths'

interface TurnByTurnAnalysisProps {
  turnAnalysis: TurnAnalysis[]
  title?: string
  showChart?: boolean
  showTable?: boolean
  compactMode?: boolean
}

export const TurnByTurnAnalysis: React.FC<TurnByTurnAnalysisProps> = ({
  turnAnalysis,
  title = 'Turn-by-Turn Analysis',
  showChart = true,
  showTable = true,
  compactMode = false
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Prepare chart data
  const chartData = useMemo(() => {
    return turnAnalysis.map(analysis => ({
      turn: analysis.turn,
      probability: Math.round(analysis.castProbability * 100),
      cardsDrawn: analysis.cardsDrawn,
      threshold: 90 // Frank Karsten's 90% threshold
    }))
  }, [turnAnalysis])

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (turnAnalysis.length === 0) return null

    const criticalTurn = turnAnalysis.find(analysis => 
      analysis.castProbability < 0.90
    )?.turn || null

    const averageProbability = turnAnalysis.reduce((sum, analysis) => 
      sum + analysis.castProbability, 0) / turnAnalysis.length

    const trend = turnAnalysis.length > 1 ? 
      turnAnalysis[turnAnalysis.length - 1].castProbability - turnAnalysis[0].castProbability : 0

    return {
      criticalTurn,
      averageProbability,
      trend,
      meetsKarstenStandard: criticalTurn === null
    }
  }, [turnAnalysis])

  const getProbabilityColor = (probability: number) => {
    if (probability >= 95) return theme.palette.success.main
    if (probability >= 90) return theme.palette.info.main
    if (probability >= 80) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getProbabilityIcon = (probability: number) => {
    if (probability >= 95) return <CheckIcon color="success" fontSize="small" />
    if (probability >= 90) return <CheckIcon color="info" fontSize="small" />
    if (probability >= 80) return <WarningIcon color="warning" fontSize="small" />
    return <ErrorIcon color="error" fontSize="small" />
  }

  const getRatingChip = (rating: string) => {
    const colorMap = {
      excellent: 'success' as const,
      good: 'info' as const,
      acceptable: 'warning' as const,
      poor: 'error' as const,
      unplayable: 'error' as const
    }

    return (
      <Chip
        label={rating.toUpperCase()}
        color={colorMap[rating as keyof typeof colorMap]}
        size="small"
        variant="outlined"
      />
    )
  }

  if (turnAnalysis.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Alert severity="info">
            No turn analysis data available. Run an analysis to see results.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {title}
          </Typography>
          {summary && (
            <Box display="flex" gap={1} alignItems="center">
              {summary.trend > 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : summary.trend < 0 ? (
                <TrendingDownIcon color="error" fontSize="small" />
              ) : null}
              <Chip
                label={summary.meetsKarstenStandard ? 'Karsten Standard' : 'Needs Improvement'}
                color={summary.meetsKarstenStandard ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* Summary Stats */}
        {summary && !compactMode && (
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Summary Statistics
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Average Probability
                </Typography>
                <Typography variant="h6" color={getProbabilityColor(summary.averageProbability * 100)}>
                  {(summary.averageProbability * 100).toFixed(1)}%
                </Typography>
              </Box>
              {summary.criticalTurn && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Critical Turn
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    Turn {summary.criticalTurn}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Frank Karsten Standard
                </Typography>
                <Typography variant="h6" color={summary.meetsKarstenStandard ? 'success.main' : 'error.main'}>
                  {summary.meetsKarstenStandard ? 'Met' : 'Failed'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Chart */}
        {showChart && !compactMode && (
          <Box mb={3} height={isMobile ? 200 : 300}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Probability by Turn
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="turn" 
                  label={{ value: 'Turn', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'probability' ? 'Cast Probability' : name
                  ]}
                  labelFormatter={(turn: number) => `Turn ${turn}`}
                />
                <ReferenceLine 
                  y={90} 
                  stroke={theme.palette.warning.main}
                  strokeDasharray="5 5"
                  label="Karsten 90% Standard"
                />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Table */}
        {showTable && (
          <TableContainer>
            <Table size={compactMode ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>Turn</TableCell>
                  <TableCell align="center">Cards Drawn</TableCell>
                  <TableCell align="center">Probability</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  {!compactMode && <TableCell align="center">Sources Needed</TableCell>}
                  {!compactMode && <TableCell>Recommendation</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {turnAnalysis.map((analysis) => (
                  <TableRow key={analysis.turn}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {analysis.turn}
                        </Typography>
                        {analysis.castProbability < 0.90 && (
                          <WarningIcon color="warning" fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {analysis.cardsDrawn}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        {getProbabilityIcon(analysis.castProbability * 100)}
                        <Box>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={getProbabilityColor(analysis.castProbability * 100)}
                          >
                            {(analysis.castProbability * 100).toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={analysis.castProbability * 100}
                            sx={{ 
                              width: 60, 
                              height: 4,
                              backgroundColor: 'grey.300',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getProbabilityColor(analysis.castProbability * 100)
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {getRatingChip(analysis.karstenRating.rating)}
                    </TableCell>
                    {!compactMode && (
                      <TableCell align="center">
                        <Typography variant="body2">
                          {analysis.karstenRating.sourcesNeeded}
                          {analysis.karstenRating.deficit > 0 && (
                            <Typography 
                              component="span" 
                              color="error.main" 
                              sx={{ ml: 1 }}
                            >
                              (+{analysis.karstenRating.deficit})
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                    )}
                    {!compactMode && (
                      <TableCell>
                        <Tooltip title={analysis.karstenRating.recommendation}>
                          <Typography 
                            variant="body2" 
                            noWrap 
                            sx={{ maxWidth: 200 }}
                          >
                            {analysis.karstenRating.recommendation}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Frank Karsten Attribution */}
        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary">
            Analysis based on Frank Karsten's hypergeometric methodology. 
            90% probability threshold represents competitive play standard.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
} 