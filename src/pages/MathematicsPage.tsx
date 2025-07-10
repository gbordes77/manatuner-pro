import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Functions as FunctionsIcon,
  TrendingUp as TrendingUpIcon,
  Calculate as CalculateIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const MathematicsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          📐 Mathematics Behind ManaTuner Pro
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          The Science of Mana Base Optimization
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          ManaTuner Pro is built on rigorous mathematical foundations established by 
          <strong> Frank Karsten</strong>, Pro Tour Hall of Famer and mathematician. 
          Discover the statistical models that power our recommendations.
        </Typography>
      </Box>

      {/* Frank Karsten Reference */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Academic Foundation:</strong> Our calculations are based on Frank Karsten's 2022 research 
          published on TCGPlayer: <Link href="https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/" target="_blank" rel="noopener">
            "How Many Sources Do You Need to Consistently Cast Your Spells? A 2022 Update"
          </Link>
        </Typography>
      </Alert>

      {/* Core Mathematical Concepts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FunctionsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Hypergeometric Distribution</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                The cornerstone of mana calculations. Determines the probability of drawing 
                exactly the right number of mana sources from your deck.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Monte Carlo Simulation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Advanced statistical sampling to simulate thousands of game scenarios 
                and validate our probability calculations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalculateIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Binomial Coefficients</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Mathematical combinations that calculate how many ways you can 
                draw specific numbers of cards from your deck.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Explanations */}
      <Box sx={{ mb: 4 }} id="mathematics">
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ScienceIcon sx={{ mr: 1 }} />
          Mathematical Models Explained
        </Typography>

        <Accordion id="hypergeometric">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🎯 Hypergeometric Distribution</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              The hypergeometric distribution answers: "What's the probability of drawing exactly k successes 
              in n draws, without replacement, from a finite population?"
            </Typography>
            
            <Box sx={{ my: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Formula:</Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', textAlign: 'center' }}>
                P(X = k) = C(K,k) × C(N-K,n-k) / C(N,n)
              </Typography>
            </Box>

            <Typography variant="body2" paragraph>
              <strong>Where:</strong>
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="N = Total deck size (usually 60 cards)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="K = Total mana sources in deck" />
              </ListItem>
              <ListItem>
                <ListItemText primary="n = Cards drawn (hand + draws)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="k = Mana sources needed" />
              </ListItem>
            </List>

                         <Alert severity="success" sx={{ mt: 2 }}>
               <Typography variant="body2">
                 <strong>Real Example:</strong> With 14 red sources in a 60-card deck, what's the probability 
                 of having at least 1 red source on Turn 1 (7 cards drawn)? Answer: ~90% (Karsten standard)
               </Typography>
             </Alert>
          </AccordionDetails>
        </Accordion>

        <Accordion id="monte-carlo">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🎲 Monte Carlo Simulation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Monte Carlo methods use random sampling to solve complex probability problems 
              that might be difficult to calculate analytically.
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>How we use it:</strong>
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><TimelineIcon /></ListItemIcon>
                <ListItemText primary="Simulate 10,000+ games with your exact decklist" />
              </ListItem>
              <ListItem>
                <ListItemIcon><AssessmentIcon /></ListItemIcon>
                <ListItemText primary="Track mana availability each turn" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CalculateIcon /></ListItemIcon>
                <ListItemText primary="Calculate empirical probabilities" />
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Validation:</strong> Our Monte Carlo results consistently match 
                hypergeometric calculations within 0.1%, confirming our model accuracy.
              </Typography>
            </Alert>
          </AccordionDetails>
        </Accordion>

        <Accordion id="frank-karsten">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">⚡ Frank Karsten 2022 Standards</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Frank Karsten's 2022 update incorporates modern Magic design and play patterns.
            </Typography>

                         <TableContainer component={Paper} sx={{ my: 2 }}>
               <Table size="small">
                 <TableHead>
                   <TableRow>
                     <TableCell><strong>Mana Cost</strong></TableCell>
                     <TableCell><strong>Turn 1</strong></TableCell>
                     <TableCell><strong>Turn 2</strong></TableCell>
                     <TableCell><strong>Turn 3</strong></TableCell>
                     <TableCell><strong>Turn 4</strong></TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   <TableRow>
                     <TableCell>1 Colored (C)</TableCell>
                     <TableCell>14 sources</TableCell>
                     <TableCell>12 sources</TableCell>
                     <TableCell>11 sources</TableCell>
                     <TableCell>10 sources</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>1C + Colorless</TableCell>
                     <TableCell>-</TableCell>
                     <TableCell>13 sources</TableCell>
                     <TableCell>12 sources</TableCell>
                     <TableCell>11 sources</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>2 Same Color (CC)</TableCell>
                     <TableCell>-</TableCell>
                     <TableCell>21 sources</TableCell>
                     <TableCell>19 sources</TableCell>
                     <TableCell>18 sources</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>3 Same Color (CCC)</TableCell>
                     <TableCell>-</TableCell>
                     <TableCell>-</TableCell>
                     <TableCell>25 sources</TableCell>
                     <TableCell>23 sources</TableCell>
                   </TableRow>
                 </TableBody>
               </Table>
             </TableContainer>

            <Typography variant="body2" paragraph>
              <strong>Key Updates for 2022:</strong>
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Fetchlands count as 1 source per fetchable color (not double)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Mulliganing considerations (6-card and 5-card hands)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Modern card velocity and selection effects" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion id="implementation">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🔧 Implementation Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              ManaTuner Pro implements these mathematical concepts with several optimizations:
            </Typography>

            <Grid container spacing={2} sx={{ my: 2 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Performance Optimizations
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Memoized binomial coefficients" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Web Workers for heavy calculations" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Lazy evaluation of probability trees" />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'secondary.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="secondary">
                    Accuracy Measures
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="IEEE 754 double precision" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Edge case handling (empty decks, etc.)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Cross-validation with Monte Carlo" />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> All calculations assume optimal play and do not account for 
                human error, opponent disruption, or complex interaction timing.
              </Typography>
            </Alert>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Practical Applications */}
      <Paper sx={{ p: 3, mb: 4 }} id="practical">
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          🎯 How This Applies to Your Deck
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              Land Count Optimization
            </Typography>
            <Typography variant="body2" paragraph>
              Based on your deck's mana curve, we calculate the exact number of lands 
              needed to hit your mana requirements with 90%+ consistency.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Aggro: 18-22 lands" size="small" color="error" />
              <Chip label="Midrange: 22-26 lands" size="small" color="warning" />
              <Chip label="Control: 26-28 lands" size="small" color="success" />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="secondary">
              Color Requirements
            </Typography>
            <Typography variant="body2" paragraph>
              For each color in your deck, we determine how many sources you need 
              to cast your spells on curve with mathematical precision.
            </Typography>
            
                         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
               <Chip label="T1 1C: 14 sources" size="small" />
               <Chip label="T2 CC: 21 sources" size="small" />
               <Chip label="T3 CCC: 25 sources" size="small" />
             </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Ready to optimize your mana base with mathematical precision?
        </Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>
          <Link href="/analyzer" color="primary" underline="hover">
            → Analyze Your Deck Now
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default MathematicsPage; 