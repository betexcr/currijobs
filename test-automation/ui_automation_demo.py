#!/usr/bin/env python3
"""
CurriJobs UI Automation Demo
Automated demonstration of all app features including Get Started button
"""

import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import webbrowser

class CurriJobsUIDemo:
    def __init__(self):
        self.driver = None
        self.demo_results = {}
        
    def setup_driver(self):
        """Setup Chrome driver for demo"""
        options = Options()
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--start-maximized")
        options.add_argument("--disable-web-security")
        options.add_argument("--allow-running-insecure-content")
        
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
    
    def demo_welcome_screen(self):
        """Demo welcome screen with Get Started button"""
        print("\n📱 Demo: Welcome Screen")
        print("-" * 30)
        
        try:
            # Look for welcome elements
            welcome_texts = ["Welcome to CurriJobs", "CurriJobs", "Meet Chambito"]
            found_welcome = False
            
            for text in welcome_texts:
                elements = self.driver.find_elements(By.XPATH, f"//*[contains(text(), '{text}')]")
                if elements:
                    print(f"✅ Found: {text}")
                    found_welcome = True
            
            if found_welcome:
                self.demo_results['welcome_screen'] = True
            else:
                print("❌ Welcome screen not found")
                self.demo_results['welcome_screen'] = False
            
            # Look for Get Started button specifically
            get_started_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Get Started') or contains(text(), 'Get started')]")
            if get_started_buttons:
                print("✅ Get Started button found")
                self.demo_results['get_started_button'] = True
                
                # Try to click the Get Started button
                try:
                    get_started_buttons[0].click()
                    print("🖱️ Get Started button clicked")
                    time.sleep(3)
                except Exception as e:
                    print(f"⚠️ Could not click Get Started button: {e}")
            else:
                print("❌ Get Started button not found")
                self.demo_results['get_started_button'] = False
            
            # Look for mascot
            mascot_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '🐄') or contains(text(), 'Chambito')]")
            if mascot_elements:
                print("✅ Chambito mascot found")
                self.demo_results['mascot'] = True
            else:
                print("❌ Mascot not found")
                self.demo_results['mascot'] = False
                
        except Exception as e:
            print(f"❌ Error in welcome demo: {e}")
            self.demo_results['welcome_screen'] = False
            self.demo_results['get_started_button'] = False
            self.demo_results['mascot'] = False
    
    def demo_registration(self):
        """Demo user registration"""
        print("\n📝 Demo: User Registration")
        print("-" * 30)
        
        try:
            # Look for registration form
            email_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
            password_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            
            if email_inputs and password_inputs:
                print("✅ Registration form found")
                
                # Fill registration form
                email_inputs[0].send_keys("demo@currijobs.com")
                password_inputs[0].send_keys("DemoPassword123!")
                
                print("📧 Email: demo@currijobs.com")
                print("🔒 Password: DemoPassword123!")
                
                # Look for submit button
                submit_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Register') or contains(text(), 'Sign Up')]")
                if submit_buttons:
                    print("✅ Submit button found")
                    self.demo_results['registration'] = True
                else:
                    print("⚠️ Submit button not found")
                    self.demo_results['registration'] = False
            else:
                print("❌ Registration form not found")
                self.demo_results['registration'] = False
                
        except Exception as e:
            print(f"❌ Error in registration demo: {e}")
            self.demo_results['registration'] = False
    
    def demo_task_creation(self):
        """Demo task creation"""
        print("\n🔨 Demo: Task Creation")
        print("-" * 30)
        
        try:
            # Look for create task button
            create_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Create') or contains(text(), '+ Create')]")
            if create_buttons:
                print("✅ Create task button found")
                
                # Click create button
                create_buttons[0].click()
                print("🖱️ Create task button clicked")
                time.sleep(3)
                
                # Test task form
                title_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[placeholder*='title']")
                if title_inputs:
                    print("✅ Task creation form found")
                    title_inputs[0].send_keys("Demo Task - House Cleaning")
                    print("📝 Title: Demo Task - House Cleaning")
                
                # Test description field
                description_inputs = self.driver.find_elements(By.CSS_SELECTOR, "textarea")
                if description_inputs:
                    description_inputs[0].send_keys("Need help cleaning my apartment.")
                    print("📝 Description: Need help cleaning my apartment.")
                
                # Test reward field
                reward_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='number']")
                if reward_inputs:
                    reward_inputs[0].send_keys("25000")
                    print("💰 Reward: ₡25,000")
                
                self.demo_results['task_creation'] = True
                print("✅ Task creation demo completed")
            else:
                print("❌ Create task button not found")
                self.demo_results['task_creation'] = False
                
        except Exception as e:
            print(f"❌ Error in task creation demo: {e}")
            self.demo_results['task_creation'] = False
    
    def demo_offer_system(self):
        """Demo offer system"""
        print("\n💰 Demo: Offer System")
        print("-" * 30)
        
        try:
            # Look for offer-related elements
            offer_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Offer') or contains(text(), 'Make Offer')]")
            if offer_elements:
                print(f"✅ Found {len(offer_elements)} offer elements")
                self.demo_results['offer_system'] = True
            else:
                print("❌ Offer elements not found")
                self.demo_results['offer_system'] = False
            
            # Test task details
            task_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Task') or contains(text(), 'Details')]")
            if task_elements:
                print("✅ Task details found")
            
            # Test accept/reject buttons
            action_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Accept') or contains(text(), 'Reject')]")
            if action_buttons:
                print("✅ Accept/Reject buttons found")
            
        except Exception as e:
            print(f"❌ Error in offer system demo: {e}")
            self.demo_results['offer_system'] = False
    
    def demo_mascot_features(self):
        """Demo mascot features"""
        print("\n🐄 Demo: Mascot Features")
        print("-" * 30)
        
        try:
            # Test mascot presence
            mascot_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '🐄') or contains(text(), 'Chambito')]")
            if mascot_elements:
                print(f"✅ Found {len(mascot_elements)} mascot elements")
                self.demo_results['mascot_features'] = True
            else:
                print("❌ Mascot elements not found")
                self.demo_results['mascot_features'] = False
            
            # Test mascot messages
            mascot_messages = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Chambito') or contains(text(), 'mascot')]")
            if mascot_messages:
                print("✅ Mascot messages detected")
            
            # Test different mascot moods
            mood_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '🔨') or contains(text(), '🤔') or contains(text(), '✅')]")
            if mood_elements:
                print("✅ Mascot mood variations detected")
            
        except Exception as e:
            print(f"❌ Error in mascot demo: {e}")
            self.demo_results['mascot_features'] = False
    
    def run_automated_demo(self):
        """Run the complete automated demo"""
        print("🎬 CurriJobs UI Automation Demo")
        print("=" * 50)
        
        # Check Expo server
        if not self.check_expo_server():
            print("❌ Please start Expo server first: npm start")
            return
        
        # Setup driver
        self.setup_driver()
        
        # Load app
        if not self.load_app():
            print("❌ Could not load app")
            self.driver.quit()
            return
        
        # Take initial screenshot
        self.driver.save_screenshot("test-automation/demo_initial.png")
        print("📸 Initial screenshot saved")
        
        # Run all demos
        demos = [
            self.demo_welcome_screen,
            self.demo_registration,
            self.demo_task_creation,
            self.demo_offer_system,
            self.demo_mascot_features
        ]
        
        for demo in demos:
            try:
                demo()
            except Exception as e:
                print(f"❌ Demo failed: {e}")
        
        # Print results
        self.print_demo_results()
        
        # Take final screenshot
        self.driver.save_screenshot("test-automation/demo_final.png")
        print("📸 Final screenshot saved")
        
        self.driver.quit()
    
    def print_demo_results(self):
        """Print demo results"""
        print("\n📊 Demo Results")
        print("=" * 50)
        
        total_demos = len(self.demo_results)
        successful_demos = sum(1 for result in self.demo_results.values() if result)
        
        for demo_name, result in self.demo_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{demo_name.replace('_', ' ').title()}: {status}")
        
        print(f"\n📈 Overall: {successful_demos}/{total_demos} demos successful")
        
        if successful_demos == total_demos:
            print("🎉 All demos successful! CurriJobs UI is working perfectly!")
        elif successful_demos >= total_demos * 0.8:
            print("✅ Most demos successful. Minor issues to address.")
        else:
            print("⚠️ Several demos failed. Check the implementation.")

def main():
    demo = CurriJobsUIDemo()
    demo.run_automated_demo()

if __name__ == "__main__":
    main()
