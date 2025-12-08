import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateTenantWithDomainsDto } from './dto/create-tenant-with-domains.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ModuleName } from '@prisma/client';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(createTenantDto: CreateTenantDto): Promise<{
        name: string;
        id: number;
        slug: string;
        domain: string;
        status: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createWithDomains(createTenantDto: CreateTenantWithDomainsDto): Promise<{
        tenant: import(".prisma/client").Tenant;
        domains: {
            publicDomain: string;
            adminDomain: string;
        };
        message: string;
    }>;
    findAll(): Promise<{
        name: string;
        id: number;
        slug: string;
        domain: string;
        status: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        id: number;
        slug: string;
        domain: string;
        status: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateTenantDto: UpdateTenantDto): Promise<{
        name: string;
        id: number;
        slug: string;
        domain: string;
        status: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleActive(id: number): Promise<{
        name: string;
        id: number;
        slug: string;
        domain: string;
        status: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getFeatures(id: number): Promise<{
        tenantId: number;
        module: import(".prisma/client").$Enums.ModuleName;
        enabled: boolean;
    }[]>;
    updateFeature(id: number, module: ModuleName, body: {
        enabled: boolean;
    }): Promise<{
        tenantId: number;
        module: import(".prisma/client").$Enums.ModuleName;
        enabled: boolean;
    }>;
    impersonate(id: number, user: any): Promise<{
        accessToken: string;
    }>;
}
