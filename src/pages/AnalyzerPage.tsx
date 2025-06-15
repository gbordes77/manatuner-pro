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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Terrain as TerrainIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { MANA_COLORS, COLOR_NAMES } from '../types'
import { DeckAnalyzer, AnalysisResult } from '../services/deckAnalyzer'
import { CardImageTooltip } from '../components/CardImageTooltip'
import { detectLandHybrid } from '../utils/hybridLandDetection'

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
    setTimeout(async () => {
      try {
        const result = await DeckAnalyzer.analyzeDeck(deckList)
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
                  <Tab label="Manabase" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => setActiveTab(4)} // Onglet Deck List
                      >
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {analysisResult.totalCards}
                          </Typography>
                          <Typography color="text.secondary">
                            Total Cards
                          </Typography>
                          <ViewListIcon sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.3 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => setActiveTab(5)} // Onglet Manabase
                      >
                        <CardContent sx={{ position: 'relative' }}>
                          <Typography variant="h4" color="primary">
                            {analysisResult.totalLands}
                          </Typography>
                          <Typography color="text.secondary">
                            Lands
                          </Typography>
                          <TerrainIcon sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.3 }} />
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
                    {MANA_COLORS.map(color => {
                      const count = analysisResult.colorDistribution[color] || 0;
                      if (count === 0) return null;
                      
                      const colorMap = {
                        'W': { bg: '#FFF8DC', text: '#2C3E50' },
                        'U': { bg: '#4A90E2', text: '#FFFFFF' },
                        'B': { bg: '#2C2C2C', text: '#FFFFFF' },
                        'R': { bg: '#E74C3C', text: '#FFFFFF' },
                        'G': { bg: '#27AE60', text: '#FFFFFF' }
                      };
                      
                      return (
                        <Chip
                          key={color}
                          label={`${COLOR_NAMES[color]}: ${count}`}
                          sx={{
                            backgroundColor: colorMap[color]?.bg || '#95A5A6',
                            color: colorMap[color]?.text || '#2C3E50',
                            fontWeight: 'bold',
                            '& .MuiChip-label': {
                              color: colorMap[color]?.text || '#2C3E50'
                            }
                          }}
                        />
                      );
                    })}
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
                            <CardImageTooltip cardName={cardName}>
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
                            </CardImageTooltip>
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

                <TabPanel value={activeTab} index={5}>
                  <Typography variant="h6" gutterBottom>
                    🏔️ Manabase Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Detailed analysis of your land base and mana production capabilities. Click on any land name to view it on Scryfall.
                  </Typography>

                  <Grid container spacing={4}>
                    {/* Liste des terrains */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          📋 Land Breakdown
                        </Typography>
                        
                        {(() => {
                          // Analyser les terrains du deck avec la logique hybride complète
                          const landCounts: Record<string, number> = {}
                          const landTypes: Record<string, string[]> = {}
                          
                          // Utiliser la détection hybride complète
                          deckList.split('\n').filter(line => line.trim()).forEach(line => {
                            const match = line.match(/^(\d+)\s+(.+?)(?:\s*\([A-Z0-9]+\)\s*\d*)?$/);
                            if (!match) return;
                            
                            const quantity = parseInt(match[1]);
                            const cardName = match[2].replace(/^A-/, '').trim();
                            
                            // Utiliser la détection hybride complète
                            const isLand = isLandCardComplete(cardName);
                            
                            if (isLand) {
                              landCounts[cardName] = quantity;
                              
                              // Catégorisation complète
                              const type = categorizeLandComplete(cardName);
                              
                              if (!landTypes[type]) landTypes[type] = [];
                              landTypes[type].push(`${quantity}x ${cardName}`);
                            }
                          });
                          
                          // Fonction de détection complète utilisant notre base de données
                          function isLandCardComplete(name: string): boolean {
                            const lowerName = name.toLowerCase();
                            
                            // Liste complète des lands connus
                            const knownLands = new Set([
                              // Basic Lands
                              'plains', 'island', 'swamp', 'mountain', 'forest', 'wastes',
                              'snow-covered plains', 'snow-covered island', 'snow-covered swamp', 
                              'snow-covered mountain', 'snow-covered forest',
                              
                              // Fetchlands
                              'flooded strand', 'polluted delta', 'bloodstained mire', 'wooded foothills', 'windswept heath',
                              'scalding tarn', 'verdant catacombs', 'arid mesa', 'misty rainforest', 'marsh flats',
                              'prismatic vista', 'fabled passage', 'evolving wilds', 'terramorphic expanse',
                              
                              // Shocklands
                              'hallowed fountain', 'watery grave', 'blood crypt', 'stomping ground', 'temple garden',
                              'sacred foundry', 'godless shrine', 'steam vents', 'overgrown tomb', 'breeding pool',
                              
                              // Fastlands
                              'seachrome coast', 'darkslick shores', 'blackcleave cliffs', 'copperline gorge', 'razorverge thicket',
                              'inspiring vantage', 'concealed courtyard', 'spirebluff canal', 'blooming marsh', 'botanical sanctum',
                              
                              // Horizon Lands
                              'sunbaked canyon', 'waterlogged grove', 'nurturing peatland', 'silent clearing', 'fiery islet',
                              'horizon canopy', 'grove of the burnwillows',
                              
                              // Utility Lands
                              'mana confluence', 'city of brass', 'gemstone mine', 'grand coliseum', 'pillar of the paruns',
                              'unclaimed territory', 'ancient ziggurat', 'cavern of souls', 'mutavault',
                              
                              // Recent Lands
                              'starting town', 'elegant parlor', 'lush portico', 'meticulous archive', 'raucous theater',
                              'undercity sewers', 'blazemire verge', 'foreboding landscape', 'hedge maze', 'promising vein'
                            ]);
                            
                            // Vérification directe
                            if (knownLands.has(lowerName)) {
                              return true;
                            }
                            
                            // Mots-clés étendus pour les lands non listés
                            const landKeywords = [
                              'plains', 'island', 'swamp', 'mountain', 'forest',
                              'land', 'strand', 'tarn', 'mesa', 'foothills', 'delta', 'mire',
                              'catacombs', 'flats', 'temple', 'sanctuary', 'grove', 'cavern',
                              'confluence', 'pool', 'garden', 'vents', 'foundry', 'tomb',
                              'grave', 'shrine', 'ground', 'crypt', 'sanctum', 'shores',
                              'marsh', 'tower', 'coast', 'cliffs', 'gorge', 'thicket',
                              'vantage', 'courtyard', 'canal', 'town', 'parlor', 'portico',
                              'archive', 'theater', 'sewers', 'verge', 'landscape', 'maze',
                              'canyon', 'clearing', 'peatland', 'islet', 'citadel', 'monastery',
                              'outpost', 'bivouac', 'palace', 'headquarters', 'lounge'
                            ];
                            
                            return landKeywords.some(keyword => lowerName.includes(keyword));
                          }
                          
                          // Fonction de catégorisation complète
                          function categorizeLandComplete(name: string): string {
                            const lowerName = name.toLowerCase();
                            
                            // Basic Lands
                            if (['plains', 'island', 'swamp', 'mountain', 'forest', 'wastes'].includes(lowerName) ||
                                lowerName.includes('snow-covered')) {
                              return 'Basic Land';
                            }
                            
                            // Fetchlands
                            if (['flooded strand', 'polluted delta', 'bloodstained mire', 'wooded foothills', 'windswept heath',
                                 'scalding tarn', 'verdant catacombs', 'arid mesa', 'misty rainforest', 'marsh flats',
                                 'prismatic vista', 'fabled passage', 'evolving wilds', 'terramorphic expanse'].includes(lowerName)) {
                              return 'Fetchland';
                            }
                            
                            // Shocklands
                            if (['hallowed fountain', 'watery grave', 'blood crypt', 'stomping ground', 'temple garden',
                                 'sacred foundry', 'godless shrine', 'steam vents', 'overgrown tomb', 'breeding pool'].includes(lowerName)) {
                              return 'Shockland';
                            }
                            
                            // Fastlands
                            if (['seachrome coast', 'darkslick shores', 'blackcleave cliffs', 'copperline gorge', 'razorverge thicket',
                                 'inspiring vantage', 'concealed courtyard', 'spirebluff canal', 'blooming marsh', 'botanical sanctum'].includes(lowerName)) {
                              return 'Fastland';
                            }
                            
                            // Horizon Lands
                            if (['sunbaked canyon', 'waterlogged grove', 'nurturing peatland', 'silent clearing', 'fiery islet',
                                 'horizon canopy', 'grove of the burnwillows'].includes(lowerName)) {
                              return 'Horizon Land';
                            }
                            
                            // Utility Lands avec mécaniques spéciales
                            if (['starting town', 'mana confluence', 'city of brass', 'gemstone mine', 'grand coliseum', 
                                 'pillar of the paruns', 'unclaimed territory', 'ancient ziggurat', 'cavern of souls'].includes(lowerName)) {
                              return 'Utility Land';
                            }
                            
                            // Fallback par mots-clés
                            if (['strand', 'tarn', 'mesa', 'foothills', 'delta', 'mire', 'catacombs', 'flats'].some(fetch => lowerName.includes(fetch))) {
                              return 'Fetchland';
                            }
                            if (['fountain', 'grave', 'crypt', 'ground', 'garden', 'foundry', 'shrine', 'vents', 'tomb', 'pool'].some(shock => lowerName.includes(shock))) {
                              return 'Shockland';
                            }
                            if (['coast', 'shores', 'cliffs', 'gorge', 'thicket', 'vantage', 'courtyard', 'canal', 'marsh'].some(fast => lowerName.includes(fast))) {
                              return 'Fastland';
                            }
                            if (['canyon', 'grove', 'peatland', 'clearing', 'islet'].some(horizon => lowerName.includes(horizon))) {
                              return 'Horizon Land';
                            }
                            
                            return 'Other Land';
                          }
                          
                          return (
                            <List>
                              {Object.entries(landTypes).map(([type, lands]) => (
                                <Box key={type}>
                                  <ListItem>
                                    <ListItemIcon>
                                      <TerrainIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography variant="subtitle1" fontWeight="bold">
                                          {type} ({lands.length} types)
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                  {lands.map((land, index) => {
                                    // Extraire le nom de la carte du format "4x Card Name"
                                    const match = land.match(/^(\d+)x\s+(.+)$/);
                                    if (!match) return null;
                                    
                                    const quantity = match[1];
                                    const cardName = match[2].trim();
                                    const scryfallUrl = `https://scryfall.com/search?q=${encodeURIComponent(cardName)}`;
                                    
                                    return (
                                      <ListItem key={index} sx={{ pl: 4, py: 0.5 }}>
                                        <CardImageTooltip cardName={cardName}>
                                          <Card 
                                            variant="outlined" 
                                            sx={{ 
                                              width: '100%',
                                              cursor: 'pointer',
                                              transition: 'all 0.2s',
                                              '&:hover': {
                                                boxShadow: 1,
                                                transform: 'translateY(-1px)',
                                                backgroundColor: 'action.hover'
                                              }
                                            }}
                                            onClick={() => window.open(scryfallUrl, '_blank')}
                                          >
                                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip 
                                                  label={quantity}
                                                  size="small"
                                                  color="primary"
                                                  sx={{ minWidth: 28, fontSize: '0.75rem' }}
                                                />
                                                <Typography 
                                                  variant="body2" 
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
                                        </CardImageTooltip>
                                      </ListItem>
                                    );
                                  })}
                                  <Divider sx={{ my: 1 }} />
                                </Box>
                              ))}
                            </List>
                          );
                        })()}
                      </Paper>
                    </Grid>

                    {/* Graphiques */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          📊 Mana Production Distribution
                        </Typography>
                        
                        {(() => {
                          // Préparer les données pour le graphique camembert
                          const colorData = MANA_COLORS.map(color => ({
                            name: COLOR_NAMES[color],
                            value: analysisResult.colorDistribution[color] || 0,
                            color: {
                              'W': '#FFF8DC',  // Blanc crème pour meilleure lisibilité
                              'U': '#4A90E2',  // Bleu plus clair
                              'B': '#2C2C2C',  // Noir plus clair pour le texte
                              'R': '#E74C3C',  // Rouge vif
                              'G': '#27AE60'   // Vert plus vif
                            }[color] || '#95A5A6',
                            textColor: {
                              'W': '#2C3E50',  // Texte sombre sur fond clair
                              'U': '#FFFFFF',  // Texte blanc sur bleu
                              'B': '#FFFFFF',  // Texte blanc sur noir
                              'R': '#FFFFFF',  // Texte blanc sur rouge
                              'G': '#FFFFFF'   // Texte blanc sur vert
                            }[color] || '#2C3E50'
                          })).filter(item => item.value > 0);

                          const totalMana = colorData.reduce((sum, item) => sum + item.value, 0);

                          return (
                            <Box>
                              {colorData.length > 0 ? (
                                <>
                                  <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                      <Pie
                                        data={colorData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value, percent }) => 
                                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                      >
                                        {colorData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                                        ))}
                                      </Pie>
                                      <Tooltip />
                                    </PieChart>
                                  </ResponsiveContainer>
                                  
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Color Requirements Summary:
                                    </Typography>
                                    {colorData.map((item, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box 
                                          sx={{ 
                                            width: 20, 
                                            height: 20, 
                                            backgroundColor: item.color,
                                            border: '1px solid #ddd',
                                            borderRadius: 1,
                                            mr: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            color: item.textColor
                                          }} 
                                        >
                                          {MANA_COLORS.find(c => COLOR_NAMES[c] === item.name)}
                                        </Box>
                                        <Typography variant="body2">
                                          {item.name}: {item.value} sources ({((item.value / totalMana) * 100).toFixed(1)}%)
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </>
                              ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    No mana requirements detected. This might be a colorless deck or the analysis needs more data.
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          );
                        })()}
                      </Paper>
                    </Grid>

                    {/* Statistiques de la manabase */}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          📈 Manabase Statistics
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary">
                                {analysisResult.totalLands}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Total Lands
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary">
                                {(analysisResult.landRatio * 100).toFixed(1)}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Land Ratio
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary">
                                {Object.values(analysisResult.colorDistribution).filter(v => v > 0).length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Colors Used
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary">
                                {analysisResult.averageCMC.toFixed(1)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Average CMC
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      🏔️ This manabase analysis helps you understand your land distribution and mana production capabilities for optimal deck performance.
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