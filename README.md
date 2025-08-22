<div align="center">

# CurriJobs

Connecting local service providers with customers in Costa Rica.

[![Made with Expo](https://img.shields.io/badge/Expo-6f4cff?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-61dafb?logo=react&logoColor=000)](https://reactnative.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

### Overview
CurriJobs is a mobile app that helps customers discover, post, and manage small jobs while enabling local workers to find nearby opportunities. The app is built with Expo, React Native, and TypeScript, with a clean design and multi-language support.

### Table of Contents
- Getting Started
- Features
- Tech Stack
- Project Structure
- Development
- Remote Testing
- Testing & Quality
- Design & Theming
- Localization
- Roadmap
- Contributing
- License

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation
```bash
git clone <repository-url>
cd currijobs
npm install --legacy-peer-deps
npx expo start --tunnel
```

### Launch Options
- **iOS Simulator:** `npx expo start --ios`
- **Android Emulator:** `npx expo start --android`
- **Physical device:** Install Expo Go and scan the QR code
- **Remote testing:** Share the tunnel URL with external users

## Features
- Task discovery by category and location
- Create and manage tasks with details and rewards
- Map-based exploration with nearby tasks
- Multi-language support: Spanish, English, Chinese
- Real-time Supabase integration for live data
- Remote access via secure tunnel
- **Cross-platform compatibility** - Works on iOS, Android, and web
- **Universal map support** - Google Maps on iOS, OSM tiles on Android
- **Data integrity** - Only shows real Supabase data, no orphaned local data

## Tech Stack
- React Native (Expo SDK 53)
- TypeScript
- Expo Router for navigation
- React Native Maps for geolocation & maps
- AsyncStorage for local persistence
- Supabase for backend services and real-time data

## Project Structure
```
currijobs/
├─ app/                # Screens and routes (Expo Router)
├─ components/         # Reusable UI components
├─ contexts/           # App contexts (Auth, Theme, Localization)
├─ lib/                # Utilities and services (db, theme, helpers)
└─ assets/             # Images and static assets
```

## Development

### Quick Start
```bash
# Start with tunnel for remote access
npx expo start --tunnel

# Start for local development
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Development Commands
- Start: `npx expo start --tunnel`
- Lint: `npm run lint`
- Type-check: `npm run validate:types`
- Format: `npm run format`

### Feature Flags
The app uses feature flags for configuration:
- `USE_SUPABASE: true` - Always fetch from Supabase (production ready)
- `DEMO_MODE: false` - Production mode enabled
- **NO MOCK DATA** - App only uses real Supabase data! 🚀
- **Data integrity enforced** - App never shows orphaned local data

## Remote Testing

### For External Users
Share this URL for remote testing:
```
https://aoc2uxw-betexcr-8081.exp.direct
```

### How to Test Remotely
1. **Install Expo Go** on the target device
2. **Open Expo Go** and tap "Enter URL"
3. **Paste the tunnel URL** above
4. **The app will load** with real Supabase data
5. **Maps work on all devices** - iOS uses Google Maps, Android uses OSM tiles

### For Simulators
```bash
# Boot simulators
xcrun simctl boot "iPhone 16 Pro"
xcrun simctl boot "iPad Pro 11-inch (M4)"

# Open app in simulators
xcrun simctl openurl <DEVICE_ID> "exp://aoc2uxw-betexcr-8081.exp.direct"
```

## Testing & Quality
- ESLint and Prettier maintain code quality
- Zero lint errors enforced for deployments
- TypeScript strict mode enabled
- Real-time Supabase integration tested
- **Cross-platform testing** - Verified on iOS, Android, and web
- **Map compatibility testing** - All Android devices supported

## Design & Theming
- Light/Dark theme support
- Accessible color palettes (including colorblind-friendly options)
- Modern, spacious UI with smooth transitions
- Responsive design for iPhone and iPad

## Localization
- Built-in translations for Spanish, English, and Chinese
- Language can be switched from settings
- RTL support ready

## Recent Achievements (August 2025)
- ✅ **Android Map Compatibility** - Fixed grey map issue on all Android devices
- ✅ **Motorola Support** - Added comprehensive device detection for Motorola, Huawei, Xiaomi, etc.
- ✅ **Data Integrity** - App only shows real Supabase data, no orphaned local tasks
- ✅ **Universal Map Support** - Google Maps on iOS, OSM tiles on Android
- ✅ **Expo Go Optimization** - All Android devices in Expo Go use OSM tiles automatically

## Roadmap
The detailed phase plan and progress tracking live in `phases.md`.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes with clear commits
4. Run linting/tests
5. Open a pull request

## License
MIT © CurriJobs