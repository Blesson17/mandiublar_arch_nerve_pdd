@echo off
cd /d %~dp0
echo Starting ImplantAI Frontend (React)...

cd frontend

:: Ensure dependencies are installed
if not exist node_modules call npm install

echo Starting Development Server...
echo Please look for the Local URL (usually http://localhost:5173) below:
echo ---------------------------------------------------
call npm run dev
pause
