<template>
  <header class="glass-header">
    <div class="container-fluid px-4 px-md-5">
      <div class="d-flex justify-content-between align-items-center">
        <h1 class="h4 mb-0">
          <router-link to="/" class="text-white text-decoration-none">何意味.com</router-link>
        </h1>
        
        <div class="d-flex align-items-center">
          <div class="input-group me-3 d-none d-md-flex glass-search" style="width: 250px;">
            <input type="text" class="form-control form-control-sm" placeholder="搜索热梗..." aria-label="搜索热梗">
            <button class="btn btn-light text-primary" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </button>
          </div>
          
          <nav>
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
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.glass-header:hover {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.glass-search {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.glass-search:focus-within {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
  transition: all 0.3s ease;
}

.glass-search .btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.nav-link {
  font-weight: 500;
  position: relative;
  margin: 0 5px;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 8px 16px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-link.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 响应式调整 */
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