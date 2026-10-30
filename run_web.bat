@echo off
title BankSight AI — Production Web Server
echo ======================================================================
echo   Launching BankSight AI Full-Stack Platform
echo   FastAPI REST Backend + React 18 / Three.js Frontend
echo ======================================================================
echo.
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
