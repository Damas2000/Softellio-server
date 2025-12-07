import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ModuleName } from '@prisma/client';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(createTenantDto: CreateTenantDto): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
    }>;
    update(id: number, updateTenantDto: UpdateTenantDto): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
    }>;
    toggleActive(id: number): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        domain: string;
        defaultLanguage: string;
        availableLanguages: string[];
        theme: string | null;
        primaryColor: string | null;
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
