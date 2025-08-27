import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Session, User } from '@supabase/supabase-js';
import { auth } from '../lib/supabase-lightweight';
import { fetchUserProfile } from '../lib/database';
import { registerForPushNotificationsAsync, saveExpoPushToken } from '../lib/notifications';
// import { isDemoMode, setDemoModeOverride } from '../lib/feature-flags';

interface AuthContextType {
  user: (User & any) | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default context instead of throwing an error
    return {
      user: null,
      session: null,
      loading: true,
      signIn: async () => ({ error: new Error('Auth not initialized') }),
      signUp: async () => ({ error: new Error('Auth not initialized') }),
      signOut: async () => {},
    };
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<(User & any) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
        // Auto-login rules by platform/device
        // - iOS simulator: Force demo mode and skip login (keep user null, use demo dataset)
        // - iPad: default to user3
        // - Android: default to user2
        // - Otherwise: regular session lookup
        // iOS simulator detection heuristic: Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV && running on simulator often lacks certain device info.
        if (Platform.OS === 'ios') {
                  // iOS mapping per request:
        // - iPhone (non-iPad, including simulator) -> user2
        // - iPad -> user3
        const isPad = (Platform as any).isPad === true;
        const desiredId = isPad ? '00000000-0000-0000-0000-000000000003' : '00000000-0000-0000-0000-000000000002';
        const desiredEmail = isPad ? 'user3@currijobs.com' : 'user2@currijobs.com';
        const seededUser = { id: desiredId, email: desiredEmail, created_at: new Date().toISOString() } as User;
        
        // TEMPORARY: Force welcome screen for testing
        // Comment out the next 3 lines to see splash screen and onboarding
        // setUser(seededUser);
        // setSession(null);
        // setLoading(false);
        
        // Instead, set user to null to show welcome screen
        setUser(null);
        setSession(null);
        setLoading(false);
          // Background enrich (non-blocking)
          (async () => {
            try {
              const profile = await fetchUserProfile(seededUser.id);
              setUser(prev => ({ ...(prev || seededUser), ...(profile || {}) } as any));
              const token = await registerForPushNotificationsAsync();
              if (token) await saveExpoPushToken(seededUser.id, token);
            } catch {}
          })();
          return;
        } else if (Platform.OS === 'android') {
          // Android devices -> user4
          const seededUser = { id: '00000000-0000-0000-0000-000000000004', email: 'user4@currijobs.com', created_at: new Date().toISOString() } as User;
          // Set immediately; enrich later
          setUser(seededUser);
          setSession(null);
          setLoading(false);
          (async () => {
            try {
              const profile = await fetchUserProfile(seededUser.id);
              setUser(prev => ({ ...(prev || seededUser), ...(profile || {}) } as any));
              const token = await registerForPushNotificationsAsync();
              if (token) await saveExpoPushToken(seededUser.id, token);
            } catch {}
          })();
          return;
        }

        const { data: { session } } = await auth.getSession();
        setSession(session);
        const baseUser = session?.user ?? null;
        if (baseUser) {
          const profile = await fetchUserProfile(baseUser.id);
          setUser({ ...baseUser, ...profile });
          const token = await registerForPushNotificationsAsync();
          if (token) await saveExpoPushToken(baseUser.id, token);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const baseUser = session?.user ?? null;
        if (baseUser) {
          const profile = await fetchUserProfile(baseUser.id);
          setUser({ ...baseUser, ...profile });
        } else {
          // Keep auto-assigned users when in platform defaults
          if (Platform.OS === 'android') {
            const seededUser = { id: '00000000-0000-0000-0000-000000000004', email: 'user4@currijobs.com', created_at: new Date().toISOString() } as User;
            const profile = await fetchUserProfile(seededUser.id);
            setUser({ ...seededUser, ...profile });
            const token = await registerForPushNotificationsAsync();
            if (token) await saveExpoPushToken(seededUser.id, token);
          } else if (Platform.OS === 'ios') {
            const isPad = (Platform as any).isPad === true;
            const desiredId = isPad ? '00000000-0000-0000-0000-000000000003' : '00000000-0000-0000-0000-000000000002';
            const desiredEmail = isPad ? 'user3@currijobs.com' : 'user2@currijobs.com';
            const seededUser = { id: desiredId, email: desiredEmail, created_at: new Date().toISOString() } as User;
            const profile = await fetchUserProfile(seededUser.id);
            setUser({ ...seededUser, ...profile });
            const token = await registerForPushNotificationsAsync();
            if (token) await saveExpoPushToken(seededUser.id, token);
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      }
    );

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  // Removed auto-login mock. Users must log in via welcome/login.

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      // Get the authenticated user and their profile
      const user = data.user;
      if (user) {
        const profile = await fetchUserProfile(user.id);
        setUser({ ...user, ...(profile || {}) });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 