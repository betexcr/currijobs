import { db, auth, getAuthHeaders, getSupabaseRestInfo } from './supabase-lightweight';
import { sendPushNotification } from './notifications';
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
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { isDemoMode, isFeatureEnabled, useSupabase } from './feature-flags';

// Production-ready Supabase integration - NO MOCK DATA! 🚀

// Production-ready Supabase integration - NO MOCK DATA! 🚀

// Production-ready Supabase integration - NO MOCK DATA! 🚀

// Persist user location in profile (demo and real)
export const saveUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number,
  locationText?: string
): Promise<boolean> => {
  try {
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

export const clearDemoTasks = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DEMO_TASKS_KEY);
    console.log('Demo tasks cleared from local storage');
  } catch (error) {
    console.error('Error clearing demo tasks:', error);
  }
};

// Task-related functions
export const fetchTasks = async (): Promise<Task[]> => {
  // If demo mode is enabled, return mock data
  if (isDemoMode()) {
    // Using mock data for demo
    const created = await loadDemoTasks();
    const combined = [...created, ...MOCK_TASKS];
    (globalThis as any).console?.log?.(
      `[demo] fetchTasks -> created:${created.length} mock:${MOCK_TASKS.length} total:${combined.length}`
    );
    return combined.map(t => {
      const j = jitterDemoLatLon(t.id, t.latitude, t.longitude);
      return { ...t, latitude: j.latitude, longitude: j.longitude } as Task;
    });
  }

  try {
    console.log('Attempting to fetch tasks from Supabase...');
    const startFetch = Date.now();
    const isExpoGo = ((Constants as any)?.appOwnership === 'expo');
    const isIOS = Platform.OS === 'ios';
    
    // Expo Go on iOS sometimes stalls with postgrest-js; use direct REST
    const queryPromise = (isExpoGo && isIOS)
      ? (async () => {
          // Ensure direct REST cannot hang forever in Expo Go on iOS
          const DIRECT_TIMEOUT_MS = 10000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            try { controller.abort('timeout'); } catch {}
          }, DIRECT_TIMEOUT_MS);
          try {
            const { baseUrl, headers, anonKey } = getSupabaseRestInfo();
            // Provide apikey both in header and as query param for maximum compatibility in Expo Go
            const url = `${baseUrl}/tasks?select=*&order=created_at.desc&apikey=${encodeURIComponent(anonKey)}`;
            (globalThis as any).console?.log?.('[fetchTasks] iOS Expo Go direct REST →', url.replace(anonKey, '***'));
            const resp = await fetch(url, { headers: headers as any, signal: (controller as any).signal });
            (globalThis as any).console?.log?.('[fetchTasks] REST status', resp.status);
            if (!resp.ok) return { data: null, error: { message: `HTTP ${resp.status}` } };
            const json = await resp.json();
            (globalThis as any).console?.log?.('[fetchTasks] REST rows', Array.isArray(json) ? json.length : typeof json);
            return { data: json, error: null };
          } catch (e: any) {
            const msg = e?.name === 'AbortError' ? `timeout after ${DIRECT_TIMEOUT_MS}ms` : (e?.message || 'direct fetch failed');
            (globalThis as any).console?.error?.('[fetchTasks] REST exception', msg);
            return { data: null, error: { message: msg } };
          } finally {
            clearTimeout(timeoutId);
          }
        })()
      : (db
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false }) as unknown as Promise<any>);

    // If using direct REST on iOS Expo Go, we already applied an internal timeout
    const usingDirectREST = (isExpoGo && isIOS);
    const TIMEOUT_MS = 10000;
    let timedOut = false;
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => {
        timedOut = true;
        resolve({ data: null, error: { message: 'fetchTasks timeout after ' + TIMEOUT_MS + 'ms' } });
      }, TIMEOUT_MS)
    );

    let result: any = usingDirectREST ? await queryPromise : await Promise.race([queryPromise, timeoutPromise]);
    // If timed out, try alternate strategies
    if (result?.error && String(result.error.message || '').includes('timeout')) {
      // 1) Try direct REST again without apikey query param (already attempted above), then
      try {
        const { baseUrl, headers } = getSupabaseRestInfo();
        const resp = await fetch(`${baseUrl}/tasks?select=*&order=created_at.desc`, { headers: headers as any });
        if (resp.ok) {
          const json = await resp.json();
          result = { data: json, error: null };
        }
      } catch {}
      // 2) If still failing, try postgrest-js client even on iOS Expo Go
      if (!result?.data) {
        try {
          const pg = (await db
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false })) as any;
          if (!pg.error) {
            result = { data: pg.data, error: null };
          }
        } catch {}
      }
    }
    const data = result?.data ?? null;
    const error = result?.error ?? null;

    if (error) {
      console.error('Supabase error details:', { message: error.message, details: error.details, hint: error.hint, code: error.code, timedOut });
      // When Supabase is enabled, NEVER fallback to local data - only return what's in Supabase
      if (useSupabase()) {
        console.warn('[Supabase enabled] Returning empty array due to fetch error - no local fallback');
        return [];
      }
      // Only fallback to demo when Supabase is not in use
      if (isDemoMode()) {
        try {
          const created = await loadDemoTasks();
          const fallback = [...created, ...MOCK_TASKS] as Task[];
          console.warn('[fallback] Returning local/demo tasks:', fallback.length);
          return fallback;
        } catch {
          return [];
        }
      }
      return [];
    }

    console.log('Successfully fetched tasks:', data?.length || 0, 'in', (Date.now() - startFetch) + 'ms');
    
    // When using Supabase, ONLY return Supabase data - no local merge
    if (useSupabase()) {
      return (data || []) as Task[];
    }
    
    // Only merge local tasks when Supabase is disabled (demo mode)
    const createdLocal = await loadDemoTasks();
    return [
      ...((data || []) as Task[]),
      ...createdLocal,
    ];
  } catch (error: any) {
    console.error('Exception during fetchTasks:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return [];
  }
};

export const fetchTasksNearby = async (latitude: number, longitude: number, maxDistance: number = 10): Promise<Task[]> => {
  // If demo mode is enabled, return mock data filtered by distance
  if (isDemoMode()) {
    // Using mock data for nearby tasks
    (globalThis as any).console?.log?.(
      `[demo] fetchTasksNearby@(${latitude.toFixed(5)},${longitude.toFixed(5)}) radius:${maxDistance}km`
    );
    return MOCK_TASKS.map(t => {
      const j = jitterDemoLatLon(t.id, t.latitude, t.longitude);
      return { ...t, latitude: j.latitude, longitude: j.longitude } as Task;
    }).filter(task => {
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
      return [];
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
    return [];
  }
};

export const fetchTaskById = async (taskId: string): Promise<Task | null> => {
  // If demo mode is enabled, return mock data
  if (isDemoMode()) {
    // Using mock data for task by ID
    const created = await loadDemoTasks();
    const combined = [...created, ...MOCK_TASKS].map(t => {
      const j = jitterDemoLatLon(t.id, t.latitude, t.longitude);
      return { ...t, latitude: j.latitude, longitude: j.longitude } as Task;
    });
    return combined.find(task => task.id === taskId) || null;
  }

  try {
    // When Supabase is enabled, ONLY fetch from Supabase - no local fallback
    if (useSupabase()) {
      const { data, error } = await db
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error fetching task from Supabase:', error);
        return null;
      }

      return data;
    }
    
    // Only check local tasks when Supabase is disabled
    const created = await loadDemoTasks();
    const localHit = created.find(t => t.id === taskId);
    if (localHit) return localHit;
    
    return null;
  } catch (error: any) {
    console.error('Error fetching task:', error);
    return null;
  }
};

export const createTask = async (taskData: CreateTaskData, userId: string): Promise<Task | null> => {
  try {
    const validatedData = validateCreateTask(taskData);
    
    // If Supabase is enabled, ONLY save to Supabase - no local fallback
    if (useSupabase()) {
      try {
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
          console.error('Supabase createTask failed:', error?.message || error);
          return null; // Don't create task if Supabase fails
        }
        
        console.log('Supabase returned data:', JSON.stringify(data, null, 2));
        console.log('Data type:', typeof data);
        console.log('Data keys:', Object.keys(data || {}));
        
        const validatedTask = safeValidateTask(data);
        if (!validatedTask.success) {
          console.error('Supabase returned invalid task data');
          console.error('Validation errors:', validatedTask.error);
          console.error('Received data:', JSON.stringify(data, null, 2));
          return null;
        }
        
        return data as Task;
      } catch (e) {
        console.error('Supabase createTask exception:', e);
        return null; // Don't create task if Supabase fails
      }
    }
    
    // Only use local storage when Supabase is disabled (demo mode)
    const localTask: Task = {
      ...validatedData,
      id: generateUuid(),
      created_at: new Date().toISOString(),
      status: 'open',
      priority: 'medium',
      is_urgent: false,
      user_id: userId || 'demo-user',
    } as Task;
    const existing = await loadDemoTasks();
    await saveDemoTasks([localTask, ...existing]);
    
    return localTask;
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
        ...updates
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

export type OfferWithProfile = Offer & { user_profile?: any };

export const fetchOffersWithProfilesForTask = async (taskId: string): Promise<OfferWithProfile[]> => {
  try {
    const { data: offers, error } = await db
      .from('offers')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    if (error) return [];
    const list = offers || [];
    const userIds = Array.from(new Set(list.map((o: any) => String(o.user_id))));
    if (userIds.length === 0) return list as any;
    const { data: profiles } = await db.from('profiles').select('*').in('id', userIds);
    const profMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => { profMap[String(p.id)] = p; });
    return list.map((o: any) => ({ ...o, user_profile: profMap[String(o.user_id)] })) as any;
  } catch {
    return [];
  }
};

// Count offers per task in a single roundtrip
export const fetchOfferCountsForTasks = async (taskIds: string[]): Promise<Record<string, number>> => {
  try {
    if (!Array.isArray(taskIds) || taskIds.length === 0) return {};
    const { data, error } = await db
      .from('offers')
      .select('task_id, id')
      .in('task_id', taskIds);
    if (error) {
      console.error('Error counting offers:', error);
      return {};
    }
    const counts: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      const tid = String(row.task_id);
      counts[tid] = (counts[tid] || 0) + 1;
    });
    return counts;
  } catch (e) {
    return {};
  }
};

// Assign an offer to a task: set task.assigned_to and status to in_progress
export const assignOfferToTask = async (taskId: string, offerId: string): Promise<boolean> => {
  try {
    // Find the offer to get the user_id
    const { data: offer, error: offerErr } = await db
      .from('offers')
      .select('id, user_id')
      .eq('id', offerId)
      .single();
    if (offerErr || !offer) {
      console.error('assignOfferToTask: offer not found', offerErr);
      return false;
    }
    const { error } = await db
      .from('tasks')
      .update({ assigned_to: offer.user_id, status: 'in_progress' })
      .eq('id', taskId);
    if (error) {
      console.error('assignOfferToTask: update failed', error);
      return false;
    }
    // Optionally, mark the accepted offer as accepted and others as rejected (best-effort)
    try {
      await db.from('offers').update({ status: 'accepted' }).eq('id', offerId);
      await db.from('offers').update({ status: 'rejected' }).eq('task_id', taskId).neq('id', offerId);
    } catch {}
    return true;
  } catch (e) {
    return false;
  }
};

// Worker cancels an in-progress task they are assigned to
export const cancelAssignedTaskByWorker = async (taskId: string, workerId: string, reason: string): Promise<boolean> => {
  try {
    const { data: task, error: tErr } = await db.from('tasks').select('id,assigned_to,status,user_id,title').eq('id', taskId).single();
    if (tErr || !task) return false;
    if (task.assigned_to !== workerId || task.status !== 'in_progress') return false;
    const { error } = await db
      .from('tasks')
      .update({ assigned_to: null, status: 'open' })
      .eq('id', taskId);
    if (error) return false;
    try {
      await db.from('task_cancellations').insert({ task_id: taskId, cancelled_by: workerId, reason, created_at: new Date().toISOString() });
      // Notify owner
      const { data: owner } = await db.from('profiles').select('expo_push_token,full_name').eq('id', task.user_id).single();
      if ((owner as any)?.expo_push_token) {
        await sendPushNotification((owner as any).expo_push_token, 'Worker cancelled job', `A worker cancelled: ${task.title || 'your task'}`, { type: 'cancel', taskId });
      }
    } catch {}
    return true;
  } catch {
    return false;
  }
};

// Owner finishes a task (simulated until QR flow is fully wired)
export const finishTaskByOwner = async (taskId: string, ownerId: string): Promise<boolean> => {
  try {
    const { data: task, error: tErr } = await db.from('tasks').select('id,user_id,status,assigned_to,title').eq('id', taskId).single();
    if (tErr || !task) return false;
    if (task.user_id !== ownerId) return false;
    const { error } = await db
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId);
    if (error) return false;
    // Notify both owner and worker (if any)
    try {
      const tokens: string[] = [];
      const { data: owner } = await db.from('profiles').select('expo_push_token').eq('id', ownerId).single();
      if ((owner as any)?.expo_push_token) tokens.push((owner as any).expo_push_token);
      if (task.assigned_to) {
        const { data: worker } = await db.from('profiles').select('expo_push_token').eq('id', task.assigned_to as string).single();
        if ((worker as any)?.expo_push_token) tokens.push((worker as any).expo_push_token);
      }
      if (tokens.length > 0) {
        await sendPushNotification(tokens, 'Task completed', `${task.title || 'Task'} was completed`, { type: 'completed', taskId });
      }
    } catch {}
    return true;
  } catch {
    return false;
  }
};

// Owner cancels their task (open or in_progress). Notifies assigned worker if any.
export const cancelTaskByOwner = async (taskId: string, ownerId: string, reason?: string): Promise<boolean> => {
  try {
    const { data: task, error: tErr } = await db.from('tasks').select('id,user_id,status,assigned_to,title').eq('id', taskId).single();
    if (tErr || !task) return false;
    if (task.user_id !== ownerId) return false;
    const { error } = await db
      .from('tasks')
      .update({ status: 'cancelled', assigned_to: null })
      .eq('id', taskId);
    if (error) return false;
    try {
      await db.from('task_cancellations').insert({ task_id: taskId, cancelled_by: ownerId, reason: reason || null, created_at: new Date().toISOString() });
    } catch {}
    // Notify worker if assigned
    try {
      if (task.assigned_to) {
        const { data: worker } = await db.from('profiles').select('expo_push_token').eq('id', task.assigned_to as string).single();
        if ((worker as any)?.expo_push_token) {
          await sendPushNotification((worker as any).expo_push_token, 'Task was cancelled', `${task.title || 'Task'} was cancelled by owner`, { type: 'cancel', taskId });
        }
      }
    } catch {}
    return true;
  } catch {
    return false;
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
      // Best-effort notify task owner in demo (if available)
      try {
        const { data: taskRow } = await db.from('tasks').select('user_id,title').eq('id', offerData.task_id).single();
        if (taskRow?.user_id) {
          const { data: owner } = await db.from('profiles').select('expo_push_token,full_name').eq('id', taskRow.user_id).single();
          if ((owner as any)?.expo_push_token) {
            await sendPushNotification((owner as any).expo_push_token, 'New offer received', `${(owner as any).full_name || 'Someone'} sent an offer for ${taskRow.title || 'your task'}`, { type: 'offer', taskId: offerData.task_id, screen: 'task', params: { id: offerData.task_id } });
          }
        }
      } catch {}
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
    if (!userId) {
      console.warn('fetchUserProfile called with null/undefined userId');
      return null;
    }
    
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('User profile not found in DB for', userId);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Reviews with context for rank screen
export type UserReviewWithContext = {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  task_id: string;
  task_title?: string;
  task_status?: string;
  payment_amount?: number;
  payment_status?: string;
  reviewer_name?: string;
};

export const fetchReviewsForUserWithContext = async (userId: string): Promise<UserReviewWithContext[]> => {
  try {
    // In demo mode, synthesize a few reviews based on MOCK_TASKS
    if (isDemoMode()) {
      const created = await loadDemoTasks();
      const combined = [...created, ...MOCK_TASKS];
      const demo: UserReviewWithContext[] = combined.slice(0, 16).map((t, idx) => ({
        id: `rev-${t.id}`,
        rating: 4 + ((idx % 2) as number),
        comment: idx % 3 === 0 ? 'Excelente trabajo, muy puntual.' : 'Buen trabajo, podría mejorar la comunicación.',
        created_at: new Date(Date.now() - idx * 86400000).toISOString(),
        task_id: t.id,
        task_title: t.title,
        task_status: t.status,
        payment_amount: 8000 + (idx % 5) * 1500,
        payment_status: 'completed',
        reviewer_name: `Cliente ${idx + 1}`,
      }));
      return demo;
    }

    const { data: reviews, error: revErr } = await db
      .from('reviews')
      .select('*')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false });
    if (revErr || !reviews) return [];

    const enriched: UserReviewWithContext[] = await Promise.all(
      reviews.map(async (r: any) => {
        const [taskRes, payRes, reviewerRes] = await Promise.all([
          db.from('tasks').select('id,title,status').eq('id', r.task_id).single(),
          db.from('payments').select('amount,status,task_id,payee_id').eq('task_id', r.task_id).eq('payee_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
          db.from('profiles').select('full_name').eq('id', r.reviewer_id).single(),
        ]);
        const task = taskRes.data as any;
        const pay = (payRes as any)?.data as any;
        const reviewer = reviewerRes.data as any;
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          task_id: r.task_id,
          task_title: task?.title,
          task_status: task?.status,
          payment_amount: pay?.amount,
          payment_status: pay?.status,
          reviewer_name: reviewer?.full_name,
        };
      })
    );
    return enriched;
  } catch (e) {
    return [];
  }
};

// Payments counts (made as payer, received as payee)
export const fetchPaymentsCountsForUser = async (userId: string): Promise<{ made: number; received: number }> => {
  try {
    if (isDemoMode()) {
      // Deterministic pseudo-counts for demo mode
      let h = 0;
      for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
      const made = (h % 7) + 3; // 3..9
      const received = (h % 11) + 5; // 5..15
      return { made, received };
    }

    const madeRes = await db
      .from('payments')
      .select('id')
      .eq('payer_id', userId);
    const receivedRes = await db
      .from('payments')
      .select('id')
      .eq('payee_id', userId);

    const made = Array.isArray(madeRes.data) ? madeRes.data.length : 0;
    const received = Array.isArray(receivedRes.data) ? receivedRes.data.length : 0;
    return { made, received };
  } catch (e) {
    return { made: 0, received: 0 };
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

// Rank/Progress persistence
export type UserProgress = {
  user_id: string;
  xp: number;
  level: number;
  rank: string;
  badges: string[];
  updated_at?: string;
};

export const fetchUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    if (isDemoMode()) {
      // Deterministic demo progress based on userId
      let h = 0;
      for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
      const level = 10 + (h % 25); // 10..34
      const ranks = ['Novato','Aprendiz','Oficial','Experto'];
      const rank = ranks[Math.min(ranks.length - 1, Math.floor(level / 10))] || 'Novato';
      const badgePool = ['first-job','hundred-wins','five-stars','category-master','attendance','fast-responder','trusted','on-time'];
      // Ensure at least 3 badges per user in demo
      let badges = badgePool.filter((_, idx) => (h >> idx) % 2 === 1);
      if (badges.length < 3) {
        // deterministically add more badges until length >= 3
        for (let i = 0; badges.length < 3 && i < badgePool.length; i++) {
          if (!badges.includes(badgePool[i])) badges.push(badgePool[i]);
        }
      }
      const residual = h % 100; // 0..99 to show graded progress within current level
      return { user_id: userId, xp: level * 100 + residual, level, rank, badges };
    }
    const { data, error } = await db.from('user_progress').select('*').eq('user_id', userId).maybeSingle();
    if (error) return null;
    if (!data) return { user_id: userId, xp: 0, level: 1, rank: 'Novato', badges: [] };
    return { ...data, badges: Array.isArray((data as any).badges) ? (data as any).badges : [] } as UserProgress;
  } catch {
    return null;
  }
};

export const upsertUserProgress = async (progress: UserProgress): Promise<boolean> => {
  try {
    if (isDemoMode()) return true;
    const { error } = await db.from('user_progress').upsert({
      user_id: progress.user_id,
      xp: progress.xp,
      level: progress.level,
      rank: progress.rank,
      badges: progress.badges,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
};

// Demo: seed payments for demo reviews/tasks so history is consistent
async function seedDemoPaymentsForTasks(taskIds: string[], payeeId: string) {
  try {
    // no-op in real DB; demo uses in-memory enrichment only
    return;
  } catch {
    return;
  }
}

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
    // When Supabase is enabled, ONLY fetch from Supabase - no local fallback
    if (useSupabase()) {
      const { data, error } = await db
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks by user from Supabase:', error);
        return [];
      }

      return (data || []) as Task[];
    }

    // Only use local storage when Supabase is disabled (demo mode)
    if (isDemoMode()) {
      const created = await loadDemoTasks();
      const all = [...created, ...MOCK_TASKS];
      if (!userId) return all;
      return all.filter(t => t.user_id === userId);
    }

    return [];
  } catch (error: any) {
    console.error('Error fetching tasks by user:', error);
    return [];
  }
};

// Tasks assigned to a specific user (worker view)
export const fetchTasksAssignedToUser = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching tasks assigned to user:', error);
      return [];
    }
    return (data || []) as Task[];
  } catch (e) {
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

// Android bootstrap helper: seed local tasks if DB is empty
export async function seedLocalTasksIfNeeded(): Promise<boolean> {
  try {
    const local = await loadDemoTasks();
    if (local.length > 0) return false;
    // Probe DB for any tasks; tolerate failures
    try {
      const { data, error } = await db.from('tasks').select('id').limit(1);
      if (!error && Array.isArray(data) && data.length > 0) {
        return false; // DB has data; no need to seed local
      }
    } catch {
      // ignore
    }
    await saveDemoTasks(MOCK_TASKS);
    return true;
  } catch {
    return false;
  }
}