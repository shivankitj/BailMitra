import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss  from 'tailwindcss'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    // host: 'aa53-2405-201-3003-b06a-3193-d044-4152-8320.ngrok-free.app',
    allowedHosts: true,
  }
})