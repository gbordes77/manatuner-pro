import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AnalysisResult } from '../../services/deckAnalyzer'

interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'warning' | 'error' | 'info'
}

interface AnalyzerState {
  deckList: string
  analysisResult: AnalysisResult | null
  isAnalyzing: boolean
  isDeckMinimized: boolean
  activeTab: number
  snackbar: SnackbarState
}

const initialState: AnalyzerState = {
  deckList: '',
  analysisResult: null,
  isAnalyzing: false,
  isDeckMinimized: false,
  activeTab: 0,
  snackbar: {
    open: false,
    message: '',
    severity: 'success',
  },
}

const analyzerSlice = createSlice({
  name: 'analyzer',
  initialState,
  reducers: {
    setDeckList: (state, action: PayloadAction<string>) => {
      state.deckList = action.payload
    },

    setAnalysisResult: (state, action: PayloadAction<AnalysisResult | null>) => {
      state.analysisResult = action.payload
      state.isAnalyzing = false
      if (action.payload) {
        state.isDeckMinimized = true
      }
    },

    setIsAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload
    },

    setIsDeckMinimized: (state, action: PayloadAction<boolean>) => {
      state.isDeckMinimized = action.payload
    },

    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTab = action.payload
    },

    showSnackbar: (state, action: PayloadAction<Omit<SnackbarState, 'open'>>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity,
      }
    },

    hideSnackbar: (state) => {
      state.snackbar.open = false
    },

    clearAnalyzer: (state) => {
      state.deckList = ''
      state.analysisResult = null
      state.isDeckMinimized = false
      state.activeTab = 0
    },

    // Hydrate from localStorage (for initial load)
    hydrateFromStorage: (state, action: PayloadAction<Partial<AnalyzerState>>) => {
      if (action.payload.deckList !== undefined) {
        state.deckList = action.payload.deckList
      }
      if (action.payload.analysisResult !== undefined) {
        state.analysisResult = action.payload.analysisResult
      }
      if (action.payload.isDeckMinimized !== undefined) {
        state.isDeckMinimized = action.payload.isDeckMinimized
      }
    },
  },
})

export const {
  setDeckList,
  setAnalysisResult,
  setIsAnalyzing,
  setIsDeckMinimized,
  setActiveTab,
  showSnackbar,
  hideSnackbar,
  clearAnalyzer,
  hydrateFromStorage,
} = analyzerSlice.actions

export default analyzerSlice.reducer
