// 功能模块：Mermaid 图表渲染
// 依赖：Mermaid（本地 js/vendor/mermaid.min.js，已本地化，无外部 CDN）
// 目标：服务端转换的 .mermaid 容器；加载/渲染失败时降级显示原始代码
import { loadScript } from './loader.js';

export default {
  name: 'mermaid',
  init: function () {
    var nodes = document.querySelectorAll('.mermaid');
    if (!nodes.length) return;
    var base = (window.__AB__ && window.__AB__.base) || '/';
    loadScript(base + 'js/vendor/mermaid.min.js', function (err) {
      if (err || !window.mermaid) return; // 降级：保留原始代码文本
      try {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'strict',
          fontFamily: 'inherit'
        });
        window.mermaid.run({ nodes: nodes });
      } catch (e) { /* 降级 */ }
    });
  }
};
