@echo off
title Anime Business Blog - Launcher
cd /d "%~dp0"

echo ============================================
echo    GoldenApplePie Blog  -  Launcher
echo ============================================
echo.

rem Kill old process using port 4000 if any
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000" ^| findstr "LISTENING"') do (
  echo [*] Port 4000 is in use. Killing old process PID=%%a ...
  taskkill /f /pid %%a >nul 2>&1
  goto :port_cleared
)
:port_cleared

echo [*] Starting preview server ...
echo [*] Visit: http://localhost:4000/
echo [*] Press Ctrl+C to stop the server.
echo.
start "" http://localhost:4000/
npx hexo server -p 4000

echo.
echo [*] Server stopped.
pause
