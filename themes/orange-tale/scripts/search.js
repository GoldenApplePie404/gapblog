'use strict';
// ============================================================
// 站内搜索：生成 /search.json 全文索引（零依赖，无第三方服务）
// 前端模块 source/js/modules/search.js 负责匹配与渲染
// 字段：title / path / date / tags / categories / content(纯文本)
// ============================================================
function stripHTML(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

hexo.extend.generator.register('search', function (locals) {
  var posts = locals.posts.sort('-date').map(function (post) {
    var tags = (post.tags && post.tags.toArray ? post.tags.toArray() : []).map(function (t) { return t.name; });
    var cats = (post.categories && post.categories.toArray ? post.categories.toArray() : []).map(function (c) { return c.name; });
    return {
      title: post.title || '',
      path: '/' + (post.path || ''),
      date: post.date ? post.date.format('YYYY-MM-DD') : '',
      tags: tags,
      categories: cats,
      content: stripHTML(post.content)
    };
  });
  return { path: 'search.json', data: JSON.stringify(posts) };
});
