// ============================================================
// 雷达图渲染（Chart.js）
// 依赖：本地 js/vendor/chart.min.js（已本地化，无外部 CDN）
// 目标：服务端转换的 .radar 容器，其文本内容是 JSON 配置
// 语法：```radar { "labels": [...], "datasets": [{ "data": [...] }] } ```
// ============================================================
import { loadScript } from './loader.js';

// 主题色盘：与站点品牌色一致（橙黄暖色系）
var COLORS = ['#FF9700', '#C25E00', '#3a2c1c', '#FFB84D', '#8A8073', '#FFD9A0'];
var GRID = 'rgba(36, 31, 25, 0.10)';
var TEXT = '#241F19';

// 题目 color 字段若为默认即自动轮换色盘；fill 默认半透明填充
function makeDataset(set, i) {
  var color = set.color || COLORS[i % COLORS.length];
  return {
    label: set.label || '',
    data: set.data || [],
    borderColor: color,
    backgroundColor: hexToRgba(color, typeof set.fill === 'boolean' ? (set.fill ? 0.35 : 0) : 0.35),
    borderWidth: 2,
    pointBackgroundColor: '#ffffff',
    pointBorderColor: color,
    pointBorderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5
  };
}

// '#rrggbb' -> 'rgba(r,g,b,a)'；不支持则原样返回
function hexToRgba(hex, a) {
  var h = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!h) return hex;
  return 'rgba(' + parseInt(h[1], 16) + ',' + parseInt(h[2], 16) + ',' + parseInt(h[3], 16) + ',' + a + ')';
}

function parseConfig(node) {
  try {
    var cfg = JSON.parse(node.textContent || '{}');
    var labels = cfg.labels || [];
    var sets = cfg.datasets || [];
    if (!labels.length || !sets.length || !sets[0].data || !sets[0].data.length) return null;
    return cfg;
  } catch (e) {
    return null;
  }
}

function buildConfig(cfg) {
  return {
    type: 'radar',
    data: {
      labels: cfg.labels,
      datasets: cfg.datasets.map(makeDataset)
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        title: {
          display: !!cfg.title,
          text: cfg.title || '',
          color: TEXT,
          font: { size: 16, family: '"LXGW WenKai",sans-serif', weight: 'bold' },
          padding: { bottom: 10 }
        },
        legend: {
          position: cfg.legend || 'bottom',
          labels: { color: TEXT, usePointStyle: true, boxWidth: 8 }
        },
        tooltip: {
          backgroundColor: 'rgba(36, 31, 25, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff'
        }
      },
      scales: {
        r: {
          min: cfg.min || 0,
          max: cfg.max || 10,
          ticks: { display: cfg.ticks !== false, stepSize: cfg.step, backdropColor: 'transparent', color: 'rgba(36,31,25,.5)', font: { size: 10 } },
          angleLines: { color: GRID },
          grid: { color: GRID },
          pointLabels: { color: TEXT, font: { size: 12, family: '"LXGW WenKai",sans-serif' } }
        }
      }
    }
  };
}

export default {
  name: 'radar',
  init: function () {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.radar'));
    if (!nodes.length) return;

    // 先记录原始 JSON（渲染时 canvas 会替换容器内文本）
    var configs = nodes.map(parseConfig);
    if (configs.some(function (c) { return !c; })) {
      if (window.console) console.warn('[radar] 存在无法解析的 JSON 配置，保持降级显示文本');
    }

    var base = (window.__AB__ && window.__AB__.base) || '/';
    loadScript(base + 'js/vendor/chart.min.js', function (err) {
      if (err || !window.Chart) return; // 降级：保留原始 JSON 文本
      var ChartCtor = window.Chart;
      nodes.forEach(function (node, i) {
        var cfg = configs[i];
        if (!cfg) return;
        // 清空原文本，换为 canvas
        node.textContent = '';
        var canvas = document.createElement('canvas');
        node.appendChild(canvas);
        try {
          new ChartCtor(canvas.getContext('2d'), buildConfig(cfg));
        } catch (e) {
          if (window.console) console.error('[radar] 渲染失败:', e);
        }
      });
    });
  }
};