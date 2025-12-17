"""
Test Case 5: Navigation Test
Validates: Requirements 9.5
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def register_and_login(driver, base_url, test_user):
    """
    Helper function to register and login a user
    """
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
    
    time.sleep(2)
    
    # Login
    driver.get(f"{base_url}/login.html")
    
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "loginForm"))
    )
    
    driver.find_element(By.ID, "loginUsername").send_keys(test_user["username"])
    driver.find_element(By.ID, "loginPassword").send_keys(test_user["password"])
    
    login_button = driver.find_element(By.CSS_SELECTOR, "#loginForm button[type='submit']")
    login_button.click()
    
    # Wait for redirect to dashboard
    WebDriverWait(driver, 10).until(
        EC.url_contains("index.html")
    )


def test_navigation_tabs(driver, base_url, test_user):
    """
    Test Case 5: Navigation Test
    
    Steps:
    1. Login as valid user
    2. Click each tab (Home, Students, Profile)
    3. Verify correct content is displayed for each tab
    4. Verify active tab is highlighted
    """
    # Register and login
    register_and_login(driver, base_url, test_user)
    
    # Test Home tab
    home_tab = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[data-tab='home']"))
    )
    home_tab.click()
    
    # Verify Home content is displayed
    home_section = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "home"))
    )
    assert home_section.is_displayed(), "Home section should be visible"
    
    # Verify Home tab is active
    assert "active" in home_tab.get_attribute("class"), "Home tab should have active class"
    
    # Verify other sections are hidden
    students_section = driver.find_element(By.ID, "students")
    profile_section = driver.find_element(By.ID, "profile")
    assert not students_section.is_displayed(), "Students section should be hidden"
    assert not profile_section.is_displayed(), "Profile section should be hidden"
    
    # Test Students tab
    students_tab = driver.find_element(By.CSS_SELECTOR, "a[data-tab='students']")
    students_tab.click()
    
    time.sleep(0.5)  # Allow transition
    
    # Verify Students content is displayed
    students_section = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "students"))
    )
    assert students_section.is_displayed(), "Students section should be visible"
    
    # Verify Students tab is active
    assert "active" in students_tab.get_attribute("class"), "Students tab should have active class"
    
    # Verify other sections are hidden
    home_section = driver.find_element(By.ID, "home")
    profile_section = driver.find_element(By.ID, "profile")
    assert not home_section.is_displayed(), "Home section should be hidden"
    assert not profile_section.is_displayed(), "Profile section should be hidden"
    
    # Test Profile tab
    profile_tab = driver.find_element(By.CSS_SELECTOR, "a[data-tab='profile']")
    profile_tab.click()
    
    time.sleep(0.5)  # Allow transition
    
    # Verify Profile content is displayed
    profile_section = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "profile"))
    )
    assert profile_section.is_displayed(), "Profile section should be visible"
    
    # Verify Profile tab is active
    assert "active" in profile_tab.get_attribute("class"), "Profile tab should have active class"
    
    # Verify other sections are hidden
    home_section = driver.find_element(By.ID, "home")
    students_section = driver.find_element(By.ID, "students")
    assert not home_section.is_displayed(), "Home section should be hidden"
    assert not students_section.is_displayed(), "Students section should be hidden"


def test_navigation_persistence(driver, base_url, test_user):
    """
    Test that navigation state persists correctly
    """
    # Register and login
    register_and_login(driver, base_url, test_user)
    
    # Navigate to Students tab
    students_tab = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[data-tab='students']"))
    )
    students_tab.click()
    
    # Verify Students section is visible
    students_section = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "students"))
    )
    assert students_section.is_displayed(), "Students section should be visible"
    
    # Navigate back to Home
    home_tab = driver.find_element(By.CSS_SELECTOR, "a[data-tab='home']")
    home_tab.click()
    
    time.sleep(0.5)
    
    # Verify Home section is visible
    home_section = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "home"))
    )
    assert home_section.is_displayed(), "Home section should be visible after navigating back"


def test_all_navigation_elements_present(driver, base_url, test_user):
    """
    Test that all navigation elements are present and clickable
    """
    # Register and login
    register_and_login(driver, base_url, test_user)
    
    # Verify all navigation tabs are present
    home_tab = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "a[data-tab='home']"))
    )
    students_tab = driver.find_element(By.CSS_SELECTOR, "a[data-tab='students']")
    profile_tab = driver.find_element(By.CSS_SELECTOR, "a[data-tab='profile']")
    logout_button = driver.find_element(By.ID, "logoutBtn")
    
    # Verify all elements are displayed
    assert home_tab.is_displayed(), "Home tab should be visible"
    assert students_tab.is_displayed(), "Students tab should be visible"
    assert profile_tab.is_displayed(), "Profile tab should be visible"
    assert logout_button.is_displayed(), "Logout button should be visible"
    
    # Verify all tabs are clickable
    assert home_tab.is_enabled(), "Home tab should be clickable"
    assert students_tab.is_enabled(), "Students tab should be clickable"
    assert profile_tab.is_enabled(), "Profile tab should be clickable"
    assert logout_button.is_enabled(), "Logout button should be clickable"
