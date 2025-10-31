import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite config for Admin Dashboard
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5174, // Admin runs on port 5174
    strictPort: true,
    open: '/admin-login' // Opens admin login by default
  },
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
