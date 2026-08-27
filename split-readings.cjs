'use strict';
var fs = require('fs');
var path = require('path');
var ORIG = 'source/_posts/初识人工智能——神经网络-强化学习.md';
var lines = fs.readFileSync(ORIG, 'utf8').split('\n');

function findIndex(pred, from) { for (var i = from || 0; i < lines.length; i++) { if (pred(lines[i])) return i; } return -1; }

// 选读一：标题 → 参考链接行
var gaStart = findIndex(function (l) { return l.indexOf('**选读：基于遗传算法的神经网络**') > -1; });
var gaEnd = findIndex(function (l) { return l.indexOf('AI-learns-to-play-Snake') > -1; }, gaStart);
console.log('选读一范围: L' + (gaStart + 1) + ' - L' + (gaEnd + 1));
var gaBody = lines.slice(gaStart + 2, gaEnd + 1); // 跳过标题行和空行，含参考行

// 选读二：标题 → 前沿段落后的 --- 分隔线
var hwStart = findIndex(function (l) { return l.indexOf('**选读：硬件架构与人工智能**') > -1; });
var hwFront = findIndex(function (l) { return l.indexOf('当然，前沿技术也在不断涌现') > -1; }, hwStart);
var hwEnd = findIndex(function (l) { return l.trim() === '---' && hwStart < l < hwFront; }, hwFront); // 前沿段后第一个 ---
// 简化：直接找前沿段之后第一个 ---
hwEnd = findIndex(function (l) { return l.trim() === '---'; }, hwFront + 1);
console.log('选读二范围: L' + (hwStart + 1) + ' - L' + (hwEnd + 1));
var hwBody = lines.slice(hwStart + 2, hwEnd); // 跳过标题行和空行，不含结尾 ---

// ---------- 生成新文章 1：遗传算法 ----------
var gaText = gaBody.join('\n').trim();
// 上下文说辞修正：正文开头加独立引导
var gaIntro = '在《初识人工智能——神经网络&强化学习》中，我们介绍了神经网络如何通过梯度下降来训练——但这条路有个常见的问题：优化算法有时会“卡”在一个并非最好的结果上，也就是所谓的**局部最优解**。\n\n';
var gaClean = gaText.replace(/^训练神经网络的常规方法[\s\S]*?性能无法达到最高水平。\n\n/, '');
var gaArticle = '---\n' +
  'title: "遗传算法与神经网络：用进化训练贪吃蛇"\n' +
  'img_dir: ga-nn\n' +
  'date: 2026-01-02 10:00:00\n' +
  'categories: ["计算机", "教程"]\n' +
  'tags: ["遗传算法", "神经网络", "贪吃蛇", "python", "游戏"]\n' +
  '---\n\n' +
  '当梯度下降陷入局部最优解时，不妨试试另一条路：让神经网络像生物一样“进化”。本文介绍如何用遗传算法（选择、交叉、变异）训练一个贪吃蛇智能体，附完整 Python 源码与训练反思。\n\n' +
  '<!-- more -->\n\n' +
  gaIntro + gaClean + '\n';
fs.writeFileSync('source/_posts/遗传算法与神经网络——用进化训练贪吃蛇.md', gaArticle);
console.log('已生成: 遗传算法与神经网络——用进化训练贪吃蛇.md');

// ---------- 生成新文章 2：硬件架构 ----------
var hwText = hwBody.join('\n').trim();
// 说辞修正
hwText = hwText.replace('此章内容聚焦于硬件层面，', '本文聚焦于硬件层面，');
hwText = hwText.replace(/\/images\/posts\/ai-intro\//g, '/images/posts/ai-hardware/');
var hwArticle = '---\n' +
  'title: "人工智能硬件探秘：从CPU到类脑芯片"\n' +
  'img_dir: ai-hardware\n' +
  'cover: /images/posts/ai-hardware/fm.png\n' +
  'date: 2026-01-03 10:00:00\n' +
  'categories: ["计算机"]\n' +
  'tags: ["硬件", "CPU", "GPU", "TPU", "NPU", "FPGA", "类脑芯片", "人工智能"]\n' +
  '---\n\n' +
  '从数据中心到边缘设备，AI 的每一次运算都离不开硬件的支撑。本文带你认识 CPU、GPU、TPU、NPU、FPGA 与类脑芯片的工作原理、适用场景与取舍，并展望量子计算、DNA 计算等前沿方向。\n\n' +
  '<!-- more -->\n\n' +
  hwText + '\n';
fs.writeFileSync('source/_posts/人工智能硬件探秘——从CPU到类脑芯片.md', hwArticle);
console.log('已生成: 人工智能硬件探秘——从CPU到类脑芯片.md');

// ---------- 修改原文章：删除两个选读 ----------
var removed = [];
removed = removed.concat(lines.slice(gaStart, gaEnd + 1)); // 选读一
var afterGa = lines.slice(gaEnd + 1);
// 选读二在原数组的索引基于原 lines；gaEnd < hwStart < hwEnd 恒成立
removed = removed.concat(lines.slice(hwStart, hwEnd + 1)); // 选读二
var keep = lines.slice(0, gaStart).concat(lines.slice(gaEnd + 1, hwStart)).concat(lines.slice(hwEnd + 1));
// 清理多余空行：删除后可能产生连续 3+ 空行
var out = keep.join('\n').replace(/\n{4,}/g, '\n\n\n');
fs.writeFileSync(ORIG, out);
console.log('原文已更新: 删除选读一 L' + (gaStart + 1) + '-' + (gaEnd + 1) + ', 选读二 L' + (hwStart + 1) + '-' + (hwEnd + 1));

// ---------- 复制图片到 ai-hardware ----------
var AIDIR = 'source/images/posts/ai-intro';
var HWDIR = 'source/images/posts/ai-hardware';
fs.mkdirSync(HWDIR, { recursive: true });
var imgs = ['image.png', 'image-1-1024x459.png', 'image-13.png', 'image-2.png', 'image-5.png', 'image-6-1024x419.png'];
imgs.forEach(function (img) {
  var src = path.join(AIDIR, img);
  var dst = path.join(HWDIR, img);
  if (fs.existsSync(src) && !fs.existsSync(dst)) { fs.copyFileSync(src, dst); }
});
// 封面：用 GPU 架构图复制为 fm.png
var coverSrc = path.join(AIDIR, 'image-1-1024x459.png');
var coverDst = path.join(HWDIR, 'fm.png');
if (fs.existsSync(coverSrc) && !fs.existsSync(coverDst)) { fs.copyFileSync(coverSrc, coverDst); }
console.log('图片已迁移到 ai-hardware: ' + imgs.length + ' 张 + fm.png');
