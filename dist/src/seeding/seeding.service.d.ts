import { PrismaService } from '../config/prisma.service';
export declare class SeedingService {
    private prisma;
    constructor(prisma: PrismaService);
    seedAll(): Promise<void>;
    private createSuperAdmin;
    private createDemoTenant;
    private createTenantAdmin;
    private createDemoContent;
    private createDemoSiteSettings;
    private createDemoPages;
    private createDemoBlogCategories;
    private createDemoBlogPosts;
    private createDemoMenu;
    clearDatabase(): Promise<void>;
}
