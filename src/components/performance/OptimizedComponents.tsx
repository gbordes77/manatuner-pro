import React, { memo, useMemo, useCallback, useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Skeleton,
  useTheme,
  Alert
} from '@mui/material'
import { FixedSizeList as List } from 'react-window'
import type { TurnAnalysis, MonteCarloResult } from '../../types/maths'

// Optimized turn analysis row component
interface TurnAnalysisRowProps {
  index: number
  style: React.CSSProperties
  data: {
    analyses: TurnAnalysis[]
    onRowClick?: (analysis: TurnAnalysis) => void
  }
}

const TurnAnalysisRow = memo<TurnAnalysisRowProps>(({ index, style, data }) => {
  const theme = useTheme()
  const analysis = data.analyses[index]
  
  const probabilityColor = useMemo(() => {
    const prob = analysis.castProbability * 100
    if (prob >= 95) return theme.palette.success.main
    if (prob >= 90) return theme.palette.info.main
    if (prob >= 80) return theme.palette.warning.main
    return theme.palette.error.main
  }, [analysis.castProbability, theme])

  const handleClick = useCallback(() => {
    data.onRowClick?.(analysis)
  }, [data.onRowClick, analysis])

  return (
    <div style={style}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={1}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          cursor: data.onRowClick ? 'pointer' : 'default',
          '&:hover': data.onRowClick ? {
            backgroundColor: theme.palette.action.hover
          } : {}
        }}
        onClick={handleClick}
      >
        <Typography variant="body2" fontWeight="bold">
          Turn {analysis.turn}
        </Typography>
        <Typography variant="body2">
          {analysis.cardsDrawn} cards
        </Typography>
        <Typography 
          variant="body2" 
          fontWeight="bold"
          color={probabilityColor}
        >
          {(analysis.castProbability * 100).toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {analysis.karstenRating.rating}
        </Typography>
      </Box>
    </div>
  )
})

TurnAnalysisRow.displayName = 'TurnAnalysisRow'

// Virtualized turn analysis list for large datasets
interface VirtualizedTurnAnalysisProps {
  analyses: TurnAnalysis[]
  height?: number
  onRowClick?: (analysis: TurnAnalysis) => void
}

export const VirtualizedTurnAnalysis = memo<VirtualizedTurnAnalysisProps>(({
  analyses,
  height = 400,
  onRowClick
}) => {
  const itemData = useMemo(() => ({
    analyses,
    onRowClick
  }), [analyses, onRowClick])

  if (analyses.length === 0) {
    return (
      <Alert severity="info">
        No analysis data available
      </Alert>
    )
  }

  return (
    <Box height={height} width="100%">
      <List
        height={height}
        width="100%"
        itemCount={analyses.length}
        itemSize={60}
        itemData={itemData}
      >
        {TurnAnalysisRow}
      </List>
    </Box>
  )
})

VirtualizedTurnAnalysis.displayName = 'VirtualizedTurnAnalysis'

// Lazy-loaded chart component
interface LazyChartProps {
  data: any[]
  type: 'line' | 'bar' | 'pie'
  loading?: boolean
}

const LazyChart = memo<LazyChartProps>(({ data, type, loading = false }) => {
  const [ChartComponent, setChartComponent] = useState<React.ComponentType<any> | null>(null)
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadChart = async () => {
      try {
        const { LineChart, BarChart, PieChart } = await import('recharts')
        
        if (!mounted) return

        const Component = type === 'line' ? LineChart :
                         type === 'bar' ? BarChart :
                         PieChart

        setChartComponent(() => Component)
      } catch (error) {
        console.error('Failed to load chart component:', error)
      } finally {
        if (mounted) {
          setChartLoading(false)
        }
      }
    }

    loadChart()

    return () => {
      mounted = false
    }
  }, [type])

  if (loading || chartLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    )
  }

  if (!ChartComponent) {
    return (
      <Alert severity="error">
        Failed to load chart component
      </Alert>
    )
  }

  return <ChartComponent data={data} />
})

LazyChart.displayName = 'LazyChart'

// Memoized probability calculator
interface ProbabilityDisplayProps {
  probability: number
  label?: string
  precision?: number
}

export const ProbabilityDisplay = memo<ProbabilityDisplayProps>(({
  probability,
  label = 'Probability',
  precision = 1
}) => {
  const theme = useTheme()
  
  const { color, rating } = useMemo(() => {
    const percent = probability * 100
    if (percent >= 95) return { color: theme.palette.success.main, rating: 'Excellent' }
    if (percent >= 90) return { color: theme.palette.info.main, rating: 'Good' }
    if (percent >= 80) return { color: theme.palette.warning.main, rating: 'Acceptable' }
    return { color: theme.palette.error.main, rating: 'Poor' }
  }, [probability, theme])

  return (
    <Box textAlign="center">
      <Typography variant="h4" color={color} fontWeight="bold">
        {(probability * 100).toFixed(precision)}%
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" color={color}>
        {rating}
      </Typography>
    </Box>
  )
})

ProbabilityDisplay.displayName = 'ProbabilityDisplay'

// Skeleton loader for analysis results
export const AnalysisSkeleton = memo(() => (
  <Box>
    <Skeleton variant="text" width="60%" height={32} />
    <Box mt={2}>
      <Skeleton variant="rectangular" width="100%" height={200} />
    </Box>
    <Box mt={2} display="flex" gap={2}>
      <Skeleton variant="rectangular" width="25%" height={100} />
      <Skeleton variant="rectangular" width="25%" height={100} />
      <Skeleton variant="rectangular" width="25%" height={100} />
      <Skeleton variant="rectangular" width="25%" height={100} />
    </Box>
    <Box mt={2}>
      <Skeleton variant="rectangular" width="100%" height={300} />
    </Box>
  </Box>
))

AnalysisSkeleton.displayName = 'AnalysisSkeleton'

// Optimized Monte Carlo results display
interface OptimizedMonteCarloProps {
  result: MonteCarloResult
  maxDataPoints?: number
}

export const OptimizedMonteCarloResults = memo<OptimizedMonteCarloProps>(({
  result,
  maxDataPoints = 1000
}) => {
  // Sample data if too large for performance
  const chartData = useMemo(() => {
    if (result.distribution.length <= maxDataPoints) {
      return result.distribution.map((count, turn) => ({
        turn: turn === 0 ? 'Failed' : `Turn ${turn}`,
        count,
        percentage: ((count / result.iterations) * 100).toFixed(1)
      })).filter(item => item.count > 0)
    }

    // Sample data for performance
    const step = Math.ceil(result.distribution.length / maxDataPoints)
    return result.distribution
      .filter((_, index) => index % step === 0)
      .map((count, turn) => ({
        turn: turn === 0 ? 'Failed' : `Turn ${turn * step}`,
        count,
        percentage: ((count / result.iterations) * 100).toFixed(1)
      }))
      .filter(item => item.count > 0)
  }, [result.distribution, result.iterations, maxDataPoints])

  return (
    <Box>
      <Box display="flex" gap={3} mb={3}>
        <ProbabilityDisplay
          probability={result.successRate / 100}
          label="Success Rate"
        />
        <Box textAlign="center">
          <Typography variant="h4" color="primary.main">
            {result.averageTurn.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average Turn
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h4" color="secondary.main">
            {result.iterations.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Iterations
          </Typography>
        </Box>
      </Box>

      <LazyChart
        data={chartData}
        type="bar"
      />
    </Box>
  )
})

OptimizedMonteCarloResults.displayName = 'OptimizedMonteCarloResults'

// Performance monitor component
interface PerformanceMonitorProps {
  children: React.ReactNode
  threshold?: number // milliseconds
  onSlowRender?: (duration: number) => void
}

export const PerformanceMonitor = memo<PerformanceMonitorProps>(({
  children,
  threshold = 16, // 60fps threshold
  onSlowRender
}) => {
  const [renderTime, setRenderTime] = useState<number | null>(null)

  useEffect(() => {
    const startTime = performance.now()

    const measureRender = () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      setRenderTime(duration)
      
      if (duration > threshold) {
        onSlowRender?.(duration)
      }
    }

    // Measure after render
    const timeoutId = setTimeout(measureRender, 0)

    return () => clearTimeout(timeoutId)
  })

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && renderTime && renderTime > threshold && (
        <Box
          position="fixed"
          top={10}
          right={10}
          bgcolor="warning.main"
          color="warning.contrastText"
          p={1}
          borderRadius={1}
          zIndex={9999}
        >
          <Typography variant="caption">
            Slow render: {renderTime.toFixed(2)}ms
          </Typography>
        </Box>
      )}
    </>
  )
})

PerformanceMonitor.displayName = 'PerformanceMonitor'

// Debounced input for expensive calculations
interface DebouncedInputProps {
  value: string
  onChange: (value: string) => void
  delay?: number
  placeholder?: string
}

export const DebouncedInput = memo<DebouncedInputProps>(({
  value,
  onChange,
  delay = 300,
  placeholder
}) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [localValue, value, onChange, delay])

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%'
      }}
    />
  )
})

DebouncedInput.displayName = 'DebouncedInput' 