'use strict';
// ============================================================
// 为 hexo server（本地预览）添加 HTTP Range 支持
// 背景：hexo-server 的静态中间件不返回 206 Partial Content，
//       导致音频/视频等媒体无法 seek（拖动进度条会被重置回开头）。
//       线上（Nginx/宝塔等）本身支持 Range，本文件只影响本地预览。
// 原理：priority 9（< 默认 10）在 static 中间件之前执行，
//       拦截带 Range 头的 GET 请求，自行返回 206。
// ============================================================
const fs = require('fs');
const path = require('path');
const url = require('url');

const MIME = {
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4', '.flac': 'audio/flac', '.aac': 'audio/aac',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

hexo.extend.filter.register('server_middleware', function (app) {
  app.use(function (req, res, next) {
    const range = req.headers.range;
    if (!range || req.method !== 'GET') return next();
    const pathname = decodeURIComponent(url.parse(req.url).pathname);
    // 剥离 root 前缀（如 /gapblog/）
    const root = hexo.config.root || '/';
    let rel = pathname;
    if (root !== '/' && pathname.indexOf(root) === 0) rel = pathname.slice(root.length);
    const filePath = path.join(hexo.public_dir, rel);
    fs.stat(filePath, function (err, st) {
      if (err || !st.isFile()) return next();
      const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!m) return next();
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : st.size - 1;
      if (!(start >= 0) || isNaN(start)) start = 0;
      if (isNaN(end) || end >= st.size) end = st.size - 1;
      if (start > end) {
        res.statusCode = 416;
        res.setHeader('Content-Range', 'bytes */' + st.size);
        return res.end();
      }
      res.statusCode = 206;
      res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Range', 'bytes ' + start + '-' + end + '/' + st.size);
      res.setHeader('Content-Length', end - start + 1);
      fs.createReadStream(filePath, { start: start, end: end }).pipe(res);
    });
  });
}, 9);
