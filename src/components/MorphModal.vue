<template>
  <Transition name="modal-overlay-fade">
    <div v-if="isVisible" class="modal-overlay" @click="closeModal">
      <Transition name="modal-morph" appear>
        <div v-if="isVisible" class="morph-modal" :style="morphStyle" @click.stop>
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
      </Transition>
    </div>
  </Transition>
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
    }
  },
  emits: ['close'],
  data() {
    return {
      morphStyle: {}
    };
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        // 设置形态变换的起始点
        this.updateMorphOrigin();
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    updateMorphOrigin() {
      // 计算相对于视口中心的按钮位置百分比
      const centerX = this.buttonPosition.x / window.innerWidth * 100;
      const centerY = this.buttonPosition.y / window.innerHeight * 100;
      this.morphStyle = {
        '--morph-origin-x': centerX + '%',
        '--morph-origin-y': centerY + '%'
      };
    }
  }
}
</script>

<style scoped>
/* ===== 遮罩层淡入淡出 ===== */
.modal-overlay-fade-enter-active,
.modal-overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-overlay-fade-enter-from,
.modal-overlay-fade-leave-to {
  opacity: 0;
}

/* ===== 弹窗卡片：真正的形态变换动效 ===== */
.modal-morph-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: var(--morph-origin-x, 50%) var(--morph-origin-y, 50%);
}
.modal-morph-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 1, 1);
  transform-origin: var(--morph-origin-x, 50%) var(--morph-origin-y, 50%);
}
.modal-morph-enter-from {
  opacity: 0;
  transform: scale(0.1) translateZ(0);
}
.modal-morph-leave-to {
  opacity: 0;
  transform: scale(0.05) translateZ(0);
}

/* ===== 遮罩层 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

/* ===== 弹窗主体：深色毛玻璃效果 ===== */
.morph-modal {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.50),
    inset 0 -1px 0 rgba(255, 255, 255, 0.10);
  overflow: hidden;
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
}

/* 顶部渐变高光线 */
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

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
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
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  color: #fff;
  line-height: 1;
}

.close-button:hover {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 120, 120, 0.4);
  transform: rotate(90deg) scale(1.1);
}

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
  align-items: center;
}

.detail-label {
  font-weight: 500;
  width: 100px;
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

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  justify-content: flex-end;
  background: rgba(255, 255, 255, 0.05);
}

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

@media (max-width: 768px) {
  .modal-morph-enter-active,
  .modal-morph-leave-active {
    transform-origin: center center;
  }
  
  .morph-modal {
    width: 95%;
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-label {
    width: auto;
    margin-bottom: 0.25rem;
  }
}
</style>
