// 功能模块：文章目录（藏于左侧博主卡背面）
// 行为：文章页自动解析 .post-content 的 h1~h3 → 生成带层级目录；
//       点击卡片右上角按钮翻面切换「博主信息/目录」；点击目录项平滑滚动并翻回正面；
//       滚动时当前章节高亮（IntersectionObserver）；无文章内容时隐藏翻面按钮
export default {
  name: 'toc',
  init: function () {
    var content = document.querySelector('.post-content');
    var card = document.getElementById('authorCard');
    var flipBtn = document.querySelector('[data-card-flip]');
    var toc = document.querySelector('[data-toc]');
    if (!card || !flipBtn || !toc) return;
    if (!content) { flipBtn.hidden = true; return; }

    var heads = content.querySelectorAll('h1, h2, h3');
    if (!heads.length) { flipBtn.hidden = true; return; }

    // 1) 标题 id（无则按文本生成 slug，中文保留、去重）
    var used = {};
    Array.prototype.forEach.call(heads, function (h, i) {
      if (!h.id) {
        var raw = (h.textContent || '').trim();
        var slug = raw.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
        var id = slug || ('sec-' + (i + 1));
        if (used[id]) { used[id] += 1; id = id + '-' + used[id]; }
        else used[id] = 1;
        h.id = id;
      }
    });

    // 2) 生成目录
    var links = [];
    Array.prototype.forEach.call(heads, function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.className = 'toc-link toc-' + h.tagName.toLowerCase();
      a.textContent = h.textContent;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var top = h.getBoundingClientRect().top + (window.pageYOffset || window.scrollY) - 92;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        // 保持目录视图（不自动翻回博主信息，方便连续跳转章节）
        if (history.replaceState) history.replaceState(null, '', '#' + h.id);
      });
      toc.appendChild(a);
      links.push({ link: a, head: h });
    });

    // 3) 翻面切换
    flipBtn.addEventListener('click', function () {
      card.classList.toggle('flipped');
      flipBtn.classList.toggle('active');
    });

    // 4) 当前章节高亮
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (item) {
            item.link.classList.toggle('current', item.head === en.target);
          });
        });
      }, { rootMargin: '-15% 0px -75% 0px' });
      Array.prototype.forEach.call(heads, function (h) { io.observe(h); });
    }
  }
};
