import React, { memo, Suspense, useMemo } from 'react';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Skeleton 
} from '@mui/material';

// Composant de fallback pour le loading
export const AnalysisLoadingFallback: React.FC = memo(() => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={24} />
      <Typography variant="body2" color="text.secondary">
        Loading advanced analysis...
      </Typography>
    </Box>
    <Skeleton variant="rectangular" height={200} />
    <Skeleton variant="rectangular" height={150} />
  </Box>
));

AnalysisLoadingFallback.displayName = 'AnalysisLoadingFallback';

// Hook pour l'optimisation des calculs lourds
export function useOptimizedCalculation<T, R>(
  calculation: (input: T) => R,
  input: T,
  dependencies: React.DependencyList
): R {
  return useMemo(() => {
    console.log('Performing optimized calculation...');
    return calculation(input);
  }, dependencies);
}

// Composant wrapper pour le lazy loading avec gestion d'erreur
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = memo(({
  children,
  fallback = <AnalysisLoadingFallback />,
  errorFallback = (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="error">
        Failed to load component. Please try again.
      </Typography>
    </Box>
  )
}) => {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
});

LazyWrapper.displayName = 'LazyWrapper';

// Error Boundary simple
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Hook pour debouncing des inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Composant optimisé pour les graphiques
export const OptimizedChart = memo<{
  data: any[];
  type: 'line' | 'bar' | 'pie';
  title: string;
}>(({ data, type, title }) => {
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      id: `${type}-${index}`,
      processed: true
    }));
  }, [data, type]);

  return (
    <Box sx={{ height: 300, position: 'relative' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'grey.100',
        borderRadius: 1
      }}>
        <Typography color="text.secondary">
          Chart: {processedData.length} data points ({type})
        </Typography>
      </Box>
    </Box>
  );
});

OptimizedChart.displayName = 'OptimizedChart';

// Hook pour la mémoisation avancée
export function useAdvancedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  isEqual?: (prev: T, next: T) => boolean
): T {
  const ref = React.useRef<{ deps: React.DependencyList; value: T }>();
  
  if (!ref.current || 
      deps.length !== ref.current.deps.length ||
      deps.some((dep, i) => dep !== ref.current!.deps[i])) {
    
    const newValue = factory();
    
    if (!ref.current || !isEqual || !isEqual(ref.current.value, newValue)) {
      ref.current = { deps: [...deps], value: newValue };
    }
  }
  
  return ref.current.value;
}

// Composant de table optimisée simple
interface OptimizedTableProps {
  data: Array<{ id: string; [key: string]: any }>;
  columns: Array<{ key: string; label: string; width?: string }>;
  maxHeight?: number;
}

export const OptimizedTable: React.FC<OptimizedTableProps> = memo(({
  data,
  columns,
  maxHeight = 400
}) => {
  const memoizedData = useMemo(() => data, [data]);
  
  return (
    <Box sx={{ 
      maxHeight, 
      overflow: 'auto',
      border: 1,
      borderColor: 'divider',
      borderRadius: 1
    }}>
      <Box sx={{ 
        display: 'flex', 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        {columns.map((col) => (
          <Box 
            key={col.key}
            sx={{ 
              p: 1, 
              fontWeight: 'bold',
              width: col.width || 'auto',
              flex: col.width ? 'none' : 1
            }}
          >
            {col.label}
          </Box>
        ))}
      </Box>
      
      {memoizedData.map((row, index) => (
        <Box 
          key={row.id}
          sx={{ 
            display: 'flex',
            bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          {columns.map((col) => (
            <Box 
              key={col.key}
              sx={{ 
                p: 1,
                width: col.width || 'auto',
                flex: col.width ? 'none' : 1
              }}
            >
              <Typography variant="body2">
                {row[col.key]}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
});

OptimizedTable.displayName = 'OptimizedTable'; 