<template>
  <div class="friends-page">
    <div class="container-fluid px-4 px-md-5 py-5">
      <div class="row">
        <div class="col-12 text-center mb-5">
          <h1 class="display-4 fw-bold text-primary">友情链接</h1>
          <p class="lead text-white-50 mt-3">以下是我们推荐的一些优秀网站：</p>
        </div>
      </div>
      
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="row">
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4" v-for="friend in friends" :key="friend.name">
              <div class="card border-0 liquid-glass-card h-100">
                <div class="liquid-glass-card-hover">
                  <div class="card-body p-4">
                    <h5 class="card-title mb-3">{{ friend.name }}</h5>
                    <p class="card-text text-muted">{{ friend.description }}</p>
                    <a :href="friend.url" target="_blank" class="text-decoration-none d-block">
                      <LiquidGlassButton hoverEffect>
                        访问网站
                      </LiquidGlassButton>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LiquidGlassCard from '@/components/LiquidGlassCard.vue';
import LiquidGlassButton from '@/components/LiquidGlassButton.vue';

export default {
  name: 'Friends',
  components: {
    LiquidGlassCard,
    LiquidGlassButton
  },
  data() {
    return {
      friends: [
        {
          name: '冰晶石的个人小站',
          description: '致力于分享最前端优质内容。',
          url: 'https://blog.na3alf6.cn/'
        },
        {
          name: 'Edgeone 官网',
          description: '亚洲最快CDN，本网站正在使用。',
          url: 'https://edgeone.ai/'
        },
        {
          name: 'MineBBS 论坛',
          description: '最大MC中文交流社区。',
          url: 'https://www.minebbs.com/'
        },
        {
          name: 'MDN Web 文档',
          description: '网络开发文档',
          url: 'https://developer.mozilla.org/'
        },
        {
          name: 'Bootstrap',
          description: '最受欢迎的前端框架',
          url: 'https://getbootstrap.com/'
        },
        {
          name: 'Stack Overflow',
          description: '程序员问答社区',
          url: 'https://stackoverflow.com/'
        }
      ]
    }
  }
}
</script>

<style scoped>
.friends-page {
  background-color: transparent;
  min-height: 100vh;
}

.liquid-glass-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.1),
    inset 0 2px 8px rgba(255, 255, 255, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.liquid-glass-card::before {
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

.liquid-glass-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 
    0 20px 50px rgba(31, 38, 135, 0.25),
    inset 0 2px 15px rgba(255, 255, 255, 0.5),
    inset 0 -2px 15px rgba(0, 0, 0, 0.1);
}

.liquid-glass-card:hover::before {
  top: -18px;
  left: -18px;
  right: -18px;
  bottom: -18px;
}

.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-title {
  font-weight: 600;
  color: #333;
  font-size: 1.25rem;
}

.card-text {
  flex-grow: 1;
  margin-bottom: 1.5rem;
  color: #6c757d;
}

.display-4 {
  animation: fadeInDown 0.8s ease;
}

.card {
  animation: fadeInUp 0.6s ease;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .card-body {
    padding: 16px !important;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>