import { createRouter, createWebHistory } from 'vue-router'

/*
 * 路由全部改为懒加载：原先 6 个页面在入口处静态 import，
 * 全站代码挤在一个 chunk 里，首页访客也要下载词条页、生成器、
 * 友链弹窗等一整套代码。改成动态 import 后各页面按需加载。
 */
const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/Index.vue')
  },
  {
    path: '/entries',
    name: 'Entry',
    component: () => import('../views/Entry.vue')
  },
  {
    // 词条独立地址。slug 取自 entry 目录的文件名，中文直接入 URL，
    // 构建期会为每个词条预渲染一份静态 HTML，搜索引擎可直接收录
    path: '/entry/:slug',
    name: 'EntryDetail',
    component: () => import('../views/EntryDetail.vue')
  },
  {
    path: '/entry-generator',
    name: 'EntryGenerator',
    component: () => import('../views/EntryGenerator.vue')
  },
  {
    path: '/albums',
    name: 'Album',
    component: () => import('../views/Album.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/friends',
    name: 'Friends',
    component: () => import('../views/Friends.vue')
  },
  {
    path: '/freebies',
    name: 'Freebies',
    component: () => import('../views/Freebies.vue')
  },
  {
    // 兜底：未匹配的路径以前是一片空白，什么提示都没有
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 换页回到顶部；浏览器前进后退时恢复原来的位置
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

export default router
