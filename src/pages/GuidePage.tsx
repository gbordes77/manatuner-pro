import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  Calculate as CalculateIcon,
  AutoGraph as AutoGraphIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { AnimatedContainer } from '../components/common/AnimatedContainer';

export const GuidePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AnimatedContainer>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom>
            📚 User Guide
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
            Master ManaTuner Pro and optimize your MTG manabases
          </Typography>
          <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
            <Chip 
              icon={<ScienceIcon />} 
              label="Frank Karsten Research" 
              color="primary" 
              component="a"
              href="https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/"
              target="_blank"
              rel="noopener noreferrer"
              clickable
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 2
                },
                transition: 'all 0.2s ease-in-out'
              }}
            />
            <Chip icon={<CalculateIcon />} label="Hypergeometric Analysis" color="secondary" />
            <Chip icon={<TrendingUpIcon />} label="Competitive Ready" color="success" />
          </Box>
        </Box>

        {/* Quick Start Alert */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <strong>🚀 Quick Start:</strong> Paste your decklist in the Analyzer, 
          click "Analyze Manabase" and get your statistics instantly!
        </Alert>

        {/* Main Guide Sections */}
        <Grid container spacing={4}>
          
          {/* Section 1: Qu'est-ce que ManaTuner Pro */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  🎯 What is ManaTuner Pro?
                </Typography>
                <Typography variant="body1" paragraph>
                  ManaTuner Pro is an <strong>advanced manabase analyzer</strong> for Magic: The Gathering that uses{' '}
                  <strong>Frank Karsten's</strong> mathematical research and <strong>hypergeometric analysis</strong> 
                  to provide you with precise probabilities and optimal recommendations.
                </Typography>
                
                <Box sx={{ my: 3 }}>
                  <Typography variant="h6" gutterBottom>✨ Key Features:</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><AnalyticsIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Precise Probability Analysis" 
                        secondary="Hypergeometric calculations for each turn and mana cost"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AutoGraphIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Interactive Visualizations" 
                        secondary="Detailed charts to understand your mana curves"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PsychologyIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Smart Recommendations" 
                        secondary="Optimization suggestions based on your metagame"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SpeedIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Real-Time Analysis" 
                        secondary="Web Workers for instant Monte Carlo calculations"
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Section 2: Guide d'utilisation */}
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
              📖 Complete Usage Guide
            </Typography>

            {/* Étape 1 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6">1️⃣ Import Your Deck</Typography>
                  <Chip label="Easy" size="small" color="success" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  <strong>Supported formats:</strong> Copy-paste directly from:
                </Typography>
                <List dense>
                  <ListItem><ListItemText primary="• Moxfield, Archidekt, MTGGoldfish" /></ListItem>
                  <ListItem><ListItemText primary="• Arena format (copy/paste from MTGA)" /></ListItem>
                  <ListItem><ListItemText primary="• Manual lists (format: '4 Lightning Bolt')" /></ListItem>
                </List>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>💡 Tip:</strong> Use the "Example" button to see a pre-configured deck 
                  and understand the expected format.
                </Alert>
              </AccordionDetails>
            </Accordion>

            {/* Étape 2 */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6">2️⃣ Launch Analysis</Typography>
                  <Chip label="Automatic" size="small" color="primary" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  Click <strong>"Analyze Manabase"</strong> to get:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Automatic land detection" 
                      secondary="Identification of mana sources and special lands"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Mana cost analysis" 
                      secondary="Smart parsing of hybrid and colorless symbols"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Probability calculations" 
                      secondary="Chances of having the right mana each turn"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Étape 3 */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6">3️⃣ Interpret Results</Typography>
                  <Chip label="Essential" size="small" color="warning" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="h6" gutterBottom>📊 Spell Analysis Tab</Typography>
                  <Typography variant="body2" paragraph>
                    Shows for each spell the probability of having the necessary mana on critical turns.
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>📈 Mana Curve Tab</Typography>
                  <Typography variant="body2" paragraph>
                    Visualizes the distribution of your costs and the balance of your colors.
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>🎯 Recommendations Tab</Typography>
                  <Typography variant="body2" paragraph>
                    Concrete suggestions to optimize your manabase according to your archetype.
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>⚡ Performance Tab</Typography>
                  <Typography variant="body2" paragraph>
                    Advanced metrics: consistency, mulligan rate, performance curve.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Section 3: Comprendre les Métriques */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{ mt: 4, bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  🧮 Understanding Metrics
                </Typography>

                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      height: '100%',
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        <ScienceIcon sx={{ mr: 1 }} />
                        <a 
                          href="https://strategy.channelfireball.com/all-strategy/mtg/channelmagic-articles/how-many-lands-do-you-need-to-consistently-hit-your-land-drops/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: 'inherit', 
                            textDecoration: 'none',
                            borderBottom: '1px dotted currentColor'
                          }}
                        >
                          Frank Karsten Thresholds
                        </a>
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="≥ 90% = Excellent" 
                            secondary="Your spell will be very reliably playable"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="75-89% = Good" 
                            secondary="Acceptable for most decks"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="< 75% = Problematic" 
                            secondary="High risk of mulligan or mana screw"
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      height: '100%',
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="h6" gutterBottom color="secondary">
                        <CalculateIcon sx={{ mr: 1 }} />
                        Hypergeometric Analysis
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Calculates the exact probability of drawing the right resources 
                        from a finite population (your 60-card deck).
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mathematical method</strong> recognized and used by 
                        professional players for manabase optimization.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Section 4: Conseils Avancés */}
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
              🎓 Expert Tips
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">🏗️ Manabase Construction</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <ListItemIcon><LightbulbIcon color="warning" /></ListItemIcon>
                    <ListItemText 
                      primary="Prioritize your T1-T3 spells" 
                      secondary="Make sure you have ≥90% chance to play them on time"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LightbulbIcon color="warning" /></ListItemIcon>
                    <ListItemText 
                      primary="Balance colors and speed" 
                      secondary="More taplands = slower but more stable"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LightbulbIcon color="warning" /></ListItemIcon>
                    <ListItemText 
                      primary="Test different ratios" 
                      secondary="Use the Clear button to test multiple versions"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">🎯 Format Optimization</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" fontWeight="bold">Standard/Pioneer</Typography>
                    <Typography variant="body2">
                      • 24-26 lands<br/>
                      • Prioritize speed<br/>
                      • Minimize T1-T2 taplands
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" fontWeight="bold">Modern</Typography>
                    <Typography variant="body2">
                      • 20-24 lands<br/>
                      • Fetchlands + shocklands<br/>
                      • Optimize for T1-T3
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" fontWeight="bold">Commander</Typography>
                    <Typography variant="body2">
                      • 36-40 lands<br/>
                      • Prioritize stability<br/>
                      • More ramp acceptable
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Section 5: FAQ */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{ mt: 4, bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  ❓ Frequently Asked Questions
                </Typography>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">🤔 Why are my probabilities different from other tools?</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1">
                      ManaTuner Pro uses <strong>exact hypergeometric analysis</strong> rather than 
                      approximations. Our calculations are based on Frank Karsten's research, 
                      the reference in MTG mathematics, which gives more accurate results.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">🎮 How do you handle hybrid cards?</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1">
                      Hybrid costs like {'{W/U}'} are automatically detected and treated as 
                      payable by either color, thus optimizing probability calculations.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">⚡ What are Monte Carlo Web Workers?</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1">
                      For complex analyses, we use Monte Carlo simulations 
                      (thousands of simulated hands) that run in the background without blocking 
                      the interface, ensuring a smooth experience.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>

          {/* Footer d'appel à l'action */}
          <Grid item xs={12}>
            <Box textAlign="center" sx={{ 
              mt: 6, 
              p: 4, 
              bgcolor: 'background.paper', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h5" gutterBottom color="text.primary">
                🚀 Ready to Optimize?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Use the Analyzer to transform your manabases and dominate your matches!
              </Typography>
              <Box display="flex" gap={2} justifyContent="center">
                <Chip 
                  icon={<SchoolIcon />} 
                  label="Based on Frank Karsten" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<InfoIcon />} 
                  label="Open Source" 
                  color="secondary" 
                  variant="outlined" 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </AnimatedContainer>
    </Container>
  );
}; 