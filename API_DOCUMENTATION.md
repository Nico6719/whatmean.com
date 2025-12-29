# API 调用文档

本文档详细描述了heyiwei-web项目的API接口规范。

## 基础信息

- 项目类型：静态前端应用
- 技术栈：Vue 3 + Vite + Axios
- 数据来源：本地JSON文件（位于`entry`目录）
- API服务：使用Vite的`import.meta.glob`动态导入JSON文件

## 项目架构

本项目采用前后端分离的静态单页应用（SPA）架构，前端负责数据渲染，词条内容以静态JSON文件形式组织，无后端服务依赖，适合静态托管。

## API 接口

### 1. 获取所有词条

#### 方法说明
从`entry`目录下获取所有JSON词条文件的数据。

#### 函数签名
```javascript
getEntries: async () => Promise<Array>
```

#### 实现方式
1. 使用`import.meta.glob('../../entry/*.json', { eager: true, import: 'default' })`动态导入所有JSON文件
2. 将导入的模块转换为统一格式的entries数组
3. 如果有静态数据则返回，否则回退到API调用

#### 返回值
``json
[
  {
    "id": 1,
    "name": "示例词条",
    "explanation": "这是词条的简要介绍，通常是一句话概括。",
    "detail": "这里是词条的详细解释和背景信息...",
    "year": 2025,
    "tags": "示例,网络用语,流行文化",
    "词条名": "示例词条",
    "词条介绍": "这是词条的简要介绍，通常是一句话概括。",
    "详细介绍": "这里是词条的详细解释和背景信息...",
    "词条年份": 2025,
    "提交时间": "2025-12-17 10:00:00",
    "标签": "示例,网络用语,流行文化"
  }
]
```

#### 字段说明
- `id`: 条词唯一标识（自动生成）
- `name`: 条词名称（从`词条名`字段映射）
- `explanation`: 条词简介（从`词条介绍`字段映射）
- `detail`: 详细介绍（从`详细介绍`字段映射）
- `year`: 年份（从`词条年份`字段映射）
- `tags`: 标签（从`标签`字段映射）
- 其他原始JSON字段也会保留

### 2. 根据ID获取词条

#### 方法说明
根据ID获取指定的词条数据。

#### 函数签名
```javascript
getEntryById: async (id) => Promise<Object>
```

#### 实现方式
1. 首先尝试从静态数据中查找对应ID的词条
2. 如果找到则直接返回，否则回退到API调用

#### 参数
- `id`: 条词ID（数字或字符串）

#### 返回值
``json
{
  "id": 1,
  "name": "示例词条",
  "explanation": "这是词条的简要介绍，通常是一句话概括。",
  "detail": "这里是词条的详细解释和背景信息...",
  "year": 2025,
  "tags": "示例,网络用语,流行文化"
}
```

### 3. 搜索词条

#### 方法说明
根据关键词搜索词条，支持在名称、简介和详细内容中搜索。

#### 函数签名
```javascript
searchEntries: async (query) => Promise<Array>
```

#### 实现方式
1. 在静态数据中搜索包含查询关键词的词条
2. 搜索范围包括：name、explanation和detail字段
3. 如果有静态数据则返回匹配结果，否则回退到API调用

#### 参数
- `query`: 搜索关键词

#### 返回值
返回包含关键词的词条数组，格式同[获取所有词条](#返回值)

### 4. 创建词条（预留接口）

#### 方法说明
创建新词条（当前实现仅调用API，实际数据管理需通过添加JSON文件完成）。

#### 函数签名
```javascript
createEntry: async (entry) => Promise<Object>
```

#### 实现方式
调用API端点创建词条，但当前项目使用静态文件，需手动添加JSON文件到`entry`目录。

#### 参数
- `entry`: 包含词条信息的对象

#### 返回值
创建成功的词条对象

### 5. 更新词条（预留接口）

#### 方法说明
更新指定ID的词条（当前实现仅调用API，实际数据管理需通过修改JSON文件完成）。

#### 函数签名
```javascript
updateEntry: async (id, entry) => Promise<Object>
```

#### 参数
- `id`: 条词ID
- `entry`: 更新后的词条信息对象

#### 返回值
更新后的词条对象

### 6. 删除词条（预留接口）

#### 方法说明
删除指定ID的词条（当前实现仅调用API，实际数据管理需通过删除JSON文件完成）。

#### 函数签名
```javascript
deleteEntry: async (id) => Promise<Object>
```

#### 参数
- `id`: 条词ID

#### 返回值
操作结果对象

## 数据结构

### JSON文件格式

`entry`目录下的JSON文件应包含以下字段：

```json
{
  "词条名": "示例词条",
  "词条介绍": "这是词条的简要介绍，通常是一句话概括。",
  "详细介绍": "这里是词条的详细解释和背景信息...",
  "词条年份": 2025,
  "提交时间": "2025-12-17 10:00:00",
  "标签": "示例,网络用语,流行文化"
}
```

### 字段映射

API会将中文字段名映射为英文字段名：

| 中文字段 | 英文字段 | 说明 |
|---------|---------|------|
| 词条名 | name | 条词名称 |
| 词条介绍 | explanation | 条词简介 |
| 详细介绍 | detail | 详细内容 |
| 词条年份 | year | 年份 |
| 标签 | tags | 标签列表 |

## 使用示例

### 在组件中使用

```
import { entriesApi } from '../services/api';

// 获取所有词条
const entries = await entriesApi.getEntries();

// 根据ID获取词条
const entry = await entriesApi.getEntryById(1);

// 搜索词条
const searchResults = await entriesApi.searchEntries('关键词');
```

## 环境配置

### API基础URL

API客户端使用环境变量`VITE_API_BASE_URL`配置基础URL：

```javascript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

在`.env`文件中可以配置：

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 克隆优化

由于词条数据存储在[entry](/heyiwei-web/entry)目录下，当词条数量增加时，仓库可能会变得非常大。为了优化克隆速度和减少磁盘占用，您可以使用 Git 的 Partial Clone 和 Sparse Checkout 功能：

### 方法一：使用Partial Clone
```
git clone --filter=blob:none https://github.com/Nico6719/whatmean.com.git
```

### 方法二：使用Sparse Checkout
```
git clone --no-checkout https://github.com/Nico6719/whatmean.com.git
cd whatmean.com
git sparse-checkout init
git config core.sparseCheckout true
echo "/*" >> .git/info/sparse-checkout
echo "!/entry/" >> .git/info/sparse-checkout
git checkout
```

使用这些技术，您可以避免下载大量的词条文件，从而显著减少克隆时间和磁盘占用。
