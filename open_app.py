#!/usr/bin/env python3
"""
Open CurriJobs App in Browser
"""

import webbrowser
import time
import requests

def open_currijobs_app():
    """Open the CurriJobs app in browser"""
    print("🚀 Opening CurriJobs App")
    print("=" * 40)
    
    # The Expo development server is running on port 8081
    # To see the actual app, we need to access it through the web interface
    base_url = "http://localhost:8081"
    
    print(f"🌐 Expo server is running at: {base_url}")
    print("📱 This serves the app manifest and development tools")
    
    # Try to open the web interface
    print("\n🎯 Opening web interface...")
    webbrowser.open(base_url)
    
    print("\n📋 INSTRUCTIONS:")
    print("1. You should see the Expo development interface")
    print("2. Look for a 'Web' button or tab")
    print("3. Click it to open the actual CurriJobs app")
    print("4. Or try these URLs manually:")
    print("   - http://localhost:8081")
    print("   - http://localhost:19006 (if available)")
    
    # Also try to start the web version
    print("\n🔄 Starting web version...")
    import subprocess
    try:
        subprocess.Popen(["npx", "expo", "start", "--web"], 
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        print("✅ Web version started in background")
        time.sleep(3)
        webbrowser.open("http://localhost:19006")
    except Exception as e:
        print(f"❌ Could not start web version: {e}")

def show_mobile_instructions():
    """Show mobile testing instructions"""
    print("\n📱 MOBILE TESTING:")
    print("=" * 30)
    print("1. Install Expo Go app on your phone")
    print("2. Scan the QR code from the terminal")
    print("3. The app will load on your mobile device")
    print("4. Test all features with the mascot!")

def main():
    print("🎬 CurriJobs App Demo")
    print("=" * 40)
    
    # Check if Expo server is running
    try:
        response = requests.get("http://localhost:8081", timeout=2)
        if response.status_code == 200:
            print("✅ Expo server is running")
            open_currijobs_app()
        else:
            print("❌ Expo server not responding")
    except:
        print("❌ Expo server not running")
        print("Please run: npm start")
        return
    
    show_mobile_instructions()
    
    print("\n🎯 NEXT STEPS:")
    print("1. Open the app in browser or mobile")
    print("2. Register a new user account")
    print("3. Create your first task")
    print("4. Test the mascot interactions")
    print("5. Try the offer system")

if __name__ == "__main__":
    main()
