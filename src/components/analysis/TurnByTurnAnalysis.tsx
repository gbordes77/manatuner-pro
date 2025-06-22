import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  useTheme,
  alpha
} from '@mui/material'
import { TrendingUp, GpsFixed, Timeline } from '@mui/icons-material'

// Type local pour éviter les imports manquants
interface TurnByTurnResult {
  turn: number
  probability: number
  exactProbability: number
  cardsDrawn: number
}

interface TurnByTurnAnalysisProps {
  results: TurnByTurnResult[]
  deckSize: number
  landCount: number
  targetLands?: number
}

const TurnByTurnAnalysis: React.FC<TurnByTurnAnalysisProps> = ({
  results,
  deckSize,
  landCount,
  targetLands = 3
}) => {
  const theme = useTheme()

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.9) return theme.palette.success.main
    if (probability >= 0.7) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getProbabilityLabel = (probability: number) => {
    if (probability >= 0.9) return 'Excellent'
    if (probability >= 0.7) return 'Good'
    if (probability >= 0.5) return 'Fair'
    return 'Poor'
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Timeline sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Turn-by-Turn Land Analysis
        </Typography>
        <Chip 
          label={`${landCount}/${deckSize} lands`} 
          size="small" 
          sx={{ ml: 2 }}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Probability of having at least the target number of lands on each turn
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Based on Frank Karsten's hypergeometric methodology
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Turn</strong></TableCell>
              <TableCell><strong>Cards Seen</strong></TableCell>
              <TableCell><strong>Exact {targetLands} Lands</strong></TableCell>
              <TableCell><strong>At Least {targetLands} Lands</strong></TableCell>
              <TableCell><strong>Quality</strong></TableCell>
              <TableCell><strong>Visual</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow 
                key={result.turn}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05) 
                  } 
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {result.turn}
                    </Typography>
                    {result.turn === targetLands && (
                      <GpsFixed sx={{ ml: 1, fontSize: 16, color: theme.palette.primary.main }} />
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {7 + result.turn - 1} cards
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {(result.exactProbability * 100).toFixed(1)}%
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: getProbabilityColor(result.probability)
                    }}
                  >
                    {(result.probability * 100).toFixed(1)}%
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={getProbabilityLabel(result.probability)}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getProbabilityColor(result.probability), 0.1),
                      color: getProbabilityColor(result.probability),
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                
                <TableCell sx={{ width: 120 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={result.probability * 100}
                      sx={{
                        width: 80,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.grey[300], 0.3),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getProbabilityColor(result.probability),
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Statistics */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          📊 Key Insights:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Turn 3 Target Hit Rate:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {results.find(r => r.turn === 3) ? 
                (results.find(r => r.turn === 3)!.probability * 100).toFixed(1) + '%' : 
                'N/A'
              }
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Turn 5 Reliability:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {results.find(r => r.turn === 5) ? 
                (results.find(r => r.turn === 5)!.probability * 100).toFixed(1) + '%' : 
                'N/A'
              }
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Land Ratio:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {((landCount / deckSize) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Frank Karsten Reference */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Calculations based on Frank Karsten's hypergeometric methodology (TCGPlayer 2022)
        </Typography>
      </Box>
    </Paper>
  )
}

export default TurnByTurnAnalysis 