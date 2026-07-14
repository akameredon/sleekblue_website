import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      jpeg: { quality: 72 },
      jpg: { quality: 72 },
      png: { quality: 72, compressionLevel: 9 },
      webp: { lossless: false, quality: 72 },
      logStats: true,
    }),
  ],
  cacheDir: '../.vitecache',
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, '../attached_assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
