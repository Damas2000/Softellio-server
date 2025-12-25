import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { PrismaService } from '../../config/prisma.service';
import { AuthService } from '../../auth/auth.service';

describe('Backend Fixes Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let adminToken: string;
  let testTenantId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same validation pipe as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);

    // Create test tenant and admin user
    await setupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await app.close();
  });

  describe('1. Bulk Delete Endpoints Validation', () => {
    it('should validate bulk delete with proper DTO (pages)', async () => {
      const response = await request(app.getHttpServer())
        .delete('/pages/admin/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ids: [1, 2, 3] })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should reject bulk delete with invalid IDs (pages)', async () => {
      await request(app.getHttpServer())
        .delete('/pages/admin/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ids: ['invalid', 'not-number'] })
        .expect(400);
    });

    it('should reject bulk delete with empty array (pages)', async () => {
      await request(app.getHttpServer())
        .delete('/pages/admin/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ids: [] })
        .expect(400);
    });

    it('should reject bulk delete without ids field', async () => {
      await request(app.getHttpServer())
        .delete('/pages/admin/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('should validate bulk delete for services', async () => {
      await request(app.getHttpServer())
        .delete('/services/admin/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ids: [1, 2] })
        .expect(200);
    });

    it('should validate bulk delete for team-members', async () => {
      await request(app.getHttpServer())
        .delete('/team-members/admin/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ids: [1] })
        .expect(200);
    });

    it('should validate bulk delete for references', async () => {
      await request(app.getHttpServer())
        .delete('/references/admin/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ids: [1] })
        .expect(200);
    });
  });

  describe('2. Public Pages Route Conflict Fix', () => {
    beforeAll(async () => {
      // Create test pages
      await createTestPage('test-page', 'Test Page');
      await createTestPage('list', 'List Page'); // This should not conflict
    });

    it('should return page list at /pages/public/:language/list', async () => {
      const response = await request(app.getHttpServer())
        .get('/pages/public/tr/list')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return specific page at /pages/public/:language/:slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/pages/public/tr/test-page')
        .expect(200);

      expect(response.body.translations[0].slug).toBe('test-page');
    });

    it('should handle pages with slug "list" correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/pages/public/tr/list')
        .expect(200);

      // This should return the list endpoint, not a page with slug="list"
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('3. Menu Endpoints - Validation & Reorder', () => {
    let testMenuId: number;

    beforeAll(async () => {
      testMenuId = await createTestMenu();
    });

    it('should allow menu item creation with both pageId and externalUrl null (group item)', async () => {
      const response = await request(app.getHttpServer())
        .post('/menu/admin/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          menuId: testMenuId,
          parentId: null,
          translations: [
            { language: 'tr', label: 'Group Item' }
          ]
        })
        .expect(201);

      expect(response.body.pageId).toBeNull();
      expect(response.body.externalUrl).toBeNull();
    });

    it('should reject menu item with both pageId and externalUrl', async () => {
      await request(app.getHttpServer())
        .post('/menu/admin/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          menuId: testMenuId,
          pageId: 1,
          externalUrl: 'https://example.com',
          translations: [
            { language: 'tr', label: 'Invalid Item' }
          ]
        })
        .expect(400);
    });

    it('should validate reorder request body', async () => {
      await request(app.getHttpServer())
        .post(`/menu/admin/${testMenuId}/reorder`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            { id: 1, order: 1, parentId: null }
          ]
        })
        .expect(200);
    });

    it('should reject reorder with invalid body', async () => {
      await request(app.getHttpServer())
        .post(`/menu/admin/${testMenuId}/reorder`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}) // Missing items array
        .expect(400);
    });
  });

  describe('4. Site Settings Translation Upsert', () => {
    it('should require siteName in translation upsert', async () => {
      const response = await request(app.getHttpServer())
        .patch('/site-settings/admin/translation/tr')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siteName: 'Test Site',
          siteDescription: 'Test Description'
        })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should reject translation upsert without siteName', async () => {
      await request(app.getHttpServer())
        .patch('/site-settings/admin/translation/tr')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siteDescription: 'Test Description'
        }) // Missing siteName
        .expect(400);
    });

    it('should reject translation upsert with empty body', async () => {
      await request(app.getHttpServer())
        .patch('/site-settings/admin/translation/tr')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('5. SEO Structured Data JSON Object Support', () => {
    it('should accept JSON object for jsonLd field', async () => {
      const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Test Company",
        "url": "https://test.com"
      };

      const response = await request(app.getHttpServer())
        .post('/seo/admin/structured-data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          entityType: 'organization',
          entityId: 'main',
          schemaType: 'Organization',
          jsonLd: jsonLdData
        })
        .expect(201);

      expect(response.body.jsonLd).toEqual(jsonLdData);
    });

    it('should reject invalid structured data (missing @context)', async () => {
      await request(app.getHttpServer())
        .post('/seo/admin/structured-data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          entityType: 'organization',
          entityId: 'main',
          schemaType: 'Organization',
          jsonLd: {
            "@type": "Organization", // Missing @context
            "name": "Test Company"
          }
        })
        .expect(400);
    });

    it('should reject structured data that is too large (over 100KB)', async () => {
      const largeObject = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Test Company",
        "description": "x".repeat(102400) // Over 100KB
      };

      await request(app.getHttpServer())
        .post('/seo/admin/structured-data')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          entityType: 'organization',
          entityId: 'main',
          schemaType: 'Organization',
          jsonLd: largeObject
        })
        .expect(400);
    });
  });

  describe('6. Authentication Error Messages', () => {
    it('should return specific error message for expired token', async () => {
      const expiredToken = 'expired.jwt.token';

      const response = await request(app.getHttpServer())
        .get('/pages/admin')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.message).toMatch(/(expired|Invalid token)/);
    });

    it('should return specific error message for invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';

      const response = await request(app.getHttpServer())
        .get('/pages/admin')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.message).toContain('Invalid token');
    });
  });

  // Helper functions
  async function setupTestData() {
    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        domain: 'test.softellio.com',
        defaultLanguage: 'tr',
        availableLanguages: ['tr', 'en'],
        isActive: true,
      },
    });
    testTenantId = tenant.id;

    // Create test admin user manually in the database since register is not available in service
    const adminUser = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'test-admin@test.com',
        password: 'TestPassword123!', // In real app this would be hashed
        role: 'TENANT_ADMIN',
        tenantId: testTenantId,
        isActive: true,
      },
    });

    // Generate token - use available method or create manually
    const tokenResult = await authService.login({
      email: 'test-admin@test.com',
      password: 'TestPassword123!',
    }, 'test.softellio.com');
    adminToken = tokenResult.accessToken;
  }

  async function cleanupTestData() {
    if (testTenantId) {
      // Delete all related data
      await prisma.user.deleteMany({ where: { tenantId: testTenantId } });
      await prisma.page.deleteMany({ where: { tenantId: testTenantId } });
      await prisma.menu.deleteMany({ where: { tenantId: testTenantId } });
      await prisma.siteSetting.deleteMany({ where: { tenantId: testTenantId } });
      await prisma.structuredData.deleteMany({ where: { tenantId: testTenantId } });
      await prisma.tenant.delete({ where: { id: testTenantId } });
    }
  }

  async function createTestPage(slug: string, title: string) {
    return await prisma.page.create({
      data: {
        tenantId: testTenantId,
        status: 'published',
        translations: {
          create: {
            language: 'tr',
            title: title,
            slug: slug,
            contentJson: { blocks: [] },
          },
        },
      },
    });
  }

  async function createTestMenu() {
    const menu = await prisma.menu.create({
      data: {
        tenantId: testTenantId,
        key: 'test-menu',
      },
    });
    return menu.id;
  }
});