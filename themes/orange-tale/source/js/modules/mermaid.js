// 功能模块：Mermaid 图表渲染 + 主题色 + 缩放/平移/下载
// 依赖：Mermaid（本地 js/vendor/mermaid.min.js，已本地化，无外部 CDN）
// 目标：服务端转换的 .mermaid 容器；加载/渲染失败时降级显示原始代码
// 交互：滚轮/＋－缩放（1x~4x）、拖拽平移、双击复位、双指捏合；工具栏可下载 SVG/PNG
import { loadScript } from './loader.js';

var THEME_VARS = {
  fontFamily: '"LXGW WenKai","PingFang SC","Microsoft YaHei",sans-serif',
  primaryColor: '#FFF1E0', primaryBorderColor: '#C25E00', primaryTextColor: '#241F19',
  secondaryColor: '#FBF8F3', secondaryBorderColor: '#C25E00', secondaryTextColor: '#241F19',
  tertiaryColor: '#FFF1E0', tertiaryBorderColor: '#C25E00', tertiaryTextColor: '#241F19',
  background: '#FBF8F3', mainBkg: '#FFF1E0', nodeBorder: '#C25E00', nodeTextColor: '#241F19',
  lineColor: '#C25E00', edgeLabelBackground: '#FFF1E0', titleColor: '#241F19',
  clusterBkg: '#FBF8F3', clusterBorder: '#C25E00',
  actorBkg: '#FFF1E0', actorBorder: '#C25E00', actorTextColor: '#241F19',
  signalColor: '#241F19', signalTextColor: '#241F19',
  labelBoxBkgColor: '#FFF1E0', labelBoxBorderColor: '#C25E00', labelTextColor: '#241F19',
  noteBkgColor: '#FFF1E0', noteTextColor: '#241F19', noteBorderColor: '#C25E00',
  classText: '#241F19', classBkg: '#FFF1E0',
  pie1: '#FF9700', pie2: '#FFB84D', pie3: '#C25E00', pie4: '#FFF1E0', pie5: '#FFD9A0',
  pie6: '#8A8073', pie7: '#FBF8F3', pie8: '#241F19',
  pieTitleTextColor: '#241F19', pieSectionTextColor: '#241F19', pieLegendTextColor: '#241F19'
};

function svgString(svg) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg);
}
function downloadBlob(blob, name) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}
function downloadSvg(svg) {
  downloadBlob(new Blob([svgString(svg)], { type: 'image/svg+xml' }), 'mermaid-' + Date.now() + '.svg');
}
function downloadPng(svg) {
  var vb = svg.viewBox && svg.viewBox.baseVal;
  var w = (vb && vb.width) || svg.getBoundingClientRect().width;
  var h = (vb && vb.height) || svg.getBoundingClientRect().height;
  var k = 2; // 2x 导出保证清晰
  var img = new Image();
  img.onload = function () {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#FBF8F3'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(function (blob) {
      if (blob) downloadBlob(blob, 'mermaid-' + Date.now() + '.png');
    }, 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString(svg));
}

function copyText(text, btn) {
  var done = function () {
    if (!btn) return;
    var old = btn.textContent;
    btn.textContent = '已复制';
    setTimeout(function () { btn.textContent = old; }, 1200);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
  } else {
    fallbackCopy(text); done();
  }
}
function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) { /* ignore */ }
  ta.remove();
}

function enhance(svg, code) {
  var viewer = document.createElement('div');
  viewer.className = 'mermaid-viewer';
  var canvas = document.createElement('div');
  canvas.className = 'mermaid-canvas';
  svg.parentNode.insertBefore(viewer, svg);
  viewer.appendChild(canvas);
  canvas.appendChild(svg);

  var tb = document.createElement('div');
  tb.className = 'mermaid-toolbar';
  tb.innerHTML = '<button data-act="zoom-in" title="放大">＋</button>'
    + '<button data-act="zoom-out" title="缩小">－</button>'
    + '<button data-act="reset" title="复位">⤾</button>'
    + '<button data-act="copy" title="复制 Mermaid 代码">复制</button>'
    + '<button data-act="svg" title="下载 SVG">SVG</button>'
    + '<button data-act="png" title="下载 PNG">PNG</button>';
  viewer.appendChild(tb);

  var scale = 1, tx = 0, ty = 0, MIN = 1, MAX = 4;
  function apply() { canvas.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')'; }
  function resetView() { scale = 1; tx = 0; ty = 0; apply(); }
  function zoomAt(px, py, f) {
    var ns = Math.min(MAX, Math.max(MIN, scale * f));
    if (ns === scale) return;
    var k = ns / scale;
    tx = px - (px - tx) * k; ty = py - (py - ty) * k;
    scale = ns; apply();
  }
  function isZoomed() { return scale > 1.01; }

  viewer.addEventListener('wheel', function (e) {
    e.preventDefault();
    var r = viewer.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  }, { passive: false });

  var dragging = false, sx = 0, sy = 0, stx = 0, sty = 0;
  canvas.addEventListener('mousedown', function (e) {
    if (!isZoomed()) return;
    dragging = true; sx = e.clientX; sy = e.clientY; stx = tx; sty = ty;
    canvas.style.cursor = 'grabbing'; e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    tx = stx + (e.clientX - sx); ty = sty + (e.clientY - sy);
    apply();
  });
  document.addEventListener('mouseup', function () {
    dragging = false;
    canvas.style.cursor = isZoomed() ? 'grab' : '';
  });
  canvas.style.cursor = 'grab';
  canvas.addEventListener('dblclick', resetView);

  tb.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var r = viewer.getBoundingClientRect();
    var act = btn.getAttribute('data-act');
    if (act === 'zoom-in') zoomAt(r.width / 2, r.height / 2, 1.5);
    else if (act === 'zoom-out') zoomAt(r.width / 2, r.height / 2, 1 / 1.5);
    else if (act === 'reset') resetView();
    else if (act === 'copy') copyText(code || '', btn);
    else if (act === 'svg') downloadSvg(svg);
    else if (act === 'png') downloadPng(svg);
  });

  // 触屏：双指捏合缩放 + 单指平移
  var pinch = null, panStart = null;
  viewer.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      pinch = { dist: Math.hypot(dx, dy), scale: scale, cx: (e.touches[0].clientX + e.touches[1].clientX) / 2, cy: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
      panStart = null;
    } else if (e.touches.length === 1 && isZoomed()) {
      panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: tx, ty: ty };
    }
  }, { passive: true });
  viewer.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2 && pinch) {
      e.preventDefault();
      var r = viewer.getBoundingClientRect();
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      var target = Math.min(MAX, Math.max(MIN, pinch.scale * (Math.hypot(dx, dy) / pinch.dist)));
      var k = target / scale;
      tx = (pinch.cx - r.left) - ((pinch.cx - r.left) - tx) * k;
      ty = (pinch.cy - r.top) - ((pinch.cy - r.top) - ty) * k;
      scale = target; apply();
    } else if (e.touches.length === 1 && panStart) {
      e.preventDefault();
      tx = panStart.tx + (e.touches[0].clientX - panStart.x);
      ty = panStart.ty + (e.touches[0].clientY - panStart.y);
      apply();
    }
  }, { passive: false });
  viewer.addEventListener('touchend', function () {
    pinch = null; panStart = null;
  }, { passive: true });
}

export default {
  name: 'mermaid',
  init: function () {
    var nodes = document.querySelectorAll('.mermaid');
    if (!nodes.length) return;
    // 渲染前先记录原始代码（mermaid.run 会替换节点内容，之后取不到）
    var codes = Array.prototype.map.call(nodes, function (n) { return (n.textContent || '').trim(); });
    var base = (window.__AB__ && window.__AB__.base) || '/';
    loadScript(base + 'js/vendor/mermaid.min.js', function (err) {
      if (err || !window.mermaid) return; // 降级：保留原始代码文本
      try {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: THEME_VARS,
          securityLevel: 'strict',
          fontFamily: 'inherit'
        });
        window.mermaid.run({ nodes: nodes }).then(function () {
          nodes.forEach(function (n, i) {
            var svg = n.querySelector('svg');
            if (svg) enhance(svg, codes[i] || '');
          });
        });
      } catch (e) { /* 降级 */ }
    });
  }
};