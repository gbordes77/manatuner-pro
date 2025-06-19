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
  Badge,
  Chip
} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Widgets as WidgetsIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { AnimatedContainer, AnimatedList } from '../components/common/AnimatedContainer'

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
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Badge
            badgeContent="v2.0"
            color="primary"
            sx={{ 
              '& .MuiBadge-badge': { 
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }
            }}
          >
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Perfect Your Manabase
            </Typography>
          </Badge>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
            <Chip icon={<StarIcon />} label="Frank Karsten Research" color="primary" />
            <Chip icon={<TrendingUpIcon />} label="Hypergeometric Analysis" color="secondary" />
            <Chip label="Free & Open Source" variant="outlined" />
          </Box>

          <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
            Professional MTG manabase analysis tool. Get precise probabilities and optimal land counts 
            for competitive play.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <AnimatedContainer animation="slideInLeft" delay={0.2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/guide')}
                startIcon={<MenuBookIcon />}
                sx={{ 
                  px: 5, 
                  py: 2, 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  boxShadow: 3,
                  background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                  '&:hover': {
                    boxShadow: 5,
                    transform: 'translateY(-2px)',
                    background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                📖 Read Guide First
              </Button>
            </AnimatedContainer>

            <AnimatedContainer animation="scaleIn" delay={0.4}>
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
            </AnimatedContainer>
            
            <AnimatedContainer animation="slideInLeft" delay={0.6}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/about')}
                color="secondary"
                sx={{ 
                  px: 5, 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  boxShadow: 3,
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
                  '&:hover': {
                    boxShadow: 5,
                    transform: 'translateY(-2px)',
                    background: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                📚 Learn More
              </Button>
            </AnimatedContainer>
          </Box>
        </Box>
      </AnimatedContainer>

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