import 'dart:io';
import 'dart:convert';

// Supabase configuration
const String supabaseUrl = 'https://fpvrlhubpwrslsuopuwr.supabase.co';
const String supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA';

// User data
final List<Map<String, String>> users = [
  {'email': 'user1@test.com', 'name': 'Juan Pérez'},
  {'email': 'user2@test.com', 'name': 'María González'},
  {'email': 'user3@test.com', 'name': 'Carlos Rodríguez'},
  {'email': 'albmunmu@gmail.com', 'name': 'Alberto Muñoz'},
];

// Make HTTP request to Supabase
Future<dynamic> makeSupabaseRequest(String endpoint, String method, Map<String, dynamic>? data) async {
  final client = HttpClient();
  
  try {
    final request = await client.openUrl(method, Uri.parse('$supabaseUrl/rest/v1/$endpoint'));
    
    request.headers.set('apikey', supabaseKey);
    request.headers.set('Authorization', 'Bearer $supabaseKey');
    request.headers.set('Content-Type', 'application/json');
    request.headers.set('Prefer', 'return=representation');
    
    if (data != null) {
      request.write(jsonEncode(data));
    }
    
    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(responseBody);
    } else {
      throw Exception('HTTP ${response.statusCode}: $responseBody');
    }
  } finally {
    client.close();
  }
}

Future<void> main() async {
  print('🚀 Starting user creation...');
  
  try {
    for (final user in users) {
      print('👤 Creating user: ${user['name']} (${user['email']})');
      
      final userData = {
        'id': '${user['email']}_${DateTime.now().millisecondsSinceEpoch}',
        'email': user['email']!,
        'full_name': user['name']!,
        'created_at': DateTime.now().toIso8601String(),
        'member_since': DateTime.now().toIso8601String(),
      };
      
      try {
        print('  📤 Sending data: ${jsonEncode(userData)}');
        await makeSupabaseRequest('profiles', 'POST', userData);
        print('  ✅ Created user: ${user['name']}');
      } catch (e) {
        print('  ❌ Failed to create user: ${user['name']} - $e');
      }
      
      // Small delay
      await Future.delayed(Duration(milliseconds: 100));
    }
    
    print('\n🎉 User creation completed!');
    
  } catch (e) {
    print('❌ Error during user creation: $e');
  }
  
  exit(0);
}
