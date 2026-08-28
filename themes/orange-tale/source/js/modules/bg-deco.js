// ============================================================
// 背景泡泡（暖橙圆斑）物理碰撞动画
// 让 .bg-deco i 在视口内自由游走，碰到边缘反弹——像泡泡一样，
// 永不跑出可视区（比固定往返的 CSS 动画更像「物理漂浮」）。
// 性能：视口尺寸缓存，仅 resize 重算；逐帧只写 transform（合成层）。
// ============================================================
export default {
  name: 'bg_deco',
  init: function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var bubbles = Array.prototype.slice.call(document.querySelectorAll('.bg-deco i'));
    if (!bubbles.length) return;

    var raf = null;
    var active = false;
    var userOn = true; // 用户开关：关闭则泡泡暂停
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;

    // —— 尽量远离的放置：重叠时重采样，保证刷新时泡泡散布开 ——
    function tryPlace(sz, placed) {
      for (var attempt = 0; attempt < 12; attempt++) {
        var x = Math.random() * Math.max(vw - sz, 0);
        var y = Math.random() * Math.max(vh - sz, 0);
        var tooClose = false;
        for (var j = 0; j < placed.length; j++) {
          var p = placed[j];
          var gap = (p.w + sz) * 0.6;                 // 期望的圆心间距（越大越远离）
          if (Math.abs(p.x - x) < gap && Math.abs(p.y - y) < gap) { tooClose = true; break; }
        }
        if (!tooClose) return { x: x, y: y };
      }
      // 重采样耗尽也保证在界内
      return { x: Math.random() * Math.max(vw - sz, 0), y: Math.random() * Math.max(vh - sz, 0) };
    }

    var states = [], placed = [];
    // 先随机尺寸（读一次布局即可），再分散放置
    bubbles.forEach(function (el) {
      var sz = 50 + Math.random() * 160; // 50~210px
      el.style.width = sz + 'px';
      el.style.height = sz + 'px';
      var pos = tryPlace(sz, placed);
      placed.push({ x: pos.x, y: pos.y, w: sz });
      states.push({
        el: el,
        x: pos.x, y: pos.y, w: sz, h: sz,
        vx: (0.15 + Math.random() * 0.35) * (Math.random() < 0.5 ? -1 : 1) * 50,
        vy: (0.15 + Math.random() * 0.35) * (Math.random() < 0.5 ? -1 : 1) * 35
      });
    });

    // 用 cached vw/vh 判断边界折返，不读 DOM
    function stayInBounds(s) {
      if (s.x <= 0 && s.vx < 0) s.vx = Math.abs(s.vx);
      if (s.x + s.w >= vw && s.vx > 0) s.vx = -Math.abs(s.vx);
      if (s.y <= 0 && s.vy < 0) s.vy = Math.abs(s.vy);
      if (s.y + s.h >= vh && s.vy > 0) s.vy = -Math.abs(s.vy);
      if (Math.random() < 0.01) s.vx += (Math.random() - 0.5) * 8;
      if (Math.random() < 0.01) s.vy += (Math.random() - 0.5) * 8;
    }

    function tick(ts) {
      raf = requestAnimationFrame(tick);
      if (last == null) last = ts;
      var dt = Math.min((ts - last) / 1000, 0.1);
      last = ts;
      // 泡泡间互斥：重叠时沿圆心连线推开，避免长时间重合
      for (var i = 0; i < states.length; i++) {
        for (var j = i + 1; j < states.length; j++) resolveOverlap(states[i], states[j]);
      }
      for (var k = 0; k < states.length; k++) {
        var s = states[k];
        stayInBounds(s);
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.el.style.transform = 'translate3d(' + s.x + 'px,' + s.y + 'px,0)';
      }
    }
    var last = null;

    // 两颗泡泡的圆心互斥：发生接触时沿连线将两者推开至刚好相切
    function resolveOverlap(a, b) {
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var minDist = (a.w + b.w) * 0.5; // 两半径之和
      if (dist >= minDist || dist === 0) {
        if (dist === 0) { a.x += 1; return; } // 完全重合时给一个单位扰动
        return;
      }
      var ux = dx / dist, uy = dy / dist;
      var push = (minDist - dist) * 0.5; // 各自推开一半
      a.x += ux * push; a.y += uy * push;
      b.x -= ux * push; b.y -= uy * push;
      // 轻微交换法向速度分量，产生反弹，更自然
      var va = a.vx * ux + a.vy * uy;
      var vb = b.vx * ux + b.vy * uy;
      if (va < vb) {
        a.vx += (vb - va) * ux; a.vy += (vb - va) * uy;
        b.vx -= (vb - va) * ux; b.vy -= (vb - va) * uy;
      }
    }

    function start() {
      if (active) return;
      active = true;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
    }
    // 统一按当前状态调度：用户关闭→停；否则跟随页面可见性
    function sync() {
      if (!userOn || document.hidden) stop();
      else start();
    }
    function onResize() {
      vw = document.documentElement.clientWidth;
      vh = document.documentElement.clientHeight;
      // 视口缩小后把越界的泡泡拉回界内
      states.forEach(function (s) {
        if (s.x + s.w > vw) s.x = Math.max(vw - s.w, 0);
        if (s.y + s.h > vh) s.y = Math.max(vh - s.h, 0);
      });
    }
    function onVis() { sync(); }

    // 头像开关：点击暂停/恢复泡泡（关闭时头像置灰）
    var toggle = document.querySelector('[data-bg-toggle]');
    if (toggle) {
      toggle.classList.toggle('off', !userOn);
      toggle.addEventListener('click', function () {
        userOn = !userOn;
        toggle.classList.toggle('off', !userOn);
        sync();
      });
    }

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    sync();
  }
};