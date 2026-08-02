import { ref } from 'vue'
import { cloneAsLayer, effectiveRadius } from './useSearchMorph'

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
 * Header 槽位锚点 { right, centerY, headerBottom }（视口坐标）
 *
 * right / centerY 决定停靠后的落点。只取右边缘不取宽度：槽位所在的
 * flex 组是右对齐的，右边缘不随槽位开合变化，因此折叠状态下量出来的
 * 值同样有效，不必等展开动画结束。
 *
 * headerBottom 是 Header 的下边缘，供 Entry.vue 推导停靠阈值。
 * 早先写死成常量，结果阈值区间没盖住搜索框在页面顶部的静止位置，
 * 滚回顶部时判不出该复位。改成实测，随 Header 高度自适应。
 */
export const dockAnchor = ref(null)

export const setDockAnchor = (anchor) => {
  dockAnchor.value = anchor
}

// 离开词条页时复位，避免停靠态泄漏到其他页面
export const resetDock = () => {
  docked.value = false
}

const canAnimate = () =>
  typeof Element.prototype.animate === 'function' &&
  !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

/* ===== 跨页面的停靠动画 =====
   停靠时搜索框是 fixed，但它仍是页面组件的后代。App.vue 的页面过渡会给
   .page-wrapper 加 transform，按规范祖先一有 transform，fixed 的包含块就
   从视口变成那个祖先 —— 搜索框被拽离 Header。而且整段动画都埋在页面
   0.38s 的淡入淡出底下，看得见时已经跑完了。

   所以进出词条页都不动真实元素：它只管隐身，另起一层 body 级克隆把动画
   演完。克隆挂在 body 下，不受任何祖先 transform 与 opacity 影响。 */

// 在飞的克隆浮层，同一时刻只留一个
let dockFlight = null

// 撤掉在飞的浮层，并把真实元素的可见性交还给 CSS
export const cancelDockFlight = () => {
  if (!dockFlight) return
  const { wrapper, anim, restore } = dockFlight
  dockFlight = null
  anim?.cancel()
  wrapper.remove()
  restore?.()
}

/**
 * 造一层 body 级 fixed 克隆，初始盖在 sourceEl 的当前位置上
 *
 * 克隆层自身宽度钉死、右缘贴住 wrapper：wrapper 改宽度时内容从左侧被裁
 * 掉，而不是整体压扁。这样观感与 Header 槽位一致，都是"从左边让位"。
 */
const makeDockClone = (sourceEl, rect) => {
  const wrapper = document.createElement('div')
  wrapper.setAttribute('aria-hidden', 'true')
  Object.assign(wrapper.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderRadius: `${effectiveRadius(sourceEl)}px`,
    overflow: 'hidden',
    zIndex: '1001',
    pointerEvents: 'none',
    willChange: 'left, width'
  })

  const layer = cloneAsLayer(sourceEl, 1)
  Object.assign(layer.style, {
    left: 'auto',
    right: '0',
    width: `${rect.width}px`
  })
  wrapper.appendChild(layer)
  document.body.appendChild(wrapper)
  return wrapper
}

// 展开态与收拢态。收拢态把左边缘推到右边缘处、宽度归零，
// 于是右缘固定不动，只有左缘在跑 —— 看起来就是从导航栏里抽出/收回。
const expandedFrame = (rect) => ({ left: `${rect.left}px`, width: `${rect.width}px` })
const collapsedFrame = (rect) => ({ left: `${rect.right}px`, width: '0px' })

const DOCK_ANIM_OPTS = { duration: DOCK_DURATION, easing: DOCK_EASING, fill: 'forwards' }

/**
 * 停靠态下离开词条页：搜索框收回导航栏
 *
 * 真实元素立即隐身随页面卸载，克隆演完收拢。同时立刻 resetDock()：
 * 复位若留在 onBeforeUnmount，out-in 模式下卸载发生在离场过渡结束之后，
 * 槽位会等页面走完才开始收，导航栏里先空一块。
 *
 * @param {HTMLElement} sourceEl 停靠中的搜索框
 */
export const flyDockOut = (sourceEl) => {
  cancelDockFlight()
  if (!docked.value || !sourceEl || !canAnimate()) {
    resetDock()
    return
  }

  const rect = sourceEl.getBoundingClientRect()
  const wrapper = makeDockClone(sourceEl, rect)
  // 真实元素随页面卸载，先隐身免得和克隆重影
  sourceEl.style.visibility = 'hidden'
  resetDock()

  const anim = wrapper.animate([expandedFrame(rect), collapsedFrame(rect)], DOCK_ANIM_OPTS)
  // 离场不必 restore：真实元素正在被卸载
  dockFlight = { wrapper, anim, restore: null }
  anim.finished.then(cancelDockFlight).catch(() => {})
}

/**
 * 进入词条页时已经该停靠：搜索框从导航栏里展开
 *
 * 调用前 docked 必须已置位、且等过一次 nextTick，这样真实元素已经落在
 * 槽位坐标上。
 *
 * @param {HTMLElement} sourceEl 已处于停靠坐标的搜索框
 * @param {DOMRect|Object} [targetRect] 展开后的终点。入场期间真实元素是
 *   过渡中页面的后代，祖先 transform 会污染实测坐标，由调用方按槽位锚点
 *   算出终点传进来；不传则退回实测。
 */
export const flyDockIn = (sourceEl, targetRect = null) => {
  cancelDockFlight()
  if (!docked.value || !sourceEl || !canAnimate()) return

  const rect = targetRect || sourceEl.getBoundingClientRect()
  if (!rect.width) return

  const wrapper = makeDockClone(sourceEl, rect)
  const restore = () => {
    sourceEl.style.visibility = ''
  }
  // 真实元素等克隆落位后再现身，中途由克隆代演
  sourceEl.style.visibility = 'hidden'

  const anim = wrapper.animate([collapsedFrame(rect), expandedFrame(rect)], DOCK_ANIM_OPTS)
  dockFlight = { wrapper, anim, restore }
  anim.finished.then(cancelDockFlight).catch(() => {})
}
