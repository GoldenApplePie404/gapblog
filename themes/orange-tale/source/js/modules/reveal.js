// 功能模块：滚动显现动画
// 目标：.post-card / .archive-item / .hero / .widget（视觉类名，仅作选择器契约）
// 状态：元素加 .reveal -> IntersectionObserver 后加 .visible
export default {
  name: 'reveal',
  init: function () {
    if (!('IntersectionObserver' in window)) return;
    var selector = '.post-card, .archive-item, .hero, .widget';
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
      els[i].classList.add('reveal');
      io.observe(els[i]);
    }
  }
};
