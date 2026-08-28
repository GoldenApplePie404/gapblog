#!/usr/bin/env bash
# 金苹果派の博客 - 一键启动（Git Bash 环境）
cd "$(dirname "$0")"

echo "============================================"
echo "  金苹果派の博客 - 一键启动"
echo "============================================"
echo

# 清理占用 4000 端口的旧进程
PID=$(netstat -ano | grep ":4000" | grep LISTENING | head -1 | sed 's/.*LISTENING[ ]*//')
if [ -n "$PID" ]; then
  echo "[*] 端口 4000 被占用，正在关闭旧进程 PID=$PID ..."
  taskkill //PID "$PID" //F >/dev/null 2>&1
  sleep 1
fi

echo "[*] 正在启动博客预览服务器..."
echo "[*] 访问地址: http://localhost:4000/"
echo "[*] 按 Ctrl+C 可停止服务器"
echo
npx hexo server -p 4000
