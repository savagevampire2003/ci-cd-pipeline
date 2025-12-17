#!/bin/bash
# Shell script to run Selenium tests on Linux/Mac

echo "Running Selenium Test Suite"
echo "============================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check if requirements are installed
if ! python3 -c "import selenium" &> /dev/null; then
    echo "Installing test dependencies..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

# Set default BASE_URL if not set
if [ -z "$BASE_URL" ]; then
    export BASE_URL="http://localhost"
fi

echo "Testing against: $BASE_URL"
echo ""

# Run tests
python3 -m pytest -v --html=test_report.html --self-contained-html --tb=short "$@"

if [ $? -ne 0 ]; then
    echo ""
    echo "Tests failed! Check test_report.html for details"
    exit 1
else
    echo ""
    echo "All tests passed! Report: test_report.html"
    exit 0
fi
