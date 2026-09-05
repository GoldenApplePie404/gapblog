// ============================================================
// Anime Business 功能层入口（boot）
// 模块契约：export default { name, init(ctx) }
// 配置：_config.yml 的 features.* 开关，经 window.__AB__ 注入
// 约定：JS 只通过 data-* 钩子 / CSS 变量与样式层对话
// ============================================================
import nav from './modules/nav.js';
import readingBar from './modules/reading-bar.js';
import backTop from './modules/back-top.js';
import copyCode from './modules/copy-code.js';
import codeFold from './modules/code-fold.js';
import masonry from './modules/masonry.js';
import reveal from './modules/reveal.js';
import math from './modules/math.js';
import mermaid from './modules/mermaid.js';
import typewriter from './modules/typewriter.js';
import search from './modules/search.js';
import pageTransition from './modules/page-transition.js';
import music from './modules/music.js';
import toc from './modules/toc.js';
import lightbox from './modules/lightbox.js';
import bgDeco from './modules/bg-deco.js';
import tables from './modules/tables.js';
import radar from './modules/radar.js';
import clickFx from './modules/click-fx.js';

var features = (window.__AB__ && window.__AB__.features) || {};
var ctx = { features: features, root: document };

var modules = [nav, readingBar, backTop, copyCode, codeFold, masonry, reveal, math, mermaid, typewriter, search, pageTransition, music, toc, lightbox, bgDeco, tables, radar, clickFx];

modules.forEach(function (mod) {
  if (features[mod.name] === false) return;
  try {
    mod.init(ctx);
  } catch (e) {
    if (window.console) console.error('[AB] module init failed: ' + mod.name, e);
  }
});
