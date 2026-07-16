<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const transitionName = ref('page-fade')

const routeOrder = ['/', '/entries', '/entry-generator', '/about', '/friends', '/freebies']

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

   毛玻璃消失问题的真正根因：
   transform、filter 等属性会让应用它们的元素成为新的层叠上下文根，
   其子元素的 backdrop-filter 只能在这个根内部采样背景。而背景图是
   设在 <body> 上的（见 style.css），.page-wrapper 自身没有背景。
   动画期间 .page-wrapper 带有 transform，子元素的毛玻璃卡片就只能
   看到隔离层内部空空如也的内容，效果因此在动画期间"消失"，动画
   结束、transform 归零、隔离解除后才恢复正常。
   （之前只去掉了 filter: blur，但 transform 同样会触发隔离，
   所以问题并未真正解决。）

   修复思路：不放弃 transform（避免用 left/margin 做动画导致重排、
   性能变差），而是给 .page-wrapper 补一份背景（见下方 ::before），
   让隔离层内部本身就有内容可供毛玻璃采样。
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
  position: relative;
}

/* 补一份与 body 一致的背景，垫在页面内容之下。
   平时（无 transform 时）与 body 背景完全重叠，肉眼看不出差异；
   动画期间 .page-wrapper 成为层叠上下文根时，
   子元素的 backdrop-filter 就能在这个根内部采样到这份背景，
   而不是看到空白，从而在动画全程保持毛玻璃效果不消失。 */
.page-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
