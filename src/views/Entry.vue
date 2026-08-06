<template>
  <div class="home-page">
    <div class="container-fluid px-4 px-md-5 pt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div></div>
        <div class="search-slot" ref="slotEl" :style="slotStyle">
          <!-- 不要加 w-100：那是 width:100%!important，会盖掉停靠时的内联宽度
               和 FLIP 的宽度动画。.input-group 自带 width:100%，无需补 -->
          <div
            class="input-group"
            ref="searchBoxEl"
            :class="{ 'is-docked': docked }"
            :style="[morphInFlight ? { visibility: 'hidden' } : null, dockedStyle]"
          >
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
        <!-- 广告A-何意味：占用一个词条卡片位 -->
        <div v-if="entries.length > 0" class="col-xl-3 col-lg-4 col-md-6">
          <div class="card h-100 liquid-glass-card ad-card">
            <ins class="adsbygoogle"
                 style="display:block;width:100%"
                 data-ad-client="ca-pub-8020398381754493"
                 data-ad-slot="2234470574"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>
        </div>
        <div
          class="col-xl-3 col-lg-4 col-md-6"
          v-for="entry in entries"
          :key="entry.id"
        >
          <!-- 卡片是真正的 <a href>，而不是带 @click 的 div：
               1) 键盘可达 —— Tab 能聚焦、回车能打开，以前完全打不开
               2) 爬虫可抓 —— 链接指向预渲染出来的词条详情页
               3) Ctrl / 中键点击能开新标签，符合用户对链接的预期
               普通左键点击仍然拦下来走弹窗，保持原有交互 -->
          <a
            class="card h-100 liquid-glass-card meme-card"
            :href="`/entry/${encodeURIComponent(entry.slug)}`"
            :aria-label="`查看词条 ${entry.name} 的详细介绍`"
            @click="showEntryDetail(entry, $event)"
          >
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
                      v-for="tag in splitTags(entry.tags)"
                      :key="tag"
                      class="badge tag-badge me-1"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </a>
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useHead } from '@unhead/vue';
import entriesApi from '../services/api';
import { loadAdSenseScript, pushAd } from '../services/adsense';
import MorphModal from '../components/MorphModal.vue';
import { SITE_URL } from '../config/site';
import { finishSearchMorph, cancelSearchMorph, morphInFlight } from '../composables/useSearchMorph';
import {
  docked,
  dockAnchor,
  resetDock,
  flyDockOut,
  flyDockIn,
  cancelDockFlight,
  DOCK_WIDTH,
  DOCK_DURATION,
  DOCK_EASING
} from '../composables/useSearchDock';

const route = useRoute();

useHead({
  title: '网络热梗词条 - 何意味',
  link: [{ rel: 'canonical', href: `${SITE_URL}/entries` }],
  meta: [
    { name: 'description', content: '浏览何意味收录的全部网络热梗词条，涵盖从早期经典到最新流行的各类网络文化符号。' },
    { property: 'og:title', content: '网络热梗词条 - 何意味' },
    { property: 'og:description', content: '浏览全部网络热梗词条，涵盖从早期经典到最新流行的各类网络文化符号。' },
    { property: 'og:url', content: `${SITE_URL}/entries` }
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
// 首页搜索框飞过来时的落点
const searchBoxEl = ref(null);

/* ===== 滚动停靠 =====
   搜索框快被固定 Header 盖住时，改为 fixed 贴进 Header 的槽位。

   停靠与复位共用一条基准线：Header 实测下边缘。不引入经验常数，
   免得基准线加上偏移后越过"页面顶部时的静止位置"，
   复位条件永远判不成立，搜索框卡在停靠态下不来。 */
const slotEl = ref(null);
// 停靠后搜索框脱离文档流，用它把原位的高度撑住，防止内容跳动
const lockedHeight = ref(0);
let dockAnim = null;

const slotStyle = computed(() =>
  docked.value && lockedHeight.value ? { height: `${lockedHeight.value}px` } : null
);

const dockedStyle = computed(() => {
  if (!docked.value || !dockAnchor.value) return null;
  const { right, centerY } = dockAnchor.value;
  return {
    position: 'fixed',
    left: `${right - DOCK_WIDTH}px`,
    top: `${centerY - lockedHeight.value / 2}px`,
    width: `${DOCK_WIDTH}px`,
    margin: '0',
    zIndex: '1001'
  };
});

const canAnimate = () =>
  typeof Element.prototype.animate === 'function' &&
  !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

/**
 * 本页的进入/离开过渡是否还在跑
 *
 * 直接量 .page-wrapper 的两个属性，因为 FLIP 在过渡期间失效的原因正是这两个：
 * - transform 非 none：按规范 fixed 的包含块从视口变成这个祖先，停靠坐标失准
 * - opacity < 1：动画整段埋在淡入底下，看得见时已经跑完
 *
 * 比"挂载后第一次判定"或计时器窗口可靠：不假设接口多快、滚动恢复在哪一帧，
 * 问的就是"此刻这两个坑在不在"。
 */
const pageTransitionActive = () => {
  const wrapper = slotEl.value?.closest('.page-wrapper');
  if (!wrapper) return false;
  const s = window.getComputedStyle(wrapper);
  return s.transform !== 'none' || parseFloat(s.opacity) < 1;
};

// FLIP：先记起点，切状态，再从起点动画到新位置
const setDocked = async (next, entering = false) => {
  const el = searchBoxEl.value;
  if (!el || docked.value === next) return;

  if (!lockedHeight.value) lockedHeight.value = el.offsetHeight;

  // 入场即停靠：没有"原位"可作为 FLIP 起点（页面刚出现，用户没见过它在
  // 页面里的样子），而且真实元素受祖先 transform 干扰。直接切到停靠态，
  // 再用 body 级克隆从槽位右缘展开，与离场的收拢正好对称。
  if (entering && next) {
    docked.value = true;
    await nextTick();
    // 搜索框飞行中：目标已被 morphInFlight 藏起等克隆降落，
    // 别再叠一层停靠克隆，两个浮层会打架
    if (morphInFlight.value) return;

    // 入场期间不要实测真实元素：它是过渡中页面的后代，祖先 transform
    // 会让 fixed 的包含块变成那个祖先，量出来的坐标带着过渡位移，
    // 克隆按它落位会在过渡结束时跳一下。改用锚点直接算终点 ——
    // 与 dockedStyle 同一组数字，落点自然和过渡结束后的真实位置重合。
    const anchor = dockAnchor.value;
    if (!anchor) return;
    const height = lockedHeight.value || el.offsetHeight;
    flyDockIn(el, {
      left: anchor.right - DOCK_WIDTH,
      top: anchor.centerY - height / 2,
      right: anchor.right,
      width: DOCK_WIDTH,
      height
    });
    return;
  }

  const from = el.getBoundingClientRect();

  docked.value = next;
  await nextTick();

  const to = el.getBoundingClientRect();
  dockAnim?.cancel();
  if (!canAnimate()) return;

  dockAnim = el.animate(
    [
      {
        transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`,
        width: `${from.width}px`
      },
      { transform: 'none', width: `${to.width}px` }
    ],
    { duration: DOCK_DURATION, easing: DOCK_EASING }
  );
};

const evaluateDock = () => {
  if (!slotEl.value) return;

  // 移动端不停靠：Header 槽位是 d-none，且窄屏没有横向空间
  if (window.innerWidth < 768 || !dockAnchor.value) {
    if (docked.value) setDocked(false);
    return;
  }
  // 停靠后原位占位仍随页面滚动，所以这个 rect 始终是"未停靠时该在哪"
  const rect = slotEl.value.getBoundingClientRect();
  const line = dockAnchor.value.headerBottom;

  // 两条阈值取同一条基准线（Header 下边缘），只是量搜索框的不同边：
  // 下边缘越过基准线 = 已被 Header 完全盖住，这时才停靠；
  // 上边缘退回基准线以下 = 完全露出来了，复位。
  // 滞回区自然等于搜索框自身高度，不需要额外的经验常数，
  // 也就不会出现阈值把静止位置顶出判定范围、导致复位判不出来的情况。
  if (!docked.value && rect.bottom < line) {
    /* 走克隆展开还是走 FLIP，两个条件任一成立就走克隆：

       1) 原位已滚出视口上方（rect.bottom <= 0）—— FLIP 的起点在屏幕外
          几百像素，动画会变成搜索框从上方远处飞进来
       2) 页面过渡还在跑 —— 祖先 transform 让 fixed 定位失准，opacity
          淡入把动画整段盖住，这正是"切回本页且不在顶部"命中的情形。
          浅滚动（scrollY 约 62~126）时原位还在视口里，条件 1 盖不住，
          得靠这条兜住

       都不成立就是用户在本页正常上下滚动，原位可见、页面已安定，
       FLIP 才是对的。

       判定不依赖"挂载后第一次"或计时器窗口：接口快慢、滚动恢复时机
       都不影响结论。 */
    setDocked(true, rect.bottom <= 0 || pageTransitionActive());
  } else if (docked.value && rect.top > line) {
    setDocked(false);
  }
};

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

// 标签串拆成数组并滤掉空项。
// 以前用 v-show 藏空标签，DOM 里仍然留着一堆空的 <span>
const splitTags = (tags) =>
  String(tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

const showEntryDetail = (entry, event) => {
  /* 带修饰键或非左键：不拦，让浏览器按真实链接处理（开新标签 / 新窗口）。
     只有普通左键点击才拦下来走弹窗动画。 */
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return;
  }
  event.preventDefault();

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
    // 列表填进来后页面才够高，重判一次。挂载时那次判定页面只有 spinner
    // 那么高，滚动位置够深也判不出该停靠
    await nextTick();
    evaluateDock();
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
    // 结果条数变了，页面高度跟着变，停靠条件可能已经不成立
    await nextTick();
    evaluateDock();
  }
};

onMounted(async () => {
  if (route.query.q) {
    searchQuery.value = route.query.q;
    handleSearch();
  } else {
    fetchEntries();
  }
  // 等 DOM 就位（含填好的搜索词）再上报落点，让浮层克隆飞过来
  await nextTick();
  finishSearchMorph(searchBoxEl.value);

  // 趁未停靠时量下高度，之后停靠要用它撑住原位
  if (searchBoxEl.value) lockedHeight.value = searchBoxEl.value.offsetHeight;
  window.addEventListener('scroll', evaluateDock, { passive: true });
  window.addEventListener('resize', evaluateDock);
  evaluateDock();

  // 投放 Google 广告
  loadAdSenseScript().then(pushAd).catch(() => {});
});

/* 停靠态下离开本页，交给 flyDockOut 演完收拢。
   用 onBeforeRouteLeave 而非 onBeforeUnmount：out-in 模式下卸载发生在
   离场过渡结束之后，那时才复位槽位，导航栏里会先空着一块慢慢合上。
   这个钩子在导航确认前触发，DOM 还完整，量得到停靠位置。 */
onBeforeRouteLeave(() => {
  // 先摘监听：页面此刻仍停在滚动位置，过渡期间任何 scroll/resize
  // 都会让 evaluateDock 判定该重新停靠，把刚收起的槽位又推开
  window.removeEventListener('scroll', evaluateDock);
  window.removeEventListener('resize', evaluateDock);
  // 停靠 FLIP 若还在半空，取消掉，rect 才是槽位里的最终落点
  dockAnim?.cancel();
  flyDockOut(searchBoxEl.value);
});

onBeforeUnmount(() => {
  if (activeCardEl.value) resetCard(activeCardEl.value);
  cardTimers.value.forEach(t => clearTimeout(t));
  cancelSearchMorph();

  window.removeEventListener('scroll', evaluateDock);
  window.removeEventListener('resize', evaluateDock);
  dockAnim?.cancel();
  // docked 是跨组件共享状态，离开页面必须复位，否则 Header 槽位一直开着
  resetDock();
});
</script>

<style scoped>
.meme-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: floatIn 0.6s ease-out;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  /* 卡片本体是 <a>（为了可抓取、可中键开新标签），得压掉链接默认样式。
     main.js 里 style.css 在 bootstrap 之前导入，所以 bootstrap 的
     a{text-decoration:underline;color:...} 后加载胜出，卡片标题和正文
     会带上下划线并被染成链接色 —— 原先是 <div> 时没这个问题。 */
  text-decoration: none;
  color: inherit;
}

.meme-card:hover,
.meme-card:focus {
  text-decoration: none;
  color: inherit;
}

/* 广告卡片：占用一个词条卡片位，视觉与词条卡片一致但无 hover 位移和点击态。
   广告素材本身是 Google 渲染的白底 iframe，无法被外部样式改色，
   所以留出深色内边距，把白广告作为卡片内嵌的圆角广告块，避免整块白色突兀。 */
.ad-card {
  min-height: 320px;
  padding: 12px;
  align-items: center;
  justify-content: center;
  cursor: default;
  animation: floatIn 0.6s ease-out;
}

.ad-card:hover {
  transform: none;
}

.ad-card .adsbygoogle {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
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

/* 停靠时搜索框转 fixed，这里保持右对齐并由内联 height 撑住原位高度 */
.search-slot {
  display: flex;
  justify-content: flex-end;
}

/* 停靠态：贴进 Header 后收窄圆角，与导航栏的紧凑观感一致 */
.is-docked .liquid-glass-input {
  border-radius: 16px 0 0 16px;
}
.is-docked .btn-primary {
  border-radius: 0 16px 16px 0;
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
