import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5178,
    host: 'localhost',
    strictPort: true, // Fail if port is already in use
    open: false
  },
  preview: {
    port: 5178,
    host: 'localhost',
    strictPort: true
  }
})
