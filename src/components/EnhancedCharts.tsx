import {
    Box,
    Chip,
    Grid,
    Paper,
    Typography,
    useTheme
} from '@mui/material';
import React from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { DeckAnalysis } from '../types';

interface EnhancedChartsProps {
  analysis: DeckAnalysis;
}

const EnhancedCharts: React.FC<EnhancedChartsProps> = ({ analysis }) => {
  const theme = useTheme();

  // MTG Color Palette
  const MTG_COLORS = {
    W: '#FFFBF0',
    U: '#4A90E2',
    B: '#2C2C2C',
    R: '#E74C3C',
    G: '#27AE60',
    Generic: '#95A5A6'
  };

  // Prepare data for different charts
  const prepareTurnData = () => {
    return [
      { turn: 1, probability: 85, lands: 1, spells: 0 },
      { turn: 2, probability: 78, lands: 2, spells: 1 },
      { turn: 3, probability: 72, lands: 3, spells: 2 },
      { turn: 4, probability: 68, lands: 4, spells: 3 },
      { turn: 5, probability: 65, lands: 5, spells: 4 },
      { turn: 6, probability: 62, lands: 6, spells: 5 },
      { turn: 7, probability: 60, lands: 7, spells: 6 }
    ];
  };

  const prepareColorDistribution = () => {
    const colors = analysis.colorDistribution || {};
    const totalCount = Object.values(colors).reduce((a: number, b: number) => a + b, 0);
    return Object.entries(colors).map(([color, count]) => ({
      color,
      count: count as number,
      percentage: Math.round(((count as number) / totalCount) * 100),
      fill: MTG_COLORS[color as keyof typeof MTG_COLORS] || MTG_COLORS.Generic
    }));
  };

  const prepareCurveData = () => {
    const curve = analysis.manaCurve || {};
    const totalCount = Object.values(curve).reduce((a: number, b: number) => a + b, 0);
    return Object.entries(curve).map(([cmc, count]) => ({
      cmc: parseInt(cmc),
      count: count as number,
      percentage: Math.round(((count as number) / totalCount) * 100)
    }));
  };

  const prepareConsistencyData = () => {
    return [
      { metric: 'Color Fixing', value: 85, max: 100 },
      { metric: 'Curve Smoothness', value: 72, max: 100 },
      { metric: 'Land Ratio', value: 68, max: 100 },
      { metric: 'Mana Efficiency', value: 78, max: 100 },
      { metric: 'Consistency', value: 75, max: 100 }
    ];
  };

  const prepareMulliganData = () => {
    return [
      { scenario: 'Perfect Hand', keep: 95, mulligan: 5 },
      { scenario: 'Good Hand', keep: 82, mulligan: 18 },
      { scenario: 'Average Hand', keep: 65, mulligan: 35 },
      { scenario: 'Poor Hand', keep: 25, mulligan: 75 },
      { scenario: 'Terrible Hand', keep: 5, mulligan: 95 }
    ];
  };

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper className="mtg-card" sx={{ p: 2, maxWidth: 250 }}>
          <Typography variant="subtitle2" fontWeight="600" mb={1}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2">
                {entry.name}: {entry.value}
                {entry.name.includes('probability') || entry.name.includes('percentage') ? '%' : ''}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper className="mtg-card" sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="600">
            {data.color} Mana
          </Typography>
          <Typography variant="body2">
            Count: {data.count}
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box className="animate-fadeIn">
      <Grid container spacing={3}>
        {/* Turn-by-Turn Probability */}
        <Grid item xs={12} lg={6}>
          <Paper className="mtg-card" sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
              📈 Turn-by-Turn Casting Probability
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={prepareTurnData()}>
                <defs>
                  <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--mtg-blue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--mtg-blue)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="turn"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `T${value}`}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="var(--mtg-blue)"
                  strokeWidth={3}
                  fill="url(#probabilityGradient)"
                  dot={{ fill: 'var(--mtg-blue)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'var(--mtg-blue)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Color Distribution */}
        <Grid item xs={12} lg={6}>
          <Paper className="mtg-card" sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
              🎨 Color Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={prepareColorDistribution()}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="count"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {prepareColorDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color, fontWeight: 600 }}>
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Mana Curve */}
        <Grid item xs={12} lg={8}>
          <Paper className="mtg-card" sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
              📊 Mana Curve Analysis
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={prepareCurveData()}>
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--mtg-green)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--mtg-green)" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="cmc"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => value === 0 ? '0' : `${value}+`}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#curveGradient)"
                  radius={[4, 4, 0, 0]}
                  stroke="var(--mtg-green)"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Consistency Radar */}
        <Grid item xs={12} lg={4}>
          <Paper className="mtg-card" sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
              🎯 Deck Consistency
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <RadarChart data={prepareConsistencyData()}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="var(--mtg-blue)"
                  fill="var(--mtg-blue)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  dot={{ fill: 'var(--mtg-blue)', strokeWidth: 2, r: 4 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Mulligan Decision Chart */}
        <Grid item xs={12}>
          <Paper className="mtg-card" sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" fontWeight="600" mb={2} color="var(--mtg-blue-dark)">
              🔄 Mulligan Decision Analysis
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={prepareMulliganData()} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="scenario"
                  stroke="#64748b"
                  fontSize={12}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="keep"
                  stackId="decision"
                  fill="var(--mtg-green)"
                  name="Keep"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="mulligan"
                  stackId="decision"
                  fill="var(--mtg-red)"
                  name="Mulligan"
                  radius={[4, 0, 0, 4]}
                />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="mtg-card" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="var(--mtg-green)">
                  {analysis.overallScore || 75}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Score
                </Typography>
                <Chip
                  label="Good"
                  size="small"
                  className="mtg-chip good"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="mtg-card" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="var(--mtg-blue)">
                  {analysis.consistency || 68}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Consistency
                </Typography>
                <Chip
                  label="Average"
                  size="small"
                  className="mtg-chip average"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="mtg-card" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="var(--mtg-red)">
                  {analysis.colorScrew || 15}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Color Screw Risk
                </Typography>
                <Chip
                  label="Low"
                  size="small"
                  className="mtg-chip excellent"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="mtg-card" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="var(--mtg-gold)">
                  {analysis.avgCMC || 2.8}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average CMC
                </Typography>
                <Chip
                  label="Optimal"
                  size="small"
                  className="mtg-chip good"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedCharts;
