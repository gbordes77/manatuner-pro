import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  loading: boolean
  error: string | null
  notifications: Notification[]
  activeTab: string
  searchQuery: string
  filters: {
    format: string
    colors: string[]
    type: string
  }
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  autoHideDuration?: number
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  loading: false,
  error: null,
  notifications: [],
  activeTab: 'deck',
  searchQuery: '',
  filters: {
    format: 'standard',
    colors: [],
    type: ''
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }
      state.notifications.push(notification)
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    
    setFilters: (state, action: PayloadAction<Partial<UIState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters
      state.searchQuery = ''
    },
    
    resetUIState: (state) => {
      return { ...initialState, theme: state.theme }
    }
  }
})

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  setError,
  clearError,
  addNotification,
  removeNotification,
  clearNotifications,
  setActiveTab,
  setSearchQuery,
  setFilters,
  resetFilters,
  resetUIState
} = uiSlice.actions

export default uiSlice.reducer 