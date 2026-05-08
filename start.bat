@echo off
cd /d "%~dp0"
title Toonflow
set NODE_ENV=prod

echo.
echo   Toonflow - Starting...
echo.

echo   [1/2] Checking port 10588...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$processIds = Get-NetTCPConnection -LocalPort 10588 -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($processId in $processIds) { Write-Host ('  Stopping old process (PID: ' + $processId + ')...'); try { Stop-Process -Id $processId -Force -ErrorAction Stop; Write-Host '  Old process stopped.' } catch { Write-Host ('  Failed to stop process (PID: ' + $processId + '): ' + $_.Exception.Message) } }"

echo.
echo   [2/2] Starting server...
echo.

start http://localhost:10588/web/index.html
node data\serve\app.js

pause
