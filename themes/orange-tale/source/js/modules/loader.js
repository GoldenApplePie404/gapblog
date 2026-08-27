// 功能模块工具：动态加载外部脚本/样式（失败可感知）
export function loadScript(src, cb) {
  var s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onload = function () { if (cb) cb(null); };
  s.onerror = function () { if (cb) cb(new Error('failed to load: ' + src)); };
  document.head.appendChild(s);
}

export function loadCss(href) {
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}
