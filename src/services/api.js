import axios from 'axios';
import { resolveApiBaseUrl } from '../config/site';

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// 编译时导入 entry 目录下所有 JSON
const entryModules = import.meta.glob('../../entry/*.json', { eager: true, import: 'default' });

// 处理文本内容中的换行符
const processTextContent = (text) => {
  if (typeof text === 'string') {
    return text.replace(/\\n/g, '\n');
  }
  return text;
};

/**
 * 从文件路径取出 slug（去掉目录和 .json 后缀）。
 *
 * 用文件名而不是数组下标做标识：下标会随 glob 顺序变化，
 * 中间插入一个新词条就会让它后面所有词条的 id 全部位移，
 * 分享出去的链接第二天指向别的词条。
 */
const slugFromPath = (filePath) => filePath.split('/').pop().replace(/\.json$/, '');

export const staticEntries = Object.entries(entryModules).map(([filePath, data]) => {
  const slug = slugFromPath(filePath);
  return {
    // slug 即 id：稳定、唯一、可读，可直接用于 URL
    id: slug,
    slug,
    name: processTextContent(data['词条名']) || slug,
    explanation: processTextContent(data['词条介绍']) || '',
    detail: processTextContent(data['详细介绍']) || '',
    year: processTextContent(data['词条年份']) || '',
    tags: processTextContent(data['标签']) || '',
    ...Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, processTextContent(value)])
    )
  };
});

/**
 * 检索用的归一化：全角转半角、英文转小写、去空白。
 *
 * 只做 toLowerCase 对中文是空操作，等于中文词条完全没有做过归一化；
 * 而全角字符（例如"栓Ｑ"里的Ｑ）在词条和用户输入里都可能出现，
 * 不折叠就搜不到。
 */
const normalize = (text) =>
  String(text ?? '')
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ')
    .toLowerCase()
    .trim();

// 每个词条的检索索引，包含名称、简介、详情、标签、年份
const searchIndex = staticEntries.map((entry) => ({
  entry,
  haystack: normalize(
    [entry.name, entry.explanation, entry.detail, entry.tags, entry.year].join(' ')
  )
}));

export const entriesApi = {
  // 获取所有词条
  getEntries: async () => {
    try {
      if (staticEntries.length > 0) {
        return staticEntries;
      }
      const response = await apiClient.get('/entries');
      return response.data;
    } catch (error) {
      console.error('获取所有词条失败:', error);
      throw error;
    }
  },

  // 根据 slug（即 id）获取词条
  getEntryById: async (id) => {
    try {
      const staticEntry = staticEntries.find((entry) => entry.id === String(id));
      if (staticEntry) {
        return staticEntry;
      }
      const response = await apiClient.get(`/entries/${encodeURIComponent(id)}`);
      return response.data;
    } catch (error) {
      console.error(`获取词条 ${id} 失败:`, error);
      throw error;
    }
  },

  // 同步取词条，供详情页首屏直接渲染，避免多一次 await 造成闪白
  getEntryBySlugSync: (slug) =>
    staticEntries.find((entry) => entry.slug === String(slug)) || null,

  // 创建新词条
  createEntry: async (entry) => {
    try {
      const response = await apiClient.post('/entries', entry);
      return response.data;
    } catch (error) {
      console.error('创建词条失败:', error);
      throw error;
    }
  },

  // 更新词条
  updateEntry: async (id, entry) => {
    try {
      const response = await apiClient.put(`/entries/${encodeURIComponent(id)}`, entry);
      return response.data;
    } catch (error) {
      console.error(`更新词条 ${id} 失败:`, error);
      throw error;
    }
  },

  // 删除词条
  deleteEntry: async (id) => {
    try {
      const response = await apiClient.delete(`/entries/${encodeURIComponent(id)}`);
      return response.data;
    } catch (error) {
      console.error(`删除词条 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 搜索词条。命中范围含标签和年份 ——
   * 以前只搜名称、简介、详情，输入"谐音"或"2022"一条都搜不出来，
   * 而标签正是这个站最自然的检索入口。
   */
  searchEntries: async (query) => {
    try {
      if (searchIndex.length > 0) {
        const keywords = normalize(query).split(/\s+/).filter(Boolean);
        if (keywords.length === 0) return staticEntries;
        // 多关键词取交集，"2022 谐音"只出同时命中两者的词条
        return searchIndex
          .filter(({ haystack }) => keywords.every((kw) => haystack.includes(kw)))
          .map(({ entry }) => entry);
      }

      const response = await apiClient.get('/entries/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('搜索词条失败:', error);
      throw error;
    }
  }
};

export default entriesApi;
