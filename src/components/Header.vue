<template>
  <header class="glass-header">
    <div class="container-fluid px-4 px-md-5">
      <div class="d-flex justify-content-between align-items-center">
        <h1 class="h4 mb-0">
          <router-link to="/" class="text-white text-decoration-none">何意味.com</router-link>
        </h1>
        
        <div class="d-flex align-items-center">
          <!-- 桌面端导航菜单 -->
          <nav class="d-none d-md-block">
            <ul class="nav">
              <li class="nav-item">
                <router-link class="nav-link text-white" to="/">首页</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link text-white" to="/entries">词条</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link text-white" to="/about">关于</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link text-white" to="/friends">友情链接</router-link>
              </li>
            </ul>
          </nav>
          
          <!-- 移动端汉堡菜单按钮 -->
          <button 
            class="navbar-toggler border-0 d-md-none ms-2" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            @click="toggleMobileMenu"
          >
            <span class="navbar-toggler-icon text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
      
      <!-- 移动端折叠导航菜单 -->
      <div class="collapse d-md-none mt-2" :class="{ show: mobileMenuOpen }" id="navbarNav">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/" @click="closeMobileMenu">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/entries" @click="closeMobileMenu">词条</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/about" @click="closeMobileMenu">关于</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/friends" @click="closeMobileMenu">友情链接</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    }
  },
  mounted() {
    // 监听窗口大小变化，当窗口变大时关闭移动端菜单
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        this.mobileMenuOpen = false;
      }
    });
  }
}
</script>

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.glass-header:hover {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
}

.glass-search {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.glass-search:focus-within {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.03);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.glass-search .form-control {
  background: transparent;
  border: none;
  color: white;
  caret-color: white;
}

.glass-search .form-control::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.glass-search .form-control:focus {
  box-shadow: none;
  background: transparent;
}

.glass-search .btn {
  background: rgba(255, 255, 255, 0.25);
  border: none;
  border-radius: 24px;
  color: white;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.glass-search .btn:hover {
  background: rgba(255, 255, 255, 0.45);
  transform: scale(1.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.nav-link {
  font-weight: 500;
  position: relative;
  margin: 0 5px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  padding: 8px 16px;
  overflow: hidden;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.nav-link.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 移动端菜单样式 */
.glass-search-mobile {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass-search-mobile .form-control {
  background: transparent;
  border: none;
  color: white;
  caret-color: white;
}

.glass-search-mobile .form-control::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.navbar-toggler {
  background: none;
  border: none;
  outline: none;
}

.navbar-toggler:focus {
  box-shadow: none;
}

@media (max-width: 768px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .glass-search {
    width: 180px !important;
  }
}
</style>