import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'
import * as Sentry from '@sentry/react'

interface Props {
  children: ReactNode
  /**
   * Optional label for Sentry grouping — e.g. "AnalyzerTab.Castability".
   * When multiple ErrorBoundaries wrap different parts of the tree,
   * this keeps the crash reports meaningful.
   */
  label?: string
  /**
   * Optional custom fallback renderer. Useful for tab-scoped boundaries
   * that should render a compact message instead of the 50vh hero fallback.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Always log to console for local dev
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Report to Sentry when configured (VITE_SENTRY_DSN set in Vercel env)
    try {
      Sentry.withScope((scope) => {
        scope.setTag('errorBoundary', this.props.label ?? 'root')
        scope.setExtra('componentStack', errorInfo.componentStack)
        Sentry.captureException(error)
      })
    } catch {
      // Sentry not initialized — ignore
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          p={3}
        >
          <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Button variant="outlined" onClick={this.handleReset} size="small">
              Try again
            </Button>
          </Alert>
        </Box>
      )
    }

    return this.props.children
  }
}
