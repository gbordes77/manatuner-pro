// Mock Supabase service for privacy-first mode
// This avoids the "supabaseUrl is required" error while keeping the app functional

export const supabase = {
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