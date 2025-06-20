import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'playwright',
      'playwright-core',
      '@playwright/test',
      'chromium-bidi',
      'framer-motion'
    ],
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material'
    ]
  },
  ssr: {
    noExternal: []
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      external: [
        'playwright',
        'playwright-core',
        '@playwright/test',
        'chromium-bidi'
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'public/',
        'playwright-report/',
        'test-results/'
      ]
    }
  },
  define: {
    global: 'globalThis'
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
}) 