import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { z } from 'zod'
import { manabaseAnalyzer } from './services/manabaseAnalyzer'
import { scryfallService } from './services/scryfallService'
import { securityMiddleware } from './middleware/security'
import { validationMiddleware } from './middleware/validation'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'

// Initialize Firebase Admin
admin.initializeApp()

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req: express.Request) => req.ip,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
})

// Express app setup
const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://api.scryfall.com"],
      connectSrc: ["'self'", "https://api.scryfall.com"]
    }
  }
}))

app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://project-manabase.web.app', 'https://project-manabase.firebaseapp.com']
    : true,
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Rate limiting middleware
app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await rateLimiter.consume(req.ip)
    next()
  } catch (rejRes: any) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000)
      }
    })
  }
})

// Security middleware
app.use(securityMiddleware)

// Validation schemas
const analyzeDeckSchema = z.object({
  decklist: z.string().min(1).max(50000),
  format: z.enum(['standard', 'modern', 'legacy', 'vintage', 'commander', 'pioneer', 'historic']).optional(),
  simulationParams: z.object({
    iterations: z.number().min(1000).max(100000).default(10000),
    mulliganStrategy: z.enum(['none', 'aggressive', 'conservative']).default('conservative'),
    playFirst: z.boolean().default(true),
    maxMulligans: z.number().min(0).max(6).default(2)
  }).optional()
})

const searchCardSchema = z.object({
  name: z.string().min(1).max(200),
  exact: z.boolean().optional()
})

const searchLandsSchema = z.object({
  colors: z.array(z.string().length(1).regex(/[WUBRG]/)).min(1).max(5),
  format: z.string().optional()
})

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    } 
  })
})

// Analyze manabase
app.post('/analyze', 
  validationMiddleware(analyzeDeckSchema),
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { decklist, format = 'standard', simulationParams } = req.body
      
      logger.info('Starting manabase analysis', { 
        userId: req.user?.uid,
        format,
        decklistLength: decklist.length 
      })

      // Parse and fetch cards
      const cardData = await scryfallService.analyzeDecklistText(decklist)
      
      // Perform manabase analysis
      const analysis = await manabaseAnalyzer.analyzeFullDeck({
        cards: cardData.cards,
        format,
        simulationParams: simulationParams || {
          iterations: 10000,
          mulliganStrategy: 'conservative',
          playFirst: true,
          maxMulligans: 2
        }
      })

      // Store analysis in Firestore (if user is authenticated)
      if (req.user?.uid) {
        try {
          await admin.firestore()
            .collection('analyses')
            .add({
              ...analysis,
              userId: req.user.uid,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              metadata: {
                format,
                totalCards: cardData.totalCards,
                notFoundCards: cardData.notFound
              }
            })
        } catch (error) {
          logger.warn('Failed to store analysis', { error, userId: req.user.uid })
        }
      }

      logger.info('Manabase analysis completed', { 
        analysisId: analysis.id,
        rating: analysis.overallRating 
      })

      res.json({
        success: true,
        data: {
          analysis,
          metadata: {
            totalCards: cardData.totalCards,
            notFoundCards: cardData.notFound,
            processingTime: Date.now() - req.startTime,
            cached: false
          }
        }
      })

    } catch (error) {
      next(error)
    }
  }
)

// Search card by name
app.get('/cards/search',
  validationMiddleware(searchCardSchema, 'query'),
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { name, exact = false } = req.query as any
      
      const card = exact 
        ? await scryfallService.searchCardExact(name)
        : await scryfallService.searchCardByName(name)

      if (!card) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CARD_NOT_FOUND',
            message: `Card '${name}' not found`
          }
        })
      }

      res.json({
        success: true,
        data: { card }
      })

    } catch (error) {
      next(error)
    }
  }
)

// Get land suggestions
app.post('/lands/suggest',
  validationMiddleware(searchLandsSchema),
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { colors, format } = req.body
      
      const lands = await scryfallService.getLandSuggestions(colors, format)

      res.json({
        success: true,
        data: { 
          lands,
          metadata: {
            colors,
            format,
            count: lands.length
          }
        }
      })

    } catch (error) {
      next(error)
    }
  }
)

// Get user's analysis history
app.get('/analyses',
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        })
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50)
      const offset = (page - 1) * limit

      const analysesRef = admin.firestore()
        .collection('analyses')
        .where('userId', '==', req.user.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)

      const snapshot = await analysesRef.get()
      const analyses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Get total count for pagination
      const countSnapshot = await admin.firestore()
        .collection('analyses')
        .where('userId', '==', req.user.uid)
        .count()
        .get()

      const total = countSnapshot.data().count

      res.json({
        success: true,
        data: analyses,
        pagination: {
          page,
          limit,
          total,
          hasNext: offset + limit < total,
          hasPrev: page > 1
        }
      })

    } catch (error) {
      next(error)
    }
  }
)

// Error handling
app.use(errorHandler)

// Export Cloud Functions
export const api = functions
  .region('us-central1')
  .runWith({
    memory: '1GB',
    timeoutSeconds: 300,
    maxInstances: 100
  })
  .https
  .onRequest(app)

// Scheduled function to clean up old analyses
export const cleanup = functions
  .region('us-central1')
  .runWith({ memory: '256MB' })
  .pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 30) // Keep analyses for 30 days

      const batch = admin.firestore().batch()
      const oldAnalysesSnapshot = await admin.firestore()
        .collection('analyses')
        .where('createdAt', '<', cutoffDate)
        .limit(500)
        .get()

      oldAnalysesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      
      logger.info('Cleanup completed', { 
        deletedCount: oldAnalysesSnapshot.size,
        cutoffDate: cutoffDate.toISOString()
      })

    } catch (error) {
      logger.error('Cleanup failed', { error })
    }
  })

// Cache warming function
export const warmCache = functions
  .region('us-central1')
  .runWith({ memory: '256MB' })
  .pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    try {
      // Pre-warm cache with popular cards
      const popularCards = [
        'Lightning Bolt', 'Counterspell', 'Sol Ring', 'Command Tower',
        'Scalding Tarn', 'Bloodstained Mire', 'Polluted Delta'
      ]

      await Promise.all(
        popularCards.map(cardName => 
          scryfallService.searchCardByName(cardName).catch(() => null)
        )
      )

      logger.info('Cache warming completed', { cardsWarmed: popularCards.length })

    } catch (error) {
      logger.error('Cache warming failed', { error })
    }
  }) 