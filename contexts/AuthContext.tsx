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
    throw new Error('useAuth must be used within an AuthProvider');
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
          let desiredId = isPad ? '00000000-0000-0000-0000-000000000003' : '00000000-0000-0000-0000-000000000002';
          let desiredEmail = isPad ? 'user3@currijobs.com' : 'user2@currijobs.com';
          const seededUser = { id: desiredId, email: desiredEmail, created_at: new Date().toISOString() } as User;
          const profile = await fetchUserProfile(seededUser.id);
          setUser({ ...seededUser, ...profile });
          const token = await registerForPushNotificationsAsync();
          if (token) await saveExpoPushToken(seededUser.id, token);
          setSession(null);
          setLoading(false);
          return;
        } else if (Platform.OS === 'android') {
          // Android devices -> user4
          const seededUser = { id: '00000000-0000-0000-0000-000000000004', email: 'user4@currijobs.com', created_at: new Date().toISOString() } as User;
          const profile = await fetchUserProfile(seededUser.id);
          setUser({ ...seededUser, ...profile });
          const token = await registerForPushNotificationsAsync();
          if (token) await saveExpoPushToken(seededUser.id, token);
          setSession(null);
          setLoading(false);
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
    // Local dev shortcut: map demo credentials to the seeded UUID user
    if (email === 'demo@currijobs.com' && password === 'demo123456') {
      const seededUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@currijobs.com',
        created_at: new Date().toISOString(),
      } as User;
      const profile = await fetchUserProfile(seededUser.id);
      setUser({ ...seededUser, ...(profile || {}) });
      return { error: null };
    }

    // Local dev shortcuts for additional seeded users
    if (email === 'user2@currijobs.com' && password === 'user2123456') {
      const seededUser = {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'user2@currijobs.com',
        created_at: new Date().toISOString(),
      } as User;
      const profile = await fetchUserProfile(seededUser.id);
      setUser({ ...seededUser, ...profile });
      return { error: null };
    }
    if (email === 'user3@currijobs.com' && password === 'user3123456') {
      const seededUser = {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'user3@currijobs.com',
        created_at: new Date().toISOString(),
      } as User;
      const profile = await fetchUserProfile(seededUser.id);
      setUser({ ...seededUser, ...profile });
      return { error: null };
    }
    if (email === 'user4@currijobs.com' && password === 'user4123456') {
      const seededUser = {
        id: '00000000-0000-0000-0000-000000000004',
        email: 'user4@currijobs.com',
        created_at: new Date().toISOString(),
      } as User;
      const profile = await fetchUserProfile(seededUser.id);
      setUser({ ...seededUser, ...profile });
      return { error: null };
    }

    try {
      const { data, error } = await auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      // Refresh hydrated user
      const u = (await auth.getSession()).data.session?.user ?? null;
      if (u) {
        const profile = await fetchUserProfile(u.id);
        setUser({ ...u, ...(profile || {}) });
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