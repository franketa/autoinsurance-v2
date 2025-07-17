const axios = require('axios');

// Sample form data for testing - uses random trusted form cert ID
const testFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '6032011234',
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
  ]
  // Note: trusted_form_cert_id is intentionally omitted so server uses random generation
};

// Function to display logs in a formatted way
function displayLogs(logs, title) {
  if (!logs || logs.length === 0) {
    console.log(`\n📝 ${title}: No logs captured`);
    return;
  }

  console.log(`\n📝 ${title}:`);
  console.log('=' + '='.repeat(title.length + 3));
  
  logs.forEach((log, index) => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const levelIcon = {
      info: '📘',
      debug: '🔍',
      error: '❌',
      warn: '⚠️'
    }[log.level] || '📄';
    
    console.log(`${levelIcon} [${time}] ${log.level.toUpperCase()}: ${log.message}`);
    
    if (log.data) {
      // Parse the JSON data for better formatting
      try {
        const parsedData = JSON.parse(log.data);
        
        // For large objects, show a summary instead of full data
        if (typeof parsedData === 'object' && parsedData !== null) {
          if (log.message.includes('XML')) {
            // For XML, show just the first few lines
            const xmlLines = log.data.split('\n').slice(0, 5);
            console.log('   XML Preview:', xmlLines.join('\n   '));
            if (xmlLines.length < log.data.split('\n').length) {
              console.log('   ... (truncated)');
            }
          } else if (log.message.includes('JSON')) {
            // For JSON, show key fields
            console.log('   JSON Keys:', Object.keys(parsedData).join(', '));
          } else if (log.message.includes('ERROR')) {
            // For errors, show full details
            console.log('   Error Details:', JSON.stringify(parsedData, null, 2));
          } else {
            // For other objects, show a summary
            console.log('   Data Type:', Array.isArray(parsedData) ? 'Array' : 'Object');
            if (Array.isArray(parsedData)) {
              console.log('   Array Length:', parsedData.length);
            } else {
              console.log('   Object Keys:', Object.keys(parsedData).join(', '));
            }
          }
        } else {
          console.log('   Data:', parsedData);
        }
      } catch (e) {
        // If parsing fails, show raw data (truncated)
        const truncatedData = log.data.length > 200 ? log.data.substring(0, 200) + '...' : log.data;
        console.log('   Raw Data:', truncatedData);
      }
    }
    
    if (index < logs.length - 1) {
      console.log(''); // Add spacing between log entries
    }
  });
}

// Function to extract and display error details from logs
function analyzeErrorsFromLogs(logs) {
  const errors = logs.filter(log => log.level === 'error');
  
  if (errors.length === 0) {
    console.log('\n✅ No errors found in logs');
    return;
  }

  console.log(`\n🔍 ERROR ANALYSIS (${errors.length} errors found):`);
  console.log('═'.repeat(40));
  
  errors.forEach((error, index) => {
    console.log(`\n❌ Error ${index + 1}: ${error.message}`);
    if (error.data) {
      try {
        const errorData = JSON.parse(error.data);
        
        // Extract useful error information
        if (errorData.status) {
          console.log(`   HTTP Status: ${errorData.status}`);
        }
        if (errorData.statusText) {
          console.log(`   Status Text: ${errorData.statusText}`);
        }
        if (errorData.responseData) {
          console.log(`   Response Error: ${JSON.stringify(errorData.responseData, null, 2)}`);
        }
        if (errorData.message) {
          console.log(`   Error Message: ${errorData.message}`);
        }
      } catch (e) {
        console.log(`   Raw Error: ${error.data}`);
      }
    }
  });
}

async function testPingComparison() {
  try {
    console.log('🧪 Testing ping comparison system...');
    console.log('📋 Test data summary:');
    console.log(`   Name: ${testFormData.firstName} ${testFormData.lastName}`);
    console.log(`   Email: ${testFormData.email}`);
    console.log(`   Location: ${testFormData.city}, ${testFormData.state} ${testFormData.zipcode}`);
    console.log(`   Vehicle: ${testFormData.vehicles[0].year} ${testFormData.vehicles[0].make} ${testFormData.vehicles[0].model}`);
    console.log(`   Trusted Form: Will use random generated certificate ID`);
    
    // Test the ping comparison endpoint
    const response = await axios.post('http://localhost:5000/api/ping-both', testFormData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Display logs from the response
    displayLogs(response.data.logs, 'SERVER LOGS FROM PING COMPARISON');
    
    // Analyze any errors
    analyzeErrorsFromLogs(response.data.logs || []);
    
    console.log('\n🏆 PING COMPARISON RESULTS:');
    console.log('═'.repeat(35));
    
    const { success, winner, comparison, winnerData, message } = response.data;
    
    if (success) {
      console.log(`✅ Ping comparison successful`);
      console.log(`📊 Results Summary:`);
      console.log(`   🔵 QuoteWizard: ${comparison.quotewizard.success ? '✅ Success' : '❌ Failed'} - $${comparison.quotewizard.value.toFixed(2)}`);
      if (comparison.quotewizard.error) {
        console.log(`      Error: ${comparison.quotewizard.error}`);
      }
      
      console.log(`   🟢 ExchangeFlo: ${comparison.exchangeflo.success ? '✅ Success' : '❌ Failed'} - $${comparison.exchangeflo.value.toFixed(2)}`);
      if (comparison.exchangeflo.error) {
        console.log(`      Error: ${comparison.exchangeflo.error}`);
      }
      
      console.log(`\n🎯 Winner: ${winner ? `🏆 ${winner.toUpperCase()}` : '❌ No winner'}`);
      console.log(`💬 Message: ${message}`);
      
      // Test posting to winner if there is one
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
        
        // Display logs from the post response
        displayLogs(postResponse.data.logs, 'SERVER LOGS FROM POST TO WINNER');
        
        // Analyze any errors from post
        analyzeErrorsFromLogs(postResponse.data.logs || []);
        
        console.log('\n📤 POST TO WINNER RESULTS:');
        console.log('═'.repeat(30));
        
        if (postResponse.data.success) {
          console.log(`✅ Post to ${winner} successful`);
          console.log(`📋 Result: ${JSON.stringify(postResponse.data.result, null, 2)}`);
        } else {
          console.log(`❌ Post to ${winner} failed: ${postResponse.data.error}`);
        }
      } else {
        console.log('\n⚠️  No winner to post to - skipping post test');
      }
    } else {
      console.log(`❌ Ping comparison failed: ${response.data.error}`);
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('═'.repeat(20));
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      
      // Display logs from error response if available
      if (error.response.data && error.response.data.logs) {
        displayLogs(error.response.data.logs, 'SERVER LOGS FROM ERROR RESPONSE');
        analyzeErrorsFromLogs(error.response.data.logs);
      }
      
      if (error.response.data) {
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Request details:', error.request);
    }
    
    console.error('\n💡 TROUBLESHOOTING TIPS:');
    console.error('• Make sure the server is running: npm run server');
    console.error('• Check if port 5000 is available');
    console.error('• Verify database connection is working');
    console.error('• Check server logs for additional details');
  }
}

// Test health check first
async function testHealthCheck() {
  try {
    console.log('🏥 Testing server health...');
    const response = await axios.get('http://localhost:5000/api/health');
    
    console.log('✅ Health check passed:');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Version: ${response.data.version}`);
    console.log(`   Services: ${JSON.stringify(response.data.services)}`);
    
    // Display health check logs if any
    if (response.data.logs && response.data.logs.length > 0) {
      displayLogs(response.data.logs, 'SERVER LOGS FROM HEALTH CHECK');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 STARTING PING COMPARISON TESTS');
  console.log('═'.repeat(50));
  console.log(`📅 Test Time: ${new Date().toLocaleString()}`);
  console.log(`🌐 Server URL: http://localhost:5000`);
  console.log('');
  
  // Check if server is running
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.error('\n❌ Server is not running. Please start the server first:');
    console.error('   cd server && node server.js');
    console.error('   OR');
    console.error('   npm run server');
    process.exit(1);
  }
  
  // Wait a moment and then run the main test
  console.log('\n⏳ Starting main test in 1 second...\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testPingComparison();
  
  console.log('\n' + '═'.repeat(50));
  console.log('🏁 ALL TESTS COMPLETED');
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testPingComparison, testHealthCheck }; 