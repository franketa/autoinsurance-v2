// Test script for QuoteWizard API integration
// Run with: node server/test-api.js

const axios = require('axios');

const testData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '555-123-4567',
  streetAddress: '123 Main Street',
  zipcode: '12345',
  birthdate: '1985-06-15',
  gender: 'Male',
  maritalStatus: 'Married',
  creditScore: 'Excellent',
  homeowner: 'Own',
  driversLicense: 'Yes',
  sr22: 'No',
  currentAutoInsurance: 'State Farm',
  insuranceHistory: 'Yes',
  insuranceDuration: '3+ years',
  coverageType: 'Full Coverage',
  military: 'No',
  vehicles: [
    {
      year: '2020',
      make: 'Toyota',
      model: 'Camry'
    },
    {
      year: '2018',
      make: 'Honda',
      model: 'Civic'
    }
  ],
  vehicleCount: '2',
  trusted_form_cert_id: 'test-cert-123'
};

async function testAPI() {
  try {
    console.log('Testing QuoteWizard API integration...\n');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
    
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:5000/api/submit-quote', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ API Response received in', duration, 'ms');
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n🎉 Test completed successfully!');
      console.log('Quote ID:', response.data.initialID);
    } else {
      console.log('\n❌ Test failed:', response.data.error);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running on port 5000?');
      console.error('Error:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
  }
}

async function testHealthCheck() {
  try {
    console.log('Testing health check endpoint...');
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🔬 Starting API Integration Tests\n');
  
  // Test health check first
  const healthOk = await testHealthCheck();
  
  if (!healthOk) {
    console.log('\n❌ Server is not responding. Please ensure:');
    console.log('1. The server is running (npm run server)');
    console.log('2. The database is configured correctly');
    console.log('3. The server is listening on port 5000');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test the main API
  await testAPI();
  
  console.log('\n🏁 Test suite completed');
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { testAPI, testHealthCheck }; 