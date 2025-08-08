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
npx expo start --clear
```

Launch options:
- iOS Simulator: press `i`
- Android Emulator: press `a`
- Physical device: open Expo Go and scan the QR code

## Features
- Task discovery by category and location
- Create and manage tasks with details and rewards
- Map-based exploration with nearby tasks
- Multi-language support: Spanish, English, Chinese
- Offline-friendly development mode using mock data

## Tech Stack
- React Native (Expo)
- TypeScript
- Expo Router for navigation
- React Native Maps for geolocation & maps
- AsyncStorage for local persistence
- Supabase (prepared; offline-first during development)

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
- Start: `npx expo start --clear`
- Lint: `npm run lint`
- Type-check: `npm run typecheck` (if configured)
- Format: `npm run format` (if configured)

Offline mode notes:
- Mock data is used for development to avoid backend dependencies.
- Switching to online mode will involve enabling Supabase calls and credentials.

## Testing & Quality
- ESLint and Prettier are used to maintain code quality and consistency.
- Add unit/integration tests as features evolve.

## Design & Theming
- Light/Dark theme support
- Accessible color palettes (including colorblind-friendly options)
- Modern, spacious UI with smooth transitions

## Localization
- Built-in translations for Spanish, English, and Chinese
- Language can be switched from settings

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