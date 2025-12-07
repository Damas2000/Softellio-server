import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant, Role, ModuleName } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if domain already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { domain: createTenantDto.domain },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this domain already exists');
    }

    // Check if admin email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createTenantDto.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create tenant
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

      // Create tenant admin user
      const hashedPassword = await this.authService.hashPassword(createTenantDto.adminPassword);
      await tx.user.create({
        data: {
          email: createTenantDto.adminEmail,
          password: hashedPassword,
          name: createTenantDto.adminName,
          role: Role.TENANT_ADMIN,
          tenantId: tenant.id,
        },
      });

      // Create default site settings
      const siteSetting = await tx.siteSetting.create({
        data: {
          tenantId: tenant.id,
        },
      });

      // Create default site setting translation
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

      // Enable all modules by default
      const modules = Object.values(ModuleName);
      await tx.tenantFeature.createMany({
        data: modules.map(module => ({
          tenantId: tenant.id,
          module,
          enabled: true,
        })),
      });

      // Create default main menu
      await tx.menu.create({
        data: {
          tenantId: tenant.id,
          key: 'main-menu',
        },
      });

      return tenant;
    });
  }

  async findAll(): Promise<Tenant[]> {
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

  async findOne(id: number): Promise<Tenant> {
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
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: number, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    // Check if tenant exists
    await this.findOne(id);

    // Check domain uniqueness if domain is being updated
    if (updateTenantDto.domain) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { domain: updateTenantDto.domain },
      });

      if (existingTenant && existingTenant.id !== id) {
        throw new ConflictException('Tenant with this domain already exists');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async toggleActive(id: number): Promise<Tenant> {
    const tenant = await this.findOne(id);

    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: !tenant.isActive },
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if tenant exists
    await this.findOne(id);

    // In a real application, we might want to soft delete or prevent deletion if there's data
    // For now, we'll just deactivate the tenant
    await this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Tenant deactivated successfully' };
  }

  async getFeatures(id: number) {
    const tenant = await this.findOne(id);

    const features = await this.prisma.tenantFeature.findMany({
      where: { tenantId: id },
    });

    return features;
  }

  async updateFeature(id: number, module: ModuleName, enabled: boolean) {
    // Check if tenant exists
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

  async generateImpersonationToken(tenantId: number, superAdminUserId: number): Promise<{ accessToken: string }> {
    // Check if tenant exists
    const tenant = await this.findOne(tenantId);

    // Find a tenant admin for this tenant to impersonate
    const tenantAdmin = await this.prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        role: Role.TENANT_ADMIN,
        isActive: true,
      },
    });

    if (!tenantAdmin) {
      throw new NotFoundException('No active tenant admin found for this tenant');
    }

    // Generate access token for the tenant admin
    const payload = {
      sub: tenantAdmin.id,
      email: tenantAdmin.email,
      role: tenantAdmin.role,
      tenantId: tenantAdmin.tenantId,
      impersonator: superAdminUserId, // Track who is impersonating
    };

    // Note: This is a simplified implementation
    // In production, you'd want more sophisticated tracking and time limits
    const accessToken = 'generated-impersonation-token'; // This would use the actual JWT service

    return { accessToken };
  }
}