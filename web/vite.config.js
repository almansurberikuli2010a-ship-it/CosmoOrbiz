import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// В режиме разработки запросы /api уходят на FastAPI (python3 -m uvicorn server.app:app --port 8000).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
  build: { chunkSizeWarningLimit: 1500 },
  // поток расчёта орбит — ES-модуль (satellite.js использует top-level await)
  worker: { format: 'es' },
})
