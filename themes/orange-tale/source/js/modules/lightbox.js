// 文章图片灯箱（点击放大 + 缩放 + 平移）
// 钩子：.post-content img（排除 [data-no-lightbox]）
// 交互：
//   点击遮罩/Esc 关闭；← → 切换同文章图片
//   滚轮 / ＋－按钮 / 双击 缩放（以光标/中心为锚点）
//   缩放 >1 时：鼠标拖拽 / 单指拖动 平移；双指捏合缩放
//   缩放 =1 时：单指左右滑动切换图片
export default {
  name: 'lightbox',
  init: function () {
    var content = document.querySelector('.post-content');
    if (!content) return;
    var imgs = content.querySelectorAll('img:not([data-no-lightbox])');
    if (!imgs.length) return;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<button class="lb-close" aria-label="关闭">✕</button>'
      + '<button class="lb-zoom-in" aria-label="放大">＋</button>'
      + '<button class="lb-zoom-out" aria-label="缩小">－</button>'
      + '<button class="lb-prev" aria-label="上一张">‹</button>'
      + '<button class="lb-next" aria-label="下一张">›</button>'
      + '<div class="lb-stage"><img alt=""></div>'
      + '<div class="lb-cap"></div>';
    document.body.appendChild(box);

    var stage = box.querySelector('.lb-stage');
    var stageImg = box.querySelector('.lb-stage img');
    var capEl = box.querySelector('.lb-cap');
    var prevBtn = box.querySelector('.lb-prev');
    var nextBtn = box.querySelector('.lb-next');
    var zoomInBtn = box.querySelector('.lb-zoom-in');
    var zoomOutBtn = box.querySelector('.lb-zoom-out');
    var idx = 0;

    var MIN = 1, MAX = 5;
    var scale = 1, tx = 0, ty = 0;

    function apply() {
      stageImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    }
    function resetView() { scale = 1; tx = 0; ty = 0; apply(); }
    function zoomAt(px, py, factor) {
      var ns = Math.min(MAX, Math.max(MIN, scale * factor));
      if (ns === scale) return;
      var k = ns / scale;
      tx = px - (px - tx) * k;
      ty = py - (py - ty) * k;
      scale = ns;
      apply();
    }
    function toggleZoom() {
      if (scale > 1.01) resetView();
      else zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 2.5);
    }
    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      var img = imgs[idx];
      stageImg.src = img.getAttribute('data-zoom') || img.src;
      stageImg.alt = img.alt || '';
      capEl.textContent = img.alt || '';
      resetView();
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    function nav(d) { show(idx + d); }

    imgs.forEach(function (img, i) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function (e) { e.preventDefault(); show(i); });
    });
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); nav(-1); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); nav(1); });
    zoomInBtn.addEventListener('click', function (e) { e.stopPropagation(); zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.5); });
    zoomOutBtn.addEventListener('click', function (e) { e.stopPropagation(); zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1 / 1.5); });
    stageImg.addEventListener('dblclick', function (e) { e.preventDefault(); toggleZoom(); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.querySelector('.lb-close').addEventListener('click', close);

    // 滚轮缩放（以光标为锚点）
    box.addEventListener('wheel', function (e) {
      if (!box.classList.contains('open')) return;
      e.preventDefault();
      var rect = stage.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });

    // 鼠标拖拽平移（scale > 1 时）
    var dragging = false, sx = 0, sy = 0, stx = 0, sty = 0;
    stageImg.addEventListener('mousedown', function (e) {
      if (scale <= 1.01) return;
      dragging = true; sx = e.clientX; sy = e.clientY; stx = tx; sty = ty;
      stageImg.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      tx = stx + (e.clientX - sx);
      ty = sty + (e.clientY - sy);
      apply();
    });
    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      stageImg.style.cursor = scale > 1.01 ? 'grab' : '';
    });

    // 触屏：双指捏合缩放 + 单指平移 / 滑动切换
    var pinch = null, panStart = null, swipeX = 0;
    box.addEventListener('touchstart', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.touches.length === 2) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        pinch = { dist: Math.hypot(dx, dy), scale: scale, cx: (e.touches[0].clientX + e.touches[1].clientX) / 2, cy: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
        panStart = null;
      } else if (e.touches.length === 1) {
        swipeX = e.touches[0].clientX;
        if (scale > 1.01) panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: tx, ty: ty };
        else panStart = null;
      }
    }, { passive: true });
    box.addEventListener('touchmove', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.touches.length === 2 && pinch) {
        e.preventDefault();
        var rect = stage.getBoundingClientRect();
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var dist = Math.hypot(dx, dy);
        var target = Math.min(MAX, Math.max(MIN, pinch.scale * (dist / pinch.dist)));
        var k = target / scale;
        tx = (pinch.cx - rect.left) - ((pinch.cx - rect.left) - tx) * k;
        ty = (pinch.cy - rect.top) - ((pinch.cy - rect.top) - ty) * k;
        scale = target;
        apply();
      } else if (e.touches.length === 1 && panStart) {
        e.preventDefault();
        tx = panStart.tx + (e.touches[0].clientX - panStart.x);
        ty = panStart.ty + (e.touches[0].clientY - panStart.y);
        apply();
      }
    }, { passive: false });
    box.addEventListener('touchend', function (e) {
      if (e.touches.length === 0) {
        if (pinch) pinch = null;
        if (panStart) { panStart = null; return; }
        // 未进入平移态（scale=1）→ 滑动切换
        var lastX = e.changedTouches[0].clientX;
        var d = lastX - swipeX;
        if (Math.abs(d) > 50) nav(d > 0 ? -1 : 1);
      }
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') nav(-1);
      else if (e.key === 'ArrowRight') nav(1);
    });
  }
};