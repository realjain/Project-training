@echo off
echo Setting up Internship & Placement Portal...

echo.
echo Step 1: Cleaning old installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist frontend\package-lock.json del frontend\package-lock.json

echo.
echo Step 2: Clearing npm cache...
npm cache clean --force

echo.
echo Step 3: Installing backend dependencies...
npm install

echo.
echo Step 4: Installing frontend dependencies...
cd frontend
npm install --legacy-peer-deps
cd ..

echo.
echo Step 5: Creating environment file...
if not exist .env copy .env.example .env

echo.
echo Setup complete! You can now run: npm run dev
echo.
pause