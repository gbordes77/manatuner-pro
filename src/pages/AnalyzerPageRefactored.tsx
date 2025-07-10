import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Terrain as TerrainIcon,
  ViewList as ViewListIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

// Hooks personnalisés
import { useDeckAnalysis } from '../hooks/useDeckAnalysis';
import { useProbabilityValidation } from '../hooks/useProbabilityValidation';

// Composants modulaires
import { DeckInputSection } from '../components/DeckInputSection';
import ManaCostRow from '../components/ManaCostRow';
import EnhancedCharts from '../components/EnhancedCharts';
import EnhancedRecommendations from '../components/EnhancedRecommendations';
import EnhancedSpellAnalysis from '../components/EnhancedSpellAnalysis';
import { ResponsiveTable } from '../components/ResponsiveTable';
import AnalysisActions from '../components/AnalysisActions';
import PrivacySettings from '../components/PrivacySettings';

// Utilitaires
import { isLandCardComplete, categorizeLandComplete } from '../utils/landDetectionComplete';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
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
  );
}

const AnalyzerPageRefactored: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery('(max-width:375px)');

  // State local pour l'UI
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'warning' | 'error'
  });

  // Hooks personnalisés
  const {
    deckList,
    setDeckList,
    isAnalyzing,
    analysisResult,
    isDeckMinimized,
    setIsDeckMinimized,
    analyzeDeck,
    clearAnalysis
  } = useDeckAnalysis();

  const { runValidation, isValidating } = useProbabilityValidation();

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleValidation = () => {
    const result = runValidation();
    setSnackbar({
      open: true,
      message: result.message,
      severity: result.severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
4 Starting Town (FIN) 289`;

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
          variant="subtitle1" 
          color="text.secondary"
          sx={{ fontSize: isMobile ? '0.9rem' : undefined }}
        >
          Advanced Manabase Analysis Tool
        </Typography>
      </Box>

      {/* Section d'entrée du deck */}
      <DeckInputSection
        deckList={deckList}
        setDeckList={setDeckList}
        onAnalyze={analyzeDeck}
        isAnalyzing={isAnalyzing}
        isDeckMinimized={isDeckMinimized}
        setIsDeckMinimized={setIsDeckMinimized}
        sampleDeck={sampleDeck}
      />

      {/* Barre de progression */}
      {isAnalyzing && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 1, textAlign: 'center' }}
          >
            Analyzing your deck...
          </Typography>
        </Box>
      )}

      {/* Résultats d'analyse */}
      {analysisResult && (
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{
                '& .MuiTab-root': {
                  fontSize: isMobile ? '0.7rem' : '0.875rem',
                  minWidth: isMobile ? 80 : 120,
                  padding: isMobile ? '6px 8px' : '12px 16px'
                }
              }}
            >
              <Tab 
                icon={<SpeedIcon />} 
                label="Overview" 
                iconPosition={isMobile ? "top" : "start"}
              />
              <Tab 
                icon={<AssessmentIcon />} 
                label="Charts" 
                iconPosition={isMobile ? "top" : "start"}
              />
              <Tab 
                icon={<TerrainIcon />} 
                label="Lands" 
                iconPosition={isMobile ? "top" : "start"}
              />
              <Tab 
                icon={<ViewListIcon />} 
                label="Spells" 
                iconPosition={isMobile ? "top" : "start"}
              />
              <Tab 
                icon={<AttachMoneyIcon />} 
                label="Actions" 
                iconPosition={isMobile ? "top" : "start"}
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {/* Affichage des statistiques générales */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Deck Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analysisResult.totalCards}
                    </Typography>
                    <Typography variant="body2">Total Cards</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analysisResult.totalLands}
                    </Typography>
                    <Typography variant="body2">Lands</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analysisResult.averageCMC.toFixed(1)}
                    </Typography>
                    <Typography variant="body2">Avg. CMC</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color={
                      analysisResult.rating === 'excellent' ? 'success.main' :
                      analysisResult.rating === 'good' ? 'info.main' :
                      analysisResult.rating === 'average' ? 'warning.main' : 'error.main'
                    }>
                      {analysisResult.rating.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">Rating</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {/* Graphiques simplifiés */}
            <Typography variant="h6" gutterBottom>Analysis Charts</Typography>
            <Typography variant="body2" color="text.secondary">
              Charts functionality will be implemented with proper interfaces
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {/* Recommandations */}
            <Typography variant="h6" gutterBottom>Recommendations</Typography>
            <Box>
              {analysisResult.recommendations.map((rec, index) => (
                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                  {rec}
                </Alert>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {/* Analyse des sorts simplifiée */}
            <Typography variant="h6" gutterBottom>Spell Analysis</Typography>
            <Box>
              {Object.entries(analysisResult.spellAnalysis).map(([key, data]) => (
                <Paper key={key} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="subtitle1">{key}</Typography>
                  <Typography variant="body2">
                    Castable: {data.castable}/{data.total} ({data.percentage.toFixed(1)}%)
                  </Typography>
                </Paper>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <AnalysisActions 
                  deckList={deckList}
                  analysisResult={analysisResult}
                  onLoadAnalysis={(loadedDeckList, loadedResult) => {
                    setDeckList(loadedDeckList);
                    // Note: Nous ne pouvons pas directement setter analysisResult ici
                    // car il vient du hook useDeckAnalysis
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PrivacySettings />
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      )}

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AnalyzerPageRefactored; 