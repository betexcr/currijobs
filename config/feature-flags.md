# CurriJobs Feature Flags Configuration

## Overview
The app uses a comprehensive feature flag system that can be controlled via environment variables. This allows easy switching between demo and production modes.

## Environment Variables

### Demo Mode
```bash
# Set to true for demo mode (default)
DEMO_MODE=true

# Set to false for production
DEMO_MODE=false
```

### Database Configuration
```bash
# Use Supabase (only when DEMO_MODE=false)
USE_SUPABASE=false

# Use mock data (default when DEMO_MODE=true)
USE_MOCK_DATA=true
```

### Feature Flags
```bash
# User Features
ENABLE_USER_RATINGS=true
ENABLE_WALLET=true
ENABLE_USER_PROFILES=true
ENABLE_REVIEWS=true

# App Features
ENABLE_NOTIFICATIONS=true
ENABLE_PAYMENTS=true
ENABLE_LOCATION_SERVICES=true
ENABLE_PUSH_NOTIFICATIONS=true
```

### UI/UX Features
```bash
ENABLE_ANIMATIONS=true
ENABLE_DARK_MODE=true
ENABLE_COLORBLIND_MODE=true
ENABLE_MULTI_LANGUAGE=true
```

### Development Features
```bash
ENABLE_DEBUG_MODE=false
ENABLE_LOGGING=true
ENABLE_PERFORMANCE_MONITORING=false
```

### Testing Features
```bash
ENABLE_TEST_MODE=false
ENABLE_MOCK_LOCATION=true
```

## Usage Examples

### Demo Mode (Default)
```bash
DEMO_MODE=true
USE_SUPABASE=false
USE_MOCK_DATA=true
```

### Production Mode
```bash
DEMO_MODE=false
USE_SUPABASE=true
USE_MOCK_DATA=false
```

### Development with Real Database
```bash
DEMO_MODE=false
USE_SUPABASE=true
USE_MOCK_DATA=false
```

## How to Use

1. **For Demo Mode**: No configuration needed - runs by default
2. **For Production**: Set `DEMO_MODE=false` and configure Supabase
3. **For Development**: Modify individual feature flags as needed

## Current Status
✅ **App is running in Demo Mode**
- All features work with mock data
- No network dependencies
- Perfect for development and testing

