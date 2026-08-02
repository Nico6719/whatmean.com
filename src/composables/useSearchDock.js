import { ref } from 'vue'

/**
 * 词条页搜索框滚动停靠到 Header 导航栏
 *
 * 分工：
 * - Header 提供一个宽度可开合的槽位，并上报槽位的右边缘与垂直中心
 * - Entry.vue 根据滚动位置决定停靠与否，用 FLIP 把搜索框挪到槽位里
 *
 * 两边共用同一时长与缓动，槽位展开和搜索框飞行才会同步落位。
 */

export const DOCK_DURATION = 380
export const DOCK_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

// 停靠后的搜索框宽度，同时也是 Header 槽位展开后的宽度
export const DOCK_WIDTH = 280

// 是否处于停靠态，由 Entry.vue 写入、Header 读取
export const docked = ref(false)

/**
 * Header 槽位锚点 { right, centerY }（视口坐标）
 *
 * 只取右边缘和垂直中心，不取宽度：槽位所在的 flex 组是右对齐的，
 * 右边缘不随槽位开合变化，因此折叠状态下量出来的值同样有效，
 * 不必等展开动画结束。
 */
export const dockAnchor = ref(null)

export const setDockAnchor = (anchor) => {
  dockAnchor.value = anchor
}

// 离开词条页时复位，避免停靠态泄漏到其他页面
export const resetDock = () => {
  docked.value = false
}
