import { Box, Paper, Tooltip, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { MANA_COLOR_STYLES } from '../../constants/manaColors'
import { AnalysisResult } from '../../services/deckAnalyzer'
import type { ManaColor } from '../../types'
import { KARSTEN_TABLES } from '../../types/maths'

interface KarstenTargetDeltaProps {
  analysisResult: AnalysisResult
  isMobile: boolean
}

type KarstenColor = Exclude<ManaColor, 'C'>
const COLORS: readonly KarstenColor[] = ['W', 'U', 'B', 'R', 'G']

export interface ColorDelta {
  color: KarstenColor
  maxPips: number
  pivotTurn: number
  required: number
  actual: number
  delta: number
  verdict: 'ok' | 'warn' | 'short'
}

/**
 * Counts how many pips of `color` appear in a mana cost string.
 * Handles hybrid ({R/G} = 1 pip of R OR G) and phyrexian ({W/P} = 1 W pip).
 */
function countPipsInCost(cost: string, color: KarstenColor): number {
  if (!cost) return 0
  const symbols = cost.match(/\{[^}]+\}/g) || []
  let count = 0
  for (const sym of symbols) {
    const body = sym.slice(1, -1) // strip braces
    if (body === color) count++
    else if (body.includes('/')) {
      // Hybrid or Phyrexian — contributes 1 pip of color if color is present
      const parts = body.split('/')
      if (parts.includes(color)) count++
    }
  }
  return count
}

/**
 * For each color used by non-land spells, compute:
 *   - maxPips: max count of this color in a single spell's cost
 *   - pivotTurn: CMC of the spell that set maxPips (proxy for when you need it)
 *   - required: KARSTEN_TABLES[maxPips][pivotTurn]
 *   - actual: analysisResult.colorDistribution[color]
 *   - delta = actual - required
 *   - verdict: ok | warn | short
 *
 * Exported so `AnalyzerPage` can surface a compact "N colors short"
 * badge on the Manabase tab label without duplicating the logic.
 */
export function computeColorDeltas(analysisResult: AnalysisResult): ColorDelta[] {
  const result: ColorDelta[] = []
  const spells = analysisResult.cards.filter((c) => !c.isLand)

  for (const color of COLORS) {
    let maxPips = 0
    let pivotTurn = 0
    for (const card of spells) {
      const pips = countPipsInCost(card.manaCost, color)
      if (pips === 0) continue
      if (pips > maxPips || (pips === maxPips && card.cmc < pivotTurn)) {
        maxPips = pips
        pivotTurn = Math.max(1, card.cmc)
      }
    }
    if (maxPips === 0) continue

    const clampedPips = Math.min(Math.max(maxPips, 1), 3)
    const clampedTurn = Math.min(Math.max(pivotTurn, 1), 10)
    const required = KARSTEN_TABLES[clampedPips]?.[clampedTurn] ?? 0
    const actual = analysisResult.colorDistribution[color] || 0
    const delta = actual - required
    const verdict: ColorDelta['verdict'] = delta >= 0 ? 'ok' : delta >= -2 ? 'warn' : 'short'

    result.push({ color, maxPips, pivotTurn, required, actual, delta, verdict })
  }

  return result
}

/**
 * Rollup of per-color deltas into a single verdict for the Manabase tab
 * badge. Worst verdict wins (short > warn > ok).
 */
export function summarizeColorDeltas(deltas: ColorDelta[]): {
  verdict: 'ok' | 'warn' | 'short'
  shortCount: number
  warnCount: number
} {
  let shortCount = 0
  let warnCount = 0
  for (const d of deltas) {
    if (d.verdict === 'short') shortCount++
    else if (d.verdict === 'warn') warnCount++
  }
  const verdict: 'ok' | 'warn' | 'short' = shortCount > 0 ? 'short' : warnCount > 0 ? 'warn' : 'ok'
  return { verdict, shortCount, warnCount }
}

const VERDICT_COLORS = {
  ok: { bg: 'rgba(46, 125, 50, 0.12)', border: '#2e7d32', label: '#1b5e20' },
  warn: { bg: 'rgba(237, 108, 2, 0.12)', border: '#ed6c02', label: '#b26a00' },
  short: { bg: 'rgba(211, 47, 47, 0.12)', border: '#d32f2f', label: '#c62828' },
} as const

export const KarstenTargetDelta: React.FC<KarstenTargetDeltaProps> = ({
  analysisResult,
  isMobile,
}) => {
  const deltas = useMemo(() => computeColorDeltas(analysisResult), [analysisResult])

  if (deltas.length === 0) return null

  return (
    <Paper sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant={isMobile ? 'body1' : 'h6'} gutterBottom sx={{ fontWeight: 'bold' }}>
        Color Sources Check — Can You Cast Your Spells?
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 2, lineHeight: 1.5 }}
      >
        For each color, we compare how many lands producing that color you have against Frank
        Karsten&apos;s 2022 recommended minimums for the toughest mana cost in your spells. Green:
        you&apos;re fine. Orange: one or two sources short. Red: three or more short — you&apos;ll
        miss a lot of casts.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {deltas.map((d) => {
          const manaStyle = MANA_COLOR_STYLES[d.color]
          const palette = VERDICT_COLORS[d.verdict]
          const pipSymbol = '{' + d.color + '}'.repeat(d.maxPips)
          const deltaLabel =
            d.delta === 0
              ? 'on target'
              : d.delta > 0
                ? `+${d.delta} above target`
                : `${d.delta} short`

          return (
            <Tooltip
              key={d.color}
              arrow
              title={
                <Box>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                    Toughest {d.color} requirement: {pipSymbol} at turn {d.pivotTurn}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Karsten target: {d.required} sources
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Your deck: {d.actual} sources ({deltaLabel})
                  </Typography>
                </Box>
              }
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: palette.border,
                  bgcolor: palette.bg,
                  minWidth: 145,
                  cursor: 'help',
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: manaStyle.bg,
                    color: manaStyle.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {d.color}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: palette.label, fontWeight: 700, fontSize: '0.78rem' }}
                  >
                    {d.actual}/{d.required} sources
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: palette.label,
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      opacity: 0.9,
                    }}
                  >
                    {d.verdict === 'ok'
                      ? 'Target met'
                      : d.delta < 0
                        ? `${Math.abs(d.delta)} source${Math.abs(d.delta) > 1 ? 's' : ''} short`
                        : `+${d.delta}`}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          )
        })}
      </Box>
    </Paper>
  )
}
