@echo off
REM ============================================================
REM  Charity Events Hub (A3) - one-click launcher
REM  Project folder : charity-events-project
REM  API    : http://localhost:3000
REM  Web    : http://localhost:5500
REM  Admin  : http://localhost:5501
REM  Make sure the MySQL service "MySQL84" is running first.
REM ============================================================

setlocal
REM %~dp0 = the folder containing this script (charity-events-project\)
set "ROOT=%~dp0"

REM Make sure we are inside the current project before launching.
if not exist "%ROOT%api\server.js" (
  echo [ERROR] api\server.js not found.
  echo This launcher must sit inside the charity-events-project folder.
  pause
  exit /b 1
)
if not exist "%ROOT%clientside\index.html" (
  echo [ERROR] clientside\index.html not found.
  echo This launcher must sit inside the charity-events-project folder.
  pause
  exit /b 1
)

echo Starting Charity Events Hub...

start "Charity Events API"   /D "%ROOT%api"        cmd /k node server.js
start "Charity Events Web"   /D "%ROOT%clientside" cmd /k npx.cmd --yes serve . -l 5500
start "Charity Events Admin" /D "%ROOT%adminside"  cmd /k npx.cmd --yes serve . -l 5501

echo.
echo  API   : http://localhost:3000
echo  Web   : http://localhost:5500
echo  Admin : http://localhost:5501
echo.
echo  Opening the website in your browser...
timeout /t 3 /nobreak >nul
start "" "http://localhost:5500"

endlocal
