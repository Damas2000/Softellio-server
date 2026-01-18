import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { SiteConfigService } from './site-config.service';

export interface PublicRequestLogContext {
  endpoint: string;
  method: string;
  host?: string;
  tenantHost?: string;
  language?: string;
  pageKey?: string;
  slug?: string;
  userAgent?: string;
  ip?: string;
  startTime: number;
}

export interface PublicRequestLogSummary {
  requestId: string;
  endpoint: string;
  method: string;
  duration: number;
  host: {
    header: string | null;
    tenantHost: string | null;
    resolved: boolean;
  };
  tenant: {
    id: number | null;
    name: string | null;
    slug: string | null;
    domain: string | null;
    status: string | null;
  };
  template: {
    key: string | null;
    name: string | null;
    version: string | null;
    supportedSections: string[];
  };
  counts: {
    totalPages: number;
    publishedPages: number;
    totalSections: number;
    activeSections: number;
  };
  performance: {
    dbQueries: number;
    cacheHits: number;
    cacheMisses: number;
  };
  language: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

@Injectable()
export class PublicRequestLoggerService {
  private readonly logger = new Logger(PublicRequestLoggerService.name);
  private requestCounter = 0;

  constructor(
    private prisma: PrismaService,
    private tenantsService: TenantsService,
    private siteConfigService: SiteConfigService
  ) {}

  /**
   * 🚀 START: Begin comprehensive logging for public request
   */
  async logRequestStart(context: PublicRequestLogContext): Promise<string> {
    const requestId = `req_${Date.now()}_${++this.requestCounter}`;

    this.logger.log(`[PUBLIC_REQUEST_START] 🚀 ${requestId} | ${context.method} ${context.endpoint}`, {
      requestId,
      endpoint: context.endpoint,
      method: context.method,
      host: context.host,
      tenantHost: context.tenantHost,
      language: context.language,
      pageKey: context.pageKey,
      slug: context.slug,
      userAgent: context.userAgent?.substring(0, 100) || 'unknown',
      ip: context.ip || 'unknown'
    });

    return requestId;
  }

  /**
   * ✅ COMPLETE: Log comprehensive request completion with full metrics
   */
  async logRequestComplete(
    requestId: string,
    context: PublicRequestLogContext,
    success: boolean = true,
    error?: string
  ): Promise<PublicRequestLogSummary> {
    const duration = Date.now() - context.startTime;

    // Gather comprehensive data
    const summary: PublicRequestLogSummary = {
      requestId,
      endpoint: context.endpoint,
      method: context.method,
      duration,
      host: {
        header: context.host || null,
        tenantHost: context.tenantHost || null,
        resolved: false
      },
      tenant: {
        id: null,
        name: null,
        slug: null,
        domain: null,
        status: null
      },
      template: {
        key: null,
        name: null,
        version: null,
        supportedSections: []
      },
      counts: {
        totalPages: 0,
        publishedPages: 0,
        totalSections: 0,
        activeSections: 0
      },
      performance: {
        dbQueries: 0,
        cacheHits: 0,
        cacheMisses: 0
      },
      language: context.language || 'tr',
      timestamp: new Date().toISOString(),
      success,
      error
    };

    try {
      // Resolve tenant information
      const tenant = await this.resolveTenantFromContext(context);
      if (tenant) {
        summary.host.resolved = true;
        summary.tenant = {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          domain: tenant.domain,
          status: tenant.status || 'active'
        };

        // Get template information
        const templateInfo = await this.getTemplateInfo(tenant.id);
        if (templateInfo) {
          summary.template = templateInfo;
        }

        // Get comprehensive counts
        const counts = await this.getCounts(tenant.id, context.language || 'tr');
        summary.counts = counts;
      }

    } catch (logError) {
      this.logger.warn(`[PUBLIC_REQUEST_LOGGER] Failed to gather complete metrics: ${logError.message}`, {
        requestId,
        error: logError.message
      });
    }

    // Log the comprehensive summary
    const logLevel = success ? 'log' : 'error';
    const statusIcon = success ? '✅' : '❌';
    const errorSuffix = error ? ` | ERROR: ${error}` : '';

    this.logger[logLevel](`[PUBLIC_REQUEST_COMPLETE] ${statusIcon} ${requestId} | ` +
      `${summary.duration}ms | Host: ${summary.host.tenantHost || summary.host.header || 'none'} | ` +
      `Tenant: ${summary.tenant.slug || 'unresolved'} (${summary.tenant.id || 'N/A'}) | ` +
      `Template: ${summary.template.key || 'none'} | ` +
      `Pages: ${summary.counts.publishedPages}/${summary.counts.totalPages} | ` +
      `Sections: ${summary.counts.activeSections}/${summary.counts.totalSections}${errorSuffix}`,
      {
        requestId,
        summary
      });

    // Log performance warning if request is slow
    if (summary.duration > 1000) {
      this.logger.warn(`[PUBLIC_REQUEST_PERFORMANCE] 🐌 Slow request: ${requestId} took ${summary.duration}ms`, {
        requestId,
        endpoint: context.endpoint,
        duration: summary.duration,
        tenant: summary.tenant.slug,
        counts: summary.counts
      });
    }

    // Log template usage analytics
    if (summary.tenant.id && summary.template.key) {
      this.logger.log(`[PUBLIC_REQUEST_ANALYTICS] 📊 Template Usage: ${summary.template.key} | ` +
        `Tenant: ${summary.tenant.slug} | Endpoint: ${context.endpoint} | ` +
        `Lang: ${summary.language} | Duration: ${summary.duration}ms`, {
        requestId,
        analytics: {
          templateKey: summary.template.key,
          tenantId: summary.tenant.id,
          tenantSlug: summary.tenant.slug,
          endpoint: context.endpoint,
          language: summary.language,
          duration: summary.duration
        }
      });
    }

    return summary;
  }

  /**
   * 🔍 Resolve tenant from request context
   */
  private async resolveTenantFromContext(context: PublicRequestLogContext): Promise<any | null> {
    // Try tenant host first (X-Tenant-Host header)
    if (context.tenantHost) {
      try {
        const tenant = await this.tenantsService.findByDomain(context.tenantHost);
        if (tenant) {
          this.logger.debug(`[PUBLIC_REQUEST_LOGGER] Tenant resolved via X-Tenant-Host: ${context.tenantHost} -> ${tenant.slug}`);
          return tenant;
        }
      } catch (error) {
        this.logger.debug(`[PUBLIC_REQUEST_LOGGER] Failed to resolve tenant via X-Tenant-Host: ${context.tenantHost}`, error);
      }
    }

    // Try regular host header
    if (context.host) {
      try {
        const tenant = await this.tenantsService.findByDomain(context.host);
        if (tenant) {
          this.logger.debug(`[PUBLIC_REQUEST_LOGGER] Tenant resolved via Host: ${context.host} -> ${tenant.slug}`);
          return tenant;
        }
      } catch (error) {
        this.logger.debug(`[PUBLIC_REQUEST_LOGGER] Failed to resolve tenant via Host: ${context.host}`, error);
      }
    }

    this.logger.warn(`[PUBLIC_REQUEST_LOGGER] Unable to resolve tenant`, {
      host: context.host,
      tenantHost: context.tenantHost
    });

    return null;
  }

  /**
   * 📋 Get template information
   */
  private async getTemplateInfo(tenantId: number): Promise<any | null> {
    try {
      const siteConfig = await this.siteConfigService.getForTenant(tenantId);
      if (!siteConfig) {
        return null;
      }

      const template = await this.prisma.template.findUnique({
        where: { key: siteConfig.templateKey },
        select: {
          key: true,
          name: true,
          version: true,
          supportedSections: true
        }
      });

      return template ? {
        key: template.key,
        name: template.name,
        version: template.version,
        supportedSections: template.supportedSections || []
      } : null;

    } catch (error) {
      this.logger.debug(`[PUBLIC_REQUEST_LOGGER] Failed to get template info for tenant ${tenantId}:`, error);
      return null;
    }
  }

  /**
   * 📊 Get comprehensive counts
   */
  private async getCounts(tenantId: number, language: string): Promise<any> {
    try {
      // Count pages
      const [totalPages, publishedPages] = await Promise.all([
        this.prisma.dynamicPage.count({
          where: { tenantId, language }
        }),
        this.prisma.dynamicPage.count({
          where: { tenantId, language, published: true }
        })
      ]);

      // Count sections via pageLayouts
      const pageLayouts = await this.prisma.pageLayout.findMany({
        where: { tenantId, language },
        select: { id: true }
      });

      const layoutIds = pageLayouts.map(layout => layout.id);

      const [totalSections, activeSections] = await Promise.all([
        this.prisma.pageSection.count({
          where: {
            layoutId: { in: layoutIds }
          }
        }),
        this.prisma.pageSection.count({
          where: {
            layoutId: { in: layoutIds },
            isEnabled: true
          }
        })
      ]);

      return {
        totalPages,
        publishedPages,
        totalSections,
        activeSections
      };

    } catch (error) {
      this.logger.debug(`[PUBLIC_REQUEST_LOGGER] Failed to get counts for tenant ${tenantId}:`, error);
      return {
        totalPages: 0,
        publishedPages: 0,
        totalSections: 0,
        activeSections: 0
      };
    }
  }

  /**
   * 🎯 Quick log for simple endpoint hits
   */
  async logQuickHit(endpoint: string, host?: string, tenantHost?: string): Promise<void> {
    const context: PublicRequestLogContext = {
      endpoint,
      method: 'GET',
      host,
      tenantHost,
      startTime: Date.now()
    };

    const requestId = await this.logRequestStart(context);
    await this.logRequestComplete(requestId, context, true);
  }

  /**
   * 📈 Get daily statistics (for monitoring/analytics)
   */
  async getDailyStats(date: string = new Date().toISOString().split('T')[0]): Promise<any> {
    // This could be expanded to store request logs in database for analytics
    // For now, just return current state
    return {
      date,
      message: 'Daily statistics would be available with persistent logging storage',
      currentTime: new Date().toISOString()
    };
  }
}