import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CircularProgress, Box } from '@mui/material'
import { store, persistor } from './store'
import App from './App'
import './styles/index.css'
import './styles/ux-improvements.css'

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
      refetchOnReconnect: false
    },
    mutations: {
      // Retry mutations once
      retry: 0 // Réduit de 1 à 0
    }
  }
})

// Loading component for PersistGate
const PersistLoader = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    <CircularProgress size={48} sx={{ color: 'white' }} />
  </Box>
)

// Error boundary for production
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ 
    padding: '20px', 
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
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
        marginTop: '10px'
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
              {isDevelopment && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
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