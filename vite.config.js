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
      'framer-motion',
      'fsevents'
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
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      external: [
        'playwright',
        'playwright-core',
        '@playwright/test',
        'chromium-bidi',
        'fsevents'
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    },
    chunkSizeWarningLimit: 1500,
    outDir: 'dist'
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
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"'
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    logOverride: {
      'use client': 'silent'
    }
  },
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
}) 