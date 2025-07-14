const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'smartautoinsider_user',
  password: process.env.DB_PASSWORD || 'SecurePassword123!',
  database: process.env.DB_NAME || 'smartautoinsider_db',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database service class
class DatabaseService {
  constructor() {
    this.pool = pool;
  }

  // Test database connection
  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Database connection successful');
      
      // Test query
      const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
      console.log('✅ Database query test successful:', rows[0]);
      
      connection.release();
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Helper function to convert ISO datetime to MySQL format
  formatMySQLDateTime(isoString) {
    if (!isoString) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    try {
      const date = new Date(isoString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
      console.warn('⚠️ Invalid date format, using current time:', isoString);
      return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  // Log ping request
  async logPingRequest(data) {
    try {
      const query = `
        INSERT INTO ping_requests 
        (timestamp, submission_id, status, ping_count, total_value, request_data, response_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Extract values from data
      const timestamp = this.formatMySQLDateTime(data.timestamp);
      const submissionId = data.submission_id || 
                          (data.response_data && data.response_data.submission_id) || 
                          null;
      const status = data.status || 
                    (data.response_data && data.response_data.status) || 
                    'unknown';
      const pingCount = data.ping_count || 
                       (data.response_data && data.response_data.pings && data.response_data.pings.length) || 
                       0;
      const totalValue = data.total_value || 
                        (data.response_data && data.response_data.pings ? 
                         data.response_data.pings.reduce((sum, ping) => sum + (ping.value || 0), 0) : 0);
      
      const values = [
        timestamp,
        submissionId,
        status,
        pingCount,
        totalValue,
        JSON.stringify(data.request_data || data.request || {}),
        JSON.stringify(data.response_data || data.response || {})
      ];

      const [result] = await this.pool.execute(query, values);
      
      console.log('✅ Ping request logged successfully:', {
        id: result.insertId,
        submission_id: submissionId,
        status: status
      });
      
      return { 
        success: true, 
        id: result.insertId,
        submission_id: submissionId 
      };
    } catch (error) {
      console.error('❌ Failed to log ping request:', error.message);
      throw error;
    }
  }

  // Log post request
  async logPostRequest(data) {
    try {
      const query = `
        INSERT INTO post_requests 
        (timestamp, submission_id, status, total_value, ping_count, successful_posts, request_data, response_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Extract values from data
      const timestamp = this.formatMySQLDateTime(data.timestamp);
      const submissionId = data.submission_id || 
                          (data.request_data && data.request_data.submission_id) ||
                          (data.request && data.request.submission_id) ||
                          null;
      const status = data.status || 
                    (data.response_data && data.response_data.status) || 
                    'unknown';
      const totalValue = data.total_value || 
                        (data.response_data && data.response_data.value) || 
                        0;
      const pingCount = data.ping_count || 
                       (data.request_data && data.request_data.ping_ids && data.request_data.ping_ids.length) ||
                       (data.request && data.request.ping_ids && data.request.ping_ids.length) ||
                       0;
      const successfulPosts = data.successful_posts || 
                             (data.response_data && data.response_data.results ? 
                              data.response_data.results.filter(r => r.result === 'success').length : 0);
      
      const values = [
        timestamp,
        submissionId,
        status,
        totalValue,
        pingCount,
        successfulPosts,
        JSON.stringify(data.request_data || data.request || {}),
        JSON.stringify(data.response_data || data.response || {})
      ];

      const [result] = await this.pool.execute(query, values);
      
      console.log('✅ Post request logged successfully:', {
        id: result.insertId,
        submission_id: submissionId,
        status: status,
        value: totalValue
      });
      
      return { 
        success: true, 
        id: result.insertId,
        submission_id: submissionId 
      };
    } catch (error) {
      console.error('❌ Failed to log post request:', error.message);
      throw error;
    }
  }

  // Get recent ping requests
  async getRecentPings(limit = 50) {
    try {
      const query = `
        SELECT 
          id,
          timestamp,
          submission_id,
          status,
          ping_count,
          total_value,
          request_data,
          response_data,
          created_at
        FROM ping_requests 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      const [rows] = await this.pool.execute(query, [limit]);
      return { success: true, data: rows };
    } catch (error) {
      console.error('❌ Failed to get recent pings:', error.message);
      throw error;
    }
  }

  // Get recent post requests
  async getRecentPosts(limit = 50) {
    try {
      const query = `
        SELECT 
          id,
          timestamp,
          submission_id,
          status,
          total_value,
          ping_count,
          successful_posts,
          request_data,
          response_data,
          created_at
        FROM post_requests 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      const [rows] = await this.pool.execute(query, [limit]);
      return { success: true, data: rows };
    } catch (error) {
      console.error('❌ Failed to get recent posts:', error.message);
      throw error;
    }
  }

  // Get analytics summary
  async getAnalyticsSummary() {
    try {
      const queries = {
        ping_stats: `
          SELECT 
            COUNT(*) as total_pings,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_pings,
            SUM(total_value) as total_ping_value,
            AVG(ping_count) as avg_ping_count
          FROM ping_requests 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `,
        post_stats: `
          SELECT 
            COUNT(*) as total_posts,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_posts,
            SUM(total_value) as total_post_value,
            SUM(successful_posts) as total_successful_posts
          FROM post_requests 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `
      };

      const [pingStats] = await this.pool.execute(queries.ping_stats);
      const [postStats] = await this.pool.execute(queries.post_stats);

      return {
        success: true,
        data: {
          ping_stats: pingStats[0],
          post_stats: postStats[0],
          generated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Failed to get analytics summary:', error.message);
      throw error;
    }
  }

  // Log ping comparison results
  async logPingComparison(data) {
    try {
      const query = `
        INSERT INTO ping_comparison 
        (timestamp, quotewizard_success, quotewizard_value, quotewizard_error, 
         exchangeflo_success, exchangeflo_value, exchangeflo_error, winner, request_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        data.timestamp,
        data.quotewizard_success,
        data.quotewizard_value,
        data.quotewizard_error,
        data.exchangeflo_success,
        data.exchangeflo_value,
        data.exchangeflo_error,
        data.winner,
        JSON.stringify(data.request_data)
      ];
      
      const [result] = await this.pool.execute(query, values);
      console.log('✅ Ping comparison logged successfully:', result.insertId);
      return { success: true, insertId: result.insertId };
    } catch (error) {
      console.error('❌ Error logging ping comparison:', error);
      return { success: false, error: error.message };
    }
  }

  // Close connection pool
  async close() {
    try {
      await this.pool.end();
      console.log('✅ Database connection pool closed');
    } catch (error) {
      console.error('❌ Error closing database connection pool:', error.message);
    }
  }
}

// Create and export singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService; 