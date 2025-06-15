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
import type { Card as MTGCard } from '../types'
import { manaCalculator } from '../services/manaCalculator'

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

  const getSimulatedManaCost = (cardName: string): string => {
    // Base de données étendue des coûts de mana
    const costs: Record<string, string> = {
      // Auras et enchantements
      'Light-Paws, Emperor\'s Voice': '{1}{W}',
      'Ethereal Armor': '{W}',
      'Sentinel\'s Eyes': '{1}{W}',
      'Shardmage\'s Rescue': '{W}',
      'Combat Research': '{U}',
      'Kaya\'s Ghostform': '{1}{B}',
      'Cartouche of Zeal': '{R}',
      'Sticky Fingers': '{R}',
      'Sheltered by Ghosts': '{1}{W}',
      'Demonic Ruckus': '{1}{R}',
      'Surge of Salvation': '{W}',
      'Wingspan Stride': '{1}{W}',
      
      // Créatures
      'Esper Sentinel': '{W}',
      'Giver of Runes': '{W}',
      'Kor Spiritdancer': '{1}{W}',
      
      // Sorts classiques
      'Lightning Bolt': '{R}',
      'Counterspell': '{U}{U}',
      'Swords to Plowshares': '{W}',
      'Path to Exile': '{W}',
      'Dark Ritual': '{B}',
      'Thoughtseize': '{B}',
      'Fatal Push': '{B}',
      'Brainstorm': '{U}',
      'Ponder': '{U}',
      
      // Multicolores
      'Lightning Helix': '{R}{W}',
      'Terminate': '{B}{R}',
      'Abrupt Decay': '{B}{G}',
      
      // Artefacts
      'Sol Ring': '{1}',
      'Sensei\'s Divining Top': '{1}',
      'Mox Ruby': '{0}',
      'Black Lotus': '{0}',
    }
    
    if (costs[cardName]) {
      return costs[cardName]
    }
    
    // Heuristiques basées sur le nom
    const lowerName = cardName.toLowerCase()
    if (lowerName.includes('bolt') || lowerName.includes('shock')) return '{R}'
    if (lowerName.includes('counter')) return '{U}{U}'
    if (lowerName.includes('swords') || lowerName.includes('path')) return '{W}'
    if (lowerName.includes('ritual') || lowerName.includes('dark')) return '{B}'
    if (lowerName.includes('elf') || lowerName.includes('birds')) return '{G}'
    if (lowerName.includes('armor') || lowerName.includes('aura')) return '{W}'
    if (lowerName.includes('rescue') || lowerName.includes('protection')) return '{W}'
    
    // Coût par défaut basé sur la complexité du nom
    if (cardName.length > 20) return '{2}{W}'
    if (cardName.includes('\'')) return '{1}{W}' // Noms avec apostrophe souvent légendaires
    
    return '{2}' // Défaut générique
  }

  const renderManaSymbols = (manaCost: string) => {
    // Si pas de mana cost de Scryfall, utiliser la simulation
    const actualManaCost = manaCost || getSimulatedManaCost(cardName)
    
    if (!actualManaCost) return <ManaSymbol symbol="2" />
    
    // Parse mana cost symbols like {W}{U}{B}{R}{G}{1}{2}{3}...
    const symbols = actualManaCost.match(/\{[^}]+\}/g) || []
    
    if (symbols.length === 0) {
      return <ManaSymbol symbol="2" />
    }
    
    return symbols.map((symbol, index) => (
      <ManaSymbol key={index} symbol={symbol} />
    ))
  }

  const calculateProbabilities = () => {
    if (!cardData?.mana_cost) return { p1: 85, p2: 65 }
    
    try {
      // Parser le coût de mana pour extraire les symboles colorés
      const manaCostSymbols = cardData.mana_cost.match(/\{[WUBRG]\}/g) || []
      const colorCounts: { [color: string]: number } = {}
      
      manaCostSymbols.forEach(symbol => {
        const color = symbol.replace(/[{}]/g, '')
        colorCounts[color] = (colorCounts[color] || 0) + 1
      })
      
      // Si pas de symboles colorés, retourner des probabilités élevées
      if (Object.keys(colorCounts).length === 0) {
        return { p1: 95, p2: 90 }
      }
      
      const deckSize = 60
      const cmc = cardData.cmc || 1
      
      // Calculer les probabilités selon Frank Karsten
      let worstCaseProbability = 1
      
      for (const [color, symbolCount] of Object.entries(colorCounts)) {
        // Utiliser les tables de Karsten pour déterminer les sources nécessaires
        const sourcesNeeded = manaCalculator.calculateManaProbability(
          deckSize,
          20, // Sources de base pour le calcul
          Math.min(cmc, 6), // Limiter à tour 6
          symbolCount,
          true
        ).sourcesNeeded
        
        // Simuler différents scénarios de manabase
        let probability = 0
        
        if (symbolCount === 1) {
          // Pour 1 symbole : 14 sources donnent ~90.4% au T1
          const optimalSources = Math.max(14, sourcesNeeded)
          probability = manaCalculator.calculateManaProbability(
            deckSize,
            optimalSources,
            Math.min(cmc, 6),
            symbolCount,
            true
          ).probability
        } else if (symbolCount === 2) {
          // Pour 2 symboles : 20 sources donnent ~90% au T2
          const optimalSources = Math.max(20, sourcesNeeded)
          probability = manaCalculator.calculateManaProbability(
            deckSize,
            optimalSources,
            Math.min(cmc, 6),
            symbolCount,
            true
          ).probability
        } else {
          // Pour 3+ symboles : ajuster selon la complexité
          const optimalSources = Math.max(22, sourcesNeeded)
          probability = manaCalculator.calculateManaProbability(
            deckSize,
            optimalSources,
            Math.min(cmc, 6),
            symbolCount,
            true
          ).probability
        }
        
        // Prendre le pire cas pour les cartes multicolores
        worstCaseProbability = Math.min(worstCaseProbability, probability)
      }
      
      // Ajustements pour P1 (Perfect) vs P2 (Realistic)
      const baseProbability = worstCaseProbability
      
      // P1 : Scénario optimal (manabase parfaite)
      const p1Percentage = Math.round(Math.min(baseProbability * 100, 95))
      
      // P2 : Scénario réaliste (manabase moyenne, pénalités)
      let p2Percentage = Math.round(baseProbability * 85) // 15% de pénalité pour réalisme
      
      // Ajustements selon la complexité du coût
      const totalSymbols = Object.values(colorCounts).reduce((sum, count) => sum + count, 0)
      const colorCount = Object.keys(colorCounts).length
      
      if (colorCount > 1) {
        // Pénalité pour cartes multicolores
        p2Percentage -= (colorCount - 1) * 5
      }
      
      if (totalSymbols > 2) {
        // Pénalité pour coûts intensifs
        p2Percentage -= (totalSymbols - 2) * 3
      }
      
      // Ajustement selon le CMC
      if (cmc <= 2) {
        p2Percentage -= 5 // Plus difficile de cast tôt
      }
      
      return {
        p1: Math.max(Math.min(p1Percentage, 95), 25),
        p2: Math.max(Math.min(p2Percentage, 85), 15)
      }
      
    } catch (error) {
      console.error('Error calculating probabilities:', error)
      
      // Fallback amélioré basé sur l'analyse du coût de mana
      if (!cardData?.mana_cost) return { p1: 85, p2: 65 }
      
      const symbols = cardData.mana_cost.match(/\{[^}]+\}/g) || []
      const coloredSymbols = symbols.filter((s: string) => /\{[WUBRG]\}/.test(s))
      const hybridSymbols = symbols.filter((s: string) => /\{[WUBRG]\/[WUBRG]\}/.test(s))
      const genericCost = symbols.filter((s: string) => /\{\d+\}/.test(s)).length
      
      // Calcul basé sur la complexité
      let baseP1 = 90
      let baseP2 = 75
      
      // Pénalités
      baseP1 -= coloredSymbols.length * 4
      baseP2 -= coloredSymbols.length * 6
      
      baseP1 -= hybridSymbols.length * 2 // Hybride plus facile
      baseP2 -= hybridSymbols.length * 3
      
      baseP1 -= genericCost * 2
      baseP2 -= genericCost * 3
      
      // Bonus pour CMC élevé (plus de temps pour développer)
      if (cardData.cmc && cardData.cmc >= 4) {
        baseP1 += 5
        baseP2 += 8
      }
      
      return {
        p1: Math.max(Math.min(baseP1, 95), 25),
        p2: Math.max(Math.min(baseP2, 85), 15)
      }
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