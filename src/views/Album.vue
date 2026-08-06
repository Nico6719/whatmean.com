<template>
  <div class="album-page">
    <!-- 页头 -->
    <section class="album-hero">
      <h1 class="album-hero-title">可爱小楠娘收集</h1>
      <p class="album-hero-subtitle">收藏小楠娘的每一个可爱瞬间，不定期更新。</p>
      <div class="album-hero-divider"></div>
      <p class="album-hero-count">{{ photos.length > 0 ? `已收录 ${photos.length} 张照片` : '相册整理中' }}</p>
    </section>

    <div class="container-fluid px-4 px-md-5 album-body">
      <!-- 标签筛选 -->
      <div v-if="allTags.length > 1" class="album-tagbar">
        <button
          v-for="tag in ['', ...allTags]"
          :key="tag || '__all__'"
          class="album-tag"
          :class="{ 'album-tag--active': activeTag === tag }"
          @click="activeTag = tag"
        >{{ tag || '全部' }}</button>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredPhotos.length === 0" class="album-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
        </svg>
        <p v-if="photos.length === 0">相册还是空的，往 album/ 目录添加 JSON 即可上架照片</p>
        <p v-else>没有「{{ activeTag }}」标签下的照片</p>
      </div>

      <!-- 瀑布流网格 -->
      <div v-else class="album-grid">
        <figure
          v-for="(photo, index) in filteredPhotos"
          :key="photo.id"
          class="album-card"
          @click="openLightbox(index)"
        >
          <img
            v-if="!isBroken(photo) && photo.image"
            :src="photo.image"
            :alt="photo.title"
            :title="photo.title"
            loading="lazy"
            @error="markBroken(photo)"
          />
          <div v-else class="album-card-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
            </svg>
            <span>暂无图片</span>
          </div>
          <figcaption class="album-card-caption">
            <h3 class="album-card-title">{{ photo.title }}</h3>
            <p v-if="photo.description" class="album-card-desc">{{ photo.description }}</p>
          </figcaption>
        </figure>
      </div>
    </div>

    <!-- 灯箱查看大图 -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div
          v-if="lightboxIndex !== null"
          class="album-lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="`查看照片：${currentPhoto?.title || ''}`"
          @click.self="closeLightbox"
        >
          <button class="album-lightbox-close" type="button" aria-label="关闭" @click="closeLightbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
          </button>

          <button
            v-if="filteredPhotos.length > 1"
            class="album-lightbox-nav album-lightbox-nav--prev"
            type="button"
            aria-label="上一张"
            @click.stop="goPrev"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
            </svg>
          </button>

          <figure class="album-lightbox-figure">
            <img
              v-if="!isBroken(currentPhoto) && currentPhoto?.image"
              :src="currentPhoto.image"
              :alt="currentPhoto.title"
            />
            <div v-else class="album-lightbox-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
              </svg>
              <span>图片加载失败或尚未设置</span>
            </div>
            <figcaption>
              <h3>{{ currentPhoto?.title }}</h3>
              <p v-if="currentPhoto?.description">{{ currentPhoto.description }}</p>
              <div v-if="currentTags.length" class="album-lightbox-tags">
                <span v-for="tag in currentTags" :key="tag">{{ tag }}</span>
              </div>
            </figcaption>
          </figure>

          <button
            v-if="filteredPhotos.length > 1"
            class="album-lightbox-nav album-lightbox-nav--next"
            type="button"
            aria-label="下一张"
            @click.stop="goNext"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </button>

          <span class="album-lightbox-counter">{{ lightboxIndex + 1 }} / {{ filteredPhotos.length }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useHead } from '@unhead/vue';
import { albumPhotos } from '../services/albums';
import { SITE_URL } from '../config/site';

useHead({
  title: '可爱小楠娘收集 - 何意味',
  link: [{ rel: 'canonical', href: `${SITE_URL}/albums` }],
  meta: [
    { name: 'description', content: '小楠娘的可爱照片收集，收录每一个值得收藏的可爱瞬间，不定期更新。' },
    { property: 'og:title', content: '可爱小楠娘收集 - 何意味' },
    { property: 'og:description', content: '小楠娘的可爱照片收集，收录每一个值得收藏的可爱瞬间。' },
    { property: 'og:url', content: `${SITE_URL}/albums` },
    { property: 'og:type', content: 'website' }
  ]
});

// 照片在编译期已内联，页面打开即得全部数据，无需请求
const photos = ref(albumPhotos);

const activeTag = ref('');
// 图片加载失败（含图床链接失效）的照片 id，换占位卡片而不是显示破图
const brokenIds = ref(new Set());

const splitTags = (tags) =>
  String(tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

const allTags = computed(() => {
  const set = new Set();
  photos.value.forEach((p) => splitTags(p.tags).forEach((t) => set.add(t)));
  return [...set];
});

const filteredPhotos = computed(() => {
  if (!activeTag.value) return photos.value;
  return photos.value.filter((p) => splitTags(p.tags).includes(activeTag.value));
});

const isBroken = (photo) => brokenIds.value.has(photo.id);
const markBroken = (photo) => {
  // 换新 Set 触发响应式：ref 包裹的 Set 直接 add 不会通知视图更新
  brokenIds.value = new Set(brokenIds.value).add(photo.id);
};

/* ===== 灯箱 ===== */
const lightboxIndex = ref(null);
const currentPhoto = computed(() =>
  lightboxIndex.value === null ? null : filteredPhotos.value[lightboxIndex.value]
);
const currentTags = computed(() => (currentPhoto.value ? splitTags(currentPhoto.value.tags) : []));

const openLightbox = (index) => {
  lightboxIndex.value = index;
};
const closeLightbox = () => {
  lightboxIndex.value = null;
};
// 上一张/下一张在筛选结果内循环
const goPrev = () => {
  const len = filteredPhotos.value.length;
  lightboxIndex.value = (lightboxIndex.value - 1 + len) % len;
};
const goNext = () => {
  const len = filteredPhotos.value.length;
  lightboxIndex.value = (lightboxIndex.value + 1) % len;
};

// 灯箱打开时锁住页面滚动，关闭时恢复
watch(lightboxIndex, (v) => {
  document.body.style.overflow = v !== null ? 'hidden' : '';
});

// 键盘导航：Esc 关闭，← / → 切换
const handleKeydown = (e) => {
  if (lightboxIndex.value === null) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') goPrev();
  else if (e.key === 'ArrowRight') goNext();
};
window.addEventListener('keydown', handleKeydown);
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.album-page {
  min-height: 100vh;
}

/* ===== 页头 ===== */
.album-hero {
  text-align: center;
  padding: 3.5rem 1rem 1.5rem;
}

.album-hero-title {
  color: #fff;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0 0 0.75rem;
}

.album-hero-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  margin: 0 0 1rem;
}

.album-hero-divider {
  width: 56px;
  height: 3px;
  margin: 0 auto 1rem;
  border-radius: 2px;
  background: linear-gradient(90deg, #0d6efd, #6f42c1);
}

.album-hero-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin: 0;
}

.album-body {
  max-width: 1500px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

/* ===== 标签筛选 ===== */
.album-tagbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 0 1.5rem;
}

.album-tag {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  padding: 0.4rem 1.1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.album-tag:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.album-tag--active {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.35);
}

.album-tag--active:hover {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  color: #fff;
}

/* ===== 瀑布流网格 ===== */
.album-grid {
  columns: 4 260px;
  column-gap: 1rem;
}

.album-card {
  break-inside: avoid;
  margin: 0 0 1rem;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: zoom-in;
  background: rgba(0, 0, 0, 0.30);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.30);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: albumFloatIn 0.6s ease-out;
}

.album-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.album-card img {
  width: 100%;
  display: block;
}

/* 底部渐变遮罩 + 标题，hover 展开描述 */
.album-card-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2.5rem 1rem 0.9rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
  color: #fff;
  pointer-events: none;
}

.album-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.album-card-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0.25rem 0 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.album-card:hover .album-card-desc {
  max-height: 3.2em;
  opacity: 1;
}

/* 图片缺失/加载失败时的占位卡片 */
.album-card-placeholder {
  aspect-ratio: 3 / 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.85rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
}

/* ===== 空状态 ===== */
.album-empty {
  text-align: center;
  padding: 3rem 1rem 5rem;
  color: rgba(255, 255, 255, 0.6);
}

.album-empty svg {
  opacity: 0.5;
  margin-bottom: 0.75rem;
}

.album-empty p {
  margin: 0;
  font-size: 1rem;
}

/* ===== 灯箱 ===== */
.album-lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(5, 10, 25, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.album-lightbox-figure {
  max-width: min(1100px, 92vw);
  max-height: 92vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #fff;
}

.album-lightbox-figure img {
  max-width: 100%;
  max-height: 72vh;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  object-fit: contain;
}

.album-lightbox-placeholder {
  width: min(680px, 88vw);
  aspect-ratio: 16 / 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
}

.album-lightbox-figure figcaption {
  text-align: center;
}

.album-lightbox-figure figcaption h3 {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.4rem;
}

.album-lightbox-figure figcaption p {
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.7;
  white-space: pre-line;
}

.album-lightbox-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.album-lightbox-tags span {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  padding: 0.25rem 0.85rem;
}

.album-lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.25s ease;
}

.album-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.album-lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: background 0.25s ease;
}

.album-lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.album-lightbox-nav--prev {
  left: max(1rem, calc(50% - min(1100px, 92vw) / 2 - 3.5rem));
}

.album-lightbox-nav--next {
  right: max(1rem, calc(50% - min(1100px, 92vw) / 2 - 3.5rem));
}

.album-lightbox-counter {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

@keyframes albumFloatIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .album-hero {
    padding-top: 2.5rem;
  }

  .album-hero-title {
    font-size: 1.7rem;
  }

  .album-lightbox-nav {
    width: 40px;
    height: 40px;
  }

  .album-lightbox-nav--prev {
    left: 0.5rem;
  }

  .album-lightbox-nav--next {
    right: 0.5rem;
  }
}
</style>
