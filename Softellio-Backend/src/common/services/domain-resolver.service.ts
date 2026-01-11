import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Tenant, TenantDomain } from '@prisma/client';

export interface TenantResolutionResult {
  tenant: Tenant & { tenantDomains?: TenantDomain[] };
  domain: TenantDomain | null;
  resolvedBy: 'TenantDomain' | 'Direct' | 'Slug' | 'portal_jwt';
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
      throw new NotFoundException('Domain header is required for tenant resolution');
    }

    const normalizedHost = this.normalizeHost(hostHeader);
    this.logger.debug(`Resolving tenant for domain: ${normalizedHost}`);

    // Check for reserved domains that should never be treated as tenant domains
    if (this.isReservedDomain(normalizedHost)) {
      throw new NotFoundException(`Reserved domain cannot be used for tenant resolution: ${normalizedHost}`);
    }

    // PRODUCTION-CORRECT: Use TenantDomain-first strategy
    const tenant = await this.findTenantByDomain(normalizedHost);

    if (!tenant) {
      // ENHANCED ERROR: Provide actionable guidance for production
      const shouldLogDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_TENANT_RESOLUTION === 'true';

      let errorMessage = `No active tenant found for domain: ${normalizedHost}`;

      if (shouldLogDebug || process.env.NODE_ENV !== 'production') {
        errorMessage += '\n\nTROUBLESHOOTING:\n';
        errorMessage += '1. Ensure TenantDomain record exists for this domain\n';
        errorMessage += '2. Check tenant status is "active" and isActive=true\n';
        errorMessage += '3. For demo.softellio.com: run npx ts-node src/seeding/production-tenant-resolution-fix.ts\n';
        errorMessage += '4. Enable DEBUG_TENANT_RESOLUTION=true for detailed logs';

        if (normalizedHost.includes('.softellio.com')) {
          const subdomain = normalizedHost.replace('.softellio.com', '');
          errorMessage += `\n5. Verify tenant exists with slug="${subdomain}"`;
        }
      }

      throw new NotFoundException(errorMessage);
    }

    this.logger.debug(`Tenant resolved: ${tenant.slug} (${tenant.id})`);

    // Find associated tenant domain if exists
    let tenantDomain: TenantDomain | null = null;
    let resolvedBy = 'Direct'; // Default assumption

    try {
      tenantDomain = await this.prisma.tenantDomain.findFirst({
        where: {
          tenantId: tenant.id,
          domain: normalizedHost,
          isActive: true
        }
      });

      // Update resolvedBy based on what we found
      if (tenantDomain) {
        resolvedBy = 'TenantDomain';
      }
    } catch (error) {
      this.logger.warn(`Could not find TenantDomain entry for ${normalizedHost}: ${error.message}`);
    }

    return {
      tenant: tenant,
      domain: tenantDomain,
      resolvedBy: resolvedBy as 'TenantDomain' | 'Direct' | 'Slug'
    };
  }

  /**
   * PRODUCTION-CORRECT: Find tenant by domain with TenantDomain-first strategy
   *
   * Priority Order (CHANGED for production reliability):
   * 1. TenantDomain table lookup (primary, supports custom domains)
   * 2. Direct tenant.domain lookup (legacy compatibility)
   * 3. Subdomain slug extraction (fallback for dev/legacy)
   */
  private async findTenantByDomain(host: string): Promise<Tenant | null> {
    // Remove protocol and port if present (already done by normalizeHost, but being explicit)
    const cleanHost = host.replace(/^https?:\/\//, '').split(':')[0];

    const shouldLogDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_TENANT_RESOLUTION === 'true';

    if (shouldLogDebug) {
      this.logger.debug(`🔍 [DOMAIN RESOLVER] Production-correct resolution for: "${cleanHost}"`);
    }

    let tenant: Tenant | null = null;
    let resolvedBy = '';

    // STEP 1 (NEW PRIMARY): TenantDomain table lookup - most reliable for production
    if (shouldLogDebug) {
      this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 1: TenantDomain lookup for "${cleanHost}"`);
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
      resolvedBy = 'TenantDomain';

      if (shouldLogDebug) {
        this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 1 SUCCESS: Found tenant ${tenant.slug} (${tenant.id}) via TenantDomain record (isPrimary: ${tenantDomain.isPrimary})`);
      }
    } else {
      if (shouldLogDebug) {
        this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 1: No TenantDomain record found`);
      }
    }

    // STEP 2 (LEGACY): Direct tenant.domain lookup
    if (!tenant) {
      if (shouldLogDebug) {
        this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 2: Direct tenant.domain lookup for "${cleanHost}"`);
      }

      tenant = await this.prisma.tenant.findFirst({
        where: {
          domain: cleanHost,
          isActive: true,
          status: 'active'
        }
      });

      if (tenant) {
        resolvedBy = 'Direct';
        if (shouldLogDebug) {
          this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 2 SUCCESS: Found tenant ${tenant.slug} (${tenant.id}) via direct domain field`);
        }
      } else {
        if (shouldLogDebug) {
          this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 2: No direct tenant.domain match`);
        }
      }
    }

    // STEP 3 (FALLBACK): Subdomain slug extraction
    if (!tenant && cleanHost.includes('.softellio.com')) {
      const subdomain = cleanHost.replace('.softellio.com', '');
      const slug = subdomain.replace(/panel$/, ''); // Remove 'panel' suffix for admin domains

      if (shouldLogDebug) {
        this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 3: Slug extraction from "${cleanHost}" -> subdomain: "${subdomain}" -> slug: "${slug}"`);
      }

      // Additional validation: only allow valid slug format
      if (slug && slug.length > 0 && /^[a-zA-Z0-9-_]+$/.test(slug)) {
        tenant = await this.prisma.tenant.findFirst({
          where: {
            slug: slug,
            isActive: true,
            status: 'active'
          }
        });

        if (tenant) {
          resolvedBy = 'Slug';
          if (shouldLogDebug) {
            this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 3 SUCCESS: Found tenant ${tenant.slug} (${tenant.id}) by slug lookup`);
          }
        } else {
          if (shouldLogDebug) {
            this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 3: No tenant found for slug "${slug}"`);
          }
        }
      } else {
        if (shouldLogDebug) {
          this.logger.debug(`🔍 [DOMAIN RESOLVER] Step 3: Invalid slug format "${slug}", skipping lookup`);
        }
      }
    }

    // Final result with production insights
    if (shouldLogDebug) {
      this.logger.debug(`🔍 [DOMAIN RESOLVER] FINAL RESULT for "${cleanHost}": ${tenant ? `${tenant.slug} (${tenant.id}) via ${resolvedBy}` : 'NOT FOUND - check TenantDomain table'}`);
    }

    // Additional production debugging: suggest TenantDomain record creation
    if (!tenant && shouldLogDebug) {
      this.logger.warn(`🚨 [DOMAIN RESOLVER] PRODUCTION TIP: Create TenantDomain record for "${cleanHost}" to ensure reliable resolution`);
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
   * Validate tenant access permissions with enhanced error messages
   */
  validateTenantAccess(tenant: Tenant): void {
    if (!tenant) {
      throw new NotFoundException('Tenant not found during access validation');
    }

    if (!tenant.isActive) {
      throw new ForbiddenException(`Tenant "${tenant.slug}" is marked as inactive. Contact system administrator to reactivate.`);
    }

    if (tenant.status === 'SUSPENDED') {
      throw new ForbiddenException(`Tenant "${tenant.slug}" account has been suspended. Contact support for assistance.`);
    }

    if (tenant.status === 'TRIAL_EXPIRED') {
      throw new ForbiddenException(`Tenant "${tenant.slug}" trial period has expired. Please upgrade your subscription.`);
    }

    if (tenant.status !== 'active') {
      throw new ForbiddenException(`Tenant "${tenant.slug}" status is "${tenant.status}". Expected "active" status for access.`);
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
   * PRODUCTION GUARDRAIL: Ensure TenantDomain record exists for a tenant's primary domain
   * Call this whenever creating or updating tenant domains to ensure reliable resolution
   */
  async ensureTenantDomainRecord(tenantId: number, domain: string, isPrimary: boolean = true): Promise<TenantDomain> {
    const normalizedDomain = this.normalizeHost(domain);

    // Check if record already exists
    const existing = await this.prisma.tenantDomain.findFirst({
      where: {
        tenantId,
        domain: normalizedDomain
      }
    });

    if (existing) {
      // Update if needed to ensure it's active and properly configured
      if (!existing.isActive || (isPrimary && !existing.isPrimary)) {
        return await this.prisma.tenantDomain.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            isPrimary,
            isVerified: true,
            verifiedAt: new Date(),
            sslStatus: 'ACTIVE'
          }
        });
      }
      return existing;
    }

    // Create new record
    return await this.prisma.tenantDomain.create({
      data: {
        tenantId,
        domain: normalizedDomain,
        type: normalizedDomain.includes('.softellio.com') ? 'SYSTEM' : 'CUSTOM',
        isPrimary,
        isActive: true,
        isVerified: true,
        verificationToken: `auto-created-${Date.now()}`,
        verifiedAt: new Date(),
        sslStatus: 'ACTIVE'
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