import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  emailVerified: boolean
  preferences?: {
    theme: 'light' | 'dark' | 'auto'
    defaultFormat: string
    autoSave: boolean
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setAuthInitialized: (state) => {
      state.isInitialized = true
      state.isLoading = false
    },

    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },

    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = action.payload
    },

    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },

    updateUserPreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
      if (state.user) {
        state.user.preferences = {
          ...state.user.preferences,
          ...action.payload
        } as User['preferences']
      }
    },

    clearAuthError: (state) => {
      state.error = null
    },

    resetAuthState: (_state) => {
      return initialState
    }
  }
})

export const {
  setAuthLoading,
  setAuthInitialized,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateUserPreferences,
  clearAuthError,
  resetAuthState
} = authSlice.actions

export default authSlice.reducer
