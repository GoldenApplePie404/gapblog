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
    collapse: q('[data-mp-collapse]')
  };

  var MODES = ['order', 'loop', 'random'];
  var state = {
    index: 0,
    mode: MODES.indexOf(localStorage.getItem('gap-music-mode') || 'order'),
    playing: false,
    volume: 0.8
  };

  var savedVol = parseFloat(localStorage.getItem('gap-music-volume'));
  if (!isNaN(savedVol)) state.volume = Math.min(1, Math.max(0, savedVol));

  function load(i, auto) {
    state.index = (i + list.length) % list.length;
    var item = list[state.index];
    audio.src = base + 'music/' + item.src;
    els.title.textContent = item.title || '未知歌曲';
    els.artist.textContent = item.artist || '';
    if (item.cover) els.cover.style.backgroundImage = 'url(' + base + 'music/' + item.cover + ')';
    else els.cover.style.backgroundImage = '';
    if (auto !== false) play();
  }

  function play() {
    audio.play().then(function () {
      state.playing = true;
      root.classList.add('playing');
      floatBtn.classList.add('playing');
      updateToggle();
    }).catch(function () { /* 自动播放被拦截等，保持暂停态 */ });
  }

  function pause() {
    audio.pause();
    state.playing = false;
    root.classList.remove('playing');
    floatBtn.classList.remove('playing');
    updateToggle();
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
    if (audio.duration) audio.currentTime = els.progress.value;
  });

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    els.progress.max = audio.duration;
    els.progress.value = audio.currentTime;
    els.time.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });

  audio.addEventListener('loadedmetadata', function () {
    els.progress.max = audio.duration;
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
  load(0, false);
}
