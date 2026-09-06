@echo off
title Launch ShikayatAI Full-Stack
cd /d "%~dp0"
echo ==========================================================
echo Launching ShikayatAI: Full-Stack Complaint Redressal System
echo ==========================================================
echo 1. Starting Backend (Port 8000)...
start "ShikayatAI Backend (Port 8000)" cmd /c "%~dp0start_backend.bat"

echo 2. Starting Frontend (Port 3000)...
start "ShikayatAI Frontend (Port 3000)" cmd /c "%~dp0start_frontend.bat"

echo.
echo Both servers launched in separate windows!
echo - Frontend: http://localhost:3000
echo - Backend:  http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo.
timeout /t 3 /nobreak >nul
start http://localhost:3000
