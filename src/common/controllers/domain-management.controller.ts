import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DomainResolverService } from '../services/domain-resolver.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentTenant } from '../decorators/current-tenant.decorator';
import { Role } from '@prisma/client';
import { TenantDomain } from '@prisma/client';

class AddDomainDto {
  domain: string;
  isPrimary?: boolean;
  type?: 'custom' | 'subdomain';
}

class UpdateDomainDto {
  isPrimary?: boolean;
  isActive?: boolean;
}

class DomainHealthCheckDto {
  domain: string;
  isReachable: boolean;
  responseTime: number | null;
  statusCode: number | null;
  error: string | null;
  checkedAt: Date;
}

@ApiTags('Domain Management')
@Controller('domains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DomainManagementController {
  constructor(private domainResolver: DomainResolverService) {}

  @Get()
  @ApiOperation({ summary: 'Get all domains for current tenant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of tenant domains retrieved successfully',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  async getTenantDomains(@CurrentTenant() tenantId: number): Promise<TenantDomain[]> {
    return this.domainResolver.getTenantDomains(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Add custom domain to tenant' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Custom domain added successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Domain already exists',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async addCustomDomain(
    @CurrentTenant() tenantId: number,
    @Body() addDomainDto: AddDomainDto,
  ): Promise<TenantDomain> {
    return this.domainResolver.addCustomDomain(
      tenantId,
      addDomainDto.domain,
      addDomainDto.isPrimary || false,
    );
  }

  @Patch(':domainId')
  @ApiOperation({ summary: 'Update domain settings' })
  @ApiParam({ name: 'domainId', description: 'Domain ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain updated successfully',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async updateDomain(
    @CurrentTenant() tenantId: number,
    @Param('domainId') domainId: number,
    @Body() updateDomainDto: UpdateDomainDto,
  ): Promise<TenantDomain> {
    // Implementation would go here - updating domain in database
    // This is a simplified version for demonstration
    throw new Error('Method not implemented');
  }

  @Delete(':domainId')
  @ApiOperation({ summary: 'Remove domain from tenant' })
  @ApiParam({ name: 'domainId', description: 'Domain ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Domain removed successfully',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDomain(
    @CurrentTenant() tenantId: number,
    @Param('domainId') domainId: number,
  ): Promise<void> {
    // Implementation would go here - removing domain from database
    // This is a simplified version for demonstration
    throw new Error('Method not implemented');
  }

  @Get(':domainId/health')
  @ApiOperation({ summary: 'Check domain health and accessibility' })
  @ApiParam({ name: 'domainId', description: 'Domain ID or domain name' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain health check completed',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  async checkDomainHealth(@Param('domainId') domainParam: string): Promise<DomainHealthCheckDto> {
    // If domainParam is numeric, treat as ID, otherwise as domain name
    const domain = isNaN(Number(domainParam)) ? domainParam : domainParam;

    const healthCheck = await this.domainResolver.checkDomainHealth(domain);

    return {
      ...healthCheck,
      checkedAt: new Date(),
    };
  }

  @Get('resolve')
  @ApiOperation({ summary: 'Test domain resolution for debugging' })
  @ApiQuery({ name: 'domain', description: 'Domain to resolve' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain resolution test completed',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async testDomainResolution(@Query('domain') domain: string) {
    if (!domain) {
      throw new Error('Domain parameter is required');
    }

    try {
      const resolution = await this.domainResolver.resolveTenantFromDomain(domain);

      return {
        success: true,
        domain,
        tenant: {
          id: resolution.tenant.id,
          slug: resolution.tenant.slug,
          name: resolution.tenant.name,
          status: resolution.tenant.status,
        },
        resolvedBy: resolution.resolvedBy,
        tenantDomain: resolution.domain ? {
          id: resolution.domain.id,
          domain: resolution.domain.domain,
          type: resolution.domain.type,
          isPrimary: resolution.domain.isPrimary,
          isVerified: resolution.domain.isVerified,
        } : null,
      };
    } catch (error) {
      return {
        success: false,
        domain,
        error: error.message,
      };
    }
  }

  @Post('verify/:domainId')
  @ApiOperation({ summary: 'Verify domain ownership' })
  @ApiParam({ name: 'domainId', description: 'Domain ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain verification initiated',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async verifyDomain(
    @CurrentTenant() tenantId: number,
    @Param('domainId') domainId: number,
  ): Promise<{ status: string; message: string; verificationToken?: string }> {
    // Implementation would go here - domain verification process
    // This could involve DNS TXT record verification, file upload verification, etc.
    // For now, return placeholder response
    return {
      status: 'pending',
      message: 'Domain verification process initiated',
      verificationToken: `softellio-verify-${Date.now()}`,
    };
  }

  @Get('netlify-config')
  @ApiOperation({ summary: 'Get Netlify configuration for current tenant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Netlify configuration retrieved',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async getNetlifyConfig(@CurrentTenant() tenantId: number) {
    const domains = await this.domainResolver.getTenantDomains(tenantId);

    // Generate Netlify-compatible configuration
    return {
      redirects: domains
        .filter(d => d.type === 'custom' && d.isActive)
        .map(d => ({
          from: `https://${d.domain}/*`,
          to: `https://connect.softellio.com/:splat`,
          status: 200,
          headers: {
            'X-Tenant-Domain': d.domain,
          },
        })),
      headers: [
        {
          for: '/*',
          values: {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        },
      ],
    };
  }
}