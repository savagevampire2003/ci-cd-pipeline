# Selenium Test Suite

This directory contains automated browser tests for the Student Management System using Selenium WebDriver and Python.

## Requirements

- Python 3.8 or higher
- Chrome browser (tests run in headless mode)
- Application running on `http://localhost` (or set `BASE_URL` environment variable)

## Installation

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

This will install:
- `selenium` - WebDriver for browser automation
- `pytest` - Testing framework
- `pytest-html` - HTML report generation
- `webdriver-manager` - Automatic ChromeDriver management

## Running Tests

### Run all tests:

```bash
pytest
```

### Run specific test file:

```bash
pytest test_homepage.py
pytest test_login.py
pytest test_student_creation.py
pytest test_navigation.py
pytest test_profile.py
```

### Run with HTML report:

```bash
pytest --html=test_report.html --self-contained-html
```

The HTML report will be generated as `test_report.html` in the current directory.

### Run tests against a different URL:

```bash
BASE_URL=http://your-app-url pytest
```

### Run specific test markers:

```bash
pytest -m smoke      # Run smoke tests
pytest -m login      # Run login tests
pytest -m navigation # Run navigation tests
```

## Test Cases

### 1. Homepage Load Test (`test_homepage.py`)
**Validates: Requirements 9.1**

- Verifies homepage loads successfully
- Checks page title contains "Student Management"
- Verifies login form is present
- Verifies registration link is present

### 2. Successful Login Test (`test_login.py`)
**Validates: Requirements 9.2**

- Registers a new user
- Logs in with valid credentials
- Verifies redirect to dashboard
- Verifies navigation bar is present
- Verifies user is authenticated

### 3. Invalid Login Test (`test_login.py`)
**Validates: Requirements 9.3**

- Attempts login with invalid credentials
- Verifies error message is displayed
- Verifies user remains on login page

### 4. Student Creation Test (`test_student_creation.py`)
**Validates: Requirements 9.4**

- Logs in as valid user
- Navigates to Students tab
- Fills student form with valid data
- Submits form
- Verifies student appears in list

### 5. Navigation Test (`test_navigation.py`)
**Validates: Requirements 9.5**

- Logs in as valid user
- Clicks each tab (Home, Students, Profile)
- Verifies correct content is displayed for each tab
- Verifies active tab is highlighted

### 6. Profile View Test (`test_profile.py`)
**Validates: Requirements 9.6**

- Logs in as valid user
- Navigates to Profile tab
- Verifies username is displayed
- Verifies email is displayed
- Verifies full name is displayed

## Test Configuration

### Environment Variables

- `BASE_URL` - Base URL of the application (default: `http://localhost`)

### Browser Configuration

Tests run in headless Chrome by default with the following options:
- `--headless` - Run without GUI
- `--no-sandbox` - Required for some CI/CD environments
- `--disable-dev-shm-usage` - Overcome limited resource problems
- `--disable-gpu` - Disable GPU acceleration
- `--window-size=1920,1080` - Set window size

To run tests with visible browser (for debugging), modify `conftest.py` and remove the `--headless` option.

## CI/CD Integration

These tests are designed to run in CI/CD pipelines. The GitHub Actions workflow includes a Selenium test stage that:

1. Deploys the application to a test environment
2. Runs the Selenium test suite
3. Generates an HTML report
4. Uploads the report as an artifact
5. Fails the pipeline if any test fails

## Troubleshooting

### ChromeDriver Issues

If you encounter ChromeDriver issues, the `webdriver-manager` package will automatically download the correct version. If problems persist:

```bash
pip install --upgrade webdriver-manager
```

### Element Not Found Errors

Tests use explicit waits (WebDriverWait) with a 10-second timeout. If elements are not found:
- Verify the application is running
- Check that element IDs and selectors match the actual HTML
- Increase the implicit wait time in `conftest.py` if needed

### Test Data Conflicts

Each test that creates a user uses a unique username based on the test name. If you encounter duplicate user errors:
- Clear the database between test runs
- Modify the test user data in `conftest.py`

## Report Generation

After running tests, an HTML report (`test_report.html`) is generated with:
- Test execution summary
- Pass/fail status for each test
- Execution time
- Error messages and stack traces for failures
- Screenshots (if configured)

Open the report in a browser:

```bash
# Windows
start test_report.html

# Linux/Mac
open test_report.html
```

## Best Practices

1. **Run tests against a clean database** - Tests create users and students, which may conflict with existing data
2. **Use unique test data** - Registration numbers and usernames should be unique
3. **Wait for elements** - Always use WebDriverWait for dynamic content
4. **Keep tests independent** - Each test should be able to run in isolation
5. **Clean up after tests** - Tests should not leave the system in an inconsistent state

## Future Enhancements

- Add screenshot capture on test failure
- Implement parallel test execution
- Add performance metrics
- Expand test coverage for edge cases
- Add visual regression testing
