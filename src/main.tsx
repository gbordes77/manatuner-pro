import * as Sentry from '@sentry/react'
import { Box, CircularProgress } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App'
import { persistor, store } from './store'

// Initialize Sentry error tracking (production only)
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
  })
}
import './styles/contrast-fixes.css'
import './styles/index.css'
import './styles/ux-improvements.css'

// PWA Cleanup: Unregister all old Service Workers and clear caches
// This fixes the issue where old cached versions persist after deployment
if ('serviceWorker' in navigator) {
  // Unregister all Service Workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then((success) => {
        if (success) {
          console.log('[SW] Unregistered old Service Worker')
        }
      })
    })
  })

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).then(() => {
          console.log(`[Cache] Deleted cache: ${cacheName}`)
        })
      })
    })
  }
}

// Configure React Query client with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Scryfall API cache for 10 minutes (réduit de 30 min)
      staleTime: 10 * 60 * 1000,
      // Keep in cache for 15 minutes (réduit de 30 min)
      gcTime: 15 * 60 * 1000,
      // Retry failed requests
      retry: 1, // Réduit de 2 à 1
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,
      // Background refetch
      refetchOnMount: false,
      // Réduire les refetch automatiques
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once
      retry: 0, // Réduit de 1 à 0
    },
  },
})

// Loading component for PersistGate
const PersistLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}
  >
    <CircularProgress size={48} sx={{ color: 'white' }} />
  </Box>
)

// Error boundary for production
const ErrorFallback = ({ error: _error }: { error: Error }) => (
  <div
    style={{
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <h1>🎯 ManaTuner Pro</h1>
    <p>Something went wrong loading the application.</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '10px 20px',
        background: 'white',
        color: '#667eea',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
      }}
    >
      Reload Page
    </button>
  </div>
)

const isDevelopment = import.meta.env.DEV

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={<PersistLoader />} persistor={persistor}>
            <BrowserRouter>
              <App />
              {/* React Query DevTools - only in development */}
              {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </React.StrictMode>
  )
} catch (error) {
  console.error('Failed to render app:', error)
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorFallback error={error as Error} />
  )
}
