# Selenium Tests - Quick Start Guide

## Installation (One-time setup)

```bash
cd selenium_tests
pip install -r requirements.txt
```

## Running Tests

### Option 1: Use the run script (Recommended)

**Windows:**
```bash
run_tests.bat
```

**Linux/Mac:**
```bash
chmod +x run_tests.sh
./run_tests.sh
```

### Option 2: Use pytest directly

```bash
pytest -v --html=test_report.html --self-contained-html
```

## Test Against Different URL

**Windows:**
```bash
set BASE_URL=http://your-app-url
run_tests.bat
```

**Linux/Mac:**
```bash
BASE_URL=http://your-app-url ./run_tests.sh
```

## View Results

Open `test_report.html` in your browser after tests complete.

## Test Coverage

✅ **Test 1: Homepage Load** - Verifies login page loads with all elements  
✅ **Test 2: Successful Login** - Tests user authentication and redirect  
✅ **Test 3: Invalid Login** - Validates error handling  
✅ **Test 4: Student Creation** - Tests adding new student records  
✅ **Test 5: Navigation** - Verifies tab switching and content display  
✅ **Test 6: Profile View** - Tests user profile information display  

## Requirements Validated

- ✅ Requirement 9.1 - Homepage loads successfully
- ✅ Requirement 9.2 - Successful login with valid credentials
- ✅ Requirement 9.3 - Invalid login shows error message
- ✅ Requirement 9.4 - Student creation workflow
- ✅ Requirement 9.5 - Navigation between tabs
- ✅ Requirement 9.6 - Profile information display
- ✅ Requirement 9.7 - HTML report generation

## Troubleshooting

**Problem:** ChromeDriver not found  
**Solution:** The webdriver-manager will auto-download it. If issues persist:
```bash
pip install --upgrade webdriver-manager
```

**Problem:** Tests fail with "element not found"  
**Solution:** Ensure the application is running at the BASE_URL (default: http://localhost)

**Problem:** Database conflicts  
**Solution:** Clear the database between test runs or use unique test data

## CI/CD Integration

These tests are automatically run in the GitHub Actions pipeline after deployment to AKS. The pipeline:
1. Deploys the application
2. Waits for services to be ready
3. Runs the Selenium test suite
4. Generates and uploads the HTML report
5. Fails the pipeline if any test fails

## Next Steps

- Review test_report.html for detailed results
- Add more test cases as needed
- Configure screenshot capture on failure
- Implement parallel test execution for faster runs
