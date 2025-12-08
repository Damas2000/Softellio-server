import { Request } from 'express';
import { User, Tenant, TenantDomain } from '@prisma/client';
export interface DomainResolutionInfo {
    originalDomain: string;
    resolvedBy: 'custom_domain' | 'subdomain' | 'default' | 'fallback';
    tenantDomain: TenantDomain | null;
}
export interface RequestWithTenant extends Request {
    tenantId?: number;
    tenant?: Tenant;
    user?: User;
    domainResolution?: DomainResolutionInfo;
}
