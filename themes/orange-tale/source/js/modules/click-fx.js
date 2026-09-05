// ============================================================
// 暖橙点击特效 + 光标拖尾（纯 Canvas 2D，零依赖）
// ============================================================
// 对齐主题「橙の语」配色（#FF9700 / #FFB84D / #FFD9A0 / #C25E00），
// 不引 WebGL / WebGPU，固定粒子上限，DPR 限 1.5，
// 不拦截 pointer-events，尊重 prefers-reduced-motion。
// ============================================================
export default {
  name: 'click_fx',
  init: function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var root = document.documentElement;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = [
      'position:fixed',
      'inset:0',
      'pointer-events:none',    // 不挡页面点击
      'z-index:9999',
      'mix-blend-mode:source-over',
      'contain:strict'
    ].join(';');
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = root.clientWidth; h = root.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // —— 暖橙配色：从 CSS 变量读一次，读不到时用硬编码 fallback ——
    var styles = getComputedStyle(root);
    var C_PRIMARY = styles.getPropertyValue('--primary').trim() || '#FF9700';
    var C_AMBER = styles.getPropertyValue('--amber').trim() || '#FFB84D';
    var C_YELLOW = styles.getPropertyValue('--yellow').trim() || '#FFD9A0';
    var C_DEEP = styles.getPropertyValue('--primary-deep').trim() || '#C25E00';

    // —— 粒子池（click burst）——
    var particles = [];
    var MAX_PARTICLES = 160;

    function emitBurst(x, y) {
      // 16 颗橙黄粒子向外飞，圆形与三角形交替
      var count = 16;
      for (var i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        var ang = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        var speed = 60 + Math.random() * 80;
        var colors = [C_PRIMARY, C_AMBER, C_YELLOW];
        var isTri = (i % 2 === 0);  // 圆/三角交替
        particles.push({
          x: x, y: y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          life: 0.65,
          age: 0,
          size: 3 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          kind: isTri ? 'tri' : 'spark',
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 8    // 旋转速度（弧度/秒）
        });
      }
      // 一个扩散圆环
      particles.push({
        x: x, y: y,
        life: 0.55, age: 0,
        radius: 2, maxRadius: 36,
        color: C_PRIMARY,
        kind: 'ring'
      });
    }

    // —— 拖尾点（trail）——
    var trail = [];
    var TRAIL_MAX = 28;
    var lastTrailX = -999, lastTrailY = -999;
    var TRAIL_GAP = 8;  // 像素间距，小于此不生成新点（降频）

    function emitTrail(x, y) {
      var dx = x - lastTrailX, dy = y - lastTrailY;
      if (dx * dx + dy * dy < TRAIL_GAP * TRAIL_GAP) return;
      lastTrailX = x; lastTrailY = y;
      trail.push({ x: x, y: y, age: 0, life: 0.45, size: 6 + Math.random() * 2 });
      if (trail.length > TRAIL_MAX) trail.shift();
    }

    // —— 事件：pointer 统一处理（mouse + touch）——
    // 注意：canvas 设了 pointer-events:none，事件必须绑在 document 上才能收到。
    var activePointer = false;
    function onDown(e) {
      activePointer = true;
      emitBurst(e.clientX, e.clientY);
    }
    function onUp(e) { activePointer = false; }
    function onMove(e) {
      emitTrail(e.clientX, e.clientY);
    }

    // 绑在 document 上，不是 canvas（canvas 是 pointer-events:none）
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onUp);
    document.addEventListener('pointercancel', onUp);

    // —— 主循环 ——
    var rafId = null, lastTs = null;
    function tick(ts) {
      rafId = requestAnimationFrame(tick);
      if (lastTs == null) lastTs = ts;
      var dt = Math.min((ts - lastTs) / 1000, 0.05);  // 防止 tab 切回来 dt 爆炸
      lastTs = ts;

      // 清屏（整屏 clear，最省）
      ctx.clearRect(0, 0, w, h);

      // 画拖尾（先画，让 click burst 叠上面）
      for (var i = 0; i < trail.length; i++) {
        var t = trail[i];
        t.age += dt;
        if (t.age >= t.life) { trail.splice(i, 1); i--; continue; }
        var alpha = 1 - t.age / t.life;
        var sz = t.size * alpha;
        ctx.beginPath();
        ctx.fillStyle = C_YELLOW;
        ctx.globalAlpha = alpha * 0.55;
        ctx.arc(t.x, t.y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 画粒子
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.age += dt;
        if (p.age >= p.life) { particles.splice(j, 1); j--; continue; }

        if (p.kind === 'spark' || p.kind === 'tri') {
          // 小火花/三角：受重力 + 空气阻力
          p.vy += 80 * dt;
          p.vx *= 1 - 1.4 * dt;
          p.vy *= 1 - 1.4 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.kind === 'tri') p.rot += p.vrot * dt;  // 三角形自旋
          var a = 1 - p.age / p.life;
          ctx.globalAlpha = a;
          if (p.kind === 'spark') {
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(p.x, p.y, p.size * (0.6 + a * 0.4), 0, Math.PI * 2);
            ctx.fill();
          } else {
            // 三角形（等边，稍微旋转）
            var s = p.size * 1.3 * (0.6 + a * 0.4);
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.87, s * 0.5);
            ctx.lineTo(-s * 0.87, s * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        } else if (p.kind === 'ring') {
          // 扩散圆环
          var ra = p.age / p.life;
          var r = p.radius + (p.maxRadius - p.radius) * ra;
          ctx.globalAlpha = (1 - ra) * 0.85;
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2 + (1 - ra) * 2;
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    rafId = requestAnimationFrame(tick);

    // —— 响应式 ——
    var onResize = function () { resize(); };
    window.addEventListener('resize', onResize);

    // —— 页面可见性：隐藏时暂停，省 CPU ——
    var onVis = function () {
      if (document.hidden) {
        cancelAnimationFrame(rafId); rafId = null;
      } else if (!rafId) {
        lastTs = null; rafId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // —— 清理钩子 ——
    this._destroy = function () {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onUp);
      document.removeEventListener('pointercancel', onUp);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      if (rafId) cancelAnimationFrame(rafId);
      canvas.remove();
    };
  },
  exit: function () { this._destroy && this._destroy(); }
};