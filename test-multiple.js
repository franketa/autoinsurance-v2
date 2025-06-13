// Multiple test data sets for QuoteWizard API integration
// Run with: node test-multiple.js

const axios = require('axios');

const testDataSets = [
  {
    name: 'Test 1: Chicago Female Renter',
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@gmail.com',
      phoneNumber: '3125551234',
      streetAddress: '456 Oak Avenue',
      zipcode: '60601',
      city: 'Chicago',
      state: 'IL',
      birthdate: '1980-03-20',
      gender: 'Female',
      maritalStatus: 'Single',
      creditScore: 'Good',
      homeowner: 'Rent',
      driversLicense: 'Yes',
      sr22: 'No',
      currentAutoInsurance: 'Geico',
      insuranceHistory: 'Yes',
      insuranceDuration: '1-2 years',
      coverageType: 'Premium',
      military: 'No',
      vehicles: [{ year: '2018', make: 'HONDA', model: 'CIVIC' }],
      vehicleCount: '1',
      trusted_form_cert_id: '8189d5a77937b27a3d85ca181fc34f2b46a60908'
    }
  },
  {
    name: 'Test 2: Texas Male Homeowner',
    data: {
      firstName: 'Michael',
      lastName: 'Rodriguez',
      email: 'michael.rodriguez@yahoo.com',
      phoneNumber: '2145551234',
      streetAddress: '789 Elm Street',
      zipcode: '75201',
      city: 'Dallas',
      state: 'TX',
      birthdate: '1975-08-15',
      gender: 'Male',
      maritalStatus: 'Married',
      creditScore: 'Excellent',
      homeowner: 'Own',
      driversLicense: 'Yes',
      sr22: 'No',
      currentAutoInsurance: 'State Farm',
      insuranceHistory: 'Yes',
      insuranceDuration: '3+ years',
      coverageType: 'Premium',
      military: 'No',
      vehicles: [{ year: '2019', make: 'FORD', model: 'F-150' }],
      vehicleCount: '1',
      trusted_form_cert_id: '8189d5a77937b27a3d85ca181fc34f2b46a60908'
    }
  },
  {
    name: 'Test 3: Florida Young Driver',
    data: {
      firstName: 'Jessica',
      lastName: 'Martinez',
      email: 'jessica.martinez@hotmail.com',
      phoneNumber: '3055551234',
      streetAddress: '321 Palm Drive',
      zipcode: '33101',
      city: 'Miami',
      state: 'FL',
      birthdate: '1995-12-10',
      gender: 'Female',
      maritalStatus: 'Single',
      creditScore: 'Fair',
      homeowner: 'Rent',
      driversLicense: 'Yes',
      sr22: 'No',
      currentAutoInsurance: 'Progressive',
      insuranceHistory: 'No',
      insuranceDuration: 'Never had insurance',
      coverageType: 'Premium',
      military: 'No',
      vehicles: [{ year: '2015', make: 'TOYOTA', model: 'COROLLA' }],
      vehicleCount: '1',
      trusted_form_cert_id: '8189d5a77937b27a3d85ca181fc34f2b46a60908'
    }
  }
];

async function testSingleDataSet(testSet) {
  try {
    console.log(`\n🧪 ${testSet.name}`);
    console.log('📋 Testing with data:', {
      name: `${testSet.data.firstName} ${testSet.data.lastName}`,
      location: `${testSet.data.city}, ${testSet.data.state}`,
      age: new Date().getFullYear() - new Date(testSet.data.birthdate).getFullYear(),
      vehicle: `${testSet.data.vehicles[0].year} ${testSet.data.vehicles[0].make} ${testSet.data.vehicles[0].model}`
    });
    
    const response = await axios.post('http://localhost:5000/api/submit-quote', testSet.data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log('✅ SUCCESS! Quote ID:', response.data.initialID);
      console.log('💰 This data set was accepted by QuoteWizard');
      return { success: true, testName: testSet.name, quoteId: response.data.initialID };
    } else {
      console.log('❌ Failed:', response.data.error);
      return { success: false, testName: testSet.name, error: response.data.error };
    }
    
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    console.log('❌ Error:', errorMsg);
    return { success: false, testName: testSet.name, error: errorMsg };
  }
}

async function runAllTests() {
  console.log('🚀 Testing Multiple Data Sets with QuoteWizard API\n');
  console.log('🎯 Goal: Find data combinations that QuoteWizard accepts\n');
  
  // Health check first
  try {
    await axios.get('http://localhost:5000/api/health');
    console.log('✅ Server is healthy\n');
  } catch (error) {
    console.error('❌ Server health check failed. Make sure server is running with: npm run server');
    return;
  }
  
  const results = [];
  
  for (const testSet of testDataSets) {
    const result = await testSingleDataSet(testSet);
    results.push(result);
    
    // Wait 2 seconds between tests to be respectful to QuoteWizard
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);
  
  console.log(`✅ Successful tests: ${successes.length}/${results.length}`);
  if (successes.length > 0) {
    console.log('\n🎉 ACCEPTED DATA SETS:');
    successes.forEach(s => console.log(`  ✅ ${s.testName} (Quote ID: ${s.quoteId})`));
  }
  
  if (failures.length > 0) {
    console.log('\n❌ REJECTED DATA SETS:');
    failures.forEach(f => console.log(`  ❌ ${f.testName}: ${f.error}`));
  }
  
  console.log('\n💡 INSIGHTS:');
  if (successes.length === 0) {
    console.log('  - All tests returned "No match" - this could mean:');
    console.log('    • QuoteWizard has strict acceptance criteria');
    console.log('    • Your contract might be configured for specific demographics');
    console.log('    • Test data might not meet their quality standards');
    console.log('    • Geographic restrictions might apply');
  } else {
    console.log('  - Some data sets were accepted! Use successful patterns as a guide');
  }
  
  console.log('\n🔗 Next steps:');
  console.log('  - Check with QuoteWizard about acceptance criteria for your contract');
  console.log('  - Try data from different geographic regions');
  console.log('  - Verify your contract is set up for the test environment');
}

runAllTests().catch(console.error); 