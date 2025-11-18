import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimizaciones para producción
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Separar chunks para mejor caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['styled-components', 'react-icons', 'react-hot-toast']
        }
      }
    },
    // Aumentar límite de chunk size para evitar warnings
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 4173,
    open: true,
    host: '0.0.0.0',
    allowedHosts: [
      'lottsa-terminal-system.onrender.com',
      '.onrender.com'
    ]
  }
})
