<template>
  <Teleport to="body">
    <!-- 遮罩 -->
    <div
      v-if="rendered"
      class="fm-overlay"
      :class="{ 'fm-overlay--active': overlayActive }"
      @click="closeModal"
    />

    <!-- 展开面板 -->
    <div
      v-if="rendered"
      ref="panel"
      class="fm-panel"
      :style="panelStyle"
      @click.stop
    >
      <!-- 内容：展开完成后淡入，关闭前淡出 -->
      <div
        class="fm-content"
        :class="{ 'fm-content--show': contentVisible }"
      >
        <!-- 顶部栏 -->
        <div class="fm-topbar">
          <span class="fm-badge">友情链接</span>
          <button class="fm-close" @click="closeModal" aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 图标 + 名称 -->
        <div class="fm-icon-row">
          <div class="fm-icon">
            <img
              v-if="!faviconError"
              :src="getFavicon(friend?.url)"
              :alt="friend?.name"
              class="fm-favicon"
              @error="faviconError = true"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
              <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"/>
            </svg>
          </div>
        </div>

        <h2 class="fm-title">{{ friend?.name || '' }}</h2>
        <p class="fm-desc">{{ friend?.description || '' }}</p>

        <div class="fm-divider" />

        <div class="fm-section">
          <h3 class="fm-section-label">网站地址</h3>
          <p class="fm-url">{{ friend?.url || '' }}</p>
        </div>

        <!-- 访问按钮 -->
        <a
          v-if="friend?.url"
          :href="friend.url"
          target="_blank"
          rel="noopener noreferrer"
          class="fm-visit-btn"
          @click="closeModal"
        >
          前往访问
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-left:6px">
            <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
            <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
          </svg>
        </a>
      </div>

      <!-- 底部关闭按钮 -->
      <div v-if="contentVisible" class="fm-footer">
        <button class="fm-footer-btn" @click="closeModal">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'FriendModal',
  props: {
    isVisible:    { type: Boolean, default: false },
    friend:       { type: Object,  default: () => ({}) },
    activeCardEl: { type: Object,  default: () => null }
  },
  emits: ['close', 'card-reveal'],
  data() {
    return {
      rendered:       false,
      overlayActive:  false,
      contentVisible: false,
      panelStyle:     {},
      _timers:        [],
      faviconError:   false
    }
  },
  watch: {
    isVisible(v) { v ? this._open() : this._close() },
    friend() { this.faviconError = false }
  },
  mounted() {
    if (this.isVisible) this._open()
  },
  beforeUnmount() { this._clearTimers() },
  methods: {
    closeModal() { this.$emit('close') },
    getFavicon(url) {
      try {
        const origin = new URL(url).origin
        return `${origin}/favicon.ico`
      } catch {
        return ''
      }
    },
    _clearTimers() { this._timers.forEach(clearTimeout); this._timers = [] },
    _wait(ms) {
      return new Promise(r => { const id = setTimeout(r, ms); this._timers.push(id) })
    },

    _getCardRect() {
      if (this.activeCardEl) {
        const el = this.activeCardEl
        const origTransition = el.style.transition
        const origTransform  = el.style.transform
        el.style.transition = 'none'
        el.style.transform  = 'none'
        el.getBoundingClientRect()
        const r = el.getBoundingClientRect()
        el.style.transform  = origTransform
        el.style.transition = origTransition
        return { left: r.left, top: r.top, width: r.width, height: r.height, radius: 16 }
      }
      return {
        left:   window.innerWidth  / 2 - 160,
        top:    window.innerHeight / 2 - 100,
        width:  320, height: 80, radius: 16
      }
    },

    _targetRect() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (vw <= 768) {
        return { left: 0, top: 12, width: vw, height: vh - 24, radius: 20 }
      }
      const maxW = Math.min(560, vw - 40)
      const maxH = Math.min(460, vh - 40)
      return {
        left:   Math.round((vw - maxW) / 2),
        top:    Math.round((vh - maxH) / 2),
        width:  maxW,
        height: maxH,
        radius: 28
      }
    },

    _toStyle(r) {
      return {
        left:         r.left   + 'px',
        top:          r.top    + 'px',
        width:        r.width  + 'px',
        height:       r.height + 'px',
        borderRadius: (r.radius ?? 16) + 'px'
      }
    },

    _morphTransition(dur) {
      return ['left','top','width','height','border-radius']
        .map(p => `${p} ${dur}s cubic-bezier(0.32,0.72,0,1)`)
        .join(',')
    },

    _isMobile() { return window.innerWidth <= 768 },

    _calcMobileTransform(src, dst) {
      const scaleX = src.width  / dst.width
      const scaleY = src.height / dst.height
      const tx = (src.left + src.width  / 2) - (dst.left + dst.width  / 2)
      const ty = (src.top  + src.height / 2) - (dst.top  + dst.height / 2)
      return { scaleX, scaleY, tx, ty }
    },

    _clipRound(r) {
      return `inset(0 round ${r}px)`
    },

    _lockScroll() {
      /* 不使用 overflow:hidden（会覆盖 CSS 的 scrollbar-gutter:stable，导致右侧抖动）
         改为通过事件拦截阻止滚动，布局完全不受影响 */
      document.addEventListener('wheel', this._preventScroll, { passive: false })
      document.addEventListener('keydown', this._preventKeyScroll)
      if (this._isMobile()) {
        window.addEventListener('touchmove', this._preventScroll, { passive: false })
      }
    },
    _unlockScroll() {
      document.removeEventListener('wheel', this._preventScroll)
      document.removeEventListener('keydown', this._preventKeyScroll)
      if (this._isMobile()) {
        window.removeEventListener('touchmove', this._preventScroll)
      }
    },
    _preventScroll(e) {
      e.preventDefault()
    },
    _preventKeyScroll(e) {
      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']
      if (scrollKeys.includes(e.key)) e.preventDefault()
    },

    async _open() {
      this._clearTimers()
      this.contentVisible = false
      this.overlayActive  = false
      this._lockScroll()

      const src = this._getCardRect()
      const dst = this._targetRect()

      if (this._isMobile()) {
        const { scaleX, scaleY, tx, ty } = this._calcMobileTransform(src, dst)
        const srcRadius = src.radius ?? 16
        const dstRadius = dst.radius ?? 20
        // 直接用卡片圆角值（不补偿），transform scale 不影响 border-radius 的 CSS 值
        // 缩放状态下视觉圆角会偏大，但比方形好看，且过渡自然
        this.panelStyle = {
          ...this._toStyle(dst),
          borderRadius: `${srcRadius}px`,
          transform: `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'center center',
          transition: 'none',
          willChange: 'transform, border-radius',
          opacity: '1'
        }
        this.rendered = true
        await this.$nextTick()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

        this.overlayActive = true
        this.panelStyle = {
          ...this._toStyle(dst),
          borderRadius: `${dstRadius}px`,
          transform: 'translate(0, 0) scale(1, 1)',
          transformOrigin: 'center center',
          transition: `transform 0.45s cubic-bezier(0.32,0.72,0,1), border-radius 0.45s cubic-bezier(0.32,0.72,0,1)`,
          willChange: 'transform, border-radius',
          opacity: '1'
        }
        await this._wait(400)
        this.contentVisible = true
        this.panelStyle = { ...this.panelStyle, willChange: 'auto' }
      } else {
        this.panelStyle = {
          ...this._toStyle(src),
          transition: 'none',
          opacity: '1'
        }
        this.rendered = true
        await this.$nextTick()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

        this.overlayActive = true
        this.panelStyle = {
          ...this._toStyle(dst),
          transition: this._morphTransition(0.50),
          opacity: '1'
        }
        await this._wait(520)
        this.contentVisible = true
      }
    },

    async _close() {
      if (!this.rendered) return
      this._clearTimers()

      this.contentVisible = false
      await this._wait(150)

      if (this._isMobile()) {
        const src = this._getCardRect()
        const dst = this._targetRect()
        this.overlayActive = false
        const { scaleX, scaleY, tx, ty } = this._calcMobileTransform(src, dst)
        const srcRadius = src.radius ?? 16
        const dstRadius = dst.radius ?? 20
        this.panelStyle = {
          ...this._toStyle(dst),
          borderRadius: `${dstRadius}px`,
          transform: 'translate3d(0, 0, 0) scale(1, 1)',
          transformOrigin: 'center center',
          transition: 'none',
          willChange: 'transform, opacity',
          opacity: '1'
        }
        await this.$nextTick()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        this.panelStyle = {
          ...this._toStyle(dst),
          borderRadius: `${srcRadius}px`,
          transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'center center',
          transition: `transform 0.38s cubic-bezier(0.32,0.72,0,1), border-radius 0.38s cubic-bezier(0.32,0.72,0,1)`,
          willChange: 'transform'
        }
        await this._wait(360)
        this.$emit('card-reveal')
        this.panelStyle = {
          ...this._toStyle(dst),
          borderRadius: `${srcRadius}px`,
          transform: `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'center center',
          transition: 'opacity 0.22s ease',
          opacity: '0'
        }
        await this._wait(240)
        this._unlockScroll()
        this.rendered   = false
        this.panelStyle = {}
        return
      } else {
        /* 桌面端：先解锁滚动，让 scrollbar 复原后再测量卡片的"最终位置"。
           此时 panel 仍覆盖屏幕，用户无感。
           这样面板收缩的终点 = 卡片实际出现的位置，消除抽搐。 */
        this._unlockScroll()
        await new Promise(r => requestAnimationFrame(r))

        const src = this._getCardRect()
        this.overlayActive = false

        this.panelStyle = {
          ...this._toStyle(src),
          transition: this._morphTransition(0.40)
        }
        /* 等待时间须 >= transition 时长，否则中途换 transition 会弹跳 */
        await this._wait(420)
        this.$emit('card-reveal')
        this.panelStyle = {
          ...this._toStyle(src),
          transition: 'opacity 0.22s ease',
          opacity: '0'
        }
        await this._wait(240)
        this.rendered   = false
        this.panelStyle = {}
      }
    }
  }
}
</script>

<style scoped>
/* ===== 遮罩 ===== */
.fm-overlay {
  position: fixed;
  inset: 0;
  z-index: 2999;
  background: rgba(5, 10, 20, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  transition: background 0.35s ease,
              backdrop-filter 0.35s ease,
              -webkit-backdrop-filter 0.35s ease;
  pointer-events: none;
}
.fm-overlay--active {
  background: rgba(5, 10, 20, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  pointer-events: auto;
}

/* ===== 展开面板 ===== */
.fm-panel {
  position: fixed;
  z-index: 3000;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.5); 
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    rgba(0, 0, 0, 0.18) 0px 8px 32px 0px,
    rgba(255, 255, 255, 0.30) 0px 1px 0px 0px inset,
    rgba(255, 255, 255, 0.05) 0px -1px 0px 0px inset;
  will-change: transform, opacity;
}

.fm-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 8%; right: 8%;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(255,255,255,0.55) 30%,
    rgba(255,255,255,0.55) 70%,
    transparent);
  pointer-events: none;
  z-index: 1;
}

/* ===== 内容区 ===== */
.fm-content {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 20px 24px 80px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease;
}
.fm-content--show {
  opacity: 1;
  pointer-events: auto;
}
.fm-content::-webkit-scrollbar { width: 4px; }
.fm-content::-webkit-scrollbar-track { background: transparent; }
.fm-content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.25);
  border-radius: 2px;
}

/* ===== 顶部栏 ===== */
.fm-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.fm-badge {
  background: rgba(147, 197, 253, 0.18);
  color: #93c5fd;
  border-radius: 20px;
  padding: 0.3em 0.85em;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid rgba(147, 197, 253, 0.25);
  flex-shrink: 0;
}

/* ===== 关闭按钮 ===== */
.fm-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.2s ease;
}
.fm-close:hover {
  background: rgba(255, 80, 80, 0.32);
  border-color: rgba(255, 120, 120, 0.45);
  transform: rotate(90deg);
}

/* ===== 图标 ===== */
.fm-icon-row {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.fm-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(147, 197, 253, 0.15);
  border: 1px solid rgba(147, 197, 253, 0.25);
  color: #93c5fd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.fm-favicon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 10px;
}

/* ===== 标题 / 描述 ===== */
.fm-title {
  margin: 0 0 10px;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}
.fm-desc {
  margin: 0 0 20px;
  color: rgba(255,255,255,0.70);
  font-size: 0.95rem;
  line-height: 1.7;
  text-align: center;
}
.fm-divider {
  height: 1px;
  background: rgba(255,255,255,0.12);
  margin: 0 0 20px;
}

/* ===== 区块 ===== */
.fm-section { margin-bottom: 20px; }
.fm-section-label {
  margin: 0 0 8px;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.40);
}
.fm-url {
  margin: 0;
  color: #93c5fd;
  font-size: 0.88rem;
  word-break: break-all;
  line-height: 1.5;
}

/* ===== 访问按钮 ===== */
.fm-visit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #0d6efd, #4dabf7);
  color: #fff;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(13, 110, 253, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 4px;
}
.fm-visit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(13, 110, 253, 0.45);
  color: #fff;
}

/* ===== 底部关闭按钮 ===== */
.fm-footer {
  position: absolute;
  bottom: 20px;
  right: 24px;
  z-index: 10;
}
.fm-footer-btn {
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.90);
  border-radius: 12px;
  padding: 0.45em 1.2em;
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.20),
              inset 0 1px 0 rgba(255,255,255,0.18);
}
.fm-footer-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.38);
  transform: translateY(-1px);
}

/* ===== 移动端 ===== */
@media (max-width: 768px) {
  .fm-content { padding: 16px 16px 24px; }
  .fm-title   { font-size: 1.3rem; }
}
</style>
