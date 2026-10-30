@echo off
title BankSight AI — Unified Platform Launcher
echo ======================================================================
echo   Launching BankSight AI (Full-Stack Platform)
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo ======================================================================
echo.

start "BankSight AI - Backend (:8000)" cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"
start "BankSight AI - Frontend (:5173)" cmd /k "cd frontend && npm.cmd run dev"

echo Both services launched in separate windows!
echo Opening browser...
timeout /t 3 >nul
start http://localhost:5173
exit
