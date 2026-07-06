@echo off
chcp 65001 >nul
title Warsaw Site Parser - launcher
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-parser.ps1"
echo.
pause
