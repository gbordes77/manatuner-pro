import { Box, Button, Container, Typography } from '@mui/material'
import React, { Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { BetaBanner } from './components'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { NotificationProvider } from './components/common/NotificationProvider'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { AccelerationProvider } from './contexts/AccelerationContext'

// Only HomePage is loaded immediately (landing page)
import { HomePage } from './pages/HomePage'

// MTG-themed loading messages
const MTG_LOADING_MESSAGES = [
  { main: 'Tapping mana sources...', sub: 'Calculating probabilities' },
  { main: 'Shuffling up...', sub: 'Preparing your analysis' },
  { main: 'Reading the stack...', sub: 'Processing deck data' },
  { main: 'Resolving triggers...', sub: 'Loading components' },
  { main: 'Drawing seven...', sub: 'Initializing analyzer' },
]

// Loading component for Suspense fallback with MTG flavor
const PageLoader = () => {
  const [messageIndex] = React.useState(() =>
    Math.floor(Math.random() * MTG_LOADING_MESSAGES.length)
  )
  const message = MTG_LOADING_MESSAGES[messageIndex]

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        {/* WUBRG mana symbols as loading indicator */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          {['w', 'u', 'b', 'r', 'g'].map((color, index) => (
            <Box
              key={color}
              sx={{
                animation: `mana-pulse 1.5s ease-in-out infinite`,
                animationDelay: `${index * 0.15}s`,
              }}
            >
              <i
                className={`ms ms-${color} ms-cost`}
                aria-hidden="true"
                style={{
                  fontSize: 28,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
              />
            </Box>
          ))}
        </Box>
        <Typography variant="h6" color="text.secondary" fontFamily='"Cinzel", serif'>
          {message.main}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message.sub}
        </Typography>
      </Box>
    </Container>
  )
}

// Lazy-loaded pages - loaded only when navigating to them
const AnalyzerPage = React.lazy(() => import('./pages/AnalyzerPage'))
const GuidePage = React.lazy(() =>
  import('./pages/GuidePage').then((m) => ({ default: m.GuidePage }))
)
const MathematicsPage = React.lazy(() => import('./pages/MathematicsPage'))
const MyAnalysesPage = React.lazy(() => import('./pages/MyAnalysesPage'))
// PrivacyFirstPage removed - privacy info is now on HomePage
const LandGlossaryPage = React.lazy(() => import('./pages/LandGlossaryPage'))
const ReferenceArticlesPage = React.lazy(() =>
  import('./pages/ReferenceArticlesPage').then((m) => ({ default: m.ReferenceArticlesPage }))
)
const ArticleDetailPage = React.lazy(() =>
  import('./pages/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage }))
)
const AuthorPage = React.lazy(() =>
  import('./pages/AuthorPage').then((m) => ({ default: m.AuthorPage }))
)

const AboutPage = React.lazy(() =>
  import('./components/layout/StaticPages').then((m) => ({
    default: m.AboutPage,
  }))
)

const PrivacyPage = React.lazy(() =>
  import('./components/layout/StaticPages').then((m) => ({
    default: m.PrivacyPage,
  }))
)

const NotFoundPage = () => (
  <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
    <Typography variant="h2" fontWeight="bold" color="text.secondary" gutterBottom>
      404
    </Typography>
    <Typography variant="h5" gutterBottom>
      Page not found
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
      This page doesn't exist. Maybe your spell fizzled?
    </Typography>
    <Button variant="contained" component={Link} to="/">
      Back to Home
    </Button>
  </Container>
)

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <NotificationProvider>
          <AccelerationProvider>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
              }}
            >
              {/* Skip navigation for keyboard/screen reader users */}
              <Box
                component="a"
                href="#main-content"
                sx={{
                  position: 'absolute',
                  left: '-9999px',
                  top: 'auto',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                  '&:focus': {
                    position: 'fixed',
                    top: 8,
                    left: 8,
                    width: 'auto',
                    height: 'auto',
                    overflow: 'visible',
                    zIndex: 9999,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: 3,
                  },
                }}
              >
                Skip to main content
              </Box>

              <BetaBanner />
              <Header />

              <Box
                component="main"
                id="main-content"
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/analyzer" element={<AnalyzerPage />} />
                    <Route path="/guide" element={<GuidePage />} />
                    <Route path="/mathematics" element={<MathematicsPage />} />
                    <Route path="/my-analyses" element={<MyAnalysesPage />} />
                    <Route path="/mes-analyses" element={<Navigate to="/my-analyses" replace />} />
                    <Route path="/land-glossary" element={<LandGlossaryPage />} />
                    <Route
                      path="/library"
                      element={
                        <ErrorBoundary label="Library.Index">
                          <ReferenceArticlesPage />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/library/author/:slug"
                      element={
                        <ErrorBoundary label="Library.Author">
                          <AuthorPage />
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/library/:slug"
                      element={
                        <ErrorBoundary label="Library.Article">
                          <ArticleDetailPage />
                        </ErrorBoundary>
                      }
                    />
                    <Route path="/reading-list" element={<Navigate to="/library" replace />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Box>

              <Footer />
            </Box>
          </AccelerationProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App
