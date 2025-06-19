// Mock Supabase service for privacy-first mode
// This avoids the "supabaseUrl is required" error while keeping the app functional

import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for development
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || ''
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client only if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'manatuner-pro@1.0.0'
        }
      }
    })
  : {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null })
      }
    }

// Mock helpers that return empty data or false
export const supabaseHelpers = {
  // Always return false to indicate Supabase is not configured
  isConfigured: () => false,
  
  // Mock auth functions
  getCurrentUser: async () => null,
  
  // Mock analysis functions - all return empty results
  saveAnalysis: async () => ({ success: false, id: null, error: 'Supabase disabled' }),
  getUserAnalyses: async () => [],
  createShareableAnalysis: async () => ({ success: false, shareId: null, error: 'Supabase disabled' }),
  getSharedAnalysis: async () => null,
  
  // Mock utility functions
  deleteAnalysis: async () => ({ success: false, error: 'Supabase disabled' }),
  updateAnalysis: async () => ({ success: false, error: 'Supabase disabled' })
}

// Mock error handler
export const handleSupabaseError = (error: any) => {
  console.log('Supabase disabled - using local storage only')
  return 'Supabase disabled - using local storage only'
}

// Mock typed client
export type TypedSupabaseClient = typeof supabase

export default supabase 