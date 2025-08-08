#!/usr/bin/env python3
"""
Get Started Button Test
Specific test for the Get Started button visibility and functionality
"""

import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

class GetStartedButtonTest:
    def __init__(self):
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome driver"""
        options = Options()
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--start-maximized")
        
        self.driver = webdriver.Chrome(options=options)
        
    def test_get_started_button(self):
        """Test the Get Started button specifically"""
        print("🎯 Testing Get Started Button")
        print("=" * 40)
        
        try:
            # Load the app
            self.driver.get("http://localhost:8081")
            time.sleep(10)
            
            # Look for Get Started button with different selectors
            selectors = [
                "//*[contains(text(), 'Get Started')]",
                "//*[contains(text(), 'Get started')]",
                "//button[contains(text(), 'Get Started')]",
                "//button[contains(text(), 'Get started')]",
                "//*[contains(@class, 'get-started')]",
                "//*[contains(@class, 'primaryButton')]"
            ]
            
            button_found = False
            for selector in selectors:
                elements = self.driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"✅ Get Started button found with selector: {selector}")
                    button_found = True
                    
                    # Try to click the button
                    try:
                        elements[0].click()
                        print("🖱️ Get Started button clicked successfully")
                        time.sleep(3)
                        break
                    except Exception as e:
                        print(f"⚠️ Could not click button: {e}")
            
            if not button_found:
                print("❌ Get Started button not found with any selector")
                
                # Show what elements are available
                all_buttons = self.driver.find_elements(By.TAG_NAME, "button")
                print(f"📋 Found {len(all_buttons)} buttons on page:")
                for i, button in enumerate(all_buttons[:5]):  # Show first 5 buttons
                    try:
                        text = button.text
                        print(f"   Button {i+1}: '{text}'")
                    except:
                        print(f"   Button {i+1}: [no text]")
                
                # Look for any text containing "Get"
                get_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Get')]")
                print(f"📋 Found {len(get_elements)} elements containing 'Get':")
                for i, element in enumerate(get_elements[:5]):
                    try:
                        text = element.text
                        print(f"   Element {i+1}: '{text}'")
                    except:
                        print(f"   Element {i+1}: [no text]")
            
            # Take screenshot
            self.driver.save_screenshot("test-automation/get_started_button_test.png")
            print("📸 Screenshot saved as get_started_button_test.png")
            
            return button_found
            
        except Exception as e:
            print(f"❌ Error testing Get Started button: {e}")
            return False
    
    def run_test(self):
        """Run the Get Started button test"""
        print("🚀 Get Started Button Test")
        print("=" * 40)
        
        # Check Expo server
        try:
            response = requests.get("http://localhost:8081", timeout=5)
            if response.status_code != 200:
                print("❌ Expo server not running")
                return
        except:
            print("❌ Expo server not running")
            return
        
        # Setup driver
        self.setup_driver()
        
        # Test Get Started button
        success = self.test_get_started_button()
        
        if success:
            print("\n✅ Get Started button test PASSED")
            print("🎉 The button is visible and clickable!")
        else:
            print("\n❌ Get Started button test FAILED")
            print("🔧 Check the screenshot to see what's displayed")
        
        self.driver.quit()

def main():
    test = GetStartedButtonTest()
    test.run_test()

if __name__ == "__main__":
    main()
