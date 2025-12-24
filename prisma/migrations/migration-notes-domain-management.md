# Domain Management Migration Notes

## Summary
This migration updates the TenantDomain model to support professional custom domain management with DNS verification.

## Schema Changes

### Added Enums
```sql
-- Create enum for domain types
CREATE TYPE "DomainType" AS ENUM ('SYSTEM', 'CUSTOM');

-- Create enum for SSL status
CREATE TYPE "DomainSSLStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR');
```

### Updated tenant_domains Table
```sql
-- Update type column to use enum (migrate existing data first)
-- Note: Existing 'custom' -> 'CUSTOM', 'subdomain' -> 'SYSTEM'
UPDATE tenant_domains SET type = 'CUSTOM' WHERE type = 'custom';
UPDATE tenant_domains SET type = 'SYSTEM' WHERE type = 'subdomain';

-- Update sslStatus column to use enum (migrate existing data first)
UPDATE tenant_domains SET "sslStatus" = 'PENDING' WHERE "sslStatus" = 'pending';
UPDATE tenant_domains SET "sslStatus" = 'ACTIVE' WHERE "sslStatus" = 'active';
UPDATE tenant_domains SET "sslStatus" = 'ERROR' WHERE "sslStatus" = 'error';

-- Remove status column (deprecated in favor of isActive)
ALTER TABLE tenant_domains DROP COLUMN status;

-- Remove metadata, lastCheckedAt, responseTime columns (not needed for new implementation)
ALTER TABLE tenant_domains DROP COLUMN metadata;
ALTER TABLE tenant_domains DROP COLUMN "lastCheckedAt";
ALTER TABLE tenant_domains DROP COLUMN "responseTime";

-- Change type column to use enum
ALTER TABLE tenant_domains ALTER COLUMN type TYPE "DomainType" USING type::"DomainType";

-- Change sslStatus column to use enum
ALTER TABLE tenant_domains ALTER COLUMN "sslStatus" TYPE "DomainSSLStatus" USING "sslStatus"::"DomainSSLStatus";

-- Add new index for verification status
CREATE INDEX "tenant_domains_tenantId_isVerified_idx" ON "tenant_domains"("tenantId", "isVerified");
```

## Data Migration Steps (IMPORTANT)

### Before Running Migration:
1. **Backup the database** - especially the `tenant_domains` table
2. **Update existing data** to match new enum values:
   ```sql
   -- Check current values
   SELECT DISTINCT type FROM tenant_domains;
   SELECT DISTINCT "sslStatus" FROM tenant_domains;

   -- Update to new enum values
   UPDATE tenant_domains SET type = 'CUSTOM' WHERE type = 'custom';
   UPDATE tenant_domains SET type = 'SYSTEM' WHERE type = 'subdomain' OR type = 'system';

   UPDATE tenant_domains SET "sslStatus" = 'PENDING' WHERE "sslStatus" = 'pending' OR "sslStatus" IS NULL;
   UPDATE tenant_domains SET "sslStatus" = 'ACTIVE' WHERE "sslStatus" = 'active';
   UPDATE tenant_domains SET "sslStatus" = 'ERROR' WHERE "sslStatus" = 'error';
   ```

### Safe Migration Command:
```bash
# For development (after data updates)
npx prisma db push

# For production
npx prisma migrate deploy
```

## Post-Migration Steps

1. **Verify data integrity**:
   ```sql
   SELECT COUNT(*) FROM tenant_domains WHERE type IS NULL;
   SELECT COUNT(*) FROM tenant_domains WHERE "sslStatus" IS NULL;
   ```

2. **Create system domains for existing tenants**:
   ```sql
   INSERT INTO tenant_domains (
     "tenantId",
     domain,
     type,
     "isPrimary",
     "isActive",
     "isVerified",
     "verifiedAt",
     "sslStatus",
     "createdAt",
     "updatedAt"
   )
   SELECT
     t.id,
     t.domain,
     'SYSTEM'::"DomainType",
     true,
     true,
     true,
     NOW(),
     'PENDING'::"DomainSSLStatus",
     NOW(),
     NOW()
   FROM tenants t
   WHERE t.domain IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM tenant_domains td
     WHERE td."tenantId" = t.id AND td.domain = t.domain
   );
   ```

## Rollback Plan

If migration fails, rollback steps:

```sql
-- 1. Drop new enums
DROP TYPE IF EXISTS "DomainType";
DROP TYPE IF EXISTS "DomainSSLStatus";

-- 2. Restore original columns (from backup)
-- 3. Restore original data structure
```

## Testing After Migration

1. **Test domain resolution**:
   - Custom domains resolve correctly
   - System domains resolve correctly
   - Fallback to slug-based resolution works

2. **Test new domain endpoints**:
   - POST /domains (add custom domain)
   - POST /domains/verify/:id (DNS verification)
   - PATCH /domains/:id (update domain)
   - DELETE /domains/:id (soft delete)

3. **Test tenant resolution**:
   - GET /tenants/by-domain?host=custom-domain.com
   - GET /tenants/by-domain?host=tenant.softellio.com

## Environment Variables

Ensure these are set for DNS verification:
```env
# No additional env vars needed - uses Node.js built-in dns module
```

## Production Checklist

- [ ] Database backup completed
- [ ] Data migration queries tested on staging
- [ ] New DomainsModule registered in app.module.ts
- [ ] DNS verification works in production environment
- [ ] Custom domain SSL certificate process documented
- [ ] Monitoring alerts configured for domain verification failures