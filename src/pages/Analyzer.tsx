import React, { useState, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material'
import { DecklistInput } from '@/components/analyzer/DecklistInput'
import { AnalysisResults } from '@/components/analyzer/AnalysisResults'
import { ManabaseChart } from '@/components/analyzer/ManabaseChart'
import { RecommendationsList } from '@/components/analyzer/RecommendationsList'
import { analyzeDecklistText } from '@/services/scryfall'
import { analyzeCard, runManabaseSimulation } from '@/utils/manabase'
import type { Card, DeckCard, ManabaseAnalysis, SimulationParams } from '../types'

interface AnalysisState {
  loading: boolean
  error: string | null
  cards: Card[]
  notFound: string[]
  analysis: ManabaseAnalysis | null
}

const Analyzer: React.FC = () => {
  const [decklistText, setDecklistText] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    error: null,
    cards: [],
    notFound: [],
    analysis: null
  })

  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    iterations: 10000,
    mulliganStrategy: 'conservative',
    playFirst: true,
    maxMulligans: 2
  })

  const handleAnalyze = useCallback(async () => {
    if (!decklistText.trim()) {
      setAnalysis(prev => ({ ...prev, error: 'Please enter a decklist' }))
      return
    }

    setAnalysis(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Parse et récupère les cartes via Scryfall
      const result = await analyzeDecklistText(decklistText)
      
      if (result.notFound.length > 0) {
        console.warn('Cards not found:', result.notFound)
      }

      // Sépare les terrains des sorts
      const deckCards: DeckCard[] = result.cards.map(card => ({
        card,
        quantity: 1, // Sera ajusté selon la decklist parsée
        category: card.isLand ? 'land' : 
                 card.types.includes('Creature') ? 'creature' :
                 card.types.includes('Artifact') ? 'artifact' :
                 card.types.includes('Enchantment') ? 'enchantment' :
                 card.types.includes('Planeswalker') ? 'planeswalker' : 'spell'
      }))

      const lands = deckCards.filter(dc => dc.card.isLand)
      const spells = deckCards.filter(dc => !dc.card.isLand)

      // Analyse chaque sort
      const cardAnalyses = spells.map(spell => {
        const turnAnalysis = analyzeCard(
          spell.card,
          spell.quantity,
          lands,
          result.totalCards
        )

        return {
          card: spell.card,
          quantity: spell.quantity,
          turnAnalysis,
          reliability: turnAnalysis[2]?.castProbability > 0.9 ? 'excellent' :
                      turnAnalysis[2]?.castProbability > 0.8 ? 'good' :
                      turnAnalysis[2]?.castProbability > 0.6 ? 'marginal' : 'poor',
          recommendedSources: turnAnalysis[2]?.sources || []
        } as const
      })

      // Calcule la distribution de couleurs
      const colorDistribution: Record<string, number> = {}
      lands.forEach(land => {
        land.card.producedMana?.forEach(color => {
          colorDistribution[color] = (colorDistribution[color] || 0) + land.quantity
        })
      })

      const manabaseAnalysis: ManabaseAnalysis = {
        id: Date.now().toString(),
        deckId: 'temp',
        totalLands: lands.reduce((sum, land) => sum + land.quantity, 0),
        colorDistribution,
        cardAnalyses,
        recommendations: [], // Sera calculé séparément
        overallRating: cardAnalyses.reduce((sum, analysis) => {
          return sum + (analysis.turnAnalysis[2]?.castProbability || 0)
        }, 0) / cardAnalyses.length * 10,
        createdAt: new Date()
      }

      setAnalysis({
        loading: false,
        error: null,
        cards: result.cards,
        notFound: result.notFound,
        analysis: manabaseAnalysis
      })

    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysis(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }))
    }
  }, [decklistText])

  const handleRunSimulation = useCallback(async () => {
    if (!analysis.analysis) return

    try {
      const deckCards: DeckCard[] = analysis.cards.map(card => ({
        card,
        quantity: 1,
        category: card.isLand ? 'land' : 'spell'
      }))

      const simulation = runManabaseSimulation(deckCards, simulationParams)
      console.log('Simulation results:', simulation)
      
      // TODO: Update UI with simulation results
    } catch (error) {
      console.error('Simulation failed:', error)
    }
  }, [analysis.analysis, analysis.cards, simulationParams])

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
        <AnalyticsIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
        Manabase Analyzer
      </Typography>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Deck Import
            </Typography>
            
            <DecklistInput
              value={decklistText}
              onChange={setDecklistText}
              disabled={analysis.loading}
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={analysis.loading || !decklistText.trim()}
                startIcon={analysis.loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
              >
                {analysis.loading ? 'Analyzing...' : 'Analyze Manabase'}
              </Button>

              {analysis.analysis && (
                <Button
                  variant="outlined"
                  onClick={handleRunSimulation}
                  startIcon={<TimelineIcon />}
                >
                  Run Simulation
                </Button>
              )}
            </Box>

            {analysis.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {analysis.error}
              </Alert>
            )}

            {analysis.notFound.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Cards not found:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {analysis.notFound.map((cardName, index) => (
                    <Chip
                      key={index}
                      label={cardName}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {analysis.analysis ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Analysis Results
              </Typography>
              
              <AnalysisResults analysis={analysis.analysis} />
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <AnalyticsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">
                Import a decklist to see analysis
              </Typography>
              <Typography variant="body2">
                Paste your decklist in the format: "4 Lightning Bolt"
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Charts and Details */}
        {analysis.analysis && (
          <>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Manabase Visualization
                </Typography>
                <ManabaseChart analysis={analysis.analysis} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Recommendations
                </Typography>
                <RecommendationsList recommendations={analysis.analysis.recommendations} />
              </Paper>
            </Grid>

            {/* Advanced Options */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Simulation Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Iterations"
                        type="number"
                        value={simulationParams.iterations}
                        onChange={(e) => setSimulationParams(prev => ({
                          ...prev,
                          iterations: parseInt(e.target.value) || 10000
                        }))}
                        inputProps={{ min: 1000, max: 100000, step: 1000 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        select
                        label="Mulligan Strategy"
                        value={simulationParams.mulliganStrategy}
                        onChange={(e) => setSimulationParams(prev => ({
                          ...prev,
                          mulliganStrategy: e.target.value as any
                        }))}
                        SelectProps={{ native: true }}
                      >
                        <option value="none">No Mulligans</option>
                        <option value="conservative">Conservative</option>
                        <option value="aggressive">Aggressive</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Max Mulligans"
                        type="number"
                        value={simulationParams.maxMulligans}
                        onChange={(e) => setSimulationParams(prev => ({
                          ...prev,
                          maxMulligans: parseInt(e.target.value) || 2
                        }))}
                        inputProps={{ min: 0, max: 6 }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  )
}

export default Analyzer 