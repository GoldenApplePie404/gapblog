'use strict';
// ============================================================
// 功能层：LaTeX 公式 + Mermaid 图表（服务端预处理）
// 原理：
//   before_post_render：截获 ```mermaid 代码块；把数学公式区替换为
//     占位符（保护 \\ 换行、_ 下标等不被 markdown 破坏）
//   after_post_render：还原为 <span class="math"> / <div class="mermaid">
// 前端 modules/math.js（KaTeX）与 mermaid.js（Mermaid）负责渲染（本地 vendor，无 CDN）
// ============================================================

var PH_MATH = '@@ABMATH';
var PH_MERMAID = '@@ABMERMAID';
var PH_CHART = '@@ABCHART';
var PH_ABC = '@@ABABC';

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 在普通文本段中保护数学公式（代码块区域由调用方排除）
function protectMath(seg, placeholders) {
  // 块级 $$...$$（可跨行）
  seg = seg.replace(/\$\$([\s\S]+?)\$\$/g, function (all, body) {
    var idx = placeholders.length;
    placeholders.push({ type: 'math', raw: '$$' + body.trim() + '$$' });
    return PH_MATH + idx + '@@';
  });
  // 块级 \[...\]
  seg = seg.replace(/\\\[([\s\S]+?)\\\]/g, function (all, body) {
    var idx = placeholders.length;
    placeholders.push({ type: 'math', raw: '\\[' + body.trim() + '\\]' });
    return PH_MATH + idx + '@@';
  });
  // 行内 $...$（不含换行）
  seg = seg.replace(/(^|[^$\\])\$([^\n$]+?)\$/g, function (all, pre, body) {
    var idx = placeholders.length;
    placeholders.push({ type: 'math', raw: '$' + body + '$' });
    return pre + PH_MATH + idx + '@@';
  });
  // 行内 \\(...\\)：\( ... \)
  seg = seg.replace(/\\\(([^\n]+?)\\\)/g, function (all, body) {
    var idx = placeholders.length;
    placeholders.push({ type: 'math', raw: '\\(' + body + '\\)' });
    return PH_MATH + idx + '@@';
  });
  return seg;
}

// 解析 markdown：mermaid 代码块整体截获 + 数学公式保护（跳过代码块）
function processMarkdown(content) {
  var placeholders = [];
  var fenceRe = /^(\s{0,3})(```+|~~~+)([^\n]*)\n([\s\S]*?)\n\s{0,3}\2/gm;
  var last = 0;
  var m;
  var result = '';
  while ((m = fenceRe.exec(content))) {
    var full = m[0];
    var lang = m[3].trim();
    var body = m[4];
    result += protectMath(content.slice(last, m.index), placeholders);
    if (lang === 'mermaid') {
      var idx = placeholders.length;
      placeholders.push({ type: 'mermaid', raw: body.trim() });
      result += PH_MERMAID + idx + '@@';
    } else if (lang === 'radar' || lang === 'chart') {
      var idx = placeholders.length;
      // radar 语法块自动补齐 type: 'radar'（若未指定），与 chart 统一输出 class="chart"
      var raw = body.trim();
      if (lang === 'radar') {
        try {
          var parsed = JSON.parse(raw);
          if (!parsed.type) parsed.type = 'radar';
          raw = JSON.stringify(parsed);
        } catch (e) { /* 非 JSON 则原样，前端会解析失败降级 */ }
      }
      placeholders.push({ type: 'chart', raw: raw });
      result += PH_CHART + idx + '@@';
    } else if (lang === 'abc') {
      var idx = placeholders.length;
      placeholders.push({ type: 'abc', raw: body.trim() });
      result += PH_ABC + idx + '@@';
    } else {
      result += full; // 普通代码块原样交给 marked/highlight
    }
    last = m.index + full.length;
  }
  result += protectMath(content.slice(last), placeholders);
  return { content: result, placeholders: placeholders };
}

hexo.extend.filter.register('before_post_render', function (data) {
  var features = hexo.theme.config.features || {};
  if (features.math === false && features.mermaid === false) return data;
  var r = processMarkdown(data.content);
  data.content = r.content;
  data._abPlaceholders = r.placeholders;
  return data;
}, 1);

hexo.extend.filter.register('after_post_render', function (data) {
  var features = hexo.theme.config.features || {};
  var mathEnabled = features.math !== false;
  var mermaidEnabled = features.mermaid !== false;
  var chartEnabled = features.chart !== false;  // chart 同时接管原 radar 开关（若 chart 未单独配置则 radar 开关也算）
  if (features.chart == null && features.radar !== false) chartEnabled = true;
  var abcEnabled = features.abc !== false;
  var list = data._abPlaceholders;
  if (!list || list.length === 0) return data;
  data.content = data.content.replace(/@@ABMATH(\d+)@@|@@ABMERMAID(\d+)@@|@@ABCHART(\d+)@@|@@ABABC(\d+)@@/g, function (all, mi, mdi, ci, ai) {
    var idx = mi != null ? Number(mi) : (mdi != null ? Number(mdi) : (ci != null ? Number(ci) : Number(ai)));
    var p = list[idx];
    if (!p) return all;
    if (p.type === 'mermaid') {
      if (!mermaidEnabled) return '```mermaid\n' + p.raw + '\n```';
      return '<div class="mermaid">' + escapeHtml(p.raw) + '</div>';
    }
    if (p.type === 'chart') {
      if (!chartEnabled) return '```chart\n' + p.raw + '\n```';
      return '<div class="chart">' + escapeHtml(p.raw) + '</div>';
    }
    if (p.type === 'abc') {
      if (!abcEnabled) return '```abc\n' + p.raw + '\n```';
      return '<div class="abc">' + escapeHtml(p.raw) + '</div>';
    }
    if (!mathEnabled) return escapeHtml(p.raw);
    var block = p.raw.indexOf('$$') >= 0 || p.raw.indexOf('\\[') >= 0;
    var safe = escapeHtml(p.raw);
    return block
      ? '<div class="math math-block">' + safe + '</div>'
      : '<span class="math math-inline">' + safe + '</span>';
  });
  delete data._abPlaceholders;
  return data;
});
