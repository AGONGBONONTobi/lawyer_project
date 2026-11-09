import path from "node:path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { validatePublicEnvironment } from './security/public-env.mjs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  validatePublicEnvironment({ ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env });
  return {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  }
})
