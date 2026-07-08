@echo off
chcp 65001 >nul
title Aura Parser - tunnel launcher
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-parser.ps1" -Tunnel
echo.
pause
