<template>
  <div class="entry-detail-page">
    <div class="container-fluid px-4 px-md-5 py-4">
      <!-- 词条不存在：给明确提示而不是空白页 -->
      <div v-if="!entry" class="row justify-content-center">
        <div class="col-12 col-md-8 text-center text-white py-5">
          <h1 class="h3 mb-3">没有找到这个词条</h1>
          <p class="text-white-50 mb-4">「{{ slug }}」可能已被移除，或者链接有误。</p>
          <router-link to="/entries" class="btn btn-primary">浏览全部词条</router-link>
        </div>
      </div>

      <article v-else class="row justify-content-center">
        <div class="col-12 col-lg-9 col-xl-8">
          <nav aria-label="面包屑" class="mb-3">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><router-link to="/">首页</router-link></li>
              <li class="breadcrumb-item"><router-link to="/entries">词条</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">{{ entry.name }}</li>
            </ol>
          </nav>

          <div class="detail-card">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge liquid-badge">热梗</span>
              <small class="text-white-50">{{ entry.year || '未知年份' }}</small>
            </div>

            <h1 class="detail-title">{{ entry.name }}</h1>
            <p class="detail-lead">{{ entry.explanation }}</p>

            <div class="detail-divider"></div>

            <section v-if="entry.detail" class="mb-4">
              <h2 class="detail-section-label">详细介绍</h2>
              <p class="detail-text">{{ entry.detail }}</p>
            </section>

            <section class="mb-4">
              <h2 class="detail-section-label">基本信息</h2>
              <dl class="detail-meta mb-0">
                <div class="detail-meta-row">
                  <dt>词条名称</dt>
                  <dd>{{ entry.name }}</dd>
                </div>
                <div class="detail-meta-row">
                  <dt>所属年份</dt>
                  <dd>{{ entry.year || '未知' }}</dd>
                </div>
                <div v-if="entry['提交时间']" class="detail-meta-row">
                  <dt>提交时间</dt>
                  <dd>{{ entry['提交时间'] }}</dd>
                </div>
              </dl>
            </section>

            <section v-if="tagList.length" class="mb-0">
              <h2 class="detail-section-label">相关标签</h2>
              <div class="d-flex flex-wrap gap-2">
                <!-- 标签可点：跳到词条页并带上搜索词 -->
                <router-link
                  v-for="tag in tagList"
                  :key="tag"
                  :to="`/entries?q=${encodeURIComponent(tag)}`"
                  class="badge tag-badge text-decoration-none"
                >{{ tag }}</router-link>
              </div>
            </section>
          </div>

          <div class="mt-4 d-flex flex-wrap gap-2">
            <router-link to="/entries" class="btn btn-outline-light">← 返回词条列表</router-link>
            <router-link to="/entry-generator" class="btn btn-outline-light">提交新词条</router-link>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import entriesApi from '../services/api';
import { SITE_URL } from '../config/site';

const route = useRoute();

// 同步取词条：词条数据在编译时已内联，不需要 await，首屏直接有内容
const slug = computed(() => String(route.params.slug || ''));
const entry = computed(() => entriesApi.getEntryBySlugSync(slug.value));

const tagList = computed(() =>
  (entry.value?.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
);

const canonicalUrl = computed(
  () => `${SITE_URL}/entry/${encodeURIComponent(slug.value)}`
);

// 每个词条一份独立的 title / description / canonical / 结构化数据
const pageTitle = computed(() =>
  entry.value ? `${entry.value.name} 是什么意思？ - 何意味` : '词条未找到 - 何意味'
);

const pageDescription = computed(() => {
  if (!entry.value) return '在何意味浏览全部网络热梗词条。';
  // description 控制在 150 字内，超出截断，避免搜索结果里被切断在半句话
  const text = entry.value.explanation || entry.value.detail || '';
  return text.length > 150 ? `${text.slice(0, 147)}...` : text;
});

useHead(() => ({
  title: pageTitle.value,
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  meta: [
    { name: 'description', content: pageDescription.value },
    { name: 'robots', content: entry.value ? 'index, follow' : 'noindex, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    { property: 'og:url', content: canonicalUrl.value },
    { name: 'twitter:title', content: pageTitle.value },
    { name: 'twitter:description', content: pageDescription.value }
  ],
  script: entry.value
    ? [
        {
          type: 'application/ld+json',
          // DefinedTerm 是词条/术语最贴合的类型，比泛用的 Article 更利于富摘要
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTerm',
            name: entry.value.name,
            description: entry.value.explanation || '',
            url: canonicalUrl.value,
            inDefinedTermSet: {
              '@type': 'DefinedTermSet',
              name: '何意味 - 网络热梗百科',
              url: SITE_URL
            }
          })
        }
      ]
    : []
}));
</script>

<style scoped>
.entry-detail-page {
  min-height: 100vh;
  background-color: transparent;
}

.detail-card {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  box-shadow:
    rgba(0, 0, 0, 0.18) 0 8px 32px 0,
    rgba(255, 255, 255, 0.3) 0 1px 0 0 inset;
}

.detail-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.detail-lead {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
}

.detail-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 1.5rem 0;
}

.detail-section-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.detail-text {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin: 0;
  white-space: pre-line;
}

.detail-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.detail-meta-row:last-child {
  border-bottom: none;
}

.detail-meta-row dt {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  margin: 0;
}

.detail-meta-row dd {
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  text-align: right;
}

.liquid-badge {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  color: #fff;
  border-radius: 20px;
  padding: 0.5em 1em;
  font-weight: 500;
}

.tag-badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  padding: 0.4em 1em;
  transition: all 0.3s ease;
}

.tag-badge:hover,
.tag-badge:focus-visible {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.breadcrumb-item,
.breadcrumb-item a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
}

.breadcrumb-item a:hover,
.breadcrumb-item a:focus-visible {
  color: #fff;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: rgba(255, 255, 255, 0.9);
}

.breadcrumb-item + .breadcrumb-item::before {
  color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 768px) {
  .detail-card {
    padding: 1.5rem;
  }

  .detail-title {
    font-size: 1.6rem;
  }
}
</style>
