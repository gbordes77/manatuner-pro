import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { HelmetProvider } from 'react-helmet-async'
import analyzerReducer from '../src/store/slices/analyzerSlice'

// Créer un store de test
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      analyzer: analyzerReducer,
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
    <HelmetProvider>
      <Provider store={store}>{children}</Provider>
    </HelmetProvider>
  )

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}
