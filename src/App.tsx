import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Box, Typography, Container, CircularProgress } from '@mui/material'
import { store, persistor } from './store'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { NotificationProvider } from './components/common/NotificationProvider'
import { HomePage } from './pages/HomePage'
import { AnalyzerPage } from './pages/AnalyzerPage'

// Composants temporaires pour les autres pages

const AboutPage = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <Typography 
        variant="h2" 
        component="h1"
        sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}
      >
        About ManaTuner Pro
      </Typography>
      <Typography 
        variant="h5" 
        color="text.secondary" 
        sx={{ fontWeight: 300, maxWidth: '800px', mx: 'auto' }}
      >
        Professional manabase analysis for competitive Magic: The Gathering
      </Typography>
    </Box>

    <Box sx={{ 
      background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(66, 165, 245, 0.05))',
      borderRadius: 3,
      p: 4,
      mb: 4,
      border: '1px solid rgba(25, 118, 210, 0.1)'
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600, 
          mb: 2,
          color: 'primary.main'
        }}
      >
        🎯 Our Mission
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          fontSize: '1.1rem',
          lineHeight: 1.7,
          color: 'text.primary'
        }}
      >
        ManaTuner Pro is a comprehensive manabase analysis tool for Magic: The Gathering, 
        meticulously crafted to provide tournament-level insights for competitive players and deck builders.
      </Typography>
    </Box>

    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
      gap: 4, 
      mb: 4 
    }}>
      <Box sx={{ 
        p: 3, 
        borderRadius: 2, 
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
        border: '1px solid rgba(76, 175, 80, 0.2)'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          📊 Built on Research
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          Our analysis algorithms are based on <strong>Frank Karsten's</strong> groundbreaking 
          mathematical research on mana probability and deck construction theory.
        </Typography>
      </Box>

      <Box sx={{ 
        p: 3, 
        borderRadius: 2, 
        backgroundColor: 'rgba(156, 39, 176, 0.05)',
        border: '1px solid rgba(156, 39, 176, 0.2)'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          🚀 Continuing Innovation
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          Built as a modern continuation of <strong>Charles Wickham's</strong> original 
          <em>"Project Manabase"</em>, extending and modernizing his comprehensive analysis framework.
        </Typography>
      </Box>
    </Box>

    <Box sx={{ 
      textAlign: 'center',
      p: 4,
      borderRadius: 3,
      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(255, 193, 7, 0.05))',
      border: '1px solid rgba(255, 152, 0, 0.2)'
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600, 
          mb: 2,
          color: 'warning.main'
        }}
      >
        ⚡ What Makes Us Different
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          fontSize: '1rem',
          lineHeight: 1.6,
          maxWidth: '700px',
          mx: 'auto'
        }}
      >
        We combine proven mathematical foundations with modern web technology to deliver 
        real-time manabase optimization, interactive visualizations, and actionable recommendations 
        that help you build better, more consistent decks.
      </Typography>
    </Box>
  </Container>
)

const PrivacyPage = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h3" gutterBottom>
      Privacy Policy
    </Typography>
    <Typography variant="body1">
      We respect your privacy. No personal data is collected.
    </Typography>
  </Container>
)

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Provider store={store}>
          <PersistGate loading={<CircularProgress />} persistor={persistor}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
              }}
            >
              <Header />
              
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/analyzer" element={<AnalyzerPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Box>
              
              <Footer />
            </Box>
          </PersistGate>
        </Provider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App 