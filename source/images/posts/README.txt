========================================
 文章配图目录（posts/）细分规则
========================================

一篇文章 = 一个纯英文目录名（front-matter 的 img_dir 字段）：

  source/images/posts/
  ├── test/        ← 文章 img_dir: test
  │   ├── cover.jpg
  │   └── photo-1.jpg
  └── another-post/
      └── cover.jpg

命名规则：
- 目录名纯英文小写，用 - 连接（如 my-first-post）
- 封面固定命名 cover.jpg / banner.jpg
- 文件小写、描述性命名（photo-1.jpg、architecture.png）

引用方式（文章内）：
- 正文插图：{% postimg photo-1.jpg %}（自动用本文 img_dir）
- 指定目录：{% postimg other-dir photo.jpg %}
- 封面：    front-matter 写 cover: /images/posts/test/cover.jpg
