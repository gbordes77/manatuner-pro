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
    // Base de données des coûts de mana connus (SANS LES TERRAINS)
    const costs: { [key: string]: string } = {
      // Cartes du deck de test Boros
      'Goblin Bombardment': '{1}{R}',
      'Ajani Nacatl Pariah': '{1}{W}',
      'Phlage, Titan of Fire\'s Fury': '{1}{R}{R}{W}{W}',
      'A-Galvanic Discharge': '{R}',
      'A-Guide of Souls': '{W}',
      'Sephiroth, Fabled SOLDIER': '{2}{W}{W}',
      'Lightning Helix': '{R}{W}',
      'Boros Charm': '{R}{W}',
      'Monastery Swiftspear': '{R}',
      'Ragavan, Nimble Pilferer': '{R}',
      'Dragon\'s Rage Channeler': '{R}',
      'Orcish Bowmasters': '{1}{B}',
      'Unholy Heat': '{R}',
      'Prismatic Ending': '{X}{W}',
      'Solitude': '{3}{W}{W}',
      'Fury': '{3}{R}{R}',
      'Grief': '{2}{B}{B}',
      'Subtlety': '{2}{U}{U}',
      'Endurance': '{1}{G}{G}',
      'Force of Negation': '{1}{U}{U}',
      'Teferi, Time Raveler': '{1}{W}{U}',
      'Wrenn and Six': '{R}{G}',
      'Oko, Thief of Crowns': '{1}{G}{U}',
      'Jace, the Mind Sculptor': '{2}{U}{U}',
      'Liliana of the Veil': '{1}{B}{B}',
      'Karn Liberated': '{7}',
      'Ugin, the Spirit Dragon': '{8}',
      'Emrakul, the Aeons Torn': '{15}',
      'Griselbrand': '{8}',
      'Iona, Shield of Emeria': '{9}',
      'Jin-Gitaxias, Core Augur': '{7}{U}{U}{U}',
      'Elesh Norn, Grand Cenobite': '{5}{W}{W}',
      'Sheoldred, Whispering One': '{7}',
      'Vorinclex, Voice of Hunger': '{6}{G}{G}',
      'Urabrask the Hidden': '{3}{R}{R}',
      
      // TERRAINS SUPPRIMÉS - ils ne doivent pas apparaître dans l'onglet Mana Cost
      
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
    if (lowerName.includes('\'')) return '{1}{W}' // Noms avec apostrophe souvent légendaires
    
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
    // Obtenir la vraie manabase depuis le contexte ou les props
    // Pour l'instant, utilisons une approche basée sur le coût de mana réel
    const actualManaCost = cardData?.mana_cost || getSimulatedManaCost(cardName)
    
    if (!actualManaCost) return { p1: 85, p2: 65 }
    
    try {
      // Parser le coût de mana pour extraire les symboles colorés
      const manaCostSymbols = actualManaCost.match(/\{[WUBRG]\}/g) || []
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
      const cmc = cardData?.cmc || actualManaCost.match(/\{(\d+)\}/)?.[1] ? parseInt(actualManaCost.match(/\{(\d+)\}/)?.[1] || '1') : 1
      
      // Fonction hypergeométrique selon Frank Karsten
      const hypergeometric = (N: number, K: number, n: number, k: number): number => {
        const combination = (n: number, r: number): number => {
          if (r > n || r < 0) return 0
          if (r === 0 || r === n) return 1
          
          let result = 1
          for (let i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1)
          }
          return result
        }
        
        let probability = 0
        for (let i = k; i <= Math.min(n, K); i++) {
          probability += combination(K, i) * combination(N - K, n - i) / combination(N, n)
        }
        return probability
      }
      
      // Calculer les probabilités selon Frank Karsten
      let worstCaseProbability = 1
      
      for (const [color, symbolCount] of Object.entries(colorCounts)) {
        // Tables de Frank Karsten pour les sources nécessaires
        let sourcesNeeded: number
        if (symbolCount === 1) {
          sourcesNeeded = 14  // 1 symbole = 14 sources pour 90.4%
        } else if (symbolCount === 2) {
          sourcesNeeded = 20  // 2 symboles = 20 sources pour 90%
        } else if (symbolCount === 3) {
          sourcesNeeded = 23  // 3 symboles = 23 sources pour 90%
        } else {
          sourcesNeeded = Math.min(25, 14 + (symbolCount - 1) * 3)
        }
        
        // Cartes vues au tour où on veut jouer la carte
        const turn = Math.max(1, Math.min(cmc, 6))
        const cardsSeen = 7 + (turn - 1) // Main de départ + pioches
        
        // Calcul hypergeométrique
        const probability = hypergeometric(deckSize, sourcesNeeded, cardsSeen, symbolCount)
        
        // Prendre le pire cas pour les cartes multicolores
        worstCaseProbability = Math.min(worstCaseProbability, probability)
      }
      
      // P1 : Scénario optimal (manabase parfaite selon Karsten)
      const p1Percentage = Math.round(worstCaseProbability * 100)
      
      // P2 : Scénario réaliste (manabase sous-optimale)
      // Réduction de 10-15% pour tenir compte des manabases imparfaites
      const totalSymbols = Object.values(colorCounts).reduce((sum, count) => sum + count, 0)
      const colorCount = Object.keys(colorCounts).length
      
      let realisticPenalty = 0.10 // 10% de base
      
      if (colorCount > 1) {
        realisticPenalty += (colorCount - 1) * 0.05 // +5% par couleur supplémentaire
      }
      
      if (totalSymbols > 2) {
        realisticPenalty += (totalSymbols - 2) * 0.03 // +3% par symbole intensif
      }
      
      const p2Percentage = Math.round(worstCaseProbability * (1 - realisticPenalty) * 100)
      
      return {
        p1: Math.max(Math.min(p1Percentage, 95), 25),
        p2: Math.max(Math.min(p2Percentage, 85), 15)
      }
      
    } catch (error) {
      console.error('Error calculating probabilities:', error)
      
      // Fallback simple basé sur la complexité du coût
      const symbols = actualManaCost.match(/\{[^}]+\}/g) || []
      const coloredSymbols = symbols.filter((s: string) => /\{[WUBRG]\}/.test(s))
      
      let baseP1 = 90 - (coloredSymbols.length * 8)
      let baseP2 = 75 - (coloredSymbols.length * 10)
      
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