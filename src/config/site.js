/**
 * 站点规范地址，全站唯一来源。
 *
 * canonical / og:url / sitemap / 结构化数据都从这里取，避免各文件
 * 各写一份导致互相矛盾（此前 index.html 的 canonical 写 punycode 域名，
 * 而 JSON-LD 里写的是 GitHub 仓库名 whatmean.com，那不是本站地址）。
 *
 * 中文域名必须用 punycode 形式：何意味.com -> xn--vqqq8jxym.com
 * 搜索引擎与各类爬虫对 punycode 的支持一致，中文原文则未必。
 *
 * demo 环境可通过 VITE_SITE_URL 覆盖。
 */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://xn--vqqq8jxym.com';

/**
 * 后端接口地址，api.js 和 ads.js 共用。
 *
 * 以前两个文件各写一份 `VITE_API_BASE_URL || 'http://localhost:3000/api'`，
 * 而生产环境没有配这个变量，于是 http://localhost:3000/api 被原样烧进
 * 生产产物 —— 线上每个请求都打向访客自己的机器。
 *
 * 现在生产构建下留空即回落到同源 /api：接口没上线时请求会失败，
 * 但失败在自己域名上，且两处调用都有 catch 兜底，不会污染页面。
 */
export const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured;
  return import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
};

export default SITE_URL;
