#!/bin/bash

# Auto Insurance App Deployment Script for Vultr Server
# Run this script on your Vultr server after uploading your code

set -e  # Exit on any error

echo "🚀 Starting Auto Insurance App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
print_status "Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
print_status "Installing MySQL..."
sudo apt install mysql-server -y

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install nginx -y

# Install dependencies
print_status "Installing application dependencies..."
npm install

# Setup MySQL database
print_status "Setting up MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS smartautoinsider_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'smartautoinsider_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON smartautoinsider_db.* TO 'smartautoinsider_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Run database initialization
print_status "Initializing database schema..."
mysql -u smartautoinsider_user -pSecurePassword123! smartautoinsider_db < server/database/init.sql

# Create production environment file
print_status "Creating production environment configuration..."
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=smartautoinsider_user
DB_PASSWORD=SecurePassword123!
DB_NAME=smartautoinsider_db

# QuoteWizard API Configuration
QW_CONTRACT_ID=E29908C1-CA19-4D3D-9F59-703CD5C12649

# Domain Configuration (update with your domain)
DOMAIN=yourdomain.com
API_URL=https://yourdomain.com/api
EOF

# Build React app
print_status "Building React application for production..."
npm run build

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'auto-insurance-app',
    script: 'server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

print_status "🎉 Deployment completed successfully!"
print_warning "Next steps:"
print_warning "1. Update your domain name in /etc/nginx/sites-available/auto-insurance"
print_warning "2. Update the .env.production file with your actual domain"
print_warning "3. Configure SSL with: sudo certbot --nginx -d yourdomain.com"
print_warning "4. Configure firewall with: sudo ufw enable && sudo ufw allow 22,80,443/tcp"

echo ""
print_status "Application URLs:"
echo "  Frontend: http://your-server-ip"
echo "  API Health: http://your-server-ip/api/health"
echo "  PM2 Status: pm2 status"
echo "  Logs: pm2 logs auto-insurance-app" 