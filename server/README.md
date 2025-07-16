# Auto Insurance Server

Single, consolidated Node.js/Express server with **dual ping comparison system** for QuoteWizard and ExchangeFlo APIs.

## 🏗️ Architecture Overview

### Single Server Design
Our streamlined architecture consolidates all functionality into one robust server file:

- **`server.js`** - Main server with all endpoints and logic
- **`database/service.js`** - Database abstraction layer
- **`database/init.sql`** - Consolidated database schema
- **`location.js`** - IP and zip code location services
- **`test-ping-comparison.js`** - Comprehensive testing suite

### Key Features
- ✅ **Dual Ping Comparison** - QuoteWizard vs ExchangeFlo
- ✅ **Automatic Winner Selection** - Highest bidder wins
- ✅ **Enhanced Logging** - All requests/responses captured
- ✅ **TrustedForm Integration** - Real certificates in production
- ✅ **Error Handling** - Graceful degradation and detailed errors
- ✅ **Analytics Support** - Comprehensive data tracking

## 🚀 Quick Start

### Prerequisites
```bash
# Required software
Node.js 16+
MySQL 8.0+
PM2 (for production)
```

### Development Setup
```bash
# Install dependencies
npm install

# Setup database
mysql -u root -p < database/init.sql

# Configure environment
cp config.example.js config.js
# Edit config.js with your credentials

# Start development server
node server.js
```

### Production Deployment
```bash
# Use the automated deployment script
chmod +x ../deploy-update-clean.sh
../deploy-update-clean.sh

# Or manually with PM2
pm2 start server.js --name auto-insurance-app --env production
```

## 📊 API Endpoints

### Core Dual Ping System

#### `POST /api/ping-both`
Main endpoint that pings both services and returns comparison results.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phoneNumber": "5551234567",
  "streetAddress": "123 Main St",
  "city": "Seattle",
  "state": "WA",
  "zipcode": "98101",
  "birthdate": "1985-06-15",
  "gender": "Male",
  "maritalStatus": "Single",
  "creditScore": "Good",
  "homeowner": "Own",
  "military": "No",
  "driverEducation": "Bachelor's Degree",
  "driverOccupation": "Engineer",
  "driversLicense": "Yes",
  "sr22": "No",
  "insuranceHistory": "Yes",
  "currentAutoInsurance": "Geico",
  "insuranceDuration": "1-3 years",
  "coverageType": "Full Coverage",
  "vehicles": [
    {
      "year": "2020",
      "make": "Toyota", 
      "model": "Camry",
      "purpose": "commute",
      "mileage": "10000-15000",
      "ownership": "owned"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "winner": "exchangeflo",
  "comparison": {
    "quotewizard": {
      "success": true,
      "value": 15.0,
      "error": null,
      "data": {...}
    },
    "exchangeflo": {
      "success": true,
      "value": 22.50,
      "error": null,
      "data": {...}
    }
  },
  "winnerData": {...},
  "message": "exchangeflo won with $22.50",
  "logs": [...] // Detailed server logs for debugging
}
```

#### `POST /api/post-winner`
Posts the lead to the winning service.

**Request:**
```json
{
  "winner": "exchangeflo",
  "winnerData": {...},
  "formData": {...}
}
```

### Utility Endpoints

#### `GET /api/health`
Health check with system status and logs.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "2.0.0",
  "services": {
    "server": "running",
    "database": "connected"
  },
  "logs": [...] // Recent server logs
}
```

#### `GET /api/location`
Location lookup by IP or zip code.

**Query Parameters:**
- `ip` - IP address to look up
- `zip` - Zip code to look up

**Response:**
```json
{
  "city": "Seattle",
  "region": "WA",
  "zip": "98101"
}
```

#### `POST /api/test/ping`
Test endpoint for ping logging functionality.

## 🗄️ Database Schema

### Core Tables

#### `ping_requests`
General ping logging for all providers.
```sql
CREATE TABLE ping_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'unknown',
    status VARCHAR(50) DEFAULT 'unknown',
    ping_count INT DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0.00,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `post_requests`  
General post logging for all providers.
```sql
CREATE TABLE post_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'unknown',
    status VARCHAR(50) DEFAULT 'unknown',
    total_value DECIMAL(10,2) DEFAULT 0.00,
    ping_count INT DEFAULT 0,
    successful_posts INT DEFAULT 0,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `ping_comparison`
QuoteWizard vs ExchangeFlo head-to-head comparisons.
```sql
CREATE TABLE ping_comparison (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quotewizard_success BOOLEAN DEFAULT FALSE,
    quotewizard_value DECIMAL(10,2) DEFAULT 0,
    quotewizard_error TEXT,
    exchangeflo_success BOOLEAN DEFAULT FALSE,
    exchangeflo_value DECIMAL(10,2) DEFAULT 0,
    exchangeflo_error TEXT,
    winner VARCHAR(50),
    total_comparison_value DECIMAL(10,2) GENERATED ALWAYS AS (quotewizard_value + exchangeflo_value) STORED,
    request_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Analytics Views

#### `request_analytics`
Combined view of all ping and post requests.

#### `comparison_analytics`
Detailed analytics for dual ping comparisons with extracted JSON fields.

## 🧪 Testing

### Automated Test Suite
Run the comprehensive test suite:
```bash
node test-ping-comparison.js
```

**Test Features:**
- ✅ Health check verification
- ✅ Dual ping comparison testing
- ✅ Winner selection validation
- ✅ Post to winner functionality
- ✅ Error handling verification
- ✅ Log capture and analysis
- ✅ TrustedForm certificate generation

### Manual API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Test dual ping (replace with test data)
curl -X POST http://localhost:5000/api/ping-both \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

### Database Testing
```sql
-- Recent ping comparisons
SELECT * FROM ping_comparison ORDER BY timestamp DESC LIMIT 10;

-- Winner statistics  
SELECT winner, COUNT(*) as wins, AVG(total_comparison_value) as avg_value
FROM ping_comparison GROUP BY winner;

-- Success rates
SELECT 
  AVG(quotewizard_success) * 100 as qw_success_rate,
  AVG(exchangeflo_success) * 100 as ef_success_rate
FROM ping_comparison;
```

## 🔧 Configuration

### Environment Configuration
```javascript
// config.js
module.exports = {
  // Database Configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'smartautoinsider_user', 
  DB_PASSWORD: process.env.DB_PASSWORD || 'your_password',
  DB_NAME: process.env.DB_NAME || 'smartautoinsider_db',
  
  // QuoteWizard Configuration
  QW_CONTRACT_ID: process.env.QW_CONTRACT_ID || 'your_contract_id',
  QW_PRODUCTION_URL: 'https://quotewizard.com/LeadAPI/Services/SubmitVendorLead',
  QW_STAGING_URL: 'https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead',
  
  // ExchangeFlo Configuration
  EXCHANGEFLO_TOKEN: process.env.EXCHANGEFLO_TOKEN || 'your_api_token',
  EXCHANGEFLO_PING_URL: 'https://pub.exchangeflo.io/api/leads/ping',
  EXCHANGEFLO_POST_URL: 'https://pub.exchangeflo.io/api/leads/post',
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
```

### TrustedForm Configuration
- **Production**: Extracts real TrustedForm certificates from frontend
- **Testing**: Generates random 40-character hex certificates
- **Format**: `https://cert.trustedform.com/{certificate_id}`

## 📈 Monitoring & Analytics

### PM2 Process Management
```bash
# Status and monitoring
pm2 status
pm2 monit
pm2 logs auto-insurance-app
pm2 logs auto-insurance-app --lines 100

# Management
pm2 restart auto-insurance-app
pm2 reload auto-insurance-app
pm2 stop auto-insurance-app
pm2 delete auto-insurance-app
```

### Database Analytics Queries
```sql
-- Daily comparison volume
SELECT DATE(timestamp) as date, COUNT(*) as comparisons
FROM ping_comparison 
GROUP BY DATE(timestamp) 
ORDER BY date DESC;

-- Provider performance
SELECT 
    winner,
    COUNT(*) as wins,
    AVG(CASE WHEN winner = 'quotewizard' THEN quotewizard_value 
             WHEN winner = 'exchangeflo' THEN exchangeflo_value 
             ELSE 0 END) as avg_winning_value
FROM ping_comparison 
WHERE winner IS NOT NULL
GROUP BY winner;

-- Error analysis
SELECT 
    CASE 
        WHEN quotewizard_error IS NOT NULL THEN 'QuoteWizard Error'
        WHEN exchangeflo_error IS NOT NULL THEN 'ExchangeFlo Error'
        ELSE 'No Errors'
    END as error_type,
    COUNT(*) as occurrences
FROM ping_comparison
GROUP BY error_type;
```

### Log Analysis
The server captures comprehensive logs for all operations:
- **Request/Response Logging** - Full data capture
- **Error Tracking** - Detailed error messages and stack traces
- **Performance Metrics** - Response times and success rates
- **Debug Information** - XML/JSON data for troubleshooting

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Test database connection
mysql -u smartautoinsider_user -p smartautoinsider_db

# Check if tables exist
mysql -u smartautoinsider_user -p smartautoinsider_db -e "SHOW TABLES;"
```

#### API Connection Issues
```bash
# Test QuoteWizard connectivity
curl -X POST https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead

# Test ExchangeFlo connectivity  
curl -X POST https://pub.exchangeflo.io/api/leads/ping \
  -H "Authorization: Bearer your_token"
```

#### Server Performance Issues
```bash
# Check server resources
top
df -h
netstat -tulnp | grep 5000

# Check PM2 process health
pm2 monit
pm2 logs auto-insurance-app --lines 50
```

### Debug Mode
Enable detailed logging by checking server logs:
```bash
# View recent logs with detailed information
node test-ping-comparison.js

# Check PM2 logs for production issues
pm2 logs auto-insurance-app --follow
```

## 🚀 Performance Optimization

### Database Optimizations
- **Composite Indexes** - Optimized query performance
- **Connection Pooling** - Efficient database connections
- **Generated Columns** - Calculated fields for analytics

### Application Optimizations
- **Parallel Processing** - Simultaneous API calls
- **Circular Log Buffer** - Memory-efficient logging
- **Error Handling** - Graceful degradation
- **Timeout Management** - Prevents hanging requests

### Monitoring Recommendations
- **Database Performance** - Monitor query execution times
- **API Response Times** - Track external service performance  
- **Memory Usage** - Watch for memory leaks
- **Error Rates** - Monitor success/failure ratios

## 📚 Additional Resources

- **Main Documentation**: `../README.md`
- **API Examples**: `PING_COMPARISON_README.md` 
- **Database Schema**: `database/init.sql`
- **Test Suite**: `test-ping-comparison.js`
- **Configuration Template**: `config.example.js`

---

## 🎯 Development Notes

This consolidated server architecture provides:
- **Simplicity** - Single file with all functionality
- **Maintainability** - Clear code organization and documentation
- **Scalability** - Optimized database queries and connection pooling
- **Reliability** - Comprehensive error handling and logging
- **Testability** - Extensive test suite with log capture
- **Analytics** - Detailed tracking of all operations 