import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite 6 설정.
 * - @tailwindcss/vite: PostCSS 없이 Tailwind v4를 Vite 플러그인으로 직접 처리
 * - proxy: 프론트엔드에서 /api/* 요청을 FastAPI 백엔드로 프록시
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
})
