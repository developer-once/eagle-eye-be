import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        dir: "./dist/"
      }
    },
  },
  server: {
    proxy: {
      '/api/': {
        target: 'https://eagle.console.baishan.com',
        ws: false,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
