import { Request } from 'express';
import { User, Tenant, TenantDomain } from '@prisma/client';
export interface DomainResolutionInfo {
    originalDomain: string;
    resolvedBy: 'custom_domain' | 'subdomain' | 'default' | 'fallback' | 'portal_jwt';
    tenantDomain: TenantDomain | null;
}
export interface RequestWithTenant extends Request {
    tenantId?: number | null;
    tenant?: Tenant | null;
    user?: User;
    domainResolution?: DomainResolutionInfo;
}
