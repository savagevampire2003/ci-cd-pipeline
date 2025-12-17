"""
Test Case 1: Homepage Load Test
Validates: Requirements 9.1
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_homepage_loads_successfully(driver, base_url):
    """
    Test that the homepage loads successfully with expected elements
    
    Steps:
    1. Navigate to application URL
    2. Verify page title contains "Student Management"
    3. Verify login form is present
    4. Verify registration link is present
    """
    # Navigate to the application
    driver.get(f"{base_url}/login.html")
    
    # Verify page title
    assert "Student" in driver.title and "Management" in driver.title, f"Expected 'Student Management' in title, got: {driver.title}"
    
    # Verify login form is present
    login_form = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "loginForm"))
    )
    assert login_form.is_displayed(), "Login form should be visible"
    
    # Verify username input field
    username_input = driver.find_element(By.ID, "loginUsername")
    assert username_input.is_displayed(), "Username input should be visible"
    
    # Verify password input field
    password_input = driver.find_element(By.ID, "loginPassword")
    assert password_input.is_displayed(), "Password input should be visible"
    
    # Verify login button
    login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    assert login_button.is_displayed(), "Login button should be visible"
    
    # Verify registration link is present
    register_link = driver.find_element(By.LINK_TEXT, "Register here")
    assert register_link.is_displayed(), "Registration link should be visible"
    assert "register" in register_link.get_attribute("href").lower(), "Registration link should point to register section"


def test_registration_form_present(driver, base_url):
    """
    Test that the registration form is accessible and contains required fields
    """
    driver.get(f"{base_url}/login.html")
    
    # Click on registration link
    register_link = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Register here"))
    )
    register_link.click()
    
    # Verify registration form is displayed
    register_form = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "registerForm"))
    )
    assert register_form.is_displayed(), "Registration form should be visible"
    
    # Verify all required fields are present
    assert driver.find_element(By.ID, "registerUsername").is_displayed()
    assert driver.find_element(By.ID, "registerEmail").is_displayed()
    assert driver.find_element(By.ID, "registerPassword").is_displayed()
    assert driver.find_element(By.ID, "registerFullName").is_displayed()
