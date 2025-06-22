import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Divider
} from '@mui/material'
import { Casino, TrendingUp, Assessment, CheckCircle } from '@mui/icons-material'

// Types locaux pour éviter les imports manquants
interface MonteCarloResult {
  iterations: number
  scenarios: ScenarioResult[]
  averagePerformance: number
  confidenceInterval: {
    lower: number
    upper: number
    level: number
  }
  executionTime: number
}

interface ScenarioResult {
  name: string
  description: string
  successRate: number
  averageValue: number
  standardDeviation: number
  confidenceInterval: {
    lower: number
    upper: number
  }
}

interface MonteCarloResultsProps {
  result: MonteCarloResult
  deckName?: string
}

const MonteCarloResults: React.FC<MonteCarloResultsProps> = ({
  result,
  deckName = "Your Deck"
}) => {
  const theme = useTheme()

  const getPerformanceColor = (rate: number) => {
    if (rate >= 0.8) return theme.palette.success.main
    if (rate >= 0.6) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getPerformanceLabel = (rate: number) => {
    if (rate >= 0.9) return 'Excellent'
    if (rate >= 0.8) return 'Very Good'
    if (rate >= 0.7) return 'Good'
    if (rate >= 0.6) return 'Fair'
    if (rate >= 0.5) return 'Poor'
    return 'Very Poor'
  }

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals)
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Casino sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Monte Carlo Simulation Results
        </Typography>
        <Chip 
          label={`${result.iterations.toLocaleString()} iterations`}
          size="small" 
          sx={{ ml: 2 }}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Statistical analysis of {deckName} performance across multiple game scenarios
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Execution time: {result.executionTime}ms | Confidence level: {(result.confidenceInterval.level * 100).toFixed(0)}%
        </Typography>
      </Box>

      {/* Overall Performance */}
      <Card sx={{ mb: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Assessment sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Overall Performance
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: getPerformanceColor(result.averagePerformance)
                  }}
                >
                  {formatNumber(result.averagePerformance * 100, 1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average Success Rate
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(result.confidenceInterval.lower * 100, 1)}% - {formatNumber(result.confidenceInterval.upper * 100, 1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(result.confidenceInterval.level * 100).toFixed(0)}% Confidence Interval
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={getPerformanceLabel(result.averagePerformance)}
                  sx={{
                    backgroundColor: alpha(getPerformanceColor(result.averagePerformance), 0.1),
                    color: getPerformanceColor(result.averagePerformance),
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Scenario Results */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Scenario Breakdown
      </Typography>
      
      <Grid container spacing={2}>
        {result.scenarios.map((scenario, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ 
                    mr: 1, 
                    color: getPerformanceColor(scenario.successRate),
                    fontSize: 20 
                  }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {scenario.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {scenario.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Success Rate
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {formatNumber(scenario.successRate * 100, 1)}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={scenario.successRate * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.grey[300], 0.3),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getPerformanceColor(scenario.successRate),
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Average Value
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatNumber(scenario.averageValue, 2)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Std. Deviation
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatNumber(scenario.standardDeviation, 2)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      95% Confidence Interval
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      [{formatNumber(scenario.confidenceInterval.lower, 2)}, {formatNumber(scenario.confidenceInterval.upper, 2)}]
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Statistical Notes */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          📊 Statistical Notes:
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • Monte Carlo simulation provides probabilistic estimates based on random sampling<br/>
          • Confidence intervals represent the range where the true value likely falls<br/>
          • Higher iteration counts provide more accurate results<br/>
          • Results assume perfect shuffling and no player skill factors
        </Typography>
      </Box>

      {/* Frank Karsten Reference */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Monte Carlo methodology inspired by competitive Magic: The Gathering analysis
        </Typography>
      </Box>
    </Paper>
  )
}

export default MonteCarloResults 