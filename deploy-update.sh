#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Check if package.json changed
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    echo "📦 Package.json changed, installing dependencies..."
    npm install
fi

# Rebuild the app
echo "🔨 Building React app..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart auto-insurance-app

# Show status
echo "✅ Deployment complete!"
pm2 status

echo ""
echo "🔍 Recent logs:"
pm2 logs auto-insurance-app --lines 5

echo ""
echo "🌐 Test your application:"
echo "Frontend: http://$(curl -s ifconfig.me)"
echo "API Health: http://$(curl -s ifconfig.me)/api/health"
