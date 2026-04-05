import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material'
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { useAcceleration } from '../../contexts/AccelerationContext'
import { AnalysisResult } from '../../services/deckAnalyzer'
import { manaProducerService, producerCacheService } from '../../services/manaProducerService'
import type { Card } from '../../types'
import type { ProducerInDeck, UnconditionalMultiManaGroup } from '../../types/manaProducers'
import ManaCostRow from '../ManaCostRow'
import { AccelerationSettings } from './AccelerationSettings'

interface CastabilityTabProps {
  deckList: string
  analysisResult: AnalysisResult
}

export const CastabilityTab: React.FC<CastabilityTabProps> = memo(
  ({ deckList, analysisResult }) => {
    // Get acceleration context
    const { settings, accelContext } = useAcceleration()

    // Filter out lands using Scryfall metadata from analysisResult
    const nonLandCards = useMemo(() => {
      if (!analysisResult?.cards) return []

      return analysisResult.cards.filter((card) => {
        // Use isLand flag - lands are handled separately
        return card.isLand !== true
      })
    }, [analysisResult?.cards])

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
        <AccelerationSettings producersInDeck={producersInDeck} />

        {/* Ramp detection banner */}
        {producersInDeck.length > 0 && (
          <Paper
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: 'success.main',
              color: 'success.contrastText',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderRadius: 1,
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
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Card
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mana Cost
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Probabilities
                </Typography>
              </Grid>
            </Grid>

            {nonLandCards.map((card, index) => (
              <ManaCostRow
                key={index}
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
              <strong>P1</strong>
              <Tooltip
                title="P1 (Play First): Probability of casting this spell assuming you hit all your land drops. This is the optimistic scenario where you always draw the lands you need on curve."
                arrow
              >
                <IconButton size="small" sx={{ p: 0, mx: 0.5 }}>
                  <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                </IconButton>
              </Tooltip>
              = Perfect scenario (all lands on curve)
            </Box>
            <Box component="span" sx={{ mx: 1 }}>
              |
            </Box>
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <strong>P2</strong>
              <Tooltip
                title="P2 (Draw First): Realistic probability that accounts for mana screw (not drawing enough lands). This factors in the chance of missing land drops, giving you a more accurate picture of castability."
                arrow
              >
                <IconButton size="small" sx={{ p: 0, mx: 0.5 }}>
                  <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                </IconButton>
              </Tooltip>
              = Realistic (accounts for mana screw
              {producersInDeck.length > 0 ? ' + mana rocks/dorks' : ''})
            </Box>
          </Typography>
        </Box>
      </>
    )
  }
)
