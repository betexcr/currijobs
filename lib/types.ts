// Re-export types from schemas for better type safety and validation
export type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  Offer,
  CreateOfferData,
  UpdateOfferData,
  UserProfile,
  Review,
  Notification,
  Payment,
  TaskCategory,
  TaskStatus,
  OfferStatus,
  UserRegistrationData,
  UserLoginData,
  ProfileUpdateData,
  TaskSearchParams
} from './schemas';

// Legacy User interface for backward compatibility with existing code
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Legacy interfaces for backward compatibility
export interface LegacyTask {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  time_estimate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface LegacyCreateTaskData {
  title: string;
  description: string;
  category: string;
  reward: number;
  time_estimate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface LegacyOffer {
  id: string;
  task_id: string;
  user_id: string;
  price: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface LegacyCreateOfferData {
  task_id: string;
  price: number;
  description: string;
}

// Enhanced user profile with ratings and wallet
export interface EnhancedUserProfile extends UserProfile {
  rating: number; // 0 to 5 in 0.1 increments
  total_reviews: number;
  completed_tasks: number;
  total_earnings: number;
  wallet_balance: number;
  member_since: string;
  verified: boolean;
}

export interface TaskWithUser extends Task {
  user_profile: EnhancedUserProfile;
}

export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number; // 0 to 5 in 0.1 increments
  comment: string;
  created_at: string;
  reviewer_profile?: EnhancedUserProfile;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'withdrawn' | 'refunded' | 'bonus';
  amount: number;
  description: string;
  task_id?: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
}
