import React from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions
} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Widgets as WidgetsIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <AnalyticsIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Advanced Analytics',
      description: 'Precise manabase calculations using Frank Karsten\'s research and hypergeometric distribution.'
    },
    {
      icon: <SpeedIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Instant results with cached Scryfall data and optimized algorithms.'
    },
    {
      icon: <SecurityIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'Your deck data stays private. No tracking, no ads, just pure manabase analysis.'
    },
    {
      icon: <WidgetsIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'All Formats',
      description: 'Support for Standard, Modern, Legacy, Commander, and more MTG formats.'
    }
  ]

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Perfect Your Manabase
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
          Professional MTG manabase analysis tool. Get precise probabilities and optimal land counts 
          for competitive play.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/analyzer')}
            startIcon={<AnalyticsIcon />}
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 3,
              boxShadow: 4,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            🚀 Start Analyzing
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/about')}
            sx={{ 
              px: 4, 
              py: 2,
              fontSize: '1rem',
              borderRadius: 3,
              borderWidth: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderWidth: 2,
                borderColor: 'primary.dark',
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: 2
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            📚 Learn More
          </Button>
        </Box>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ py: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      <Paper 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          mt: 6,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white'
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Optimize Your Deck?
        </Typography>
        <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
          Join thousands of players using scientific manabase analysis
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/analyzer')}
          startIcon={<AnalyticsIcon />}
          sx={{ 
            mt: 2, 
            px: 5,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            bgcolor: 'rgba(255,255,255,0.2)', 
            borderRadius: 3,
            '&:hover': { 
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'translateY(-2px)',
              boxShadow: 6
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          🎯 Try It Now - It's Free
        </Button>
      </Paper>
    </Container>
  )
} 