import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './attached_assets'),
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
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Tiptap editor — only used in the admin panel, split into its own chunk
          if (id.includes('@tiptap')) return 'editor'
          // React core
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react'
          // Router
          if (id.includes('react-router-dom') || id.includes('react-router/')) return 'router'
          // Everything else from node_modules
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
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
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
