import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ManabaseAnalysis, SimulationResult } from '../../types'

interface AnalysisState {
  currentAnalysis: ManabaseAnalysis | null
  isAnalyzing: boolean
  simulationResults: SimulationResult[]
  history: ManabaseAnalysis[]
  error: string | null
  progress: number
}

const initialState: AnalysisState = {
  currentAnalysis: null,
  isAnalyzing: false,
  simulationResults: [],
  history: [],
  error: null,
  progress: 0
}

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    startAnalysis: (state) => {
      state.isAnalyzing = true
      state.error = null
      state.progress = 0
    },
    
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = Math.max(0, Math.min(100, action.payload))
    },
    
    setAnalysisResult: (state, action: PayloadAction<ManabaseAnalysis>) => {
      state.currentAnalysis = action.payload
      state.isAnalyzing = false
      state.progress = 100
      state.error = null
      
      // Add to history
      const existingIndex = state.history.findIndex(
        analysis => analysis.deckId === action.payload.deckId
      )
      
      if (existingIndex >= 0) {
        state.history[existingIndex] = action.payload
      } else {
        state.history.unshift(action.payload)
        // Keep only last 10 analyses
        if (state.history.length > 10) {
          state.history = state.history.slice(0, 10)
        }
      }
    },
    
    setSimulationResults: (state, action: PayloadAction<SimulationResult[]>) => {
      state.simulationResults = action.payload
    },
    
    addSimulationResult: (state, action: PayloadAction<SimulationResult>) => {
      state.simulationResults.push(action.payload)
    },
    
    setAnalysisError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isAnalyzing = false
      state.progress = 0
    },
    
    clearAnalysisError: (state) => {
      state.error = null
    },
    
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null
      state.simulationResults = []
      state.progress = 0
    },
    
    clearAnalysisHistory: (state) => {
      state.history = []
    },
    
    removeFromHistory: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(
        analysis => analysis.id !== action.payload
      )
    },
    
    resetAnalysisState: (state) => {
      return initialState
    }
  }
})

export const {
  startAnalysis,
  setProgress,
  setAnalysisResult,
  setSimulationResults,
  addSimulationResult,
  setAnalysisError,
  clearAnalysisError,
  clearCurrentAnalysis,
  clearAnalysisHistory,
  removeFromHistory,
  resetAnalysisState
} = analysisSlice.actions

export default analysisSlice.reducer 