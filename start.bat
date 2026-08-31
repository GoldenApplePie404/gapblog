@echo off
title GoldenApplePie Blog - Launcher
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo ============================================
echo    GoldenApplePie Blog  -  Launcher
echo ============================================
echo.

rem —— 复用已在运行的服务 ——
rem 若 4000 的 /gapblog/ 已返回 200（即本博客在跑），直接打开即可，不重复启动、不杀其它进程。
for /f %%c in ('curl -s -o NUL -w "%%{http_code}" http://localhost:4000/gapblog/ 2^>nul') do set "code=%%c"
if "!code!"=="200" (
  echo [*] 博客已在运行：http://localhost:4000/gapblog/
  start "" "http://localhost:4000/gapblog/"
  exit /b 0
)

rem —— 选择空闲端口（从 4000 起向上探测）——
set /a PORT=4000
:findport
netstat -ano | findstr ":!PORT! " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
  set /a PORT+=1
  if !PORT! LSS 4010 goto findport
)

echo [*] 启动预览服务器（端口 !PORT!）...
echo [*] 访问地址：http://localhost:!PORT!/gapblog/
echo [*] 按 Ctrl+C 可停止服务器
echo.
start "" "http://localhost:!PORT!/gapblog/"
npx hexo server -p !PORT!

echo.
echo [*] Server stopped.
pause