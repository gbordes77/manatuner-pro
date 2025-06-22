import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAdvancedAnalysis } from '../../hooks/useAdvancedAnalysis';
import { MultiConstraint } from '../../types/maths';

interface MultivariateAnalysisProps {
  deckSize?: number;
  handSize?: number;
  onResultsChange?: (results: number) => void;
}

interface ConstraintInput {
  id: string;
  cardType: string;
  minCount: number;
  maxCount: number;
  cardsInDeck: number;
}

const CARD_TYPES = [
  { value: 'lands', label: '🌍 Lands' },
  { value: 'creatures', label: '🦁 Creatures' },
  { value: 'spells', label: '⚡ Spells' },
  { value: 'artifacts', label: '⚙️ Artifacts' },
  { value: 'enchantments', label: '✨ Enchantments' },
  { value: 'planeswalkers', label: '👑 Planeswalkers' },
  { value: 'removal', label: '💥 Removal' },
  { value: 'counterspells', label: '🚫 Counterspells' },
  { value: 'card_draw', label: '📚 Card Draw' },
  { value: 'ramp', label: '🚀 Ramp' }
];

export const MultivariateAnalysis: React.FC<MultivariateAnalysisProps> = ({
  deckSize = 60,
  handSize = 7,
  onResultsChange
}) => {
  const theme = useTheme();
  const { analyzeMultivariate, isLoading, error } = useAdvancedAnalysis();
  
  const [constraints, setConstraints] = useState<ConstraintInput[]>([
    {
      id: '1',
      cardType: 'lands',
      minCount: 2,
      maxCount: 5,
      cardsInDeck: 24
    }
  ]);
  
  const [results, setResults] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addConstraint = useCallback(() => {
    const newConstraint: ConstraintInput = {
      id: Date.now().toString(),
      cardType: 'creatures',
      minCount: 1,
      maxCount: 3,
      cardsInDeck: 8
    };
    setConstraints(prev => [...prev, newConstraint]);
  }, []);

  const removeConstraint = useCallback((id: string) => {
    setConstraints(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateConstraint = useCallback((id: string, field: keyof ConstraintInput, value: any) => {
    setConstraints(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  }, []);

  const runAnalysis = useCallback(async () => {
    try {
      const multiConstraints: MultiConstraint[] = constraints.map(c => ({
        cardType: c.cardType,
        minCount: c.minCount,
        maxCount: c.maxCount,
        cardsInDeck: c.cardsInDeck,
        priority: 5 // Default priority
      }));

      const probability = await analyzeMultivariate(deckSize, handSize, multiConstraints);
      setResults(probability);
      onResultsChange?.(probability);
    } catch (err) {
      console.error('Multivariate analysis failed:', err);
    }
  }, [constraints, deckSize, handSize, analyzeMultivariate, onResultsChange]);

  const getResultColor = (prob: number) => {
    if (prob >= 0.9) return theme.palette.success.main;
    if (prob >= 0.7) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getResultLabel = (prob: number) => {
    if (prob >= 0.9) return 'Excellent';
    if (prob >= 0.7) return 'Good';
    if (prob >= 0.5) return 'Fair';
    return 'Poor';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PsychologyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Multivariate Analysis
        </Typography>
        <Chip 
          label="Advanced" 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Calculate the probability of drawing multiple card types simultaneously.
          Example: "2+ lands AND 1+ creature AND 1+ removal spell"
        </Typography>
      </Alert>

      {/* Configuration Parameters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Deck Size"
            type="number"
            value={deckSize}
            disabled
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Hand Size"
            type="number"
            value={handSize}
            disabled
            size="small"
          />
        </Grid>
      </Grid>

      {/* Constraints */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Constraints ({constraints.length}/5)
      </Typography>

      {constraints.map((constraint, index) => (
        <Card key={constraint.id} sx={{ mb: 2, bgcolor: 'grey.50' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 2 }}>
                {index === 0 ? 'IF' : 'AND'}
              </Typography>
              <Chip 
                label={`Constraint ${index + 1}`} 
                size="small" 
                color="primary"
                sx={{ mr: 'auto' }}
              />
              {constraints.length > 1 && (
                <IconButton 
                  size="small" 
                  onClick={() => removeConstraint(constraint.id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  select
                  label="Card Type"
                  value={constraint.cardType}
                  onChange={(e) => updateConstraint(constraint.id, 'cardType', e.target.value)}
                  size="small"
                >
                  {CARD_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={4} sm={2}>
                <TextField
                  fullWidth
                  label="Min Count"
                  type="number"
                  value={constraint.minCount}
                  onChange={(e) => updateConstraint(constraint.id, 'minCount', parseInt(e.target.value) || 0)}
                  size="small"
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>

              <Grid item xs={4} sm={2}>
                <TextField
                  fullWidth
                  label="Max Count"
                  type="number"
                  value={constraint.maxCount}
                  onChange={(e) => updateConstraint(constraint.id, 'maxCount', parseInt(e.target.value) || 0)}
                  size="small"
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>

              <Grid item xs={4} sm={2}>
                <TextField
                  fullWidth
                  label="In Deck"
                  type="number"
                  value={constraint.cardsInDeck}
                  onChange={(e) => updateConstraint(constraint.id, 'cardsInDeck', parseInt(e.target.value) || 0)}
                  size="small"
                  inputProps={{ min: 0, max: deckSize }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  At least {constraint.minCount} {CARD_TYPES.find(t => t.value === constraint.cardType)?.label || constraint.cardType}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {/* Add Constraint Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addConstraint}
          disabled={constraints.length >= 5}
          variant="outlined"
          size="small"
        >
          Add Constraint ({constraints.length}/5)
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Calculate Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<CalculateIcon />}
          onClick={runAnalysis}
          disabled={isLoading || constraints.length === 0}
          sx={{ minWidth: 140 }}
        >
          {isLoading ? 'Calculating...' : 'Calculate'}
        </Button>

        <Button
          variant="outlined"
          onClick={() => setShowAdvanced(!showAdvanced)}
          size="small"
        >
          {showAdvanced ? 'Hide' : 'Show'} Details
        </Button>
      </Box>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Running multivariate hypergeometric analysis...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {results !== null && (
        <Card sx={{ bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1, color: getResultColor(results) }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Analysis Results
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: getResultColor(results)
                    }}
                  >
                    {(results * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Probability
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label={getResultLabel(results)}
                    sx={{
                      bgcolor: getResultColor(results),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      height: 32
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Rating
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {showAdvanced && (
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Constraint Summary:
                </Typography>
                {constraints.map((constraint, index) => (
                  <Typography key={constraint.id} variant="body2" sx={{ mb: 1 }}>
                    {index + 1}. At least <strong>{constraint.minCount}</strong> {CARD_TYPES.find(t => t.value === constraint.cardType)?.label || constraint.cardType} 
                    {' '}(from {constraint.cardsInDeck} in deck)
                  </Typography>
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Formula: Multivariate Hypergeometric Distribution
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Paper>
  );
}; 