/**
 * Centralized utility for detecting API routes
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
    '/health',
    '/docs',
    '/api-docs',
    '/monitoring',
    '/backup',
    '/billing',
  ];

  static isApiRoute(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    const cleanUrl = url.split('?')[0];

    return this.API_ROUTE_PATTERNS.some(
      (pattern) => cleanUrl.startsWith(pattern) || cleanUrl.includes('api-docs'),
    );
  }
}