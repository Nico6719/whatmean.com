<template>
  <div class="home-page">
    <div class="container-fluid px-4 px-md-5 pt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div></div> <!-- 空的占位符，保持布局结构 -->
        <div>
          <!-- 搜索框 -->
          <div class="input-group w-100 w-md-auto">
            <input 
              type="text" 
              class="form-control liquid-glass-input" 
              placeholder="搜索词条..." 
              v-model="searchQuery"
              @input="handleSearch"
            >
            <button class="btn btn-primary" @click="handleSearch">搜索</button>
          </div>
        </div>
      </div>
      
      <!-- 居中的白色标题 -->
      <div class="row">
        <div class="col-12 text-center mb-4">
          <h1 class="text-white">网络热梗词条</h1>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="row justify-content-center">
        <div class="col-12 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="text-white mt-2">正在加载词条...</p>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-else-if="error" class="row justify-content-center">
        <div class="col-12 col-md-8 text-center">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">加载失败</h4>
            <p>{{ error }}</p>
            <button class="btn btn-primary" @click="fetchEntries">重试</button>
          </div>
        </div>
      </div>

      <!-- 词条列表 -->
      <div v-else class="row g-4">
        <div v-if="entries.length === 0" class="col-12 text-center">
          <p class="text-white">没有找到词条</p>
        </div>
        <div 
          class="col-xl-3 col-lg-4 col-md-6" 
          v-for="entry in entries" 
          :key="entry.id"
        >
          <div class="card h-100 liquid-glass-card meme-card">
            <div class="liquid-glass-card-hover">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="badge liquid-badge">热梗</div>
                  <small class="text-muted">{{ entry.year || '未知年份' }}</small>
                </div>
                <h3 class="card-title h5">{{ entry.name }}</h3>
                <p class="card-text">{{ entry.explanation }}</p>
                <div class="d-flex justify-content-between align-items-end flex-wrap gap-2" style="margin-top: auto; padding-top: 1rem;">
                  <div class="tags flex-grow-1">
                    <span 
                      v-for="(tag, index) in (entry.tags || '').split(',')" 
                      :key="index" 
                      class="badge tag-badge me-1"
                      v-show="tag.trim() !== ''"
                    >
                      {{ tag.trim() }}
                    </span>
                  </div>
                  <a href="#" class="btn btn-outline-primary btn-sm liquid-glass-btn" @click.prevent="showEntryDetail(entry, $event)" style="white-space: nowrap; flex-shrink: 0;">了解更多</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  
  <!-- 词条详情模态框 -->
  <MorphModal 
    :is-visible="showModal" 
    :entry="selectedEntry"
    :button-position="buttonPosition"
    @close="showModal = false"
  />
  <!-- 添加额外的间距 -->
  <div class="mb-5"></div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import entriesApi from '../services/api';
import MorphModal from '../components/MorphModal.vue';

const route = useRoute();

useHead({
  title: '网络热梗词条 - 何意味',
  meta: [
    { name: 'description', content: '浏览何意味收录的全部网络热梗词条，涵盖从早期经典到最新流行的各类网络文化符号。' },
    { property: 'og:title', content: '网络热梗词条 - 何意味' },
    { property: 'og:description', content: '浏览全部网络热梗词条，涵盖从早期经典到最新流行的各类网络文化符号。' },
    { property: 'og:url', content: 'https://xn--vqqq8jxym.com/entries' }
  ]
});

// 状态管理
const entries = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const originalEntries = ref([]);
const showModal = ref(false);
const selectedEntry = ref({});

// 显示词条详情
const buttonPosition = ref({ x: 0, y: 0, width: 0, height: 0 });
const showEntryDetail = (entry, event) => {
  // 获取点击按钮的位置信息
  const button = event.target.closest('.liquid-glass-btn');
  if (button) {
    const rect = button.getBoundingClientRect();
    buttonPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    };
  }
  selectedEntry.value = entry;
  showModal.value = true;
};

// 获取所有词条
const fetchEntries = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await entriesApi.getEntries();
    entries.value = data;
    originalEntries.value = data; // 保存原始数据用于搜索
  } catch (err) {
    error.value = err.response?.data?.message || '获取词条失败，请稍后重试';
    entries.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索词条
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    entries.value = originalEntries.value;
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    const data = await entriesApi.searchEntries(searchQuery.value);
    entries.value = data;
  } catch (err) {
    error.value = err.response?.data?.message || '搜索失败，请稍后重试';
    entries.value = [];
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q;
    handleSearch();
  } else {
    fetchEntries();
  }
});
</script>

<style scoped>
.meme-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: floatIn 0.6s ease-out;
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.liquid-glass-card {
  background: rgba(0, 0, 0, 0.30);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.liquid-glass-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.liquid-glass-card-hover {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
}

/* 深色背景下卡片内文字改为白色 */
.liquid-glass-card .card-title,
.liquid-glass-card h3,
.liquid-glass-card h5 {
  color: #ffffff;
  margin: 0.5rem 0;
}

.liquid-glass-card .card-text,
.liquid-glass-card p {
  color: rgba(255, 255, 255, 0.80);
  flex-grow: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin: 0;
}

.liquid-glass-card .text-muted,
.liquid-glass-card small {
  color: rgba(255, 255, 255, 0.55) !important;
}

.liquid-badge {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  color: white;
  border-radius: 20px;
  padding: 0.5em 1em;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
  transition: all 0.3s ease;
}

.liquid-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.35);
}

.tag-badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-weight: 500;
  padding: 0.4em 1em;
  margin-bottom: 0.3rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  position: relative;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.85);
}

.tag-badge::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: linear-gradient(45deg, rgba(255,255,255,0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tag-badge:hover {
  background: rgba(102, 51, 153, 0.4);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 6px 15px rgba(102, 51, 153, 0.2),
    inset 0 1px 8px rgba(255, 255, 255, 0.6),
    inset 0 -1px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
}

.tag-badge:hover::before {
  opacity: 1;
}

.liquid-glass-btn {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 18px;
  color: #fff !important;
  font-weight: 500;
  transition: transform 0.3s ease, background 0.3s ease;
  overflow: hidden;
  position: relative;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}

.liquid-glass-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.liquid-glass-btn:hover::before {
  opacity: 1;
}

.btn-outline-primary.liquid-glass-btn {
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.35);
}

.btn-outline-primary.liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.30);
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.55);
}

/* 搜索框样式 — 深色毛玻璃 */
.liquid-glass-input {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.20);
  border-right: none;
  border-radius: 20px 0 0 20px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  color: #fff;
  transition: all 0.3s ease;
}

.liquid-glass-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

.liquid-glass-input:focus {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.40);
  box-shadow: 0 0 0 0.15rem rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  outline: none;
  color: #fff;
}

.input-group .btn-primary {
  background: rgba(13, 110, 253, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.20);
  border-left: none;
  border-radius: 0 20px 20px 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  color: #fff;
  transition: all 0.3s ease;
}

.input-group .btn-primary:hover {
  background: rgba(13, 110, 253, 0.75);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

@keyframes floatIn {
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
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .g-4 {
    --bs-gutter-x: 1rem;
  }

  .liquid-glass-card {
    border-radius: 16px;
  }

  .meme-card {
    min-height: 300px;
  }

  .input-group {
    width: 100% !important;
  }

  .liquid-glass-input,
  .input-group .btn-primary {
    border-radius: 20px;
    height: 44px;
  }

  .input-group .btn-primary {
    padding: 0.5rem 1rem;
  }
}
</style>
