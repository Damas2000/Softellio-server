import { PrismaService } from '../../config/prisma.service';
import { Tenant, TenantDomain } from '@prisma/client';
export interface TenantResolutionResult {
    tenant: Tenant & {
        tenantDomains?: TenantDomain[];
    };
    domain: TenantDomain | null;
    resolvedBy: 'custom_domain' | 'subdomain' | 'default' | 'fallback';
}
export declare class DomainResolverService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    resolveTenantFromDomain(hostHeader: string): Promise<TenantResolutionResult>;
    private normalizeHost;
    private resolveByCustomDomain;
    private resolveBySubdomain;
    private resolveDefaultTenant;
    private resolveFallbackTenant;
    validateTenantAccess(tenant: Tenant): void;
    getTenantDomains(tenantId: number): Promise<TenantDomain[]>;
    addCustomDomain(tenantId: number, domain: string, isPrimary?: boolean): Promise<TenantDomain>;
    private generateVerificationToken;
    checkDomainHealth(domain: string): Promise<{
        domain: string;
        isReachable: boolean;
        responseTime: number | null;
        statusCode: number | null;
        error: string | null;
    }>;
}
