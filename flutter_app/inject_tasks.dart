import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';

// Curridabat coordinates (approximate center)
const double CURRIDABAT_LAT = 9.9167;
const double CURRIDABAT_LNG = -84.0333;

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

// User data
final List<Map<String, String>> users = [
  {'email': 'user1@test.com', 'name': 'Juan Pérez'},
  {'email': 'user2@test.com', 'name': 'María González'},
  {'email': 'user3@test.com', 'name': 'Carlos Rodríguez'},
  {'email': 'albmunmu@gmail.com', 'name': 'Alberto Muñoz'},
];

// Generate random location within 1-5km of Curridabat
Map<String, double> generateRandomLocation() {
  // Convert km to degrees (approximate)
  const double kmToDegrees = 0.009; // 1km ≈ 0.009 degrees
  
  // Random distance between 1-5km
  final double distance = 1.0 + (4.0 * (DateTime.now().millisecondsSinceEpoch % 1000) / 1000.0);
  final double distanceInDegrees = distance * kmToDegrees;
  
  // Random angle
  final double angle = (DateTime.now().microsecondsSinceEpoch % 360) * (3.14159 / 180);
  
  // Calculate new coordinates
  final double lat = CURRIDABAT_LAT + (distanceInDegrees * (angle % 1));
  final double lng = CURRIDABAT_LNG + (distanceInDegrees * ((angle * 2) % 1));
  
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

Future<void> main() async {
  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://fpvrlhubpwrslsuopuwr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA',
  );
  
  final supabase = Supabase.instance.client;
  
  print('🚀 Starting task injection...');
  
  try {
    // Get all users from profiles table
    final usersResponse = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in_('email', users.map((u) => u['email']!).toList());
    
    if (usersResponse == null || usersResponse.isEmpty) {
      print('❌ No users found in profiles table');
      return;
    }
    
    print('✅ Found ${usersResponse.length} users');
    
    // Create tasks for each user and category
    int taskCount = 0;
    
    for (final user in usersResponse) {
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
          'time_estimate': template['time_estimate'],
          'location': locationName,
          'latitude': location['latitude'],
          'longitude': location['longitude'],
          'user_id': user['id'],
          'status': 'open',
          'created_at': DateTime.now().toIso8601String(),
        };
        
        try {
          await supabase
              .from('tasks')
              .insert(taskData);
          
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
