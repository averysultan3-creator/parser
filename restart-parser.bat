@echo off
chcp 65001 >nul
title Aura Parser - restart all
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-parser.ps1" -Restart -Tunnel
echo.
pause
