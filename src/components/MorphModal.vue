<template>
  <Teleport to="body">
    <div
      v-if="rendered"
      class="modal-overlay"
      :class="{ active: overlayActive }"
      @click="closeModal"
    >
      <div
        ref="modal"
        class="morph-modal"
        :style="modalStyle"
        @click.stop
      >
        <div class="modal-header">
          <h2 class="modal-title">{{ entry?.name || '词条详情' }}</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="entry-detail-section">
            <h3>基本信息</h3>
            <div class="detail-item">
              <span class="detail-label">词条名称:</span>
              <span class="detail-value">{{ entry?.name || '暂无' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">所属年份:</span>
              <span class="detail-value">{{ entry?.year || '未知' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">提交时间:</span>
              <span class="detail-value">{{ entry?.['提交时间'] || '未知' }}</span>
            </div>
          </div>

          <div class="entry-detail-section">
            <h3>词条介绍</h3>
            <p class="entry-description">{{ entry?.explanation || '暂无介绍' }}</p>
          </div>

          <div class="entry-detail-section">
            <h3>详细介绍</h3>
            <p class="entry-detail-text">{{ entry?.detail || entry?.['详细介绍'] || '暂无详细信息' }}</p>
          </div>

          <div v-if="entry?.tags" class="entry-detail-section">
            <h3>相关标签</h3>
            <div class="tags">
              <span
                v-for="(tag, index) in entry.tags.split(',')"
                :key="index"
                class="badge tag-badge me-1"
              >
                {{ tag.trim() }}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary liquid-glass-btn" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'MorphModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    entry: {
      type: Object,
      default: () => ({})
    },
    buttonPosition: {
      type: Object,
      default: () => ({ x: 0, y: 0, width: 0, height: 0 })
    },
    launchToken: {
      type: Number,
      default: 0
    }
  },
  emits: ['close'],
  data() {
    return {
      rendered: false,
      overlayActive: false,
      modalStyle: {},
      savedButtonRect: null,
      raf1: null,
      raf2: null,
      closeTimer: null,
      bodyOverflow: ''
    }
  },
  watch: {
    isVisible(newValue) {
      if (newValue) {
        this.openModal()
      } else {
        this.closeModalAnimation()
      }
    },
    launchToken() {
      if (this.isVisible) {
        this.openModal()
      }
    }
  },
  mounted() {
    if (this.isVisible) {
      this.openModal()
    }
  },
  beforeUnmount() {
    this.cleanup()
    this.unlockBodyScroll()
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },

    cleanup() {
      if (this.raf1) { cancelAnimationFrame(this.raf1); this.raf1 = null }
      if (this.raf2) { cancelAnimationFrame(this.raf2); this.raf2 = null }
      if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null }
    },

    lockBodyScroll() {
      this.bodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    },

    unlockBodyScroll() {
      document.body.style.overflow = this.bodyOverflow || ''
    },

    getButtonRect() {
      const p = this.buttonPosition || {}
      return {
        centerX: Number(p.x) || window.innerWidth / 2,
        centerY: Number(p.y) || window.innerHeight / 2,
        width: Number(p.width) || 80,
        height: Number(p.height) || 32
      }
    },

    /**
     * 计算按钮中心相对于模态框的 transform-origin（百分比）
     * 这样 scale 动画就会从按钮方向展开/收缩
     */
    calcOrigin(btn, modalRect) {
      const ox = ((btn.centerX - modalRect.left) / modalRect.width) * 100
      const oy = ((btn.centerY - modalRect.top) / modalRect.height) * 100
      const clampedX = Math.min(Math.max(ox, -20), 120)
      const clampedY = Math.min(Math.max(oy, -20), 120)
      return `${clampedX}% ${clampedY}%`
    },

    async openModal() {
      this.cleanup()

      // 保存按钮位置
      this.savedButtonRect = this.getButtonRect()

      // 渲染 DOM 但隐藏，先测量模态框尺寸
      this.rendered = true
      this.overlayActive = false
      this.modalStyle = {
        visibility: 'hidden',
        transform: 'scale(1)',
        opacity: '0',
        transition: 'none'
      }

      await this.$nextTick()

      const modal = this.$refs.modal
      if (!modal) return

      // 测量模态框展开后的真实位置
      const modalRect = modal.getBoundingClientRect()
      const btn = this.savedButtonRect

      // 计算 transform-origin（按钮相对于模态框的位置）
      const origin = this.calcOrigin(btn, modalRect)

      // 计算缩放比例（从按钮大小缩放到模态框大小）
      const sx = Math.max(btn.width / modalRect.width, 0.04)
      const sy = Math.max(btn.height / modalRect.height, 0.04)

      // 设置折叠状态：缩小到按钮大小，无 transition
      this.modalStyle = {
        visibility: 'visible',
        transformOrigin: origin,
        transform: `scale(${sx}, ${sy})`,
        opacity: '0',
        transition: 'none'
      }

      this.lockBodyScroll()

      // 强制浏览器提交折叠状态的绘制帧，再开启 transition 展开
      this.raf1 = requestAnimationFrame(() => {
        this.raf2 = requestAnimationFrame(() => {
          this.overlayActive = true
          this.modalStyle = {
            visibility: 'visible',
            transformOrigin: origin,
            transform: 'scale(1, 1)',
            opacity: '1',
            transition: 'transform 0.46s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.30s ease'
          }
        })
      })
    },

    closeModalAnimation() {
      if (!this.rendered) return

      this.cleanup()

      const modal = this.$refs.modal
      const btn = this.savedButtonRect || this.getButtonRect()

      if (!modal) {
        this.rendered = false
        this.overlayActive = false
        this.modalStyle = {}
        this.unlockBodyScroll()
        return
      }

      // 模态框当前是展开状态，重新测量位置
      const modalRect = modal.getBoundingClientRect()
      const origin = this.calcOrigin(btn, modalRect)
      const sx = Math.max(btn.width / modalRect.width, 0.04)
      const sy = Math.max(btn.height / modalRect.height, 0.04)

      // 关闭遮罩，收缩回按钮
      this.overlayActive = false
      this.modalStyle = {
        visibility: 'visible',
        transformOrigin: origin,
        transform: `scale(${sx}, ${sy})`,
        opacity: '0',
        transition: 'transform 0.36s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s ease'
      }

      this.closeTimer = window.setTimeout(() => {
        this.rendered = false
        this.modalStyle = {}
        this.unlockBodyScroll()
      }, 380)
    }
  }
}
</script>

<style scoped>
/* ===== 遮罩层 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(5, 10, 20, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  z-index: 3000;
  transition:
    background 0.30s ease,
    backdrop-filter 0.30s ease,
    -webkit-backdrop-filter 0.30s ease;
}

.modal-overlay.active {
  background: rgba(5, 10, 20, 0.52);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ===== 模态框主体 ===== */
.morph-modal {
  width: min(960px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.50),
    inset 0 -1px 0 rgba(255, 255, 255, 0.10);
  will-change: transform, opacity;
}

/* 顶部高光线 */
.morph-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6) 30%,
    rgba(255, 255, 255, 0.6) 70%,
    transparent
  );
  pointer-events: none;
  z-index: 1;
}

/* ===== 头部 ===== */
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.close-button {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  color: #fff;
  line-height: 1;
  flex-shrink: 0;
}

.close-button:hover {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 120, 120, 0.4);
  transform: rotate(90deg) scale(1.1);
}

/* ===== 内容区 ===== */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-body::-webkit-scrollbar {
  width: 4px;
}
.modal-body::-webkit-scrollbar-track {
  background: transparent;
}
.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.entry-detail-section {
  margin-bottom: 1.5rem;
}

.entry-detail-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}

.detail-label {
  font-weight: 500;
  min-width: 90px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
}

.detail-value {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
}

.entry-description,
.entry-detail-text {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
  margin: 0 0 1rem 0;
  white-space: pre-line;
}

/* ===== 底部 ===== */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  justify-content: flex-end;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

/* ===== 标签 ===== */
.tag-badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  font-weight: 500;
  padding: 0.35em 0.9em;
  margin-bottom: 0.3rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.9);
  margin-right: 0.5rem;
}

.tag-badge:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.4);
}

/* ===== 关闭按钮 ===== */
.liquid-glass-btn {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 18px;
  transition: all 0.25s ease;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.30);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* ===== 移动端适配 ===== */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 8px;
    align-items: flex-end;
  }

  .morph-modal {
    width: calc(100vw - 16px);
    max-height: 90vh;
    border-radius: 20px 20px 16px 16px;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
  }

  .detail-label {
    min-width: 72px;
  }
}
</style>
