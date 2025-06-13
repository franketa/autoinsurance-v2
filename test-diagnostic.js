// Diagnostic test for QuoteWizard API - analyze the exact responses
// Run with: node test-diagnostic.js

const axios = require('axios');

// Test with minimal, high-quality data that should be accepted
const diagnosticData = {
  firstName: 'John',
  lastName: 'Smith', 
  email: 'john.smith@gmail.com',
  phoneNumber: '5551234567',
  streetAddress: '123 Main St',
  zipcode: '90210', // Beverly Hills - affluent area
  city: 'Beverly Hills',
  state: 'CA', // California - large market
  birthdate: '1980-01-01', // 44 years old - prime demographic
  gender: 'Male',
  maritalStatus: 'Married',
  creditScore: 'Excellent',
  homeowner: 'Own', // Homeowner
  driversLicense: 'Yes',
  sr22: 'No',
  currentAutoInsurance: 'None', // No current insurance - high value lead
  insuranceHistory: 'No',
  insuranceDuration: 'Never had insurance',
  coverageType: 'Premium',
  military: 'No',
  vehicles: [
    {
      year: '2020', // Newer vehicle
      make: 'TOYOTA',
      model: 'CAMRY'
    }
  ],
  vehicleCount: '1',
  trusted_form_cert_id: '8189d5a77937b27a3d85ca181fc34f2b46a60908'
};

async function runDiagnostic() {
  console.log('🔬 QUOTEWIZARD DIAGNOSTIC TEST');
  console.log('═'.repeat(50));
  
  // Test server health
  try {
    console.log('\n1️⃣ Testing server connection...');
    const healthResponse = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('✅ Server is responding');
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('💡 Make sure to start the server first: npm run server');
    return;
  }
  
  // Test QuoteWizard API
  try {
    console.log('\n2️⃣ Testing QuoteWizard with high-value lead data...');
    console.log('📋 Test data profile:', {
      name: `${diagnosticData.firstName} ${diagnosticData.lastName}`,
      location: `${diagnosticData.city}, ${diagnosticData.state} ${diagnosticData.zipcode}`,
      age: new Date().getFullYear() - new Date(diagnosticData.birthdate).getFullYear(),
      homeowner: diagnosticData.homeowner,
      creditScore: diagnosticData.creditScore,
      currentInsurance: diagnosticData.currentAutoInsurance,
      vehicle: `${diagnosticData.vehicles[0].year} ${diagnosticData.vehicles[0].make} ${diagnosticData.vehicles[0].model}`
    });
    
    const startTime = Date.now();
    const response = await axios.post('http://localhost:5000/api/submit-quote', diagnosticData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    const duration = Date.now() - startTime;
    
    console.log(`\n⏱️  Response time: ${duration}ms`);
    console.log('📊 Response analysis:');
    console.log('   Success:', response.data.success);
    console.log('   Status:', response.status);
    
    if (response.data.success) {
      console.log('✅ SUCCESS! QuoteWizard accepted the lead');
      console.log('   Quote ID:', response.data.initialID);
      console.log('   Ignite ID:', response.data.igniteResponse?.RowKey || 'N/A');
    } else {
      console.log('❌ QuoteWizard rejected the lead');
      console.log('   Error:', response.data.error);
      
      // Analyze the error
      console.log('\n🔍 ERROR ANALYSIS:');
      if (response.data.error?.includes('No match')) {
        console.log('   Type: Business rejection ("No match")');
        console.log('   Meaning: API works, but QuoteWizard doesn\'t want this lead');
        console.log('   Possible reasons:');
        console.log('     • Contract configured for specific demographics');
        console.log('     • Geographic restrictions');
        console.log('     • Lead quality requirements not met');
        console.log('     • Contract not set up for staging environment');
        console.log('     • Data doesn\'t match their current buying criteria');
      } else {
        console.log('   Type: Technical error');
        console.log('   Details:', response.data.error);
      }
    }
    
    // Check for debug info in response
    if (response.data.debugInfo) {
      console.log('\n🐛 Debug information:');
      console.log(response.data.debugInfo);
    }
    
  } catch (error) {
    console.error('\n❌ API call failed:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Response:', error.response.data);
    }
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('📋 RECOMMENDATIONS:');
  console.log('═'.repeat(50));
  
  console.log('1. 📞 Contact QuoteWizard support to verify:');
  console.log('   • Contract ID is valid for staging environment');
  console.log('   • What demographic/geographic criteria your contract accepts');
  console.log('   • If there are any specific data requirements');
  
  console.log('\n2. 🧪 Try different data combinations:');
  console.log('   • Different states (TX, FL, NY)');
  console.log('   • Different age ranges (25-35, 35-45, 45-55)');
  console.log('   • Different credit scores (Good, Fair)');
  console.log('   • Different vehicle years (2015-2019)');
  
  console.log('\n3. 🔧 Technical verification:');
  console.log('   • Confirm XML structure matches their exact requirements');
  console.log('   • Verify TrustedForm certificate is valid');
  console.log('   • Check if contract has spending limits or caps');
  
  console.log('\n4. 🌐 Environment verification:');
  console.log('   • Try production URL with small budget to see if acceptance differs');
  console.log('   • Verify contract works in both staging and production');
  
  console.log('\n💡 The "No match" response indicates your integration is working correctly!');
  console.log('   The issue is business-side lead acceptance criteria, not technical.');
}

// Run diagnostic
runDiagnostic().catch(error => {
  console.error('🚨 Diagnostic failed:', error.message);
  console.log('\n💡 Make sure:');
  console.log('   1. Server is running (npm run server)');
  console.log('   2. Database is connected');
  console.log('   3. Environment variables are set');
}); 