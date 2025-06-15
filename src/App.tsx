import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, Typography, Container } from '@mui/material'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { NotificationProvider } from './components/common/NotificationProvider'
import { HomePage } from './pages/HomePage'
import { AnalyzerPage } from './pages/AnalyzerPage'

// Composants temporaires pour les autres pages

const AboutPage = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h3" gutterBottom>
      About ManaTuner Pro
    </Typography>
    <Typography variant="body1">
      ManaTuner Pro is a manabase analysis tool for Magic: The Gathering, 
      based on Frank Karsten's research and inspired by Charles Wickham's work.
    </Typography>
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
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App 