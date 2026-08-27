'use strict';
// ============================================================
// 修复中文语境下粗体解析失败（marked 15 严格 CommonMark 分隔符规则）
// 现象：**粗体（内容）**、**个体”**、**状态：** 等「闭合 ** 前紧邻中文标点
//       且后跟非标点」时，** 无法作为右分隔符配对 → 粗体失效、** 残留
// 方案：通过 marked:use 过滤器注入同名扩展覆盖 strong tokenizer
//       为宽松非贪婪规则（旧版行为，英文粗体不受影响）
// ============================================================
hexo.extend.filter.register('marked:use', function (markedUse) {
  markedUse({
    extensions: [{
      name: 'strong',
      level: 'inline',
      start(src) { return src.indexOf('**'); },
      tokenizer(src) {
        const match = /^\*\*(?=\S)([\s\S]+?\S)\*\*(?!\*)/.exec(src);
        if (!match) return undefined;
        const token = { type: 'strong', raw: match[0], text: match[1] };
        token.tokens = this.lexer.inlineTokens(token.text);
        return token;
      },
      renderer(token) {
        return '<strong>' + this.parser.parseInline(token.tokens) + '</strong>';
      }
    }]
  });
});
