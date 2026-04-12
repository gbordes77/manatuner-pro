import { Box, Typography } from '@mui/material'
import React from 'react'
import type { CuratorTrack } from '../../types/referenceArticle'
import { TRACK_METADATA } from '../../types/referenceArticle'
import { useTheme } from '../common/NotificationProvider'

const MANA_COLOR_HEX: Record<'w' | 'u' | 'b' | 'r' | 'g', string> = {
  w: '#F8F6D8',
  u: '#0E68AB',
  b: '#150B00',
  r: '#D3202A',
  g: '#00733E',
}

interface TrackHeaderProps {
  track: CuratorTrack
  articleCount: number
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track, articleCount }) => {
  const { isDark } = useTheme()
  const meta = TRACK_METADATA[track]
  const accentHex = MANA_COLOR_HEX[meta.accentColor]

  return (
    <Box
      id={`track-${track}`}
      sx={{
        position: 'relative',
        mb: 3,
        pb: 2,
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
            component="h2"
            sx={{
              fontWeight: 800,
              fontFamily: '"Cinzel", serif',
              lineHeight: 1.1,
              fontSize: { xs: '1.5rem', md: '1.85rem' },
              color: isDark ? 'white' : 'text.primary',
            }}
          >
            <Box component="span" sx={{ fontSize: '1.2em', mr: 1 }}>
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
            {articleCount} {articleCount === 1 ? 'article' : 'articles'}
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
      </Box>
    </Box>
  )
}
