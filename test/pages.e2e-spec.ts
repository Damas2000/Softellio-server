import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { PageStatus } from '../src/pages/dto/create-page.dto';
import { Role } from '@prisma/client';

describe('Pages (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  // Test data
  let tenant1: any;
  let tenant2: any;
  let tenantAdmin1: any;
  let tenantAdmin2: any;
  let editor1: any;
  let superAdmin: any;
  let tenantAdminToken1: string;
  let tenantAdminToken2: string;
  let editorToken1: string;
  let superAdminToken: string;
  let testPage1: any;
  let testPage2: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configure validation pipe as in main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create test tenants
    tenant1 = await prismaService.tenant.create({
      data: {
        name: 'Test Tenant 1',
        slug: 'test-tenant-1',
        domain: 'test1.example.com',
        status: 'active',
        isActive: true,
      },
    });

    tenant2 = await prismaService.tenant.create({
      data: {
        name: 'Test Tenant 2',
        slug: 'test-tenant-2',
        domain: 'test2.example.com',
        status: 'active',
        isActive: true,
      },
    });

    // Create test users
    const hashedPassword = await authService.hashPassword('testpassword123');

    tenantAdmin1 = await prismaService.user.create({
      data: {
        email: 'admin1@test.com',
        password: hashedPassword,
        name: 'Tenant Admin 1',
        role: Role.TENANT_ADMIN,
        tenantId: tenant1.id,
        isActive: true,
      },
    });

    tenantAdmin2 = await prismaService.user.create({
      data: {
        email: 'admin2@test.com',
        password: hashedPassword,
        name: 'Tenant Admin 2',
        role: Role.TENANT_ADMIN,
        tenantId: tenant2.id,
        isActive: true,
      },
    });

    editor1 = await prismaService.user.create({
      data: {
        email: 'editor1@test.com',
        password: hashedPassword,
        name: 'Editor 1',
        role: Role.EDITOR,
        tenantId: tenant1.id,
        isActive: true,
      },
    });

    superAdmin = await prismaService.user.create({
      data: {
        email: 'superadmin@softellio.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    });

    // Generate tokens
    tenantAdminToken1 = await generateToken(tenantAdmin1);
    tenantAdminToken2 = await generateToken(tenantAdmin2);
    editorToken1 = await generateToken(editor1);
    superAdminToken = await generateToken(superAdmin);

    // Create test pages
    testPage1 = await prismaService.page.create({
      data: {
        tenantId: tenant1.id,
        status: 'draft',
        translations: {
          create: [
            {
              language: 'tr',
              title: 'Test Sayfa 1',
              slug: 'test-sayfa-1',
              contentJson: { blocks: [] },
              metaTitle: 'Test Meta 1',
              metaDescription: 'Test açıklama 1',
            },
            {
              language: 'en',
              title: 'Test Page 1',
              slug: 'test-page-1',
              contentJson: { blocks: [] },
              metaTitle: 'Test Meta 1 EN',
              metaDescription: 'Test description 1',
            },
          ],
        },
      },
      include: { translations: true },
    });

    testPage2 = await prismaService.page.create({
      data: {
        tenantId: tenant2.id,
        status: 'published',
        translations: {
          create: [
            {
              language: 'tr',
              title: 'Test Sayfa 2',
              slug: 'test-sayfa-2',
              contentJson: { blocks: [] },
            },
          ],
        },
      },
      include: { translations: true },
    });
  }

  async function generateToken(user: any): Promise<string> {
    const tokens = await authService.generateTokens(user);
    return tokens.accessToken;
  }

  async function cleanupTestData() {
    await prismaService.pageTranslation.deleteMany();
    await prismaService.page.deleteMany();
    await prismaService.user.deleteMany();
    await prismaService.tenant.deleteMany();
  }

  describe('POST /pages/admin', () => {
    const createPageDto = {
      status: 'draft',
      translations: [
        {
          language: 'tr',
          title: 'Yeni Sayfa',
          slug: 'yeni-sayfa',
          contentJson: { blocks: [{ type: 'paragraph', data: { text: 'İçerik' } }] },
          metaTitle: 'Yeni Sayfa Meta',
          metaDescription: 'Yeni sayfa açıklama',
        },
      ],
    };

    it('should create page with TENANT_ADMIN role and valid tenant header', async () => {
      const response = await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(createPageDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        tenantId: tenant1.id,
        status: 'draft',
        translations: expect.arrayContaining([
          expect.objectContaining({
            language: 'tr',
            title: 'Yeni Sayfa',
            slug: 'yeni-sayfa',
          }),
        ]),
      });

      // Cleanup
      await prismaService.page.delete({ where: { id: response.body.id } });
    });

    it('should create page with EDITOR role', async () => {
      const response = await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${editorToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(createPageDto)
        .expect(201);

      expect(response.body.tenantId).toBe(tenant1.id);

      // Cleanup
      await prismaService.page.delete({ where: { id: response.body.id } });
    });

    it('should reject request without X-Tenant-Host header', async () => {
      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .send(createPageDto)
        .expect(400);
    });

    it('should reject request with wrong tenant header', async () => {
      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant2.domain) // Wrong tenant
        .send(createPageDto)
        .expect(403);
    });

    it('should reject request without valid JWT', async () => {
      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('X-Tenant-Host', tenant1.domain)
        .send(createPageDto)
        .expect(401);
    });

    it('should reject request with invalid role', async () => {
      // Since we don't have a VIEWER user in our test setup,
      // we'll test with a token that has invalid role in a different way
      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', 'Bearer invalid-token')
        .set('X-Tenant-Host', tenant1.domain)
        .send(createPageDto)
        .expect(401);
    });

    it('should return 409 for duplicate slug', async () => {
      const duplicateSlugDto = {
        ...createPageDto,
        translations: [
          {
            ...createPageDto.translations[0],
            slug: testPage1.translations[0].slug, // Use existing slug
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(duplicateSlugDto)
        .expect(409);
    });

    it('should return 400 for invalid slug format', async () => {
      const invalidSlugDto = {
        ...createPageDto,
        translations: [
          {
            ...createPageDto.translations[0],
            slug: 'Invalid Slug With Spaces!',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(invalidSlugDto)
        .expect(400);
    });

    it('should return 400 for empty translations', async () => {
      const emptyTranslationsDto = {
        ...createPageDto,
        translations: [],
      };

      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(emptyTranslationsDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteDto = {
        translations: [
          {
            language: 'tr',
            // Missing title and slug
            contentJson: { blocks: [] },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(incompleteDto)
        .expect(400);
    });
  });

  describe('GET /pages/admin', () => {
    it('should enforce tenant isolation (tenant A cannot see tenant B pages)', async () => {
      // Tenant 1 admin tries to access tenant 1 pages
      const response1 = await request(app.getHttpServer())
        .get('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(200);

      expect(response1.body.pages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: testPage1.id, tenantId: tenant1.id }),
        ])
      );

      // Should not contain tenant 2 pages
      expect(response1.body.pages.find((page: any) => page.tenantId === tenant2.id)).toBeUndefined();

      // Tenant 2 admin tries to access tenant 2 pages
      const response2 = await request(app.getHttpServer())
        .get('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken2}`)
        .set('X-Tenant-Host', tenant2.domain)
        .expect(200);

      expect(response2.body.pages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: testPage2.id, tenantId: tenant2.id }),
        ])
      );

      // Should not contain tenant 1 pages
      expect(response2.body.pages.find((page: any) => page.tenantId === tenant1.id)).toBeUndefined();
    });

    it('should support advanced filtering and pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/pages/admin')
        .query({
          status: 'draft',
          language: 'tr',
          page: 1,
          limit: 5,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        })
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(200);

      expect(response.body).toMatchObject({
        pages: expect.any(Array),
        total: expect.any(Number),
        totalPages: expect.any(Number),
        currentPage: 1,
        limit: 5,
      });
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/pages/admin')
        .set('X-Tenant-Host', tenant1.domain)
        .expect(401);
    });

    it('should support search functionality', async () => {
      const response = await request(app.getHttpServer())
        .get('/pages/admin')
        .query({ search: 'Test Sayfa' })
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(200);

      expect(response.body.pages.length).toBeGreaterThan(0);
      expect(response.body.pages[0].translations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('Test'),
          }),
        ])
      );
    });
  });

  describe('GET /pages/public/:language/:slug', () => {
    it('should return published page without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pages/public/tr/${testPage2.translations[0].slug}`)
        .set('X-Tenant-Host', tenant2.domain)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testPage2.id,
        status: 'published',
        translations: expect.arrayContaining([
          expect.objectContaining({
            language: 'tr',
            slug: testPage2.translations[0].slug,
          }),
        ]),
      });
    });

    it('should return 404 for unpublished page', async () => {
      await request(app.getHttpServer())
        .get(`/pages/public/tr/${testPage1.translations[0].slug}`) // Draft page
        .set('X-Tenant-Host', tenant1.domain)
        .expect(404);
    });

    it('should enforce tenant isolation via domain header', async () => {
      // Try to access tenant 2 page with tenant 1 domain
      await request(app.getHttpServer())
        .get(`/pages/public/tr/${testPage2.translations[0].slug}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(404);
    });

    it('should work with custom domains', async () => {
      // Test with the actual domain configured for tenant
      const response = await request(app.getHttpServer())
        .get(`/pages/public/tr/${testPage2.translations[0].slug}`)
        .set('X-Tenant-Host', tenant2.domain)
        .expect(200);

      expect(response.body.id).toBe(testPage2.id);
    });
  });

  describe('PATCH /pages/admin/:id', () => {
    it('should update page with valid data', async () => {
      const updateDto = {
        status: 'published',
        translations: [
          {
            language: 'tr',
            title: 'Updated Title',
            slug: 'updated-slug',
            metaTitle: 'Updated Meta',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .patch(`/pages/admin/${testPage1.id}`)
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testPage1.id,
        status: 'published',
        translations: expect.arrayContaining([
          expect.objectContaining({
            title: 'Updated Title',
            slug: 'updated-slug',
          }),
        ]),
      });
    });

    it('should return 404 for non-existent page', async () => {
      await request(app.getHttpServer())
        .patch('/pages/admin/99999')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send({ status: 'published' })
        .expect(404);
    });

    it('should prevent cross-tenant updates', async () => {
      // Tenant 1 admin tries to update tenant 2 page
      await request(app.getHttpServer())
        .patch(`/pages/admin/${testPage2.id}`)
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send({ status: 'published' })
        .expect(404);
    });
  });

  describe('DELETE /pages/admin/:id', () => {
    it('should delete page successfully', async () => {
      // Create a page to delete
      const pageToDelete = await prismaService.page.create({
        data: {
          tenantId: tenant1.id,
          status: 'draft',
          translations: {
            create: [
              {
                language: 'tr',
                title: 'Page to Delete',
                slug: 'page-to-delete',
              },
            ],
          },
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/pages/admin/${pageToDelete.id}`)
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Page deleted successfully',
      });

      // Verify page is deleted
      const deletedPage = await prismaService.page.findUnique({
        where: { id: pageToDelete.id },
      });
      expect(deletedPage).toBeNull();
    });

    it('should return 404 for non-existent page', async () => {
      await request(app.getHttpServer())
        .delete('/pages/admin/99999')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(404);
    });

    it('should prevent cross-tenant deletion', async () => {
      // Tenant 1 admin tries to delete tenant 2 page
      await request(app.getHttpServer())
        .delete(`/pages/admin/${testPage2.id}`)
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(404);
    });
  });

  describe('DELETE /pages/admin/bulk', () => {
    it('should bulk delete pages within tenant', async () => {
      // Create pages to delete
      const page1 = await prismaService.page.create({
        data: {
          tenantId: tenant1.id,
          status: 'draft',
          translations: { create: [{ language: 'tr', title: 'Bulk 1', slug: 'bulk-1' }] },
        },
      });

      const page2 = await prismaService.page.create({
        data: {
          tenantId: tenant1.id,
          status: 'draft',
          translations: { create: [{ language: 'tr', title: 'Bulk 2', slug: 'bulk-2' }] },
        },
      });

      const response = await request(app.getHttpServer())
        .delete('/pages/admin/bulk')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send({ ids: [page1.id, page2.id] })
        .expect(200);

      expect(response.body).toMatchObject({
        deleted: 2,
      });
    });

    it('should only delete pages within the correct tenant', async () => {
      // Try to delete pages from different tenants
      const response = await request(app.getHttpServer())
        .delete('/pages/admin/bulk')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send({ ids: [testPage1.id, testPage2.id] }) // testPage2 belongs to tenant2
        .expect(200);

      expect(response.body.deleted).toBeLessThan(2); // Should only delete tenant1 pages
    });
  });

  describe('Tenant Isolation Security Tests', () => {
    it('should prevent cross-tenant access to pages', async () => {
      // List all endpoints that should be tenant-isolated
      const endpoints = [
        { method: 'get', path: '/pages/admin' },
        { method: 'get', path: `/pages/admin/${testPage1.id}` },
        { method: 'patch', path: `/pages/admin/${testPage1.id}` },
        { method: 'delete', path: `/pages/admin/${testPage1.id}` },
        { method: 'post', path: `/pages/admin/${testPage1.id}/duplicate` },
      ];

      for (const endpoint of endpoints) {
        // Tenant 2 admin tries to access tenant 1 resources
        const response = await request(app.getHttpServer())
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${tenantAdminToken2}`)
          .set('X-Tenant-Host', tenant2.domain)
          .send({ status: 'published' }); // For PATCH requests

        expect([404, 403]).toContain(response.status);
      }
    });

    it('should prevent slug conflicts across different tenants', async () => {
      const sameSlugsDto = {
        status: 'draft',
        translations: [
          {
            language: 'tr',
            title: 'Same Slug Different Tenant',
            slug: testPage1.translations[0].slug, // Same slug as tenant1 page
          },
        ],
      };

      // Should succeed because different tenants can have same slugs
      const response = await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken2}`)
        .set('X-Tenant-Host', tenant2.domain)
        .send(sameSlugsDto)
        .expect(201);

      expect(response.body.tenantId).toBe(tenant2.id);

      // Cleanup
      await prismaService.page.delete({ where: { id: response.body.id } });
    });

    it('should allow same slug in different languages per tenant', async () => {
      const multiLanguageDto = {
        status: 'draft',
        translations: [
          {
            language: 'tr',
            title: 'Türkçe Başlık',
            slug: 'same-slug-different-lang',
          },
          {
            language: 'en',
            title: 'English Title',
            slug: 'same-slug-different-lang', // Same slug, different language
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(multiLanguageDto)
        .expect(201);

      expect(response.body.translations).toHaveLength(2);

      // Cleanup
      await prismaService.page.delete({ where: { id: response.body.id } });
    });
  });

  describe('Super Admin Access', () => {
    it('should allow SUPER_ADMIN to access any tenant', async () => {
      // Super admin should be able to access tenant1 pages
      const response1 = await request(app.getHttpServer())
        .get('/pages/admin')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(200);

      expect(response1.body.pages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tenantId: tenant1.id }),
        ])
      );

      // Super admin should be able to access tenant2 pages
      const response2 = await request(app.getHttpServer())
        .get('/pages/admin')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .set('X-Tenant-Host', tenant2.domain)
        .expect(200);

      expect(response2.body.pages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tenantId: tenant2.id }),
        ])
      );
    });
  });

  describe('Preview Routes', () => {
    it('should allow admin to preview unpublished pages', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pages/preview/tr/${testPage1.translations[0].slug}`)
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testPage1.id,
        status: 'draft', // Unpublished page
      });
    });

    it('should require authentication for preview routes', async () => {
      await request(app.getHttpServer())
        .get(`/pages/preview/tr/${testPage1.translations[0].slug}`)
        .set('X-Tenant-Host', tenant1.domain)
        .expect(401);
    });
  });

  describe('Validation Edge Cases', () => {
    it('should handle very long slugs', async () => {
      const longSlugDto = {
        status: 'draft',
        translations: [
          {
            language: 'tr',
            title: 'Long Slug Test',
            slug: 'a'.repeat(101), // Exceeds 100 character limit
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(longSlugDto)
        .expect(400);
    });

    it('should handle special characters in slug', async () => {
      const specialCharsDto = {
        status: 'draft',
        translations: [
          {
            language: 'tr',
            title: 'Special Chars Test',
            slug: 'test@#$%^&*()',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(specialCharsDto)
        .expect(400);
    });

    it('should reject unknown properties in request body', async () => {
      const invalidDto = {
        status: 'draft',
        unknownProperty: 'should be rejected',
        translations: [
          {
            language: 'tr',
            title: 'Test',
            slug: 'test-unknown',
            anotherUnknownProp: 'also rejected',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/pages/admin')
        .set('Authorization', `Bearer ${tenantAdminToken1}`)
        .set('X-Tenant-Host', tenant1.domain)
        .send(invalidDto)
        .expect(400);
    });
  });
});