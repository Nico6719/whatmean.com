<template>
  <header class="glass-header" :class="{ 'scrolled': scrolled && !isHome, 'menu-open': mobileMenuOpen }">
    <div class="container-fluid px-4 px-md-5">
      <div class="d-flex justify-content-between align-items-center">
        <h1 class="h4 mb-0">
          <router-link to="/" class="brand-link text-decoration-none">何意味</router-link>
        </h1>
        
        <div class="d-flex align-items-center gap-2">
          <nav class="d-none d-md-block">
            <ul class="nav">
              <li class="nav-item">
                <router-link class="nav-link" to="/">首页</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/entries">词条</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/about">关于</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/friends">友情链接</router-link>
              </li>
            </ul>
          </nav>
          
          <button 
            class="navbar-toggler border-0 d-md-none" 
            type="button" 
            :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
            aria-label="切换导航菜单"
            @click="toggleMobileMenu"
          >
            <!-- 汉堡图标 -->
            <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>
            <!-- X 关闭图标 -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 移动端菜单：用 Transition 实现展开/收起动画 -->
      <Transition name="mobile-menu-drop">
        <div v-if="mobileMenuOpen" class="d-md-none mt-2" id="navbarNav">
          <ul class="nav flex-column mobile-nav-list">
            <li class="nav-item">
              <router-link class="nav-link mobile-nav-link" to="/" @click="closeMobileMenu">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link mobile-nav-link" to="/entries" @click="closeMobileMenu">词条</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link mobile-nav-link" to="/about" @click="closeMobileMenu">关于</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link mobile-nav-link" to="/friends" @click="closeMobileMenu">友情链接</router-link>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'Header',
  setup() {
    const route = useRoute()
    const isHome = computed(() => route.path === '/')
    return { isHome }
  },
  data() {
    return {
      mobileMenuOpen: false,
      scrolled: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    },
    handleResize() {
      if (window.innerWidth >= 768) {
        this.mobileMenuOpen = false;
      }
    },
    handleScroll() {
      this.scrolled = window.scrollY > 30;
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style scoped>
.glass-header {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom: 1px solid transparent;
  padding: 1rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition:
    background 0.4s ease,
    backdrop-filter 0.4s ease,
    -webkit-backdrop-filter 0.4s ease,
    border-color 0.4s ease,
    box-shadow 0.4s ease;
}

/* 已滚动 */
.glass-header.scrolled {
  background: rgba(15, 25, 50, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.28);
}

/* 菜单展开时也加毛玻璃背景 */
.glass-header.menu-open {
  background: rgba(15, 25, 50, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.28);
}

/* 品牌名颜色 */
.brand-link {
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: color 0.3s ease;
}

/* 导航链接颜色 */
.nav-link {
  color: #fff !important;
  font-weight: 500;
  position: relative;
  margin: 0 5px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  padding: 8px 16px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-link.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 移动端汉堡按钮 */
.navbar-toggler {
  background: none;
  border: none;
  outline: none;
  color: #fff;
  padding: 4px;
}

.navbar-toggler:focus {
  box-shadow: none;
}

/* ===== 移动端菜单项 ===== */
.mobile-nav-list {
  gap: 0;
  padding-bottom: 0.5rem;
}

.mobile-nav-link {
  margin: 0 !important;
  border-radius: 0 !important;
  padding: 0.8rem 0.5rem !important;
  background: none !important;
  box-shadow: none !important;
  transform: none !important;
  font-weight: 500;
}

.mobile-nav-link:hover {
  background: none !important;
  transform: none !important;
}

/* 当前激活页面 —— 仅加粗，不加背景 */
.mobile-nav-link.router-link-exact-active {
  background: none !important;
  box-shadow: none !important;
  transform: none !important;
  font-weight: 700;
}

/* ===== 展开/收起动画 ===== */
.mobile-menu-drop-enter-active,
.mobile-menu-drop-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  overflow: hidden;
}

.mobile-menu-drop-enter-from,
.mobile-menu-drop-leave-to {
  max-height: 0;
  opacity: 0;
}

.mobile-menu-drop-enter-to,
.mobile-menu-drop-leave-from {
  max-height: 280px;
  opacity: 1;
}

@media (max-width: 768px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
