// 功能模块：打字机动画（页面加载/刷新时触发）
// 钩子：[data-typewriter]（data-text 为要打的文字，data-speed 为速度 ms/字）
// 支持多元素：按 DOM 顺序依次打字（打完一个再打下一个，不同步）
export default {
  name: 'typewriter',
  init: function () {
    var els = document.querySelectorAll('[data-typewriter]');
    if (!els.length) return;

    function type(el) {
      var text = el.getAttribute('data-text') || '';
      var speed = parseInt(el.getAttribute('data-speed') || '130', 10) || 130;
      var i = 0;
      el.textContent = '';
      return new Promise(function (resolve) {
        function tick() {
          if (i < text.length) {
            el.textContent = text.slice(0, i + 1);
            i++;
            setTimeout(tick, speed);
          } else {
            resolve();
          }
        }
        tick();
      });
    }

    // 链式执行：上一个元素打完再启动下一个
    Array.prototype.slice.call(els).reduce(function (p, el) {
      return p.then(function () { return type(el); });
    }, Promise.resolve());
  }
};
