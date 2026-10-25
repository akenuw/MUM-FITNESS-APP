@echo off
echo Cleaning up the project...

echo.
echo === Removing node_modules ===
rmdir /s /q node_modules

echo.
echo === Removing .expo folder ===
rmdir /s /q .expo

echo.
echo === Removing .expo-shared folder ===
rmdir /s /q .expo-shared

echo.
echo === Removing yarn.lock ===
del yarn.lock

echo.
echo === Removing package-lock.json ===
del package-lock.json

echo.
echo === Reinstalling dependencies ===
npm install

echo.
echo === Starting the app ===
echo To start the app, run:
echo npx expo start

pause
