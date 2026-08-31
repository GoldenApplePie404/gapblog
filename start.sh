#!/usr/bin/env bash
# 金苹果派の博客 - 一键启动（Git Bash 环境）
set -e
cd "$(dirname "$0")"

echo "============================================"
echo "  金苹果派の博客 - 一键启动"
echo "============================================"
echo

BASE=http://localhost:4000

# —— 复用已在运行的服务：若 /gapblog/ 已返回 200（本博客在跑），直接打开即可 ——
if curl -sf -o /dev/null "$BASE/gapblog/"; then
  echo "[*] 博客已在运行：$BASE/gapblog/"
  # Git Bash 下尝试调起系统浏览器
  (command -v xdg-open >/dev/null 2>&1 && xdg-open "$BASE/gapblog/") || \
  (command -v open >/dev/null 2>&1 && open "$BASE/gapblog/") || \
  cmd //c start "" "$BASE/gapblog/" 2>/dev/null || true
  exit 0
fi

# —— 选择空闲端口（从 4000 起向上探测）——
PORT=4000
while [ "$PORT" -lt 4010 ] && (ss -tln 2>/dev/null | grep -q ":${PORT} " || netstat -ano 2>/dev/null | grep -q ":${PORT} .*LISTENING"); do
  PORT=$((PORT + 1))
done

echo "[*] 启动预览服务器（端口 $PORT）..."
echo "[*] 访问地址: http://localhost:$PORT/gapblog/"
echo "[*] 按 Ctrl+C 可停止服务器"
echo
npx hexo server -p "$PORT"