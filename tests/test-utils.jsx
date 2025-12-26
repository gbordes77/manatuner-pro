import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import analyzerReducer from '../src/store/slices/analyzerSlice'
import deckReducer from '../src/store/slices/deckSlice'
import analysisReducer from '../src/store/slices/analysisSlice'
import uiReducer from '../src/store/slices/uiSlice'
import authReducer from '../src/store/slices/authSlice'

// Créer un store de test
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      analyzer: analyzerReducer,
      deck: deckReducer,
      analysis: analysisReducer,
      ui: uiReducer,
      auth: authReducer,
    },
    preloadedState,
  })
}

// Fonction utilitaire pour les tests de composants React avec Redux
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  )

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}
