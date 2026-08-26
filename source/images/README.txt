========================================
 Anime Business 图片目录规范
========================================

所有图片统一放在 source/images/ 下，按用途分类：

  images/
  ├── site/    网站级图片（全站背景、首页 Banner、Logo、favicon）
  ├── posts/   文章配图（一篇文章一个纯英文目录：posts/<英文目录>/xxx.jpg）
  ├── charts/  图表图（数据图表、架构图、示意图、流程图）
  └── misc/    其他杂项图片

  文章配图细分规则（重要）：
  每篇文章对应一个纯英文目录名（front-matter 的 img_dir 字段），
  该文章的图片全部放在 posts/<img_dir>/ 下：
    source/images/posts/test/cover.jpg
    source/images/posts/test/photo-1.jpg
  引用方式：
    封面/横幅：front-matter 写 cover: /images/posts/test/cover.jpg
    正文插图：  {% postimg photo-1.jpg %}   （自动使用 img_dir 目录）
               或 ![说明](/images/posts/test/photo-1.jpg)

----------------------------------------
 引用方式（以站点根路径 /images/ 开头）
----------------------------------------

1. 全站背景图（主题配置 _config.yml）
   background: /images/site/bg.jpg

2. 首页大 Banner（主题配置 _config.yml）
   banner: /images/site/banner.jpg

3. 文章卡片封面（文章 front-matter）
   cover: /images/posts/my-post/cover.jpg

4. 文章页顶部横幅（文章 front-matter）
   banner: /images/posts/my-post/banner.jpg

5. 文章正文插图（Markdown）
   ![图片说明](/images/posts/my-post/photo.jpg)

6. 图表图（Markdown）
   ![架构图](/images/charts/architecture.png)

----------------------------------------
 命名建议
----------------------------------------
- 全部小写，单词用 - 连接：my-post-cover.jpg
- 文章封面固定命名 cover.jpg / banner.jpg，方便记忆
- 图表用描述性命名：architecture.png / flow-chart.png
- 同类型图片多时按日期建子目录：charts/2026/08/
