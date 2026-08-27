'use strict';
// ============================================================
// 功能层：文章配图标签
// 约定：一篇文章对应一个纯英文图片目录
//   source/images/posts/<英文目录>/xxx.jpg
// 用法（文章内）：
//   {% postimg cover.png %}                → 用 front-matter img_dir（或文章 slug）作为目录
//   {% postimg other-dir photo.jpg %}      → 显式指定目录
// 目录优先级：front-matter 的 img_dir > 文章文件名 slug
// ============================================================
hexo.extend.tag.register('postimg', function (args) {
  var dir, file;
  if (args.length >= 2) {
    dir = args[0];
    file = args[1];
  } else {
    file = args[0];
    dir = this.img_dir || this.slug;
  }
  if (!dir || !file) return '';
  var src = (hexo.config.root || '/') + 'images/posts/' + dir + '/' + file;
  return '<img src="' + src + '" alt="' + file + '" loading="lazy">';
});
