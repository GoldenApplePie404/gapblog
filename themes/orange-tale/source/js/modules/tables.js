// ============================================================
// 文章表格自适应：宽度过大的表格横向滚动，避免溢出容器
// 在 .post-content 中给每个 table 包一层 .table-scroll
// ============================================================
export default {
  name: 'tables',
  init: function () {
    var tables = Array.prototype.slice.call(document.querySelectorAll('.post-content table'));
    tables.forEach(function (table) {
      // 已外包则跳过；代码高亮内的 table（行布局）不包
      if (table.closest('.highlight') || table.parentNode.classList.contains('table-scroll')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }
};