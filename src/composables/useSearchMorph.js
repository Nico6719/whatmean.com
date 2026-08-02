import { ref } from 'vue'

const DURATION = 520
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'
// 目标页迟迟没上报坐标（跳转失败等）时的兜底清理时间
const FALLBACK_MS = 1500

/**
 * 克隆浮层是否正在飞行。两处消费：
 * - App.vue：飞行期间跳过 Vue 页面过渡，避免两套动画打架
 * - Entry.vue：目标搜索框据此在首帧就以隐藏状态渲染，
 *   否则 JS 补 visibility 赶不上浏览器绘制，会先闪一下真实搜索框
 */
export const morphInFlight = ref(false)

// 当前飞行状态：{ wrapper, timer }
let flight = null

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

const px = (v) => parseFloat(v) || 0

// input-group 这类容器自身没有圆角，圆角在子元素上，需要向下找一层
export const effectiveRadius = (el) => {
  let r = px(getComputedStyle(el).borderTopLeftRadius)
  if (r > 0) return r
  for (const child of el.children) {
    r = Math.max(r, px(getComputedStyle(child).borderTopLeftRadius))
  }
  return r
}

// cloneNode 不会复制 input 的实时 value（Vue 是通过 property 赋值的）
const copyInputValues = (source, clone) => {
  const from = source.querySelectorAll('input, textarea')
  const to = clone.querySelectorAll('input, textarea')
  from.forEach((el, i) => {
    if (to[i]) to[i].value = el.value
  })
}

// 克隆一层搜索框，撑满 wrapper；圆角交给 wrapper 裁剪，自身归零
export const cloneAsLayer = (source, opacity) => {
  const layer = source.cloneNode(true)
  copyInputValues(source, layer)
  Object.assign(layer.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    margin: '0',
    minWidth: '0',
    maxWidth: 'none',
    borderRadius: '0',
    animation: 'none',
    transition: 'none',
    visibility: 'visible',
    boxSizing: 'border-box',
    opacity: String(opacity)
  })
  return layer
}

const cleanup = () => {
  if (!flight) return
  const { wrapper, timer } = flight
  clearTimeout(timer)
  flight = null

  // 先放开标志位让 Vue 显现真实搜索框，等它渲染完再撤浮层，
  // 避免中间出现两者都不可见的空帧
  morphInFlight.value = false
  requestAnimationFrame(() => {
    requestAnimationFrame(() => wrapper.remove())
  })
}

export const cancelSearchMorph = cleanup

/**
 * 起飞：克隆源搜索框，以 fixed 覆盖在最上层
 * @returns {boolean} false 表示环境不支持，调用方按普通跳转处理
 */
export function beginSearchMorph(sourceEl) {
  if (!sourceEl || prefersReducedMotion() || typeof Element.prototype.animate !== 'function') {
    return false
  }
  cancelSearchMorph()

  const rect = sourceEl.getBoundingClientRect()
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
    zIndex: '9999',
    pointerEvents: 'none',
    willChange: 'left, top, width, height'
  })
  wrapper.appendChild(cloneAsLayer(sourceEl, 1))
  document.body.appendChild(wrapper)

  flight = { wrapper, timer: setTimeout(cleanup, FALLBACK_MS) }
  // 必须在路由跳转前置位，好让目标页首帧就把搜索框藏住
  morphInFlight.value = true
  return true
}

/**
 * 降落：目标页挂载后上报真实搜索框，克隆体飞过去并与目标外观交叉淡化
 */
export function finishSearchMorph(targetEl) {
  if (!flight || !targetEl) return
  clearTimeout(flight.timer)

  const { wrapper } = flight
  const from = wrapper.getBoundingClientRect()
  const to = targetEl.getBoundingClientRect()
  const toRadius = effectiveRadius(targetEl)

  const layerA = wrapper.firstElementChild
  // 目标此刻是 visibility: hidden（由 morphInFlight 驱动），
  // 克隆出来的 layerB 在 cloneAsLayer 里强制改回 visible
  const layerB = cloneAsLayer(targetEl, 0)
  wrapper.appendChild(layerB)

  const opts = { duration: DURATION, easing: EASING, fill: 'forwards' }

  layerA.animate([{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], opts)
  layerB.animate(
    [{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.85 }, { opacity: 1 }],
    opts
  )

  wrapper
    .animate(
      [
        {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          borderRadius: wrapper.style.borderRadius
        },
        {
          left: `${to.left}px`,
          top: `${to.top}px`,
          width: `${to.width}px`,
          height: `${to.height}px`,
          borderRadius: `${toRadius}px`
        }
      ],
      opts
    )
    .finished.then(cleanup)
    .catch(() => {})
}
