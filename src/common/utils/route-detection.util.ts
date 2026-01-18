/**
 * Centralized utility for detecting API routes and tenant host resolution
 * Prevents FrontendController from intercepting backend endpoints
 */
export class RouteDetectionUtil {
  private static readonly API_ROUTE_PATTERNS = [
    '/api',
    '/auth',
    '/super-admin',
    '/users',
    '/tenants',
    '/pages',
    '/blog',
    '/media',
    '/site-settings',
    '/theme-settings',
    '/menu',
    '/frontend',
    '/services',
    '/references',
    '/contact-info',
    '/seo',
    '/section-types',
    '/layouts',
    '/banners-sliders',
    '/social-media-maps',
    '/dashboard-analytics',
    '/domains',
    '/health',
    '/docs',
    '/api-docs',
    '/monitoring',
    '/backup',
    '/billing',
    '/public',
    '/cms',
    '/templates',
  ];

  static isApiRoute(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    const cleanUrl = url.split('?')[0];

    return this.API_ROUTE_PATTERNS.some(
      (pattern) => cleanUrl.startsWith(pattern) || cleanUrl.includes('api-docs'),
    );
  }

  /**
   * Extract tenant host from request headers
   * Prefers X-Tenant-Host header, falls back to Host header
   * Strips port and normalizes to lowercase
   */
  static getTenantHost(req: { headers: Record<string, string | string[] | undefined> }): string | null {
    const host = (req.headers['x-tenant-host'] ?? req.headers['host']) as string;

    if (!host) {
      return null;
    }

    return host.split(':')[0].toLowerCase().trim();
  }
}