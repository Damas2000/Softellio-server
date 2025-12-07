import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Tenant, TenantDomain } from '@prisma/client';

export interface TenantResolutionResult {
  tenant: Tenant & { tenantDomains?: TenantDomain[] };
  domain: TenantDomain | null;
  resolvedBy: 'custom_domain' | 'subdomain' | 'default' | 'fallback';
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

    let result: TenantResolutionResult | null = null;

    // Step 1: Try custom domain lookup
    result = await this.resolveByCustomDomain(normalizedHost);
    if (result) {
      this.logger.debug(`Tenant resolved by custom domain: ${result.tenant.slug}`);
      return result;
    }

    // Step 2: Try Softellio subdomain lookup
    result = await this.resolveBySubdomain(normalizedHost);
    if (result) {
      this.logger.debug(`Tenant resolved by subdomain: ${result.tenant.slug}`);
      return result;
    }

    // Step 3: Try default tenant (Softellio main site)
    result = await this.resolveDefaultTenant(normalizedHost);
    if (result) {
      this.logger.debug(`Tenant resolved as default: ${result.tenant.slug}`);
      return result;
    }

    // Step 4: Fallback tenant (configurable)
    result = await this.resolveFallbackTenant();
    if (result) {
      this.logger.warn(`Using fallback tenant for domain: ${normalizedHost}`);
      return result;
    }

    throw new NotFoundException(`No tenant found for domain: ${normalizedHost}`);
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
   * Step 1: Custom domain resolution
   * Looks for exact match in TenantDomain table
   */
  private async resolveByCustomDomain(domain: string): Promise<TenantResolutionResult | null> {
    try {
      // Try exact match first
      let tenantDomain = await this.prisma.tenantDomain.findFirst({
        where: {
          domain: domain,
          isActive: true,
          tenant: {
            isActive: true,
            status: { not: 'SUSPENDED' }
          }
        },
        include: {
          tenant: {
            include: {
              tenantDomains: true
            }
          }
        }
      });

      if (tenantDomain) {
        return {
          tenant: tenantDomain.tenant,
          domain: tenantDomain,
          resolvedBy: 'custom_domain'
        };
      }

      // Try with www. prefix if original doesn't have it
      if (!domain.startsWith('www.')) {
        tenantDomain = await this.prisma.tenantDomain.findFirst({
          where: {
            domain: `www.${domain}`,
            isActive: true,
            tenant: {
              isActive: true,
              status: { not: 'SUSPENDED' }
            }
          },
          include: {
            tenant: {
              include: {
                tenantDomains: true
              }
            }
          }
        });

        if (tenantDomain) {
          return {
            tenant: tenantDomain.tenant,
            domain: tenantDomain,
            resolvedBy: 'custom_domain'
          };
        }
      }

      // Try without www. prefix if original has it
      if (domain.startsWith('www.')) {
        const domainWithoutWww = domain.substring(4);
        tenantDomain = await this.prisma.tenantDomain.findFirst({
          where: {
            domain: domainWithoutWww,
            isActive: true,
            tenant: {
              isActive: true,
              status: { not: 'SUSPENDED' }
            }
          },
          include: {
            tenant: {
              include: {
                tenantDomains: true
              }
            }
          }
        });

        if (tenantDomain) {
          return {
            tenant: tenantDomain.tenant,
            domain: tenantDomain,
            resolvedBy: 'custom_domain'
          };
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Error in custom domain resolution:', error);
      return null;
    }
  }

  /**
   * Step 2: Softellio subdomain resolution
   * Extracts subdomain from *.softellio.com pattern
   */
  private async resolveBySubdomain(domain: string): Promise<TenantResolutionResult | null> {
    try {
      // Check if domain matches *.softellio.com pattern
      const softellioPattern = /^([^.]+)\.softellio\.com$/;
      const match = domain.match(softellioPattern);

      if (!match) {
        return null;
      }

      const subdomain = match[1];

      // Skip reserved subdomains
      const reservedSubdomains = ['www', 'api', 'admin', 'connect', 'app', 'dashboard', 'mail'];
      if (reservedSubdomains.includes(subdomain)) {
        return null;
      }

      const tenant = await this.prisma.tenant.findFirst({
        where: {
          slug: subdomain,
          isActive: true,
          status: { not: 'SUSPENDED' }
        },
        include: {
          tenantDomains: true
        }
      });

      if (!tenant) {
        return null;
      }

      // Find or create subdomain entry in TenantDomain
      let tenantDomain = await this.prisma.tenantDomain.findFirst({
        where: {
          tenantId: tenant.id,
          domain: domain,
          type: 'subdomain'
        }
      });

      if (!tenantDomain) {
        // Auto-create subdomain entry
        try {
          tenantDomain = await this.prisma.tenantDomain.create({
            data: {
              tenantId: tenant.id,
              domain: domain,
              type: 'subdomain',
              isPrimary: false,
              isActive: true,
              isVerified: true,
              verifiedAt: new Date()
            }
          });
        } catch (createError) {
          this.logger.warn(`Could not auto-create subdomain entry: ${createError.message}`);
        }
      }

      return {
        tenant,
        domain: tenantDomain,
        resolvedBy: 'subdomain'
      };
    } catch (error) {
      this.logger.error('Error in subdomain resolution:', error);
      return null;
    }
  }

  /**
   * Step 3: Default tenant resolution (Softellio main site)
   */
  private async resolveDefaultTenant(domain: string): Promise<TenantResolutionResult | null> {
    try {
      const defaultDomains = ['softellio.com', 'www.softellio.com'];

      if (!defaultDomains.includes(domain)) {
        return null;
      }

      // Look for default tenant (configurable via environment)
      const defaultTenantSlug = process.env.DEFAULT_TENANT_SLUG || 'softellio';

      const tenant = await this.prisma.tenant.findFirst({
        where: {
          slug: defaultTenantSlug,
          isActive: true,
          status: { not: 'SUSPENDED' }
        },
        include: {
          tenantDomains: true
        }
      });

      if (!tenant) {
        this.logger.error(`Default tenant '${defaultTenantSlug}' not found`);
        return null;
      }

      return {
        tenant,
        domain: null,
        resolvedBy: 'default'
      };
    } catch (error) {
      this.logger.error('Error in default tenant resolution:', error);
      return null;
    }
  }

  /**
   * Step 4: Fallback tenant resolution
   * Used when no other resolution method works
   */
  private async resolveFallbackTenant(): Promise<TenantResolutionResult | null> {
    try {
      const fallbackTenantSlug = process.env.FALLBACK_TENANT_SLUG;

      if (!fallbackTenantSlug) {
        return null;
      }

      const tenant = await this.prisma.tenant.findFirst({
        where: {
          slug: fallbackTenantSlug,
          isActive: true,
          status: { not: 'SUSPENDED' }
        },
        include: {
          tenantDomains: true
        }
      });

      if (!tenant) {
        this.logger.error(`Fallback tenant '${fallbackTenantSlug}' not found`);
        return null;
      }

      return {
        tenant,
        domain: null,
        resolvedBy: 'fallback'
      };
    } catch (error) {
      this.logger.error('Error in fallback tenant resolution:', error);
      return null;
    }
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
      throw new ForbiddenException('Domain is already registered to another tenant');
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
        type: 'custom',
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