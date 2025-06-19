import React from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

const PrivacyFirstPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()

  const features = [
    {
      icon: '🏠',
      title: 'Local Storage',
      description: 'Your decks stay on your device, encrypted with AES-256'
    },
    {
      icon: '🔐',
      title: 'Zero-Knowledge',
      description: 'Even we cannot see your private data'
    },
    {
      icon: '🌍',
      title: 'Open Source',
      description: '100% verifiable code on GitHub'
    },
    {
      icon: '🚫',
      title: 'No Tracking',
      description: 'No Google Analytics, no spy cookies'
    }
  ]

  const comparisonData = [
    {
      feature: 'Your decks visible by the site',
      manatuner: { text: '❌ No', color: 'error' },
      others: { text: '✅ Yes', color: 'success' }
    },
    {
      feature: 'Client-side encryption',
      manatuner: { text: '✅ Yes', color: 'success' },
      others: { text: '❌ No', color: 'error' }
    },
    {
      feature: 'Advertising tracking',
      manatuner: { text: '❌ None', color: 'error' },
      others: { text: '✅ Google Analytics', color: 'success' }
    },
    {
      feature: 'Open Source',
      manatuner: { text: '✅ 100%', color: 'success' },
      others: { text: '❌ Proprietary', color: 'error' }
    },
    {
      feature: 'GDPR Compliant',
      manatuner: { text: '✅ By design', color: 'success' },
      others: { text: '⚠️ Variable', color: 'warning' }
    },
    {
      feature: 'Required account',
      manatuner: { text: '❌ No', color: 'error' },
      others: { text: '✅ Often', color: 'success' }
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
          color: 'white',
          textAlign: 'center',
          py: 8,
          px: 4,
          mb: 5,
          borderRadius: 4
        }}
      >
        <Typography
          variant={isMobile ? 'h3' : 'h2'}
          component="h1"
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #00d4ff, #0099ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          🔒 ManatunerPro
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ opacity: 0.9 }}>
          The ONLY manabase analyzer that truly respects your privacy
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          ✨ Your decks stay AT HOME ✨
        </Typography>
      </Card>

      {/* Privacy Promise */}
      <Card sx={{ mb: 4, bgcolor: '#0f3460', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#00d4ff', display: 'flex', alignItems: 'center', gap: 1 }}>
            🛡️ Our Privacy-First Promise
          </Typography>
          <Typography variant="h6" align="center" sx={{ my: 3, fontWeight: 'bold' }}>
            "We CANNOT see your decks, even if we wanted to"
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            Unlike other sites, your decklists are NEVER sent to our servers in private mode. 
            Everything stays encrypted on your device. This is a "Zero-Knowledge" architecture: we know you 
            analyzed a deck, but not WHICH deck.
          </Typography>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                bgcolor: '#16213e',
                color: 'white',
                textAlign: 'center',
                p: 3,
                height: '100%',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h2" sx={{ mb: 2 }}>
                {feature.icon}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2">
                {feature.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How it works */}
      <Card sx={{ mb: 4, bgcolor: '#0f3460', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#00d4ff' }}>
            🎫 How does it work?
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              1. You receive a unique personal code
            </Typography>
            <Box
              sx={{
                bgcolor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: 1,
                p: 2,
                fontFamily: 'monospace',
                fontSize: '1.1rem'
              }}
            >
              Your code: STORM-MAGE-42
            </Box>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Easy to remember, like a player username!
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              2. Your analyses are linked to this code
            </Typography>
            <Typography variant="body1">
              Retrieve all your analyses by entering your code, from any device.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              3. Secure sharing
            </Typography>
            <Typography variant="body1">
              Share your results without revealing your complete decklist. You control what others see.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card sx={{ mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#16213e' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Feature</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ManatunerPro</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Other Sites</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.feature}</TableCell>
                  <TableCell sx={{ color: `${row.manatuner.color}.main` }}>
                    {row.manatuner.text}
                  </TableCell>
                  <TableCell sx={{ color: `${row.others.color}.main` }}>
                    {row.others.text}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* What we store / don't store */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#16213e', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#4CAF50' }}>
                ✅ What we store
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Mathematical analysis results" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Anonymous hash of your code" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Analysis date" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="That's ALL!" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#16213e', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#f44336' }}>
                ❌ What we DON'T store
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Your complete decklist" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Your IP address" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Your personal data" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Your browsing habits" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CTA */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          py: 6,
          px: 4,
          mb: 4
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to analyze your decks with complete privacy?
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/analyzer')}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            py: 2,
            px: 4,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            mt: 2,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'scale(1.05)'
            }
          }}
        >
          Try ManatunerPro 🚀
        </Button>
        <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
          No registration • No tracking • 100% private
        </Typography>
      </Card>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', opacity: 0.6, mt: 8 }}>
        <Typography variant="body2" gutterBottom>
          An open source project created with ❤️ for the MTG community
        </Typography>
        <Typography variant="body2">
          <a 
            href="https://github.com/gbordes77/manatuner-pro" 
            style={{ color: '#00d4ff', textDecoration: 'none' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            View code on GitHub
          </a>
        </Typography>
      </Box>
    </Container>
  )
}

export default PrivacyFirstPage 