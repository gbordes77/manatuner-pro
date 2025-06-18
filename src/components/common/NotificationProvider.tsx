import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { Snackbar, Alert, AlertColor } from '@mui/material'
import { lightTheme, darkTheme } from '../../theme'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  autoHideDuration?: number
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void
}

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

interface CombinedContextType extends NotificationContextType, ThemeContextType {}

const CombinedContext = createContext<CombinedContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(CombinedContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return {
    showNotification: context.showNotification
  }
}

export const useTheme = () => {
  const context = useContext(CombinedContext)
  if (!context) {
    throw new Error('useTheme must be used within NotificationProvider')
  }
  return {
    isDark: context.isDark,
    toggleTheme: context.toggleTheme
  }
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: AlertColor
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('manatuner-theme')
    if (saved) return saved === 'dark'
    
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('manatuner-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const showNotification = (message: string, severity: AlertColor = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const toggleTheme = () => {
    setIsDark(prev => !prev)
    showNotification(
      `Thème ${!isDark ? 'sombre' : 'clair'} activé`, 
      'success'
    )
  }

  const handleClose = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  const contextValue: CombinedContextType = {
    showNotification,
    isDark,
    toggleTheme,
  }

  return (
    <CombinedContext.Provider value={contextValue}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
        
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          <Alert 
            onClose={handleClose} 
            severity={notification.severity}
            variant="filled"
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              '& .MuiAlert-icon': {
                fontSize: '1.2rem',
              }
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </CombinedContext.Provider>
  )
} 