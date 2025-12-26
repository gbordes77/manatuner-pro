import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    FlashOn as FlashOnIcon,
    HelpOutline as HelpOutlineIcon,
    Science as ScienceIcon,
    Speed as SpeedIcon,
    Timer as TimerIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';
import type { TempoImpactSummary, TempoSpellAnalysis } from '../services/deckAnalyzer';
import { CardImageTooltip } from './CardImageTooltip';

interface SpellAnalysisData {
  [spellName: string]: {
    castable: number;
    total: number;
    percentage: number;
  };
}

interface EnhancedSpellAnalysisProps {
  spellAnalysis: SpellAnalysisData;
  tempoSpellAnalysis?: Record<string, TempoSpellAnalysis>;
  tempoImpactByColor?: Record<string, TempoImpactSummary>;
}

const EnhancedSpellAnalysis: React.FC<EnhancedSpellAnalysisProps> = ({
  spellAnalysis,
  tempoSpellAnalysis,
  tempoImpactByColor: _tempoImpactByColor
}) => {
  // Always use tempo mode - no toggle needed
  const hasTempoData = tempoSpellAnalysis && Object.keys(tempoSpellAnalysis).length > 0;

  // Prepare data for different visualizations - Always use tempo when available
  const prepareSpellData = () => {
    return Object.entries(spellAnalysis).map(([name, data]) => {
      const tempoData = tempoSpellAnalysis?.[name];
      // Always use tempo-adjusted percentage when available
      const displayPercentage = tempoData?.tempoAdjustedPercentage || data.percentage;

      return {
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        percentage: displayPercentage,
        rawPercentage: data.percentage,
        tempoPercentage: tempoData?.tempoAdjustedPercentage || data.percentage,
        tempoImpact: tempoData?.tempoImpact || 0,
        castable: data.castable,
        total: data.total,
        efficiency: (data.castable / data.total) * 100,
        category: getSpellCategory(displayPercentage),
        tempoRating: tempoData?.rating || 'good',
        scenarios: tempoData?.scenarios || { aggressive: 100, conservative: 100, balanced: 100 }
      };
    }).sort((a, b) => b.percentage - a.percentage);
  };

  const getSpellCategory = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Average';
    if (percentage >= 60) return 'Weak';
    return 'Critical';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Excellent': return 'var(--mtg-green)';
      case 'Good': return 'var(--mtg-blue)';
      case 'Average': return 'var(--mtg-gold)';
      case 'Weak': return '#ff9800';
      case 'Critical': return 'var(--mtg-red)';
      default: return '#95A5A6';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Excellent': return <CheckCircleIcon sx={{ color: 'var(--mtg-green)' }} />;
      case 'Good': return <TrendingUpIcon sx={{ color: 'var(--mtg-blue)' }} />;
      case 'Average': return <SpeedIcon sx={{ color: 'var(--mtg-gold)' }} />;
      case 'Weak': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'Critical': return <ErrorIcon sx={{ color: 'var(--mtg-red)' }} />;
      default: return <SpeedIcon />;
    }
  };

  const spellData = prepareSpellData();

  // Prepare category distribution
  const categoryDistribution = spellData.reduce((acc, spell) => {
    acc[spell.category] = (acc[spell.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryDistribution).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / spellData.length) * 100),
    fill: getCategoryColor(category)
  }));

  interface SpellTooltipPayload {
    payload: {
      fullName?: string;
      percentage: number;
      rawPercentage: number;
      tempoPercentage: number;
      tempoImpact: number;
      castable: number;
      total: number;
      category: string;
      scenarios: { aggressive: number; conservative: number; balanced: number };
    };
  }

  interface SpellTooltipProps {
    active?: boolean;
    payload?: SpellTooltipPayload[];
    label?: string | number;
  }

  const CustomTooltip = ({ active, payload, label }: SpellTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper className="mtg-card" sx={{ p: 2, maxWidth: 280 }}>
          <Typography variant="subtitle2" fontWeight="600" mb={1}>
            {data.fullName || label}
          </Typography>
          <Typography variant="body2">
            Castability: {data.percentage}%
          </Typography>
          {hasTempoData && data.tempoImpact !== 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Raw: {data.rawPercentage}% → Tempo: {data.tempoPercentage}%
              </Typography>
              <Typography variant="body2" sx={{
                color: data.tempoImpact > 5 ? 'var(--mtg-red)' : data.tempoImpact > 0 ? '#ff9800' : 'var(--mtg-green)'
              }}>
                Tempo Impact: {data.tempoImpact > 0 ? '-' : '+'}{Math.abs(data.tempoImpact)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Aggro: {data.scenarios.aggressive}% | Control: {data.scenarios.conservative}%
              </Typography>
            </>
          )}
          <Typography variant="body2">
            Copies: {data.castable}/{data.total}
          </Typography>
          <Typography variant="body2">
            Category: {data.category}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const averagePercentage = spellData.reduce((sum, spell) => sum + spell.percentage, 0) / spellData.length;

  return (
    <Box className="animate-fadeIn">
      {/* Performance Insights - FIRST (reliable) */}
      <Paper className="mtg-card" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
          Performance Insights
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'var(--mtg-green)', mb: 1 }} />
              <Typography variant="h6" fontWeight="600">
                Strong Spells
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {spellData.filter(s => s.percentage >= 80).length} spells with 80%+ castability
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <WarningIcon sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
              <Typography variant="h6" fontWeight="600">
                Risky Spells
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {spellData.filter(s => s.percentage < 70 && s.percentage >= 60).length} spells need mana fixing
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <ErrorIcon sx={{ fontSize: 48, color: 'var(--mtg-red)', mb: 1 }} />
              <Typography variant="h6" fontWeight="600">
                Critical Issues
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {spellData.filter(s => s.percentage < 60).length} spells with severe mana problems
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Spell Castability Chart */}
        <Grid item xs={12} lg={8}>
          <Paper className="mtg-card" sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
              Spell Castability Analysis
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={spellData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="percentage"
                  radius={[4, 4, 0, 0]}
                >
                  {spellData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper className="mtg-card" sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
              Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="count"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value, _name, props) => [
                    `${value} spells (${props.payload.percentage}%)`,
                    props.payload.category
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {categoryData.map((cat, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: cat.fill,
                      borderRadius: '50%'
                    }}
                  />
                  <Typography variant="body2" fontSize="0.8rem">
                    {cat.category}: {cat.count} ({cat.percentage}%)
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Detailed Spell List */}
        <Grid item xs={12}>
          <Paper className="mtg-card" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
              Detailed Spell Analysis
            </Typography>

            <Grid container spacing={2}>
              {spellData.map((spell, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card
                    variant="outlined"
                    className="animate-slideIn"
                    sx={{
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: getCategoryColor(spell.category),
                            fontSize: '0.75rem'
                          }}
                        >
                          {spell.percentage}
                        </Avatar>
                        <CardImageTooltip cardName={spell.fullName}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            sx={{
                              flexGrow: 1,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {spell.name}
                          </Typography>
                        </CardImageTooltip>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {getCategoryIcon(spell.category)}
                        <Chip
                          label={spell.category}
                          size="small"
                          sx={{
                            backgroundColor: getCategoryColor(spell.category),
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {spell.castable}/{spell.total} copies castable
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={spell.percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getCategoryColor(spell.category)
                          }
                        }}
                      />

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {spell.percentage}% castability
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Tempo-Aware Analysis - LAST (experimental) */}
        {hasTempoData && (
          <Grid item xs={12}>
            <Paper className="mtg-card" sx={{ p: 3, border: '1px dashed', borderColor: 'warning.main' }}>
              {/* BETA Warning Header */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <ScienceIcon color="warning" />
                <Typography variant="h6" fontWeight="600" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  Tempo-Aware Analysis
                  <Tooltip title="This analysis factors in ETB (Enter The Battlefield) tapped lands. It calculates the probability that your lands will be untapped when you need to cast spells." arrow>
                    <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                      <HelpOutlineIcon fontSize="small" sx={{ fontSize: 16, opacity: 0.7 }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Chip
                  label="BETA"
                  size="small"
                  color="warning"
                  icon={<ScienceIcon />}
                />
                <Chip
                  label="ETB Considered"
                  size="small"
                  variant="outlined"
                  color="warning"
                  icon={<FlashOnIcon />}
                />
              </Box>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Experimental Feature:</strong> This tempo analysis is still being validated.
                  The calculations consider ETB tapped lands but may not reflect all real-game scenarios.
                  Use as a rough indicator, not as definitive data.
                </Typography>
              </Alert>

              {/* Tempo Overview Cards */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="h4" fontWeight="700" color="var(--mtg-blue)">
                      {spellData.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Spells
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="h4" fontWeight="700" color="var(--mtg-green)">
                      {Math.round(averagePercentage)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Avg Tempo Castability
                      <Tooltip title="Average probability of casting spells on curve, accounting for ETB tapped lands." arrow>
                        <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                          <HelpOutlineIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="h4" fontWeight="700" color="var(--mtg-gold)">
                      {categoryDistribution['Excellent'] || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Excellent Spells
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="h4" fontWeight="700" color="var(--mtg-red)">
                      {(categoryDistribution['Critical'] || 0) + (categoryDistribution['Weak'] || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Problem Spells
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Tempo Impact Details */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight="600" mb={2}>
                  Spells with Tempo Impact
                </Typography>
                <Grid container spacing={1}>
                  {spellData.filter(s => s.tempoImpact !== 0).slice(0, 8).map((spell, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <TimerIcon sx={{
                          fontSize: 16,
                          color: spell.tempoImpact > 5 ? 'var(--mtg-red)' : '#ff9800'
                        }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="caption" fontWeight="600" noWrap>
                            {spell.name}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            -{spell.tempoImpact}% tempo loss
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {spellData.filter(s => s.tempoImpact !== 0).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No significant tempo impact detected - your manabase has good untapped land density.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EnhancedSpellAnalysis;
