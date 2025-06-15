import { configureStore } from '@reduxjs/toolkit'
import { deckSlice } from './slices/deckSlice'
import { analysisSlice } from './slices/analysisSlice'
import { uiSlice } from './slices/uiSlice'
import { authSlice } from './slices/authSlice'

export const store = configureStore({
  reducer: {
    deck: deckSlice.reducer,
    analysis: analysisSlice.reducer,
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
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