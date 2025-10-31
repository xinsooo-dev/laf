@echo off
echo ========================================
echo   iFound - Starting Both Servers
echo ========================================
echo.
echo Homepage: http://localhost:5173
echo Admin:    http://localhost:5174/admin-login
echo.
echo Note: You need to install concurrently first:
echo npm install --save-dev concurrently
echo.
npm run dev:both
