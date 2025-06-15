import { configureStore } from '@reduxjs/toolkit'
import deckReducer from './slices/deckSlice'
import analysisReducer from './slices/analysisSlice'
import uiReducer from './slices/uiSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    deck: deckReducer,
    analysis: analysisReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 