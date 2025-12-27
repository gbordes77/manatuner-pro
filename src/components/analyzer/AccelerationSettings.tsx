/**
 * Acceleration Settings Component
 *
 * UI for configuring mana acceleration calculation parameters:
 * - Format preset selector
 * - Play/Draw toggle
 * - Custom removal rate slider
 *
 * @version 1.0
 */

import {
    ExpandMore as ExpandMoreIcon,
    HelpOutline as HelpOutlineIcon,
    Restore as RestoreIcon,
    Settings as SettingsIcon
} from '@mui/icons-material'
import {
    Box,
    Collapse,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    Switch,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import React, { useState } from 'react'
import { useAcceleration } from '../../contexts/AccelerationContext'
import type { FormatPreset, ProducerInDeck } from '../../types/manaProducers'

// =============================================================================
// FORMAT OPTIONS
// =============================================================================

const FORMAT_OPTIONS: Array<{ value: FormatPreset; label: string; description: string }> = [
  { value: 'goldfish', label: 'Goldfish (0%)', description: 'No interaction - testing only' },
  { value: 'casual_edh', label: 'Casual EDH (10%)', description: 'Casual multiplayer games' },
  { value: 'cedh', label: 'cEDH (15%)', description: 'Competitive EDH - less creature focus' },
  { value: 'standard', label: 'Standard (20%)', description: 'Standard metagame interaction level' },
  { value: 'modern', label: 'Modern (35%)', description: '"Bolt the Bird" - high creature removal' },
  { value: 'legacy', label: 'Legacy (40%)', description: 'Highest interaction density' }
]

// =============================================================================
// COMPONENT
// =============================================================================

interface AccelerationSettingsProps {
  /** Mana producers detected in the deck */
  producersInDeck?: ProducerInDeck[]
}

export const AccelerationSettings: React.FC<AccelerationSettingsProps> = ({
  producersInDeck = []
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [expanded, setExpanded] = useState(false)

  const {
    settings,
    removalRate,
    setFormat,
    setPlayDraw,
    setCustomRemovalRate,
    setShowAcceleration,
    resetToDefaults
  } = useAcceleration()

  const handleRemovalRateChange = (_: Event, value: number | number[]) => {
    const rate = Array.isArray(value) ? value[0] : value
    setCustomRemovalRate(rate / 100)
  }

  const handleFormatChange = (format: FormatPreset) => {
    setFormat(format)
    // Reset custom rate when selecting a format
    setCustomRemovalRate(null)
  }

  return (
    <Paper
      sx={{
        mb: 2,
        overflow: 'hidden',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}
    >
      {/* Header - Always visible */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
          }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon fontSize="small" color="action" />
          <Typography variant="subtitle2">
            Acceleration Settings
          </Typography>
          <Tooltip
            title="Configure how mana dorks and rocks are factored into castability calculations. The removal rate affects creature survival probability."
            arrow
          >
            <HelpOutlineIcon fontSize="small" sx={{ color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Quick status */}
          {producersInDeck.length > 0 ? (
            <Typography
              variant="caption"
              sx={{
                bgcolor: theme.palette.success.main,
                color: '#fff',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontSize: '0.65rem',
                fontWeight: 'bold'
              }}
            >
              {producersInDeck.reduce((sum, p) => sum + p.copies, 0)} ramp cards
            </Typography>
          ) : (
            <Typography
              variant="caption"
              sx={{
                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: 'text.disabled',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontSize: '0.65rem'
              }}
            >
              No ramp detected
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {settings.format.replace('_', ' ')} | {Math.round(removalRate * 100)}% removal
          </Typography>

          {/* Toggle acceleration display - disabled when no ramp cards */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={settings.showAcceleration && producersInDeck.length > 0}
                disabled={producersInDeck.length === 0}
                onChange={(e) => {
                  e.stopPropagation()
                  setShowAcceleration(e.target.checked)
                }}
              />
            }
            label={
              <Typography
                variant="caption"
                color={producersInDeck.length === 0 ? 'text.disabled' : 'text.secondary'}
              >
                Show ramp
              </Typography>
            }
            onClick={(e) => e.stopPropagation()}
            sx={{ mr: 1 }}
          />

          <IconButton
            size="small"
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Expandable settings */}
      <Collapse in={expanded}>
        <Box
          sx={{
            p: 2,
            pt: 1,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Format Preset */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Format Preset</InputLabel>
              <Select
                value={settings.format}
                label="Format Preset"
                onChange={(e) => handleFormatChange(e.target.value as FormatPreset)}
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Tooltip title={opt.description} placement="right">
                      <span>{opt.label}</span>
                    </Tooltip>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Play/Draw Toggle */}
            <FormControl size="small">
              <InputLabel>Starting</InputLabel>
              <Select
                value={settings.playDraw}
                label="Starting"
                onChange={(e) => setPlayDraw(e.target.value as 'PLAY' | 'DRAW')}
                sx={{ minWidth: 100 }}
              >
                <MenuItem value="PLAY">On the Play</MenuItem>
                <MenuItem value="DRAW">On the Draw</MenuItem>
              </Select>
            </FormControl>

            {/* Reset Button */}
            <Tooltip title="Reset to defaults">
              <IconButton size="small" onClick={resetToDefaults}>
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Custom Removal Rate Slider */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Creature Removal Rate
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {Math.round(removalRate * 100)}%
              </Typography>
            </Box>
            <Slider
              value={removalRate * 100}
              onChange={handleRemovalRateChange}
              min={0}
              max={60}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 20, label: '20%' },
                { value: 40, label: '40%' },
                { value: 60, label: '60%' }
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
              sx={{
                '& .MuiSlider-markLabel': {
                  fontSize: '0.65rem'
                }
              }}
            />
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              Higher removal rate = lower dork survival probability. Rocks are unaffected (~98% survival).
            </Typography>
          </Box>

          {/* Info box */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
            }}
          >
            <Typography variant="caption" color="text.secondary">
              <strong>How it works:</strong> Dork survival is calculated as (1 - removal_rate)^turns_exposed.
              A 35% removal rate means a T1 dork has ~65% chance of surviving to T2, ~42% to T3.
              Mana rocks have a fixed ~98% survival rate (artifact removal is less common).
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default AccelerationSettings
