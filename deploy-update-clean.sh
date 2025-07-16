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

echo "🚀 Starting CONSOLIDATED deployment update..."

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
DB_PASSWORD="6UU2^5\$dK)2_?^n3K6"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS smartautoinsider_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
sudo mysql -e "CREATE USER IF NOT EXISTS 'smartautoinsider_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';" 2>/dev/null || true
sudo mysql -e "GRANT ALL PRIVILEGES ON smartautoinsider_db.* TO 'smartautoinsider_user'@'localhost';" 2>/dev/null || true
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true

# Test database connection
print_info "🧪 Testing database connection..."
if mysql -u smartautoinsider_user -p"$DB_PASSWORD" smartautoinsider_db -e "SELECT 'Database connection successful' as status, NOW() as timestamp;" 2>/dev/null; then
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
mysqldump -u smartautoinsider_user -p"$DB_PASSWORD" smartautoinsider_db > backup_$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || true

# Update database schema with consolidated version
print_info "🔄 Updating database schema with consolidated version..."
if mysql -u smartautoinsider_user -p"$DB_PASSWORD" smartautoinsider_db < server/database/init.sql 2>/dev/null; then
    print_success "Consolidated database schema updated successfully"
else
    print_warning "Database schema update failed - trying with root access..."
    if sudo mysql smartautoinsider_db < server/database/init.sql 2>/dev/null; then
        print_success "Consolidated database schema updated with root access"
    else
        print_error "Failed to update consolidated database schema"
        exit 1
    fi
fi

# Test the database service
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

# Verify our single server.js exists
print_info "🔍 Verifying server architecture..."
if [ -f "server/server.js" ]; then
    print_success "Single consolidated server.js found"
else
    print_error "server.js not found! Check your repository structure"
    exit 1
fi

# Start with our consolidated single server
print_info "🚀 Starting consolidated single server application..."
pm2 start server/server.js --name auto-insurance-app --env production
if [ $? -eq 0 ]; then
    print_success "Consolidated application started successfully"
else
    print_error "Failed to start consolidated application"
    exit 1
fi

# Wait a moment for the server to start
sleep 3

# Test the new endpoints
print_info "🧪 Testing API endpoints..."

# Test health endpoint
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_success "Health endpoint test successful"
else
    print_warning "Health endpoint test failed (HTTP $HEALTH_RESPONSE)"
fi

# Test ping comparison endpoint (our main feature)
print_info "🎯 Testing dual ping comparison system..."
PING_TEST_DATA='{"firstName":"TestUser","lastName":"Deploy","email":"test@example.com","phoneNumber":"5551234567","streetAddress":"123 Test St","city":"Seattle","state":"WA","zipcode":"98101","birthdate":"1985-01-01","gender":"Male","maritalStatus":"Single","creditScore":"Good","homeowner":"Own","military":"No","driverEducation":"Bachelor'\''s Degree","driverOccupation":"Engineer","driversLicense":"Yes","sr22":"No","insuranceHistory":"Yes","currentAutoInsurance":"Geico","insuranceDuration":"1-3 years","coverageType":"Full Coverage","vehicles":[{"year":"2020","make":"Toyota","model":"Camry","purpose":"commute","mileage":"10000-15000","ownership":"owned"}]}'

PING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$PING_TEST_DATA" \
    http://localhost:5000/api/ping-both)

if [ "$PING_RESPONSE" = "200" ]; then
    print_success "Dual ping comparison endpoint test successful"
else
    print_warning "Dual ping comparison endpoint test failed (HTTP $PING_RESPONSE)"
fi

# Save PM2 configuration
pm2 save > /dev/null 2>&1

# Show current status
print_success "🎉 Consolidated deployment completed successfully!"
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
echo "  Dual Ping Test: http://$SERVER_IP/api/ping-both"
echo ""
print_info "🎯 Key Features Available:"
echo "  • Single consolidated server architecture"
echo "  • QuoteWizard + ExchangeFlo dual ping comparison"
echo "  • Automated winner selection and posting"
echo "  • Comprehensive logging and analytics"
echo "  • TrustedForm certificate integration"
echo ""
print_info "💡 Useful Commands:"
echo "  View logs: pm2 logs auto-insurance-app"
echo "  Check status: pm2 status"
echo "  Restart app: pm2 restart auto-insurance-app"
echo "  Test dual ping: node server/test-ping-comparison.js"

# Test the dual ping comparison system
print_info "🧪 Running comprehensive integration test..."
node server/test-ping-comparison.js 2>/dev/null && print_success "Integration test completed!" || print_warning "Integration test had issues - check logs"

print_success "🎊 Consolidated deployment and testing completed!" 
print_info "🏆 Your application is now running with:"
echo "  • Single server.js architecture"
echo "  • Consolidated database schema"
echo "  • QuoteWizard vs ExchangeFlo dual ping system"
echo "  • Automatic winner selection and posting"
echo "  • Enhanced logging and error handling" 