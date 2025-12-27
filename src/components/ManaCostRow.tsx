import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material'
import {
    Box,
    CircularProgress,
    Fade,
    Grid,
    LinearProgress,
    Paper,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { searchCardByName } from '../services/scryfall'
import type { Card as MTGCard } from '../types'
import { CardImageTooltip } from './CardImageTooltip'

interface ManaCostRowProps {
  cardName: string
  quantity: number
  deckSources?: Record<string, number>
  totalLands?: number
  totalCards?: number
}

// Keyrune mana symbol component
const KeyruneManaSymbol: React.FC<{ symbol: string; size?: number }> = ({ symbol, size = 18 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const symbolMap: Record<string, string> = {
    'W': 'w',
    'U': 'u',
    'B': 'b',
    'R': 'r',
    'G': 'g',
    'C': 'c',
    'S': 's',
    'X': 'x',
  };

  const cleanSymbol = symbol.replace(/[{}]/g, '');

  // Generic mana (numbers) - display as numbered circle
  if (/^\d+$/.test(cleanSymbol)) {
    const num = parseInt(cleanSymbol);
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: isDark ? '#4a4a4a' : '#CAC5C0',
          color: isDark ? '#e0e0e0' : '#333',
          fontSize: size * 0.55,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          border: `1px solid ${isDark ? '#666' : '#999'}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      >
        {num}
      </Box>
    );
  }

  // X cost
  if (cleanSymbol === 'X') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: isDark ? '#4a4a4a' : '#CAC5C0',
          color: isDark ? '#e0e0e0' : '#333',
          fontSize: size * 0.55,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          border: `1px solid ${isDark ? '#666' : '#999'}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      >
        X
      </Box>
    );
  }

  // Hybrid mana (e.g., "W/U", "2/W")
  if (cleanSymbol.includes('/')) {
    const parts = cleanSymbol.split('/');
    const firstPart = parts[0];
    const secondPart = parts[1];

    // Try to use the color part
    const colorPart = symbolMap[firstPart] || symbolMap[secondPart];
    if (colorPart) {
      return (
        <i
          className={`ms ms-${colorPart} ms-cost`}
          style={{
            fontSize: size,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          }}
        />
      );
    }
  }

  // Standard color symbols with Keyrune
  if (symbolMap[cleanSymbol]) {
    return (
      <i
        className={`ms ms-${symbolMap[cleanSymbol]} ms-cost`}
        style={{
          fontSize: size,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
        }}
      />
    );
  }

  // Fallback
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: '#888',
        color: '#fff',
        fontSize: size * 0.5,
        fontWeight: 'bold',
      }}
    >
      ?
    </Box>
  );
};

// Parse and render full mana cost string with Keyrune
const KeyruneManaCost: React.FC<{ manaCost: string; size?: number }> = memo(({ manaCost, size = 18 }) => {
  if (!manaCost) {
    return (
      <Typography variant="body2" color="text.secondary" component="span">
        No cost
      </Typography>
    );
  }

  const matches = manaCost.match(/\{[^}]+\}/g) || [];

  if (matches.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" component="span">
        {manaCost}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
      {matches.map((symbol, index) => (
        <KeyruneManaSymbol key={index} symbol={symbol} size={size} />
      ))}
    </Box>
  );
});

KeyruneManaCost.displayName = 'KeyruneManaCost';

// Probability calculation hook
const useProbabilityCalculation = (
  cardData: MTGCard | null,
  cardName: string,
  deckSources?: Record<string, number>,
  totalLands?: number,
  totalCards?: number
) => {
  return useMemo(() => {
    if (!cardData?.mana_cost && !cardName) {
      return { p1: 95, p2: 90 }
    }

    const actualManaCost = cardData?.mana_cost || getSimulatedManaCost(cardName)

    if (!actualManaCost) return { p1: 95, p2: 90 }

    try {
      const manaCostSymbols = actualManaCost.match(/\{[WUBRG]\}/g) || []
      const colorCounts: { [color: string]: number } = {}

      manaCostSymbols.forEach(symbol => {
        const color = symbol.replace(/[{}]/g, '')
        colorCounts[color] = (colorCounts[color] || 0) + 1
      })

      if (Object.keys(colorCounts).length === 0) {
        return { p1: 99, p2: 98 }
      }

      const deckSize = totalCards || 60
      const landsInDeck = totalLands || 24
      const cmc = cardData?.cmc || 2

      const hypergeometric = (N: number, K: number, n: number, k: number): number => {
        const combination = (a: number, b: number): number => {
          if (b > a || b < 0) return 0
          if (b === 0 || b === a) return 1

          let result = 1
          for (let i = 0; i < b; i++) {
            result = result * (a - i) / (i + 1)
          }
          return result
        }

        let probability = 0
        for (let i = k; i <= Math.min(n, K); i++) {
          probability += combination(K, i) * combination(N - K, n - i) / combination(N, n)
        }
        return probability
      }

      const turn = Math.max(1, Math.min(cmc, 10))
      const cardsSeen = 7 + (turn - 1)

      let p1Probability = 1

      for (const [color, symbolsNeeded] of Object.entries(colorCounts)) {
        const actualSourcesForColor = deckSources?.[color] || 0
        const realSources = actualSourcesForColor > 0 ? actualSourcesForColor : 0

        const p1Color = realSources > 0
          ? hypergeometric(landsInDeck, realSources, turn, symbolsNeeded)
          : 0
        p1Probability = Math.min(p1Probability, p1Color)
      }

      const probHavingEnoughLands = hypergeometric(deckSize, landsInDeck, cardsSeen, turn)
      const p2Probability = p1Probability * probHavingEnoughLands

      const finalP1 = Math.round(Math.max(Math.min(p1Probability * 100, 99), 0))
      const finalP2 = Math.round(Math.max(Math.min(p2Probability * 100, 99), 0))

      return {
        p1: finalP1,
        p2: finalP2
      }

    } catch (error) {
      console.error('Error calculating probabilities:', error)
      return { p1: 85, p2: 75 }
    }
  }, [cardData, cardName, deckSources, totalLands, totalCards])
}

// Helper function for simulated mana costs
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
    'Sol Ring': '{1}',
    'Mana Crypt': '{0}',
    'Birds of Paradise': '{G}',
    'Elvish Mystic': '{G}'
  }

  return commonCosts[cardName] || '{2}'
}

// Get color based on probability
const getProbabilityColor = (prob: number, theme: ReturnType<typeof useTheme>) => {
  if (prob >= 80) return theme.palette.success.main;
  if (prob >= 65) return theme.palette.info.main;
  if (prob >= 45) return theme.palette.warning.main;
  return theme.palette.error.main;
};

const ManaCostRow: React.FC<ManaCostRowProps> = memo(({
  cardName,
  quantity,
  deckSources,
  totalLands,
  totalCards
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [cardData, setCardData] = useState<MTGCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const probabilities = useProbabilityCalculation(cardData, cardName, deckSources, totalLands, totalCards)

  useEffect(() => {
    if (!cardName) return

    const fetchCardData = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await searchCardByName(cardName)
        setCardData(data)
      } catch (err) {
        setError('Failed to fetch card data')
        console.error('Error fetching card:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCardData()
  }, [cardName])

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 1.5 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" fontWeight="600">
              {quantity}x {cardName}
            </Typography>
          </Grid>
          <Grid item xs={4} display="flex" alignItems="center" gap={1}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" color="text.secondary">—</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" color="text.secondary">—</Typography>
          </Grid>
        </Grid>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, mb: 1.5, borderLeft: `3px solid ${theme.palette.error.main}` }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" fontWeight="600">
              {quantity}x {cardName}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="error">
              Card not found
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" color="text.secondary">—</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" color="text.secondary">—</Typography>
          </Grid>
        </Grid>
      </Paper>
    )
  }

  // Extract set code from card data
  const setCode = cardData?.set?.toUpperCase() || '';

  return (
    <Fade in={true} timeout={300}>
      <Paper
        sx={{
          p: 2,
          mb: 1.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      >
        {/* Row 1: Card name, mana cost, CMC, P1, P2 */}
        <Grid container alignItems="center" spacing={2}>
          {/* Card Name & Quantity */}
          <Grid item xs={12} md={4}>
            <CardImageTooltip cardName={cardData?.name || cardName}>
              <Box>
                <Typography
                  variant="body1"
                  fontWeight="600"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  {quantity}x {cardData?.name || cardName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cost: {cardData?.mana_cost || '—'}
                </Typography>
              </Box>
            </CardImageTooltip>
          </Grid>

          {/* Mana Cost with Keyrune + CMC */}
          <Grid item xs={4} md={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <KeyruneManaCost manaCost={cardData?.mana_cost || ''} size={20} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                }}
              >
                CMC: {cardData?.cmc || 0}
              </Typography>
            </Box>
          </Grid>

          {/* P1 (Perfect) with progress bar */}
          <Grid item xs={4} md={3}>
            <Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  P1 (Perfect):
                </Typography>
                <Tooltip title="Probability assuming you hit all land drops on curve" arrow>
                  <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }} />
                </Tooltip>
                <Box
                  sx={{
                    bgcolor: getProbabilityColor(probabilities.p1, theme),
                    color: '#fff',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    ml: 'auto',
                  }}
                >
                  {probabilities.p1}%
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={probabilities.p1}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: getProbabilityColor(probabilities.p1, theme),
                  },
                }}
              />
            </Box>
          </Grid>

          {/* P2 (Realistic) with progress bar */}
          <Grid item xs={4} md={3}>
            <Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  P2 (Realistic):
                </Typography>
                <Tooltip title="Realistic probability accounting for mana screw" arrow>
                  <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }} />
                </Tooltip>
                <Box
                  sx={{
                    bgcolor: getProbabilityColor(probabilities.p2, theme),
                    color: '#fff',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    ml: 'auto',
                  }}
                >
                  {probabilities.p2}%
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={probabilities.p2}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: getProbabilityColor(probabilities.p2, theme),
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Row 2: Type line and Set */}
        {(cardData?.type_line || setCode) && (
          <Box
            sx={{
              mt: 1.5,
              pt: 1.5,
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {cardData?.type_line && (
              <Typography variant="caption" color="text.secondary">
                Type: {cardData.type_line}
              </Typography>
            )}
            {setCode && (
              <Typography variant="caption" color="text.secondary">
                Set: {cardData?.set_name || setCode} ({setCode})
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Fade>
  )
})

ManaCostRow.displayName = 'ManaCostRow'

export default ManaCostRow
