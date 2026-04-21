import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  preview: {
    allowedHosts: true
  },
  server: {
    allowedHosts: true
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // 禁用 CSS 压缩，避免 lightningcss 误删 backdrop-filter 标准属性
    cssMinify: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  },
  css: {
    postcss: './postcss.config.cjs'
  }
})