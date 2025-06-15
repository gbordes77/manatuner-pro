// MTG Card Types
export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G'
export type ManaSymbol = ManaColor | 'C' | string

export interface Card {
  id: string
  name: string
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  colors: string[]
  color_identity: string[]
  set: string
  set_name: string
  rarity: string
  image_uris?: {
    small?: string
    normal?: string
    large?: string
  }
  prices?: {
    usd?: string
    eur?: string
  }
  legalities: Record<string, string>
  layout: string
  card_faces?: CardFace[]
}

export interface CardFace {
  name: string
  mana_cost?: string
  type_line: string
  oracle_text?: string
  colors: string[]
  image_uris?: {
    small?: string
    normal?: string
    large?: string
  }
}

export interface ManaCost {
  symbols: ManaSymbol[]
  cmc: number
  colors: string[]
}

// Deck Types
export interface DeckCard {
  card: Card
  quantity: number
}

export interface Deck {
  id: string
  name: string
  format: MTGFormat
  cards: DeckCard[]
  createdAt: string
  updatedAt: string
  description?: string
  tags?: string[]
}

// MTG Formats
export type MTGFormat = 
  | 'standard'
  | 'modern'
  | 'legacy'
  | 'vintage'
  | 'commander'
  | 'pioneer'
  | 'historic'
  | 'pauper'
  | 'limited'

// Manabase Analysis Types
export interface ManabaseAnalysis {
  id: string
  deckId: string
  format: MTGFormat
  totalLands: number
  colorRequirements: ColorRequirement[]
  recommendations: LandRecommendation[]
  probabilities: ManabaseProbabilities
  createdAt: string
}

export interface ColorRequirement {
  color: ManaColor
  turn: number
  sources: number
  probability: number
  isOptimal: boolean
}

export interface LandRecommendation {
  cardName: string
  quantity: number
  reason: string
  priority: 'high' | 'medium' | 'low'
  colors: ManaColor[]
}

export interface ManabaseProbabilities {
  turn1: TurnProbabilities
  turn2: TurnProbabilities
  turn3: TurnProbabilities
  turn4: TurnProbabilities
  overall: OverallProbabilities
}

export interface TurnProbabilities {
  anyColor: number
  specificColors: Record<ManaColor, number>
  multipleColors: Record<string, number>
}

export interface OverallProbabilities {
  consistency: number
  colorScrew: number
  manaFlood: number
  manaScrew: number
}

// Search and Filter Types
export interface SearchFilters {
  name?: string
  colors?: ManaColor[]
  type?: string
  set?: string
  rarity?: string
  cmc?: number | [number, number]
  format?: MTGFormat
}

export interface SearchResult {
  cards: Card[]
  totalCount: number
  hasMore: boolean
}

// UI State Types
export interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  loading: boolean
  error: string | null
}

// API Response Types
export interface ScryfallResponse<T> {
  object: string
  data: T[]
  has_more: boolean
  next_page?: string
  total_cards?: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: {
    timestamp: string
    requestId: string
    cached?: boolean
  }
}

// Utility Types
export interface PaginationParams {
  page: number
  limit: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

// Constants
export const MTG_FORMATS: MTGFormat[] = [
  'standard',
  'modern',
  'legacy',
  'vintage',
  'commander',
  'pioneer',
  'historic',
  'pauper',
  'limited'
]

export const MANA_COLORS: ManaColor[] = ['W', 'U', 'B', 'R', 'G']

export const COLOR_NAMES: Record<ManaColor, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green'
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

// Analysis Types
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

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>> 