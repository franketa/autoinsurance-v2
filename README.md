# Auto Insurance Quote Application

A modern, multi-step auto insurance quote application with **dual ping comparison system** that automatically compares QuoteWizard and ExchangeFlo rates and posts leads to the highest bidder.

## 🏗️ Architecture

### Single Server Design
- **Consolidated server.js** - All functionality in one place
- **Dual ping system** - QuoteWizard vs ExchangeFlo comparison
- **Automatic winner selection** - Posts to highest bidder
- **Enhanced logging** - Comprehensive request/response tracking
- **TrustedForm integration** - Real certificates in production, random in testing

### Tech Stack
- **Frontend**: React.js with modern UI/UX
- **Backend**: Node.js/Express single server
- **Database**: MySQL with optimized schema
- **APIs**: QuoteWizard (XML) + ExchangeFlo (JSON)
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- PM2 (for production)
- Nginx (for production)

### Development Setup

1. **Clone and install:**
```bash
git clone <repository-url>
cd auto-insurancev2
npm install
```

2. **Database setup:**
```bash
# Create database and tables
mysql -u root -p < server/database/init.sql
```

3. **Environment configuration:**
```bash
cp server/config.example.js server/config.js
# Edit config.js with your API keys and database credentials
```

4. **Start development:**
```bash
# Frontend (http://localhost:3000)
npm start

# Backend (http://localhost:5000)
npm run server

# Both simultaneously
npm run dev
```

### Production Deployment

**Automated deployment:**
```bash
# Run the consolidated deployment script
chmod +x deploy-update-clean.sh
./deploy-update-clean.sh
```

**Manual deployment:**
```bash
# Build frontend
npm run build

# Start with PM2
pm2 start server/server.js --name auto-insurance-app --env production
pm2 save
```

## 🎯 Core Features

### Dual Ping Comparison System
The application automatically:
1. **Pings both services** simultaneously (QuoteWizard + ExchangeFlo)
2. **Compares bid values** in real-time
3. **Selects the winner** (highest dollar amount)
4. **Posts the lead** to the winning service
5. **Logs everything** for analytics

### Multi-Step Form
- **Progressive data collection** with smart validation
- **Real-time zip code lookup** for location data
- **Dynamic vehicle year/make/model** selection
- **Insurance history** and coverage preferences
- **Contact information** with TrustedForm integration

### Advanced Features
- **TrustedForm Certificates**: Real certificates in production, random in testing
- **Phone Number Formatting**: Automatic formatting and validation
- **State Mapping**: Full state name resolution
- **Error Handling**: Graceful degradation and detailed logging
- **Analytics**: Comprehensive request/response tracking

## 📊 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check and system status
- `POST /api/ping-both` - Dual ping comparison (main feature)
- `POST /api/post-winner` - Post to winning service
- `GET /api/location` - Location lookup by IP or zip

### Testing Endpoints
- `POST /api/test/ping` - Test ping logging
- Test script: `node server/test-ping-comparison.js`

## 🗄️ Database Schema

### Core Tables
- **`ping_requests`** - General ping logging (all providers)
- **`post_requests`** - General post logging (all providers) 
- **`ping_comparison`** - QuoteWizard vs ExchangeFlo comparisons
- **`insurance_ping`** - Legacy compatibility table

### Analytics Views
- **`request_analytics`** - Combined ping/post analysis
- **`comparison_analytics`** - Dual ping comparison insights

## 🧪 Testing

### Automated Testing
```bash
# Test the dual ping comparison system
node server/test-ping-comparison.js

# Check API health
curl http://localhost:5000/api/health
```

### Manual Testing
```bash
# Test dual ping endpoint
curl -X POST http://localhost:5000/api/ping-both \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

## 📝 Configuration

### Environment Variables
```javascript
// server/config.js
module.exports = {
  // Database
  DB_HOST: 'localhost',
  DB_USER: 'smartautoinsider_user',
  DB_PASSWORD: 'your_password',
  DB_NAME: 'smartautoinsider_db',
  
  // QuoteWizard
  QW_CONTRACT_ID: 'your_contract_id',
  
  // ExchangeFlo  
  EXCHANGEFLO_TOKEN: 'your_api_token',
  
  // Server
  PORT: 5000,
  NODE_ENV: 'production'
};
```

### TrustedForm Configuration
- **Production**: Uses real TrustedForm certificates from frontend script
- **Testing**: Generates random 40-character hex certificates
- **Format**: `https://cert.trustedform.com/{certificate_id}`

## 📈 Analytics & Monitoring

### PM2 Process Management
```bash
pm2 status                    # Check application status
pm2 logs auto-insurance-app   # View application logs
pm2 restart auto-insurance-app # Restart application
pm2 monit                     # Real-time monitoring
```

### Database Analytics
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

### Log Analysis
All requests and responses are logged with:
- **Timestamps** for tracking
- **Status codes** for success/failure analysis
- **Full request/response data** for debugging
- **Error details** for troubleshooting

## 🔧 Troubleshooting

### Common Issues

**Database Connection:**
```bash
# Test database connection
mysql -u smartautoinsider_user -p smartautoinsider_db
```

**Server Not Starting:**
```bash
# Check if port is in use
lsof -i :5000

# Check PM2 logs
pm2 logs auto-insurance-app --lines 50
```

**API Errors:**
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Check detailed logs in test responses
node server/test-ping-comparison.js
```

### Performance Optimization
- **Database Indexing**: Optimized indexes for all query patterns
- **Connection Pooling**: MySQL connection pool for efficiency
- **Logging Buffer**: Circular buffer to prevent memory leaks
- **Parallel Processing**: Simultaneous ping requests for speed

## 📚 Documentation

- **Server Documentation**: `server/README.md`
- **API Documentation**: `PING_COMPARISON_README.md`
- **Database Schema**: `server/database/init.sql`
- **Test Examples**: `server/test-ping-comparison.js`

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Test thoroughly**: Run all test scripts
4. **Submit a pull request**: Include detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎯 Key Benefits

- **Higher Revenue**: Automatic selection of highest bidder
- **Better Rates**: Competition between QuoteWizard and ExchangeFlo
- **Reliability**: Graceful fallback if one service fails
- **Analytics**: Detailed performance tracking and insights
- **Scalability**: Single server architecture with optimized database
- **Maintainability**: Consolidated codebase with comprehensive logging 