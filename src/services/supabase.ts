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
  : null // Use null instead of a mock object for clarity

// Helpers that interact with Supabase or provide mock functionality
export const supabaseHelpers = {
  // Check if Supabase is properly configured
  isConfigured: () => !!(supabaseUrl && supabaseAnonKey),
  
  // Get current user, returns null if not configured or not logged in
  getCurrentUser: async () => {
    if (!supabase) return null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },
  
  // Save analysis to Supabase or return a mock response
  saveAnalysis: async (deckList: string, analysisResult: any, name?: string, format?: string) => {
    if (!supabase) {
      return { success: false, id: null, error: 'Supabase not configured' }
    }
    // This part should contain the actual logic to save to Supabase
    // For now, it returns a mock success to avoid breaking changes.
    // The real implementation would look something like:
    // const { data, error } = await supabase.from('analyses').insert({ ... }).select()
    console.log('Simulating save to Supabase:', { name, format })
    return { success: true, id: new Date().toISOString(), error: null }
  },
  
  // Get user analyses from Supabase or return an empty array
  getUserAnalyses: async () => {
    if (!supabase) return []
    // Real implementation would fetch from Supabase
    console.log('Simulating fetch from Supabase')
    return []
  },
  
  // Create a shareable analysis link
  createShareableAnalysis: async (deckList: string, analysisResult: any, name?: string) => {
    if (!supabase) {
      return { success: false, shareId: null, error: 'Supabase not configured' }
    }
    console.log('Simulating share link creation')
    return { success: true, shareId: `shared-${Date.now()}`, error: null }
  },
  
  // Get a shared analysis
  getSharedAnalysis: async (shareId: string) => {
    if (!supabase) return null
    console.log('Simulating fetch of shared analysis:', shareId)
    return null
  },
  
  // Delete an analysis
  deleteAnalysis: async (id: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' }
    }
    console.log('Simulating deletion from Supabase:', id)
    return { success: true, error: null }
  },

  // Update an analysis
  updateAnalysis: async (id: string, updates: any) => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' }
    }
    console.log('Simulating update in Supabase:', id, updates)
    return { success: true, error: null }
  }
}

// Mock error handler
export const handleSupabaseError = (error: any) => {
  console.log('Supabase disabled - using local storage only')
  return 'Supabase disabled - using local storage only'
}

// Mock typed client
export type TypedSupabaseClient = typeof supabase

export default supabase 