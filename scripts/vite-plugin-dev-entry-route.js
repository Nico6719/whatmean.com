/**
 * dev 专用：让 /entry/<slug> 走 Vue 路由，而不是被同名目录截走。
 *
 * 项目根目录有个真实的 entry/ 文件夹（48 个词条 JSON），而前台路由也是
 * /entry/:slug。dev 服务器以项目根为静态根，静态文件解析优先于 SPA 回退，
 * 于是 /entry/栓Q 被解析成 entry/栓Q.json，以 text/javascript 返回一段
 * ESM 源码 —— 详情页在 dev 下完全打不开。
 *
 * 生产没有这个问题：entry/ 不会被拷进 dist，dist/entry/ 里只有预渲染出来的
 * <slug>/index.html。所以这个插件只在 serve 时挂载。
 *
 * 只拦「无扩展名」的路径，entry/*.json 的直接访问不受影响。
 */
export default function devEntryRoutePlugin() {
  return {
    name: 'vite-plugin-dev-entry-route',
    apply: 'serve',

    // 写在 configureServer 函数体里（而非 return 一个函数）才会排在
    // Vite 内建中间件之前，否则静态文件中间件已经先把请求处理掉了。
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '').split('?')[0]
        const decoded = (() => {
          try {
            return decodeURIComponent(pathname)
          } catch {
            return pathname
          }
        })()

        // /entry/xxx 且 xxx 里没有点号（即没有扩展名）→ 交给 SPA
        if (/^\/entry\/[^/]+\/?$/.test(decoded) && !/\.[a-z0-9]+$/i.test(decoded)) {
          req.url = '/index.html'
        }

        next()
      })
    }
  }
}
