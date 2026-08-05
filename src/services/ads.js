import axios from 'axios';

// 广告接口客户端，与 entriesApi 共用同一个后端地址
const adsClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 广告位标识，新增广告位时在这里登记，避免各处硬编码字符串
export const AD_POSITIONS = {
  FOOTER_BRAND: 'footer-brand',   // 页脚左侧，品牌简介下方
  FOOTER_BANNER: 'footer-banner'  // 页脚右侧横幅
};

// 是否启用广告请求，未配置时默认关闭，广告位只展示本站加群卡片
const ADS_ENABLED = String(import.meta.env.VITE_ADS_ENABLED) === 'true';

// QQ 群加群链接，未配置时广告位不渲染
const QQ_GROUP_URL = import.meta.env.VITE_QQ_GROUP_URL || '';

// 只接受 http(s) 链接，挡掉 javascript: 之类的伪协议
const safeUrl = (value) => {
  if (!value) return '';
  try {
    const parsed = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
};

/**
 * 本站加群卡片：没有外部广告可投时填充广告位。
 * 属于自家内容，不标注“广告”字样。
 * 未配置群链接则返回 null，广告位留空。
 */
const groupAd = (position) => {
  const linkUrl = safeUrl(QQ_GROUP_URL);
  if (!linkUrl) return null;

  return {
    id: '',
    position,
    type: 'text',
    title: '加入何意味交流群',
    description: '一起收集新梗、讨论词条，点击加入 QQ 群。',
    imageUrl: '',
    linkUrl,
    labeled: false
  };
};

/**
 * 把后端返回的数据规整成组件使用的结构。
 * 兼容后端字段的下划线 / 驼峰两种写法。
 */
const normalizeAd = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const linkUrl = raw.linkUrl || raw.link_url || raw.url || '';
  const imageUrl = raw.imageUrl || raw.image_url || raw.image || '';

  const ad = {
    id: raw.id ?? raw.adId ?? '',
    position: raw.position || '',
    // image：图片广告；text：纯文字广告
    type: raw.type || (imageUrl ? 'image' : 'text'),
    title: raw.title || '',
    description: raw.description || raw.desc || '',
    imageUrl: safeUrl(imageUrl),
    linkUrl: safeUrl(linkUrl),
    // 是否标注“广告”字样，默认标注
    labeled: raw.labeled !== false
  };

  // 图片广告缺图、文字广告缺标题都视为无效，不渲染
  if (ad.type === 'image' && !ad.imageUrl) return null;
  if (ad.type === 'text' && !ad.title) return null;

  return ad;
};

export const adsApi = {
  /**
   * 获取指定广告位的内容。
   * 没有外部广告时回落到本站加群卡片，不抛错影响页面。
   */
  getAd: async (position) => {
    if (!position) return null;
    if (!ADS_ENABLED) return groupAd(position);

    try {
      const response = await adsClient.get('/ads', { params: { position } });
      const payload = response.data;
      // 兼容 { data: [...] } / [...] / {...} 三种返回
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [payload?.data ?? payload];

      return normalizeAd(list[0]) || groupAd(position);
    } catch (error) {
      console.warn(`[ads] 获取广告位 ${position} 失败:`, error.message);
      return groupAd(position);
    }
  },

  /**
   * 批量获取多个广告位，返回 { [position]: ad | null }
   */
  getAds: async (positions = []) => {
    const results = await Promise.all(positions.map((p) => adsApi.getAd(p)));
    return positions.reduce((acc, position, index) => {
      acc[position] = results[index];
      return acc;
    }, {});
  },

  // 曝光 / 点击上报，失败静默处理
  report: (event, ad) => {
    if (!ADS_ENABLED || !ad?.id) return;
    adsClient
      .post('/ads/events', { adId: ad.id, position: ad.position, event })
      .catch(() => {});
  }
};

export default adsApi;
