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

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: new Error('Auth not initialized') }),
  signUp: async () => ({ error: new Error('Auth not initialized') }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
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
        // No auto-login - check for existing session only


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
          // No auto-login - user must manually log in
          setUser(null);
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