import type { NextApiRequest, NextApiResponse } from 'next'

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextApiRequest) => string
}

interface RateLimitInfo {
  allowed: boolean
  remaining: number
  resetTime: number
  totalRequests: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { 
  count: number
  resetTime: number
  requests: Array<{ timestamp: number; success: boolean }>
}>()

/**
 * Advanced rate limiting with sliding window and request tracking
 */
export class RateLimiter {
  protected config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: this.defaultKeyGenerator,
      ...config
    }
  }

  private defaultKeyGenerator(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for']
    const ip = forwarded 
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
      : req.socket.remoteAddress

    return `rate_limit:${ip || 'unknown'}`
  }

  /**
   * Check if request should be rate limited
   */
  public checkLimit(req: NextApiRequest, success?: boolean): RateLimitInfo {
    const key = this.config.keyGenerator(req)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get or create user data
    let userData = rateLimitStore.get(key)
    if (!userData) {
      userData = { count: 0, resetTime: now + this.config.windowMs, requests: [] }
      rateLimitStore.set(key, userData)
    }

    // Clean old requests (sliding window)
    userData.requests = userData.requests.filter(req => req.timestamp > windowStart)

    // Check if we should count this request
    const shouldCount = success === undefined || 
      (!this.config.skipSuccessfulRequests || !success) &&
      (!this.config.skipFailedRequests || success)

    if (shouldCount) {
      // Check if limit exceeded
      if (userData.requests.length >= this.config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: userData.resetTime,
          totalRequests: userData.requests.length
        }
      }

      // Add this request
      userData.requests.push({ timestamp: now, success: success ?? true })
    }

    // Update reset time if needed
    if (now > userData.resetTime) {
      userData.resetTime = now + this.config.windowMs
    }

    rateLimitStore.set(key, userData)

    return {
      allowed: true,
      remaining: Math.max(0, this.config.maxRequests - userData.requests.length),
      resetTime: userData.resetTime,
      totalRequests: userData.requests.length
    }
  }

  /**
   * Create Express/Next.js middleware
   */
  public middleware() {
    return (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
      const limitInfo = this.checkLimit(req)

      // Set headers
      res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString())
      res.setHeader('X-RateLimit-Remaining', limitInfo.remaining.toString())
      res.setHeader('X-RateLimit-Reset', Math.ceil(limitInfo.resetTime / 1000).toString())
      res.setHeader('X-RateLimit-Window', Math.ceil(this.config.windowMs / 1000).toString())

      if (!limitInfo.allowed) {
        const retryAfter = Math.ceil((limitInfo.resetTime - Date.now()) / 1000)
        res.setHeader('Retry-After', retryAfter.toString())
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter
        })
      }

      if (next) {
        next()
      }
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  public reset(req: NextApiRequest): void {
    const key = this.config.keyGenerator(req)
    rateLimitStore.delete(key)
  }

  /**
   * Get current status for a key
   */
  public getStatus(req: NextApiRequest): RateLimitInfo {
    return this.checkLimit(req)
  }
}

/**
 * Predefined rate limiters for different use cases
 */
export const rateLimiters = {
  // Strict rate limiting for analysis endpoints
  analysis: new RateLimiter({
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,          // 10 requests per minute
    skipFailedRequests: true  // Don't count failed requests
  }),

  // General API rate limiting
  api: new RateLimiter({
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100          // 100 requests per minute
  }),

  // Strict rate limiting for expensive operations
  expensive: new RateLimiter({
    windowMs: 5 * 60 * 1000,  // 5 minutes
    maxRequests: 5            // 5 requests per 5 minutes
  }),

  // Authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5            // 5 attempts per 15 minutes
  })
}

/**
 * IP-based rate limiting with whitelist support
 */
export class IPRateLimiter extends RateLimiter {
  private whitelist: Set<string>
  private blacklist: Set<string>

  constructor(config: RateLimitConfig, whitelist: string[] = [], blacklist: string[] = []) {
    super(config)
    this.whitelist = new Set(whitelist)
    this.blacklist = new Set(blacklist)
  }

  private getIP(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for']
    const ip = forwarded 
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
      : req.socket.remoteAddress

    return ip || 'unknown'
  }

  public checkLimit(req: NextApiRequest, success?: boolean): RateLimitInfo {
    const ip = this.getIP(req)

    // Check blacklist
    if (this.blacklist.has(ip)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + this.config.windowMs,
        totalRequests: 0
      }
    }

    // Check whitelist
    if (this.whitelist.has(ip)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
        totalRequests: 0
      }
    }

    return super.checkLimit(req, success)
  }
}

/**
 * Utility function to apply rate limiting to API routes
 */
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  limiter: RateLimiter = rateLimiters.api
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const limitInfo = limiter.checkLimit(req)

         // Set headers
     res.setHeader('X-RateLimit-Limit', (limiter as any).config.maxRequests.toString())
     res.setHeader('X-RateLimit-Remaining', limitInfo.remaining.toString())
     res.setHeader('X-RateLimit-Reset', Math.ceil(limitInfo.resetTime / 1000).toString())

    if (!limitInfo.allowed) {
      const retryAfter = Math.ceil((limitInfo.resetTime - Date.now()) / 1000)
      res.setHeader('Retry-After', retryAfter.toString())
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      })
    }

    try {
      await handler(req, res)
      // Mark as successful request
      limiter.checkLimit(req, true)
    } catch (error) {
      // Mark as failed request
      limiter.checkLimit(req, false)
      throw error
    }
  }
}

/**
 * Clean up old rate limit data (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now && data.requests.length === 0) {
      rateLimitStore.delete(key)
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
} 