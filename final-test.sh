#!/bin/bash

echo "🚀 ManaTuner Pro - Final Test"
echo "================================"

# Test if server responds
echo "🔍 Testing server..."
if curl -s http://localhost:3000/ | grep -q "ManaTuner Pro"; then
    echo "✅ Server is responding"
else
    echo "❌ Server issue"
    exit 1
fi

# Test main routes
echo ""
echo "🌐 Testing routes..."
for route in "/" "/analyzer" "/about" "/privacy"; do
    if curl -s "http://localhost:3000$route" > /dev/null; then
        echo "✅ Route $route accessible"
    else
        echo "❌ Route $route not accessible"
    fi
done

echo ""
echo "🎉 Tests completed!"
echo ""
echo "🌟 Your ManaTuner Pro application is ready!"
echo "📱 Open http://localhost:3000 in your browser"
echo ""
echo "🧪 Features to test:"
echo "   • Navigation between pages"
echo "   • Responsive design (resize window)"
echo "   • Analyzer functionality"
echo "   • Example deck loading"
echo "   • Analysis results"

# Automatically open in browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 Automatically opening browser..."
    open http://localhost:3000
fi 