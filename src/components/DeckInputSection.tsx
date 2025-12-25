import {
    Add as AddIcon,
    Analytics as AnalyticsIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Collapse,
    IconButton,
    Paper,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React from 'react';

interface DeckInputSectionProps {
  deckList: string;
  setDeckList: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isDeckMinimized: boolean;
  setIsDeckMinimized: (value: boolean) => void;
  sampleDeck?: string;
}

export const DeckInputSection: React.FC<DeckInputSectionProps> = ({
  deckList,
  setDeckList,
  onAnalyze,
  isAnalyzing,
  isDeckMinimized,
  setIsDeckMinimized,
  sampleDeck
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width:375px)');

  const handleLoadSample = () => {
    if (sampleDeck) {
      setDeckList(sampleDeck);
    }
  };

  const defaultSampleDeck = `4 Light-Paws, Emperor's Voice (NEO) 25
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
    <Paper
      elevation={3}
      sx={{
        mb: isMobile ? 2 : 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      {/* Header avec bouton collapse */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setIsDeckMinimized(!isDeckMinimized)}
      >
        <Typography
          variant="h6"
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: isMobile ? '1rem' : '1.25rem'
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Your Deck
        </Typography>
        <IconButton
          sx={{ color: 'white' }}
          size={isMobile ? 'small' : 'medium'}
        >
          {isDeckMinimized ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>

      {/* Contenu collapsible */}
      <Collapse in={!isDeckMinimized}>
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 8 : 12}
            variant="outlined"
            placeholder="Paste your deck list here (one card per line)

Supported formats: Moxfield, Archidekt, MTGA, MTGO, TappedOut

Examples:
4 Lightning Bolt
4 Counterspell (MKM) 47
1 Arid Mesa // Gruul Turf"
            value={deckList}
            onChange={(e) => setDeckList(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: isSmallMobile ? '0.75rem' : isMobile ? '0.8rem' : '0.9rem'
              }
            }}
          />

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center'
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={onAnalyze}
              disabled={isAnalyzing || !deckList.trim()}
              startIcon={<AnalyticsIcon />}
              sx={{
                minWidth: isMobile ? 'auto' : 120,
                fontSize: isMobile ? '0.8rem' : '0.9rem'
              }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Deck'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleLoadSample}
              sx={{
                fontSize: isMobile ? '0.8rem' : '0.9rem'
              }}
            >
              Load Sample Deck
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};
