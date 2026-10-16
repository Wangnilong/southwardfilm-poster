# 一起做电影海报工坊

欢迎第一次写 PR 的朋友。修一个交互问题、补一个清晰的复现步骤、改一句文档，都是有用的贡献。

## 开始之前

1. 打开[在线体验](https://poster.southwardfilm.cn/)，了解实际效果。
2. 读一下 [README](README.md) 和 [设计说明](docs/DESIGN.md)。现有视觉设计有明确约定，功能改动不应顺手变成整页重做。
3. 选一个 [`good first issue`](https://github.com/Wangnilong/southwardfilm-poster/labels/good%20first%20issue)。留言说一声你想做哪一件，避免重复劳动；遇到不清楚的地方可以直接问。

没有合适的任务？用功能建议模板说明场景，或者提交 Bug 报告。中文和英文都可以。

## 本地开发

```bash
git clone https://github.com/YOUR-NAME/southwardfilm-poster.git
cd southwardfilm-poster
npm ci
npm run dev
```

需要 Node.js 22+，无需 API Key。代码修改后重启 `npm run dev` 并刷新网页。

`npm run check` 会构建网站，检查 JavaScript 语法、页面分支和 HTML / CSS 的本地文件引用。动态拼接的图片路径还需要在浏览器里实际打开检查。

## 提交一个容易评审的 PR

- 一次解决一个问题，解释触发方式和修改后的行为。
- 涉及页面时附前后截图；交互改动写明在什么浏览器、什么尺寸下操作过。
- 运行 `npm run check`；照片编辑改动要试一次移动、缩放和导出。
- 图片处理仍在本地完成，别把上传照片改成后台上传。
- 保留原版字体、颜色、电影标识的位置和素材比例；需要改视觉方向时先讨论。
- 不提交 `dist/`、`.env`、本机配置、部署凭据、PSDs、ZIPs 或未经确认的第三方素材。
- 尊重 `ASSET_NOTICE.md` 中的素材和字体许可。新模板优先使用自己的图形与照片。

## 添加一部电影

1. 新建 `films/<id>/`，至少包括 `index.html` 和所需素材。`id` 使用小写英文字母、数字和短横线。
2. 在 `site/assets/` 放一张封面。
3. 在 `films.json` 添加 `id`、`title`、`description`、`url`、`cover`。`url` 为 `/<id>/`，封面路径为 `./assets/<filename>`。
4. 页面左上角主页链接使用 `/`；页面内部文件使用相对路径。
5. 跑构建并检查新分支。现有电影仍保持生日快乐在前、浪花儿在后。

主站当前使用完整手写字体，让新电影名可以直接显示。后续可以独立优化为自动字体子集；不要依赖某位开发者电脑里的字体路径。

## 后台与其他大功能

管理后台、自由拼图、账号和云端存储还没有实现。请先在对应 Issue 提出方案、范围和验收方式。不要提交只在浏览器里假装保存、却被称作后台的界面。

当前贡献不会自动触发正式站部署；维护者会在评审后安排发布。
