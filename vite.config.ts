import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    // Security: Disable directory listing
    fs: {
      strict: true,
    },
  },
  build: {
    // Security: Minify code in production
    minify: 'esbuild',
    // Generate source maps only in development
    sourcemap: mode !== 'production',
    // Remove console and debugger in production
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  },
}))
