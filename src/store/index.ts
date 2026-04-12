import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  createMigrate,
  createTransform,
  persistReducer,
  persistStore,
  type MigrationManifest,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import analyzerReducer from './slices/analyzerSlice'

/**
 * Transform: strip volatile UI state from the persisted payload. The snackbar
 * should never be rehydrated into "still open" and isAnalyzing should never
 * be rehydrated into "true" (the worker is long gone).
 */
const analyzerPersistTransform = createTransform(
  (inbound: any) => {
    if (!inbound || typeof inbound !== 'object') return inbound
    const { snackbar, isAnalyzing, ...rest } = inbound
    // Keep snackbar shape for the reducer to work, just collapse to closed
    return {
      ...rest,
      isAnalyzing: false,
      snackbar: { open: false, message: '', severity: 'success' as const },
    }
  },
  (outbound: any) => outbound,
  { whitelist: ['analyzer'] }
)

/**
 * Migration 1 (2026-04-12): any pre-existing persisted state should have its
 * volatile fields cleared. For older shapes (pre-v2.2) we fall back to the
 * reducer's initial state so a corrupted localStorage can't crash rehydration.
 */
const migrations: MigrationManifest = {
  1: (state: any) => {
    if (!state || typeof state !== 'object') return state
    return {
      ...state,
      analyzer: state.analyzer
        ? {
            ...state.analyzer,
            isAnalyzing: false,
            snackbar: { open: false, message: '', severity: 'success' as const },
          }
        : undefined,
    }
  },
}

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['analyzer'],
  transforms: [analyzerPersistTransform],
  migrate: createMigrate(migrations, { debug: false }),
}

const rootReducer = combineReducers({
  analyzer: analyzerReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: import.meta.env.DEV,
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
