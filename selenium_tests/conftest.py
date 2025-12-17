"""
Pytest configuration for Selenium tests
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import os


@pytest.fixture(scope="function")
def driver():
    """
    Create a Chrome WebDriver instance for each test
    """
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode for CI/CD
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Get the correct ChromeDriver path
    driver_path = ChromeDriverManager().install()
    
    # Fix for Windows: if the path points to a non-executable file, find the actual chromedriver.exe
    if os.name == 'nt' and not driver_path.endswith('.exe'):
        # The path might be pointing to a directory or a non-exe file
        driver_dir = os.path.dirname(driver_path)
        # Look for chromedriver.exe in the directory
        for root, dirs, files in os.walk(driver_dir):
            for file in files:
                if file == 'chromedriver.exe':
                    driver_path = os.path.join(root, file)
                    break
    
    service = Service(driver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)  # Wait up to 10 seconds for elements
    
    yield driver
    
    driver.quit()


@pytest.fixture(scope="session")
def base_url():
    """
    Get the base URL for the application
    Can be overridden with BASE_URL environment variable
    """
    return os.getenv("BASE_URL", "http://localhost")


@pytest.fixture(scope="session")
def test_user():
    """
    Test user credentials
    """
    return {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "TestPassword123!",
        "fullName": "Test User"
    }
