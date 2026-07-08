@echo off
chcp 65001 >nul
title Aura Parser - stop
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-parser.ps1"
echo.
pause
