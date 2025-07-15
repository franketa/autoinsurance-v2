const axios = require('axios');

// Sample form data for testing
const testFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '5551234567',
  streetAddress: '123 Main St',
  city: 'Seattle',
  state: 'WA',
  zipcode: '98101',
  birthdate: '1985-06-15',
  gender: 'Male',
  maritalStatus: 'Single',
  creditScore: 'Good',
  homeowner: 'Own',
  military: 'No',
  driverEducation: 'Bachelor\'s Degree',
  driverOccupation: 'Engineer',
  driversLicense: 'Yes',
  sr22: 'No',
  insuranceHistory: 'Yes',
  currentAutoInsurance: 'Geico',
  insuranceDuration: '1-3 years',
  coverageType: 'Full Coverage',
  vehicles: [
    {
      year: '2020',
      make: 'Toyota',
      model: 'Camry',
      purpose: 'commute',
      mileage: '10000-15000',
      ownership: 'owned'
    }
  ],
  trusted_form_cert_id: 'https://cert.trustedform.com/0123456788abcdee0123456789abcdef012345999'
};

async function testPingComparison() {
  try {
    console.log('🧪 Testing ping comparison system...');
    console.log('📋 Test data:', JSON.stringify(testFormData, null, 2));
    
    // Test the ping comparison endpoint
    const response = await axios.post('http://localhost:5000/api/ping-both', testFormData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ping comparison response:', JSON.stringify(response.data, null, 2));
    
    const { winner, comparison, winnerData } = response.data;
    
    console.log('\n🏆 Results Summary:');
    console.log(`QuoteWizard: ${comparison.quotewizard.success ? 'Success' : 'Failed'} - $${comparison.quotewizard.value}`);
    console.log(`ExchangeFlo: ${comparison.exchangeflo.success ? 'Success' : 'Failed'} - $${comparison.exchangeflo.value}`);
    console.log(`Winner: ${winner || 'None'}`);
    
    // If there's a winner, test the post endpoint
    if (winner && winnerData) {
      console.log(`\n🎯 Testing post to winner (${winner})...`);
      
      const postResponse = await axios.post('http://localhost:5000/api/post-winner', {
        winner: winner,
        winnerData: winnerData,
        formData: testFormData
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Post to winner response:', JSON.stringify(postResponse.data, null, 2));
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

// Test health check first
async function testHealthCheck() {
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting ping comparison tests...\n');
  
  // Check if server is running
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.error('❌ Server is not running. Please start the server first.');
    process.exit(1);
  }
  
  // Wait a moment and then run the main test
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testPingComparison();
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testPingComparison, testHealthCheck }; 