/**
 * Acceleration Context
 *
 * Provides global settings for mana acceleration calculations:
 * - Format preset (affects removal rate)
 * - Play/Draw preference
 * - Custom removal rate override
 *
 * @version 1.0
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { AccelContext, FormatPreset } from '../types/manaProducers'
import { FORMAT_REMOVAL_RATES } from '../types/manaProducers'

// =============================================================================
// TYPES
// =============================================================================

interface AccelerationSettings {
  /** Selected format preset */
  format: FormatPreset

  /** On the play or draw */
  playDraw: 'PLAY' | 'DRAW'

  /** Custom removal rate (overrides format preset if set) */
  customRemovalRate: number | null

  /** Whether to show acceleration data in UI */
  showAcceleration: boolean
}

interface AccelerationContextValue {
  /** Current settings */
  settings: AccelerationSettings

  /** Computed AccelContext for calculations */
  accelContext: AccelContext

  /** Current effective removal rate */
  removalRate: number

  /** Update format */
  setFormat: (format: FormatPreset) => void

  /** Update play/draw */
  setPlayDraw: (playDraw: 'PLAY' | 'DRAW') => void

  /** Set custom removal rate (null to use format preset) */
  setCustomRemovalRate: (rate: number | null) => void

  /** Toggle acceleration display */
  setShowAcceleration: (show: boolean) => void

  /** Reset to defaults */
  resetToDefaults: () => void
}

// =============================================================================
// DEFAULTS
// =============================================================================

const DEFAULT_SETTINGS: AccelerationSettings = {
  format: 'modern',
  playDraw: 'PLAY',
  customRemovalRate: null,
  showAcceleration: true
}

// =============================================================================
// CONTEXT
// =============================================================================

const AccelerationContext = createContext<AccelerationContextValue | null>(null)

// =============================================================================
// PROVIDER
// =============================================================================

interface AccelerationProviderProps {
  children: React.ReactNode
}

export const AccelerationProvider: React.FC<AccelerationProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccelerationSettings>(() => {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem('manatuner_acceleration_settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (e) {
      console.warn('Failed to load acceleration settings:', e)
    }
    return DEFAULT_SETTINGS
  })

  // Persist settings to localStorage
  const persistSettings = useCallback((newSettings: AccelerationSettings) => {
    try {
      localStorage.setItem('manatuner_acceleration_settings', JSON.stringify(newSettings))
    } catch (e) {
      console.warn('Failed to persist acceleration settings:', e)
    }
  }, [])

  // Calculate effective removal rate
  const removalRate = useMemo(() => {
    if (settings.customRemovalRate !== null) {
      return settings.customRemovalRate
    }
    return FORMAT_REMOVAL_RATES[settings.format]
  }, [settings.format, settings.customRemovalRate])

  // Build AccelContext for calculations
  const accelContext = useMemo<AccelContext>(() => ({
    playDraw: settings.playDraw,
    removalRate,
    defaultRockSurvival: 0.98
  }), [settings.playDraw, removalRate])

  // Setters
  const setFormat = useCallback((format: FormatPreset) => {
    setSettings(prev => {
      const updated = { ...prev, format, customRemovalRate: null }
      persistSettings(updated)
      return updated
    })
  }, [persistSettings])

  const setPlayDraw = useCallback((playDraw: 'PLAY' | 'DRAW') => {
    setSettings(prev => {
      const updated = { ...prev, playDraw }
      persistSettings(updated)
      return updated
    })
  }, [persistSettings])

  const setCustomRemovalRate = useCallback((rate: number | null) => {
    setSettings(prev => {
      const updated = { ...prev, customRemovalRate: rate }
      persistSettings(updated)
      return updated
    })
  }, [persistSettings])

  const setShowAcceleration = useCallback((show: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, showAcceleration: show }
      persistSettings(updated)
      return updated
    })
  }, [persistSettings])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    persistSettings(DEFAULT_SETTINGS)
  }, [persistSettings])

  const value = useMemo<AccelerationContextValue>(() => ({
    settings,
    accelContext,
    removalRate,
    setFormat,
    setPlayDraw,
    setCustomRemovalRate,
    setShowAcceleration,
    resetToDefaults
  }), [settings, accelContext, removalRate, setFormat, setPlayDraw, setCustomRemovalRate, setShowAcceleration, resetToDefaults])

  return (
    <AccelerationContext.Provider value={value}>
      {children}
    </AccelerationContext.Provider>
  )
}

// =============================================================================
// HOOK
// =============================================================================

export function useAcceleration(): AccelerationContextValue {
  const context = useContext(AccelerationContext)
  if (!context) {
    throw new Error('useAcceleration must be used within an AccelerationProvider')
  }
  return context
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { AccelerationContextValue, AccelerationSettings }
