import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'ManaTuner Pro',
        short_name: 'ManaTuner',
        description: 'ManaTuner Pro - Advanced MTG Manabase Analysis Tool',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [
          // Scryfall API caching
          {
            urlPattern: /^https:\/\/api\.scryfall\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scryfall-api-cache',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          },
          // Card images caching
          {
            urlPattern: /^https:\/\/cards\.scryfall\.io\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'card-images-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 1 month
              }
            }
          },
          // Google Fonts caching
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Analysis results caching
          {
            urlPattern: /\/api\/analyze/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'analysis-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10
            }
          },
          // App shell caching
          {
            urlPattern: ({ request }: { request: any }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-shell',
              networkTimeoutSeconds: 3
            }
          }
        ],
        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true,
        // Clean up old caches
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: false // Disable in development for faster builds
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true, // Enable for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunk
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk
          material: ['@mui/material', '@mui/icons-material', '@mui/system'],
          // Charts chunk for analysis visualizations
          charts: ['recharts'],
          // Redux state management
          store: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          // Firebase/backend services (if used)
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions']
        }
      }
    },
    // Build optimizations
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    host: true,
    // Enable HTTP/2 for development
    https: false
  },
  preview: {
    port: 4173,
    host: true
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'recharts'
    ],
    exclude: [
      // Exclude workers from optimization
      '/workers/manaCalculator.worker.js'
    ]
  },
  // Worker configuration
  worker: {
    format: 'es'
  }
}) 