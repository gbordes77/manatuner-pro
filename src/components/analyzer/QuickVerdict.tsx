import { Alert, Typography } from '@mui/material'
import React from 'react'
import { AnalysisResult } from '../../services/deckAnalyzer'

interface QuickVerdictProps {
  analysisResult: AnalysisResult
  /**
   * Rolled-up Karsten verdict from `summarizeColorDeltas`. Null when the deck
   * is land-only or no spells were detected (in which case we skip the color
   * clause entirely).
   */
  manabaseVerdict:
    | {
        verdict: 'ok' | 'warn' | 'short'
        shortCount: number
        warnCount: number
      }
    | null
    | undefined
}

/**
 * One-phrase human-readable verdict shown at the top of the Analysis Results.
 * Léo persona ask: "give me a plain-English takeaway — I don't want to read
 * 5 tabs to know whether my manabase is good".
 *
 * Composition rules (kept deterministic so the phrasing is stable across
 * re-renders):
 *   1. Headline number = consistency (turn-2 average colored-source
 *      probability), expressed as a percentage.
 *   2. Quality tier derived from consistency (excellent/good/average/weak).
 *   3. If Karsten says any color is short, the phrase calls it out.
 *   4. Mulligan rider driven by `poorHand` (≥ 20 % → "mulligan aggressively
 *      on borderline hands"; else "keep almost any 2-4 land opener").
 *
 * The output is intentionally a single sentence — this is NOT where deep
 * analysis lives; it's the hook that tells a casual player whether to dig
 * deeper into the tabs.
 */
export const QuickVerdict: React.FC<QuickVerdictProps> = ({ analysisResult, manabaseVerdict }) => {
  const consistencyPct = Math.round((analysisResult.consistency || 0) * 100)

  let tier: 'excellent' | 'solid' | 'shaky' | 'weak'
  if (consistencyPct >= 90) tier = 'excellent'
  else if (consistencyPct >= 80) tier = 'solid'
  else if (consistencyPct >= 70) tier = 'shaky'
  else tier = 'weak'

  const mulliganRate = analysisResult.mulliganAnalysis?.poorHand ?? 0
  const mulliganRider =
    mulliganRate >= 20
      ? 'mulligan aggressively on borderline hands'
      : 'keep almost any 2–4-land opener'

  const colorClause = (() => {
    if (!manabaseVerdict || manabaseVerdict.verdict === 'ok') return null
    if (manabaseVerdict.verdict === 'short') {
      const n = manabaseVerdict.shortCount
      return `${n} color${n > 1 ? 's' : ''} short of Karsten target`
    }
    const n = manabaseVerdict.warnCount
    return `${n} color${n > 1 ? 's' : ''} close to limit`
  })()

  const tierLabel: Record<typeof tier, string> = {
    excellent: 'excellent',
    solid: 'solid',
    shaky: 'shaky',
    weak: 'rough',
  }

  const severity: 'success' | 'info' | 'warning' | 'error' =
    tier === 'excellent'
      ? 'success'
      : tier === 'solid'
        ? 'info'
        : tier === 'shaky'
          ? 'warning'
          : 'error'

  const phrase = colorClause
    ? `Your deck casts ${consistencyPct}% of spells on curve — ${tierLabel[tier]}, but ${colorClause}; ${mulliganRider}.`
    : `Your deck casts ${consistencyPct}% of spells on curve — ${tierLabel[tier]}; ${mulliganRider}.`

  return (
    <Alert
      severity={severity}
      variant="outlined"
      sx={{
        mb: 2,
        borderWidth: 1.5,
        '& .MuiAlert-message': { width: '100%' },
      }}
      role="status"
      aria-live="polite"
    >
      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
        {phrase}
      </Typography>
    </Alert>
  )
}
