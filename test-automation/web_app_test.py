#!/usr/bin/env python3
"""
CurriJobs Web App Test
Tests all features in the web version of the app
"""

import time
import requests
import webbrowser
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class CurriJobsWebTest:
    def __init__(self):
        self.driver = None
        self.test_results = {}
        
    def setup_driver(self):
        """Setup Chrome driver"""
        options = Options()
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--start-maximized")
        
        self.driver = webdriver.Chrome(options=options)
        
    def wait_for_app_to_load(self):
        """Wait for the app to load properly"""
        print("🌐 Loading CurriJobs web app...")
        
        # Try different URLs
        urls_to_try = [
            "http://localhost:19006",
            "http://localhost:8081",
            "http://localhost:3000"
        ]
        
        for url in urls_to_try:
            try:
                print(f"🌐 Trying: {url}")
                self.driver.get(url)
                time.sleep(10)  # Wait longer for app to load
                
                page_source = self.driver.page_source
                
                # Check if it's the actual app (not just Expo interface)
                if "CurriJobs" in page_source or "Welcome" in page_source or "Login" in page_source:
                    print(f"✅ App loaded from {url}")
                    return True
                elif "Expo" in page_source and "QR" in page_source:
                    print(f"⚠️ Expo interface loaded from {url}, looking for web button...")
                    # Look for web button and click it
                    web_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Web') or contains(text(), 'web')]")
                    if web_buttons:
                        print("🖱️ Clicking Web button...")
                        web_buttons[0].click()
                        time.sleep(10)
                        return True
                else:
                    print(f"❌ No app content found at {url}")
                    
            except Exception as e:
                print(f"❌ Error loading {url}: {e}")
        
        return False
    
    def test_welcome_screen(self):
        """Test welcome screen"""
        print("\n📱 Testing Welcome Screen")
        print("-" * 30)
        
        try:
            # Look for welcome elements
            welcome_texts = ["Welcome to CurriJobs", "CurriJobs", "Meet Chambito", "Get Started"]
            found_welcome = False
            
            for text in welcome_texts:
                elements = self.driver.find_elements(By.XPATH, f"//*[contains(text(), '{text}')]")
                if elements:
                    print(f"✅ Found: {text}")
                    found_welcome = True
            
            if found_welcome:
                self.test_results['welcome_screen'] = True
            else:
                print("❌ Welcome screen not found")
                self.test_results['welcome_screen'] = False
            
            # Test mascot
            mascot_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '🐄') or contains(text(), 'Chambito')]")
            if mascot_elements:
                print("✅ Chambito mascot detected")
                self.test_results['mascot'] = True
            else:
                print("❌ Mascot not found")
                self.test_results['mascot'] = False
                
        except Exception as e:
            print(f"❌ Error testing welcome screen: {e}")
            self.test_results['welcome_screen'] = False
            self.test_results['mascot'] = False
    
    def test_navigation(self):
        """Test navigation between screens"""
        print("\n🧭 Testing Navigation")
        print("-" * 30)
        
        try:
            # Look for navigation elements
            nav_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Register') or contains(text(), 'Login') or contains(text(), 'Get Started')]")
            if nav_elements:
                print(f"✅ Found {len(nav_elements)} navigation elements")
                self.test_results['navigation'] = True
                
                # Try clicking on register/login buttons
                for element in nav_elements:
                    try:
                        print(f"🖱️ Clicking: {element.text}")
                        element.click()
                        time.sleep(3)
                        break
                    except:
                        continue
            else:
                print("❌ Navigation elements not found")
                self.test_results['navigation'] = False
                
        except Exception as e:
            print(f"❌ Error testing navigation: {e}")
            self.test_results['navigation'] = False
    
    def test_forms(self):
        """Test form elements"""
        print("\n📝 Testing Forms")
        print("-" * 30)
        
        try:
            # Look for form inputs
            email_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
            password_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            text_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
            
            if email_inputs or password_inputs or text_inputs:
                print(f"✅ Found form inputs: {len(email_inputs)} email, {len(password_inputs)} password, {len(text_inputs)} text")
                self.test_results['forms'] = True
                
                # Test filling forms
                if email_inputs:
                    email_inputs[0].send_keys("test@currijobs.com")
                    print("📧 Email entered: test@currijobs.com")
                
                if password_inputs:
                    password_inputs[0].send_keys("TestPassword123!")
                    print("🔒 Password entered: TestPassword123!")
                    
            else:
                print("❌ No form inputs found")
                self.test_results['forms'] = False
                
        except Exception as e:
            print(f"❌ Error testing forms: {e}")
            self.test_results['forms'] = False
    
    def test_ui_elements(self):
        """Test UI elements"""
        print("\n🎨 Testing UI Elements")
        print("-" * 30)
        
        try:
            # Look for buttons
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            if buttons:
                print(f"✅ Found {len(buttons)} buttons")
                self.test_results['ui_elements'] = True
            else:
                print("❌ No buttons found")
                self.test_results['ui_elements'] = False
                
            # Look for text elements
            text_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Task') or contains(text(), 'Create') or contains(text(), 'Offer')]")
            if text_elements:
                print(f"✅ Found {len(text_elements)} text elements")
            else:
                print("⚠️ No task-related text found")
                
        except Exception as e:
            print(f"❌ Error testing UI elements: {e}")
            self.test_results['ui_elements'] = False
    
    def run_test(self):
        """Run the complete test"""
        print("🚀 CurriJobs Web App Test")
        print("=" * 50)
        
        # Setup driver
        self.setup_driver()
        
        # Load the app
        if not self.wait_for_app_to_load():
            print("❌ Could not load the app")
            self.driver.quit()
            return
        
        # Take initial screenshot
        self.driver.save_screenshot("test-automation/web_app_initial.png")
        print("📸 Initial screenshot saved")
        
        # Run tests
        self.test_welcome_screen()
        self.test_navigation()
        self.test_forms()
        self.test_ui_elements()
        
        # Print results
        self.print_results()
        
        # Take final screenshot
        self.driver.save_screenshot("test-automation/web_app_final.png")
        print("📸 Final screenshot saved")
        
        self.driver.quit()
    
    def print_results(self):
        """Print test results"""
        print("\n📊 Test Results")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print(f"\n📈 Overall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed! CurriJobs web app is working!")
        else:
            print("⚠️ Some tests failed. Check the web app implementation.")

def main():
    test = CurriJobsWebTest()
    test.run_test()

if __name__ == "__main__":
    main()
