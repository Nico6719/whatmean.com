import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'
import entryMergePlugin from './scripts/vite-plugin-entry-merge.js'
import prerenderPlugin from './scripts/vite-plugin-prerender.js'

// 站点规范地址，预渲染的 canonical / sitemap / JSON-LD 都以它为准
const SITE_URL = process.env.VITE_SITE_URL || 'https://xn--vqqq8jxym.com'

// demo / 预览环境置 true：整站注入 noindex 并禁止抓取，避免和生产站重复内容
const NOINDEX = process.env.VITE_NOINDEX === 'true'

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
    entryMergePlugin({
      entryDir: resolve(__dirname, 'entry'),
      outputFile: 'all-entrys.json'
    }),
    prerenderPlugin({
      entryDir: resolve(__dirname, 'entry'),
      siteUrl: SITE_URL,
      noindex: NOINDEX
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    /* 保持关闭，根因已实测确认（lightningcss 1.32.0）：
     *
     * 同一条规则里既有标准 backdrop-filter 又有 -webkit-backdrop-filter 时
     * （全站玻璃效果正是这种写法），lightningcss 会删掉标准属性只留 webkit 前缀。
     * 实测本站 CSS：backdrop-filter 由 12 处降到 3 处，且 safari9/chrome60、
     * safari14、无 targets 三种配置结果一致。Firefox 支持标准属性但不认
     * -webkit- 前缀，压了就等于全站玻璃在 Firefox 上塌成薄底色。
     *
     * 收益侧：压缩后 gzip 只省 3.6KB（37.1KB → 33.4KB），不值这个风险。
     *
     * rolldown-vite 不捆绑 esbuild，cssMinify: 'esbuild' 会直接报
     * "Cannot find package 'esbuild'"，所以没有第三种压缩器可选。
     *
     * 想拿回这部分收益的正路是：源码只写标准 backdrop-filter，去掉手写的
     * -webkit- 前缀（lightningcss 只写标准属性时能正确补前缀），再开压缩。
     * 那要动 76 处声明，风险独立，留作后续单独一次改动。
     */
    cssMinify: false,
    rollupOptions: {
      output: {
        // 带内容 hash：文件名固定成 index.js 时，发版后回访用户会
        // 一直用缓存里的旧文件，除非手动强刷。hash 变了浏览器才会重新拉。
        // 对外数据接口 all-entrys.json 由 entry-merge 插件用固定文件名
        // emit，不走这里的规则，公开地址保持稳定。
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  css: {
    postcss: './postcss.config.cjs'
  }
})
