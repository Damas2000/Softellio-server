# Domain Management Operational Guide

## Overview
This guide covers the operational aspects of the custom domain management system for Softellio, including Vercel deployment, customer DNS configuration, and end-to-end verification workflow.

## Production Deployment Checklist for Vercel

### 1. Backend Preparation (Railway/Your Platform)

#### Required Environment Variables
```env
# Database (already configured)
DATABASE_URL="postgresql://..."

# No additional environment variables needed for DNS verification
# Uses Node.js built-in dns/promises module
```

#### Deploy Backend Changes
- [ ] Deploy updated backend code with DomainsModule
- [ ] Run database migration (see migration-notes-domain-management.md)
- [ ] Verify all endpoints work in production:
  - `GET /tenants/by-domain?host=example.com`
  - `POST /domains` (with valid tenant token)
  - `POST /domains/verify/:id`
  - `PATCH /domains/:id`
  - `DELETE /domains/:id`

### 2. Frontend Preparation (Next.js on Vercel)

#### Vercel Project Setup
```bash
# If not already done, connect your Next.js project to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

#### Vercel Domain Configuration
1. **Go to Vercel Dashboard** → Your Project → Settings → Domains
2. **Add connect.softellio.com** as primary domain
3. **Configure custom domains** will be added dynamically (see step 4)

### 3. DNS Configuration for Softellio Infrastructure

#### Primary Softellio Domains
Configure these DNS records for your domains:

```dns
# Main API domain
api.softellio.com     A     [Railway IP or CNAME to Railway]

# Portal/Admin domain
portal.softellio.com  CNAME [Vercel CNAME]

# Connect domain (primary Vercel deployment)
connect.softellio.com CNAME [Vercel CNAME]

# Wildcard for tenant subdomains
*.softellio.com       CNAME connect.softellio.com
```

### 4. Dynamic Domain Addition Workflow

When a customer adds a custom domain:

#### In Vercel Dashboard (Manual Process)
1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter customer domain: `customerdomain.com`
4. Vercel will provide DNS configuration instructions
5. Customer configures DNS at their registrar
6. Vercel automatically provisions SSL certificate

#### Automated Alternative (Vercel API)
```javascript
// Optional: Automate domain addition via Vercel API
const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${vercelToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'customerdomain.com' })
});
```

## Customer DNS Configuration Guide

### Option A: Standard Setup (Recommended)

#### For Domain Root (example.com)
```dns
Type: A
Host: @
Value: 76.76.19.61  # Vercel's IP (check current IP in Vercel docs)
TTL: 300
```

#### For WWW Subdomain
```dns
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 300
```

### Option B: CNAME Setup (Alternative)
```dns
# Root domain CNAME (if registrar supports)
Type: CNAME
Host: @
Value: cname.vercel-dns.com
TTL: 300

# WWW subdomain
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 300
```

### Option C: Cloudflare Proxy (Recommended for Turkey/ISP Issues)

#### Benefits:
- Improved routing for Turkish users
- WAF protection
- Better performance
- SSL/TLS management

#### Setup:
1. **Add domain to Cloudflare**
2. **Update nameservers** at registrar to Cloudflare
3. **Configure DNS records**:
   ```dns
   Type: CNAME
   Host: @
   Value: cname.vercel-dns.com
   Proxy Status: Proxied (orange cloud)

   Type: CNAME
   Host: www
   Value: cname.vercel-dns.com
   Proxy Status: Proxied (orange cloud)
   ```
4. **Enable security features** in Cloudflare dashboard

## End-to-End Verification Workflow

### 1. Customer Adds Domain

#### Via Softellio Admin Panel:
```http
POST /domains
Authorization: Bearer [tenant-token]
Content-Type: application/json

{
  "domain": "customer-example.com",
  "type": "CUSTOM",
  "isPrimary": false
}
```

#### Response:
```json
{
  "id": 123,
  "domain": "customer-example.com",
  "type": "CUSTOM",
  "isPrimary": false,
  "isActive": true,
  "isVerified": false,
  "sslStatus": "PENDING",
  "verifiedAt": null,
  "dnsInstructions": {
    "type": "TXT",
    "host": "@",
    "value": "softellio-verify=abc123def456",
    "instructions": "Add this TXT record to your DNS settings..."
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 2. Customer Configures DNS

#### Customer adds TXT record at their registrar:
```dns
Type: TXT
Host: @
Value: softellio-verify=abc123def456
TTL: 300
```

#### Customer also configures domain pointing (Option A):
```dns
Type: A
Host: @
Value: 76.76.19.61  # Vercel IP

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

### 3. Domain Verification

#### Customer clicks "Verify" in Softellio admin:
```http
POST /domains/verify/123
Authorization: Bearer [tenant-token]
```

#### System performs DNS lookup:
```javascript
// Backend checks TXT record
const txtRecords = await dns.resolveTxt('customer-example.com');
// Looks for: softellio-verify=abc123def456
```

#### Verification Success Response:
```json
{
  "status": "verified",
  "message": "Domain successfully verified!",
  "checkedRecords": ["TXT @ softellio-verify=abc123def456"],
  "verifiedAt": "2024-01-15T10:35:00Z"
}
```

### 4. Domain Activation

#### Customer sets domain as primary:
```http
PATCH /domains/123
Authorization: Bearer [tenant-token]
Content-Type: application/json

{
  "isPrimary": true
}
```

#### Domain becomes active for tenant resolution.

### 5. Vercel SSL Certificate

#### Automatic Process:
1. **Vercel detects domain** pointing to their servers
2. **Requests Let's Encrypt certificate** for customer-example.com
3. **Provisions SSL** automatically
4. **Domain becomes accessible** via HTTPS

## Troubleshooting Guide

### Common Issues

#### 1. DNS Verification Fails
**Symptoms**: `POST /domains/verify/:id` returns status "pending"

**Troubleshooting**:
```bash
# Check TXT record manually
dig TXT customer-example.com

# Check if record propagated globally
nslookup -type=TXT customer-example.com 8.8.8.8
```

**Solutions**:
- Wait for DNS propagation (up to 48 hours)
- Verify TXT record was added correctly
- Check with different DNS servers

#### 2. Domain Not Resolving to Tenant
**Symptoms**: Domain loads but shows wrong tenant or 404

**Troubleshooting**:
```http
GET /tenants/by-domain?host=customer-example.com
```

**Check resolution priority**:
1. Verified custom domains in TenantDomain table
2. System domains in TenantDomain table
3. Slug-based resolution for *.softellio.com
4. Legacy main domain field

#### 3. SSL Certificate Issues
**Symptoms**: HTTPS not working, SSL warnings

**Solutions**:
- Verify domain DNS points to Vercel
- Check Vercel dashboard for SSL status
- Wait for certificate provisioning (can take 24-48 hours)
- Consider Cloudflare proxy for faster SSL

#### 4. Turkish ISP Issues
**Symptoms**: Site loads slowly or not at all from Turkey

**Solutions**:
- Recommend Cloudflare proxy setup
- Use Turkey-specific CDN if available
- Monitor performance from different regions

## Monitoring and Alerts

### Key Metrics to Monitor
- DNS verification success rate
- Domain resolution latency
- SSL certificate provisioning success
- Customer support tickets related to domains

### Recommended Alerts
```javascript
// Example monitoring checks
- DNS verification failures > 10%
- Domain resolution errors > 5%
- SSL certificate failures
- High latency from specific regions
```

## Support Documentation for Customers

### DNS Configuration Instructions Template

```markdown
## How to Connect Your Custom Domain

### Step 1: Add Domain in Softellio
1. Go to Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain (e.g., yourcompany.com)
4. Copy the verification TXT record

### Step 2: Configure DNS at Your Registrar
Add these records to your DNS settings:

**TXT Record** (for verification):
- Type: TXT
- Host: @
- Value: [provided verification code]

**A Record** (for domain pointing):
- Type: A
- Host: @
- Value: 76.76.19.61

**CNAME Record** (for www):
- Type: CNAME
- Host: www
- Value: cname.vercel-dns.com

### Step 3: Verify Domain
1. Wait 5-15 minutes for DNS propagation
2. Click "Verify Domain" in Softellio
3. Once verified, set as primary domain

### Step 4: SSL Certificate
SSL certificate will be automatically provisioned within 24-48 hours.

Need help? Contact support at support@softellio.com
```

## API Reference Summary

### Domain Management Endpoints

```http
# Add custom domain
POST /domains
{
  "domain": "example.com",
  "type": "CUSTOM",
  "isPrimary": false
}

# Get all domains
GET /domains

# Get specific domain
GET /domains/:id

# Update domain settings
PATCH /domains/:id
{
  "isPrimary": true,
  "isActive": true
}

# Verify domain ownership
POST /domains/verify/:id

# Delete domain
DELETE /domains/:id

# Resolve tenant by domain (public)
GET /tenants/by-domain?host=example.com
```

All endpoints require proper authentication and tenant context except `/tenants/by-domain` which is public.