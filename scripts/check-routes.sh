#!/bin/bash

# Route Registration Verification Script
# Checks NestJS startup logs to verify all routes are properly registered

echo "=== NestJS Route Registration Verification ==="
echo "Starting server and capturing route mappings..."

# Kill any existing server
pkill -f "npm.*start" 2>/dev/null

# Start server in background and capture startup logs
timeout 15 npm start > /tmp/nest_startup.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 8

# Check if server is running
if curl -s --connect-timeout 3 "http://localhost:3000/health" >/dev/null 2>&1; then
    echo "✓ Server started successfully"
else
    echo "✗ Server failed to start"
    cat /tmp/nest_startup.log
    exit 1
fi

echo ""
echo "=== Registered Routes ==="

# Extract route mappings from startup logs
if grep -q "Mapped {" /tmp/nest_startup.log; then
    echo "Route mappings found in startup logs:"
    grep "Mapped {" /tmp/nest_startup.log | sort
else
    echo "❌ No route mappings found in startup logs"
    echo ""
    echo "Full startup log:"
    cat /tmp/nest_startup.log
fi

echo ""
echo "=== Testing Bulk Delete Routes ==="

# Test POST endpoints
echo "POST endpoints:"
for module in pages services media references team-members; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/${module}/admin/bulk-delete" \
        -X POST -H "Content-Type: application/json" -d '{"ids":[1]}')
    if [ "$response" = "401" ]; then
        echo "✓ POST /${module}/admin/bulk-delete: $response (auth required - endpoint exists)"
    elif [ "$response" = "404" ]; then
        echo "❌ POST /${module}/admin/bulk-delete: $response (NOT FOUND)"
    else
        echo "? POST /${module}/admin/bulk-delete: $response (unexpected)"
    fi
done

# Test contact-info specially
response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/contact-info/admin/submissions/bulk-delete" \
    -X POST -H "Content-Type: application/json" -d '{"ids":[1]}')
if [ "$response" = "401" ]; then
    echo "✓ POST /contact-info/admin/submissions/bulk-delete: $response (auth required - endpoint exists)"
elif [ "$response" = "404" ]; then
    echo "❌ POST /contact-info/admin/submissions/bulk-delete: $response (NOT FOUND)"
else
    echo "? POST /contact-info/admin/submissions/bulk-delete: $response (unexpected)"
fi

echo ""
echo "DELETE endpoints (should return 410 Gone):"
for module in pages services media references team-members; do
    response=$(curl -s "http://localhost:3000/${module}/admin/bulk" \
        -X DELETE -H "Content-Type: application/json" -d '{"ids":[1]}')
    if echo "$response" | grep -q "410\|Gone\|deprecated"; then
        echo "✓ DELETE /${module}/admin/bulk: Returns 410 Gone (properly deprecated)"
    elif echo "$response" | grep -q "404\|Cannot DELETE"; then
        echo "❌ DELETE /${module}/admin/bulk: Returns 404 (route not found)"
    else
        echo "? DELETE /${module}/admin/bulk: $(echo "$response" | head -c 100)"
    fi
done

echo ""
echo "=== Module Registration Check ==="

# Check that modules are compiled correctly
echo "Checking compiled modules in dist/:"
for module in services media references team-members contact-info; do
    if [ -f "dist/src/${module}/${module}.controller.js" ]; then
        echo "✓ ${module}.controller.js exists"
    else
        echo "❌ ${module}.controller.js MISSING"
    fi

    if [ -f "dist/src/${module}/${module}.module.js" ]; then
        echo "✓ ${module}.module.js exists"
    else
        echo "❌ ${module}.module.js MISSING"
    fi
done

echo ""
echo "=== Controller Decorator Check ==="

# Check that bulk-delete routes are properly decorated
for module in services media references team-members; do
    if grep -q "Post.*bulk-delete" "dist/src/${module}/${module}.controller.js" 2>/dev/null; then
        echo "✓ ${module}: POST bulk-delete decorator found"
    else
        echo "❌ ${module}: POST bulk-delete decorator MISSING"
    fi

    if grep -q "Delete.*bulk" "dist/src/${module}/${module}.controller.js" 2>/dev/null; then
        echo "✓ ${module}: DELETE bulk decorator found"
    else
        echo "❌ ${module}: DELETE bulk decorator MISSING"
    fi
done

# Cleanup
kill $SERVER_PID 2>/dev/null
rm -f /tmp/nest_startup.log

echo ""
echo "=== Route Verification Complete ==="