import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Box, Typography, Container, CircularProgress } from '@mui/material'
import { store, persistor } from './store'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { NotificationProvider } from './components/common/NotificationProvider'
import { BetaBanner } from './components'

// Direct imports for core pages (avoiding lazy loading issues)
import { HomePage } from './pages/HomePage'
import AnalyzerPage from './pages/AnalyzerPage'
import { GuidePage } from './pages/GuidePage'
import MyAnalysesPage from './pages/MyAnalysesPage'
import PrivacyFirstPage from './pages/PrivacyFirstPage'

// Loading component for Suspense fallback
const PageLoader = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '50vh',
      gap: 2
    }}>
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Loading ManaTuner Pro...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Optimizing your Magic experience
      </Typography>
    </Box>
  </Container>
)

// Lazy-loaded temporary components for other pages
const AboutPage = React.lazy(() => 
  import('./components/layout/StaticPages').then(m => ({ default: m.AboutPage }))
)

const PrivacyPage = React.lazy(() => 
  import('./components/layout/StaticPages').then(m => ({ default: m.PrivacyPage }))
)

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Provider store={store}>
          <PersistGate loading={<PageLoader />} persistor={persistor}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
              }}
            >
              <Header />
              <BetaBanner />
              
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
                  <Route path="/guide" element={<GuidePage />} />
                  <Route path="/mes-analyses" element={<MyAnalysesPage />} />
                  <Route path="/privacy-first" element={<PrivacyFirstPage />} />
                  <Route path="/about" element={
                    <Suspense fallback={<PageLoader />}>
                      <AboutPage />
                    </Suspense>
                  } />
                  <Route path="/privacy" element={
                    <Suspense fallback={<PageLoader />}>
                      <PrivacyPage />
                    </Suspense>
                  } />
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