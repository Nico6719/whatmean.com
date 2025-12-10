import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Entry from '../views/Entry.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/entries',
    name: 'Entry',
    component: Entry
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router