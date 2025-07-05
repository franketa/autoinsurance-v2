const express = require('express');
const cors = require('cors');
const path = require('path');
const { getLocationFromIP, getLocationFromZip } = require('./location');
const databaseService = require('./database/service');
const apiRoutes = require('./api-endpoints');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Test database connection on startup
databaseService.testConnection()
  .then((result) => {
    if (result.success) {
      console.log('✅ Database connection verified on startup');
    } else {
      console.error('❌ Database connection failed on startup:', result.error);
    }
  })
  .catch((error) => {
    console.error('❌ Database connection test failed:', error.message);
  });

// API Routes
app.use('/api', apiRoutes);

// Location lookup endpoint (original functionality)
app.get('/api/location', async (req, res) => {
  try {
    const zipCode = req.query.zip;
    
    if (zipCode) {
      // Zip code lookup
      console.log('📍 Looking up location for zip code:', zipCode);
      const locationData = await getLocationFromZip(zipCode);
      res.json(locationData);
    } else {
      // IP-based lookup (original functionality)
      const ip = req.query.ip || req.ip || req.connection.remoteAddress || '';
      
      // Clean the IP address (remove ::ffff: prefix if present)
      const cleanIP = ip.replace(/^::ffff:/, '');
      
      console.log('📍 Looking up location for IP:', cleanIP);
      
      const locationData = await getLocationFromIP(cleanIP);
      res.json(locationData);
    }
  } catch (error) {
    console.error('❌ Location lookup error:', error);
    res.status(500).json({
      error: 'Failed to lookup location',
      zip: req.query.zip || '98101',
      region: 'WA',
      city: 'Seattle'
    });
  }
});

// Legacy submit-quote endpoint (if needed for compatibility)
app.post('/api/submit-quote', async (req, res) => {
  try {
    console.log('📝 Legacy quote submission received');
    
    // For now, just return a success response
    // You can integrate this with your existing QuoteWizard logic if needed
    res.json({
      success: true,
      message: 'Quote submission received (legacy endpoint)',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Quote submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple dashboard endpoint
app.get('/admin/dashboard', async (req, res) => {
  try {
    const analytics = await databaseService.getAnalyticsSummary();
    const recentPings = await databaseService.getRecentPings(10);
    const recentPosts = await databaseService.getRecentPosts(10);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Smart Auto Insider - Database Dashboard</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
              .container { max-width: 1200px; margin: 0 auto; }
              .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
              .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .stat-number { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
              .stat-label { color: #6b7280; font-size: 14px; }
              .data-section { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
              .data-item { padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 12px; }
              .data-item:last-child { border-bottom: none; }
              .status-success { color: #10b981; font-weight: bold; }
              .status-failed { color: #ef4444; font-weight: bold; }
              .refresh-btn { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
              .refresh-btn:hover { background: #1d4ed8; }
              .test-btn { background: #059669; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; margin-left: 10px; }
              .test-btn:hover { background: #047857; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Smart Auto Insider - Database Dashboard</h1>
                  <p>Real-time monitoring of ping and post requests</p>
                  <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Data</button>
                  <button class="test-btn" onclick="testPing()">🧪 Test Ping</button>
              </div>
              
              <div class="stats-grid">
                  <div class="stat-card">
                      <div class="stat-number">${analytics.data.ping_stats.total_pings || 0}</div>
                      <div class="stat-label">Total Pings (24h)</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-number">${analytics.data.ping_stats.successful_pings || 0}</div>
                      <div class="stat-label">Successful Pings</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-number">$${(analytics.data.ping_stats.total_ping_value || 0).toFixed(2)}</div>
                      <div class="stat-label">Total Ping Value</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-number">${analytics.data.post_stats.total_posts || 0}</div>
                      <div class="stat-label">Total Posts (24h)</div>
                  </div>
              </div>
              
              <div class="data-section">
                  <div class="section-title">Recent Ping Requests</div>
                  ${recentPings.data.map(ping => `
                      <div class="data-item">
                          <strong>ID:</strong> ${ping.id} | 
                          <strong>Time:</strong> ${new Date(ping.created_at).toLocaleString()} | 
                          <strong>Status:</strong> <span class="status-${ping.status === 'success' ? 'success' : 'failed'}">${ping.status}</span> | 
                          <strong>Submission:</strong> ${ping.submission_id || 'N/A'} | 
                          <strong>Pings:</strong> ${ping.ping_count} | 
                          <strong>Value:</strong> $${(ping.total_value || 0).toFixed(2)}
                      </div>
                  `).join('')}
              </div>
              
              <div class="data-section">
                  <div class="section-title">Recent Post Requests</div>
                  ${recentPosts.data.map(post => `
                      <div class="data-item">
                          <strong>ID:</strong> ${post.id} | 
                          <strong>Time:</strong> ${new Date(post.created_at).toLocaleString()} | 
                          <strong>Status:</strong> <span class="status-${post.status === 'success' ? 'success' : 'failed'}">${post.status}</span> | 
                          <strong>Submission:</strong> ${post.submission_id || 'N/A'} | 
                          <strong>Value:</strong> $${(post.total_value || 0).toFixed(2)} | 
                          <strong>Successful:</strong> ${post.successful_posts}
                      </div>
                  `).join('')}
              </div>
          </div>
          
          <script>
              async function testPing() {
                  try {
                      const response = await fetch('/api/test/ping', { method: 'POST' });
                      const result = await response.json();
                      if (result.success) {
                          alert('✅ Test ping successful! Check the dashboard for the new entry.');
                          location.reload();
                      } else {
                          alert('❌ Test ping failed: ' + result.error);
                      }
                  } catch (error) {
                      alert('❌ Test ping error: ' + error.message);
                  }
              }
              
              // Auto-refresh every 30 seconds
              setTimeout(() => location.reload(), 30000);
          </script>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    res.status(500).send(`
      <h1>Dashboard Error</h1>
      <p>Failed to load dashboard: ${error.message}</p>
      <a href="/api/health">Check API Health</a>
    `);
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await databaseService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await databaseService.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/admin/dashboard`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
}); 