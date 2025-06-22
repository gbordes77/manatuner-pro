import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { advancedMathEngine } from '../../services/advancedMaths'
import { AnalyzeRequestSchema } from '../../lib/validations'
import type { 
  TurnAnalysis, 
  MonteCarloResult, 
  MultivariateAnalysis,
  DeckConfiguration,
  ColorRequirement
} from '../../types/maths'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface AnalysisResponse {
  success: boolean
  data?: {
    turnAnalysis: TurnAnalysis[]
    monteCarloResult?: MonteCarloResult
    multivariateAnalysis?: MultivariateAnalysis
    recommendations: string[]
    summary: {
      overallRating: string
      criticalTurn: number | null
      averageProbability: number
    }
  }
  error?: string
  rateLimitInfo?: {
    remaining: number
    resetTime: number
  }
}

/**
 * Rate limiting middleware
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 30 // 30 requests per minute

  const userLimit = rateLimitStore.get(ip)
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    const resetTime = now + windowMs
    rateLimitStore.set(ip, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }

  if (userLimit.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime }
  }

  // Increment count
  userLimit.count++
  rateLimitStore.set(ip, userLimit)
  
  return { allowed: true, remaining: maxRequests - userLimit.count, resetTime: userLimit.resetTime }
}

/**
 * Get client IP address
 */
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded 
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.socket.remoteAddress

  return ip || 'unknown'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    })
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req)
    const rateLimit = checkRateLimit(clientIP)
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        rateLimitInfo: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      })
    }

    // Validate request body
    const validationResult = AnalyzeRequestSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${validationResult.error.issues.map(i => i.message).join(', ')}`
      })
    }

    const {
      deckConfiguration,
      colorRequirements,
      analysisOptions = {}
    } = validationResult.data

    const {
      enableMonteCarlo = false,
      enableMultivariate = false,
      maxTurn = 6,
      iterations = 10000
    } = analysisOptions

    // Perform turn-by-turn analysis for each color requirement
    const turnAnalysisResults: Record<string, TurnAnalysis[]> = {}
    
    for (const requirement of colorRequirements) {
      const { color, symbolsNeeded } = requirement
      const sourcesInDeck = deckConfiguration.sources[color] || 0
      
      const turnAnalysis: TurnAnalysis[] = []
      
      for (let turn = 1; turn <= maxTurn; turn++) {
        const analysis = advancedMathEngine.calculateKarstenProbability(
          deckConfiguration.deckSize,
          sourcesInDeck,
          turn,
          symbolsNeeded,
          deckConfiguration.onThePlay,
          deckConfiguration.handSize
        )
        turnAnalysis.push(analysis)
      }
      
      turnAnalysisResults[color] = turnAnalysis
    }

    // Combine all turn analyses
    const allTurnAnalysis: TurnAnalysis[] = Object.values(turnAnalysisResults).flat()

    // Run Monte Carlo simulation if requested
    let monteCarloResult: MonteCarloResult | undefined
    if (enableMonteCarlo) {
      const monteCarloParams = {
        deckConfiguration,
        colorRequirements,
        iterations,
        maxTurns: maxTurn
      }
      
      monteCarloResult = await advancedMathEngine.runMonteCarloSimulation(monteCarloParams)
    }

    // Run multivariate analysis if requested
    let multivariateAnalysis: MultivariateAnalysis | undefined
    if (enableMultivariate && colorRequirements.length > 1) {
      multivariateAnalysis = advancedMathEngine.analyzeMultivariateRequirements(
        deckConfiguration,
        colorRequirements
      )
    }

    // Generate recommendations
    const recommendations: string[] = []
    
    // Analyze each color for problems
    for (const [color, turnAnalysis] of Object.entries(turnAnalysisResults)) {
      const problematicTurns = turnAnalysis.filter(analysis => 
        analysis.castProbability < 0.90
      )
      
      if (problematicTurns.length > 0) {
        const worstTurn = problematicTurns.reduce((worst, current) =>
          current.castProbability < worst.castProbability ? current : worst
        )
        
        recommendations.push(
          `${color.toUpperCase()}: ${worstTurn.karstenRating.recommendation}`
        )
      }
    }

    // Add multivariate recommendations
    if (multivariateAnalysis?.recommendations) {
      recommendations.push(...multivariateAnalysis.recommendations)
    }

    // Calculate summary statistics
    const allProbabilities = allTurnAnalysis.map(a => a.castProbability)
    const averageProbability = allProbabilities.reduce((sum, p) => sum + p, 0) / allProbabilities.length
    const worstProbability = Math.min(...allProbabilities)
    
    const overallRating = worstProbability >= 0.95 ? 'excellent' :
                         worstProbability >= 0.90 ? 'good' :
                         worstProbability >= 0.80 ? 'acceptable' :
                         worstProbability >= 0.60 ? 'poor' : 'unplayable'

    const criticalTurn = allTurnAnalysis.find(analysis => 
      analysis.castProbability < 0.90
    )?.turn || null

    // Set rate limit headers
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString())
    res.setHeader('X-RateLimit-Reset', rateLimit.resetTime.toString())

    return res.status(200).json({
      success: true,
      data: {
        turnAnalysis: allTurnAnalysis,
        monteCarloResult,
        multivariateAnalysis,
        recommendations,
        summary: {
          overallRating,
          criticalTurn,
          averageProbability
        }
      },
      rateLimitInfo: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      }
    })

  } catch (error) {
    console.error('Analysis API Error:', error)
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}

// Export for testing
export { checkRateLimit, getClientIP } 