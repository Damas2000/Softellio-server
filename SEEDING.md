# Database Seeding

This document describes how to seed the database with initial data for development and testing.

## Overview

The seeding system creates:
- Super admin user for system administration
- Demo tenant with sample content
- Tenant admin user for the demo tenant
- Sample content (pages, blog posts, categories, menus, site settings)

## Quick Start

### 1. Seed the Database

```bash
# Run seeding (adds data to existing database)
npm run seed

# Clear database and then seed
npm run seed:clear
```

### 2. Default Credentials

After seeding, you can use these credentials to log in:

#### Super Admin
- Email: `admin@softellio.com`
- Password: `SuperAdmin123!`
- Domain: Any domain (super admin has global access)

#### Tenant Admin (Demo Tenant)
- Email: `admin@demo.softellio.com`
- Password: `TenantAdmin123!`
- Domain: `demo.softellio.com`

### 3. Demo Tenant

The seeding creates a demo tenant with:
- **Domain**: `demo.softellio.com`
- **Languages**: Turkish (default), English
- **Content**: Sample pages, blog posts, and navigation menu

## Testing Multi-Tenancy

To test multi-tenant functionality:

1. **Set tenant context** in your requests:
   ```
   X-Tenant-Domain: demo.softellio.com
   ```

2. **Or use domain-based routing** (requires DNS setup):
   ```
   http://demo.softellio.com:3000/api/pages/public
   ```

## Sample Content Created

### Site Settings
- Site name and descriptions in Turkish and English
- SEO meta tags for each language

### Pages
- Home page (`/`)
- About page (`/hakkimizda`)

### Blog
- Technology category with sample posts
- Business category

### Menu
- Main navigation with multi-language labels

## Development Tips

### Adding More Demo Data

Edit `src/seeding/seeding.service.ts` to add more demo content:

```typescript
// Add more demo pages
const pages = [
  {
    slug: 'services',
    // ... page data
  },
  // Add more pages
];
```

### Custom Seeding

Create your own seeding functions:

```typescript
private async createCustomContent(tenantId: number) {
  // Your custom seeding logic
}
```

### Environment-Specific Seeding

You can modify the seeding based on environment:

```typescript
if (process.env.NODE_ENV === 'production') {
  // Production-specific seeding
} else {
  // Development seeding
}
```

## Auth Repair

If login credentials stop working after API testing or database changes, use the auth repair tool to fix authentication issues.

### When to Use Auth Repair

Use `npm run seed:auth-repair` when:
- Login returns "invalid username/password" for known credentials
- Users become inactive in the database
- Password hashes get corrupted
- Role assignments get changed
- Tenant associations get broken

### Auth Repair Command

```bash
# Fix authentication for super admin and tenant admin
npm run seed:auth-repair
```

### What Auth Repair Does

The auth repair tool safely:
1. **Ensures demo tenant exists** with domain `demo.softellio.com`
2. **Repairs Super Admin user**:
   - Email: `admin@softellio.com`
   - Password: `SuperAdmin123!`
   - Role: `SUPER_ADMIN`
   - Status: `isActive = true`
   - Tenant: `null` (system-wide access)
3. **Repairs Tenant Admin user**:
   - Email: `admin@demo.softellio.com`
   - Password: `TenantAdmin123!`
   - Role: `TENANT_ADMIN`
   - TenantId: Links to demo tenant
   - Status: `isActive = true`

### Safety Features

- **Idempotent**: Safe to run multiple times
- **Production-safe**: Only fixes auth users, doesn't touch other data
- **Password consistency**: Uses the same hashing method as AuthService (12 salt rounds)
- **Preserves data**: Only updates what needs fixing

### Sample Output

```
🔧 Starting Auth Repair Tool...

🏢 Checking demo tenant...
   ✅ Demo tenant (demo.softellio.com) is ready

👤 Checking Super Admin...
   🔄 Updating Super Admin...
   ✅ Super Admin updated (password, role, status fixed)

👨‍💼 Checking Tenant Admin...
   ✅ Tenant Admin already valid

📋 REPAIR SUMMARY
─────────────────
   Demo Tenant: ✅ already_exists
   Super Admin: 🔄 updated
   Tenant Admin: ✅ already_valid

🔑 VERIFIED CREDENTIALS
─────────────────────────
   Super Admin:
     Email: admin@softellio.com
     Password: SuperAdmin123!
     Role: SUPER_ADMIN
     Tenant: None (system-wide access)

   Tenant Admin:
     Email: admin@demo.softellio.com
     Password: TenantAdmin123!
     Role: TENANT_ADMIN
     Tenant: demo.softellio.com

✨ Auth repair completed successfully!
🚀 You can now test login with the credentials above.
```

## Seeding Commands

| Command | Description |
|---------|-------------|
| `npm run seed` | Add demo data to existing database |
| `npm run seed:clear` | Clear all data and reseed |
| `npm run seed:auth-repair` | Repair authentication credentials |
| `npx ts-node src/seeding/seed.ts` | Direct seeding execution |
| `npx ts-node src/seeding/auth-repair.ts` | Direct auth repair execution |

## Database Schema Requirements

Ensure your database schema is up to date before seeding:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Then seed
npm run seed
```

## Troubleshooting

### "Table doesn't exist" errors
Make sure to run migrations first:
```bash
npm run prisma:migrate
npm run seed
```

### "Unique constraint violation"
The seeding is idempotent and checks for existing data. If you see constraint violations, try:
```bash
npm run seed:clear
```

### Permission errors
Ensure your database user has CREATE, INSERT, UPDATE, DELETE permissions.

### Connection errors
Verify your `.env` file has correct database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
```