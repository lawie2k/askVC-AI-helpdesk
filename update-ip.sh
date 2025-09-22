#!/bin/bash

# Script to update API IP address when changing WiFi networks
# Updates both Admin Dashboard and React Native app
# Usage: ./update-ip.sh [new_ip_address]

if [ -z "$1" ]; then
    echo "Getting current IP address..."
    CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
    echo "Detected IP: $CURRENT_IP"
else
    CURRENT_IP=$1
fi

echo "Updating API base URL to: http://$CURRENT_IP:5050"
echo ""

# Update Admin Dashboard
echo "📱 Updating Admin Dashboard..."
sed -i '' "s|http://[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:5050|http://$CURRENT_IP:5050|g" "um-ai-chat-admin/src/config/api.ts"
echo "✅ Admin Dashboard updated"

# Update React Native App
echo "📱 Updating React Native App..."
sed -i '' "s|http://[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:5050|http://$CURRENT_IP:5050|g" "um-ai-chat/screens/login.tsx"
sed -i '' "s|http://[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:5050|http://$CURRENT_IP:5050|g" "um-ai-chat/screens/signup.tsx"
sed -i '' "s|http://[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:5050|http://$CURRENT_IP:5050|g" "um-ai-chat/screens/resetPass.tsx"
sed -i '' "s|http://[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*:5050|http://$CURRENT_IP:5050|g" "um-ai-chat/screens/chat.tsx"
echo "✅ React Native App updated"

echo ""
echo "🎉 All apps updated successfully!"
echo "New URL: http://$CURRENT_IP:5050"
echo ""
echo "Next steps:"
echo "1. Refresh your admin dashboard"
echo "2. Restart your React Native app"
