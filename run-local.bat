@echo off
cd /d "%~dp0"

set "BUNDLED_NODE=C:\Users\Amina M\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if exist "%BUNDLED_NODE%" (
  "%BUNDLED_NODE%" local-server.cjs
  pause
  exit /b
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on this computer.
  echo Install Node.js or open this project through Codex again so the bundled runtime is available.
  pause
  exit /b 1
)

node local-server.cjs
pause
