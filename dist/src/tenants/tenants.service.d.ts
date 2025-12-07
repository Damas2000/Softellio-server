import { PrismaService } from '../config/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant, ModuleName } from '@prisma/client';
export declare class TenantsService {
    private prisma;
    private authService;
    constructor(prisma: PrismaService, authService: AuthService);
    create(createTenantDto: CreateTenantDto): Promise<Tenant>;
    findAll(): Promise<Tenant[]>;
    findOne(id: number): Promise<Tenant>;
    update(id: number, updateTenantDto: UpdateTenantDto): Promise<Tenant>;
    toggleActive(id: number): Promise<Tenant>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getFeatures(id: number): Promise<{
        tenantId: number;
        module: import(".prisma/client").$Enums.ModuleName;
        enabled: boolean;
    }[]>;
    updateFeature(id: number, module: ModuleName, enabled: boolean): Promise<{
        tenantId: number;
        module: import(".prisma/client").$Enums.ModuleName;
        enabled: boolean;
    }>;
    generateImpersonationToken(tenantId: number, superAdminUserId: number): Promise<{
        accessToken: string;
    }>;
}
