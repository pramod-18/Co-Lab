import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Allows access from other devices (or use '0.0.0.0')
    port: 5173,  // Default port (change if needed)
  }
})