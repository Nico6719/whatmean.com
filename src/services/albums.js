/**
 * 相册数据服务：编译时读取 album/*.json，把每张照片编译进产物。
 *
 * 与词条完全一致的构建方式 —— 往 album/ 目录加一个 JSON 就是一张新照片，
 * 提交 git 后由 EdgeOne 自动构建部署，无需任何后端。
 *
 * 每张照片一个 JSON，字段：
 *   标题 / 图片（图床 URL）/ 描述 / 标签（逗号分隔）/ 上传时间 / 来源
 */
const albumModules = import.meta.glob('../../album/*.json', { eager: true, import: 'default' });

// 与词条一致的换行处理：JSON 里写 \n 时渲染成真实换行
const processText = (text) =>
  typeof text === 'string' ? text.replace(/\\n/g, '\n') : text;

// 用文件名做 id：稳定、唯一，不会随 glob 顺序变化
const slugFromPath = (filePath) => filePath.split('/').pop().replace(/\.json$/, '');

export const albumPhotos = Object.entries(albumModules)
  .map(([filePath, data]) => {
    const slug = slugFromPath(filePath);
    return {
      id: slug,
      title: processText(data['标题']) || slug,
      image: processText(data['图片']) || '',
      description: processText(data['描述']) || '',
      tags: processText(data['标签']) || '',
      uploadedAt: processText(data['上传时间']) || '',
      source: processText(data['来源']) || ''
    };
  })
  // 有上传时间的按时间倒序（最新在前），无时间的排最后
  .sort((a, b) => {
    if (a.uploadedAt && b.uploadedAt) return b.uploadedAt.localeCompare(a.uploadedAt);
    if (a.uploadedAt) return -1;
    if (b.uploadedAt) return 1;
    return 0;
  });

export default albumPhotos;
