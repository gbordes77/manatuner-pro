import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Balance as BalanceIcon
} from '@mui/icons-material';

interface EnhancedRecommendationsProps {
  recommendations: string[];
  analysis: {
    consistency: number;
    colorScrew: number;
    landRatio: number;
    avgCMC: number;
  };
}

const EnhancedRecommendations: React.FC<EnhancedRecommendationsProps> = ({ 
  recommendations, 
  analysis 
}) => {
  // Categorize recommendations by priority and type
  const categorizeRecommendations = () => {
    const categories = {
      critical: [] as string[],
      high: [] as string[],
      medium: [] as string[],
      low: [] as string[]
    };

    recommendations.forEach(rec => {
      const lowerRec = rec.toLowerCase();
      
      if (lowerRec.includes('critical') || lowerRec.includes('urgent') || 
          lowerRec.includes('must') || analysis.consistency < 0.6) {
        categories.critical.push(rec);
      } else if (lowerRec.includes('important') || lowerRec.includes('should') ||
                 analysis.consistency < 0.75) {
        categories.high.push(rec);
      } else if (lowerRec.includes('consider') || lowerRec.includes('might')) {
        categories.medium.push(rec);
      } else {
        categories.low.push(rec);
      }
    });

    return categories;
  };

  const categories = categorizeRecommendations();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <ErrorIcon sx={{ color: 'var(--mtg-red)' }} />;
      case 'high': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'medium': return <InfoIcon sx={{ color: 'var(--mtg-blue)' }} />;
      case 'low': return <LightbulbIcon sx={{ color: 'var(--mtg-green)' }} />;
      default: return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getHealthScore = () => {
    let score = 100;
    
    // Consistency penalty
    if (analysis.consistency < 0.6) score -= 30;
    else if (analysis.consistency < 0.75) score -= 15;
    else if (analysis.consistency < 0.85) score -= 5;
    
    // Color screw penalty
    if (analysis.colorScrew > 0.3) score -= 20;
    else if (analysis.colorScrew > 0.2) score -= 10;
    
    // Land ratio penalty
    if (analysis.landRatio < 0.35 || analysis.landRatio > 0.45) score -= 10;
    
    return Math.max(score, 0);
  };

  const healthScore = getHealthScore();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--mtg-green)';
    if (score >= 70) return 'var(--mtg-blue)';
    if (score >= 55) return 'var(--mtg-gold)';
    return 'var(--mtg-red)';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Average';
    return 'Needs Work';
  };

  return (
    <Box className="animate-fadeIn">
      {/* Health Score Overview */}
      <Paper className="mtg-card" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h2" fontWeight="700" color={getScoreColor(healthScore)}>
                {healthScore}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Manabase Health Score
              </Typography>
              <Chip 
                label={getScoreLabel(healthScore)}
                className={`mtg-chip ${getScoreLabel(healthScore).toLowerCase()}`}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <SecurityIcon sx={{ fontSize: 32, color: 'var(--mtg-blue)', mb: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    {Math.round(analysis.consistency * 100)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Consistency
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <WarningIcon sx={{ fontSize: 32, color: 'var(--mtg-red)', mb: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    {Math.round(analysis.colorScrew * 100)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Color Screw Risk
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <BalanceIcon sx={{ fontSize: 32, color: 'var(--mtg-green)', mb: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    {Math.round(analysis.landRatio * 100)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Land Ratio
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <SpeedIcon sx={{ fontSize: 32, color: 'var(--mtg-gold)', mb: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    {analysis.avgCMC.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg CMC
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Recommendations by Priority */}
      <Grid container spacing={3}>
        {Object.entries(categories).map(([priority, recs]) => {
          if (recs.length === 0) return null;
          
          return (
            <Grid item xs={12} lg={6} key={priority}>
              <Paper className="mtg-card" sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {getPriorityIcon(priority)}
                  <Typography variant="h6" fontWeight="600" textTransform="capitalize">
                    {priority} Priority
                  </Typography>
                  <Chip 
                    label={recs.length}
                    size="small"
                    color={getPriorityColor(priority) as any}
                  />
                </Box>
                
                <List dense>
                  {recs.map((rec, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getScoreColor(
                              priority === 'critical' ? 20 :
                              priority === 'high' ? 50 :
                              priority === 'medium' ? 75 : 90
                            )
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rec}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { lineHeight: 1.4 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Actions */}
      <Paper className="mtg-card" sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="600" mb={2}>
          🚀 Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<TrendingUpIcon />}
              className="mtg-button secondary"
              sx={{ py: 1.5 }}
            >
              Optimize Lands
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BalanceIcon />}
              className="mtg-button secondary"
              sx={{ py: 1.5 }}
            >
              Fix Curve
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SecurityIcon />}
              className="mtg-button secondary"
              sx={{ py: 1.5 }}
            >
              Add Fixing
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CheckCircleIcon />}
              className="mtg-button secondary"
              sx={{ py: 1.5 }}
            >
              Export List
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Pro Tips */}
      <Alert 
        severity="info" 
        icon={<LightbulbIcon />}
        sx={{ mt: 3 }}
        className="animate-slideIn"
      >
        <Typography variant="subtitle2" fontWeight="600" mb={1}>
          💡 Pro Tips from Frank Karsten's Research
        </Typography>
        <Typography variant="body2">
          • For 2-color decks, aim for 13+ sources of each color
          • Fetchlands count as 0.5 sources for each fetchable color
          • Consider your curve: aggressive decks need more colored sources early
          • Shocklands are excellent but watch your life total in aggressive metas
        </Typography>
      </Alert>
    </Box>
  );
};

export default EnhancedRecommendations; 