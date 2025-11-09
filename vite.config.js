import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      include: '**/*.js' 
    })
  ],
  // 让 Vite 识别 .md 文件为静态资源
  assetsInclude: ['**/*.md'],
  server: {
    port: 3000,
    open: true,
    
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true, 
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
