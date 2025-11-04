import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  base: '/chrome-ai-api-demo-react/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries - rarely change, excellent for caching
          'react-vendor': ['react', 'react-dom'],

          // Radix UI components - shared across features
          'radix-vendor': [
            '@radix-ui/react-icons',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
          ],

          // Icon library - shared across features
          'lucide-vendor': ['lucide-react'],

          // UI utilities and theme
          'ui-vendor': [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'next-themes',
            'sonner',
          ],
        },
      },
    },
    // Optimize chunk size for HTTP/2
    chunkSizeWarningLimit: 500,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Use esbuild for fast minification (default)
    minify: 'esbuild',
  },
})
