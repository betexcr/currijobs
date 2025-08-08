#!/usr/bin/env node

const fetch = require('node-fetch');

const SUPABASE_URL = 'https://fpvrlhubpwrslsuopuwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJsaHVicHdyc2xzdW9wdXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzIyNjEsImV4cCI6MjA2NjE0ODI2MX0.K27ARInEvNheUXpEetwgyLUdeCNy37q-eJkgpDJKusA';

async function testSupabaseConnection() {
  try {
    console.log('📡 Testing Supabase connection...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Supabase connection successful');
    return { success: true, status: response.status };
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testSupabaseAuth() {
  try {
    console.log('🔐 Testing Supabase authentication...');
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Supabase authentication successful');
    return { success: true, status: response.status };
  } catch (error) {
    console.error('❌ Supabase authentication failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testDatabaseTables() {
  try {
    console.log('🗄️ Testing database tables...');
    
    const tables = ['tasks', 'offers', 'profiles', 'reviews', 'notifications', 'payments'];
    const results = {};
    
    for (const table of tables) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        
        results[table] = response.ok;
        console.log(`  ${table}: ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        results[table] = false;
        console.log(`  ${table}: ❌ (${error.message})`);
      }
    }
    
    const allTablesExist = Object.values(results).every(exists => exists);
    console.log(`Database tables test: ${allTablesExist ? '✅ PASSED' : '❌ FAILED'}`);
    
    return { success: allTablesExist, tables: results };
  } catch (error) {
    console.error('❌ Database tables test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testNetworkConnectivity() {
  try {
    console.log('🌐 Testing network connectivity...');
    
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Network connectivity successful');
    return { success: true, status: response.status };
  } catch (error) {
    console.error('❌ Network connectivity failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runApiTests() {
  console.log('🚀 Starting API Tests...');
  
  const results = {
    connection: null,
    auth: null,
    tables: null,
    network: null,
    overall: false
  };
  
  try {
    // Test 1: Basic connection
    results.connection = await testSupabaseConnection();
    
    // Test 2: Authentication
    results.auth = await testSupabaseAuth();
    
    // Test 3: Database tables
    results.tables = await testDatabaseTables();
    
    // Test 4: Network connectivity
    results.network = await testNetworkConnectivity();
    
    // Overall assessment
    results.overall = results.connection?.success && 
                     results.auth?.success && 
                     results.tables?.success && 
                     results.network?.success;
    
    console.log('\n📊 Test Results Summary:');
    console.log('Connection:', results.connection?.success ? '✅' : '❌');
    console.log('Authentication:', results.auth?.success ? '✅' : '❌');
    console.log('Database Tables:', results.tables?.success ? '✅' : '❌');
    console.log('Network:', results.network?.success ? '✅' : '❌');
    console.log('Overall:', results.overall ? '✅ PASSED' : '❌ FAILED');
    
    if (!results.overall) {
      console.error('\n❌ API tests failed!');
      process.exit(1);
    }
    
    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runApiTests();
}

module.exports = { runApiTests };


