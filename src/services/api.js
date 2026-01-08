import axios from 'axios';

// 创建Axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 使用 import.meta.glob 在编译时导入所有 entry 目录下的 JSON 文件
const entryModules = import.meta.glob('../../entry/*.json', { eager: true, import: 'default' });

// 处理文本内容中的换行符
const processTextContent = (text) => {
  if (typeof text === 'string') {
    // 将 \n 转换为换行符
    return text.replace(/\\n/g, '\n');
  }
  return text;
};

// 将导入的模块转换为 entries 数组
const staticEntries = Object.entries(entryModules).map(([filePath, data], index) => ({
  id: index + 1,
  name: processTextContent(data['词条名']) || '',
  explanation: processTextContent(data['词条介绍']) || '',
  detail: processTextContent(data['详细介绍']) || '',
  year: processTextContent(data['词条年份']) || '',
  tags: processTextContent(data['标签']) || '',
  ...Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, processTextContent(value)])
  )
}));

// API方法
export const entriesApi = {
  // 获取所有词条
  getEntries: async () => {
    try {
      // 如果有静态数据则返回，否则回退到 API 调用
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

  // 根据ID获取词条
  getEntryById: async (id) => {
    try {
      // 首先尝试从静态数据中查找
      const staticEntry = staticEntries.find(entry => entry.id == id);
      if (staticEntry) {
        return staticEntry;
      }
      
      const response = await apiClient.get(`/entries/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取ID为${id}的词条失败:`, error);
      throw error;
    }
  },

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
      const response = await apiClient.put(`/entries/${id}`, entry);
      return response.data;
    } catch (error) {
      console.error(`更新ID为${id}的词条失败:`, error);
      throw error;
    }
  },

  // 删除词条
  deleteEntry: async (id) => {
    try {
      const response = await apiClient.delete(`/entries/${id}`);
      return response.data;
    } catch (error) {
      console.error(`删除ID为${id}的词条失败:`, error);
      throw error;
    }
  },

  // 搜索词条
  searchEntries: async (query) => {
    try {
      // 先在静态数据中搜索
      if (staticEntries.length > 0) {
        return staticEntries.filter(entry => 
          entry.name.includes(query) || 
          entry.explanation.includes(query) ||
          (entry.detail && entry.detail.includes(query))
        );
      }
      
      const response = await apiClient.get('/entries/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error(`搜索词条失败:`, error);
      throw error;
    }
  }
};

export default entriesApi;