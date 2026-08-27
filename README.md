# 金苹果派の博客 - 使用指南

## 🚀 一、一键启动

- **Windows**：双击 **`start.bat`**
- **Git Bash**：执行 `./start.sh`（首次需 `chmod +x start.sh`）

脚本会自动：

1. 清理占用 4000 端口的旧进程
2. 启动预览服务器并自动打开浏览器
3. 地址：**<http://localhost:4000/>**

> 手动启动：`npx hexo server`（或 `npm run server`），Ctrl+C 停止。

***

## ✍️ 二、日常更新文章

### 1. 新建文章

```bash
hexo new "文章标题"
```

会自动在 `source/_posts/文章标题.md` 生成带说明的模板（含全部字段注释）。

或者使用：
```bash
cmd /c "hexo new 文章标题"
```

<br />

### 2. 编辑文章

用任意编辑器（VS Code等）打开 `source/_posts/` 下的 md 文件编辑，**保存后浏览器刷新即可看到**（服务器会自动重新生成）。

### 3. 文章 front-matter 模板

```yaml
---
title: 文章标题
date: 2026-01-01 00:00:00
tags: [标签1, 标签2]
categories: [["分类1"],["分类2"]]   # 单分类写 [分类名]；多分类用数组套数组（平级），勿写 ["a","b"]（那是父子嵌套）
img_dir: my-post            # 本文图片目录（纯英文小写）
cover: /images/posts/my-post/cover.jpg   # 首页卡片封面
banner: /images/posts/my-post/banner.jpg # 文章页顶部大图（可选）
sticky: true                # 置顶
---
摘要内容（显示在首页卡片）...

<!-- more -->

正文其余部分...
```

### 4. 支持的格式

| 格式          | 写法                                                 |
| ----------- | -------------------------------------------------- |
| 标题          | `# H1` \~ `###### H6`                              |
| 加粗/斜体/删除线   | `**粗**` `*斜*` `~~删~~`                              |
| 引用          | `> 引用`（`>>` 嵌套）                                    |
| 链接          | `[文字](https://xxx)`                                |
| 表格          | GFM 表格语法（支持对齐）                                     |
| 代码块         | `js / python / bash ...`（自动高亮+复制）                  |
| 行内代码        | `code`                                             |
| 公式（KaTeX）   | 行内 `$...$` `\(...\)`；块级 `$$...$$` `\[...\]`        |
| 图表（Mermaid） | `mermaid ... ` （流程图/时序图/甘特图等）                      |
| 上标/下标       | HTML：`H<sub>2</sub>O`、`x<sup>2</sup>`；或公式 `$H_2O$` |

### 5. 文章配图

- 图片统一放 `source/images/` 分类目录：
  - `site/` 网站级（背景、Banner、图标）
  - `posts/<img_dir>/` 文章配图（**每篇文章一个纯英文目录**，对应 front-matter 的 `img_dir`）
  - `charts/` 图表
  - `misc/` 其他
- 正文引用图片：
  ```md
  {% postimg 文件名.jpg %}          ← 自动用本文 img_dir 目录
  {% postimg 其他目录 文件名.jpg %}  ← 指定目录
  ![](/images/posts/my-post/xx.jpg) ← 普通 Markdown
  ```

### 6. 删除文章

- 直接删除 `source/_posts/` 下对应的 md 文件（如 `source/_posts/嗨嗨嗨.md`）
- 若文章 front-matter 配置了 `img_dir`，同步删除对应图片目录 `source/images/posts/<img_dir>/`，避免留下孤儿图片
- 清理生成缓存（否则预览/生成的站点可能残留旧文章）：

  ```bash
  cmd /c "hexo clean && hexo generate"
  ```

  > ⚠️ Windows 下 `hexo clean` 偶发卡死/文件锁定（db.json 无法删除），若遇到可直接用 `rm -f db.json && hexo generate`（跳过 clean）。

***

## ⚙️ 三、站点配置

### 根配置 `_config.yml`

- `title` / `author` / `url` / `description`：站点基本信息
- `theme: orange-tale`：主题

### 主题配置 `themes/orange-tale/_config.yml`

- `greeting`：首页欢迎语（当前 Hero 为打字机标题，来自 `config.title`）
- `menu`：导航菜单
- `social`：社交链接（GitHub / BiliBili / 爱发电 / X / Email）
- `friends`：友情链接（显示在底栏）
- `footer.contact`：底栏联系方式（QQ / 邮箱）
- `features`：功能开关（导航 / 进度条 / 公式 / 图表 / 打字机等，`false` 即关闭）
- `background` / `banner`：全站背景图 / 首页大 Banner（图片放 `source/images/site/`）

***

## 📦 四、发布部署

### 本地生成静态文件

```bash
hexo clean && hexo generate
```

生成结果在 `public/` 目录，直接把该目录内容上传到服务器 Web 目录即可上线
（例如 Nginx 的 `/usr/share/nginx/html` 或宝塔的网站根目录）。

### 常用命令速查

| 命令                            | 作用                              |
| ----------------------------- | ------------------------------- |
| `hexo new "标题"`               | 新建文章                            |
| `hexo server`                 | 本地预览（start.bat 已封装）             |
| `hexo clean && hexo generate` | 清理并生成静态文件                       |
| `hexo deploy`                 | 部署（需先在 `_config.yml` 配置 deploy） |

***

## 🧩 五、主题功能层（开发者）

JS 功能模块在 `themes/orange-tale/source/js/modules/`：
`nav / reading-bar / back-top / copy-code / code-fold / reveal / math / mermaid / typewriter / search / page-transition / music / toc / lightbox / loader`

模块契约：`export default { name, init(ctx) }`，在 `features` 中可独立开关。
样式层与功能层通过 `data-*` 钩子 / CSS 变量解耦，加新功能不碰样式。

---

## 🏗️ 六、项目框架与功能架构

### 1. 技术栈

| 层          | 技术 |
| ----------- | --- |
| 博客框架      | Hexo 8（Node.js 静态站点生成器） |
| 模板引擎      | EJS（`hexo-renderer-ejs`） |
| 样式        | Stylus（`hexo-renderer-stylus`） |
| Markdown    | marked（`hexo-renderer-marked`）+ highlight.js 高亮 |
| 公式 / 图表   | KaTeX 0.16.11、Mermaid 10.9.1 |
| 站内搜索      | 自建 `search.json` 全文索引（零第三方服务） |
| 启动脚本      | `start.bat`（Windows）/ `start.sh`（Git Bash） |

### 2. 目录结构

```
gapblog/
├── _config.yml                 # 站点根配置（Hexo 全局）
├── package.json                # 依赖与 npm scripts（server/build/clean/deploy）
├── scaffolds/                  # 新建文章/页面的模板（post/page/draft）
├── source/                     # 内容源
│   ├── _posts/                 # 文章（markdown）
│   ├── about/ categories/ tags/...   # 独立页面
│   └── images/                 # 图片库（site/ posts/ charts/ misc/）
├── themes/orange-tale/      # 自定义主题
│   ├── _config.yml             # 主题配置（菜单/社交/features 开关）
│   ├── layout/                 # 模板层：页面 + _partial 组件（EJS）
│   ├── scripts/                # 服务端脚本：过滤器/生成器/标签
│   └── source/
│       ├── css/style.styl      # 样式层（Stylus）
│       └── js/                 # 功能层（ESM 模块）
├── public/                     # 生成的静态站点（运行时生成，部署用）
└── start.bat / start.sh        # 一键启动脚本
```

### 3. 渲染流程（数据流）

```
source/*.md
   │  before_post_render（math-mermaid.js：保护公式 / 截获 Mermaid 代码块）
   ▼
marked 解析 Markdown → HTML
   │  tag postimg（解析 {% postimg %} 配图标签）
   │  after_post_render（还原为 .math / .mermaid 容器）
   ▼
EJS 模板渲染（layout + _partial 组件拼装）
   │  generator（index/archive/category/tag + search.json 索引）
   ▼
public/ 静态文件 → 上传服务器即上线
```

浏览器端：`layout.ejs` 注入 `window.__AB__.features` 配置，
`main.js` 按开关加载对应 JS 模块并执行 `init(ctx)`。

### 4. 主题三层架构

| 层   | 目录                              | 职责 |
| ---- | ------------------------------- | --- |
| 模板层 | `layout/`                       | 页面骨架与组件渲染（EJS） |
| 样式层 | `source/css/style.styl`          | 视觉样式，通过 `data-*` 钩子 / CSS 变量与功能层解耦 |
| 功能层 | `source/js/modules/` + `scripts/` | 浏览器端交互 + 服务端预处理 |

### 5. 功能模块清单

| 模块           | 位置                                       | 功能          | 开关                  |
| ------------- | ---------------------------------------- | ----------- | ------------------- |
| nav           | `modules/nav.js`                          | 移动端菜单      | `features.nav`      |
| reading-bar   | `modules/reading-bar.js`                  | 阅读进度条      | `features.reading_bar` |
| back-top      | `modules/back-top.js`                     | 回到顶部       | `features.back_top` |
| copy-code     | `modules/copy-code.js`                    | 代码块复制      | `features.copy_code` |
| code-fold     | `modules/code-fold.js`                    | 长代码块折叠（>15 行收起） | `features.code_fold`（数字=阈值） |
| masonry       | `modules/masonry.js`                      | 瀑布流高度均衡（**已停用**：首页改双列逐行） | `features.masonry` |
| reveal        | `modules/reveal.js`                       | 滚动显现动画     | `features.reveal`   |
| math          | `modules/math.js` + `scripts/math-mermaid.js` | KaTeX 公式渲染（本地化） | `features.math`     |
| mermaid       | `modules/mermaid.js` + `scripts/math-mermaid.js` | Mermaid 图表（本地化；主题色/缩放/平移/下载 SVG·PNG/复制代码） | `features.mermaid`  |
| typewriter    | `modules/typewriter.js`                   | 首页标题打字机    | `features.typewriter` |
| search        | `modules/search.js` + `scripts/search.js` | 站内搜索（本地 search.json） | `features.search`   |
| page-transition | `modules/page-transition.js`            | 页面过渡动画 + 加载遮罩 | 常驻                 |
| music         | `modules/music.js`                        | 音乐播放器（本地歌单 playlist.json） | 常驻（features.music） |
| toc           | `modules/toc.js`                          | 文章目录（博主卡翻面） | 常驻                 |
| lightbox      | `modules/lightbox.js`                     | 文章图片灯箱（缩放/平移/切换） | `features.lightbox` |
| loader        | `modules/loader.js`                       | 脚本加载器（math/mermaid 用） | 常驻                 |
| postimg       | `scripts/tags.js`                         | 文章配图标签     | 常驻                 |

> 模块契约：`export default { name, init(ctx) }`；开关在 `themes/orange-tale/_config.yml` 的 `features.*` 中，设为 `false` 即不加载对应 JS。
