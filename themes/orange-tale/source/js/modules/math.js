// 功能模块：LaTeX 公式渲染
// 依赖：KaTeX（本地 js/vendor/katex/，已本地化，无外部 CDN）
// 目标：服务端已保护的 .math 标记；逐个元素直接渲染，绕开文本扫描的兼容性问题
import { loadScript, loadCss } from './loader.js';

export default {
  name: 'math',
  init: function () {
    var nodes = document.querySelectorAll('.math');
    if (!nodes.length) return;
    var base = (window.__AB__ && window.__AB__.base) || '/';
    loadCss(base + 'js/vendor/katex/katex.min.css');
    loadScript(base + 'js/vendor/katex/katex.min.js', function (err) {
      if (err || !window.katex) return; // 降级：保留原始公式文本
      Array.prototype.forEach.call(nodes, function (el) {
        var isBlock = el.classList.contains('math-block');
        var tex = (el.textContent || '').trim();
        // 去掉定界符：$$ $$ / \[ \] / $ $ / \( \)
        if (tex.indexOf('$$') === 0 && tex.slice(-2) === '$$') {
          tex = tex.slice(2, -2);
        } else if (tex.indexOf('\\[') === 0 && tex.slice(-2) === '\\]') {
          tex = tex.slice(2, -2);
        } else if (tex.indexOf('$') === 0 && tex.slice(-1) === '$') {
          tex = tex.slice(1, -1);
        } else if (tex.indexOf('\\(') === 0 && tex.slice(-2) === '\\)') {
          tex = tex.slice(2, -2);
        }
        try {
          window.katex.render(tex, el, { displayMode: isBlock, throwOnError: false });
        } catch (e) { /* 降级：保留原文 */ }
      });
    });
  }
};
