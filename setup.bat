@echo off
echo 🚀 Setting up ReachInbox Email Aggregator...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing pnpm...
    npm install -g pnpm
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo [SUCCESS] All requirements met!

REM Setup backend
echo [INFO] Setting up backend...
cd backend
echo [INFO] Installing backend dependencies...
pnpm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file from template...
    copy env.example .env
    echo [WARNING] Please edit backend\.env with your configuration!
)

cd ..
echo [SUCCESS] Backend setup complete!

REM Setup frontend
echo [INFO] Setting up frontend...
cd frontend
echo [INFO] Installing frontend dependencies...
pnpm install
cd ..
echo [SUCCESS] Frontend setup complete!

REM Start infrastructure
echo [INFO] Starting infrastructure services...
docker-compose up -d elasticsearch

REM Wait for Elasticsearch
echo [INFO] Waiting for Elasticsearch to be ready...
timeout /t 30 /nobreak >nul

REM Create development scripts
echo [INFO] Creating development scripts...

REM Backend start script
echo @echo off > start-backend.bat
echo echo 🚀 Starting ReachInbox Backend... >> start-backend.bat
echo cd backend >> start-backend.bat
echo pnpm run dev >> start-backend.bat

REM Frontend start script
echo @echo off > start-frontend.bat
echo echo 🚀 Starting ReachInbox Frontend... >> start-frontend.bat
echo cd frontend >> start-frontend.bat
echo pnpm run dev >> start-frontend.bat

REM Full start script
echo @echo off > start-all.bat
echo echo 🚀 Starting ReachInbox Email Aggregator... >> start-all.bat
echo echo. >> start-all.bat
echo echo Starting infrastructure services... >> start-all.bat
echo docker-compose up -d >> start-all.bat
echo echo. >> start-all.bat
echo echo Waiting for services to be ready... >> start-all.bat
echo timeout /t 10 /nobreak ^>nul >> start-all.bat
echo echo. >> start-all.bat
echo echo Starting backend... >> start-all.bat
echo start "Backend" cmd /k "cd backend && pnpm run dev" >> start-all.bat
echo echo Starting frontend... >> start-all.bat
echo start "Frontend" cmd /k "cd frontend && pnpm run dev" >> start-all.bat
echo echo. >> start-all.bat
echo echo ✅ ReachInbox is running! >> start-all.bat
echo echo Frontend: http://localhost:3000 >> start-all.bat
echo echo Backend: http://localhost:3001 >> start-all.bat
echo echo Elasticsearch: http://localhost:9200 >> start-all.bat
echo echo. >> start-all.bat
echo echo Press any key to stop all services >> start-all.bat
echo pause ^>nul >> start-all.bat
echo docker-compose down >> start-all.bat

echo [SUCCESS] Development scripts created!

echo.
echo [SUCCESS] 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your email credentials and API keys
echo 2. Run 'start-all.bat' to start the application
echo 3. Or run 'start-backend.bat' and 'start-frontend.bat' separately
echo.
echo Access the application:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - Elasticsearch: http://localhost:9200
echo.
echo For production deployment, use:
echo docker-compose -f docker-compose.prod.yml up -d
echo.
pause
