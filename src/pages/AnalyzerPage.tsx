import React, { useState, useEffect } from 'react'
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
  Snackbar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Terrain as TerrainIcon,
  ViewList as ViewListIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { MANA_COLORS, COLOR_NAMES } from '../types'
import { DeckAnalyzer, AnalysisResult } from '../services/deckAnalyzer'
import { CardImageTooltip } from '../components/CardImageTooltip'
import { detectLandHybrid } from '../utils/hybridLandDetection'
import ManaCostRow from '../components/ManaCostRow'
import EnhancedCharts from '../components/EnhancedCharts'
import EnhancedRecommendations from '../components/EnhancedRecommendations'
import EnhancedSpellAnalysis from '../components/EnhancedSpellAnalysis'
import { ResponsiveTable } from '../components/ResponsiveTable'
import AnalysisActions from '../components/AnalysisActions'
import PrivacySettings from '../components/PrivacySettings'
import { ManaCalculator } from '../services/manaCalculator'

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

// Fonction de détection complète utilisant notre base de données
function isLandCardComplete(name: string): boolean {
  const lowerName = name.toLowerCase();
  
  // Liste complète des lands connus (synchronisée avec landDetection.ts)
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
    
    // Checklands
    'glacial fortress', 'drowned catacomb', 'dragonskull summit', 'rootbound crag', 'sunpetal grove',
    'clifftop retreat', 'isolated chapel', 'sulfur falls', 'woodland cemetery', 'hinterland harbor',
    
    // Horizon Lands
    'sunbaked canyon', 'waterlogged grove', 'nurturing peatland', 'silent clearing', 'fiery islet',
    'horizon canopy', 'grove of the burnwillows',
    
    // Utility Lands
    'mana confluence', 'city of brass', 'gemstone mine', 'grand coliseum', 'pillar of the paruns',
    'unclaimed territory', 'ancient ziggurat', 'cavern of souls', 'mutavault',
    
    // Recent Lands (Murders at Karlov Manor et autres)
    'starting town', 'elegant parlor', 'lush portico', 'meticulous archive', 'raucous theater',
    'undercity sewers', 'blazemire verge', 'foreboding landscape', 'hedge maze', 'promising vein',
    'shadowy backstreet', 'underground mortuary', 'commercial district', 'thundering falls',
    'arena of glory', 'command tower', 'reflecting pool', 'exotic orchard'
  ]);
  
  // Vérification directe
  if (knownLands.has(lowerName)) {
    return true;
  }
  
  // Mots-clés étendus pour les lands non listés (synchronisé avec landDetection.ts)
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
    'outpost', 'bivouac', 'palace', 'headquarters', 'lounge',
    // Nouveaux mots-clés pour les terrains récents
    'backstreet', 'mortuary', 'district', 'arena', 'command',
    'opal', 'path', 'ancestry', 'secluded', 'commercial',
    'thundering', 'underground', 'restless', 'promising',
    'foreboding', 'blazemire', 'undercity', 'elegant',
    'lush', 'meticulous', 'raucous', 'hedge'
  ];
  
  return landKeywords.some(keyword => lowerName.includes(keyword));
}

// Fonction de catégorisation des terrains
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

const AnalyzerPage: React.FC = () => {
  const theme = useTheme()
  // Mobile-first breakpoints plus précis
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.down('md')) // < 960px
  const isSmallMobile = useMediaQuery('(max-width:375px)') // iPhone SE et plus petits

  const [activeTab, setActiveTab] = useState(0)
  const [deckList, setDeckList] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isDeckMinimized, setIsDeckMinimized] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    const savedDeckList = localStorage.getItem('manatuner-decklist')
    const savedAnalysis = localStorage.getItem('manatuner-analysis')
    const savedMinimized = localStorage.getItem('manatuner-minimized')
    
    if (savedDeckList) {
      setDeckList(savedDeckList)
    }
    if (savedAnalysis) {
      try {
        setAnalysisResult(JSON.parse(savedAnalysis))
      } catch (e) {
        console.warn('Failed to parse saved analysis')
      }
    }
    if (savedMinimized) {
      setIsDeckMinimized(savedMinimized === 'true')
    }
  }, [])
  
  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    localStorage.setItem('manatuner-decklist', deckList)
  }, [deckList])
  
  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem('manatuner-analysis', JSON.stringify(analysisResult))
    } else {
      localStorage.removeItem('manatuner-analysis')
    }
  }, [analysisResult])
  
  useEffect(() => {
    localStorage.setItem('manatuner-minimized', isDeckMinimized.toString())
  }, [isDeckMinimized])

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

  // Fonction de test des probabilités
  const runProbabilityValidation = () => {
    const calculator = new ManaCalculator()
    
    const tests = [
      {
        name: "Thoughtseize T1 (1B)",
        deckSize: 60,
        sources: 14,
        turn: 1,
        symbols: 1,
        expected: 0.904
      },
      {
        name: "Counterspell T2 (UU)",
        deckSize: 60,
        sources: 20,
        turn: 2,
        symbols: 2,
        expected: 0.90
      },
      {
        name: "Lightning Bolt T1 (R)",
        deckSize: 60,
        sources: 14,
        turn: 1,
        symbols: 1,
        expected: 0.904
      }
    ]
    
    console.log("🧪 VALIDATION DES CALCULS DE PROBABILITÉ")
    console.log("=" .repeat(50))
    
    let passed = 0
    tests.forEach(test => {
      const result = calculator.calculateManaProbability(
        test.deckSize,
        test.sources,
        test.turn,
        test.symbols,
        true
      )
      
      const actual = result.probability
      const tolerance = 0.02
      const isValid = Math.abs(actual - test.expected) <= tolerance
      
      console.log(`${isValid ? '✅' : '❌'} ${test.name}`)
      console.log(`   Attendu: ${(test.expected * 100).toFixed(1)}%`)
      console.log(`   Calculé: ${(actual * 100).toFixed(1)}%`)
      console.log(`   Écart: ${Math.abs((actual - test.expected) * 100).toFixed(1)}%`)
      
      if (isValid) passed++
    })
    
    console.log(`\n📈 RÉSULTATS: ${passed}/${tests.length} tests réussis`)
    
    if (passed === tests.length) {
      setSnackbar({
        open: true,
        message: `✅ Validation réussie ! ${passed}/${tests.length} tests passés. Calculs conformes aux standards Frank Karsten.`,
        severity: 'success'
      })
    } else {
      setSnackbar({
        open: true,
        message: `⚠️ Validation partielle : ${passed}/${tests.length} tests passés. Vérifiez la console pour les détails.`,
        severity: 'warning'
      })
    }
  }

  const sampleDeck = `4 Light-Paws, Emperor's Voice (NEO) 25
2 Inspiring Vantage (KLR) 283
4 Esper Sentinel (MH2) 12
4 Giver of Runes (MH1) 13
4 Kor Spiritdancer (JMP) 116
4 Ethereal Armor (DSK) 7
1 Sentinel's Eyes (THB) 36
4 Shardmage's Rescue (DSK) 29
1 Combat Research (DMU) 44
1 Sunbaked Canyon (MH1) 247
1 Kaya's Ghostform (WAR) 94
1 Plains (PIP) 317
1 Cartouche of Zeal (AKR) 145
3 Sticky Fingers (SNC) 124
3 Sheltered by Ghosts (DSK) 30
4 Demonic Ruckus (OTJ) 120
1 Surge of Salvation (MOM) 41
4 Sacred Foundry (GRN) 254
4 Mana Confluence (JOU) 163
4 Godless Shrine (RNA) 248
1 Wingspan Stride (TDM) 66
4 Starting Town (FIN) 289`

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: isSmallMobile ? 1 : isMobile ? 2 : 4,
        px: isSmallMobile ? 0.5 : isMobile ? 1 : 3,
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ mb: isMobile ? 2 : 4, textAlign: 'center' }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            fontSize: isMobile ? '1.5rem' : undefined
          }}
        >
          <AnalyticsIcon sx={{ 
            fontSize: isMobile ? 30 : 40, 
            mr: 1, 
            verticalAlign: 'middle' 
          }} />
          ManaTuner Pro
        </Typography>
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          color="text.secondary"
          sx={{
            fontSize: isMobile ? '0.9rem' : undefined,
            px: isMobile ? 1 : 0
          }}
        >
          Analyze your manabase with the precision of Frank Karsten's mathematics
        </Typography>
      </Box>

      {/* Privacy Settings */}
      <PrivacySettings 
        currentMode="private"
        onPrivacyModeChange={(isPrivate) => {
          console.log('Privacy mode changed:', isPrivate ? 'private' : 'public')
        }}
      />

      {/* Analysis Actions - Save, Share, History */}
      {analysisResult && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <AnalysisActions
            deckList={deckList}
            analysisResult={analysisResult}
            onLoadAnalysis={(loadedDeckList, loadedResult) => {
              setDeckList(loadedDeckList)
              setAnalysisResult(loadedResult)
            }}
          />
        </Box>
      )}

      <Grid 
        container 
        spacing={isSmallMobile ? 1 : isMobile ? 2 : 4}
        sx={{ 
          width: '100%',
          margin: 0,
          '& .MuiGrid-item': {
            paddingLeft: isSmallMobile ? '4px !important' : undefined,
            paddingTop: isSmallMobile ? '4px !important' : undefined
          }
        }}
      >
        {/* Input Section */}
        <Grid item xs={12} lg={analysisResult && isDeckMinimized ? 2 : (isMobile ? 12 : 6)}>
          <Paper 
            sx={{ 
              p: isMobile ? 2 : 3, 
              height: 'fit-content',
              cursor: analysisResult && isDeckMinimized ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out',
              '&:hover': analysisResult && isDeckMinimized ? {
                transform: isMobile ? 'none' : 'scale(1.02)',
                boxShadow: 3
              } : {}
            }}
            onClick={() => {
              if (analysisResult && isDeckMinimized) {
                setIsDeckMinimized(false)
              }
            }}
          >
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom
              sx={{ fontSize: isMobile ? '1.1rem' : undefined }}
            >
              📝 Your Deck {analysisResult && isDeckMinimized && '(Click to expand)'}
            </Typography>
            
            {!isDeckMinimized && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 8 : 12}
                  label="List of deck"
                  placeholder="Paste your decklist here...&#10;Format: 4 Lightning Bolt&#10;3 Counterspell&#10;..."
                  value={deckList}
                  onChange={(e) => setDeckList(e.target.value)}
                  sx={{ 
                    mb: 2,
                    '& .MuiInputBase-root': {
                      fontSize: isMobile ? '0.875rem' : undefined
                    }
                  }}
                />

                <Box sx={{ 
                  display: 'flex', 
                  gap: isMobile ? 1 : 2, 
                  mb: 2, 
                  flexWrap: 'wrap',
                  flexDirection: isMobile ? 'column' : 'row'
                }}>
                  <Button
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    onClick={handleAnalyze}
                    disabled={!deckList.trim() || isAnalyzing}
                    startIcon={isAnalyzing ? <SpeedIcon /> : <AnalyticsIcon />}
                    sx={{ 
                      flexGrow: 1, 
                      minWidth: isMobile ? 'auto' : '200px',
                      fontSize: isMobile ? '0.875rem' : undefined
                    }}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Manabase'}
                  </Button>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: isMobile ? 1 : 2,
                    flexWrap: 'wrap'
                  }}>
                    <Button
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      onClick={() => setDeckList(sampleDeck)}
                      startIcon={<AddIcon />}
                      sx={{ 
                        minWidth: isMobile ? 'auto' : '100px',
                        fontSize: isMobile ? '0.75rem' : undefined
                      }}
                    >
                      Example
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      onClick={() => {
                        setDeckList('')
                        setAnalysisResult(null)
                        setIsDeckMinimized(false)
                        localStorage.removeItem('manatuner-decklist')
                        localStorage.removeItem('manatuner-analysis')
                        localStorage.removeItem('manatuner-minimized')
                        setSnackbar({
                          open: true,
                          message: '🗑️ Interface cleared! Ready for new deck analysis.',
                          severity: 'info'
                        })
                      }}
                      sx={{ 
                        color: 'var(--mtg-red)',
                        borderColor: 'var(--mtg-red)',
                        minWidth: isMobile ? 'auto' : '80px',
                        fontSize: isMobile ? '0.75rem' : undefined,
                        '&:hover': {
                          borderColor: 'var(--mtg-red)',
                          backgroundColor: 'rgba(220, 53, 69, 0.1)'
                        }
                      }}
                    >
                      🗑️ Clear
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      onClick={runProbabilityValidation}
                      sx={{ 
                        color: 'var(--mtg-blue)',
                        borderColor: 'var(--mtg-blue)',
                        minWidth: isMobile ? 'auto' : '140px',
                        fontSize: isMobile ? '0.75rem' : undefined,
                        '&:hover': {
                          borderColor: 'var(--mtg-blue)',
                          backgroundColor: 'rgba(0, 123, 255, 0.1)'
                        }
                      }}
                    >
                      Test Probabilities
                    </Button>
                  </Box>
                </Box>

                {isAnalyzing && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 1,
                        fontSize: isMobile ? '0.75rem' : undefined
                      }}
                    >
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
        <Grid item xs={12} lg={analysisResult && isDeckMinimized ? 10 : (isMobile ? 12 : 6)}>
          <Paper 
            sx={{ 
              p: isMobile ? 2 : 3, 
              minHeight: isMobile ? 400 : 600,
              cursor: analysisResult && !isDeckMinimized ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out',
              '&:hover': analysisResult && !isDeckMinimized ? {
                transform: isMobile ? 'none' : 'scale(1.01)',
                boxShadow: 2
              } : {}
            }}
            onClick={() => {
              if (analysisResult && !isDeckMinimized && !isMobile) {
                setIsDeckMinimized(true)
              }
            }}
          >
            {!analysisResult ? (
              <Box sx={{ textAlign: 'center', py: isMobile ? 4 : 8 }}>
                <AssessmentIcon sx={{ 
                  fontSize: isMobile ? 60 : 80, 
                  color: 'text.secondary', 
                  mb: 2 
                }} />
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.9rem' : undefined }}
                >
                  Enter your deck and click "Analyze" to see results
                </Typography>
              </Box>
            ) : (
              <div data-testid="analysis-results">
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  gutterBottom
                  sx={{ fontSize: isMobile ? '1.1rem' : undefined }}
                >
                  📊 Analysis Results {analysisResult && !isDeckMinimized && !isMobile && '(Click to minimize deck)'}
                </Typography>

                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant={isTablet ? "scrollable" : "standard"}
                  scrollButtons={isTablet ? "auto" : false}
                  allowScrollButtonsMobile
                  sx={{ 
                    mb: isMobile ? 2 : 3,
                    '& .MuiTab-root': {
                      fontSize: isSmallMobile ? '0.7rem' : isMobile ? '0.75rem' : undefined,
                      minWidth: isSmallMobile ? '60px' : isMobile ? 'auto' : undefined,
                      padding: isSmallMobile ? '4px 6px' : isMobile ? '6px 8px' : undefined,
                      textTransform: 'none'
                    },
                    '& .MuiTabs-scrollButtons': {
                      '&.Mui-disabled': {
                        opacity: 0.3,
                      },
                    },
                    '& .MuiTabs-indicator': {
                      height: isMobile ? 2 : 3
                    }
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="Probabilities" />
                  <Tab label="💰 Mana Cost" />
                  <Tab label="Recommendations" />
                  <Tab label="Spell Analysis" />
                  <Tab label="Deck List" />
                  <Tab label="Manabase" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  <Grid container spacing={isMobile ? 1 : 2}>
                    <Grid item xs={6} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          textAlign: 'center', 
                          p: isMobile ? 1 : 2,
                          minHeight: isMobile ? 80 : 100,
                          position: 'relative'
                        }}
                      >
                        <CardContent sx={{ p: isMobile ? 1 : undefined, '&:last-child': { pb: isMobile ? 1 : undefined } }}>
                          <Typography 
                            variant={isMobile ? "h5" : "h4"} 
                            color="primary"
                            sx={{ fontSize: isMobile ? '1.2rem' : undefined }}
                          >
                            {analysisResult.totalCards}
                          </Typography>
                          <Typography 
                            variant={isMobile ? "caption" : "body2"} 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                          >
                            Total Cards
                          </Typography>
                          <ViewListIcon sx={{ 
                            position: 'absolute', 
                            top: isMobile ? 4 : 8, 
                            right: isMobile ? 4 : 8, 
                            opacity: 0.3,
                            fontSize: isMobile ? '1rem' : undefined
                          }} />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                      <Card 
                        sx={{ 
                          textAlign: 'center', 
                          p: isMobile ? 1 : 2,
                          minHeight: isMobile ? 80 : 100,
                          position: 'relative'
                        }}
                      >
                        <CardContent sx={{ p: isMobile ? 1 : undefined, '&:last-child': { pb: isMobile ? 1 : undefined } }}>
                          <Typography 
                            variant={isMobile ? "h5" : "h4"} 
                            color="primary"
                            sx={{ fontSize: isMobile ? '1.2rem' : undefined }}
                          >
                            {analysisResult.totalLands}
                          </Typography>
                          <Typography 
                            variant={isMobile ? "caption" : "body2"} 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                          >
                            Lands
                          </Typography>
                          <TerrainIcon sx={{ 
                            position: 'absolute', 
                            top: isMobile ? 4 : 8, 
                            right: isMobile ? 4 : 8, 
                            opacity: 0.3,
                            fontSize: isMobile ? '1rem' : undefined
                          }} />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                      <Card
                        sx={{ 
                          textAlign: 'center', 
                          p: isMobile ? 1 : 2,
                          minHeight: isMobile ? 80 : 100
                        }}
                      >
                        <CardContent sx={{ p: isMobile ? 1 : undefined, '&:last-child': { pb: isMobile ? 1 : undefined } }}>
                          <Typography 
                            variant={isMobile ? "h5" : "h4"} 
                            color="primary"
                            sx={{ fontSize: isMobile ? '1.2rem' : undefined }}
                          >
                            {analysisResult.averageCMC.toFixed(1)}
                          </Typography>
                          <Typography 
                            variant={isMobile ? "caption" : "body2"} 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                          >
                            Average CMC
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                      <Card
                        sx={{ 
                          textAlign: 'center', 
                          p: isMobile ? 1 : 2,
                          minHeight: isMobile ? 80 : 100
                        }}
                      >
                        <CardContent sx={{ p: isMobile ? 1 : undefined, '&:last-child': { pb: isMobile ? 1 : undefined } }}>
                          <Typography 
                            variant={isMobile ? "h5" : "h4"} 
                            color="primary"
                            sx={{ fontSize: isMobile ? '1.2rem' : undefined }}
                          >
                            {(analysisResult.landRatio * 100).toFixed(1)}%
                          </Typography>
                          <Typography 
                            variant={isMobile ? "caption" : "body2"} 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                          >
                            Land Ratio
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: isMobile ? 2 : 3 }} />

                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '1rem' : undefined, fontWeight: 'bold' }}
                  >
                    Color Distribution
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: isMobile ? 0.5 : 1, 
                    flexWrap: 'wrap',
                    justifyContent: isMobile ? 'center' : 'flex-start'
                  }}>
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
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            backgroundColor: colorMap[color]?.bg || '#95A5A6',
                            color: colorMap[color]?.text || '#2C3E50',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.7rem' : undefined,
                            '& .MuiChip-label': {
                              color: colorMap[color]?.text || '#2C3E50',
                              fontSize: isMobile ? '0.7rem' : undefined
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
                      label={(analysisResult.rating || 'unknown').toUpperCase()} 
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
                  <EnhancedCharts analysis={{
                    id: 'current-analysis',
                    deckId: 'current-deck',
                    format: 'modern',
                    totalCards: analysisResult.totalCards,
                    totalLands: analysisResult.totalLands,
                    colorDistribution: analysisResult.colorDistribution,
                    manaCurve: {
                      '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7+': 0
                    }, // Placeholder - would need to be calculated from deck
                    overallScore: Math.round(analysisResult.consistency * 100),
                    consistency: Math.round(analysisResult.consistency * 100),
                    colorScrew: Math.round((1 - analysisResult.consistency) * 20), // Estimate
                    avgCMC: analysisResult.averageCMC,
                    recommendations: [],
                    probabilities: {
                      turn1: {
                        anyColor: analysisResult.probabilities.turn1.anyColor,
                        specificColors: analysisResult.probabilities.turn1.specificColors,
                        multipleColors: {}
                      },
                      turn2: {
                        anyColor: analysisResult.probabilities.turn2.anyColor,
                        specificColors: analysisResult.probabilities.turn2.specificColors,
                        multipleColors: {}
                      },
                      turn3: {
                        anyColor: analysisResult.probabilities.turn3.anyColor,
                        specificColors: analysisResult.probabilities.turn3.specificColors,
                        multipleColors: {}
                      },
                      turn4: {
                        anyColor: analysisResult.probabilities.turn4.anyColor,
                        specificColors: analysisResult.probabilities.turn4.specificColors,
                        multipleColors: {}
                      },
                      overall: {
                        consistency: analysisResult.consistency,
                        colorScrew: (1 - analysisResult.consistency) * 0.2,
                        manaFlood: 0.1,
                        manaScrew: 0.15
                      }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }} />
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Typography variant="h6" gutterBottom>
                    💰 Mana Cost Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Real-time mana costs from Scryfall with probability calculations
                  </Typography>
                  
                  {deckList.trim() ? (
                    <Box>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Card
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Mana Cost
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Probabilities
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {deckList.split('\n').filter(line => line.trim()).map((line, index) => {
                        const match = line.match(/^(\d+)\s+(.+?)(?:\s*\([A-Z0-9]+\)\s*\d*)?$/);
                        if (!match) return null;
                        
                        const quantity = parseInt(match[1]);
                        const cardName = match[2].replace(/^A-/, '').trim();
                        
                        // Filtrer les terrains - ne montrer que les sorts
                        const isLand = isLandCardComplete(cardName);
                        if (isLand) return null;
                        
                        return (
                          <ManaCostRow
                            key={index}
                            cardName={cardName}
                            quantity={quantity}
                          />
                        );
                      }).filter(Boolean)}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No deck list available. Please enter a deck list and analyze it first.
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      💡 P1 = Perfect scenario (all lands on curve) | P2 = Realistic probability (accounts for mana screw)
                    </Typography>
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <EnhancedRecommendations 
                    recommendations={analysisResult.recommendations}
                    analysis={{
                      consistency: analysisResult.consistency,
                      colorScrew: (1 - analysisResult.consistency) * 0.2,
                      landRatio: analysisResult.landRatio,
                      avgCMC: analysisResult.averageCMC
                    }}
                  />
                </TabPanel>

                <TabPanel value={activeTab} index={4}>
                  <EnhancedSpellAnalysis spellAnalysis={analysisResult.spellAnalysis} />
                </TabPanel>

                <TabPanel value={activeTab} index={5}>
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

                <TabPanel value={activeTab} index={6}>
                  <Typography variant="h6" gutterBottom>
                    🏔️ Manabase Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Detailed analysis of your land base and mana production capabilities. Click on any land name to view it on Scryfall.
                  </Typography>

                  <Grid container spacing={4}>
                    {/* Liste des terrains */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: isMobile ? 2 : 3 }}>
                        <Typography 
                          variant={isMobile ? "body1" : "h6"} 
                          gutterBottom
                          sx={{ fontSize: isMobile ? '1rem' : undefined, fontWeight: 'bold' }}
                        >
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
                          

                          
                          // Fonction de catégorisation complète

                          
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
                      <Paper sx={{ p: isMobile ? 2 : 3 }}>
                        <Typography 
                          variant={isMobile ? "body1" : "h6"} 
                          gutterBottom
                          sx={{ fontSize: isMobile ? '1rem' : undefined, fontWeight: 'bold' }}
                        >
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
                                <Box>
                                  <Box sx={{ 
                                    width: '100%', 
                                    overflowX: 'hidden',
                                    display: 'flex',
                                    justifyContent: 'center'
                                  }}>
                                    <ResponsiveContainer 
                                      width="100%" 
                                      height={isSmallMobile ? 150 : isMobile ? 200 : 300}
                                      minWidth={250}
                                    >
                                      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                        <Pie
                                          data={colorData}
                                          cx="50%"
                                          cy="50%"
                                          labelLine={false}
                                          label={isMobile ? false : ({ name, value, percent }) => 
                                            `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                                          }
                                          outerRadius={isSmallMobile ? 45 : isMobile ? 60 : 80}
                                          innerRadius={isSmallMobile ? 15 : isMobile ? 20 : 25}
                                          fill="#8884d8"
                                          dataKey="value"
                                          stroke="#fff"
                                          strokeWidth={isMobile ? 1 : 2}
                                        >
                                          {colorData.map((entry, index) => (
                                            <Cell 
                                              key={`cell-${index}`} 
                                              fill={entry.color} 
                                              stroke="#fff" 
                                              strokeWidth={isMobile ? 1 : 2} 
                                            />
                                          ))}
                                        </Pie>
                                        <Tooltip 
                                          formatter={(value, name) => [`${value} sources`, name]}
                                          labelStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                          contentStyle={{ 
                                            fontSize: isMobile ? '12px' : '14px',
                                            padding: isMobile ? '4px 8px' : '8px 12px'
                                          }}
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>
                                  </Box>
                                  
                                  <Box sx={{ mt: 2 }}>
                                    <Typography 
                                      variant={isMobile ? "caption" : "subtitle2"} 
                                      gutterBottom
                                      sx={{ fontSize: isMobile ? '0.8rem' : undefined, fontWeight: 'bold' }}
                                    >
                                      Color Requirements Summary:
                                    </Typography>
                                    {colorData.map((item, index) => (
                                      <Box key={index} sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        mb: isMobile ? 0.5 : 1,
                                        flexWrap: isMobile ? 'wrap' : 'nowrap'
                                      }}>
                                        <Box 
                                          sx={{ 
                                            width: isMobile ? 16 : 20, 
                                            height: isMobile ? 16 : 20, 
                                            backgroundColor: item.color,
                                            border: '1px solid #ddd',
                                            borderRadius: 1,
                                            mr: isMobile ? 1 : 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: isMobile ? '0.6rem' : '0.75rem',
                                            fontWeight: 'bold',
                                            color: item.textColor,
                                            flexShrink: 0
                                          }} 
                                        >
                                          {MANA_COLORS.find(c => COLOR_NAMES[c] === item.name)}
                                        </Box>
                                        <Typography 
                                          variant={isMobile ? "caption" : "body2"}
                                          sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                                        >
                                          {item.name}: {item.value} sources ({((item.value / totalMana) * 100).toFixed(1)}%)
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
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
                      <Paper sx={{ p: isMobile ? 2 : 3 }}>
                        <Typography 
                          variant={isMobile ? "body1" : "h6"} 
                          gutterBottom
                          sx={{ fontSize: isMobile ? '1rem' : undefined, fontWeight: 'bold' }}
                        >
                          📈 Manabase Statistics
                        </Typography>
                        
                        <Grid container spacing={isMobile ? 2 : 3}>
                          <Grid item xs={6} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography 
                                variant={isMobile ? "h5" : "h4"} 
                                color="primary"
                                sx={{ fontSize: isMobile ? '1.2rem' : undefined }}
                              >
                                {analysisResult.totalLands}
                              </Typography>
                              <Typography 
                                variant={isMobile ? "caption" : "body2"} 
                                color="text.secondary"
                                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                              >
                                Total Lands
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography 
                                variant={isMobile ? "h5" : "h4"} 
                                color="primary"
                                sx={{ fontSize: isMobile ? '1.2rem' : undefined }}
                              >
                                {(analysisResult.landRatio * 100).toFixed(1)}%
                              </Typography>
                              <Typography 
                                variant={isMobile ? "caption" : "body2"} 
                                color="text.secondary"
                                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                              >
                                Land Ratio
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography 
                                variant={isMobile ? "h5" : "h4"} 
                                color="primary"
                                sx={{ fontSize: isMobile ? '1.2rem' : undefined }}
                              >
                                {Object.values(analysisResult.colorDistribution).filter(v => v > 0).length}
                              </Typography>
                              <Typography 
                                variant={isMobile ? "caption" : "body2"} 
                                color="text.secondary"
                                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                              >
                                Colors Used
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography 
                                variant={isMobile ? "h5" : "h4"} 
                                color="primary"
                                sx={{ fontSize: isMobile ? '1.2rem' : undefined }}
                              >
                                {analysisResult.averageCMC.toFixed(1)}
                              </Typography>
                              <Typography 
                                variant={isMobile ? "caption" : "body2"} 
                                color="text.secondary"
                                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                              >
                                Average CMC
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: isMobile ? 2 : 3, px: isMobile ? 1 : 0 }}>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      color="text.secondary"
                      sx={{ 
                        fontSize: isMobile ? '0.75rem' : undefined,
                        textAlign: isMobile ? 'center' : 'left'
                      }}
                    >
                      🏔️ This manabase analysis helps you understand your land distribution and mana production capabilities for optimal deck performance.
                    </Typography>
                  </Box>
                </TabPanel>
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity as 'success' | 'warning' | 'error' | 'info'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default AnalyzerPage 