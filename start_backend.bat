@echo off
title ShikayatAI Backend
cd /d "%~dp0"
echo ==============================================
echo Starting ShikayatAI FastAPI Backend Server...
echo API Docs: http://127.0.0.1:8000/docs
echo ==============================================
python backend/run.py
pause
