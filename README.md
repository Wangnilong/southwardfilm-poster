# 回南天 · 电影海报工坊

把自己的照片，放进一张电影海报里。

[在线体验](https://poster.southwardfilm.cn/) · [第一次贡献](CONTRIBUTING.md) · [设计说明](docs/DESIGN.md) · [找一件可以做的事](https://github.com/Wangnilong/southwardfilm-poster/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

[![CI](https://github.com/Wangnilong/southwardfilm-poster/actions/workflows/ci.yml/badge.svg)](https://github.com/Wangnilong/southwardfilm-poster/actions/workflows/ci.yml)

一个用原生 HTML、CSS、JavaScript 和 Canvas 做的电影海报生成器。照片在浏览器本地处理；选图、改字、调整构图，然后导出图片。**没有前端框架依赖，也不需要数据库或 API Key。**

![回南天海报工坊：保留纸质文件夹样式，主页下方横向选择电影](docs/images/home.png)

## 先玩一下

| 入口 | 可以做什么 |
| --- | --- |
| [主页](https://poster.southwardfilm.cn/) | 左右拖动电影文件夹，选择一部电影 |
| [生日快乐](https://poster.southwardfilm.cn/birthday/) | 改祝福、换照片、调整署名，导出 2000 × 2990 PNG / JPG |
| [浪花儿](https://poster.southwardfilm.cn/langhuaer/) | 浏览 28 张海报、剧照与口碑图，制作自己的照片海报 |

手机上先预览，再编辑；照片支持移动与缩放。电脑上也可以直接拖动取景。网页上的倾斜和滑动效果不会进入导出图片。

## 本地运行

需要 **Node.js 22 或更新版本**。

```bash
git clone https://github.com/Wangnilong/southwardfilm-poster.git
cd southwardfilm-poster
npm ci
npm run dev
```

打开终端显示的 `http://127.0.0.1:5173/`。两个电影分支都可以本地访问，左上角 Logo 返回本地主页。修改源文件后重启开发命令并刷新页面。

```bash
npm run check  # 构建、检查 JavaScript 语法及 HTML / CSS 素材引用
npm run build  # 生成可部署的 dist/
```

Windows、macOS、Linux 使用相同命令；运行和构建不需要 Python、Photoshop 或云账号。

## 想一起写吗？

欢迎写代码，也欢迎带着手机帮忙找问题、改文档或设计新模板。第一次贡献可以先从这些方向挑一件：

- **手机体验**：照片选择后焦点是否明确、键盘与屏幕阅读器能否使用。
- **模板与素材加载**：增加一套自己有权使用的海报模板，或者改善相册图片加载。
- **开发体验**：完善英文文档，扩展构建检查，让新同学更容易上手。

先看 [`good first issue`](https://github.com/Wangnilong/southwardfilm-poster/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)，在任务下留言即可；不确定怎么做，也可以直接开 Issue 讨论。小的、能独立验证的 PR 很欢迎。

如果你想做管理后台，先参与[后台方案讨论](https://github.com/Wangnilong/southwardfilm-poster/issues?q=is%3Aissue+is%3Aopen+label%3Abackend)。当前仓库没有后台、账号或云端照片存储，这部分需要先确定需求与权限边界。

贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。**现有视觉设计已经确定；修功能、调布局时请保留配色、字体和文件夹外观。** 大幅改版先在 Issue 里确认方向。

想邀请朋友一起做，可以使用这份[项目介绍与招募文案](docs/INVITATION.md)。

## 从哪里改

```text
films.json                电影入口、顺序与封面
site/                     主页模板、纸质文件夹样式、横向拖动
films/birthday/           生日快乐生成器
films/langhuaer/           浪花儿相册与生成器
scripts/                  零依赖构建、本地服务与检查
docs/DESIGN.md            已确定的设计与明确不做的内容
licenses/                 字体许可与版权声明
dist/                     生成的网站，不提交
```

常见改动：

| 想改什么 | 先看哪里 |
| --- | --- |
| 主页电影名称、顺序和链接 | `films.json` |
| 主页的拖动与误触 | `site/folders.js` |
| 生日海报的照片取景与导出 | `films/birthday/app.js` |
| 浪花儿的相册与海报渲染 | `films/langhuaer/app.js` |

## 发布

`npm run build` 后把 `dist/` 部署到支持静态文件的主机。目录下包含 `/birthday/` 与 `/langhuaer/` 两个分支。

当前正式站使用腾讯云 EdgeOne Makers；仓库根目录的 `edgeone.json` 保留规范路径与旧 `/langhua/` 的兼容跳转。GitHub Actions 只做校验，**不会自动更新正式站**。

## 代码与素材的许可

原创程序代码使用 [MIT License](LICENSE)。电影海报、剧照、品牌 Logo、README 截图和字体**不随 MIT 许可重新授权**，各自权利及许可见 [ASSET_NOTICE.md](ASSET_NOTICE.md) 和 `licenses/`。

欢迎用代码做自己的工具；加入新电影或公开部署时，请使用自己有权使用的素材。

---

**Southward Film Poster Studio** — a framework-free, browser-local movie poster maker built with HTML, CSS, JavaScript and Canvas. Try the [live demo](https://poster.southwardfilm.cn/), then see [contributing](CONTRIBUTING.md) and the [beginner-friendly issues](https://github.com/Wangnilong/southwardfilm-poster/labels/good%20first%20issue). An English quickstart is a welcome first contribution.
