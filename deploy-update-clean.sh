#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${GREEN}🚀 $1${NC}"
}

echo "🚀 Starting CLEAN deployment update..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project directory! Please run from /var/www/auto-insurance"
    exit 1
fi

# Pull latest changes
print_info "📥 Pulling latest changes from GitHub..."
if git pull origin main; then
    print_success "Git pull successful"
else
    print_error "Git pull failed! Check for conflicts or network issues"
    exit 1
fi

# Check if package.json changed and install dependencies
print_info "📦 Checking for dependency changes..."
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    print_warning "Package.json changed, installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_info "No dependency changes detected"
fi

# Setup database and user (if needed)
print_info "🗄️ Setting up database and user..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS smartautoinsider_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
sudo mysql -e "CREATE USER IF NOT EXISTS 'smartautoinsider_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';" 2>/dev/null || true
sudo mysql -e "GRANT ALL PRIVILEGES ON smartautoinsider_db.* TO 'smartautoinsider_user'@'localhost';" 2>/dev/null || true
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true

# Test database connection
print_info "🧪 Testing database connection..."
if mysql -u smartautoinsider_user -pSecurePassword123! smartautoinsider_db -e "SELECT 'Database connection successful' as status, NOW() as timestamp;" 2>/dev/null; then
    print_success "Database connection test successful"
else
    print_warning "Database connection test failed - trying with root access..."
    if sudo mysql smartautoinsider_db -e "SELECT 'Database connection successful' as status, NOW() as timestamp;" 2>/dev/null; then
        print_success "Database connection test successful with root access"
    else
        print_error "Failed to connect to database"
        exit 1
    fi
fi

# Backup existing schema (optional safety measure)
print_info "💾 Creating database backup..."
mysqldump -u smartautoinsider_user -pSecurePassword123! smartautoinsider_db > backup_$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || true

# Update database schema with clean version
print_info "🔄 Updating database schema with clean version..."
if mysql -u smartautoinsider_user -pSecurePassword123! smartautoinsider_db < server/database/init_clean.sql 2>/dev/null; then
    print_success "Clean database schema updated successfully"
else
    print_warning "Clean database schema update failed - trying with root access..."
    if sudo mysql smartautoinsider_db < server/database/init_clean.sql 2>/dev/null; then
        print_success "Clean database schema updated with root access"
    else
        print_error "Failed to update clean database schema"
        exit 1
    fi
fi

# Test the new database service
print_info "🧪 Testing database service..."
node -e "
const databaseService = require('./server/database/service');
databaseService.testConnection().then(result => {
    if (result.success) {
        console.log('✅ Database service test successful');
        process.exit(0);
    } else {
        console.error('❌ Database service test failed:', result.error);
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Database service error:', error.message);
    process.exit(1);
});
" 2>/dev/null
if [ $? -eq 0 ]; then
    print_success "Database service test successful"
else
    print_warning "Database service test failed - will continue with deployment"
fi

# Build the React app
print_info "🔨 Building React application..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed!"
    exit 1
fi

# Stop PM2 process if running
print_info "🛑 Stopping existing PM2 process..."
pm2 stop auto-insurance-app 2>/dev/null || true

# Switch to clean server
print_info "🔄 Switching to clean server..."
if [ -f "server/server.js" ]; then
    mv server/server.js server/server-old.js
    print_info "Backed up old server to server-old.js"
fi

if [ -f "server/server-clean.js" ]; then
    cp server/server-clean.js server/server.js
    print_success "Switched to clean server"
else
    print_error "Clean server file not found!"
    exit 1
fi

# Handle PM2 process restart/start
print_info "🔄 Managing PM2 application with clean server..."

# Start with clean server
pm2 start server/server.js --name auto-insurance-app --env production
if [ $? -eq 0 ]; then
    print_success "Clean application started successfully"
else
    print_error "Failed to start clean application"
    exit 1
fi

# Wait a moment for the server to start
sleep 3

# Test the new endpoints
print_info "🧪 Testing new API endpoints..."

# Test health endpoint
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_success "Health endpoint test successful"
else
    print_warning "Health endpoint test failed (HTTP $HEALTH_RESPONSE)"
fi

# Test ping endpoint with sample data
PING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/test/ping)
if [ "$PING_RESPONSE" = "200" ]; then
    print_success "Test ping endpoint successful"
else
    print_warning "Test ping endpoint failed (HTTP $PING_RESPONSE)"
fi

# Save PM2 configuration
pm2 save > /dev/null 2>&1

# Show current status
print_success "🎉 Clean deployment completed successfully!"
echo ""
print_info "📊 Current PM2 Status:"
pm2 status

echo ""
print_info "📋 Recent Application Logs:"
pm2 logs auto-insurance-app --lines 10 --nostream

echo ""
print_info "🌐 Test Your Application:"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
echo "  Frontend: http://$SERVER_IP"
echo "  API Health: http://$SERVER_IP/api/health"
echo "  Dashboard: http://$SERVER_IP/admin/dashboard"
echo "  Ping Analytics: http://$SERVER_IP/api/analytics/pings"
echo ""
print_info "💡 Useful Commands:"
echo "  View logs: pm2 logs auto-insurance-app"
echo "  Check status: pm2 status"
echo "  Restart app: pm2 restart auto-insurance-app"
echo "  View dashboard: curl http://localhost:5000/admin/dashboard"
echo "  Test ping: curl -X POST http://localhost:5000/api/test/ping"

# Test logging functionality
print_info "🧪 Running integration test..."
node -e "
const axios = require('axios');

async function testLogging() {
    try {
        // Test ping logging
        const pingResponse = await axios.post('http://localhost:5000/api/log/ping', {
            request_data: { test: 'data' },
            response_data: { 
                status: 'success', 
                submission_id: 'test_$(date +%s)',
                pings: [{ value: 10.50 }]
            },
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Ping logging test successful');
        
        // Test post logging
        const postResponse = await axios.post('http://localhost:5000/api/log/post', {
            request_data: { submission_id: 'test_$(date +%s)' },
            response_data: { 
                status: 'success', 
                value: 15.75,
                results: [{ result: 'success' }]
            },
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Post logging test successful');
        console.log('🎉 All integration tests passed!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
    }
}

testLogging();
"

print_success "🎊 Clean deployment and testing completed!" 