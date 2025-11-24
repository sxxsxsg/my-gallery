import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 字符串简写写法
      '/api': {
        target: 'https://gallery.krystalc.top', // 在这里替换成您的真实网址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // 保持 /api 前缀
      }
    }
  }
})
