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
  phoneNumber: '6035551234',
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
    case 'Liability Only': return "state_minimum";
    case 'Full Coverage': return "typical";
    case 'Minimum Coverage': return "lower_level";
    case 'Premium Coverage': return "highest_level";
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
  // Filter out empty vehicles
  const activeVehicles = formData.vehicles.filter(v => v.year && v.make && v.model);
  
  // Ensure birthdate is in correct format (YYYY-MM-DD)
  const formatBirthdate = (dateStr) => {
    if (!dateStr) return '1985-06-15'; // Default fallback
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Try to parse and reformat
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return '1985-06-15'; // Fallback
  };
  
  // Helper to ensure boolean values are strings
  const toBooleanString = (value) => {
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true') return 'true';
      if (value.toLowerCase() === 'no' || value.toLowerCase() === 'false') return 'false';
    }
    return 'false'; // Default fallback
  };
  
  return {
    // Static source configuration
    "source_id": "aaf3cd79-1fc5-43f6-86bc-d86d9d61c0d5",
    "response_type": "detail",
    "lead_type": "mixed",
    "test": true, // Required for test mode
    
    // Tracking and validation IDs - ensure they're strings
    "tracking_id": `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    "sub_id_1": "smartauto_test", // PLACEHOLDER: Sub ID 1
    "jornaya_leadid": "01234567-89AB-CDEF-0123-456789ABCDDF", // PLACEHOLDER: Jornaya Lead ID
    "trusted_form_cert_url": "https://cert.trustedform.com/0123456789abcdee0123456789abcdef012345567", // PLACEHOLDER
    
    // Request metadata
    "ip_address": "127.0.0.1", // PLACEHOLDER: Client IP
    "landing_url": "smartauto.com", // PLACEHOLDER: Landing page URL
    "privacy_url": "smartauto.com/privacy", // PLACEHOLDER: Privacy policy URL
    "tcpa": "I agree to receive marketing communications", // PLACEHOLDER: TCPA consent text
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36", // PLACEHOLDER
    
    "profile": {
      // Basic info
      "zip": formData.zipcode || "12345",
      "address_2": "", // PLACEHOLDER: Apartment/unit number
      
      // Insurance status - ensure boolean strings
      "currently_insured": toBooleanString(formData.insuranceHistory === 'Yes'),
      "current_company": formData.currentAutoInsurance === 'Yes' ? (formData.currentAutoInsuranceCompany || "Allstate") : "", // PLACEHOLDER when insured
      "continuous_coverage": mapInsuranceDuration(formData.insuranceDuration) || "48", // months
      "current_policy_start": "2024-04-28", // PLACEHOLDER: Policy start date
      "current_policy_expires": "2026-04-28", // PLACEHOLDER: Policy expiration date
      
      // Personal details
      "military_affiliation": toBooleanString(formData.military === 'Yes'),
      "auto_coverage_type": mapCoverageType(formData.coverageType) || "typical",
      
      // Counts - ensure they're strings
      "driver_count": "1", // We only collect data for primary driver
      "vehicle_count": activeVehicles.length.toString(),
      
      "drivers": [
        {
          "relationship": formData.driverRelationship || "self",
          "gender": (formData.gender || "male").toLowerCase(),
          "birth_date": formatBirthdate(formData.birthdate),
          
          // Risk factors - PLACEHOLDER values
          "at_fault_accidents": "0", // PLACEHOLDER: Number of at-fault accidents
          "license_suspended": toBooleanString(formData.sr22 === 'Yes'), // Using SR22 as indicator
          "tickets": "0", // PLACEHOLDER: Number of tickets
          "dui_sr22": toBooleanString(formData.sr22 === 'Yes'),
          
          // Personal details
          "education": formData.driverEducation || "some_college",
          "credit": formData.creditScore || "good",
          "occupation": formData.driverOccupation || "professional",
          "marital_status": (formData.maritalStatus || "single").toLowerCase(),
          
          // License info
          "license_state": formData.state || "MA", // Derived from zip or address
          "licensed_age": "16", // PLACEHOLDER: Age when first licensed
          "license_status": formData.driversLicense === 'Yes' ? "active" : "inactive",
          
          // Residence info
          "residence_type": formData.homeowner === 'Own' ? "own" : (formData.homeowner === 'Rent' ? "rent" : "own"),
          "residence_length": "48" // PLACEHOLDER: Months at current residence
        }
      ],
      
      "vehicles": activeVehicles.map(vehicle => ({
        "year": vehicle.year.toString(),
        "make": vehicle.make,
        "model": vehicle.model,
        "submodel": vehicle.model, // Use model if submodel not available
        "primary_purpose": vehicle.purpose || "commute",
        "annual_mileage": vehicle.mileage || "10000-15000",
        "ownership": vehicle.ownership || "owned",
        "garage": "no_cover", // PLACEHOLDER: Garage/parking situation
        "vin": "JM3TB38A*80******" // PLACEHOLDER: Partial VIN
      }))
    }
  };
}

// Generate post data from ping response and form data
function generatePostData(submission_id, ping_ids, formData) {
  // Format phone number to digits only (remove any formatting)
  const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
  
  return {
    submission_id,
    ping_ids,
    profile: {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: cleanPhone, // Use digits-only format
      address: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      zip: formData.zipcode, // Add zip code
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
  
  // Log the full ping data for debugging
  console.log('\n📋 Ping Data Being Sent:');
  console.log(JSON.stringify(pingData, null, 2));
  
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
      console.error(`  Response:`, JSON.stringify(error.response.data, null, 2));
      
      // If there are validation errors, show them in detail
      if (error.response.data && error.response.data.errors) {
        console.error('\n🔍 Detailed Validation Errors:');
        const errors = error.response.data.errors;
        
        if (Array.isArray(errors)) {
          errors.forEach((errorGroup, index) => {
            console.error(`  Error Group ${index + 1}:`, JSON.stringify(errorGroup, null, 4));
          });
        } else {
          console.error('  Errors:', JSON.stringify(errors, null, 4));
        }
      }
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
  
  console.log(`\n📋 Post Data Being Sent:`);
  console.log(JSON.stringify(postData, null, 2));
  console.log(`\nPosting to ${ping_ids.length} ping(s)...`);
  
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
      console.error(`  Response:`, JSON.stringify(error.response.data, null, 2));
      
      // If there are validation errors, show them in detail
      if (error.response.data && error.response.data.errors) {
        console.error('\n🔍 Detailed Validation Errors:');
        const errors = error.response.data.errors;
        
        if (Array.isArray(errors)) {
          errors.forEach((errorGroup, index) => {
            console.error(`  Error Group ${index + 1}:`, JSON.stringify(errorGroup, null, 4));
          });
        } else {
          console.error('  Errors:', JSON.stringify(errors, null, 4));
        }
      }
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