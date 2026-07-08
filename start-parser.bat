@echo off
chcp 65001 >nul
title Aura Parser - launcher
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-parser.ps1"
echo.
pause
