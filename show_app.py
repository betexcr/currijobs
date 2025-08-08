#!/usr/bin/env python3
"""
Show CurriJobs App Access
"""

import requests
import time
import webbrowser
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def check_expo_ports():
    """Check which ports Expo is using"""
    print("🔍 Checking Expo development server ports...")
    
    ports_to_check = [8081, 19006, 3000, 19000]
    
    for port in ports_to_check:
        try:
            response = requests.get(f"http://localhost:{port}", timeout=2)
            print(f"✅ Port {port}: {response.status_code}")
            if "CurriJobs" in response.text or "expo" in response.text.lower():
                print(f"🎯 Found Expo server on port {port}")
                return port
        except:
            print(f"❌ Port {port}: Not accessible")
    
    return None

def open_app_in_browser(port):
    """Open the app in browser"""
    print(f"\n🌐 Opening CurriJobs app in browser...")
    
    # Try different URL patterns
    urls = [
        f"http://localhost:{port}",
        f"http://localhost:{port}/",
        f"http://127.0.0.1:{port}",
    ]
    
    for url in urls:
        try:
            print(f"🔗 Trying: {url}")
            webbrowser.open(url)
            time.sleep(2)
            break
        except Exception as e:
            print(f"❌ Error opening {url}: {e}")

def show_manual_instructions():
    """Show manual instructions"""
    print("\n📱 MANUAL ACCESS INSTRUCTIONS:")
    print("=" * 50)
    print("1. Make sure Expo server is running:")
    print("   npm start")
    print()
    print("2. Open your browser and try these URLs:")
    print("   - http://localhost:8081")
    print("   - http://localhost:19006")
    print("   - http://localhost:3000")
    print()
    print("3. For mobile testing:")
    print("   - Install Expo Go app")
    print("   - Scan the QR code from terminal")
    print()
    print("4. If you see JSON manifest instead of app:")
    print("   - Try adding /web to the URL")
    print("   - Or use: npx expo start --web")
    print()

def main():
    print("🚀 CurriJobs App Access Helper")
    print("=" * 40)
    
    # Check ports
    port = check_expo_ports()
    
    if port:
        print(f"\n✅ Found Expo server on port {port}")
        open_app_in_browser(port)
    else:
        print("\n❌ No Expo server found")
        print("Please run: npm start")
    
    show_manual_instructions()

if __name__ == "__main__":
    main()
