import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { useAcceleration } from '../../contexts/AccelerationContext'
import { AnalysisResult } from '../../services/deckAnalyzer'
import { manaProducerService, producerCacheService } from '../../services/manaProducerService'
import type { Card } from '../../types'
import type { ProducerInDeck, UnconditionalMultiManaGroup } from '../../types/manaProducers'
import ManaCostRow from '../ManaCostRow'
import { Term } from '../common/Term'
import { AccelerationSettings } from './AccelerationSettings'
import { SideboardSwapEditor, type SideboardSwap } from './SideboardSwapEditor'

interface CastabilityTabProps {
  deckList: string
  analysisResult: AnalysisResult
}

export const CastabilityTab: React.FC<CastabilityTabProps> = memo(
  ({ deckList, analysisResult }) => {
    // Get acceleration context
    const { settings, accelContext } = useAcceleration()

    // Sideboard swap state
    const [activeSwaps, setActiveSwaps] = useState<SideboardSwap[]>([])

    // Separate maindeck and sideboard cards
    const maindeckCards = useMemo(
      () => (analysisResult?.cards || []).filter((c) => !c.isSideboard),
      [analysisResult?.cards]
    )
    const sideboardCards = useMemo(
      () => (analysisResult?.cards || []).filter((c) => c.isSideboard),
      [analysisResult?.cards]
    )

    // Apply sideboard swaps to get the post-board card list
    const effectiveCards = useMemo(() => {
      if (activeSwaps.length === 0) return maindeckCards
      const cardMap = new Map(maindeckCards.map((c) => [c.name, { ...c }]))

      for (const swap of activeSwaps) {
        // Remove OUT cards
        const outCard = cardMap.get(swap.cardOut)
        if (outCard) {
          outCard.quantity = Math.max(0, (outCard.quantity || 1) - swap.quantity)
          if (outCard.quantity === 0) cardMap.delete(swap.cardOut)
        }
        // Add IN cards (find from sideboard for metadata)
        const sbCard = sideboardCards.find((c) => c.name === swap.cardIn)
        const existing = cardMap.get(swap.cardIn)
        if (existing) {
          existing.quantity = (existing.quantity || 1) + swap.quantity
        } else if (sbCard) {
          cardMap.set(swap.cardIn, { ...sbCard, isSideboard: false, quantity: swap.quantity })
        }
      }
      return Array.from(cardMap.values())
    }, [maindeckCards, sideboardCards, activeSwaps])

    // Filter out lands using Scryfall metadata from analysisResult
    const nonLandCards = useMemo(() => {
      return effectiveCards.filter((card) => card.isLand !== true)
    }, [effectiveCards])

    // Detect mana producers in the deck (sync seed/cache + async Scryfall fallback)
    const [producersInDeck, setProducersInDeck] = useState<ProducerInDeck[]>([])

    useEffect(() => {
      if (!analysisResult?.cards) {
        setProducersInDeck([])
        return
      }

      // Phase 1: Sync lookup from seed/cache (instant)
      const syncProducers: ProducerInDeck[] = []
      const unknownCards: { name: string; quantity: number }[] = []

      for (const card of analysisResult.cards) {
        if (card.isLand) continue
        const cached = producerCacheService.get(card.name)
        if (cached) {
          syncProducers.push({ def: cached, copies: card.quantity || 1 })
        } else {
          unknownCards.push({ name: card.name, quantity: card.quantity || 1 })
        }
      }

      setProducersInDeck(syncProducers)

      // Phase 2: Async Scryfall lookup for cards not in seed/cache
      if (unknownCards.length > 0) {
        const fetchUnknown = async () => {
          const newProducers: ProducerInDeck[] = []
          for (const card of unknownCards) {
            const def = await manaProducerService.getProducer(card.name)
            if (def) {
              newProducers.push({ def, copies: card.quantity })
            }
          }
          if (newProducers.length > 0) {
            setProducersInDeck((prev) => [...prev, ...newProducers])
          }
        }
        fetchUnknown()
      }
    }, [analysisResult?.cards])

    // v1.1: Extract unconditional multi-mana lands for probabilistic handling
    // Groups lands by their delta (bonus mana per land)
    // e.g., Ancient Tomb (δ=1), Bounce lands (δ=1)
    const unconditionalMultiMana = useMemo<UnconditionalMultiManaGroup | undefined>(() => {
      if (!analysisResult?.cards) return undefined

      let totalCount = 0
      let totalDelta = 0

      for (const card of analysisResult.cards) {
        if (!card.isLand || !card.landMetadata) continue

        const producesAmount = card.landMetadata.producesAmount ?? 1
        if (producesAmount > 1) {
          const delta = producesAmount - 1
          const quantity = card.quantity || 1
          totalCount += quantity
          totalDelta += delta * quantity
        }
      }

      if (totalCount === 0) return undefined

      // Weighted average delta for the group
      const avgDelta = totalDelta / totalCount

      return {
        count: totalCount,
        delta: avgDelta,
      }
    }, [analysisResult?.cards])

    // Build Card objects from DeckCard to pass as initialCardData (avoids N+1 Scryfall calls)
    const cardDataMap = useMemo(() => {
      const map = new Map<string, Card>()
      if (!analysisResult?.cards) return map
      for (const card of analysisResult.cards) {
        if (card.isLand) continue
        map.set(card.name, {
          id: '',
          name: card.name,
          mana_cost: card.manaCost,
          cmc: card.cmc,
          type_line: '',
          colors: card.colors,
          color_identity: card.colors,
          set: '',
          set_name: '',
          rarity: '',
          legalities: {},
          layout: 'normal',
        })
      }
      return map
    }, [analysisResult?.cards])

    return (
      <>
        <Typography variant="h6" gutterBottom>
          🎯 Castability Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Real-time mana costs from Scryfall with probability calculations
        </Typography>

        {/* Acceleration Settings Panel */}
        <AccelerationSettings
          producersInDeck={producersInDeck}
          deckSize={analysisResult?.totalCards || 60}
        />

        {/* Ramp detection banner */}
        {producersInDeck.length > 0 && (
          <Paper
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              borderRadius: 1,
              '& .MuiTypography-root': {
                color: '#fff !important',
              },
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {producersInDeck.reduce((sum, p) => sum + p.copies, 0)} mana rocks/dorks detected
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              — {producersInDeck.map((p) => `${p.copies}x ${p.def.name}`).join(', ')}. Castability
              includes ramp acceleration.
            </Typography>
          </Paper>
        )}

        {nonLandCards.length > 0 ? (
          <Box>
            <Grid container spacing={1} sx={{ mb: 2, display: { xs: 'none', md: 'flex' } }}>
              <Grid item md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Card
                </Typography>
              </Grid>
              <Grid item md={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mana Cost
                </Typography>
              </Grid>
              <Grid item md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="subtitle2"
                    component="a"
                    href="/mathematics#probabilities"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: 'primary.main',
                      },
                    }}
                  >
                    Probabilities
                  </Typography>
                  <Tooltip
                    title="Realistic = chance of casting on curve (accounts for land count). Best case = chance if you have perfect mana. Click 'Probabilities' for the full explanation."
                    arrow
                    placement="top"
                  >
                    <IconButton
                      size="small"
                      sx={{ p: 0 }}
                      component="a"
                      href="/mathematics#probabilities"
                    >
                      <HelpOutlineIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>

            {nonLandCards.map((card, index) => (
              <ManaCostRow
                key={`${card.name}-${index}`}
                cardName={card.name}
                quantity={card.quantity || 1}
                deckSources={analysisResult?.colorDistribution}
                totalLands={analysisResult?.totalLands || 0}
                totalCards={analysisResult?.totalCards || 60}
                producers={producersInDeck}
                accelContext={accelContext}
                showAcceleration={settings.showAcceleration && producersInDeck.length > 0}
                unconditionalMultiMana={unconditionalMultiMana}
                initialCardData={cardDataMap.get(card.name) ?? null}
              />
            ))}

            {/* Sideboard swap editor */}
            {sideboardCards.length > 0 && (
              <SideboardSwapEditor
                maindeckCards={maindeckCards}
                sideboardCards={sideboardCards}
                onSwapsChange={setActiveSwaps}
              />
            )}
            {activeSwaps.length > 0 && (
              <Box sx={{ mt: 1, p: 1.5, bgcolor: 'info.main', borderRadius: 1, opacity: 0.9 }}>
                <Typography variant="caption" color="info.contrastText" fontWeight={600}>
                  Showing post-board castability (
                  {activeSwaps.reduce((s, sw) => s + sw.quantity, 0)} swaps applied)
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No deck list available. Please enter a deck list and analyze it first.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 0.5 }}
          >
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <strong>
                <Term id="best-case">Best Case</Term>
              </strong>
              &nbsp;= All lands on curve
            </Box>
            <Box component="span" sx={{ mx: 1 }}>
              |
            </Box>
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <strong>
                <Term id="realistic">Realistic</Term>
              </strong>
              &nbsp;= Accounts for mana screw
              {producersInDeck.length > 0 ? ' + mana rocks/dorks' : ''}
            </Box>
          </Typography>
        </Box>
      </>
    )
  }
)
