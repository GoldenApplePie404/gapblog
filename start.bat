@echo off
title GoldenApplePie Blog - Launcher
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo ============================================
echo    GoldenApplePie Blog  -  Launcher
echo ============================================
echo.

rem ---- Reuse existing server ----
rem If /gapblog/ on 4000 returns 200, blog is already running.
rem Just open it and exit - no restart, no killing other processes.
for /f %%c in ('curl -s -o NUL -w "%%{http_code}" http://localhost:4000/gapblog/ 2^>nul') do set "code=%%c"
if "!code!"=="200" (
  echo [*] Blog already running: http://localhost:4000/gapblog/
  start "" "http://localhost:4000/gapblog/"
  exit /b 0
)

rem ---- Pick a free port (scan upward from 4000) ----
set /a PORT=4000
:findport
netstat -ano | findstr ":!PORT! " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
  set /a PORT+=1
  if !PORT! LSS 4010 goto findport
)

echo [*] Starting preview server on port !PORT!...
echo [*] Visit: http://localhost:!PORT!/gapblog/
echo [*] Press Ctrl+C to stop
echo.
start "" "http://localhost:!PORT!/gapblog/"
npx hexo server -p !PORT!

echo.
echo [*] Server stopped.
pause