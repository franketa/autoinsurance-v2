const express = require('express');
const databaseService = require('./database/service');

const router = express.Router();

// Middleware for JSON parsing and logging
router.use(express.json({ limit: '10mb' }));
router.use((req, res, next) => {
  console.log(`📡 API Request: ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const dbTest = await databaseService.testConnection();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      services: {
        server: 'running',
        database: dbTest.success ? 'connected' : 'disconnected'
      },
      database_test: dbTest
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Log ping request endpoint
router.post('/log/ping', async (req, res) => {
  try {
    console.log('📡 Ping Log Request received:', {
      body_keys: Object.keys(req.body),
      timestamp: new Date().toISOString()
    });

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
        expected_format: {
          request_data: 'object',
          response_data: 'object',
          timestamp: 'string (optional)'
        }
      });
    }

    // Extract data from request body
    const logData = {
      timestamp: req.body.timestamp || new Date().toISOString(),
      request_data: req.body.request_data || req.body.request || {},
      response_data: req.body.response_data || req.body.response || {},
      
      // Extract common fields
      submission_id: req.body.submission_id || 
                    (req.body.response_data && req.body.response_data.submission_id) ||
                    (req.body.response && req.body.response.submission_id),
      status: req.body.status || 
             (req.body.response_data && req.body.response_data.status) ||
             (req.body.response && req.body.response.status),
      ping_count: req.body.ping_count ||
                 (req.body.response_data && req.body.response_data.pings && req.body.response_data.pings.length) ||
                 (req.body.response && req.body.response.pings && req.body.response.pings.length),
      total_value: req.body.total_value ||
                  (req.body.response_data && req.body.response_data.pings ? 
                   req.body.response_data.pings.reduce((sum, ping) => sum + (ping.value || 0), 0) : 0)
    };

    console.log('📋 Processed ping data:', {
      submission_id: logData.submission_id,
      status: logData.status,
      ping_count: logData.ping_count,
      total_value: logData.total_value
    });

    // Log to database
    const result = await databaseService.logPingRequest(logData);

    res.json({
      success: true,
      message: 'Ping request logged successfully',
      data: {
        id: result.id,
        submission_id: result.submission_id,
        timestamp: logData.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Ping logging error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to log ping request'
    });
  }
});

// Log post request endpoint
router.post('/log/post', async (req, res) => {
  try {
    console.log('📮 Post Log Request received:', {
      body_keys: Object.keys(req.body),
      timestamp: new Date().toISOString()
    });

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
        expected_format: {
          request_data: 'object',
          response_data: 'object',
          timestamp: 'string (optional)'
        }
      });
    }

    // Extract data from request body
    const logData = {
      timestamp: req.body.timestamp || new Date().toISOString(),
      request_data: req.body.request_data || req.body.request || {},
      response_data: req.body.response_data || req.body.response || {},
      
      // Extract common fields
      submission_id: req.body.submission_id || 
                    (req.body.request_data && req.body.request_data.submission_id) ||
                    (req.body.request && req.body.request.submission_id) ||
                    (req.body.response_data && req.body.response_data.submission_id) ||
                    (req.body.response && req.body.response.submission_id),
      status: req.body.status || 
             (req.body.response_data && req.body.response_data.status) ||
             (req.body.response && req.body.response.status),
      total_value: req.body.total_value ||
                  (req.body.response_data && req.body.response_data.value) ||
                  (req.body.response && req.body.response.value),
      ping_count: req.body.ping_count ||
                 (req.body.request_data && req.body.request_data.ping_ids && req.body.request_data.ping_ids.length) ||
                 (req.body.request && req.body.request.ping_ids && req.body.request.ping_ids.length),
      successful_posts: req.body.successful_posts ||
                       (req.body.response_data && req.body.response_data.results ? 
                        req.body.response_data.results.filter(r => r.result === 'success').length : 0)
    };

    console.log('📋 Processed post data:', {
      submission_id: logData.submission_id,
      status: logData.status,
      total_value: logData.total_value,
      ping_count: logData.ping_count,
      successful_posts: logData.successful_posts
    });

    // Log to database
    const result = await databaseService.logPostRequest(logData);

    res.json({
      success: true,
      message: 'Post request logged successfully',
      data: {
        id: result.id,
        submission_id: result.submission_id,
        timestamp: logData.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Post logging error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to log post request'
    });
  }
});

// Get recent pings
router.get('/analytics/pings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await databaseService.getRecentPings(limit);
    
    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      limit: limit
    });
  } catch (error) {
    console.error('❌ Error fetching pings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get recent posts
router.get('/analytics/posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await databaseService.getRecentPosts(limit);
    
    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      limit: limit
    });
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get analytics summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const result = await databaseService.getAnalyticsSummary();
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint for debugging
router.post('/test/ping', async (req, res) => {
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      submission_id: `test_${Date.now()}`,
      status: 'success',
      ping_count: 3,
      total_value: 15.50,
      request_data: {
        source_id: 'test',
        profile: { zip: '12345' }
      },
      response_data: {
        status: 'success',
        submission_id: `test_${Date.now()}`,
        pings: [
          { ping_id: 'test1', value: 5.50, type: 'exclusive' },
          { ping_id: 'test2', value: 10.00, type: 'shared' }
        ]
      }
    };

    const result = await databaseService.logPingRequest(testData);
    
    res.json({
      success: true,
      message: 'Test ping logged successfully',
      test_data: testData,
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 