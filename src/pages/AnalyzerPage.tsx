import React, { useState } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material'
import { MANA_COLORS, COLOR_NAMES } from '../types'
import { DeckAnalyzer, AnalysisResult } from '../services/deckAnalyzer'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analyzer-tabpanel-${index}`}
      aria-labelledby={`analyzer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export const AnalyzerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [deckList, setDeckList] = useState('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isDeckMinimized, setIsDeckMinimized] = useState(false)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleAnalyze = async () => {
    if (!deckList.trim()) {
      return
    }

    setIsAnalyzing(true)
    
    // Utilisation du vrai analyseur
    setTimeout(() => {
      try {
        const result = DeckAnalyzer.analyzeDeck(deckList)
        setAnalysisResult(result)
        // Minimiser automatiquement "Your Deck" quand les résultats s'affichent
        setIsDeckMinimized(true)
      } catch (error) {
        console.error('Erreur lors de l\'analyse:', error)
        // Fallback en cas d'erreur
        setAnalysisResult(null)
      }
      setIsAnalyzing(false)
    }, 1500)
  }

  const sampleDeck = `4 Lightning Bolt
4 Counterspell
4 Swords to Plowshares
4 Brainstorm
2 Jace, the Mind Sculptor
4 Delver of Secrets
2 Young Pyromancer
4 Ponder
2 Force of Will
3 Path to Exile
2 Lightning Helix
1 Wrath of God

4 Flooded Strand
4 Scalding Tarn
2 Volcanic Island
2 Tundra
2 Island
2 Mountain
1 Plains
1 Sacred Foundry`

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <AnalyticsIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle' }} />
          ManaTuner Pro
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Analyze your manabase with the precision of Frank Karsten's mathematics
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Input Section */}
        <Grid item xs={12} lg={analysisResult && isDeckMinimized ? 2 : 6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: 'fit-content',
              cursor: analysisResult && isDeckMinimized ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out',
              '&:hover': analysisResult && isDeckMinimized ? {
                transform: 'scale(1.02)',
                boxShadow: 3
              } : {}
            }}
            onClick={() => {
              if (analysisResult && isDeckMinimized) {
                setIsDeckMinimized(false)
              }
            }}
          >
            <Typography variant="h5" gutterBottom>
              📝 Your Deck {analysisResult && isDeckMinimized && '(Click to expand)'}
            </Typography>
            
            {!isDeckMinimized && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  label="List of deck"
                  placeholder="Paste your decklist here...&#10;Format: 4 Lightning Bolt&#10;3 Counterspell&#10;..."
                  value={deckList}
                  onChange={(e) => setDeckList(e.target.value)}
                  sx={{ mb: 2 }}
                />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleAnalyze}
                  disabled={!deckList.trim() || isAnalyzing}
                  startIcon={isAnalyzing ? <SpeedIcon /> : <AnalyticsIcon />}
                  sx={{ flexGrow: 1 }}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Manabase'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => setDeckList(sampleDeck)}
                  startIcon={<AddIcon />}
                >
                  Example
                </Button>
              </Box>

                {isAnalyzing && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Calculating hypergeometric probabilities...
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Version minimisée - affichage du résumé */}
            {isDeckMinimized && analysisResult && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {analysisResult.totalCards} cards • {analysisResult.totalLands} lands
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click to expand deck editor
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={analysisResult && isDeckMinimized ? 10 : 6}>
          <Paper 
            sx={{ 
              p: 3, 
              minHeight: 600,
              cursor: analysisResult && !isDeckMinimized ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out',
              '&:hover': analysisResult && !isDeckMinimized ? {
                transform: 'scale(1.01)',
                boxShadow: 2
              } : {}
            }}
            onClick={() => {
              if (analysisResult && !isDeckMinimized) {
                setIsDeckMinimized(true)
              }
            }}
          >
            {!analysisResult ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AssessmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Enter your deck and click "Analyze" to see results
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  📊 Analysis Results {analysisResult && !isDeckMinimized && '(Click to minimize deck)'}
                </Typography>

                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                  <Tab label="Overview" />
                  <Tab label="Probabilities" />
                  <Tab label="Recommendations" />
                  <Tab label="Spell Analysis" />
                  <Tab label="Deck List" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {analysisResult.totalCards}
                          </Typography>
                          <Typography color="text.secondary">
                            Total Cards
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {analysisResult.totalLands}
                          </Typography>
                          <Typography color="text.secondary">
                            Lands
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {analysisResult.averageCMC.toFixed(1)}
                          </Typography>
                          <Typography color="text.secondary">
                            Average CMC
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {(analysisResult.landRatio * 100).toFixed(1)}%
                          </Typography>
                          <Typography color="text.secondary">
                            Land Ratio
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Color Distribution
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {MANA_COLORS.map(color => (
                      <Chip
                        key={color}
                        label={`${COLOR_NAMES[color]}: ${analysisResult.colorDistribution[color] || 0}`}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Overall Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={analysisResult.rating.toUpperCase()} 
                      color={
                        analysisResult.rating === 'excellent' ? 'success' :
                        analysisResult.rating === 'good' ? 'primary' :
                        analysisResult.rating === 'average' ? 'warning' : 'error'
                      }
                      size="medium"
                    />
                    <Typography variant="body1">
                      Consistency: {(analysisResult.consistency * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Probabilities by Turn
                  </Typography>
                  
                  {[1, 2, 3, 4].map(turn => {
                    const turnKey = `turn${turn}` as keyof typeof analysisResult.probabilities
                    return (
                      <Box key={turn} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Turn {turn}
                        </Typography>
                        <Grid container spacing={2}>
                          {MANA_COLORS.map(color => {
                            const prob = analysisResult.probabilities[turnKey]?.specificColors[color] || 0
                            return (
                              <Grid item xs={12} sm={6} md={4} key={color}>
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2">
                                    {COLOR_NAMES[color]}: {(prob * 100).toFixed(1)}%
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={prob * 100}
                                    sx={{ height: 8, borderRadius: 4 }}
                                  />
                                </Box>
                              </Grid>
                            )
                          })}
                        </Grid>
                      </Box>
                    )
                  })}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  
                  {analysisResult.recommendations.map((rec: string, index: number) => (
                    <Alert key={index} severity="info" sx={{ mb: 2 }}>
                      {rec}
                    </Alert>
                  ))}

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      💡 These recommendations are based on Frank Karsten's research and hypergeometric distribution calculations.
                    </Typography>
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <Typography variant="h6" gutterBottom>
                    Spell Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Probability of being able to play each spell with your current manabase
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.entries(analysisResult.spellAnalysis).map(([spellName, analysis]) => (
                      <Grid item xs={12} sm={6} md={4} key={spellName}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {spellName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h4" color="primary">
                                {analysis.percentage}%
                              </Typography>
                              <Chip 
                                label={
                                  analysis.percentage >= 90 ? 'Excellent' :
                                  analysis.percentage >= 80 ? 'Good' :
                                  analysis.percentage >= 70 ? 'Average' : 'Weak'
                                }
                                color={
                                  analysis.percentage >= 90 ? 'success' :
                                  analysis.percentage >= 80 ? 'primary' :
                                  analysis.percentage >= 70 ? 'warning' : 'error'
                                }
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {analysis.castable}/{analysis.total} playable copies
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={analysis.percentage}
                              sx={{ mt: 1, height: 6, borderRadius: 3 }}
                              color={
                                analysis.percentage >= 90 ? 'success' :
                                analysis.percentage >= 80 ? 'primary' :
                                analysis.percentage >= 70 ? 'warning' : 'error'
                              }
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      📈 This analysis is inspired by Charles Wickham's project algorithms and uses combination calculations to evaluate the playability of each spell.
                    </Typography>
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={4}>
                  <Typography variant="h6" gutterBottom>
                    📋 Deck List
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Click on any card name to view it on Scryfall
                  </Typography>
                  
                  {deckList.trim() ? (
                    <Grid container spacing={2}>
                      {deckList.split('\n').filter(line => line.trim()).map((line, index) => {
                        const match = line.match(/^(\d+)\s+(.+?)(?:\s*\([A-Z0-9]+\)\s*\d*)?$/);
                        if (!match) return null;
                        
                        const quantity = match[1];
                        const cardName = match[2].replace(/^A-/, '').trim();
                        const scryfallUrl = `https://scryfall.com/search?q=${encodeURIComponent(cardName)}`;
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  boxShadow: 2,
                                  transform: 'translateY(-2px)'
                                }
                              }}
                              onClick={() => window.open(scryfallUrl, '_blank')}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip 
                                    label={quantity}
                                    size="small"
                                    color="primary"
                                    sx={{ minWidth: 32 }}
                                  />
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      flexGrow: 1,
                                      '&:hover': { color: 'primary.main' }
                                    }}
                                  >
                                    {cardName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    🔗
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No deck list available. Please enter a deck list and analyze it first.
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      🔍 Cards are automatically linked to Scryfall for detailed information and pricing.
                    </Typography>
                  </Box>
                </TabPanel>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
} 