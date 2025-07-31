#!/bin/bash

echo "🔧 Android Dev Studio v4.0 - Browser Access"
echo "============================================="

# Try multiple methods to open browser
URL="http://127.0.0.1:8083"

echo "📱 Attempting to open: $URL"
echo ""

# Method 1: termux-open-url
if command -v termux-open-url &> /dev/null; then
    echo "🌐 Opening with termux-open-url..."
    termux-open-url "$URL" 2>/dev/null && echo "✅ Success!" || echo "❌ Failed"
fi

# Method 2: am (Android Activity Manager)
if command -v am &> /dev/null; then
    echo "🤖 Opening with Android Activity Manager..."
    am start -a android.intent.action.VIEW -d "$URL" 2>/dev/null && echo "✅ Success!" || echo "❌ Failed"
fi

# Method 3: Manual instructions
echo ""
echo "📋 Manual Access Instructions:"
echo "1. Open your web browser"
echo "2. Navigate to: $URL"
echo "3. Or try alternative ports:"
echo "   • http://127.0.0.1:8080"
echo "   • http://127.0.0.1:8081"
echo "   • http://127.0.0.1:8082"
echo ""

# Test server response
echo "🔍 Testing server response..."
if curl -s -f "$URL" > /dev/null 2>&1; then
    echo "✅ Server is responding correctly!"
else
    echo "❌ Server not responding - checking status..."
    ps aux | grep -v grep | grep "node.*simple_server.js" && echo "✅ Server process found" || echo "❌ Server not running"
fi

echo ""
echo "🎯 Professional Android Dev Studio v4.0 ready!"
echo "✨ Features: Flutter IDE, APK Builder, Terminal, Project Manager"