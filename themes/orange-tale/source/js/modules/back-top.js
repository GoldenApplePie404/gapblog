// 功能模块：回到顶部
// 钩子：[data-back-top]
// 状态：btn.dataset.visible = 'true' | 'false'
export default {
  name: 'back_top',
  init: function () {
    var btn = document.querySelector('[data-back-top]');
    if (!btn) return;
    function toggle() {
      var show = window.scrollY > 500;
      if (btn.dataset.visible !== String(show)) {
        btn.dataset.visible = String(show);
      }
    }
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }
};
