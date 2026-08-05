import { createApp } from 'vue'
import { createHead, VueHeadMixin } from '@unhead/vue/client'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.vue'
import router from './router'

const head = createHead()

createApp(App)
  .use(router)
  .use(head)
  // createHead() 的 install 只挂 $unhead / provide，不注册 mixin。
  // 页面里 Options API 的 head() 选项要靠这个 mixin 才会被读取，
  // 缺了它 About / Friends / Index / EntryGenerator 的 SEO 标签全不生效。
  .mixin(VueHeadMixin)
  .mount('#app')
