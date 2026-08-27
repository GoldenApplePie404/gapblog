// 功能模块：阅读进度条
// 钩子：[data-reading-bar]（纯守卫，展示由样式层完成）
// 接口：documentElement.style --scroll-progress 百分比
export default {
  name: 'reading_bar',
  init: function () {
    if (!document.querySelector('[data-reading-bar]')) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var total = doc.scrollHeight - doc.clientHeight;
      var p = total > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / total) * 100)) : 0;
      doc.style.setProperty('--scroll-progress', p + '%');
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }
};
