<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const transitionName = ref('page-fade')

const routeOrder = ['/', '/entries', '/entry-generator', '/about', '/friends']

watch(
  () => route.path,
  (to, from) => {
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
   注意：不要在 .page-wrapper（祖先元素）上使用 filter。
   页面内部大量子组件依赖 backdrop-filter 实现毛玻璃效果，
   而祖先一旦带有 filter，会为其建立新的层叠上下文，
   导致子元素的 backdrop-filter 无法正确采样到页面背景，
   毛玻璃效果会在动画期间"消失"，动画结束、filter 恢复为
   none 后才复原。因此这里只用 opacity + transform 过渡。
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
</style>
