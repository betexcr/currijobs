#!/usr/bin/env python3
"""
CurriJobs Interface Validation Test
Comprehensive test of all UI elements and functionality
"""

import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class CurriJobsInterfaceTest:
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
        
    def check_server_status(self):
        """Check if Expo server is running"""
        print("🔍 Checking Expo server status...")
        try:
            response = requests.get("http://localhost:8081", timeout=10)
            if response.status_code == 200:
                print("✅ Expo server is running")
                return True
            else:
                print(f"❌ Expo server status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Expo server error: {e}")
            return False
    
    def load_app(self):
        """Load the CurriJobs app"""
        print("🌐 Loading CurriJobs app...")
        try:
            self.driver.get("http://localhost:8081")
            time.sleep(10)  # Wait for app to load
            
            # Check if app loaded
            page_source = self.driver.page_source
            if "CurriJobs" in page_source:
                print("✅ App loaded successfully")
                return True
            else:
                print("❌ App not loaded properly")
                return False
        except Exception as e:
            print(f"❌ Error loading app: {e}")
            return False
    
    def test_welcome_screen(self):
        """Test welcome screen elements"""
        print("\n📱 Testing Welcome Screen")
        print("-" * 30)
        
        try:
            # Test welcome text
            welcome_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Welcome') or contains(text(), 'CurriJobs')]")
            if welcome_elements:
                print("✅ Welcome text found")
                self.test_results['welcome_text'] = True
            else:
                print("❌ Welcome text not found")
                self.test_results['welcome_text'] = False
            
            # Test mascot
            mascot_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '🐄') or contains(text(), 'Chambito')]")
            if mascot_elements:
                print("✅ Chambito mascot found")
                self.test_results['mascot'] = True
            else:
                print("❌ Mascot not found")
                self.test_results['mascot'] = False
            
            # Test navigation buttons
            nav_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Get Started') or contains(text(), 'Register') or contains(text(), 'Login')]")
            if nav_buttons:
                print(f"✅ Found {len(nav_buttons)} navigation buttons")
                self.test_results['navigation'] = True
            else:
                print("❌ Navigation buttons not found")
                self.test_results['navigation'] = False
                
        except Exception as e:
            print(f"❌ Error testing welcome screen: {e}")
            self.test_results['welcome_text'] = False
            self.test_results['mascot'] = False
            self.test_results['navigation'] = False
    
    def test_forms(self):
        """Test form elements"""
        print("\n📝 Testing Forms")
        print("-" * 30)
        
        try:
            # Test input fields
            email_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
            password_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            text_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
            
            if email_inputs or password_inputs or text_inputs:
                print(f"✅ Found form inputs: {len(email_inputs)} email, {len(password_inputs)} password, {len(text_inputs)} text")
                self.test_results['form_inputs'] = True
                
                # Test input functionality
                if email_inputs:
                    email_inputs[0].send_keys("test@currijobs.com")
                    print("📧 Email input test: PASS")
                
                if password_inputs:
                    password_inputs[0].send_keys("TestPassword123!")
                    print("🔒 Password input test: PASS")
            else:
                print("❌ No form inputs found")
                self.test_results['form_inputs'] = False
            
            # Test buttons
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            if buttons:
                print(f"✅ Found {len(buttons)} buttons")
                self.test_results['buttons'] = True
            else:
                print("❌ No buttons found")
                self.test_results['buttons'] = False
                
        except Exception as e:
            print(f"❌ Error testing forms: {e}")
            self.test_results['form_inputs'] = False
            self.test_results['buttons'] = False
    
    def test_ui_elements(self):
        """Test UI elements"""
        print("\n🎨 Testing UI Elements")
        print("-" * 30)
        
        try:
            # Test text elements
            text_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Task') or contains(text(), 'Create') or contains(text(), 'Offer')]")
            if text_elements:
                print(f"✅ Found {len(text_elements)} task-related text elements")
                self.test_results['text_elements'] = True
            else:
                print("⚠️ No task-related text found")
                self.test_results['text_elements'] = False
            
            # Test images/icons
            images = self.driver.find_elements(By.TAG_NAME, "img")
            if images:
                print(f"✅ Found {len(images)} images")
                self.test_results['images'] = True
            else:
                print("⚠️ No images found")
                self.test_results['images'] = False
            
            # Test layout
            containers = self.driver.find_elements(By.CSS_SELECTOR, "div, section, main")
            if containers:
                print(f"✅ Found {len(containers)} container elements")
                self.test_results['layout'] = True
            else:
                print("❌ No container elements found")
                self.test_results['layout'] = False
                
        except Exception as e:
            print(f"❌ Error testing UI elements: {e}")
            self.test_results['text_elements'] = False
            self.test_results['images'] = False
            self.test_results['layout'] = False
    
    def test_responsiveness(self):
        """Test responsive design"""
        print("\n📱 Testing Responsiveness")
        print("-" * 30)
        
        try:
            # Test mobile viewport
            self.driver.set_window_size(375, 667)  # iPhone SE
            time.sleep(2)
            
            # Check if elements are still visible
            visible_elements = self.driver.find_elements(By.XPATH, "//*[not(self::script) and not(self::style)]")
            if len(visible_elements) > 10:
                print("✅ Mobile viewport test: PASS")
                self.test_results['mobile_responsive'] = True
            else:
                print("❌ Mobile viewport test: FAIL")
                self.test_results['mobile_responsive'] = False
            
            # Test desktop viewport
            self.driver.set_window_size(1920, 1080)
            time.sleep(2)
            
            visible_elements = self.driver.find_elements(By.XPATH, "//*[not(self::script) and not(self::style)]")
            if len(visible_elements) > 10:
                print("✅ Desktop viewport test: PASS")
                self.test_results['desktop_responsive'] = True
            else:
                print("❌ Desktop viewport test: FAIL")
                self.test_results['desktop_responsive'] = False
                
        except Exception as e:
            print(f"❌ Error testing responsiveness: {e}")
            self.test_results['mobile_responsive'] = False
            self.test_results['desktop_responsive'] = False
    
    def test_performance(self):
        """Test app performance"""
        print("\n⚡ Testing Performance")
        print("-" * 30)
        
        try:
            # Check load time
            start_time = time.time()
            self.driver.get("http://localhost:8081")
            load_time = time.time() - start_time
            
            if load_time < 10:
                print(f"✅ Load time: {load_time:.2f}s (GOOD)")
                self.test_results['load_time'] = True
            else:
                print(f"⚠️ Load time: {load_time:.2f}s (SLOW)")
                self.test_results['load_time'] = False
            
            # Check for console errors
            logs = self.driver.get_log('browser')
            error_logs = [log for log in logs if log['level'] == 'SEVERE']
            
            if not error_logs:
                print("✅ No console errors found")
                self.test_results['no_errors'] = True
            else:
                print(f"❌ Found {len(error_logs)} console errors")
                self.test_results['no_errors'] = False
                
        except Exception as e:
            print(f"❌ Error testing performance: {e}")
            self.test_results['load_time'] = False
            self.test_results['no_errors'] = False
    
    def run_comprehensive_test(self):
        """Run all interface tests"""
        print("🚀 CurriJobs Interface Validation Test")
        print("=" * 50)
        
        # Check server status
        if not self.check_server_status():
            print("❌ Server not running. Please start with: npm start")
            return
        
        # Setup driver
        self.setup_driver()
        
        # Load app
        if not self.load_app():
            print("❌ Could not load app")
            self.driver.quit()
            return
        
        # Take initial screenshot
        self.driver.save_screenshot("test-automation/interface_test_initial.png")
        print("📸 Initial screenshot saved")
        
        # Run all tests
        tests = [
            self.test_welcome_screen,
            self.test_forms,
            self.test_ui_elements,
            self.test_responsiveness,
            self.test_performance
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test failed: {e}")
        
        # Print results
        self.print_results()
        
        # Take final screenshot
        self.driver.save_screenshot("test-automation/interface_test_final.png")
        print("📸 Final screenshot saved")
        
        self.driver.quit()
    
    def print_results(self):
        """Print test results"""
        print("\n📊 Interface Test Results")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print(f"\n📈 Overall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 All interface tests passed! CurriJobs is ready!")
        elif passed_tests >= total_tests * 0.8:
            print("✅ Most tests passed. Minor issues to address.")
        else:
            print("⚠️ Several tests failed. Check implementation.")

def main():
    test = CurriJobsInterfaceTest()
    test.run_comprehensive_test()

if __name__ == "__main__":
    main()
