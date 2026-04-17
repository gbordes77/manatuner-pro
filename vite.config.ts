import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // 2026-04-17: bumped from 'es2015' to Vite 7's modern default.
    // Targets Baseline Widely Available (chrome107/edge107/firefox104/safari16)
    // — covers the browser footprint of MTG Arena/MTGO players. Smaller
    // bundles + native features instead of polyfills.
    target: 'baseline-widely-available',
    minify: 'esbuild',
    // CSS minified with lightningcss — more aggressive shorthand collapsing
    // and vendor-prefix stripping than esbuild's CSS minifier.
    cssMinify: 'lightningcss',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          'vendor-charts': ['recharts'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
    https: false,
  },
  preview: {
    port: 4173,
    host: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
    ],
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  worker: {
    format: 'es',
  },
})
