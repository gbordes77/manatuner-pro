import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import analysisReducer from './slices/analysisSlice'
import analyzerReducer from './slices/analyzerSlice'
import authReducer from './slices/authSlice'
import deckReducer from './slices/deckSlice'
import uiReducer from './slices/uiSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['deck', 'analysis', 'analyzer'] // Persist deck, analysis and analyzer state
}

const rootReducer = combineReducers({
  deck: deckReducer,
  analysis: analysisReducer,
  ui: uiReducer,
  auth: authReducer,
  analyzer: analyzerReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
