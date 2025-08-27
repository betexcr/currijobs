import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://fpvrlhubpwrslsuopuwr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA',
  );

  final client = Supabase.instance.client;

  try {
    // Test user creation
    print('Creating test user...');
    final response = await client.auth.signUp(
      email: 'testuser@currijobs.com',
      password: 'testpassword123',
      emailRedirectTo: null,
    );

    print('Signup response:');
    print('User: ${response.user?.email}');
    print('Session: ${response.session != null}');
    print('Error: ${response.error}');

    if (response.user != null) {
      // Check if user exists in profiles table
      try {
        final profileResponse = await client
            .from('profiles')
            .select('*')
            .eq('email', 'testuser@currijobs.com')
            .single();
        
        print('Profile found: $profileResponse');
      } catch (e) {
        print('Profile not found: $e');
      }
    }

  } catch (e) {
    print('Error: $e');
  }
}

