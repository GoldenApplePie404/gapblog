// 功能模块：音乐播放器（可隐藏式：右下角圆形音符按钮 + 点击展开底部播放条）
// 歌单：source/music/playlist.json（[{title,artist,src,cover}]，音频放 source/music/ 同目录）
// 行为：有歌单时显示右下角圆形按钮；点击展开播放条并播放；可收起（音乐继续）；三模式/进度/音量；localStorage 记忆音量与模式
// 空态：无歌单或加载失败时静默隐藏全部
export default {
  name: 'music',
  init: function () {
    var base = (window.__AB__ && window.__AB__.base) || '/';
    var root = document.getElementById('musicPlayer');
    var floatBtn = document.getElementById('mpFloat');
    if (!root || !floatBtn) return;
    fetch(base + 'music/playlist.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('playlist ' + r.status); return r.json(); })
      .then(function (list) {
        if (!list || !list.length) return; // 空歌单：不显示
        new MusicPlayer(root, floatBtn, list, base);
      })
      .catch(function () { /* 静默降级 */ });
  }
};

function MusicPlayer(root, floatBtn, list, base) {
  var q = function (s) { return root.querySelector(s); };
  var audio = new Audio();
  audio.preload = 'metadata';

  var els = {
    toggle: q('[data-mp-toggle]'),
    prev: q('[data-mp-prev]'),
    next: q('[data-mp-next]'),
    title: q('[data-mp-title]'),
    artist: q('[data-mp-artist]'),
    cover: q('[data-mp-cover]'),
    progress: q('[data-mp-progress]'),
    time: q('[data-mp-time]'),
    mode: q('[data-mp-mode]'),
    volume: q('[data-mp-volume]'),
    collapse: q('[data-mp-collapse]'),
    spectrum: q('[data-mp-spectrum]')
  };

  // --- 实时频谱图（Web Audio 分析器，作为播放条的半透明背景）---
  var specCtx = els.spectrum ? els.spectrum.getContext && els.spectrum.getContext('2d') : null;
  var audioCtx = null, analyser = null, mediaSrc = null, dataArr = null, rafId = null;

  function sizeSpectrum() {
    if (!specCtx || !els.spectrum) return;
    var dpr = window.devicePixelRatio || 1;
    var w = els.spectrum.clientWidth, h = els.spectrum.clientHeight;
    if (!w || !h) return;
    els.spectrum.width = w * dpr;
    els.spectrum.height = h * dpr;
    specCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setupGraph() {
    if (analyser) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096; // 提高频点分辨率，低频活跃区更丰富，支撑更密集的柱
      analyser.smoothingTimeConstant = 0.8;
      var viaCapture = typeof audio.captureStream === 'function';
      if (viaCapture) {
        // captureStream 不接管元素输出：元素照常发声，仅复制一份喂给分析器取频谱。
        // 切勿再连 destination，否则同一信号双路（元素直出 + 图中副本）近同步叠加，产生梳状滤波，听感像回音。
        mediaSrc = audioCtx.createMediaStreamSource(audio.captureStream());
      } else {
        // 兜底（旧浏览器）：MediaElementSource 已接管元素输出，必须接回 destination 才有声
        mediaSrc = audioCtx.createMediaElementSource(audio);
      }
      mediaSrc.connect(analyser);
      if (!viaCapture) analyser.connect(audioCtx.destination);
      dataArr = new Uint8Array(analyser.frequencyBinCount);
    } catch (e) { analyser = null; }
  }
  // 切歌后旧 captureStream/MediaElementSource 绑定已失效，销毁待下次 play 重建
  function teardownGraph() {
    stopSpectrum();
    try {
      if (mediaSrc) mediaSrc.disconnect();
      if (analyser) analyser.disconnect();
      if (audioCtx && audioCtx.close) audioCtx.close();
    } catch (e) { /* ignore */ }
    mediaSrc = null; analyser = null; audioCtx = null; dataArr = null;
  }
  function resumeGraph() {
    try { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) {}
  }
  function ensureAnalyser() {
    setupGraph();
    resumeGraph();
    return analyser;
  }

  function drawSpectrum() {
    if (!specCtx || !els.spectrum) return;
    rafId = requestAnimationFrame(drawSpectrum);
    var w = els.spectrum.clientWidth, h = els.spectrum.clientHeight;
    specCtx.clearRect(0, 0, w, h);
    if (!analyser || !dataArr) return;
    analyser.getByteFrequencyData(dataArr);
    // 只取更靠近底部的低频强能量区（约 1/4 频段），右端更不出现平底空白
    var usable = Math.floor(dataArr.length / 4);
    var BARS = 320;
    var gap = 1, minH = 2, maxH = h - 8;
    specCtx.fillStyle = 'rgba(249, 115, 22, 0.22)';
    var inner = w - gap * (BARS - 1); // 去掉柱间空隙后分给柱的总宽
    var bw = inner / BARS;            // 允许小数，按比例平铺铺满整宽
    var step = Math.max(1, Math.floor(usable / BARS));
    var px = 0;
    for (var i = 0; i < BARS; i++) {
      var x0 = Math.round(px);
      var x1 = Math.round(px + bw);
      px += bw + gap;
      var idx = Math.min(usable - 1, i * step);
      var v = dataArr[idx] / 255;
      var bh = minH + v * (maxH - minH);
      specCtx.fillRect(x0, h - bh, Math.max(1, x1 - x0), bh);
    }
  }

  function startSpectrum() {
    if (!specCtx || !els.spectrum) return;
    ensureAnalyser();
    sizeSpectrum();
    els.spectrum.classList.add('active');
    if (!rafId) rafId = requestAnimationFrame(drawSpectrum);
  }
  function stopSpectrum() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (els.spectrum) {
      els.spectrum.classList.remove('active');
      if (specCtx) specCtx.clearRect(0, 0, els.spectrum.clientWidth, els.spectrum.clientHeight);
    }
  }

  var MODES = ['order', 'loop', 'random'];
  var state = {
    index: 0,
    mode: MODES.indexOf(localStorage.getItem('gap-music-mode') || 'order'),
    playing: false,
    volume: 0.8
  };

  var savedVol = parseFloat(localStorage.getItem('gap-music-volume'));
  if (!isNaN(savedVol)) state.volume = Math.min(1, Math.max(0, savedVol));

  var pendingAuto = false;
  function load(i, auto) {
    state.index = (i + list.length) % list.length;
    var item = list[state.index];
    var src = base + 'music/' + item.src;
    knownDuration = 0;
    els.progress.max = 0;
    els.time.textContent = '0:00 / 0:00';
    els.title.textContent = item.title || '未知歌曲';
    els.artist.textContent = item.artist || '';
    if (item.cover) els.cover.style.backgroundImage = 'url(' + base + 'music/' + item.cover + ')';
    else els.cover.style.backgroundImage = '';
    pendingAuto = (auto !== false);
    // 串行：先探针读真实时长，再由探针回调给主元素赋同一 URL（不并发，避免同 URL 被 abort）
    probeEl.src = src;
  }

  function play() {
    audio.play().then(function () {
      state.playing = true;
      root.classList.add('playing');
      floatBtn.classList.add('playing');
      updateToggle();
      // 播放真正开始后再建频谱图：captureStream 需要音频实际播放才有数据
      ensureAnalyser();
      startSpectrum();
    }).catch(function () { /* 自动播放被拦截等，保持暂停态 */ });
  }

  function pause() {
    audio.pause();
    state.playing = false;
    root.classList.remove('playing');
    floatBtn.classList.remove('playing');
    updateToggle();
    stopSpectrum();
  }

  function toggle() { state.playing ? pause() : play(); }

  function nextIndex() {
    var m = MODES[state.mode];
    if (m === 'random') return Math.floor(Math.random() * list.length);
    return state.index + 1;
  }

  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // --- 时长解析：MediaElementSource 捕获后 audio.duration 可能为 Infinity，需回归真实值 ---
  var knownDuration = 0;
  function getDuration() {
    var d = audio.duration;
    if (isFinite(d) && d > 0) return d;
    // 兜底 1：用已缓冲的 seekable 区间末尾作为真实时长（无额外请求，不会触发 abort）
    if (audio.seekable && audio.seekable.length && isFinite(audio.seekable.end(audio.seekable.length - 1))) {
      var s = audio.seekable.end(audio.seekable.length - 1);
      if (s > 0) return s;
    }
    // 兜底 2：无时长元数据的音频（duration=null 的流/mp3），用 buffered 末端（播放中随缓冲增长）
    if (audio.buffered && audio.buffered.length && isFinite(audio.buffered.end(audio.buffered.length - 1))) {
      var b = audio.buffered.end(audio.buffered.length - 1);
      if (b > 0) return b;
    }
    return knownDuration;
  }
  function setDuration(d) {
    if (!(isFinite(d) && d > 0)) return;
    knownDuration = d;
    els.progress.max = d;
    els.time.textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
  }
  // 探针元素：先读真实时长，再由探针回调给主元素赋同一 URL（串行请求，避免并发同 URL 被 abort）
  var probeEl = new Audio();
  probeEl.preload = 'metadata';
  probeEl.muted = true;
  probeEl.addEventListener('loadedmetadata', function () {
    var d = probeEl.duration;
    if (isFinite(d) && d > 0) setDuration(d);
    var cur = probeEl.src;
    if (cur && audio.src !== cur) { audio.src = cur; teardownGraph(); }
    if (pendingAuto) { pendingAuto = false; play(); }
  });
  probeEl.addEventListener('error', function () {
    var cur = probeEl.src;
    if (cur) { audio.src = cur; teardownGraph(); }
    if (pendingAuto) { pendingAuto = false; play(); }
  });

  function updateToggle() {
    els.toggle.innerHTML = state.playing
      ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  }

  var modeMeta = {
    order: { label: '顺序播放', icon: '<svg viewBox="0 0 24 24"><path d="M17 6H7V4h12v12h-2V6zM4 18V8h10v10h-2v-8H6v8H4z"/></svg>' },
    loop: { label: '单曲循环', icon: '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>' },
    random: { label: '随机播放', icon: '<svg viewBox="0 0 24 24"><path d="M10.6 9.2L9.2 10.6 5.6 7l1.4-1.4 3.6 3.6zm8.6-5.2l-4.9 4.9 1.4 1.4 4.9-4.9V4h-1.4zM14.2 15.6l1.4-1.4 3.4 3.4v1.4h-1.4l-3.4-3.4zM5 19v-2h2v2H5zm0-12V5h2v2H5zm9.4 2.6L20 17.4v1.6h-1.6l-6-6 1.6-1.6z"/></svg>' }
  };

  function updateMode() {
    var m = MODES[state.mode];
    els.mode.innerHTML = modeMeta[m].icon;
    els.mode.title = modeMeta[m].label;
    els.mode.setAttribute('aria-label', modeMeta[m].label);
    localStorage.setItem('gap-music-mode', m);
  }

  // --- 展开 / 收起 ---
  function open() {
    root.hidden = false;
    requestAnimationFrame(function () {
      root.classList.add('open');
    });
    document.body.classList.add('has-music');
    if (!state.playing) play();
  }
  function close() {
    root.classList.remove('open');
    document.body.classList.remove('has-music');
  }

  // --- 事件绑定 ---
  floatBtn.addEventListener('click', open);
  els.collapse.addEventListener('click', close);
  els.toggle.addEventListener('click', toggle);
  els.prev.addEventListener('click', function () { load(state.index - 1); });
  els.next.addEventListener('click', function () { load(nextIndex()); });

  els.mode.addEventListener('click', function () {
    state.mode = (state.mode + 1) % MODES.length;
    updateMode();
  });

  els.volume.addEventListener('input', function () {
    audio.volume = els.volume.value;
    localStorage.setItem('gap-music-volume', els.volume.value);
  });

  els.progress.addEventListener('input', function () {
    var d = getDuration();
    if (d > 0) audio.currentTime = els.progress.value;
  });

  audio.addEventListener('timeupdate', function () {
    var d = getDuration();
    if (!(d > 0)) return;
    els.progress.max = d;
    els.progress.value = audio.currentTime;
    els.time.textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
  });

  audio.addEventListener('loadedmetadata', function () {
    var d = getDuration();
    if (d > 0) setDuration(d);
  });

  audio.addEventListener('durationchange', function () {
    var d = getDuration();
    if (d > 0) {
      els.progress.max = d;
      els.time.textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
    }
  });

  audio.addEventListener('ended', function () {
    if (MODES[state.mode] === 'loop') { audio.currentTime = 0; play(); }
    else load(nextIndex());
  });

  // 初始化：只显示右下角按钮，不自动展开/播放
  audio.volume = state.volume;
  els.volume.value = state.volume;
  updateMode();
  updateToggle();
  floatBtn.hidden = false;
  sizeSpectrum();
  window.addEventListener('resize', sizeSpectrum);
  // 频谱图延迟到首次 play() 时才建立 MediaElementSource（ensureAnalyser），保证初始可读到真实时长
  load(0, false);
}
