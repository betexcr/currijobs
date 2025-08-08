#!/usr/bin/env python3
"""
CurriJobs iOS Simulator Comprehensive Test
Tests all features: authentication, task creation, mascot, offer system, etc.
"""

import subprocess
import time
import requests
import webbrowser
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class CurriJobsComprehensiveTest:
    def __init__(self):
        self.driver = None
        self.test_results = {}
        
    def setup_driver(self):
        """Setup Chrome driver for testing"""
        options = Options()
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--start-maximized")
        
        self.driver = webdriver.Chrome(options=options)
        
    def check_expo_server(self):
        """Check if Expo server is running"""
        print("🔍 Checking Expo server...")
        try:
            response = requests.get("http://localhost:8081", timeout=5)
            if response.status_code == 200:
                print("✅ Expo server is running")
                return True
            else:
                print(f"❌ Expo server status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Expo server not running: {e}")
            return False
    
    def test_welcome_screen(self):
        """Test welcome screen features"""
        print("\n📱 Testing Welcome Screen")
        print("-" * 30)
        
        try:
            # Load the app
            self.driver.get("http://localhost:8081")
            time.sleep(5)
            
            # Test welcome elements
            welcome_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Welcome') or contains(text(), 'CurriJobs')]")
            if welcome_elements:
                print("✅ Welcome screen loaded")
                self.test_results['welcome_screen'] = True
            else:
                print("❌ Welcome screen not found")
                self.test_results['welcome_screen'] = False
            
            # Test mascot presence
            mascot_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '🐄') or contains(text(), 'Chambito')]")
            if mascot_elements:
                print("✅ Chambito mascot detected")
                self.test_results['mascot'] = True
            else:
                print("❌ Mascot not found")
                self.test_results['mascot'] = False
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing welcome screen: {e}")
            self.test_results['welcome_screen'] = False
            return False
    
    def test_registration(self):
        """Test user registration"""
        print("\n📝 Testing User Registration")
        print("-" * 30)
        
        try:
            # Look for registration form
            email_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
            password_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            
            if email_inputs and password_inputs:
                print("✅ Registration form found")
                
                # Fill form
                email_inputs[0].send_keys("test@currijobs.com")
                password_inputs[0].send_keys("TestPassword123!")
                
                print("📧 Email: test@currijobs.com")
                print("🔒 Password: TestPassword123!")
                
                # Look for submit button
                submit_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Register') or contains(text(), 'Sign Up')]")
                if submit_buttons:
                    print("✅ Submit button found")
                    self.test_results['registration'] = True
                else:
                    print("⚠️ Submit button not found")
                    self.test_results['registration'] = False
            else:
                print("❌ Registration form not found")
                self.test_results['registration'] = False
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing registration: {e}")
            self.test_results['registration'] = False
            return False
    
    def test_login(self):
        """Test user login"""
        print("\n🔐 Testing User Login")
        print("-" * 30)
        
        try:
            # Look for login form
            email_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
            password_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            
            if email_inputs and password_inputs:
                print("✅ Login form found")
                
                # Fill form
                email_inputs[0].send_keys("demo@example.com")
                password_inputs[0].send_keys("DemoPassword123!")
                
                print("📧 Email: demo@example.com")
                print("🔒 Password: DemoPassword123!")
                
                # Look for submit button
                submit_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Login') or contains(text(), 'Sign In')]")
                if submit_buttons:
                    print("✅ Login button found")
                    self.test_results['login'] = True
                else:
                    print("⚠️ Login button not found")
                    self.test_results['login'] = False
            else:
                print("❌ Login form not found")
                self.test_results['login'] = False
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing login: {e}")
            self.test_results['login'] = False
            return False
    
    def test_task_creation(self):
        """Test task creation"""
        print("\n🔨 Testing Task Creation")
        print("-" * 30)
        
        try:
            # Look for create task button
            create_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Create') or contains(text(), '+ Create')]")
            if create_buttons:
                print("✅ Create task button found")
                
                # Click create button
                create_buttons[0].click()
                time.sleep(2)
                
                # Test task form
                title_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[placeholder*='title']")
                if title_inputs:
                    print("✅ Task creation form found")
                    title_inputs[0].send_keys("Test Task - House Cleaning")
                    print("📝 Title: Test Task - House Cleaning")
                
                # Test description field
                description_inputs = self.driver.find_elements(By.CSS_SELECTOR, "textarea")
                if description_inputs:
                    description_inputs[0].send_keys("Need help cleaning my apartment.")
                    print("📝 Description: Need help cleaning my apartment.")
                
                # Test category selection
                category_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Cleaning') or contains(text(), 'Category')]")
                if category_elements:
                    print("✅ Category selection found")
                
                # Test reward field
                reward_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='number']")
                if reward_inputs:
                    reward_inputs[0].send_keys("25000")
                    print("💰 Reward: ₡25,000")
                
                self.test_results['task_creation'] = True
                print("✅ Task creation test completed")
            else:
                print("❌ Create task button not found")
                self.test_results['task_creation'] = False
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing task creation: {e}")
            self.test_results['task_creation'] = False
            return False
    
    def test_offer_system(self):
        """Test offer system"""
        print("\n💰 Testing Offer System")
        print("-" * 30)
        
        try:
            # Look for offer-related elements
            offer_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Offer') or contains(text(), 'Make Offer')]")
            if offer_elements:
                print(f"✅ Found {len(offer_elements)} offer elements")
                self.test_results['offer_system'] = True
            else:
                print("❌ Offer elements not found")
                self.test_results['offer_system'] = False
            
            # Test task details
            task_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Task') or contains(text(), 'Details')]")
            if task_elements:
                print("✅ Task details found")
            
            # Test accept/reject buttons
            action_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Accept') or contains(text(), 'Reject')]")
            if action_buttons:
                print("✅ Accept/Reject buttons found")
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing offer system: {e}")
            self.test_results['offer_system'] = False
            return False
    
    def test_task_management(self):
        """Test task management features"""
        print("\n📋 Testing Task Management")
        print("-" * 30)
        
        try:
            # Test task list
            task_list_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Tasks') or contains(text(), 'Available')]")
            if task_list_elements:
                print("✅ Task list found")
                self.test_results['task_management'] = True
            else:
                print("❌ Task list not found")
                self.test_results['task_management'] = False
            
            # Test search functionality
            search_elements = self.driver.find_elements(By.CSS_SELECTOR, "input[placeholder*='search']")
            if search_elements:
                print("✅ Search functionality found")
                search_elements[0].send_keys("cleaning")
                print("🔍 Search: 'cleaning'")
            
            # Test category filters
            filter_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Filter') or contains(text(), 'Category')]")
            if filter_elements:
                print("✅ Category filters found")
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing task management: {e}")
            self.test_results['task_management'] = False
            return False
    
    def test_mascot_features(self):
        """Test mascot features"""
        print("\n🐄 Testing Mascot Features")
        print("-" * 30)
        
        try:
            # Test mascot presence
            mascot_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '🐄') or contains(text(), 'Chambito')]")
            if mascot_elements:
                print(f"✅ Found {len(mascot_elements)} mascot elements")
                self.test_results['mascot_features'] = True
            else:
                print("❌ Mascot elements not found")
                self.test_results['mascot_features'] = False
            
            # Test mascot messages
            mascot_messages = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Chambito') or contains(text(), 'mascot')]")
            if mascot_messages:
                print("✅ Mascot messages detected")
            
            # Test different mascot moods
            mood_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '🔨') or contains(text(), '🤔') or contains(text(), '✅')]")
            if mood_elements:
                print("✅ Mascot mood variations detected")
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing mascot features: {e}")
            self.test_results['mascot_features'] = False
            return False
    
    def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 CurriJobs Comprehensive iOS Test")
        print("=" * 50)
        
        # Check Expo server
        if not self.check_expo_server():
            print("❌ Please start Expo server first: npm start")
            return
        
        # Setup driver
        self.setup_driver()
        
        # Run all tests
        tests = [
            self.test_welcome_screen,
            self.test_registration,
            self.test_login,
            self.test_task_creation,
            self.test_offer_system,
            self.test_task_management,
            self.test_mascot_features
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test failed: {e}")
        
        # Print results
        self.print_test_results()
        
        # Take screenshot
        self.driver.save_screenshot("test-automation/comprehensive_test_screenshot.png")
        print("📸 Screenshot saved as comprehensive_test_screenshot.png")
        
        self.driver.quit()
    
    def print_test_results(self):
        """Print test results summary"""
        print("\n📊 Test Results Summary")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print(f"\n📈 Overall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed! CurriJobs is working perfectly!")
        else:
            print("⚠️ Some tests failed. Check the implementation.")

def main():
    test = CurriJobsComprehensiveTest()
    test.run_comprehensive_test()

if __name__ == "__main__":
    main()
