import AnalyticsIcon from '@mui/icons-material/Analytics'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CasinoIcon from '@mui/icons-material/Casino'
import DownloadIcon from '@mui/icons-material/Download'
import FunctionsIcon from '@mui/icons-material/Functions'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import TerrainIcon from '@mui/icons-material/Terrain'
import {
  Alert,
  Box,
  Button,
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
import ShareIcon from '@mui/icons-material/Share'
import React, { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AnalyzerSkeleton } from '../components/analyzer/AnalyzerSkeleton'
import { DeckInputSection } from '../components/analyzer/DeckInputSection'
import { computeColorDeltas, summarizeColorDeltas } from '../components/analyzer/KarstenTargetDelta'
import { QuickVerdict } from '../components/analyzer/QuickVerdict'
import { TabPanel } from '../components/analyzer/TabPanel'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'
import { SEO } from '../components/common/SEO'

// Audit fix perf (2026-04-13): lazy-load PrivacySettings to drop ~14 KB gzip
// from the first AnalyzerPage paint (DOMPurify ships inside this component).
const PrivacySettings = React.lazy(() => import('../components/PrivacySettings'))

// Lazy-loaded tabs (only loaded when selected)
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
import { buildShareUrl, parseShareParams } from '../utils/urlCodec'
// Lazy-load Onboarding (includes react-joyride ~50KB)
const Onboarding = React.lazy(() => import('../components/Onboarding'))

// Sample decks keyed by archetype — let first-time visitors pick a deck
// shape matching what they play (Léo+Sarah persona ask: multiple sample
// archetypes, not just one). Referenced via ?sample={key} URL param.
const SAMPLE_DECKS: Record<string, { name: string; list: string }> = {
  midrange: {
    name: "Nature's Rhythm (Midrange Combo)",
    list: `4 Llanowar Elves (FDN) 227
4 Gene Pollinator (EOE) 186
4 Spider Manifestation (SPM) 148
4 Badgermole Cub (TLA) 167
4 Nature's Rhythm (TDM) 150
4 Ouroboroid (EOE) 201
4 Brightglass Gearhulk (DFT) 191
2 Archdruid's Charm (MKM) 151
1 Craterhoof Behemoth (TDM) 138
1 Insidious Fungus (DSK) 186
1 Nurturing Pixie (OTJ) 20
1 Meltstrider's Resolve (EOE) 199
2 Seam Rip (EOE) 34
1 Soul-Guide Lantern (EOC) 143
3 Abandoned Air Temple (TLA) 263
4 Hushwood Verge (DSK) 261
4 Temple Garden (ECL) 268
2 Multiversal Passage (SPM) 180
2 Plains (FDN) 295
8 Forest (FDN) 291`,
  },
  aggro: {
    name: 'Mono-Red Aggro',
    list: `4 Heartfire Hero
4 Monstrous Rage
4 Emberheart Challenger
4 Manifold Mouse
4 Lightning Helix
4 Torch the Tower
3 Screaming Nemesis
3 Slickshot Show-Off
3 Hired Claw
2 Cori-Steel Cutter
2 Witchstalker Frenzy
19 Mountain
4 Mishra's Foundry`,
  },
  control: {
    name: 'Azorius Control',
    list: `4 Get Lost
4 Spell Pierce
3 Wedding Announcement
3 No More Lies
3 The Wandering Emperor
2 Sunfall
2 Elspeth, Sun's Champion
2 Siphon Insight
2 Portent of Calamity
2 Memory Deluge
4 Meticulous Archive
4 Seachrome Coast
4 Restless Anchorage
4 Plains
4 Island
3 Floodfarm Verge
2 Brushland
2 Starting Town
2 Otawara, Soaring City
1 Eiganjo, Seat of the Empire
1 Otherworldly Gaze
1 Mirrex`,
  },
  // 100-card Atraxa Superfriends / Proliferate — representative EDH deck
  // covering the typical EDH manabase patterns: 38 lands, 11 ramp, 10
  // fixers (tri-lands, shocks, fetches, utility), singleton constraint.
  // Thibault persona ask #1: "stop pretending 60-card is the only format".
  edh: {
    name: "Atraxa, Praetors' Voice — Superfriends (Commander)",
    list: `1 Atraxa, Praetors' Voice
1 Sol Ring
1 Arcane Signet
1 Talisman of Progress
1 Talisman of Hierarchy
1 Talisman of Dominance
1 Chromatic Lantern
1 Cultivate
1 Kodama's Reach
1 Farseek
1 Nature's Lore
1 Three Visits
1 Rhystic Study
1 Mystic Remora
1 Esper Sentinel
1 Guardian Project
1 Beast Whisperer
1 Tezzeret's Gambit
1 Painful Truths
1 Swords to Plowshares
1 Path to Exile
1 Anguished Unmaking
1 Assassin's Trophy
1 Beast Within
1 Counterspell
1 Arcane Denial
1 Cyclonic Rift
1 Toxic Deluge
1 Damnation
1 Wrath of God
1 Supreme Verdict
1 Doubling Season
1 Parallel Lives
1 Hardened Scales
1 The Ozolith
1 Deepglow Skate
1 Evolution Sage
1 Flux Channeler
1 Contagion Engine
1 Vraska, Golgari Queen
1 Teferi, Master of Time
1 Narset, Parter of Veils
1 Elspeth, Sun's Champion
1 Jace, the Mind Sculptor
1 Tamiyo, Field Researcher
1 Nissa, Voice of Zendikar
1 Ajani, the Greathearted
1 Oko, Thief of Crowns
1 Teferi, Time Raveler
1 Oath of Teferi
1 Oath of Kaya
1 Oath of Gideon
1 Oath of Ajani
1 Sage of Hours
1 Leyline Binding
1 Spark Double
1 The Great Henge
1 Gideon, Ally of Zendikar
1 Command Tower
1 Exotic Orchard
1 Reflecting Pool
1 Mana Confluence
1 City of Brass
1 Reliquary Tower
1 Bojuka Bog
1 Urborg, Tomb of Yawgmoth
1 Hallowed Fountain
1 Breeding Pool
1 Overgrown Tomb
1 Watery Grave
1 Temple Garden
1 Godless Shrine
1 Fabled Passage
1 Flooded Strand
1 Misty Rainforest
1 Polluted Delta
1 Windswept Heath
1 Marsh Flats
1 Indatha Triome
1 Zagoth Triome
1 Raffine's Tower
1 Glacial Fortress
1 Drowned Catacomb
1 Woodland Cemetery
1 Sunpetal Grove
1 Hinterland Harbor
1 Isolated Chapel
4 Forest
3 Plains
3 Island
4 Swamp`,
  },
}

// Default fallback for ?sample=1 (back-compat) and the main CTA from home.
const SAMPLE_DECK = SAMPLE_DECKS.midrange.list

const AnalyzerPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isSmallMobile = useMediaQuery('(max-width:375px)')

  // Redux state
  const dispatch = useDispatch<AppDispatch>()
  const { deckList, deckName, analysisResult, isAnalyzing, isDeckMinimized, activeTab, snackbar } =
    useSelector((state: RootState) => state.analyzer)

  // URL share: hydrate deck from URL params on mount (once).
  // Also handles ?sample=1 shortcut from HomePage to auto-load the sample
  // deck (Léo friction fix — no decklist-pasting required on first visit).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    // ?sample=1 → default sample (back-compat with HomePage link).
    // ?sample=aggro|control|midrange → specific archetype sample.
    const params = new URLSearchParams(window.location.search)
    const sampleParam = params.get('sample')
    if (sampleParam) {
      const sample = sampleParam === '1' ? SAMPLE_DECKS.midrange : SAMPLE_DECKS[sampleParam]
      if (sample) {
        dispatch(setDeckList(sample.list))
        dispatch(setDeckName(sample.name))
        window.history.replaceState({}, '', '/analyzer')
        return
      }
    }

    const shared = parseShareParams()
    if (shared && shared.deckList) {
      dispatch(setDeckList(shared.deckList))
      if (shared.deckName) dispatch(setDeckName(shared.deckName))
      if (shared.tab > 0) dispatch(setActiveTab(shared.tab))
      // Clean URL without reloading
      window.history.replaceState({}, '', '/analyzer')
    }
  }, [dispatch])

  const handleShare = useCallback(() => {
    if (!deckList.trim()) return
    const url = buildShareUrl({ deckList, deckName, tab: activeTab })
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      dispatch(showSnackbar({ message: 'Share link copied to clipboard!', severity: 'success' }))
    })
  }, [deckList, deckName, activeTab, dispatch])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    dispatch(setActiveTab(newValue))
  }

  // Karsten verdict rollup for the Manabase tab badge — surfaces color
  // shortfalls on the tab label itself so Sarah doesn't have to click
  // Manabase and scroll to discover she's short on a color.
  const manabaseVerdict = useMemo(() => {
    if (!analysisResult) return null
    const deltas = computeColorDeltas(analysisResult)
    if (deltas.length === 0) return null
    return summarizeColorDeltas(deltas)
  }, [analysisResult])

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
      } catch (saveErr) {
        // Auto-save failed (most likely quota exceeded). Warn the user
        // — silently losing history is worse than a polite message.
        const msg =
          saveErr instanceof Error && saveErr.name === 'QuotaExceededError'
            ? 'Browser storage full. Analysis shown but not saved to history. Clear old analyses in Privacy Settings.'
            : 'Could not save analysis to local history.'
        dispatch(showSnackbar({ message: msg, severity: 'warning' }))
      }
    } catch (error) {
      dispatch(setAnalysisResult(null))
      // Surface a more helpful error message when possible.
      const rawMessage = error instanceof Error ? error.message : ''
      const userMessage = rawMessage
        ? `Failed to analyze deck: ${rawMessage}. Check the format and try again.`
        : 'Failed to analyze deck. Please check the format and try again.'
      dispatch(
        showSnackbar({
          message: userMessage,
          severity: 'error',
        })
      )
    } finally {
      dispatch(setIsAnalyzing(false))
    }
  }, [deckList, deckName, dispatch])

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
    dispatch(setDeckName(SAMPLE_DECKS.midrange.name))
  }, [dispatch])

  // Load a specific archetype by key. Used by the 3 sample chips on the
  // empty-state right panel (Léo + Sarah persona ask — multiple archetypes
  // so the first-time visitor can match what they play).
  const handleLoadSampleKey = useCallback(
    (key: keyof typeof SAMPLE_DECKS) => {
      const sample = SAMPLE_DECKS[key]
      if (!sample) return
      dispatch(setDeckList(sample.list))
      dispatch(setDeckName(sample.name))
    },
    [dispatch]
  )

  return (
    <>
      <SEO
        title="MTG Deck Analyzer — Paste Deck, See Castability | ManaTuner"
        description="Free MTG deck analyzer. Paste your decklist (MTGO, MTGA, Moxfield) and get exact hypergeometric castability probabilities per spell — including mana rocks and dorks. No signup, results in 3 seconds."
        path="/analyzer"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          '@id': 'https://www.manatuner.app/analyzer#software',
          name: 'ManaTuner Deck Analyzer',
          url: 'https://www.manatuner.app/analyzer',
          applicationCategory: 'UtilityApplication',
          applicationSubCategory: 'Mana Base Analyzer',
          operatingSystem: 'Any (browser-based)',
          browserRequirements: 'Requires a modern browser with JavaScript enabled',
          description:
            'Interactive MTG deck analyzer. Paste any decklist (MTGO, MTGA, Moxfield) and get exact hypergeometric castability probabilities per spell, turn by turn, including mana rocks and dorks.',
          featureList: [
            'Castability analysis with P1/P2 probabilities',
            'Post-board sideboard swap editor',
            'Monte Carlo mulligan simulation (10,000 hands)',
            'Turn-by-turn color requirement probabilities',
            'Export blueprint as PNG, PDF, or JSON',
          ],
          isPartOf: { '@id': 'https://www.manatuner.app/#software' },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          author: { '@id': 'https://www.manatuner.app/#author' },
          publisher: { '@id': 'https://www.manatuner.app/#organization' },
          isAccessibleForFree: true,
          license: 'https://opensource.org/licenses/MIT',
        }}
      />
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
                label="Mulligan Sim"
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
                    sx={{ maxWidth: 360 }}
                  >
                    Paste a decklist and hit <strong>Analyze</strong> — or try one of the sample
                    archetypes below.
                  </Typography>
                  {/* Four archetype chips — three 60-card archetypes + a
                      100-card Commander sample. Thibault persona ask #1:
                      "don't force me into a 60-card frame; EDH is 40 % of
                      the paper MTG market". */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1.5,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      mt: 1,
                    }}
                  >
                    <Button
                      variant="outlined"
                      size={isMobile ? 'medium' : 'large'}
                      onClick={() => handleLoadSampleKey('aggro')}
                      sx={{ fontWeight: 600, textTransform: 'none', borderWidth: 2 }}
                    >
                      Mono-Red Aggro
                    </Button>
                    <Button
                      variant="contained"
                      size={isMobile ? 'medium' : 'large'}
                      onClick={() => handleLoadSampleKey('midrange')}
                      sx={{ fontWeight: 600, textTransform: 'none' }}
                    >
                      Midrange Combo
                    </Button>
                    <Button
                      variant="outlined"
                      size={isMobile ? 'medium' : 'large'}
                      onClick={() => handleLoadSampleKey('control')}
                      sx={{ fontWeight: 600, textTransform: 'none', borderWidth: 2 }}
                    >
                      Azorius Control
                    </Button>
                    <Button
                      variant="outlined"
                      size={isMobile ? 'medium' : 'large'}
                      onClick={() => handleLoadSampleKey('edh')}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        borderWidth: 2,
                        borderColor: 'secondary.main',
                        color: 'secondary.main',
                        '&:hover': { borderWidth: 2, borderColor: 'secondary.dark' },
                      }}
                    >
                      Commander (EDH)
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      mt: 2,
                    }}
                  >
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
                    <Chip
                      label="Manabase"
                      size="small"
                      sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}
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
                    <Chip
                      icon={<ShareIcon sx={{ fontSize: 16 }} />}
                      label="Share"
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={handleShare}
                      sx={{ fontSize: '0.75rem' }}
                    />
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

                  {/* One-phrase verdict — Léo persona ask: "tell me plainly
                      whether my deck is good before I read 5 tabs". */}
                  <QuickVerdict analysisResult={analysisResult} manabaseVerdict={manabaseVerdict} />

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
                      icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Castability"
                      aria-label="Castability - Spell casting probabilities"
                    />
                    <Tab
                      icon={<AnalyticsIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Analysis"
                      aria-label="Analysis - Detailed spell analysis"
                    />
                    <Tab
                      icon={<CasinoIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Mulligan"
                      aria-label="Mulligan - Hand simulation and strategy"
                    />
                    <Tab
                      icon={<TerrainIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label={
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                          }}
                        >
                          <span>Manabase</span>
                          {manabaseVerdict && manabaseVerdict.verdict !== 'ok' && (
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 18,
                                height: 18,
                                px: 0.6,
                                borderRadius: 9,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                lineHeight: 1,
                                color: 'white',
                                bgcolor:
                                  manabaseVerdict.verdict === 'short' ? '#d32f2f' : '#ed6c02',
                              }}
                              aria-label={
                                manabaseVerdict.verdict === 'short'
                                  ? `${manabaseVerdict.shortCount} colors short`
                                  : `${manabaseVerdict.warnCount} colors close to limit`
                              }
                            >
                              {manabaseVerdict.verdict === 'short'
                                ? manabaseVerdict.shortCount
                                : manabaseVerdict.warnCount}
                            </Box>
                          )}
                          {manabaseVerdict && manabaseVerdict.verdict === 'ok' && (
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                lineHeight: 1,
                                color: 'white',
                                bgcolor: '#2e7d32',
                              }}
                              aria-label="All colors meet Karsten targets"
                            >
                              ✓
                            </Box>
                          )}
                        </Box>
                      }
                      aria-label={
                        manabaseVerdict?.verdict === 'short'
                          ? `Manabase — ${manabaseVerdict.shortCount} colors short of Karsten targets`
                          : manabaseVerdict?.verdict === 'warn'
                            ? `Manabase — ${manabaseVerdict.warnCount} colors close to target`
                            : 'Manabase - Land breakdown'
                      }
                    />
                    <Tab
                      icon={<DownloadIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label="Blueprint"
                      aria-label="Blueprint - Export analysis as PNG, PDF or JSON"
                    />
                  </Tabs>

                  <Suspense fallback={<AnalyzerSkeleton />}>
                    <TabPanel value={activeTab} index={0}>
                      <ErrorBoundary label="AnalyzerTab.Castability">
                        <CastabilityTab deckList={deckList} analysisResult={analysisResult} />
                      </ErrorBoundary>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                      <ErrorBoundary label="AnalyzerTab.Analysis">
                        <AnalysisTab
                          analysisResult={analysisResult}
                          isMobile={isMobile}
                          cards={analysisResult.cards}
                        />
                      </ErrorBoundary>
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                      <ErrorBoundary label="AnalyzerTab.Mulligan">
                        <MulliganTab cards={analysisResult.cards || []} isMobile={isMobile} />
                      </ErrorBoundary>
                    </TabPanel>

                    <TabPanel value={activeTab} index={3}>
                      <ErrorBoundary label="AnalyzerTab.Manabase">
                        <ManabaseFullTab
                          deckList={deckList}
                          analysisResult={analysisResult}
                          isMobile={isMobile}
                          isSmallMobile={isSmallMobile}
                          deckName={deckName}
                        />
                      </ErrorBoundary>
                    </TabPanel>

                    <TabPanel value={activeTab} index={4}>
                      <ErrorBoundary label="AnalyzerTab.Blueprint">
                        <ManaBlueprint
                          analysisResult={analysisResult}
                          deckName={`Deck ${new Date().toLocaleDateString()}`}
                        />
                      </ErrorBoundary>
                    </TabPanel>
                  </Suspense>
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Privacy Settings (lazy-loaded — see import comment above) */}
        <Box sx={{ mt: 4 }}>
          <Suspense fallback={null}>
            <PrivacySettings />
          </Suspense>
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
