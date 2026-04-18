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
 * Format detection thresholds.
 *   - Limited: 40-card decks (draft / sealed). `<= 45` leaves headroom for
 *     decks with 2-3 extra spells vs the 40-card baseline.
 *   - EDH / Commander: 99 (library only) or 100 (library + commander in
 *     one list) both count. Anything `>= 99` is treated as 100-card
 *     singleton.
 *   - Constructed: 60-89 cards (Standard, Pioneer, Modern, Legacy).
 */
const LIMITED_MAX_CARDS = 45
const EDH_MIN_CARDS = 99

type FormatFamily = 'limited' | 'edh' | 'constructed'

function detectFormatFamily(totalCards: number): FormatFamily {
  if (totalCards <= LIMITED_MAX_CARDS) return 'limited'
  if (totalCards >= EDH_MIN_CARDS) return 'edh'
  return 'constructed'
}

export const QuickVerdict: React.FC<QuickVerdictProps> = ({ analysisResult, manabaseVerdict }) => {
  const consistencyPct = Math.round((analysisResult.consistency || 0) * 100)
  const format = detectFormatFamily(analysisResult.totalCards || 0)
  const isEDH = format === 'edh'
  const isLimited = format === 'limited'

  // Tier bands calibrated per format. Both Limited and EDH have naturally
  // lower consistency than Constructed (weaker fixing in Limited; singleton
  // + 100-card variance in EDH) so we widen the bands 10 points.
  let tier: 'excellent' | 'solid' | 'shaky' | 'weak'
  if (isEDH || isLimited) {
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
  const mulliganRider = (() => {
    if (isEDH) {
      // EDH London mulligan keeps free at 7; the ManaTuner "poor hand" %
      // is less load-bearing than in 60-card. Use a generic EDH rider.
      return 'plan mulligans around at least 1 ramp + 2 castable lands'
    }
    if (isLimited) {
      // Bo3 Limited (draft/sealed) plays the London mulligan too, but the
      // deck is 40 cards so every mulligan is costlier (smaller library =
      // bigger variance). Lean towards keeping borderline hands.
      return 'most 2–3-land hands are keeps in a 40-card deck'
    }
    return mulliganRate >= 20
      ? 'mulligan aggressively on borderline hands'
      : 'keep almost any 2–4-land opener'
  })()

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
    : isLimited
      ? `Limited (40-card) — ${consistencyPct}% of spells cast on curve`
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
      {isLimited && (
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 0.5, opacity: 0.85, fontStyle: 'italic' }}
        >
          Note: in Limited (40-card), Karsten&apos;s 60-card targets are a hard ceiling — a 2-pip
          spell at 90 % reliability needs ~13 sources, which is most of your draft pool. Aim for 17
          lands and at most a 10/7 colour split.
        </Typography>
      )}
    </Alert>
  )
}
