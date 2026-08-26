// 功能模块：页面跳转加载动画（旋转条 + 波浪点）与丝滑转场
// 行为：
//   1. 拦截同域左键点击（排除 _blank/download/mailto:/修饰键/同页锚点），
//      显示 #site-preloader 加载动画 → body 淡出 → 360ms 后跳转。
//   2. 搜索表单 GET 提交时同样显示加载动画。
//   3. 新页面加载完成后（DOMContentLoaded / bfcache 恢复）隐藏加载动画。
// 钩子契约：body.is-loaded（加载完成态）/ body.is-leaving（离场淡出态）
// 无障碍：prefers-reduced-motion 下不拦截，直接跳转。
export default {
  name: 'pageTransition',
  init: function () {
    var pre = document.getElementById('site-preloader');
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (pre) pre.classList.remove('active');
      return;
    }

    function showPre() { if (pre) pre.classList.add('active'); }
    function hidePre() { if (pre) pre.classList.remove('active'); }

    // 首次加载/新页面加载完成：淡出加载指示
    hidePre();

    // 浏览器回退（bfcache 恢复）：立即隐藏，避免卡在加载态
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) hidePre();
    });

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!a) return;

      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

      var url;
      try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      // 同页或仅锚点跳转：不拦截，交给原生平滑滚动
      if (url.pathname === location.pathname && (url.hash || !url.search)) return;

      e.preventDefault();
      showPre();
      document.body.classList.remove('is-loaded');
      document.body.classList.add('is-leaving');
      setTimeout(function () { window.location.href = a.href; }, 420);
    });

    // 搜索表单提交（GET 跳转）也显示加载动画
    document.addEventListener('submit', function (e) {
      var f = e.target;
      if (f && f.tagName === 'FORM' && !f.getAttribute('data-no-preloader')) {
        showPre();
      }
    });
  }
};
