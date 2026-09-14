// ============================================================
// ABC Notation 乐谱渲染 + 音频播放（CreateSynth 基础模式）
// 依赖：js/vendor/abcjs.min.js（6.7.0，UMD 挂 window.ABCJS）
// 语法：
//   ```abc
//   ---
//   tempo: 120
//   instrument: piano
//   loop: true
//   ---
//   T: 标题
//   K: C
//   C C G G | A A G2 |
//   ```
// ============================================================
import { loadScript } from './loader.js';

// 可用乐器（MIDI program number，传给 CreateSynth.init 的 options.program）
// 参考：https://en.wikipedia.org/wiki/General_MIDI#Program_change_events
var INSTRUMENTS = {
  piano: 0,          // acoustic_grand_piano
  guitar: 25,        // acoustic_guitar_nylon
  guitar_electric: 27, // electric_guitar_clean
  bass: 33,          // acoustic_bass
  flute: 73,
  mandolin: 16,
  trumpet: 56,
  violin: 40,
  drums: 128         // 打击乐（channel 10）
};

// 乐器是否可复用于同一个 synth（大部分不行，都需要重建）
function parseFrontmatter(raw) {
  var fm = {};
  var trimmed = raw.replace(/^\s+/, '');
  if (trimmed.indexOf('---') !== 0) return { fm: fm, body: raw };
  var end = trimmed.indexOf('---', 3);
  if (end < 0) return { fm: fm, body: raw };
  var block = trimmed.slice(3, end).split('\n');
  block.forEach(function (line) {
    var m = line.match(/^\s*(\w[\w-]*)\s*:\s*(.+?)\s*$/);
    if (!m) return;
    var key = m[1].toLowerCase();
    var val = m[2].trim();
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
    fm[key] = val;
  });
  return { fm: fm, body: trimmed.slice(end + 3).replace(/^\s+/, '') };
}

function buildRenderOpts(fm) {
  var opts = {
    responsive: 'resize',
    viewportHorizontal: true,
    paddingbottom: 10,
    paddingtop: 10,
    paddingleft: 16,
    paddingright: 16,
    addclass: 'abcjs-nolink abcjs-no-margins',
    onehtml: true
  };
  if (fm.abcjs) {
    try { opts = Object.assign(opts, JSON.parse(fm.abcjs)); } catch (e) {}
  }
  if (fm.tablature) {
    var tab = fm.tablature;
    if (typeof tab === 'string') opts.tablature = [{ instrument: tab }];
    else if (Array.isArray(tab)) opts.tablature = tab;
  }
  if (fm.chordgrid) opts.chordGrid = fm.chordgrid;
  return opts;
}

function renderOne(node, raw) {
  var parts = parseFrontmatter(raw);
  var fm = parts.fm;
  var abcStr = parts.body;

  if (fm.transpose && window.ABCJS.strTranspose) {
    try {
      abcStr = window.ABCJS.strTranspose(abcStr,
        fm.transpose.from || 'C',
        fm.transpose.to || fm.transpose);
    } catch (e) {}
  }

  var renderOpts = buildRenderOpts(fm);
  var initTempo = fm.tempo || 120;
  var initInstrument = INSTRUMENTS[fm.instrument] || INSTRUMENTS.piano;
  var initLoop = fm.loop === true;

  var tuneObjects;
  try {
    tuneObjects = window.ABCJS.renderAbc(node, abcStr, renderOpts);
  } catch (e) {
    if (window.console) console.warn('[abc] 渲染失败:', e);
    return;
  }

  // 清理 abcjs 自动加的 <pre> 包裹
  var pre = node.querySelector('pre');
  if (pre) {
    while (pre.firstChild) node.insertBefore(pre.firstChild, pre);
    pre.remove();
  }

  tuneObjects.forEach(function (tuneObj) {
    if (!tuneObj) return;

    // 控制栏挂在整个 .abc 容器尾部（anchor 会变）
    var ctrl = document.createElement('div');
    ctrl.className = 'abc-controls';
    ctrl.innerHTML =
      '<button type="button" class="abc-btn abc-play" title="播放">▶</button>' +
      '<button type="button" class="abc-btn abc-stop" title="停止" disabled>■</button>' +
      '<select class="abc-select abc-instr" title="乐器">' +
        Object.keys(INSTRUMENTS).map(function (k) {
          return '<option value="' + INSTRUMENTS[k] + '"' + (INSTRUMENTS[k] === initInstrument ? ' selected' : '') + '>' + k + '</option>';
        }).join('') +
      '</select>' +
      '<input type="range" class="abc-range abc-tempo" min="40" max="240" value="' + initTempo + '" title="速度">' +
      '<span class="abc-tempo-label">' + initTempo + 'bpm</span>' +
      '<button type="button" class="abc-btn abc-loop' + (initLoop ? ' on' : '') + '" title="循环">↻</button>' +
      '<button type="button" class="abc-btn abc-download" title="下载 MIDI">⤓</button>';
    node.appendChild(ctrl);

    var playBtn = ctrl.querySelector('.abc-play');
    var stopBtn = ctrl.querySelector('.abc-stop');
    var instrSel = ctrl.querySelector('.abc-instr');
    var tempoRange = ctrl.querySelector('.abc-tempo');
    var tempoLabel = ctrl.querySelector('.abc-tempo-label');
    var loopBtn = ctrl.querySelector('.abc-loop');
    var dlBtn = ctrl.querySelector('.abc-download');

    // synth 状态（每次 instrument / tempo 变化都重建 CreateSynth）
    var audioCtx = null;
    var synthObj = null;
    var isPlaying = false;
    var curInstrument = initInstrument;
    var curTempo = initTempo;
    var curLoop = initLoop;

    var millisecondsPerMeasure = function () {
      // 每拍毫秒 × 每小节拍数 / (num beats per measure)
      // abcjs 给的 tempo 是 1/minute，millisecondsPerMeasure = tempo → ms/beat = 60000/tempo
      return 60000 / curTempo * (tuneObj.meter && tuneObj.meter.num_beats ? tuneObj.meter.num_beats : 4);
    };

    var buildSynth = function () {
      if (synthObj) { synthObj.stop(); synthObj = null; }
      synthObj = new window.ABCJS.synth.CreateSynth();
      var initOpts = {
        audioContext: audioCtx,
        visualObj: tuneObj,
        millisecondsPerMeasure: millisecondsPerMeasure(),
        options: {
          program: curInstrument,   // MIDI program number
          // 远程 sound font 采样（真实乐器录音）；国内走 jsDelivr 镜像比 GitHub 快
          // 如果网络不通会自动 fallback 到内置 wave table 合成
          soundFontUrl: 'https://cdn.jsdelivr.net/gh/paulrosen/midi-js-soundfonts@gh-pages/abcjs/'
        }
      };
      // 打击乐走 channel 10
      if (curInstrument >= 128) initOpts.options.channel = 10;
      return synthObj.init(initOpts).then(function () {
        return synthObj.prime();
      });
    };

    function play() {
      if (isPlaying) return;
      ensureAudio().then(function () {
        return buildSynth();
      }).then(function () {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        synthObj.start({ loop: curLoop });
        isPlaying = true;
        playBtn.disabled = true;
        stopBtn.disabled = false;
      }).catch(function (e) {
        if (window.console) console.warn('[abc] synth 启动失败:', e);
      });
    }

    function stop() {
      if (!synthObj) return;
      synthObj.stop();
      isPlaying = false;
      playBtn.disabled = false;
      stopBtn.disabled = true;
    }

    function ensureAudio() {
      if (audioCtx) return Promise.resolve();
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        window.ABCJS.synth.registerAudioContext(audioCtx);
        return Promise.resolve();
      } catch (e) { return Promise.reject(e); }
    }

    playBtn.addEventListener('click', play);
    stopBtn.addEventListener('click', stop);

    // 乐器/速度改变 → 停掉旧 synth，下次播放时用新配置重建
    instrSel.addEventListener('change', function (e) {
      curInstrument = e.target.value;
      if (isPlaying) stop();
    });

    tempoRange.addEventListener('input', function (e) {
      curTempo = Number(e.target.value);
      tempoLabel.textContent = curTempo + 'bpm';
      if (isPlaying) stop();
    });

    loopBtn.addEventListener('click', function (e) {
      curLoop = !curLoop;
      e.currentTarget.classList.toggle('on', curLoop);
    });

    dlBtn.addEventListener('click', function () {
      try {
        // getMidiFile(tuneObj, programNumber, tempo) — 第二个参数也是 MIDI program
        var file = window.ABCJS.synth.getMidiFile(tuneObj, curInstrument, curTempo);
        var url = URL.createObjectURL(file);
        var a = document.createElement('a');
        a.href = url;
        a.download = (fm.title || 'tune') + '.mid';
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        if (window.console) console.warn('[abc] MIDI 导出失败:', e);
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && isPlaying) stop();
    });
  });
}

export default {
  name: 'abc',
  init: function () {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.abc'));
    if (!nodes.length) return;

    var base = (window.__AB__ && window.__AB__.base) || '/';
    loadScript(base + 'js/vendor/abcjs.min.js', function (err) {
      if (err || !window.ABCJS) return;
      nodes.forEach(function (node) {
        var raw = node.textContent || '';
        if (!raw.trim()) return;
        renderOne(node, raw);
      });
    });
  }
};
