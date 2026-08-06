<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { morphInFlight } from './composables/useSearchMorph'

const route = useRoute()
const transitionName = ref('page-fade')

const routeOrder = ['/', '/entries', '/entry-generator', '/about', '/friends', '/freebies']

watch(
  () => route.path,
  (to, from) => {
    // 搜索框克隆飞行期间跳过页面过渡，避免两套动画打架
    if (morphInFlight.value) {
      transitionName.value = 'page-morph'
      return
    }
    const toIdx = routeOrder.indexOf(to)
    const fromIdx = routeOrder.indexOf(from)
    if (toIdx > fromIdx) {
      transitionName.value = 'page-slide-left'
    } else if (toIdx < fromIdx) {
      transitionName.value = 'page-slide-right'
    } else {
      transitionName.value = 'page-fade'
    }
  }
)
</script>

<template>
  <div class="app-container">
    <Header />

    <div class="main-content">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" class="page-wrapper" />
        </transition>
      </router-view>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 64px;
  overflow: hidden;
}

/* ===== 页面切换动画 =====
   使用 mode="out-in"：旧页面先离开，新页面再进入

   注意：过渡里不要用 filter。祖先一旦有 filter 或 opacity < 1，
   按规范就会成为新的 backdrop root，子元素的 backdrop-filter
   会失去对页面背景的采样，全站玻璃在过渡期间集体塌成薄底色。
   opacity 是淡化必需的没法避开，但 blur 属于纯粹的额外伤害：
   既切断采样又把画面糊一层，两者叠加最难看，故移除。
*/

/* Fade（默认）*/
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.35s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* 向左滑入（前进）*/
.page-slide-left-enter-active,
.page-slide-left-leave-active {
  transition: opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.page-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

/* 向右滑入（后退）*/
.page-slide-right-enter-active,
.page-slide-right-leave-active {
  transition: opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
.page-slide-right-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* 页面容器 */
.page-wrapper {
  /* 移除 contain: layout，因为它会创建一个新的包含块，导致子元素的 fixed 定位相对于该容器而非视口 */
}

/* 搜索框飞行时的页面过渡 —— 只做轻柔淡化，不加位移和模糊，
   免得跟上方飞行的克隆体抢视觉焦点。
   0.18s + 0.22s = 0.4s，包在克隆飞行的 0.52s 之内，
   克隆还在半空时新页面已经安定，读起来像一个连续动作 */
.page-morph-leave-active {
  transition: opacity 0.18s ease-out;
}
.page-morph-enter-active {
  transition: opacity 0.22s ease-in;
}
.page-morph-enter-from,
.page-morph-leave-to {
  opacity: 0;
}
</style>
