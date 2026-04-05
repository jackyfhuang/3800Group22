@echo off
setlocal

cd /d "%~dp0"

cls

for /f %%a in ('echo prompt $E^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "RED=%ESC%[31m"
set "CYAN=%ESC%[36m"
set "RESET=%ESC%[0m"

echo %GREEN%=================================================%RESET%
echo %GREEN%            ChildGuard  App  Launcher            %RESET%
echo %GREEN%   Keeping families safe, for a better future.   %RESET%
echo %GREEN%=================================================%RESET%
echo.
echo %CYAN% Reminder: you will need node.js installed first%RESET%
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: Node.js is not installed.%RESET%
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the LTS version, run the installer, then launch this file again.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Setting up for the first time -- this may take a few minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo %RED%Setup failed. Check your internet connection and try again.%RESET%
        echo.
        pause
        exit /b 1
    )
    echo.
    echo %GREEN%Setup complete!%RESET%
    echo.
)

:menu
echo %YELLOW%How are you connecting?%RESET%
echo.
echo   %YELLOW%[1]%RESET% Hotspot        -- npx expo start --offline
echo   %YELLOW%[2]%RESET% Wi-Fi          -- npm start
echo   %YELLOW%[3]%RESET% Other / Tunnel -- npx expo start --tunnel
echo.
set "choice="
set /p "choice=Enter an option: "

if not defined choice goto invalid
if "%choice%"=="1" ( set "LAUNCH_CMD=npx expo start --offline" & goto launch )
if "%choice%"=="2" ( set "LAUNCH_CMD=npm start" & goto launch )
if "%choice%"=="3" ( set "LAUNCH_CMD=npx expo start --tunnel" & goto launch )

:invalid
echo.
echo %RED%Please enter 1, 2, or 3.%RESET%
echo.
goto menu

:launch
echo.
echo %GREEN%Starting ChildGuard...%RESET%
echo.
echo   On your phone:
echo   1. Open the Expo Go app
echo   2. Tap "Scan QR Code"
echo   3. Point your camera at the QR code below
echo.
echo Press Ctrl+C to stop the server.
echo.
%LAUNCH_CMD%
echo.
echo Server stopped. Press any key to close this window.
pause >nul

endlocal
