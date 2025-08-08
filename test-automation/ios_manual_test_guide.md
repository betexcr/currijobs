# CurriJobs iOS Simulator Manual Test Guide

## 🚀 Setup Instructions

### 1. Start Expo Server
```bash
npm start
```

### 2. Open iOS Simulator
```bash
open -a Simulator
```

### 3. Install Expo Go
- Open App Store in the iOS Simulator
- Search for "Expo Go"
- Install the app

### 4. Connect to App
- Look for the QR code in your terminal
- Scan it with the Camera app in iOS Simulator
- Or manually enter: `exp://192.168.0.2:8081`

## 📱 Test Cases

### ✅ Test 1: Welcome Screen
**Expected Result:** Should see welcome screen with Chambito mascot
- [ ] Welcome message displays
- [ ] Chambito mascot (🐄) is visible
- [ ] "Get Started" button works
- [ ] "I already have an account" button works

### ✅ Test 2: User Registration
**Expected Result:** Should be able to create new account
- [ ] Registration form loads
- [ ] Email field accepts input
- [ ] Password field accepts input
- [ ] Submit button works
- [ ] Success message shows

### ✅ Test 3: User Login
**Expected Result:** Should be able to login with existing account
- [ ] Login form loads
- [ ] Email field accepts input
- [ ] Password field accepts input
- [ ] Submit button works
- [ ] Success message shows

### ✅ Test 4: Task Creation
**Expected Result:** Should be able to create new tasks
- [ ] "Create Task" button works
- [ ] Task form loads
- [ ] Title field accepts input
- [ ] Description field accepts input
- [ ] Category selection works
- [ ] Reward field accepts input
- [ ] Submit button works
- [ ] Success message shows

### ✅ Test 5: Task List
**Expected Result:** Should see list of available tasks
- [ ] Task list loads
- [ ] Task details display correctly
- [ ] Task cards show title, description, reward
- [ ] Task status indicators work

### ✅ Test 6: Offer System
**Expected Result:** Should be able to make offers on tasks
- [ ] "Make Offer" button works
- [ ] Offer form loads
- [ ] Amount field accepts input
- [ ] Message field accepts input
- [ ] Submit button works
- [ ] Success message shows

### ✅ Test 7: Task Management
**Expected Result:** Should be able to manage tasks
- [ ] Accept offer button works
- [ ] Reject offer button works
- [ ] Mark as completed button works
- [ ] Task status updates correctly

### ✅ Test 8: Mascot Integration
**Expected Result:** Chambito mascot should appear throughout the app
- [ ] Mascot appears on welcome screen
- [ ] Mascot appears on task creation
- [ ] Mascot appears on success messages
- [ ] Mascot mood changes appropriately

## 🐄 Mascot Features to Test

### Welcome Screen
- [ ] Large Chambito mascot (🐄) displays
- [ ] Welcome message with mascot personality
- [ ] "Ready to get started?" message

### Task Creation
- [ ] Mascot in header during task creation
- [ ] Success message includes mascot personality
- [ ] "Chambito will notify the task owner" message

### Task Details
- [ ] Mascot appears in task detail headers
- [ ] Mascot mood changes based on context
- [ ] Mascot messages for different actions

### Offer System
- [ ] Mascot appears in offer submission
- [ ] Success messages include mascot
- [ ] Mascot notifications for offers

## 📊 Test Results Checklist

### Phase I: Authentication ✅
- [ ] User registration works
- [ ] User login works
- [ ] Session management works

### Phase II: Task Management ✅
- [ ] Task creation works
- [ ] Task listing works
- [ ] Task details display correctly

### Phase III: Offer System ✅
- [ ] Offer submission works
- [ ] Offer acceptance works
- [ ] Offer rejection works
- [ ] Task status updates

### Mascot Integration ✅
- [ ] Mascot appears on all screens
- [ ] Mascot mood changes appropriately
- [ ] Mascot messages are contextual

## 🎯 Quick Test Commands

### Start Testing
```bash
# Terminal 1: Start Expo
npm start

# Terminal 2: Open iOS Simulator
open -a Simulator

# Terminal 3: Run automated tests
python test-automation/web_app_test.py
```

### Check App Status
```bash
# Check if Expo is running
curl http://localhost:8081

# Check if web app is available
curl http://localhost:19006
```

## 📸 Screenshots

Take screenshots of:
1. Welcome screen with mascot
2. Registration form
3. Login form
4. Task creation form
5. Task list
6. Offer submission
7. Task details with offers
8. Success messages with mascot

## 🐛 Known Issues

1. **Babel Configuration**: Fixed with `['module:react-native-dotenv']`
2. **Splash Image**: Fixed to use `splash-icon.png`
3. **Web App Loading**: May need to click "Web" button in Expo interface

## ✅ Success Criteria

All tests should pass with:
- [ ] No crashes or errors
- [ ] All forms work correctly
- [ ] Navigation between screens works
- [ ] Mascot appears consistently
- [ ] Database operations work (if Supabase is configured)
- [ ] UI is responsive and user-friendly

## 🎉 Completion Checklist

- [ ] All test cases pass
- [ ] Screenshots taken
- [ ] No console errors
- [ ] App runs smoothly
- [ ] All features functional
- [ ] Mascot integration complete
- [ ] Ready for Phase IV (Maps & Geo Discovery)
