# 本地字体（可选）

当前主题通过 Google Fonts CDN 加载：
- 标题：Mochiy Pop One / 站酷快乐体 ZCOOL KuaiLe
- 正文：Nunito / Noto Sans SC

如果希望完全本地化（不依赖外网），请：

1. 下载对应的 woff2 字体文件（例如从 Google Fonts 或字库官网）
2. 放入本目录（themes/anime-business/source/fonts/）
3. 在 source/css/style.styl 顶部注释处启用 @font-face，例如：

   @font-face {
     font-family: 'ZCOOL KuaiLe';
     src: url('/fonts/ZCOOL-KuaiLe.woff2') format('woff2');
     font-weight: normal;
     font-style: normal;
     font-display: swap;
   }

4. 删除 layout/_partial/head.ejs 中的 Google Fonts <link> 即可

构建后字体文件会自动复制到 public/fonts/。
