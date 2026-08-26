// 功能模块：代码块一键复制
// 目标：.post-content .highlight（DOM 由本模块创建，样式契约 .copy-btn）
export default {
  name: 'copy_code',
  init: function () {
    function done(btn) {
      btn.textContent = '已复制';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = '复制';
        btn.classList.remove('copied');
      }, 1600);
    }
    function fallbackCopy(text, btn) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(btn); } catch (e) { btn.textContent = '复制失败'; }
      document.body.removeChild(ta);
    }
    function copyText(text, btn) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(btn); })
          .catch(function () { fallbackCopy(text, btn); });
      } else {
        fallbackCopy(text, btn);
      }
    }
    var blocks = document.querySelectorAll('.post-content .highlight');
    for (var i = 0; i < blocks.length; i++) {
      (function (block) {
        var btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.type = 'button';
        btn.textContent = '复制';
        btn.addEventListener('click', function () {
          var pre = block.querySelector('.code pre') || block.querySelector('pre');
          copyText(pre ? pre.innerText : '', btn);
        });
        block.appendChild(btn);
      })(blocks[i]);
    }
  }
};
