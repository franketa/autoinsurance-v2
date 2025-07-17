const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_TID = 'test_tid_12345';
const TEST_REVENUE = 25.50;

// Test data
const testFormData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phoneNumber: '6032011234', // Changed exchange from 555 to 201 (valid exchange)
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

async function testSessionCapture() {
    console.log('\n🧪 Testing Session Capture...');

    try {
        const response = await axios.get(`${BASE_URL}/api/session/capture?tid=${TEST_TID}`);
        console.log('✅ Session capture successful:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Session capture failed:', error.response?.data || error.message);
        return false;
    }
}

async function testPingBoth() {
    console.log('\n🧪 Testing Ping Both...');

    try {
        const response = await axios.post(`${BASE_URL}/api/ping-both`, testFormData);
        console.log('✅ Ping both successful:', {
            success: response.data.success,
            winner: response.data.winner,
            message: response.data.message
        });
        return response.data;
    } catch (error) {
        console.error('❌ Ping both failed:', error.response?.data || error.message);
        return null;
    }
}

async function testPostWinner(winner, winnerData) {
    console.log('\n🧪 Testing Post Winner...');

    try {
        const response = await axios.post(`${BASE_URL}/api/post-winner`, {
            winner,
            winnerData,
            formData: testFormData
        });
        console.log('✅ Post winner successful:', {
            success: response.data.success,
            winner: response.data.winner,
            postbacks: response.data.postbacks,
            sessionInfo: response.data.sessionInfo
        });

        // Display detailed session information
        if (response.data.sessionInfo) {
            console.log('📊 Session Information:');
            console.log(`   Session ID: ${response.data.sessionInfo.sessionId}`);
            console.log(`   Has TID: ${response.data.sessionInfo.hasTid}`);
            console.log(`   TID: ${response.data.sessionInfo.tid}`);
            console.log(`   Revenue: $${response.data.sessionInfo.revenue}`);
            console.log(`   IP: ${response.data.sessionInfo.ip}`);
        }

        // Display logs if available
        if (response.data.logs && response.data.logs.length > 0) {
            console.log('📝 Server Logs:');
            response.data.logs.forEach(log => {
                if (log.message.includes('session') || log.message.includes('TID') || log.message.includes('revenue')) {
                    console.log(`   [${log.level}] ${log.message}`);
                }
            });
        }

        return response.data;
    } catch (error) {
        console.error('❌ Post winner failed:', error.response?.data || error.message);
        return null;
    }
}

async function testHealthCheck() {
    console.log('\n🧪 Testing Health Check...');

    try {
        const response = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Health check successful:', response.data.status);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error.response?.data || error.message);
        return false;
    }
}

async function runCompleteTest() {
    console.log('🚀 Starting Postback Integration Test...');

    // Test 1: Health check
    const healthOk = await testHealthCheck();
    if (!healthOk) {
        console.error('❌ Health check failed, stopping tests');
        return;
    }

    // Test 2: Session capture
    const sessionOk = await testSessionCapture();
    if (!sessionOk) {
        console.error('❌ Session capture failed, stopping tests');
        return;
    }

    // Test 3: Ping both services
    const pingResult = await testPingBoth();
    if (!pingResult || !pingResult.success) {
        console.error('❌ Ping both failed, stopping tests');
        return;
    }

    // Test 4: Post to winner (this will trigger postbacks and email)
    if (pingResult.winner && pingResult.winnerData) {
        const postResult = await testPostWinner(pingResult.winner, pingResult.winnerData);
        if (postResult) {
            console.log('\n🎉 Postback Integration Test Completed Successfully!');
            console.log('📊 Results Summary:');
            console.log(`  • Session Capture: ${sessionOk ? '✅' : '❌'}`);
            console.log(`  • Ping Both: ${pingResult.success ? '✅' : '❌'}`);
            console.log(`  • Winner: ${pingResult.winner || 'None'}`);
            console.log(`  • Post Winner: ${postResult.success ? '✅' : '❌'}`);
            console.log(`  • Hitpath Postback: ${postResult.postbacks?.hitpath || 'N/A'}`);
            console.log(`  • Everflow Postback: ${postResult.postbacks?.everflow || 'N/A'}`);
            console.log(`  • Email Submission: ${postResult.postbacks?.email || 'N/A'}`);
        } else {
            console.error('❌ Post winner test failed');
        }
    } else {
        console.log('⚠️ No winner found, skipping post winner test');
    }
}

// Run the test
if (require.main === module) {
    runCompleteTest().catch(error => {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    });
}

module.exports = {
    testSessionCapture,
    testPingBoth,
    testPostWinner,
    testHealthCheck,
    runCompleteTest
}; 