
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseManager {
  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize() async {
    // Use the same Supabase config as the React Native app
    const url = 'https://fpvrlhubpwrslsuopuwr.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA';
    
    await Supabase.initialize(url: url, anonKey: anonKey);
  }

  static Future<AuthResponse> signIn(String email, String password) async {
    return await client.auth.signInWithPassword(email: email, password: password);
  }

    static Future<AuthResponse> signUp(String email, String password) async {
    return await client.auth.signUp(
      email: email,
      password: password,
      emailRedirectTo: null, // Disable email redirect for mobile apps
      data: {
        'email_confirm': false, // Disable email confirmation requirement
      },
    );
  }

  static Future<void> signOut() async {
    await client.auth.signOut();
  }

  static User? get currentUser => client.auth.currentUser;
  static Session? get currentSession => client.auth.currentSession;
}

