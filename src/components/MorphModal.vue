<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="morph-modal" @click.stop>
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
    }
  },
  emits: ['close'],
  methods: {
    closeModal() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease-out;
}

.morph-modal {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 20px 50px rgba(31, 38, 135, 0.25),
    inset 0 2px 15px rgba(255, 255, 255, 0.5),
    inset 0 -2px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.morph-modal::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.01));
  z-index: -1;
  border-radius: 30px;
  transition: all 0.4s ease;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.close-button {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.close-button:hover {
  background: rgba(255, 0, 0, 0.1);
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.entry-detail-section {
  margin-bottom: 1.5rem;
}

.entry-detail-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
  color: #555;
}

.detail-value {
  flex: 1;
  color: #333;
}

.entry-description,
.entry-detail-text {
  color: #444;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  white-space: pre-line;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
}

.tag-badge {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-weight: 500;
  padding: 0.4em 1em;
  margin-bottom: 0.3rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 2px 8px rgba(31, 38, 135, 0.1),
    inset 0 1px 4px rgba(255, 255, 255, 0.4),
    inset 0 -1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  color: #000;
  margin-right: 0.5rem;
}

.tag-badge::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: linear-gradient(45deg, rgba(255,255,255,0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tag-badge:hover {
  background: rgba(102, 51, 153, 0.4);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 6px 15px rgba(102, 51, 153, 0.2),
    inset 0 1px 8px rgba(255, 255, 255, 0.6),
    inset 0 -1px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: #fff;
}

.tag-badge:hover::before {
  opacity: 1;
}

.liquid-glass-btn {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  position: relative;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
}

.liquid-glass-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.liquid-glass-btn:hover::before {
  opacity: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
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