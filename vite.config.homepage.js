import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite config for Homepage (Public-facing site)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173, // Homepage runs on port 5173
    strictPort: true,
    open: '/homepage' // Opens homepage by default
  },
  build: {
    outDir: 'dist-homepage',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
