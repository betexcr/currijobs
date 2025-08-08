#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateSchemaConsistency() {
  console.log('🔍 Validating Schema Consistency...');
  
  const errors = [];
  const warnings = [];
  
  try {
    // Check if all required schema files exist
    const requiredFiles = [
      'lib/schemas.ts',
      'lib/types.ts',
      'supabase_schema_complete.sql'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        errors.push(`Missing required file: ${file}`);
      }
    }
    
    // Validate Zod schema exports
    const schemasContent = fs.readFileSync('lib/schemas.ts', 'utf8');
    const requiredSchemas = [
      'TaskSchema',
      'CreateTaskSchema',
      'UpdateTaskSchema',
      'OfferSchema',
      'CreateOfferSchema',
      'UpdateOfferSchema',
      'UserProfileSchema',
      'ReviewSchema',
      'NotificationSchema',
      'PaymentSchema',
      'TaskCategorySchema',
      'TaskStatusSchema',
      'OfferStatusSchema'
    ];
    
    for (const schema of requiredSchemas) {
      if (!schemasContent.includes(`export const ${schema}`)) {
        errors.push(`Missing Zod schema: ${schema}`);
      }
    }
    
    // Validate TypeScript type exports
    const typesContent = fs.readFileSync('lib/types.ts', 'utf8');
    const requiredTypes = [
      'Task',
      'CreateTaskData',
      'UpdateTaskData',
      'Offer',
      'CreateOfferData',
      'UpdateOfferData',
      'UserProfile',
      'TaskCategory',
      'TaskStatus',
      'OfferStatus'
    ];
    
    for (const type of requiredTypes) {
      if (!typesContent.includes(`export type ${type}`)) {
        errors.push(`Missing TypeScript type: ${type}`);
      }
    }
    
    // Validate database schema
    const dbSchemaContent = fs.readFileSync('supabase_schema_complete.sql', 'utf8');
    const requiredTables = [
      'tasks',
      'offers',
      'profiles',
      'reviews',
      'notifications',
      'payments'
    ];
    
    for (const table of requiredTables) {
      if (!dbSchemaContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
        errors.push(`Missing database table: ${table}`);
      }
    }
    
    // Check for naming consistency
    const categoryMismatches = checkCategoryConsistency(schemasContent, dbSchemaContent);
    errors.push(...categoryMismatches);
    
    // Check for field consistency
    const fieldMismatches = checkFieldConsistency(schemasContent, dbSchemaContent);
    warnings.push(...fieldMismatches);
    
    // Report results
    console.log('\n📊 Schema Validation Results:');
    
    if (errors.length === 0) {
      console.log('✅ No critical errors found');
    } else {
      console.log(`❌ Found ${errors.length} critical errors:`);
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️ Found ${warnings.length} warnings:`);
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (errors.length > 0) {
      console.error('\n❌ Schema validation failed!');
      process.exit(1);
    }
    
    console.log('\n✅ Schema validation passed!');
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    process.exit(1);
  }
}

function checkCategoryConsistency(schemasContent, dbSchemaContent) {
  const errors = [];
  
  // Extract categories from Zod schema
  const zodCategories = schemasContent.match(/['"]([^'"]+)['"]/g)?.filter(cat => 
    ['plumbing', 'electrician', 'carpentry', 'painting', 'appliance_repair', 
     'cleaning', 'laundry_ironing', 'cooking', 'grocery_shopping', 'pet_care', 
     'gardening', 'moving_help', 'trash_removal', 'window_washing', 'babysitting', 
     'elderly_care', 'tutoring', 'delivery_errands', 'tech_support', 'photography'].includes(cat.replace(/['"]/g, ''))
  ) || [];
  
  // Extract categories from database schema
  const dbCategories = dbSchemaContent.match(/['"]([^'"]+)['"]/g)?.filter(cat => 
    ['plumbing', 'electrician', 'carpentry', 'painting', 'appliance_repair', 
     'cleaning', 'laundry_ironing', 'cooking', 'grocery_shopping', 'pet_care', 
     'gardening', 'moving_help', 'trash_removal', 'window_washing', 'babysitting', 
     'elderly_care', 'tutoring', 'delivery_errands', 'tech_support', 'photography'].includes(cat.replace(/['"]/g, ''))
  ) || [];
  
  const zodSet = new Set(zodCategories.map(c => c.replace(/['"]/g, '')));
  const dbSet = new Set(dbCategories.map(c => c.replace(/['"]/g, '')));
  
  // Check for mismatches
  for (const category of zodSet) {
    if (!dbSet.has(category)) {
      errors.push(`Category '${category}' exists in Zod schema but not in database`);
    }
  }
  
  for (const category of dbSet) {
    if (!zodSet.has(category)) {
      errors.push(`Category '${category}' exists in database but not in Zod schema`);
    }
  }
  
  return errors;
}

function checkFieldConsistency(schemasContent, dbSchemaContent) {
  const warnings = [];
  
  // Check for common field names
  const commonFields = ['id', 'created_at', 'updated_at', 'title', 'description', 'reward'];
  
  for (const field of commonFields) {
    const zodHasField = schemasContent.includes(`${field}:`);
    const dbHasField = dbSchemaContent.includes(`${field} `);
    
    if (zodHasField && !dbHasField) {
      warnings.push(`Field '${field}' exists in Zod schema but not in database`);
    }
    
    if (dbHasField && !zodHasField) {
      warnings.push(`Field '${field}' exists in database but not in Zod schema`);
    }
  }
  
  return warnings;
}

if (require.main === module) {
  validateSchemaConsistency();
}

module.exports = { validateSchemaConsistency };


