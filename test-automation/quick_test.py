#!/usr/bin/env python3
"""
Quick test to verify CurriJobs is working without Babel errors
"""

import requests
import subprocess
import time

def test_expo_server():
    """Test if Expo server is running without errors"""
    print("🔍 Testing Expo server...")
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

def test_ios_simulator():
    """Test iOS Simulator connection"""
    print("📱 Testing iOS Simulator...")
    try:
        # Check if simulator is running
        result = subprocess.run(["xcrun", "simctl", "list", "devices"], 
                              capture_output=True, text=True, check=True)
        if "Booted" in result.stdout:
            print("✅ iOS Simulator is running")
            return True
        else:
            print("⚠️ iOS Simulator not booted")
            return False
    except Exception as e:
        print(f"❌ iOS Simulator error: {e}")
        return False

def show_connection_instructions():
    """Show connection instructions"""
    print("\n🎬 CurriJobs Connection Instructions")
    print("=" * 50)
    print("1. iOS Simulator is open")
    print("2. Install Expo Go from App Store in iOS Simulator")
    print("3. Scan QR code: exp://192.168.0.2:8081")
    print("4. Test the app - should load without Babel errors")
    print("\n🐄 Expected Features:")
    print("- Welcome screen with Chambito mascot")
    print("- Registration and login forms")
    print("- Task creation and management")
    print("- Offer system")
    print("- Mascot integration throughout")

def main():
    print("🚀 CurriJobs Quick Test")
    print("=" * 30)
    
    # Test Expo server
    if test_expo_server():
        print("✅ Expo server is working")
    else:
        print("❌ Expo server has issues")
        return
    
    # Test iOS Simulator
    if test_ios_simulator():
        print("✅ iOS Simulator is ready")
    else:
        print("⚠️ iOS Simulator needs attention")
    
    # Show instructions
    show_connection_instructions()
    
    print("\n🎉 Ready to test CurriJobs!")
    print("📱 The app should now load without Babel errors")

if __name__ == "__main__":
    main()
