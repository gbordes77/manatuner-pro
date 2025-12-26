import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material'
import {
    Box,
    Chip,
    CircularProgress,
    Fade,
    Grid,
    Paper,
    Tooltip,
    Typography
} from '@mui/material'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { searchCardByName } from '../services/scryfall'
import type { Card as MTGCard } from '../types'
import { CardImageTooltip } from './CardImageTooltip'
import { ManaSequence } from './common/ManaSymbols'

interface ManaCostRowProps {
  cardName: string
  quantity: number
  deckSources?: Record<string, number>  // Sources par couleur dans le deck
  totalLands?: number                    // Nombre total de terrains
  totalCards?: number                    // Nombre total de cartes
}

interface ManaSymbolProps {
  symbol: string
}

const _ManaSymbol: React.FC<ManaSymbolProps> = ({ symbol }) => {
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
// Basé sur la méthodologie du site original (project-manabase)
//
// P1 = Probabilité CONDITIONNELLE avec TES sources (assume land drops OK)
//      "Assuming you hit all your landdrops"
//      Parmi N lands, quelle proba d'avoir les bonnes couleurs?
//
// P2 = P1 × Probabilité d'avoir N lands au tour N
//      "Realistic probability" - inclut le risque de mana screw
//      P2 ≤ P1 toujours
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
      // Parser le coût de mana pour extraire les symboles colorés
      const manaCostSymbols = actualManaCost.match(/\{[WUBRG]\}/g) || []
      const colorCounts: { [color: string]: number } = {}

      manaCostSymbols.forEach(symbol => {
        const color = symbol.replace(/[{}]/g, '')
        colorCounts[color] = (colorCounts[color] || 0) + 1
      })

      // Si pas de symboles colorés (colorless spell), très haute probabilité
      if (Object.keys(colorCounts).length === 0) {
        return { p1: 99, p2: 98 }
      }

      const deckSize = totalCards || 60
      const landsInDeck = totalLands || 24
      const cmc = cardData?.cmc || 2

      // Fonction hypergeométrique cumulative (au moins k succès)
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

      // Tour où on veut jouer = CMC (plafonné à 10)
      const turn = Math.max(1, Math.min(cmc, 10))
      // Cartes vues = 7 (main) + (turn - 1) pioches
      const cardsSeen = 7 + (turn - 1)

      // ═══════════════════════════════════════════════════════════
      // P1: Probabilité CONDITIONNELLE (assume qu'on a 'turn' lands)
      // ═══════════════════════════════════════════════════════════
      let p1Probability = 1

      for (const [color, symbolsNeeded] of Object.entries(colorCounts)) {
        const actualSourcesForColor = deckSources?.[color] || 0
        const realSources = actualSourcesForColor > 0 ? actualSourcesForColor : 0

        // Parmi 'turn' terrains piochés du deck, proba d'avoir assez de cette couleur
        const p1Color = realSources > 0
          ? hypergeometric(landsInDeck, realSources, turn, symbolsNeeded)
          : 0
        p1Probability = Math.min(p1Probability, p1Color)
      }

      // ═══════════════════════════════════════════════════════════
      // Probabilité d'avoir au moins 'turn' lands parmi 'cardsSeen' cartes
      // ═══════════════════════════════════════════════════════════
      const probHavingEnoughLands = hypergeometric(deckSize, landsInDeck, cardsSeen, turn)

      // ═══════════════════════════════════════════════════════════
      // P2 = P1 × Probabilité d'avoir assez de lands (RÉALISTE)
      // ═══════════════════════════════════════════════════════════
      const p2Probability = p1Probability * probHavingEnoughLands

      const finalP1 = Math.round(Math.max(Math.min(p1Probability * 100, 99), 0))
      const finalP2 = Math.round(Math.max(Math.min(p2Probability * 100, 99), 0))

      return {
        p1: finalP1,  // Optimiste (assume lands OK)
        p2: finalP2   // Réaliste (inclut mana screw)
      }

    } catch (error) {
      console.error('Error calculating probabilities:', error)
      return { p1: 85, p2: 75 }
    }
  }, [cardData, cardName, deckSources, totalLands, totalCards])
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

const ManaCostRow: React.FC<ManaCostRowProps> = memo(({
  cardName,
  quantity,
  deckSources,
  totalLands,
  totalCards
}) => {
  const [cardData, setCardData] = useState<MTGCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized probability calculation with actual deck sources
  const probabilities = useProbabilityCalculation(cardData, cardName, deckSources, totalLands, totalCards)

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
            <CardImageTooltip cardName={cardData?.name || cardName}>
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
            </CardImageTooltip>
          </Grid>

          {/* Mana Cost */}
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
              <ManaSymbols manaCost={cardData?.mana_cost || ''} />
              <Tooltip title="CMC (Converted Mana Cost), now called Mana Value, is the total mana needed to cast this spell." arrow>
                <Typography variant="caption" color="text.secondary" ml={1} sx={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
                  CMC: {cardData?.cmc || 2}
                  <HelpOutlineIcon sx={{ fontSize: 12, ml: 0.3, opacity: 0.7 }} />
                </Typography>
              </Tooltip>
            </Box>
          </Grid>

          {/* P1 Probability */}
          <Grid item xs={6} sm={3}>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Tooltip title="P1 (Perfect): Probability of casting this spell assuming you hit all your land drops on curve. This is the best-case scenario." arrow>
                  <Typography variant="caption" fontWeight="600" sx={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
                    P1 (Perfect):
                    <HelpOutlineIcon sx={{ fontSize: 12, ml: 0.3, opacity: 0.7 }} />
                  </Typography>
                </Tooltip>
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
                <Tooltip title="P2 (Realistic): Probability that accounts for mana screw (not drawing enough lands). This gives you a more accurate picture of how often you can actually cast this spell." arrow>
                  <Typography variant="caption" fontWeight="600" sx={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
                    P2 (Realistic):
                    <HelpOutlineIcon sx={{ fontSize: 12, ml: 0.3, opacity: 0.7 }} />
                  </Typography>
                </Tooltip>
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
