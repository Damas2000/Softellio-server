import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { TenantsService } from '../tenants/tenants.service';

export interface TenantResolutionResult {
  tenantId: number;
  tenant: any;
  resolvedBy: 'X-Tenant-Id' | 'X-Tenant-Host' | 'Host';
  requestId?: string;
}

export interface TenantResolutionContext {
  requestId: string;
  endpoint: string;
  headers: {
    'X-Tenant-Id'?: string;
    'X-Tenant-Host'?: string;
    'Host'?: string;
  };
}

@Injectable()
export class TenantResolutionService {
  private readonly logger = new Logger(TenantResolutionService.name);
  private requestCounter = 0;

  constructor(
    private readonly tenantsService: TenantsService
  ) {}

  /**
   * 🎯 ROBUST: Resolve tenant with proper priority and comprehensive logging
   */
  async resolveTenantForPublicRequest(
    request: Request,
    endpoint: string,
    tenantIdHeader?: string
  ): Promise<TenantResolutionResult> {
    const requestId = `pub_${Date.now()}_${++this.requestCounter}`;

    const context: TenantResolutionContext = {
      requestId,
      endpoint,
      headers: {
        'X-Tenant-Id': tenantIdHeader,
        'X-Tenant-Host': request?.headers?.['x-tenant-host'] as string,
        'Host': request?.headers?.host as string
      }
    };

    this.logger.log(`[TENANT_RESOLUTION] 🎯 START ${requestId} | ${endpoint}`, {
      requestId,
      endpoint,
      headers: context.headers,
      userAgent: request?.headers?.['user-agent']?.substring(0, 100) || 'unknown'
    });

    // Priority 1: X-Tenant-Id header (for development/testing)
    if (tenantIdHeader) {
      const tenantId = parseInt(tenantIdHeader, 10);
      if (!isNaN(tenantId)) {
        try {
          const tenant = await this.tenantsService.findOne(tenantId);
          if (tenant) {
            this.logger.log(`[TENANT_RESOLUTION] ✅ RESOLVED ${requestId} | X-Tenant-Id: ${tenantId} -> ${tenant.slug}`, {
              requestId,
              tenantId,
              tenantSlug: tenant.slug,
              resolvedBy: 'X-Tenant-Id'
            });

            return {
              tenantId,
              tenant,
              resolvedBy: 'X-Tenant-Id',
              requestId
            };
          }
        } catch (error) {
          this.logger.warn(`[TENANT_RESOLUTION] ⚠️  INVALID X-Tenant-Id: ${tenantId} | ${error.message}`, {
            requestId,
            tenantId,
            error: error.message
          });
        }
      }
    }

    // Priority 2: X-Tenant-Host header (PRIMARY for public sites)
    const tenantHost = context.headers['X-Tenant-Host'];
    if (tenantHost) {
      const normalizedHost = this.normalizeHost(tenantHost);
      try {
        const tenant = await this.tenantsService.findByDomain(normalizedHost);
        if (tenant) {
          this.logger.log(`[TENANT_RESOLUTION] ✅ RESOLVED ${requestId} | X-Tenant-Host: ${tenantHost} -> ${tenant.slug} (${tenant.id})`, {
            requestId,
            tenantHost,
            normalizedHost,
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
            resolvedBy: 'X-Tenant-Host'
          });

          return {
            tenantId: tenant.id,
            tenant,
            resolvedBy: 'X-Tenant-Host',
            requestId
          };
        } else {
          this.logger.warn(`[TENANT_RESOLUTION] ❌ NOT_FOUND X-Tenant-Host: ${tenantHost} (normalized: ${normalizedHost})`, {
            requestId,
            tenantHost,
            normalizedHost
          });
        }
      } catch (error) {
        this.logger.error(`[TENANT_RESOLUTION] ❌ ERROR X-Tenant-Host: ${tenantHost} | ${error.message}`, {
          requestId,
          tenantHost,
          error: error.message
        });
      }
    }

    // Priority 3: Host header fallback
    const host = context.headers['Host'];
    if (host) {
      const normalizedHost = this.normalizeHost(host);
      try {
        const tenant = await this.tenantsService.findByDomain(normalizedHost);
        if (tenant) {
          this.logger.log(`[TENANT_RESOLUTION] ✅ RESOLVED ${requestId} | Host: ${host} -> ${tenant.slug} (${tenant.id})`, {
            requestId,
            host,
            normalizedHost,
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
            resolvedBy: 'Host'
          });

          return {
            tenantId: tenant.id,
            tenant,
            resolvedBy: 'Host',
            requestId
          };
        } else {
          this.logger.warn(`[TENANT_RESOLUTION] ❌ NOT_FOUND Host: ${host} (normalized: ${normalizedHost})`, {
            requestId,
            host,
            normalizedHost
          });
        }
      } catch (error) {
        this.logger.error(`[TENANT_RESOLUTION] ❌ ERROR Host: ${host} | ${error.message}`, {
          requestId,
          host,
          error: error.message
        });
      }
    }

    // No resolution possible
    this.logger.error(`[TENANT_RESOLUTION] ❌ FAILED ${requestId} | No valid tenant found`, {
      requestId,
      endpoint,
      headers: context.headers,
      availableHeaders: Object.keys(request?.headers || {})
    });

    throw new NotFoundException({
      message: 'Tenant not found. Please provide valid X-Tenant-Host or Host header.',
      code: 'TENANT_NOT_FOUND',
      context: {
        requestId,
        endpoint,
        availableHeaders: ['X-Tenant-Id', 'X-Tenant-Host', 'Host'],
        providedHeaders: context.headers
      }
    });
  }

  /**
   * 🧹 Normalize host: lowercase, remove port, handle www
   */
  private normalizeHost(host: string): string {
    if (!host) return host;

    let normalized = host.toLowerCase().trim();

    // Remove port if present
    if (normalized.includes(':')) {
      normalized = normalized.split(':')[0];
    }

    // Handle www prefix (keep it for now, tenant domains might include it)
    // If needed, we could add logic to try both with/without www

    return normalized;
  }

  /**
   * 🔍 Quick tenant lookup for debug purposes
   */
  async debugTenantInfo(host?: string, tenantId?: string): Promise<any> {
    const result = {
      input: { host, tenantId },
      normalizedHost: host ? this.normalizeHost(host) : null,
      found: null,
      error: null
    };

    try {
      if (tenantId) {
        const id = parseInt(tenantId, 10);
        if (!isNaN(id)) {
          result.found = await this.tenantsService.findOne(id);
        }
      } else if (host) {
        const normalizedHost = this.normalizeHost(host);
        result.found = await this.tenantsService.findByDomain(normalizedHost);
      }
    } catch (error) {
      result.error = error.message;
    }

    return result;
  }
}