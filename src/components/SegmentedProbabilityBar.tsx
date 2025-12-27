/**
 * Segmented Probability Bar Component
 *
 * Displays castability probability as a segmented bar showing:
 * - Base probability (lands only) - solid fill
 * - Acceleration bonus (with ramp) - striped fill
 *
 * @version 1.0
 */

import { Box, Tooltip, Typography, useTheme } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import React, { memo } from 'react'

interface SegmentedProbabilityBarProps {
  /** Base probability from lands only (0-100) */
  baseProbability: number

  /** Total probability with acceleration (0-100) */
  totalProbability: number

  /** Height of the bar */
  height?: number

  /** Show labels */
  showLabels?: boolean

  /** Label for the metric */
  label?: string

  /** Tooltip content */
  tooltipContent?: React.ReactNode
}

/**
 * Get color based on probability value
 */
const getProbabilityColor = (prob: number, theme: Theme) => {
  if (prob >= 80) return theme.palette.success.main
  if (prob >= 65) return theme.palette.info.main
  if (prob >= 45) return theme.palette.warning.main
  return theme.palette.error.main
}

export const SegmentedProbabilityBar: React.FC<SegmentedProbabilityBarProps> = memo(({
  baseProbability,
  totalProbability,
  height = 8,
  showLabels = true,
  label,
  tooltipContent
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Clamp values
  const base = Math.max(0, Math.min(100, baseProbability))
  const total = Math.max(0, Math.min(100, totalProbability))
  const bonus = Math.max(0, total - base)

  const baseColor = getProbabilityColor(base, theme)
  const totalColor = getProbabilityColor(total, theme)

  // Striped pattern for bonus segment
  const stripedBackground = `repeating-linear-gradient(
    45deg,
    ${totalColor},
    ${totalColor} 2px,
    ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)'} 2px,
    ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)'} 4px
  )`

  const barContent = (
    <Box sx={{ width: '100%' }}>
      {/* Labels row */}
      {showLabels && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5
          }}
        >
          {label && (
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {bonus > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: totalColor,
                  fontWeight: 'bold',
                  fontSize: '0.65rem'
                }}
              >
                +{bonus.toFixed(0)}% ramp
              </Typography>
            )}
            <Box
              sx={{
                bgcolor: totalColor,
                color: '#fff',
                px: 0.75,
                py: 0.15,
                borderRadius: 0.5,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                minWidth: 36,
                textAlign: 'center'
              }}
            >
              {total.toFixed(0)}%
            </Box>
          </Box>
        </Box>
      )}

      {/* Bar */}
      <Box
        sx={{
          width: '100%',
          height,
          borderRadius: height / 2,
          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Base segment (solid) */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${base}%`,
            bgcolor: baseColor,
            borderRadius: height / 2,
            transition: 'width 0.3s ease'
          }}
        />

        {/* Bonus segment (striped) */}
        {bonus > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: `${base}%`,
              top: 0,
              height: '100%',
              width: `${bonus}%`,
              background: stripedBackground,
              borderTopRightRadius: height / 2,
              borderBottomRightRadius: height / 2,
              transition: 'width 0.3s ease, left 0.3s ease'
            }}
          />
        )}
      </Box>

      {/* Legend */}
      {showLabels && bonus > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mt: 0.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 1,
                bgcolor: baseColor
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Lands ({base.toFixed(0)}%)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 1,
                background: stripedBackground
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              +Ramp ({bonus.toFixed(0)}%)
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )

  if (tooltipContent) {
    return (
      <Tooltip title={tooltipContent} arrow placement="top">
        {barContent}
      </Tooltip>
    )
  }

  return barContent
})

SegmentedProbabilityBar.displayName = 'SegmentedProbabilityBar'

export default SegmentedProbabilityBar
