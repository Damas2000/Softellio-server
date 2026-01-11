# Softellio Backend - Developer Setup Guide

Welcome to Softellio Backend! This guide will walk you through setting up your development environment and getting the project running locally.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### **Required Software**
- **Node.js** `>=20.0.0` - [Download here](https://nodejs.org/)
- **npm** `>=10.0.0` (comes with Node.js)
- **PostgreSQL** `>=13.0` - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)

### **Required Accounts**
- **Cloudinary Account** - [Sign up here](https://cloudinary.com/users/register_free)
  - You'll need the Cloud Name, API Key, and API Secret

### **Recommended Tools**
- **Visual Studio Code** with TypeScript and Prisma extensions
- **PostgreSQL GUI** (pgAdmin, DBeaver, or TablePlus)
- **REST Client** (Postman or Insomnia) for API testing

### **Version Verification**
```bash
# Check your versions
node --version    # Should be >=20.0.0
npm --version     # Should be >=10.0.0
psql --version    # Should be >=13.0
```

---

## 🚀 Initial Setup

### **1. Clone the Repository**
```bash
# Clone the repository
git clone <repository-url>
cd Softellio-Backend

# Check current branch (should be main)
git branch
```

### **2. Install Dependencies**
```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### **3. Environment Configuration**
```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your preferred editor
code .env  # or nano .env
```

**Configure the following required variables in `.env`:**

```env
# Server configuration
NODE_ENV=development
PORT=3000

# Database (Replace with your PostgreSQL connection)
DATABASE_URL=postgresql://username:password@localhost:5432/softellio_dev?schema=public

# JWT configuration (Generate secure secrets)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=7d

# Cookie configuration (for local development, leave empty)
COOKIE_DOMAIN=

# Cloudinary credentials (from your Cloudinary account)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Default seeding data (customize as needed)
DEFAULT_TENANT_NAME=Demo Tenant
DEFAULT_TENANT_DOMAIN=demo.localhost.com
DEFAULT_TENANT_DEFAULT_LANGUAGE=tr
DEFAULT_TENANT_ADMIN_EMAIL=admin@demo.com
DEFAULT_TENANT_ADMIN_PASSWORD=ChangeMe123!
DEFAULT_SUPER_ADMIN_EMAIL=superadmin@cms.com
DEFAULT_SUPER_ADMIN_PASSWORD=SuperSecret123!
```

**🔒 Security Notes:**
- Generate strong, unique secrets for JWT_SECRET (use: `openssl rand -base64 32`)
- Never commit the `.env` file to version control
- Change default passwords in production environments

---

## 🗄️ Database Setup

### **1. Create PostgreSQL Database**
```bash
# Connect to PostgreSQL (replace 'username' with your PostgreSQL user)
psql -U username

# Create database for development
CREATE DATABASE softellio_dev;

# Create database for testing (optional)
CREATE DATABASE softellio_test;

# Exit psql
\q
```

### **2. Configure Database Connection**
Update the `DATABASE_URL` in your `.env` file:
```env
# Example for local PostgreSQL
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/softellio_dev?schema=public
```

### **3. Generate Prisma Client**
```bash
# Generate Prisma client based on schema
npm run prisma:generate
```

### **4. Run Database Migrations**
```bash
# Apply database schema (creates all tables)
npm run prisma:deploy

# Alternatively, for development with migration history
npm run prisma:migrate
```

### **5. Seed Initial Data**
```bash
# Seed the database with default data
npm run seed

# Verify seeding was successful
npm run prisma:studio  # Opens Prisma Studio to view data
```

**After seeding, you'll have:**
- Super Admin: `superadmin@cms.com` / `SuperSecret123!`
- Demo Tenant: `demo.localhost.com`
- Tenant Admin: `admin@demo.com` / `ChangeMe123!`

---

## 🏃‍♂️ Development Workflow

### **1. Start the Development Server**
```bash
# Start with hot reload
npm run start:dev

# The server will be available at:
# - API: http://localhost:3000
# - Swagger Docs: http://localhost:3000/api-docs
```

### **2. Verify Installation**
Open your browser and test these endpoints:
- **Health Check**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/api-docs`
- **Login Test**: POST to `http://localhost:3000/auth/login`

### **3. Test Authentication**
Use the following test credentials:

**Super Admin Login:**
```json
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "superadmin@cms.com",
  "password": "SuperSecret123!"
}
```

**Tenant Admin Login:**
```json
POST http://localhost:3000/auth/login
Content-Type: application/json
X-Tenant-Host: demo.localhost.com

{
  "email": "admin@demo.com",
  "password": "ChangeMe123!"
}
```

### **4. Available Scripts**
```bash
# Development
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debugger

# Building
npm run build          # Compile TypeScript
npm run start:prod     # Start production build

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations (dev)
npm run prisma:deploy   # Deploy migrations (prod)
npm run prisma:studio   # Open Prisma Studio GUI
npm run seed           # Seed database
npm run seed:clear     # Clear and reseed

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run with coverage
npm run test:e2e       # Run end-to-end tests

# Code Quality
npm run lint           # Lint and fix code
npm run format         # Format code with Prettier
```

---

## 📁 Project Structure Walkthrough

```
src/
├── activity/                 # User activity tracking
├── admin/                   # Super admin operations
├── auth/                    # JWT authentication & authorization
├── backup/                  # Backup & restore functionality
├── banners-sliders/         # Banner & slider management
├── billing/                 # Subscription & billing system
├── blog/                    # Blog posts & categories
├── cms/                     # Content management system
├── common/                  # Shared utilities & decorators
│   ├── decorators/          # Custom decorators (@CurrentTenant, @Roles)
│   ├── guards/              # Authentication & authorization guards
│   ├── middleware/          # Tenant resolution middleware
│   ├── pipes/               # Validation pipes
│   └── utils/               # Shared utilities
├── config/                  # Application configuration
├── contact-info/            # Contact information management
├── dashboard-analytics/     # Analytics & dashboard widgets
├── domains/                 # Domain management & verification
├── frontend/                # Frontend aggregator & page builder
├── media/                   # File upload & Cloudinary integration
├── menu/                    # Navigation menu management
├── monitoring/              # System monitoring & alerts
├── pages/                   # Page management with multi-language
├── references/              # References/testimonials
├── seeding/                 # Database seeding scripts
├── seo/                     # SEO settings & optimization
├── services/                # Services catalog management
├── site-settings/           # Site-wide configuration
├── social-media-maps/       # Social media integration
├── system-settings/         # System configuration
├── team-members/            # Team member profiles
├── templates/               # Template system for page builder
├── tenants/                 # Tenant management & isolation
├── users/                   # User management
├── app.module.ts            # Main application module
└── main.ts                  # Application entry point

prisma/
├── schema.prisma            # Database schema definition
└── migrations/              # Database migration history
```

### **Key Directories Explained:**

**`src/common/`** - Contains reusable components across the application:
- **Guards**: Authentication, roles, and tenant isolation
- **Decorators**: Custom parameter decorators for extracting user/tenant info
- **Middleware**: Tenant resolution from domain/headers
- **Pipes**: Request validation and transformation

**`src/auth/`** - Complete authentication system:
- JWT token generation and validation
- Password hashing with bcrypt
- Role-based access control (Super Admin, Tenant Admin, Editor)

**`src/tenants/`** - Multi-tenant functionality:
- Tenant CRUD operations
- Domain management and routing
- Feature flags per tenant

**`src/frontend/`** - Page builder and frontend aggregation:
- Section types (hero, features, testimonials, etc.)
- Page layout management
- Unified data endpoint for frontend applications

---

## 🛠️ Common Development Tasks

### **Adding a New Feature Module**

1. **Generate module using NestJS CLI:**
```bash
npx nest generate module feature-name
npx nest generate controller feature-name
npx nest generate service feature-name
```

2. **Follow the existing patterns:**
- Add tenant isolation in service methods
- Use DTOs for validation
- Implement proper error handling
- Add Swagger documentation

3. **Database changes:**
```bash
# After modifying prisma/schema.prisma
npm run prisma:generate
npm run prisma:migrate
```

### **Working with Multi-Language Content**

Most content models follow the Translation pattern:
```typescript
// Base model
model Page {
  id           String            @id @default(cuid())
  tenantId     String
  translations PageTranslation[]
  // ... other fields
}

// Translation model
model PageTranslation {
  id         String @id @default(cuid())
  pageId     String
  language   String
  title      String
  content    String
  page       Page   @relation(fields: [pageId], references: [id])
  // ... other fields
}
```

### **Working with Tenants**

All requests automatically include tenant context via `TenantMiddleware`:

```typescript
@Controller('example')
export class ExampleController {
  @Get()
  findAll(@CurrentTenant() tenant: { id: string }) {
    // Automatically filtered by tenant
    return this.service.findAll(tenant.id);
  }
}
```

### **Adding API Endpoints**

1. **Add DTOs with validation:**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExampleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

2. **Use guards and decorators:**
```typescript
@Controller('example')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class ExampleController {
  @Post()
  @Roles('TENANT_ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create example' })
  create(@Body() dto: CreateExampleDto) {
    // Implementation
  }
}
```

### **File Upload with Cloudinary**

Use the existing media upload patterns:
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async upload(@UploadedFile() file: Express.Multer.File) {
  return this.mediaService.uploadToCloudinary(file);
}
```

---

## 🧪 Testing

### **Running Tests**
```bash
# Unit tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### **Test Structure**
```
test/
├── app.e2e-spec.ts         # End-to-end application tests
├── auth.e2e-spec.ts        # Authentication flow tests
└── jest-e2e.json           # E2E test configuration

src/
└── **/*.spec.ts            # Unit tests co-located with source
```

### **Writing Tests**

Follow the existing test patterns:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExampleService } from './example.service';

describe('ExampleService', () => {
  let service: ExampleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExampleService],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## 🔧 Troubleshooting

### **Common Issues and Solutions**

**❌ Database Connection Error**
```
Error: P1001: Can't reach database server
```
**Solution:** Check PostgreSQL is running and credentials are correct:
```bash
# Check PostgreSQL status (macOS)
brew services list | grep postgresql

# Start PostgreSQL (macOS)
brew services start postgresql

# Test connection
psql -U username -h localhost -p 5432 -d softellio_dev
```

**❌ Prisma Generate Error**
```
Error: Schema parsing error
```
**Solution:** Validate your `schema.prisma` syntax:
```bash
npx prisma validate
npx prisma format
npm run prisma:generate
```

**❌ Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Kill the process or change port:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

**❌ JWT Authentication Issues**
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration (default: 7 days)
- Ensure cookies are enabled in your client

**❌ Tenant Resolution Issues**
- For local development, use `X-Tenant-Host` header
- Verify tenant exists in database
- Check domain mapping in `TenantDomain` table

**❌ Cloudinary Upload Fails**
- Verify Cloudinary credentials in `.env`
- Check file size limits (default: 10MB)
- Ensure internet connectivity

**❌ Seeding Fails**
```bash
# Clear database and reseed
npm run seed:clear
npm run seed

# Check for duplicate data constraints
npm run prisma:studio
```

### **Development Tools**

**Database Inspection:**
```bash
# Open Prisma Studio for GUI database browsing
npm run prisma:studio

# Access via psql
psql postgresql://username:password@localhost:5432/softellio_dev
```

**API Testing:**
- Swagger UI: `http://localhost:3000/api-docs`
- Import Swagger JSON into Postman/Insomnia
- Use `X-Tenant-Host` header for tenant-specific endpoints

**Log Debugging:**
The application includes comprehensive logging. Check console output for:
- Tenant resolution logs
- Authentication flows
- Database queries (in development)
- Error stack traces

---

## 📚 Next Steps

### **Learning the Codebase**

1. **Start with Authentication Flow**
   - Review `src/auth/` module
   - Understand guard system in `src/common/guards/`
   - Test login endpoints with different roles

2. **Explore Multi-Tenancy**
   - Study `src/tenants/` and `src/common/middleware/tenant.middleware.ts`
   - Understand how tenant context flows through requests
   - Practice creating tenant-specific data

3. **Page Builder System**
   - Examine `src/frontend/` and `src/templates/`
   - Understand section types and page layouts
   - Test the page builder APIs

4. **Content Management**
   - Review `src/pages/`, `src/blog/`, `src/media/`
   - Understand the translation pattern
   - Practice CRUD operations with multi-language support

### **Recommended Reading**

**Framework Documentation:**
- [NestJS Official Docs](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Cloudinary API Reference](https://cloudinary.com/documentation/node_integration)

**Architecture Patterns:**
- [Multi-Tenant Architecture Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)

### **Development Workflow**

1. **Before making changes:**
   - Create a feature branch: `git checkout -b feature/your-feature`
   - Review existing patterns in similar modules
   - Check if Prisma schema changes are needed

2. **During development:**
   - Use TypeScript strict mode (already configured)
   - Follow existing naming conventions
   - Add appropriate error handling
   - Include Swagger documentation for new endpoints

3. **Before committing:**
   - Run tests: `npm run test`
   - Check linting: `npm run lint`
   - Verify functionality in Swagger UI
   - Test tenant isolation if applicable

### **Getting Help**

**Code Navigation:**
- Use VS Code's "Go to Definition" (F12) extensively
- Search for implementation examples in existing modules
- Use global search to find similar patterns

**Testing Changes:**
- Use Prisma Studio to verify database changes
- Test APIs via Swagger UI with different tenant contexts
- Check logs in terminal for detailed debugging info

---

## 🎯 Summary

You now have a fully functional Softellio Backend development environment! The key things to remember:

✅ **Multi-tenant architecture** - Always consider tenant isolation
✅ **Authentication flows** - Understand the guard system
✅ **Database patterns** - Follow the translation model for multi-language
✅ **API development** - Use DTOs, guards, and Swagger documentation
✅ **Testing practices** - Write tests and use the available tools

**Happy coding! 🚀**

For any questions or issues not covered here, review the existing codebase patterns or consult the official documentation for the technologies used.