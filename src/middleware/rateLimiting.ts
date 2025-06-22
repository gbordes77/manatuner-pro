import { NextApiRequest, NextApiResponse } from 'next';

// Interface pour le stockage des requêtes
interface RateLimitData {
  count: number;
  resetTime: number;
}

// Stockage en mémoire (pour production, utiliser Redis)
const rateLimitStore = new Map<string, RateLimitData>();

// Configuration du rate limiting
export interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxRequests: number; // Nombre maximum de requêtes par fenêtre
  keyGenerator?: (req: NextApiRequest) => string; // Générateur de clé personnalisé
  onLimitReached?: (req: NextApiRequest, res: NextApiResponse) => void;
}

// Configuration par défaut
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requêtes par 15 minutes
  keyGenerator: (req) => {
    // Utiliser l'IP comme clé par défaut
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    return ip || 'unknown';
  },
  onLimitReached: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(DEFAULT_CONFIG.windowMs / 1000)
    });
  }
};

// Fonction de nettoyage périodique
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Nettoyage automatique toutes les 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

// Middleware principal de rate limiting
export function createRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
    try {
      const key = finalConfig.keyGenerator!(req);
      const now = Date.now();
      
      // Récupérer ou créer les données de rate limit
      let rateLimitData = rateLimitStore.get(key);
      
      if (!rateLimitData || now > rateLimitData.resetTime) {
        // Créer une nouvelle fenêtre
        rateLimitData = {
          count: 1,
          resetTime: now + finalConfig.windowMs
        };
        rateLimitStore.set(key, rateLimitData);
      } else {
        // Incrémenter le compteur
        rateLimitData.count++;
      }

      // Ajouter les headers de rate limiting
      const remaining = Math.max(0, finalConfig.maxRequests - rateLimitData.count);
      const resetTime = Math.ceil(rateLimitData.resetTime / 1000);
      
      res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);

      // Vérifier si la limite est dépassée
      if (rateLimitData.count > finalConfig.maxRequests) {
        res.setHeader('Retry-After', Math.ceil((rateLimitData.resetTime - now) / 1000));
        
        if (finalConfig.onLimitReached) {
          finalConfig.onLimitReached(req, res);
          return;
        }
        
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          limit: finalConfig.maxRequests,
          windowMs: finalConfig.windowMs,
          retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
        });
      }

      // Continuer vers le handler suivant
      if (next) {
        next();
      }
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      
      // En cas d'erreur, laisser passer la requête (fail-open)
      if (next) {
        next();
      }
    }
  };
}

// Rate limiters prédéfinis pour différents endpoints
export const analysisRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 20, // 20 analyses par 10 minutes
  onLimitReached: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Analysis rate limit exceeded. Please wait before requesting another analysis.',
      message: 'This limit helps ensure fair usage and optimal performance for all users.',
      retryAfter: 600 // 10 minutes
    });
  }
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 tentatives de connexion par 15 minutes
  keyGenerator: (req) => {
    // Combiner IP et email pour les tentatives d'authentification
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    const email = req.body?.email || 'unknown';
    return `${ip}-${email}`;
  },
  onLimitReached: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again later.',
      retryAfter: 900 // 15 minutes
    });
  }
});

export const generalApiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requêtes générales par 15 minutes
});

// Fonction utilitaire pour appliquer le rate limiting
export function withRateLimit(
  rateLimiter: ReturnType<typeof createRateLimit>,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
      rateLimiter(req, res, async () => {
        try {
          await handler(req, res);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}

// Fonction pour obtenir les statistiques de rate limiting
export function getRateLimitStats(key: string): RateLimitData | null {
  return rateLimitStore.get(key) || null;
}

// Fonction pour réinitialiser le rate limit d'une clé
export function resetRateLimit(key: string): boolean {
  return rateLimitStore.delete(key);
}

// Fonction pour obtenir toutes les clés actives
export function getActiveKeys(): string[] {
  const now = Date.now();
  const activeKeys: string[] = [];
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now <= data.resetTime) {
      activeKeys.push(key);
    }
  }
  
  return activeKeys;
}

// Middleware pour les logs de rate limiting
export function logRateLimit(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Logger si c'est une réponse de rate limit
    if (res.statusCode === 429) {
      console.warn(`Rate limit exceeded for ${req.method} ${req.url}`, {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
} 