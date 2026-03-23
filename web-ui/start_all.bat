@echo off
cd /d %~dp0

echo Starting ImplantAI Platform...
echo ---------------------------------------------------
echo 1. Launching Unified Backend (FastAPI) on port 8000...
start "ImplantAI Backend" cmd /k "call start_fastapi.bat"

echo 2. Launching Frontend (React) on port 5173...
start "ImplantAI Frontend" cmd /k "call start_frontend.bat"

echo ---------------------------------------------------
echo Once started, please open your browser to:
echo http://localhost:5173
echo (This is the new Professional UI)
echo ---------------------------------------------------
pause
