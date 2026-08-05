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
