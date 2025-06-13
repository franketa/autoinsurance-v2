#!/usr/bin/env node

// Setup script for staging environment testing
// Run with: node setup-staging.js

const fs = require('fs');
const path = require('path');

const stagingEnv = `# Environment Configuration for STAGING TESTING
# This will use QuoteWizard's staging URL for testing
NODE_ENV=development

# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=smartautoinsider_user
DB_PASSWORD=6UU2^5$dK)2_?^n3K6
DB_NAME=smartautoinsider_db

# QuoteWizard API Configuration
QW_CONTRACT_ID=E29908C1-CA19-4D3D-9F59-703CD5C12649

# Domain Configuration (for local testing)
DOMAIN=localhost:3000
API_URL=http://localhost:5000/api

# URLs being used:
# STAGING: https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead
# PRODUCTION: https://quotewizard.com/LeadAPI/Services/SubmitVendorLead
`;

const envPath = path.join(__dirname, '.env');

console.log('🔧 Setting up staging environment for QuoteWizard testing...\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('📁 Current content:');
  try {
    const currentEnv = fs.readFileSync(envPath, 'utf8');
    console.log(currentEnv);
  } catch (error) {
    console.log('❌ Error reading current .env file');
  }
  
  console.log('\n❓ Do you want to overwrite it with staging configuration?');
  console.log('   If yes, delete the current .env file and run this script again.');
  console.log('   Or manually update NODE_ENV=development in your .env file');
  return;
}

// Create .env file
try {
  fs.writeFileSync(envPath, stagingEnv, 'utf8');
  console.log('✅ Created .env file with staging configuration');
  console.log('📁 Location:', envPath);
  console.log('\n🔍 Environment details:');
  console.log('   • NODE_ENV: development (uses STAGING URLs)');
  console.log('   • QuoteWizard URL: https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead');
  console.log('   • Database: localhost (for local testing)');
  console.log('\n🚀 Next steps:');
  console.log('   1. Start your server: npm run server');
  console.log('   2. Test with staging: node test-local.js');
  console.log('   3. Or run multiple tests: node test-multiple.js');
  console.log('\n💡 The staging environment should be more accepting of test data!');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Manual setup:');
  console.log('Create a .env file in your project root with this content:');
  console.log('\n' + stagingEnv);
} 