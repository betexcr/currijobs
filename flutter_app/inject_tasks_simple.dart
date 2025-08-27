import 'dart:io';
import 'dart:convert';
import 'dart:math';

// Curridabat coordinates (approximate center)
const double CURRIDABAT_LAT = 9.9167;
const double CURRIDABAT_LNG = -84.0333;

// Supabase configuration
const String supabaseUrl = 'https://fpvrlhubpwrslsuopuwr.supabase.co';
const String supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA';

// Task data for each category
final Map<String, Map<String, dynamic>> taskTemplates = {
  'plumbing': {
    'title': 'Fix leaking bathroom faucet',
    'description': 'Need someone to fix a leaking bathroom faucet. The water keeps dripping and it\'s wasting water. Please bring your own tools.',
    'reward': 25000.0,
    'time_estimate': '2 hours',
  },
  'electrician': {
    'title': 'Install ceiling fan in living room',
    'description': 'Need to install a new ceiling fan in the living room. The wiring is already there, just need to connect and mount the fan.',
    'reward': 35000.0,
    'time_estimate': '3 hours',
  },
  'carpentry': {
    'title': 'Build wooden bookshelf',
    'description': 'Need a custom wooden bookshelf built for my home office. Should be 6 feet tall with 5 shelves.',
    'reward': 45000.0,
    'time_estimate': '1 day',
  },
  'painting': {
    'title': 'Paint bedroom walls',
    'description': 'Need to paint 2 bedroom walls. Color is light blue. Room is about 12x15 feet.',
    'reward': 30000.0,
    'time_estimate': '4 hours',
  },
  'applianceRepair': {
    'title': 'Fix refrigerator not cooling',
    'description': 'Refrigerator stopped cooling properly. Need someone to diagnose and fix the issue.',
    'reward': 40000.0,
    'time_estimate': '2 hours',
  },
  'cleaning': {
    'title': 'Deep clean apartment',
    'description': 'Need a thorough cleaning of my 2-bedroom apartment. Includes kitchen, bathrooms, and living areas.',
    'reward': 20000.0,
    'time_estimate': '4 hours',
  },
  'laundryIroning': {
    'title': 'Iron business shirts',
    'description': 'Need 10 business shirts ironed and pressed. Must be done carefully to maintain professional appearance.',
    'reward': 15000.0,
    'time_estimate': '2 hours',
  },
  'cooking': {
    'title': 'Prepare dinner for family',
    'description': 'Need someone to cook dinner for family of 4. Should be healthy and include main dish and sides.',
    'reward': 25000.0,
    'time_estimate': '2 hours',
  },
  'groceryShopping': {
    'title': 'Grocery shopping and delivery',
    'description': 'Need someone to do grocery shopping for the week. Will provide list and payment.',
    'reward': 18000.0,
    'time_estimate': '1.5 hours',
  },
  'petCare': {
    'title': 'Dog walking and feeding',
    'description': 'Need someone to walk my dog twice a day and feed him. Dog is friendly and well-behaved.',
    'reward': 20000.0,
    'time_estimate': '1 hour per day',
  },
  'gardening': {
    'title': 'Garden maintenance and pruning',
    'description': 'Need help maintaining my garden. Includes pruning bushes, weeding, and general cleanup.',
    'reward': 22000.0,
    'time_estimate': '3 hours',
  },
  'movingHelp': {
    'title': 'Help move furniture',
    'description': 'Need help moving furniture from one room to another. Includes heavy items like sofa and bed.',
    'reward': 30000.0,
    'time_estimate': '2 hours',
  },
  'trashRemoval': {
    'title': 'Remove old furniture',
    'description': 'Need to remove old furniture and appliances from garage. Items are too large for regular trash pickup.',
    'reward': 25000.0,
    'time_estimate': '2 hours',
  },
  'windowWashing': {
    'title': 'Clean house windows',
    'description': 'Need all house windows cleaned inside and out. House has about 15 windows total.',
    'reward': 28000.0,
    'time_estimate': '3 hours',
  },
  'babysitting': {
    'title': 'Babysit 2 children',
    'description': 'Need someone to watch my 2 children (ages 5 and 8) for the evening. Must be patient and experienced.',
    'reward': 20000.0,
    'time_estimate': '4 hours',
  },
  'elderlyCare': {
    'title': 'Assist elderly parent',
    'description': 'Need someone to help my elderly parent with daily activities. Includes companionship and light assistance.',
    'reward': 25000.0,
    'time_estimate': '3 hours',
  },
  'tutoring': {
    'title': 'Math tutoring for high school student',
    'description': 'Need math tutor for my 16-year-old son. He\'s struggling with algebra and needs help understanding concepts.',
    'reward': 30000.0,
    'time_estimate': '2 hours',
  },
  'deliveryErrands': {
    'title': 'Package pickup and delivery',
    'description': 'Need someone to pick up packages from post office and deliver them to my home.',
    'reward': 15000.0,
    'time_estimate': '1 hour',
  },
  'techSupport': {
    'title': 'Computer setup and troubleshooting',
    'description': 'Need help setting up new computer and transferring data from old one. Also need some software installation.',
    'reward': 35000.0,
    'time_estimate': '3 hours',
  },
  'photography': {
    'title': 'Family photo session',
    'description': 'Need photographer for family photo session. Should be outdoors in a nice location.',
    'reward': 50000.0,
    'time_estimate': '2 hours',
  },
};

// User data - using existing users from the database
final List<Map<String, String>> users = [
  {'email': 'demo@currijobs.com', 'name': 'Demo User'},
  {'email': 'user2@currijobs.com', 'name': 'User Two'},
  {'email': 'user3@currijobs.com', 'name': 'User Three'},
  {'email': 'user4@currijobs.com', 'name': 'User Four'},
  {'email': 'albmunmu@gmail.com', 'name': 'Alberto Muñoz'},
];

// Generate random location within 1-5km of Curridabat
Map<String, double> generateRandomLocation() {
  // Convert km to degrees (approximate)
  const double kmToDegrees = 0.009; // 1km ≈ 0.009 degrees
  
  // Random distance between 1-5km
  final double distance = 1.0 + (4.0 * Random().nextDouble());
  final double distanceInDegrees = distance * kmToDegrees;
  
  // Random angle
  final double angle = Random().nextDouble() * 2 * pi;
  
  // Calculate new coordinates
  final double lat = CURRIDABAT_LAT + (distanceInDegrees * cos(angle));
  final double lng = CURRIDABAT_LNG + (distanceInDegrees * sin(angle));
  
  return {
    'latitude': lat,
    'longitude': lng,
  };
}

// Generate location name based on coordinates
String generateLocationName(double lat, double lng) {
  final List<String> locationNames = [
    'Curridabat Centro',
    'San Pedro',
    'Sabanilla',
    'San José',
    'Escazú',
    'Santa Ana',
    'Tibás',
    'Heredia',
    'Alajuela',
    'Cartago',
  ];
  
  final int index = ((lat + lng) * 1000).round() % locationNames.length;
  return locationNames[index];
}

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
  print('🚀 Starting task injection...');
  
  try {
    // Get all users from profiles table
    print('📋 Fetching users from profiles table...');
    final usersResponse = await makeSupabaseRequest(
      'profiles?select=id,email,full_name',
      'GET',
      null,
    );
    
    if (usersResponse == null || (usersResponse as List).isEmpty) {
      print('❌ No users found in profiles table');
      return;
    }
    
    final usersList = usersResponse as List;
    print('✅ Found ${usersList.length} users');
    
    // Create tasks for each user and category
    int taskCount = 0;
    
    for (final user in usersList) {
      print('👤 Creating tasks for user: ${user['full_name']} (${user['email']})');
      
      for (final category in taskTemplates.keys) {
        final template = taskTemplates[category]!;
        final location = generateRandomLocation();
        final locationName = generateLocationName(location['latitude']!, location['longitude']!);
        
        final taskData = {
          'title': template['title'],
          'description': template['description'],
          'category': category,
          'reward': template['reward'],
          'estimated_time': template['time_estimate'],
          'location': locationName,
          'latitude': location['latitude'],
          'longitude': location['longitude'],
          'user_id': user['id'],
          'status': 'open',
          'created_at': DateTime.now().toIso8601String(),
        };
        
        try {
          await makeSupabaseRequest('tasks', 'POST', taskData);
          
          taskCount++;
          print('  ✅ Created task: ${template['title']} (${category})');
        } catch (e) {
          print('  ❌ Failed to create task: ${template['title']} - $e');
        }
        
        // Small delay to avoid overwhelming the database
        await Future.delayed(Duration(milliseconds: 100));
      }
    }
    
    print('\n🎉 Task injection completed!');
    print('📊 Created $taskCount tasks total');
    print('👥 ${usersResponse.length} users');
    print('📋 ${taskTemplates.length} categories per user');
    
  } catch (e) {
    print('❌ Error during task injection: $e');
  }
  
  exit(0);
}
