import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { store } from './store'
import App from './App.tsx'
import './styles/index.css'

// Initialize Sentry for error monitoring and performance tracking
Sentry.init({
  dsn: (import.meta as any).env?.VITE_SENTRY_DSN || '',
  environment: (import.meta as any).env?.MODE || 'development',
  // Performance monitoring
  tracesSampleRate: 1.0,
  // Release tracking
  release: 'manatuner-pro@1.0.0',
  beforeSend(event) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0]?.value
      if (error?.includes('ResizeObserver loop limit exceeded')) {
        return null
      }
      if (error?.includes('Non-Error promise rejection captured')) {
        return null
      }
    }
    return event
  }
})

// Configure React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Scryfall API cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests
      retry: 2,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,
      // Background refetch
      refetchOnMount: false
    },
    mutations: {
      // Retry mutations once
      retry: 1
    }
  }
})

// Firebase sera initialisé plus tard

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          {/* React Query DevTools - only in development */}
          {(import.meta as any).env?.MODE === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
) 