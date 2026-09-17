# 跨市场脉冲

美股当日行情、热门板块/个股与 A 股映射次日影响看板。

## 数据口径

- 页面打开后优先从 Yahoo Finance chart 公共接口实时拉取 1 日 5 分钟行情。
- GitHub Actions 工作日每 5 分钟抓取一次真实行情，写入 `public/data/latest.json`，浏览器直连失败时读取最近一次成功快照。
- 页面不包含演示行情；实时源和云端快照都不可用时显示明确错误与空状态。
- A 股映射为基于产业链、业务相似度和风险偏好的规则化研判，不是统计预测，也不构成投资建议。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：`npm run build`。

## GitHub Pages

`deploy.yml` 使用 GitHub Actions 构建并部署 `dist`；`collect.yml` 负责定时更新行情快照。首次部署前，请在仓库 Settings → Pages 将 Source 设为 GitHub Actions。
