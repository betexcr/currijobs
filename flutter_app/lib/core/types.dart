// Core types for the Currijobs Flutter app

enum TaskStatus {
  open,
  inProgress,
  completed,
  cancelled,
}

enum TaskCategory {
  plumbing,
  electrician,
  carpentry,
  painting,
  applianceRepair,
  cleaning,
  laundryIroning,
  cooking,
  groceryShopping,
  petCare,
  gardening,
  movingHelp,
  trashRemoval,
  windowWashing,
  babysitting,
  elderlyCare,
  tutoring,
  deliveryErrands,
  techSupport,
  photography,
}

class Task {
  final String id;
  final String title;
  final String description;
  final TaskCategory category;
  final double reward;
  final String? timeEstimate;
  final String? location;
  final double? latitude;
  final double? longitude;
  final TaskStatus status;
  final String userId;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Task({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.reward,
    required this.status,
    required this.userId,
    required this.createdAt,
    this.timeEstimate,
    this.location,
    this.latitude,
    this.longitude,
    this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      category: TaskCategory.values.firstWhere(
        (e) => e.toString().split('.').last == json['category'],
        orElse: () => TaskCategory.cleaning,
      ),
      reward: (json['reward'] as num).toDouble(),
      timeEstimate: json['time_estimate'],
      location: json['location'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      status: TaskStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => TaskStatus.open,
      ),
      userId: json['user_id'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category.toString().split('.').last,
      'reward': reward,
      'time_estimate': timeEstimate,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'status': status.toString().split('.').last,
      'user_id': userId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}

class UserProfile {
  final String id;
  final String email;
  final String? fullName;
  final String? avatarUrl;
  final String? phone;
  final double? latitude;
  final double? longitude;
  final String? location;
  final double rating;
  final int totalReviews;
  final int completedTasks;
  final double totalEarnings;
  final double walletBalance;
  final DateTime memberSince;
  final bool verified;
  final DateTime createdAt;

  UserProfile({
    required this.id,
    required this.email,
    required this.memberSince,
    required this.createdAt,
    this.fullName,
    this.avatarUrl,
    this.phone,
    this.latitude,
    this.longitude,
    this.location,
    this.rating = 0.0,
    this.totalReviews = 0,
    this.completedTasks = 0,
    this.totalEarnings = 0.0,
    this.walletBalance = 0.0,
    this.verified = false,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      email: json['email'],
      fullName: json['full_name'],
      avatarUrl: json['avatar_url'],
      phone: json['phone'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      location: json['location'],
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: json['total_reviews'] ?? 0,
      completedTasks: json['completed_tasks'] ?? 0,
      totalEarnings: (json['total_earnings'] as num?)?.toDouble() ?? 0.0,
      walletBalance: (json['wallet_balance'] as num?)?.toDouble() ?? 0.0,
      memberSince: DateTime.parse(json['member_since'] ?? json['created_at']),
      verified: json['verified'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'avatar_url': avatarUrl,
      'phone': phone,
      'latitude': latitude,
      'longitude': longitude,
      'location': location,
      'rating': rating,
      'total_reviews': totalReviews,
      'completed_tasks': completedTasks,
      'total_earnings': totalEarnings,
      'wallet_balance': walletBalance,
      'member_since': memberSince.toIso8601String(),
      'verified': verified,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class Offer {
  final String id;
  final String taskId;
  final String userId;
  final double price;
  final String description;
  final String status; // 'pending', 'accepted', 'rejected'
  final DateTime createdAt;

  Offer({
    required this.id,
    required this.taskId,
    required this.userId,
    required this.price,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  factory Offer.fromJson(Map<String, dynamic> json) {
    return Offer(
      id: json['id'],
      taskId: json['task_id'],
      userId: json['user_id'],
      price: (json['price'] as num).toDouble(),
      description: json['description'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'task_id': taskId,
      'user_id': userId,
      'price': price,
      'description': description,
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
