import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Public API JSON Guarantee (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/public/site/* endpoints - JSON Response Guarantee', () => {
    const testHeaders = {
      'X-Tenant-Host': 'demo.softellio.com',
      'Accept': 'application/json',
    };

    it('/public/site/config should return JSON (not HTML)', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/site/config')
        .set(testHeaders)
        .expect(200);

      // CRITICAL: Must be JSON, never HTML
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.text).not.toContain('<html');
      expect(response.text).not.toContain('<body');
      expect(response.text).not.toContain('DOCTYPE');

      // Must have valid JSON structure
      expect(response.body).toEqual(
        expect.objectContaining({
          branding: expect.any(Object),
          navigation: expect.any(Array),
          footer: expect.any(Object),
          seoDefaults: expect.any(Object),
        })
      );
    });

    it('/public/site/pages/by-slug/% should return JSON (not HTML)', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/site/pages/by-slug/%2F?lang=tr')
        .set(testHeaders)
        .expect(200);

      // CRITICAL: Must be JSON, never HTML
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.text).not.toContain('<html');
      expect(response.text).not.toContain('<body');
      expect(response.text).not.toContain('DOCTYPE');

      // Must have valid JSON structure
      expect(response.body).toEqual(
        expect.objectContaining({
          page: expect.objectContaining({
            slug: '/',
            title: expect.any(String),
            published: true,
          }),
          layout: expect.objectContaining({
            key: 'HOME',
            sections: expect.any(Array),
          }),
        })
      );

      // Homepage MUST have sections (critical fix)
      expect(response.body.layout.sections.length).toBeGreaterThan(0);
      expect(response.body._debug.sectionCount).toBeGreaterThan(0);
    });

    it('/public/site/debug/summary should return JSON (not HTML)', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/site/debug/summary')
        .set(testHeaders)
        .expect(200);

      // CRITICAL: Must be JSON, never HTML
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.text).not.toContain('<html');
      expect(response.text).not.toContain('<body');
      expect(response.text).not.toContain('DOCTYPE');

      // Must have valid debug structure
      expect(response.body).toEqual(
        expect.objectContaining({
          resolvedTenantId: expect.any(Number),
          tenant: expect.any(Object),
          templateKey: 'printing-premium-v1',
          hasSiteConfig: true,
          hasHomePage: true,
          publishedPagesCount: expect.any(Number),
        })
      );
    });

    it('/public/site/pages should return JSON (not HTML)', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/site/pages?lang=tr')
        .set(testHeaders)
        .expect(200);

      // CRITICAL: Must be JSON, never HTML
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.text).not.toContain('<html');
      expect(response.text).not.toContain('<body');
      expect(response.text).not.toContain('DOCTYPE');

      // Must have valid pages structure
      expect(response.body).toEqual(
        expect.objectContaining({
          pages: expect.any(Array),
          _debug: expect.any(Object),
        })
      );

      // Must have homepage in pages list
      const homePage = response.body.pages.find((p: any) => p.slug === '/');
      expect(homePage).toBeDefined();
      expect(homePage.title).toBeTruthy();
    });

    it('/cms/* endpoints should return JSON (not HTML)', async () => {
      // Note: CMS endpoints require authentication, but routing should work
      const response = await request(app.getHttpServer())
        .get('/cms/layouts/HOME?lang=tr')
        .set(testHeaders)
        .expect(401); // Expected: authentication required

      // Even auth errors must be JSON
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.text).not.toContain('<html');
      expect(response.text).not.toContain('<body');
      expect(response.text).not.toContain('DOCTYPE');
    });

    it('/templates/* endpoints should return JSON (not HTML)', async () => {
      const response = await request(app.getHttpServer())
        .get('/templates')
        .set(testHeaders)
        .expect(401); // Expected: authentication required for templates

      // Even auth errors must be JSON
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.text).not.toContain('<html');
      expect(response.text).not.toContain('<body');
      expect(response.text).not.toContain('DOCTYPE');
    });
  });

  describe('Error Scenarios - Must Return JSON', () => {
    it('404 errors should return JSON (not HTML)', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/site/pages/by-slug/non-existent-page')
        .set({
          'X-Tenant-Host': 'demo.softellio.com',
          'Accept': 'application/json',
        })
        .expect(404);

      // Even 404s must be JSON
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.text).not.toContain('<html');
      expect(response.text).not.toContain('<body');
      expect(response.text).not.toContain('DOCTYPE');
    });

    it('Invalid tenant should return JSON error (not HTML)', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/site/config')
        .set({
          'X-Tenant-Host': 'non-existent-tenant.softellio.com',
          'Accept': 'application/json',
        })
        .expect(404);

      // Even tenant not found must be JSON
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.text).not.toContain('<html');
      expect(response.text).not.toContain('<body');
      expect(response.text).not.toContain('DOCTYPE');
    });
  });

  describe('Production-Ready Response Contract', () => {
    it('All responses should have proper JSON structure with debug info', async () => {
      const endpoints = [
        '/public/site/config',
        '/public/site/pages/by-slug/%2F?lang=tr',
        '/public/site/debug/summary',
        '/public/site/pages?lang=tr',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app.getHttpServer())
          .get(endpoint)
          .set({
            'X-Tenant-Host': 'demo.softellio.com',
            'Accept': 'application/json',
          })
          .expect(200);

        // All successful responses should have debug info
        expect(response.body._debug || response.body.debugging).toBeDefined();
        expect(response.body._debug?.tenantId || response.body.resolvedTenantId).toBe(1);
        expect(response.body._debug?.requestId || response.body.debugging?.requestId).toMatch(/^pub_/);
      }
    });
  });
});