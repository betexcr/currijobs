#!/usr/bin/env node

const { testSupabaseConnection, testSupabaseAuth, testSupabaseTables, testSupabaseNetwork } = require('../lib/supabase-test.ts');

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
    console.log('📡 Testing Supabase connection...');
    results.connection = await testSupabaseConnection();
    console.log('Connection test result:', results.connection);
    
    // Test 2: Authentication
    console.log('🔐 Testing Supabase authentication...');
    results.auth = await testSupabaseAuth();
    console.log('Auth test result:', results.auth);
    
    // Test 3: Database tables
    console.log('🗄️ Testing database tables...');
    results.tables = await testSupabaseTables();
    console.log('Tables test result:', results.tables);
    
    // Test 4: Network connectivity
    console.log('🌐 Testing network connectivity...');
    results.network = await testSupabaseNetwork();
    console.log('Network test result:', results.network);
    
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
