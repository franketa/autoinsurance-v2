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

echo "🚀 Starting deployment update..."

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

# Update database schema
print_info "🔄 Updating database schema..."
if mysql -u smartautoinsider_user -pSecurePassword123! smartautoinsider_db < server/database/init.sql 2>/dev/null; then
    print_success "Database schema updated successfully"
else
    print_warning "Database schema update failed - trying with root access..."
    if sudo mysql smartautoinsider_db < server/database/init.sql 2>/dev/null; then
        print_success "Database schema updated with root access"
    else
        print_error "Failed to update database schema"
        exit 1
    fi
fi

# Build the React app
print_info "🔨 Building React application..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed!"
    exit 1
fi

# Handle PM2 process restart/start
print_info "🔄 Managing PM2 application..."

# Check if PM2 process exists
if pm2 describe auto-insurance-app > /dev/null 2>&1; then
    print_info "Restarting existing PM2 process..."
    pm2 restart auto-insurance-app --update-env
    if [ $? -eq 0 ]; then
        print_success "Application restarted successfully"
    else
        print_error "Failed to restart application"
        exit 1
    fi
else
    print_warning "PM2 process doesn't exist, starting new process..."
    pm2 start server/server.js --name auto-insurance-app --env production
    if [ $? -eq 0 ]; then
        print_success "Application started successfully"
    else
        print_error "Failed to start application"
        exit 1
    fi
fi

# Save PM2 configuration
pm2 save > /dev/null 2>&1

# Show current status
print_success "🎉 Deployment completed successfully!"
echo ""
print_info "📊 Current PM2 Status:"
pm2 status

echo ""
print_info "📋 Recent Application Logs:"
pm2 logs auto-insurance-app --lines 5 --nostream

echo ""
print_info "🌐 Test Your Application:"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
echo "  Frontend: http://$SERVER_IP"
echo "  API Health: http://$SERVER_IP/api/health"
echo ""
print_info "💡 Useful Commands:"
echo "  View logs: pm2 logs auto-insurance-app"
echo "  Check status: pm2 status"
echo "  Restart app: pm2 restart auto-insurance-app"
