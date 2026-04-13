import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import {
  Box,
  CircularProgress,
  Fade,
  Grid,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import type { Theme } from '@mui/material/styles'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { computeAcceleratedCastability } from '../services/castability'
import { hypergeom, cardsSeenByTurn } from '../services/castability/hypergeom'
import { searchCardByName } from '../services/scryfall'
import type { Card as MTGCard } from '../types'
import type {
  AccelContext,
  DeckManaProfile,
  ProducerManaCost,
  ProducerInDeck,
} from '../types/manaProducers'
import { CardImageTooltip } from './CardImageTooltip'
import { SegmentedProbabilityBar } from './SegmentedProbabilityBar'

/** v1.1: Unconditional multi-mana land group */
interface UnconditionalMultiManaGroup {
  count: number
  delta: number
  producesMask?: number
}

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
  /** v1.1: Unconditional multi-mana lands (Ancient Tomb, Bounce lands, etc.) */
  unconditionalMultiMana?: UnconditionalMultiManaGroup
  /** Pre-fetched card data to avoid N+1 Scryfall calls */
  initialCardData?: MTGCard | null
  /**
   * Whether this card is a creature spell.
   * When true, lands like Cavern of Souls count as colored sources (via creatureOnlyExtraSources).
   */
  isCreature?: boolean
  /**
   * Extra colored sources available only for creature spells (from lands like Cavern of Souls).
   * Added to deckSources when isCreature is true.
   */
  creatureOnlyExtraSources?: Record<string, number>
}

// Keyrune mana symbol component
const KeyruneManaSymbol: React.FC<{ symbol: string; size?: number }> = ({ symbol, size = 18 }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const symbolMap: Record<string, string> = {
    W: 'w',
    U: 'u',
    B: 'b',
    R: 'r',
    G: 'g',
    C: 'c',
    S: 's',
    X: 'x',
  }

  const cleanSymbol = symbol.replace(/[{}]/g, '')

  // Generic mana (numbers) - display as numbered circle
  // Keyrune icons render larger than their fontSize, so we scale up generic symbols to match
  const scaledSize = size * 1.2

  if (/^\d+$/.test(cleanSymbol)) {
    const num = parseInt(cleanSymbol)
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
    )
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
    )
  }

  // Hybrid mana (e.g., "R/G", "W/U", "2/W")
  // mana-font supports hybrid symbols: ms-rg, ms-wu, ms-2w, etc.
  // Hybrid rendering uses ::before/::after pseudo-elements with position: absolute,
  // so the element needs proper sizing and overflow: visible.
  if (cleanSymbol.includes('/')) {
    const parts = cleanSymbol.split('/')
    // Build hybrid class: lowercase both parts joined (e.g., "R/G" → "rg", "2/W" → "2w")
    const hybridClass = parts.map((p) => p.toLowerCase()).join('')
    return (
      <i
        className={`ms ms-${hybridClass} ms-cost ms-shadow`}
        style={{
          fontSize: size,
          overflow: 'visible',
        }}
      />
    )
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
    )
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
  )
}

// Parse and render full mana cost string with Keyrune
const KeyruneManaCost: React.FC<{ manaCost: string; size?: number }> = memo(
  ({ manaCost, size = 18 }) => {
    if (!manaCost) {
      return (
        <Typography variant="body2" color="text.secondary" component="span">
          No cost
        </Typography>
      )
    }

    const matches = manaCost.match(/\{[^}]+\}/g) || []

    if (matches.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" component="span">
          {manaCost}
        </Typography>
      )
    }

    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
        {matches.map((symbol, index) => (
          <KeyruneManaSymbol key={index} symbol={symbol} size={size} />
        ))}
      </Box>
    )
  }
)

KeyruneManaCost.displayName = 'KeyruneManaCost'

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
    symbols.forEach((symbol) => {
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
  symbols.forEach((symbol) => {
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
const calculateEffectiveX = (
  fixedCmc: number,
  xCount: number
): { xValue: number; targetTurn: number } => {
  // We want X to be at least 1 to make the spell worthwhile
  // Target turn = fixed CMC + X (we use X=2 as a reasonable default for "useful" X spells)
  const minUsefulX = 1
  const reasonableX = 2
  const xValue = Math.max(minUsefulX, reasonableX)
  const targetTurn = fixedCmc + xValue * xCount
  return { xValue, targetTurn }
}

// Probability calculation hook
const useProbabilityCalculation = (
  cardData: MTGCard | null,
  cardName: string,
  deckSources?: Record<string, number>,
  totalLands?: number,
  totalCards?: number,
  playDraw: 'PLAY' | 'DRAW' = 'PLAY'
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
        const colorSymbols = actualManaCost
          .replace(/\{X\}/g, '')
          .replace(/\{\d+\}/g, '')
          .trim()
        xInfo = { xValue, targetTurn, fixedCost: colorSymbols || 'colorless' }
      }

      // Match regular colored symbols {W}/{U}/{B}/{R}/{G}
      const manaCostSymbols = actualManaCost.match(/\{[WUBRG]\}/g) || []
      // Match hybrid mana: pure hybrid {W/U}, twobrid {2/W}, and Phyrexian {W/P}
      // - pure hybrid: either color pays the pip
      // - twobrid: 2 generic OR 1 colored — treat as hybrid-colored-or-generic
      // - phyrexian: 2 life OR 1 colored — always payable, treat as colored if
      //   the color is available, otherwise as life (effectively colorless)
      const hybridSymbols = actualManaCost.match(/\{[^}]+\/[^}]+\}/g) || []
      // Match colorless {C} (Eldrazi, Tron, Post, Kozilek). Different from
      // generic {2}: {C} REQUIRES a colorless mana source (usually a wastes
      // or utility land), it cannot be paid with any colored mana.
      const colorlessSymbols = actualManaCost.match(/\{C\}/g) || []

      const colorCounts: { [color: string]: number } = {}
      // Track hybrid mana separately - each hybrid can be paid by either color
      const hybridMana: Array<{ color1: string; color2: string }> = []

      manaCostSymbols.forEach((symbol) => {
        const color = symbol.replace(/[{}]/g, '')
        colorCounts[color] = (colorCounts[color] || 0) + 1
      })

      // Parse hybrid symbols (pure hybrid, twobrid, phyrexian)
      hybridSymbols.forEach((symbol) => {
        const inner = symbol.slice(1, -1) // strip braces
        const parts = inner.split('/')
        if (parts.length !== 2) return
        const [left, right] = parts

        // Phyrexian {X/P}: colored left, 'P' right — always payable with life,
        // so only demand the color if present. Treat as hybrid with a "phantom"
        // always-available right side.
        if (right === 'P' && /^[WUBRG]$/.test(left)) {
          hybridMana.push({ color1: left, color2: left }) // pip is fulfillable even with no sources (life)
          return
        }
        // Twobrid {2/X}: 2 generic OR 1 colored — the colored side is the
        // expensive-but-efficient option. For probability, treat it as pure
        // hybrid between the colored option and an always-payable generic.
        if (left === '2' && /^[WUBRG]$/.test(right)) {
          hybridMana.push({ color1: right, color2: right }) // treat as fulfillable
          return
        }
        // Pure hybrid {W/U}
        if (/^[WUBRG]$/.test(left) && /^[WUBRG]$/.test(right)) {
          hybridMana.push({ color1: left, color2: right })
        }
      })

      // If no regular colors AND no hybrid AND no colorless {C}, it's pure
      // generic — always payable at the matching turn.
      if (
        Object.keys(colorCounts).length === 0 &&
        hybridMana.length === 0 &&
        colorlessSymbols.length === 0
      ) {
        return { p1: 99, p2: 98, hasX, xInfo }
      }

      const deckSize = totalCards || 60
      const landsInDeck = totalLands || 24

      // For X spells, use the effective turn (fixed cost + X value)
      // For regular spells, use CMC
      const baseCmc = getCmcFromCard(cardData) || 2
      const effectiveCmc = hasX && xInfo ? xInfo.targetTurn : baseCmc

      const turn = Math.max(1, Math.min(effectiveCmc, 10))
      const cardsSeen = cardsSeenByTurn(turn, playDraw)

      // P1: "Perfect scenario" = assuming we have exactly `turn` lands in hand
      // What's the probability those lands have the right colors?
      // = P(at least pipsNeeded sources among turn lands drawn from landsInDeck pool)
      let p1Probability = 1

      for (const [color, pipsNeeded] of Object.entries(colorCounts)) {
        const colorSources = deckSources?.[color] || 0

        if (colorSources === 0) {
          p1Probability = 0
          break
        }

        // P(at least pipsNeeded of this color among turn lands)
        const p1Color = hypergeom.atLeast(landsInDeck, colorSources, turn, pipsNeeded)
        p1Probability = Math.min(p1Probability, p1Color)
      }

      // Handle hybrid mana - use the BETTER of the two colors
      for (const hybrid of hybridMana) {
        const sources1 = deckSources?.[hybrid.color1] || 0
        const sources2 = deckSources?.[hybrid.color2] || 0

        // For hybrid, we need at least 1 of either color
        const p1Color1 = sources1 > 0 ? hypergeom.atLeast(landsInDeck, sources1, turn, 1) : 0
        const p1Color2 = sources2 > 0 ? hypergeom.atLeast(landsInDeck, sources2, turn, 1) : 0

        // Player can choose either color, so take MAX
        const p1Hybrid = Math.max(p1Color1, p1Color2)
        p1Probability = Math.min(p1Probability, p1Hybrid)
      }

      // P2: Realistic = P1 × P(having at least `turn` lands among cardsSeen cards)
      // This accounts for mana screw (not drawing enough lands)
      const probHavingEnoughLands = hypergeom.atLeast(deckSize, landsInDeck, cardsSeen, turn)
      const p2Probability = p1Probability * probHavingEnoughLands

      // NaN-safe rounding with a 100% ceiling. The previous 99% cap suggested
      // "nothing is ever certain" which eroded user trust when a perfectly
      // built deck returned 99% instead of 100%.
      const safePct = (p: number) =>
        !Number.isFinite(p) ? 0 : Math.round(Math.max(0, Math.min(1, p)) * 100)
      const finalP1 = safePct(p1Probability)
      const finalP2 = safePct(p2Probability)

      return {
        p1: finalP1,
        p2: finalP2,
        hasX,
        xInfo,
      }
    } catch (error) {
      console.error('Error calculating probabilities:', error)
      return { p1: 85, p2: 75, hasX: false, xInfo: null }
    }
  }, [cardData, cardName, deckSources, totalLands, totalCards, playDraw])
}

// Helper function for simulated mana costs
const getSimulatedManaCost = (cardName: string): string => {
  const commonCosts: { [key: string]: string } = {
    'Lightning Bolt': '{R}',
    Counterspell: '{U}{U}',
    'Dark Ritual': '{B}',
    'Swords to Plowshares': '{W}',
    'Giant Growth': '{G}',
    Shock: '{R}',
    Duress: '{B}',
    Brainstorm: '{U}',
    'Path to Exile': '{W}',
    'Llanowar Elves': '{G}',
    'Lightning Strike': '{1}{R}',
    Cancel: '{1}{U}{U}',
    Murder: '{1}{B}{B}',
    Pacifism: '{1}{W}',
    'Rampant Growth': '{1}{G}',
    'Mana Leak': '{1}{U}',
    'Doom Blade': '{1}{B}',
    Disenchant: '{1}{W}',
    Naturalize: '{1}{G}',
    'Lightning Helix': '{R}{W}',
    Terminate: '{B}{R}',
    'Abrupt Decay': '{B}{G}',
    'Boros Charm': '{R}{W}',
    Dreadbore: '{B}{R}',
    'Supreme Verdict': '{1}{W}{W}{U}',
    'Cryptic Command': '{1}{U}{U}{U}',
    'Force of Will': '{3}{U}{U}',
    Tarmogoyf: '{1}{G}',
    'Snapcaster Mage': '{1}{U}',
    'Dark Confidant': '{1}{B}',
    'Noble Hierarch': '{G}',
    'Deathrite Shaman': '{B/G}',
    Thoughtseize: '{B}',
    'Inquisition of Kozilek': '{B}',
    'Spell Pierce': '{U}',
    'Fatal Push': '{B}',
    Opt: '{U}',
    'Serum Visions': '{U}',
    Preordain: '{U}',
    Ponder: '{U}',
    "Mishra's Bauble": '{0}',
    Ornithopter: '{0}',
    'Mox Opal': '{0}',
    'Chrome Mox': '{0}',
    'Lotus Petal': '{0}',
    'Ancestral Recall': '{U}',
    'Black Lotus': '{0}',
    'Time Walk': '{1}{U}',
    'Sol Ring': '{1}',
    'Mana Crypt': '{0}',
    'Birds of Paradise': '{G}',
    'Elvish Mystic': '{G}',
  }

  return commonCosts[cardName] || '{2}'
}

// Get color based on probability
const getProbabilityColor = (prob: number, theme: Theme) => {
  if (prob >= 80) return theme.palette.success.main
  if (prob >= 65) return theme.palette.info.main
  if (prob >= 45) return theme.palette.warning.main
  return theme.palette.error.main
}

// Hook for accelerated castability calculation
// v1.1: Uses unconditionalMultiMana for probabilistic multi-mana land handling
// NOTE (2026-04-12): `baseProbability` was previously in the signature but was
// never read in the body — including it in the deps array invalidated the
// memo on every P2 recalc, defeating the optimization. Removed.
const useAcceleratedCastability = (
  cardData: MTGCard | null,
  cardName: string,
  deckSources?: Record<string, number>,
  totalLands?: number,
  totalCards?: number,
  producers?: ProducerInDeck[],
  accelContext?: ManaCostRowProps['accelContext'],
  showAcceleration?: boolean,
  unconditionalMultiMana?: UnconditionalMultiManaGroup
) => {
  return useMemo(() => {
    // Return null if acceleration is disabled or no producers
    if (!showAcceleration || !producers || producers.length === 0 || !accelContext) {
      return null
    }

    const manaCost = getManaCostFromCard(cardData) || getSimulatedManaCost(cardName)
    if (!manaCost) return null

    try {
      // Parse mana cost into ProducerManaCost format
      const colorCounts: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 }
      let generic = 0

      const symbols = manaCost.match(/\{[^}]+\}/g) || []
      symbols.forEach((symbol) => {
        const clean = symbol.replace(/[{}]/g, '')
        if (/^\d+$/.test(clean)) {
          generic += parseInt(clean)
        } else if (clean === 'X') {
          // For X spells, assume X=2 for calculation
          generic += 2
        } else if (['W', 'U', 'B', 'R', 'G'].includes(clean)) {
          colorCounts[clean]++
        } else if (clean.includes('/')) {
          // Hybrid mana (e.g., {R/G}) — player can pay with either color.
          // Assign to the color with more sources in the deck for best approximation.
          const parts = clean.split('/')
          const colorParts = parts.filter((p): p is 'W' | 'U' | 'B' | 'R' | 'G' =>
            ['W', 'U', 'B', 'R', 'G'].includes(p)
          )
          if (colorParts.length >= 2 && deckSources) {
            const best = colorParts.reduce((a, b) =>
              (deckSources[a] || 0) >= (deckSources[b] || 0) ? a : b
            )
            colorCounts[best]++
          } else if (colorParts.length > 0) {
            colorCounts[colorParts[0]]++
          }
        }
      })

      const totalPips = Object.values(colorCounts).reduce((a, b) => a + b, 0)
      const spellCost: ProducerManaCost = {
        mv: getCmcFromCard(cardData) || generic + totalPips,
        generic,
        pips: {
          W: colorCounts.W || undefined,
          U: colorCounts.U || undefined,
          B: colorCounts.B || undefined,
          R: colorCounts.R || undefined,
          G: colorCounts.G || undefined,
        },
      }

      // Build deck mana profile from sources
      // v1.1: Multi-mana lands handled probabilistically via unconditionalMultiMana
      const deckProfile: DeckManaProfile = {
        deckSize: totalCards || 60,
        totalLands: totalLands || 24,
        landColorSources: {
          W: deckSources?.W || 0,
          U: deckSources?.U || 0,
          B: deckSources?.B || 0,
          R: deckSources?.R || 0,
          G: deckSources?.G || 0,
          C: deckSources?.C || 0,
        },
        // v1.1: Probabilistic multi-mana land handling
        unconditionalMultiMana: unconditionalMultiMana,
      }

      // Build acceleration context
      const ctx: AccelContext = {
        playDraw: accelContext.playDraw,
        removalRate: accelContext.removalRate,
        defaultRockSurvival: accelContext.defaultRockSurvival,
      }

      // Compute accelerated castability
      const result = computeAcceleratedCastability(deckProfile, spellCost, producers, ctx)

      return result
    } catch (error) {
      console.error('Error calculating accelerated castability:', error)
      return null
    }
  }, [
    cardData,
    cardName,
    deckSources,
    totalLands,
    totalCards,
    producers,
    accelContext,
    showAcceleration,
    unconditionalMultiMana,
  ])
}

const ManaCostRow: React.FC<ManaCostRowProps> = memo(
  ({
    cardName,
    quantity,
    deckSources,
    totalLands,
    totalCards,
    producers,
    accelContext,
    showAcceleration = false,
    unconditionalMultiMana,
    initialCardData,
    isCreature,
    creatureOnlyExtraSources,
  }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [cardData, setCardData] = useState<MTGCard | null>(initialCardData ?? null)
    const [loading, setLoading] = useState(!initialCardData)
    const [error, setError] = useState<string | null>(null)

    // Adjust sources for creature spells: add Cavern of Souls-type lands
    const effectiveDeckSources = useMemo(() => {
      if (!isCreature || !creatureOnlyExtraSources || !deckSources) return deckSources
      const adjusted = { ...deckSources }
      for (const [color, count] of Object.entries(creatureOnlyExtraSources)) {
        adjusted[color] = (adjusted[color] || 0) + count
      }
      return adjusted
    }, [deckSources, isCreature, creatureOnlyExtraSources])

    const probabilities = useProbabilityCalculation(
      cardData,
      cardName,
      effectiveDeckSources,
      totalLands,
      totalCards,
      accelContext?.playDraw ?? 'PLAY'
    )

    // Calculate accelerated castability if enabled
    // v1.1: Multi-mana lands now handled probabilistically in engine
    // Audit fix H3 (2026-04-13): pass effectiveDeckSources (with Cavern of Souls
    // / Unclaimed Territory / etc. adjustments for creature spells) so the
    // accelerated path agrees with the base path on tribal decks. Without this,
    // enabling acceleration could PARADOXICALLY decrease the displayed
    // castability (e.g. Humans + Cavern: 95% base → 78% accelerated).
    const acceleratedResult = useAcceleratedCastability(
      cardData,
      cardName,
      effectiveDeckSources,
      totalLands,
      totalCards,
      producers,
      accelContext,
      showAcceleration,
      unconditionalMultiMana
    )

    useEffect(() => {
      // Skip fetch if card data was provided via props
      if (initialCardData || !cardName) return

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
    }, [cardName, initialCardData])

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
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
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
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )
    }

    // Extract set code from card data
    const setCode = cardData?.set?.toUpperCase() || ''

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
                      '&:hover': { color: theme.palette.primary.main },
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
                          This spell has X in its cost. We calculate castability assuming you want a
                          meaningful X value.
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
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ mt: 1, fontStyle: 'italic' }}
                        >
                          At turn {probabilities.xInfo.targetTurn}, you'd have{' '}
                          {probabilities.xInfo.targetTurn} mana, spending{' '}
                          {getFixedCmcFromManaCost(getManaCostFromCard(cardData))} on fixed costs
                          and {probabilities.xInfo.xValue} on X.
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

            {/* Realistic (primary) + Best Case (secondary reference) */}
            <Grid item xs={8} md={6}>
              {showAcceleration && acceleratedResult ? (
                <Box>
                  <SegmentedProbabilityBar
                    baseProbability={Math.round(acceleratedResult.base.p2 * 100)}
                    totalProbability={Math.round(acceleratedResult.withAcceleration.p2 * 100)}
                    height={8}
                    showLabels={true}
                    label="Realistic:"
                    tooltipContent={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Castability with Mana Acceleration
                        </Typography>
                        <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                          Unlike basic calculators, ManaTuner factors in your mana rocks, dorks, and
                          rituals with format-aware removal survival rates.
                        </Typography>
                        <Typography variant="caption" component="div">
                          • Lands only: {Math.round(acceleratedResult.base.p2 * 100)}%
                        </Typography>
                        <Typography variant="caption" component="div">
                          • Lands + Rocks: {Math.round(acceleratedResult.withAcceleration.p2 * 100)}
                          %
                        </Typography>
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ color: 'success.light' }}
                        >
                          • Ramp bonus: +{Math.round(acceleratedResult.accelerationImpact * 100)}%
                        </Typography>
                        {acceleratedResult.acceleratedTurn !== null && (
                          <Typography
                            variant="caption"
                            component="div"
                            sx={{ mt: 1, color: 'success.light' }}
                          >
                            Accelerated turn: {acceleratedResult.acceleratedTurn}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Tooltip
                    title="Best case: probability assuming you hit all land drops on curve"
                    arrow
                  >
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 0.5, display: 'block', fontSize: '0.65rem' }}
                    >
                      Best case: {probabilities.p1}%
                    </Typography>
                  </Tooltip>
                </Box>
              ) : (
                <Box>
                  <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Realistic:
                    </Typography>
                    <Tooltip
                      title="Realistic: accounts for mana screw (not drawing enough lands)"
                      arrow
                    >
                      <HelpOutlineIcon
                        sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }}
                      />
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
                      height: 8,
                      borderRadius: 4,
                      bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: getProbabilityColor(probabilities.p2, theme),
                      },
                    }}
                  />
                  <Tooltip
                    title="Best case: probability assuming you hit all land drops on curve"
                    arrow
                  >
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 0.5, display: 'block', fontSize: '0.65rem' }}
                    >
                      Best case: {probabilities.p1}%
                    </Typography>
                  </Tooltip>
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
  }
)

ManaCostRow.displayName = 'ManaCostRow'

export default ManaCostRow
