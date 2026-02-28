import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    // Chunk size warning threshold
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },

  // Dev server: HTTPS option for testing camera locally
  // Uncomment to use self-signed cert (requires @vitejs/plugin-basic-ssl):
  // server: {
  //   https: true,
  //   host: true,
  // },
})
