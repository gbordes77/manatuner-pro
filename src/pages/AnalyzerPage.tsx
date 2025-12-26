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
import React, { useEffect, useState } from "react";
import {
    CastabilityTab,
    DeckInputSection,
    DeckListTab,
    ManabaseTab,
    OverviewTab,
    ProbabilitiesTab,
    TabPanel,
} from "../components/analyzer";
import EnhancedRecommendations from "../components/EnhancedRecommendations";
import EnhancedSpellAnalysis from "../components/EnhancedSpellAnalysis";
import PrivacySettings from "../components/PrivacySettings";
import { PrivacyStorage } from "../lib/privacy";
import { AnalysisResult, DeckAnalyzer } from "../services/deckAnalyzer";
import { ManaCalculator } from "../services/manaCalculator";

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
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery("(max-width:375px)");

  const [activeTab, setActiveTab] = useState(0);
  const [deckList, setDeckList] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDeckMinimized, setIsDeckMinimized] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedDeckList = localStorage.getItem("manatuner-decklist");
    const savedAnalysis = localStorage.getItem("manatuner-analysis");
    const savedMinimized = localStorage.getItem("manatuner-minimized");

    if (savedDeckList) setDeckList(savedDeckList);
    if (savedAnalysis) {
      try {
        setAnalysisResult(JSON.parse(savedAnalysis));
      } catch (e) {
        console.warn("Failed to parse saved analysis");
      }
    }
    if (savedMinimized) setIsDeckMinimized(savedMinimized === "true");
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("manatuner-decklist", deckList);
  }, [deckList]);

  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem("manatuner-analysis", JSON.stringify(analysisResult));
    } else {
      localStorage.removeItem("manatuner-analysis");
    }
  }, [analysisResult]);

  useEffect(() => {
    localStorage.setItem("manatuner-minimized", isDeckMinimized.toString());
  }, [isDeckMinimized]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAnalyze = async () => {
    if (!deckList.trim()) return;

    setIsAnalyzing(true);

    setTimeout(async () => {
      try {
        const result = await DeckAnalyzer.analyzeDeck(deckList);
        setAnalysisResult(result);
        setIsDeckMinimized(true);

        // Auto-save
        try {
          const deckName = `Deck ${new Date().toLocaleDateString()}`;
          PrivacyStorage.saveAnalysis({ deckName, deckList, analysis: result });
        } catch (saveError) {
          console.warn("Auto-save failed:", saveError);
        }
      } catch (error) {
        console.error("Analysis error:", error);
        setAnalysisResult(null);
      }
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleClear = () => {
    setDeckList("");
    setAnalysisResult(null);
    setIsDeckMinimized(false);
    localStorage.removeItem("manatuner-decklist");
    localStorage.removeItem("manatuner-analysis");
    localStorage.removeItem("manatuner-minimized");
    setSnackbar({
      open: true,
      message: "🗑️ Interface cleared! Ready for new deck analysis.",
      severity: "info",
    });
  };

  const runProbabilityValidation = () => {
    const calculator = new ManaCalculator();
    const tests = [
      { name: "Thoughtseize T1 (1B)", deckSize: 60, sources: 14, turn: 1, symbols: 1, expected: 0.904 },
      { name: "Counterspell T2 (UU)", deckSize: 60, sources: 20, turn: 2, symbols: 2, expected: 0.9 },
      { name: "Lightning Bolt T1 (R)", deckSize: 60, sources: 14, turn: 1, symbols: 1, expected: 0.904 },
    ];

    console.log("🧪 PROBABILITY VALIDATION");
    console.log("=".repeat(50));

    let passed = 0;
    tests.forEach((test) => {
      const result = calculator.calculateManaProbability(
        test.deckSize, test.sources, test.turn, test.symbols, true
      );
      const actual = result.probability;
      const tolerance = 0.02;
      const isValid = Math.abs(actual - test.expected) <= tolerance;

      console.log(`${isValid ? "✅" : "❌"} ${test.name}`);
      console.log(`   Expected: ${(test.expected * 100).toFixed(1)}%`);
      console.log(`   Calculated: ${(actual * 100).toFixed(1)}%`);

      if (isValid) passed++;
    });

    console.log(`\n📈 RESULTS: ${passed}/${tests.length} tests passed`);

    setSnackbar({
      open: true,
      message: passed === tests.length
        ? `✅ Validation successful! ${passed}/${tests.length} tests passed.`
        : `⚠️ Partial validation: ${passed}/${tests.length} tests passed.`,
      severity: passed === tests.length ? "success" : "warning",
    });
  };

  return (
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
      {/* Header */}
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
        {/* Input Section */}
        <Grid item xs={12} lg={analysisResult && isDeckMinimized ? 2 : isMobile ? 12 : 6}>
          <DeckInputSection
            deckList={deckList}
            setDeckList={setDeckList}
            isAnalyzing={isAnalyzing}
            analysisResult={analysisResult}
            isDeckMinimized={isDeckMinimized}
            setIsDeckMinimized={setIsDeckMinimized}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            onLoadSample={() => setDeckList(SAMPLE_DECK)}
            onTestProbabilities={runProbabilityValidation}
            isMobile={isMobile}
            isSmallMobile={isSmallMobile}
          />
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={analysisResult && isDeckMinimized ? 10 : isMobile ? 12 : 6}>
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
                setIsDeckMinimized(true);
              }
            }}
          >
            {!analysisResult ? (
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

                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant={isTablet ? "scrollable" : "standard"}
                  scrollButtons={isTablet ? "auto" : false}
                  allowScrollButtonsMobile
                  sx={{
                    mb: isMobile ? 2 : 3,
                    "& .MuiTab-root": {
                      fontSize: isSmallMobile ? "0.7rem" : isMobile ? "0.75rem" : undefined,
                      minWidth: isSmallMobile ? "60px" : isMobile ? "auto" : undefined,
                      padding: isSmallMobile ? "4px 6px" : isMobile ? "6px 8px" : undefined,
                      textTransform: "none",
                    },
                    "& .MuiTabs-scrollButtons.Mui-disabled": { opacity: 0.3 },
                    "& .MuiTabs-indicator": { height: isMobile ? 2 : 3 },
                  }}
                >
                  <Tab label="🎯 Castability" />
                  <Tab label="💡 Recommendations" />
                  <Tab label="⚡ Spell Analysis" />
                  <Tab label="📊 Probabilities" />
                  <Tab label="📋 Overview" />
                  <Tab label="🏔️ Manabase" />
                  <Tab label="📜 Deck List" />
                </Tabs>

                {/* Tab 0: Castability */}
                <TabPanel value={activeTab} index={0}>
                  <CastabilityTab deckList={deckList} analysisResult={analysisResult} />
                </TabPanel>

                {/* Tab 1: Recommendations */}
                <TabPanel value={activeTab} index={1}>
                  <EnhancedRecommendations
                    recommendations={analysisResult.recommendations}
                    analysis={{
                      consistency: analysisResult.consistency,
                      colorScrew: (1 - analysisResult.consistency) * 0.2,
                      landRatio: analysisResult.landRatio,
                      avgCMC: analysisResult.averageCMC,
                    }}
                  />
                </TabPanel>

                {/* Tab 2: Spell Analysis */}
                <TabPanel value={activeTab} index={2}>
                  <EnhancedSpellAnalysis
                    spellAnalysis={analysisResult.spellAnalysis}
                    tempoSpellAnalysis={analysisResult.tempoSpellAnalysis}
                    tempoImpactByColor={analysisResult.tempoImpactByColor}
                  />
                </TabPanel>

                {/* Tab 3: Probabilities */}
                <TabPanel value={activeTab} index={3}>
                  <ProbabilitiesTab analysisResult={analysisResult} />
                </TabPanel>

                {/* Tab 4: Overview */}
                <TabPanel value={activeTab} index={4}>
                  <OverviewTab analysisResult={analysisResult} isMobile={isMobile} />
                </TabPanel>

                {/* Tab 5: Manabase */}
                <TabPanel value={activeTab} index={5}>
                  <ManabaseTab
                    deckList={deckList}
                    analysisResult={analysisResult}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                  />
                </TabPanel>

                {/* Tab 6: Deck List */}
                <TabPanel value={activeTab} index={6}>
                  <DeckListTab deckList={deckList} />
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity as "success" | "warning" | "error" | "info"}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AnalyzerPage;
