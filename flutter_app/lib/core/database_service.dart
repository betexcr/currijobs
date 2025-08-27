import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_client.dart';
import 'types.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  SupabaseClient get _client => SupabaseManager.client;

  // Task operations
  Future<List<Task>> fetchTasks() async {
    try {
      final response = await _client
          .from('tasks')
          .select()
          .eq('status', 'open')
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => Task.fromJson(json))
          .toList();
    } catch (e) {
      debugPrint('Error fetching tasks: $e');
      return [];
    }
  }

  Future<List<Task>> fetchUserTasks(String userId) async {
    try {
      final response = await _client
          .from('tasks')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => Task.fromJson(json))
          .toList();
    } catch (e) {
      debugPrint('Error fetching user tasks: $e');
      return [];
    }
  }

  Future<Task?> fetchTask(String taskId) async {
    try {
      final response = await _client
          .from('tasks')
          .select()
          .eq('id', taskId)
          .single();

      return Task.fromJson(response);
    } catch (e) {
      debugPrint('Error fetching task: $e');
      return null;
    }
  }

  Future<Task?> createTask(Map<String, dynamic> taskData) async {
    try {
      final response = await _client
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

      return Task.fromJson(response);
    } catch (e) {
      debugPrint('Error creating task: $e');
      return null;
    }
  }

  Future<bool> updateTask(String taskId, Map<String, dynamic> updates) async {
    try {
      await _client
          .from('tasks')
          .update(updates)
          .eq('id', taskId);
      return true;
    } catch (e) {
      debugPrint('Error updating task: $e');
      return false;
    }
  }

  Future<bool> deleteTask(String taskId) async {
    try {
      await _client
          .from('tasks')
          .delete()
          .eq('id', taskId);
      return true;
    } catch (e) {
      debugPrint('Error deleting task: $e');
      return false;
    }
  }

  // User profile operations
  Future<UserProfile?> fetchUserProfile(String userId) async {
    try {
      final response = await _client
          .from('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle();

      if (response == null) {
        debugPrint('User profile not found for userId: $userId');
        // Don't create a profile automatically - let the user go through proper registration
        return null;
      }

      return UserProfile.fromJson(response);
    } catch (e) {
      debugPrint('Error fetching user profile: $e');
      return null;
    }
  }

  Future<UserProfile?> createUserProfile(Map<String, dynamic> profileData) async {
    try {
      final response = await _client
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

      return UserProfile.fromJson(response);
    } catch (e) {
      debugPrint('Error creating user profile: $e');
      return null;
    }
  }

  Future<bool> updateUserProfile(String userId, Map<String, dynamic> updates) async {
    try {
      await _client
          .from('profiles')
          .update(updates)
          .eq('id', userId);
      return true;
    } catch (e) {
      debugPrint('Error updating user profile: $e');
      return false;
    }
  }

  // Offer operations
  Future<List<Offer>> fetchTaskOffers(String taskId) async {
    try {
      final response = await _client
          .from('offers')
          .select()
          .eq('task_id', taskId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => Offer.fromJson(json))
          .toList();
    } catch (e) {
      debugPrint('Error fetching task offers: $e');
      return [];
    }
  }

  Future<Offer?> createOffer(Map<String, dynamic> offerData) async {
    try {
      final response = await _client
          .from('offers')
          .insert(offerData)
          .select()
          .single();

      return Offer.fromJson(response);
    } catch (e) {
      debugPrint('Error creating offer: $e');
      return null;
    }
  }

  Future<bool> updateOffer(String offerId, Map<String, dynamic> updates) async {
    try {
      await _client
          .from('offers')
          .update(updates)
          .eq('id', offerId);
      return true;
    } catch (e) {
      debugPrint('Error updating offer: $e');
      return false;
    }
  }

  // Search and filter operations
  Future<List<Task>> searchTasks(String query) async {
    try {
      final response = await _client
          .from('tasks')
          .select()
          .or('title.ilike.%$query%,description.ilike.%$query%')
          .eq('status', 'open')
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => Task.fromJson(json))
          .toList();
    } catch (e) {
      debugPrint('Error searching tasks: $e');
      return [];
    }
  }

  Future<List<Task>> filterTasksByCategory(String category) async {
    try {
      final response = await _client
          .from('tasks')
          .select()
          .eq('category', category)
          .eq('status', 'open')
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => Task.fromJson(json))
          .toList();
    } catch (e) {
      debugPrint('Error filtering tasks by category: $e');
      return [];
    }
  }

  // Utility methods
  String getCategoryLabel(TaskCategory category) {
    switch (category) {
      case TaskCategory.plumbing:
        return 'Plumbing';
      case TaskCategory.electrician:
        return 'Electrician';
      case TaskCategory.carpentry:
        return 'Carpentry';
      case TaskCategory.painting:
        return 'Painting';
      case TaskCategory.applianceRepair:
        return 'Appliance Repair';
      case TaskCategory.cleaning:
        return 'Cleaning';
      case TaskCategory.laundryIroning:
        return 'Laundry & Ironing';
      case TaskCategory.cooking:
        return 'Cooking';
      case TaskCategory.groceryShopping:
        return 'Grocery Shopping';
      case TaskCategory.petCare:
        return 'Pet Care';
      case TaskCategory.gardening:
        return 'Gardening';
      case TaskCategory.movingHelp:
        return 'Moving Help';
      case TaskCategory.trashRemoval:
        return 'Trash Removal';
      case TaskCategory.windowWashing:
        return 'Window Washing';
      case TaskCategory.babysitting:
        return 'Babysitting';
      case TaskCategory.elderlyCare:
        return 'Elderly Care';
      case TaskCategory.tutoring:
        return 'Tutoring';
      case TaskCategory.deliveryErrands:
        return 'Delivery & Errands';
      case TaskCategory.techSupport:
        return 'Tech Support';
      case TaskCategory.photography:
        return 'Photography';
    }
  }

  IconData getCategoryIcon(TaskCategory category) {
    switch (category) {
      case TaskCategory.plumbing:
        return Icons.plumbing;
      case TaskCategory.electrician:
        return Icons.electrical_services;
      case TaskCategory.carpentry:
        return Icons.handyman;
      case TaskCategory.painting:
        return Icons.brush;
      case TaskCategory.applianceRepair:
        return Icons.build;
      case TaskCategory.cleaning:
        return Icons.cleaning_services;
      case TaskCategory.laundryIroning:
        return Icons.local_laundry_service;
      case TaskCategory.cooking:
        return Icons.restaurant;
      case TaskCategory.groceryShopping:
        return Icons.shopping_cart;
      case TaskCategory.petCare:
        return Icons.pets;
      case TaskCategory.gardening:
        return Icons.eco;
      case TaskCategory.movingHelp:
        return Icons.local_shipping;
      case TaskCategory.trashRemoval:
        return Icons.delete;
      case TaskCategory.windowWashing:
        return Icons.window;
      case TaskCategory.babysitting:
        return Icons.child_care;
      case TaskCategory.elderlyCare:
        return Icons.elderly;
      case TaskCategory.tutoring:
        return Icons.school;
      case TaskCategory.deliveryErrands:
        return Icons.delivery_dining;
      case TaskCategory.techSupport:
        return Icons.computer;
      case TaskCategory.photography:
        return Icons.camera_alt;
    }
  }

  // Check if user exists
  Future<bool> checkUserExists(String email) async {
    try {
      final response = await SupabaseManager.client
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
      
      return response != null;
    } catch (e) {
      debugPrint('Error checking user existence: $e');
      return false;
    }
  }

  // Get user profile by email
  Future<UserProfile?> getUserByEmail(String email) async {
    try {
      final response = await SupabaseManager.client
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();
      
      if (response != null) {
        return UserProfile.fromJson(response);
      }
      return null;
    } catch (e) {
      debugPrint('Error getting user by email: $e');
      return null;
    }
  }

  // Create profile for user if it doesn't exist
  Future<bool> createProfileIfNotExists(String userId, String email) async {
    try {
      print('🔍 Checking if profile exists for user: $userId');
      
      // Check if profile already exists
      final existing = await SupabaseManager.client
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
      
      if (existing != null) {
        print('✅ Profile already exists for user: $userId');
        return true; // Profile already exists
      }

      print('📝 Creating new profile for user: $userId (${email})');
      
      // Create new profile
      await SupabaseManager.client
          .from('profiles')
          .insert({
            'id': userId,
            'email': email,
            'full_name': email.split('@')[0], // Use email prefix as name
            'created_at': DateTime.now().toIso8601String(),
          });
      
      print('✅ Profile created successfully for user: $userId');
      return true;
    } catch (e) {
      print('❌ Error creating profile: $e');
      debugPrint('Error creating profile: $e');
      return false;
    }
  }
}
