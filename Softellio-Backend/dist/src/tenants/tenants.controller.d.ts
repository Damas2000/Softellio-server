import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateTenantWithDomainsDto } from './dto/create-tenant-with-domains.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ModuleName } from '@prisma/client';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(createTenantDto: CreateTenantDto): Promise<{
        status: string;
        name: string;
        id: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        slug: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        planKey: import(".prisma/client").$Enums.PlanKey;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
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
        status: string;
        name: string;
        id: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        slug: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        planKey: import(".prisma/client").$Enums.PlanKey;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
    }[]>;
    findOne(id: number): Promise<{
        status: string;
        name: string;
        id: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        slug: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        planKey: import(".prisma/client").$Enums.PlanKey;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
    }>;
    update(id: number, updateTenantDto: UpdateTenantDto): Promise<{
        status: string;
        name: string;
        id: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        slug: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        planKey: import(".prisma/client").$Enums.PlanKey;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
    }>;
    toggleActive(id: number): Promise<{
        status: string;
        name: string;
        id: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
        slug: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        planKey: import(".prisma/client").$Enums.PlanKey;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
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
