import React from 'react'
import { render } from '@testing-library/react'

// Fonction utilitaire pour les tests de composants React (version simplifiée sans thème)
export const renderWithProviders = (
  ui,
  renderOptions = {}
) => {
  return render(ui, renderOptions)
} 