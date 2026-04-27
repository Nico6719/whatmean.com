<template>
  <Teleport to="body">
    <!-- 遮罩 -->
    <div
      v-if="rendered"
      class="cex-overlay"
      :class="{ 'cex-overlay--active': overlayActive }"
      @click="closeModal"
    />

    <!-- 展开面板 -->
    <div
      v-if="rendered"
      ref="panel"
      class="cex-panel"
      :style="panelStyle"
      @click.stop
    >
      <!-- 内容：展开完成后淡入，关闭前淡出 -->
      <div
        class="cex-content"
        :class="{ 'cex-content--show': contentVisible }"
      >
        <!-- 顶部栏：徽章左 + 关闭按钮右 -->
        <div class="cex-topbar">
          <span class="cex-badge">热梗</span>
          <button class="cex-close" @click="closeModal" aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <h2 class="cex-title">{{ entry?.name || '' }}</h2>
        <p class="cex-year-line">{{ entry?.year || '' }}</p>
        <p class="cex-desc">{{ entry?.explanation || '' }}</p>

        <div class="cex-divider" />

        <div v-if="entry?.detail || entry?.['详细介绍']" class="cex-section">
          <h3 class="cex-section-label">详细介绍</h3>
          <p class="cex-section-text">{{ entry?.detail || entry?.['详细介绍'] }}</p>
        </div>

        <div class="cex-section">
          <h3 class="cex-section-label">基本信息</h3>
          <div class="cex-meta">
            <div class="cex-meta-row">
              <span class="cex-meta-key">词条名称</span>
              <span class="cex-meta-val">{{ entry?.name || '暂无' }}</span>
            </div>
            <div class="cex-meta-row">
              <span class="cex-meta-key">所属年份</span>
              <span class="cex-meta-val">{{ entry?.year || '未知' }}</span>
            </div>
            <div v-if="entry?.['提交时间']" class="cex-meta-row">
              <span class="cex-meta-key">提交时间</span>
              <span class="cex-meta-val">{{ entry['提交时间'] }}</span>
            </div>
          </div>
        </div>

        <div v-if="entry?.tags" class="cex-section">
          <h3 class="cex-section-label">相关标签</h3>
          <div class="cex-tags">
            <span
              v-for="(tag, i) in entry.tags.split(',')"
              :key="i"
              v-show="tag.trim()"
              class="cex-tag"
            >{{ tag.trim() }}</span>
          </div>
        </div>

      </div>

      <!-- 底部关闭按钮：固定在面板右下角，不随内容滚动 -->
      <div v-if="contentVisible" class="cex-footer">
        <button class="btn liquid-glass-btn" @click="closeModal">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'MorphModal',
  props: {
    isVisible:    { type: Boolean, default: false },
    entry:        { type: Object,  default: () => ({}) },
    cardRect:     { type: Object,  default: () => null },
    activeCardEl: { type: Object,  default: () => null }
  },
  emits: ['close', 'card-reveal'],
  data() {
    return {
      rendered:       false,
      overlayActive:  false,
      contentVisible: false,
      panelStyle:     {},
      _timers:        []
    }
  },
  watch: {
    isVisible(v) { v ? this._open() : this._close() }
  },
  mounted() {
    if (this.isVisible) this._open()
  },
  beforeUnmount() { this._clearTimers() },
  methods: {
    closeModal() { this.$emit('close') },
    _clearTimers() { this._timers.forEach(clearTimeout); this._timers = [] },
    _wait(ms) {
      return new Promise(r => { const id = setTimeout(r, ms); this._timers.push(id) })
    },

    /* 获取卡片当前视口坐标（每次实时获取，避免滚动后错位） */
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
        return { left: r.left, top: r.top, width: r.width, height: r.height, radius: 24 }
      }
      if (this.cardRect) return { ...this.cardRect, radius: this.cardRect.borderRadius ?? 24 }
      return {
        left:   window.innerWidth  / 2 - 160,
        top:    window.innerHeight / 2 - 100,
        width:  320, height: 200, radius: 24
      }
    },

    /* 目标全屏尺寸 */
    _targetRect() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (vw <= 768) {
        return { left: 0, top: 12, width: vw, height: vh - 24, radius: 20 }
      }
      const maxW = Math.min(800, vw - 40)
      const maxH = Math.min(vh * 0.92, vh - 40)
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
        borderRadius: (r.radius ?? 24) + 'px'
      }
    },

    _morphTransition(dur) {
      return ['left','top','width','height','border-radius']
        .map(p => `${p} ${dur}s cubic-bezier(0.32,0.72,0,1)`)
        .join(',')
    },

    /* 手机端：用 transform scale+translate 计算从卡片到全屏的变换 */
    _isMobile() { return window.innerWidth <= 768 },

    /* 手机端面板固定为全屏，用 transform 做缩放动画 */
    /* 手机端：计算 transform 参数和 clip-path inset 圆角 */
    _calcMobileTransform(src, dst) {
      const scaleX = src.width  / dst.width
      const scaleY = src.height / dst.height
      const tx = (src.left + src.width  / 2) - (dst.left + dst.width  / 2)
      const ty = (src.top  + src.height / 2) - (dst.top  + dst.height / 2)
      return { scaleX, scaleY, tx, ty }
    },

    _lockScroll() {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px'
      }
      document.body.style.overflow = 'hidden'
      
      if (this._isMobile()) {
        // 手机端使用更轻量的事件监听，避免 touch-action: none 可能导致的系统级刷新
        window.addEventListener('touchmove', this._preventScroll, { passive: false })
      }
    },
    _unlockScroll() {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      if (this._isMobile()) {
        window.removeEventListener('touchmove', this._preventScroll)
      }
    },
    _preventScroll(e) {
      e.preventDefault()
    },

    async _open() {
      this._clearTimers()
      this.contentVisible = false
      this.overlayActive  = false
      this._lockScroll()

      const src = this._getCardRect()
      const dst = this._targetRect()

      if (this._isMobile()) {
        /* 手机端：面板固定全屏尺寸，用 transform 从卡片缩放展开
           border-radius 用补偿值：初始圆角 = 卡片圆角 / scale，这样缩放后视觉圆角和卡片一致 */
        const { scaleX, scaleY, tx, ty } = this._calcMobileTransform(src, dst)
        const srcRadius = src.radius ?? 24
        const dstRadius = dst.radius ?? 20
        // 直接用卡片圆角值，不做补偿计算
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
        /* 桌面端：原有 left/top/width/height 过渡 */
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
        /* 等待时间须 >= transition 时长，防止内容淡入时面板仍在位移 */
        await this._wait(520)
        this.contentVisible = true
      }
    },

    async _close() {
      if (!this.rendered) return
      this._clearTimers()

      /* Step 1：内容淡出 */
      this.contentVisible = false
      await this._wait(150)

      const src = this._getCardRect()
      const dst = this._targetRect()
      this.overlayActive = false

      if (this._isMobile()) {
        /* 手机端：transform 缩回卡片，border-radius 用补偿值 */
        const { scaleX, scaleY, tx, ty } = this._calcMobileTransform(src, dst)
        const srcRadius = src.radius ?? 24
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
      } else {
        /* 桌面端：原有 left/top/width/height 收缩 */
        this.panelStyle = {
          ...this._toStyle(src),
          transition: this._morphTransition(0.40)
        }
        /* 等待时间必须 >= transition 时长，否则切换 transition 属性会
           打断进行中的 CSS 动画，导致面板"弹跳"到终态（抽搐感） */
        await this._wait(420)
        this.$emit('card-reveal')
        this.panelStyle = {
          ...this._toStyle(src),
          transition: 'opacity 0.22s ease',
          opacity: '0'
        }
        await this._wait(240)
        this._unlockScroll()
        this.rendered   = false
        this.panelStyle = {}
      }
    }
  }
}
</script>

<style scoped>
/* ===== 遮罩 ===== */
.cex-overlay {
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
.cex-overlay--active {
  background: rgba(5, 10, 20, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  pointer-events: auto;
}

/* ===== 展开面板 ===== */
.cex-panel {
  position: fixed;
  z-index: 3000;
  /* overflow:hidden 防止内容在面板尺寸小时溢出（展开初始阶段） */
  overflow: hidden;
  /* 与原卡片完全一致的毛玻璃样式 */
  /* 稍微加深背景色，防止手机端动画中 backdrop-filter 闪烁时完全透明 */
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

/* 顶部高光线 */
.cex-panel::before {
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
.cex-content {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  /* 底部留出空间给固定关闭按钮 */
  padding: 20px 24px 80px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease;
}
.cex-content--show {
  opacity: 1;
  pointer-events: auto;
}
.cex-content::-webkit-scrollbar { width: 4px; }
.cex-content::-webkit-scrollbar-track { background: transparent; }
.cex-content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.25);
  border-radius: 2px;
}

/* ===== 顶部栏 ===== */
.cex-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.cex-badge {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  color: #fff;
  border-radius: 20px;
  padding: 0.3em 0.85em;
  font-size: 0.78rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(13,110,253,0.25);
  flex-shrink: 0;
}

/* ===== 关闭按钮（在 topbar 内，不再 absolute 避免与年份重叠） ===== */
.cex-close {
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
.cex-close:hover {
  background: rgba(255, 80, 80, 0.32);
  border-color: rgba(255, 120, 120, 0.45);
  transform: rotate(90deg);
}

/* ===== 标题 / 年份 / 简介 ===== */
.cex-title {
  margin: 0 0 4px;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}
.cex-year-line {
  margin: 0 0 12px;
  color: rgba(255,255,255,0.45);
  font-size: 0.85rem;
}
.cex-desc {
  margin: 0 0 20px;
  color: rgba(255,255,255,0.78);
  font-size: 1rem;
  line-height: 1.7;
}
.cex-divider {
  height: 1px;
  background: rgba(255,255,255,0.12);
  margin: 0 0 20px;
}

/* ===== 区块 ===== */
.cex-section { margin-bottom: 22px; }
.cex-section-label {
  margin: 0 0 10px;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.40);
}
.cex-section-text {
  margin: 0;
  color: rgba(255,255,255,0.85);
  line-height: 1.75;
  white-space: pre-line;
  font-size: 0.95rem;
}

/* ===== 基本信息 ===== */
.cex-meta { display: flex; flex-direction: column; gap: 8px; }
.cex-meta-row { display: flex; align-items: baseline; gap: 12px; }
.cex-meta-key {
  min-width: 72px;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.45);
  flex-shrink: 0;
}
.cex-meta-val { color: rgba(255,255,255,0.88); font-size: 0.92rem; }

/* ===== 标签 ===== */
.cex-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.cex-tag {
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 14px;
  padding: 0.32em 0.88em;
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  transition: background 0.2s ease;
}
.cex-tag:hover { background: rgba(255,255,255,0.22); }

/* ===== 底部关闭按钮：固定在卡片右下角 ===== */
.cex-footer {
  position: absolute;
  bottom: 20px;
  right: 24px;
  z-index: 10;
}

/* 关闭按钮玻璃样式 */
.cex-footer .liquid-glass-btn {
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
.cex-footer .liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.38);
  transform: translateY(-1px);
}

/* ===== 移动端 ===== */
@media (max-width: 768px) {
  .cex-content { padding: 16px 16px 24px; }
  .cex-title   { font-size: 1.5rem; }
  .cex-desc    { font-size: 0.92rem; }
}
</style>
