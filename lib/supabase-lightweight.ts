import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoTrueClient } from '@supabase/gotrue-js';
import { PostgrestClient } from '@supabase/postgrest-js';
import { Platform } from 'react-native';

// Remote Supabase config (kept for production)
const supabaseUrl = 'https://fpvrlhubpwrslsuopuwr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA';

// Local PostgREST base URL for dev (Docker)
// Use EXPO_PUBLIC_POSTGREST_URL if provided, else default to http://localhost:3000
const rawLocalPostgrestUrl = (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_POSTGREST_URL) || 'http://localhost:3000';

// Normalize localhost for Android emulator (host loopback is 10.0.2.2)
const localPostgrestUrl = Platform.OS === 'android'
  ? rawLocalPostgrestUrl.replace('localhost', '10.0.2.2')
  : rawLocalPostgrestUrl;

// Toggle to use local PostgREST ONLY when explicitly requested
const envUseLocal = (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_USE_LOCAL_DB) === 'true';
const USE_LOCAL_POSTGREST = envUseLocal;

// Auth client setup with better React Native configuration
export const auth = new GoTrueClient({
  url: `${supabaseUrl}/auth/v1`,
  autoRefreshToken: true,
  persistSession: true,
  storageKey: 'supabase.auth.token',
  storage: AsyncStorage,
  fetch,
});

// DB client setup (for querying data)
const postgrestBase = USE_LOCAL_POSTGREST ? localPostgrestUrl : `${supabaseUrl}/rest/v1`;
const commonHeaders = USE_LOCAL_POSTGREST
  ? { Prefer: 'return=representation' }
  : { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` };

export const db = new PostgrestClient(postgrestBase, {
  headers: commonHeaders,
  fetch,
});

// Expose remote REST info for direct fetch fallbacks
export const getSupabaseRestInfo = () => {
  return {
    baseUrl: `${supabaseUrl}/rest/v1`,
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    anonKey: supabaseAnonKey,
  } as const;
};

// Helper function to get auth headers with better error handling
export const getAuthHeaders = async () => {
  try {
    if (USE_LOCAL_POSTGREST) {
      return {} as any;
    }
    const { data: { session } } = await auth.getSession();
    return { apikey: supabaseAnonKey, Authorization: `Bearer ${session?.access_token || supabaseAnonKey}` };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return USE_LOCAL_POSTGREST ? ({} as any) : { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` };
  }
};

// Helper function to test connection
export const testConnection = async () => {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return { success: true, status: response.status };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.message };
  }
};
