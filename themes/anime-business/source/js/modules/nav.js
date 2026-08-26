// 功能模块：移动端菜单
// 钩子：[data-nav-toggle] 按钮、[data-nav] 导航
// 状态：nav.dataset.open = 'true' | 'false'（由样式层响应）
export default {
  name: 'nav',
  init: function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.dataset.open = nav.dataset.open === 'true' ? 'false' : 'true';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.dataset.open = 'false';
      });
    });
  }
};
