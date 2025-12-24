import { PrismaService } from '../../config/prisma.service';
import { Tenant, TenantDomain } from '@prisma/client';
export interface TenantResolutionResult {
    tenant: Tenant & {
        tenantDomains?: TenantDomain[];
    };
    domain: TenantDomain | null;
    resolvedBy: 'custom_domain' | 'subdomain' | 'default' | 'fallback' | 'portal_jwt';
}
export declare class DomainResolverService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    resolveTenantFromDomain(hostHeader: string): Promise<TenantResolutionResult>;
    private findTenantByDomain;
    private isReservedDomain;
    private normalizeHost;
    validateTenantAccess(tenant: Tenant): void;
    getTenantDomains(tenantId: number): Promise<TenantDomain[]>;
    addCustomDomain(tenantId: number, domain: string, isPrimary?: boolean): Promise<TenantDomain>;
    private generateVerificationToken;
    updateDomain(tenantId: number, domainId: number, updateData: {
        isPrimary?: boolean;
        isActive?: boolean;
    }): Promise<TenantDomain>;
    removeDomain(tenantId: number, domainId: number): Promise<void>;
    checkDomainHealth(domain: string): Promise<{
        domain: string;
        isReachable: boolean;
        responseTime: number | null;
        statusCode: number | null;
        error: string | null;
    }>;
}
