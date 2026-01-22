@echo off
setlocal enabledelayedexpansion

:: Switch to script directory
cd /d "%~dp0"

title Magic-Mini Bead Tool - Starting...

echo ==========================================
echo    Magic-Mini Bead Tool is starting...
echo ==========================================
echo.

:: Check if uv is installed
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] uv command not found!
    echo Please install uv: https://astral.sh/uv
    pause
    exit /b 1
)

echo Checking environment and starting service...
echo (Browser will open automatically, do not close this window)
echo.

:: Run service
uv run python main.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Program exited with error code: !errorlevel!
    pause
)
