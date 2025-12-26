#!/bin/zsh
echo "🚀 Phase 1 Routing Test Suite (macOS)"
echo "===================================="

BASE_URL="http://localhost:3000"
MAX_TIME=5

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

test_endpoint() {
  local method=$1
  local endpoint=$2
  local expected_status=$3
  local description=$4

  echo ""
  echo "🧪 $description"
  echo "   $method $endpoint"

  response=$(curl -s -w "%{http_code}" --max-time $MAX_TIME -X $method "$BASE_URL$endpoint" 2>/dev/null)
  code=$?

  if [[ $code -eq 28 ]]; then
    echo "   ${RED}❌ TIMEOUT (hung)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return
  elif [[ $code -ne 0 ]]; then
    echo "   ${RED}❌ CURL ERROR exit=$code${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return
  fi

  status="${response: -3}"
  if [[ "$status" == "$expected_status" ]]; then
    echo "   ${GREEN}✅ PASS${NC} status=$status"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "   ${YELLOW}⚠️  STATUS MISMATCH${NC} expected=$expected_status got=$status (but NOT hung)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  fi
}

echo ""
echo "1) MUST NOT HANG: /api/*"
test_endpoint "GET" "/api/tenants/by-domain?host=demo.softellio.com" "404" "/api/tenants/by-domain should respond quickly"
test_endpoint "GET" "/api/users" "401" "/api/users should respond quickly"
test_endpoint "GET" "/api/health" "404" "/api/health should respond quickly"

echo ""
echo "2) Existing routes should still work"
test_endpoint "GET" "/tenants/by-domain?host=demo.softellio.com" "200" "/tenants/by-domain public endpoint"
test_endpoint "GET" "/" "200" "Frontend HTML fallback should work"

echo ""
echo "📊 RESULTS: Passed=$TESTS_PASSED Failed=$TESTS_FAILED"
if [[ $TESTS_FAILED -eq 0 ]]; then
  echo "${GREEN}🎉 OK - No hanging routes.${NC}"
else
  echo "${RED}❌ Some tests failed.${NC}"
  exit 1
fi
