import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_client.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  Session? _session;
  bool _loading = true;

  User? get user => _user;
  Session? get session => _session;
  bool get loading => _loading;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    try {
      // Listen to auth state changes
      Supabase.instance.client.auth.onAuthStateChange.listen((data) {
        _session = data.session;
        _user = data.session?.user;
        _loading = false;
        notifyListeners();
      });

      // For development, start logged out
      await _clearSession();
      
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> _clearSession() async {
    try {
      await SupabaseManager.signOut();
      _user = null;
      _session = null;
    } catch (e) {
      // Ignore errors if no session exists
    }
  }

  Future<AuthResponse> signIn(String email, String password) async {
    try {
      final response = await SupabaseManager.signIn(email, password);
      if (response.user != null) {
        _user = response.user;
        _session = response.session;
        notifyListeners();
      }
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponse> signUp(String email, String password) async {
    try {
      final response = await SupabaseManager.signUp(email, password);
      if (response.user != null) {
        _user = response.user;
        _session = response.session;
        notifyListeners();
      }
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signOut() async {
    try {
      await SupabaseManager.signOut();
      _user = null;
      _session = null;
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }
}
