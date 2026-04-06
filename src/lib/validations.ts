import { z } from 'zod'

// 🃏 VALIDATION DECK MAGIC: THE GATHERING
export const cardSchema = z.object({
  name: z.string().min(1, 'Card name is required').max(100, 'Card name too long'),
  quantity: z.number().int().min(1, 'Minimum 1 card').max(4, 'Maximum 4 copies per card'),
  set: z.string().optional(),
  collector_number: z.string().optional(),
  mana_cost: z.string().optional(),
  type_line: z.string().optional(),
  cmc: z.number().optional(),
})

export const deckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(100, 'Deck name too long'),
  format: z
    .enum([
      'Standard',
      'Modern',
      'Legacy',
      'Vintage',
      'Commander',
      'Pioneer',
      'Historic',
      'Alchemy',
      'Explorer',
      'Timeless',
    ])
    .optional(),
  cards: z
    .array(cardSchema)
    .max(100, 'Maximum 100 unique cards')
    .refine(
      (cards) => {
        const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)
        return totalCards >= 40 && totalCards <= 250
      },
      { message: 'Deck must have between 40 and 250 cards total' }
    ),
  sideboard: z.array(cardSchema).max(15, 'Sideboard maximum 15 cards').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  archetype: z.string().max(50, 'Archetype name too long').optional(),
  tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags').optional(),
})

// 📊 VALIDATION ANALYSIS RESULT
export const analysisResultSchema = z.object({
  totalCards: z.number().int().min(40).max(250),
  totalLands: z.number().int().min(0).max(100),
  landRatio: z.number().min(0).max(1),
  averageCMC: z.number().min(0).max(20),
  colorDistribution: z.record(z.string(), z.number().min(0)),
  manaCurve: z.record(z.string(), z.number().min(0)),
  recommendations: z.array(z.string()).optional(),
  probability: z
    .object({
      turn1Land: z.number().min(0).max(1),
      turn2Land: z.number().min(0).max(1),
      turn3Land: z.number().min(0).max(1),
      mulliganRate: z.number().min(0).max(1),
    })
    .optional(),
  advanced: z
    .object({
      fetchlandCount: z.number().int().min(0).optional(),
      duallandCount: z.number().int().min(0).optional(),
      basiclandCount: z.number().int().min(0).optional(),
      bottlenecks: z.array(z.string()).optional(),
    })
    .optional(),
})

// 🔐 VALIDATION USER & AUTH
export const userProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimum 3 characters')
    .max(30, 'Username maximum 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, _ and -'),
  email: z.string().email('Invalid email format'),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  preferences: z
    .object({
      defaultFormat: z.string().optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      notifications: z.boolean().optional(),
      privacy: z.enum(['public', 'private']).optional(),
    })
    .optional(),
})

// 📝 VALIDATION DECK ANALYSIS SAVE
export const saveAnalysisSchema = z.object({
  deck_list: z.string().min(10, 'Deck list too short').max(10000, 'Deck list too long'),
  analysis_result: analysisResultSchema,
  name: z.string().min(1, 'Analysis name required').max(100, 'Analysis name too long').optional(),
  format: z.string().max(20, 'Format name too long').optional(),
  is_public: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags').optional(),
})

// 🔍 VALIDATION SEARCH & FILTERS
export const searchFiltersSchema = z.object({
  format: z.string().optional(),
  archetype: z.string().optional(),
  colors: z.array(z.string()).max(5, 'Maximum 5 colors').optional(),
  minLands: z.number().int().min(0).max(100).optional(),
  maxLands: z.number().int().min(0).max(100).optional(),
  minCMC: z.number().min(0).max(20).optional(),
  maxCMC: z.number().min(0).max(20).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'name', 'upvotes', 'land_count', 'avg_cmc']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// 🎯 VALIDATION API ROUTES
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
})

// 📤 VALIDATION SHARE ANALYSIS
export const shareAnalysisSchema = z.object({
  analysis_id: z.string().uuid('Invalid analysis ID'),
  share_type: z.enum(['public', 'link', 'private']).default('link'),
  expires_at: z.string().datetime().optional(),
  password: z
    .string()
    .min(4, 'Password minimum 4 characters')
    .max(50, 'Password too long')
    .optional(),
})

// 🔧 VALIDATION ADVANCED MATH INPUTS
export const advancedMathInputSchema = z.object({
  deckSize: z.number().int().min(40, 'Minimum 40 cards').max(250, 'Maximum 250 cards'),
  handSize: z.number().int().min(1, 'Minimum 1 card').max(15, 'Maximum 15 cards').default(7),
  turns: z.number().int().min(1, 'Minimum 1 turn').max(10, 'Maximum 10 turns').default(5),
  targetLands: z.number().int().min(0, 'Minimum 0 lands').max(100, 'Maximum 100 lands'),
  mulliganStrategy: z.enum(['conservative', 'aggressive', 'london']).default('london'),
  fetchlandCount: z.number().int().min(0).max(20).optional(),
  duallandCount: z.number().int().min(0).max(20).optional(),
  constraints: z
    .array(
      z.object({
        cardType: z.string(),
        minCount: z.number().int().min(0),
        maxCount: z.number().int().max(10),
      })
    )
    .max(5, 'Maximum 5 constraints')
    .optional(),
})

// 🎲 VALIDATION MONTE CARLO SIMULATION
export const monteCarloInputSchema = z.object({
  iterations: z
    .number()
    .int()
    .min(1000, 'Minimum 1000 iterations')
    .max(100000, 'Maximum 100000 iterations')
    .default(10000),
  scenarios: z
    .array(
      z.object({
        name: z.string().max(50, 'Scenario name too long'),
        condition: z.string().max(200, 'Condition too long'),
        target: z.number().min(0).max(1),
      })
    )
    .max(10, 'Maximum 10 scenarios'),
  confidence_level: z.number().min(0.8).max(0.99).default(0.95),
})

// 🛡️ HELPER FUNCTIONS
export const validateDeckList = (deckList: string) => {
  const lines = deckList
    .trim()
    .split('\n')
    .filter((line) => line.trim())
  const cards: z.infer<typeof cardSchema>[] = []

  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(.+)$/)
    if (!match) continue

    const quantity = parseInt(match[1])
    const name = match[2].trim()

    if (quantity > 0 && name.length > 0) {
      cards.push({ name, quantity })
    }
  }

  return cardSchema.array().parse(cards)
}

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/[<>]/g, '') // Remove HTML brackets
    .trim()
}

export const validateApiKey = (apiKey: string): boolean => {
  return /^[a-zA-Z0-9_-]{32,128}$/.test(apiKey)
}

// 📋 EXPORT ALL SCHEMAS
export const schemas = {
  card: cardSchema,
  deck: deckSchema,
  analysisResult: analysisResultSchema,
  userProfile: userProfileSchema,
  saveAnalysis: saveAnalysisSchema,
  searchFilters: searchFiltersSchema,
  apiResponse: apiResponseSchema,
  shareAnalysis: shareAnalysisSchema,
  advancedMathInput: advancedMathInputSchema,
  monteCarloInput: monteCarloInputSchema,
}

export type Card = z.infer<typeof cardSchema>
export type Deck = z.infer<typeof deckSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type SaveAnalysis = z.infer<typeof saveAnalysisSchema>
export type SearchFilters = z.infer<typeof searchFiltersSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
export type ShareAnalysis = z.infer<typeof shareAnalysisSchema>
export type AdvancedMathInput = z.infer<typeof advancedMathInputSchema>
export type MonteCarloInput = z.infer<typeof monteCarloInputSchema>

// MTG Color validation
export const ManaColorSchema = z.enum(['W', 'U', 'B', 'R', 'G', 'C'])

// MTG Format validation
export const FormatSchema = z.enum([
  'standard',
  'modern',
  'legacy',
  'vintage',
  'commander',
  'pioneer',
  'historic',
  'alchemy',
  'limited',
  'draft',
  'sealed',
])

// Mana cost validation (supports hybrid, phyrexian, etc.)
export const ManaCostSchema = z
  .string()
  .regex(/^(\{[0-9XWUBRGCP/]+\})*$/, 'Invalid mana cost format')

// Card validation
export const CardSchema = z.object({
  name: z.string().min(1, 'Card name cannot be empty').max(100, 'Card name too long').trim(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(4, 'Maximum 4 copies allowed in most formats'),
  manaCost: ManaCostSchema.optional(),
  cmc: z.number().min(0, 'CMC cannot be negative').max(20, 'CMC too high').optional(),
  colors: z.array(ManaColorSchema).optional(),
  type: z.string().optional(),
  isLand: z.boolean().optional(),
  producedMana: z.array(ManaColorSchema).optional(),
})

// Deck validation with Frank Karsten constraints
export const DeckSchema = z.object({
  name: z.string().min(1, 'Deck name required').max(100, 'Deck name too long').trim(),
  format: FormatSchema,
  mainboard: z
    .array(CardSchema)
    .min(1, 'Deck must contain at least 1 card')
    .max(250, 'Deck too large')
    .refine((cards) => {
      const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)
      return totalCards >= 40 && totalCards <= 250
    }, 'Deck must contain 40-250 cards'),
  sideboard: z.array(CardSchema).max(15, 'Sideboard limited to 15 cards').optional(),
  commander: CardSchema.optional(),
})

// Analysis parameters validation
export const AnalysisParamsSchema = z.object({
  iterations: z
    .number()
    .int('Iterations must be integer')
    .min(1000, 'Minimum 1000 iterations for accuracy')
    .max(100000, 'Maximum 100000 iterations for performance')
    .default(10000),
  mulliganStrategy: z
    .enum(['none', 'aggressive', 'conservative', 'optimal'])
    .default('conservative'),
  playFirst: z.boolean().default(true),
  maxMulligans: z
    .number()
    .int('Max mulligans must be integer')
    .min(0, 'Cannot have negative mulligans')
    .max(6, 'Maximum 6 mulligans allowed')
    .default(2),
  targetTurn: z
    .number()
    .int('Target turn must be integer')
    .min(1, 'Turn must be at least 1')
    .max(10, 'Analysis limited to turn 10')
    .default(4),
})

// Frank Karsten probability validation
export const ProbabilityResultSchema = z.object({
  probability: z
    .number()
    .min(0, 'Probability cannot be negative')
    .max(1, 'Probability cannot exceed 1'),
  meetsThreshold: z.boolean(),
  sourcesNeeded: z
    .number()
    .int('Sources needed must be integer')
    .min(0, 'Sources needed cannot be negative'),
  sourcesAvailable: z
    .number()
    .int('Sources available must be integer')
    .min(0, 'Sources available cannot be negative'),
  recommendation: z.string().optional(),
  karstenRating: z.enum(['excellent', 'good', 'acceptable', 'poor', 'unplayable']).optional(),
})

// API Request validation
export const AnalyzeRequestSchema = z.object({
  decklist: z.string().min(10, 'Decklist too short').max(50000, 'Decklist too long').trim(),
  format: FormatSchema.optional().default('standard'),
  analysisParams: AnalysisParamsSchema.optional(),
})

// Security validation for user inputs
export const sanitizeString = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

// XSS protection for deck names and descriptions
export const SanitizedStringSchema = z
  .string()
  .transform((val) => sanitizeString(val))
  .refine((val) => val.length > 0, 'Cannot be empty after sanitization')

// Rate limiting validation
export const RateLimitSchema = z.object({
  requests: z.number().int().min(1).max(1000),
  windowMs: z.number().int().min(1000).max(3600000), // 1 second to 1 hour
  skipSuccessfulRequests: z.boolean().optional().default(false),
})

// Comprehensive error handling
export class ValidationError extends Error {
  constructor(
    public field: string,
    public code: string,
    message: string,
    public value?: any
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Validation helper functions
export const validateDeck = (deck: unknown) => {
  try {
    return DeckSchema.parse(deck)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new ValidationError(
        firstError.path.join('.'),
        firstError.code,
        firstError.message,
        'received' in firstError ? firstError.received : undefined
      )
    }
    throw error
  }
}

export const validateAnalysisParams = (params: unknown) => {
  try {
    return AnalysisParamsSchema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new ValidationError(
        firstError.path.join('.'),
        firstError.code,
        firstError.message,
        'received' in firstError ? firstError.received : undefined
      )
    }
    throw error
  }
}

// Frank Karsten specific validation
export const validateKarstenParameters = z.object({
  deckSize: z
    .number()
    .int('Deck size must be integer')
    .min(40, 'Minimum deck size is 40')
    .max(250, 'Maximum deck size is 250'),
  sourcesInDeck: z
    .number()
    .int('Sources must be integer')
    .min(0, 'Sources cannot be negative')
    .max(60, 'Too many sources'),
  turn: z
    .number()
    .int('Turn must be integer')
    .min(1, 'Turn must be at least 1')
    .max(10, 'Analysis limited to turn 10'),
  symbolsNeeded: z
    .number()
    .int('Symbols needed must be integer')
    .min(1, 'Must need at least 1 symbol')
    .max(6, 'Analysis limited to 6 symbols'),
  onThePlay: z.boolean().default(true),
  handSize: z
    .number()
    .int('Hand size must be integer')
    .min(4, 'Minimum hand size is 4')
    .max(7, 'Maximum hand size is 7')
    .default(7),
})

// Export all schemas for use throughout the app
// All schemas are already exported above
