@echo off
echo Cleaning up empty folders...

rmdir /s /q "src\data" 2>nul
rmdir /s /q "src\app" 2>nul

echo Cleanup complete!
echo.
echo Deleted:
echo - src\data folder
echo - src\app folder
echo.
echo Your project is now clean and ready for deployment!
pause

