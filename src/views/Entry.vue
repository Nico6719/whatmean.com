<template>
  <div class="home-page">
    <div class="container-fluid px-4 px-md-5 pt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div></div>
        <div>
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
      
      <div class="row">
        <div class="col-12 text-center mb-4">
          <h1 class="text-white">网络热梗词条</h1>
        </div>
      </div>

      <div v-if="loading" class="row justify-content-center">
        <div class="col-12 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="text-white mt-2">正在加载词条...</p>
        </div>
      </div>

      <div v-else-if="error" class="row justify-content-center">
        <div class="col-12 col-md-8 text-center">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">加载失败</h4>
            <p>{{ error }}</p>
            <button class="btn btn-primary" @click="fetchEntries">重试</button>
          </div>
        </div>
      </div>

      <div v-else class="row g-4">
        <div v-if="entries.length === 0" class="col-12 text-center">
          <p class="text-white">没有找到词条</p>
        </div>
        <div 
          class="col-xl-3 col-lg-4 col-md-6" 
          v-for="entry in entries" 
          :key="entry.id"
        >
          <div class="card h-100 liquid-glass-card meme-card" @click="showEntryDetail(entry, $event)" style="cursor: pointer;">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  <MorphModal
    :is-visible="showModal"
    :entry="selectedEntry"
    :card-rect="cardRect"
    :active-card-el="activeCardEl"
    @close="handleModalClose"
    @card-reveal="handleCardReveal"
  />
  <div class="mb-5"></div>
</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
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

const entries = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const originalEntries = ref([]);
const showModal = ref(false);
const selectedEntry = ref({});

const cardRect = ref(null);
const activeCardEl = ref(null);
const cardTimers = ref([]);

// 彻底清除卡片所有 inline style
const resetCard = (card) => {
  cardTimers.value.forEach(t => clearTimeout(t));
  cardTimers.value = [];
  if (card) {
    card.style.visibility = '';
    card.style.opacity = '';
    card.style.transition = '';
    card.style.transform = '';
  }
};

const showEntryDetail = (entry, event) => {
  const card = event.currentTarget.closest('.liquid-glass-card') || event.target.closest('.liquid-glass-card');

  if (activeCardEl.value && activeCardEl.value !== card) {
    resetCard(activeCardEl.value);
    activeCardEl.value = null;
  }

  if (card) {
    resetCard(card);

    // 临时取消 hover transform，确保坐标测量准确
    card.style.transition = 'none';
    card.style.transform = 'none';
    card.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    // 物理克隆源卡片内容，并深度抓取每一个子元素的精确样式
    const cardContent = card.innerHTML;
    
    // 抓取关键元素的精确像素样式，消除 rem/em 带来的偏差
    const getDeepStyles = (selector) => {
      const el = card.querySelector(selector);
      if (!el) return {};
      const s = window.getComputedStyle(el);
      return {
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        padding: s.padding,
        margin: s.margin,
        fontWeight: s.fontWeight,
        color: s.color
      };
    };

    // 抓取所有标签的精确样式
    const tagStyles = Array.from(card.querySelectorAll('.tag-badge')).map(tag => {
      const s = window.getComputedStyle(tag);
      return {
        fontSize: s.fontSize,
        padding: s.padding,
        margin: s.margin,
        borderRadius: s.borderRadius,
        display: s.display,
        width: s.width,
        height: s.height
      };
    });
    
    cardRect.value = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      borderRadius: 24,
      clonedHtml: cardContent,
      deepStyles: {
        body: getDeepStyles('.card-body'),
        title: getDeepStyles('.card-title'),
        text: getDeepStyles('.card-text'),
        tagsContainer: getDeepStyles('.tags'),
        tagStyles: tagStyles
      }
    };
    card.style.transform = '';
    card.style.transition = '';

    // 卡片淡出
    activeCardEl.value = card;
    card.style.transition = 'opacity 0.2s ease';
    card.style.opacity = '0';
    const t1 = setTimeout(() => {
      if (activeCardEl.value === card) {
        card.style.visibility = 'hidden';
      }
    }, 210);
    cardTimers.value.push(t1);
  } else {
    cardRect.value = null;
    activeCardEl.value = null;
  }

  selectedEntry.value = entry;
  showModal.value = true;
};

const handleModalClose = () => {
  showModal.value = false;
};

// MorphModal 在收缩动画完全结束后才 emit card-reveal
// 此处直接恢复卡片显示，不做淡入，避免任何重叠
const handleCardReveal = () => {
  if (!activeCardEl.value) return;

  const card = activeCardEl.value;
  cardTimers.value.forEach(t => clearTimeout(t));
  cardTimers.value = [];

  // 面板已完全消失，直接恢复卡片可见状态
  card.style.transition = 'none';
  card.style.transform = 'none';
  card.style.opacity = '1';
  card.style.visibility = 'visible';

  // 立即强制重绘
  card.offsetHeight;

  // 稍延迟后清除所有 inline style，确保过渡平滑
  const t = setTimeout(() => {
    card.style.transition = '';
    card.style.transform = '';
    card.style.opacity = '';
    card.style.visibility = '';
    activeCardEl.value = null;
  }, 30);
  cardTimers.value.push(t);
};

const fetchEntries = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await entriesApi.getEntries();
    entries.value = data;
    originalEntries.value = data;
  } catch (err) {
    error.value = err.response?.data?.message || '获取词条失败，请稍后重试';
    entries.value = [];
  } finally {
    loading.value = false;
  }
};

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

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q;
    handleSearch();
  } else {
    fetchEntries();
  }
});

onBeforeUnmount(() => {
  if (activeCardEl.value) resetCard(activeCardEl.value);
  cardTimers.value.forEach(t => clearTimeout(t));
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

@keyframes floatIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== 搜索框样式 — 深色毛玻璃 ===== */
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

@media (max-width: 768px) {
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
