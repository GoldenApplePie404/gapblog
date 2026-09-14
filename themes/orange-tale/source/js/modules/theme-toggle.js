// ============================================================
// 明暗主题切换
// 策略：
//  - 初始化时按优先级决定主题：localStorage > prefers-color-scheme > 默认亮色
//  - 切换时给 <html> 加 data-theme="dark" 或移除属性，触发 CSS 变量覆写
//  - 切到深色时同步通知 Chart.js / abcjs 重绘（若存在）
// ============================================================
export default {
  name: 'theme_toggle',
  init: function () {
    var STORAGE_KEY = 'gapblog-theme';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 先决定当前主题（在用户交互前就设置好，避免闪白）
    var saved = window.localStorage.getItem(STORAGE_KEY);
    var current = saved || (prefersDark ? 'dark' : 'light');

    // 提供同步函数给其他模块（如 chart.js）查询主题
    window.__AB__ = window.__AB__ || {};
    window.__AB__.isDark = function () {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    };

    function applyTheme(theme) {
      var isDark = theme === 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      // 通知已渲染的图表重绘（chart 模块自己订阅 themechange）
      document.dispatchEvent(new CustomEvent('themechange', { detail: { dark: isDark } }));
      // 同步更新 Chart.js 全局配色（如果已经加载）
      if (window.Chart && window.Chart.defaults) {
        var textColor = isDark ? '#e8dfd2' : '#241F19';
        var gridColor = isDark ? 'rgba(232,223,210,0.12)' : 'rgba(36,31,25,0.12)';
        window.Chart.defaults.color = textColor;
        window.Chart.defaults.borderColor = gridColor;
      }
    }

    applyTheme(current);

    // 监听系统主题变化（仅当用户未手动覆盖时跟随）
    try {
      var mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener && mql.addEventListener('change', function (e) {
        if (!window.localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    } catch (e) {}

    // 挂按钮
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', '切换主题');
    btn.title = '切换明暗主题';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
    // 找到 header 里的 nav 区域插入（如果没有就放 body 尾部不显示）
    var nav = document.querySelector('.site-nav');
    if (nav) {
      nav.appendChild(btn);
    } else {
      var headerRight = document.querySelector('.header-inner');
      if (headerRight) headerRight.appendChild(btn);
    }

    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }
};
