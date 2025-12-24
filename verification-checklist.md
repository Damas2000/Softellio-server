# Backend Fixes Verification Checklist

This checklist contains 10 curl commands that MUST succeed to verify all backend fixes are working correctly.

## Prerequisites

1. Start the backend server: `npm run start:dev`
2. Ensure the database is seeded: `npm run seed`
3. Set these environment variables for testing:

```bash
export BASE_URL="http://localhost:3000"
export TENANT_DOMAIN="demo.softellio.com"

# Get admin token (login first)
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{
    "email": "admin@demo.softellio.com",
    "password": "TenantAdmin123!"
  }')

export ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Admin Token: $ADMIN_TOKEN"
```

---

## Verification Commands

### ✅ 1. Test Bulk Delete Validation (Pages) - MUST SUCCEED

```bash
# Should succeed with proper numeric IDs
curl -X DELETE "$BASE_URL/pages/admin/bulk" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{"ids": [999, 998]}' \
  -w "Status: %{http_code}\n"
```

**Expected**: 200 OK (even if pages don't exist, validation should pass)

---

### ✅ 2. Test Bulk Delete Validation Rejection - MUST FAIL

```bash
# Should fail with invalid IDs (strings instead of numbers)
curl -X DELETE "$BASE_URL/services/admin/bulk" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{"ids": ["invalid", "strings"]}' \
  -w "Status: %{http_code}\n"
```

**Expected**: 400 Bad Request with validation error message

---

### ✅ 3. Test Public Pages List Route - MUST SUCCEED

```bash
# Should return array of published pages (not conflict with slug route)
curl -X GET "$BASE_URL/pages/public/tr/list" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -w "Status: %{http_code}\n"
```

**Expected**: 200 OK with JSON array response

---

### ✅ 4. Test Menu Item Creation (Group Item) - MUST SUCCEED

```bash
# Create a menu first, then create a group item (no pageId or externalUrl)
MENU_RESPONSE=$(curl -s -X POST "$BASE_URL/menu/admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{"key": "test-menu-' $(date +%s) '"}')

MENU_ID=$(echo $MENU_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

curl -X POST "$BASE_URL/menu/admin/items" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{
    "menuId": ' $MENU_ID ',
    "translations": [
      {"language": "tr", "label": "Group Menu Item"}
    ]
  }' \
  -w "Status: %{http_code}\n"
```

**Expected**: 201 Created (group item with null pageId and externalUrl)

---

### ✅ 5. Test Menu Reorder Validation - MUST SUCCEED

```bash
# Test menu reorder with proper DTO
curl -X POST "$BASE_URL/menu/admin/1/reorder" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{
    "items": [
      {"id": 1, "order": 1, "parentId": null},
      {"id": 2, "order": 2, "parentId": null}
    ]
  }' \
  -w "Status: %{http_code}\n"
```

**Expected**: 200 OK or 404 if menu doesn't exist (but not 500 crash)

---

### ✅ 6. Test Site Settings Translation Upsert - MUST SUCCEED

```bash
# Should succeed with required siteName field
curl -X PATCH "$BASE_URL/site-settings/admin/translation/tr" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{
    "siteName": "Test Site Name",
    "siteDescription": "Test Description",
    "seoMetaTitle": "Test SEO Title"
  }' \
  -w "Status: %{http_code}\n"
```

**Expected**: 200 OK

---

### ✅ 7. Test Site Settings Translation Validation - MUST FAIL

```bash
# Should fail without required siteName
curl -X PATCH "$BASE_URL/site-settings/admin/translation/en" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{
    "siteDescription": "Missing siteName"
  }' \
  -w "Status: %{http_code}\n"
```

**Expected**: 400 Bad Request with validation error

---

### ✅ 8. Test SEO Structured Data (JSON Object) - MUST SUCCEED

```bash
# Should accept JSON object for jsonLd field
curl -X POST "$BASE_URL/seo/admin/structured-data" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{
    "entityType": "organization",
    "entityId": "test-org",
    "schemaType": "Organization",
    "jsonLd": {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Test Company",
      "url": "https://test.com"
    }
  }' \
  -w "Status: %{http_code}\n"
```

**Expected**: 201 Created

---

### ✅ 9. Test Authentication Error Messages - MUST FAIL WITH SPECIFIC MESSAGE

```bash
# Should return specific error for invalid token
curl -X GET "$BASE_URL/pages/admin" \
  -H "Authorization: Bearer invalid_token_here" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -w "Status: %{http_code}\n" \
  -s | grep -o '"message":"[^"]*"'
```

**Expected**: 401 Unauthorized with message containing "Invalid token" or "expired"

---

### ✅ 10. Test Prisma Error Conversion - MUST RETURN 409 CONFLICT

```bash
# Create duplicate slug to trigger Prisma P2002 error (unique constraint)
# This should return 409 Conflict, not 500 Internal Server Error
curl -X POST "$BASE_URL/pages/admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{
    "translations": [
      {
        "language": "tr",
        "title": "Duplicate Test",
        "slug": "duplicate-slug-test",
        "contentJson": {"blocks": []}
      }
    ]
  }' > /dev/null

# Try to create another page with the same slug
curl -X POST "$BASE_URL/pages/admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{
    "translations": [
      {
        "language": "tr",
        "title": "Another Duplicate Test",
        "slug": "duplicate-slug-test",
        "contentJson": {"blocks": []}
      }
    ]
  }' \
  -w "Status: %{http_code}\n"
```

**Expected**: 409 Conflict with user-friendly error message (not 500 Internal Server Error)

---

## Success Criteria

All commands should:
1. **Not return 500 Internal Server Error** (except for legitimate server issues)
2. **Return appropriate HTTP status codes** (200, 201, 400, 401, 404, 409)
3. **Provide clear, user-friendly error messages** (no raw Prisma errors)
4. **Validate input properly** (reject invalid data with 400)
5. **Handle authentication correctly** (401 with specific messages)

## Quick Verification Script

Save this as `verify-fixes.sh` and run `chmod +x verify-fixes.sh && ./verify-fixes.sh`:

```bash
#!/bin/bash
set -e

echo "🔍 Running Backend Fixes Verification..."
echo "========================================"

# Set variables
BASE_URL="http://localhost:3000"
TENANT_DOMAIN="demo.softellio.com"

# Login and get token
echo "🔑 Getting admin token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{"email": "admin@demo.softellio.com", "password": "TenantAdmin123!"}')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to get admin token. Check if server is running and seeded."
    exit 1
fi

echo "✅ Admin token obtained"

# Test 1: Bulk delete validation
echo "🧪 Test 1: Bulk delete validation..."
STATUS=$(curl -s -X DELETE "$BASE_URL/pages/admin/bulk" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{"ids": [999, 998]}' \
  -w "%{http_code}" -o /dev/null)

if [ "$STATUS" = "200" ]; then
    echo "✅ Test 1 PASSED"
else
    echo "❌ Test 1 FAILED (Expected 200, got $STATUS)"
fi

# Test 2: Invalid bulk delete
echo "🧪 Test 2: Invalid bulk delete rejection..."
STATUS=$(curl -s -X DELETE "$BASE_URL/services/admin/bulk" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -d '{"ids": ["invalid"]}' \
  -w "%{http_code}" -o /dev/null)

if [ "$STATUS" = "400" ]; then
    echo "✅ Test 2 PASSED"
else
    echo "❌ Test 2 FAILED (Expected 400, got $STATUS)"
fi

# Test 3: Public pages list
echo "🧪 Test 3: Public pages list route..."
STATUS=$(curl -s -X GET "$BASE_URL/pages/public/tr/list" \
  -H "X-Tenant-Host: $TENANT_DOMAIN" \
  -w "%{http_code}" -o /dev/null)

if [ "$STATUS" = "200" ]; then
    echo "✅ Test 3 PASSED"
else
    echo "❌ Test 3 FAILED (Expected 200, got $STATUS)"
fi

echo "========================================"
echo "🎉 Basic verification complete!"
echo "Run individual commands for detailed testing."
```

This verification checklist ensures all your backend fixes are working correctly in production.