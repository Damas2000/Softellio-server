import { ApiProperty } from '@nestjs/swagger';

/**
 * Site Bootstrap Response DTO
 * Single source of truth for frontend - contains ALL site data needed
 */

export class TenantInfoDto {
  @ApiProperty({
    example: 2,
    description: 'Tenant ID'
  })
  id: number;

  @ApiProperty({
    example: 'demo',
    description: 'Tenant slug'
  })
  slug: string;

  @ApiProperty({
    example: 'Demo Company',
    description: 'Tenant name'
  })
  name: string;

  @ApiProperty({
    example: 'demo.softellio.com',
    description: 'Tenant domain'
  })
  domain: string;

  @ApiProperty({
    example: 'tr',
    description: 'Default locale'
  })
  locale: string;

  @ApiProperty({
    example: 'printing-premium-v1',
    description: 'Active template key'
  })
  templateKey: string;
}

export class BrandingDto {
  @ApiProperty({
    example: 'https://cdn.demo.com/logo.png',
    description: 'Logo URL',
    required: false
  })
  logoUrl?: string;

  @ApiProperty({
    example: 'https://cdn.demo.com/favicon.ico',
    description: 'Favicon URL',
    required: false
  })
  faviconUrl?: string;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Primary brand color',
    required: false
  })
  primaryColor?: string;

  @ApiProperty({
    example: '#1E40AF',
    description: 'Secondary brand color',
    required: false
  })
  secondaryColor?: string;

  @ApiProperty({
    example: 'Inter, sans-serif',
    description: 'Font family',
    required: false
  })
  fontFamily?: string;
}

export class NavItemBootstrapDto {
  @ApiProperty({
    example: 'Ana Sayfa',
    description: 'Navigation label'
  })
  label: string;

  @ApiProperty({
    example: '/',
    description: 'Navigation href'
  })
  href: string;

  @ApiProperty({
    example: 1,
    description: 'Display order'
  })
  order: number;

  @ApiProperty({
    example: false,
    description: 'Is call-to-action button'
  })
  isCTA: boolean;

  @ApiProperty({
    example: false,
    description: 'Opens in new tab'
  })
  isExternal: boolean;

  @ApiProperty({
    type: [NavItemBootstrapDto],
    description: 'Dropdown children',
    required: false
  })
  children?: NavItemBootstrapDto[];
}

export class FooterLinkBootstrapDto {
  @ApiProperty({
    example: 'Hakkımızda',
    description: 'Footer link label'
  })
  label: string;

  @ApiProperty({
    example: '/about',
    description: 'Footer link URL'
  })
  url: string;
}

export class FooterColumnBootstrapDto {
  @ApiProperty({
    example: 'Hızlı Linkler',
    description: 'Footer column title'
  })
  title: string;

  @ApiProperty({
    type: [FooterLinkBootstrapDto],
    description: 'Links in this column'
  })
  links: FooterLinkBootstrapDto[];
}

export class SocialLinkBootstrapDto {
  @ApiProperty({
    example: 'facebook',
    description: 'Social platform'
  })
  platform: string;

  @ApiProperty({
    example: 'https://facebook.com/company',
    description: 'Social URL'
  })
  url: string;

  @ApiProperty({
    example: 'Facebook\'ta takip edin',
    description: 'Link label'
  })
  label: string;
}

export class FooterBootstrapDto {
  @ApiProperty({
    type: [FooterColumnBootstrapDto],
    description: 'Footer columns'
  })
  columns: FooterColumnBootstrapDto[];

  @ApiProperty({
    type: [SocialLinkBootstrapDto],
    description: 'Social media links',
    required: false
  })
  socialLinks?: SocialLinkBootstrapDto[];

  @ApiProperty({
    example: '© 2024 Demo Company. Tüm hakları saklıdır.',
    description: 'Copyright text',
    required: false
  })
  copyrightText?: string;
}

export class PageInfoDto {
  @ApiProperty({
    example: '/hizmetler',
    description: 'Page slug'
  })
  slug: string;

  @ApiProperty({
    example: 'SERVICES',
    description: 'Layout key for CMS'
  })
  layoutKey: string;

  @ApiProperty({
    example: 'Hizmetlerimiz',
    description: 'Page title'
  })
  title: string;

  @ApiProperty({
    example: 'SERVICES',
    description: 'Page type'
  })
  pageType: string;

  @ApiProperty({
    example: {
      metaTitle: 'Profesyonel Baskı Hizmetleri',
      metaDescription: 'Branda, afiş, tabela ve araç giydirme hizmetleri.',
      ogTitle: 'Hizmetlerimiz',
      ogDescription: 'Kaliteli baskı çözümleri',
      ogImage: 'https://cdn.demo.com/og-services.jpg'
    },
    description: 'SEO configuration',
    required: false
  })
  seo?: any;
}

export class SectionBootstrapDto {
  @ApiProperty({
    example: 1,
    description: 'Section database ID'
  })
  id: number;

  @ApiProperty({
    example: 'hero',
    description: 'Section type'
  })
  type: string;

  @ApiProperty({
    example: 'default',
    description: 'Section variant'
  })
  variant: string;

  @ApiProperty({
    example: 1,
    description: 'Display order'
  })
  order: number;

  @ApiProperty({
    example: true,
    description: 'Is section enabled'
  })
  enabled: boolean;

  @ApiProperty({
    example: {
      title: 'Branda • Afiş • Tabela',
      subtitle: 'Hızlı üretim, kaliteli baskı, profesyonel montaj.',
      ctaText: 'Teklif Al',
      ctaUrl: '/contact'
    },
    description: 'Section content and configuration'
  })
  propsJson: any;
}

export class HomeLayoutDto {
  @ApiProperty({
    example: 'HOME',
    description: 'Home layout key'
  })
  layoutKey: string;

  @ApiProperty({
    type: [SectionBootstrapDto],
    description: 'Home page sections'
  })
  sections: SectionBootstrapDto[];
}

/**
 * Complete Site Bootstrap Response
 * SINGLE SOURCE OF TRUTH for frontend
 */
export class SiteBootstrapResponseDto {
  @ApiProperty({
    type: TenantInfoDto,
    description: 'Tenant information'
  })
  tenant: TenantInfoDto;

  @ApiProperty({
    type: BrandingDto,
    description: 'Site branding configuration'
  })
  branding: BrandingDto;

  @ApiProperty({
    type: [NavItemBootstrapDto],
    description: 'Site navigation structure'
  })
  navigation: NavItemBootstrapDto[];

  @ApiProperty({
    type: FooterBootstrapDto,
    description: 'Footer configuration'
  })
  footer: FooterBootstrapDto;

  @ApiProperty({
    type: [PageInfoDto],
    description: 'All published pages'
  })
  pages: PageInfoDto[];

  @ApiProperty({
    type: HomeLayoutDto,
    description: 'Home page layout and sections'
  })
  home: HomeLayoutDto;

  @ApiProperty({
    example: {
      metaTitle: 'Demo Company - Profesyonel Baskı Hizmetleri',
      metaDescription: 'Kaliteli branda, afiş, tabela ve araç giydirme hizmetleri.',
      ogImage: 'https://cdn.demo.com/og-default.jpg'
    },
    description: 'Default SEO configuration',
    required: false
  })
  seoDefaults?: any;

  @ApiProperty({
    example: '/* Custom CSS */',
    description: 'Custom CSS for site styling',
    required: false
  })
  customCSS?: string;

  @ApiProperty({
    example: {
      templateKey: 'printing-premium-v1',
      supportedSections: ['hero', 'services', 'testimonials', 'contact'],
      cacheTimestamp: '2024-01-15T10:00:00Z'
    },
    description: 'Template and system metadata'
  })
  meta: {
    templateKey: string;
    supportedSections: string[];
    cacheTimestamp: string;
    version?: string;
  };
}