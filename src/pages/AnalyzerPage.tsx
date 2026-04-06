import {
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Casino as CasinoIcon,
  Dashboard as DashboardIcon,
  Download as DownloadIcon,
  Functions as FunctionsIcon,
  ShowChart as ShowChartIcon,
  Terrain as TerrainIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { Suspense, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AnalyzerSkeleton } from '../components/analyzer/AnalyzerSkeleton'
import { DeckInputSection } from '../components/analyzer/DeckInputSection'
import { TabPanel } from '../components/analyzer/TabPanel'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'
import PrivacySettings from '../components/PrivacySettings'

// Lazy-loaded tabs (only loaded when selected)
const DashboardTab = React.lazy(() =>
  import('../components/analyzer/DashboardTab').then((m) => ({ default: m.DashboardTab }))
)
const CastabilityTab = React.lazy(() =>
  import('../components/analyzer/CastabilityTab').then((m) => ({ default: m.CastabilityTab }))
)
const MulliganTab = React.lazy(() =>
  import('../components/analyzer/MulliganTab').then((m) => ({ default: m.MulliganTab }))
)
const AnalysisTab = React.lazy(() =>
  import('../components/analyzer/AnalysisTab').then((m) => ({ default: m.AnalysisTab }))
)
const ManabaseFullTab = React.lazy(() =>
  import('../components/analyzer/ManabaseFullTab').then((m) => ({ default: m.ManabaseFullTab }))
)
const ManaBlueprint = React.lazy(() => import('../components/export/ManaBlueprint'))
import { PrivacyStorage } from '../lib/privacy'
import { DeckAnalyzer } from '../services/deckAnalyzer'
import { AppDispatch, RootState } from '../store'
import {
  clearAnalyzer,
  hideSnackbar,
  setActiveTab,
  setAnalysisResult,
  setDeckList,
  setDeckName,
  setIsAnalyzing,
  setIsDeckMinimized,
  showSnackbar,
} from '../store/slices/analyzerSlice'
// Lazy-load Onboarding (includes react-joyride ~50KB)
const Onboarding = React.lazy(() => import('../components/Onboarding'))

const SAMPLE_DECK = `4 Light-Paws, Emperor's Voice (NEO) 25
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

const AnalyzerPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isSmallMobile = useMediaQuery('(max-width:375px)')

  // Redux state
  const dispatch = useDispatch<AppDispatch>()
  const { deckList, deckName, analysisResult, isAnalyzing, isDeckMinimized, activeTab, snackbar } =
    useSelector((state: RootState) => state.analyzer)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    dispatch(setActiveTab(newValue))
  }

  // Memoized analyze handler to prevent unnecessary re-renders
  const handleAnalyze = useCallback(async () => {
    if (!deckList.trim()) return

    dispatch(setIsAnalyzing(true))

    try {
      const result = await DeckAnalyzer.analyzeDeck(deckList)
      dispatch(setAnalysisResult(result))

      // Auto-minimize deck on mobile to show results
      if (isMobile) {
        dispatch(setIsDeckMinimized(true))
      }

      // Auto-save to PrivacyStorage
      try {
        // Generate a descriptive name from colors if user didn't set one
        const colorNames: Record<string, string> = {
          W: 'White',
          U: 'Blue',
          B: 'Black',
          R: 'Red',
          G: 'Green',
        }
        const activeColors = result.colorDistribution
          ? Object.entries(result.colorDistribution)
              .filter(([, v]) => v > 0)
              .map(([k]) => colorNames[k] || k)
          : []
        const colorLabel =
          activeColors.length > 0 ? `${activeColors.length}C ${activeColors.join('/')}` : 'Deck'
        const saveName = deckName.trim() || `${colorLabel} - ${new Date().toLocaleDateString()}`
        PrivacyStorage.saveAnalysis({
          deckName: saveName,
          deckList,
          analysis: result,
          consistency: result.consistency,
        })
      } catch {
        // Silent fail for auto-save
      }
    } catch (error) {
      dispatch(setAnalysisResult(null))
      dispatch(
        showSnackbar({
          message: 'Failed to analyze deck. Please check the format and try again.',
          severity: 'error',
        })
      )
    } finally {
      dispatch(setIsAnalyzing(false))
    }
  }, [deckList, dispatch])

  const handleClear = useCallback(() => {
    dispatch(clearAnalyzer())
    dispatch(
      showSnackbar({
        message: '🗑️ Interface cleared! Ready for new deck analysis.',
        severity: 'info',
      })
    )
  }, [dispatch])

  const handleLoadSample = useCallback(() => {
    dispatch(setDeckList(SAMPLE_DECK))
  }, [dispatch])

  return (
    <>
      <React.Suspense fallback={null}>
        <Onboarding hasAnalysisResult={!!analysisResult} />
      </React.Suspense>
      <Container
        maxWidth="xl"
        sx={{
          py: isSmallMobile ? 1 : isMobile ? 2 : 4,
          px: isSmallMobile ? 0.5 : isMobile ? 1 : 3,
          width: '100%',
          maxWidth: '100% !important',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Floating mana symbols background */}
        <FloatingManaSymbols />
        {/* Header - Hidden when analysis is displayed */}
        {!analysisResult && (
          <Box sx={{ mb: isMobile ? 3 : 4, textAlign: 'center' }}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: isMobile ? '1.8rem' : '2.5rem',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <AnalyticsIcon
                sx={{
                  fontSize: isMobile ? 32 : 44,
                  color: '#1976d2',
                }}
              />
              ManaTuner
            </Typography>
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              color="text.secondary"
              sx={{
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                px: isMobile ? 1 : 0,
                maxWidth: 600,
                mx: 'auto',
                mb: 2,
              }}
            >
              Analyze your manabase with proven mathematical precision
            </Typography>

            {/* Feature Tags */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Chip
                icon={<ShowChartIcon />}
                label="Castability"
                size="small"
                sx={{
                  bgcolor: '#e3f2fd',
                  color: '#1565c0',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#1565c0' },
                }}
              />
              <Chip
                icon={<CasinoIcon />}
                label="Monte Carlo"
                size="small"
                sx={{
                  bgcolor: '#f3e5f5',
                  color: '#7b1fa2',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#7b1fa2' },
                }}
              />
              <Chip
                icon={<FunctionsIcon />}
                label="Karsten Math"
                size="small"
                sx={{
                  bgcolor: '#fff3e0',
                  color: '#e65100',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#e65100' },
                }}
              />
            </Box>
          </Box>
        )}

        {/* Compact deck bar when minimized */}
        {analysisResult && isDeckMinimized && (
          <Paper
            sx={{
              p: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'primary.light',
              background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                backgroundColor: '#e3f2fd',
                borderColor: 'primary.main',
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => dispatch(setIsDeckMinimized(false))}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6">📋</Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>
                  Your Deck
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analysisResult.totalCards} cards • {analysisResult.totalLands} lands
                </Typography>
              </Box>
            </Box>

            {/* Center instruction text */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center', flex: 1 }}>
              <Typography variant="body1" color="primary.main" fontWeight={500}>
                Click to edit your deck or start a new analysis
              </Typography>
            </Box>

            <Chip
              label="✏️ Edit Deck"
              size="small"
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                fontWeight: 600,
                '&:hover': { bgcolor: '#1565c0' },
              }}
            />
          </Paper>
        )}

        <Grid
          container
          spacing={isSmallMobile ? 1 : isMobile ? 2 : 4}
          sx={{
            width: '100%',
            maxWidth: '100%',
            margin: 0,
            overflowX: 'hidden',
            boxSizing: 'border-box',
            '& .MuiGrid-item': {
              paddingLeft: isSmallMobile ? '4px !important' : undefined,
              paddingTop: isSmallMobile ? '4px !important' : undefined,
              maxWidth: '100%',
              boxSizing: 'border-box',
            },
          }}
        >
          {/* Input Section - Hidden when minimized */}
          {!(analysisResult && isDeckMinimized) && (
            <Grid item xs={12} lg={isMobile ? 12 : 6}>
              <DeckInputSection
                deckList={deckList}
                deckName={deckName}
                setDeckList={(value: string) => dispatch(setDeckList(value))}
                setDeckName={(value: string) => dispatch(setDeckName(value))}
                isAnalyzing={isAnalyzing}
                analysisResult={analysisResult}
                isDeckMinimized={isDeckMinimized}
                setIsDeckMinimized={(value: boolean) => dispatch(setIsDeckMinimized(value))}
                onAnalyze={handleAnalyze}
                onClear={handleClear}
                onLoadSample={handleLoadSample}
                isMobile={isMobile}
                isSmallMobile={isSmallMobile}
              />
            </Grid>
          )}

          {/* Results Section - Full width when minimized */}
          <Grid item xs={12} lg={analysisResult && isDeckMinimized ? 12 : isMobile ? 12 : 6}>
            <Paper
              sx={{
                p: isMobile ? 2 : 3,
                minHeight: isMobile ? 400 : 600,
                transition: 'all 0.3s ease-in-out',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {isAnalyzing ? (
                <AnalyzerSkeleton variant="results" />
              ) : !analysisResult ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: isMobile ? 6 : 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.info.light}40 0%, ${theme.palette.secondary.light}40 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <AssessmentIcon
                      sx={{
                        fontSize: isMobile ? 48 : 56,
                        color: '#9e9e9e',
                      }}
                    />
                  </Box>
                  <Typography
                    variant={isMobile ? 'body1' : 'h6'}
                    color="text.secondary"
                    sx={{ maxWidth: 300 }}
                  >
                    Enter your deck and click <strong>"Analyze"</strong> to see results
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      mt: 1,
                    }}
                  >
                    <Chip
                      label="Health Score"
                      size="small"
                      sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}
                    />
                    <Chip
                      label="Castability"
                      size="small"
                      sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
                    />
                    <Chip
                      label="Mulligan"
                      size="small"
                      sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}
                    />
                  </Box>
                </Box>
              ) : (
                <div data-testid="analysis-results">
                  <Typography
                    variant={isMobile ? 'h6' : 'h5'}
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    Analysis Results
                    {!isDeckMinimized && !isMobile && (
                      <Chip
                        label="Expand full width"
                        size="small"
                        clickable
                        onClick={(e) => {
                          e.stopPropagation()
                          dispatch(setIsDeckMinimized(true))
                        }}
                        sx={{
                          ml: 1,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          fontSize: '0.7rem',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      />
                    )}
                  </Typography>

                  {/* Tabs with improved styling */}
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="Analysis results tabs"
                    sx={{
                      mb: isMobile ? 2 : 3,
                      '& .MuiTab-root': {
                        fontSize: isSmallMobile ? '0.75rem' : isMobile ? '0.85rem' : '0.95rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        minHeight: isMobile ? 48 : 56,
                        borderRadius: '8px 8px 0 0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        '&.Mui-selected': {
                          color: 'primary.main',
                        },
                      },
                      '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                        background: 'linear-gradient(90deg, #1976d2 0%, #9c27b0 100%)',
                      },
                    }}
                  >
                    <Tab
                      icon={<DashboardIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Dashboard"
                      aria-label="Dashboard - Overview and health score"
                    />
                    <Tab
                      icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Castability"
                      aria-label="Castability - Spell casting probabilities"
                    />
                    <Tab
                      icon={<CasinoIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Mulligan"
                      aria-label="Mulligan - Hand simulation and strategy"
                    />
                    <Tab
                      icon={<AnalyticsIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Analysis"
                      aria-label="Analysis - Detailed spell analysis"
                    />
                    <Tab
                      icon={<TerrainIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Manabase"
                      aria-label="Manabase - Land breakdown"
                    />
                    <Tab
                      icon={<DownloadIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Blueprint
                          <Box
                            component="span"
                            sx={{
                              bgcolor: '#00D9FF',
                              color: '#0A1628',
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                              letterSpacing: 0.5,
                              boxShadow: '0 0 8px rgba(0, 217, 255, 0.5)',
                            }}
                          >
                            NEW
                          </Box>
                        </Box>
                      }
                      aria-label="Blueprint - Export analysis as PNG, PDF or JSON"
                      sx={{ color: '#00D9FF' }}
                    />
                  </Tabs>

                  <Suspense fallback={<AnalyzerSkeleton />}>
                    <TabPanel value={activeTab} index={0}>
                      <DashboardTab analysisResult={analysisResult} isMobile={isMobile} />
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                      <CastabilityTab deckList={deckList} analysisResult={analysisResult} />
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                      <MulliganTab cards={analysisResult.cards || []} isMobile={isMobile} />
                    </TabPanel>

                    <TabPanel value={activeTab} index={3}>
                      <AnalysisTab
                        analysisResult={analysisResult}
                        isMobile={isMobile}
                        cards={analysisResult.cards}
                      />
                    </TabPanel>

                    <TabPanel value={activeTab} index={4}>
                      <ManabaseFullTab
                        deckList={deckList}
                        analysisResult={analysisResult}
                        isMobile={isMobile}
                        isSmallMobile={isSmallMobile}
                      />
                    </TabPanel>

                    <TabPanel value={activeTab} index={5}>
                      <ManaBlueprint
                        analysisResult={analysisResult}
                        deckName={`Deck ${new Date().toLocaleDateString()}`}
                      />
                    </TabPanel>
                  </Suspense>
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Privacy Settings */}
        <Box sx={{ mt: 4 }}>
          <PrivacySettings />
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => dispatch(hideSnackbar())}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => dispatch(hideSnackbar())}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

export default AnalyzerPage
