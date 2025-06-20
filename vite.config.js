import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'playwright',
      'playwright-core',
      '@playwright/test',
      'chromium-bidi'
    ]
  },
  ssr: {
    noExternal: []
  },
  build: {
    rollupOptions: {
      external: [
        'playwright',
        'playwright-core',
        '@playwright/test'
      ]
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        'playwright.config.js',
        'vite.config.js'
      ]
    }
  }
}) 