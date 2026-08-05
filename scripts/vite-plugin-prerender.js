import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve, basename } from 'path'

/**
 * 词条详情页预渲染 + sitemap 生成。
 *
 * 为什么要预渲染：词条内容以前只作为弹窗存在于 /entries，48 个词条
 * 在搜索引擎眼里一条都不存在。"栓Q 什么意思"这类长尾查询本该是这个站
 * 最主要的入口，却完全接不到。
 *
 * 为什么不靠 SPA 回退：纯客户端渲染时爬虫拿到的是空壳 HTML，
 * 词条正文要等 JS 执行完才出现。这里直接把标题、简介、正文写进
 * HTML 源码，任何爬虫首字节就能读到。
 *
 * 顺带解决：每页独立 title / description / canonical / JSON-LD，
 * 以及 sitemap 自动包含全部词条（手写的那份漏了 /freebies，
 * 而且不可能手工维护 48 条词条）。
 */

// 注入 HTML 属性和文本的转义，词条内容含引号和尖括号时不能直接拼接
const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// JSON-LD 内部的字符串，另外要防止 </script> 提前闭合脚本块
const escapeJsonLd = (value) =>
  JSON.stringify(String(value ?? '')).replace(/</g, '\\u003c')

// meta description 压成单行并截断，过长会被搜索引擎截掉
const toDescription = (text, limit = 150) => {
  const flat = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
  return flat.length > limit ? `${flat.slice(0, limit - 1)}…` : flat
}

const readEntries = (entryDir) => {
  if (!existsSync(entryDir)) return []

  return readdirSync(entryDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      const slug = basename(name, '.json')
      try {
        const raw = JSON.parse(readFileSync(join(entryDir, name), 'utf-8'))
        return {
          slug,
          name: raw['词条名'] || slug,
          explanation: raw['词条介绍'] || '',
          detail: raw['详细介绍'] || '',
          year: raw['词条年份'] || '',
          tags: raw['标签'] || '',
          submittedAt: raw['提交时间'] || ''
        }
      } catch (error) {
        console.error(`[prerender] 解析 ${name} 失败:`, error.message)
        return null
      }
    })
    .filter(Boolean)
}

/**
 * 从模板里摘掉首页专用的 SEO 标签，再注入词条自己的。
 * 不这么做的话每个词条页都会带着首页的 title 和 canonical，
 * 等于 48 个页面互相声明"我的规范地址是首页"。
 */
const stripSeoTags = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    // robots 也要摘：noindex 模式下若留着模板里的 index,follow，
    // 一个 head 里就会同时出现两条互相矛盾的指令
    .replace(/<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="keywords"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')

const buildHead = (entry, siteUrl, noindex) => {
  const url = `${siteUrl}/entry/${encodeURIComponent(entry.slug)}`
  const title = `${entry.name}是什么意思？ - 何意味`
  const description = toDescription(entry.explanation || entry.detail)
  const tags = String(entry.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  // 手工拼 JSON-LD 字符串，保证词条文本里的 < 被转义
  const jsonLdText = `{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": ${escapeJsonLd(entry.name)},
  "description": ${escapeJsonLd(entry.explanation || entry.detail)},
  "url": ${escapeJsonLd(url)},
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "何意味 - 网络热梗百科",
    "url": ${escapeJsonLd(siteUrl)}
  }
}`

  /* demo / 预览环境：整站 noindex。
   * 不这么做的话 demo.何意味.com 会和生产站输出逐字相同的 48 个词条页，
   * 两边互为重复内容，搜索引擎只会保留其中一个，很可能保留的是 demo。 */
  const robots = noindex ? 'noindex, nofollow' : 'index, follow'

  return `
    <meta name="robots" content="${robots}" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml([entry.name, ...tags, '网络热梗', '什么意思'].join(','))}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:site_name" content="何意味" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:image" content="${escapeHtml(siteUrl)}/logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(siteUrl)}/logo.png" />
    <script type="application/ld+json">
${jsonLdText}
    </script>
`
}

/**
 * 首屏可见的词条正文。
 *
 * 写在 #app 里面：Vue 挂载时会替换掉这块内容，属于预渲染的标准做法。
 * 不用 display:none 之类的隐藏手法 —— 对爬虫可见而对用户不可见
 * 属于作弊信号，会被判为 cloaking。
 */
const buildBody = (entry) => {
  const tags = String(entry.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const tagHtml = tags.length
    ? `<p class="pr-tags">${tags.map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</p>`
    : ''

  const detailHtml = entry.detail
    ? `<h2>详细介绍</h2><p>${escapeHtml(entry.detail)}</p>`
    : ''

  return `<article class="pr-entry">
      <h1>${escapeHtml(entry.name)}</h1>
      <p class="pr-year">${escapeHtml(entry.year || '未知年份')}</p>
      <p class="pr-lead">${escapeHtml(entry.explanation)}</p>
      ${detailHtml}
      ${tagHtml}
    </article>`
}

// 预渲染内容的兜底样式：深色背景下保证可读，避免挂载前一瞬间的白底黑字
const PRERENDER_STYLE = `
    <style>
      .pr-entry{max-width:820px;margin:0 auto;padding:96px 24px 48px;color:#fff;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
      .pr-entry h1{font-size:2rem;margin:0 0 8px}
      .pr-entry h2{font-size:1.1rem;margin:24px 0 8px;color:rgba(255,255,255,.75)}
      .pr-entry p{line-height:1.9;color:rgba(255,255,255,.85);margin:0 0 12px}
      .pr-year{color:rgba(255,255,255,.5);font-size:.9rem}
      .pr-tags span{display:inline-block;margin:0 6px 6px 0;padding:4px 12px;border-radius:12px;background:rgba(255,255,255,.12);font-size:.8rem}
    </style>`

const buildSitemap = (entries, siteUrl) => {
  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/entries', changefreq: 'daily', priority: '0.9' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/entry-generator', changefreq: 'monthly', priority: '0.6' },
    { path: '/friends', changefreq: 'monthly', priority: '0.5' },
    // 手写的那份漏了这一页
    { path: '/freebies', changefreq: 'weekly', priority: '0.6' }
  ]

  const urls = staticPages.map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )

  for (const entry of entries) {
    // 提交时间形如 "2026-03-14 22:55:00"，取日期部分作为 lastmod
    const lastmod = /^\d{4}-\d{2}-\d{2}/.test(entry.submittedAt)
      ? `\n    <lastmod>${entry.submittedAt.slice(0, 10)}</lastmod>`
      : ''
    urls.push(`  <url>
    <loc>${siteUrl}/entry/${encodeURIComponent(entry.slug)}</loc>${lastmod}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

export default function prerenderPlugin(options = {}) {
  const entryDir = options.entryDir || resolve(process.cwd(), 'entry')
  const siteUrl = (options.siteUrl || 'https://xn--vqqq8jxym.com').replace(/\/$/, '')
  const noindex = Boolean(options.noindex)
  let outDir = 'dist'

  return {
    name: 'vite-plugin-prerender',
    apply: 'build',

    configResolved(config) {
      outDir = config.build.outDir || 'dist'
    },

    // closeBundle 而非 writeBundle：确保 index.html 已经落盘再去读它，
    // 这样模板里的脚本和样式引用已经是带 hash 的最终文件名
    closeBundle() {
      const distDir = resolve(process.cwd(), outDir)
      const templatePath = join(distDir, 'index.html')

      if (!existsSync(templatePath)) {
        console.warn('[prerender] 找不到 dist/index.html，跳过预渲染')
        return
      }

      const entries = readEntries(entryDir)
      if (entries.length === 0) {
        console.warn('[prerender] entry 目录没有词条，跳过预渲染')
        return
      }

      const template = readFileSync(templatePath, 'utf-8')
      const stripped = stripSeoTags(template)
      const start = Date.now()

      for (const entry of entries) {
        const head = buildHead(entry, siteUrl, noindex) + PRERENDER_STYLE
        const html = stripped
          .replace('</head>', `${head}  </head>`)
          .replace('<div id="app"></div>', `<div id="app">${buildBody(entry)}</div>`)

        const dir = join(distDir, 'entry', entry.slug)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), html, 'utf-8')
      }

      if (noindex) {
        /* 首页模板也补一份 noindex，并把 robots.txt 整体改成禁止抓取。
         * robots.txt 的 Disallow 只拦抓取、不保证从已有索引里删除，
         * 所以两层都要有：meta 负责去索引，robots.txt 负责别再来。
         * 同时不输出 sitemap —— 主动提交一份自己声明 noindex 的地址列表没有意义。 */
        writeFileSync(
          templatePath,
          template
            .replace(/<meta\s+name="robots"[^>]*>/gi, '')
            .replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n  </head>'),
          'utf-8'
        )
        writeFileSync(
          join(distDir, 'robots.txt'),
          'User-agent: *\nDisallow: /\n',
          'utf-8'
        )
        console.log(
          `[prerender] 已生成 ${entries.length} 个词条页（noindex 模式，不输出 sitemap，${Date.now() - start}ms）`
        )
        return
      }

      writeFileSync(join(distDir, 'sitemap.xml'), buildSitemap(entries, siteUrl), 'utf-8')

      console.log(
        `[prerender] 已生成 ${entries.length} 个词条页 + sitemap（${Date.now() - start}ms）`
      )
    }
  }
}
