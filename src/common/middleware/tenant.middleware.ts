import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../config/prisma.service';
import { DomainResolverService } from '../services/domain-resolver.service';
import { RequestWithTenant } from '../interfaces/request.interface';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    private prisma: PrismaService,
    private domainResolver: DomainResolverService,
  ) {}

  async use(req: RequestWithTenant, res: Response, next: NextFunction) {
    try {
      // Skip tenant resolution for super-admin routes
      if (req.path.startsWith('/super-admin')) {
        this.logger.debug('Skipping tenant resolution for super-admin route');
        return next();
      }

      // Skip tenant resolution for health check and monitoring endpoints
      if (req.path.startsWith('/health') || req.path.startsWith('/metrics')) {
        return next();
      }

      // Only apply tenant resolution to specific admin API routes - skip everything else for frontend serving
      const isApiRoute = req.path.startsWith('/api') ||
          req.path.startsWith('/auth') ||
          req.path.startsWith('/users') ||
          req.path.startsWith('/super-admin/tenants') || // Only super-admin tenant routes need tenant resolution
          req.path.startsWith('/pages') ||
          req.path.startsWith('/blog') ||
          req.path.startsWith('/media') ||
          req.path.startsWith('/site-settings') ||
          req.path.startsWith('/menu') ||
          req.path.startsWith('/services') ||
          req.path.startsWith('/contact-info') ||
          req.path.startsWith('/team-members') ||
          req.path.startsWith('/references') ||
          req.path.startsWith('/seo') ||
          req.path.startsWith('/banners-sliders') ||
          req.path.startsWith('/social-media-maps') ||
          req.path.startsWith('/dashboard-analytics') ||
          req.path.startsWith('/system-settings') ||
          req.path.startsWith('/monitoring') ||
          req.path.startsWith('/backup') ||
          req.path.startsWith('/domains') ||
          req.path.includes('api-docs');

      if (!isApiRoute) {
        // Skip tenant resolution for non-API routes (let FrontendController handle them)
        this.logger.debug(`Skipping tenant resolution for frontend route: ${req.path}`);
        return next();
      }

      // Only API routes reach this point
      this.logger.debug(`Processing tenant resolution for API route: ${req.path}`);

      let tenantId: number | undefined;
      let tenant: any = null;

      // Method 1: Direct tenant ID header (for API clients with known tenant)
      const tenantIdHeader = req.headers['x-tenant-id'] as string;
      if (tenantIdHeader) {
        tenantId = parseInt(tenantIdHeader, 10);
        if (isNaN(tenantId)) {
          throw new BadRequestException('Invalid tenant ID in header');
        }

        // Validate tenant exists and is active
        tenant = await this.prisma.tenant.findFirst({
          where: {
            id: tenantId,
            isActive: true,
            status: { not: 'SUSPENDED' }
          },
        });

        if (!tenant) {
          throw new BadRequestException(`Tenant with ID ${tenantId} not found or inactive`);
        }

        this.logger.debug(`Tenant resolved by ID header: ${tenant.slug} (${tenantId})`);
      } else {
        // Method 2: Netlify + Railway domain resolution
        // Use X-Tenant-Domain header (from frontend) or fallback to Host header
        const domainHeader = (req.headers['x-tenant-domain'] || req.headers['host']) as string;

        if (!domainHeader) {
          throw new BadRequestException('No domain information found in request headers');
        }

        // Use domain resolver service for sophisticated tenant resolution
        const resolution = await this.domainResolver.resolveTenantFromDomain(domainHeader);

        // Validate tenant access
        this.domainResolver.validateTenantAccess(resolution.tenant);

        tenant = resolution.tenant;
        tenantId = tenant.id;

        // Log resolution method for debugging
        this.logger.debug(
          `Tenant resolved by ${resolution.resolvedBy}: ${tenant.slug} (${tenantId}) for domain: ${domainHeader}`
        );

        // Attach domain resolution info to request for potential use by controllers
        req.domainResolution = {
          originalDomain: domainHeader,
          resolvedBy: resolution.resolvedBy,
          tenantDomain: resolution.domain,
        };
      }

      // Attach tenant information to request
      req.tenantId = tenantId;
      req.tenant = tenant;

      // Log successful resolution
      this.logger.log(`🏢 Request for tenant: ${tenant.slug} (${tenantId}) - ${req.method} ${req.path}`);

      // Optional: Log domain resolution for monitoring
      if (req.domainResolution) {
        this.logger.debug(`Domain resolution: ${req.domainResolution.originalDomain} -> ${tenant.slug} via ${req.domainResolution.resolvedBy}`);
      }

    } catch (error) {
      this.logger.error(`❌ Tenant middleware error: ${error.message}`, error.stack);

      // For development, provide more detailed error information
      if (process.env.NODE_ENV === 'development') {
        throw new BadRequestException(`Tenant resolution failed: ${error.message}`);
      }

      throw new BadRequestException('Unable to resolve tenant for this request');
    }

    next();
  }
}