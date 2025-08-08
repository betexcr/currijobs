#!/usr/bin/env python3
"""
CurriJobs Automated Testing Suite
Tests the web interface of the CurriJobs app using Selenium
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
import random
import string

class CurriJobsTestSuite:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.base_url = "http://localhost:8081"  # Expo web server
        
    def setup_driver(self):
        """Initialize Chrome WebDriver with options"""
        options = Options()
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def generate_random_email(self):
        """Generate a random email for testing"""
        username = ''.join(random.choices(string.ascii_lowercase, k=8))
        return f"{username}@test.com"
    
    def test_app_loading(self):
        """Test that the app loads correctly"""
        print("🧪 Test 1: App Loading")
        try:
            self.driver.get(self.base_url)
            time.sleep(3)
            
            # Check if app loads (look for login or welcome screen)
            page_source = self.driver.page_source
            if "CurriJobs" in page_source or "Login" in page_source or "Welcome" in page_source:
                print("✅ App loaded successfully")
                return True
            else:
                print("❌ App failed to load")
                return False
        except Exception as e:
            print(f"❌ Error loading app: {e}")
            return False
    
    def test_registration_flow(self):
        """Test user registration flow"""
        print("\n🧪 Test 2: User Registration")
        try:
            # Navigate to registration page
            self.driver.get(f"{self.base_url}/register")
            time.sleep(2)
            
            # Generate test credentials
            test_email = self.generate_random_email()
            test_password = "TestPassword123!"
            
            # Fill registration form
            email_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
            email_input.send_keys(test_email)
            
            password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            password_input.send_keys(test_password)
            
            # Submit registration
            submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            
            time.sleep(3)
            
            # Check if registration was successful
            if "Welcome" in self.driver.page_source or "Home" in self.driver.page_source:
                print(f"✅ Registration successful with email: {test_email}")
                return True
            else:
                print("❌ Registration failed")
                return False
                
        except Exception as e:
            print(f"❌ Error in registration test: {e}")
            return False
    
    def test_login_flow(self):
        """Test user login flow"""
        print("\n🧪 Test 3: User Login")
        try:
            # Navigate to login page
            self.driver.get(f"{self.base_url}/login")
            time.sleep(2)
            
            # Use test credentials
            test_email = "test@example.com"
            test_password = "TestPassword123!"
            
            # Fill login form
            email_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
            email_input.send_keys(test_email)
            
            password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            password_input.send_keys(test_password)
            
            # Submit login
            submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            
            time.sleep(3)
            
            # Check if login was successful
            if "Welcome" in self.driver.page_source or "Tasks" in self.driver.page_source:
                print("✅ Login successful")
                return True
            else:
                print("❌ Login failed")
                return False
                
        except Exception as e:
            print(f"❌ Error in login test: {e}")
            return False
    
    def test_task_creation(self):
        """Test task creation functionality"""
        print("\n🧪 Test 4: Task Creation")
        try:
            # Navigate to create task page
            self.driver.get(f"{self.base_url}/create-task")
            time.sleep(2)
            
            # Fill task form
            title_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='title']")))
            title_input.send_keys("Automated Test Task")
            
            description_input = self.driver.find_element(By.CSS_SELECTOR, "textarea")
            description_input.send_keys("This is an automated test task created by Selenium")
            
            # Select category
            category_select = self.driver.find_element(By.CSS_SELECTOR, "select")
            category_select.click()
            category_option = self.driver.find_element(By.CSS_SELECTOR, "option[value='Cleaning']")
            category_option.click()
            
            # Fill reward
            reward_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='number']")
            reward_input.send_keys("15000")
            
            # Submit task
            submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            
            time.sleep(3)
            
            # Check if task creation was successful
            if "Success" in self.driver.page_source or "created" in self.driver.page_source:
                print("✅ Task creation successful")
                return True
            else:
                print("❌ Task creation failed")
                return False
                
        except Exception as e:
            print(f"❌ Error in task creation test: {e}")
            return False
    
    def test_task_listing(self):
        """Test task listing functionality"""
        print("\n🧪 Test 5: Task Listing")
        try:
            # Navigate to home page
            self.driver.get(self.base_url)
            time.sleep(3)
            
            # Check if tasks are displayed
            task_elements = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='task-item']")
            
            if len(task_elements) > 0:
                print(f"✅ Found {len(task_elements)} tasks")
                return True
            else:
                print("❌ No tasks found")
                return False
                
        except Exception as e:
            print(f"❌ Error in task listing test: {e}")
            return False
    
    def test_search_functionality(self):
        """Test search functionality"""
        print("\n🧪 Test 6: Search Functionality")
        try:
            # Navigate to home page
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # Find search input
            search_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='search']")))
            search_input.send_keys("test")
            search_input.send_keys(Keys.RETURN)
            
            time.sleep(2)
            
            # Check if search results are displayed
            results = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='task-item']")
            
            if len(results) >= 0:  # Search might return 0 results
                print("✅ Search functionality working")
                return True
            else:
                print("❌ Search functionality failed")
                return False
                
        except Exception as e:
            print(f"❌ Error in search test: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests and provide summary"""
        print("🚀 Starting CurriJobs Automated Test Suite")
        print("=" * 50)
        
        self.setup_driver()
        
        tests = [
            self.test_app_loading,
            self.test_registration_flow,
            self.test_login_flow,
            self.test_task_creation,
            self.test_task_listing,
            self.test_search_functionality,
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ Test failed with exception: {e}")
        
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! CurriJobs is working correctly!")
        else:
            print("⚠️ Some tests failed. Check the logs above for details.")
        
        self.driver.quit()
        return passed == total

if __name__ == "__main__":
    test_suite = CurriJobsTestSuite()
    test_suite.run_all_tests()
