import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { NotificationProvider } from '@/components/common/NotificationProvider'

// Lazy load components for better performance
const Home = React.lazy(() => import('@/pages/Home'))
const Analyzer = React.lazy(() => import('@/pages/Analyzer'))
const About = React.lazy(() => import('@/pages/About'))
const Privacy = React.lazy(() => import('@/pages/Privacy'))

const LoadingSpinner = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="50vh"
  >
    <CircularProgress />
  </Box>
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
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analyzer" element={<Analyzer />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </Box>
          
          <Footer />
        </Box>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App 