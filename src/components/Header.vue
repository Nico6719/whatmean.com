<template>
  <header class="glass-header" :class="{ 'scrolled': scrolled && !isHome }">
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
            @click="toggleMobileMenu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="collapse d-md-none mt-2" :class="{ show: mobileMenuOpen }" id="navbarNav">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link" to="/" @click="closeMobileMenu">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/entries" @click="closeMobileMenu">词条</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about" @click="closeMobileMenu">关于</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/friends" @click="closeMobileMenu">友情链接</router-link>
          </li>
        </ul>
      </div>
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

@media (max-width: 768px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
