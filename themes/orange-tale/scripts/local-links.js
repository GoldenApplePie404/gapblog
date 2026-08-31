'use strict';
// ============================================================
// 本地资源链接修复：站内绝对路径自动补 root 前缀
// ============================================================

hexo.extend.filter.register('after_render:html', function (str) {
  if (typeof str !== 'string' || !str) return str;
  var root = (hexo.config.root || '/').replace(/\/+$/, ''); // 去末尾斜杠便于拼接
  if (!root) return str;

  return str.replace(/href="(\/[^"]*)"/g, function (all, path) {
    // 协议相对（//domain）→ 外部，不动
    if (path.indexOf('//') === 0) return all;
    // 已带 root 前缀 → 不动，避免重复
    if (path.indexOf(root + '/') === 0) return all;
    // 首页（/）→ 补成 root 目录
    if (path === '/') return 'href="' + root + '/"';
    // 其余站内绝对路径（doc/pdf 等）→ 补上 root
    return 'href="' + root + path + '"';
  });
});