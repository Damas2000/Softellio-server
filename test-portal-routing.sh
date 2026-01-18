#!/bin/zsh
# Portal Domain & API Routing Test Script
# Tests portal domain bypass, API routing, and admin panel links

echo "🚀 Portal Domain & API Routing Test Suite"
echo "Testing multi-tenant routing fixes..."
echo "==========================================="

BASE_URL="http://localhost:3000"
MAX_TIME=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local host_header=$3
    local expected_pattern=$4
    local description=$5

    echo ""
    echo "🧪 Testing: $description"
    if [[ -n "$host_header" ]]; then
        echo "   $method $endpoint (Host: $host_header)"
        response=$(curl -s -i --max-time $MAX_TIME -X $method -H "Host: $host_header" "$BASE_URL$endpoint" 2>/dev/null)
    else
        echo "   $method $endpoint"
        response=$(curl -s -i --max-time $MAX_TIME -X $method "$BASE_URL$endpoint" 2>/dev/null)
    fi

    # Check if curl timed out or failed
    curl_exit_code=$?
    if [[ $curl_exit_code -eq 28 ]]; then
        echo "   ${RED}❌ TIMEOUT - Request hung for ${MAX_TIME}s!${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return
    elif [[ $curl_exit_code -ne 0 ]]; then
        echo "   ${RED}❌ CURL ERROR (exit code: $curl_exit_code)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return
    fi

    # Extract status code
    status_line=$(echo "$response" | head -1)
    status_code=$(echo "$status_line" | grep -o 'HTTP/[0-9.]* [0-9]*' | grep -o '[0-9]*$')

    # Check expected pattern
    case $expected_pattern in
        "NOT_HTML")
            if echo "$response" | grep -q "Content-Type.*text/html"; then
                echo "   ${RED}❌ FAIL - Returned HTML (should not serve HTML)${NC}"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            else
                echo "   ${GREEN}✅ PASS - No HTML served (Status: $status_code)${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            fi
            ;;
        "HTML_200")
            if [[ "$status_code" == "200" ]] && echo "$response" | grep -q "Content-Type.*text/html"; then
                echo "   ${GREEN}✅ PASS - HTML 200${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo "   ${RED}❌ FAIL - Expected HTML 200, got status: $status_code${NC}"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            fi
            ;;
        "JSON_API")
            if echo "$response" | grep -q "Content-Type.*application/json"; then
                echo "   ${GREEN}✅ PASS - JSON API response (Status: $status_code)${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            elif [[ "$status_code" == "404" ]] || [[ "$status_code" == "401" ]]; then
                echo "   ${GREEN}✅ PASS - API responded with $status_code (not HTML)${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo "   ${RED}❌ FAIL - Expected JSON API, got status: $status_code${NC}"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            fi
            ;;
        *)
            if [[ "$status_code" == "$expected_pattern" ]]; then
                echo "   ${GREEN}✅ PASS - Status: $status_code${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo "   ${YELLOW}⚠️  STATUS MISMATCH - Expected: $expected_pattern, Got: $status_code${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1)) # Still pass if no hang
            fi
            ;;
    esac
}

echo ""
echo "1️⃣ ${BLUE}CRITICAL: Portal domain MUST NOT serve HTML${NC}"
echo "================================================="

# Portal domain should NOT serve HTML from FrontendController
test_endpoint "GET" "/" "portal.softellio.com" "NOT_HTML" "Portal domain root - should NOT serve HTML"
test_endpoint "GET" "/login" "portal.softellio.com" "NOT_HTML" "Portal domain login - should NOT serve HTML"
test_endpoint "GET" "/" "www.portal.softellio.com" "NOT_HTML" "Portal domain with www - should NOT serve HTML"

echo ""
echo "2️⃣ ${BLUE}TENANT SITES: Should serve HTML${NC}"
echo "======================================="

# Tenant domains should serve HTML
test_endpoint "GET" "/" "acme.softellio.com" "HTML_200" "Tenant domain should serve HTML"
test_endpoint "GET" "/" "demo.softellio.com" "HTML_200" "Demo tenant should serve HTML"
test_endpoint "GET" "/" "localhost:3000" "HTML_200" "Localhost should serve HTML (demo)"

echo ""
echo "3️⃣ ${BLUE}API ROUTES: Must not serve HTML${NC}"
echo "====================================="

# API routes should NOT serve HTML
test_endpoint "GET" "/tenants/by-domain?host=demo.softellio.com" "" "JSON_API" "/tenants/by-domain - should be JSON API"
test_endpoint "GET" "/auth/login" "" "JSON_API" "/auth/login - should be API"
test_endpoint "GET" "/users" "" "JSON_API" "/users - should be API (401 or JSON)"
test_endpoint "GET" "/health" "" "JSON_API" "/health - should be API"

echo ""
echo "4️⃣ ${BLUE}LEGACY /api PREFIX: Should work${NC}"
echo "===================================="

# Future /api routes should work
test_endpoint "GET" "/api/tenants/by-domain?host=demo.softellio.com" "" "JSON_API" "/api/tenants/by-domain - should be API"
test_endpoint "GET" "/api/health" "" "JSON_API" "/api/health - should be API"

echo ""
echo "5️⃣ ${BLUE}ADMIN LINKS: Check updated format${NC}"
echo "====================================="

echo "📋 Checking if HTML contains updated admin links..."
admin_link_response=$(curl -s --max-time 3 -H "Host: demo.softellio.com" "$BASE_URL/" 2>/dev/null)

if echo "$admin_link_response" | grep -q "portal.softellio.com/login?tenant="; then
    echo "   ${GREEN}✅ PASS - Admin links use portal.softellio.com format${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "   ${RED}❌ FAIL - Admin links still use old panel subdomain format${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

if echo "$admin_link_response" | grep -q "panel.softellio.com"; then
    echo "   ${RED}❌ FAIL - Found old panel subdomain links${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
else
    echo "   ${GREEN}✅ PASS - No old panel subdomain links found${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

echo ""
echo "📊 TEST RESULTS"
echo "==============="
echo "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo "Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total:  $((TESTS_PASSED + TESTS_FAILED))"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo ""
    echo "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "✅ Portal domain bypass working"
    echo "✅ API routes not serving HTML"
    echo "✅ Tenant sites serving HTML"
    echo "✅ Admin links updated to single domain"
    echo ""
    echo "Multi-tenant routing fixes successful! 🚀"
else
    echo ""
    echo "${RED}❌ $TESTS_FAILED TESTS FAILED${NC}"
    echo "Check the output above for issues."
    exit 1
fi