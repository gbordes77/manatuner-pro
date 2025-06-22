# 🚀 Guide de Déploiement Production - ManaTuner Pro

## 🎯 Checklist de Déploiement

### ✅ Pré-déploiement
- [ ] Tests mathématiques passent (9/9)
- [ ] Build de production réussit
- [ ] Aucune erreur TypeScript
- [ ] Performance Lighthouse > 90
- [ ] Sécurité validée (npm audit)
- [ ] Variables d'environnement configurées

### ✅ Déploiement
- [ ] Push sur branche main
- [ ] Déploiement Vercel automatique
- [ ] Tests de fumée sur production
- [ ] Monitoring activé
- [ ] Rollback plan préparé

---

## 🔧 Configuration Vercel

### vercel.json - Configuration Complète
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/workers/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "functions": {
    "src/pages/api/analyze.ts": {
      "maxDuration": 30
    }
  }
}
```

### Variables d'Environnement Production
```bash
# .env.production
VITE_APP_NAME=ManaTuner Pro
VITE_APP_VERSION=2.0.1
VITE_API_BASE_URL=https://manatuner-pro.vercel.app
VITE_ENVIRONMENT=production

# Analytics et Monitoring
VITE_VERCEL_ANALYTICS_ID=your-vercel-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
VITE_HOTJAR_ID=your-hotjar-id

# Fonctionnalités
VITE_ENABLE_MONTE_CARLO=true
VITE_ENABLE_ADVANCED_ANALYSIS=true
VITE_MAX_DECK_SIZE=250
VITE_RATE_LIMIT_REQUESTS=100

# Sécurité
VITE_ENABLE_CSP=true
VITE_ENABLE_RATE_LIMITING=true
VITE_CORS_ORIGINS=https://manatuner-pro.vercel.app
```

---

## 📦 Configuration Build Optimisée

### vite.config.ts - Production
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Optimisations de build
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    
    // Code splitting optimisé
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'chart-vendor': ['recharts'],
          
          // App chunks
          'math-engine': [
            './src/services/advancedMaths.ts',
            './src/services/manaCalculator.ts'
          ],
          'components': [
            './src/components/analysis',
            './src/components/common'
          ]
        }
      }
    },
    
    // Optimisations terser
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    }
  },
  
  // Optimisations des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      'recharts'
    ],
    exclude: [
      '@mui/icons-material'
    ]
  },
  
  // Résolution des chemins
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  
  // Configuration du serveur
  server: {
    port: 5173,
    host: true,
    cors: true
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    host: true
  }
});
```

### package.json - Scripts Production
```json
{
  "name": "manatuner-pro",
  "version": "2.0.1",
  "scripts": {
    "dev": "vite",
    "build": "npm run type-check && vite build",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist",
    "preview": "vite preview",
    
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:math": "vitest run src/services/__tests__/maths.critical.test.ts",
    
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:report": "playwright show-report",
    
    "deploy": "npm run build && vercel --prod",
    "deploy:preview": "npm run build && vercel",
    
    "audit:security": "npm audit --audit-level moderate",
    "audit:performance": "lighthouse http://localhost:4173 --output json --output-path ./lighthouse-report.json",
    
    "clean": "rm -rf dist node_modules/.vite",
    "clean:all": "rm -rf dist node_modules node_modules/.vite package-lock.json && npm install"
  }
}
```

---

## 🔒 Configuration Sécurité

### Content Security Policy
```typescript
// src/utils/security.ts
export const generateCSP = (): string => {
  const csp = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Requis pour Vite en dev
      "https://vercel.live",
      "https://vitals.vercel-insights.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Requis pour Material-UI
      "https://fonts.googleapis.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https://gatherer.wizards.com", // Images MTG
      "https://scryfall.com"
    ],
    'connect-src': [
      "'self'",
      "https://api.scryfall.com",
      "https://vercel.live",
      "https://vitals.vercel-insights.com"
    ],
    'worker-src': ["'self'", "blob:"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  };
  
  return Object.entries(csp)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};
```

### Rate Limiting API
```typescript
// src/middleware/rateLimiting.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const createRateLimit = (config: RateLimitConfig) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const clientId = getClientId(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Nettoie les anciennes entrées
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
    
    const clientData = rateLimitStore.get(clientId) || { count: 0, resetTime: now + config.windowMs };
    
    if (clientData.resetTime < now) {
      // Reset de la fenêtre
      clientData.count = 0;
      clientData.resetTime = now + config.windowMs;
    }
    
    clientData.count++;
    rateLimitStore.set(clientId, clientData);
    
    // Headers de rate limiting
    if (config.standardHeaders) {
      res.setHeader('RateLimit-Limit', config.max);
      res.setHeader('RateLimit-Remaining', Math.max(0, config.max - clientData.count));
      res.setHeader('RateLimit-Reset', new Date(clientData.resetTime).toISOString());
    }
    
    if (clientData.count > config.max) {
      return res.status(429).json({
        error: config.message,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    next();
  };
};

const getClientId = (req: NextApiRequest): string => {
  // Utilise l'IP + User-Agent pour identifier le client
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  
  return `${ip}-${Buffer.from(userAgent).toString('base64').slice(0, 10)}`;
};
```

---

## 📊 Monitoring et Analytics

### Configuration Vercel Analytics
```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';

export const VercelAnalytics = () => {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }
  
  return <Analytics />;
};

// Événements personnalisés
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', eventName, properties);
  }
};

// Événements spécifiques à ManaTuner Pro
export const trackDeckAnalysis = (deckSize: number, colors: string[], format: string) => {
  trackEvent('deck_analysis', {
    deck_size: deckSize,
    colors: colors.join(','),
    format
  });
};

export const trackRecommendationClick = (recommendation: string, context: string) => {
  trackEvent('recommendation_click', {
    recommendation,
    context
  });
};
```

### Configuration Sentry
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production' && process.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      environment: process.env.VITE_ENVIRONMENT,
      integrations: [
        new BrowserTracing({
          tracingOrigins: ['localhost', 'manatuner-pro.vercel.app'],
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
      ],
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Filtre les erreurs non critiques
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.type === 'ChunkLoadError') {
            return null; // Ignore les erreurs de chunk loading
          }
        }
        return event;
      }
    });
  }
};

// Hook pour capturer les erreurs React
export const SentryErrorBoundary = Sentry.withErrorBoundary;
```

---

## 🧪 Tests de Production

### Tests E2E Critiques
```typescript
// tests/e2e/production.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests', () => {
  test('Application loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Vérifie le chargement initial
    await expect(page.locator('h1')).toContainText('ManaTuner Pro');
    
    // Vérifie que les ressources critiques sont chargées
    const mathEngine = await page.evaluate(() => window.MathEngine);
    expect(mathEngine).toBeDefined();
  });
  
  test('Deck analysis workflow', async ({ page }) => {
    await page.goto('/analyzer');
    
    // Saisie d'un deck de test
    const deckInput = page.locator('[data-testid="deck-input"]');
    await deckInput.fill(`
      4 Lightning Bolt
      4 Scalding Tarn
      4 Steam Vents
      4 Island
      4 Mountain
    `);
    
    // Lance l'analyse
    await page.click('[data-testid="analyze-button"]');
    
    // Vérifie les résultats
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="probability-chart"]')).toBeVisible();
  });
  
  test('Performance metrics', async ({ page }) => {
    await page.goto('/');
    
    // Mesure les Core Web Vitals
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(2500); // LCP < 2.5s
  });
});
```

### Tests de Charge
```bash
#!/bin/bash
# load-test.sh

echo "🚀 Démarrage des tests de charge ManaTuner Pro"

# Test avec Artillery
npx artillery quick --count 100 --num 10 https://manatuner-pro.vercel.app

# Test des API endpoints
npx artillery quick --count 50 --num 5 https://manatuner-pro.vercel.app/api/analyze

echo "✅ Tests de charge terminés"
```

---

## 🔄 Procédure de Rollback

### Script de Rollback Automatique
```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔄 Démarrage du rollback ManaTuner Pro"

# Récupère le dernier déploiement stable
LAST_STABLE=$(vercel ls manatuner-pro --prod | grep "READY" | head -2 | tail -1 | awk '{print $2}')

if [ -z "$LAST_STABLE" ]; then
    echo "❌ Aucun déploiement stable trouvé"
    exit 1
fi

echo "📍 Rollback vers: $LAST_STABLE"

# Effectue le rollback
vercel rollback $LAST_STABLE --prod

# Vérifie que le rollback fonctionne
sleep 30
curl -f https://manatuner-pro.vercel.app/health || {
    echo "❌ Échec du rollback"
    exit 1
}

echo "✅ Rollback réussi vers $LAST_STABLE"

# Notification (optionnel)
if [ ! -z "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🔄 ManaTuner Pro rollback réussi vers $LAST_STABLE\"}" \
        $SLACK_WEBHOOK
fi
```

---

## 📋 Checklist Post-Déploiement

### Vérifications Immédiates
- [ ] Site accessible sur https://manatuner-pro.vercel.app
- [ ] Aucune erreur 500 dans les logs Vercel
- [ ] Performance Lighthouse > 90
- [ ] Fonctionnalités critiques opérationnelles
- [ ] Analytics Vercel collecte les données

### Vérifications 24h
- [ ] Aucune erreur Sentry critique
- [ ] Métriques de performance stables
- [ ] Taux d'erreur < 1%
- [ ] Temps de réponse API < 500ms

### Maintenance Continue
- [ ] Monitoring quotidien des erreurs
- [ ] Mise à jour des dépendances (mensuel)
- [ ] Audit de sécurité (hebdomadaire)
- [ ] Sauvegarde des configurations

---

## 🎯 Métriques de Succès

### KPIs Techniques
- **Disponibilité** : > 99.9%
- **Performance** : LCP < 2.5s, FID < 100ms
- **Erreurs** : Taux < 0.1%
- **Sécurité** : 0 vulnérabilité critique

### KPIs Utilisateur
- **Engagement** : Temps moyen > 3 minutes
- **Conversion** : Analyses complétées > 80%
- **Rétention** : Retour dans 7 jours > 30%

---

*Guide de déploiement généré le 22 juin 2025*
*ManaTuner Pro - Production Ready Configuration* 