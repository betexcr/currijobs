import { db, auth, getAuthHeaders } from './supabase-lightweight';
import { Task, CreateTaskData, Offer, CreateOfferData } from './types';
import { 
  validateTask, 
  validateCreateTask, 
  validateUpdateTask, 
  validateOffer, 
  validateCreateOffer,
  safeValidateTask,
  safeValidateCreateTask,
  safeValidateOffer
} from './schemas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDemoMode, useMockData, isFeatureEnabled } from './feature-flags';

// Mock data for offline development (dense around demo user at La Nopalera)
const DEMO_LAT = 9.923035;
const DEMO_LON = -84.043457;
const nearby = (dLat: number, dLon: number) => ({ latitude: DEMO_LAT + dLat, longitude: DEMO_LON + dLon });

const MOCK_TASKS: Task[] = [
  // cleaning
  { id: 'clean-1', title: 'Apartment Cleaning - quick', description: 'Small 1-bed clean', category: 'cleaning', reward: 12000, time_estimate: '2h', location: 'La Nopalera, San José', ...nearby(0.003, 0.002), user_id: 'user1', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  { id: 'clean-2', title: 'Deep Clean Requested', description: 'Deep clean 3-bed', category: 'cleaning', reward: 30000, time_estimate: '4h', location: 'Avenida 24, San José', ...nearby(0.001, -0.002), user_id: 'user2', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // pet care
  { id: 'pet-1', title: 'Dog Walking - morning', description: 'Golden retriever', category: 'pet_care', reward: 8000, time_estimate: '1h', location: 'Barrio La Nopalera', ...nearby(-0.001, 0.0015), user_id: 'user3', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  { id: 'pet-2', title: 'Cat Sitting Overnight', description: 'Friendly cat', category: 'pet_care', reward: 20000, time_estimate: 'overnight', location: 'San José Centro', ...nearby(0.002, 0.0005), user_id: 'user4', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // plumbing
  { id: 'plumb-1', title: 'Fix Leaky Faucet', description: 'Kitchen faucet leaking', category: 'plumbing', reward: 18000, time_estimate: '1h', location: 'La Nopalera', ...nearby(0.0006, -0.0008), user_id: 'user5', created_at: new Date().toISOString(), status: 'open', priority: 'high', is_urgent: true },
  // electrician
  { id: 'elec-1', title: 'Install Light Fixture', description: 'Ceiling light', category: 'electrician', reward: 22000, time_estimate: '1.5h', location: 'Avenida 24', ...nearby(-0.0012, -0.0003), user_id: 'user6', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // carpentry
  { id: 'carp-1', title: 'Assemble Shelves', description: 'IKEA style shelves', category: 'carpentry', reward: 15000, time_estimate: '2h', location: 'San José', ...nearby(0.0008, 0.0012), user_id: 'user7', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  // painting
  { id: 'paint-1', title: 'Paint Bedroom', description: '1 wall', category: 'painting', reward: 20000, time_estimate: '3h', location: 'La Nopalera', ...nearby(-0.001, -0.001), user_id: 'user8', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // appliance repair
  { id: 'appl-1', title: 'Fix Washing Machine', description: 'Not draining', category: 'appliance_repair', reward: 35000, time_estimate: '2h', location: 'San José Centro', ...nearby(0.0015, 0.002), user_id: 'user9', created_at: new Date().toISOString(), status: 'open', priority: 'high', is_urgent: true },
  // laundry/ironing
  { id: 'laundry-1', title: 'Iron Shirts', description: '10 shirts', category: 'laundry_ironing', reward: 8000, time_estimate: '1h', location: 'Avenida 24', ...nearby(0.0005, 0.0007), user_id: 'user10', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  // cooking
  { id: 'cook-1', title: 'Meal Prep', description: '2 meals', category: 'cooking', reward: 12000, time_estimate: '2h', location: 'La Nopalera', ...nearby(-0.0007, 0.0011), user_id: 'user11', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  // grocery shopping
  { id: 'grocery-1', title: 'Grocery Pickup', description: 'Local market', category: 'grocery_shopping', reward: 6000, time_estimate: '1h', location: 'San José', ...nearby(0.0009, -0.0009), user_id: 'user12', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  { id: 'grocery-2', title: 'Supermarket Run', description: 'Bulk items', category: 'grocery_shopping', reward: 10000, time_estimate: '1.5h', location: 'San José', ...nearby(-0.0015, 0.0004), user_id: 'user13', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // gardening
  { id: 'garden-1', title: 'Trim Hedge', description: 'Small hedge', category: 'gardening', reward: 9000, time_estimate: '1.5h', location: 'La Nopalera', ...nearby(0.0011, -0.0013), user_id: 'user14', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  // moving help
  { id: 'move-1', title: 'Carry Boxes', description: '3rd floor walk-up', category: 'moving_help', reward: 18000, time_estimate: '2h', location: 'Avenida 24', ...nearby(-0.0009, 0.0013), user_id: 'user15', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  { id: 'move-2', title: 'Small Move', description: 'Studio apt', category: 'moving_help', reward: 30000, time_estimate: '3h', location: 'San José', ...nearby(0.0018, -0.0006), user_id: 'user16', created_at: new Date().toISOString(), status: 'open', priority: 'high', is_urgent: true },
  // trash removal
  { id: 'trash-1', title: 'Junk Pickup', description: 'Old furniture', category: 'trash_removal', reward: 20000, time_estimate: '2h', location: 'La Nopalera', ...nearby(-0.0014, -0.0007), user_id: 'user17', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // window washing
  { id: 'window-1', title: 'Clean Windows', description: '2 bedroom apt', category: 'window_washing', reward: 14000, time_estimate: '2h', location: 'Avenida 24', ...nearby(0.0003, -0.0011), user_id: 'user18', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  // babysitting
  { id: 'baby-1', title: 'Evening Babysitting', description: '2 kids', category: 'babysitting', reward: 25000, time_estimate: '4h', location: 'San José', ...nearby(0.0012, 0.0002), user_id: 'user19', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // elderly care
  { id: 'elder-1', title: 'Elderly Companion', description: 'Read and chat', category: 'elderly_care', reward: 15000, time_estimate: '2h', location: 'La Nopalera', ...nearby(-0.001, 0.001), user_id: 'user20', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  // tutoring
  { id: 'tutor-1', title: 'Math Tutor', description: 'Algebra help', category: 'tutoring', reward: 12000, time_estimate: '1.5h', location: 'San José', ...nearby(0.0006, -0.0004), user_id: 'user21', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  { id: 'tutor-2', title: 'English Tutor', description: 'Conversational English', category: 'tutoring', reward: 15000, time_estimate: '2h', location: 'Avenida 24', ...nearby(-0.0008, -0.0002), user_id: 'user22', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // delivery/errands
  { id: 'deliv-1', title: 'Parcel Delivery', description: 'Pickup & drop', category: 'delivery_errands', reward: 10000, time_estimate: '1h', location: 'La Nopalera', ...nearby(0.001, 0.001), user_id: 'user23', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
  // tech support
  { id: 'tech-1', title: 'WiFi Setup', description: 'Router config', category: 'tech_support', reward: 16000, time_estimate: '1h', location: 'Avenida 24', ...nearby(-0.0012, 0.0009), user_id: 'user24', created_at: new Date().toISOString(), status: 'open', priority: 'medium', is_urgent: false },
  // photography
  { id: 'photo-1', title: 'Portrait Session', description: '30 min session', category: 'photography', reward: 20000, time_estimate: '1h', location: 'San José', ...nearby(0.0014, 0.0008), user_id: 'user25', created_at: new Date().toISOString(), status: 'open', priority: 'low', is_urgent: false },
];

// Demo user profiles with stored locations (near La Nopalera)
type DemoProfile = {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  location: string;
  latitude: number;
  longitude: number;
  rating?: number;
  total_jobs?: number;
  total_earnings?: number;
  is_verified?: boolean;
};

const demoProfileFactory = (id: string, idx: number): DemoProfile => ({
  id,
  email: `${id}@demo.currijobs.local`,
  full_name: `Demo User ${idx}`,
  location: 'Avenida 24, San José, La Nopalera, Costa Rica',
  latitude: DEMO_LAT + (idx % 3) * 0.0004,
  longitude: DEMO_LON + (idx % 5) * 0.0003,
  rating: 4 + ((idx % 10) / 10),
  total_jobs: 10 + idx,
  total_earnings: 100000 + idx * 1000,
  is_verified: idx % 2 === 0,
});

const DEMO_PROFILES: Record<string, DemoProfile> = {};

// Seed demo profiles for ids referenced in MOCK_TASKS
(() => {
  const userIds = new Set<string>();
  MOCK_TASKS.forEach(t => t.user_id && userIds.add(t.user_id));
  Array.from(userIds).forEach((id, i) => {
    DEMO_PROFILES[id] = demoProfileFactory(id, i + 1);
  });
})();

// Persist user location in profile (demo and real)
export const saveUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number,
  locationText?: string
): Promise<boolean> => {
  try {
    if (isDemoMode()) {
      const existing = DEMO_PROFILES[userId] || demoProfileFactory(userId, Object.keys(DEMO_PROFILES).length + 1);
      DEMO_PROFILES[userId] = {
        ...existing,
        latitude,
        longitude,
        location: locationText || existing.location,
      };
      return true;
    }
    const { error } = await db
      .from('profiles')
      .update({ latitude, longitude, location: locationText })
      .eq('id', userId);
    if (error) {
      console.error('Error saving user location:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception saving user location:', e);
    return false;
  }
};

// Demo storage helpers (persist created tasks locally in demo/offline mode)
const DEMO_TASKS_KEY = 'demo_tasks';

const generateUuid = (): string => {
  // Basic RFC4122 v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

async function loadDemoTasks(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(DEMO_TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Task[];
    return [];
  } catch {
    return [];
  }
}

async function saveDemoTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // no-op
  }
}

// Task-related functions
export const fetchTasks = async (): Promise<Task[]> => {
  // If demo mode is enabled, return mock data
  if (isDemoMode()) {
    // Using mock data for demo
    const created = await loadDemoTasks();
    return [...created, ...MOCK_TASKS];
  }

  try {
    console.log('Attempting to fetch tasks from Supabase...');
    const headers = await getAuthHeaders();
    
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return MOCK_TASKS; // Fallback to mock data
    }

    console.log('Successfully fetched tasks:', data?.length || 0);
    if (!data || data.length === 0) {
      // If DB is empty in dev, show demo tasks
      return MOCK_TASKS;
    }
    return data;
  } catch (error: any) {
    console.error('Exception during fetchTasks:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    // Return mock data if network fails
    return MOCK_TASKS;
  }
};

export const fetchTasksNearby = async (latitude: number, longitude: number, maxDistance: number = 10): Promise<Task[]> => {
  // If demo mode is enabled, return mock data filtered by distance
  if (isDemoMode()) {
    // Using mock data for nearby tasks
    return MOCK_TASKS.filter(task => {
      if (!task.latitude || !task.longitude) return false;
      
      const distance = calculateDistance(
        latitude,
        longitude,
        task.latitude,
        task.longitude
      );
      return distance <= maxDistance;
    });
  }

  try {
    // Using PostGIS distance calculation if available, otherwise fetch all and filter client-side
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching nearby tasks:', error);
      return MOCK_TASKS.filter(task => {
        if (!task.latitude || !task.longitude) return false;
        
        const distance = calculateDistance(
          latitude,
          longitude,
          task.latitude,
          task.longitude
        );
        return distance <= maxDistance;
      });
    }

    // Filter by distance client-side
    const nearbyTasks = (data || []).filter(task => {
      if (!task.latitude || !task.longitude) return false;
      
      const distance = calculateDistance(
        latitude,
        longitude,
        task.latitude,
        task.longitude
      );
      
      return distance <= maxDistance;
    });

    return nearbyTasks;
  } catch (error: any) {
    console.error('Error fetching nearby tasks:', error);
    // Return mock data if network fails
    return [
      {
        id: '1',
        title: 'House Cleaning in San José',
        description: 'Need help cleaning a 3-bedroom apartment in downtown San José.',
        category: 'cleaning',
        reward: 25000,
        time_estimate: '3 hours',
        location: 'Downtown San José, Costa Rica',
        latitude: 9.9281,
        longitude: -84.0907,
        user_id: 'user1',
        created_at: new Date().toISOString(),
        status: 'open',
        priority: 'medium',
        is_urgent: false
      },
      {
        id: '2',
        title: 'Pet Sitting for Golden Retriever',
        description: 'Looking for someone to walk and feed my friendly Golden Retriever.',
        category: 'pet_care',
        reward: 15000,
        time_estimate: '2 hours daily',
        location: 'Escazú, San José, Costa Rica',
        latitude: 9.9181,
        longitude: -84.0807,
        user_id: 'user2',
        created_at: new Date().toISOString(),
        status: 'open',
        priority: 'low',
        is_urgent: false
      }
    ];
  }
};

export const fetchTaskById = async (taskId: string): Promise<Task | null> => {
  // If demo mode is enabled, return mock data
  if (isDemoMode()) {
    // Using mock data for task by ID
    const created = await loadDemoTasks();
    const combined = [...created, ...MOCK_TASKS];
    return combined.find(task => task.id === taskId) || null;
  }

  try {
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return MOCK_TASKS.find(task => task.id === taskId) || null;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching task:', error);
    return MOCK_TASKS.find(task => task.id === taskId) || null;
  }
};

export const createTask = async (taskData: CreateTaskData, userId: string): Promise<Task | null> => {
  try {
    if (isDemoMode()) {
      const validatedData = validateCreateTask(taskData);
      const newTask: Task = {
        ...validatedData,
        id: generateUuid(),
        created_at: new Date().toISOString(),
        status: 'open',
        priority: 'medium',
        is_urgent: false,
        user_id: userId || 'demo-user',
      } as Task;
      const existing = await loadDemoTasks();
      const updated = [newTask, ...existing];
      await saveDemoTasks(updated);
      return newTask;
    }

    // Validate input data with Zod
    const validatedData = validateCreateTask(taskData);
    
    const { data, error } = await db
      .from('tasks')
      .insert({
        ...validatedData,
        user_id: userId,
        status: 'open',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    // Validate response data with Zod
    const validatedTask = safeValidateTask(data);
    if (!validatedTask.success) {
      console.error('Invalid task data received:', validatedTask.error);
      return null;
    }

    return validatedTask.data;
  } catch (error: any) {
    console.error('Error creating task:', error);
    return null;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
  try {
    const { data, error } = await db
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Error updating task:', error);
    return null;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await db
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return false;
  }
};

// Offer-related functions
export const fetchOffersForTask = async (taskId: string): Promise<Offer[]> => {
  try {
    const { data, error } = await db
      .from('offers')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return [];
  }
};

export const createOffer = async (offerData: CreateOfferData, userId: string): Promise<Offer | null> => {
  try {
    // In demo mode, short-circuit with a mock offer to avoid UUID/Zod constraints
    if (isDemoMode()) {
      const mockOffer: Offer = {
        id: '11111111-1111-1111-1111-111111111111',
        task_id: offerData.task_id,
        user_id: userId,
        proposed_reward: offerData.proposed_reward,
        message: offerData.message,
        status: 'pending',
        created_at: new Date().toISOString(),
        // optional fields
        updated_at: new Date().toISOString(),
      } as unknown as Offer;
      return mockOffer;
    }

    // Validate input data with Zod
    const validatedData = validateCreateOffer(offerData);
    
    const { data, error } = await db
      .from('offers')
      .insert({
        ...validatedData,
        user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      return null;
    }

    // Validate response data with Zod
    const validatedOffer = safeValidateOffer(data);
    if (!validatedOffer.success) {
      console.error('Invalid offer data received:', validatedOffer.error);
      return null;
    }

    return validatedOffer.data;
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return null;
  }
};

export const updateOffer = async (offerId: string, updates: Partial<Offer>): Promise<Offer | null> => {
  try {
    const { data, error } = await db
      .from('offers')
      .update(updates)
      .eq('id', offerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating offer:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Error updating offer:', error);
    return null;
  }
};

// Wallet / Payments
export const fetchPaymentsForUser = async (userId: string): Promise<any[]> => {
  try {
    // No mock fallback; always query DB

    const { data: payments, error } = await db
      .from('payments')
      .select('*')
      .eq('payee_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }

    const enriched = await Promise.all(
      (payments || []).map(async (p: any) => {
        interface TaskRow { id: string; title: string; location?: string; latitude?: number; longitude?: number }
        interface ProfileRow { id: string; full_name: string; rating?: number }
        const [taskRes, payerRes] = await Promise.all([
          db.from('tasks').select('id,title,location,latitude,longitude').eq('id', p.task_id).single(),
          db.from('profiles').select('id,full_name,rating').eq('id', p.payer_id).single(),
        ]);

        const task = (taskRes.data || {}) as TaskRow;
        const payer = (payerRes.data || {}) as ProfileRow;

        return {
          id: p.id,
          type: 'earned',
          amount: p.amount,
          description: task?.title || 'Payment',
          date: p.created_at,
          taskId: task?.id,
          taskTitle: task?.title,
          paidByUserId: payer?.id,
          paidByName: payer?.full_name,
          paidAt: p.completed_at || p.created_at,
          workStartedAt: p.work_started_at || null,
          workEndedAt: p.work_ended_at || null,
          jobLatitude: p.job_latitude ?? task?.latitude ?? null,
          jobLongitude: p.job_longitude ?? task?.longitude ?? null,
          jobLocationText: task?.location || null,
        };
      })
    );

    return enriched;
  } catch (error: any) {
    console.error('Error fetching payments for user:', error);
    return [];
  }
};

export const fetchWalletTransactions = fetchPaymentsForUser;

// User-related functions
export const fetchUserProfile = async (userId: string) => {
  try {
    if (isDemoMode()) {
      return DEMO_PROFILES[userId] || null;
    }
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await db
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Utility functions
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Search functions
export const searchTasks = async (query: string): Promise<Task[]> => {
  try {
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching tasks:', error);
    return [];
  }
};

export const fetchTasksByCategory = async (category: string): Promise<Task[]> => {
  try {
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('category', category)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching tasks by category:', error);
    return [];
  }
};

export const fetchTasksByUser = async (userId: string): Promise<Task[]> => {
  try {
    if (isDemoMode()) {
      const created = await loadDemoTasks();
      const all = [...created, ...MOCK_TASKS];
      if (!userId) return all;
      return all.filter(t => t.user_id === userId);
    }

    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by user:', error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching tasks by user:', error);
    return [];
  }
};

// Export taskService for backward compatibility
export const taskService = {
  fetchTasks,
  fetchTasksNearby,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  searchTasks,
  fetchTasksByCategory,
  fetchTasksByUser,
};

// Export TASK_CATEGORIES for backward compatibility
export const TASK_CATEGORIES = [
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
  'photography',
] as const;