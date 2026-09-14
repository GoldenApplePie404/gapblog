// ============================================================
// Admonition / Callout 彩色提示块
// 语法（GitHub / Typora 风格）：
//
//   > [!note] 标题（可选）
//   > 这是提示内容行 1
//   > 这是提示内容行 2
//
// 支持类型：note | tip | info | warning | danger | success | question
// 不识别的类型会 fallback 成 admonition-note。
//
// Hexo 用 markdown-it 时，多行引用合并成一个 <p> 用 <br> 分隔，
// 所以我们要兼容两种结构：
//   A. <blockquote><p>[!type] 标题<br>正文...</p></blockquote>
//   B. <blockquote><p>[!type] 标题</p><p>正文</p>...</blockquote>
// ============================================================
'use strict';

hexo.extend.filter.register('after_post_render', function (data) {
  var html = data.content;
  if (!html) return data;

  var TYPES = ['note', 'tip', 'info', 'warning', 'danger', 'success', 'question'];

  html = html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, function (fullBlock, inner) {
    // 先抽出第一个 <p>...</p> 的内容，检查是否以 [!type] 开头
    var firstP = inner.match(/^\s*<p>([\s\S]*?)<\/p>/i);
    if (!firstP) return fullBlock;

    var firstText = firstP[1].replace(/^\s+/, '');
    var headMatch = firstText.match(/^\[!(\w+)\]\s*(.*)$/i);
    if (!headMatch) return fullBlock; // 不是 admonition，保持原样

    var type = headMatch[1].toLowerCase();
    if (TYPES.indexOf(type) === -1) type = 'note';
    var restOfFirst = headMatch[2] || '';

    // 从 restOfFirst 里再分离：<br> 之前是标题，之后是正文前半
    var title = '';
    var firstBody = '';
    var brMatch = restOfFirst.match(/^(.*?)<br\s*\/?>([\s\S]*)$/i);
    if (brMatch) {
      title = brMatch[1].trim();
      firstBody = brMatch[2].trim();
    } else {
      // 没有 <br>，整个 restOfFirst 就是标题（无正文或正文在后续 <p>）
      title = restOfFirst.trim();
    }

    // 抽出第一个 <p> 之后的所有内容（其他 <p>、<ul> 等）作为 body 后半
    var afterFirst = inner.slice(firstP[0].length);
    // 拼出完整 body
    var bodyParts = [];
    if (firstBody) bodyParts.push('<p>' + firstBody + '</p>');
    var afterClean = afterFirst.trim();
    if (afterClean) bodyParts.push(afterClean);
    var bodyHtml = bodyParts.join('');

    var titleHtml = title ? '<div class="admonition-title">' + title + '</div>' : '';

    return '<div class="admonition ' + type + '">' +
      '<div class="admonition-header">' +
        '<span class="admonition-type">' + type + '</span>' +
        titleHtml +
      '</div>' +
      '<div class="admonition-body">' + bodyHtml + '</div>' +
    '</div>';
  });

  data.content = html;
  return data;
});
