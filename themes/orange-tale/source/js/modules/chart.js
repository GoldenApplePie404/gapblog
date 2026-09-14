// ============================================================
// Chart.js 通用图表模块（支持 radar / line / bar / pie / doughnut / scatter / polarArea）
// 依赖：本地 js/vendor/chart.min.js（已本地化，无外部 CDN）
// 语法：
//   ```chart { "type": "line", "labels": [...], "datasets": [...] }
//   ```radar { "labels": [...], "datasets": [...] }   ← 旧语法自动补 type:'radar'，向后兼容
//   ```chart { "type": "bar", "csv": "A,B,C\n10,20,30\n15,25,35" }   ← CSV 内嵌
//   ```chart { "type": "line", "dataUrl": "/data/stats.csv" }        ← CSV 远程
//
// 主题切换：从 CSS 变量实时读取颜色；themechange 事件触发时 destroy + 重建所有实例。
// ============================================================
import { loadScript } from './loader.js';

// 主题色盘（橙黄暖色系，深浅两版——暗色下自动切深/降饱和）
var COLORS_LIGHT = ['#FF9700', '#C25E00', '#3a2c1c', '#FFB84D', '#8A8073', '#FFD9A0'];
var COLORS_DARK  = ['#FF9700', '#FFB259', '#FFC97B', '#FFB84D', '#D4C9B5', '#FFE2A8'];

var charts = []; // 所有 Chart 实例，主题切换时用

// 读 CSS 变量（深浅主题自动适应，每次 buildConfig 都重新读）
function getThemeColors() {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  var style = getComputedStyle(document.documentElement);
  var text = style.getPropertyValue('--text').trim() || (dark ? '#e8dfd2' : '#241F19');
  var grid = dark ? 'rgba(232,223,210,0.15)' : 'rgba(36,31,25,0.10)';
  var gridSub = dark ? 'rgba(232,223,210,0.07)' : 'rgba(36,31,25,0.06)';
  var colors = dark ? COLORS_DARK : COLORS_LIGHT;
  var tooltipBg = dark ? 'rgba(29,24,17,0.95)' : 'rgba(36,31,25,0.9)';
  var pointDot = dark ? '#1d1811' : '#ffffff'; // 点边框/底色，暗色下用深底让白点对比
  return { dark: dark, text: text, grid: grid, gridSub: gridSub, colors: colors, tooltipBg: tooltipBg, pointDot: pointDot };
}

// '#rrggbb' -> 'rgba(r,g,b,a)'
function hexToRgba(hex, a) {
  var h = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!h) return hex;
  return 'rgba(' + parseInt(h[1], 16) + ',' + parseInt(h[2], 16) + ',' + parseInt(h[3], 16) + ',' + a + ')';
}

// 每个数据集的通用样式
function makeDataset(set, i, type, theme) {
  var color = set.color || theme.colors[i % theme.colors.length];
  var fillBool = typeof set.fill === 'boolean' ? set.fill : true;
  var fillAlpha = fillBool ? 0.35 : 0;
  if (type === 'pie' || type === 'doughnut') {
    return {
      label: set.label || '',
      data: set.data || [],
      backgroundColor: theme.colors.slice(0, set.data.length).map(function (c) { return hexToRgba(c, 0.85); }),
      borderColor: theme.colors.slice(0, set.data.length).map(function (c) { return c; }),
      borderWidth: 2
    };
  }
  return {
    label: set.label || '',
    data: set.data || [],
    borderColor: color,
    backgroundColor: type === 'bar' ? hexToRgba(color, 0.7) : hexToRgba(color, fillAlpha),
    borderWidth: 2,
    pointBackgroundColor: theme.pointDot,
    pointBorderColor: color,
    pointBorderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: type === 'line' ? 0.3 : 0
  };
}

function parseConfig(node) {
  try {
    return JSON.parse(node.textContent || '{}');
  } catch (e) { return null; }
}

// CSV 解析：第一行 = labels，后续每行 = 一个数据集
function parseCsv(text) {
  var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  if (lines.length < 2) return null;
  var header = lines[0].split(/[,\t]/).map(function (v) { return v.trim(); });
  var labels = header.slice(1);
  var datasets = [];
  for (var i = 1; i < lines.length; i++) {
    var parts = lines[i].split(/[,\t]/).map(function (v) { return v.trim(); });
    datasets.push({ label: parts[0] || ('Series ' + i), data: parts.slice(1).map(function (v) { var n = parseFloat(v); return isNaN(n) ? null : n; }) });
  }
  return { labels: labels, datasets: datasets };
}

function makeScales(type, cfg, theme) {
  if (type === 'radar') {
    return {
      r: {
        min: cfg.min || 0, max: cfg.max || 10,
        ticks: { display: cfg.ticks !== false, stepSize: cfg.step, backdropColor: 'transparent', color: theme.text, font: { size: 10 } },
        angleLines: { color: theme.grid },
        grid: { color: theme.gridSub },
        pointLabels: { color: theme.text, font: { size: 12, family: '"LXGW WenKai",sans-serif' } }
      }
    };
  }
  if (type === 'polarArea') {
    return {
      r: {
        min: cfg.min || 0, max: cfg.max,
        ticks: { display: cfg.ticks !== false, backdropColor: 'transparent', color: theme.text, font: { size: 10 } },
        grid: { color: theme.grid },
        pointLabels: { color: theme.text, font: { size: 12 } }
      }
    };
  }
  if (type === 'line' || type === 'bar' || type === 'scatter') {
    return {
      x: {
        type: cfg.labelAxis || 'category', labels: cfg.labels,
        grid: { color: theme.gridSub },
        ticks: { color: theme.text, font: { size: 12 } }
      },
      y: {
        beginAtZero: cfg.beginAtZero !== false, min: cfg.min, max: cfg.max,
        grid: { color: theme.grid },
        ticks: { color: theme.text, font: { size: 12 } }
      }
    };
  }
  return {};
}

function aspectRatioFor(type) {
  if (type === 'radar' || type === 'polarArea' || type === 'pie') return 1;
  if (type === 'doughnut') return 1.3;
  return 2;
}

function buildConfig(cfg) {
  var type = cfg.type || 'radar';
  var supported = ['radar', 'line', 'bar', 'pie', 'doughnut', 'scatter', 'polarArea'];
  if (supported.indexOf(type) < 0) type = 'radar';

  var theme = getThemeColors();

  var dataObj = { datasets: cfg.datasets.map(function (s, i) { return makeDataset(s, i, type, theme); }) };
  if (type !== 'pie' && type !== 'doughnut') dataObj.labels = cfg.labels;

  var c = {
    type: type,
    data: dataObj,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: cfg.aspectRatio || aspectRatioFor(type),
      plugins: {
        title: {
          display: !!cfg.title, text: cfg.title || '',
          color: theme.text,
          font: { size: 16, family: '"LXGW WenKai",sans-serif', weight: 'bold' },
          padding: { bottom: 10 }
        },
        legend: {
          display: cfg.legend !== false,
          position: cfg.legend || 'bottom',
          labels: { color: theme.text, usePointStyle: true, boxWidth: 8, font: { family: '"LXGW WenKai",sans-serif' } }
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.text,
          bodyColor: theme.text,
          borderColor: theme.grid,
          borderWidth: 1
        }
      }
    }
  };

  if (type === 'radar' || type === 'polarArea' || type === 'line' || type === 'bar' || type === 'scatter') {
    c.options.scales = makeScales(type, cfg, theme);
  }

  return c;
}

function resolveCsv(cfg, base) {
  if (cfg.csv && typeof cfg.csv === 'string') {
    var parsed = parseCsv(cfg.csv);
    if (parsed) { cfg.labels = cfg.labels || parsed.labels; cfg.datasets = cfg.datasets || parsed.datasets; }
    return Promise.resolve(cfg);
  }
  if (cfg.dataUrl && typeof cfg.dataUrl === 'string') {
    var url = cfg.dataUrl;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/gapblog')) url = (base || '/').replace(/\/$/, '') + url;
    return fetch(url).then(function (r) { return r.text(); }).then(function (text) {
      var parsed = parseCsv(text);
      if (parsed) { cfg.labels = cfg.labels || parsed.labels; cfg.datasets = cfg.datasets || parsed.datasets; }
      return cfg;
    }).catch(function () { return cfg; });
  }
  return Promise.resolve(cfg);
}

export default {
  name: 'chart',
  init: function () {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.chart'));
    if (!nodes.length) return;

    var base = (window.__AB__ && window.__AB__.base) || '/';
    var savedCfgs = nodes.map(parseConfig); // 保存原始 cfg 供主题切换时重建

    loadScript(base + 'js/vendor/chart.min.js', function (err) {
      if (err || !window.Chart) return;
      var ChartCtor = window.Chart;

      function renderOne(node, cfg) {
        node.textContent = '';
        var canvas = document.createElement('canvas');
        node.appendChild(canvas);
        try {
          var inst = new ChartCtor(canvas.getContext('2d'), buildConfig(cfg));
          charts.push({ inst: inst, node: node, cfg: cfg });
        } catch (e) {
          if (window.console) console.error('[chart] 渲染失败:', e);
        }
      }

      nodes.forEach(function (node, i) {
        var cfg = savedCfgs[i];
        if (!cfg) return;
        resolveCsv(cfg, base).then(function (resolved) {
          renderOne(node, resolved);
        });
      });

      // 主题切换：destroy 所有实例，用当前颜色重建
      document.addEventListener('themechange', function () {
        charts.forEach(function (entry) {
          entry.inst.destroy();
          entry.inst = null;
        });
        charts = [];
        nodes.forEach(function (node, i) {
          var cfg = savedCfgs[i];
          if (!cfg) return;
          if (cfg._resolved) { // CSV 已解析过的 cfg 直接重建
            renderOne(node, cfg);
          } else {
            resolveCsv(cfg, base).then(function (resolved) {
              cfg._resolved = true;
              renderOne(node, cfg);
            });
          }
        });
      });
    });
  }
};
