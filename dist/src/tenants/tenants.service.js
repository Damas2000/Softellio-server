"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
let TenantsService = class TenantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTenantDto) {
        const existingTenant = await this.prisma.tenant.findUnique({
            where: { domain: createTenantDto.domain },
        });
        if (existingTenant) {
            throw new common_1.ConflictException('Tenant with this domain already exists');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createTenantDto.adminEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: createTenantDto.name,
                    domain: createTenantDto.domain,
                    defaultLanguage: createTenantDto.defaultLanguage || 'tr',
                    availableLanguages: createTenantDto.availableLanguages || ['tr'],
                    theme: createTenantDto.theme,
                    primaryColor: createTenantDto.primaryColor,
                },
            });
            const hashedPassword = await bcrypt.hash(createTenantDto.adminPassword, 10);
            await tx.user.create({
                data: {
                    email: createTenantDto.adminEmail,
                    password: hashedPassword,
                    name: createTenantDto.adminName,
                    role: client_1.Role.TENANT_ADMIN,
                    tenantId: tenant.id,
                },
            });
            const siteSetting = await tx.siteSetting.create({
                data: {
                    tenantId: tenant.id,
                },
            });
            await tx.siteSettingTranslation.create({
                data: {
                    siteSettingId: siteSetting.id,
                    language: tenant.defaultLanguage,
                    siteName: tenant.name,
                    siteDescription: `Welcome to ${tenant.name}`,
                    seoMetaTitle: tenant.name,
                    seoMetaDescription: `Official website of ${tenant.name}`,
                },
            });
            const modules = Object.values(client_1.ModuleName);
            await tx.tenantFeature.createMany({
                data: modules.map(module => ({
                    tenantId: tenant.id,
                    module,
                    enabled: true,
                })),
            });
            await tx.menu.create({
                data: {
                    tenantId: tenant.id,
                    key: 'main-menu',
                },
            });
            return tenant;
        });
    }
    async findAll() {
        return this.prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        users: true,
                        pages: true,
                        blogPosts: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                features: true,
                siteSetting: {
                    include: {
                        translations: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                        pages: true,
                        blogPosts: true,
                        media: true,
                    },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async update(id, updateTenantDto) {
        await this.findOne(id);
        if (updateTenantDto.domain) {
            const existingTenant = await this.prisma.tenant.findUnique({
                where: { domain: updateTenantDto.domain },
            });
            if (existingTenant && existingTenant.id !== id) {
                throw new common_1.ConflictException('Tenant with this domain already exists');
            }
        }
        return this.prisma.tenant.update({
            where: { id },
            data: updateTenantDto,
        });
    }
    async toggleActive(id) {
        const tenant = await this.findOne(id);
        return this.prisma.tenant.update({
            where: { id },
            data: { isActive: !tenant.isActive },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.tenant.update({
            where: { id },
            data: { isActive: false },
        });
        return { message: 'Tenant deactivated successfully' };
    }
    async getFeatures(id) {
        const tenant = await this.findOne(id);
        const features = await this.prisma.tenantFeature.findMany({
            where: { tenantId: id },
        });
        return features;
    }
    async updateFeature(id, module, enabled) {
        await this.findOne(id);
        return this.prisma.tenantFeature.upsert({
            where: {
                tenantId_module: {
                    tenantId: id,
                    module,
                },
            },
            update: { enabled },
            create: {
                tenantId: id,
                module,
                enabled,
            },
        });
    }
    async generateImpersonationToken(tenantId, superAdminUserId) {
        const tenant = await this.findOne(tenantId);
        const tenantAdmin = await this.prisma.user.findFirst({
            where: {
                tenantId: tenant.id,
                role: client_1.Role.TENANT_ADMIN,
                isActive: true,
            },
        });
        if (!tenantAdmin) {
            throw new common_1.NotFoundException('No active tenant admin found for this tenant');
        }
        const payload = {
            sub: tenantAdmin.id,
            email: tenantAdmin.email,
            role: tenantAdmin.role,
            tenantId: tenantAdmin.tenantId,
            impersonator: superAdminUserId,
        };
        const accessToken = 'generated-impersonation-token';
        return { accessToken };
    }
    async createTenantWithDomains(createTenantDto) {
        const slug = this.generateSlug(createTenantDto.name);
        const publicDomain = `${slug}.softellio.com`;
        const adminDomain = 'portal.softellio.com';
        const existingTenant = await this.prisma.tenant.findFirst({
            where: {
                OR: [
                    { slug },
                    { domain: publicDomain }
                ]
            }
        });
        if (existingTenant) {
            throw new common_1.ConflictException('A tenant with this slug already exists');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createTenantDto.adminEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: createTenantDto.name,
                    slug,
                    domain: publicDomain,
                    defaultLanguage: createTenantDto.defaultLanguage || 'tr',
                    availableLanguages: createTenantDto.availableLanguages || ['tr'],
                    primaryColor: createTenantDto.primaryColor,
                },
            });
            await tx.tenantDomain.create({
                data: {
                    tenantId: tenant.id,
                    domain: publicDomain,
                    type: 'subdomain',
                    isPrimary: true,
                    isActive: true,
                    isVerified: true,
                    verifiedAt: new Date(),
                }
            });
            const hashedPassword = await bcrypt.hash(createTenantDto.adminPassword, 10);
            await tx.user.create({
                data: {
                    email: createTenantDto.adminEmail,
                    password: hashedPassword,
                    name: createTenantDto.adminName || 'Tenant Admin',
                    role: client_1.Role.TENANT_ADMIN,
                    tenantId: tenant.id,
                },
            });
            const siteSetting = await tx.siteSetting.create({
                data: {
                    tenantId: tenant.id,
                },
            });
            await tx.siteSettingTranslation.create({
                data: {
                    siteSettingId: siteSetting.id,
                    language: tenant.defaultLanguage,
                    siteName: tenant.name,
                    siteDescription: `Welcome to ${tenant.name}`,
                    seoMetaTitle: tenant.name,
                    seoMetaDescription: `Official website of ${tenant.name}`,
                },
            });
            const modules = Object.values(client_1.ModuleName);
            await tx.tenantFeature.createMany({
                data: modules.map(module => ({
                    tenantId: tenant.id,
                    module,
                    enabled: true,
                })),
            });
            await tx.menu.create({
                data: {
                    tenantId: tenant.id,
                    key: 'main-menu',
                },
            });
            return {
                tenant,
                domains: {
                    publicDomain,
                    adminDomain,
                },
                message: `Tenant created successfully! Public site: https://${publicDomain} | Admin panel: https://${adminDomain}`
            };
        });
    }
    async findByDomain(host) {
        const cleanHost = host.replace(/^https?:\/\//, '').split(':')[0];
        let tenant = await this.prisma.tenant.findFirst({
            where: {
                domain: cleanHost,
                isActive: true,
                status: 'active'
            }
        });
        if (!tenant) {
            const tenantDomain = await this.prisma.tenantDomain.findFirst({
                where: {
                    domain: cleanHost,
                    isActive: true,
                    tenant: {
                        isActive: true,
                        status: 'active'
                    }
                },
                include: {
                    tenant: true
                }
            });
            if (tenantDomain) {
                tenant = tenantDomain.tenant;
            }
        }
        if (!tenant && cleanHost.includes('.softellio.com')) {
            const subdomain = cleanHost.replace('.softellio.com', '');
            const slug = subdomain.replace(/panel$/, '');
            tenant = await this.prisma.tenant.findFirst({
                where: {
                    slug: slug,
                    isActive: true,
                    status: 'active'
                }
            });
        }
        return tenant;
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .replace(/^-|-$/g, '');
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map