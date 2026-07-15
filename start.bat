@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found in PATH.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is required but was not found in PATH.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Building Graphif MCP...
npm run build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo Starting Graphif MCP over stdio.
echo Live Graphif bridge listens on ws://127.0.0.1:17321 when the MCP process is running.
node graphif-mcp\dist\server.js
