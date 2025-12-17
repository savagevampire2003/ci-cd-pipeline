"""
Test Cases 2 & 3: Login Flow Tests
Validates: Requirements 9.2, 9.3
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def test_successful_login(driver, base_url, test_user):
    """
    Test Case 2: Successful Login Test
    
    Steps:
    1. Navigate to login page
    2. Enter valid credentials
    3. Click login button
    4. Verify redirect to dashboard
    5. Verify navigation bar is present
    6. Verify user is authenticated
    """
    # First, register the test user
    driver.get(f"{base_url}/login.html")
    
    # Switch to registration form
    register_link = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Register here"))
    )
    register_link.click()
    
    # Fill registration form
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "registerForm"))
    )
    
    driver.find_element(By.ID, "registerUsername").send_keys(test_user["username"])
    driver.find_element(By.ID, "registerEmail").send_keys(test_user["email"])
    driver.find_element(By.ID, "registerPassword").send_keys(test_user["password"])
    driver.find_element(By.ID, "registerFullName").send_keys(test_user["fullName"])
    
    # Submit registration
    register_button = driver.find_element(By.CSS_SELECTOR, "#registerForm button[type='submit']")
    register_button.click()
    
    # Wait for redirect or success message
    time.sleep(2)
    
    # Now perform login
    driver.get(f"{base_url}/login.html")
    
    # Wait for login form
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "loginForm"))
    )
    
    # Enter valid credentials
    driver.find_element(By.ID, "loginUsername").send_keys(test_user["username"])
    driver.find_element(By.ID, "loginPassword").send_keys(test_user["password"])
    
    # Click login button
    login_button = driver.find_element(By.CSS_SELECTOR, "#loginForm button[type='submit']")
    login_button.click()
    
    # Verify redirect to dashboard (index.html)
    WebDriverWait(driver, 10).until(
        EC.url_contains("index.html")
    )
    assert "index.html" in driver.current_url, "Should redirect to index.html after login"
    
    # Verify navigation bar is present
    nav_bar = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "nav-tabs"))
    )
    assert nav_bar.is_displayed(), "Navigation bar should be visible"
    
    # Verify navigation tabs are present
    home_tab = driver.find_element(By.CSS_SELECTOR, "a[data-tab='home']")
    students_tab = driver.find_element(By.CSS_SELECTOR, "a[data-tab='students']")
    profile_tab = driver.find_element(By.CSS_SELECTOR, "a[data-tab='profile']")
    
    assert home_tab.is_displayed(), "Home tab should be visible"
    assert students_tab.is_displayed(), "Students tab should be visible"
    assert profile_tab.is_displayed(), "Profile tab should be visible"
    
    # Verify user is authenticated by checking for logout button
    logout_button = driver.find_element(By.ID, "logoutBtn")
    assert logout_button.is_displayed(), "Logout button should be visible for authenticated user"


def test_invalid_login(driver, base_url):
    """
    Test Case 3: Invalid Login Test
    
    Steps:
    1. Navigate to login page
    2. Enter invalid credentials
    3. Click login button
    4. Verify error message is displayed
    5. Verify user remains on login page
    """
    driver.get(f"{base_url}/login.html")
    
    # Wait for login form
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "loginForm"))
    )
    
    # Enter invalid credentials
    driver.find_element(By.ID, "loginUsername").send_keys("invaliduser")
    driver.find_element(By.ID, "loginPassword").send_keys("wrongpassword")
    
    # Click login button
    login_button = driver.find_element(By.CSS_SELECTOR, "#loginForm button[type='submit']")
    login_button.click()
    
    # Wait for error message
    error_message = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "loginError"))
    )
    
    # Verify error message is displayed
    assert error_message.is_displayed(), "Error message should be visible"
    assert len(error_message.text) > 0, "Error message should contain text"
    
    # Verify user remains on login page
    assert "login.html" in driver.current_url, "Should remain on login page after failed login"
    
    # Verify login form is still visible
    login_form = driver.find_element(By.ID, "loginForm")
    assert login_form.is_displayed(), "Login form should still be visible"


def test_empty_credentials_validation(driver, base_url):
    """
    Test that empty credentials are handled properly
    """
    driver.get(f"{base_url}/login.html")
    
    # Wait for login form
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "loginForm"))
    )
    
    # Try to submit without entering credentials
    login_button = driver.find_element(By.CSS_SELECTOR, "#loginForm button[type='submit']")
    login_button.click()
    
    # Verify we're still on login page
    time.sleep(1)
    assert "login.html" in driver.current_url, "Should remain on login page with empty credentials"
