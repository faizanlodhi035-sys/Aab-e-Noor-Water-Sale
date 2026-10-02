@echo off
echo ========================================================
echo Starting Aab-e-Noor Water Sales (Local Environment)
echo ========================================================

REM 1. Start MySQL if XAMPP is installed
if exist "C:\xampp\mysql_start.bat" (
    echo Starting MySQL via XAMPP...
    start /min "MySQL" "C:\xampp\mysql_start.bat"
)

timeout /t 2 >nul

REM 2. Start Laravel Backend Server
echo Starting Laravel Backend (http://127.0.0.1:8000)...
start "Backend (Laravel)" cmd /k "cd /d %~dp0backend && php artisan serve --host=127.0.0.1 --port=8000"

timeout /t 2 >nul

REM 3. Start Vite Frontend Server
echo Starting Frontend (http://localhost:5173)...
start "Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 >nul

REM 4. Open Application in default browser
echo Opening Application in Browser...
start http://localhost:5173

echo ========================================================
echo App is running!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo Default Admin: admin@local / secret123
echo ========================================================
