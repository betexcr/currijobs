import 'dart:io';
import 'dart:convert';

// Supabase configuration
const String supabaseUrl = 'https://fpvrlhubpwrslsuopuwr.supabase.co';
const String supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA';

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
    
    print('Response status: ${response.statusCode}');
    print('Response body: $responseBody');
    
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
  print('🔍 Checking tasks table schema...');
  
  try {
    // Try to get one task to see the schema
    final tasks = await makeSupabaseRequest('tasks?select=*&limit=1', 'GET', null);
    print('✅ Tasks schema: $tasks');
    
  } catch (e) {
    print('❌ Error checking tasks schema: $e');
  }
  
  exit(0);
}
