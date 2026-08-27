// 功能模块：长代码块折叠（带丝滑展开/收起动画）
// 目标：.post-content .highlight（与 copy-code 共用同一目标结构）
// 行为：行数超过阈值（features.code_fold，数字，默认 15）的代码块默认收起，
//       底部显示「展开全部 N 行」，点击展开 / 收起（toggle）
// 动画：JS 用 scrollHeight 驱动 max-height 过渡（cubic-bezier 缓动），
//       遮罩 opacity 淡入淡出；prefers-reduced-motion 时直接切换无动画
// 样式契约：.is-folded / .is-expanded / .code-expand / .code-expand.done
export default {
  name: 'code_fold',
  init: function (ctx) {
    var f = (ctx && ctx.features) || {};
    var limit = (typeof f.code_fold === 'number') ? f.code_fold : 15;
    if (limit <= 0) return;

    var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var FOLDED_H = '400px';

    var blocks = document.querySelectorAll('.post-content .highlight');
    for (var i = 0; i < blocks.length; i++) {
      (function (block) {
        // 统计行数：优先数行号列 .gutter .line，退化用 pre 文本换行数
        var lines = 0;
        var gutter = block.querySelector('.gutter');
        if (gutter) {
          lines = gutter.querySelectorAll('.line').length;
        } else {
          var pre = block.querySelector('pre');
          var text = pre ? pre.innerText : '';
          lines = text ? text.split('\n').length : 0;
        }
        if (lines <= limit) return;

        block.classList.add('is-folded');
        var btn = document.createElement('button');
        btn.className = 'code-expand';
        btn.type = 'button';
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '展开全部 ' + lines + ' 行 ▾';

        // 动画结束后清理内联 max-height（还原交给 CSS 的 is-folded/is-expanded）
        function onceTransitionEnd(fn) {
          var done = false;
          function handler(e) {
            if (e && e.propertyName && e.propertyName !== 'max-height') return;
            done = true;
            block.removeEventListener('transitionend', handler);
            fn();
          }
          block.addEventListener('transitionend', handler);
          setTimeout(function () { if (!done) { done = true; block.removeEventListener('transitionend', handler); fn(); } }, 600);
        }

        btn.addEventListener('click', function () {
          if (block.classList.contains('animating')) return;
          var folded = block.classList.contains('is-folded');
          if (folded) {
            // ── 展开：从 400px 过渡到内容实际高度 ──
            block.classList.add('animating');
            block.classList.remove('is-folded');
            block.classList.add('is-expanded');
            btn.setAttribute('aria-expanded', 'true');
            btn.textContent = '收起 ▴';
            if (REDUCED) {
              block.classList.remove('animating');
              return;
            }
            block.style.maxHeight = block.scrollHeight + 'px';
            onceTransitionEnd(function () {
              block.style.maxHeight = '';
              block.classList.remove('animating');
            });
          } else {
            // ── 收起：从实际高度过渡回 400px ──
            block.classList.add('animating');
            block.style.maxHeight = block.scrollHeight + 'px';
            void block.offsetHeight; // 强制 reflow，确保过渡从实际高度开始
            block.classList.remove('is-expanded');
            block.classList.add('is-folded');
            btn.setAttribute('aria-expanded', 'false');
            btn.textContent = '展开全部 ' + lines + ' 行 ▾';
            if (REDUCED) {
              block.style.maxHeight = '';
              block.classList.remove('animating');
              return;
            }
            block.style.maxHeight = FOLDED_H;
            onceTransitionEnd(function () {
              block.style.maxHeight = '';
              block.classList.remove('animating');
            });
          }
        });

        block.appendChild(btn);
      })(blocks[i]);
    }
  }
};
