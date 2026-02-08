import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: mode !== 'production',
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1000KB (1MB)
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  },
}))
