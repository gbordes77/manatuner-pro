import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Tooltip,
  Paper,
  Fade
} from '@mui/material'
import { searchCardByName } from '../services/scryfall'
import { Card as MTGCard } from '../types'

interface ManaCostRowProps {
  cardName: string
  quantity: number
}

interface ManaSymbolProps {
  symbol: string
}

const ManaSymbol: React.FC<ManaSymbolProps> = ({ symbol }) => {
  const getSymbolStyle = (sym: string) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      fontSize: '12px',
      fontWeight: 'bold',
      margin: '0 2px',
      border: '2px solid',
      minWidth: '24px'
    }

    switch ((sym || '').toUpperCase()) {
      case 'W':
        return {
          ...baseStyle,
          backgroundColor: '#FFFBF0',
          color: '#8B4513',
          borderColor: '#DAA520'
        }
      case 'U':
        return {
          ...baseStyle,
          backgroundColor: '#E6F3FF',
          color: '#0066CC',
          borderColor: '#4A90E2'
        }
      case 'B':
        return {
          ...baseStyle,
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
          borderColor: '#666666'
        }
      case 'R':
        return {
          ...baseStyle,
          backgroundColor: '#FFE6E6',
          color: '#CC0000',
          borderColor: '#E74C3C'
        }
      case 'G':
        return {
          ...baseStyle,
          backgroundColor: '#E6FFE6',
          color: '#006600',
          borderColor: '#27AE60'
        }
      default:
        // Generic mana (numbers)
        return {
          ...baseStyle,
          backgroundColor: '#F5F5F5',
          color: '#333333',
          borderColor: '#CCCCCC'
        }
    }
  }

  const cleanSymbol = symbol.replace(/[{}]/g, '')
  
  return (
    <Box component="span" sx={getSymbolStyle(cleanSymbol)}>
      {cleanSymbol}
    </Box>
  )
}

const ManaCostRow: React.FC<ManaCostRowProps> = ({ cardName, quantity }) => {
  const [cardData, setCardData] = useState<MTGCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await searchCardByName(cardName)
        setCardData(data)
      } catch (err) {
        console.error(`Error fetching card data for ${cardName}:`, err)
        setError('Failed to fetch card data')
      } finally {
        setLoading(false)
      }
    }

    fetchCardData()
  }, [cardName])

  const renderManaSymbols = (manaCost: string) => {
    if (!manaCost) return <span className="mana-symbol generic">2</span>
    
    // Parse mana cost symbols like {W}{U}{B}{R}{G}{1}{2}{3}...
    const symbols = manaCost.match(/\{[^}]+\}/g) || []
    
    return symbols.map((symbol, index) => {
      const cleanSymbol = symbol.replace(/[{}]/g, '')
      let className = 'mana-symbol '
      
      // Determine color class
      if (cleanSymbol === 'W') className += 'white'
      else if (cleanSymbol === 'U') className += 'blue'
      else if (cleanSymbol === 'B') className += 'black'
      else if (cleanSymbol === 'R') className += 'red'
      else if (cleanSymbol === 'G') className += 'green'
      else className += 'generic'
      
      return (
        <Tooltip key={index} title={`${cleanSymbol} mana`} arrow>
          <span className={className}>
            {cleanSymbol}
          </span>
        </Tooltip>
      )
    })
  }

  const calculateProbabilities = () => {
    if (!cardData?.mana_cost) return { p1: 85, p2: 65 }
    
    // Simple probability calculation based on mana cost complexity
    const symbols = cardData.mana_cost.match(/\{[^}]+\}/g) || []
    const coloredSymbols = symbols.filter((s: string) => /\{[WUBRG]\}/.test(s))
    const genericCost = symbols.filter((s: string) => /\{\d+\}/.test(s)).length
    
    // P1: Perfect scenario (good manabase)
    let p1 = 90 - (coloredSymbols.length * 5) - (genericCost * 2)
    
    // P2: Realistic scenario (accounting for mana screw)
    let p2 = p1 - 20 - (coloredSymbols.length * 3)
    
    return {
      p1: Math.max(Math.min(p1, 95), 30),
      p2: Math.max(Math.min(p2, 80), 15)
    }
  }

  const getQualityChip = (probability: number) => {
    if (probability >= 80) return { label: 'Excellent', class: 'excellent' }
    if (probability >= 65) return { label: 'Good', class: 'good' }
    if (probability >= 45) return { label: 'Average', class: 'average' }
    return { label: 'Poor', class: 'poor' }
  }

  const probabilities = calculateProbabilities()
  const p1Quality = getQualityChip(probabilities.p1)
  const p2Quality = getQualityChip(probabilities.p2)

  if (loading) {
    return (
      <Paper className="mtg-card animate-pulse" sx={{ p: 2, mb: 1 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2" fontWeight="600">
              {quantity}x {cardName}
            </Typography>
          </Grid>
          <Grid item xs={3} display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Box className="mtg-progress" sx={{ height: 8 }}>
              <Box className="mtg-progress-bar animate-pulse" sx={{ width: '60%' }} />
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box className="mtg-progress" sx={{ height: 8 }}>
              <Box className="mtg-progress-bar animate-pulse" sx={{ width: '40%' }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper className="mtg-card" sx={{ p: 2, mb: 1, borderColor: 'var(--mtg-red)' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2" fontWeight="600">
              {quantity}x {cardName}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <span className="mana-symbol generic">2</span>
              <Typography variant="caption" color="error">
                API Error
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Chip 
              label="Unknown" 
              size="small" 
              sx={{ 
                background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Grid>
          <Grid item xs={3}>
            <Chip 
              label="Unknown" 
              size="small" 
              sx={{ 
                background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Grid>
        </Grid>
      </Paper>
    )
  }

  return (
    <Fade in={true} timeout={500}>
      <Paper className="mtg-card animate-fadeIn" sx={{ p: 2, mb: 1 }}>
        <Grid container alignItems="center" spacing={2}>
          {/* Card Name & Quantity */}
          <Grid item xs={12} sm={3}>
            <Tooltip title={`${cardName} - ${cardData?.type_line || 'Unknown type'}`} arrow>
              <Typography 
                variant="body2" 
                fontWeight="600"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { color: 'var(--mtg-blue)' }
                }}
              >
                {quantity}x {cardName}
              </Typography>
            </Tooltip>
          </Grid>

          {/* Mana Cost */}
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
              {renderManaSymbols(cardData?.mana_cost || '')}
              <Typography variant="caption" color="text.secondary" ml={1}>
                CMC: {cardData?.cmc || 2}
              </Typography>
            </Box>
          </Grid>

          {/* P1 Probability */}
          <Grid item xs={6} sm={3}>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="caption" fontWeight="600">
                  P1 (Perfect):
                </Typography>
                <Chip 
                  label={`${probabilities.p1}%`}
                  size="small"
                  className={`mtg-chip ${p1Quality.class}`}
                />
              </Box>
              <Box className="mtg-progress" sx={{ height: 6 }}>
                <Box 
                  className="mtg-progress-bar" 
                  sx={{ 
                    width: `${probabilities.p1}%`,
                    background: `linear-gradient(90deg, var(--mtg-${p1Quality.class === 'excellent' ? 'green' : p1Quality.class === 'good' ? 'blue' : p1Quality.class === 'average' ? 'gold' : 'red'}), var(--mtg-${p1Quality.class === 'excellent' ? 'green' : p1Quality.class === 'good' ? 'blue' : p1Quality.class === 'average' ? 'gold' : 'red'}-light))`
                  }} 
                />
              </Box>
            </Box>
          </Grid>

          {/* P2 Probability */}
          <Grid item xs={6} sm={3}>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="caption" fontWeight="600">
                  P2 (Realistic):
                </Typography>
                <Chip 
                  label={`${probabilities.p2}%`}
                  size="small"
                  className={`mtg-chip ${p2Quality.class}`}
                />
              </Box>
              <Box className="mtg-progress" sx={{ height: 6 }}>
                <Box 
                  className="mtg-progress-bar" 
                  sx={{ 
                    width: `${probabilities.p2}%`,
                    background: `linear-gradient(90deg, var(--mtg-${p2Quality.class === 'excellent' ? 'green' : p2Quality.class === 'good' ? 'blue' : p2Quality.class === 'average' ? 'gold' : 'red'}), var(--mtg-${p2Quality.class === 'excellent' ? 'green' : p2Quality.class === 'good' ? 'blue' : p2Quality.class === 'average' ? 'gold' : 'red'}-light))`
                  }} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Card Info */}
        {cardData && (
          <Box mt={1} pt={1} borderTop="1px solid #e2e8f0">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Type:</strong> {cardData.type_line}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Set:</strong> {cardData.set_name} ({(cardData.set || 'unknown').toUpperCase()})
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Fade>
  )
}

export default ManaCostRow 