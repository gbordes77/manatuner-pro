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
import type { Theme } from '@mui/material/styles'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { computeAcceleratedCastability } from '../services/castability'
import { searchCardByName } from '../services/scryfall'
import type { Card as MTGCard } from '../types'
import type { AccelContext, DeckManaProfile, ManaCost, ProducerInDeck } from '../types/manaProducers'
import { CardImageTooltip } from './CardImageTooltip'
import { SegmentedProbabilityBar } from './SegmentedProbabilityBar'

interface ManaCostRowProps {
  cardName: string
  quantity: number
  deckSources?: Record<string, number>
  totalLands?: number
  totalCards?: number
  /** Mana producers in the deck */
  producers?: ProducerInDeck[]
  /** Acceleration context settings */
  accelContext?: {
    playDraw: 'PLAY' | 'DRAW'
    removalRate: number
    defaultRockSurvival: number
  }
  /** Whether to show acceleration data */
  showAcceleration?: boolean
  /** Bonus mana from multi-mana lands (Ancient Tomb, etc.) */
  bonusManaFromLands?: number
  /** Bonus colored mana from multi-mana lands */
  bonusColoredMana?: Partial<Record<string, number>>
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
  // Keyrune icons render larger than their fontSize, so we scale up generic symbols to match
  const scaledSize = size * 1.2;

  if (/^\d+$/.test(cleanSymbol)) {
    const num = parseInt(cleanSymbol);
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: scaledSize,
          height: scaledSize,
          borderRadius: '50%',
          bgcolor: isDark ? '#4a4a4a' : '#CAC5C0',
          color: isDark ? '#e0e0e0' : '#333',
          fontSize: scaledSize * 0.55,
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
          width: scaledSize,
          height: scaledSize,
          borderRadius: '50%',
          bgcolor: isDark ? '#4a4a4a' : '#CAC5C0',
          color: isDark ? '#e0e0e0' : '#333',
          fontSize: scaledSize * 0.55,
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

// Helper to get mana cost from card data, handling DFCs (double-faced cards)
const getManaCostFromCard = (cardData: MTGCard | null): string | null => {
  if (!cardData) return null

  // If card has a direct mana_cost, use it
  if (cardData.mana_cost) return cardData.mana_cost

  // For DFCs (transform, modal_dfc, etc.), get mana cost from front face
  if (cardData.card_faces && cardData.card_faces.length > 0) {
    const frontFace = cardData.card_faces[0]
    if (frontFace.mana_cost) return frontFace.mana_cost
  }

  return null
}

// Helper to get CMC from card data, handling DFCs
const getCmcFromCard = (cardData: MTGCard | null): number => {
  if (!cardData) return 0

  // CMC is usually at root level even for DFCs
  if (cardData.cmc !== undefined) return cardData.cmc

  // Fallback: calculate from mana cost if needed
  const manaCost = getManaCostFromCard(cardData)
  if (manaCost) {
    let cmc = 0
    const symbols = manaCost.match(/\{[^}]+\}/g) || []
    symbols.forEach(symbol => {
      const clean = symbol.replace(/[{}]/g, '')
      if (/^\d+$/.test(clean)) {
        cmc += parseInt(clean)
      } else if (clean !== 'X') {
        cmc += 1 // Each colored/hybrid symbol adds 1
      }
    })
    return cmc
  }

  return 0
}

// Check if card has X in mana cost and return X count
const getXCountFromManaCost = (manaCost: string | null): number => {
  if (!manaCost) return 0
  const xMatches = manaCost.match(/\{X\}/g) || []
  return xMatches.length
}

// Get the fixed (non-X) portion of CMC
const getFixedCmcFromManaCost = (manaCost: string | null): number => {
  if (!manaCost) return 0
  let cmc = 0
  const symbols = manaCost.match(/\{[^}]+\}/g) || []
  symbols.forEach(symbol => {
    const clean = symbol.replace(/[{}]/g, '')
    if (/^\d+$/.test(clean)) {
      cmc += parseInt(clean)
    } else if (clean !== 'X') {
      cmc += 1 // Each colored/hybrid symbol adds 1
    }
  })
  return cmc
}

// Calculate effective X value based on target turn
const calculateEffectiveX = (fixedCmc: number, xCount: number): { xValue: number; targetTurn: number } => {
  // We want X to be at least 1 to make the spell worthwhile
  // Target turn = fixed CMC + X (we use X=2 as a reasonable default for "useful" X spells)
  const minUsefulX = 1
  const reasonableX = 2
  const xValue = Math.max(minUsefulX, reasonableX)
  const targetTurn = fixedCmc + (xValue * xCount)
  return { xValue, targetTurn }
}

// Probability calculation hook
const useProbabilityCalculation = (
  cardData: MTGCard | null,
  cardName: string,
  deckSources?: Record<string, number>,
  totalLands?: number,
  totalCards?: number
) => {
  return useMemo(() => {
    if (!cardData?.mana_cost && !cardData?.card_faces && !cardName) {
      return { p1: 95, p2: 90, hasX: false, xInfo: null }
    }

    const actualManaCost = getManaCostFromCard(cardData) || getSimulatedManaCost(cardName)

    if (!actualManaCost) return { p1: 95, p2: 90, hasX: false, xInfo: null }

    try {
      // Check for X in mana cost
      const xCount = getXCountFromManaCost(actualManaCost)
      const hasX = xCount > 0
      const fixedCmc = getFixedCmcFromManaCost(actualManaCost)

      let xInfo: { xValue: number; targetTurn: number; fixedCost: string } | null = null
      if (hasX) {
        const { xValue, targetTurn } = calculateEffectiveX(fixedCmc, xCount)
        // Extract the fixed colored portion for the tooltip
        const colorSymbols = actualManaCost.replace(/\{X\}/g, '').replace(/\{\d+\}/g, '').trim()
        xInfo = { xValue, targetTurn, fixedCost: colorSymbols || 'colorless' }
      }

      // Match regular mana symbols like {W}, {U}, etc.
      const manaCostSymbols = actualManaCost.match(/\{[WUBRG]\}/g) || []
      // Match hybrid mana symbols like {W/R}, {U/B}, etc.
      const hybridSymbols = actualManaCost.match(/\{([WUBRG])\/([WUBRG])\}/g) || []

      const colorCounts: { [color: string]: number } = {}
      // Track hybrid mana separately - each hybrid can be paid by either color
      const hybridMana: Array<{ color1: string; color2: string }> = []

      manaCostSymbols.forEach(symbol => {
        const color = symbol.replace(/[{}]/g, '')
        colorCounts[color] = (colorCounts[color] || 0) + 1
      })

      // Parse hybrid symbols
      hybridSymbols.forEach(symbol => {
        const match = symbol.match(/\{([WUBRG])\/([WUBRG])\}/)
        if (match) {
          hybridMana.push({ color1: match[1], color2: match[2] })
        }
      })

      // If no regular colors AND no hybrid, it's colorless
      if (Object.keys(colorCounts).length === 0 && hybridMana.length === 0) {
        return { p1: 99, p2: 98, hasX, xInfo }
      }

      const deckSize = totalCards || 60
      const landsInDeck = totalLands || 24

      // For X spells, use the effective turn (fixed cost + X value)
      // For regular spells, use CMC
      const baseCmc = getCmcFromCard(cardData) || 2
      const effectiveCmc = hasX && xInfo ? xInfo.targetTurn : baseCmc

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

      const turn = Math.max(1, Math.min(effectiveCmc, 10))
      const cardsSeen = 7 + (turn - 1)

      let p1Probability = 1

      // Calculate probability for regular (non-hybrid) color requirements
      for (const [color, symbolsNeeded] of Object.entries(colorCounts)) {
        const actualSourcesForColor = deckSources?.[color] || 0
        const realSources = actualSourcesForColor > 0 ? actualSourcesForColor : 0

        const p1Color = realSources > 0
          ? hypergeometric(landsInDeck, realSources, turn, symbolsNeeded)
          : 0
        p1Probability = Math.min(p1Probability, p1Color)
      }

      // Calculate probability for hybrid mana - use the BETTER of the two colors
      for (const hybrid of hybridMana) {
        const sources1 = deckSources?.[hybrid.color1] || 0
        const sources2 = deckSources?.[hybrid.color2] || 0

        const p1Color1 = sources1 > 0
          ? hypergeometric(landsInDeck, sources1, turn, 1)
          : 0
        const p1Color2 = sources2 > 0
          ? hypergeometric(landsInDeck, sources2, turn, 1)
          : 0

        // For hybrid, take the MAX (best option) since player can choose
        const p1Hybrid = Math.max(p1Color1, p1Color2)
        p1Probability = Math.min(p1Probability, p1Hybrid)
      }

      const probHavingEnoughLands = hypergeometric(deckSize, landsInDeck, cardsSeen, turn)
      const p2Probability = p1Probability * probHavingEnoughLands

      const finalP1 = Math.round(Math.max(Math.min(p1Probability * 100, 99), 0))
      const finalP2 = Math.round(Math.max(Math.min(p2Probability * 100, 99), 0))

      return {
        p1: finalP1,
        p2: finalP2,
        hasX,
        xInfo
      }

    } catch (error) {
      console.error('Error calculating probabilities:', error)
      return { p1: 85, p2: 75, hasX: false, xInfo: null }
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
const getProbabilityColor = (prob: number, theme: Theme) => {
  if (prob >= 80) return theme.palette.success.main;
  if (prob >= 65) return theme.palette.info.main;
  if (prob >= 45) return theme.palette.warning.main;
  return theme.palette.error.main;
};

// Hook for accelerated castability calculation
const useAcceleratedCastability = (
  cardData: MTGCard | null,
  cardName: string,
  baseProbability: number,
  deckSources?: Record<string, number>,
  totalLands?: number,
  totalCards?: number,
  producers?: ProducerInDeck[],
  accelContext?: ManaCostRowProps['accelContext'],
  showAcceleration?: boolean,
  bonusManaFromLands?: number,
  bonusColoredMana?: Partial<Record<string, number>>
) => {
  return useMemo(() => {
    // Return null if acceleration is disabled or no producers
    if (!showAcceleration || !producers || producers.length === 0 || !accelContext) {
      return null
    }

    const manaCost = getManaCostFromCard(cardData) || getSimulatedManaCost(cardName)
    if (!manaCost) return null

    try {
      // Parse mana cost into ManaCost format
      const colorCounts: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 }
      let generic = 0

      const symbols = manaCost.match(/\{[^}]+\}/g) || []
      symbols.forEach(symbol => {
        const clean = symbol.replace(/[{}]/g, '')
        if (/^\d+$/.test(clean)) {
          generic += parseInt(clean)
        } else if (clean === 'X') {
          // For X spells, assume X=2 for calculation
          generic += 2
        } else if (['W', 'U', 'B', 'R', 'G'].includes(clean)) {
          colorCounts[clean]++
        } else if (clean.includes('/')) {
          // Hybrid - count as needing one of either color
          const parts = clean.split('/')
          const colorPart = parts.find(p => ['W', 'U', 'B', 'R', 'G'].includes(p))
          if (colorPart) colorCounts[colorPart]++
        }
      })

      const totalPips = Object.values(colorCounts).reduce((a, b) => a + b, 0)
      const spellCost: ManaCost = {
        mv: getCmcFromCard(cardData) || (generic + totalPips),
        generic,
        pips: {
          W: colorCounts.W || undefined,
          U: colorCounts.U || undefined,
          B: colorCounts.B || undefined,
          R: colorCounts.R || undefined,
          G: colorCounts.G || undefined
        }
      }

      // Build deck mana profile from sources (including multi-mana land bonuses)
      const deckProfile: DeckManaProfile = {
        deckSize: totalCards || 60,
        totalLands: totalLands || 24,
        landColorSources: {
          W: deckSources?.W || 0,
          U: deckSources?.U || 0,
          B: deckSources?.B || 0,
          R: deckSources?.R || 0,
          G: deckSources?.G || 0,
          C: deckSources?.C || 0
        },
        // Include bonus mana from multi-mana lands (Ancient Tomb, Bounce lands, etc.)
        bonusManaFromLands: bonusManaFromLands || 0,
        bonusColoredMana: bonusColoredMana ? {
          W: bonusColoredMana.W || 0,
          U: bonusColoredMana.U || 0,
          B: bonusColoredMana.B || 0,
          R: bonusColoredMana.R || 0,
          G: bonusColoredMana.G || 0,
          C: bonusColoredMana.C || 0
        } : undefined
      }

      // Build acceleration context
      const ctx: AccelContext = {
        playDraw: accelContext.playDraw,
        removalRate: accelContext.removalRate,
        defaultRockSurvival: accelContext.defaultRockSurvival
      }

      // Compute accelerated castability
      const result = computeAcceleratedCastability(
        deckProfile,
        spellCost,
        producers,
        ctx
      )

      return result
    } catch (error) {
      console.error('Error calculating accelerated castability:', error)
      return null
    }
  }, [cardData, cardName, baseProbability, deckSources, totalLands, totalCards, producers, accelContext, showAcceleration, bonusManaFromLands, bonusColoredMana])
}

const ManaCostRow: React.FC<ManaCostRowProps> = memo(({
  cardName,
  quantity,
  deckSources,
  totalLands,
  totalCards,
  producers,
  accelContext,
  showAcceleration = false,
  bonusManaFromLands,
  bonusColoredMana
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [cardData, setCardData] = useState<MTGCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const probabilities = useProbabilityCalculation(cardData, cardName, deckSources, totalLands, totalCards)

  // Calculate accelerated castability if enabled (includes multi-mana land bonuses)
  const acceleratedResult = useAcceleratedCastability(
    cardData,
    cardName,
    probabilities.p2,
    deckSources,
    totalLands,
    totalCards,
    producers,
    accelContext,
    showAcceleration,
    bonusManaFromLands,
    bonusColoredMana
  )

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
                  Cost: {getManaCostFromCard(cardData) || '—'}
                </Typography>
              </Box>
            </CardImageTooltip>
          </Grid>

          {/* Mana Cost with Keyrune + CMC */}
          <Grid item xs={4} md={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <KeyruneManaCost manaCost={getManaCostFromCard(cardData) || ''} size={20} />
              {probabilities.hasX && probabilities.xInfo ? (
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Variable Cost (X spell)
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                        This spell has X in its cost. We calculate castability assuming you want a meaningful X value.
                      </Typography>
                      <Typography variant="caption" component="div">
                        • Fixed cost: {probabilities.xInfo.fixedCost}
                      </Typography>
                      <Typography variant="caption" component="div">
                        • Calculated with X = {probabilities.xInfo.xValue}
                      </Typography>
                      <Typography variant="caption" component="div">
                        • Target turn: {probabilities.xInfo.targetTurn}
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ mt: 1, fontStyle: 'italic' }}>
                        At turn {probabilities.xInfo.targetTurn}, you'd have {probabilities.xInfo.targetTurn} mana, spending {getFixedCmcFromManaCost(getManaCostFromCard(cardData))} on fixed costs and {probabilities.xInfo.xValue} on X.
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box display="flex" alignItems="center" gap={0.5}>
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
                      CMC: {getFixedCmcFromManaCost(getManaCostFromCard(cardData))}+X
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: theme.palette.warning.main,
                        color: '#fff',
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        cursor: 'help',
                      }}
                    >
                      X={probabilities.xInfo.xValue}
                    </Box>
                  </Box>
                </Tooltip>
              ) : (
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
                  CMC: {getCmcFromCard(cardData)}
                </Typography>
              )}
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

          {/* P2 (Realistic) with progress bar - uses SegmentedProbabilityBar when acceleration enabled */}
          <Grid item xs={4} md={3}>
            {showAcceleration && acceleratedResult ? (
              <SegmentedProbabilityBar
                baseProbability={Math.round(acceleratedResult.base.p2 * 100)}
                totalProbability={Math.round(acceleratedResult.withAcceleration.p2 * 100)}
                height={6}
                showLabels={true}
                label="P2 (w/ Ramp):"
                tooltipContent={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Accelerated Castability
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                      Probability accounting for mana acceleration (dorks, rocks, rituals).
                    </Typography>
                    <Typography variant="caption" component="div">
                      • Lands only: {Math.round(acceleratedResult.base.p2 * 100)}%
                    </Typography>
                    <Typography variant="caption" component="div">
                      • With ramp: {Math.round(acceleratedResult.withAcceleration.p2 * 100)}%
                    </Typography>
                    <Typography variant="caption" component="div">
                      • Bonus: +{Math.round(acceleratedResult.accelerationImpact * 100)}%
                    </Typography>
                    {acceleratedResult.acceleratedTurn !== null && (
                      <Typography variant="caption" component="div" sx={{ mt: 1, color: 'success.light' }}>
                        Accelerated turn: {acceleratedResult.acceleratedTurn}
                      </Typography>
                    )}
                  </Box>
                }
              />
            ) : (
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
            )}
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
