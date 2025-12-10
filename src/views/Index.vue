<template>
  <div class="index-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container-fluid h-100 d-flex align-items-center">
        <div class="row w-100">
          <div class="col-12 text-center text-white">
            <h1 class="display-2 fw-bold mb-4 hero-title">何意味.com</h1>
            <p class="lead fs-3 mb-5 hero-subtitle">记录时代的网络文化符号</p>
            <div class="search-box liquid-glass-search mx-auto">
              <input 
                type="text" 
                class="form-control form-control-lg" 
                placeholder="搜索热梗词汇..."
                v-model="searchQuery"
                @keyup.enter="searchEntries"
              >
              <button class="btn btn-primary btn-lg ms-2 search-button" @click="searchEntries">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </button>
            </div>
            <div class="mt-4">
              <button class="btn btn-outline-light btn-lg me-3 explore-btn" @click="exploreEntries">
                浏览全部词条
              </button>
              <button class="btn btn-outline-light btn-lg submit-btn">
                提交新词条
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    searchEntries() {
      if (this.searchQuery.trim()) {
        this.$router.push(`/entries?q=${this.searchQuery}`);
      }
    },
    exploreEntries() {
      this.$router.push('/entries');
    }
  }
}
</script>

<style scoped>
.index-page {
  min-height: 100vh;
  background-color: transparent;
}

.hero-section {
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
              url('/background.png') center/cover no-repeat;
  position: relative;
}

.hero-title {
  animation: fadeInDown 1s ease;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  animation: fadeInUp 1s ease 0.3s both;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
}

.search-box {
  max-width: 600px;
  animation: fadeInUp 1s ease 0.6s both;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 50px;
  padding: 8px 15px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
}

.form-control {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.1rem;
  padding: 12px 20px;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.form-control:focus {
  box-shadow: none;
  color: white;
}

.search-button {
  border-radius: 30px;
  padding: 10px 25px;
  font-weight: bold;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.search-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}

.explore-btn, .submit-btn {
  border-radius: 30px;
  padding: 12px 30px;
  animation: fadeInUp 1s ease 0.9s both;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.explore-btn:hover, .submit-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.2);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-section {
    height: 70vh;
  }
  
  .display-2 {
    font-size: 2.5rem;
  }
  
  .fs-3 {
    font-size: 1.2rem;
  }
  
  .search-box {
    margin: 0 20px;
    flex-direction: column;
    border-radius: 25px;
    padding: 15px;
  }
  
  .search-button {
    margin-top: 10px;
    width: 100%;
  }
  
  .explore-btn, .submit-btn {
    margin: 5px;
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}
</style>