import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TaskSearchSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateOfferSchema,
  UpdateOfferSchema,
  UserRegistrationSchema,
  UserLoginSchema,
  ProfileUpdateSchema,
  TaskSearchParams,
  CreateTaskData,
  UpdateTaskData,
  CreateOfferData,
  UpdateOfferData,
  UserRegistrationData,
  UserLoginData,
  ProfileUpdateData
} from './schemas';

// Form validation schemas
export const taskSearchFormSchema = TaskSearchSchema;
export const createTaskFormSchema = CreateTaskSchema;
export const updateTaskFormSchema = UpdateTaskSchema;
export const createOfferFormSchema = CreateOfferSchema;
export const updateOfferFormSchema = UpdateOfferSchema;
export const userRegistrationFormSchema = UserRegistrationSchema;
export const userLoginFormSchema = UserLoginSchema;
export const profileUpdateFormSchema = ProfileUpdateSchema;

// Hook for task search form
export const useTaskSearchForm = (): UseFormReturn<TaskSearchParams> => {
  return useForm<TaskSearchParams>({
    resolver: zodResolver(taskSearchFormSchema),
    defaultValues: {
      query: '',
      category: undefined,
      min_reward: undefined,
      max_reward: undefined,
      status: undefined,
      location: '',
      latitude: undefined,
      longitude: undefined,
      radius: 10,
      sort_by: 'created_at',
      sort_order: 'desc',
      limit: 20,
      offset: 0,
    },
  });
};

// Hook for create task form
export const useCreateTaskForm = (): UseFormReturn<CreateTaskData> => {
  return useForm<CreateTaskData>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'cleaning',
      reward: 0,
      time_estimate: '',
      location: '',
      latitude: undefined,
      longitude: undefined,
    },
  });
};

// Hook for update task form
export const useUpdateTaskForm = (initialData?: Partial<UpdateTaskData>): UseFormReturn<UpdateTaskData> => {
  return useForm<UpdateTaskData>({
    resolver: zodResolver(updateTaskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'cleaning',
      reward: initialData?.reward || 0,
      time_estimate: initialData?.time_estimate || '',
      location: initialData?.location || '',
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
      status: initialData?.status,
      assigned_to: initialData?.assigned_to,
      completed_at: initialData?.completed_at,
      images: initialData?.images || [],
      tags: initialData?.tags || [],
      priority: initialData?.priority || 'medium',
      is_urgent: initialData?.is_urgent || false,
      deadline: initialData?.deadline,
    },
  });
};

// Hook for create offer form
export const useCreateOfferForm = (taskId: string): UseFormReturn<CreateOfferData> => {
  return useForm<CreateOfferData>({
    resolver: zodResolver(createOfferFormSchema),
    defaultValues: {
      task_id: taskId,
      proposed_reward: 0,
      message: '',
    },
  });
};

// Hook for update offer form
export const useUpdateOfferForm = (initialData?: Partial<UpdateOfferData>): UseFormReturn<UpdateOfferData> => {
  return useForm<UpdateOfferData>({
    resolver: zodResolver(updateOfferFormSchema),
    defaultValues: {
      proposed_reward: initialData?.proposed_reward || 0,
      message: initialData?.message || '',
      status: initialData?.status,
      accepted_at: initialData?.accepted_at,
      completed_at: initialData?.completed_at,
      rating: initialData?.rating,
      review: initialData?.review,
    },
  });
};

// Hook for user registration form
export const useUserRegistrationForm = (): UseFormReturn<UserRegistrationData> => {
  return useForm<UserRegistrationData>({
    resolver: zodResolver(userRegistrationFormSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone: '',
      location: '',
    },
  });
};

// Hook for user login form
export const useUserLoginForm = (): UseFormReturn<UserLoginData> => {
  return useForm<UserLoginData>({
    resolver: zodResolver(userLoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
};

// Hook for profile update form
export const useProfileUpdateForm = (initialData?: Partial<ProfileUpdateData>): UseFormReturn<ProfileUpdateData> => {
  return useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      phone: initialData?.phone || '',
      avatar_url: initialData?.avatar_url || '',
      bio: initialData?.bio || '',
      location: initialData?.location || '',
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
      is_verified: initialData?.is_verified || false,
      is_available: initialData?.is_available || true,
    },
  });
};

// Utility functions for form validation
export const validateFormData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

export const safeValidateFormData = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return schema.safeParse(data);
};

// Error message helpers
export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  return errors[fieldName]?.message;
};

export const hasFieldError = (errors: any, fieldName: string): boolean => {
  return !!errors[fieldName];
};

// Form submission helpers
export const handleFormSubmit = async <T>(
  form: UseFormReturn<T>,
  onSubmit: (data: T) => Promise<void>
) => {
  try {
    const data = await form.handleSubmit(onSubmit)();
    return { success: true, data };
  } catch (error) {
    console.error('Form submission error:', error);
    return { success: false, error };
  }
};

// Validation error formatter
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  errors.errors.forEach((error) => {
    const fieldName = error.path.join('.');
    formattedErrors[fieldName] = error.message;
  });
  
  return formattedErrors;
};

// Custom validation rules
export const customValidationRules = {
  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  // Phone number validation (Costa Rican format)
  phone: z.string()
    .regex(/^(\+506)?[0-9]{8}$/, 'Please enter a valid Costa Rican phone number'),
  
  // Reward validation
  reward: z.number()
    .min(1000, 'Minimum reward is ₡1,000')
    .max(1000000, 'Maximum reward is ₡1,000,000'),
  
  // Location validation
  location: z.string()
    .min(5, 'Location must be at least 5 characters')
    .max(200, 'Location must be less than 200 characters'),
  
  // Description validation
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
};


