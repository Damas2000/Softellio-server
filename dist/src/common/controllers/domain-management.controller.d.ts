import { DomainResolverService } from '../services/domain-resolver.service';
import { TenantDomain } from '@prisma/client';
declare class AddDomainDto {
    domain: string;
    isPrimary?: boolean;
    type?: 'custom' | 'subdomain';
}
declare class UpdateDomainDto {
    isPrimary?: boolean;
    isActive?: boolean;
}
declare class DomainHealthCheckDto {
    domain: string;
    isReachable: boolean;
    responseTime: number | null;
    statusCode: number | null;
    error: string | null;
    checkedAt: Date;
}
export declare class DomainManagementController {
    private domainResolver;
    constructor(domainResolver: DomainResolverService);
    getTenantDomains(tenantId: number): Promise<TenantDomain[]>;
    addCustomDomain(tenantId: number, addDomainDto: AddDomainDto): Promise<TenantDomain>;
    updateDomain(tenantId: number, domainId: number, updateDomainDto: UpdateDomainDto): Promise<TenantDomain>;
    removeDomain(tenantId: number, domainId: number): Promise<void>;
    checkDomainHealth(domainParam: string): Promise<DomainHealthCheckDto>;
    testDomainResolution(domain: string): Promise<{
        success: boolean;
        domain: string;
        tenant: {
            id: number;
            slug: string;
            name: string;
            status: string;
        };
        resolvedBy: "default" | "subdomain" | "custom_domain" | "fallback" | "portal_jwt";
        tenantDomain: {
            id: number;
            domain: string;
            type: string;
            isPrimary: boolean;
            isVerified: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        domain: string;
        error: any;
        tenant?: undefined;
        resolvedBy?: undefined;
        tenantDomain?: undefined;
    }>;
    verifyDomain(tenantId: number, domainId: number): Promise<{
        status: string;
        message: string;
        verificationToken?: string;
    }>;
    getNetlifyConfig(tenantId: number): Promise<{
        redirects: {
            from: string;
            to: string;
            status: number;
            headers: {
                'X-Tenant-Domain': string;
            };
        }[];
        headers: {
            for: string;
            values: {
                'X-Frame-Options': string;
                'X-Content-Type-Options': string;
                'Referrer-Policy': string;
            };
        }[];
    }>;
}
export {};
