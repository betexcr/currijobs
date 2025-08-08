#!/usr/bin/env python3
"""
Simple CurriJobs Test Suite
Tests basic functionality of the CurriJobs app
"""

import requests
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_expo_server():
    """Test if Expo development server is running"""
    print("🧪 Test 1: Expo Server Status")
    try:
        response = requests.get("http://localhost:8081", timeout=5)
        if response.status_code == 200:
            print("✅ Expo server is running on port 8081")
            return True
        else:
            print(f"❌ Expo server returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Expo server is not running: {e}")
        return False

def test_web_interface():
    """Test the web interface using Selenium"""
    print("\n🧪 Test 2: Web Interface")
    try:
        # Setup Chrome driver
        options = Options()
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        driver = webdriver.Chrome(options=options)
        wait = WebDriverWait(driver, 10)
        
        # Navigate to the app (try different URLs)
        urls_to_try = [
            "http://localhost:8081",
            "http://localhost:19006",  # Expo web port
            "http://localhost:3000",   # Alternative web port
        ]
        
        app_loaded = False
        for url in urls_to_try:
            try:
                print(f"🌐 Trying URL: {url}")
                driver.get(url)
                time.sleep(3)
                
                page_source = driver.page_source
                if "CurriJobs" in page_source or "Login" in page_source or "Welcome" in page_source:
                    print(f"✅ App loaded successfully from {url}")
                    app_loaded = True
                    break
                else:
                    print(f"❌ No app content found at {url}")
            except Exception as e:
                print(f"❌ Error accessing {url}: {e}")
        
        if not app_loaded:
            print("❌ Could not load app from any URL")
            driver.quit()
            return False
        
        # Check if app loaded
        page_source = driver.page_source
        print(f"📄 Page title: {driver.title}")
        print(f"📄 Page URL: {driver.current_url}")
        
        # Look for key elements
        if "CurriJobs" in page_source or "Login" in page_source or "Welcome" in page_source:
            print("✅ App interface loaded successfully")
            
            # Take a screenshot
            driver.save_screenshot("test-automation/app_screenshot.png")
            print("📸 Screenshot saved as app_screenshot.png")
            
            driver.quit()
            return True
        else:
            print("❌ App interface failed to load properly")
            driver.quit()
            return False
            
    except Exception as e:
        print(f"❌ Error testing web interface: {e}")
        return False

def test_supabase_connection():
    """Test Supabase connection"""
    print("\n🧪 Test 3: Supabase Connection")
    try:
        # Test Supabase REST API
        url = "https://fpvrlhubpwrslsuopuwr.supabase.co/rest/v1/tasks"
        headers = {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ Supabase connection successful")
            data = response.json()
            print(f"📊 Found {len(data)} tasks in database")
            return True
        else:
            print(f"❌ Supabase connection failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Supabase connection: {e}")
        return False

def test_app_structure():
    """Test app file structure and components"""
    print("\n🧪 Test 4: App Structure")
    try:
        import os
        
        required_files = [
            "../app/index.tsx",
            "../app/login.tsx", 
            "../app/register.tsx",
            "../app/create-task.tsx",
            "../app/task/[id].tsx",
            "../app/make-offer.tsx",
            "../app/welcome.tsx",
            "../components/ChambitoMascot.tsx",
            "../contexts/AuthContext.tsx",
            "../lib/supabase.ts",
            "../lib/database.ts",
            "../package.json",
            "../app.json"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not os.path.exists(file_path):
                missing_files.append(file_path)
        
        if len(missing_files) == 0:
            print("✅ All required files present")
            return True
        else:
            print(f"❌ Missing files: {missing_files}")
            return False
            
    except Exception as e:
        print(f"❌ Error checking app structure: {e}")
        return False

def run_demo():
    """Run a live demo of the app"""
    print("\n🎬 Live Demo Mode")
    print("=" * 50)
    
    print("📱 Starting CurriJobs Demo...")
    print("🌐 Opening web interface...")
    
    try:
        # Setup Chrome driver for demo
        options = Options()
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--start-maximized")
        
        driver = webdriver.Chrome(options=options)
        
        # Navigate to app
        driver.get("http://localhost:8081")
        print("✅ App loaded in browser")
        
        # Wait for user to interact
        print("\n🎯 Demo Instructions:")
        print("1. The app should now be open in your browser")
        print("2. You can interact with the app manually")
        print("3. Try registering a new user or logging in")
        print("4. Create a task and test the functionality")
        print("5. Press Enter in this terminal when done...")
        
        input("Press Enter to close the demo...")
        
        driver.quit()
        print("✅ Demo completed")
        
    except Exception as e:
        print(f"❌ Error in demo: {e}")

def main():
    """Run all tests"""
    print("🚀 CurriJobs Automated Testing Suite")
    print("=" * 50)
    
    tests = [
        test_expo_server,
        test_web_interface,
        test_supabase_connection,
        test_app_structure,
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
        print("🎉 All tests passed! CurriJobs is ready!")
        print("\n🎬 Would you like to run a live demo? (y/n)")
        if input().lower() == 'y':
            run_demo()
    else:
        print("⚠️ Some tests failed. Check the logs above for details.")

if __name__ == "__main__":
    main()
