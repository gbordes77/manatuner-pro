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
/**
 * EDH / Commander detection threshold. 99 (library) or 100 (library +
 * commander in one list) both count. Anything ≥ 99 is treated as a
 * singleton 100-card format. Below that, we assume 60-card constructed.
 */
const EDH_MIN_CARDS = 99

export const QuickVerdict: React.FC<QuickVerdictProps> = ({ analysisResult, manabaseVerdict }) => {
  const consistencyPct = Math.round((analysisResult.consistency || 0) * 100)
  const isEDH = (analysisResult.totalCards || 0) >= EDH_MIN_CARDS

  // For EDH, a "solid" consistency number is naturally lower because the
  // deck is 100 cards (vs 60) and must be singleton. Karsten's 90 %
  // thresholds calibrated to 60-card don't transfer 1:1. We widen the
  // tier bands so an EDH deck at 72 % doesn't get labelled "rough".
  let tier: 'excellent' | 'solid' | 'shaky' | 'weak'
  if (isEDH) {
    if (consistencyPct >= 80) tier = 'excellent'
    else if (consistencyPct >= 70) tier = 'solid'
    else if (consistencyPct >= 60) tier = 'shaky'
    else tier = 'weak'
  } else {
    if (consistencyPct >= 90) tier = 'excellent'
    else if (consistencyPct >= 80) tier = 'solid'
    else if (consistencyPct >= 70) tier = 'shaky'
    else tier = 'weak'
  }

  const mulliganRate = analysisResult.mulliganAnalysis?.poorHand ?? 0
  const mulliganRider = isEDH
    ? // EDH London mulligan keeps free at 7; the ManaTuner "poor hand" %
      // is less load-bearing than in 60-card. Use a generic EDH rider.
      'plan mulligans around at least 1 ramp + 2 castable lands'
    : mulliganRate >= 20
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

  const headline = isEDH
    ? `EDH — ${consistencyPct}% of spells cast on curve at 100 cards`
    : `Your deck casts ${consistencyPct}% of spells on curve`

  const phrase = colorClause
    ? `${headline} — ${tierLabel[tier]}, but ${colorClause}; ${mulliganRider}.`
    : `${headline} — ${tierLabel[tier]}; ${mulliganRider}.`

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
      {isEDH && (
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 0.5, opacity: 0.85, fontStyle: 'italic' }}
        >
          Note: the command zone (your commander cast each game) is not yet modelled in these
          numbers. EDH analysis lives at <code>/guide#commander</code>.
        </Typography>
      )}
    </Alert>
  )
}
