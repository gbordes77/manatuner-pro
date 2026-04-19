import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Button, LinearProgress, Typography } from '@mui/material'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import type { CuratorTrack } from '../../types/referenceArticle'
import { TRACK_METADATA } from '../../types/referenceArticle'
import { useTheme } from '../common/NotificationProvider'

const MANA_COLOR_HEX: Record<'w' | 'u' | 'b' | 'r' | 'g', string> = {
  w: '#D4B85A', // darker gold-ish white — readable on light + dark backgrounds
  u: '#0E68AB',
  b: '#6B3FA0', // deep purple — Commander "black" but visible on dark theme
  r: '#D3202A',
  g: '#00733E',
}

interface TrackHeaderProps {
  track: CuratorTrack
  articleCount: number
  /** Number of articles in this track already opened by the user (localStorage).
   *  We say "opened" rather than "read" because the count is incremented when
   *  the user clicks to open the link — a click is not a read. */
  readCount?: number
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track, articleCount, readCount = 0 }) => {
  const { isDark } = useTheme()
  const meta = TRACK_METADATA[track]
  const accentHex = MANA_COLOR_HEX[meta.accentColor]
  const progressPct = articleCount > 0 ? Math.round((readCount / articleCount) * 100) : 0
  const hasProgress = readCount > 0

  return (
    <Box
      id={`track-${track}`}
      sx={{
        position: 'relative',
        mb: 3,
        pb: 2,
        scrollMarginTop: 80, // anchors land below any future sticky header
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
      }}
    >
      {/* Accent bar — mana color of the track */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '60%',
          background: `linear-gradient(180deg, ${accentHex} 0%, transparent 100%)`,
          borderRadius: 2,
        }}
      />

      <Box sx={{ pl: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="h4"
            component="h3"
            sx={{
              fontWeight: 800,
              fontFamily: '"Cinzel", serif',
              lineHeight: 1.1,
              fontSize: { xs: '1.5rem', md: '1.85rem' },
              color: isDark ? 'white' : 'text.primary',
            }}
          >
            <Box component="span" aria-hidden="true" sx={{ fontSize: '1.2em', mr: 1 }}>
              {meta.emoji}
            </Box>
            {meta.title}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontSize: '0.8rem',
              color: 'text.secondary',
              fontWeight: 600,
              fontVariant: 'all-small-caps',
              letterSpacing: '0.08em',
            }}
          >
            {hasProgress
              ? `${readCount}/${articleCount} opened`
              : `${articleCount} ${articleCount === 1 ? 'article' : 'articles'}`}
          </Typography>
        </Box>

        <Typography
          variant="subtitle1"
          sx={{
            mt: 0.5,
            fontStyle: 'italic',
            color: accentHex,
            fontWeight: 600,
            fontSize: { xs: '0.9rem', md: '1rem' },
          }}
        >
          {meta.tagline}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            maxWidth: 720,
            lineHeight: 1.55,
          }}
        >
          {meta.description}
        </Typography>

        {/* Progress bar — shown only when the user has opened at least one */}
        {hasProgress && (
          <Box sx={{ mt: 1.5, maxWidth: 360 }}>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              aria-label={`${progressPct}% of ${meta.title} track opened`}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: accentHex,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {/* Optional analyzer CTA (Commander track uses this) */}
        {meta.analyzerCtaHref && meta.analyzerCtaLabel && (
          <Box sx={{ mt: 2 }}>
            <Button
              component={RouterLink}
              to={meta.analyzerCtaHref}
              size="small"
              endIcon={<ArrowForwardIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: accentHex,
                borderColor: accentHex,
                border: '1px solid',
                px: 1.5,
                '&:hover': {
                  backgroundColor: isDark ? `${accentHex}22` : `${accentHex}15`,
                  borderColor: accentHex,
                },
              }}
            >
              {meta.analyzerCtaLabel}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
