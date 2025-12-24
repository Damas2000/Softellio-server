# Minimal Vercel Staging Deployment Checklist

## Pre-Deployment Setup

### 1. Domain Configuration
```bash
# Required domains for staging:
# - staging.softellio.com (primary staging domain)
# - *.staging.softellio.com (wildcard for tenant subdomains)
# - Any test custom domains (optional)
```

### 2. Environment Variables (Required)
```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
NEXT_PUBLIC_API_INTERNAL_URL=https://your-railway-backend.up.railway.app

# Tenant Resolution
NEXT_PUBLIC_PLATFORM_DOMAIN=staging.softellio.com
NEXT_PUBLIC_DEFAULT_TENANT=demo

# Optional: Turkey-specific optimizations
NEXT_PUBLIC_ENABLE_TURKEY_RECOMMENDATIONS=true
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_token_here
```

## Vercel Configuration Steps

### Step 1: Connect Repository
```bash
# 1. Connect your Next.js frontend repo to Vercel
# 2. Select appropriate branch for staging (usually 'staging' or 'develop')
# 3. Configure build settings:
#    Framework Preset: Next.js
#    Build Command: npm run build (default)
#    Output Directory: .next (default)
```

### Step 2: Add Domains
```bash
# In Vercel Dashboard → Project → Settings → Domains:
# 1. Add: staging.softellio.com
# 2. Add: *.staging.softellio.com (wildcard)
# 3. Configure DNS A record: staging.softellio.com → 76.76.19.61 (Vercel)
# 4. Configure DNS CNAME: *.staging.softellio.com → cname.vercel-dns.com
```

### Step 3: Environment Variables
```bash
# In Vercel Dashboard → Project → Settings → Environment Variables:
# Add all variables from section 2 above
# Set environment to "Preview" and "Development" for staging
```

## Next.js Middleware Configuration

### Required: `middleware.ts`
```typescript
// middleware.ts (place in project root)
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const url = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract tenant from subdomain
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'staging.softellio.com';
  let tenant = 'demo'; // fallback

  if (host) {
    if (host.endsWith(`.${platformDomain}`)) {
      // Subdomain: tenant1.staging.softellio.com
      tenant = host.replace(`.${platformDomain}`, '');
    } else if (host !== platformDomain) {
      // Custom domain: resolve via backend
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/by-domain?host=${host}`, {
          headers: { 'User-Agent': 'Vercel-Middleware' }
        });

        if (response.ok) {
          const data = await response.json();
          tenant = data.tenant?.slug || 'demo';
        }
      } catch (error) {
        console.error('Tenant resolution failed:', error);
        // Fallback to demo tenant
      }
    }
  }

  // Add tenant context to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-host', host || platformDomain);
  requestHeaders.set('x-tenant-slug', tenant);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Testing Checklist

### Basic Functionality Tests
```bash
# 1. Platform Domain
curl -H "Host: staging.softellio.com" https://staging.softellio.com/
# Expected: Default tenant homepage

# 2. Subdomain Resolution
curl -H "Host: demo.staging.softellio.com" https://demo.staging.softellio.com/
# Expected: Demo tenant homepage

# 3. Backend Health Check
curl https://your-railway-backend.up.railway.app/health
# Expected: {"status": "ok"}

# 4. Tenant Resolution API
curl https://your-railway-backend.up.railway.app/tenants/by-domain?host=demo.staging.softellio.com
# Expected: {"tenant": {"id": 1, "slug": "demo", ...}}
```

### Turkey Access Tests
```bash
# 5. Turkey CDN Test (use VPN or ask Turkish user)
curl -H "Host: staging.softellio.com" https://staging.softellio.com/api/health
# Expected: Response time < 2s

# 6. DNS Resolution Test (Turkey)
nslookup staging.softellio.com 1.1.1.1  # Cloudflare DNS
nslookup staging.softellio.com 8.8.8.8  # Google DNS
# Expected: Both should resolve to Vercel IP

# 7. SSL Certificate Check
curl -I https://staging.softellio.com/
# Expected: HTTPS with valid certificate
```

### Custom Domain Tests (Optional)
```bash
# 8. If testing custom domains, add test domain to backend:
curl -X POST https://your-railway-backend.up.railway.app/domains \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Tenant-Host: demo.staging.softellio.com" \
  -H "Content-Type: application/json" \
  -d '{"domain": "testdomain.com", "type": "CUSTOM"}'

# 9. Test custom domain resolution:
curl -H "Host: testdomain.com" https://testdomain.com/
# Expected: Tenant homepage (after DNS/verification setup)
```

## Deployment Commands

### One-Click Deploy
```bash
# Option 1: Git-based deployment (recommended)
git push origin staging  # Triggers automatic Vercel deployment

# Option 2: Manual deployment via Vercel CLI
npx vercel --prod  # Deploy to production environment
npx vercel         # Deploy to preview environment
```

### Post-Deployment Verification
```bash
# Check deployment status
npx vercel ls

# View deployment logs
npx vercel logs [deployment-url]

# Test all endpoints listed in Testing Checklist above
```

## Turkey-Specific Optimizations

### DNS Recommendations UI
```typescript
// components/turkey-dns-banner.tsx
export function TurkeyDNSBanner({ userLocation }) {
  if (userLocation !== 'TR') return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-orange-600">🇹🇷</span>
        <h4 className="font-semibold text-orange-800">
          Türkiye'den erişim için öneriler
        </h4>
      </div>
      <p className="text-sm text-orange-700 mt-1">
        Daha hızlı yükleme için Cloudflare kullanmanızı öneririz.
      </p>
      <button className="mt-2 text-sm bg-orange-600 text-white px-3 py-1 rounded">
        Cloudflare Kurulumu
      </button>
    </div>
  );
}
```

## Troubleshooting

### Common Issues
```bash
# Issue: "Module not found" errors
# Solution: Check import paths and ensure all dependencies are installed

# Issue: Environment variables not working
# Solution: Redeploy after setting variables (Vercel requires redeployment)

# Issue: Wildcard domain not working
# Solution: Ensure DNS CNAME *.staging.softellio.com → cname.vercel-dns.com

# Issue: Turkey users reporting slow speeds
# Solution: Verify Cloudflare recommendations are displayed correctly
```

### Debug Commands
```bash
# Check DNS propagation
dig staging.softellio.com
dig demo.staging.softellio.com

# Test from different regions
curl -H "CF-IPCountry: TR" https://staging.softellio.com/  # Simulate Turkey access
curl -H "CF-IPCountry: US" https://staging.softellio.com/  # Simulate US access
```

---

**Total Deployment Time: ~15-20 minutes**
**Pre-requisites: Railway backend already deployed with public URL**