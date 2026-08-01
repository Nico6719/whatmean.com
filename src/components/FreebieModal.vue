<template>
  <Teleport to="body">
    <!-- 遮罩 -->
    <div
      v-if="rendered"
      class="fbm-overlay"
      :class="{ 'fbm-overlay--active': overlayActive }"
      @click="closeModal"
    />

    <!-- 展开面板 -->
    <div
      v-if="rendered"
      ref="panel"
      class="fbm-panel"
      :style="panelStyle"
      @click.stop
    >
      <!-- 内容区 -->
      <div
        class="fbm-content"
        :class="{ 'fbm-content--show': contentVisible }"
        :style="contentStyle"
      >
        <!-- 顶部栏 -->
        <div class="fbm-topbar">
          <span class="fbm-badge">最新羊毛</span>
          <button class="fbm-close" @click="closeModal" aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 图标 -->
        <div class="fbm-icon-row">
          <div class="fbm-icon">
            <img
              v-if="freebie?.url && !faviconError"
              :src="getFavicon(freebie.url)"
              :alt="freebie?.name"
              class="fbm-favicon"
              @error="faviconError = true"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#93c5fd" viewBox="0 0 16 16">
              <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 .708.708L8 1.707l2.646 2.647a.5.5 0 0 0 .708-.708l-3-3z"/>
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
            </svg>
          </div>
        </div>

        <h2 class="fbm-title">{{ freebie?.name || '' }}</h2>
        <p class="fbm-desc">{{ freebie?.description || '' }}</p>

        <!-- 标签 -->
        <div v-if="freebie?.tags?.length" class="fbm-tags">
          <span class="fbm-tag" v-for="tag in freebie.tags" :key="tag">{{ tag }}</span>
        </div>

        <div class="fbm-divider" />

        <div class="fbm-section">
          <h3 class="fbm-section-label">网站地址</h3>
          <p class="fbm-url">{{ displayUrl }}</p>
        </div>

        <!-- 访问按钮 -->
        <a
          v-if="freebie?.url"
          :href="freebie.url"
          target="_blank"
          rel="noopener noreferrer"
          class="fbm-visit-btn"
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
      <Transition name="fbm-footer-fade">
        <div v-if="contentVisible && !isClosing" class="fbm-footer">
          <button class="fbm-footer-btn" @click="closeModal">关闭</button>
        </div>
      </Transition>

      <!-- 关闭动画时显示的仿卡片层 -->
      <div class="fbm-card-view" :style="cardViewStyle">
        <div class="fbm-card-view-inner" :style="{
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
            <img v-if="freebie?.url && !faviconError"
              :src="getFavicon(freebie.url)"
              :style="{ width: _isMobile() ? '24px' : '28px', height: _isMobile() ? '24px' : '28px', objectFit: 'contain', borderRadius: '6px' }"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" :width="_isMobile() ? '20' : '24'" :height="_isMobile() ? '20' : '24'" fill="#93c5fd" viewBox="0 0 16 16">
              <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 .708.708L8 1.707l2.646 2.647a.5.5 0 0 0 .708-.708l-3-3z"/>
            </svg>
          </div>
          <!-- 模拟文字 + 标签 -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; text-align: left;">
            <div :style="{ fontSize: _isMobile() ? '0.95rem' : '1rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }">{{ freebie?.name }}</div>
            <div :style="{ fontSize: _isMobile() ? '0.8rem' : '0.85rem', color: 'rgba(255, 255, 255, 0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }">{{ freebie?.description }}</div>
            <!-- 标签行（与真实卡片完全对齐） -->
            <div v-if="freebie?.tags?.length" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
              <span v-for="tag in freebie.tags" :key="tag" :style="{
                fontSize: '0.7rem', fontWeight: 600,
                padding: '2px 8px', borderRadius: '6px',
                background: 'rgba(147, 197, 253, 0.15)',
                color: '#93c5fd',
                border: '1px solid rgba(147, 197, 253, 0.2)',
                whiteSpace: 'nowrap', lineHeight: '1.4'
              }">{{ tag }}</span>
            </div>
          </div>
          <!-- 模拟箭头 -->
          <svg style="color: rgba(255,255,255,0.3); min-width:16px; margin-left:8px; flex-shrink:0;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
          </svg>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'FreebieModal',
  props: {
    isVisible:    { type: Boolean, default: false },
    freebie:      { type: Object,  default: () => ({}) },
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
  computed: {
    // 展示用地址：条目可用 displayUrl 覆盖，用于隐去链接上的参数
    displayUrl() {
      return this.freebie?.displayUrl || this.freebie?.url || ''
    }
  },
  watch: {
    isVisible(v) { v ? this._open() : this._close() },
    freebie()    { this.faviconError = false }
  },
  mounted() {
    if (this.isVisible) this._open()
  },
  beforeUnmount() { this._clearTimers() },
  methods: {
    closeModal() { this.$emit('close') },
    getFavicon(url) {
      try { return new URL(url).origin + '/favicon.ico' } catch { return '' }
    },
    _clearTimers() { this._timers.forEach(clearTimeout); this._timers = [] },
    _wait(ms) {
      return new Promise(r => { const id = setTimeout(r, ms); this._timers.push(id) })
    },
    _isMobile() { return window.innerWidth <= 768 },

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
      return { left: window.innerWidth/2-160, top: window.innerHeight/2-100, width: 320, height: 80, radius: 16 }
    },

    _targetRect() {
      const vw = window.innerWidth, vh = window.innerHeight
      if (vw <= 768) return { left: 8, top: 8, width: vw-16, height: vh-16, radius: 24 }
      const maxW = Math.min(560, vw-40)
      const maxH = Math.min(530, vh-40)
      return { left: Math.round((vw-maxW)/2), top: Math.round((vh-maxH)/2), width: maxW, height: maxH, radius: 28 }
    },

    _toStyle(r) {
      return { left: r.left+'px', top: r.top+'px', width: r.width+'px', height: r.height+'px', borderRadius: (r.radius??16)+'px' }
    },

    _morphTransition(dur) {
      return ['left','top','width','height','border-radius']
        .map(p => `${p} ${dur}s cubic-bezier(0.32,0.72,0,1)`).join(',')
    },

    _calcMobileTransform(src, dst) {
      return {
        scaleX: src.width/dst.width, scaleY: src.height/dst.height,
        tx: (src.left+src.width/2)-(dst.left+dst.width/2),
        ty: (src.top+src.height/2)-(dst.top+dst.height/2)
      }
    },

    _lockScroll() {
      document.addEventListener('wheel', this._preventScroll, { passive: false })
      document.addEventListener('keydown', this._preventKeyScroll)
      if (this._isMobile()) window.addEventListener('touchmove', this._preventScroll, { passive: false })
    },
    _unlockScroll() {
      document.removeEventListener('wheel', this._preventScroll)
      document.removeEventListener('keydown', this._preventKeyScroll)
      if (this._isMobile()) window.removeEventListener('touchmove', this._preventScroll)
    },
    _preventScroll(e) {
      if (!e.target.closest('.fbm-content')) e.preventDefault()
    },
    _preventKeyScroll(e) {
      if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)) e.preventDefault()
    },

    async _open() {
      this._clearTimers()
      this.contentVisible = false
      this.overlayActive  = false
      this.cardViewStyle  = { opacity: '0', pointerEvents: 'none' }
      this._lockScroll()

      const src = this._getCardRect()
      const dst = this._targetRect()

      if (this._isMobile()) {
        const { scaleX, scaleY, tx, ty } = this._calcMobileTransform(src, dst)
        this.contentStyle = { opacity: '0', transition: 'none' }
        this.panelStyle = { ...this._toStyle(dst), borderRadius: `${src.radius??16}px`, transform: `translate(${tx}px,${ty}px) scale(${scaleX},${scaleY})`, transformOrigin: 'center center', transition: 'none', willChange: 'transform,border-radius', opacity: '1' }
        this.rendered = true
        await this.$nextTick()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        this.overlayActive = true
        this.panelStyle = { ...this._toStyle(dst), borderRadius: `${dst.radius??24}px`, transform: 'translate(0,0) scale(1,1)', transformOrigin: 'center center', transition: `transform 0.45s cubic-bezier(0.32,0.72,0,1), border-radius 0.45s cubic-bezier(0.32,0.72,0,1)`, willChange: 'transform,border-radius', opacity: '1' }
        this.contentStyle = { opacity: '1', transition: 'opacity 0.35s cubic-bezier(0.32,0.72,0,1)' }
        this.contentVisible = true
        await this._wait(470)
        this.panelStyle = { ...this.panelStyle, willChange: 'auto' }
        this.contentStyle = {}
      } else {
        const scaleX0 = src.width/dst.width, scaleY0 = src.height/dst.height
        this.contentStyle = { transform: `scale(${scaleX0},${scaleY0})`, transformOrigin: 'top left', opacity: '0', transition: 'none' }
        this.panelStyle = { ...this._toStyle(src), transition: 'none', opacity: '1' }
        this.rendered = true
        await this.$nextTick()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        this.overlayActive = true
        const dur = 0.50
        this.panelStyle = { ...this._toStyle(dst), transition: this._morphTransition(dur), opacity: '1' }
        this.contentStyle = { transform: 'scale(1,1)', transformOrigin: 'top left', opacity: '1', transition: `transform ${dur}s cubic-bezier(0.32,0.72,0,1), opacity ${dur*0.8}s cubic-bezier(0.32,0.72,0,1)` }
        this.contentVisible = true
        await this._wait(Math.round(dur*1000)+20)
        this.contentStyle = {}
      }
    },

    async _close() {
      if (!this.rendered) return
      this._clearTimers()
      this.isClosing = true
      const src = this._getCardRect()
      const dur = 0.45
      this._unlockScroll()
      this.overlayActive = false
      this.contentStyle  = { opacity: '0', transition: `opacity ${dur*0.5}s cubic-bezier(0.32,0.72,0,1)` }
      this.cardViewStyle = { opacity: '1', pointerEvents: 'none', transition: `opacity ${dur*0.5}s cubic-bezier(0.32,0.72,0,1)` }
      this.panelStyle    = { ...this._toStyle(src), transition: this._morphTransition(dur), opacity: '1' }
      await this._wait(Math.round(dur*1000)+30)
      this.$emit('card-reveal')
      this.rendered      = false
      this.isClosing     = false
      this.panelStyle    = {}
      this.contentStyle  = {}
      this.cardViewStyle = { opacity: '0', pointerEvents: 'none' }
    }
  }
}
</script>

<style scoped>
.fbm-overlay {
  position: fixed; inset: 0; z-index: 2999;
  background: rgba(5,10,20,0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px);
  transition: background 0.35s ease, backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease;
  pointer-events: none;
}
.fbm-overlay--active {
  background: rgba(5,10,20,0.55); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  pointer-events: auto;
}

.fbm-panel {
  position: fixed; z-index: 3000; overflow: hidden;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(255,255,255,0.05);
  will-change: left,top,width,height,border-radius,opacity;
  transform-origin: center center;
}
.fbm-panel::before {
  content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.55) 70%, transparent);
  pointer-events: none; z-index: 1;
}

.fbm-content {
  position: absolute; inset: 0; z-index: 2;
  overflow-y: auto; padding: 20px 24px 80px;
  opacity: 0; pointer-events: none;
}
.fbm-content--show { opacity: 1; pointer-events: auto; }
.fbm-content::-webkit-scrollbar { width: 4px; }
.fbm-content::-webkit-scrollbar-track { background: transparent; }
.fbm-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 2px; }

.fbm-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.fbm-badge {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7); color: #fff;
  border-radius: 20px; padding: 0.3em 0.85em; font-size: 0.78rem; font-weight: 500;
  box-shadow: 0 4px 12px rgba(13,110,253,0.25);
}
.fbm-close {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.22); background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.85); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
}
.fbm-close:hover { background: rgba(255,80,80,0.32); border-color: rgba(255,120,120,0.45); transform: rotate(90deg); }

.fbm-icon-row { display: flex; justify-content: center; margin-bottom: 20px; }
.fbm-icon {
  width: 64px; height: 64px; background: rgba(255,255,255,0.1); border-radius: 16px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.15);
}
.fbm-favicon { width: 48px; height: 48px; object-fit: contain; }

.fbm-title { margin: 0 0 12px; font-size: 1.75rem; font-weight: 700; color: #fff; text-align: center; }
.fbm-desc  { margin: 0 0 16px; color: rgba(255,255,255,0.78); font-size: 1rem; line-height: 1.6; text-align: center; }

.fbm-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 20px; }
.fbm-tag {
  font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 8px;
  background: rgba(147,197,253,0.15); color: #93c5fd; border: 1px solid rgba(147,197,253,0.25);
}

.fbm-divider { height: 1px; background: rgba(255,255,255,0.12); margin: 0 0 24px; }
.fbm-section { margin-bottom: 24px; }
.fbm-section-label { margin: 0 0 10px; font-size: 0.74rem; font-weight: 600; color: rgba(255,255,255,0.40); text-transform: uppercase; letter-spacing: 0.08em; }
.fbm-url { margin: 0; color: #0d6efd; word-break: break-all; font-size: 0.95rem; }

.fbm-visit-btn {
  display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px;
  background: linear-gradient(45deg, #0d6efd, #0b5ed7); color: #fff; border-radius: 12px;
  text-decoration: none; font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 15px rgba(13,110,253,0.3);
}
.fbm-visit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13,110,253,0.4); }

.fbm-footer { position: absolute; bottom: 16px; right: 20px; z-index: 10; }
.fbm-footer-fade-enter-active { transition: opacity 0.2s ease; }
.fbm-footer-fade-leave-active { transition: opacity 0.15s ease; }
.fbm-footer-fade-enter-from, .fbm-footer-fade-leave-to { opacity: 0; }
.fbm-footer-btn {
  background: rgba(255,255,255,0.10); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.22); color: #fff; border-radius: 10px;
  padding: 6px 16px; cursor: pointer; transition: background 0.2s;
}
.fbm-footer-btn:hover { background: rgba(255,255,255,0.18); }

.fbm-card-view {
  position: absolute; inset: 0; z-index: 1; opacity: 0; pointer-events: none; overflow: hidden;
}
.fbm-card-view-inner {
  height: 100%; width: 100%; pointer-events: none;
  background: transparent !important; border: none !important; box-shadow: none !important;
  transform: none; overflow: hidden; display: block; position: relative;
}
.fbm-card-view-inner::before { display: none !important; }

@media (max-width: 768px) {
  .fbm-content { padding: 16px; }
  .fbm-title { font-size: 1.4rem; }
}
</style>
