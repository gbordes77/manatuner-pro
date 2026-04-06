import AddIcon from '@mui/icons-material/Add'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import RemoveIcon from '@mui/icons-material/Remove'
import { Box, Button, Chip, Collapse, IconButton, Paper, Typography, useTheme } from '@mui/material'
import React, { memo, useCallback, useMemo, useState } from 'react'
import type { DeckCard } from '../../services/deckAnalyzer'

export interface SideboardSwap {
  /** Card name coming IN from sideboard */
  cardIn: string
  /** Card name going OUT from maindeck */
  cardOut: string
  /** Number of copies swapped */
  quantity: number
}

interface SideboardSwapEditorProps {
  maindeckCards: DeckCard[]
  sideboardCards: DeckCard[]
  onSwapsChange: (swaps: SideboardSwap[]) => void
}

/**
 * Sideboard swap editor — lets users define IN/OUT swaps
 * and recalculate castability for post-board games.
 */
export const SideboardSwapEditor: React.FC<SideboardSwapEditorProps> = memo(
  ({ maindeckCards, sideboardCards, onSwapsChange }) => {
    const theme = useTheme()
    const [expanded, setExpanded] = useState(false)
    // Track quantities to swap in/out
    const [sbIn, setSbIn] = useState<Record<string, number>>({})
    const [mainOut, setMainOut] = useState<Record<string, number>>({})

    const totalIn = useMemo(() => Object.values(sbIn).reduce((a, b) => a + b, 0), [sbIn])
    const totalOut = useMemo(() => Object.values(mainOut).reduce((a, b) => a + b, 0), [mainOut])
    const isBalanced = totalIn === totalOut

    const adjustSbIn = useCallback(
      (name: string, delta: number) => {
        setSbIn((prev) => {
          const card = sideboardCards.find((c) => c.name === name)
          const max = card?.quantity || 0
          const current = prev[name] || 0
          const next = Math.max(0, Math.min(max, current + delta))
          const updated = { ...prev, [name]: next }
          if (updated[name] === 0) delete updated[name]
          return updated
        })
      },
      [sideboardCards]
    )

    const adjustMainOut = useCallback(
      (name: string, delta: number) => {
        setMainOut((prev) => {
          const card = maindeckCards.find((c) => c.name === name)
          const max = card?.quantity || 0
          const current = prev[name] || 0
          const next = Math.max(0, Math.min(max, current + delta))
          const updated = { ...prev, [name]: next }
          if (updated[name] === 0) delete updated[name]
          return updated
        })
      },
      [maindeckCards]
    )

    const handleApply = useCallback(() => {
      // Build swap pairs — just combine all ins and outs
      const inEntries = Object.entries(sbIn).filter(([, q]) => q > 0)
      const outEntries = Object.entries(mainOut).filter(([, q]) => q > 0)
      const swaps: SideboardSwap[] = []

      // Create swaps by pairing ins with outs (order doesn't matter for castability)
      let inIdx = 0
      let outIdx = 0
      let inRemaining = inEntries[0]?.[1] || 0
      let outRemaining = outEntries[0]?.[1] || 0

      while (inIdx < inEntries.length && outIdx < outEntries.length) {
        const qty = Math.min(inRemaining, outRemaining)
        swaps.push({
          cardIn: inEntries[inIdx][0],
          cardOut: outEntries[outIdx][0],
          quantity: qty,
        })
        inRemaining -= qty
        outRemaining -= qty
        if (inRemaining === 0) {
          inIdx++
          inRemaining = inEntries[inIdx]?.[1] || 0
        }
        if (outRemaining === 0) {
          outIdx++
          outRemaining = outEntries[outIdx]?.[1] || 0
        }
      }

      onSwapsChange(swaps)
    }, [sbIn, mainOut, onSwapsChange])

    const handleClear = useCallback(() => {
      setSbIn({})
      setMainOut({})
      onSwapsChange([])
    }, [onSwapsChange])

    const nonLandMaindeck = useMemo(() => maindeckCards.filter((c) => !c.isLand), [maindeckCards])

    if (sideboardCards.length === 0) return null

    return (
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          border: '1px solid',
          borderColor: expanded ? 'primary.main' : 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: expanded ? 'primary.main' : 'action.hover',
            color: expanded ? 'primary.contrastText' : 'text.primary',
            '&:hover': { bgcolor: expanded ? 'primary.dark' : 'action.selected' },
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrowsIcon sx={{ fontSize: 18 }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Post-Board Analysis
            </Typography>
            <Chip
              label={`${sideboardCards.reduce((s, c) => s + (c.quantity || 1), 0)} cards in sideboard`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: expanded ? 'rgba(255,255,255,0.2)' : 'action.selected',
              }}
            />
          </Box>
          <Typography variant="caption">{expanded ? 'Collapse' : 'Expand'}</Typography>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ p: 2 }}>
            {/* Two columns: IN and OUT */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {/* Sideboard IN */}
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="success.main"
                  sx={{ display: 'block', mb: 1 }}
                >
                  IN from Sideboard (+{totalIn})
                </Typography>
                {sideboardCards.map((card) => (
                  <Box
                    key={card.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', flex: 1 }}>
                      {card.name}
                      <Typography component="span" variant="caption" color="text.secondary">
                        {' '}
                        ({card.quantity}x)
                      </Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => adjustSbIn(card.name, -1)}
                        disabled={!sbIn[card.name]}
                      >
                        <RemoveIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ minWidth: 16, textAlign: 'center' }}
                      >
                        {sbIn[card.name] || 0}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => adjustSbIn(card.name, 1)}
                        disabled={(sbIn[card.name] || 0) >= (card.quantity || 1)}
                      >
                        <AddIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Maindeck OUT */}
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="error.main"
                  sx={{ display: 'block', mb: 1 }}
                >
                  OUT from Maindeck (-{totalOut})
                </Typography>
                {nonLandMaindeck.map((card) => (
                  <Box
                    key={card.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', flex: 1 }}>
                      {card.name}
                      <Typography component="span" variant="caption" color="text.secondary">
                        {' '}
                        ({card.quantity}x)
                      </Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => adjustMainOut(card.name, -1)}
                        disabled={!mainOut[card.name]}
                      >
                        <RemoveIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ minWidth: 16, textAlign: 'center' }}
                      >
                        {mainOut[card.name] || 0}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => adjustMainOut(card.name, 1)}
                        disabled={(mainOut[card.name] || 0) >= (card.quantity || 1)}
                      >
                        <AddIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Balance indicator + Apply */}
            <Box
              sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography
                variant="caption"
                color={isBalanced ? 'success.main' : 'warning.main'}
                fontWeight={600}
              >
                {totalIn === 0 && totalOut === 0
                  ? 'Select cards to swap'
                  : isBalanced
                    ? `Balanced: ${totalIn} in / ${totalOut} out`
                    : `Unbalanced: +${totalIn} in / -${totalOut} out (deck size changes)`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleClear}
                  disabled={totalIn === 0 && totalOut === 0}
                >
                  Clear
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleApply}
                  disabled={totalIn === 0 && totalOut === 0}
                >
                  Apply Swaps
                </Button>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    )
  }
)
