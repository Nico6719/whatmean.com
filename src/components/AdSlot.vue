<template>
  <div
    v-if="ad || placeholder"
    class="ad-slot"
    :class="[`ad-slot--${variant}`, { 'ad-slot--empty': !ad }]"
    :style="minHeight ? { minHeight } : null"
  >
    <!-- 有广告数据：渲染真实广告 -->
    <a
      v-if="ad"
      class="ad-slot-link"
      :href="ad.linkUrl || undefined"
      :target="ad.linkUrl ? '_blank' : undefined"
      :rel="linkRel"
      @click="handleClick"
    >
      <img
        v-if="ad.type === 'image'"
        class="ad-slot-image"
        :src="ad.imageUrl"
        :alt="ad.title || '广告'"
        loading="lazy"
        @error="handleImageError"
      />
      <div v-else class="ad-slot-text">
        <span class="ad-slot-title">{{ ad.title }}</span>
        <span v-if="ad.description" class="ad-slot-desc">{{ ad.description }}</span>
      </div>
      <span v-if="ad.labeled" class="ad-slot-tag">广告</span>
    </a>

    <!-- 无广告数据：占位，仅在 placeholder 为 true 时显示 -->
    <div v-else class="ad-slot-placeholder">
      <span class="ad-slot-placeholder-text">{{ placeholderText }}</span>
    </div>
  </div>
</template>

<script>
import adsApi from '../services/ads.js'

export default {
  name: 'AdSlot',
  props: {
    // 广告位标识，对应 AD_POSITIONS
    position: {
      type: String,
      required: true
    },
    // banner：横幅；card：卡片
    variant: {
      type: String,
      default: 'banner'
    },
    // 无广告时是否显示占位框，生产环境一般留 false
    placeholder: {
      type: Boolean,
      default: false
    },
    placeholderText: {
      type: String,
      default: '广告位招租'
    },
    // 预留高度，避免广告加载后页面跳动
    minHeight: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      ad: null
    }
  },
  computed: {
    // 外部广告标 nofollow sponsored，本站加群链接不标
    linkRel() {
      return this.ad && this.ad.labeled
        ? 'noopener noreferrer nofollow sponsored'
        : 'noopener noreferrer'
    }
  },
  async mounted() {
    this.ad = await adsApi.getAd(this.position)
    if (this.ad) {
      adsApi.report('impression', this.ad)
    }
  },
  methods: {
    handleClick() {
      adsApi.report('click', this.ad)
    },
    // 图片加载失败时丢弃该广告，回落到占位或不渲染
    handleImageError() {
      this.ad = null
    }
  }
}
</script>

<style scoped>
.ad-slot {
  position: relative;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
}

.ad-slot-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  position: relative;
}

.ad-slot-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-slot-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  width: 100%;
}

.ad-slot-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.ad-slot-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
}

/* “广告”标识 */
.ad-slot-tag {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 0.65rem;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

/* 玻璃质感，与页脚其他卡片保持一致 */
.ad-slot--banner,
.ad-slot--card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    rgba(0, 0, 0, 0.18) 0px 8px 32px 0px,
    rgba(255, 255, 255, 0.3) 0px 1px 0px 0px inset;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ad-slot--banner:hover,
.ad-slot--card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.35),
    inset 0 2px 12px rgba(255, 255, 255, 0.08);
}

/* 占位状态：虚线框，不做 hover 位移 */
.ad-slot--empty {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.18);
  box-shadow: none;
}

.ad-slot--empty:hover {
  transform: none;
  box-shadow: none;
}

.ad-slot-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: inherit;
  padding: 20px;
}

.ad-slot-placeholder-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .ad-slot-text {
    padding: 12px 14px;
  }

  .ad-slot-title {
    font-size: 0.9rem;
  }
}
</style>
