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
      <!-- 内容区 -->
      <div
        class="cex-content"
        :class="{ 'cex-content--show': contentVisible }"
        :style="contentStyle"
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

      <!-- 底部关闭按钮：只在详情展开且非关闭动画期间显示 -->
      <div v-if="contentVisible && !isClosing" class="cex-footer">
        <button class="btn liquid-glass-btn" @click="closeModal">关闭</button>
      </div>

      <!-- 关闭动画时显示的卡片简略内容层（与详情层交叉淡入） -->
      <div
        class="cex-card-view"
        :style="cardViewStyle"
      >
        <div 
          ref="clonedContainer"
          class="cex-card-view-inner" 
          :style="{ width: '100%', height: '100%' }"
          v-html="cardRect?.clonedHtml"
        >
        </div>
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
      isClosing:      false,
      panelStyle:     {},
      contentStyle:   {},
      cardViewStyle:  { opacity: '0', pointerEvents: 'none' },
      _timers:        []
    }
  },
  watch: {
    isVisible(v) { v ? this._open() : this._close() }
  },
  updated() {
    // 每次克隆内容更新后，强制应用深度抓取的精确像素样式
    this.$nextTick(() => {
      this._applyDeepStyles();
    });
  },
  methods: {
    _applyDeepStyles() {
      const container = this.$refs.clonedContainer;
      const styles = this.cardRect?.deepStyles;
      if (!container || !styles) return;

      // 1. 强制对齐 Body Padding
      const body = container.querySelector('.card-body');
      if (body && styles.body) {
        body.style.setProperty('padding', styles.body.padding, 'important');
        Object.assign(body.style, {
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        });
      }

      // 2. 强制对齐标题和正文
      const title = container.querySelector('.card-title');
      if (title && styles.title) {
        title.style.setProperty('font-size', styles.title.fontSize, 'important');
        title.style.setProperty('line-height', styles.title.lineHeight, 'important');
        title.style.setProperty('margin', styles.title.margin, 'important');
        title.style.setProperty('font-weight', styles.title.fontWeight, 'important');
        title.style.setProperty('color', styles.title.color, 'important');
        // 针对友情链接卡片：如果标题偏下，通常是因为父容器 flex 布局或 margin 导致，这里强制重置
        title.style.setProperty('display', 'block', 'important');
        title.style.setProperty('transform', 'none', 'important');
      }

      const text = container.querySelector('.card-text');
      if (text && styles.text) {
        text.style.setProperty('font-size', styles.text.fontSize, 'important');
        text.style.setProperty('line-height', styles.text.lineHeight, 'important');
        text.style.setProperty('margin', styles.text.margin, 'important');
        text.style.setProperty('color', styles.text.color, 'important');
        Object.assign(text.style, {
          display: '-webkit-box',
          webkitLineClamp: '3',
          webkitBoxOrient: 'vertical',
          overflow: 'hidden'
        });
      }

      // 2.5 针对友情链接 Icon 尺寸修复
      const iconContainer = container.querySelector('.friend-card-icon');
      const iconImg = container.querySelector('.friend-favicon, svg');
      if (iconContainer && styles.icon?.container) {
        iconContainer.style.setProperty('width', styles.icon.container.width, 'important');
        iconContainer.style.setProperty('height', styles.icon.container.height, 'important');
        iconContainer.style.setProperty('min-width', styles.icon.container.width, 'important');
      }
      if (iconImg && styles.icon?.icon) {
        iconImg.style.setProperty('width', styles.icon.icon.width, 'important');
        iconImg.style.setProperty('height', styles.icon.icon.height, 'important');
      }

      // 3. 强制对齐每一个标签的绝对像素尺寸
      const tags = container.querySelectorAll('.tag-badge');
      tags.forEach((tag, i) => {
        const s = styles.tagStyles[i];
        if (s) {
          Object.assign(tag.style, {
            fontSize: s.fontSize,
            padding: s.padding,
            margin: s.margin,
            borderRadius: s.borderRadius,
            lineHeight: s.lineHeight,
            width: s.width,
            height: s.height,
            display: s.display,
            transition: 'none'
          });
        }
      });
    },
    closeModal() { this.$emit('close') },
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

    _targetRect() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (vw <= 768) {
        // 手机端：全屏感但保留微小边距，圆角与卡片一致
        return { left: 8, top: 8, width: vw - 16, height: vh - 16, radius: 24 }
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
        .map(p => `${p} ${dur}s cubic-bezier(0.32, 0.72, 0, 1)`)
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
      // 移动端不再全局拦截 touchmove，否则会导致弹窗内部也无法滚动
    },
    _unlockScroll() {
      document.removeEventListener('wheel', this._preventScroll)
      document.removeEventListener('keydown', this._preventKeyScroll)
    },
    _preventScroll(e) {
      // 仅当事件目标不在弹窗内容区时才拦截滚动
      if (!e.target.closest('.cex-content')) {
        e.preventDefault()
      }
    },
    _preventKeyScroll(e) {
      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']
      if (scrollKeys.includes(e.key)) e.preventDefault()
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
        // 手机端：使用布局属性动画，确保内容不被压缩变形
        this.contentStyle = { opacity: '0', transition: 'none' }
        this.panelStyle = {
          ...this._toStyle(src),
          transition: 'none',
          opacity: '1',
          willChange: 'left, top, width, height, border-radius'
        }
        this.rendered = true
        await this.$nextTick()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

        this.overlayActive = true
        const dur = 0.45
        this.panelStyle = {
          ...this._toStyle(dst),
          transition: this._morphTransition(dur),
          opacity: '1'
        }
        this.contentStyle = {
          opacity: '1',
          transition: `opacity ${dur * 0.8}s ease`
        }
        this.contentVisible = true
        await this._wait(Math.round(dur * 1000) + 20)
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
        // 手机端：回归布局属性动画，彻底解决内容压缩变形问题
        const dur = 0.45

        this._unlockScroll()
        this.overlayActive = false

        this.contentStyle = {
          opacity: '0',
          transition: `opacity ${dur * 0.4}s ease`
        }
        this.cardViewStyle = {
          opacity: '1',
          pointerEvents: 'none',
          transition: `opacity ${dur * 0.4}s ease`
        }

        this.panelStyle = {
          ...this._toStyle(src),
          transition: this._morphTransition(dur),
          opacity: '1',
          willChange: 'left, top, width, height, border-radius'
        }

        await this._wait(Math.round(dur * 1000) + 30)

        this.$emit('card-reveal')
        this.rendered      = false
        this.isClosing     = false
        this.panelStyle    = {}
        this.contentStyle  = {}
        this.cardViewStyle = { opacity: '0', pointerEvents: 'none' }
      } else {
        // ===== 桌面端：position 形变收缩回卡片 =====
        this._unlockScroll()
        const dur = 0.50

        this.overlayActive = false

        // 详情层淡出，卡片层淡入（交叉淡入）
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
  overflow: hidden;
  background: rgba(0, 0, 0, 0.30);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  /* 阴影与全局 style.css 中 .meme-card/.liquid-glass-card 严格一致 */
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.30),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  will-change: left, top, width, height, border-radius, opacity;
  transform-origin: center center;
}

/* 顶部高光线 —— 与 style.css 中 .meme-card::before 严格一致 */
.cex-panel::before {
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
.cex-content {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow-y: auto;
  /* 增加底部内边距，配合淡出遮罩，解决按钮遮挡问题 */
  padding: 20px 24px 120px;
  opacity: 0;
  pointer-events: none;
  -webkit-overflow-scrolling: touch;
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

/* ===== 关闭按钮 ===== */
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

/* ===== 底部关闭按钮 ===== */
.cex-footer {
  position: absolute;
  bottom: 20px;
  right: 24px;
  z-index: 10;
  pointer-events: auto;
}
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
  .cex-content { padding: 20px 20px 120px; }
  .cex-title   { font-size: 1.75rem; }
  .cex-desc    { font-size: 1rem; }
  /* 手机端底部按钮居中显示，更符合操作习惯 */
  .cex-footer {
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    bottom: 24px;
  }
  /* 手机端预览层适配：确保克隆的内容能正确换行 */
  .cex-card-view-inner :deep(.card-body) {
    padding: 1.5rem !important;
  }
  .cex-card-view-inner :deep(.card-title) {
    font-size: 1.25rem !important;
    color: #ffffff !important;
    margin: 0.5rem 0 !important;
  }
  .cex-card-view-inner :deep(.card-text) {
    color: rgba(255, 255, 255, 0.80) !important;
  }
}

/* ===== 卡片视图层（关闭动画时显示） ===== */
.cex-card-view {
  position: absolute;
  inset: 0;
  z-index: 1; /* 克隆层在内容层之下 */
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}
.cex-card-view-inner {
  height: 100%;
  width: 100%;
  pointer-events: none;
  /* 强制清除自身的所有边框和阴影，避免与外层 cex-panel 叠加导致双重高光 */
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  transform: none;
  overflow: hidden;
  display: block;
  position: relative;
}
/* 同时清除自身的 ::before 高光线 */
.cex-card-view-inner::before {
  display: none !important;
}
/* 预览层内部克隆内容移除阴影和边框，避免与外层面板重叠导致加深或闪烁 */
.cex-card-view-inner :deep(.liquid-glass-card),
.cex-card-view-inner :deep(.meme-card) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  backdrop-filter: none !important;
  margin: 0 !important;
  width: 100% !important;
  height: 100% !important;
}
.cex-card-view-inner :deep(.liquid-glass-card::before),
.cex-card-view-inner :deep(.meme-card::before) {
  display: none !important;
}
/* 深度作用于克隆的 HTML 内容 */
.cex-card-view-inner :deep(.card-body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
/* 克隆方案下，预览层会直接继承 .liquid-glass-card 及其子类的样式 */
.cex-card-view-inner :deep(.card-title) {
  color: #ffffff;
}
/* 年份文字：scoped 样式无法作用于 v-html 克隆内容，需在此强制覆盖 Bootstrap .text-muted 的深色默认值 */
.cex-card-view-inner :deep(.text-muted),
.cex-card-view-inner :deep(small) {
  color: rgba(255, 255, 255, 0.55) !important;
}
.cex-card-view-inner :deep(.card-text) {
  color: rgba(255, 255, 255, 0.80);
  /* 确保预览层文字不溢出，保持 3 行截断 */
  display: -webkit-box !important;
  -webkit-line-clamp: 3 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
}
.cex-card-view-inner :deep(.tag-badge) {
  /* 仅禁用过渡和强制 inline-block，尺寸类属性全部交由 _applyDeepStyles() 的 inline style 控制 */
  /* 避免用 !important 覆盖 inline style，否则实际像素尺寸与原卡片不一致 */
  transition: none !important;
  display: inline-block !important;
}
</style>
