import React, { useState, useEffect, useMemo, memo } from 'react'
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
import { ManaSymbol as LegalManaSymbol, ManaSequence } from './common/ManaSymbols'

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

// Parse Scryfall mana cost et crée une séquence pour nos symboles légaux
const parseManaCostToSymbols = (manaCost: string): Array<'W' | 'U' | 'B' | 'R' | 'G' | 'C'> => {
  if (!manaCost) return [];
  
  const sequence: Array<'W' | 'U' | 'B' | 'R' | 'G' | 'C'> = [];
  const matches = manaCost.match(/\{[^}]+\}/g) || [];
  
  matches.forEach(symbol => {
    const cleanSymbol = symbol.replace(/[{}]/g, '');
    
    if (['W', 'U', 'B', 'R', 'G'].includes(cleanSymbol)) {
      sequence.push(cleanSymbol as 'W' | 'U' | 'B' | 'R' | 'G');
    } else if (/^\d+$/.test(cleanSymbol)) {
      // Pour les coûts génériques, ajouter des symboles colorless
      const count = parseInt(cleanSymbol);
      for (let i = 0; i < count; i++) {
        sequence.push('C');
      }
    } else if (cleanSymbol === 'X') {
      sequence.push('C'); // X compte comme colorless
    }
  });
  
  return sequence;
};

// Composant amélioré avec nos symboles légaux
const ScryfallManaSymbols = memo(({ manaCost }: { manaCost: string }) => {
  const symbols = useMemo(() => parseManaCostToSymbols(manaCost), [manaCost]);
  
  if (symbols.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" component="span">
        No cost
      </Typography>
    );
  }
  
  return <ManaSequence sequence={symbols} size="small" />;
});

// Memoized mana symbols renderer (legacy pour compatibilité)
const ManaSymbols = memo(({ manaCost }: { manaCost: string }) => {
  // Utiliser nos nouveaux symboles légaux
  return <ScryfallManaSymbols manaCost={manaCost} />;
})

ScryfallManaSymbols.displayName = 'ScryfallManaSymbols'
ManaSymbols.displayName = 'ManaSymbols'

// Memoized probability calculator
const useProbabilityCalculation = (cardData: MTGCard | null, cardName: string) => {
  return useMemo(() => {
    if (!cardData?.mana_cost && !cardName) {
      return { p1: 85, p2: 65 }
    }

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
      
      const baseP1 = 90 - (coloredSymbols.length * 8)
      const baseP2 = 75 - (coloredSymbols.length * 10)
      
      return {
        p1: Math.max(Math.min(baseP1, 95), 25),
        p2: Math.max(Math.min(baseP2, 85), 15)
      }
    }
  }, [cardData, cardName])
}

// Fonction helper pour simuler les coûts de mana
const getSimulatedManaCost = (cardName: string): string => {
  const commonCosts: { [key: string]: string } = {
    'Lightning Bolt': '{R}',
    'Counterspell': '{U}{U}',
    'Dark Ritual': '{B}',
    'Swords to Plowshares': '{W}',
    'Giant Growth': '{G}',
    'Shock': '{R}',
    'Duress': '{B}',
    'Brainstorm': '{U}',
    'Path to Exile': '{W}',
    'Llanowar Elves': '{G}',
    'Lightning Strike': '{1}{R}',
    'Cancel': '{1}{U}{U}',
    'Murder': '{1}{B}{B}',
    'Pacifism': '{1}{W}',
    'Rampant Growth': '{1}{G}',
    'Mana Leak': '{1}{U}',
    'Doom Blade': '{1}{B}',
    'Disenchant': '{1}{W}',
    'Naturalize': '{1}{G}',
    'Lightning Helix': '{R}{W}',
    'Terminate': '{B}{R}',
    'Abrupt Decay': '{B}{G}',
    'Boros Charm': '{R}{W}',
    'Dreadbore': '{B}{R}',
    'Supreme Verdict': '{1}{W}{W}{U}',
    'Cryptic Command': '{1}{U}{U}{U}',
    'Force of Will': '{3}{U}{U}',
    'Tarmogoyf': '{1}{G}',
    'Snapcaster Mage': '{1}{U}',
    'Dark Confidant': '{1}{B}',
    'Noble Hierarch': '{G}',
    'Deathrite Shaman': '{B/G}',
    'Thoughtseize': '{B}',
    'Inquisition of Kozilek': '{B}',
    'Spell Pierce': '{U}',
    'Fatal Push': '{B}',
    'Opt': '{U}',
    'Serum Visions': '{U}',
    'Preordain': '{U}',
    'Ponder': '{U}',
    'Mishra\'s Bauble': '{0}',
    'Ornithopter': '{0}',
    'Mox Opal': '{0}',
    'Chrome Mox': '{0}',
    'Lotus Petal': '{0}',
    'Ancestral Recall': '{U}',
    'Black Lotus': '{0}',
    'Time Walk': '{1}{U}',
    'Mox Pearl': '{0}',
    'Mox Ruby': '{0}',
    'Mox Sapphire': '{0}',
    'Mox Jet': '{0}',
    'Mox Emerald': '{0}',
    'Sol Ring': '{1}',
    'Mana Crypt': '{0}',
    'Birds of Paradise': '{G}',
    'Elvish Mystic': '{G}'
  }
  
  return commonCosts[cardName] || '{2}'
}

// Memoized quality chip component
const QualityChip = memo(({ probability }: { probability: number }) => {
  const chipData = useMemo(() => {
    if (probability >= 80) return { label: 'Excellent', class: 'excellent' }
    if (probability >= 65) return { label: 'Good', class: 'good' }
    if (probability >= 45) return { label: 'Average', class: 'average' }
    return { label: 'Poor', class: 'poor' }
  }, [probability])

  return (
    <Chip 
      label={`${probability}%`}
      size="small"
      className={`mtg-chip ${chipData.class}`}
    />
  )
})

QualityChip.displayName = 'QualityChip'

const ManaCostRow: React.FC<ManaCostRowProps> = memo(({ cardName, quantity }) => {
  const [cardData, setCardData] = useState<MTGCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized probability calculation
  const probabilities = useProbabilityCalculation(cardData, cardName)

  useEffect(() => {
    if (!cardName) return

    const fetchCardData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log(`🔍 Recherche Scryfall pour: "${cardName}"`)
        const data = await searchCardByName(cardName)
        console.log(`📋 Résultat Scryfall:`, data)
        setCardData(data)
        
        if (!data) {
          console.warn(`⚠️ Aucune donnée trouvée pour: "${cardName}"`)
        }
      } catch (err) {
        setError('Failed to fetch card data')
        console.error('❌ Erreur lors de la récupération des données de carte:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCardData()
  }, [cardName])

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
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight="600"
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { color: 'var(--mtg-blue)' }
                  }}
                >
                  {quantity}x {cardData?.name || cardName}
                </Typography>
                {cardData?.mana_cost && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Cost: {cardData.mana_cost}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          </Grid>

          {/* Mana Cost */}
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
              <ManaSymbols manaCost={cardData?.mana_cost || ''} />
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
                <QualityChip probability={probabilities.p1} />
              </Box>
              <Box className="mtg-progress" sx={{ height: 6 }}>
                <Box 
                  className="mtg-progress-bar" 
                  sx={{ 
                    width: `${probabilities.p1}%`,
                    background: `linear-gradient(90deg, var(--mtg-${probabilities.p1 >= 80 ? 'green' : probabilities.p1 >= 65 ? 'blue' : probabilities.p1 >= 45 ? 'gold' : 'red'}), var(--mtg-${probabilities.p1 >= 80 ? 'green' : probabilities.p1 >= 65 ? 'blue' : probabilities.p1 >= 45 ? 'gold' : 'red'}-light))`
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
                <QualityChip probability={probabilities.p2} />
              </Box>
              <Box className="mtg-progress" sx={{ height: 6 }}>
                <Box 
                  className="mtg-progress-bar" 
                  sx={{ 
                    width: `${probabilities.p2}%`,
                    background: `linear-gradient(90deg, var(--mtg-${probabilities.p2 >= 80 ? 'green' : probabilities.p2 >= 65 ? 'blue' : probabilities.p2 >= 45 ? 'gold' : 'red'}), var(--mtg-${probabilities.p2 >= 80 ? 'green' : probabilities.p2 >= 65 ? 'blue' : probabilities.p2 >= 45 ? 'gold' : 'red'}-light))`
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
})

ManaCostRow.displayName = 'ManaCostRow'

export default ManaCostRow 