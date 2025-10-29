@echo off
echo ========================================
echo   INTERNSHIP & PLACEMENT PORTAL
echo ========================================
echo.

:menu
echo Choose an option:
echo 1. Setup Project (First time)
echo 2. Start Application (Both servers)
echo 3. Start Backend Only
echo 4. Start Frontend Only
echo 5. Seed Database (Create sample data)
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto start_both
if "%choice%"=="3" goto start_backend
if "%choice%"=="4" goto start_frontend
if "%choice%"=="5" goto seed
if "%choice%"=="6" goto exit

echo Invalid choice. Please try again.
goto menu

:setup
echo.
echo Setting up project...
call setup.bat
goto menu

:start_both
echo.
echo Starting both servers...
npm run dev
goto menu

:start_backend
echo.
echo Starting backend server...
npm run server
goto menu

:start_frontend
echo.
echo Starting frontend server...
npm run client
goto menu

:seed
echo.
echo Seeding database with sample data...
npm run seed
echo.
echo Sample data created! Check console for login credentials.
pause
goto menu

:exit
echo.
echo Goodbye!
exit