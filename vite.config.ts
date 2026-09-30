import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 로컬 네트워크(동일 와이파이 스마트폰) 접속 허용
  },
})
