import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for development
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || ''
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Database Types (to be expanded)
export interface Database {
  public: {
    Tables: {
      deck_analyses: {
        Row: {
          id: string
          user_id: string | null
          deck_list: string
          analysis_result: any
          created_at: string
          is_public: boolean
          name: string | null
          format: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          deck_list: string
          analysis_result: any
          created_at?: string
          is_public?: boolean
          name?: string | null
          format?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          deck_list?: string
          analysis_result?: any
          created_at?: string
          is_public?: boolean
          name?: string | null
          format?: string | null
        }
      }
      deck_templates: {
        Row: {
          id: string
          name: string
          format: string
          archetype: string | null
          deck_list: string
          mana_curve: any | null
          color_identity: string[] | null
          avg_cmc: number | null
          land_count: number | null
          is_featured: boolean
          upvotes: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          format: string
          archetype?: string | null
          deck_list: string
          mana_curve?: any | null
          color_identity?: string[] | null
          avg_cmc?: number | null
          land_count?: number | null
          is_featured?: boolean
          upvotes?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          format?: string
          archetype?: string | null
          deck_list?: string
          mana_curve?: any | null
          color_identity?: string[] | null
          avg_cmc?: number | null
          land_count?: number | null
          is_featured?: boolean
          upvotes?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          created_at: string
          username: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          username?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          username?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Typed Supabase client
export type TypedSupabaseClient = typeof supabase

// Helper functions for common operations
export const supabaseHelpers = {
  // Check if client is properly configured
  isConfigured: () => Boolean(supabaseUrl && supabaseAnonKey),
  
  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
  
  // Save analysis (anonymous or authenticated)
  saveAnalysis: async (deckList: string, analysisResult: any, name?: string, format?: string) => {
    const user = await supabaseHelpers.getCurrentUser()
    
    const { data, error } = await supabase
      .from('deck_analyses')
      .insert({
        user_id: user?.id || null,
        deck_list: deckList,
        analysis_result: analysisResult,
        name: name || null,
        format: format || null,
        is_public: false
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  // Get user's saved analyses
  getUserAnalyses: async (limit = 20) => {
    const user = await supabaseHelpers.getCurrentUser()
    if (!user) return []
    
    const { data, error } = await supabase
      .from('deck_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },
  
  // Get public deck templates
  getDeckTemplates: async (format?: string, limit = 50) => {
    let query = supabase
      .from('deck_templates')
      .select('*')
      .eq('is_featured', true)
      .order('upvotes', { ascending: false })
      .limit(limit)
    
    if (format) {
      query = query.eq('format', format)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },
  
  // Create shareable link for analysis
  createShareableAnalysis: async (deckList: string, analysisResult: any, name?: string) => {
    const { data, error } = await supabase
      .from('deck_analyses')
      .insert({
        user_id: null, // Anonymous sharing
        deck_list: deckList,
        analysis_result: analysisResult,
        name: name || 'Shared Analysis',
        is_public: true
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  // Get shared analysis by ID
  getSharedAnalysis: async (id: string) => {
    const { data, error } = await supabase
      .from('deck_analyses')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single()
    
    if (error) throw error
    return data
  }
}

// Error handling helper
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  // Common error messages for users
  if (error?.code === 'PGRST116') {
    return 'No data found'
  }
  if (error?.code === '23505') {
    return 'This item already exists'
  }
  if (error?.message?.includes('JWT')) {
    return 'Session expired, please refresh the page'
  }
  
  return error?.message || 'An unexpected error occurred'
}

export default supabase 