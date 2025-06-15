import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Card, Deck, ManabaseAnalysis } from '../../types'

interface DeckState {
  currentDeck: Deck | null
  savedDecks: Deck[]
  analysis: ManabaseAnalysis | null
  isAnalyzing: boolean
  error: string | null
}

const initialState: DeckState = {
  currentDeck: null,
  savedDecks: [],
  analysis: null,
  isAnalyzing: false,
  error: null
}

const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    setCurrentDeck: (state, action: PayloadAction<Deck>) => {
      state.currentDeck = action.payload
      state.error = null
    },
    
    addCardToDeck: (state, action: PayloadAction<{ card: Card; quantity: number }>) => {
      if (!state.currentDeck) {
        state.currentDeck = {
          id: Date.now().toString(),
          name: 'New Deck',
          format: 'standard',
          cards: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      
      const existingCardIndex = state.currentDeck.cards.findIndex(
        c => c.card.id === action.payload.card.id
      )
      
      if (existingCardIndex >= 0) {
        state.currentDeck.cards[existingCardIndex].quantity += action.payload.quantity
      } else {
        state.currentDeck.cards.push(action.payload)
      }
      
      state.currentDeck.updatedAt = new Date().toISOString()
    },
    
    removeCardFromDeck: (state, action: PayloadAction<string>) => {
      if (state.currentDeck) {
        state.currentDeck.cards = state.currentDeck.cards.filter(
          c => c.card.id !== action.payload
        )
        state.currentDeck.updatedAt = new Date().toISOString()
      }
    },
    
    updateCardQuantity: (state, action: PayloadAction<{ cardId: string; quantity: number }>) => {
      if (state.currentDeck) {
        const cardIndex = state.currentDeck.cards.findIndex(
          c => c.card.id === action.payload.cardId
        )
        
        if (cardIndex >= 0) {
          if (action.payload.quantity <= 0) {
            state.currentDeck.cards.splice(cardIndex, 1)
          } else {
            state.currentDeck.cards[cardIndex].quantity = action.payload.quantity
          }
          state.currentDeck.updatedAt = new Date().toISOString()
        }
      }
    },
    
    saveDeck: (state) => {
      if (state.currentDeck) {
        const existingIndex = state.savedDecks.findIndex(
          d => d.id === state.currentDeck!.id
        )
        
        if (existingIndex >= 0) {
          state.savedDecks[existingIndex] = { ...state.currentDeck }
        } else {
          state.savedDecks.push({ ...state.currentDeck })
        }
      }
    },
    
    loadDeck: (state, action: PayloadAction<string>) => {
      const deck = state.savedDecks.find(d => d.id === action.payload)
      if (deck) {
        state.currentDeck = { ...deck }
      }
    },
    
    deleteDeck: (state, action: PayloadAction<string>) => {
      state.savedDecks = state.savedDecks.filter(d => d.id !== action.payload)
      if (state.currentDeck?.id === action.payload) {
        state.currentDeck = null
      }
    },
    
    setAnalysis: (state, action: PayloadAction<ManabaseAnalysis>) => {
      state.analysis = action.payload
      state.isAnalyzing = false
      state.error = null
    },
    
    setAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isAnalyzing = false
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    clearAnalysis: (state) => {
      state.analysis = null
    },
    
    resetDeck: (state) => {
      state.currentDeck = null
      state.analysis = null
      state.error = null
      state.isAnalyzing = false
    }
  }
})

export const {
  setCurrentDeck,
  addCardToDeck,
  removeCardFromDeck,
  updateCardQuantity,
  saveDeck,
  loadDeck,
  deleteDeck,
  setAnalysis,
  setAnalyzing,
  setError,
  clearError,
  clearAnalysis,
  resetDeck
} = deckSlice.actions

export default deckSlice.reducer 