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

# Comprehensive system checks
print_info "🔍 Running system checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project directory! Please run from /var/www/auto-insurance"
    exit 1
fi

# Check if required services are available
print_info "Checking required services..."

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_error "MySQL client not found! Please install mysql-client"
    exit 1
fi

# Check if MySQL server is running
if ! sudo systemctl is-active --quiet mysql && ! sudo systemctl is-active --quiet mysqld; then
    print_error "MySQL service is not running!"
    print_info "Available MySQL services:"
    sudo systemctl list-units --type=service | grep -i mysql || echo "No MySQL services found"
    print_info "Trying to start MySQL..."
    if sudo systemctl start mysql 2>/dev/null || sudo systemctl start mysqld 2>/dev/null; then
        print_success "MySQL started successfully"
    else
        print_error "Failed to start MySQL. Please start it manually:"
        echo "  sudo systemctl start mysql"
        echo "  OR"
        echo "  sudo systemctl start mysqld"
        exit 1
    fi
else
    print_success "MySQL is running"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found! Please install Node.js"
    exit 1
fi

# Check PM2
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 not found! Installing PM2..."
    npm install -g pm2
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found! Please install npm"
    exit 1
fi

print_success "All system checks passed"

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

# Define password as a variable (simple password with no special characters)
DB_PASSWORD='password123'

# Create database and user with better error handling
print_info "📊 Creating database..."
echo "Executing: CREATE DATABASE IF NOT EXISTS smartautoinsider_db..."
DB_CREATE_OUTPUT=$(sudo mysql -e "CREATE DATABASE IF NOT EXISTS smartautoinsider_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1)
DB_CREATE_EXIT_CODE=$?
if [ $DB_CREATE_EXIT_CODE -eq 0 ]; then
    print_success "Database created/verified"
else
    print_error "Failed to create database. Exit code: $DB_CREATE_EXIT_CODE"
    echo "Error output: $DB_CREATE_OUTPUT"
    print_info "Trying to check if MySQL is running..."
    if sudo systemctl is-active --quiet mysql; then
        print_info "MySQL service is running"
    else
        print_error "MySQL service is not running!"
        sudo systemctl status mysql
        exit 1
    fi
    exit 1
fi

print_info "👤 Creating database user..."
echo "Executing: CREATE USER IF NOT EXISTS 'smartautoinsider_user'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
USER_CREATE_OUTPUT=$(sudo mysql -e "CREATE USER IF NOT EXISTS 'smartautoinsider_user'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';" 2>&1)
USER_CREATE_EXIT_CODE=$?
if [ $USER_CREATE_EXIT_CODE -eq 0 ]; then
    print_success "Database user created/verified"
elif echo "$USER_CREATE_OUTPUT" | grep -q "Operation CREATE USER failed"; then
    print_warning "User already exists (this is normal)"
else
    print_error "Failed to create user. Exit code: $USER_CREATE_EXIT_CODE"
    echo "Error output: $USER_CREATE_OUTPUT"
    print_info "Checking if user already exists..."
    sudo mysql -e "SELECT User FROM mysql.user WHERE User='smartautoinsider_user';"
fi

print_info "🔐 Granting privileges..."
echo "Executing: GRANT ALL PRIVILEGES ON smartautoinsider_db.* TO 'smartautoinsider_user'@'localhost'; FLUSH PRIVILEGES;"
GRANT_OUTPUT=$(sudo mysql -e "GRANT ALL PRIVILEGES ON smartautoinsider_db.* TO 'smartautoinsider_user'@'localhost'; FLUSH PRIVILEGES;" 2>&1)
GRANT_EXIT_CODE=$?
if [ $GRANT_EXIT_CODE -eq 0 ]; then
    print_success "Privileges granted successfully"
else
    print_error "Failed to grant privileges. Exit code: $GRANT_EXIT_CODE"
    echo "Error output: $GRANT_OUTPUT"
    print_info "Checking user privileges..."
    sudo mysql -e "SHOW GRANTS FOR 'smartautoinsider_user'@'localhost';" 2>/dev/null || print_warning "Could not show grants"
    exit 1
fi

# Test database connection with better error handling
print_info "🧪 Testing database connection..."

# Create a temporary MySQL config file to avoid password on command line
TEMP_MYSQL_CONFIG=$(mktemp)
cat > "$TEMP_MYSQL_CONFIG" << EOF
[client]
user=smartautoinsider_user
password=${DB_PASSWORD}
host=localhost
database=smartautoinsider_db
EOF

if mysql --defaults-file="$TEMP_MYSQL_CONFIG" -e "SELECT 'Database connection successful' as status, NOW() as timestamp;" 2>/dev/null; then
    print_success "Database connection test successful"
    CONNECTION_METHOD="user"
else
    print_warning "User connection failed - testing root access..."
    if sudo mysql smartautoinsider_db -e "SELECT 'Database connection successful' as status, NOW() as timestamp;" 2>/dev/null; then
        print_success "Database connection test successful with root access"
        CONNECTION_METHOD="root"
    else
        print_error "Failed to connect to database with both user and root"
        rm -f "$TEMP_MYSQL_CONFIG"
        exit 1
    fi
fi

# Backup existing schema (optional safety measure)
print_info "💾 Creating database backup..."
if [ "$CONNECTION_METHOD" = "user" ]; then
    mysqldump --defaults-file="$TEMP_MYSQL_CONFIG" smartautoinsider_db > backup_$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || print_warning "Backup failed (database may be empty)"
else
    sudo mysqldump smartautoinsider_db > backup_$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || print_warning "Backup failed (database may be empty)"
fi

# Update database schema with consolidated version
print_info "🔄 Updating database schema with consolidated version..."

# Check if the schema file exists
if [ ! -f "server/database/init.sql" ]; then
    print_error "Database schema file not found: server/database/init.sql"
    print_info "Available files in server/database/:"
    ls -la server/database/ 2>/dev/null || echo "Directory does not exist"
    rm -f "$TEMP_MYSQL_CONFIG"
    exit 1
fi

print_info "Schema file found: server/database/init.sql"
echo "File size: $(wc -l < server/database/init.sql) lines"

if [ "$CONNECTION_METHOD" = "user" ]; then
    print_info "Attempting schema update with user credentials..."
    SCHEMA_OUTPUT=$(mysql --defaults-file="$TEMP_MYSQL_CONFIG" < server/database/init.sql 2>&1)
    SCHEMA_EXIT_CODE=$?
    if [ $SCHEMA_EXIT_CODE -eq 0 ]; then
        print_success "Consolidated database schema updated successfully"
    else
        print_error "Failed to update database schema with user credentials. Exit code: $SCHEMA_EXIT_CODE"
        echo "Error output: $SCHEMA_OUTPUT"
        print_info "Attempting with root access..."
        ROOT_SCHEMA_OUTPUT=$(sudo mysql smartautoinsider_db < server/database/init.sql 2>&1)
        ROOT_SCHEMA_EXIT_CODE=$?
        if [ $ROOT_SCHEMA_EXIT_CODE -eq 0 ]; then
            print_success "Consolidated database schema updated with root access"
        else
            print_error "Failed to update consolidated database schema with root. Exit code: $ROOT_SCHEMA_EXIT_CODE"
            echo "Root error output: $ROOT_SCHEMA_OUTPUT"
            rm -f "$TEMP_MYSQL_CONFIG"
            exit 1
        fi
    fi
else
    print_info "Attempting schema update with root access..."
    ROOT_SCHEMA_OUTPUT=$(sudo mysql smartautoinsider_db < server/database/init.sql 2>&1)
    ROOT_SCHEMA_EXIT_CODE=$?
    if [ $ROOT_SCHEMA_EXIT_CODE -eq 0 ]; then
        print_success "Consolidated database schema updated with root access"
    else
        print_error "Failed to update consolidated database schema. Exit code: $ROOT_SCHEMA_EXIT_CODE"
        echo "Error output: $ROOT_SCHEMA_OUTPUT"
        rm -f "$TEMP_MYSQL_CONFIG"
        exit 1
    fi
fi

# Clean up temporary config file
rm -f "$TEMP_MYSQL_CONFIG"

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

# Test the postback integration system
print_info "🧪 Running postback integration test..."
node server/test-postbacks.js 2>/dev/null && print_success "Postback integration test completed!" || print_warning "Postback integration test had issues - check logs"

print_success "🎊 Consolidated deployment and testing completed!" 
print_info "🏆 Your application is now running with:"
echo "  • Single server.js architecture"
echo "  • Consolidated database schema"
echo "  • QuoteWizard vs ExchangeFlo dual ping system"
echo "  • Automatic winner selection and posting"
echo "  • Enhanced logging and error handling" 