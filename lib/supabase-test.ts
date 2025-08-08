import { db, auth } from './supabase-lightweight';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', 'https://fpvrlhubpwrslsuopuwr.supabase.co');
    console.log('Supabase Key length:', 219);
    
    // Test basic connection with more detailed error handling
    const { data, error } = await db
      .from('tasks')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message, details: error };
    }
    
    console.log('Supabase connection successful!');
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection failed with exception:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message, exception: true };
  }
};

export const testSupabaseAuth = async () => {
  try {
    console.log('Testing Supabase auth...');
    
    const { data, error } = await auth.getSession();
    
    if (error) {
      console.error('Supabase auth error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message, details: error };
    }
    
    console.log('Supabase auth working!');
    return { success: true, data };
  } catch (error) {
    console.error('Supabase auth failed with exception:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message, exception: true };
  }
};

export const testSupabaseTables = async () => {
  try {
    console.log('Testing Supabase tables...');
    
    // Test if tasks table exists
    const { data: tasksData, error: tasksError } = await db
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.error('Tasks table error details:', {
        message: tasksError.message,
        details: tasksError.details,
        hint: tasksError.hint,
        code: tasksError.code
      });
      return { 
        success: false, 
        error: `Tasks table: ${tasksError.message}`,
        details: tasksError,
        tables: { tasks: false, offers: false, profiles: false }
      };
    }
    
    // Test if offers table exists
    const { data: offersData, error: offersError } = await db
      .from('offers')
      .select('*')
      .limit(1);
    
    // Test if profiles table exists
    const { data: profilesData, error: profilesError } = await db
      .from('profiles')
      .select('*')
      .limit(1);
    
    const tableStatus = {
      tasks: !tasksError,
      offers: !offersError,
      profiles: !profilesError
    };
    
    console.log('Table status:', tableStatus);
    
    if (offersError) {
      console.error('Offers table error:', offersError.message);
    }
    if (profilesError) {
      console.error('Profiles table error:', profilesError.message);
    }
    
    return { success: true, tables: tableStatus };
  } catch (error) {
    console.error('Supabase tables test failed with exception:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message, exception: true };
  }
};

export const testSupabaseNetwork = async () => {
  try {
    console.log('Testing network connectivity to Supabase...');
    
    // Test basic HTTP connectivity
    const response = await fetch('https://fpvrlhubpwrslsuopuwr.supabase.co/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA'
      }
    });
    
    console.log('Network response status:', response.status);
    console.log('Network response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Network error response:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
    
    return { success: true, status: response.status };
  } catch (error) {
    console.error('Network connectivity test failed:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
};
