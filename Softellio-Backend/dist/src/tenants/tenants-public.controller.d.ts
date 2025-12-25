import { TenantsService } from './tenants.service';
export declare class TenantsPublicController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getByDomain(host: string): Promise<{
        tenantId: number;
        companyName: string;
        slug: string;
        plan: string;
        siteDomain: string;
        panelDomain: string;
        templateKey: string;
        status: string;
    }>;
}
