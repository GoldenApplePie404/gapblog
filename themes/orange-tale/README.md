# Orange Tale · 橙の语

Hexo 8 博客主题，二次元 × 商务，三栏布局（左博主卡吸顶 / 中央瀑布流 / 右组件不吸顶）。

## 技术栈

- Hexo 8.x
- Stylus 样式（[source/css/style.styl](source/css/style.styl)）
- EJS 模板（`layout/` + `layout/_partial/`）
- ES Modules 功能模块（`source/js/modules/`，通过 [source/js/main.js](source/js/main.js) 统一注册）
- 零运行时 CDN 依赖：Mermaid、KaTeX、Chart.js 全部本地化在 `source/js/vendor/`

## 目录结构

```
orange-tale/
├── _config.yml          # 主题配置（features 开关在末尾）
├── scripts/             # Hexo 脚本钩子（after_post_render 等）
│   ├── math-mermaid.js  # ```radar / ```mermaid 代码块拦截
│   └── local-links.js   # 站内绝对 href 自动补 root 前缀（子路径部署兜底）
├── layout/              # EJS 模板
├── source/
│   ├── css/style.styl   # 主题样式（CSS 变量在顶部）
│   ├── images/icons.svg # 内联 SVG 图标集
│   └── js/
│       ├── main.js      # 功能层入口：import + 按 features 开关依次 init
│       ├── modules/     # 功能模块（每个文件 export default { name, init }）
│       └── vendor/      # 第三方库（本地拷贝，无 CDN）
└── README.md
```

## 功能模块清单

在 `_config.yml` 的 `features:` 下开关，全部默认 `true`：

| 开关 | 文件 | 说明 |
|------|------|------|
| `bg_deco` | modules/bg-deco.js | 背景暖橙圆斑物理碰撞漂浮，点击头像暂停/继续 |
| `click_fx` | modules/click-fx.js | 暖橙点击特效 + 光标拖尾（纯 Canvas 2D，零依赖） |
| `code_fold` | modules/code-fold.js | 长代码块折叠（数字 = 行数阈值，false 关闭） |
| `copy_code` | modules/copy-code.js | 代码块一键复制 |
| `reading_bar` | modules/reading-bar.js | 阅读进度条 |
| `back_top` | modules/back-top.js | 一键回到顶部 |
| `toc` | modules/toc.js | 文章目录 |
| `lightbox` | modules/lightbox.js | 图片点击放大 |
| `masonry` | modules/masonry.js | 首页瀑布流 |
| `reveal` | modules/reveal.js | 滚动出现动画 |
| `music` | modules/music.js | 音乐播放器 + Web Audio 频谱 |
| `math` | modules/math.js | LaTeX 公式（KaTeX 本地） |
| `mermaid` | modules/mermaid.js | Mermaid 图表（本地） |
| `radar` | modules/radar.js | 雷达图（Chart.js 本地，```radar 代码块） |
| `tables` | modules/tables.js | 文章内超宽表格横向滚动容器 |
| `typewriter` | modules/typewriter.js | 首页标题打字机动画 |

## 雷达图用法

文章 markdown 里写：

````markdown
```radar
{
  "title": "技能熟悉度",
  "labels": ["Python", "C++", "Web", "Godot", "硬件"],
  "max": 10,
  "datasets": [
    { "label": "现状", "data": [9, 8, 7, 6, 8] }
  ]
}
```
````

## 启动脚本（项目根目录）

- `start.bat` / `start.sh`：一键启动预览 server，自动选择空闲端口，已在运行时直接打开浏览器
- `tools/img2webp.py`：文章配图转 WebP 工具，自动更新 markdown 引用

## 开发规范

### 新增功能模块

1. 在 `source/js/modules/xxx.js` 里：

```js
export default {
  name: 'my_feature',  // 与 _config.yml 开关名一致
  init: function () { /* ... */ }
};
```

2. 在 [main.js](source/js/main.js) 里 `import` 并加入 `modules` 数组
3. 在 `_config.yml` 的 `features:` 下加一行 `my_feature: true`

Hexo server 运行中会自动热更新 Stylus 和 EJS；JS 模块修改后浏览器 **Ctrl+F5** 刷新即可。

### Hexo 脚本（scripts/）

放在 `scripts/` 目录下的 `.js` 文件会被 Hexo 自动加载，通过 `hexo.extend.filter.register()` 注册钩子。已有：

- `math-mermaid.js` — `before_post_render`：拦截 ```` ```radar ```` / ```` ```mermaid ```` 代码块，交给前端渲染
- `local-links.js` — `after_render:html`：整页 HTML 里所有 `href="/..."` 的站内绝对路径自动补 `root` 前缀

### 颜色

CSS 变量在 [style.styl](source/css/style.styl) 顶部 `:root` 块：

```
--primary        #FF9700  主橙色
--primary-deep   #C25E00  深橙
--amber          #FFB84D  琥珀
--yellow         #FFD9A0  暖黄
--text           #241F19  墨黑
```

新增模块（如 click_fx）会自动 `getComputedStyle` 读取主题色，硬编码 fallback 作为保险。

## 踩坑记录

### 1. `pointer-events: none` 的元素永远收不到指针事件

click_fx 的 canvas 设了 `pointer-events: none`（为了不挡页面点击），但之前把 `pointerdown/pointermove` 监听器绑在 **canvas 自身上** → 浏览器直接让事件穿透到下层，canvas 永远收不到事件。修复：事件绑到 `document` 上，`_destroy` 解绑也要同步改到 `document`。

### 2. 子路径部署（root ≠ /）下站内 href 不自动补前缀

Hexo 的 `url_for()` / `image_tag()` 会自动补 root，但用户手写的 markdown 绝对链接 `/images/xxx.docx` 不会。`local-links.js` 用 `after_render:html` 全站兜底：跳过已带 root 前缀、跳过 `//` 协议相对链接，其余 `href="/..."` 一律补 root。

### 3. Hexo server 对多字节编码文件的坑

Windows `.bat` 脚本含中文注释必须用 **GBK (CP936)** 编码保存；UTF-8 会被 cmd 按 1/2 字节切解读出垃圾指令。最稳妥做法：批处理注释只用英文。

### 4. `netstat | findstr ":4000"` 是子串匹配

会误杀占用 `:40001`、`:40002` 的服务。启动脚本改进后：先探测目标 URL 是否已有本博客在跑（HTTP 200），命中则直接复用；否则向上探测空闲端口 4000 → 4009。

### 5. Web Audio API 与音频时长

`MediaElementSource` 捕获后 `audio.duration` 可能变 `Infinity`。延迟到首次 `play()` 后再创建 MediaElementSource；用 `seekable` 作为 fallback。不要同时创建多个 MediaElementSource（会导致 `net::ERR_ABORTED`）。

### 6. Hexo 语法高亮代码块横向滚动

`.highlight` 默认 `overflow: hidden`，长行被裁。需给 `.highlight .code` 单元格加 `overflow-x: auto; max-width: 0;`；`gutter` 行号栏固定不动，滚动区是右侧代码单元格。

### 7. 背景泡泡物理动画卡顿

逐帧读 `clientWidth/clientHeight` 会触发 forced reflow。解决：viewport 尺寸缓存，只在 `resize` 事件时重算；泡泡放置算法用"尽量远离"重采样避免初始重叠。

## 许可

MIT。
