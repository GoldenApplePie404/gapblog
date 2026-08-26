// ============================================================
// 站内搜索模块
// 契约：export default { name: 'search', init(ctx) }
// 数据源：/search.json（由 themes/anime-business/scripts/search.js 生成）
// 行为：防抖 250ms / 多词 AND 匹配 / 关键词高亮 / Enter 跳转首个 / Esc 关闭 / 点击外部关闭
// 开关：_config.yml features.search = false 时不加载
// ============================================================
export default {
  name: 'search',

  init(ctx) {
    var wrap = document.querySelector('[data-search]');
    if (!wrap) return;
    var input = wrap.querySelector('input[type="search"]');
    var panel = wrap.querySelector('.search-results');
    if (!input || !panel) return;

    var INDEX_URL = '/search.json';
    var index = null;
    var timer = null;

    function loadIndex() {
      if (index) return Promise.resolve(index);
      return fetch(INDEX_URL)
        .then(function (r) { return r.json(); })
        .then(function (data) { index = data; return index; });
    }

    function query(q) {
      var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!tokens.length) return [];
      return (index || []).filter(function (item) {
        var hay = (item.title + ' ' + (item.tags || []).join(' ') + ' ' +
          (item.categories || []).join(' ') + ' ' + (item.content || '')).toLowerCase();
        return tokens.every(function (t) { return hay.indexOf(t) !== -1; });
      }).slice(0, 10);
    }

    function highlight(text, q) {
      var out = text;
      var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
      tokens.forEach(function (t) {
        var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        out = out.replace(re, '<mark>$1</mark>');
      });
      return out;
    }

    function excerpt(item, q) {
      var text = item.content || '';
      var lower = text.toLowerCase();
      var t = (q.toLowerCase().split(/\s+/).filter(Boolean)[0] || '').trim();
      var idx = t ? lower.indexOf(t) : -1;
      var start = idx > 60 ? idx - 40 : 0;
      var snippet = (start > 0 ? '…' : '') + text.slice(start, start + 110) +
        (text.length > start + 110 ? '…' : '');
      return highlight(snippet, q);
    }

    function render(q) {
      var items = query(q);
      panel.innerHTML = '';
      if (!items.length) {
        var empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = '没有找到相关文章';
        panel.appendChild(empty);
      } else {
        items.forEach(function (item) {
          var a = document.createElement('a');
          a.className = 'search-result-item';
          a.href = item.path;
          var meta = [item.date].concat(item.categories || []).filter(Boolean).join(' · ');
          a.innerHTML =
            '<div class="s-title">' + highlight(item.title, q) + '</div>' +
            (meta ? '<div class="s-meta">' + meta + '</div>' : '') +
            '<div class="s-excerpt">' + excerpt(item, q) + '</div>';
          panel.appendChild(a);
        });
      }
      panel.hidden = false;
    }

    function closePanel() { panel.hidden = true; }

    function run(q) {
      loadIndex().then(function () { render(q); }).catch(function (e) {
        closePanel();
        if (window.console) console.error('[AB] search index load failed:', e);
      });
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      var q = input.value;
      if (!q.trim()) { closePanel(); return; }
      timer = setTimeout(function () { run(q); }, 250);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) run(input.value);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closePanel(); input.blur(); }
      if (e.key === 'Enter') {
        var first = panel.querySelector('a.search-result-item');
        if (first) { e.preventDefault(); window.location.href = first.getAttribute('href'); }
      }
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) closePanel();
    });
  }
};
