<template>
  <div class="freebies-page">
    <div class="freebies-hero">
      <div class="freebies-hero-inner">
        <h1 class="freebies-hero-title">最新羊毛</h1>
        <p class="freebies-hero-subtitle">收集全网免费服务与优质资源，一起薅羊毛！</p>
        <div class="freebies-hero-divider"></div>
      </div>
    </div>

    <div class="freebies-content">
      <div class="freebies-section">
        <div class="freebies-grid">
        <div
            class="freebie-card"
            v-for="(freebie, index) in freebies"
            :key="freebie.name"
            :ref="el => cardRefs[index] = el"
            @click="showFreebieDetail(freebie, index)"
          >
            <div class="freebie-card-icon">
              <img
                v-if="!iconError[index]"
                :src="getFavicon(freebie.url)"
                :alt="freebie.name"
                class="freebie-favicon"
                @error="iconError[index] = true"
              />
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 .708.708L8 1.707l2.646 2.647a.5.5 0 0 0 .708-.708l-3-3z"/>
              </svg>
            </div>
            <div class="freebie-card-info">
              <h3 class="freebie-card-name">{{ freebie.name }}</h3>
              <p class="freebie-card-desc">{{ freebie.description }}</p>
              <div class="freebie-card-tags">
                <span class="tag-badge" v-for="tag in freebie.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
            <svg class="freebie-card-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <FreebieModal
      :isVisible="modalVisible"
      :freebie="activeFreebie"
      :activeCardEl="activeCardEl"
      @close="handleModalClose"
      @card-reveal="handleCardReveal"
    />
  </div>
</template>

<script>
import FreebieModal from '../components/FreebieModal.vue'
import { SITE_URL } from '../config/site'

export default {
  name: 'Freebies',
  components: { FreebieModal },
  head() {
    return {
      title: '免费资源 - 何意味',
      link: [{ rel: 'canonical', href: `${SITE_URL}/freebies` }],
      meta: [
        { name: 'description', content: '何意味整理的免费与低价资源推荐，涵盖云服务器、开发工具等实用服务。' },
        { property: 'og:title', content: '免费资源 - 何意味' },
        { property: 'og:description', content: '何意味整理的免费与低价资源推荐。' },
        { property: 'og:url', content: `${SITE_URL}/freebies` }
      ]
    }
  },
  data() {
    return {
      iconError: {},
      modalVisible: false,
      activeFreebie: null,
      activeCardEl: null,
      activeCardIndex: -1,
      cardRefs: [],
      cardTimers: [],
      freebies: [
        {
          name: '雨云',
          description: '国内云服务商，提供云服务器、游戏云和物理服务器，价格便宜，还有推广返利。',
          url: 'https://www.rainyun.com/Nico6719_',
          displayUrl: 'https://www.rainyun.com',
          tags: ['云服务器', '游戏云', '低价']
        },
        {
          name: 'Cloudflare',
          description: '全球领先的 CDN、DNS 和网络安全服务，提供免费套餐。',
          url: 'https://cloudflare.com',
          tags: ['CDN', 'DNS', '安全']
        },
        {
          name: 'GitHub Pages',
          description: '为你的项目提供免费的静态站点托管服务。',
          url: 'https://pages.github.com',
          tags: ['托管', '静态网站']
        },
        {
          name: 'Vercel',
          description: '前端云平台，提供免费的 SSR 和静态网站部署。',
          url: 'https://vercel.com',
          tags: ['托管', 'SSR', '前端']
        },
        {
          name: 'Netlify',
          description: '现代化的托管平台，支持静态网站和 serverless 函数。',
          url: 'https://netlify.com',
          tags: ['托管', 'Serverless']
        },
        {
          name: 'Railway',
          description: '简洁的云平台，提供免费的容器部署服务。',
          url: 'https://railway.app',
          tags: ['容器', '部署']
        },
        {
          name: 'Render',
          description: '云托管服务，支持免费静态网站、PostgreSQL 和 Redis。',
          url: 'https://render.com',
          tags: ['托管', '数据库']
        },
        {
          name: 'Fly.io',
          description: '将你的应用部署到全球边缘网络，免费套餐可用。',
          url: 'https://fly.io',
          tags: ['边缘计算', '容器']
        },
        {
          name: 'Supabase',
          description: '开源的 Firebase 替代品，提供免费的 PostgreSQL 数据库。',
          url: 'https://supabase.com',
          tags: ['数据库', 'BaaS']
        },
        {
          name: 'MongoDB Atlas',
          description: '云端 MongoDB 数据库服务，提供免费集群。',
          url: 'https://www.mongodb.com/atlas',
          tags: ['数据库', 'NoSQL']
        },
        {
          name: 'PlanetScale',
          description: 'Serverless MySQL 平台，提供免费开发套餐。',
          url: 'https://planetscale.com',
          tags: ['数据库', 'MySQL']
        },
        {
          name: 'Neon',
          description: 'Serverless PostgreSQL，支持分支和即时回滚。',
          url: 'https://neon.tech',
          tags: ['数据库', 'PostgreSQL']
        },
        {
          name: 'Upstash',
          description: 'Serverless Redis 和 Kafka 服务，按请求计费。',
          url: 'https://upstash.com',
          tags: ['Redis', '消息队列']
        },
        {
          name: 'Turso',
          description: '基于 libSQL 的边缘数据库，支持本地开发和免费套餐。',
          url: 'https://turso.tech',
          tags: ['数据库', '边缘计算']
        },
        {
          name: 'Resend',
          description: '开发者友好的邮件 API 服务，提供免费套餐。',
          url: 'https://resend.com',
          tags: ['邮件', 'API']
        },
        {
          name: 'Mailgun',
          description: '可扩展的邮件发送服务，适合应用邮件发送。',
          url: 'https://mailgun.com',
          tags: ['邮件', 'API']
        },
        {
          name: 'Brevo (Sendinblue)',
          description: '营销邮件和自动化平台，提供免费套餐。',
          url: 'https://brevo.com',
          tags: ['邮件', '营销']
        },
        {
          name: 'OVHcloud',
          description: '欧洲领先的云服务商，提供低价 VPS 和存储服务。',
          url: 'https://ovhcloud.com',
          tags: ['VPS', '云主机']
        },
        {
          name: 'Oracle Cloud',
          description: '甲骨文云服务，提供永久免费套餐包括 VPS。',
          url: 'https://oracle.com/cloud/free',
          tags: ['VPS', '云主机', '数据库']
        },
        {
          name: 'GitHub Copilot',
          description: 'AI 编程助手，为学生和教育者提供免费套餐。',
          url: 'https://github.com/features/copilot',
          tags: ['AI', '编程助手']
        },
        {
          name: 'Cursor',
          description: 'AI 代码编辑器，基于 GPT-4 免费使用。',
          url: 'https://cursor.sh',
          tags: ['AI', '编辑器']
        },
        {
          name: 'EdgeOne',
          description: '腾讯推出的边缘计算与 CDN 服务，提供免费套餐含中国内地访问加速。',
          url: 'https://edgeone.ai/',
          tags: ['CDN', '边缘计算', '安全']
        },
        {
          name: 'DigitalPlat Domain',
          description: '非营利组织运营的免费公共域名平台，支持 *.dpdns.org、*.qzz.io、*.us.kg 等后缀。',
          url: 'https://domain.digitalplat.org/',
          tags: ['域名', '免费']
        },
        {
          name: 'DNSHE',
          description: '提供永久免费域名注册服务，支持 .de5.net、.us.ci、.cc.cd 等后缀，适合开发者和开源项目。',
          url: 'https://www.dnshe.com/',
          tags: ['域名', '免费']
        }
      ]
    }
  },
  methods: {
    getFavicon(url) {
      try {
        const origin = new URL(url).origin
        return `${origin}/favicon.ico`
      } catch {
        return ''
      }
    },

    resetCard(cardEl) {
      this.cardTimers.forEach(clearTimeout)
      this.cardTimers = []
      if (cardEl) {
        cardEl.style.transition = ''
        cardEl.style.opacity    = ''
        cardEl.style.visibility = ''
        cardEl.style.transform  = ''
      }
    },

    showFreebieDetail(freebie, index) {
      if (this.activeCardEl) this.resetCard(this.activeCardEl)
      const card = this.cardRefs[index]
      if (!card) return

      card.style.transition = 'opacity 0.2s ease'
      card.style.opacity = '0'
      const t1 = setTimeout(() => {
        if (this.activeCardEl === card) card.style.visibility = 'hidden'
      }, 210)
      this.cardTimers.push(t1)

      this.activeFreebie   = { ...freebie }
      this.activeCardEl    = card
      this.activeCardIndex = index
      this.modalVisible    = true
    },

    handleModalClose() {
      this.modalVisible = false
    },

    handleCardReveal() {
      if (!this.activeCardEl) return
      const card = this.activeCardEl
      this.cardTimers.forEach(clearTimeout)
      this.cardTimers = []

      card.style.transition = 'none'
      card.style.transform  = 'none'
      card.style.opacity    = '1'
      card.style.visibility = 'visible'
      card.offsetHeight

      card.style.transform  = ''
      card.style.opacity    = ''
      card.style.visibility = ''
      card.offsetHeight

      card.style.transition = ''
      this.activeCardEl = null
    }
  }
}
</script>

<style scoped>
.freebies-page {
  min-height: 100vh;
  background-color: transparent;
}

.freebies-hero {
  padding: 100px 24px 60px;
  text-align: center;
  position: relative;
}

.freebies-hero-inner {
  max-width: 640px;
  margin: 0 auto;
}

.freebies-hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  animation: freebiesFadeInDown 0.7s ease;
}

.freebies-hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 400;
  animation: freebiesFadeInUp 0.7s ease 0.15s both;
}

.freebies-hero-divider {
  width: 48px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 2px;
  margin: 28px auto 0;
  animation: freebiesFadeInUp 0.7s ease 0.3s both;
}

.freebies-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.freebies-section {
  margin-bottom: 72px;
}

.freebies-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.freebie-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  padding: 20px 24px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  position: relative;
  box-shadow:
    rgba(0, 0, 0, 0.18) 0px 8px 32px 0px,
    rgba(255, 255, 255, 0.30) 0px 1px 0px 0px inset,
    rgba(255, 255, 255, 0.05) 0px -1px 0px 0px inset;
}

.freebie-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.35),
    inset 0 2px 12px rgba(255, 255, 255, 0.08),
    inset 0 -2px 12px rgba(0, 0, 0, 0.15);
}

.freebie-card:hover .freebie-card-arrow {
  transform: translateX(4px);
  color: #93c5fd;
}

.freebie-card-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  background: rgba(147, 197, 253, 0.15);
  color: #93c5fd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.freebie-favicon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 6px;
}

.freebie-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.freebie-card-name {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.freebie-card-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
  line-height: 1.5;
}

.freebie-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.tag-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(147, 197, 253, 0.15);
  color: #93c5fd;
  border: 1px solid rgba(147, 197, 253, 0.2);
}

.freebie-card-arrow {
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  min-width: 16px;
}

@keyframes freebiesFadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes freebiesFadeInUp {
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
  .freebies-hero {
    padding: 72px 20px 40px;
  }

  .freebies-hero-title {
    font-size: 2.2rem;
  }

  .freebies-hero-subtitle {
    font-size: 1rem;
  }

  .freebies-content {
    padding: 0 16px 60px;
  }

  .freebie-card {
    padding: 16px 18px;
  }

  .freebie-card-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }

  .freebie-card-name {
    font-size: 0.95rem;
  }

  .freebie-card-desc {
    font-size: 0.8rem;
  }
}
</style>
