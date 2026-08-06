<template>
  <div class="notfound-page">
    <div class="container-fluid px-4 px-md-5 py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="notfound-card">
            <p class="notfound-code">404</p>
            <h1 class="notfound-title">这个梗还没被收录</h1>
            <p class="notfound-desc">
              页面不存在，可能是链接写错了，或者词条已经改名。
            </p>
            <div class="notfound-actions">
              <router-link to="/" class="btn btn-primary">回首页</router-link>
              <router-link to="/entries" class="btn btn-outline-light">浏览全部词条</router-link>
              <router-link to="/entry-generator" class="btn btn-outline-light">
                提交这个梗
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue';
import { SITE_URL } from '../config/site';

/* 404 页必须 noindex：否则搜索引擎会把大量错误链接当正常页面收录，
   稀释站点权重。软 404（返回 200 的错误页）是 SEO 常见坑。 */
useHead({
  title: '页面不存在 - 何意味',
  meta: [
    { name: 'robots', content: 'noindex, follow' },
    { name: 'description', content: '页面不存在。返回何意味首页浏览网络热梗词条。' }
  ],
  link: [{ rel: 'canonical', href: `${SITE_URL}/` }]
});
</script>

<style scoped>
.notfound-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.notfound-card {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow:
    rgba(0, 0, 0, 0.18) 0 8px 32px 0,
    rgba(255, 255, 255, 0.3) 0 1px 0 0 inset;
}

.notfound-code {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
  margin: 0 0 0.5rem;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 0.05em;
}

.notfound-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
}

.notfound-desc {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

.notfound-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

@media (max-width: 576px) {
  .notfound-card {
    padding: 2rem 1.25rem;
  }
  .notfound-actions .btn {
    width: 100%;
  }
}
</style>
