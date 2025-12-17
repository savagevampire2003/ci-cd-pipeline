@echo off
REM Batch script to run Selenium tests on Windows

echo Running Selenium Test Suite
echo ============================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    exit /b 1
)

REM Check if requirements are installed
python -c "import selenium" >nul 2>&1
if errorlevel 1 (
    echo Installing test dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        exit /b 1
    )
)

REM Set default BASE_URL if not set
if not defined BASE_URL (
    set BASE_URL=http://localhost
)

echo Testing against: %BASE_URL%
echo.

REM Run tests
python -m pytest -v --html=test_report.html --self-contained-html --tb=short %*

if errorlevel 1 (
    echo.
    echo Tests failed! Check test_report.html for details
    exit /b 1
) else (
    echo.
    echo All tests passed! Report: test_report.html
    exit /b 0
)
