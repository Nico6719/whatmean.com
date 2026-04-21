<template>
  <div class="index-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container-fluid h-100 d-flex align-items-center justify-content-center">
        <div class="row w-100">
          <div class="col-12 text-center text-white">
            <h1 class="display-2 fw-bold mb-4 hero-title">何意味<span class="domain">.com</span></h1>
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
              <router-link to="/entry-generator" class="btn btn-outline-light btn-lg submit-btn">
                提交新词条
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useHead } from '@unhead/vue'

export default {
  name: 'Index',
  data() {
    return {
      searchQuery: ''
    }
  },
  head() {
    return {
      title: '何意味 - 网络热梗百科，记录时代的网络文化符号',
      meta: [
        { name: 'description', content: '何意味致力于收集、整理和传播中国互联网上的各类热门梗、流行语和网络文化现象。搜索和浏览海量网络炭梗。' },
        { property: 'og:title', content: '何意味 - 网络炭梗百科' },
        { property: 'og:description', content: '记录时代的网络文化符号。搜索和浏览海量网络炭梗。' },
        { property: 'og:url', content: 'https://xn--vqqq8jxym.com/' }
      ]
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
  /* 抵消 App.vue 统一的 64px padding-top，让 hero 保持真正全屏 */
  margin-top: -64px;
}

.hero-section {
  height: 100vh;
  min-height: 500px;
  /* 背景图由 body 提供，这里只加一层暗色遯层增强可读性 */
  background: linear-gradient(rgba(0, 0, 0, 0.40), rgba(0, 0, 0, 0.40));
  position: relative;
}

.hero-title {
  animation: fadeInDown 1s ease;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.domain {
  font-size: 0.6em;
  opacity: 0.85;
  margin-left: 0.1em;
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
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 50px;
  padding: 8px 15px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  position: relative;
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
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  position: relative;
}

.search-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.explore-btn, .submit-btn {
  border-radius: 30px;
  padding: 12px 30px;
  animation: fadeInUp 1s ease 0.9s both;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  /* 标准毛玻璃描边 */
  border: 1px solid rgba(255, 255, 255, 0.14);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
  position: relative;
}

.explore-btn:hover, .submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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
    height: 100vh;
    min-height: 500px;
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