import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateTenantWithDomainsDto } from './dto/create-tenant-with-domains.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant, Role, ModuleName } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
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
      const hashedPassword = await bcrypt.hash(createTenantDto.adminPassword, 10);
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

  async createTenantWithDomains(createTenantDto: CreateTenantWithDomainsDto): Promise<{
    tenant: Tenant;
    domains: { publicDomain: string; adminDomain: string };
    message: string;
  }> {
    // Generate slug from company name
    const slug = this.generateSlug(createTenantDto.name);

    // Generate public domain (only public domain is per-tenant)
    const publicDomain = `${slug}.softellio.com`;
    const adminDomain = 'portal.softellio.com'; // Shared admin panel for all tenants

    // Check if domains already exist
    const existingTenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { slug },
          { domain: publicDomain }
        ]
      }
    });

    if (existingTenant) {
      throw new ConflictException('A tenant with this slug already exists');
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
          slug,
          domain: publicDomain,
          defaultLanguage: createTenantDto.defaultLanguage || 'tr',
          availableLanguages: createTenantDto.availableLanguages || ['tr'],
          primaryColor: createTenantDto.primaryColor,
        },
      });

      // Create tenant domains in database (only public domain per tenant)
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

      // Create tenant admin user
      const hashedPassword = await bcrypt.hash(createTenantDto.adminPassword, 10);
      await tx.user.create({
        data: {
          email: createTenantDto.adminEmail,
          password: hashedPassword,
          name: createTenantDto.adminName || 'Tenant Admin',
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

  async findByDomain(host: string): Promise<Tenant | null> {
    // Remove protocol and port if present
    const cleanHost = host.replace(/^https?:\/\//, '').split(':')[0];

    // First, try to find by main domain field
    let tenant = await this.prisma.tenant.findFirst({
      where: {
        domain: cleanHost,
        isActive: true,
        status: 'active'
      }
    });

    // If not found, search in TenantDomain table
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

    // If still not found, try to extract slug from subdomain
    if (!tenant && cleanHost.includes('.softellio.com')) {
      const subdomain = cleanHost.replace('.softellio.com', '');
      const slug = subdomain.replace(/panel$/, ''); // Remove 'panel' suffix for admin domains

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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
}