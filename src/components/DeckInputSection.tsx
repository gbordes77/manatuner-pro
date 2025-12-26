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
