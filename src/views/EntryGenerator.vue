<template>
  <div class="entry-generator-page">
    <div class="eg-hero">
      <div class="eg-hero-inner">
        <h1 class="eg-hero-title">词条生成器</h1>
        <p class="eg-hero-subtitle">填写以下信息，生成符合格式的词条JSON文件</p>
        <div class="eg-hero-divider"></div>
      </div>
    </div>

    <div class="eg-content">
      <div class="eg-section">
        <div class="eg-section-inner">
          <form @submit.prevent="generateEntry">
            <div class="form-group-item">
              <label for="entryName" class="form-label">词条名 *</label>
              <input
                type="text"
                class="form-input"
                id="entryName"
                v-model="entryData.词条名"
                placeholder="例如：遥遥领先、躺平、内卷"
                required
              >
            </div>

            <div class="form-group-item">
              <label for="entryIntro" class="form-label">词条介绍 *</label>
              <textarea
                class="form-input form-textarea"
                id="entryIntro"
                rows="2"
                v-model="entryData.词条介绍"
                placeholder="简短描述词条的含义或背景"
                required
              ></textarea>
            </div>

            <div class="form-group-item">
              <label for="entryDetail" class="form-label">详细介绍 *</label>
              <textarea
                class="form-input form-textarea"
                id="entryDetail"
                rows="6"
                v-model="entryData.详细介绍"
                placeholder="详细解释词条的来源、用法、文化背景等信息"
                required
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group-item">
                <label for="entryYear" class="form-label">词条年份 *</label>
                <input
                  type="number"
                  class="form-input"
                  id="entryYear"
                  v-model.number="entryData.词条年份"
                  placeholder="例如：2025"
                  min="2000"
                  max="2030"
                  required
                >
              </div>

              <div class="form-group-item">
                <label for="entryTags" class="form-label">标签 *</label>
                <input
                  type="text"
                  class="form-input"
                  id="entryTags"
                  v-model="entryData.标签"
                  placeholder="用逗号分隔，例如：网络用语,流行文化"
                  required
                >
              </div>
            </div>

            <div class="form-group-item">
              <label class="form-label">提交时间</label>
              <input
                type="text"
                class="form-input"
                :value="currentDateTime"
                readonly
              >
              <small class="form-hint">提交时间将自动设置为当前时间</small>
            </div>

            <div class="form-actions">
              <button type="button" class="eg-btn-secondary" @click="resetForm">
                重置表单
              </button>
              <button type="submit" class="eg-btn-primary">
                生成词条JSON
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="generatedJson" class="eg-section">
        <div class="eg-section-inner">
          <div class="eg-section-header">
            <span class="eg-section-number">JSON</span>
            <h2 class="eg-section-title">生成结果</h2>
          </div>
          <pre class="json-preview"><code>{{ generatedJson }}</code></pre>
          <div class="json-actions">
            <button class="eg-btn-success" @click="copyToClipboard">
              复制到剪贴板
            </button>
            <a href="https://github.com/Nico6719/whatmean.com" target="_blank" class="eg-btn-outline">
              前去提交
            </a>
            <small class="copied-text" v-if="copied">已复制！</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EntryGenerator',
  head() {
    return {
      title: '词条生成器 - 何意味',
      meta: [
        { name: 'description', content: '使用何意味词条生成器，提交你发现的新网络热梗，共同完善网络热梗百科。' },
        { property: 'og:title', content: '词条生成器 - 何意味' },
        { property: 'og:description', content: '提交你发现的新网络热梗，共同完善网络热梗百科。' },
        { property: 'og:url', content: 'https://xn--vqqq8jxym.com/entry-generator' }
      ]
    }
  },
  data() {
    return {
      entryData: {
        词条名: '',
        词条介绍: '',
        详细介绍: '',
        词条年份: new Date().getFullYear(),
        标签: ''
      },
      generatedJson: '',
      copied: false
    }
  },
  computed: {
    currentDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
  methods: {
    generateEntry() {
      const completeEntry = {
        ...this.entryData,
        "提交时间": this.currentDateTime
      };

      this.generatedJson = JSON.stringify(completeEntry, null, 2);
      this.copied = false;
    },
    resetForm() {
      this.entryData = {
        词条名: '',
        词条介绍: '',
        详细介绍: '',
        词条年份: new Date().getFullYear(),
        标签: ''
      };
      this.generatedJson = '';
      this.copied = false;
    },
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.generatedJson);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 3000);
      } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      }
    }
  }
}
</script>

<style scoped>
.entry-generator-page {
  min-height: 100vh;
  background-color: transparent;
}

.eg-hero {
  padding: 100px 24px 60px;
  text-align: center;
  position: relative;
}

.eg-hero-inner {
  max-width: 640px;
  margin: 0 auto;
}

.eg-hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  animation: egFadeInDown 0.7s ease;
}

.eg-hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 400;
  animation: egFadeInUp 0.7s ease 0.15s both;
}

.eg-hero-divider {
  width: 48px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 2px;
  margin: 28px auto 0;
  animation: egFadeInUp 0.7s ease 0.3s both;
}

.eg-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.eg-section {
  margin-bottom: 72px;
}

.eg-section:last-child {
  margin-bottom: 0;
}

.eg-section-inner {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 2px 8px rgba(255, 255, 255, 0.05),
    inset 0 -2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.eg-section-inner::before {
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

.eg-section-inner:hover::before {
  top: -18px;
  left: -18px;
  right: -18px;
  bottom: -18px;
}

.eg-section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.eg-section-number {
  font-size: 0.8rem;
  font-weight: 700;
  color: #93c5fd;
  background: rgba(147, 197, 253, 0.15);
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.05em;
}

.eg-section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.form-group-item {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 10px;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 0.95rem;
  color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--primary-color);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(13, 110, 253, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  display: block;
  margin-top: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.eg-btn-primary,
.eg-btn-secondary,
.eg-btn-success,
.eg-btn-outline {
  flex: 1;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.eg-btn-primary {
  background: linear-gradient(135deg, var(--primary-color), #4dabf7);
  color: white;
  box-shadow: 0 4px 16px rgba(13, 110, 253, 0.3);
}

.eg-btn-primary:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(13, 110, 253, 0.4);
}

.eg-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.eg-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px) scale(1.02);
}

.eg-btn-success {
  background: linear-gradient(135deg, #198754, #20c997);
  color: white;
  box-shadow: 0 4px 16px rgba(25, 135, 84, 0.3);
}

.eg-btn-success:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(25, 135, 84, 0.4);
}

.eg-btn-outline {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.eg-btn-outline:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px) scale(1.02);
}

.json-preview {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  color: #e0e0e0;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  margin-bottom: 20px;
}

.json-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.copied-text {
  color: #93c5fd;
  font-weight: 500;
  margin-left: 8px;
}

@keyframes egFadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes egFadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .eg-hero {
    padding: 72px 20px 40px;
  }

  .eg-hero-title {
    font-size: 2.2rem;
  }

  .eg-hero-subtitle {
    font-size: 1rem;
  }

  .eg-content {
    padding: 0 16px 60px;
  }

  .eg-section {
    margin-bottom: 48px;
  }

  .eg-section-inner {
    padding: 28px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .json-actions {
    flex-direction: column;
  }

  .json-actions .eg-btn-success,
  .json-actions .eg-btn-outline {
    width: 100%;
  }
}
</style>
