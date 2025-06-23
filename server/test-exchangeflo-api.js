// Test script for ExchangeFlo API integration (Ping + Post flow)
// Run with: node server/test-exchangeflo-api.js

const axios = require('axios');

// Test configuration
const API_CONFIG = {
  ping_url: 'https://pub.exchangeflo.io/api/leads/ping',
  post_url: 'https://pub.exchangeflo.io/api/leads/post',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 570ff8ba-26b3-44dc-b880-33042485e9d0'
  },
  timeout: 30000
};

// Mock form data for testing
const testFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  phoneNumber: '555-123-4567',
  streetAddress: '123 Main Street',
  zipcode: '12345',
  city: 'Boston',
  state: 'MA',
  birthdate: '1985-06-15',
  gender: 'Male',
  maritalStatus: 'Married',
  creditScore: 'Excellent',
  homeowner: 'Own',
  driversLicense: 'Yes',
  sr22: 'No',
  insuranceHistory: 'Yes',
  currentAutoInsurance: 'State Farm',
  insuranceDuration: '3+ years',
  coverageType: 'Full Coverage',
  military: 'No',
  driverRelationship: 'self',
  driverEducation: 'bachelors_degree',
  driverOccupation: 'engineer',
  vehicles: [
    {
      year: '2020',
      make: 'Toyota',
      model: 'Camry',
      purpose: 'commute',
      mileage: '10000-15000',
      ownership: 'owned'
    }
  ]
};

// Helper functions (same as in App.js)
const mapInsuranceDuration = (duration) => {
  switch (duration) {
    case 'Less than 6 months': return "3";
    case '6-12 months': return "9";
    case '1-3 years': return "24";
    case '3+ years': return "48";
    default: return "24";
  }
};

const mapCoverageType = (coverage) => {
  switch (coverage) {
    case 'Liability Only': return "liability";
    case 'Full Coverage': return "typical";
    default: return "typical";
  }
};

const mapCreditScore = (score) => {
  switch (score) {
    case 'Excellent': return "excellent";
    case 'Good': return "good";
    case 'Fair': return "fair";
    case 'Poor': return "poor";
    default: return "good";
  }
};

const mapMaritalStatus = (status) => {
  switch (status) {
    case 'Yes': return "married";
    case 'No': return "single";
    default: return "single";
  }
};

const mapHomeowner = (homeowner) => {
  switch (homeowner) {
    case 'Own': return "own";
    case 'Rent': return "rent";
    default: return "rent";
  }
};

// Generate ping data from form data
function generatePingData(formData) {
  const activeVehicles = formData.vehicles.filter(v => v.year && v.make && v.model);
  
  return {
    "source_id": "aaf3cd79-1fc5-43f6-86bc-d86d9d61c0d5",
    "response_type": "detail",
    "lead_type": "mixed",
    "tracking_id": `test_track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    "sub_id_1": "smartautoinsider_test",
    "jornaya_leadid": "01234567-89AB-CDEF-0123-456789ABCDEF",
    "trusted_form_cert_url": "https://cert.trustedform.com/0123456789abcdef0123456789abcdef01234567",
    "ip_address": "127.0.0.1",
    "landing_url": "smartautoinsider.com",
    "privacy_url": "smartautoinsider.com/privacy",
    "tcpa": "Test TCPA agreement text",
    "user_agent": "Node.js Test Script/1.0",
    "profile": {
      "zip": formData.zipcode,
      "address_2": "",
      "currently_insured": formData.insuranceHistory === 'Yes' ? "true" : "false",
      "current_company": formData.currentAutoInsurance || "Unknown",
      "continuous_coverage": mapInsuranceDuration(formData.insuranceDuration),
      "current_policy_start": "2021-02-07",
      "current_policy_expires": "2024-04-28",
      "military_affiliation": formData.military === 'Yes' ? "true" : "false",
      "auto_coverage_type": mapCoverageType(formData.coverageType),
      "driver_count": "1",
      "vehicle_count": activeVehicles.length.toString(),
      "drivers": [
        {
          "relationship": formData.driverRelationship || "self",
          "gender": formData.gender?.toLowerCase() || "male",
          "birth_date": formData.birthdate,
          "at_fault_accidents": "0",
          "license_suspended": "false",
          "tickets": "0",
          "dui_sr22": formData.sr22 === 'Yes' ? "true" : "false",
          "education": formData.driverEducation || "some_college",
          "credit": mapCreditScore(formData.creditScore),
          "occupation": formData.driverOccupation || "other_non_technical",
          "marital_status": mapMaritalStatus(formData.maritalStatus),
          "license_state": formData.state || "CA",
          "licensed_age": "16",
          "license_status": formData.driversLicense === 'Yes' ? "active" : "inactive",
          "residence_type": mapHomeowner(formData.homeowner),
          "residence_length": "24"
        }
      ],
      "vehicles": activeVehicles.map(vehicle => ({
        "year": vehicle.year,
        "make": vehicle.make,
        "model": vehicle.model,
        "submodel": "Base",
        "primary_purpose": vehicle.purpose || "pleasure",
        "annual_mileage": vehicle.mileage || "10000-15000",
        "ownership": vehicle.ownership || "owned",
        "garage": "no_cover",
        "vin": "1HGBH41J*YM******"
      }))
    }
  };
}

// Generate post data from ping response and form data
function generatePostData(submission_id, ping_ids, formData) {
  return {
    submission_id,
    ping_ids,
    profile: {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phoneNumber,
      address: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      drivers: [
        {
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      ]
    }
  };
}

// Test ping request
async function testPingRequest(formData) {
  console.log('\n📡 Testing Ping Request...');
  console.log('=====================================');
  
  const pingData = generatePingData(formData);
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(API_CONFIG.ping_url, pingData, {
      headers: API_CONFIG.headers,
      timeout: API_CONFIG.timeout
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Ping request successful in ${duration}ms`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Validate response structure
    const { submission_id, status, pings } = response.data;
    
    if (status !== 'success') {
      throw new Error(`Ping failed with status: ${status}`);
    }
    
    if (!submission_id) {
      throw new Error('Missing submission_id in response');
    }
    
    if (!pings || !Array.isArray(pings)) {
      throw new Error('Missing or invalid pings array in response');
    }
    
    console.log(`\n📊 Ping Analysis:`);
    console.log(`  Submission ID: ${submission_id}`);
    console.log(`  Total Pings: ${pings.length}`);
    
    pings.forEach((ping, index) => {
      console.log(`  Ping ${index + 1}: ${ping.type} - $${ping.value} (ID: ${ping.ping_id.substring(0, 8)}...)`);
      if (ping.buyer) {
        console.log(`    Buyer: ${ping.buyer}`);
      }
    });
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('❌ Ping request failed:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Response:`, error.response.data);
    } else {
      console.error(`  Error: ${error.message}`);
    }
    return { success: false, error };
  }
}

// Test post request
async function testPostRequest(pingResult, formData) {
  console.log('\n📮 Testing Post Request...');
  console.log('=====================================');
  
  const { submission_id, pings } = pingResult.data;
  
  // Extract ping_ids (exclusive pings first)
  const exclusivePings = pings.filter(ping => ping.type === 'exclusive');
  const sharedPings = pings.filter(ping => ping.type === 'shared');
  const pingsToPost = exclusivePings.length > 0 ? exclusivePings : sharedPings;
  const ping_ids = pingsToPost.map(ping => ping.ping_id);
  
  if (ping_ids.length === 0) {
    console.log('⚠️ No valid ping_ids found, skipping post request');
    return { success: true, skipped: true };
  }
  
  const postData = generatePostData(submission_id, ping_ids, formData);
  console.log(`Posting to ${ping_ids.length} ping(s)...`);
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(API_CONFIG.post_url, postData, {
      headers: API_CONFIG.headers,
      timeout: API_CONFIG.timeout
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Post request successful in ${duration}ms`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Analyze results
    const { status, value, results } = response.data;
    
    console.log(`\n📊 Post Analysis:`);
    console.log(`  Status: ${status}`);
    console.log(`  Total Value: $${value || 0}`);
    
    if (results && Array.isArray(results)) {
      console.log(`  Results (${results.length}):`);
      results.forEach((result, index) => {
        console.log(`    ${index + 1}. ${result.result} - ${result.type} - $${result.value} (${result.ping_id.substring(0, 8)}...)`);
        if (result.error) {
          console.log(`       Error: ${result.error}`);
        }
      });
    }
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('❌ Post request failed:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Response:`, error.response.data);
    } else {
      console.error(`  Error: ${error.message}`);
    }
    return { success: false, error };
  }
}

// Main test function
async function runCompleteTest() {
  console.log('🧪 ExchangeFlo API Integration Test');
  console.log('====================================');
  console.log(`Using test data for: ${testFormData.firstName} ${testFormData.lastName}`);
  console.log(`Vehicle: ${testFormData.vehicles[0].year} ${testFormData.vehicles[0].make} ${testFormData.vehicles[0].model}`);
  
  try {
    // Step 1: Test ping request
    const pingResult = await testPingRequest(testFormData);
    
    if (!pingResult.success) {
      console.log('\n❌ Ping test failed, skipping post test');
      return false;
    }
    
    // Step 2: Test post request
    const postResult = await testPostRequest(pingResult, testFormData);
    
    if (!postResult.success && !postResult.skipped) {
      console.log('\n❌ Post test failed');
      return false;
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  ✅ Ping Request: Success`);
    console.log(`  ✅ Post Request: ${postResult.skipped ? 'Skipped (no pings)' : 'Success'}`);
    
    return true;
    
  } catch (error) {
    console.error('\n💥 Test suite failed with unexpected error:', error.message);
    return false;
  }
}

// Health check for API availability
async function testHealthCheck() {
  console.log('🏥 Testing API health...');
  try {
    // Test our local server health
    const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('✅ Local server health check passed');
    return true;
  } catch (error) {
    console.log('❌ Local server health check failed:', error.message);
    console.log('Make sure the server is running: npm run server');
    return false;
  }
}

// Run tests
async function main() {
  console.log('🚀 Starting ExchangeFlo API Test Suite\n');
  
  // Check local server health
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n⚠️ Local server is not available. Some logging features may not work.');
    console.log('Continue with API tests? The main functionality will still work.\n');
  }
  
  console.log('='.repeat(50));
  
  // Run the complete test
  const success = await runCompleteTest();
  
  console.log('\n' + '='.repeat(50));
  console.log(`🏁 Test suite ${success ? 'PASSED' : 'FAILED'}`);
  
  if (!success) {
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error in test suite:', error);
    process.exit(1);
  });
}

module.exports = { 
  testPingRequest, 
  testPostRequest, 
  runCompleteTest,
  generatePingData,
  generatePostData
}; 