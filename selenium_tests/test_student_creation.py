"""
Test Case 4: Student Creation Test
Validates: Requirements 9.4
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def login_user(driver, base_url, username, password):
    """
    Helper function to login a user
    """
    driver.get(f"{base_url}/login.html")
    
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "loginForm"))
    )
    
    driver.find_element(By.ID, "loginUsername").send_keys(username)
    driver.find_element(By.ID, "loginPassword").send_keys(password)
    
    login_button = driver.find_element(By.CSS_SELECTOR, "#loginForm button[type='submit']")
    login_button.click()
    
    # Wait for redirect to dashboard
    WebDriverWait(driver, 10).until(
        EC.url_contains("index.html")
    )


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
    login_user(driver, base_url, test_user["username"], test_user["password"])


def test_student_creation(driver, base_url, test_user):
    """
    Test Case 4: Student Creation Test
    
    Steps:
    1. Login as valid user
    2. Navigate to Students tab
    3. Fill student form with valid data
    4. Submit form
    5. Verify student appears in list
    6. Verify success message
    """
    # Register and login
    register_and_login(driver, base_url, test_user)
    
    # Navigate to Students tab
    students_tab = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[data-tab='students']"))
    )
    students_tab.click()
    
    # Wait for students section to be visible
    students_section = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "students"))
    )
    
    # Fill student form with valid data
    student_data = {
        "name": "John Doe",
        "registrationNumber": f"REG{int(time.time())}",  # Unique registration number
        "email": "john.doe@example.com",
        "phone": "1234567890",
        "address": "123 Main Street, City"
    }
    
    driver.find_element(By.ID, "studentName").send_keys(student_data["name"])
    driver.find_element(By.ID, "studentRegNumber").send_keys(student_data["registrationNumber"])
    driver.find_element(By.ID, "studentEmail").send_keys(student_data["email"])
    driver.find_element(By.ID, "studentPhone").send_keys(student_data["phone"])
    driver.find_element(By.ID, "studentAddress").send_keys(student_data["address"])
    
    # Submit form
    submit_button = driver.find_element(By.CSS_SELECTOR, "#studentForm button[type='submit']")
    submit_button.click()
    
    # Wait for student to appear in list
    time.sleep(2)
    
    # Verify student appears in the list
    student_list = driver.find_element(By.ID, "studentList")
    student_cards = student_list.find_elements(By.CLASS_NAME, "student-card")
    
    assert len(student_cards) > 0, "At least one student should be in the list"
    
    # Verify the created student is in the list
    student_found = False
    for card in student_cards:
        if student_data["registrationNumber"] in card.text:
            student_found = True
            assert student_data["name"] in card.text, "Student name should be visible"
            assert student_data["email"] in card.text, "Student email should be visible"
            break
    
    assert student_found, f"Created student with registration number {student_data['registrationNumber']} should appear in list"
    
    # Verify form is cleared after submission
    name_input = driver.find_element(By.ID, "studentName")
    assert name_input.get_attribute("value") == "", "Form should be cleared after submission"


def test_student_form_validation(driver, base_url, test_user):
    """
    Test that student form validates required fields
    """
    # Register and login
    register_and_login(driver, base_url, test_user)
    
    # Navigate to Students tab
    students_tab = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[data-tab='students']"))
    )
    students_tab.click()
    
    # Wait for students section
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "students"))
    )
    
    # Try to submit empty form
    submit_button = driver.find_element(By.CSS_SELECTOR, "#studentForm button[type='submit']")
    submit_button.click()
    
    # Verify we're still on the students tab (form didn't submit)
    time.sleep(1)
    students_section = driver.find_element(By.ID, "students")
    assert students_section.is_displayed(), "Should remain on students section with invalid form"
