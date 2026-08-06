// Google AdSense 共享工具：脚本全局只注入一次，多组件并发调用不重复加载

export const AD_CLIENT_ID = 'ca-pub-8020398381754493';

// 缓存加载 Promise，避免多个组件同时挂载时重复注入脚本
let scriptPromise = null;

/**
 * 加载 AdSense 脚本（全局仅注入一次）。
 * 脚本已在页面中（window.adsbygoogle 存在）时直接 resolve。
 */
export const loadAdSenseScript = () => {
  if (window.adsbygoogle) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('AdSense 脚本加载失败'));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

/** 触发广告填充，push 失败静默处理，不打断页面 */
export const pushAd = () => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (err) {
    console.error('[adsense] 广告投放失败', err);
  }
};

/**
 * 监听广告是否填充成功，未填充时通知调用方收起容器。
 *
 * AdSense 无广告可投时不会报错，而是给 <ins> 打上
 * data-ad-status="unfilled"。不处理的话容器仍占着固定高度，
 * 页面上会留一块空白玻璃板（词条列表里就是缺一格卡片）。
 *
 * 用 MutationObserver 盯这个属性：它由外部脚本异步写入，
 * 时机不确定，一次性读取往往赶在写入之前。
 *
 * @param {HTMLElement} el 广告的 <ins> 元素
 * @param {(filled: boolean) => void} onResolved 填充结果回调
 * @returns {() => void} 清理函数，组件卸载时调用
 */
export const observeAdStatus = (el, onResolved) => {
  if (!el) return () => {};

  // 属性可能在挂载前就已写好，先查一次
  const current = el.getAttribute('data-ad-status');
  if (current) {
    onResolved(current === 'filled');
    return () => {};
  }

  const observer = new MutationObserver(() => {
    const status = el.getAttribute('data-ad-status');
    if (!status) return;
    observer.disconnect();
    clearTimeout(timer);
    onResolved(status === 'filled');
  });
  observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });

  /* 兜底：脚本被拦截器挡掉时属性永远不会出现，
     observer 不会触发，容器就一直空占位置。10 秒后按未填充处理。 */
  const timer = setTimeout(() => {
    observer.disconnect();
    onResolved(false);
  }, 10000);

  return () => {
    observer.disconnect();
    clearTimeout(timer);
  };
};
