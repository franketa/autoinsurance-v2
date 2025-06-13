// Local test script for QuoteWizard API integration
// Run with: node test-local.js

const axios = require('axios');

const testData = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@gmail.com',
  phoneNumber: '3125551234', // Different area code
  streetAddress: '456 Oak Avenue',
  zipcode: '60601', // Chicago ZIP
  city: 'Chicago',
  state: 'IL', // Different state
  birthdate: '1980-03-20', // Different age bracket
  gender: 'Female',
  maritalStatus: 'Single',
  creditScore: 'Good', // Changed from Excellent
  homeowner: 'Rent', // Changed from Own
  driversLicense: 'Yes',
  sr22: 'No',
  currentAutoInsurance: 'Geico', // Different insurance company
  insuranceHistory: 'Yes',
  insuranceDuration: '1-2 years', // Different duration
  coverageType: 'Premium',
  military: 'No',
  vehicles: [
    {
      year: '2018', // Slightly older vehicle
      make: 'HONDA',
      model: 'CIVIC'
    }
  ],
  vehicleCount: '1',
  trusted_form_cert_id: '8189d5a77937b27a3d85ca181fc34f2b46a60908'
};

async function testAPI() {
  try {
    console.log('🧪 Testing QuoteWizard API integration locally...\n');
    console.log('📋 Test data:', JSON.stringify(testData, null, 2));
    console.log('\n' + '='.repeat(60) + '\n');
    
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:5000/api/submit-quote', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 second timeout
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ API Response received in', duration, 'ms');
    console.log('\n📊 Response Status:', response.status);
    
    if (response.data.success) {
      console.log('\n🎉 Test completed successfully!');
      console.log('📋 Quote ID:', response.data.initialID);
      console.log('📋 Ping Response Length:', response.data.ping?.response?.length || 0);
      console.log('📋 Post Response Length:', response.data.post?.response?.length || 0);
    } else {
      console.log('\n❌ Test failed:', response.data.error);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    
    if (error.response) {
      console.error('🔍 Status:', error.response.status);
      console.error('🔍 Status Text:', error.response.statusText);
      console.error('🔍 Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('🔍 No response received. Is the server running on port 5000?');
      console.error('🔍 Error:', error.message);
    } else {
      console.error('🔍 Request setup error:', error.message);
    }
  }
}

// Health check first
async function healthCheck() {
  try {
    console.log('🏥 Checking server health...');
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Server is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Local QuoteWizard API Tests\n');
  
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    console.log('\n💡 Make sure your server is running with: npm run server');
    return;
  }
  
  console.log('');
  await testAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test completed!');
}

runTests().catch(console.error); 