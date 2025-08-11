// Feature flags configuration
// These can be controlled via environment variables

interface FeatureFlags {
  // Demo Mode
  DEMO_MODE: boolean;
  
  // Database
  USE_SUPABASE: boolean;
  USE_MOCK_DATA: boolean;
  
  // Features
  ENABLE_USER_RATINGS: boolean;
  ENABLE_WALLET: boolean;
  ENABLE_USER_PROFILES: boolean;
  ENABLE_REVIEWS: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  ENABLE_PAYMENTS: boolean;
  ENABLE_LOCATION_SERVICES: boolean;
  ENABLE_PUSH_NOTIFICATIONS: boolean;
  
  // UI/UX
  ENABLE_ANIMATIONS: boolean;
  ENABLE_DARK_MODE: boolean;
  ENABLE_COLORBLIND_MODE: boolean;
  ENABLE_MULTI_LANGUAGE: boolean;
  // Navigation/UI toggles
  ENABLE_LIST_VIEW_LINK: boolean; // Show "List" link in bottom toolbar
  
  // Development
  ENABLE_DEBUG_MODE: boolean;
  ENABLE_LOGGING: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  
  // Testing
  ENABLE_TEST_MODE: boolean;
  ENABLE_MOCK_LOCATION: boolean;
}

// Default configuration
const DEFAULT_FLAGS: FeatureFlags = {
  // Demo Mode - Disabled to use real local Postgres by default
  DEMO_MODE: false,
  
  // Database - Use real PostgREST locally and no mock data
  USE_SUPABASE: false,
  USE_MOCK_DATA: false,
  
  // Features - All enabled by default
  ENABLE_USER_RATINGS: true,
  ENABLE_WALLET: true,
  ENABLE_USER_PROFILES: true,
  ENABLE_REVIEWS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_PAYMENTS: true,
  ENABLE_LOCATION_SERVICES: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  
  // UI/UX - All enabled by default
  ENABLE_ANIMATIONS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_COLORBLIND_MODE: true,
  ENABLE_MULTI_LANGUAGE: true,
  // Navigation/UI toggles
  ENABLE_LIST_VIEW_LINK: false,
  
  // Development - Disabled by default
  ENABLE_DEBUG_MODE: false,
  ENABLE_LOGGING: true,
  ENABLE_PERFORMANCE_MONITORING: false,
  
  // Testing - Disabled by default
  ENABLE_TEST_MODE: false,
  ENABLE_MOCK_LOCATION: true,
};

// Environment variable parser
const parseEnvFlag = (key: string, defaultValue: boolean): boolean => {
  // Support both plain and EXPO_PUBLIC_ prefixed env vars
  const envValue = process.env[key] ?? (process as any)?.env?.[`EXPO_PUBLIC_${key}`];
  if (envValue === undefined) return defaultValue;
  
  // Accept various truthy values
  const truthyValues = ['true', '1', 'yes', 'on', 'enabled'];
  return truthyValues.includes(String(envValue).toLowerCase());
};

// Feature flags with environment variable support
export const FEATURE_FLAGS: FeatureFlags = {
  // Demo Mode
  DEMO_MODE: parseEnvFlag('DEMO_MODE', DEFAULT_FLAGS.DEMO_MODE),
  
  // Database
  USE_SUPABASE: parseEnvFlag('USE_SUPABASE', DEFAULT_FLAGS.USE_SUPABASE),
  USE_MOCK_DATA: parseEnvFlag('USE_MOCK_DATA', DEFAULT_FLAGS.USE_MOCK_DATA),
  
  // Features
  ENABLE_USER_RATINGS: parseEnvFlag('ENABLE_USER_RATINGS', DEFAULT_FLAGS.ENABLE_USER_RATINGS),
  ENABLE_WALLET: parseEnvFlag('ENABLE_WALLET', DEFAULT_FLAGS.ENABLE_WALLET),
  ENABLE_USER_PROFILES: parseEnvFlag('ENABLE_USER_PROFILES', DEFAULT_FLAGS.ENABLE_USER_PROFILES),
  ENABLE_REVIEWS: parseEnvFlag('ENABLE_REVIEWS', DEFAULT_FLAGS.ENABLE_REVIEWS),
  ENABLE_NOTIFICATIONS: parseEnvFlag('ENABLE_NOTIFICATIONS', DEFAULT_FLAGS.ENABLE_NOTIFICATIONS),
  ENABLE_PAYMENTS: parseEnvFlag('ENABLE_PAYMENTS', DEFAULT_FLAGS.ENABLE_PAYMENTS),
  ENABLE_LOCATION_SERVICES: parseEnvFlag('ENABLE_LOCATION_SERVICES', DEFAULT_FLAGS.ENABLE_LOCATION_SERVICES),
  ENABLE_PUSH_NOTIFICATIONS: parseEnvFlag('ENABLE_PUSH_NOTIFICATIONS', DEFAULT_FLAGS.ENABLE_PUSH_NOTIFICATIONS),
  
  // UI/UX
  ENABLE_ANIMATIONS: parseEnvFlag('ENABLE_ANIMATIONS', DEFAULT_FLAGS.ENABLE_ANIMATIONS),
  ENABLE_DARK_MODE: parseEnvFlag('ENABLE_DARK_MODE', DEFAULT_FLAGS.ENABLE_DARK_MODE),
  ENABLE_COLORBLIND_MODE: parseEnvFlag('ENABLE_COLORBLIND_MODE', DEFAULT_FLAGS.ENABLE_COLORBLIND_MODE),
  ENABLE_MULTI_LANGUAGE: parseEnvFlag('ENABLE_MULTI_LANGUAGE', DEFAULT_FLAGS.ENABLE_MULTI_LANGUAGE),
  // Navigation/UI toggles
  ENABLE_LIST_VIEW_LINK: parseEnvFlag('ENABLE_LIST_VIEW_LINK', DEFAULT_FLAGS.ENABLE_LIST_VIEW_LINK),
  
  // Development
  ENABLE_DEBUG_MODE: parseEnvFlag('ENABLE_DEBUG_MODE', DEFAULT_FLAGS.ENABLE_DEBUG_MODE),
  ENABLE_LOGGING: parseEnvFlag('ENABLE_LOGGING', DEFAULT_FLAGS.ENABLE_LOGGING),
  ENABLE_PERFORMANCE_MONITORING: parseEnvFlag('ENABLE_PERFORMANCE_MONITORING', DEFAULT_FLAGS.ENABLE_PERFORMANCE_MONITORING),
  
  // Testing
  ENABLE_TEST_MODE: parseEnvFlag('ENABLE_TEST_MODE', DEFAULT_FLAGS.ENABLE_TEST_MODE),
  ENABLE_MOCK_LOCATION: parseEnvFlag('ENABLE_MOCK_LOCATION', DEFAULT_FLAGS.ENABLE_MOCK_LOCATION),
};

// Helper functions
let DEMO_MODE_OVERRIDE: boolean | null = null;
export const setDemoModeOverride = (value: boolean) => {
  DEMO_MODE_OVERRIDE = value;
};
export const isDemoMode = (): boolean => (DEMO_MODE_OVERRIDE !== null ? !!DEMO_MODE_OVERRIDE : FEATURE_FLAGS.DEMO_MODE);
export const isProductionMode = (): boolean => !FEATURE_FLAGS.DEMO_MODE;
export const useMockData = (): boolean => FEATURE_FLAGS.USE_MOCK_DATA || FEATURE_FLAGS.DEMO_MODE;
export const useSupabase = (): boolean => FEATURE_FLAGS.USE_SUPABASE && !FEATURE_FLAGS.DEMO_MODE;

// Feature check functions
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[feature];
};

// Log current configuration
if (FEATURE_FLAGS.ENABLE_LOGGING) {
  console.log('🚩 Feature Flags Configuration:', {
    DEMO_MODE: FEATURE_FLAGS.DEMO_MODE,
    USE_SUPABASE: FEATURE_FLAGS.USE_SUPABASE,
    USE_MOCK_DATA: FEATURE_FLAGS.USE_MOCK_DATA,
    ENABLE_USER_RATINGS: FEATURE_FLAGS.ENABLE_USER_RATINGS,
    ENABLE_WALLET: FEATURE_FLAGS.ENABLE_WALLET,
  });
}

