// 功能模块：瀑布流高度均衡
// 钩子：[data-masonry]（容器）、[data-single]（单列模式跳过）
// 实现：把卡片按实际高度分配到较矮的 .masonry-col
export default {
  name: 'masonry',
  init: function () {
    var list = document.querySelector('[data-masonry]');
    if (!list || list.dataset.single === 'true') return;
    var cols = list.querySelectorAll('.masonry-col');
    if (cols.length < 2) return;
    function balance() {
      var cards = Array.prototype.slice.call(list.querySelectorAll('.post-card'));
      for (var i = 0; i < cards.length; i++) {
        cards[i].parentNode.removeChild(cards[i]);
      }
      for (var j = 0; j < cards.length; j++) {
        var target = cols[0].offsetHeight <= cols[1].offsetHeight ? cols[0] : cols[1];
        target.appendChild(cards[j]);
      }
    }
    if (document.readyState === 'complete') {
      balance();
    } else {
      window.addEventListener('load', balance);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(balance);
    }
  }
};
