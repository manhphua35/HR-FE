@echo off
echo Stopping running servers...
taskkill /F /IM node.exe 2>nul

echo Starting backend server...
cd ../hr-backend
start cmd /k "npm run dev"

echo Starting frontend server...
cd ../hr-dashboard
start cmd /k "npm start"

echo Servers restarted successfully!