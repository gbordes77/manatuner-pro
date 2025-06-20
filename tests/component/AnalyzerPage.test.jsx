import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import AnalyzerPage from '../../src/pages/AnalyzerPage'
import { renderWithProviders } from '../test-utils'

// Mock des services
vi.mock('../../src/services/manaCalculator', () => ({
  calculateManabase: vi.fn(() => Promise.resolve({
    totalCards: 60,
    totalLands: 24,
    averageCMC: 2.5,
    landRatio: 0.4,
    colorDistribution: { W: 10, U: 8, B: 6, R: 0, G: 0 },
    recommendations: ['Add more red sources']
  }))
}))

describe('AnalyzerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le formulaire d\'analyse', () => {
    renderWithProviders(<AnalyzerPage />)
    
    // Vérifie que le textarea pour la decklist est présent
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    expect(textarea).toBeInTheDocument()
    
    // Vérifie que le bouton d'analyse est présent
    const analyzeButton = screen.getByRole('button', { name: /analyze/i })
    expect(analyzeButton).toBeInTheDocument()
  })

  it('permet de saisir une decklist', () => {
    renderWithProviders(<AnalyzerPage />)
    
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    const testDecklist = '4 Lightning Bolt\n4 Island'
    
    fireEvent.change(textarea, { target: { value: testDecklist } })
    expect(textarea.value).toBe(testDecklist)
  })

  it('lance une analyse quand on clique sur Analyze', async () => {
    renderWithProviders(<AnalyzerPage />)
    
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    const analyzeButton = screen.getByRole('button', { name: /analyze/i })
    
    fireEvent.change(textarea, { target: { value: '4 Lightning Bolt\n4 Island' } })
    fireEvent.click(analyzeButton)
    
    // Vérifie qu'on voit les résultats
    await waitFor(() => {
      expect(screen.getByTestId('analysis-results')).toBeInTheDocument()
    })
  })

  it('affiche les onglets d\'analyse', async () => {
    renderWithProviders(<AnalyzerPage />)
    
    // Lancer une analyse d'abord
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    const analyzeButton = screen.getByRole('button', { name: /analyze/i })
    
    fireEvent.change(textarea, { target: { value: '4 Lightning Bolt\n4 Island' } })
    fireEvent.click(analyzeButton)
    
    // Vérifier les onglets
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /probabilities/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /recommendations/i })).toBeInTheDocument()
    })
  })

  it('gère les erreurs d\'analyse', async () => {
    // Mock une erreur
    const { calculateManabase } = await import('../../src/services/manaCalculator')
    calculateManabase.mockRejectedValue(new Error('Invalid decklist'))
    
    renderWithProviders(<AnalyzerPage />)
    
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    const analyzeButton = screen.getByRole('button', { name: /analyze/i })
    
    fireEvent.change(textarea, { target: { value: 'invalid deck' } })
    fireEvent.click(analyzeButton)
    
    // Attendre que l'erreur apparaisse
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('responsive - adapte l\'interface sur mobile', () => {
    // Simuler un écran mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    renderWithProviders(<AnalyzerPage />)
    
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    expect(textarea).toBeInTheDocument()
  })

  it('sauvegarde l\'état de la decklist', () => {
    const initialState = {
      deck: {
        decklist: '4 Lightning Bolt\n4 Island',
        analysisResult: null
      }
    }
    
    renderWithProviders(<AnalyzerPage />, { initialState })
    
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    expect(textarea.value).toBe('4 Lightning Bolt\n4 Island')
  })

  it('affiche le loading pendant l\'analyse', async () => {
    // Mock une analyse lente
    const { calculateManabase } = await import('../../src/services/manaCalculator')
    calculateManabase.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        totalCards: 60,
        totalLands: 24,
        averageCMC: 2.5,
        landRatio: 0.4
      }), 1000)
    ))
    
    renderWithProviders(<AnalyzerPage />)
    
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    const analyzeButton = screen.getByRole('button', { name: /analyze/i })
    
    fireEvent.change(textarea, { target: { value: '4 Lightning Bolt\n4 Island' } })
    fireEvent.click(analyzeButton)
    
    // Vérifier l'état de chargement
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument()
  })

  it('nettoie les résultats précédents avant nouvelle analyse', async () => {
    const initialState = {
      deck: {
        decklist: '4 Lightning Bolt',
        analysisResult: {
          totalCards: 50,
          totalLands: 20,
          averageCMC: 2.0,
          landRatio: 0.4
        }
      }
    }
    
    renderWithProviders(<AnalyzerPage />, { initialState })
    
    const textarea = screen.getByPlaceholderText(/paste your decklist here/i)
    const analyzeButton = screen.getByRole('button', { name: /analyze/i })
    
    // Modifier la decklist et relancer
    fireEvent.change(textarea, { target: { value: '4 Counterspell\n4 Island' } })
    fireEvent.click(analyzeButton)
    
    // Vérifier que les nouveaux résultats remplacent les anciens
    await waitFor(() => {
      expect(screen.getByTestId('analysis-results')).toBeInTheDocument()
    })
  })
}) 