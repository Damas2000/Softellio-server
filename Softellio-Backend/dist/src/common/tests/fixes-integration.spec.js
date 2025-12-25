"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const app_module_1 = require("../../app.module");
const request = require("supertest");
const prisma_service_1 = require("../../config/prisma.service");
const auth_service_1 = require("../../auth/auth.service");
describe('Backend Fixes Integration Tests', () => {
    let app;
    let prisma;
    let authService;
    let adminToken;
    let testTenantId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();
        prisma = app.get(prisma_service_1.PrismaService);
        authService = app.get(auth_service_1.AuthService);
        await setupTestData();
    });
    afterAll(async () => {
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
            await createTestPage('test-page', 'Test Page');
            await createTestPage('list', 'List Page');
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
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
    describe('3. Menu Endpoints - Validation & Reorder', () => {
        let testMenuId;
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
                .send({})
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
            })
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
                    "@type": "Organization",
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
                "description": "x".repeat(102400)
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
    async function setupTestData() {
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
        const adminUser = await prisma.user.create({
            data: {
                name: 'Test Admin',
                email: 'test-admin@test.com',
                password: 'TestPassword123!',
                role: 'TENANT_ADMIN',
                tenantId: testTenantId,
                isActive: true,
            },
        });
        const tokenResult = await authService.login({
            email: 'test-admin@test.com',
            password: 'TestPassword123!',
        }, 'test.softellio.com');
        adminToken = tokenResult.accessToken;
    }
    async function cleanupTestData() {
        if (testTenantId) {
            await prisma.user.deleteMany({ where: { tenantId: testTenantId } });
            await prisma.page.deleteMany({ where: { tenantId: testTenantId } });
            await prisma.menu.deleteMany({ where: { tenantId: testTenantId } });
            await prisma.siteSetting.deleteMany({ where: { tenantId: testTenantId } });
            await prisma.structuredData.deleteMany({ where: { tenantId: testTenantId } });
            await prisma.tenant.delete({ where: { id: testTenantId } });
        }
    }
    async function createTestPage(slug, title) {
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
//# sourceMappingURL=fixes-integration.spec.js.map