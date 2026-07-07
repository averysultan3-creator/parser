@echo off
chcp 65001 >nul
title Warsaw Site Parser - stop
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-parser.ps1"
echo.
pause
