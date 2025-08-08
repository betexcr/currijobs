#!/usr/bin/env python3
"""
Test CurriJobs App Access
"""

import requests
import time
import webbrowser
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def test_app_access():
    """Test if the app is accessible"""
    print("🧪 Testing CurriJobs App Access")
    print("=" * 40)
    
    # Test different URLs
    test_urls = [
        "http://localhost:8081",
        "http://localhost:19006", 
        "http://localhost:3000",
        "http://127.0.0.1:8081",
    ]
    
    for url in test_urls:
        try:
            print(f"\n🌐 Testing: {url}")
            response = requests.get(url, timeout=5)
            print(f"✅ Status: {response.status_code}")
            
            # Check if it's the app or just manifest
            content = response.text
            if "CurriJobs" in content and "Login" in content:
                print("🎉 Found the actual app!")
                return url
            elif "expo" in content.lower() and "manifest" in content.lower():
                print("📄 This is the Expo manifest (not the app)")
            else:
                print("❓ Unknown content")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    return None

def open_app_in_browser(url):
    """Open the app in browser with Selenium"""
    print(f"\n🎬 Opening app in browser: {url}")
    
    try:
        options = Options()
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--start-maximized")
        
        driver = webdriver.Chrome(options=options)
        driver.get(url)
        
        print("✅ Browser opened successfully")
        print("📱 You should now see the CurriJobs app!")
        print("\n🎯 Try these actions:")
        print("1. Register a new user")
        print("2. Login with existing credentials") 
        print("3. Create a task")
        print("4. Browse available tasks")
        print("5. Test the mascot interactions")
        
        input("\nPress Enter when done testing...")
        driver.quit()
        
    except Exception as e:
        print(f"❌ Error opening browser: {e}")

def main():
    print("🚀 CurriJobs App Access Test")
    print("=" * 40)
    
    # Test app access
    app_url = test_app_access()
    
    if app_url:
        print(f"\n✅ App found at: {app_url}")
        
        # Open in browser
        response = input("\n🎬 Open app in browser? (y/n): ")
        if response.lower() == 'y':
            open_app_in_browser(app_url)
    else:
        print("\n❌ Could not find the app")
        print("Please make sure Expo server is running:")
        print("npm start")
        print("\nOr try:")
        print("npx expo start --web")

if __name__ == "__main__":
    main()
