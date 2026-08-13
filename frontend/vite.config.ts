import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 9005,
    proxy: {
      '/api': {
        target: 'http://backend:9004',
        changeOrigin: true,
      },
    },
  },
})
