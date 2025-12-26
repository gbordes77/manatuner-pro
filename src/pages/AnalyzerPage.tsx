import {
    Analytics as AnalyticsIcon,
    Assessment as AssessmentIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Container,
    Grid,
    Paper,
    Snackbar,
    Tab,
    Tabs,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    AnalysisTab,
    AnalyzerSkeleton,
    CastabilityTab,
    DashboardTab,
    DeckInputSection,
    ManabaseFullTab,
    MulliganTab,
    TabPanel,
} from "../components/analyzer";
import PrivacySettings from "../components/PrivacySettings";
import { PrivacyStorage } from "../lib/privacy";
import { DeckAnalyzer } from "../services/deckAnalyzer";
import { AppDispatch, RootState } from "../store";
import {
    clearAnalyzer,
    hideSnackbar,
    setActiveTab,
    setAnalysisResult,
    setDeckList,
    setIsAnalyzing,
    setIsDeckMinimized,
    showSnackbar,
} from "../store/slices/analyzerSlice";
// Lazy-load Onboarding (includes react-joyride ~50KB)
const Onboarding = React.lazy(() => import("../components/Onboarding"));

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
4 Starting Town (FIN) 289`;

const AnalyzerPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:375px)");

  // Redux state
  const dispatch = useDispatch<AppDispatch>();
  const {
    deckList,
    analysisResult,
    isAnalyzing,
    isDeckMinimized,
    activeTab,
    snackbar,
  } = useSelector((state: RootState) => state.analyzer);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    dispatch(setActiveTab(newValue));
  };

  // Memoized analyze handler to prevent unnecessary re-renders
  const handleAnalyze = useCallback(async () => {
    if (!deckList.trim()) return;

    dispatch(setIsAnalyzing(true));

    try {
      const result = await DeckAnalyzer.analyzeDeck(deckList);
      dispatch(setAnalysisResult(result));

      // Auto-save to PrivacyStorage
      try {
        const deckName = `Deck ${new Date().toLocaleDateString()}`;
        PrivacyStorage.saveAnalysis({ deckName, deckList, analysis: result });
      } catch {
        // Silent fail for auto-save
      }
    } catch {
      dispatch(setAnalysisResult(null));
    } finally {
      dispatch(setIsAnalyzing(false));
    }
  }, [deckList, dispatch]);

  const handleClear = useCallback(() => {
    dispatch(clearAnalyzer());
    dispatch(showSnackbar({
      message: "🗑️ Interface cleared! Ready for new deck analysis.",
      severity: "info",
    }));
  }, [dispatch]);

  const handleLoadSample = useCallback(() => {
    dispatch(setDeckList(SAMPLE_DECK));
  }, [dispatch]);

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
        width: "100%",
        maxWidth: "100% !important",
        overflowX: "hidden",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* Header - Hidden when analysis is displayed */}
      {!analysisResult && (
        <Box sx={{ mb: isMobile ? 2 : 4, textAlign: "center" }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", fontSize: isMobile ? "1.5rem" : undefined }}
          >
            <AnalyticsIcon sx={{ fontSize: isMobile ? 30 : 40, mr: 1, verticalAlign: "middle" }} />
            ManaTuner Pro
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="text.secondary"
            sx={{ fontSize: isMobile ? "0.9rem" : undefined, px: isMobile ? 1 : 0 }}
          >
            Analyze your manabase with the precision of Frank Karsten's mathematics
          </Typography>
        </Box>
      )}

      {/* Compact deck bar when minimized */}
      {analysisResult && isDeckMinimized && (
        <Paper
          sx={{
            p: 1.5,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: "1px dashed",
            borderColor: "divider",
            "&:hover": {
              boxShadow: 3,
              backgroundColor: "action.hover",
              borderColor: "primary.main",
            },
          }}
          onClick={() => dispatch(setIsDeckMinimized(false))}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" fontWeight="bold">
              📋 Your Deck
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {analysisResult.totalCards} cards • {analysisResult.totalLands} lands
            </Typography>
          </Box>
          <Typography variant="body2" color="primary" sx={{ fontWeight: "medium", display: { xs: "none", sm: "block" } }}>
            👆 Click to edit or analyze a new deck
          </Typography>
          <Typography variant="body2" color="primary" sx={{ fontWeight: "medium" }}>
            ✏️ Edit
          </Typography>
        </Paper>
      )}

      <Grid
        container
        spacing={isSmallMobile ? 1 : isMobile ? 2 : 4}
        sx={{
          width: "100%",
          maxWidth: "100%",
          margin: 0,
          overflowX: "hidden",
          boxSizing: "border-box",
          "& .MuiGrid-item": {
            paddingLeft: isSmallMobile ? "4px !important" : undefined,
            paddingTop: isSmallMobile ? "4px !important" : undefined,
            maxWidth: "100%",
            boxSizing: "border-box",
          },
        }}
      >
        {/* Input Section - Hidden when minimized */}
        {!(analysisResult && isDeckMinimized) && (
          <Grid item xs={12} lg={isMobile ? 12 : 6}>
            <DeckInputSection
              deckList={deckList}
              setDeckList={(value: string) => dispatch(setDeckList(value))}
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
              cursor: analysisResult && !isDeckMinimized ? "pointer" : "default",
              transition: "all 0.3s ease-in-out",
              "&:hover": analysisResult && !isDeckMinimized
                ? { transform: isMobile ? "none" : "scale(1.01)", boxShadow: 2 }
                : {},
            }}
            onClick={() => {
              if (analysisResult && !isDeckMinimized && !isMobile) {
                dispatch(setIsDeckMinimized(true));
              }
            }}
          >
            {isAnalyzing ? (
              <AnalyzerSkeleton variant="results" />
            ) : !analysisResult ? (
              <Box sx={{ textAlign: "center", py: isMobile ? 4 : 8 }}>
                <AssessmentIcon sx={{ fontSize: isMobile ? 60 : 80, color: "text.secondary", mb: 2 }} />
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? "0.9rem" : undefined }}
                >
                  Enter your deck and click "Analyze" to see results
                </Typography>
              </Box>
            ) : (
              <div data-testid="analysis-results">
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  gutterBottom
                  sx={{ fontSize: isMobile ? "1.1rem" : undefined }}
                >
                  📊 Analysis Results{" "}
                  {!isDeckMinimized && !isMobile && "(Click to minimize deck)"}
                </Typography>

                {/* NEW: 4 Clean Tabs */}
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    mb: isMobile ? 2 : 3,
                    "& .MuiTab-root": {
                      fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.85rem" : "0.95rem",
                      fontWeight: "medium",
                      textTransform: "none",
                      minHeight: isMobile ? 48 : 56,
                    },
                    "& .MuiTabs-indicator": {
                      height: 3,
                      borderRadius: "3px 3px 0 0",
                    },
                  }}
                >
                  <Tab label="📊 Dashboard" />
                  <Tab label="🎯 Castability" />
                  <Tab label="🎲 Mulligan" />
                  <Tab label="⚡ Analysis" />
                  <Tab label="🏔️ Manabase" />
                </Tabs>

                {/* Tab 0: Dashboard - Overview + Top Recommendations */}
                <TabPanel value={activeTab} index={0}>
                  <DashboardTab analysisResult={analysisResult} isMobile={isMobile} />
                </TabPanel>

                {/* Tab 1: Castability - The core feature */}
                <TabPanel value={activeTab} index={1}>
                  <CastabilityTab deckList={deckList} analysisResult={analysisResult} />
                </TabPanel>

                {/* Tab 2: Mulligan Strategy - Advanced Monte Carlo analysis */}
                <TabPanel value={activeTab} index={2}>
                  <MulliganTab cards={analysisResult.cards || []} isMobile={isMobile} />
                </TabPanel>

                {/* Tab 3: Analysis - Spells + Probabilities + Full Recommendations */}
                <TabPanel value={activeTab} index={3}>
                  <AnalysisTab analysisResult={analysisResult} isMobile={isMobile} cards={analysisResult.cards} />
                </TabPanel>

                {/* Tab 4: Manabase - Lands + Full Deck List */}
                <TabPanel value={activeTab} index={4}>
                  <ManabaseFullTab
                    deckList={deckList}
                    analysisResult={analysisResult}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                  />
                </TabPanel>
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => dispatch(hideSnackbar())}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </>
  );
};

export default AnalyzerPage;
