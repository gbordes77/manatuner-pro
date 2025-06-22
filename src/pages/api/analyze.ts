import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { deckSchema, analysisResultSchema, sanitizeInput } from '../../lib/validations'
import { DeckAnalyzer } from '../../services/deckAnalyzer'
import { withRateLimit, analysisRateLimit, logRateLimit } from '../../middleware/rateLimiting'

// Schema de validation pour la requête d'analyse
const analyzeRequestSchema = z.object({
  deckList: z.string().min(10, "Deck list too short").max(10000, "Deck list too long"),
  format: z.enum(["Standard", "Modern", "Legacy", "Vintage", "Commander", "Pioneer", "Historic", "Alchemy", "Explorer", "Timeless"]).optional(),
  options: z.object({
    includeAdvanced: z.boolean().default(true),
    includeMonteCarlo: z.boolean().default(false),
    iterations: z.number().min(1000).max(100000).default(10000)
  }).optional()
})

async function analyzeHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    })
  }

  try {
    // Validation et sanitisation des données d'entrée
    const sanitizedBody = {
      ...req.body,
      deckList: sanitizeInput(req.body.deckList || '')
    }

    const validatedData = analyzeRequestSchema.parse(sanitizedBody)
    const { deckList, format = "Standard", options = {} } = validatedData

    // Vérification de sécurité supplémentaire
    if (!deckList.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Deck list cannot be empty'
      })
    }

    // Analyse du deck avec gestion d'erreur
    let analysisResult
    try {
      analysisResult = await DeckAnalyzer.analyzeDeck(deckList)
    } catch (analysisError) {
      console.error('Deck analysis failed:', analysisError)
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze deck. Please check your deck list format.'
      })
    }

    // Validation du résultat d'analyse
    const validatedResult = analysisResultSchema.parse(analysisResult)

    // Ajout d'informations de métadonnées
    const response = {
      success: true,
      data: {
        analysis: validatedResult,
        metadata: {
          format,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - (req as any).startTime || 0,
          version: "2.0.0",
          options
        }
      }
    }

    // Headers de sécurité
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')

    res.status(200).json(response)

  } catch (error) {
    console.error('API analyze error:', error)

    // Gestion spécifique des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    // Erreur générique
    res.status(500).json({
      success: false,
      error: 'Internal server error occurred during analysis'
    })
  }
}

// Exporter le handler avec rate limiting appliqué
export default withRateLimit(analysisRateLimit, analyzeHandler); 