import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Tenant, TenantDomain } from '@prisma/client';

export interface TenantResolutionResult {
  tenant: Tenant & { tenantDomains?: TenantDomain[] };
  domain: TenantDomain | null;
  resolvedBy: 'custom_domain' | 'subdomain' | 'default' | 'fallback' | 'portal_jwt';
}

@Injectable()
export class DomainResolverService {
  private readonly logger = new Logger(DomainResolverService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Netlify + Railway Domain Resolution
   * Resolves tenant from X-Tenant-Domain header following the architecture:
   * 1. Custom domain lookup (www.reisinsaat.com)
   * 2. Softellio subdomain lookup (reisinsaat.softellio.com)
   * 3. Default tenant (softellio.com)
   */
  async resolveTenantFromDomain(hostHeader: string): Promise<TenantResolutionResult> {
    if (!hostHeader) {
      throw new NotFoundException('Domain header is required');
    }

    const normalizedHost = this.normalizeHost(hostHeader);
    this.logger.debug(`Resolving tenant for domain: ${normalizedHost}`);

    // Check for reserved domains that should never be treated as tenant domains
    if (this.isReservedDomain(normalizedHost)) {
      throw new NotFoundException(`Reserved domain cannot be used for tenant resolution: ${normalizedHost}`);
    }

    // Use same 3-step logic as TenantsService.findByDomain()
    const tenant = await this.findTenantByDomain(normalizedHost);

    if (!tenant) {
      throw new NotFoundException(`No tenant found for domain: ${normalizedHost}`);
    }

    this.logger.debug(`Tenant resolved: ${tenant.slug} (${tenant.id})`);

    // Find associated tenant domain if exists
    let tenantDomain: TenantDomain | null = null;
    try {
      tenantDomain = await this.prisma.tenantDomain.findFirst({
        where: {
          tenantId: tenant.id,
          domain: normalizedHost,
          isActive: true
        }
      });
    } catch (error) {
      this.logger.warn(`Could not find TenantDomain entry for ${normalizedHost}: ${error.message}`);
    }

    return {
      tenant: tenant,
      domain: tenantDomain,
      resolvedBy: tenantDomain ? 'custom_domain' : 'subdomain'
    };
  }

  /**
   * Find tenant by domain using same 3-step logic as TenantsService.findByDomain()
   */
  private async findTenantByDomain(host: string): Promise<Tenant | null> {
    // Remove protocol and port if present (already done by normalizeHost, but being explicit)
    const cleanHost = host.replace(/^https?:\/\//, '').split(':')[0];

    const shouldLogDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_TENANT_RESOLUTION === 'true';

    if (shouldLogDebug) {
      this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 1: Looking for tenant.domain = "${cleanHost}"`);
    }

    // Step 1: Try to find by main domain field
    let tenant = await this.prisma.tenant.findFirst({
      where: {
        domain: cleanHost,
        isActive: true,
        status: 'active'
      }
    });

    if (shouldLogDebug) {
      this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 1 result: ${tenant ? `Found tenant ${tenant.slug} (${tenant.id})` : 'No tenant found'}`);
    }

    // Step 2: If not found, search in TenantDomain table
    if (!tenant) {
      if (shouldLogDebug) {
        this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 2: Looking for TenantDomain record for "${cleanHost}"`);
      }

      const tenantDomain = await this.prisma.tenantDomain.findFirst({
        where: {
          domain: cleanHost,
          isActive: true,
          tenant: {
            isActive: true,
            status: 'active'
          }
        },
        include: {
          tenant: true
        }
      });

      if (tenantDomain) {
        tenant = tenantDomain.tenant;
        if (shouldLogDebug) {
          this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 2 result: Found tenant ${tenant.slug} (${tenant.id}) via TenantDomain record`);
        }
      } else if (shouldLogDebug) {
        this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 2 result: No TenantDomain record found`);
      }
    }

    // Step 3: If still not found, try to extract slug from subdomain
    if (!tenant && cleanHost.includes('.softellio.com')) {
      const subdomain = cleanHost.replace('.softellio.com', '');
      const slug = subdomain.replace(/panel$/, ''); // Remove 'panel' suffix for admin domains

      if (shouldLogDebug) {
        this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 3: Extracting slug from "${cleanHost}" -> subdomain: "${subdomain}" -> slug: "${slug}"`);
      }

      tenant = await this.prisma.tenant.findFirst({
        where: {
          slug: slug,
          isActive: true,
          status: 'active'
        }
      });

      if (shouldLogDebug) {
        this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 3 result: ${tenant ? `Found tenant ${tenant.slug} (${tenant.id}) by slug lookup` : 'No tenant found by slug'}`);
      }
    }

    if (shouldLogDebug) {
      this.logger.debug(`🔍 [DOMAIN RESOLVER] Final result for "${cleanHost}": ${tenant ? `${tenant.slug} (${tenant.id})` : 'NOT FOUND'}`);
    }

    return tenant;
  }

  /**
   * Check if domain is reserved and should never be used for tenant resolution
   */
  private isReservedDomain(domain: string): boolean {
    const reservedDomains = [
      'platform.softellio.com',
      'portal.softellio.com',
      'localhost',
      'api.softellio.com',
      'admin.softellio.com',
      'connect.softellio.com',
      'app.softellio.com',
      'dashboard.softellio.com',
      'mail.softellio.com'
    ];

    return reservedDomains.includes(domain);
  }

  /**
   * Normalize domain following Netlify + Railway architecture rules
   * - Convert to lowercase
   * - Remove port numbers
   * - Optionally remove www. prefix based on configuration
   */
  private normalizeHost(host: string): string {
    if (!host) return '';

    let normalized = host.toLowerCase().trim();

    // Remove port number (localhost:3000 -> localhost)
    if (normalized.includes(':')) {
      normalized = normalized.split(':')[0];
    }

    // Remove trailing dots
    normalized = normalized.replace(/\.+$/, '');

    return normalized;
  }


  /**
   * Validate tenant access permissions
   */
  validateTenantAccess(tenant: Tenant): void {
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!tenant.isActive) {
      throw new ForbiddenException('Tenant is inactive');
    }

    if (tenant.status === 'SUSPENDED') {
      throw new ForbiddenException('Tenant account has been suspended');
    }

    if (tenant.status === 'TRIAL_EXPIRED') {
      throw new ForbiddenException('Tenant trial period has expired');
    }
  }

  /**
   * Get all domains for a tenant
   */
  async getTenantDomains(tenantId: number): Promise<TenantDomain[]> {
    return this.prisma.tenantDomain.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Add custom domain to tenant
   */
  async addCustomDomain(tenantId: number, domain: string, isPrimary: boolean = false): Promise<TenantDomain> {
    const normalizedDomain = this.normalizeHost(domain);

    // Check if domain is already taken
    const existingDomain = await this.prisma.tenantDomain.findFirst({
      where: {
        domain: normalizedDomain
      }
    });

    if (existingDomain) {
      if (existingDomain.tenantId === tenantId) {
        throw new ConflictException('Domain is already registered to this tenant');
      } else {
        throw new ConflictException('Domain is already registered to another tenant');
      }
    }

    // If setting as primary, remove primary flag from other domains
    if (isPrimary) {
      await this.prisma.tenantDomain.updateMany({
        where: {
          tenantId,
          isPrimary: true
        },
        data: {
          isPrimary: false
        }
      });
    }

    return this.prisma.tenantDomain.create({
      data: {
        tenantId,
        domain: normalizedDomain,
        type: 'CUSTOM',
        isPrimary,
        isActive: true,
        isVerified: false,
        verificationToken: this.generateVerificationToken()
      }
    });
  }

  /**
   * Generate domain verification token
   */
  private generateVerificationToken(): string {
    return `softellio-verify-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Update domain settings
   */
  async updateDomain(tenantId: number, domainId: number, updateData: {
    isPrimary?: boolean;
    isActive?: boolean;
  }): Promise<TenantDomain> {
    // Check if domain exists and belongs to tenant
    const existingDomain = await this.prisma.tenantDomain.findFirst({
      where: {
        id: domainId,
        tenantId,
      }
    });

    if (!existingDomain) {
      throw new NotFoundException('Domain not found or does not belong to this tenant');
    }

    // If setting as primary, remove primary flag from other domains
    if (updateData.isPrimary === true) {
      await this.prisma.tenantDomain.updateMany({
        where: {
          tenantId,
          id: { not: domainId },
          isPrimary: true
        },
        data: {
          isPrimary: false
        }
      });
    }

    // Update the domain
    return this.prisma.tenantDomain.update({
      where: {
        id: domainId
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Remove domain from tenant
   */
  async removeDomain(tenantId: number, domainId: number): Promise<void> {
    // Check if domain exists and belongs to tenant
    const existingDomain = await this.prisma.tenantDomain.findFirst({
      where: {
        id: domainId,
        tenantId,
      }
    });

    if (!existingDomain) {
      throw new NotFoundException('Domain not found or does not belong to this tenant');
    }

    // Prevent deletion of the last domain if it's primary
    if (existingDomain.isPrimary) {
      const domainCount = await this.prisma.tenantDomain.count({
        where: {
          tenantId,
          isActive: true
        }
      });

      if (domainCount === 1) {
        throw new ConflictException('Cannot delete the last active domain. Please add another domain before removing this one.');
      }
    }

    // Soft delete by setting isActive to false
    await this.prisma.tenantDomain.update({
      where: {
        id: domainId
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Domain health check for monitoring
   */
  async checkDomainHealth(domain: string): Promise<{
    domain: string;
    isReachable: boolean;
    responseTime: number | null;
    statusCode: number | null;
    error: string | null;
  }> {
    const startTime = Date.now();

    try {
      // Simple HTTP check (in production, you might want more sophisticated checks)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Softellio-Domain-Health-Check'
        }
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      return {
        domain,
        isReachable: response.ok,
        responseTime,
        statusCode: response.status,
        error: null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        domain,
        isReachable: false,
        responseTime,
        statusCode: null,
        error: error.message
      };
    }
  }
}