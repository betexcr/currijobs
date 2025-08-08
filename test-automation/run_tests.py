#!/usr/bin/env python3
"""
Quick test runner for CurriJobs
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def run_tests():
    """Run the test suite"""
    print("🧪 Running CurriJobs test suite...")
    try:
        subprocess.check_call([sys.executable, "simple_test.py"])
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Tests failed: {e}")
        return False

def main():
    """Main function"""
    print("🚀 CurriJobs Test Runner")
    print("=" * 40)
    
    # Change to test-automation directory
    os.chdir("test-automation")
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Cannot continue without dependencies")
        return
    
    # Run tests
    run_tests()

if __name__ == "__main__":
    main()
