import { z } from 'zod';

// Base schemas for common fields
export const BaseSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

// User Profile schema
export const UserProfileSchema = BaseSchema.extend({
  email: z.string().email(),
  full_name: z.string().min(1).max(100),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  home_address: z.string().max(200).optional(),
  home_latitude: z.number().min(-90).max(90).optional(),
  home_longitude: z.number().min(-180).max(180).optional(),
  rating: z.number().min(0).max(5).default(0),
  total_jobs: z.number().min(0).default(0),
  total_earnings: z.number().min(0).default(0),
  is_verified: z.boolean().default(false),
  is_available: z.boolean().default(true),
});

// Task Category enum
export const TaskCategorySchema = z.enum([
  'plumbing',
  'electrician',
  'carpentry',
  'painting',
  'appliance_repair',
  'cleaning',
  'laundry_ironing',
  'cooking',
  'grocery_shopping',
  'pet_care',
  'gardening',
  'moving_help',
  'trash_removal',
  'window_washing',
  'babysitting',
  'elderly_care',
  'tutoring',
  'delivery_errands',
  'tech_support',
  'photography'
]);

// Task Status enum
export const TaskStatusSchema = z.enum([
  'open',
  'in_progress',
  'completed',
  'cancelled'
]);

// Task schema
export const TaskSchema = BaseSchema.extend({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: TaskCategorySchema,
  reward: z.number().min(0).max(1000000), // Max 1M colones
  time_estimate: z.string().max(100).optional(),
  location: z.string().max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: TaskStatusSchema.default('open'),
  user_id: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  completed_at: z.string().datetime().optional(),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  is_urgent: z.boolean().default(false),
  deadline: z.string().datetime().optional(),
});

// Offer Status enum
export const OfferStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  'withdrawn'
]);

// Offer schema
export const OfferSchema = BaseSchema.extend({
  task_id: z.string().uuid(),
  user_id: z.string().uuid(),
  proposed_reward: z.number().min(0).max(1000000),
  message: z.string().min(1).max(1000),
  status: OfferStatusSchema.default('pending'),
  accepted_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().max(500).optional(),
});

// Review schema
export const ReviewSchema = BaseSchema.extend({
  task_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  reviewed_id: z.string().uuid(),
  payment_id: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
});

// Notification schema
export const NotificationSchema = BaseSchema.extend({
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum(['task_created', 'offer_received', 'offer_accepted', 'task_completed', 'payment_received', 'system']),
  is_read: z.boolean().default(false),
  related_task_id: z.string().uuid().optional(),
  related_offer_id: z.string().uuid().optional(),
});

// Payment schema
export const PaymentSchema = BaseSchema.extend({
  task_id: z.string().uuid(),
  payer_id: z.string().uuid(),
  payee_id: z.string().uuid(),
  amount: z.number().min(0).max(1000000),
  currency: z.enum(['CRC', 'USD']).default('CRC'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_payment', 'credit_card']),
  transaction_id: z.string().optional(),
  completed_at: z.string().datetime().optional(),
  // Added job execution metadata
  work_started_at: z.string().datetime().optional(),
  work_ended_at: z.string().datetime().optional(),
  job_latitude: z.number().min(-90).max(90).optional(),
  job_longitude: z.number().min(-180).max(180).optional(),
});

// Search and Filter schemas
export const TaskSearchSchema = z.object({
  query: z.string().optional(),
  category: TaskCategorySchema.optional(),
  min_reward: z.number().min(0).optional(),
  max_reward: z.number().min(0).optional(),
  status: TaskStatusSchema.optional(),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(0).max(100).default(10), // km
  sort_by: z.enum(['created_at', 'reward', 'distance', 'deadline']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Create Task schema (for form validation)
export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  status: true,
  assigned_to: true,
  completed_at: true,
  user_id: true,
});

// Update Task schema
export const UpdateTaskSchema = TaskSchema.partial().omit({
  id: true,
  created_at: true,
  user_id: true,
});

// Create Offer schema
export const CreateOfferSchema = OfferSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  status: true,
  accepted_at: true,
  completed_at: true,
  rating: true,
  review: true,
});

// Update Offer schema
export const UpdateOfferSchema = OfferSchema.partial().omit({
  id: true,
  created_at: true,
  task_id: true,
  user_id: true,
});

// User Registration schema
export const UserRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  full_name: z.string().min(1).max(100),
  phone: z.string().optional(),
  location: z.string().max(200).optional(),
});

// User Login schema
export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Profile Update schema
export const ProfileUpdateSchema = UserProfileSchema.partial().omit({
  id: true,
  created_at: true,
  email: true,
  rating: true,
  total_jobs: true,
  total_earnings: true,
});

// Export types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type TaskCategory = z.infer<typeof TaskCategorySchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type OfferStatus = z.infer<typeof OfferStatusSchema>;
export type CreateTaskData = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskData = z.infer<typeof UpdateTaskSchema>;
export type CreateOfferData = z.infer<typeof CreateOfferSchema>;
export type UpdateOfferData = z.infer<typeof UpdateOfferSchema>;
export type UserRegistrationData = z.infer<typeof UserRegistrationSchema>;
export type UserLoginData = z.infer<typeof UserLoginSchema>;
export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;
export type TaskSearchParams = z.infer<typeof TaskSearchSchema>;

// Validation functions
export const validateTask = (data: unknown): Task => {
  return TaskSchema.parse(data);
};

export const validateCreateTask = (data: unknown): CreateTaskData => {
  return CreateTaskSchema.parse(data);
};

export const validateUpdateTask = (data: unknown): UpdateTaskData => {
  return UpdateTaskSchema.parse(data);
};

export const validateOffer = (data: unknown): Offer => {
  return OfferSchema.parse(data);
};

export const validateCreateOffer = (data: unknown): CreateOfferData => {
  return CreateOfferSchema.parse(data);
};

export const validateUserProfile = (data: unknown): UserProfile => {
  return UserProfileSchema.parse(data);
};

export const validateTaskSearch = (data: unknown): TaskSearchParams => {
  return TaskSearchSchema.parse(data);
};

// Safe validation functions (don't throw errors)
export const safeValidateTask = (data: unknown) => {
  return TaskSchema.safeParse(data);
};

export const safeValidateCreateTask = (data: unknown) => {
  return CreateTaskSchema.safeParse(data);
};

export const safeValidateOffer = (data: unknown) => {
  return OfferSchema.safeParse(data);
};

export const safeValidateUserProfile = (data: unknown) => {
  return UserProfileSchema.safeParse(data);
};


