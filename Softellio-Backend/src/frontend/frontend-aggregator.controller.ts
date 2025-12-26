import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { FrontendAggregatorService } from './frontend-aggregator.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Frontend Aggregator (Public)')
@Controller('frontend')
export class FrontendAggregatorController {
  constructor(private readonly aggregatorService: FrontendAggregatorService) {}

  @Get('home')
  @Public()
  @ApiOperation({
    summary: 'Get complete home page data in single request',
    description: 'Aggregates tenant, site settings, theme, menu, and layout data for frontend rendering. Uses X-Tenant-Host header for tenant resolution.'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Complete home page data',
    schema: {
      type: 'object',
      properties: {
        tenant: {
          type: 'object',
          properties: {
            tenantId: { type: 'number', example: 1 },
            companyName: { type: 'string', example: 'Demo Company' },
            slug: { type: 'string', example: 'demo' },
            domain: { type: 'string', example: 'demo.softellio.com' },
            templateKey: { type: 'string', example: 'default' },
            defaultLanguage: { type: 'string', example: 'tr' },
            availableLanguages: { type: 'array', items: { type: 'string' }, example: ['tr', 'en'] },
            status: { type: 'string', example: 'active' },
          },
        },
        siteSettings: {
          type: 'object',
          properties: {
            siteName: { type: 'string', example: 'Demo Şirketi' },
            siteDescription: { type: 'string', example: 'Modern web sitesi çözümleri' },
            seoMetaTitle: { type: 'string', example: 'Demo Şirketi - Ana Sayfa' },
            seoMetaDescription: { type: 'string', example: 'Demo şirketi hakkında' },
          },
        },
        theme: {
          type: 'object',
          properties: {
            primaryColor: { type: 'string', example: '#3B82F6' },
            secondaryColor: { type: 'string', example: '#6B7280' },
            backgroundColor: { type: 'string', example: '#FFFFFF' },
            textColor: { type: 'string', example: '#111827' },
            fontFamily: { type: 'string', example: 'Inter, sans-serif' },
            radius: { type: 'number', example: 8 },
            shadowLevel: { type: 'number', example: 1 },
            containerMaxWidth: { type: 'number', example: 1200 },
            gridGap: { type: 'number', example: 24 },
            buttonStyle: { type: 'string', example: 'solid' },
            headerVariant: { type: 'string', example: 'default' },
            footerVariant: { type: 'string', example: 'default' },
          },
        },
        menu: {
          type: 'object',
          properties: {
            key: { type: 'string', example: 'main' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  label: { type: 'string', example: 'Ana Sayfa' },
                  url: { type: 'string', example: '/' },
                  order: { type: 'number', example: 1 },
                  children: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        layout: {
          type: 'object',
          properties: {
            key: { type: 'string', example: 'HOME' },
            language: { type: 'string', example: 'tr' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  type: { type: 'string', example: 'hero' },
                  variant: { type: 'string', example: 'v1' },
                  order: { type: 'number', example: 1 },
                  propsJson: {
                    type: 'object',
                    example: {
                      title: 'Modern Web Sitesi Çözümleri',
                      subtitle: 'İşletmenizi dijital dünyaya taşıyoruz',
                      buttonText: 'Hemen Başlayın',
                      buttonUrl: '/contact',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid tenant or parameters',
  })
  async getHomePage(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getHomePageData(tenantId, language);
  }

  @Get('home/extended')
  @Public()
  @ApiOperation({
    summary: 'Get extended home page data with contact info',
    description: 'Same as /home but includes contact information, offices, and social links'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Extended home page data with contact info',
  })
  async getExtendedHomePage(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getExtendedHomePageData(tenantId, language);
  }

  @Get('layout/:key')
  @Public()
  @ApiOperation({
    summary: 'Get layout by key with all data needed for rendering',
    description: 'Get specific layout (e.g., ABOUT, CONTACT) with theme and tenant data'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Layout data with theme and tenant info',
  })
  async getLayoutPage(
    @Param('key') key: string,
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getLayoutPageData(tenantId, key, language);
  }

  @Get('page/:slug')
  @Public()
  @ApiOperation({
    summary: 'Get page-specific data by slug',
    description: 'Get complete data for page-specific layout (PAGE:slug pattern) including all theme, menu, and layout data'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Complete page data for rendering',
    schema: {
      type: 'object',
      properties: {
        tenant: { type: 'object' },
        siteSettings: { type: 'object' },
        theme: { type: 'object' },
        menu: { type: 'object' },
        layout: {
          type: 'object',
          properties: {
            key: { type: 'string', example: 'PAGE:about-us' },
            language: { type: 'string', example: 'tr' },
            sections: { type: 'array' },
            meta: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'page' },
                slug: { type: 'string', example: 'about-us' },
                displayName: { type: 'string', example: 'Sayfa: About Us' },
                isPageSpecific: { type: 'boolean', example: true },
              },
            },
          },
        },
        page: {
          type: 'object',
          properties: {
            slug: { type: 'string', example: 'about-us' },
            layoutKey: { type: 'string', example: 'PAGE:about-us' },
            isPageSpecific: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid page slug' })
  @ApiResponse({ status: 404, description: 'Page layout not found' })
  async getPageData(
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getPageData(tenantId, slug, language);
  }

  @Get('page/:slug/extended')
  @Public()
  @ApiOperation({
    summary: 'Get page-specific data with contact info',
    description: 'Same as /page/:slug but includes contact information, offices, and social links'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Extended page data with contact info',
  })
  async getPageDataExtended(
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getPageDataExtended(tenantId, slug, language);
  }

  @Get('layouts')
  @Public()
  @ApiOperation({
    summary: 'Get all available layouts for tenant',
    description: 'Returns all layouts (global and page-specific) for navigation or sitemap generation'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Available layouts with metadata',
    schema: {
      type: 'object',
      properties: {
        tenant: {
          type: 'object',
          properties: {
            tenantId: { type: 'number', example: 1 },
            defaultLanguage: { type: 'string', example: 'tr' },
            availableLanguages: { type: 'array', items: { type: 'string' } },
          },
        },
        language: { type: 'string', example: 'tr' },
        layouts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', example: 'HOME' },
              type: { type: 'string', example: 'global', enum: ['global', 'page'] },
              slug: { type: 'string', example: 'about-us' },
              displayName: { type: 'string', example: 'Ana Sayfa / Home' },
              sectionsCount: { type: 'number', example: 5 },
              status: { type: 'string', example: 'published' },
              url: { type: 'string', example: '/' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getAvailableLayouts(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getAvailableLayouts(tenantId, language);
  }

  @Get('meta/:key')
  @Public()
  @ApiOperation({
    summary: 'Get SEO metadata for any layout or page',
    description: 'Returns SEO metadata and layout information for any layout key (HOME, PAGE:slug, etc.)'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'SEO metadata and layout information',
    schema: {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'About Us - Demo Company' },
            description: { type: 'string', example: 'Learn more about our company' },
            siteName: { type: 'string', example: 'Demo Company' },
            language: { type: 'string', example: 'tr' },
            url: { type: 'string', example: '/page/about-us' },
          },
        },
        layout: {
          type: 'object',
          properties: {
            key: { type: 'string', example: 'PAGE:about-us' },
            type: { type: 'string', example: 'page' },
            isPageSpecific: { type: 'boolean', example: true },
            displayName: { type: 'string', example: 'Sayfa: About Us' },
            sectionsCount: { type: 'number', example: 3 },
          },
        },
        tenant: {
          type: 'object',
          properties: {
            companyName: { type: 'string', example: 'Demo Company' },
            domain: { type: 'string', example: 'demo.softellio.com' },
            templateKey: { type: 'string', example: 'default' },
          },
        },
      },
    },
  })
  async getPageMeta(
    @Param('key') key: string,
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getPageMeta(tenantId, key, language);
  }

  @Get('footer')
  @Public()
  @ApiOperation({
    summary: 'Get complete footer data with layout and collections',
    description: 'Aggregates footer layout, theme, contact info, offices, and social links for footer rendering'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Complete footer data',
    schema: {
      type: 'object',
      properties: {
        tenant: {
          type: 'object',
          properties: {
            tenantId: { type: 'number', example: 1 },
            companyName: { type: 'string', example: 'Demo Company' },
            templateKey: { type: 'string', example: 'default' },
          },
        },
        theme: { type: 'object' },
        layout: {
          type: 'object',
          properties: {
            key: { type: 'string', example: 'FOOTER' },
            language: { type: 'string', example: 'tr' },
            sections: { type: 'array' },
            meta: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'global' },
                displayName: { type: 'string', example: 'Footer' },
                isPageSpecific: { type: 'boolean', example: false },
              },
            },
          },
        },
        contactInfo: {
          type: 'object',
          properties: {
            companyName: { type: 'string', example: 'Demo Company' },
            tagline: { type: 'string', example: 'Your trusted partner' },
            description: { type: 'string', example: 'Company description' },
            workingHours: { type: 'string', example: 'Mon-Fri 9:00-18:00' },
            logo: { type: 'string', example: '/images/logo.png' },
            favicon: { type: 'string', example: '/images/favicon.ico' },
          },
        },
        collections: {
          type: 'object',
          properties: {
            contactInfo: { type: 'object' },
            offices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Main Office' },
                  email: { type: 'string', example: 'info@demo.com' },
                  phone: { type: 'string', example: '+90 212 123 4567' },
                  address: { type: 'string', example: 'Istanbul, Turkey' },
                  isPrimary: { type: 'boolean', example: true },
                },
              },
            },
            socialLinks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  platform: { type: 'string', example: 'facebook' },
                  url: { type: 'string', example: 'https://facebook.com/demo' },
                  icon: { type: 'string', example: 'facebook' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getFooterData(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getFooterData(tenantId, language);
  }

  @Get('footer/layout')
  @Public()
  @ApiOperation({
    summary: 'Get footer layout with theme and minimal data',
    description: 'Get footer layout configuration for builder or minimal rendering'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Footer layout data',
  })
  async getFooterLayoutData(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getFooterLayoutData(tenantId, language);
  }

  @Get('footer/collections')
  @Public()
  @ApiOperation({
    summary: 'Get footer collections data (contact info, offices, social links)',
    description: 'Get all collection data needed for footer sections without layout'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (tr, en, ar, etc.)',
    required: false,
    example: 'tr',
  })
  @ApiResponse({
    status: 200,
    description: 'Footer collections data',
  })
  async getFooterCollections(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.aggregatorService.getFooterCollections(tenantId, language);
  }
}