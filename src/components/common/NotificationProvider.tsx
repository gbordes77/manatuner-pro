import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  autoHideDuration?: number
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface Props {
  children: ReactNode
}

export const NotificationProvider: React.FC<Props> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    setNotifications(prev => [...prev, newNotification])
  }

  const handleClose = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map(notification => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration || 6000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => handleClose(notification.id)} 
            severity={notification.type}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  )
} 