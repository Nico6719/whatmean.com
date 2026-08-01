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
      <!-- 内容：随面板同步出现，用 counter-scale 补偿面板变形 -->
      <div
        class="fm-content"
        :class="{ 'fm-content--show': contentVisible }"
        :style="contentStyle"
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
              v-if="friend?.url && !faviconError"
              :src="getFavicon(friend.url)"
              :alt="friend?.name"
              class="fm-favicon"
              @error="faviconError = true"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#93c5fd" viewBox="0 0 16 16">
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

      <!-- 底部关闭按钮：关闭动画期间立即隐藏 -->
      <Transition name="fm-footer-fade">
        <div v-if="contentVisible && !isClosing" class="fm-footer">
          <button class="fm-footer-btn" @click="closeModal">关闭</button>
        </div>
      </Transition>

      <!-- 关闭动画时显示的卡片简略内容层：重构为手动模板以确保布局稳定性 -->
      <div class="fm-card-view" :style="cardViewStyle">
        <div class="fm-card-view-inner" :style="{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: _isMobile() ? '0 18px' : '0 24px',
          flexDirection: 'row',
          flexWrap: 'nowrap'
        }">
          <!-- 模拟图标 -->
          <div :style="{
            width: _isMobile() ? '40px' : '44px',
            height: _isMobile() ? '40px' : '44px',
            minWidth: _isMobile() ? '40px' : '44px',
            flexShrink: 0,
            borderRadius: '12px',
            background: 'rgba(147, 197, 253, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginRight: '16px'
          }">
            <img v-if="friend?.url && !faviconError" :src="getFavicon(friend.url)" :style="{ width: _isMobile() ? '24px' : '28px', height: _isMobile() ? '24px' : '28px', objectFit: 'contain', borderRadius: '6px' }" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" :width="_isMobile() ? '20' : '24'" :height="_isMobile() ? '20' : '24'" fill="#93c5fd" viewBox="0 0 16 16">
              <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
              <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"/>
            </svg>
          </div>
          <!-- 模拟文字区 -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; text-align: left;">
            <div :style="{ fontSize: _isMobile() ? '0.95rem' : '1rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }">{{ friend?.name }}</div>
            <div :style="{ fontSize: _isMobile() ? '0.8rem' : '0.85rem', color: 'rgba(255, 255, 255, 0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }">{{ friend?.description }}</div>
          </div>
          <!-- 模拟箭头 -->
          <svg style="color: rgba(255, 255, 255, 0.3); min-width: 16px; margin-left: 8px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
          </svg>
        </div>
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
      isClosing:      false,
      panelStyle:     {},
      contentStyle:   {},
      cardViewStyle:  { opacity: '0', pointerEvents: 'none' },
      _timers:        [],
      faviconError:   false
    }
  },
  watch: {
    isVisible(v) { v ? this._open() : this._close() },
    friend() { this.faviconError = false }
  },
  updated() {
    this.$nextTick(() => {
      this._applyDeepStyles();
    });
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



    _applyDeepStyles() {
      const container = this.$refs.clonedContainer;
      const styles = this.friend?.deepStyles;
      if (!container || !styles) return;

      // 强制克隆卡片容器使用 Row 布局且不换行
      const card = container.querySelector('.friend-card');
      if (card) {
        card.style.setProperty('display', 'flex', 'important');
        card.style.setProperty('flex-direction', 'row', 'important');
        card.style.setProperty('flex-wrap', 'nowrap', 'important');
        card.style.setProperty('align-items', 'center', 'important');
        card.style.setProperty('padding', this._isMobile() ? '0 18px' : '0 24px', 'important');
      }

      // 修正选择器：与 Friends.vue 模板实际类名对齐
      const icon = container.querySelector('.friend-card-icon');
      if (icon && styles.icon) {
        icon.style.setProperty('width', styles.icon.width, 'important');
        icon.style.setProperty('height', styles.icon.height, 'important');
        icon.style.setProperty('min-width', styles.icon.width, 'important');
        icon.style.setProperty('flex-shrink', '0', 'important');
        icon.style.setProperty('margin', styles.icon.margin, 'important');
      }

      const info = container.querySelector('.friend-card-info');
      if (info) {
        info.style.setProperty('display', 'flex', 'important');
        info.style.setProperty('flex-direction', 'column', 'important');
        info.style.setProperty('flex', '1', 'important');
        info.style.setProperty('min-width', '0', 'important');
      }

      const name = container.querySelector('.friend-card-name');
      if (name && styles.name) {
        name.style.setProperty('font-size', styles.name.fontSize, 'important');
        name.style.setProperty('font-weight', styles.name.fontWeight, 'important');
        name.style.setProperty('margin', styles.name.margin, 'important');
        name.style.setProperty('color', styles.name.color, 'important');
        name.style.setProperty('white-space', 'nowrap', 'important');
      }

      const desc = container.querySelector('.friend-card-desc');
      if (desc && styles.desc) {
        desc.style.setProperty('font-size', styles.desc.fontSize, 'important');
        desc.style.setProperty('margin', styles.desc.margin, 'important');
        desc.style.setProperty('color', styles.desc.color, 'important');
      }

      const tags = container.querySelectorAll('.tag-badge');
      tags.forEach((tag, i) => {
        const s = styles.tagStyles[i];
        if (s) Object.assign(tag.style, { fontSize: s.fontSize, padding: s.padding, margin: s.margin, borderRadius: s.borderRadius, width: s.width, height: s.height, display: s.display, transition: 'none' });
      });
    },

    _targetRect() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (vw <= 768) {
        // 手机端适配逻辑
        return { left: 8, top: 8, width: vw - 16, height: vh - 16, radius: 24 }
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

    _lockScroll() {
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
      if (!e.target.closest('.fm-content')) e.preventDefault()
    },
    _preventKeyScroll(e) {
      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']
      if (scrollKeys.includes(e.key)) e.preventDefault()
    },

    async _open() {
      this._clearTimers()
      this.contentVisible = false
      this.overlayActive  = false
      this.cardViewStyle  = { opacity: '0', pointerEvents: 'none' } // 重置克隆层，防止快速打断残留
      this._lockScroll()

      const src = this._getCardRect()
      const dst = this._targetRect()

      if (this._isMobile()) {
        const { scaleX, scaleY, tx, ty } = this._calcMobileTransform(src, dst)
        const srcRadius = src.radius ?? 16
        const dstRadius = dst.radius ?? 20

        this.contentStyle = { opacity: '0', transition: 'none' }
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
        this.contentStyle = {
          opacity: '1',
          transition: 'opacity 0.35s cubic-bezier(0.32,0.72,0,1)'
        }
        this.contentVisible = true
        await this._wait(460)
        this.panelStyle = { ...this.panelStyle, willChange: 'auto' }
        this.contentStyle = {}
      } else {
        const scaleX0 = src.width  / dst.width
        const scaleY0 = src.height / dst.height

        this.contentStyle = {
          transform: `scale(${scaleX0}, ${scaleY0})`,
          transformOrigin: 'top left',
          opacity: '0',
          transition: 'none'
        }
        this.panelStyle = {
          ...this._toStyle(src),
          transition: 'none',
          opacity: '1'
        }
        this.rendered = true
        await this.$nextTick()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

        this.overlayActive = true
        const dur = 0.50
        this.panelStyle = {
          ...this._toStyle(dst),
          transition: this._morphTransition(dur),
          opacity: '1'
        }
        this.contentStyle = {
          transform: 'scale(1, 1)',
          transformOrigin: 'top left',
          opacity: '1',
          transition: `transform ${dur}s cubic-bezier(0.32,0.72,0,1), opacity ${dur * 0.8}s cubic-bezier(0.32,0.72,0,1)`
        }
        this.contentVisible = true
        await this._wait(Math.round(dur * 1000) + 20)
        this.contentStyle = {}
      }
    },

    async _close() {
      if (!this.rendered) return
      this._clearTimers()
      this.isClosing = true

      const src = this._getCardRect()
      const dst = this._targetRect()

      if (this._isMobile()) {
        // ===== 手机端：与桌面端相同，使用 left/top/width/height 形变收缩回卡片 =====
        const dur = 0.45

        this._unlockScroll()
        this.overlayActive = false

        // 详情层淡出，卡片层淡入
        this.contentStyle = {
          opacity: '0',
          transition: `opacity ${dur * 0.5}s cubic-bezier(0.32,0.72,0,1)`
        }
        this.cardViewStyle = {
          opacity: '1',
          pointerEvents: 'none',
          transition: `opacity ${dur * 0.5}s cubic-bezier(0.32,0.72,0,1)`
        }

        // 面板形变收缩，全程 opacity:1
        this.panelStyle = {
          ...this._toStyle(src),
          transition: this._morphTransition(dur),
          opacity: '1'
        }

        await this._wait(Math.round(dur * 1000) + 30)

        this.$emit('card-reveal')
        this.rendered      = false
        this.isClosing     = false
        this.panelStyle    = {}
        this.contentStyle  = {}
        this.cardViewStyle = { opacity: '0', pointerEvents: 'none' }
      } else {
        this._unlockScroll()
        const dur = 0.50

        this.overlayActive = false

        // 详情层淡出，卡片层淡入
        this.contentStyle = {
          opacity: '0',
          transition: `opacity ${dur * 0.5}s cubic-bezier(0.32,0.72,0,1)`
        }
        this.cardViewStyle = {
          opacity: '1',
          pointerEvents: 'none',
          transition: `opacity ${dur * 0.5}s cubic-bezier(0.32,0.72,0,1)`
        }

        // 面板形变收缩，全程 opacity:1
        this.panelStyle = {
          ...this._toStyle(src),
          transition: this._morphTransition(dur),
          opacity: '1'
        }

        await this._wait(Math.round(dur * 1000) + 30)

        this.$emit('card-reveal')
        this.rendered      = false
        this.isClosing     = false
        this.panelStyle    = {}
        this.contentStyle  = {}
        this.cardViewStyle = { opacity: '0', pointerEvents: 'none' }
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
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  /* 阴影与全局 style.css 中 .friend-card 严格一致 */
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.30),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  will-change: left, top, width, height, border-radius, opacity;
  transform-origin: center center;
}

/* 顶部高光线 —— 与 style.css 中 .friend-card::before 严格一致 */
.fm-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.55) 30%,
    rgba(255, 255, 255, 0.55) 70%,
    transparent
  );
  pointer-events: none;
  z-index: 1;
}

/* ===== 内容区 ===== */
.fm-content {
  position: absolute;
  inset: 0;
  z-index: 2; /* 内容层始终在克隆层之上，确保关闭按钮可点击 */
  overflow-y: auto;
  padding: 20px 24px 60px;
  opacity: 0;
  pointer-events: none;
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
  margin-bottom: 24px;
}
.fm-badge {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  color: #fff;
  border-radius: 20px;
  padding: 0.3em 0.85em;
  font-size: 0.78rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(13,110,253,0.25);
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
  transition: background 0.2s ease, transform 0.2s ease;
}
.fm-close:hover {
  background: rgba(255, 80, 80, 0.32);
  border-color: rgba(255, 120, 120, 0.45);
  transform: rotate(90deg);
}

/* ===== 图标区 ===== */
.fm-icon-row {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.fm-icon {
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.15);
}
.fm-favicon { width: 48px; height: 48px; object-fit: contain; }

/* ===== 标题 / 简介 ===== */
.fm-title {
  margin: 0 0 12px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
}
.fm-desc {
  margin: 0 0 24px;
  color: rgba(255,255,255,0.78);
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
}
.fm-divider {
  height: 1px;
  background: rgba(255,255,255,0.12);
  margin: 0 0 24px;
}

/* ===== 区块 ===== */
.fm-section { margin-bottom: 24px; }
.fm-section-label {
  margin: 0 0 10px;
  font-size: 0.74rem;
  font-weight: 600;
  color: rgba(255,255,255,0.40);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.fm-url {
  margin: 0;
  color: #0d6efd;
  word-break: break-all;
  font-size: 0.95rem;
}

/* ===== 访问按钮 ===== */
.fm-visit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 15px rgba(13,110,253,0.3);
}
.fm-visit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13,110,253,0.4);
}

/* ===== 底部关闭按钮 ===== */
.fm-footer {
  position: absolute;
  bottom: 16px;
  right: 20px;
  z-index: 10;
}

/* 关闭按钮淡入淡出 */
.fm-footer-fade-enter-active {
  transition: opacity 0.2s ease;
}
.fm-footer-fade-leave-active {
  transition: opacity 0.15s ease;
}
.fm-footer-fade-enter-from,
.fm-footer-fade-leave-to {
  opacity: 0;
}
.fm-footer-btn {
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  border-radius: 10px;
  padding: 6px 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.fm-footer-btn:hover { background: rgba(255, 255, 255, 0.18); }

@media (max-width: 768px) {
  .fm-content { padding: 16px; }
  .fm-title { font-size: 1.4rem; }
  .fm-card-view-inner :deep(.friend-card) {
    padding: 0 18px !important;
    height: 100% !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    display: flex !important;
    align-items: center !important;
  }
}

/* ===== 卡片视图层（关闭动画时显示） ===== */
.fm-card-view {
  position: absolute;
  inset: 0;
  z-index: 1; /* 克隆层在内容层之下 */
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}
.fm-card-view-inner {
  height: 100%;
  width: 100%;
  pointer-events: none;
  /* 强制清除自身的所有边框和阴影，避免与外层 fm-panel 叠加导致双重高光 */
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  transform: none;
  overflow: hidden;
  display: block;
  position: relative;
}
/* 同时清除自身的 ::before 高光线 */
.fm-card-view-inner::before {
  display: none !important;
}
/* 内部克隆层移除背景和阴影，避免与外层面板重叠导致加深或闪烁 */
.fm-card-view-inner :deep(.friend-card) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  backdrop-filter: none !important;
  margin: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0 !important;
  transition: none !important;
  position: absolute !important;
  inset: 0 !important;
  transform: none !important;
}
/* 子元素样式与原卡片严格对齐 */
.fm-card-view-inner :deep(.friend-card-icon) {
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;
  flex-shrink: 0 !important;
  border-radius: 12px !important;
  background: rgba(147, 197, 253, 0.15) !important;
  color: #93c5fd !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
}
.fm-card-view-inner :deep(.friend-favicon) {
  width: 28px !important;
  height: 28px !important;
  object-fit: contain !important;
  border-radius: 6px !important;
}
.fm-card-view-inner :deep(.friend-card-info) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  min-width: 0 !important;
}
.fm-card-view-inner :deep(.friend-card-name) {
  font-size: 1rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  margin: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.fm-card-view-inner :deep(.friend-card-desc) {
  font-size: 0.85rem !important;
  color: rgba(255, 255, 255, 0.55) !important;
  margin: 0 !important;
  line-height: 1.5 !important;
  overflow: hidden !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 1 !important;
  -webkit-box-orient: vertical !important;
}
.fm-card-view-inner :deep(.friend-card-arrow) {
  color: rgba(255, 255, 255, 0.3) !important;
  min-width: 16px !important;
  flex-shrink: 0 !important;
}
.fm-card-view-inner :deep(.friend-card-hover) {
  display: none !important;
}
.fm-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}
.fm-card-name {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}
.fm-card-desc {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
