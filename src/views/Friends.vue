<template>
  <div class="friends-page">
    <div class="friends-hero">
      <div class="friends-hero-inner">
        <h1 class="friends-hero-title">友情链接</h1>
        <p class="friends-hero-subtitle">以下是我们推荐的一些优秀网站：</p>
        <div class="friends-hero-divider"></div>
      </div>
    </div>

    <div class="friends-content">
      <div class="friends-section">
        <div class="friends-grid">
          <a
            class="friend-card"
            v-for="friend in friends"
            :key="friend.name"
            :href="friend.url"
            target="_blank"
          >
            <div class="friend-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
                <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"/>
              </svg>
            </div>
            <div class="friend-card-info">
              <h3 class="friend-card-name">{{ friend.name }}</h3>
              <p class="friend-card-desc">{{ friend.description }}</p>
            </div>
            <svg class="friend-card-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Friends',
  head() {
    return {
      title: '友情链接 - 何意味',
      meta: [
        { name: 'description', content: '何意味的友情链接，推荐优秀的合作伙伴网站。' },
        { property: 'og:title', content: '友情链接 - 何意味' },
        { property: 'og:description', content: '何意味推荐的优秀合作伙伴网站。' },
        { property: 'og:url', content: 'https://xn--vqqq8jxym.com/friends' }
      ]
    }
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
          name: '梦涵LOVEの小窝',
          description: '一个一个小涵子的小BLOG，一起来分享生活的小确幸吧~',
          url: 'https://heyuhan.huohuo.ink/'
        }
      ]
    }
  }
}
</script>

<style scoped>
.friends-page {
  min-height: 100vh;
  background-color: transparent;
}

.friends-hero {
  padding: 100px 24px 60px;
  text-align: center;
  position: relative;
}

.friends-hero-inner {
  max-width: 640px;
  margin: 0 auto;
}

.friends-hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  animation: friendsFadeInDown 0.7s ease;
}

.friends-hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 400;
  animation: friendsFadeInUp 0.7s ease 0.15s both;
}

.friends-hero-divider {
  width: 48px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 2px;
  margin: 28px auto 0;
  animation: friendsFadeInUp 0.7s ease 0.3s both;
}

.friends-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.friends-section {
  margin-bottom: 72px;
}

.friends-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.friend-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px 24px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  position: relative;
}

.friend-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.35),
    inset 0 2px 12px rgba(255, 255, 255, 0.08),
    inset 0 -2px 12px rgba(0, 0, 0, 0.15);
}

.friend-card:hover .friend-card-arrow {
  transform: translateX(4px);
  color: #93c5fd;
}

.friend-card-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  background: rgba(147, 197, 253, 0.15);
  color: #93c5fd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.friend-card-name {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.friend-card-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
  line-height: 1.5;
}

.friend-card-arrow {
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  min-width: 16px;
}

@keyframes friendsFadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes friendsFadeInUp {
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
  .friends-hero {
    padding: 72px 20px 40px;
  }

  .friends-hero-title {
    font-size: 2.2rem;
  }

  .friends-hero-subtitle {
    font-size: 1rem;
  }

  .friends-content {
    padding: 0 16px 60px;
  }

  .friend-card {
    padding: 16px 18px;
  }

  .friend-card-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }

  .friend-card-name {
    font-size: 0.95rem;
  }

  .friend-card-desc {
    font-size: 0.8rem;
  }
}
</style>

