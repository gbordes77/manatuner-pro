// MTG Card Types
export interface ManaSymbol {
  symbol: string
  cmc: number
  colors: string[]
}

export interface ManaCost {
  cost: string
  cmc: number
  colors: string[]
  symbols: ManaSymbol[]
}

export interface Card {
  id: string
  name: string
  manaCost?: string
  cmc: number
  colors: string[]
  colorIdentity: string[]
  type: string
  supertypes?: string[]
  types: string[]
  subtypes?: string[]
  rarity: string
  setCode: string
  imageUris?: {
    small?: string
    normal?: string
    large?: string
  }
  faces?: Card[] // For double-faced cards
  layout: string
  isLand: boolean
  producedMana?: string[]
}

export interface DeckCard {
  card: Card
  quantity: number
  category: 'creature' | 'spell' | 'land' | 'artifact' | 'enchantment' | 'planeswalker' | 'other'
}

export interface Deck {
  id?: string
  name: string
  description?: string
  format: string
  mainboard: DeckCard[]
  sideboard: DeckCard[]
  commander?: DeckCard
  totalCards: number
  createdAt?: Date
  updatedAt?: Date
}

// Analysis Types
export interface ColorRequirement {
  color: string
  sources: number
  percentage: number
}

export interface TurnAnalysis {
  turn: number
  castProbability: number
  averageDelay: number
  sources: ColorRequirement[]
}

export interface CardAnalysis {
  card: Card
  quantity: number
  turnAnalysis: TurnAnalysis[]
  reliability: 'excellent' | 'good' | 'marginal' | 'poor'
  recommendedSources: ColorRequirement[]
}

export interface ManabaseAnalysis {
  id: string
  deckId: string
  totalLands: number
  colorDistribution: Record<string, number>
  cardAnalyses: CardAnalysis[]
  recommendations: Recommendation[]
  overallRating: number
  createdAt: Date
}

export interface Recommendation {
  type: 'add_land' | 'remove_land' | 'change_land' | 'add_fixing'
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  suggestedCards?: Card[]
  impact: {
    before: number
    after: number
    improvement: number
  }
}

// Simulation Types
export interface SimulationParams {
  iterations: number
  mulliganStrategy: 'none' | 'aggressive' | 'conservative'
  playFirst: boolean
  maxMulligans: number
}

export interface SimulationResult {
  params: SimulationParams
  results: {
    turn: number
    castRate: number
    averageDelay: number
    keepRate: number
  }[]
  statistics: {
    totalGames: number
    averageKeepRate: number
    averageFirstSpellTurn: number
  }
}

// UI State Types
export interface NotificationState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  autoHideDuration?: number
}

export interface LoadingState {
  isLoading: boolean
  operation?: string
  progress?: number
}

export interface ErrorState {
  hasError: boolean
  message?: string
  code?: string
  details?: any
}

// API Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    requestId: string
    cached?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Firebase Types
export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
}

export interface User {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
  preferences?: {
    theme: 'light' | 'dark' | 'auto'
    defaultFormat: string
    autoSave: boolean
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>> 